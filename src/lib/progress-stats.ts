import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import { getDiscomfortTrend } from "@/lib/discomfort-trend";
import { getBodyAreaByMuscleGroupId, getPrimaryBodyArea } from "@/lib/exercise-body-area";

export async function getProgressStats(userId: string) {
  const [completedSessions, bodyAreaByMuscleGroupId, discomfortTrend] = await Promise.all([
    prisma.plannedSession.findMany({
      where: { dailyPlan: { userId }, completedAt: { not: null } },
      include: { exercises: { include: { exercise: { include: { muscleGroups: true } } } } },
    }),
    getBodyAreaByMuscleGroupId(),
    getDiscomfortTrend(userId, 21),
  ]);

  const totalSessions = completedSessions.length;
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const streak = calculateStreak(completedSessions.map((s) => s.completedAt as Date));

  const tally = new Map<string, { name: string; count: number }>();
  for (const session of completedSessions) {
    for (const se of session.exercises) {
      const bodyArea = getPrimaryBodyArea(se.exercise, bodyAreaByMuscleGroupId);
      if (!bodyArea) continue;
      const entry = tally.get(bodyArea.slug) ?? { name: bodyArea.name, count: 0 };
      entry.count += 1;
      tally.set(bodyArea.slug, entry);
    }
  }

  const totalTally = [...tally.values()].reduce((sum, t) => sum + t.count, 0);
  const painAreaFrequency = [...tally.entries()]
    .map(([slug, { name, count }]) => ({
      slug,
      name,
      pct: totalTally > 0 ? Math.round((count / totalTally) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  const improvementPct =
    discomfortTrend.length >= 2
      ? Math.round(
          ((discomfortTrend[0] - discomfortTrend[discomfortTrend.length - 1]) /
            Math.max(discomfortTrend[0], 1)) *
            100
        )
      : null;

  return { streak, totalSessions, totalMinutes, discomfortTrend, painAreaFrequency, improvementPct };
}
