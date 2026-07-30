import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import { calculateRecoveryScore } from "@/lib/recovery-score";
import { getDiscomfortTrend } from "@/lib/discomfort-trend";

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentPlans, recentCheckIns, recentFeedback, allCompletedSessions, discomfortTrend] =
    await Promise.all([
      prisma.dailyPlan.findMany({
        where: { userId, date: { gte: startOfUtcDay(sevenDaysAgo) } },
        include: { sessions: true },
      }),
      prisma.checkIn.findMany({ where: { userId, date: { gte: startOfUtcDay(sevenDaysAgo) } } }),
      prisma.sessionFeedback.findMany({
        where: { plannedSession: { dailyPlan: { userId } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.plannedSession.findMany({
        where: { dailyPlan: { userId }, completedAt: { not: null } },
        select: { completedAt: true },
      }),
      getDiscomfortTrend(userId, 7),
    ]);

  const plannedThisWeek = recentPlans.reduce((sum, p) => sum + p.sessions.length, 0);
  const completedThisWeek = recentPlans.reduce(
    (sum, p) => sum + p.sessions.filter((s) => s.completedAt).length,
    0
  );

  const streak = calculateStreak(allCompletedSessions.map((s) => s.completedAt as Date));

  const recoveryScore = calculateRecoveryScore({
    recentMoods: recentCheckIns.map((c) => c.mood),
    recentPainAfter: recentFeedback.map((f) => f.painAfter),
    completedThisWeek,
    plannedThisWeek,
    streak,
  });

  return { streak, recoveryScore, completedThisWeek, plannedThisWeek, discomfortTrend };
}
