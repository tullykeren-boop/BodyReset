import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { Goal, SessionSlot } from "@/generated/prisma/client";
import { buildRoutine } from "@/lib/routine-scorer";

const PLAN_INCLUDE = {
  sessions: {
    include: {
      items: { include: { practice: true }, orderBy: { order: "asc" as const } },
      concerns: { include: { concern: true }, orderBy: { rank: "asc" as const } },
      feedback: true,
    },
    orderBy: { slot: "asc" as const },
  },
} satisfies Prisma.DailyPlanInclude;

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const SLOT_DEFS: { slot: SessionSlot; title: string; minuteFactor: number; goalBias: Goal[] }[] = [
  { slot: "MORNING", title: "Morning Reset", minuteFactor: 0.6, goalBias: ["MOBILITY", "IMPROVE_FOCUS"] },
  { slot: "MIDDAY", title: "Midday Recovery", minuteFactor: 1, goalBias: ["REDUCE_STRESS"] },
  {
    slot: "EVENING",
    title: "End of Day Reset",
    minuteFactor: 1.4,
    goalBias: ["ENERGY", "PREVENT", "REDUCE_STRESS"],
  },
];

/**
 * Rotates which of the user's concerns leads each slot.
 *
 * Passing the same ranked list to all three slots makes every session lead with
 * the same concern, so a user who picked neck, shoulders, stress and focus gets
 * three sessions all labelled "Neck + Shoulders" and never sees the mental half
 * of what they asked for. Rotating means the day covers the whole set.
 */
export function rotateConcerns(concernIds: string[], slotIndex: number): string[] {
  if (concernIds.length <= 1) return concernIds;
  const offset = slotIndex % concernIds.length;
  return [...concernIds.slice(offset), ...concernIds.slice(0, offset)];
}

export async function getOrCreateDailyPlan(userId: string, forDate: Date = new Date()) {
  const date = startOfUtcDay(forDate);

  const existing = await prisma.dailyPlan.findUnique({
    where: { userId_date: { userId, date } },
    include: PLAN_INCLUDE,
  });
  if (existing) return existing;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { concerns: { include: { concern: true }, orderBy: { rank: "asc" } } },
  });
  if (!profile) {
    throw new Error("Cannot generate a daily plan before onboarding is complete");
  }

  const concernIds = profile.concerns.map((c) => c.concernId);
  const usedIds = new Set<string>();
  const isoDate = date.toISOString().slice(0, 10);

  const sessionsData: {
    slot: SessionSlot;
    title: string;
    focusLabel: string;
    durationMinutes: number;
    concernIds: string[];
    items: { practiceId: string; order: number; durationSeconds: number }[];
  }[] = [];

  for (const [slotIndex, def] of SLOT_DEFS.entries()) {
    const minutes = Math.max(2, Math.round(profile.timeAvailableMinutes * def.minuteFactor));
    const routine = await buildRoutine({
      concernIds: rotateConcerns(concernIds, slotIndex),
      minutes,
      goals: [profile.goal, ...def.goalBias],
      userId,
      excludePracticeIds: usedIds,
      seed: `${userId}:${isoDate}:${def.slot}`,
    });
    routine.items.forEach((item) => usedIds.add(item.practiceId));

    sessionsData.push({
      slot: def.slot,
      title: def.title,
      focusLabel: routine.focusLabel,
      durationMinutes: routine.durationMinutes,
      concernIds: routine.concernIds,
      items: routine.items,
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
            origin: "DAILY_PLAN",
            title: s.title,
            focusLabel: s.focusLabel,
            durationMinutes: s.durationMinutes,
            items: { create: s.items },
            concerns: {
              create: s.concernIds.map((concernId, rank) => ({ concernId, rank })),
            },
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
