"use client";

import { useEffect, useMemo, useState } from "react";

export type BreathPhase = { label: string; seconds: number };

/**
 * Parses a pattern like "4-4-8" (in / hold / out) or "4-4-4-4"
 * (in / hold / out / hold). Zero-length phases are dropped so "4-0-6" reads as
 * a simple in-out rhythm rather than flashing an empty hold.
 */
export function parseBreathPattern(pattern: string): BreathPhase[] {
  const labels = ["Breathe in", "Hold", "Breathe out", "Hold"];
  return pattern
    .split("-")
    .map((n) => Number(n.trim()))
    .map((seconds, i) => ({ label: labels[i] ?? "Hold", seconds }))
    .filter((p) => Number.isFinite(p.seconds) && p.seconds > 0);
}

/**
 * Which phase a given elapsed second falls in, and how much of it is left.
 * Pure, so the cycle maths is independent of React's lifecycle.
 */
export function phaseAt(phases: BreathPhase[], elapsed: number) {
  const cycle = phases.reduce((sum, p) => sum + p.seconds, 0);
  if (cycle === 0) return null;

  let t = elapsed % cycle;
  for (let i = 0; i < phases.length; i++) {
    if (t < phases[i].seconds) {
      return { index: i, phase: phases[i], secondsLeft: phases[i].seconds - t };
    }
    t -= phases[i].seconds;
  }
  return { index: 0, phase: phases[0], secondsLeft: phases[0].seconds };
}

/**
 * A breathing pacer that expands on the inhale and contracts on the exhale, so
 * the user can follow the rhythm without reading a countdown. Replaces the
 * fixed 4-second BreathRing pulse for practices that declare a pattern.
 *
 * Only elapsed time is state; the phase is derived from it. That keeps the
 * component free of the cascading setState-in-effect pattern and means a
 * pattern change is picked up on the next tick without a reset.
 */
export function BreathPacer({
  pattern,
  paused = false,
  size = 144,
}: {
  pattern: string;
  paused?: boolean;
  size?: number;
}) {
  const phases = useMemo(() => parseBreathPattern(pattern), [pattern]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (paused || phases.length === 0) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [paused, phases.length]);

  const current = phaseAt(phases, elapsed);
  if (!current) return null;

  const { phase, index, secondsLeft } = current;
  const isInhale = phase.label === "Breathe in";
  const isExhale = phase.label === "Breathe out";
  // A hold keeps whichever size the previous phase ended at: the first hold
  // follows an inhale (expanded), any later hold follows an exhale (small).
  const scale = isInhale ? 1 : isExhale ? 0.62 : index === 1 ? 1 : 0.62;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute rounded-full border-2 border-sand/70 bg-sand/10"
        style={{
          width: size,
          height: size,
          transform: `scale(${scale})`,
          transition: `transform ${phase.seconds}s ease-in-out`,
        }}
      />
      <div className="relative text-center">
        <p className="text-sm text-[#B7C0B8]">{phase.label}</p>
        <p className="font-mono text-3xl text-paper">{secondsLeft}</p>
      </div>
    </div>
  );
}
