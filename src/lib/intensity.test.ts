import { describe, it, expect } from "vitest";
import { toBurden, relief, optimisticAfter, MOOD_BURDEN, SCALE_POLARITY } from "./intensity";

describe("toBurden", () => {
  it("passes pain readings through unchanged", () => {
    // This is the property that keeps every pre-migration chart identical.
    for (let v = 0; v <= 10; v++) {
      expect(toBurden("PAIN", v)).toBe(v);
    }
  });

  it("inverts positive scales so lower is always better", () => {
    expect(toBurden("ENERGY", 10)).toBe(0);
    expect(toBurden("ENERGY", 0)).toBe(10);
    expect(toBurden("FOCUS", 8)).toBe(2);
    expect(toBurden("MOOD", 3)).toBe(7);
  });

  it("keeps every scale inside 0-10", () => {
    for (const scale of Object.keys(SCALE_POLARITY) as (keyof typeof SCALE_POLARITY)[]) {
      for (let v = 0; v <= 10; v++) {
        const burden = toBurden(scale, v);
        expect(burden).toBeGreaterThanOrEqual(0);
        expect(burden).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe("relief", () => {
  it("reports improvement as positive on a negative-polarity scale", () => {
    expect(relief("PAIN", 7, 4)).toBe(3);
    expect(relief("STRESS", 8, 2)).toBe(6);
  });

  it("reports improvement as positive on a positive-polarity scale", () => {
    expect(relief("ENERGY", 2, 7)).toBe(5);
    expect(relief("MOOD", 3, 8)).toBe(5);
  });

  it("reports getting worse as negative on both polarities", () => {
    expect(relief("PAIN", 3, 6)).toBe(-3);
    expect(relief("ENERGY", 8, 5)).toBe(-3);
  });

  it("agrees with the burden axis in both directions", () => {
    // relief and toBurden must never disagree about which way is better.
    for (const scale of ["PAIN", "STRESS", "ENERGY", "FOCUS"] as const) {
      for (let before = 0; before <= 10; before++) {
        for (let after = 0; after <= 10; after++) {
          const byBurden = toBurden(scale, before) - toBurden(scale, after);
          expect(relief(scale, before, after)).toBe(byBurden);
        }
      }
    }
  });
});

describe("optimisticAfter", () => {
  it("moves toward better in the right direction per scale", () => {
    expect(optimisticAfter("PAIN", 6)).toBe(4);
    expect(optimisticAfter("ENERGY", 3)).toBe(5);
  });

  it("clamps at both ends", () => {
    expect(optimisticAfter("PAIN", 1)).toBe(0);
    expect(optimisticAfter("ENERGY", 9)).toBe(10);
  });
});

describe("MOOD_BURDEN", () => {
  it("preserves the original four mood values so historical trends are unchanged", () => {
    expect(MOOD_BURDEN.GREAT).toBe(2);
    expect(MOOD_BURDEN.OKAY).toBe(4);
    expect(MOOD_BURDEN.TENSE).toBe(7);
    expect(MOOD_BURDEN.PAIN).toBe(9);
  });

  it("covers every mood, including the new mental ones", () => {
    for (const mood of ["STRESSED", "FOGGY", "DRAINED", "LOW"] as const) {
      expect(MOOD_BURDEN[mood]).toBeGreaterThan(0);
    }
  });
});
