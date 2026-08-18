import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RemindersClient } from "./reminders-client";

export default async function RemindersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [schedule, subscriptionCount] = await Promise.all([
    prisma.reminderSchedule.findUnique({ where: { userId: user.id } }),
    prisma.pushSubscription.count({ where: { userId: user.id } }),
  ]);

  return (
    <RemindersClient
      initial={{
        enabled: schedule?.enabled ?? true,
        startMinute: schedule?.startMinute ?? 540,
        endMinute: schedule?.endMinute ?? 1020,
        intervalMinutes: schedule?.intervalMinutes ?? 90,
        weekdays: schedule?.weekdays ?? [1, 2, 3, 4, 5],
        timezone: schedule?.timezone ?? "UTC",
      }}
      hasSubscription={subscriptionCount > 0}
      vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null}
    />
  );
}
