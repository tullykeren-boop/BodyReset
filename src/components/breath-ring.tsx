export function BreathRing({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <span className="breath-ring-outer absolute inset-0 rounded-full" />
      <span className="breath-ring-inner absolute inset-[14%] rounded-full" />
    </div>
  );
}
