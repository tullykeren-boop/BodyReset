import type { SessionSlot } from "@/generated/prisma/client";

export type SessionStatus = "done" | "skipped" | "current" | "upcoming";

const SLOT_ORDER: SessionSlot[] = ["MORNING", "MIDDAY", "EVENING"];

type SlotSession = { id: string; slot: SessionSlot; completedAt: Date | null; skippedAt: Date | null };

/**
 * Exactly one incomplete session is marked "current" (the next one up in slot
 * order), the rest are "upcoming". Completed/skipped sessions keep that status.
 */
export function deriveSessionStatuses<T extends SlotSession>(sessions: T[]): Map<string, SessionStatus> {
  const ordered = [...sessions].sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  const statuses = new Map<string, SessionStatus>();

  let currentAssigned = false;
  for (const session of ordered) {
    if (session.completedAt) {
      statuses.set(session.id, "done");
    } else if (session.skippedAt) {
      statuses.set(session.id, "skipped");
    } else if (!currentAssigned) {
      statuses.set(session.id, "current");
      currentAssigned = true;
    } else {
      statuses.set(session.id, "upcoming");
    }
  }

  return statuses;
}
