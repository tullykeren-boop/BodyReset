import type { PracticeConcernSeed } from "./types";

/**
 * SPARSE overrides layered on top of mechanism routing. Routing handles the
 * general case; these exist only where it is too coarse.
 *
 * Positive weights pin a practice to a concern it is specifically the right
 * answer for. Large negative weights exclude a practice that routing would
 * otherwise surface for a concern it does not actually suit.
 */
export const practiceConcerns: PracticeConcernSeed[] = [
  // Specifically the best first move for acute stress, above general breathwork.
  { practice: "physiological-sigh", concern: "stress", weight: 40 },
  { practice: "physiological-sigh", concern: "anxiety", weight: 35 },

  // Box breathing is the classic anxiety tool; routing alone scores it level
  // with every other parasympathetic practice.
  { practice: "box-breathing", concern: "anxiety", weight: 40 },

  // Cognitive tools are the point for overwhelm, not a side effect.
  { practice: "worry-postpone", concern: "anxiety", weight: 35 },
  { practice: "one-thing-next", concern: "low-focus", weight: 35 },
  { practice: "three-good-things", concern: "low-mood", weight: 45 },
  { practice: "grounding-five-senses", concern: "anxiety", weight: 40 },

  // Eye-specific practices should always lead for eye strain.
  { practice: "twenty-twenty-twenty", concern: "eye-strain", weight: 45 },
  { practice: "near-far-focus", concern: "eye-strain", weight: 40 },
  { practice: "palming", concern: "eye-strain", weight: 35 },

  // Movement is the actual answer to restlessness and a flat afternoon.
  { practice: "shake-it-out", concern: "restlessness", weight: 45 },
  { practice: "desk-march", concern: "low-energy", weight: 40 },
  { practice: "seated-fidget-release", concern: "restlessness", weight: 35 },
  { practice: "power-posture-reset", concern: "low-mood", weight: 40 },

  // The trapezius link means upper-back work legitimately surfaces for stress,
  // and these two are the ones that actually help there.
  { practice: "upper-trap-release", concern: "stress", weight: 25 },
  { practice: "shoulder-rolls", concern: "stress", weight: 20 },

  // Energizing breath is genuinely counterproductive for anxiety -- it is a
  // sympathetic drive, and routing would otherwise score it on the diaphragm link.
  { practice: "energizing-breath", concern: "anxiety", weight: -1000 },
  { practice: "energizing-breath", concern: "stress", weight: -1000 },

  // Strength and floor work do not belong in a stress or focus reset even
  // though they share hip and spine mechanisms with low-energy.
  { practice: "bird-dog", concern: "stress", weight: -1000 },
  { practice: "glute-bridge", concern: "stress", weight: -1000 },
  { practice: "clamshells", concern: "low-energy", weight: -1000 },
  { practice: "standing-hip-abduction", concern: "low-focus", weight: -1000 },
];
