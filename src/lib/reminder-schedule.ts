/**
 * Pure scheduling rules for movement reminders.
 *
 * Deliberately separate from `push.ts`, which is server-only because it holds
 * VAPID keys and talks to the database. Keeping the decision logic here means
 * "should this user be nudged right now" is testable without a database, a
 * network, or a fake clock.
 */

export type NudgePayload = {
  title: string;
  body: string;
  /** Deep link, e.g. /now?concern=stress */
  url: string;
};

export type ScheduleLike = {
  enabled: boolean;
  startMinute: number;
  endMinute: number;
  intervalMinutes: number;
  weekdays: number[];
  timezone: string;
  snoozeUntil: Date | null;
  lastSentAt: Date | null;
};

/** Current wall-clock minute-of-day and weekday in a given IANA timezone. */
export function localTimeIn(timezone: string, now: Date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hour12: false,
    }).formatToParts(now);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const hour = Number(get("hour")) % 24;
    const minute = Number(get("minute"));
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekday = weekdayNames.indexOf(get("weekday"));

    return { minuteOfDay: hour * 60 + minute, weekday };
  } catch {
    // One user's corrupt stored timezone must not take down the whole
    // dispatch run, so fall back to UTC rather than throwing.
    return {
      minuteOfDay: now.getUTCHours() * 60 + now.getUTCMinutes(),
      weekday: now.getUTCDay(),
    };
  }
}

/** Whether a nudge is due right now. */
export function isNudgeDue(schedule: ScheduleLike, now: Date = new Date()): boolean {
  if (!schedule.enabled) return false;
  if (schedule.snoozeUntil && schedule.snoozeUntil > now) return false;

  const { minuteOfDay, weekday } = localTimeIn(schedule.timezone, now);
  if (!schedule.weekdays.includes(weekday)) return false;
  if (minuteOfDay < schedule.startMinute || minuteOfDay > schedule.endMinute) return false;

  if (schedule.lastSentAt) {
    const minutesSince = (now.getTime() - schedule.lastSentAt.getTime()) / 60000;
    // Small tolerance so a scheduler firing a few seconds early still counts.
    if (minutesSince < schedule.intervalMinutes - 1) return false;
  }

  return true;
}

/** Copy for the nudge itself. Varied so it doesn't read like the same alarm. */
const NUDGE_COPY: NudgePayload[] = [
  { title: "Time to move", body: "Two minutes now beats an hour of stiffness later.", url: "/now" },
  { title: "How's your neck?", body: "A quick reset before it builds.", url: "/now?concern=neck" },
  {
    title: "Wound up?",
    body: "One minute of breathing can take the edge off.",
    url: "/now?concern=stress",
  },
  {
    title: "Eyes need a break",
    body: "Look away from the screen for twenty seconds.",
    url: "/now?concern=eye-strain",
  },
  {
    title: "Losing focus?",
    body: "Reset your attention before the next block.",
    url: "/now?concern=low-focus",
  },
  {
    title: "Afternoon slump",
    body: "Move for two minutes instead of another coffee.",
    url: "/now?concern=low-energy",
  },
];

export function pickNudgeCopy(seed: number): NudgePayload {
  return NUDGE_COPY[Math.abs(seed) % NUDGE_COPY.length];
}
