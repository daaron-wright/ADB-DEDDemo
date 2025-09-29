import { cn } from "@/lib/utils";

export interface JourneyStep {
  id: string;
  label: string;
  state: "completed" | "current" | "upcoming";
}

interface JourneyStepperProps {
  steps: JourneyStep[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function JourneyStepper({
  steps,
  currentStepId,
  onStepClick,
  className,
}: JourneyStepperProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-white/30 to-white/30",
        "backdrop-blur-xl",
        "border-b border-white/30",
        className,
      )}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />

      <div className="relative flex min-h-[80px]">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-1 items-center justify-center",
                "border-r border-white/30",
                isLast && "border-r-0",
                step.state === "current" && "bg-white/10",
                step.state === "upcoming" && "opacity-50",
              )}
            >
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={step.state === "upcoming"}
                className={cn(
                  "flex flex-col items-center gap-1 p-4 transition-all",
                  "hover:bg-white/5 rounded-lg",
                  "disabled:cursor-not-allowed disabled:hover:bg-transparent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "text-sm font-bold text-white text-center leading-tight",
                      step.state === "current" && "font-bold",
                      step.state === "upcoming" && "font-semibold",
                    )}
                  >
                    {step.label}
                  </span>

                  {/* Radio button indicator */}
                  <div className="flex items-center justify-center">
                    {step.state === "completed" ? (
                      <div className="w-6 h-6 rounded-full bg-[#54FFD4] flex items-center justify-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-black"
                        >
                          <path
                            d="M13.5 4.5L6 12L2.5 8.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : step.state === "current" ? (
                      <div className="w-6 h-6 rounded-full bg-[#54FFD4] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-black" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-transparent" />
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
