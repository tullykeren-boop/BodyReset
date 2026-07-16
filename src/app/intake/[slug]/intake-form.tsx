"use client";

import { useActionState, useState } from "react";
import { generateRoutine, type IntakeFormState } from "@/app/actions/routine";
import { SubmitButton } from "@/components/submit-button";
import { ISSUE_TYPE_OPTIONS, TIME_OPTIONS } from "@/lib/intake-options";

export function IntakeForm({ targetAreaSlug }: { targetAreaSlug: string }) {
  const [state, formAction] = useActionState<IntakeFormState, FormData>(generateRoutine, undefined);
  const [issueType, setIssueType] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <input type="hidden" name="targetAreaSlug" value={targetAreaSlug} />

      <fieldset>
        <legend className="text-lg font-medium">What best describes what you&apos;re feeling?</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ISSUE_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                issueType === option.value
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
              }`}
            >
              <input
                type="radio"
                name="issueType"
                value={option.value}
                required
                className="sr-only"
                onChange={() => setIssueType(option.value)}
              />
              <p className="font-medium">{option.label}</p>
              <p className="mt-1 text-sm text-neutral-500">{option.description}</p>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-medium">How much time do you have?</legend>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIME_OPTIONS.map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                minutes === option
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
              }`}
            >
              <input
                type="radio"
                name="timeAvailableMinutes"
                value={option}
                required
                className="sr-only"
                onChange={() => setMinutes(option)}
              />
              <p className="font-semibold">{option} min</p>
            </label>
          ))}
        </div>
      </fieldset>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Building your routine…" className="w-full sm:w-auto sm:self-center sm:px-10">
        Build my routine
      </SubmitButton>
    </form>
  );
}
