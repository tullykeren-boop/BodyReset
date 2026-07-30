import { prisma } from "@/lib/prisma";

type BodyAreaRef = { slug: string; name: string };
type ExerciseMuscleGroupLink = { muscleGroupId: string; isPrimary: boolean };

/**
 * Map of muscleGroupId -> the body area it's the *primary* driver for
 * (BodyAreaMuscleGroup.weight === 1). Used to derive an exercise's primary
 * body area from its muscle groups.
 */
export async function getBodyAreaByMuscleGroupId(): Promise<Map<string, BodyAreaRef>> {
  const primaryLinks = await prisma.bodyAreaMuscleGroup.findMany({
    where: { weight: 1 },
    include: { bodyArea: true },
  });
  return new Map(primaryLinks.map((l) => [l.muscleGroupId, l.bodyArea]));
}

/**
 * The body area an exercise is primarily "for", derived from its primary
 * muscle group (falling back to its first muscle group if none is flagged
 * primary).
 */
export function getPrimaryBodyArea(
  exercise: { muscleGroups: ExerciseMuscleGroupLink[] },
  bodyAreaByMuscleGroupId: Map<string, BodyAreaRef>
): BodyAreaRef | null {
  const primaryLink = exercise.muscleGroups.find((l) => l.isPrimary) ?? exercise.muscleGroups[0];
  if (!primaryLink) return null;
  return bodyAreaByMuscleGroupId.get(primaryLink.muscleGroupId) ?? null;
}
