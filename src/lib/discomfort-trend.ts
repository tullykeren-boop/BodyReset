import { prisma } from "@/lib/prisma";

const MOOD_TO_DISCOMFORT: Record<string, number> = { GREAT: 2, OKAY: 4, TENSE: 7, PAIN: 9 };

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Per-day discomfort trend (0-10, lower is better) over the last `days` days,
 * built from whichever signal is available that day: session feedback first,
 * then check-in mood. Days with no signal are omitted rather than guessed.
 */
export async function getDiscomfortTrend(userId: string, days: number): Promise<number[]> {
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
    arr.push(MOOD_TO_DISCOMFORT[c.mood]);
    byDay.set(key, arr);
  }
  for (const f of feedback) {
    const key = f.createdAt.toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(f.painAfter);
    byDay.set(key, arr);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, values]) => values.reduce((sum, v) => sum + v, 0) / values.length);
}
