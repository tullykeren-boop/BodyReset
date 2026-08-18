import { toBurden } from "@/lib/intensity";
import type { IntensityScale } from "@/generated/prisma/client";

/**
 * LetReSet's single daily number.
 *
 * This deliberately replaces the old 0-100 "recovery score", which blended
 * mood, pain, completion and streak into one figure nobody could act on. Points
 * are additive and legible: you earn them by doing routines, and a 30-second
 * breath reset counts toward the same goal as a 5-minute mobility session.
 */
export const POINTS_PER_MINUTE = 10;

/** Roughly ten minutes of movement across the day. */
export const DAILY_GOAL_POINTS = 100;

/** Extra credit when a routine measurably moved the needle. */
export const POINTS_PER_BURDEN_POINT = 5;

export type CompletedSessionSignal = {
  durationMinutes: number;
  feedback: { scale: IntensityScale; intensityBefore: number; intensityAfter: number } | null;
};

export function pointsForSession(session: CompletedSessionSignal): number {
  let points = Math.round(session.durationMinutes * POINTS_PER_MINUTE);

  if (session.feedback) {
    const { scale, intensityBefore, intensityAfter } = session.feedback;
    const improvement = toBurden(scale, intensityBefore) - toBurden(scale, intensityAfter);
    if (improvement > 0) points += Math.round(improvement * POINTS_PER_BURDEN_POINT);
  }

  return points;
}

export function calculateActivityPoints(sessions: CompletedSessionSignal[]): number {
  return sessions.reduce((sum, s) => sum + pointsForSession(s), 0);
}

export type DailyActivity = {
  points: number;
  goal: number;
  /** 0-100, capped, for the progress ring. */
  pct: number;
  goalMet: boolean;
};

export function summarizeDailyActivity(
  sessions: CompletedSessionSignal[],
  goal: number = DAILY_GOAL_POINTS
): DailyActivity {
  const points = calculateActivityPoints(sessions);
  return {
    points,
    goal,
    pct: Math.min(100, Math.round((points / goal) * 100)),
    goalMet: points >= goal,
  };
}
