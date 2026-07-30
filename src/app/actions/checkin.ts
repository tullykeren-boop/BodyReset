"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { CheckInMood } from "@/generated/prisma/client";

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function submitCheckIn(mood: CheckInMood) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const date = startOfUtcDay(new Date());

  await prisma.checkIn.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, mood },
    update: { mood },
  });

  revalidatePath("/dashboard");
}
