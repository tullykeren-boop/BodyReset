"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { BreathRing } from "@/components/breath-ring";
import { BodyMap } from "@/components/body-map";
import { primaryButtonClasses } from "@/components/buttons";
import { WORKDAY_TYPES, TIME_OPTIONS, GOALS } from "@/lib/onboarding-options";
import { MENTAL_CONCERN_META } from "@/lib/concerns";
import { completeOnboarding, type OnboardingInput } from "@/app/actions/onboarding";

type ConcernOption = { slug: string; name: string };

type Answers = {
  workdayType: OnboardingInput["workdayType"] | null;
  physical: string[];
  mental: string[];
  time: OnboardingInput["timeAvailableMinutes"] | null;
  goal: OnboardingInput["goal"] | null;
};

const TOTAL_STEPS = 7;
/** Progress dots cover the five question steps, not the welcome or generating screens. */
const QUESTION_STEPS = 5;
const GENERATING_STEP = 6;

export function OnboardingClient({
  physicalConcerns,
  mentalConcerns,
}: {
  physicalConcerns: ConcernOption[];
  mentalConcerns: ConcernOption[];
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    workdayType: null,
    physical: [],
    mental: [],
    time: null,
    goal: null,
  });

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggle = (key: "physical" | "mental", slug: string) =>
    setAnswers((a) => ({
      ...a,
      [key]: a[key].includes(slug) ? a[key].filter((k) => k !== slug) : [...a[key], slug],
    }));

  return (
    <div className="flex min-h-full flex-col px-6 pb-10 pt-8">
      {step > 0 && step < GENERATING_STEP && (
        <div className="mb-8 flex items-center gap-3">
          <button onClick={back} className="text-ink-soft" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="flex grow gap-1.5">
            {Array.from({ length: QUESTION_STEPS }).map((_, i) => (
              <div key={i} className={`h-1 grow rounded-full ${i < step ? "bg-moss" : "bg-mist"}`} />
            ))}
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="flex grow flex-col items-center justify-center text-center">
          <BreathRing size={130} />
          <h1 className="font-display mt-8 text-3xl leading-tight">Welcome to LetReSet</h1>
          <p className="mt-3 max-w-xs text-ink-soft">
            A few quick questions and we&apos;ll build routines around how your body and your head
            actually feel through the day.
          </p>
          <button onClick={next} className={primaryButtonClasses("mt-10")}>
            Let&apos;s begin
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex grow flex-col">
          <h2 className="font-display text-2xl leading-tight">What does your workday look like?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            This helps us time your routines around your real schedule.
          </p>
          <div className="mt-8 space-y-3">
            {WORKDAY_TYPES.map((w) => (
              <button
                key={w.key}
                onClick={() => setAnswers((a) => ({ ...a, workdayType: w.key }))}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  answers.workdayType === w.key
                    ? "border-moss bg-card shadow-sm"
                    : "border-mist bg-white/50"
                }`}
              >
                <p className="font-medium">{w.label}</p>
                <p className="mt-0.5 text-xs text-ink-soft/80">{w.desc}</p>
              </button>
            ))}
          </div>
          <div className="grow" />
          <button
            onClick={next}
            disabled={!answers.workdayType}
            className={primaryButtonClasses("mt-8 w-full")}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex grow flex-col">
          <h2 className="font-display text-2xl leading-tight">
            Where do you usually feel discomfort?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Tap all that apply — or skip if nothing hurts.
          </p>
          <div className="mt-4 flex justify-center">
            <BodyMap
              selected={answers.physical}
              onToggle={(slug) => toggle("physical", slug)}
              size={130}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {physicalConcerns.map((c) => (
              <button
                key={c.slug}
                onClick={() => toggle("physical", c.slug)}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  answers.physical.includes(c.slug)
                    ? "border-clay bg-[#F3E2D6] text-[#8C4C2C]"
                    : "border-mist bg-white/50 text-ink-soft"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="grow" />
          <button onClick={next} className={primaryButtonClasses("mt-8 w-full")}>
            {answers.physical.length === 0 ? "Skip" : "Continue"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex grow flex-col">
          <h2 className="font-display text-2xl leading-tight">
            What tends to get in your way mentally?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            These matter as much as the physical side. Tap all that apply.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {mentalConcerns.map((c) => {
              const meta = MENTAL_CONCERN_META[c.slug];
              const Icon = meta?.icon;
              const selected = answers.mental.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  onClick={() => toggle("mental", c.slug)}
                  className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${
                    selected ? "border-moss bg-card shadow-sm" : "border-mist bg-white/50"
                  }`}
                >
                  {Icon && <Icon size={19} className={selected ? "text-moss" : "text-ink-soft/70"} />}
                  <span className="text-sm font-medium">{c.name}</span>
                </button>
              );
            })}
          </div>
          <div className="grow" />
          <button onClick={next} className={primaryButtonClasses("mt-8 w-full")}>
            {answers.mental.length === 0 ? "Skip" : "Continue"}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex grow flex-col">
          <h2 className="font-display text-2xl leading-tight">How much time can you dedicate?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Per routine — you can always pick a different length in the moment.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setAnswers((a) => ({ ...a, time: t }))}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition-colors ${
                  answers.time === t ? "border-moss bg-card shadow-sm" : "border-mist bg-white/50"
                }`}
              >
                <Clock size={20} className="text-moss" />
                <span className="font-display text-lg">{t}</span>
                <span className="text-xs text-ink-soft/80">min</span>
              </button>
            ))}
          </div>
          <div className="grow" />
          <button
            onClick={next}
            disabled={!answers.time}
            className={primaryButtonClasses("mt-8 w-full")}
          >
            Continue
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex grow flex-col">
          <h2 className="font-display text-2xl leading-tight">What&apos;s your main goal?</h2>
          <p className="mt-2 text-sm text-ink-soft">We&apos;ll shape your routines around this.</p>
          <div className="mt-8 space-y-3">
            {GOALS.map((g) => (
              <button
                key={g.key}
                onClick={() => setAnswers((a) => ({ ...a, goal: g.key }))}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  answers.goal === g.key ? "border-moss bg-card shadow-sm" : "border-mist bg-white/50"
                }`}
              >
                <g.icon size={19} className="text-moss" />
                <span className="font-medium">{g.label}</span>
              </button>
            ))}
          </div>
          <div className="grow" />
          <button
            onClick={next}
            disabled={!answers.goal || answers.physical.length + answers.mental.length === 0}
            className={primaryButtonClasses("mt-8 w-full")}
          >
            Build my plan
          </button>
          {answers.physical.length + answers.mental.length === 0 && (
            <p className="mt-3 text-center text-xs text-clay">
              Go back and pick at least one thing you&apos;d like help with.
            </p>
          )}
        </div>
      )}

      {step === GENERATING_STEP && answers.workdayType && answers.time && answers.goal && (
        <PlanGenerating
          answers={{
            workdayType: answers.workdayType,
            // Physical first: rank 0 is what the scorer leads with, and the
            // body map is the more concrete signal at sign-up.
            concernSlugs: [...answers.physical, ...answers.mental],
            timeAvailableMinutes: answers.time,
            goal: answers.goal,
          }}
        />
      )}
    </div>
  );
}

const GENERATING_MESSAGES = [
  "Analyzing your workday...",
  "Understanding your movement needs...",
  "Creating your routines...",
];

function PlanGenerating({ answers }: { answers: OnboardingInput }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < GENERATING_MESSAGES.length - 1) {
      const t = setTimeout(() => setIdx((i) => i + 1), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      completeOnboarding(answers);
    }, 1000);
    return () => clearTimeout(t);
  }, [idx, answers]);

  return (
    <div className="flex grow flex-col items-center justify-center text-center">
      <BreathRing size={150} />
      <p className="font-display mt-10 text-xl">{GENERATING_MESSAGES[idx]}</p>
      <div className="mt-6 flex gap-1.5">
        {GENERATING_MESSAGES.map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= idx ? "bg-moss" : "bg-mist"}`} />
        ))}
      </div>
    </div>
  );
}
