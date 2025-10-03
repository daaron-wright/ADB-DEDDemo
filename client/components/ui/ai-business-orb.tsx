import { cn } from "@/lib/utils";

interface AIBusinessOrbProps {
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function AIBusinessOrb({
  className,
  showLabel = false,
  label = "AI",
}: AIBusinessOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full",
        "bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.8),rgba(84,255,212,0.25)_38%,rgba(54,69,176,0.45)_62%,rgba(8,57,57,1)_100%)]",
        "shadow-[0_0_32px_-6px_rgba(84,255,212,0.55)] ring-1 ring-white/30",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-[18%] rounded-full bg-white/45 blur-2xl opacity-80" />
      <span className="pointer-events-none absolute inset-[32%] rounded-full bg-white/35 blur-[10px] opacity-70" />
      <span className="pointer-events-none absolute -left-6 top-1/3 h-16 w-10 rotate-[28deg] bg-white/20 blur-[18px]" />
      {showLabel ? (
        <span className="relative text-[11px] font-semibold uppercase tracking-[0.42em] text-white">
          {label}
        </span>
      ) : null}
    </span>
  );
}
