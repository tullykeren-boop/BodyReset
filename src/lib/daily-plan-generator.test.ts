import { describe, it, expect } from "vitest";
import { rotateConcerns } from "./daily-plan-generator";

describe("rotateConcerns", () => {
  const concerns = ["neck", "shoulders", "stress", "focus"];

  it("leaves the first slot leading with the user's top concern", () => {
    expect(rotateConcerns(concerns, 0)).toEqual(concerns);
  });

  it("gives each slot a different lead so the day covers the whole set", () => {
    expect(rotateConcerns(concerns, 1)[0]).toBe("shoulders");
    expect(rotateConcerns(concerns, 2)[0]).toBe("stress");
  });

  it("keeps every concern present in every slot, only reordered", () => {
    for (let slot = 0; slot < 3; slot++) {
      expect([...rotateConcerns(concerns, slot)].sort()).toEqual([...concerns].sort());
    }
  });

  it("wraps around when there are fewer concerns than slots", () => {
    expect(rotateConcerns(["neck", "stress"], 2)).toEqual(["neck", "stress"]);
    expect(rotateConcerns(["neck", "stress"], 1)).toEqual(["stress", "neck"]);
  });

  it("is a no-op for a single concern or none", () => {
    expect(rotateConcerns(["neck"], 2)).toEqual(["neck"]);
    expect(rotateConcerns([], 1)).toEqual([]);
  });
});
