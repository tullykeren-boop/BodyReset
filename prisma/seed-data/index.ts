import { physicalPractices } from "./practices-physical";
import { mentalPractices } from "./practices-mental";
import { PHYSICAL_PRACTICE_META } from "./practice-meta";
import type { PracticeSeed } from "./types";

export { concerns, mechanisms, concernMechanisms } from "./concerns";
export { practiceConcerns } from "./practice-concerns";
export * from "./types";

/**
 * The full practice catalog. The original physical practices get their posture,
 * discreetness and exertion from the metadata overlay; mental practices declare
 * theirs inline.
 */
export const practices: PracticeSeed[] = [
  ...physicalPractices.map((practice) => {
    const meta = PHYSICAL_PRACTICE_META[practice.slug];
    if (!meta) {
      throw new Error(`No metadata for physical practice "${practice.slug}"`);
    }
    return { ...practice, modality: meta.modality ?? "MOVEMENT", ...meta } satisfies PracticeSeed;
  }),
  ...mentalPractices,
];
