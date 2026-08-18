import { describe, it, expect } from "vitest";
import { calculateStreak, calculateStreakDetail } from "./streaks";

const NOW = new Date("2026-03-20T12:00:00Z");

/** Dates N days before NOW, as completion timestamps. */
function daysAgo(...offsets: number[]): Date[] {
  return offsets.map((n) => {
    const d = new Date(NOW);
    d.setUTCDate(d.getUTCDate() - n);
    return d;
  });
}

describe("calculateStreak", () => {
  it("is zero with no completions", () => {
    expect(calculateStreak([], NOW)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(calculateStreak(daysAgo(0, 1, 2), NOW)).toBe(3);
  });

  it("still counts a streak that ended yesterday, so today isn't over yet", () => {
    expect(calculateStreak(daysAgo(1, 2, 3), NOW)).toBe(3);
  });

  it("breaks when the last completion was two days ago", () => {
    expect(calculateStreak(daysAgo(2, 3, 4), NOW)).toBe(0);
  });

  it("counts multiple completions on one day once", () => {
    const sameDay = [new Date("2026-03-20T08:00:00Z"), new Date("2026-03-20T17:00:00Z")];
    expect(calculateStreak(sameDay, NOW)).toBe(1);
  });
});

describe("streak freezes", () => {
  it("does not bridge a gap before a freeze has been earned", () => {
    // Only 3 days in: no freeze yet, so the gap at day 3 breaks it.
    const result = calculateStreakDetail(daysAgo(0, 1, 2, 4, 5), NOW);
    expect(result.length).toBe(3);
    expect(result.freezesUsed).toBe(0);
  });

  it("bridges a single missed day once a week of streak is banked", () => {
    // 7 active days, one gap at day 7, then more active days.
    const result = calculateStreakDetail(daysAgo(0, 1, 2, 3, 4, 5, 6, 8, 9), NOW);
    expect(result.freezesUsed).toBe(1);
    expect(result.length).toBe(9);
  });

  it("never uses more freezes than the cap", () => {
    // Alternating pattern that would otherwise consume many freezes.
    const active = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20];
    const result = calculateStreakDetail(daysAgo(...active), NOW);
    expect(result.freezesUsed).toBeLessThanOrEqual(3);
  });

  it("reports at-risk when nothing is completed today", () => {
    expect(calculateStreakDetail(daysAgo(1, 2), NOW).atRisk).toBe(true);
    expect(calculateStreakDetail(daysAgo(0, 1), NOW).atRisk).toBe(false);
  });

  it("never bridges two consecutive missed days", () => {
    const result = calculateStreakDetail(daysAgo(0, 1, 2, 3, 4, 5, 6, 9, 10), NOW);
    expect(result.length).toBe(7);
  });
});
