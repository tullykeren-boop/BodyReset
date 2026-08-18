import {
  Activity,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Waves,
  Target,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { WorkdayType, Goal } from "@/generated/prisma/client";

export const WORKDAY_TYPES: { key: WorkdayType; label: string; desc: string }[] = [
  { key: "MEETINGS", label: "Mostly meetings", desc: "Back-to-back calls, little heads-down time" },
  { key: "DEEPWORK", label: "Deep computer work", desc: "Long, uninterrupted focus blocks" },
  { key: "CREATIVE", label: "Creative work", desc: "Design, writing, mouse & keyboard heavy" },
  { key: "MIXED", label: "Mixed schedule", desc: "A bit of everything, day to day" },
];

/** Onboarding's "typical session length" answer. */
export const TIME_OPTIONS = [3, 5, 10] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

/**
 * Durations offered in the moment. Wider than the onboarding answer on purpose:
 * what you can spare right now is not what you said in the abstract at sign-up.
 */
export const INSTANT_DURATIONS = [
  { minutes: 1, label: "1 min", hint: "One quick reset" },
  { minutes: 2, label: "2 min", hint: "A couple of moves" },
  { minutes: 5, label: "5 min", hint: "A proper break" },
  { minutes: 10, label: "10 min", hint: "The full thing" },
] as const;

export const GOALS: { key: Goal; label: string; icon: LucideIcon }[] = [
  { key: "REDUCE_PAIN", label: "Reduce pain", icon: Activity },
  { key: "PREVENT", label: "Prevent future discomfort", icon: ShieldCheck },
  { key: "MOBILITY", label: "Improve mobility", icon: RefreshCw },
  { key: "ENERGY", label: "Feel more energetic", icon: Sparkles },
  { key: "REDUCE_STRESS", label: "Feel less stressed", icon: Waves },
  { key: "IMPROVE_FOCUS", label: "Sharpen my focus", icon: Target },
  { key: "LIFT_MOOD", label: "Lift my mood", icon: Sun },
];
