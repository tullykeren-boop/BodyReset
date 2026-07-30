import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock, Flame, TrendingUp, Building2, ChevronRight, Play } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateDailyPlan } from "@/lib/daily-plan-generator";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { deriveSessionStatuses } from "@/lib/session-status";
import { BreathRing } from "@/components/breath-ring";
import { Sparkline } from "@/components/sparkline";
import { Tag } from "@/components/tag";
import { CheckInWidget } from "@/components/checkin-widget";

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [plan, stats, todaysCheckIn] = await Promise.all([
    getOrCreateDailyPlan(user.id),
    getDashboardStats(user.id),
    prisma.checkIn.findUnique({
      where: { userId_date: { userId: user.id, date: startOfUtcDay(new Date()) } },
    }),
  ]);

  const statuses = deriveSessionStatuses(plan.sessions);
  const doneCount = plan.sessions.filter((s) => s.completedAt).length;

  return (
    <div className="px-5 pb-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft/80">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-2xl">
            Good {new Date().getHours() < 18 ? "day" : "evening"}
            {user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDE6DC] font-display text-moss-deep">
          {(user.name ?? user.email)[0].toUpperCase()}
        </div>
      </div>

      {/* Recovery score */}
      <div className="mt-6 rounded-3xl bg-ink p-5 text-paper">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#9FB3A2]">Daily recovery score</p>
            <p className="font-display mt-1 text-4xl">{stats.recoveryScore}</p>
          </div>
          <BreathRing size={64} />
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-[#B7C0B8]">
          <span className="flex items-center gap-1">
            <Flame size={13} className="text-sand" /> {stats.streak}-day streak
          </span>
          <span className="flex items-center gap-1">
            <Check size={13} className="text-[#8FBBA0]" /> {doneCount} of {plan.sessions.length} sessions done
          </span>
        </div>
      </div>

      <CheckInWidget initialMood={todaysCheckIn?.mood ?? null} />

      {/* Today's plan */}
      <h2 className="font-display mt-7 text-lg">Today&apos;s Recovery Plan</h2>
      <div className="mt-3 space-y-3">
        {plan.sessions.map((session) => {
          const status = statuses.get(session.id);
          return (
            <div
              key={session.id}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${
                status === "current" ? "border-moss bg-card shadow-sm" : "border-mist bg-white/60"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  status === "done"
                    ? "bg-[#E4EAE1]"
                    : status === "current"
                      ? "bg-[#F3E2D6]"
                      : "bg-paper"
                }`}
              >
                {status === "done" ? (
                  <Check size={18} className="text-moss-deep" />
                ) : (
                  <Clock size={17} className={status === "current" ? "text-clay" : "text-ink-soft/70"} />
                )}
              </div>
              <div className="grow">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{session.title}</p>
                  {status === "current" && <Tag tone="clay">Now</Tag>}
                  {status === "skipped" && <Tag>Skipped</Tag>}
                </div>
                <p className="text-xs text-ink-soft/80">
                  {session.durationMinutes} min · {session.focusLabel}
                </p>
              </div>
              {status === "current" && (
                <Link
                  href={`/session/${session.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-moss text-white"
                >
                  <Play size={14} fill="currentColor" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly progress teaser */}
      <div className="mt-7 rounded-2xl border border-mist bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">This week&apos;s progress</p>
          <TrendingUp size={16} className="text-moss" />
        </div>
        {stats.discomfortTrend.length >= 2 ? (
          <>
            <p className="mt-1 text-xs text-ink-soft/80">Discomfort trend from your check-ins and feedback</p>
            <Sparkline data={stats.discomfortTrend} width={280} height={60} />
          </>
        ) : (
          <p className="mt-1 text-xs text-ink-soft/80">
            Log a check-in or finish a session to start seeing your trend.
          </p>
        )}
      </div>

      <Link
        href="/team"
        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-dashed border-[#C8D0C4] p-4 text-left text-sm text-ink-soft"
      >
        <span className="flex items-center gap-2">
          <Building2 size={15} /> Preview: Team dashboard (B2B, coming soon)
        </span>
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}
