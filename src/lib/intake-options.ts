import type { IssueType } from "@/generated/prisma/client";

export const TIME_OPTIONS = [5, 10, 15, 20] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

export const ISSUE_TYPE_OPTIONS: { value: IssueType; label: string; description: string }[] = [
  {
    value: "PAIN",
    label: "Pain",
    description: "A sharp or aching pain in the area.",
  },
  {
    value: "STIFFNESS",
    label: "Stiffness",
    description: "Tight, stiff, or reduced range of motion.",
  },
  {
    value: "WEAKNESS",
    label: "Weakness",
    description: "Feels weak, unstable, or fatigues quickly.",
  },
  {
    value: "MOBILITY",
    label: "General mobility",
    description: "No specific issue, just want to move better.",
  },
];
