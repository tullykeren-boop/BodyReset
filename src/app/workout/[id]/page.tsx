import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { markRoutineStarted } from "@/app/actions/workout";
import { WorkoutPlayer } from "./workout-player";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const routine = await prisma.routine.findUnique({
    where: { id },
    include: {
      targetArea: true,
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
    },
  });

  if (!routine || routine.userId !== user.id) notFound();

  await markRoutineStarted(routine.id);

  const exercises = routine.exercises.map((re) => ({
    id: re.id,
    name: re.exercise.name,
    description: re.exercise.description,
    instructions: re.exercise.instructions,
    durationSeconds: re.durationSeconds,
  }));

  return (
    <WorkoutPlayer
      routineId={routine.id}
      targetAreaName={routine.targetArea.name}
      exercises={exercises}
    />
  );
}
