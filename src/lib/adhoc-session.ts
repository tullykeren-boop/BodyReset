import { prisma } from "@/lib/prisma";
import { getOrCreateDailyPlan } from "@/lib/daily-plan-generator";
import { buildRoutine, type RoutineRequest } from "@/lib/routine-scorer";
import type { SessionOrigin, Posture } from "@/generated/prisma/client";

export type RoutineSessionInput = {
  concernIds: string[];
  minutes: number;
  origin: SessionOrigin;
  title?: string;
  stateLogId?: string;
  posture?: Posture;
  discreetOnly?: boolean;
  maxExertion?: number;
};

/**
 * Builds a routine for right now and persists it as a session on today's plan.
 * Shared by the coach's suggestions and the instant "how are you right now"
 * flow, so both go through exactly the same scorer.
 *
 * The session stays attached to the DailyPlan so streaks and dashboard counts
 * keep working without a second code path.
 */
export async function createRoutineSession(userId: string, input: RoutineSessionInput) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Cannot build a routine before onboarding is complete");

  if (input.concernIds.length === 0) {
    throw new Error("A routine needs at least one concern");
  }

  const request: RoutineRequest = {
    concernIds: input.concernIds,
    minutes: input.minutes,
    goals: [profile.goal],
    userId,
    posture: input.posture,
    discreetOnly: input.discreetOnly,
    maxExertion: input.maxExertion,
    seed: `${userId}:${Date.now()}`,
  };

  const routine = await buildRoutine(request);
  if (routine.items.length === 0) {
    throw new Error("No practices matched this request");
  }

  const dailyPlan = await getOrCreateDailyPlan(userId);

  return prisma.plannedSession.create({
    data: {
      dailyPlanId: dailyPlan.id,
      slot: "ADHOC",
      origin: input.origin,
      stateLogId: input.stateLogId,
      title: input.title ?? `${routine.focusLabel} Reset`,
      focusLabel: routine.focusLabel,
      durationMinutes: routine.durationMinutes,
      items: { create: routine.items },
      concerns: {
        create: routine.concernIds.map((concernId, rank) => ({ concernId, rank })),
      },
    },
  });
}

/**
 * Coach-suggested session. `concernSlug` comes from the model's structured
 * suggestion, so this is an id lookup rather than a fuzzy name match; an
 * unknown slug falls back to the user's own profile concerns.
 */
export async function createAdHocSession(
  userId: string,
  { concernSlug, durationMinutes }: { concernSlug: string; durationMinutes: number }
) {
  const matched = await prisma.concern.findUnique({ where: { slug: concernSlug } });

  let concernIds: string[];
  if (matched) {
    concernIds = [matched.id];
  } else {
    const profileConcerns = await prisma.profileConcern.findMany({
      where: { profile: { userId } },
      orderBy: { rank: "asc" },
    });
    concernIds = profileConcerns.map((c) => c.concernId);
  }

  return createRoutineSession(userId, {
    concernIds,
    minutes: durationMinutes,
    origin: "COACH",
  });
}
