function toUtcDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function subUtcDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

/**
 * How many missed days a streak can absorb before it breaks.
 *
 * A strict streak is actively counter-productive for a habit app: one busy
 * Tuesday wipes out six weeks of consistency, and the usual response to losing
 * a long streak is to stop altogether. One grace day per week of streak, capped,
 * keeps the number honest without making it fragile.
 */
export const MAX_STREAK_FREEZES = 3;

function freezesEarned(streakLength: number): number {
  return Math.min(MAX_STREAK_FREEZES, Math.floor(streakLength / 7));
}

export type StreakResult = {
  /** Days counted, including any bridged by a freeze. */
  length: number;
  /** How many missed days the streak absorbed. */
  freezesUsed: number;
  /** True when the user hasn't completed anything today yet. */
  atRisk: boolean;
};

/**
 * Current streak = consecutive calendar days (UTC) with at least one completed
 * routine, ending today or yesterday. Using "yesterday" as a valid end point
 * gives the user until the end of their day before the streak resets.
 *
 * A gap of a single day is bridged if the streak has earned a freeze for it.
 */
export function calculateStreakDetail(completedDates: Date[], now: Date = new Date()): StreakResult {
  const dateSet = new Set(completedDates.map(toUtcDateString));
  const today = startOfUtcDay(now);
  const atRisk = !dateSet.has(toUtcDateString(today));

  if (dateSet.size === 0) return { length: 0, freezesUsed: 0, atRisk: true };

  let cursor = today;
  if (!dateSet.has(toUtcDateString(cursor))) {
    cursor = subUtcDays(cursor, 1);
    if (!dateSet.has(toUtcDateString(cursor))) return { length: 0, freezesUsed: 0, atRisk: true };
  }

  let length = 0;
  let freezesUsed = 0;

  for (;;) {
    if (dateSet.has(toUtcDateString(cursor))) {
      length += 1;
      cursor = subUtcDays(cursor, 1);
      continue;
    }
    // A gap. Bridge it only if the streak so far has earned a freeze, and only
    // if the day before it was actually active.
    const previous = subUtcDays(cursor, 1);
    if (freezesUsed < freezesEarned(length) && dateSet.has(toUtcDateString(previous))) {
      freezesUsed += 1;
      cursor = previous;
      continue;
    }
    break;
  }

  return { length, freezesUsed, atRisk };
}

/** Backwards-compatible scalar used by the dashboard and coach context. */
export function calculateStreak(completedDates: Date[], now: Date = new Date()): number {
  return calculateStreakDetail(completedDates, now).length;
}
