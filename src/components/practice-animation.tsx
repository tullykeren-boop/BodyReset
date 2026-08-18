"use client";

import type { Modality } from "@/generated/prisma/client";

/**
 * Animated demonstration figures.
 *
 * Every figure is inline SVG driven by CSS keyframes declared in globals.css,
 * so there is no animation library, no network fetch, and the whole thing
 * respects the existing prefers-reduced-motion block.
 *
 * Lookup order is animationKey -> modality default -> null (text only). That
 * fallback chain is deliberate: the practice catalog can grow faster than the
 * artwork without ever shipping a broken player.
 */

const STROKE = "#D3A05C";
const FAINT = "rgba(255,255,255,0.18)";

function Figure({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Head + torso that most of the movement figures share. */
function Body({ headY = 30 }: { headY?: number }) {
  return (
    <>
      <circle cx="60" cy={headY} r="10" stroke={STROKE} strokeWidth="2.5" />
      <line x1="60" y1={headY + 10} x2="60" y2="78" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function NeckTilt() {
  return (
    <Figure>
      <g className="lr-anim-tilt" style={{ transformOrigin: "60px 42px" }}>
        <circle cx="60" cy="30" r="10" stroke={STROKE} strokeWidth="2.5" />
      </g>
      <line x1="60" y1="42" x2="60" y2="78" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="52" x2="82" y2="52" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
    </Figure>
  );
}

function ShoulderRoll() {
  return (
    <Figure>
      <Body />
      <g className="lr-anim-roll">
        <circle cx="38" cy="52" r="5" stroke={STROKE} strokeWidth="2.5" />
        <circle cx="82" cy="52" r="5" stroke={STROKE} strokeWidth="2.5" />
      </g>
      <line x1="43" y1="52" x2="77" y2="52" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
    </Figure>
  );
}

function ReachUp() {
  return (
    <Figure>
      <Body />
      <g className="lr-anim-reach" style={{ transformOrigin: "60px 52px" }}>
        <line x1="60" y1="52" x2="36" y2="24" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="52" x2="84" y2="24" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <line x1="60" y1="78" x2="46" y2="102" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="78" x2="74" y2="102" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
    </Figure>
  );
}

function Twist() {
  return (
    <Figure>
      <g className="lr-anim-twist" style={{ transformOrigin: "60px 60px" }}>
        <Body />
        <line x1="38" y1="52" x2="82" y2="52" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <line x1="42" y1="86" x2="78" y2="86" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
    </Figure>
  );
}

function WristCircle() {
  return (
    <Figure>
      <line x1="30" y1="76" x2="66" y2="60" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <g className="lr-anim-spin" style={{ transformOrigin: "66px 60px" }}>
        <line x1="66" y1="60" x2="88" y2="46" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <circle cx="66" cy="60" r="4" stroke={FAINT} strokeWidth="2" />
      <circle cx="66" cy="60" r="24" stroke={FAINT} strokeWidth="1.5" strokeDasharray="3 5" />
    </Figure>
  );
}

function HipCircle() {
  return (
    <Figure>
      <Body headY={26} />
      <g className="lr-anim-sway" style={{ transformOrigin: "60px 78px" }}>
        <line x1="60" y1="78" x2="44" y2="104" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="78" x2="76" y2="104" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </Figure>
  );
}

function March() {
  return (
    <Figure>
      <Body headY={24} />
      <g className="lr-anim-march-a">
        <line x1="60" y1="76" x2="44" y2="102" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g className="lr-anim-march-b">
        <line x1="60" y1="76" x2="76" y2="102" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <line x1="44" y1="48" x2="76" y2="48" stroke={FAINT} strokeWidth="2.5" strokeLinecap="round" />
    </Figure>
  );
}

function GazeShift() {
  return (
    <Figure>
      <ellipse cx="60" cy="60" rx="34" ry="20" stroke={STROKE} strokeWidth="2.5" />
      <g className="lr-anim-gaze">
        <circle cx="60" cy="60" r="9" stroke={STROKE} strokeWidth="2.5" />
        <circle cx="60" cy="60" r="3.5" fill={STROKE} />
      </g>
    </Figure>
  );
}

function Pulse() {
  return (
    <Figure>
      <g className="lr-anim-pulse" style={{ transformOrigin: "60px 60px" }}>
        <circle cx="60" cy="60" r="30" stroke={STROKE} strokeWidth="2.5" />
      </g>
      <circle cx="60" cy="60" r="12" stroke={FAINT} strokeWidth="2" />
    </Figure>
  );
}

function Settle() {
  return (
    <Figure>
      <g className="lr-anim-settle">
        <circle cx="60" cy="46" r="11" stroke={STROKE} strokeWidth="2.5" />
        <line x1="60" y1="57" x2="60" y2="84" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="66" x2="80" y2="66" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <line x1="30" y1="98" x2="90" y2="98" stroke={FAINT} strokeWidth="2" strokeLinecap="round" />
    </Figure>
  );
}

const REGISTRY: Record<string, () => React.JSX.Element> = {
  "neck-tilt": NeckTilt,
  "shoulder-roll": ShoulderRoll,
  "reach-up": ReachUp,
  twist: Twist,
  "wrist-circle": WristCircle,
  "hip-circle": HipCircle,
  march: March,
  "gaze-shift": GazeShift,
  pulse: Pulse,
  settle: Settle,
};

/** Generic figure per modality, used when a practice has no specific artwork. */
const MODALITY_DEFAULT: Record<Modality, keyof typeof REGISTRY | null> = {
  MOVEMENT: "reach-up",
  BREATHWORK: "pulse",
  GAZE: "gaze-shift",
  SOMATIC: "settle",
  MINDFULNESS: "settle",
  COGNITIVE: null,
};

/**
 * Maps practice slugs onto the figure that best represents them. Practices not
 * listed here fall back to their modality's generic figure.
 */
export const PRACTICE_ANIMATION: Record<string, keyof typeof REGISTRY> = {
  "neck-mobility-reset": "neck-tilt",
  "neck-side-stretch": "neck-tilt",
  "upper-trap-release": "neck-tilt",
  "chin-tucks": "neck-tilt",
  "shoulder-rolls": "shoulder-roll",
  "cross-body-shoulder-stretch": "shoulder-roll",
  "pendulum-swing": "shoulder-roll",
  "doorway-chest-opener": "reach-up",
  "wall-slides": "reach-up",
  "wall-angels": "reach-up",
  "standing-forward-fold": "reach-up",
  "seated-spinal-twist": "twist",
  "thoracic-extension-stretch": "twist",
  "cat-cow-stretch": "twist",
  "wrist-circles": "wrist-circle",
  "wrist-forearm-stretch": "wrist-circle",
  "prayer-stretch": "wrist-circle",
  "wrist-curls": "wrist-circle",
  "reverse-wrist-curls": "wrist-circle",
  "hip-circles": "hip-circle",
  "figure-4-stretch": "hip-circle",
  "butterfly-stretch": "hip-circle",
  "kneeling-hip-flexor-stretch": "hip-circle",
  "desk-march": "march",
  "shake-it-out": "march",
  "standing-hip-abduction": "march",
  "twenty-twenty-twenty": "gaze-shift",
  "near-far-focus": "gaze-shift",
  palming: "gaze-shift",
  "peripheral-vision-widen": "gaze-shift",
  "power-posture-reset": "settle",
};

export function PracticeAnimation({
  animationKey,
  slug,
  modality,
  size = 132,
}: {
  animationKey?: string | null;
  slug?: string;
  modality: Modality;
  size?: number;
}) {
  const key =
    (animationKey && animationKey in REGISTRY ? animationKey : null) ??
    (slug ? PRACTICE_ANIMATION[slug] : null) ??
    MODALITY_DEFAULT[modality];

  if (!key) return null;
  const Component = REGISTRY[key];
  if (!Component) return null;

  return (
    <div style={{ width: size, height: size }} className="mx-auto">
      <Component />
    </div>
  );
}
