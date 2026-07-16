"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function markRoutineStarted(routineId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine || routine.userId !== user.id || routine.startedAt) return;

  await prisma.routine.update({
    where: { id: routineId },
    data: { startedAt: new Date() },
  });
}

export async function markRoutineCompleted(routineId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine || routine.userId !== user.id) {
    throw new Error("Routine not found");
  }

  await prisma.routine.update({
    where: { id: routineId },
    data: { completedAt: new Date() },
  });
}
