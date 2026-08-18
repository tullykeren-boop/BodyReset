import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock, Flame, TrendingUp, Building2, ChevronRight, Play, Sparkles, BellRing } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateDailyPlan } from "@/lib/daily-plan-generator";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { deriveSessionStatuses, splitSessions } from "@/lib/session-status";
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
  const { planned, adHoc } = splitSessions(plan.sessions);
  const doneCount = planned.filter((s) => s.completedAt).length;
  const { activity } = stats;

  return (
    <div className="px-5 pb-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft/80">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
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

      {/* Daily activity: one additive number against a goal, rather than an
          opaque 0-100 blend nobody could act on. */}
      <div className="mt-6 rounded-3xl bg-ink p-5 text-paper">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#9FB3A2]">Today&apos;s reset points</p>
            <p className="font-display mt-1 text-4xl">
              {activity.points}
              <span className="ml-1 text-lg text-[#9FB3A2]">/ {activity.goal}</span>
            </p>
          </div>
          <ActivityRing pct={activity.pct} goalMet={activity.goalMet} />
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${activity.goalMet ? "bg-[#8FBBA0]" : "bg-sand"}`}
            style={{ width: `${activity.pct}%` }}
          />
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-[#B7C0B8]">
          <span className="flex items-center gap-1">
            <Flame size={13} className="text-sand" /> {stats.streak}-day streak
          </span>
          <span className="flex items-center gap-1">
            <Check size={13} className="text-[#8FBBA0]" /> {doneCount} of {planned.length} planned
          </span>
        </div>
      </div>

      {/* The instant-routine entry point sits above the plan on purpose: it is
          the answer to how you feel now, not how you felt at onboarding. */}
      <Link
        href="/now"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-moss bg-card p-4 shadow-sm"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4EAE1]">
          <Sparkles size={18} className="text-moss-deep" />
        </div>
        <div className="grow">
          <p className="font-medium">How are you right now?</p>
          <p className="text-xs text-ink-soft/80">Get a routine for exactly how you feel</p>
        </div>
        <ChevronRight size={16} className="text-ink-soft/60" />
      </Link>

      <CheckInWidget initialMood={todaysCheckIn?.mood ?? null} />

      <h2 className="font-display mt-7 text-lg">Today&apos;s Plan</h2>
      <div className="mt-3 space-y-3">
        {planned.map((session) => {
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
                  <Clock
                    size={17}
                    className={status === "current" ? "text-clay" : "text-ink-soft/70"}
                  />
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
                  aria-label={`Start ${session.title}`}
                >
                  <Play size={14} fill="currentColor" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Ad-hoc resets are listed separately rather than competing with the
          plan for the "Now" badge. */}
      {adHoc.length > 0 && (
        <>
          <h2 className="font-display mt-7 text-lg">Today&apos;s Resets</h2>
          <div className="mt-3 space-y-3">
            {adHoc.map((session) => (
              <Link
                key={session.id}
                href={`/session/${session.id}`}
                className="flex items-center gap-4 rounded-2xl border border-mist bg-white/60 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper">
                  {session.completedAt ? (
                    <Check size={18} className="text-moss-deep" />
                  ) : (
                    <Play size={15} className="text-ink-soft/70" fill="currentColor" />
                  )}
                </div>
                <div className="grow">
                  <p className="font-medium">{session.title}</p>
                  <p className="text-xs text-ink-soft/80">
                    {session.durationMinutes} min · {session.focusLabel}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-7 rounded-2xl border border-mist bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">This week&apos;s progress</p>
          <TrendingUp size={16} className="text-moss" />
        </div>
        {stats.burdenTrend.length >= 2 ? (
          <>
            <p className="mt-1 text-xs text-ink-soft/80">
              How you&apos;ve been feeling, from your check-ins and feedback
            </p>
            <Sparkline data={stats.burdenTrend} width={280} height={60} />
          </>
        ) : (
          <p className="mt-1 text-xs text-ink-soft/80">
            Log a check-in or finish a routine to start seeing your trend.
          </p>
        )}
      </div>

      <Link
        href="/reminders"
        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-mist bg-card p-4 text-left text-sm text-ink-soft"
      >
        <span className="flex items-center gap-2">
          <BellRing size={15} className="text-moss" /> Movement reminders
        </span>
        <ChevronRight size={15} />
      </Link>

      <Link
        href="/team"
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-dashed border-[#C8D0C4] p-4 text-left text-sm text-ink-soft"
      >
        <span className="flex items-center gap-2">
          <Building2 size={15} /> Preview: Team dashboard (B2B, coming soon)
        </span>
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}

function ActivityRing({ pct, goalMet }: { pct: number; goalMet: boolean }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="absolute -rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={goalMet ? "#8FBBA0" : "#D3A05C"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
        />
      </svg>
      <span className="font-mono text-xs">{pct}%</span>
    </div>
  );
}
