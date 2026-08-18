import type { ModalitySeed, PostureSeed } from "./types";

type PracticeMeta = {
  modality?: ModalitySeed;
  posture: PostureSeed;
  discreet: boolean;
  exertion: number;
};

/**
 * Posture, discreetness and exertion for the original 33 physical practices.
 * Kept as an overlay rather than edited into the practice prose so that file
 * stays a straight port of the original content.
 *
 * `discreet: true` means it will not read as exercising to someone else in the
 * room or on a video call. This is a hard filter at routine-build time, so it
 * is deliberately conservative -- anything that involves standing up, using a
 * wall or doorway, or getting on the floor is not discreet.
 */
export const PHYSICAL_PRACTICE_META: Record<string, PracticeMeta> = {
  // --- Neck ---
  "neck-mobility-reset": { posture: "ANY", discreet: true, exertion: 1 },
  "chin-tucks": { posture: "ANY", discreet: true, exertion: 1 },
  "neck-side-stretch": { posture: "ANY", discreet: true, exertion: 1 },
  "upper-trap-release": { posture: "ANY", discreet: true, exertion: 1 },
  "isometric-neck-press": { posture: "ANY", discreet: true, exertion: 2 },

  // --- Shoulders ---
  "doorway-chest-opener": { posture: "STANDING", discreet: false, exertion: 2 },
  "shoulder-rolls": { posture: "ANY", discreet: true, exertion: 1 },
  "band-external-rotation": { posture: "STANDING", discreet: false, exertion: 2 },
  "wall-slides": { posture: "STANDING", discreet: false, exertion: 2 },
  "pendulum-swing": { posture: "STANDING", discreet: false, exertion: 2 },
  "cross-body-shoulder-stretch": { posture: "ANY", discreet: true, exertion: 1 },

  // --- Upper back ---
  "seated-spinal-twist": { posture: "SEATED", discreet: true, exertion: 1 },
  "wall-angels": { posture: "STANDING", discreet: false, exertion: 2 },
  "scapular-squeeze": { posture: "ANY", discreet: true, exertion: 2 },
  "thoracic-extension-stretch": { posture: "SEATED", discreet: false, exertion: 2 },
  "cat-cow-stretch": { posture: "FLOOR", discreet: false, exertion: 2 },

  // --- Lower back ---
  "standing-forward-fold": { posture: "STANDING", discreet: false, exertion: 2 },
  "childs-pose": { posture: "FLOOR", discreet: false, exertion: 1 },
  "knee-to-chest-stretch": { posture: "FLOOR", discreet: false, exertion: 1 },
  "pelvic-tilts": { posture: "SEATED", discreet: true, exertion: 1 },
  "bird-dog": { posture: "FLOOR", discreet: false, exertion: 3 },
  "glute-bridge": { posture: "FLOOR", discreet: false, exertion: 3 },

  // --- Hips ---
  "kneeling-hip-flexor-stretch": { posture: "FLOOR", discreet: false, exertion: 2 },
  "figure-4-stretch": { posture: "SEATED", discreet: false, exertion: 1 },
  "butterfly-stretch": { posture: "FLOOR", discreet: false, exertion: 1 },
  "hip-circles": { posture: "STANDING", discreet: false, exertion: 2 },
  "standing-hip-abduction": { posture: "STANDING", discreet: false, exertion: 3 },
  clamshells: { posture: "FLOOR", discreet: false, exertion: 3 },

  // --- Wrists ---
  "wrist-forearm-stretch": { posture: "ANY", discreet: true, exertion: 1 },
  "wrist-circles": { posture: "ANY", discreet: true, exertion: 1 },
  "prayer-stretch": { posture: "ANY", discreet: true, exertion: 1 },
  "wrist-curls": { posture: "SEATED", discreet: false, exertion: 2 },
  "reverse-wrist-curls": { posture: "SEATED", discreet: false, exertion: 2 },
};
