import clsx from "clsx";

export function primaryButtonClasses(className = "") {
  return clsx(
    "group inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 font-medium text-paper transition-all hover:bg-moss-deep disabled:pointer-events-none disabled:opacity-40",
    className
  );
}

export function ghostButtonClasses(className = "") {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-full border border-mist px-5 py-3 font-medium text-ink transition-colors hover:border-moss hover:bg-white",
    className
  );
}

export function PrimaryButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={primaryButtonClasses(className)}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={ghostButtonClasses(className)}>
      {children}
    </button>
  );
}
