import type { MutableRefObject } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  JourneyAnimationPhase,
  JourneyTimelineItem,
  NextActionItem,
  NextActionStatus,
} from "./journey-types";

interface JourneyOrchestrationPanelProps {
  introMessage: string;
  actions: NextActionItem[];
  remainingActionCount: number;
  focusedActionId: string | null;
  completionState: Record<string, boolean>;
  onToggleAction: (id: string) => void;
  onActionClick: (action: NextActionItem) => void;
  nextActionRefs: MutableRefObject<Record<string, HTMLElement | null>>;
  getNextActionToken: (status: NextActionStatus) => {
    label: string;
    badgeClass: string;
    helperClass: string;
  };
  timelineItems: JourneyTimelineItem[];
  currentStageLabel: string;
  chatPhase: JourneyAnimationPhase | null;
  chatProgress: number;
  isStageManuallySelected: boolean;
  onResumeAutomation: () => void;
  onViewJourney: (stageId: string) => void;
  onOpenAutomation: () => void;
  formatDueDate?: (isoString: string) => string;
}

export function JourneyOrchestrationPanel({
  introMessage,
  actions,
  remainingActionCount,
  focusedActionId,
  completionState,
  onToggleAction,
  onActionClick,
  nextActionRefs,
  getNextActionToken,
  timelineItems,
  currentStageLabel,
  chatPhase,
  chatProgress,
  isStageManuallySelected,
  onResumeAutomation,
  onViewJourney,
  onOpenAutomation,
  formatDueDate,
}: JourneyOrchestrationPanelProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_48px_-32px_rgba(11,64,55,0.28)] backdrop-blur-xl">
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-slate-900">
          Journey orchestration
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">{introMessage}</p>
      </div>

      {actions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              To-do bank
            </p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {remainingActionCount} of {actions.length} remaining
            </span>
          </div>
          <ol className="space-y-3">
            {actions.map((action) => {
              const token = getNextActionToken(action.status);
              const isFocused = focusedActionId === action.id;
              const dueLabel =
                action.dueDate && formatDueDate
                  ? formatDueDate(action.dueDate)
                  : null;
              const isCompleted = completionState[action.id] ?? false;

              return (
                <li key={action.id}>
                  <div
                    ref={(node) => {
                      nextActionRefs.current[action.id] = node;
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-3 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0f766e]/40",
                      isFocused
                        ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_16px_32px_-28px_rgba(11,64,55,0.32)]"
                        : "border-[#d8e4df] bg-white hover:border-[#0f766e]/60 hover:bg-[#f4faf8]",
                      isCompleted && !isFocused
                        ? "border-[#d8e4df] bg-white/80"
                        : null,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleAction(action.id)}
                      className={cn(
                        "mt-1 flex h-8 w-8 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/40",
                        isCompleted
                          ? "border-[#0f766e] bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(11,64,55,0.35)]"
                          : "border-[#cfe4dd] bg-white text-[#0f766e] hover:border-[#0f766e]",
                      )}
                      aria-pressed={isCompleted}
                      aria-label={
                        isCompleted
                          ? `Mark ${action.label} as not done`
                          : `Mark ${action.label} as done`
                      }
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-[#9dbbb1]" />
                      )}
                    </button>
                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => onActionClick(action)}
                        className="w-full text-left"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm font-semibold text-slate-900",
                              isCompleted &&
                                "text-slate-500 line-through decoration-1 decoration-slate-400",
                            )}
                          >
                            {action.label}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                              token.badgeClass,
                              isCompleted && "opacity-70",
                            )}
                          >
                            {token.label}
                          </span>
                        </div>
                        {action.description ? (
                          <p className="mt-2 text-xs leading-relaxed text-slate-600">
                            {action.description}
                          </p>
                        ) : null}
                        {action.id === "business-activity-guidance" ? (
                          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3645b0]">
                            Tap to open the business activities questionnaire.
                          </p>
                        ) : null}
                        {(action.stageTitle || dueLabel) && (
                          <p
                            className={cn(
                              "mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              token.helperClass,
                              isCompleted && "opacity-70",
                            )}
                          >
                            {action.stageTitle
                              ? `Stage: ${action.stageTitle}`
                              : ""}
                            {action.stageTitle && dueLabel ? " • " : ""}
                            {dueLabel ? `Due ${dueLabel}` : ""}
                          </p>
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {timelineItems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Journey timeline
            </p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Active: {currentStageLabel}
            </span>
          </div>
          <ol className="space-y-3">
            {timelineItems.map((item, index) => {
              const isAutomation = item.id === "generating-application";
              const isStage = !isAutomation;

              const containerClasses = cn(
                "rounded-2xl border px-4 py-3 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0f766e]/40",
                item.isCurrent
                  ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_16px_32px_-28px_rgba(11,64,55,0.32)]"
                  : "border-[#d8e4df] bg-white hover:border-[#0f766e]/60 hover:bg-[#f4faf8]",
              );

              const content = (
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      item.isCurrent
                        ? "bg-[#0f766e] text-white"
                        : "bg-[#f4faf8] text-[#0f766e]",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                          item.statusBadgeClass,
                        )}
                      >
                        {item.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                    {item.meta ? (
                      <p
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-[0.18em]",
                          item.statusHelperClass,
                        )}
                      >
                        {item.meta}
                      </p>
                    ) : null}
                    {item.showProgress && chatPhase ? (
                      <div className="space-y-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6f2ed]">
                          <div
                            className="h-full rounded-full bg-[#0f766e] transition-all duration-700"
                            style={{ width: `${chatProgress}%` }}
                          />
                        </div>
                        {chatPhase.keyConsiderations?.length ? (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                            {chatPhase.keyConsiderations[0]}
                          </p>
                        ) : null}
                        {isStageManuallySelected ? (
                          <button
                            type="button"
                            onClick={onResumeAutomation}
                            className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#eaf7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                          >
                            Resume automation
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    {isStage ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewJourney(item.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#0f766e] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-white hover:text-[#0f766e] hover:shadow-[0_14px_28px_-22px_rgba(11,64,55,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                        >
                          Open stage
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );

              return (
                <li key={item.id}>
                  {isAutomation ? (
                    <button
                      type="button"
                      onClick={onOpenAutomation}
                      className={cn(
                        containerClasses,
                        "w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/40",
                      )}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className={containerClasses}>{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
