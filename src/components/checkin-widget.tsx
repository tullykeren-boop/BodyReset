"use client";

import { useState, useTransition } from "react";
import { submitCheckIn } from "@/app/actions/checkin";
import type { CheckInMood } from "@/generated/prisma/client";

const OPTIONS: { label: string; value: CheckInMood }[] = [
  { label: "Great", value: "GREAT" },
  { label: "Okay", value: "OKAY" },
  { label: "Tense", value: "TENSE" },
  { label: "In pain", value: "PAIN" },
];

export function CheckInWidget({ initialMood }: { initialMood: CheckInMood | null }) {
  const [mood, setMood] = useState<CheckInMood | null>(initialMood);
  const [isPending, startTransition] = useTransition();

  function choose(value: CheckInMood) {
    setMood(value);
    startTransition(() => {
      submitCheckIn(value);
    });
  }

  return (
    <div className="mt-5 rounded-2xl border border-mist bg-card p-4">
      <p className="text-sm font-medium">How&apos;s your body feeling right now?</p>
      <div className="mt-3 flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            disabled={isPending}
            className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
              mood === opt.value ? "border-moss bg-[#E4EAE1] text-moss-deep" : "border-mist text-ink-soft"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {mood && (
        <p className="mt-3 text-xs text-[#8C4C2C]">
          Logged —{" "}
          {mood === "TENSE" || mood === "PAIN"
            ? "we'll prioritize that in your next session."
            : "keep it up!"}
        </p>
      )}
    </div>
  );
}
