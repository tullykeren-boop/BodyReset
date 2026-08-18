"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TIME_OPTIONS } from "@/lib/onboarding-options";

const onboardingSchema = z.object({
  workdayType: z.enum(["MEETINGS", "DEEPWORK", "CREATIVE", "MIXED"]),
  // Physical and mental slugs both land here; at least one of either is required.
  concernSlugs: z.array(z.string()).min(1, "Pick at least one concern"),
  timeAvailableMinutes: z.coerce
    .number()
    .refine((n) => (TIME_OPTIONS as readonly number[]).includes(n)),
  goal: z.enum([
    "REDUCE_PAIN",
    "PREVENT",
    "MOBILITY",
    "ENERGY",
    "REDUCE_STRESS",
    "IMPROVE_FOCUS",
    "LIFT_MOOD",
  ]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(input: OnboardingInput) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid onboarding input");
  }
  const { workdayType, concernSlugs, timeAvailableMinutes, goal } = parsed.data;

  const concerns = await prisma.concern.findMany({ where: { slug: { in: concernSlugs } } });
  if (concerns.length === 0) {
    throw new Error("Could not find the selected concerns");
  }

  // Preserve the order the user picked in: rank 0 is what the scorer leads with.
  const ranked = concernSlugs
    .map((slug) => concerns.find((c) => c.slug === slug))
    .filter((c) => c !== undefined)
    .map((concern, rank) => ({ concernId: concern.id, rank }));

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      workdayType,
      timeAvailableMinutes,
      goal,
      concerns: { create: ranked },
    },
    update: {
      workdayType,
      timeAvailableMinutes,
      goal,
      concerns: {
        deleteMany: {},
        create: ranked,
      },
    },
  });

  redirect("/dashboard");
}
