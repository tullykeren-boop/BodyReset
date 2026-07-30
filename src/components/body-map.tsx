"use client";

import { BODY_AREA_DOTS } from "@/lib/body-areas";

export function BodyMap({
  selected = [],
  onToggle,
  size = 150,
  interactive = true,
  heat = null,
}: {
  selected?: string[];
  onToggle?: (slug: string) => void;
  size?: number;
  interactive?: boolean;
  heat?: Record<string, number> | null;
}) {
  return (
    <svg viewBox="0 0 120 240" width={size} height={size * 2} className="mx-auto select-none">
      <circle cx="60" cy="26" r="18" fill="none" stroke="#B7C0B8" strokeWidth="2" />
      <rect x="36" y="46" width="48" height="90" rx="20" fill="none" stroke="#B7C0B8" strokeWidth="2" />
      <line x1="40" y1="54" x2="13" y2="141" stroke="#B7C0B8" strokeWidth="2" />
      <line x1="80" y1="54" x2="107" y2="141" stroke="#B7C0B8" strokeWidth="2" />
      <line x1="48" y1="134" x2="40" y2="230" stroke="#B7C0B8" strokeWidth="2" />
      <line x1="72" y1="134" x2="80" y2="230" stroke="#B7C0B8" strokeWidth="2" />
      {Object.entries(BODY_AREA_DOTS).map(([slug, dots]) =>
        dots.map(([x, y], i) => {
          const isSel = selected.includes(slug);
          const heatVal = heat ? heat[slug] : null;
          const r = heatVal ? 5 + heatVal / 14 : 6;
          const active = isSel || Boolean(heatVal);
          return (
            <g
              key={slug + i}
              onClick={() => interactive && onToggle && onToggle(slug)}
              className={interactive ? "cursor-pointer" : ""}
            >
              <circle cx={x} cy={y} r={r + 6} fill={active ? "rgba(185,106,68,0.12)" : "transparent"} />
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={active ? "#B96A44" : "#FFFFFF"}
                stroke={active ? "#B96A44" : "#B7C0B8"}
                strokeWidth="2"
              />
            </g>
          );
        })
      )}
    </svg>
  );
}
