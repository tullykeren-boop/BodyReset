import { prisma } from "@/lib/prisma";
import { getOrCreateDailyPlan } from "@/lib/daily-plan-generator";
import { exerciseCountForMinutes, scoreExercises, pickTop } from "@/lib/daily-plan-generator";

/**
 * Creates a one-off, coach-suggested session for right now, scored against
 * either the named focus area (if it matches one of the user's known body
 * areas) or, failing that, all of the user's profile pain areas.
 */
export async function createAdHocSession(
  userId: string,
  { focus, durationMinutes }: { focus: string; durationMinutes: number }
) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { painAreas: { include: { bodyArea: true } } },
  });
  if (!profile) throw new Error("Cannot suggest a session before onboarding is complete");

  const matchedArea = await prisma.bodyArea.findFirst({
    where: { name: { equals: focus, mode: "insensitive" } },
  });

  const bodyAreaIds = matchedArea
    ? [matchedArea.id]
    : profile.painAreas.map((p) => p.bodyAreaId);

  const bodyAreaMuscleGroups = await prisma.bodyAreaMuscleGroup.findMany({
    where: { bodyAreaId: { in: bodyAreaIds } },
  });
  const weightByMuscleGroupId = new Map(bodyAreaMuscleGroups.map((l) => [l.muscleGroupId, l.weight]));
  const muscleGroupIds = [...weightByMuscleGroupId.keys()];

  const candidates = await prisma.exercise.findMany({
    where: { muscleGroups: { some: { muscleGroupId: { in: muscleGroupIds } } } },
    include: { muscleGroups: true },
  });

  const count = exerciseCountForMinutes(durationMinutes);
  const scored = scoreExercises(candidates, weightByMuscleGroupId, profile.goal, [], new Set());
  const selected = pickTop(scored, count);

  if (selected.length === 0) {
    throw new Error("No exercises matched this suggestion");
  }

  const dailyPlan = await getOrCreateDailyPlan(userId);

  const session = await prisma.plannedSession.create({
    data: {
      dailyPlanId: dailyPlan.id,
      slot: "ADHOC",
      title: `${matchedArea?.name ?? focus} Release`,
      focusLabel: matchedArea?.name ?? focus,
      durationMinutes,
      exercises: {
        create: selected.map((exercise, index) => ({
          exerciseId: exercise.id,
          order: index,
          durationSeconds: exercise.durationSeconds,
        })),
      },
    },
  });

  return session;
}
