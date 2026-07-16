import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateStreak } from "@/lib/streaks";
import { TargetAreaIcon } from "@/components/target-area-icon";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const ISSUE_LABELS: Record<string, string> = {
  PAIN: "Pain",
  STIFFNESS: "Stiffness",
  WEAKNESS: "Weakness",
  MOBILITY: "Mobility",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const completedRoutines = await prisma.routine.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    include: { targetArea: true, exercises: true },
  });

  const streak = calculateStreak(completedRoutines.map((r) => r.completedAt as Date));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = completedRoutines.filter(
    (r) => (r.completedAt as Date) >= oneWeekAgo
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-neutral-500">Here&apos;s your progress so far.</p>
        </div>
        <Link
          href="/target-area"
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          New routine
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200 p-5 text-center dark:border-neutral-800">
          <p className="text-3xl font-semibold">
            {streak}
            <span className="text-lg">🔥</span>
          </p>
          <p className="mt-1 text-sm text-neutral-500">Day streak</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5 text-center dark:border-neutral-800">
          <p className="text-3xl font-semibold">{thisWeekCount}</p>
          <p className="mt-1 text-sm text-neutral-500">This week</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5 text-center dark:border-neutral-800">
          <p className="text-3xl font-semibold">{completedRoutines.length}</p>
          <p className="mt-1 text-sm text-neutral-500">Total routines</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-medium">Past routines</h2>
      {completedRoutines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500 dark:border-neutral-700">
          You haven&apos;t completed a routine yet.{" "}
          <Link href="/target-area" className="font-medium text-teal-700 hover:underline dark:text-teal-400">
            Start your first one
          </Link>
          .
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {completedRoutines.map((routine) => (
            <li key={routine.id}>
              <Link
                href={`/routine/${routine.id}`}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4 transition hover:border-teal-500 hover:bg-teal-50 dark:border-neutral-800 dark:hover:border-teal-600 dark:hover:bg-teal-950/40"
              >
                <TargetAreaIcon slug={routine.targetArea.slug} className="text-2xl" />
                <div className="flex-1">
                  <p className="font-medium">{routine.targetArea.name}</p>
                  <p className="text-sm text-neutral-500">
                    {ISSUE_LABELS[routine.issueType]} · {routine.exercises.length} exercises ·{" "}
                    {Math.round(routine.totalDurationSeconds / 60)} min
                  </p>
                </div>
                <span className="shrink-0 text-sm text-neutral-500">
                  {dateFormatter.format(routine.completedAt as Date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
