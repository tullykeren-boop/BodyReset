import { Activity, ShieldCheck, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import type { WorkdayType, Goal } from "@/generated/prisma/client";

export const WORKDAY_TYPES: { key: WorkdayType; label: string; desc: string }[] = [
  { key: "MEETINGS", label: "Mostly meetings", desc: "Back-to-back calls, little heads-down time" },
  { key: "DEEPWORK", label: "Deep computer work", desc: "Long, uninterrupted focus blocks" },
  { key: "CREATIVE", label: "Creative work", desc: "Design, writing, mouse & keyboard heavy" },
  { key: "MIXED", label: "Mixed schedule", desc: "A bit of everything, day to day" },
];

export const TIME_OPTIONS = [3, 5, 10] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

export const GOALS: { key: Goal; label: string; icon: LucideIcon }[] = [
  { key: "REDUCE_PAIN", label: "Reduce pain", icon: Activity },
  { key: "PREVENT", label: "Prevent future discomfort", icon: ShieldCheck },
  { key: "MOBILITY", label: "Improve mobility", icon: RefreshCw },
  { key: "ENERGY", label: "Feel more energetic", icon: Sparkles },
];
