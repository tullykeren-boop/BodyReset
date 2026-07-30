/**
 * Frontend-only display metadata for the body map SVG (dot positions on a
 * 120x240 viewBox). The domain data (name, description) lives in the
 * database as BodyArea rows, keyed by the same slug.
 */
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
