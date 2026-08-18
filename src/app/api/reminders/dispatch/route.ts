import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isNudgeDue, pickNudgeCopy } from "@/lib/reminder-schedule";
import { sendNudge, isPushConfigured } from "@/lib/push";

/**
 * Called by an external scheduler (cron job, queue worker) every few minutes.
 * This is the one part of reminders that needs infrastructure outside the app.
 *
 * Authenticated with a shared secret rather than a user session, because the
 * caller is a machine. Without CRON_SECRET set the endpoint refuses to run at
 * all rather than defaulting open.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push is not configured" }, { status: 500 });
  }

  const now = new Date();
  const schedules = await prisma.reminderSchedule.findMany({
    where: { enabled: true, user: { pushSubscriptions: { some: {} } } },
  });

  const due = schedules.filter((s) => isNudgeDue(s, now));

  let delivered = 0;
  for (const schedule of due) {
    const payload = pickNudgeCopy(Math.floor(now.getTime() / 60000) + schedule.userId.length);
    const result = await sendNudge(schedule.userId, payload);
    if (result.sent > 0) {
      delivered += result.sent;
      await prisma.reminderSchedule.update({
        where: { id: schedule.id },
        data: { lastSentAt: now },
      });
    }
  }

  return NextResponse.json({ checked: schedules.length, due: due.length, delivered });
}
