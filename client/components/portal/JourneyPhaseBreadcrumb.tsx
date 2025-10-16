import { cn } from "@/lib/utils";

const JOURNEY_PHASES = [
  {
    id: "ideate",
    label: "Ideate",
    helper: "Shape your concept, AI intake, and automation setup",
  },
  {
    id: "apply",
    label: "Apply",
    helper: "Reserve your trade name and submit the application package",
  },
  {
    id: "operate",
    label: "Operate",
    helper: "Prepare inspections, utilities, and compliance handoffs",
  },
  {
    id: "collaborate",
    label: "Collaborate",
    helper: "Scale with ongoing compliance and growth partners",
  },
] as const;

export type JourneyPhaseId = (typeof JOURNEY_PHASES)[number]["id"];

type JourneyPhaseBreadcrumbProps = {
  activePhase: JourneyPhaseId;
  currentStageLabel?: string;
};

type PhaseStatus = "complete" | "current" | "upcoming";

const PHASE_STATUS_STYLES: Record<PhaseStatus, { dot: string; label: string; helper: string }> = {
  complete: {
    dot: "bg-[#0f766e] border-[#0f766e]",
    label: "text-[#0f766e]",
    helper: "text-slate-500",
  },
  current: {
    dot: "bg-white border-[#0f766e] shadow-[0_0_0_4px_rgba(15,118,110,0.15)]",
    label: "text-[#0f766e]",
    helper: "text-slate-600",
  },
  upcoming: {
    dot: "bg-white border-[#dbe7e1]",
    label: "text-slate-500",
    helper: "text-slate-400",
  },
};

function getPhaseStatus(phaseId: JourneyPhaseId, activePhase: JourneyPhaseId): PhaseStatus {
  const activeIndex = JOURNEY_PHASES.findIndex((phase) => phase.id === activePhase);
  const phaseIndex = JOURNEY_PHASES.findIndex((phase) => phase.id === phaseId);

  if (phaseIndex === -1 || activeIndex === -1) {
    return "upcoming";
  }

  if (phaseIndex < activeIndex) {
    return "complete";
  }

  if (phaseIndex === activeIndex) {
    return "current";
  }

  return "upcoming";
}

export function JourneyPhaseBreadcrumb({ activePhase, currentStageLabel }: JourneyPhaseBreadcrumbProps) {
  return (
    <nav
      aria-label="Journey phases"
      className="rounded-2xl border border-[#dbe7e1] bg-white/90 px-4 py-3 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:px-6"
    >
      <ol className="flex flex-wrap items-center gap-4 sm:gap-6">
        {JOURNEY_PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.id, activePhase);
          const token = PHASE_STATUS_STYLES[status];
          const isCurrent = status === "current";

          return (
            <li key={phase.id} className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full border transition",
                    token.dot,
                  )}
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.18em]",
                      token.label,
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {phase.label}
                  </p>
                  <p className={cn("text-[11px] leading-tight", token.helper)}>{phase.helper}</p>
                  {isCurrent && currentStageLabel ? (
                    <p className="text-xs font-semibold text-[#0f766e]">
                      Current focus: {currentStageLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              {index < JOURNEY_PHASES.length - 1 ? (
                <span
                  className="hidden h-px w-12 shrink-0 bg-[#dbe7e1] sm:block"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
