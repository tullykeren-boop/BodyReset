import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import type { NudgePayload } from "@/lib/reminder-schedule";

// The scheduling rules live in reminder-schedule.ts so they stay testable
// without this module's server-only dependencies.
export { isNudgeDue, localTimeIn, pickNudgeCopy } from "@/lib/reminder-schedule";
export type { NudgePayload } from "@/lib/reminder-schedule";

/**
 * Web push, degrading gracefully the same way the Anthropic and Stripe
 * integrations do: with no VAPID keys configured the app still runs, the
 * settings screen explains that nudges are unavailable, and nothing throws.
 */
export function isPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  );
}

let configured = false;
function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hello@letreset.app",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

/**
 * Sends to every endpoint a user has registered. Endpoints that report 404 or
 * 410 are permanently gone (browser uninstalled, subscription revoked), so they
 * are deleted rather than retried forever.
 */
export async function sendNudge(userId: string, payload: NudgePayload) {
  if (!isPushConfigured()) return { sent: 0, removed: 0 };
  ensureConfigured();

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          dead.push(sub.id);
        } else {
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { failedAt: new Date() },
          });
        }
      }
    })
  );

  if (dead.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  }

  return { sent, removed: dead.length };
}
