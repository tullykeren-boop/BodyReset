import {
  Waves,
  Wind,
  Target,
  Zap,
  Sun,
  Eye,
  Activity,
  type LucideIcon,
} from "lucide-react";

/**
 * Frontend-only display metadata. The domain data (name, description, kind)
 * lives in the database as Concern rows, keyed by the same slugs.
 */

/** Dot positions on the body map's 120x240 viewBox. Physical concerns only. */
export const BODY_AREA_DOTS: Record<string, [number, number][]> = {
  neck: [[60, 44]],
  shoulders: [
    [40, 57],
    [80, 57],
  ],
  "upper-back": [[60, 70]],
  "lower-back": [[60, 108]],
  wrists: [
    [13, 141],
    [107, 141],
  ],
  hips: [
    [47, 138],
    [73, 138],
  ],
};

export const BODY_AREA_ORDER = [
  "neck",
  "shoulders",
  "upper-back",
  "lower-back",
  "wrists",
  "hips",
];

/** Mental concerns have no anatomical position, so they get an icon instead. */
export const MENTAL_CONCERN_META: Record<string, { icon: LucideIcon }> = {
  stress: { icon: Waves },
  anxiety: { icon: Wind },
  "low-focus": { icon: Target },
  "low-energy": { icon: Zap },
  "low-mood": { icon: Sun },
  "eye-strain": { icon: Eye },
  restlessness: { icon: Activity },
};
