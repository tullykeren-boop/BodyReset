"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Pause, Play, SkipForward } from "lucide-react";
import { submitSessionFeedback } from "@/app/actions/session";
import { GhostButton, primaryButtonClasses } from "@/components/buttons";

type PlayerExercise = { id: string; name: string; instructions: string; durationSeconds: number };

type Phase = "before" | "player" | "feedback" | "done";

export function SessionExperience({
  sessionId,
  title,
  focusLabel,
  exercises,
  alreadyCompleted,
}: {
  sessionId: string;
  title: string;
  focusLabel: string;
  exercises: PlayerExercise[];
  alreadyCompleted: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(alreadyCompleted ? "done" : "before");
  const [painBefore, setPainBefore] = useState(6);

  if (phase === "done") {
    return <SessionDone title={title} />;
  }

  if (phase === "before") {
    return (
      <div className="flex h-full flex-col justify-center bg-paper px-6 py-10 text-center">
        <h1 className="font-display text-2xl leading-tight">Before we start</h1>
        <p className="mt-2 text-sm text-ink-soft">
          How&apos;s your {focusLabel.toLowerCase()} feeling right now?
        </p>
        <div className="mt-8 rounded-2xl border border-mist bg-card p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft/80">Fine</span>
            <span className="font-mono font-medium text-clay">{painBefore}/10</span>
            <span className="text-ink-soft/80">Painful</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={painBefore}
            onChange={(e) => setPainBefore(Number(e.target.value))}
            className="mt-3 w-full accent-moss"
          />
        </div>
        <button onClick={() => setPhase("player")} className={primaryButtonClasses("mt-8 self-center")}>
          Start session
        </button>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <FeedbackView
        sessionId={sessionId}
        title={title}
        focusLabel={focusLabel}
        painBefore={painBefore}
        onDone={() => setPhase("done")}
      />
    );
  }

  return <Player title={title} exercises={exercises} onFinished={() => setPhase("feedback")} />;
}

function Player({
  title,
  exercises,
  onFinished,
}: {
  title: string;
  exercises: PlayerExercise[];
  onFinished: () => void;
}) {
  const cumulative = useMemo(() => {
    const starts: number[] = [];
    let total = 0;
    for (const ex of exercises) {
      starts.push(total);
      total += ex.durationSeconds;
    }
    return { starts, total };
  }, [exercises]);

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const finishedRef = useRef(false);
  const finished = elapsed >= cumulative.total;

  let index = exercises.length - 1;
  let secondsLeft = 0;
  if (!finished) {
    for (let i = 0; i < exercises.length; i++) {
      const end = cumulative.starts[i] + exercises[i].durationSeconds;
      if (elapsed < end) {
        index = i;
        secondsLeft = end - elapsed;
        break;
      }
    }
  }
  const current = exercises[index];
  const isLast = index === exercises.length - 1;

  useEffect(() => {
    if (paused || finished) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [paused, finished]);

  useEffect(() => {
    if (finished && !finishedRef.current) {
      finishedRef.current = true;
      onFinished();
    }
  }, [finished, onFinished]);

  function goTo(nextIndex: number) {
    setElapsed(cumulative.starts[nextIndex]);
    setPaused(false);
  }

  function handleAdvance() {
    if (isLast) {
      setElapsed(cumulative.total);
    } else {
      goTo(index + 1);
    }
  }

  const progressPercent = Math.round(
    ((current.durationSeconds - secondsLeft) / current.durationSeconds) * 100
  );

  return (
    <div className="flex h-full flex-col bg-ink px-6 pb-10 pt-8 text-paper">
      <div className="flex items-center justify-between text-xs text-[#9FB3A2]">
        <span>
          Exercise {index + 1} of {exercises.length}
        </span>
        <span>{title}</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className={`h-1 grow rounded-full ${
              i < index ? "bg-moss" : i === index ? "bg-sand" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="flex grow flex-col items-center justify-center text-center">
        <h1 className="font-display mt-4 text-2xl">{current.name}</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#B7C0B8]">{current.instructions}</p>

        <div className="relative mt-9 flex h-36 w-36 items-center justify-center">
          <svg className="absolute -rotate-90" width="144" height="144">
            <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="72"
              cy="72"
              r="64"
              fill="none"
              stroke="#D3A05C"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 64}
              strokeDashoffset={2 * Math.PI * 64 * (1 - progressPercent / 100)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="font-mono text-3xl">{secondsLeft}s</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <GhostButton onClick={handleAdvance} className="!border-white/15 !text-paper hover:!bg-white/10">
          <SkipForward size={16} /> Skip
        </GhostButton>
        <button
          onClick={() => setPaused((p) => !p)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink"
        >
          {paused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
        </button>
        <button onClick={handleAdvance} className={primaryButtonClasses("!bg-sand hover:!bg-[#B98A46]")}>
          <Check size={16} /> Complete
        </button>
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 flex gap-2">
        {(["Yes", "No"] as const).map((opt) => {
          const v = opt === "Yes";
          return (
            <button
              key={opt}
              onClick={() => onChange(v)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                value === v ? "border-moss bg-[#E4EAE1] text-moss-deep" : "border-mist bg-card text-ink-soft"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackView({
  sessionId,
  title,
  focusLabel,
  painBefore,
  onDone,
}: {
  sessionId: string;
  title: string;
  focusLabel: string;
  painBefore: number;
  onDone: () => void;
}) {
  const [after, setAfter] = useState(Math.max(0, painBefore - 2));
  const [helped, setHelped] = useState<boolean | null>(null);
  const [durationRight, setDurationRight] = useState<boolean | null>(null);
  const [wantMore, setWantMore] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = helped !== null && durationRight !== null && wantMore !== null;

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      await submitSessionFeedback(sessionId, {
        painBefore,
        painAfter: after,
        helped: helped as boolean,
        durationRight: durationRight as boolean,
        wantMore: wantMore as boolean,
      });
      onDone();
    });
  }

  return (
    <div className="h-full overflow-y-auto bg-paper px-6 pb-10 pt-8">
      <h1 className="font-display text-2xl">How do you feel?</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {title} · {focusLabel}
      </p>

      <div className="mt-6 rounded-2xl border border-mist bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-soft/80">Before</span>
          <span className="font-mono font-medium text-clay">{painBefore}/10</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-paper">
          <div className="h-2 rounded-full bg-clay" style={{ width: `${painBefore * 10}%` }} />
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-ink-soft/80">After</span>
          <span className="font-mono font-medium text-moss-deep">{after}/10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={after}
          onChange={(e) => setAfter(Number(e.target.value))}
          className="mt-2 w-full accent-moss"
        />
      </div>

      <div className="mt-6 space-y-5">
        <YesNo label="Did this help?" value={helped} onChange={setHelped} />
        <YesNo label="Was the duration right?" value={durationRight} onChange={setDurationRight} />
        <YesNo label="Would you like more of this type of routine?" value={wantMore} onChange={setWantMore} />
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit || isPending}
        className={primaryButtonClasses("mt-8 w-full")}
      >
        {isPending ? "Submitting…" : "Submit feedback"}
      </button>
    </div>
  );
}

function SessionDone({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E4EAE1]">
        <Check size={26} className="text-moss-deep" />
      </div>
      <h1 className="font-display mt-6 text-2xl">Nice work.</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-soft">
        {title} is complete. Your dashboard has been updated.
      </p>
      <Link href="/dashboard" className={primaryButtonClasses("mt-8")}>
        Back to dashboard
      </Link>
    </div>
  );
}
