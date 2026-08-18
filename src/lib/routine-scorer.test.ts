import { describe, it, expect } from "vitest";
import { scorePractices, packRoutine, type PracticeWithLinks, type ScoringContext } from "./routine-scorer";

function practice(overrides: Partial<PracticeWithLinks> & { id: string }): PracticeWithLinks {
  return {
    slug: overrides.id,
    name: overrides.id,
    description: "",
    instructions: "",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    goals: [],
    equipment: "none",
    modality: "MOVEMENT",
    posture: "ANY",
    discreet: false,
    exertion: 2,
    breathPattern: null,
    animationKey: null,
    createdAt: new Date(),
    mechanisms: [],
    concerns: [],
    ...overrides,
  } as PracticeWithLinks;
}

function context(overrides: Partial<ScoringContext> = {}): ScoringContext {
  return {
    mechanismWeights: new Map(),
    concernDamp: new Map(),
    goals: [],
    excludePracticeIds: new Set(),
    affinity: new Map(),
    seed: "test",
    ...overrides,
  };
}

const byId = (results: { practice: { id: string }; score: number }[]) =>
  Object.fromEntries(results.map((r) => [r.practice.id, r.score]));

describe("scorePractices", () => {
  it("scores a practice higher when it acts strongly on a relevant mechanism", () => {
    const ctx = context({ mechanismWeights: new Map([["m1", 100]]) });
    const scores = byId(
      scorePractices(
        [
          practice({ id: "strong", mechanisms: [{ mechanismId: "m1", weight: 80 }] }),
          practice({ id: "weak", mechanisms: [{ mechanismId: "m1", weight: 20 }] }),
        ],
        ctx
      )
    );
    expect(scores.strong).toBeGreaterThan(scores.weak);
  });

  it("ignores mechanisms that are not relevant to the request", () => {
    const ctx = context({ mechanismWeights: new Map([["m1", 100]]) });
    const scores = byId(
      scorePractices([practice({ id: "off-target", mechanisms: [{ mechanismId: "other", weight: 100 }] })], ctx)
    );
    // Only the jitter band remains.
    expect(scores["off-target"]).toBeLessThan(13);
  });

  it("damps later-ranked concerns so the first pick leads", () => {
    const ctx = context({
      concernDamp: new Map([
        ["primary", 1],
        ["secondary", 0.5],
      ]),
    });
    const scores = byId(
      scorePractices(
        [
          practice({ id: "for-primary", concerns: [{ concernId: "primary", weight: 40 }] }),
          practice({ id: "for-secondary", concerns: [{ concernId: "secondary", weight: 40 }] }),
        ],
        ctx
      )
    );
    expect(scores["for-primary"]).toBeGreaterThan(scores["for-secondary"]);
  });

  it("lets a large negative override exclude a practice entirely", () => {
    const ctx = context({
      mechanismWeights: new Map([["m1", 100]]),
      concernDamp: new Map([["c1", 1]]),
    });
    const scores = byId(
      scorePractices(
        [
          practice({
            id: "banned",
            mechanisms: [{ mechanismId: "m1", weight: 100 }],
            concerns: [{ concernId: "c1", weight: -1000 }],
          }),
          practice({ id: "fine", mechanisms: [{ mechanismId: "m1", weight: 30 }] }),
        ],
        ctx
      )
    );
    expect(scores.banned).toBeLessThan(scores.fine);
    expect(scores.banned).toBeLessThan(-500);
  });

  it("weights the primary goal above bias goals", () => {
    const ctx = context({ goals: ["REDUCE_PAIN", "ENERGY"] });
    const scores = byId(
      scorePractices(
        [
          practice({ id: "primary-goal", goals: ["REDUCE_PAIN"] }),
          practice({ id: "bias-goal", goals: ["ENERGY"] }),
          practice({ id: "no-goal", goals: [] }),
        ],
        ctx
      )
    );
    expect(scores["primary-goal"]).toBeGreaterThan(scores["bias-goal"]);
    expect(scores["bias-goal"]).toBeGreaterThan(scores["no-goal"]);
  });

  it("penalises repeats softly, so a thin pool can still fill a routine", () => {
    const ctx = context({ excludePracticeIds: new Set(["used"]) });
    const scores = byId(scorePractices([practice({ id: "used" }), practice({ id: "fresh" })], ctx));
    expect(scores.used).toBeLessThan(scores.fresh);
    // Soft, not -Infinity: it must remain selectable as a last resort.
    expect(scores.used).toBeGreaterThan(-600);
  });

  it("applies learned affinity from past feedback", () => {
    const ctx = context({ affinity: new Map([["loved", 40], ["disliked", -40]]) });
    const scores = byId(
      scorePractices([practice({ id: "loved" }), practice({ id: "neutral" }), practice({ id: "disliked" })], ctx)
    );
    expect(scores.loved).toBeGreaterThan(scores.neutral);
    expect(scores.neutral).toBeGreaterThan(scores.disliked);
  });

  it("is deterministic for a given seed and varies across seeds", () => {
    const items = [practice({ id: "a" }), practice({ id: "b" }), practice({ id: "c" })];
    const one = byId(scorePractices(items, context({ seed: "s1" })));
    const two = byId(scorePractices(items, context({ seed: "s1" })));
    const three = byId(scorePractices(items, context({ seed: "s2" })));
    expect(one).toEqual(two);
    expect(one).not.toEqual(three);
  });
});

describe("packRoutine", () => {
  const scored = (items: PracticeWithLinks[], scores: number[]) =>
    items.map((practice, i) => ({ practice, score: scores[i] }));

  it("fills close to the requested duration using real per-practice seconds", () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      practice({ id: `p${i}`, durationSeconds: 40, modality: "MOVEMENT" })
    );
    const picked = packRoutine(scored(items, items.map((_, i) => 100 - i)), 300);
    const total = picked.reduce((s, p) => s + p.durationSeconds, 0);
    expect(total).toBeGreaterThanOrEqual(300 * 0.8);
    expect(total).toBeLessThanOrEqual(300 * 1.2);
  });

  it("breaks up a single modality even when it dominates on score", () => {
    // The exact failure this penalty exists for: a stress request returning
    // five breathing exercises in a row.
    const breath = Array.from({ length: 6 }, (_, i) =>
      practice({ id: `breath${i}`, modality: "BREATHWORK", durationSeconds: 50 })
    );
    const other = [
      practice({ id: "move", modality: "MOVEMENT", durationSeconds: 40 }),
      practice({ id: "somatic", modality: "SOMATIC", durationSeconds: 40 }),
    ];
    const all = [...breath, ...other];
    // Breathwork scores strictly higher than everything else.
    const picked = packRoutine(scored(all, [100, 98, 96, 94, 92, 90, 60, 58]), 300);
    const modalities = new Set(picked.map((p) => p.modality));
    expect(modalities.size).toBeGreaterThan(1);
    expect(picked.filter((p) => p.modality === "BREATHWORK").length).toBeLessThanOrEqual(4);
  });

  it("orders by modality arc: settle, then work, then integrate", () => {
    const items = [
      practice({ id: "cog", modality: "COGNITIVE" }),
      practice({ id: "move", modality: "MOVEMENT" }),
      practice({ id: "breath", modality: "BREATHWORK" }),
    ];
    const picked = packRoutine(scored(items, [90, 80, 70]), 200);
    expect(picked[0].modality).toBe("BREATHWORK");
    expect(picked[picked.length - 1].modality).toBe("COGNITIVE");
  });

  it("still returns one item when the target is shorter than any practice", () => {
    const items = [practice({ id: "long", durationSeconds: 60 })];
    const picked = packRoutine(scored(items, [50]), 20);
    expect(picked).toHaveLength(1);
  });

  it("returns nothing when there are no candidates", () => {
    expect(packRoutine([], 300)).toEqual([]);
  });
});
