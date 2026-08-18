import { describe, it, expect } from "vitest";
import { deriveSessionStatuses, splitSessions } from "./session-status";
import type { SessionOrigin, SessionSlot } from "@/generated/prisma/client";

function session(
  id: string,
  slot: SessionSlot,
  origin: SessionOrigin = "DAILY_PLAN",
  completedAt: Date | null = null,
  skippedAt: Date | null = null
) {
  return { id, slot, origin, completedAt, skippedAt };
}

describe("deriveSessionStatuses", () => {
  it("marks the first incomplete scheduled session as current", () => {
    const statuses = deriveSessionStatuses([
      session("m", "MORNING", "DAILY_PLAN", new Date()),
      session("d", "MIDDAY"),
      session("e", "EVENING"),
    ]);
    expect(statuses.get("m")).toBe("done");
    expect(statuses.get("d")).toBe("current");
    expect(statuses.get("e")).toBe("upcoming");
  });

  it("orders by slot regardless of input order", () => {
    const statuses = deriveSessionStatuses([
      session("e", "EVENING"),
      session("m", "MORNING"),
      session("d", "MIDDAY"),
    ]);
    expect(statuses.get("m")).toBe("current");
  });

  it("does not let an ad-hoc session steal the current badge", () => {
    // The original bug: ADHOC is absent from SLOT_ORDER, so indexOf returns -1
    // and it sorted ahead of MORNING, taking "current" from the real next
    // scheduled session.
    const statuses = deriveSessionStatuses([
      session("adhoc", "ADHOC", "INSTANT"),
      session("m", "MORNING"),
      session("d", "MIDDAY"),
    ]);
    expect(statuses.get("m")).toBe("current");
    expect(statuses.has("adhoc")).toBe(false);
  });

  it("keeps skipped sessions skipped and moves current past them", () => {
    const statuses = deriveSessionStatuses([
      session("m", "MORNING", "DAILY_PLAN", null, new Date()),
      session("d", "MIDDAY"),
    ]);
    expect(statuses.get("m")).toBe("skipped");
    expect(statuses.get("d")).toBe("current");
  });

  it("marks nothing current when every scheduled session is done", () => {
    const statuses = deriveSessionStatuses([
      session("m", "MORNING", "DAILY_PLAN", new Date()),
      session("d", "MIDDAY", "DAILY_PLAN", new Date()),
    ]);
    expect([...statuses.values()]).toEqual(["done", "done"]);
  });
});

describe("splitSessions", () => {
  it("separates the scheduled plan from ad-hoc resets", () => {
    const { planned, adHoc } = splitSessions([
      session("m", "MORNING"),
      session("coach", "ADHOC", "COACH"),
      session("instant", "ADHOC", "INSTANT"),
    ]);
    expect(planned.map((s) => s.id)).toEqual(["m"]);
    expect(adHoc.map((s) => s.id)).toEqual(["coach", "instant"]);
  });
});
