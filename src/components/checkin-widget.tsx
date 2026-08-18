"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { submitCheckIn } from "@/app/actions/checkin";
import { MOOD_CONCERN_SLUG } from "@/lib/intensity";
import type { CheckInMood } from "@/generated/prisma/client";

const BODY_OPTIONS: { label: string; value: CheckInMood }[] = [
  { label: "Great", value: "GREAT" },
  { label: "Okay", value: "OKAY" },
  { label: "Tense", value: "TENSE" },
  { label: "In pain", value: "PAIN" },
];

const MIND_OPTIONS: { label: string; value: CheckInMood }[] = [
  { label: "Stressed", value: "STRESSED" },
  { label: "Foggy", value: "FOGGY" },
  { label: "Drained", value: "DRAINED" },
  { label: "Low", value: "LOW" },
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

  // A rough day should hand straight off to a routine rather than dead-ending
  // as a logged data point.
  const handoffSlug = mood ? MOOD_CONCERN_SLUG[mood] : null;

  return (
    <div className="mt-5 rounded-2xl border border-mist bg-card p-4">
      <p className="text-sm font-medium">How are you feeling right now?</p>

      <div className="mt-3 flex gap-2">
        {BODY_OPTIONS.map((opt) => (
          <MoodButton key={opt.value} {...opt} active={mood === opt.value} disabled={isPending} onChoose={choose} />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {MIND_OPTIONS.map((opt) => (
          <MoodButton key={opt.value} {...opt} active={mood === opt.value} disabled={isPending} onChoose={choose} />
        ))}
      </div>

      {mood && handoffSlug && (
        <Link
          href={`/now?concern=${handoffSlug}`}
          className="mt-3 flex items-center justify-between rounded-xl bg-[#F3E2D6] px-3 py-2.5 text-xs text-[#8C4C2C]"
        >
          <span>Logged — want a routine for that now?</span>
          <ChevronRight size={14} />
        </Link>
      )}
      {mood && !handoffSlug && (
        <p className="mt-3 text-xs text-moss-deep">Logged — keep it up!</p>
      )}
    </div>
  );
}

function MoodButton({
  label,
  value,
  active,
  disabled,
  onChoose,
}: {
  label: string;
  value: CheckInMood;
  active: boolean;
  disabled: boolean;
  onChoose: (v: CheckInMood) => void;
}) {
  return (
    <button
      onClick={() => onChoose(value)}
      disabled={disabled}
      className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
        active ? "border-moss bg-[#E4EAE1] text-moss-deep" : "border-mist text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}
