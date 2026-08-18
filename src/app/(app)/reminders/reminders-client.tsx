"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { BellOff, BellRing } from "lucide-react";
import { primaryButtonClasses } from "@/components/buttons";
import {
  savePushSubscription,
  removePushSubscription,
  saveReminderSchedule,
  type ReminderScheduleInput,
} from "@/app/actions/reminders";

type Permission = "unsupported" | "default" | "granted" | "denied";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const INTERVALS = [30, 60, 90, 120, 180];

function minutesToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
function timeToMinutes(v: string) {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

/** Web push requires the VAPID key as a Uint8Array, not the base64url string. */
function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * Notification permission is browser state, not React state, so it is read
 * through useSyncExternalStore rather than copied into state by an effect.
 * `notifyPermissionChanged` is called after requestPermission resolves, since
 * the platform gives us no event for it.
 */
const permissionListeners = new Set<() => void>();

function subscribePermission(listener: () => void) {
  permissionListeners.add(listener);
  return () => permissionListeners.delete(listener);
}

function notifyPermissionChanged() {
  permissionListeners.forEach((l) => l());
}

function readPermission(): Permission {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return "unsupported";
  }
  return Notification.permission as Permission;
}

/** The browser's real timezone, so a schedule means what the user expects. */
function readTimezone() {
  if (typeof window === "undefined") return null;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
}

const noopSubscribe = () => () => {};

export function RemindersClient({
  initial,
  hasSubscription,
  vapidPublicKey,
}: {
  initial: ReminderScheduleInput;
  hasSubscription: boolean;
  vapidPublicKey: string | null;
}) {
  const permission = useSyncExternalStore(
    subscribePermission,
    readPermission,
    () => "default" as Permission
  );
  const browserTimezone = useSyncExternalStore(noopSubscribe, readTimezone, () => null);

  const [subscribed, setSubscribed] = useState(hasSubscription);
  const [draft, setDraft] = useState<ReminderScheduleInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // The browser's timezone wins over whatever was stored, without an effect
  // round-trip: it is derived at render time and saved with the schedule.
  const schedule: ReminderScheduleInput = {
    ...draft,
    timezone: browserTimezone ?? draft.timezone,
  };
  const setSchedule = setDraft;

  async function enablePush() {
    setError(null);
    if (!vapidPublicKey) {
      setError("Push isn't configured on this server yet.");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      notifyPermissionChanged();
      if (result !== "granted") return;

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      const sub =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        setError("Your browser returned an incomplete subscription.");
        return;
      }

      await savePushSubscription({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        userAgent: navigator.userAgent,
      });
      setSubscribed(true);
    } catch {
      setError("We couldn't turn on notifications on this device.");
    }
  }

  async function disablePush() {
    const registration = await navigator.serviceWorker.getRegistration();
    const sub = await registration?.pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setSubscribed(false);
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveReminderSchedule(schedule);
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <h1 className="font-display text-2xl">Movement reminders</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A nudge during your workday is the difference between meaning to move and
        actually moving.
      </p>

      {permission === "unsupported" ? (
        <div className="mt-5 rounded-2xl border border-mist bg-card p-4 text-sm text-ink-soft">
          This browser doesn&apos;t support push notifications. On iPhone, add LetReSet to your
          home screen first, then come back here.
        </div>
      ) : permission === "denied" ? (
        <div className="mt-5 rounded-2xl border border-clay/40 bg-[#F9EDE5] p-4 text-sm text-[#8C4C2C]">
          Notifications are blocked for this site. You&apos;ll need to re-allow them in your
          browser settings before reminders can work.
        </div>
      ) : !vapidPublicKey ? (
        <div className="mt-5 rounded-2xl border border-mist bg-card p-4 text-sm text-ink-soft">
          Push isn&apos;t configured on this server. Set the VAPID keys to enable reminders.
        </div>
      ) : (
        <button
          onClick={subscribed ? disablePush : enablePush}
          className={`mt-5 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
            subscribed ? "border-moss bg-card shadow-sm" : "border-mist bg-white/50"
          }`}
        >
          {subscribed ? (
            <BellRing size={19} className="text-moss" />
          ) : (
            <BellOff size={19} className="text-ink-soft/70" />
          )}
          <div className="grow">
            <p className="text-sm font-medium">
              {subscribed ? "Reminders are on for this device" : "Turn on reminders"}
            </p>
            <p className="text-xs text-ink-soft/80">
              {subscribed ? "Tap to turn off here" : "We'll ask your browser for permission"}
            </p>
          </div>
        </button>
      )}

      <div className={subscribed ? "" : "pointer-events-none mt-2 opacity-50"}>
        <p className="mt-6 text-sm font-medium">Nudge me between</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="time"
            value={minutesToTime(schedule.startMinute)}
            onChange={(e) =>
              setSchedule((s) => ({ ...s, startMinute: timeToMinutes(e.target.value) }))
            }
            className="grow rounded-xl border border-mist bg-card px-3 py-2.5 text-sm outline-none focus:border-moss"
            aria-label="Start of nudge window"
          />
          <span className="text-sm text-ink-soft">and</span>
          <input
            type="time"
            value={minutesToTime(schedule.endMinute)}
            onChange={(e) =>
              setSchedule((s) => ({ ...s, endMinute: timeToMinutes(e.target.value) }))
            }
            className="grow rounded-xl border border-mist bg-card px-3 py-2.5 text-sm outline-none focus:border-moss"
            aria-label="End of nudge window"
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-soft/70">Times in {schedule.timezone}</p>

        <p className="mt-6 text-sm font-medium">On these days</p>
        <div className="mt-3 flex gap-2">
          {WEEKDAY_LABELS.map((label, day) => {
            const on = schedule.weekdays.includes(day);
            return (
              <button
                key={day}
                onClick={() =>
                  setSchedule((s) => ({
                    ...s,
                    weekdays: on ? s.weekdays.filter((d) => d !== day) : [...s.weekdays, day],
                  }))
                }
                className={`h-10 grow rounded-xl border text-sm font-medium transition-colors ${
                  on ? "border-moss bg-[#E4EAE1] text-moss-deep" : "border-mist bg-card text-ink-soft"
                }`}
                aria-pressed={on}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm font-medium">How often</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {INTERVALS.map((mins) => (
            <button
              key={mins}
              onClick={() => setSchedule((s) => ({ ...s, intervalMinutes: mins }))}
              className={`rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                schedule.intervalMinutes === mins
                  ? "border-moss bg-card text-moss-deep shadow-sm"
                  : "border-mist bg-white/50 text-ink-soft"
              }`}
            >
              {mins < 60 ? `${mins}m` : `${mins / 60}h`}
            </button>
          ))}
        </div>

        <label className="mt-6 flex items-center gap-3 rounded-2xl border border-mist bg-card p-4">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) => setSchedule((s) => ({ ...s, enabled: e.target.checked }))}
            className="h-4 w-4 accent-moss"
          />
          <span className="text-sm">Reminders enabled</span>
        </label>

        {error && <p className="mt-4 text-sm text-clay">{error}</p>}
        {saved && <p className="mt-4 text-sm text-moss-deep">Saved.</p>}

        <button
          onClick={save}
          disabled={isPending}
          className={primaryButtonClasses("mt-6 w-full")}
        >
          {isPending ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </div>
  );
}
