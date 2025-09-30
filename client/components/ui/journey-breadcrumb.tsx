import { cn } from "@/lib/utils";

interface JourneyBreadcrumbStep {
  id: string;
  label: string;
}

interface JourneyBreadcrumbProps {
  steps: JourneyBreadcrumbStep[];
  currentStepId: string;
  className?: string;
}

export function JourneyBreadcrumb({
  steps,
  currentStepId,
  className,
}: JourneyBreadcrumbProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStepId),
  );

  return (
    <nav
      aria-label="Journey progress"
      className={cn(
        "flex w-full flex-wrap items-center gap-3 text-xs",
        "sm:gap-4",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const indicatorClasses = cn(
          "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition",
          isCompleted &&
            "border-[#0E766E] bg-[#0E766E] text-white shadow-[0_8px_18px_rgba(14,118,110,0.35)]",
          isCurrent &&
            !isCompleted &&
            "border-[#0E766E] bg-white/70 text-[#0A4A46] shadow-[0_10px_24px_rgba(14,118,110,0.28)] backdrop-blur-sm",
          !isCompleted &&
            !isCurrent &&
            "border-white/30 bg-white/40 text-slate-400 backdrop-blur-sm",
        );
        const labelClasses = cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em] transition",
          isCompleted && "text-[#0E766E]",
          isCurrent && !isCompleted &&
            "text-[#0A4A46] drop-shadow-[0_4px_12px_rgba(14,118,110,0.25)]",
          !isCompleted && !isCurrent && "text-slate-400",
        );

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={indicatorClasses} aria-hidden="true">
                {index + 1}
              </span>
              <span
                className={labelClasses}
                aria-current={isCurrent ? "step" : undefined}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "h-px w-10 bg-slate-200",
                  "sm:w-12",
                  "md:w-16",
                  (isCompleted || isCurrent) &&
                    "bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7]",
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
