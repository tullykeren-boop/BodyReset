import { describe, it, expect } from "vitest";
import { parseBreathPattern, phaseAt } from "./breath-pacer";

describe("parseBreathPattern", () => {
  it("reads a three-part in/hold/out pattern", () => {
    expect(parseBreathPattern("4-4-8")).toEqual([
      { label: "Breathe in", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Breathe out", seconds: 8 },
    ]);
  });

  it("reads a four-part box pattern", () => {
    expect(parseBreathPattern("4-4-4-4")).toHaveLength(4);
  });

  it("drops zero-length phases so an in-out rhythm has no empty hold", () => {
    expect(parseBreathPattern("4-0-8")).toEqual([
      { label: "Breathe in", seconds: 4 },
      { label: "Breathe out", seconds: 8 },
    ]);
  });

  it("ignores garbage segments rather than producing NaN phases", () => {
    expect(parseBreathPattern("4-x-6")).toEqual([
      { label: "Breathe in", seconds: 4 },
      { label: "Breathe out", seconds: 6 },
    ]);
  });
});

describe("phaseAt", () => {
  const phases = parseBreathPattern("4-2-6");

  it("starts on the inhale with the full count remaining", () => {
    expect(phaseAt(phases, 0)).toMatchObject({ index: 0, secondsLeft: 4 });
  });

  it("counts down within a phase", () => {
    expect(phaseAt(phases, 3)?.secondsLeft).toBe(1);
  });

  it("moves into the next phase at the boundary", () => {
    expect(phaseAt(phases, 4)).toMatchObject({ index: 1, secondsLeft: 2 });
    expect(phaseAt(phases, 6)).toMatchObject({ index: 2, secondsLeft: 6 });
  });

  it("loops cleanly back to the start of the cycle", () => {
    const cycle = 4 + 2 + 6;
    expect(phaseAt(phases, cycle)).toEqual(phaseAt(phases, 0));
    expect(phaseAt(phases, cycle * 3 + 5)).toEqual(phaseAt(phases, 5));
  });

  it("returns null for an empty pattern instead of dividing by zero", () => {
    expect(phaseAt([], 5)).toBeNull();
  });

  it("never reports zero or negative seconds left", () => {
    for (let t = 0; t < 60; t++) {
      expect(phaseAt(phases, t)!.secondsLeft).toBeGreaterThan(0);
    }
  });
});
