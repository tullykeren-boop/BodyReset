import type { ConcernSeed, MechanismSeed, ConcernMechanismSeed } from "./types";

// Physical and mental concerns share one table and one taxonomy. `kind` only
// affects how they are presented; the routing machinery treats them identically.
export const concerns: ConcernSeed[] = [
  // --- Physical ---
  {
    slug: "neck",
    name: "Neck",
    description: "Release tightness and rebuild control in the cervical spine.",
    kind: "PHYSICAL",
    sortOrder: 1,
    stateLabel: "Stiff neck",
    scale: "PAIN",
  },
  {
    slug: "shoulders",
    name: "Shoulders",
    description: "Restore mobility and stability across the rotator cuff and deltoids.",
    kind: "PHYSICAL",
    sortOrder: 2,
    stateLabel: "Tight shoulders",
    scale: "PAIN",
  },
  {
    slug: "upper-back",
    name: "Upper back",
    description: "Counter the round-shouldered slump that builds through long meeting blocks.",
    kind: "PHYSICAL",
    sortOrder: 3,
    stateLabel: "Aching upper back",
    scale: "PAIN",
  },
  {
    slug: "lower-back",
    name: "Lower back",
    description: "Ease tension and build resilience through the lumbar spine, hips, and core.",
    kind: "PHYSICAL",
    sortOrder: 4,
    stateLabel: "Sore lower back",
    scale: "PAIN",
  },
  {
    slug: "wrists",
    name: "Wrists",
    description: "Relieve strain from typing and mousing all day.",
    kind: "PHYSICAL",
    sortOrder: 5,
    stateLabel: "Achy wrists",
    scale: "PAIN",
  },
  {
    slug: "hips",
    name: "Hips",
    description: "Open tight hip flexors and strengthen the glutes that support them.",
    kind: "PHYSICAL",
    sortOrder: 6,
    stateLabel: "Tight hips",
    scale: "PAIN",
  },

  // --- Mental ---
  {
    slug: "stress",
    name: "Stress",
    description: "Downshift a nervous system that has been running hot all day.",
    kind: "MENTAL",
    sortOrder: 10,
    stateLabel: "Stressed",
    scale: "STRESS",
  },
  {
    slug: "anxiety",
    name: "Anxiety",
    description: "Settle a racing mind and the physical grip that comes with it.",
    kind: "MENTAL",
    sortOrder: 11,
    stateLabel: "Anxious",
    scale: "STRESS",
  },
  {
    slug: "low-focus",
    name: "Focus",
    description: "Clear mental fog and re-anchor attention before the next block of work.",
    kind: "MENTAL",
    sortOrder: 12,
    stateLabel: "Can't focus",
    scale: "FOCUS",
  },
  {
    slug: "low-energy",
    name: "Energy",
    description: "Lift a mid-afternoon slump without reaching for another coffee.",
    kind: "MENTAL",
    sortOrder: 13,
    stateLabel: "Drained",
    scale: "ENERGY",
  },
  {
    slug: "low-mood",
    name: "Mood",
    description: "Shift a flat or heavy mood through posture, breath, and movement.",
    kind: "MENTAL",
    sortOrder: 14,
    stateLabel: "Flat",
    scale: "MOOD",
  },
  {
    slug: "eye-strain",
    name: "Eye strain",
    description: "Rest the focusing muscles that hold one distance for hours at a time.",
    kind: "MENTAL",
    sortOrder: 15,
    stateLabel: "Tired eyes",
    scale: "TENSION",
  },
  {
    slug: "restlessness",
    name: "Restlessness",
    description: "Discharge the fidgety, wired feeling of sitting still too long.",
    kind: "MENTAL",
    sortOrder: 16,
    stateLabel: "Restless",
    scale: "TENSION",
  },
];

// Mechanisms deliberately carry no `kind`. Leaving them untyped is what lets a
// mental concern route to an anatomical mechanism (stress -> upper back) and a
// physical concern route to a regulatory one (neck -> parasympathetic downshift)
// without either side needing an escape hatch.
export const mechanisms: MechanismSeed[] = [
  // Anatomical
  { slug: "erector-spinae", name: "Erector Spinae", description: "The muscles running along the spine that support upright posture." },
  { slug: "glutes", name: "Glutes", description: "The hip extensor muscles that stabilize the pelvis and lower back." },
  { slug: "hamstrings", name: "Hamstrings", description: "The back-of-thigh muscles that extend the hip and flex the knee." },
  { slug: "hip-flexors", name: "Hip Flexors", description: "The muscles at the front of the hip that lift the leg and tilt the pelvis." },
  { slug: "core", name: "Core / Abdominals", description: "The deep trunk muscles that stabilize the spine and pelvis." },
  { slug: "rotator-cuff", name: "Rotator Cuff", description: "The small muscles that stabilize and rotate the shoulder joint." },
  { slug: "upper-back", name: "Upper Back / Trapezius", description: "The muscles between the shoulder blades that support posture." },
  { slug: "chest", name: "Chest", description: "The pectoral muscles, often tight from forward posture." },
  { slug: "deltoids", name: "Deltoids", description: "The muscles capping the shoulder that drive arm movement." },
  { slug: "neck-flexors", name: "Neck Flexors & Extensors", description: "The muscles that support and move the cervical spine." },
  { slug: "levator-scapulae", name: "Levator Scapulae", description: "A muscle running from the neck to the shoulder blade, prone to tightness." },
  { slug: "adductors", name: "Adductors", description: "The inner-thigh muscles that stabilize the hip and pelvis." },
  { slug: "deep-hip-rotators", name: "Deep Hip Rotators", description: "Small muscles deep in the hip, including the piriformis." },
  { slug: "forearm-flexors", name: "Forearm Flexors", description: "The muscles on the palm side of the forearm that flex the wrist." },
  { slug: "forearm-extensors", name: "Forearm Extensors", description: "The muscles on the back of the forearm that extend the wrist." },

  // Regulatory
  { slug: "parasympathetic-downshift", name: "Parasympathetic Downshift", description: "The rest-and-digest response that slows heart rate and releases guarding." },
  { slug: "sympathetic-upshift", name: "Sympathetic Upshift", description: "Controlled arousal that raises alertness and circulation." },
  { slug: "visual-system", name: "Visual System", description: "The focusing and tracking muscles of the eyes, plus the gaze reflexes tied to them." },
  { slug: "attention-control", name: "Attention Control", description: "The capacity to place and hold attention deliberately." },
  { slug: "interoception", name: "Interoception", description: "The sense of the body's internal state, which grounds a racing mind." },
  { slug: "cognitive-reframe", name: "Cognitive Reframe", description: "Deliberately changing the framing of a thought or situation." },
  { slug: "motor-discharge", name: "Motor Discharge", description: "Burning off accumulated restlessness through brief, larger movement." },
  { slug: "diaphragm", name: "Diaphragm", description: "The primary breathing muscle, which drives both breath depth and trunk stability." },
];

// weight 0-100: how relevant the mechanism is to the concern. 100 = core driver.
export const concernMechanisms: ConcernMechanismSeed[] = [
  // --- Physical concerns (migrated from the old 1/2 scale: 1 -> 100, 2 -> 55) ---
  { concern: "neck", mechanism: "neck-flexors", weight: 100 },
  { concern: "neck", mechanism: "levator-scapulae", weight: 55 },
  { concern: "neck", mechanism: "upper-back", weight: 55 },
  // Cross-kind: a stiff neck at 4pm is often held tension, not just mechanics.
  { concern: "neck", mechanism: "parasympathetic-downshift", weight: 30 },

  { concern: "shoulders", mechanism: "rotator-cuff", weight: 100 },
  { concern: "shoulders", mechanism: "deltoids", weight: 55 },
  { concern: "shoulders", mechanism: "chest", weight: 55 },
  { concern: "shoulders", mechanism: "upper-back", weight: 55 },
  { concern: "shoulders", mechanism: "parasympathetic-downshift", weight: 25 },

  { concern: "upper-back", mechanism: "upper-back", weight: 100 },
  { concern: "upper-back", mechanism: "rotator-cuff", weight: 55 },
  { concern: "upper-back", mechanism: "chest", weight: 55 },
  { concern: "upper-back", mechanism: "erector-spinae", weight: 55 },

  { concern: "lower-back", mechanism: "erector-spinae", weight: 100 },
  { concern: "lower-back", mechanism: "core", weight: 100 },
  { concern: "lower-back", mechanism: "glutes", weight: 55 },
  { concern: "lower-back", mechanism: "hamstrings", weight: 55 },
  { concern: "lower-back", mechanism: "hip-flexors", weight: 55 },

  { concern: "wrists", mechanism: "forearm-flexors", weight: 100 },
  { concern: "wrists", mechanism: "forearm-extensors", weight: 55 },

  { concern: "hips", mechanism: "hip-flexors", weight: 100 },
  { concern: "hips", mechanism: "glutes", weight: 55 },
  { concern: "hips", mechanism: "adductors", weight: 55 },
  { concern: "hips", mechanism: "deep-hip-rotators", weight: 55 },

  // --- Mental concerns ---
  { concern: "stress", mechanism: "parasympathetic-downshift", weight: 100 },
  { concern: "stress", mechanism: "diaphragm", weight: 70 },
  { concern: "stress", mechanism: "motor-discharge", weight: 60 },
  // The trapezius is where most desk workers physically hold stress.
  { concern: "stress", mechanism: "upper-back", weight: 45 },
  { concern: "stress", mechanism: "neck-flexors", weight: 35 },

  { concern: "anxiety", mechanism: "parasympathetic-downshift", weight: 100 },
  { concern: "anxiety", mechanism: "cognitive-reframe", weight: 80 },
  { concern: "anxiety", mechanism: "diaphragm", weight: 75 },
  { concern: "anxiety", mechanism: "interoception", weight: 60 },

  { concern: "low-focus", mechanism: "attention-control", weight: 100 },
  { concern: "low-focus", mechanism: "visual-system", weight: 60 },
  { concern: "low-focus", mechanism: "sympathetic-upshift", weight: 40 },
  { concern: "low-focus", mechanism: "diaphragm", weight: 35 },

  { concern: "low-energy", mechanism: "sympathetic-upshift", weight: 100 },
  { concern: "low-energy", mechanism: "motor-discharge", weight: 60 },
  // Sitting shortens the hip flexors and stalls circulation; both read as fatigue.
  { concern: "low-energy", mechanism: "hip-flexors", weight: 45 },
  { concern: "low-energy", mechanism: "erector-spinae", weight: 40 },

  { concern: "low-mood", mechanism: "sympathetic-upshift", weight: 70 },
  { concern: "low-mood", mechanism: "cognitive-reframe", weight: 70 },
  // Opening the chest is the most reliable postural lever on mood.
  { concern: "low-mood", mechanism: "chest", weight: 50 },
  { concern: "low-mood", mechanism: "motor-discharge", weight: 45 },

  { concern: "eye-strain", mechanism: "visual-system", weight: 100 },
  { concern: "eye-strain", mechanism: "neck-flexors", weight: 50 },
  { concern: "eye-strain", mechanism: "levator-scapulae", weight: 40 },

  { concern: "restlessness", mechanism: "motor-discharge", weight: 100 },
  { concern: "restlessness", mechanism: "parasympathetic-downshift", weight: 70 },
  { concern: "restlessness", mechanism: "interoception", weight: 50 },
];
