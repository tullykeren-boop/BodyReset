"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function savePushSubscription(input: z.infer<typeof subscriptionSchema>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid push subscription");
  const { endpoint, p256dh, auth, userAgent } = parsed.data;

  // Endpoint is unique, so re-subscribing on the same device updates in place
  // and can move the subscription to whoever is now logged in on it.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.id, endpoint, p256dh, auth, userAgent },
    update: { userId: user.id, p256dh, auth, userAgent, failedAt: null },
  });

  // A first subscription implies wanting nudges; create the default schedule.
  await prisma.reminderSchedule.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  revalidatePath("/reminders");
}

export async function removePushSubscription(endpoint: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  revalidatePath("/reminders");
}

const scheduleSchema = z.object({
  enabled: z.boolean(),
  startMinute: z.coerce.number().min(0).max(1439),
  endMinute: z.coerce.number().min(0).max(1439),
  intervalMinutes: z.coerce.number().min(30).max(480),
  weekdays: z.array(z.coerce.number().min(0).max(6)),
  timezone: z.string().min(1),
});

export type ReminderScheduleInput = z.infer<typeof scheduleSchema>;

export async function saveReminderSchedule(input: ReminderScheduleInput) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid schedule" };
  }
  const data = parsed.data;
  if (data.endMinute <= data.startMinute) {
    return { error: "Your end time needs to be after your start time" };
  }

  await prisma.reminderSchedule.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  revalidatePath("/reminders");
  return undefined;
}

/** "Later" on a nudge: quiet for a while without turning reminders off. */
export async function snoozeReminders(minutes = 60) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await prisma.reminderSchedule.updateMany({
    where: { userId: user.id },
    data: { snoozeUntil: new Date(Date.now() + minutes * 60_000) },
  });
  revalidatePath("/reminders");
}
