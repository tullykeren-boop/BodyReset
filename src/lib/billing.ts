import type { Subscription } from "@/generated/prisma/client";

const ACTIVE_STATUSES = new Set(["TRIALING", "ACTIVE"]);

export function hasActiveAccess(subscription: Subscription | null | undefined) {
  if (!subscription) return false;
  return ACTIVE_STATUSES.has(subscription.status);
}
