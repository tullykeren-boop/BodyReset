import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function formatDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  return `${minutes} min`;
}

export default async function RoutineOverviewPage({
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
          {routine.targetArea.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your routine is ready</h1>
        <p className="mt-2 text-neutral-500">
          {routine.exercises.length} exercises · {formatDuration(routine.totalDurationSeconds)}
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {routine.exercises.map((re, index) => (
          <li
            key={re.id}
            className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium">{re.exercise.name}</p>
              <p className="text-sm text-neutral-500">{re.exercise.description}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-neutral-500">
              {re.durationSeconds}s
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Link
          href={`/workout/${routine.id}`}
          className="rounded-full bg-teal-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-700"
        >
          Start workout
        </Link>
        <Link href="/target-area" className="text-sm text-neutral-500 hover:underline">
          Choose a different area
        </Link>
      </div>
    </div>
  );
}
