"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { markRoutineCompleted } from "@/app/actions/workout";

type PlayerExercise = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  durationSeconds: number;
};

export function WorkoutPlayer({
  routineId,
  targetAreaName,
  exercises,
}: {
  routineId: string;
  targetAreaName: string;
  exercises: PlayerExercise[];
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
  const [isPending, startTransition] = useTransition();
  const completionSubmitted = useRef(false);

  const finished = elapsed >= cumulative.total;

  // Derive the current exercise and its remaining time from elapsed seconds,
  // rather than tracking index/secondsLeft as separate state to keep in sync.
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
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, finished]);

  useEffect(() => {
    if (finished && !completionSubmitted.current) {
      completionSubmitted.current = true;
      startTransition(() => {
        markRoutineCompleted(routineId);
      });
    }
  }, [finished, routineId]);

  function goToExercise(nextIndex: number) {
    setElapsed(cumulative.starts[nextIndex]);
    setPaused(false);
  }

  function handleSkip() {
    if (isLast) {
      setElapsed(cumulative.total);
    } else {
      goToExercise(index + 1);
    }
  }

  if (finished) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Nice work!</h1>
        <p className="mt-2 text-neutral-500">
          You finished your {targetAreaName.toLowerCase()} routine{isPending ? "…" : "."}
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Go to dashboard
          </Link>
          <Link
            href="/target-area"
            className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            New routine
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(
    ((current.durationSeconds - secondsLeft) / current.durationSeconds) * 100
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10">
      <div className="mb-6 flex items-center justify-between text-sm text-neutral-500">
        <span>{targetAreaName}</span>
        <span>
          Exercise {index + 1} of {exercises.length}
        </span>
      </div>

      <div className="mb-6 flex gap-1.5">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className={`h-1.5 flex-1 rounded-full ${
              i < index ? "bg-teal-600" : i === index ? "bg-teal-300" : "bg-neutral-200 dark:bg-neutral-800"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-neutral-200 p-10 text-center dark:border-neutral-800">
        <h1 className="text-2xl font-semibold tracking-tight">{current.name}</h1>
        <p className="mt-2 max-w-sm text-neutral-500">{current.instructions}</p>

        <div className="relative mt-10 flex h-40 w-40 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-neutral-200 dark:stroke-neutral-800" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-teal-600 transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - progressPercent / 100)}
            />
          </svg>
          <span className="text-4xl font-semibold tabular-nums">{secondsLeft}</span>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <button
            onClick={() => index > 0 && goToExercise(index - 1)}
            disabled={index === 0}
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
          >
            Back
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={handleSkip}
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium dark:border-neutral-700"
          >
            {isLast ? "Finish" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}
