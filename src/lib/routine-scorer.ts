import { prisma } from "@/lib/prisma";
import type { Goal, Posture, Practice, IntensityScale } from "@/generated/prisma/client";

export type PracticeWithLinks = Practice & {
  mechanisms: { mechanismId: string; weight: number }[];
  concerns: { concernId: string; weight: number }[];
};

export type RoutineRequest = {
  /** Ranked: index 0 is the main thing the user picked. Mixed kinds allowed. */
  concernIds: string[];
  minutes: number;
  /** Profile goal first, then any slot or context bias goals. */
  goals: Goal[];
  /** When set, past feedback on each practice nudges its score. */
  userId?: string;
  excludePracticeIds?: ReadonlySet<string>;
  /** Soft down-weight for practices that need a different posture. */
  posture?: Posture;
  /** Hard filter: only practices that are invisible to others. */
  discreetOnly?: boolean;
  /** Hard filter, 1-3. */
  maxExertion?: number;
  equipmentAvailable?: string[];
  /** Seeds the tie-break jitter so a routine is reproducible. */
  seed?: string;
};

export type ScoredPractice = { practice: PracticeWithLinks; score: number };

export type Routine = {
  items: { practiceId: string; order: number; durationSeconds: number }[];
  focusLabel: string;
  durationMinutes: number;
  concernIds: string[];
  dominantScale: IntensityScale;
};

/**
 * How much each successive concern contributes. "Stressed AND neck tight"
 * should lead with stress, not split the routine evenly.
 */
const RANK_DAMP = [1, 0.7, 0.5, 0.35];

function rankDamp(rank: number) {
  return RANK_DAMP[rank] ?? 0.25;
}

/** Deterministic 0-1 hash so routine generation is reproducible and testable. */
function seededJitter(seed: string, id: string): number {
  let h = 2166136261;
  const input = `${seed}:${id}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export type ScoringContext = {
  /** mechanismId -> summed, rank-damped relevance across the requested concerns. */
  mechanismWeights: Map<string, number>;
  /** concernId -> its rank damping factor. */
  concernDamp: Map<string, number>;
  goals: Goal[];
  posture?: Posture;
  maxExertion?: number;
  excludePracticeIds: ReadonlySet<string>;
  /** practiceId -> learned adjustment from this user's own past feedback. */
  affinity: Map<string, number>;
  seed: string;
};

/** Caps how far learned preference can move a practice, in score points. */
const MAX_AFFINITY = 40;

/**
 * Turns a user's own feedback history into a per-practice score adjustment.
 *
 * A practice the user marked as helping moves up; one that repeatedly didn't
 * moves down. This is what makes the app adapt to the person rather than
 * re-deriving the same routine from onboarding answers forever.
 */
export async function loadAffinity(userId: string): Promise<Map<string, number>> {
  const feedback = await prisma.sessionFeedback.findMany({
    where: { plannedSession: { dailyPlan: { userId } } },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { plannedSession: { include: { items: { select: { practiceId: true } } } } },
  });

  // Every practice in a session inherits that session's verdict. It is a coarse
  // attribution, but it is the only signal available without asking the user to
  // rate each item, which nobody would do.
  const tally = new Map<string, { helped: number; total: number }>();
  for (const f of feedback) {
    for (const item of f.plannedSession.items) {
      const entry = tally.get(item.practiceId) ?? { helped: 0, total: 0 };
      entry.total += 1;
      if (f.helped) entry.helped += 1;
      tally.set(item.practiceId, entry);
    }
  }

  const affinity = new Map<string, number>();
  for (const [practiceId, { helped, total }] of tally) {
    // Confidence grows with sample size, so one bad day doesn't bury a practice.
    const rate = helped / total;
    const confidence = Math.min(1, total / 4);
    affinity.set(practiceId, (rate - 0.5) * 2 * MAX_AFFINITY * confidence);
  }
  return affinity;
}

/**
 * Pure and synchronous -- the unit-testable core of routine generation.
 *
 * Mechanism routing is the base: a practice acting strongly on a mechanism that
 * strongly drives the concern scores high. The sparse PracticeConcern table is
 * a signed additive override on top, for the cases routing is too coarse for.
 */
export function scorePractices(
  candidates: PracticeWithLinks[],
  ctx: ScoringContext
): ScoredPractice[] {
  return candidates.map((practice) => {
    let score = 0;

    for (const link of practice.mechanisms) {
      const concernWeight = ctx.mechanismWeights.get(link.mechanismId);
      if (!concernWeight) continue;
      score += (concernWeight / 100) * (link.weight / 100) * 100;
    }

    for (const link of practice.concerns) {
      const damp = ctx.concernDamp.get(link.concernId);
      if (damp === undefined) continue;
      score += damp * link.weight;
    }

    if (ctx.goals.length > 0 && practice.goals.includes(ctx.goals[0])) score += 60;
    for (const bias of ctx.goals.slice(1)) {
      if (practice.goals.includes(bias)) score += 30;
    }

    // Soft, not absolute: with a thin candidate pool a repeat still beats an
    // empty slot.
    if (ctx.excludePracticeIds.has(practice.id)) score -= 500;

    if (ctx.posture && practice.posture !== "ANY" && practice.posture !== ctx.posture) {
      score -= 25;
    }
    if (ctx.maxExertion !== undefined && practice.exertion > ctx.maxExertion) {
      score -= 25;
    }

    score += ctx.affinity.get(practice.id) ?? 0;

    // Tie-break band. Wide enough that near-equal practices genuinely rotate
    // between days (the daily-plan seed includes the date), narrow enough that
    // it never overrides a real relevance difference.
    score += seededJitter(ctx.seed, practice.id) * JITTER_BAND;

    return { practice, score };
  });
}

const JITTER_BAND = 12;

/**
 * Order within a routine follows a deliberate arc rather than raw score:
 * settle first, work in the middle, integrate at the end. Without this a mixed
 * physical/mental routine reads as a concatenation of two lists.
 */
const MODALITY_PHASE: Record<string, number> = {
  BREATHWORK: 0,
  GAZE: 0,
  MOVEMENT: 1,
  SOMATIC: 1,
  MINDFULNESS: 2,
  COGNITIVE: 2,
};

/**
 * Diminishing returns per modality within one routine.
 *
 * Without this, a stress request returns five breathing exercises back to back,
 * because breathwork legitimately dominates that concern's scoring. A routine
 * of five breath drills is technically well-matched and awful to actually do.
 * The third item of a modality is worth much less than the first.
 */
const MODALITY_REPEAT_PENALTY = [0, 8, 28, 55];

function repeatPenalty(count: number): number {
  return MODALITY_REPEAT_PENALTY[count] ?? 80;
}

/**
 * Greedily fill to the target duration using real per-practice seconds, then
 * sequence by modality arc. Replaces a fixed exercise count that ignored how
 * long each item actually runs.
 *
 * Selection re-ranks after each pick so the diversity penalty applies to what
 * has actually been chosen so far, not to a fixed initial order.
 */
export function packRoutine(
  scored: ScoredPractice[],
  targetSeconds: number
): PracticeWithLinks[] {
  const remaining = [...scored];
  const selected: PracticeWithLinks[] = [];
  const modalityCount = new Map<string, number>();
  let total = 0;

  while (remaining.length > 0 && total < targetSeconds * 0.8) {
    let bestIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const { practice, score } = remaining[i];
      // Don't overshoot the target by more than 20%.
      if (total > 0 && total + practice.durationSeconds > targetSeconds * 1.2) continue;
      const adjusted = score - repeatPenalty(modalityCount.get(practice.modality) ?? 0);
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) break;
    const [{ practice }] = remaining.splice(bestIndex, 1);
    selected.push(practice);
    modalityCount.set(practice.modality, (modalityCount.get(practice.modality) ?? 0) + 1);
    total += practice.durationSeconds;
  }

  // A target shorter than any single practice still deserves one item.
  if (selected.length === 0 && scored.length > 0) {
    const best = [...scored].sort((a, b) => b.score - a.score)[0];
    selected.push(best.practice);
  }

  return selected.sort(
    (a, b) => (MODALITY_PHASE[a.modality] ?? 1) - (MODALITY_PHASE[b.modality] ?? 1)
  );
}

/**
 * Loads the concern -> mechanism weights and the candidate pool for a request.
 * Hard constraints (discreet, exertion, equipment) are applied here as query
 * filters so a floor stretch can never surface to someone on a video call.
 */
export async function loadScoringContext(req: RoutineRequest) {
  const [links, affinity] = await Promise.all([
    prisma.concernMechanism.findMany({ where: { concernId: { in: req.concernIds } } }),
    req.userId ? loadAffinity(req.userId) : Promise.resolve(new Map<string, number>()),
  ]);

  const mechanismWeights = new Map<string, number>();
  const concernDamp = new Map<string, number>();

  req.concernIds.forEach((concernId, index) => {
    concernDamp.set(concernId, rankDamp(index));
  });

  for (const link of links) {
    const damp = concernDamp.get(link.concernId) ?? 0;
    const contribution = link.weight * damp;
    // Max-merge: a mechanism relevant to two requested concerns takes its
    // strongest claim rather than being averaged down.
    mechanismWeights.set(
      link.mechanismId,
      Math.max(mechanismWeights.get(link.mechanismId) ?? 0, contribution)
    );
  }

  const candidates = await prisma.practice.findMany({
    where: {
      ...(req.discreetOnly ? { discreet: true } : {}),
      ...(req.maxExertion !== undefined ? { exertion: { lte: req.maxExertion } } : {}),
      equipment: { in: req.equipmentAvailable ?? ["none"] },
      OR: [
        { mechanisms: { some: { mechanismId: { in: [...mechanismWeights.keys()] } } } },
        { concerns: { some: { concernId: { in: req.concernIds }, weight: { gt: 0 } } } },
      ],
    },
    include: {
      mechanisms: { select: { mechanismId: true, weight: true } },
      concerns: { select: { concernId: true, weight: true } },
    },
  });

  const ctx: ScoringContext = {
    mechanismWeights,
    concernDamp,
    goals: req.goals,
    posture: req.posture,
    maxExertion: req.maxExertion,
    excludePracticeIds: req.excludePracticeIds ?? new Set(),
    affinity,
    seed: req.seed ?? "default",
  };

  return { ctx, candidates };
}

/**
 * The single entry point that daily plans, coach suggestions, and the instant
 * "how are you right now" flow all call.
 */
export async function buildRoutine(req: RoutineRequest): Promise<Routine> {
  const { ctx, candidates } = await loadScoringContext(req);
  const scored = scorePractices(candidates, ctx);
  const selected = packRoutine(scored, req.minutes * 60);

  const concerns = await prisma.concern.findMany({
    where: { id: { in: req.concernIds } },
    select: { id: true, name: true, scale: true },
  });
  // Preserve the caller's ranking, which findMany does not guarantee.
  const byId = new Map(concerns.map((c) => [c.id, c]));
  const ordered = req.concernIds.map((id) => byId.get(id)).filter((c) => c !== undefined);

  const totalSeconds = selected.reduce((sum, p) => sum + p.durationSeconds, 0);

  return {
    items: selected.map((practice, index) => ({
      practiceId: practice.id,
      order: index,
      durationSeconds: practice.durationSeconds,
    })),
    focusLabel: ordered.slice(0, 2).map((c) => c.name).join(" + ") || "Full body",
    durationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
    concernIds: req.concernIds,
    dominantScale: ordered[0]?.scale ?? "PAIN",
  };
}
