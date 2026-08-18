import { prisma } from "@/lib/prisma";
import { toBurden, MOOD_BURDEN } from "@/lib/intensity";

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Per-day burden trend (0-10, lower is always better) over the last `days`
 * days, built from whichever signal is available that day: session feedback
 * first, then check-in mood. Days with no signal are omitted rather than guessed.
 *
 * Readings on any intensity scale are normalised through `toBurden`, so a
 * stress session and a lower-back session land on the same axis. Legacy
 * pain-scale rows pass through unchanged.
 */
export async function getBurdenTrend(userId: string, days: number): Promise<number[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDay = startOfUtcDay(since);

  const [checkIns, feedback] = await Promise.all([
    prisma.checkIn.findMany({ where: { userId, date: { gte: sinceDay } } }),
    prisma.sessionFeedback.findMany({
      where: { plannedSession: { dailyPlan: { userId } }, createdAt: { gte: sinceDay } },
    }),
  ]);

  const byDay = new Map<string, number[]>();
  for (const c of checkIns) {
    const key = c.date.toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(MOOD_BURDEN[c.mood]);
    byDay.set(key, arr);
  }
  for (const f of feedback) {
    const key = f.createdAt.toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(toBurden(f.scale, f.intensityAfter));
    byDay.set(key, arr);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, values]) => values.reduce((sum, v) => sum + v, 0) / values.length);
}
