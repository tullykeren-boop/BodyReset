import type { Subscription } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { FREE_SESSIONS_PER_WEEK } from "@/lib/plans";

const ACTIVE_STATUSES = new Set(["TRIALING", "ACTIVE"]);

export function hasUnlimitedAccess(subscription: Subscription | null | undefined) {
  if (!subscription) return false;
  return ACTIVE_STATUSES.has(subscription.status);
}

function startOfUtcWeek(date: Date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday as start of week
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Free-tier users get a capped number of completed sessions per calendar
 * week (Mon-Sun). Paid/trialing users are unlimited.
 */
export async function canStartSession(userId: string, subscription: Subscription | null | undefined) {
  if (hasUnlimitedAccess(subscription)) return { allowed: true as const };

  const weekStart = startOfUtcWeek(new Date());
  const completedThisWeek = await prisma.plannedSession.count({
    where: { dailyPlan: { userId }, completedAt: { gte: weekStart } },
  });

  if (completedThisWeek < FREE_SESSIONS_PER_WEEK) {
    return { allowed: true as const };
  }
  return { allowed: false as const, completedThisWeek };
}
