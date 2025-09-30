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

export function JourneyBreadcrumb({ steps, currentStepId, className }: JourneyBreadcrumbProps) {
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
          isCompleted && "border-[#0E766E] bg-[#0E766E] text-white",
          isCurrent && !isCompleted && "border-[#0E766E] bg-[#0E766E]/10 text-[#0A4A46]",
          !isCompleted && !isCurrent && "border-slate-200 bg-white text-slate-400",
        );
        const labelClasses = cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em] transition", 
          isCompleted && "text-[#0E766E]",
          isCurrent && !isCompleted && "text-[#0A4A46]",
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
                  (isCompleted || isCurrent) && "bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7]",
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
