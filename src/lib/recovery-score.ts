import type { CheckInMood } from "@/generated/prisma/client";

const MOOD_SCORE: Record<CheckInMood, number> = {
  GREAT: 100,
  OKAY: 70,
  TENSE: 40,
  PAIN: 15,
};

/**
 * A 0-100 blend of how the user says they feel, how much their pain actually
 * dropped after sessions, how consistently they're completing their plan,
 * and their current streak.
 */
export function calculateRecoveryScore({
  recentMoods,
  recentPainAfter,
  completedThisWeek,
  plannedThisWeek,
  streak,
}: {
  recentMoods: CheckInMood[];
  recentPainAfter: number[];
  completedThisWeek: number;
  plannedThisWeek: number;
  streak: number;
}): number {
  const moodScore =
    recentMoods.length > 0
      ? recentMoods.reduce((sum, m) => sum + MOOD_SCORE[m], 0) / recentMoods.length
      : 70;

  const feedbackScore =
    recentPainAfter.length > 0
      ? recentPainAfter.reduce((sum, p) => sum + (10 - p) * 10, 0) / recentPainAfter.length
      : 70;

  const completionScore = plannedThisWeek > 0 ? (completedThisWeek / plannedThisWeek) * 100 : 50;

  const base = moodScore * 0.4 + feedbackScore * 0.35 + completionScore * 0.25;
  const streakBonus = Math.min(streak * 1.5, 15);

  return Math.round(Math.min(100, Math.max(0, base + streakBonus)));
}
