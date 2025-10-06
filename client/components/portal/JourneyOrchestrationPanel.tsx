import type { MutableRefObject } from "react";
import * as React from "react";
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
  onTimelineFocusChange?: (isFocused: boolean) => void;
  formatDueDate?: (isoString: string) => string;
  automationStatus?: {
    title: string;
    description: string;
    statusLabel: string;
    statusBadgeClass: string;
    statusHelperClass: string;
    meta?: string | null;
    showProgress: boolean;
  };
  stageNumberOffset?: number;
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
  onTimelineFocusChange,
  formatDueDate,
  automationStatus,
  stageNumberOffset = 0,
}: JourneyOrchestrationPanelProps) {
  const completedActions = React.useMemo(
    () =>
      actions.filter(
        (action) => (completionState[action.id] ?? false) === true,
      ),
    [actions, completionState],
  );
  const outstandingActions = React.useMemo(
    () => actions.filter((action) => !(completionState[action.id] ?? false)),
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

  const [selectedTimelineId, setSelectedTimelineId] = React.useState<string>(
    () => {
      const prioritized =
        timelineItems.find((item) => item.isCurrent) ?? timelineItems[0];
      return prioritized?.id ?? "";
    },
  );
  const userSelectedTimelineRef = React.useRef(false);
  const timelineFocusRef = React.useRef(false);

  const updateTimelineFocus = React.useCallback(
    (isFocused: boolean) => {
      if (timelineFocusRef.current !== isFocused) {
        timelineFocusRef.current = isFocused;
        onTimelineFocusChange?.(isFocused);
      }
    },
    [onTimelineFocusChange],
  );

  React.useEffect(() => {
    if (timelineItems.length === 0) {
      userSelectedTimelineRef.current = false;
      updateTimelineFocus(false);
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
      updateTimelineFocus(false);
      setSelectedTimelineId(prioritized?.id ?? "");
      return;
    }

    if (
      !userSelectedTimelineRef.current &&
      prioritized &&
      prioritized.id !== selectedTimelineId
    ) {
      updateTimelineFocus(false);
      setSelectedTimelineId(prioritized.id);
    }
  }, [timelineItems, selectedTimelineId, updateTimelineFocus]);

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
    updateTimelineFocus(true);
    setSelectedTimelineId(id);
  };

  const tabIdPrefix = "journey-timeline-tab";
  const panelIdPrefix = "journey-timeline-panel";


  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-slate-900">
          Journey orchestration
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">{introMessage}</p>
      </div>

      {hasActions || hasTimelineSection ? (
        <div className="space-y-6">
          {hasActions ? (
            <div className="rounded-2xl bg-[#f5faf7] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Application progress
                </p>
                <span className="text-sm font-semibold text-slate-700">
                  {completedCount} / {totalActions} complete (
                  {completionPercent}%)
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
                Focus on the outstanding actions to keep your workspace moving
                toward issuance.
              </p>
            </div>
          ) : null}

          {hasTimelineSection ? (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Journey timeline
                </p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active: {currentStageLabel}
                </span>
              </div>
              {automationStatus ? (
                <div className="rounded-2xl border border-[#d8e4df] bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        Automation orchestration
                      </p>
                      <h5 className="mt-1 text-lg font-semibold text-slate-900">
                        {automationStatus.title}
                      </h5>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                        automationStatus.statusBadgeClass,
                      )}
                    >
                      {automationStatus.statusLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {automationStatus.description}
                  </p>
                  {automationStatus.meta ? (
                    <p
                      className={cn(
                        "mt-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        automationStatus.statusHelperClass,
                      )}
                    >
                      {automationStatus.meta}
                    </p>
                  ) : null}
                  {automationStatus.showProgress && chatPhase ? (
                    <div className="mt-4 space-y-3">
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
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenAutomation}
                      className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                    >
                      Manage automation
                    </button>
                    {automationStatus.showProgress ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        In progress
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
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
                  const stageNumber = index + 1 + stageNumberOffset;

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
                          {stageNumber}
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
                  className="space-y-5"
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
                        ? selectedTimelineIndex + 1 + stageNumberOffset
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
                    <button
                      type="button"
                      onClick={() => onViewJourney(selectedTimelineItem.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                    >
                      Open stage
                    </button>
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
                      <p className="text-sm text-slate-600">
                        You're up to date for this stage.
                      </p>
                    )}
                  </div>

                  {selectedCompletedCount > 0 ? (
                    <details className="space-y-3">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-700">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                          Completed actions ({selectedCompletedCount})
                        </span>
                        <span className="text-xs text-slate-500">Toggle</span>
                      </summary>
                      <ol className="mt-3 space-y-3">
                        {selectedCompletedActions.map((action) =>
                          renderActionRow(action),
                        )}
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
