"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TIME_OPTIONS } from "@/lib/onboarding-options";

const onboardingSchema = z.object({
  workdayType: z.enum(["MEETINGS", "DEEPWORK", "CREATIVE", "MIXED"]),
  painAreaSlugs: z.array(z.string()).min(1, "Pick at least one area"),
  timeAvailableMinutes: z.coerce.number().refine((n) => (TIME_OPTIONS as readonly number[]).includes(n)),
  goal: z.enum(["REDUCE_PAIN", "PREVENT", "MOBILITY", "ENERGY"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(input: OnboardingInput) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid onboarding input");
  }
  const { workdayType, painAreaSlugs, timeAvailableMinutes, goal } = parsed.data;

  const bodyAreas = await prisma.bodyArea.findMany({ where: { slug: { in: painAreaSlugs } } });
  if (bodyAreas.length === 0) {
    throw new Error("Could not find the selected body areas");
  }

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      workdayType,
      timeAvailableMinutes,
      goal,
      painAreas: { create: bodyAreas.map((a) => ({ bodyAreaId: a.id })) },
    },
    update: {
      workdayType,
      timeAvailableMinutes,
      goal,
      painAreas: {
        deleteMany: {},
        create: bodyAreas.map((a) => ({ bodyAreaId: a.id })),
      },
    },
  });

  redirect("/dashboard");
}
