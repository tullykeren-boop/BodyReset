const ICONS: Record<string, string> = {
  "lower-back": "🔽",
  knees: "🦵",
  shoulders: "💪",
  neck: "🙆",
  hips: "🕺",
  wrists: "✋",
};

export function TargetAreaIcon({ slug, className }: { slug: string; className?: string }) {
  return <span className={className}>{ICONS[slug] ?? "🧘"}</span>;
}
