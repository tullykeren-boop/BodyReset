"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { IntensityScale } from "@/generated/prisma/client";

async function requireOwnedSession(sessionId: string, userId: string) {
  const session = await prisma.plannedSession.findUnique({
    where: { id: sessionId },
    include: { dailyPlan: true },
  });
  if (!session || session.dailyPlan.userId !== userId) {
    throw new Error("Session not found");
  }
  return session;
}

export async function markSessionStarted(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const session = await requireOwnedSession(sessionId, user.id);
  if (session.startedAt) return;

  await prisma.plannedSession.update({
    where: { id: sessionId },
    data: { startedAt: new Date() },
  });
}

export type SessionFeedbackInput = {
  scale: IntensityScale;
  intensityBefore: number;
  intensityAfter: number;
  helped: boolean;
  durationRight: boolean;
  wantMore: boolean;
};

export async function submitSessionFeedback(sessionId: string, feedback: SessionFeedbackInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await requireOwnedSession(sessionId, user.id);

  await prisma.$transaction([
    prisma.plannedSession.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
    }),
    prisma.sessionFeedback.upsert({
      where: { plannedSessionId: sessionId },
      create: { plannedSessionId: sessionId, ...feedback },
      update: feedback,
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/progress");
}
