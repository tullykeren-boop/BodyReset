export type GoalSeed =
  | "REDUCE_PAIN"
  | "PREVENT"
  | "MOBILITY"
  | "ENERGY"
  | "REDUCE_STRESS"
  | "IMPROVE_FOCUS"
  | "LIFT_MOOD";

export type DifficultySeed = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ConcernKindSeed = "PHYSICAL" | "MENTAL";

export type IntensityScaleSeed = "PAIN" | "STRESS" | "TENSION" | "ENERGY" | "FOCUS" | "MOOD";

export type ModalitySeed =
  | "MOVEMENT"
  | "BREATHWORK"
  | "GAZE"
  | "SOMATIC"
  | "COGNITIVE"
  | "MINDFULNESS";

export type PostureSeed = "SEATED" | "STANDING" | "FLOOR" | "ANY";

export type ConcernSeed = {
  slug: string;
  name: string;
  description: string;
  kind: ConcernKindSeed;
  sortOrder: number;
  stateLabel: string;
  scale: IntensityScaleSeed;
};

export type MechanismSeed = {
  slug: string;
  name: string;
  description: string;
};

/** weight is 0-100: how relevant this mechanism is to the concern. 100 = core driver. */
export type ConcernMechanismSeed = {
  concern: string;
  mechanism: string;
  weight: number;
};

export type PracticeSeed = {
  slug: string;
  name: string;
  description: string;
  instructions: string;
  difficulty: DifficultySeed;
  durationSeconds: number;
  equipment: string;
  goals: GoalSeed[];
  /** weight is 0-100: how strongly this practice acts on the mechanism. */
  mechanisms: { slug: string; weight: number }[];
  modality?: ModalitySeed;
  posture?: PostureSeed;
  discreet?: boolean;
  exertion?: number;
  breathPattern?: string;
};

/**
 * Sparse signed override on top of mechanism routing. Positive pins a practice
 * to a concern that routing alone scores too weakly; a large negative excludes
 * one that routing would otherwise surface.
 */
export type PracticeConcernSeed = {
  practice: string;
  concern: string;
  weight: number;
};
