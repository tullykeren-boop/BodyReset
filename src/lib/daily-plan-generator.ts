import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { Exercise, Goal, SessionSlot } from "@/generated/prisma/client";

const PLAN_INCLUDE = {
  sessions: {
    include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" as const } }, feedback: true },
    orderBy: { slot: "asc" as const },
  },
} satisfies Prisma.DailyPlanInclude;

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function exerciseCountForMinutes(minutes: number): number {
  if (minutes <= 3) return 2;
  if (minutes <= 5) return 3;
  if (minutes <= 8) return 4;
  return 5;
}

export type ScoredExercise = { exercise: Exercise & { muscleGroups: { muscleGroupId: string; isPrimary: boolean }[] }; score: number };

export function scoreExercises(
  candidates: ScoredExercise["exercise"][],
  weightByMuscleGroupId: Map<string, number>,
  goal: Goal,
  goalBias: Goal[],
  usedIds: Set<string>
): ScoredExercise[] {
  return candidates.map((exercise) => {
    let score = 0;
    for (const link of exercise.muscleGroups) {
      const areaWeight = weightByMuscleGroupId.get(link.muscleGroupId);
      if (!areaWeight) continue;
      const primaryBonus = areaWeight === 1 ? 3 : 1;
      const exerciseBonus = link.isPrimary ? 2 : 1;
      score += primaryBonus * exerciseBonus;
    }
    if (exercise.goals.includes(goal)) score += 4;
    for (const bias of goalBias) {
      if (exercise.goals.includes(bias)) score += 2;
    }
    if (usedIds.has(exercise.id)) score -= 1000;
    score += Math.random() * 0.5;
    return { exercise, score };
  });
}

export function pickTop(scored: ScoredExercise[], count: number) {
  return [...scored].sort((a, b) => b.score - a.score).slice(0, count).map((s) => s.exercise);
}

function focusLabelFor(selected: ScoredExercise["exercise"][], bodyAreaNameByMuscleGroupId: Map<string, string>) {
  const names: string[] = [];
  for (const ex of selected) {
    const primaryLink = ex.muscleGroups.find((l) => l.isPrimary) ?? ex.muscleGroups[0];
    if (!primaryLink) continue;
    const name = bodyAreaNameByMuscleGroupId.get(primaryLink.muscleGroupId);
    if (name && !names.includes(name)) names.push(name);
    if (names.length >= 2) break;
  }
  return names.length > 0 ? names.join(" + ") : "Full body";
}

const SLOT_DEFS: { slot: SessionSlot; title: string; minuteFactor: number; goalBias: Goal[] }[] = [
  { slot: "MORNING", title: "Morning Reset", minuteFactor: 0.6, goalBias: ["MOBILITY"] },
  { slot: "MIDDAY", title: "Midday Recovery", minuteFactor: 1, goalBias: [] },
  { slot: "EVENING", title: "End of Day Reset", minuteFactor: 1.4, goalBias: ["ENERGY", "PREVENT"] },
];

export async function getOrCreateDailyPlan(userId: string, forDate: Date = new Date()) {
  const date = startOfUtcDay(forDate);

  const existing = await prisma.dailyPlan.findUnique({
    where: { userId_date: { userId, date } },
    include: PLAN_INCLUDE,
  });
  if (existing) return existing;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { painAreas: { include: { bodyArea: true } } },
  });
  if (!profile) {
    throw new Error("Cannot generate a daily plan before onboarding is complete");
  }

  const bodyAreaIds = profile.painAreas.map((p) => p.bodyAreaId);
  const bodyAreaMuscleGroups = await prisma.bodyAreaMuscleGroup.findMany({
    where: { bodyAreaId: { in: bodyAreaIds } },
    include: { bodyArea: true },
  });

  const weightByMuscleGroupId = new Map<string, number>();
  const bodyAreaNameByMuscleGroupId = new Map<string, string>();
  for (const link of bodyAreaMuscleGroups) {
    const existingWeight = weightByMuscleGroupId.get(link.muscleGroupId);
    if (!existingWeight || link.weight < existingWeight) {
      weightByMuscleGroupId.set(link.muscleGroupId, link.weight);
    }
    if (link.weight === 1) {
      bodyAreaNameByMuscleGroupId.set(link.muscleGroupId, link.bodyArea.name);
    }
  }
  const muscleGroupIds = [...weightByMuscleGroupId.keys()];

  const candidates = await prisma.exercise.findMany({
    where: { muscleGroups: { some: { muscleGroupId: { in: muscleGroupIds } } } },
    include: { muscleGroups: true },
  });

  const usedIds = new Set<string>();
  const sessionsData: {
    slot: SessionSlot;
    title: string;
    focusLabel: string;
    durationMinutes: number;
    exercises: { exerciseId: string; order: number; durationSeconds: number }[];
  }[] = [];

  for (const def of SLOT_DEFS) {
    const durationMinutes = Math.max(3, Math.round(profile.timeAvailableMinutes * def.minuteFactor));
    const count = exerciseCountForMinutes(durationMinutes);
    const scored = scoreExercises(candidates, weightByMuscleGroupId, profile.goal, def.goalBias, usedIds);
    const selected = pickTop(scored, count);
    selected.forEach((ex) => usedIds.add(ex.id));

    sessionsData.push({
      slot: def.slot,
      title: def.title,
      focusLabel: focusLabelFor(selected, bodyAreaNameByMuscleGroupId),
      durationMinutes,
      exercises: selected.map((ex, index) => ({
        exerciseId: ex.id,
        order: index,
        durationSeconds: ex.durationSeconds,
      })),
    });
  }

  try {
    return await prisma.dailyPlan.create({
      data: {
        userId,
        date,
        sessions: {
          create: sessionsData.map((s) => ({
            slot: s.slot,
            title: s.title,
            focusLabel: s.focusLabel,
            durationMinutes: s.durationMinutes,
            exercises: { create: s.exercises },
          })),
        },
      },
      include: PLAN_INCLUDE,
    });
  } catch (err) {
    // Another concurrent request (e.g. a duplicate initial page load) may have
    // already created today's plan between our check above and this create.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const plan = await prisma.dailyPlan.findUnique({
        where: { userId_date: { userId, date } },
        include: PLAN_INCLUDE,
      });
      if (plan) return plan;
    }
    throw err;
  }
}
