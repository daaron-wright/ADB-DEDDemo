import { PolarisIcon } from "@/components/ui/polaris-icon";
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
        "relative inline-flex h-12 w-12 items-center justify-center overflow-visible rounded-full bg-white",
        "ring-1 ring-neutral-200",
        className,
      )}
    >
      {showLabel ? (
        <span className="relative text-[11px] font-semibold uppercase tracking-[0.42em] text-neutral-600">
          {label}
        </span>
      ) : (
        <PolarisIcon className="h-full w-full" scale={1.65} />
      )}
    </span>
  );
}
