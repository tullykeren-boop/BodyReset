"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasActiveAccess } from "@/lib/billing";
import { generateRoutineForUser, TIME_OPTIONS } from "@/lib/routine-generator";

export type IntakeFormState = { error?: string } | undefined;

const intakeSchema = z.object({
  targetAreaSlug: z.string().min(1),
  issueType: z.enum(["PAIN", "STIFFNESS", "WEAKNESS", "MOBILITY"]),
  timeAvailableMinutes: z.coerce.number().refine((n) => (TIME_OPTIONS as readonly number[]).includes(n), {
    message: "Please choose a valid amount of time",
  }),
});

export async function generateRoutine(
  _prevState: IntakeFormState,
  formData: FormData
): Promise<IntakeFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!hasActiveAccess(user.subscription)) {
    redirect("/billing");
  }

  const parsed = intakeSchema.safeParse({
    targetAreaSlug: formData.get("targetAreaSlug"),
    issueType: formData.get("issueType"),
    timeAvailableMinutes: formData.get("timeAvailableMinutes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete every question" };
  }

  const targetArea = await prisma.targetArea.findUnique({
    where: { slug: parsed.data.targetAreaSlug },
  });
  if (!targetArea) {
    return { error: "That target area could not be found" };
  }

  const routine = await generateRoutineForUser({
    userId: user.id,
    targetAreaId: targetArea.id,
    issueType: parsed.data.issueType,
    timeAvailableMinutes: parsed.data.timeAvailableMinutes,
  });

  redirect(`/routine/${routine.id}`);
}
