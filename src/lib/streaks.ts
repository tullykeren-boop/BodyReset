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
 * Current streak = consecutive calendar days (UTC), ending today or yesterday,
 * with at least one completed routine. Using "yesterday" as a valid end point
 * gives the user until the end of their day before the streak resets.
 */
export function calculateStreak(completedDates: Date[]): number {
  const dateSet = new Set(completedDates.map(toUtcDateString));
  if (dateSet.size === 0) return 0;

  let cursor = startOfUtcDay(new Date());
  if (!dateSet.has(toUtcDateString(cursor))) {
    cursor = subUtcDays(cursor, 1);
    if (!dateSet.has(toUtcDateString(cursor))) return 0;
  }

  let streak = 0;
  while (dateSet.has(toUtcDateString(cursor))) {
    streak += 1;
    cursor = subUtcDays(cursor, 1);
  }
  return streak;
}
