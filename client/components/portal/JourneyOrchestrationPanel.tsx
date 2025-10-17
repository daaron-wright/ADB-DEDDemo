import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DocumentVaultCard } from "./DocumentVaultCard";
import { DocumentVaultLayout } from "./DocumentVaultLayout";
import { useDocumentVaultContext } from "./DocumentVaultContext";

import type {
  JourneyAnimationPhase,
  JourneyTimelineItem,
  NextActionItem,
} from "./journey-types";

export interface JourneyOrchestrationPanelCopy {
  heading: string;
  timelineLabel: string;
  activePrefix: string;
  activeStage: string;
  yourNextStep: string;
  tasksCompleteMessage: string;
  automationMessage: string;
  openNextTask: string;
  reviewStage: string;
  timelineAriaLabel: string;
}

interface JourneyOrchestrationPanelProps {
  introMessage: string;
  actions: NextActionItem[];
  remainingActionCount: number;
  completionState: Record<string, boolean>;
  timelineItems: JourneyTimelineItem[];
  currentStageLabel: string;
  chatPhase: JourneyAnimationPhase | null;
  chatProgress: number;
  isStageManuallySelected: boolean;
  onResumeAutomation: () => void;
  onViewJourney: (stageId: string) => void;
  onTimelineFocusChange?: (isFocused: boolean) => void;
  stageNumberOffset?: number;
  copy?: Partial<JourneyOrchestrationPanelCopy>;
  highlightedActionId?: string | null;
}

export function JourneyOrchestrationPanel({
  introMessage,
  actions,
  remainingActionCount,
  completionState,
  timelineItems,
  currentStageLabel,
  chatPhase,
  chatProgress,
  isStageManuallySelected,
  onResumeAutomation,
  onViewJourney,
  onTimelineFocusChange,
  stageNumberOffset = 0,
  copy,
  highlightedActionId,
}: JourneyOrchestrationPanelProps) {
  const hasTimelineSection = timelineItems.length > 0;

  const defaultCopy: JourneyOrchestrationPanelCopy = React.useMemo(
    () => ({
      heading: "Journey orchestration",
      timelineLabel: "Journey timeline",
      activePrefix: "Active:",
      activeStage: "Active stage",
      yourNextStep: "Your next step",
      tasksCompleteMessage:
        "All tasks for this stage are complete. Monitor automation updates.",
      automationMessage: "Automation is handling the remaining work for you.",
      openNextTask: "Open next task",
      reviewStage: "Review stage",
      timelineAriaLabel: "Journey stages navigation",
    }),
    [],
  );

  const localizedCopy = React.useMemo(
    () => ({ ...defaultCopy, ...copy }),
    [copy, defaultCopy],
  );

  const vaultContext = useDocumentVaultContext();

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

  const stageSpecificActions = React.useMemo(() => {
    if (!selectedTimelineItem) {
      return [] as NextActionItem[];
    }

    const normalizedTitle = selectedTimelineItem.title.toLowerCase();

    return actions.filter((action) => {
      if (action.stageId && action.stageId === selectedTimelineItem.id) {
        return true;
      }

      if (
        action.stageTitle &&
        action.stageTitle.toLowerCase() === normalizedTitle
      ) {
        return true;
      }

      return false;
    });
  }, [actions, selectedTimelineItem]);

  const primaryOutstandingAction = React.useMemo(() => {
    return (
      stageSpecificActions.find(
        (action) => (completionState[action.id] ?? false) === false,
      ) ?? null
    );
  }, [stageSpecificActions, completionState]);

  const nextActionMessage = React.useMemo(() => {
    if (primaryOutstandingAction) {
      return primaryOutstandingAction.label;
    }

    if (stageSpecificActions.length > 0) {
      return localizedCopy.tasksCompleteMessage;
    }

    if (selectedTimelineItem?.meta) {
      return selectedTimelineItem.meta;
    }

    return localizedCopy.automationMessage;
  }, [
    primaryOutstandingAction,
    stageSpecificActions,
    selectedTimelineItem,
    localizedCopy,
  ]);

  const ctaButtonLabel = primaryOutstandingAction
    ? localizedCopy.openNextTask
    : localizedCopy.reviewStage;

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

  const isDocumentVaultStage =
    selectedTimelineItem?.id === "document-submissions";
  const hasVaultDocuments = Boolean(vaultContext?.totalDocuments);
  const shouldShowVaultSummary =
    Boolean(vaultContext) && hasVaultDocuments && isDocumentVaultStage;

  const vaultSubtitle =
    vaultContext && vaultContext.totalDocuments > 0
      ? `${vaultContext.completedDocuments}/${vaultContext.totalDocuments} documents ready`
      : "Documents syncing";
  const vaultProcessing = Boolean(vaultContext?.isVaultSyncing);
  const vaultStatusHeading = vaultContext
    ? vaultProcessing
      ? "Syncing your documents"
      : vaultContext.allDocumentsCompleted
        ? "Vault up to date"
        : "Sync in progress"
    : "";
  const vaultStatusDescription = vaultContext
    ? vaultProcessing
      ? "Polaris is syncing new files from your journey stages."
      : vaultContext.allDocumentsCompleted
        ? "Every document is stored with the latest updates."
        : "Documents update automatically whenever you finish a stage."
    : "";

  const activeVaultDocument = vaultContext?.documents.find(
    (item) => item.isExpanded,
  );

  const handleVaultDocumentSelect = React.useCallback(
    (id: string) => {
      if (!vaultContext) {
        return;
      }
      handleTimelineSelect("document-submissions");
      onViewJourney("document-submissions");
      vaultContext.setDocuments((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                isExpanded: item.status !== "completed",
              }
            : {
                ...item,
                isExpanded: false,
              },
        ),
      );
    },
    [handleTimelineSelect, onViewJourney, vaultContext],
  );

  const tabIdPrefix = "journey-timeline-tab";
  const panelIdPrefix = "journey-timeline-panel";

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-slate-900">
          {localizedCopy.heading}
        </h4>
        <p className="text-sm leading-relaxed text-slate-700">{introMessage}</p>
      </div>

      {hasTimelineSection ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              {localizedCopy.timelineLabel}
            </p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {localizedCopy.activePrefix} {currentStageLabel}
            </span>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            role="tablist"
            aria-label={localizedCopy.timelineAriaLabel}
          >
            {timelineItems.map((item) => {
              const isActive = item.id === selectedTimelineItem?.id;
              const tabId = `${tabIdPrefix}-${item.id}`;
              const panelId = `${panelIdPrefix}-${item.id}`;

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
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                        item.statusLabel.toLowerCase().includes("completed")
                          ? "bg-[#0f766e] text-white"
                          : item.statusLabel.toLowerCase().includes("progress")
                            ? "bg-[#f4faf8] text-[#0f766e]"
                            : "border border-[#d8e4df] bg-white text-[#0f766e]",
                      )}
                    >
                      {item.statusLabel.toLowerCase().includes("completed") ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.statusLabel}
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
                      {localizedCopy.activeStage}
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

              <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-white p-4 shadow-[0_16px_32px_-28px_rgba(11,64,55,0.28)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      {localizedCopy.yourNextStep}
                    </p>
                    <p className="text-sm text-slate-600">
                      {nextActionMessage}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onViewJourney(selectedTimelineItem.id)}
                    className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    {ctaButtonLabel}
                  </Button>
                </div>
                {primaryOutstandingAction?.description ? (
                  <p className="text-xs text-slate-500">
                    {primaryOutstandingAction.description}
                  </p>
                ) : null}
              </div>

              {shouldShowVaultSummary ? (
                <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white/95 p-4 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.22)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Document vault
                    </p>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {vaultSubtitle}
                    </span>
                  </div>
                  <DocumentVaultLayout
                    isProcessing={vaultProcessing}
                    statusHeading={vaultStatusHeading}
                    statusDescription={vaultStatusDescription}
                    activeDocument={activeVaultDocument}
                  >
                    {vaultContext?.documents.map((item) => (
                      <DocumentVaultCard
                        key={item.id}
                        item={item}
                        isActive={item.isExpanded}
                        onSelect={handleVaultDocumentSelect}
                      />
                    ))}
                  </DocumentVaultLayout>
                  {vaultContext?.allDocumentsCompleted ? (
                    <div className="rounded-2xl border border-[#94d2c2] bg-[#dff2ec]/60 p-3 text-xs font-semibold text-[#0b7d6f]">
                      Every document is signed and stored. You can issue the
                      licence.
                    </div>
                  ) : null}
                </div>
              ) : null}

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
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
