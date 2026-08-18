"use client";

import { useState, useTransition } from "react";
import { Video } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { primaryButtonClasses } from "@/components/buttons";
import { MENTAL_CONCERN_META } from "@/lib/concerns";
import { INSTANT_DURATIONS } from "@/lib/onboarding-options";
import { SCALE_LABELS } from "@/lib/intensity";
import { buildInstantRoutine } from "@/app/actions/instant";
import type { IntensityScale } from "@/generated/prisma/client";

export type ConcernChoice = {
  slug: string;
  name: string;
  stateLabel: string;
  scale: IntensityScale;
};

type Tab = "body" | "mind";

export function NowClient({
  physical,
  mental,
  defaultMinutes,
  presetSlug,
}: {
  physical: ConcernChoice[];
  mental: ConcernChoice[];
  defaultMinutes: number;
  /** Pre-selected concern, e.g. arriving from a check-in or a push nudge. */
  presetSlug?: string;
}) {
  const presetIsMental = mental.some((c) => c.slug === presetSlug);
  const [tab, setTab] = useState<Tab>(presetIsMental ? "mind" : "body");
  const [selected, setSelected] = useState<string[]>(presetSlug ? [presetSlug] : []);
  const [intensity, setIntensity] = useState(5);
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [discreet, setDiscreet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const all = [...physical, ...mental];
  const options = tab === "body" ? physical : mental;

  // The slider speaks in the scale of whatever was picked first.
  const leadScale = all.find((c) => c.slug === selected[0])?.scale ?? "TENSION";
  const labels = SCALE_LABELS[leadScale];

  function toggle(slug: string) {
    setSelected((s) => (s.includes(slug) ? s.filter((k) => k !== slug) : [...s, slug]));
  }

  function submit() {
    if (selected.length === 0 || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await buildInstantRoutine({
        concernSlugs: selected,
        intensity,
        minutes,
        discreet,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <h1 className="font-display text-2xl">How are you right now?</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Pick what&apos;s bothering you and we&apos;ll build a routine for it.
      </p>

      <div className="mt-5 flex rounded-full border border-mist bg-white/60 p-1">
        {(["body", "mind"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-moss text-white" : "text-ink-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "body" ? (
        <>
          <div className="mt-5 flex justify-center">
            <BodyMap selected={selected} onToggle={toggle} size={140} />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {options.map((c) => (
              <button
                key={c.slug}
                onClick={() => toggle(c.slug)}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  selected.includes(c.slug)
                    ? "border-clay bg-[#F3E2D6] text-[#8C4C2C]"
                    : "border-mist bg-white/50 text-ink-soft"
                }`}
              >
                {c.stateLabel || c.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {options.map((c) => {
            const Icon = MENTAL_CONCERN_META[c.slug]?.icon;
            const isSelected = selected.includes(c.slug);
            return (
              <button
                key={c.slug}
                onClick={() => toggle(c.slug)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${
                  isSelected ? "border-moss bg-card shadow-sm" : "border-mist bg-white/50"
                }`}
              >
                {Icon && <Icon size={19} className={isSelected ? "text-moss" : "text-ink-soft/70"} />}
                <span className="text-sm font-medium">{c.stateLabel || c.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <>
          <div className="mt-6 rounded-2xl border border-mist bg-card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft/80">{labels.low}</span>
              <span className="font-mono font-medium text-clay">{intensity}/10</span>
              <span className="text-ink-soft/80">{labels.high}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="mt-3 w-full accent-moss"
              aria-label={labels.prompt}
            />
          </div>

          <p className="mt-6 text-sm font-medium">How long have you got?</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {INSTANT_DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setMinutes(d.minutes)}
                className={`rounded-2xl border py-3 text-sm font-medium transition-colors ${
                  minutes === d.minutes
                    ? "border-moss bg-card shadow-sm text-moss-deep"
                    : "border-mist bg-white/50 text-ink-soft"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* A hard constraint, not a preference: nothing that needs the floor
              or looks odd on camera can be suggested when this is on. */}
          <button
            onClick={() => setDiscreet((d) => !d)}
            className={`mt-4 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              discreet ? "border-moss bg-card shadow-sm" : "border-mist bg-white/50"
            }`}
          >
            <Video size={17} className={discreet ? "text-moss" : "text-ink-soft/70"} />
            <div className="grow">
              <p className="text-sm font-medium">I&apos;m at my desk or on a call</p>
              <p className="text-xs text-ink-soft/80">Only routines nobody will notice</p>
            </div>
            <span
              className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${
                discreet ? "bg-moss" : "bg-mist"
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                  discreet ? "translate-x-4" : ""
                }`}
              />
            </span>
          </button>

          {error && <p className="mt-4 text-sm text-clay">{error}</p>}

          <button
            onClick={submit}
            disabled={isPending}
            className={primaryButtonClasses("mt-6 w-full")}
          >
            {isPending ? "Building your routine…" : "Build my routine"}
          </button>
        </>
      )}
    </div>
  );
}
