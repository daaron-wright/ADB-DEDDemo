import type { MutableRefObject } from "react";
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

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
  const completedActions = React.useMemo(
    () =>
      actions.filter((action) => (completionState[action.id] ?? false) === true),
    [actions, completionState],
  );
  const outstandingActions = React.useMemo(
    () =>
      actions.filter((action) => !(completionState[action.id] ?? false)),
    [actions, completionState],
  );

  const totalActions = actions.length;
  const completedCount = completedActions.length;
  const outstandingCount = outstandingActions.length;
  const outstandingDisplayCount = remainingActionCount ?? outstandingCount;
  const completionPercent =
    totalActions === 0 ? 0 : Math.round((completedCount / totalActions) * 100);
  const hasActions = totalActions > 0;
  const hasTimelineSection = timelineItems.length > 0;

  const [selectedTimelineId, setSelectedTimelineId] = React.useState<string>(() => {
    const prioritized =
      timelineItems.find((item) => item.isCurrent) ?? timelineItems[0];
    return prioritized?.id ?? "";
  });
  const userSelectedTimelineRef = React.useRef(false);

  React.useEffect(() => {
    if (timelineItems.length === 0) {
      userSelectedTimelineRef.current = false;
      setSelectedTimelineId("");
      return;
    }

    const prioritized =
      timelineItems.find((item) => item.isCurrent) ?? timelineItems[0];
    const selectedExists = timelineItems.some(
      (item) => item.id === selectedTimelineId,
    );

    if (!selectedExists) {
      userSelectedTimelineRef.current = false;
      setSelectedTimelineId(prioritized?.id ?? "");
      return;
    }

    if (
      !userSelectedTimelineRef.current &&
      prioritized &&
      prioritized.id !== selectedTimelineId
    ) {
      setSelectedTimelineId(prioritized.id);
    }
  }, [timelineItems, selectedTimelineId]);

  const selectedTimelineItem = React.useMemo(() => {
    return (
      timelineItems.find((item) => item.id === selectedTimelineId) ??
      timelineItems[0] ??
      null
    );
  }, [timelineItems, selectedTimelineId]);

  const selectedTimelineIndex = React.useMemo(() => {
    if (!selectedTimelineItem) {
      return -1;
    }

    return timelineItems.findIndex(
      (item) => item.id === selectedTimelineItem.id,
    );
  }, [timelineItems, selectedTimelineItem]);

  const handleTimelineSelect = (id: string) => {
    userSelectedTimelineRef.current = true;
    setSelectedTimelineId(id);
  };

  const stageActionSummary = React.useMemo(() => {
    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");

    const summary: Record<
      string,
      { outstanding: NextActionItem[]; completed: NextActionItem[] }
    > = {};

    timelineItems.forEach((item) => {
      summary[item.id] = { outstanding: [], completed: [] };
    });

    const timelineLookup = timelineItems.reduce<Record<string, string>>(
      (accumulator, item) => {
        accumulator[normalize(item.title)] = item.id;
        return accumulator;
      },
      {},
    );

    actions.forEach((action) => {
      let targetId: string | null = null;

      if (action.stageTitle) {
        const normalizedStage = normalize(action.stageTitle);
        targetId = timelineLookup[normalizedStage] ?? null;
      }

      if (!targetId && timelineItems.length > 0) {
        const currentItem = timelineItems.find((item) => item.isCurrent);
        targetId = currentItem?.id ?? timelineItems[0].id;
      }

      if (!targetId) {
        return;
      }

      if (!summary[targetId]) {
        summary[targetId] = { outstanding: [], completed: [] };
      }

      const isCompleted = completionState[action.id] ?? false;
      if (isCompleted) {
        summary[targetId].completed.push(action);
      } else {
        summary[targetId].outstanding.push(action);
      }
    });

    return summary;
  }, [actions, completionState, timelineItems]);

  const selectedStageSummary = React.useMemo(() => {
    if (!selectedTimelineItem) {
      return { outstanding: [], completed: [] };
    }

    return (
      stageActionSummary[selectedTimelineItem.id] ?? {
        outstanding: [],
        completed: [],
      }
    );
  }, [selectedTimelineItem, stageActionSummary]);

  const selectedOutstandingActions = selectedStageSummary.outstanding;
  const selectedCompletedActions = selectedStageSummary.completed;
  const selectedOutstandingCount = selectedOutstandingActions.length;
  const selectedCompletedCount = selectedCompletedActions.length;

  const outstandingCountsByStage = React.useMemo(() => {
    return timelineItems.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.id] =
        stageActionSummary[item.id]?.outstanding.length ?? 0;
      return accumulator;
    }, {});
  }, [timelineItems, stageActionSummary]);

  const tabIdPrefix = "journey-timeline-tab";
  const panelIdPrefix = "journey-timeline-panel";

  const [showCompletedTasks, setShowCompletedTasks] = React.useState(false);

  React.useEffect(() => {
    if (selectedCompletedCount === 0 && showCompletedTasks) {
      setShowCompletedTasks(false);
    }
  }, [selectedCompletedCount, showCompletedTasks]);

  React.useEffect(() => {
    setShowCompletedTasks(false);
  }, [selectedTimelineId]);

  const renderActionRow = (action: NextActionItem) => {
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
            "flex items-start gap-4 rounded-2xl border px-5 py-4 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0f766e]/40",
            isFocused
              ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_20px_36px_-26px_rgba(11,64,55,0.35)]"
              : "border-[#d8e4df] bg-white hover:border-[#0f766e]/60 hover:bg-[#f4faf8]",
            isCompleted && !isFocused
              ? "border-[#d8e4df] bg-white/75"
              : null,
          )}
        >
          <button
            type="button"
            onClick={() => onToggleAction(action.id)}
            className={cn(
              "mt-1 flex h-9 w-9 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/40",
              isCompleted
                ? "border-[#0f766e] bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(11,64,55,0.35)]"
                : "border-[#cfe4dd] bg-white text-[#0f766e] hover:border-[#0f766e]",
            )}
            aria-pressed={isCompleted}
            aria-label=
              {isCompleted
                ? `Mark ${action.label} as not done`
                : `Mark ${action.label} as done`}
          >
            {isCompleted ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[#9dbbb1]" />
            )}
          </button>
          <div className="flex-1 space-y-3">
            <button
              type="button"
              onClick={() => onActionClick(action)}
              className="w-full text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-base font-semibold text-slate-900",
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
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
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
                  {action.stageTitle ? `Stage: ${action.stageTitle}` : ""}
                  {action.stageTitle && dueLabel ? " • " : ""}
                  {dueLabel ? `Due ${dueLabel}` : ""}
                </p>
              )}
            </button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-8 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(11,64,55,0.2)] sm:p-8 lg:space-y-8">
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-slate-900">
          Journey orchestration
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">{introMessage}</p>
      </div>

      {(hasActions || hasTimelineSection) ? (
        <div className="space-y-6">
          {hasActions ? (
            <div className="rounded-3xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.24)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Application progress
                </p>
                <span className="text-sm font-semibold text-slate-700">
                  {completedCount} / {totalActions} complete ({completionPercent}%)
                </span>
              </div>
              <div className="mt-4 h-2.5 w-full rounded-full bg-[#e6f2ed]">
                <div
                  className="h-full rounded-full bg-[#0f766e] transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="font-semibold text-[#0f766e]">
                  {outstandingDisplayCount} remaining
                </span>
                <span>{completedCount} done</span>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Focus on the outstanding actions to keep your workspace moving toward issuance.
              </p>
            </div>
          ) : null}

          {hasTimelineSection ? (
            <section className="space-y-5 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.24)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Journey timeline
                </p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active: {currentStageLabel}
                </span>
              </div>
              <div
                className="flex gap-3 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Journey stages navigation"
              >
                {timelineItems.map((item, index) => {
                  const isActive = item.id === selectedTimelineItem?.id;
                  const tabId = `${tabIdPrefix}-${item.id}`;
                  const panelId = `${panelIdPrefix}-${item.id}`;
                  const outstandingForStage =
                    outstandingCountsByStage[item.id] ?? 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      id={tabId}
                      aria-selected={isActive}
                      aria-controls={panelId}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleTimelineSelect(item.id)}
                      className={cn(
                        "min-w-[200px] rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/40",
                        isActive
                          ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_16px_32px_-28px_rgba(11,64,55,0.32)]"
                          : "border-[#d8e4df] bg-white hover:border-[#0f766e]/60 hover:bg-[#f4faf8]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            isActive || item.isCurrent
                              ? "bg-[#0f766e] text-white"
                              : "bg-[#f4faf8] text-[#0f766e]",
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5",
                                item.statusBadgeClass,
                              )}
                            >
                              {item.statusLabel}
                            </span>
                            {outstandingForStage > 0 ? (
                              <span className="inline-flex items-center rounded-full bg-[#0f766e]/10 px-2 py-0.5 text-[#0f766e]">
                                {outstandingForStage}
                              </span>
                            ) : null}
                            {item.isCurrent ? (
                              <span className="text-[#0f766e]">Current</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedTimelineItem ? (
                <div
                  id={`${panelIdPrefix}-${selectedTimelineItem.id}`}
                  role="tabpanel"
                  aria-labelledby={`${tabIdPrefix}-${selectedTimelineItem.id}`}
                  className="space-y-5 rounded-2xl bg-white p-5 shadow-[0_12px_24px_-20px_rgba(11,64,55,0.18)]"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <span
                      className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        selectedTimelineItem.isCurrent
                          ? "bg-[#0f766e] text-white"
                          : "bg-[#f4faf8] text-[#0f766e]",
                      )}
                    >
                      {selectedTimelineIndex >= 0
                        ? selectedTimelineIndex + 1
                        : "–"}
                    </span>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h5 className="text-lg font-semibold text-slate-900">
                          {selectedTimelineItem.title}
                        </h5>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                            selectedTimelineItem.statusBadgeClass,
                          )}
                        >
                          {selectedTimelineItem.statusLabel}
                        </span>
                      </div>
                      {selectedTimelineItem.isCurrent ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                          Active stage
                        </p>
                      ) : null}
                      <p className="text-sm leading-relaxed text-slate-600">
                        {selectedTimelineItem.description}
                      </p>
                      {selectedTimelineItem.meta ? (
                        <p
                          className={cn(
                            "text-[11px] font-semibold uppercase tracking-[0.18em]",
                            selectedTimelineItem.statusHelperClass,
                          )}
                        >
                          {selectedTimelineItem.meta}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {selectedTimelineItem.showProgress && chatPhase ? (
                    <div className="space-y-3 rounded-2xl bg-[#f4faf8] p-4">
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
                          className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                        >
                          Resume automation
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    {selectedTimelineItem.id === "generating-application" ? (
                      <button
                        type="button"
                        onClick={onOpenAutomation}
                        className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                      >
                        Manage automation
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onViewJourney(selectedTimelineItem.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                      >
                        Open stage
                      </button>
                    )}
                    {selectedTimelineItem.isCurrent ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        You're here
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      <span>Outstanding actions</span>
                      <span>{selectedOutstandingCount}</span>
                    </div>
                    {selectedOutstandingCount > 0 ? (
                      <ol className="space-y-3">
                        {selectedOutstandingActions.map((action) =>
                          renderActionRow(action),
                        )}
                      </ol>
                    ) : (
                      <p className="rounded-2xl bg-[#f5f8f7] px-5 py-4 text-sm text-slate-600">
                        You're up to date for this stage.
                      </p>
                    )}
                  </div>

                  {selectedCompletedCount > 0 ? (
                    <details className="rounded-2xl border border-[#d8e4df] bg-white/90 p-4">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-700">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                          Completed actions ({selectedCompletedCount})
                        </span>
                        <span className="text-xs text-slate-500">Toggle</span>
                      </summary>
                      <ol className="mt-3 space-y-3">
                        {selectedCompletedActions.map((action) => renderActionRow(action))}
                      </ol>
                    </details>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
