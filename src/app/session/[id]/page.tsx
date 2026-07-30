import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { markSessionStarted } from "@/app/actions/session";
import { canStartSession } from "@/lib/billing";
import { FREE_SESSIONS_PER_WEEK } from "@/lib/plans";
import { getBodyAreaByMuscleGroupId, getPrimaryBodyArea } from "@/lib/exercise-body-area";
import { PhoneFrame } from "@/components/phone-frame";
import { primaryButtonClasses } from "@/components/buttons";
import { SessionExperience } from "./session-experience";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [session, bodyAreaByMuscleGroupId] = await Promise.all([
    prisma.plannedSession.findUnique({
      where: { id },
      include: {
        dailyPlan: true,
        exercises: { include: { exercise: { include: { muscleGroups: true } } }, orderBy: { order: "asc" } },
        feedback: true,
      },
    }),
    getBodyAreaByMuscleGroupId(),
  ]);

  if (!session || session.dailyPlan.userId !== user.id) notFound();

  const isFreshStart = !session.startedAt && !session.completedAt;
  if (isFreshStart) {
    const check = await canStartSession(user.id, user.subscription);
    if (!check.allowed) {
      return (
        <PhoneFrame>
          <div className="flex h-full flex-col items-center justify-center bg-paper px-6 text-center">
            <p className="font-display text-2xl">You&apos;ve used your free sessions this week</p>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Free accounts get {FREE_SESSIONS_PER_WEEK} guided sessions a week. Upgrade to Personal
              for unlimited sessions and the full AI coach.
            </p>
            <Link href="/billing" className={primaryButtonClasses("mt-8")}>
              See plans
            </Link>
          </div>
        </PhoneFrame>
      );
    }
  }

  await markSessionStarted(session.id);

  const exercises = session.exercises.map((se) => ({
    id: se.id,
    name: se.exercise.name,
    instructions: se.exercise.instructions,
    durationSeconds: se.durationSeconds,
    bodyAreaSlug: getPrimaryBodyArea(se.exercise, bodyAreaByMuscleGroupId)?.slug ?? "",
  }));

  return (
    <PhoneFrame>
      <SessionExperience
        sessionId={session.id}
        title={session.title}
        focusLabel={session.focusLabel}
        exercises={exercises}
        alreadyCompleted={Boolean(session.completedAt)}
      />
    </PhoneFrame>
  );
}
