const TONES = {
  moss: "bg-[#E4EAE1] text-[#3A5346]",
  clay: "bg-[#F3E2D6] text-[#8C4C2C]",
  sand: "bg-[#F5E7CF] text-[#8A6423]",
};

export function Tag({
  children,
  tone = "moss",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${TONES[tone]}`}>
      {children}
    </span>
  );
}
