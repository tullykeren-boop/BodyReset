import { describe, it, expect } from "vitest";
import { isNudgeDue, localTimeIn } from "./reminder-schedule";

const base = {
  enabled: true,
  startMinute: 9 * 60,
  endMinute: 17 * 60,
  intervalMinutes: 90,
  weekdays: [1, 2, 3, 4, 5],
  timezone: "UTC",
  snoozeUntil: null,
  lastSentAt: null,
};

// 2026-03-19 is a Thursday.
const midMorning = new Date("2026-03-19T10:00:00Z");
const earlyMorning = new Date("2026-03-19T07:00:00Z");
const lateEvening = new Date("2026-03-19T22:00:00Z");
const saturday = new Date("2026-03-21T10:00:00Z");

describe("isNudgeDue", () => {
  it("fires inside the window on an enabled weekday", () => {
    expect(isNudgeDue(base, midMorning)).toBe(true);
  });

  it("stays silent before the window opens and after it closes", () => {
    expect(isNudgeDue(base, earlyMorning)).toBe(false);
    expect(isNudgeDue(base, lateEvening)).toBe(false);
  });

  it("stays silent on a day the user didn't select", () => {
    expect(isNudgeDue(base, saturday)).toBe(false);
  });

  it("stays silent when reminders are disabled", () => {
    expect(isNudgeDue({ ...base, enabled: false }, midMorning)).toBe(false);
  });

  it("respects an active snooze and resumes once it lapses", () => {
    const snoozed = { ...base, snoozeUntil: new Date("2026-03-19T11:00:00Z") };
    expect(isNudgeDue(snoozed, midMorning)).toBe(false);
    expect(isNudgeDue(snoozed, new Date("2026-03-19T11:30:00Z"))).toBe(true);
  });

  it("waits out the interval since the last send", () => {
    const recent = { ...base, lastSentAt: new Date("2026-03-19T09:30:00Z") };
    // 30 minutes later, interval is 90.
    expect(isNudgeDue(recent, midMorning)).toBe(false);
    // 95 minutes later.
    expect(isNudgeDue(recent, new Date("2026-03-19T11:05:00Z"))).toBe(true);
  });

  it("honours the user's timezone rather than server time", () => {
    // 10:00 UTC is 02:00 in Los Angeles, well outside a 9-5 window.
    const la = { ...base, timezone: "America/Los_Angeles" };
    expect(isNudgeDue(la, midMorning)).toBe(false);
    // 18:00 UTC is 11:00 in Los Angeles.
    expect(isNudgeDue(la, new Date("2026-03-19T18:00:00Z"))).toBe(true);
  });
});

describe("localTimeIn", () => {
  it("converts to the requested zone", () => {
    expect(localTimeIn("UTC", midMorning)).toEqual({ minuteOfDay: 600, weekday: 4 });
    expect(localTimeIn("America/Los_Angeles", midMorning).minuteOfDay).toBe(180);
  });

  it("falls back to UTC rather than throwing on a bad stored zone", () => {
    // One user's corrupt timezone must not take down the whole dispatch run.
    expect(localTimeIn("Not/AZone", midMorning)).toEqual({ minuteOfDay: 600, weekday: 4 });
  });
});
