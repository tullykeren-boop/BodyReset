import { prisma } from "@/lib/prisma";
import type { IssueType } from "@/generated/prisma/client";

export { TIME_OPTIONS, ISSUE_TYPE_OPTIONS } from "@/lib/intake-options";
export type { TimeOption } from "@/lib/intake-options";

function exerciseCountForTime(minutes: number): number {
  if (minutes <= 5) return 3;
  if (minutes <= 10) return 4;
  if (minutes <= 15) return 5;
  return 6;
}

/**
 * Scores exercises against a target area's muscle groups and the user's issue type,
 * then picks the top N (N derived from time available) to build a routine.
 */
export async function generateRoutineForUser({
  userId,
  targetAreaId,
  issueType,
  timeAvailableMinutes,
}: {
  userId: string;
  targetAreaId: string;
  issueType: IssueType;
  timeAvailableMinutes: number;
}) {
  const targetAreaMuscleGroups = await prisma.targetAreaMuscleGroup.findMany({
    where: { targetAreaId },
  });

  if (targetAreaMuscleGroups.length === 0) {
    throw new Error("This target area has no associated muscle groups yet");
  }

  const weightByMuscleGroupId = new Map(
    targetAreaMuscleGroups.map((tamg) => [tamg.muscleGroupId, tamg.weight])
  );
  const muscleGroupIds = [...weightByMuscleGroupId.keys()];

  const candidates = await prisma.exercise.findMany({
    where: {
      muscleGroups: { some: { muscleGroupId: { in: muscleGroupIds } } },
    },
    include: { muscleGroups: true },
  });

  const scored = candidates.map((exercise) => {
    let score = 0;
    for (const link of exercise.muscleGroups) {
      const areaWeight = weightByMuscleGroupId.get(link.muscleGroupId);
      if (!areaWeight) continue;
      const primaryBonus = areaWeight === 1 ? 3 : 1;
      const exerciseBonus = link.isPrimary ? 2 : 1;
      score += primaryBonus * exerciseBonus;
    }
    if (exercise.issueTypes.includes(issueType)) {
      score += 4;
    }
    // Small random jitter so the same inputs don't always produce an identical
    // routine, while still favoring genuinely well-matched exercises.
    score += Math.random() * 0.5;
    return { exercise, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const count = exerciseCountForTime(timeAvailableMinutes);
  const selected = scored.slice(0, count).map((s) => s.exercise);

  if (selected.length === 0) {
    throw new Error("No exercises matched this target area");
  }

  const totalDurationSeconds = selected.reduce((sum, ex) => sum + ex.durationSeconds, 0);

  const routine = await prisma.routine.create({
    data: {
      userId,
      targetAreaId,
      issueType,
      timeAvailableMinutes,
      totalDurationSeconds,
      exercises: {
        create: selected.map((exercise, index) => ({
          exerciseId: exercise.id,
          order: index,
          durationSeconds: exercise.durationSeconds,
        })),
      },
    },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      targetArea: true,
    },
  });

  return routine;
}
