import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import { getBurdenTrend } from "@/lib/burden-trend";
import { toBurden } from "@/lib/intensity";
import type { ConcernKind } from "@/generated/prisma/client";

export type ConcernFrequency = { slug: string; name: string; pct: number };

export async function getProgressStats(userId: string) {
  const [completedSessions, burdenTrend] = await Promise.all([
    prisma.plannedSession.findMany({
      where: { dailyPlan: { userId }, completedAt: { not: null } },
      include: {
        // What the session was built for is recorded at generation time rather
        // than reverse-engineered from practice-mechanism links, which silently
        // dropped practices and collapsed once concerns shared mechanisms.
        concerns: { include: { concern: true } },
        feedback: true,
      },
    }),
    getBurdenTrend(userId, 21),
  ]);

  const totalSessions = completedSessions.length;
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const streak = calculateStreak(completedSessions.map((s) => s.completedAt as Date));

  const tally = new Map<string, { name: string; kind: ConcernKind; count: number }>();
  for (const session of completedSessions) {
    for (const link of session.concerns) {
      const entry = tally.get(link.concern.slug) ?? {
        name: link.concern.name,
        kind: link.concern.kind,
        count: 0,
      };
      entry.count += 1;
      tally.set(link.concern.slug, entry);
    }
  }

  function frequencyFor(kind: ConcernKind): ConcernFrequency[] {
    const rows = [...tally.entries()].filter(([, t]) => t.kind === kind);
    const total = rows.reduce((sum, [, t]) => sum + t.count, 0);
    return rows
      .map(([slug, { name, count }]) => ({
        slug,
        name,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
  }

  const improvementPct =
    burdenTrend.length >= 2
      ? Math.round(
          ((burdenTrend[0] - burdenTrend[burdenTrend.length - 1]) / Math.max(burdenTrend[0], 1)) *
            100
        )
      : null;

  // Split so the two halves of the product each get their own honest readout.
  const feedbacks = completedSessions.flatMap((s) => (s.feedback ? [s.feedback] : []));
  const physicalSessions = completedSessions.filter((s) =>
    s.concerns.some((c) => c.concern.kind === "PHYSICAL")
  ).length;
  const mentalSessions = completedSessions.filter((s) =>
    s.concerns.some((c) => c.concern.kind === "MENTAL")
  ).length;

  const avgRelief =
    feedbacks.length > 0
      ? feedbacks.reduce(
          (sum, f) => sum + (toBurden(f.scale, f.intensityBefore) - toBurden(f.scale, f.intensityAfter)),
          0
        ) / feedbacks.length
      : null;

  return {
    streak,
    totalSessions,
    totalMinutes,
    burdenTrend,
    physicalConcernFrequency: frequencyFor("PHYSICAL"),
    mentalConcernFrequency: frequencyFor("MENTAL"),
    physicalSessions,
    mentalSessions,
    avgRelief,
    improvementPct,
  };
}
