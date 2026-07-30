import Link from "next/link";
import { Building2, CircleCheck, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { BreathRing } from "@/components/breath-ring";
import { Sparkline } from "@/components/sparkline";
import { Tag } from "@/components/tag";
import { primaryButtonClasses, ghostButtonClasses } from "@/components/buttons";

const EXAMPLE_SESSIONS = [
  { title: "Morning Reset", focus: "Neck + shoulders", duration: 3 },
  { title: "Midday Recovery", focus: "Upper back + posture", duration: 5 },
  { title: "End of Day Reset", focus: "Full body recovery", duration: 7 },
];

const WEEKLY_TREND = [7, 6.5, 6, 6.2, 5, 4.5, 4];

export default async function Home() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Go to your dashboard" : "Start Your Recovery Plan";

  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <BreathRing size={30} />
          <span className="font-display text-xl tracking-tight">ReSet</span>
        </div>
        <nav className="hidden gap-8 text-sm text-ink-soft md:flex">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#routines" className="hover:text-ink">Routines</a>
          <a href="#teams" className="hover:text-ink">For teams</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
        </nav>
        <Link href={user ? "/dashboard" : "/login"} className={ghostButtonClasses("!px-4 !py-2 text-sm")}>
          {user ? "Dashboard" : "Sign in"}
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden px-6 pb-20 pt-10 md:grid-cols-2 md:pt-16">
        <div>
          <Tag>AI-powered recovery coach</Tag>
          <h1 className="font-display mt-5 text-[2.6rem] leading-[1.08] tracking-tight md:text-[3.4rem]">
            Recover Better.
            <br />
            Work Better.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Your AI-powered recovery coach that helps you prevent and relieve workday pain in just a
            few minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={ctaHref} className={primaryButtonClasses()}>
              {ctaLabel}
            </Link>
            <a href="#how" className="text-sm font-medium text-moss-deep underline decoration-mist underline-offset-4">
              See how it works
            </a>
          </div>
          <p className="mt-6 text-xs text-ink-soft/70">No credit card. Your first plan takes under 90 seconds to build.</p>
        </div>
        <div className="relative flex items-center justify-center">
          <BreathRing size={340} className="opacity-70" />
          <div className="absolute w-[230px] rounded-[2rem] border border-mist bg-card p-5 shadow-[0_30px_60px_-20px_rgba(28,35,33,0.25)]">
            <p className="font-display text-sm text-ink-soft">Midday Recovery</p>
            <p className="font-display text-lg">Upper back + posture</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft/80">
              <Clock size={13} /> 5 minutes · 4 exercises
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-paper">
              <div className="h-1.5 w-3/5 rounded-full bg-moss" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-mist bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-[#8C4C2C]">The problem</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl leading-tight">
            You know sitting is hurting you. You just don&apos;t have time to fix it.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["Recurring pain", "Neck, shoulders, upper back, lower back, wrists, hips — it builds quietly through every meeting."],
              ["No time for workouts", "A 45-minute class isn't happening between calls. You need minutes, not hours."],
              ["No idea what actually helps", "Generic stretch videos aren't built for your body or your specific pain."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="font-display text-lg">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-moss-deep">How ReSet works</p>
        <h2 className="font-display mt-3 max-w-xl text-3xl leading-tight">
          A recovery plan that fits inside your actual workday.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-4">
          {[
            ["Tell us your day", "Your schedule, your pain areas, and how much time you can give."],
            ["Get a personalized plan", "Three short sessions, timed to your morning, midday, and evening."],
            ["Follow a guided session", "Timed instructions, 3-10 minutes, no equipment needed."],
            ["See what's working", "Rate how you feel before and after — your plan adapts as you go."],
          ].map(([t, d], i) => (
            <div key={t} className="border-t-2 border-moss pt-4">
              <span className="font-mono text-xs text-ink-soft/80">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display mt-2 text-lg">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example routines */}
      <section id="routines" className="bg-ink py-20 text-paper">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-[#9FB3A2]">Example routines</p>
          <h2 className="font-display mt-3 max-w-xl text-3xl leading-tight">
            Short. Specific. Built for a desk, not a gym.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {EXAMPLE_SESSIONS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2 text-xs text-[#9FB3A2]">
                  <Clock size={13} /> {s.duration} minutes
                </div>
                <h3 className="font-display mt-3 text-xl">{s.title}</h3>
                <p className="mt-1 text-sm text-[#B7C0B8]">{s.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-moss-deep">Why it works</p>
            <h2 className="font-display mt-3 text-3xl leading-tight">
              Built around minutes you already have, not minutes you have to find.
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                "Sessions as short as 3 minutes — fits between meetings",
                "Personalized to your specific pain areas, not generic content",
                "Tracks how you actually feel, before and after every session",
                "An AI coach that reacts to how your day is going",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-ink-soft">
                  <CircleCheck size={19} className="mt-0.5 shrink-0 text-moss" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-mist bg-card p-8">
            <p className="font-display text-sm text-ink-soft">Neck discomfort, 3-week trend</p>
            <p className="font-display mt-1 text-3xl">Improved 35%</p>
            <Sparkline data={WEEKLY_TREND} width={280} height={80} />
          </div>
        </div>
      </section>

      {/* Team / B2B */}
      <section id="teams" className="border-y border-mist bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-6 md:flex md:items-center md:justify-between md:gap-10">
          <div className="max-w-md">
            <p className="font-display flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#8A6423]">
              <Building2 size={15} /> For teams
            </p>
            <h2 className="font-display mt-3 text-3xl leading-tight">Bring ReSet to your whole team.</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Give every employee a personal recovery coach, and give HR aggregate, anonymized
              wellbeing trends — never individual health data.
            </p>
            <a href="mailto:teams@resetapp.com" className={ghostButtonClasses("mt-6")}>
              Talk to us about ReSet for Teams
            </a>
          </div>
          <div className="mt-10 grid grow grid-cols-2 gap-4 md:mt-0">
            {[
              ["84%", "Employee participation"],
              ["+22%", "Engagement this quarter"],
              ["6", "Departments onboarded"],
              ["0", "Individual records shared"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-card p-5">
                <p className="font-display text-2xl">{n}</p>
                <p className="mt-1 text-xs text-ink-soft/80">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-moss-deep">Pricing preview</p>
        <h2 className="font-display mt-3 text-3xl leading-tight">Start free. Upgrade when it&apos;s part of your day.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Free", "$0", "3 guided sessions / week, core body map, weekly progress"],
            ["Personal", "$9/mo", "Unlimited sessions, full AI coach, daily adaptive plan"],
            ["Teams", "Custom", "Everything in Personal + anonymized org dashboard"],
          ].map(([t, p, d], i) => (
            <div
              key={t}
              className={`rounded-3xl border p-7 ${
                i === 1
                  ? "border-moss bg-card shadow-[0_20px_40px_-20px_rgba(28,35,33,0.3)]"
                  : "border-mist bg-white/60"
              }`}
            >
              {i === 1 && <Tag>Most popular</Tag>}
              <h3 className="font-display mt-3 text-xl">{t}</h3>
              <p className="font-display mt-1 text-3xl">{p}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink py-24 text-center text-paper">
        <BreathRing size={90} className="mx-auto opacity-80" />
        <h2 className="font-display mx-auto mt-6 max-w-lg text-3xl leading-tight">
          Your body has been waiting for a break. Give it three minutes.
        </h2>
        <div className="mt-8">
          <Link href={ctaHref} className={primaryButtonClasses()}>
            {ctaLabel}
          </Link>
        </div>
      </section>

      <footer className="bg-ink pb-10 text-center text-xs text-[#6E7A70]">
        © 2026 ReSet. All rights reserved.
      </footer>
    </div>
  );
}
