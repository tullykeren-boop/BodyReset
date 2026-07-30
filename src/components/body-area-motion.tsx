const FIXED = "#EEF0EA";
const FIXED_OPACITY = 0.35;
const MOVING = "#D3A05C";
const STROKE_WIDTH = 6;

function Skeleton({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" strokeLinecap="round">
      {children}
    </svg>
  );
}

function Neck() {
  return (
    <Skeleton>
      <line x1="35" y1="95" x2="85" y2="95" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <g className="motion-tilt" style={{ transformOrigin: "60px 95px" }}>
        <line x1="60" y1="95" x2="60" y2="75" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
        <circle cx="60" cy="58" r="17" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
      </g>
    </Skeleton>
  );
}

function Shoulders() {
  return (
    <Skeleton>
      <line x1="60" y1="95" x2="60" y2="60" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <circle cx="60" cy="45" r="14" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <g className="motion-swing-full" style={{ transformOrigin: "60px 68px" }}>
        <line x1="60" y1="68" x2="85" y2="80" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
        <circle cx="85" cy="80" r="6" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
      </g>
    </Skeleton>
  );
}

function UpperBack() {
  return (
    <Skeleton>
      <line x1="45" y1="95" x2="75" y2="95" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <line x1="60" y1="95" x2="60" y2="65" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <g className="motion-twist" style={{ transformOrigin: "60px 65px" }}>
        <line x1="35" y1="65" x2="85" y2="65" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
        <circle cx="60" cy="48" r="14" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
      </g>
    </Skeleton>
  );
}

function LowerBack() {
  return (
    <Skeleton>
      <line x1="60" y1="95" x2="50" y2="118" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <line x1="60" y1="95" x2="70" y2="118" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <g className="motion-fold" style={{ transformOrigin: "60px 95px" }}>
        <line x1="60" y1="95" x2="60" y2="60" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
        <circle cx="60" cy="48" r="14" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
      </g>
    </Skeleton>
  );
}

function Wrists() {
  return (
    <Skeleton>
      <line x1="25" y1="60" x2="70" y2="60" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <g className="motion-rotate-partial" style={{ transformOrigin: "70px 60px" }}>
        <ellipse cx="88" cy="60" rx="16" ry="9" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
      </g>
    </Skeleton>
  );
}

function Hips() {
  return (
    <Skeleton>
      <line x1="60" y1="20" x2="60" y2="60" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <circle cx="60" cy="15" r="12" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <line x1="60" y1="60" x2="55" y2="110" stroke={FIXED} strokeOpacity={FIXED_OPACITY} strokeWidth={STROKE_WIDTH} />
      <g className="motion-swing-full" style={{ transformOrigin: "60px 60px" }}>
        <line x1="60" y1="60" x2="85" y2="95" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
        <circle cx="85" cy="95" r="5" stroke={MOVING} strokeWidth={STROKE_WIDTH} />
      </g>
    </Skeleton>
  );
}

const MOTIONS: Record<string, () => React.JSX.Element> = {
  neck: Neck,
  shoulders: Shoulders,
  "upper-back": UpperBack,
  "lower-back": LowerBack,
  wrists: Wrists,
  hips: Hips,
};

export function BodyAreaMotion({ slug, className }: { slug: string; className?: string }) {
  const Motion = MOTIONS[slug];
  if (!Motion) return null;

  return (
    <div className={className}>
      <Motion />
    </div>
  );
}
