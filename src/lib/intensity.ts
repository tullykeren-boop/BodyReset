import type { IntensityScale, CheckInMood } from "@/generated/prisma/client";

/**
 * Whether a higher reading on a scale is better or worse.
 *
 * This lives here rather than on the row because it is a property of the scale
 * itself, not of any individual reading. Storing it per-row would let the two
 * drift apart.
 */
export const SCALE_POLARITY: Record<IntensityScale, -1 | 1> = {
  PAIN: -1,
  STRESS: -1,
  TENSION: -1,
  ENERGY: 1,
  FOCUS: 1,
  MOOD: 1,
};

/** Endpoint copy for the before/after slider, per scale. */
export const SCALE_LABELS: Record<IntensityScale, { low: string; high: string; prompt: string }> = {
  PAIN: { low: "Fine", high: "Painful", prompt: "How does it feel right now?" },
  STRESS: { low: "Calm", high: "Overwhelmed", prompt: "How wound up are you right now?" },
  TENSION: { low: "Loose", high: "Gripped", prompt: "How much tension are you holding?" },
  ENERGY: { low: "Drained", high: "Charged", prompt: "How's your energy right now?" },
  FOCUS: { low: "Scattered", high: "Sharp", prompt: "How's your focus right now?" },
  MOOD: { low: "Flat", high: "Bright", prompt: "How's your mood right now?" },
};

/**
 * Convert a reading on any scale to a single 0-10 axis where LOWER IS ALWAYS
 * BETTER. Every chart and score in the app consumes this, so a stress session
 * and a lower-back session can share one trend line.
 *
 * Note `toBurden("PAIN", v) === v`, so historical pain-only rows produce
 * byte-identical numbers to before intensity scales existed.
 */
export function toBurden(scale: IntensityScale, value: number): number {
  return SCALE_POLARITY[scale] === -1 ? value : 10 - value;
}

/** Positive means the session helped, on any scale. */
export function relief(scale: IntensityScale, before: number, after: number): number {
  return SCALE_POLARITY[scale] === -1 ? before - after : after - before;
}

/**
 * A sensible optimistic default for the "after" slider: better than the
 * "before" reading by two points, in whichever direction "better" is.
 */
export function optimisticAfter(scale: IntensityScale, before: number): number {
  const improved = SCALE_POLARITY[scale] === -1 ? before - 2 : before + 2;
  return Math.max(0, Math.min(10, improved));
}

/**
 * How each check-in mood maps onto the shared 0-10 burden axis.
 *
 * The original four values are unchanged from before mental concerns existed,
 * so historical trend lines render identically.
 */
export const MOOD_BURDEN: Record<CheckInMood, number> = {
  GREAT: 2,
  OKAY: 4,
  TENSE: 7,
  PAIN: 9,
  STRESSED: 7,
  FOGGY: 5,
  DRAINED: 6,
  LOW: 7,
};

/**
 * Which concern a check-in mood hands off to when the user taps through from
 * the dashboard into a routine.
 */
export const MOOD_CONCERN_SLUG: Record<CheckInMood, string | null> = {
  GREAT: null,
  OKAY: null,
  TENSE: "stress",
  PAIN: null, // ambiguous which body area -- let the user pick
  STRESSED: "stress",
  FOGGY: "low-focus",
  DRAINED: "low-energy",
  LOW: "low-mood",
};
