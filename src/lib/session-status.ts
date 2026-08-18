import type { SessionSlot, SessionOrigin } from "@/generated/prisma/client";

export type SessionStatus = "done" | "skipped" | "current" | "upcoming";

const SLOT_ORDER: SessionSlot[] = ["MORNING", "MIDDAY", "EVENING"];

type SlotSession = {
  id: string;
  slot: SessionSlot;
  origin: SessionOrigin;
  completedAt: Date | null;
  skippedAt: Date | null;
};

/**
 * Splits a day's sessions into the scheduled plan and the ad-hoc resets the
 * user started themselves.
 *
 * Ad-hoc sessions are excluded from status derivation deliberately: they have
 * slot ADHOC, which is not in SLOT_ORDER, so `indexOf` returns -1 and they
 * would sort ahead of MORNING and steal the "current" badge from the actual
 * next scheduled session.
 */
export function splitSessions<T extends SlotSession>(sessions: T[]) {
  return {
    planned: sessions.filter((s) => s.origin === "DAILY_PLAN"),
    adHoc: sessions.filter((s) => s.origin !== "DAILY_PLAN"),
  };
}

/**
 * Exactly one incomplete scheduled session is marked "current" (the next one up
 * in slot order), the rest are "upcoming". Completed/skipped sessions keep that
 * status. Ad-hoc sessions are ignored.
 */
export function deriveSessionStatuses<T extends SlotSession>(
  sessions: T[]
): Map<string, SessionStatus> {
  const { planned } = splitSessions(sessions);
  const ordered = [...planned].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  );
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
