"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MOOD_BURDEN, MOOD_CONCERN_SLUG } from "@/lib/intensity";
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

  // Also record it as a point-in-time state reading, so the check-in feeds the
  // same history the routine builder and coach read from.
  const concernSlug = MOOD_CONCERN_SLUG[mood];
  const concern = concernSlug
    ? await prisma.concern.findUnique({ where: { slug: concernSlug } })
    : null;

  await prisma.stateLog.create({
    data: {
      userId: user.id,
      source: "CHECK_IN",
      intensity: MOOD_BURDEN[mood],
      concerns: concern ? { create: [{ concernId: concern.id, rank: 0 }] } : undefined,
    },
  });

  revalidatePath("/dashboard");
}
