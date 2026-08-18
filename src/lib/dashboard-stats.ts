import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import { summarizeDailyActivity } from "@/lib/activity-metric";
import { getBurdenTrend } from "@/lib/burden-trend";

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const today = startOfUtcDay(new Date());

  const [recentPlans, todaysCompleted, allCompletedSessions, burdenTrend] = await Promise.all([
    prisma.dailyPlan.findMany({
      where: { userId, date: { gte: startOfUtcDay(sevenDaysAgo) } },
      include: { sessions: true },
    }),
    prisma.plannedSession.findMany({
      where: {
        dailyPlan: { userId, date: today },
        completedAt: { not: null },
      },
      include: { feedback: true },
    }),
    prisma.plannedSession.findMany({
      where: { dailyPlan: { userId }, completedAt: { not: null } },
      select: { completedAt: true },
    }),
    getBurdenTrend(userId, 7),
  ]);

  const plannedThisWeek = recentPlans.reduce((sum, p) => sum + p.sessions.length, 0);
  const completedThisWeek = recentPlans.reduce(
    (sum, p) => sum + p.sessions.filter((s) => s.completedAt).length,
    0
  );

  const streak = calculateStreak(allCompletedSessions.map((s) => s.completedAt as Date));

  const activity = summarizeDailyActivity(
    todaysCompleted.map((s) => ({
      durationMinutes: s.durationMinutes,
      feedback: s.feedback
        ? {
            scale: s.feedback.scale,
            intensityBefore: s.feedback.intensityBefore,
            intensityAfter: s.feedback.intensityAfter,
          }
        : null,
    }))
  );

  return { streak, activity, completedThisWeek, plannedThisWeek, burdenTrend };
}
