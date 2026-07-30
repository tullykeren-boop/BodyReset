export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[430px] sm:my-6">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-paper shadow-[0_40px_80px_-30px_rgba(28,35,33,0.35)] sm:h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-ink">
        {children}
      </div>
    </div>
  );
}
