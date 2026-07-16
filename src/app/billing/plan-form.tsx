"use client";

import { useActionState, useState } from "react";
import { startCheckout, type BillingFormState } from "@/app/actions/billing";
import { SubmitButton } from "@/components/submit-button";
import { PLANS, TRIAL_DAYS, type PlanId } from "@/lib/plans";

export function PlanForm() {
  const [state, formAction] = useActionState<BillingFormState, FormData>(startCheckout, undefined);
  const [selected, setSelected] = useState<PlanId>("MONTHLY");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(PLANS).map((plan) => (
          <label
            key={plan.id}
            className={`cursor-pointer rounded-2xl border p-6 text-left transition ${
              selected === plan.id
                ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40"
                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
            }`}
          >
            <input
              type="radio"
              name="plan"
              value={plan.id}
              checked={selected === plan.id}
              onChange={() => setSelected(plan.id)}
              className="sr-only"
            />
            <p className="font-medium">{plan.name}</p>
            <p className="mt-2 text-3xl font-semibold">
              {plan.priceLabel}
              <span className="text-base font-normal text-neutral-500">/{plan.interval}</span>
            </p>
            <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>
          </label>
        ))}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Redirecting to checkout…" className="self-center px-10">
        Start {TRIAL_DAYS}-day free trial
      </SubmitButton>
      <p className="text-center text-xs text-neutral-500">
        You won&apos;t be charged until your trial ends. Cancel anytime.
      </p>
    </form>
  );
}
