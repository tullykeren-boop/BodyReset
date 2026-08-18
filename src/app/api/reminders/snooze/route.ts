import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

/**
 * Hit by the service worker when someone taps "Later" on a nudge. It is a
 * route rather than a server action because the caller is the service worker,
 * which has the session cookie but no React context.
 */
export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.reminderSchedule.updateMany({
    where: { userId },
    data: { snoozeUntil: new Date(Date.now() + 60 * 60_000) },
  });

  return NextResponse.json({ snoozedForMinutes: 60 });
}
