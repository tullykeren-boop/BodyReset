import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { markSessionStarted } from "@/app/actions/session";
import { canStartSession } from "@/lib/billing";
import { FREE_SESSIONS_PER_WEEK } from "@/lib/plans";
import { PhoneFrame } from "@/components/phone-frame";
import { primaryButtonClasses } from "@/components/buttons";
import { SessionExperience } from "./session-experience";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const session = await prisma.plannedSession.findUnique({
    where: { id },
    include: {
      dailyPlan: true,
      items: { include: { practice: true }, orderBy: { order: "asc" } },
      concerns: { include: { concern: true }, orderBy: { rank: "asc" } },
      feedback: true,
    },
  });

  if (!session || session.dailyPlan.userId !== user.id) notFound();

  const isFreshStart = !session.startedAt && !session.completedAt;
  if (isFreshStart) {
    const check = await canStartSession(user.id, user.subscription);
    if (!check.allowed) {
      return (
        <PhoneFrame>
          <div className="flex h-full flex-col items-center justify-center bg-paper px-6 text-center">
            <p className="font-display text-2xl">You&apos;ve used your free routines this week</p>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Free accounts get {FREE_SESSIONS_PER_WEEK} guided routines a week. Upgrade to Personal
              for unlimited routines and the full AI coach.
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

  const practices = session.items.map((item) => ({
    id: item.id,
    slug: item.practice.slug,
    name: item.practice.name,
    instructions: item.practice.instructions,
    durationSeconds: item.durationSeconds,
    modality: item.practice.modality,
    breathPattern: item.practice.breathPattern,
  }));

  // The dominant concern decides which scale the before/after slider speaks in:
  // "Calm -> Overwhelmed" for a stress routine, "Fine -> Painful" for a physical one.
  const scale = session.concerns[0]?.concern.scale ?? "PAIN";

  return (
    <PhoneFrame>
      <SessionExperience
        sessionId={session.id}
        title={session.title}
        focusLabel={session.focusLabel}
        practices={practices}
        scale={scale}
        alreadyCompleted={Boolean(session.completedAt)}
      />
    </PhoneFrame>
  );
}
