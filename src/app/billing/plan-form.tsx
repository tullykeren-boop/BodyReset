"use client";

import { useState, useTransition } from "react";
import { startCheckout } from "@/app/actions/billing";
import { FREE_PLAN, PERSONAL_PLAN, TRIAL_DAYS } from "@/lib/plans";

export function PlanForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    startTransition(async () => {
      const result = await startCheckout();
      setError(result?.error ?? null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-white/60 p-6 text-left">
          <p className="font-medium">{FREE_PLAN.name}</p>
          <p className="mt-2 text-3xl font-semibold">{FREE_PLAN.priceLabel}</p>
          <p className="mt-2 text-sm text-ink-soft">{FREE_PLAN.description}</p>
        </div>
        <div className="rounded-2xl border border-moss bg-card p-6 text-left shadow-[0_20px_40px_-20px_rgba(28,35,33,0.3)]">
          <p className="font-medium">{PERSONAL_PLAN.name}</p>
          <p className="mt-2 text-3xl font-semibold">
            {PERSONAL_PLAN.priceLabel}
            <span className="text-base font-normal text-ink-soft">/{PERSONAL_PLAN.interval}</span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">{PERSONAL_PLAN.description}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        {error && (
          <p className="w-full rounded-lg bg-[#F3E2D6] px-3 py-2 text-center text-sm text-[#8C4C2C]">
            {error}
          </p>
        )}
        <button
          onClick={handleCheckout}
          disabled={isPending}
          className="rounded-full bg-moss px-10 py-3.5 font-medium text-paper transition hover:bg-moss-deep disabled:opacity-60"
        >
          {isPending ? "Redirecting to checkout…" : `Start ${TRIAL_DAYS}-day free trial`}
        </button>
        <p className="text-center text-xs text-ink-soft/80">
          You won&apos;t be charged until your trial ends. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
