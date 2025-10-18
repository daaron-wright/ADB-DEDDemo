import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StageSlideNavigator, type StageSlide } from "./StageSlideNavigator";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  JourneyHighlightState,
  JourneyStage,
  JourneyStageStatusState,
  JourneyTaskStatus,
  JourneyTimelineItem,
} from "./journey-types";
import type { BusinessActivity } from "./BusinessActivitiesSelection";
import { BusinessRegistrationFocusContent } from "./BusinessRegistrationFocusContent";
import { DocumentSubmissionFocusContent } from "./DocumentSubmissionFocusContent";
import { PreOperationalInspectionFocusContent } from "./PreOperationalInspectionFocusContent";
import { ComplianceGrowthFocusContent } from "./ComplianceGrowthFocusContent";

interface StageTokens {
  badgeClass: string;
  detailClass: string;
  dotClass: string;
  stateLabel: string;
}

interface TaskToken {
  label: string;
  badgeClass: string;
  helperClass: string;
}

interface StageNavigationConfig {
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
}

interface StageRecommendedActivity {
  id: string;
  label: string;
  description: string;
  type: "trade-name" | "document" | "licensing" | "inspection" | "compliance" | "general";
}

interface StageActivitiesContext {
  recommended: BusinessActivity[];
  selectedIds: string[];
  onToggle: (activityId: string) => void;
  available: BusinessActivity[];
  onAdd: (activityId: string) => void;
}

export interface LegalFormOption {
  id: string;
  title: string;
  highlights: string[];
}

export interface JourneyStageFocusViewProps {
  timelineItem: JourneyTimelineItem;
  stage?: JourneyStage | null;
  highlightTokens: Record<JourneyHighlightState, StageTokens>;
  taskTokens: Record<JourneyTaskStatus, TaskToken>;
  formatDate: (isoString: string) => string;
  showTradeNameIdeas?: boolean;
  navigation?: StageNavigationConfig;
  recommendedActivities?: StageRecommendedActivity[];
  activeRecommendedActivityId?: string | null;
  onRecommendedActivityChange?: (activityId: string) => void;
  stageActivities?: StageActivitiesContext;
  tradeName?: string;
  onTradeNameChange?: (tradeName: string | null) => void;
  growthUnlocked?: boolean;
  onComplianceReturn?: () => void;
  isCompliancePassed?: boolean;
  legalFormOptions?: LegalFormOption[];
  selectedLegalFormId?: string | null;
  onLegalFormSelect?: (legalFormId: string) => void;
}

const TASK_CARD_BASE =
  "border border-white/25 bg-white/16 backdrop-blur-xl shadow-[0_30px_80px_-65px_rgba(15,23,42,0.4)]";

const STAGE_STATUS_TOKENS: Record<JourneyStageStatusState, {
  label: string;
  badgeClass: string;
  helperClass: string;
}> = {
  in_progress: {
    label: "In progress",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    helperClass: "text-[#0b7d6f]",
  },
  completed: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    helperClass: "text-slate-500",
  },
  scheduled: {
    label: "Scheduled",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    helperClass: "text-[#b97324]",
  },
};

export const DEFAULT_LEGAL_FORM_OPTIONS: LegalFormOption[] = [
  {
    id: "establishment",
    title: "Establishment",
    highlights: [
      "Entity owned by one individual who assumes all of its financial responsibilities.",
    ],
  },
  {
    id: "llc-sole",
    title: "Sole Proprietorship Company",
    highlights: [
      "Limited liability company owned by one individual whose liability is limited to their shares.",
    ],
  },
  {
    id: "llc",
    title: "Limited Liability Company",
    highlights: [
      "Entity owned by at least 2 people with liability limited to their shares.",
    ],
  },
  {
    id: "pjsc",
    title: "Public Joint Stock Company",
    highlights: [
      "Entity owned by at least 3 shareholders with liability limited to their shares.",
    ],
  },
  {
    id: "prjsc",
    title: "Private Joint Stock Company",
    highlights: [
      "Entity owned by at least 10 shareholders where 55% of shares are offered to the public.",
    ],
  },
  {
    id: "single-shareholder-jsc",
    title: "Single Shareholder Joint Stock Company",
    highlights: [
      "Entity founded by a UAE national with liability limited to their shares.",
    ],
  },
];

export function JourneyStageFocusView({
  timelineItem,
  stage,
  highlightTokens,
  taskTokens,
  formatDate,
  showTradeNameIdeas = false,
  navigation,
  recommendedActivities = [],
  activeRecommendedActivityId,
  onRecommendedActivityChange,
  stageActivities: stageActivityContext = undefined,
  tradeName,
  onTradeNameChange,
  growthUnlocked = false,
  onComplianceReturn,
  isCompliancePassed,
  legalFormOptions = DEFAULT_LEGAL_FORM_OPTIONS,
  selectedLegalFormId,
  onLegalFormSelect,
}: JourneyStageFocusViewProps) {
  const highlightToken = stage ? highlightTokens[stage.state] : null;
  const stagedTasks = stage?.tasks ?? [];

  const renderTaskTimestamp = (task: JourneyStage["tasks"][number]) => {
    if (task.completedOn) {
      return `Completed ${formatDate(task.completedOn)}`;
    }
    if (task.dueDate) {
      return `Due ${formatDate(task.dueDate)}`;
    }
    return null;
  };

  const isBusinessRegistrationStage = stage?.id === "trade-name-activities";
  const isDocumentSubmissionStage =
    stage?.id === "document-submissions" || stage?.id === "submissions";
  const isPreOperationalInspectionStage = stage?.id === "inspections";
  const isComplianceGrowthStage = stage?.id === "compliance-growth";

  const hasNavigationControls = Boolean(
    navigation && (navigation.onNext || navigation.onPrevious),
  );
  const selectedRecommendedActivity = recommendedActivities.find(
    (activity) => activity.id === activeRecommendedActivityId,
  );
  const selectedRecommendedId = selectedRecommendedActivity?.id ?? null;

  const [showActivityCatalog, setShowActivityCatalog] = useState(false);
  const [internalLegalFormId, setInternalLegalFormId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRecommendedId !== "activity-curation") {
      setShowActivityCatalog(false);
    }
  }, [selectedRecommendedId]);

  const effectiveLegalFormOptions =
    legalFormOptions.length > 0 ? legalFormOptions : DEFAULT_LEGAL_FORM_OPTIONS;
  const effectiveLegalFormId =
    selectedLegalFormId ?? internalLegalFormId ?? effectiveLegalFormOptions[0]?.id ?? null;

  const handleLegalFormSelect = useCallback(
    (legalFormId: string) => {
      if (onLegalFormSelect) {
        onLegalFormSelect(legalFormId);
      } else {
        setInternalLegalFormId(legalFormId);
      }
    },
    [onLegalFormSelect],
  );

  const activeLegalForm = effectiveLegalFormId
    ? effectiveLegalFormOptions.find((option) => option.id === effectiveLegalFormId) ?? null
    : null;

  const navigationControls = hasNavigationControls ? (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {navigation?.onPrevious ? (
        <Button
          type="button"
          variant="outline"
          onClick={navigation.onPrevious}
          className="inline-flex items-center gap-2 rounded-full border-[#0f766e]/35 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#ecf7f3]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {navigation.previousLabel
            ? `Back to ${navigation.previousLabel}`
            : "Previous stage"}
        </Button>
      ) : null}
      {navigation?.onNext ? (
        <Button
          type="button"
          onClick={navigation.onNext}
          className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_-30px_rgba(15,118,110,0.55)] transition hover:bg-[#0c6059]"
        >
          {navigation.nextLabel
            ? `Next: ${navigation.nextLabel}`
            : "Next stage"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  ) : null;

  const showRecommendedSelector = recommendedActivities.length > 0;

  const renderGuidanceSummary = (
    activity?: StageRecommendedActivity | null,
    fallback?: string,
  ) => (
    <div
      className={chatCardClass(
        TASK_CARD_BASE,
        "rounded-2xl border border-white/40 bg-white/85 p-5 text-sm text-slate-600",
      )}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">
          {activity ? activity.label : "Select a focus"}
        </p>
        <p className="text-sm text-slate-600">
          {activity?.description ??
            fallback ??
            "Select a recommended focus to load detailed guidance."}
        </p>
      </div>
    </div>
  );

  if (isComplianceGrowthStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <ComplianceGrowthFocusContent
          journeyNumber="0987654321"
          progressPercent={78}
          growthUnlocked={growthUnlocked}
          onComplianceReturn={onComplianceReturn}
          isCompliant={isCompliancePassed}
        />
        {navigationControls}
      </div>
    );
  }

  if (isPreOperationalInspectionStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PreOperationalInspectionFocusContent
          journeyNumber="0987654321"
          progressPercent={83}
        />
        {navigationControls}
      </div>
    );
  }

  if (isDocumentSubmissionStage) {
    const shouldShowDocuments =
      selectedRecommendedId === "document-checklist" ||
      selectedRecommendedId === "coordination-brief";

    return (
      <div className="space-y-5 sm:space-y-6">
        {shouldShowDocuments ? (
          <DocumentSubmissionFocusContent
            journeyNumber="0987654321"
            progressPercent={90}
          />
        ) : (
          renderGuidanceSummary(
            selectedRecommendedActivity,
            "Select a document-focused recommendation to load the required submissions.",
          )
        )}
        {navigationControls}
      </div>
    );
  }

  if (isBusinessRegistrationStage) {
    const shouldShowTradeNameIdeas =
      selectedRecommendedId === "trade-name-ideas" ||
      (!recommendedActivities.length && showTradeNameIdeas);

    return (
      <div className="space-y-5 sm:space-y-6">
        {shouldShowTradeNameIdeas ? (
          <BusinessRegistrationFocusContent
            journeyNumber="0987654321"
            progressPercent={46}
            tradeName={tradeName}
            onTradeNameChange={onTradeNameChange}
          />
        ) : (
          renderGuidanceSummary(
            selectedRecommendedActivity,
            "Select \"Trade name ideas\" to explore compliant brand options.",
          )
        )}
        {navigationControls}
      </div>
    );
  }

  const overviewCard = (
    <div
      className={chatCardClass(
        "overflow-hidden border border-white/25 bg-white/18 p-5 backdrop-blur-2xl shadow-[0_55px_140px_-65px_rgba(15,23,42,0.45)]",
        "rounded-3xl",
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              {stage ? (
                <>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                      highlightToken?.badgeClass,
                    )}
                  >
                    {stage.highlight.label}
                  </span>
                  {stage.highlight.detail ? (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        highlightToken?.detailClass ?? "text-slate-500",
                      )}
                    >
                      {stage.highlight.detail}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                  Automation focus
                </span>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-slate-900">
                {timelineItem.title}
              </h3>
              <p className="text-sm text-slate-600">
                {stage ? stage.description : timelineItem.description}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
              timelineItem.statusBadgeClass,
            )}
          >
            {timelineItem.statusLabel}
          </Badge>
        </div>

        {(stage?.statusDetail || timelineItem.meta) && (
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
            {stage?.statusDetail ? (
              <span className={highlightToken?.detailClass ?? "text-slate-500"}>
                {stage.statusDetail}
              </span>
            ) : null}
            {stage?.statusDetail && timelineItem.meta ? (
              <span className="text-slate-400">•</span>
            ) : null}
            {timelineItem.meta ? (
              <span className={timelineItem.statusHelperClass}>
                {timelineItem.meta}
              </span>
            ) : null}
          </div>
        )}

        {stage?.statusTransitions?.length ? (
          <div className="space-y-3 rounded-2xl border border-white/30 bg-white/16 p-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Stage status updates
              </h4>
              <p className="text-xs text-slate-500">
                Key checkpoints before progressing to the next stage.
              </p>
            </div>
            <div className="space-y-2">
              {stage.statusTransitions.map((transition) => {
                const token = STAGE_STATUS_TOKENS[transition.status];
                return (
                  <div
                    key={transition.id}
                    className="flex flex-col gap-2 rounded-xl border border-white/40 bg-white/80 p-3"
                  >
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                        token.badgeClass,
                      )}
                    >
                      {token.label}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {transition.label}
                      </p>
                      {transition.detail ? (
                        <p className="text-xs text-slate-500">
                          {transition.detail}
                        </p>
                      ) : null}
                      {transition.timestamp ? (
                        <p
                          className={cn(
                            "text-[11px] font-semibold uppercase tracking-[0.18em]",
                            token.helperClass,
                          )}
                        >
                          {formatDate(transition.timestamp)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const guidanceContent =
    showRecommendedSelector || (stage?.id === "questionnaire" && stageActivityContext)
      ? (
          <div
            className={chatCardClass(
              "border border-white/25 bg-white/16 p-5 backdrop-blur-2xl",
              "rounded-3xl space-y-4",
            )}
          >
            {showRecommendedSelector ? (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-[240px] max-w-full flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {recommendedActivities.map((activity) => {
                      const isActive = activity.id === activeRecommendedActivityId;
                      return (
                        <Button
                          key={activity.id}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => onRecommendedActivityChange?.(activity.id)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                            isActive
                              ? "bg-[#0f766e] text-white shadow-[0_18px_46px_-32px_rgba(15,118,110,0.55)] hover:bg-[#0c6059]"
                              : "border-[#0f766e]/25 bg-white/70 text-[#0f766e] hover:bg-[#eef7f4]",
                          )}
                        >
                          {activity.label}
                        </Button>
                      );
                    })}
                  </div>
                  {selectedRecommendedActivity ? (
                    <p className="text-xs text-slate-500">
                      {selectedRecommendedActivity.description}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {stage?.id === "questionnaire" && stageActivityContext ? (
              selectedRecommendedActivity ? (
                <div className="space-y-4">
                  {selectedRecommendedId === "legal-forms" ? (
                    <div className="space-y-3 rounded-2xl border border-white/30 bg-white/16 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                            Legal form options
                          </h4>
                          <p className="text-xs text-slate-500">
                            Choose the ownership structure that matches your plan.
                          </p>
                        </div>
                        {activeLegalForm ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                            Selected: {activeLegalForm.title}
                          </span>
                        ) : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {effectiveLegalFormOptions.map((option) => {
                          const isSelected = option.id === effectiveLegalFormId;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleLegalFormSelect(option.id)}
                              className={cn(
                                "h-full rounded-xl border px-4 py-4 text-left transition",
                                isSelected
                                  ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f4f4a] shadow-[0_18px_44px_-38px_rgba(15,118,110,0.5)]"
                                  : "border-white/35 bg-white/80 text-slate-700 hover:border-[#0f766e]/60 hover:bg-white",
                              )}
                              aria-pressed={isSelected}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-900">
                                  {option.title}
                                </p>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                                    isSelected
                                      ? "border-[#0f766e]/40 bg-[#0f766e]/15 text-[#0f766e]"
                                      : "border-slate-200 bg-white text-slate-500",
                                  )}
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </span>
                              </div>
                              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                                {option.highlights.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0f766e]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {selectedRecommendedId === "activity-curation" ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                            Recommended activities
                          </h4>
                          <p className="text-xs text-slate-500">
                            Toggle to confirm the activities included in your license draft.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowActivityCatalog((prev) => !prev)}
                          disabled={(stageActivityContext.available?.length ?? 0) === 0}
                          className="inline-flex items-center gap-2 rounded-full border-[#0f766e]/35 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#eef7f4] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {(stageActivityContext.available?.length ?? 0) === 0
                            ? "All activities added"
                            : showActivityCatalog
                              ? "Hide catalog"
                              : "Add a new activity"}
                        </Button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {stageActivityContext.recommended.map((activity) => {
                          const isSelected = stageActivityContext.selectedIds.includes(
                            activity.id,
                          );
                          return (
                            <button
                              key={activity.id}
                              type="button"
                              onClick={() => stageActivityContext.onToggle(activity.id)}
                              className={cn(
                                "rounded-xl border px-4 py-3 text-left transition hover:border-[#0f766e]",
                                isSelected
                                  ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f4f4a] shadow-[0_18px_44px_-38px_rgba(15,118,110,0.5)]"
                                  : "border-white/40 bg-white/70 text-slate-700",
                              )}
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {activity.label}
                              </p>
                              {activity.description ? (
                                <p className="text-xs text-slate-500">
                                  {activity.description}
                                </p>
                              ) : null}
                              <span
                                className={cn(
                                  "mt-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                                  isSelected
                                    ? "border-[#0f766e]/40 bg-[#0f766e]/15 text-[#0f766e]"
                                    : "border-slate-200 bg-white text-slate-500",
                                )}
                              >
                                {isSelected ? "Selected" : "Tap to select"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {showActivityCatalog ? (
                        <div className="space-y-2 rounded-xl border border-dashed border-[#0f766e]/40 bg-white/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                            Available activities
                          </p>
                          {(stageActivityContext.available?.length ?? 0) === 0 ? (
                            <p className="text-xs text-slate-500">
                              All catalog activities have been added.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {stageActivityContext.available.map((activity) => (
                                <Button
                                  key={activity.id}
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    stageActivityContext.onAdd(activity.id);
                                    setShowActivityCatalog(false);
                                  }}
                                  className="inline-flex items-center gap-2 rounded-full border-[#0f766e]/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#eef7f4]"
                                >
                                  {activity.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {selectedRecommendedId !== "legal-forms" &&
                  selectedRecommendedId !== "activity-curation"
                    ? renderGuidanceSummary(
                        selectedRecommendedActivity,
                        "Select a focus above to load questionnaire guidance.",
                      )
                    : null}
                </div>
              ) : (
                renderGuidanceSummary(
                  null,
                  "Select a recommended focus to see questionnaire guidance.",
                )
              )
            ) : null}
          </div>
        )
      : null;

  const tasksContent = stage && stagedTasks.length > 0 ? (
    <div
      className={chatCardClass(
        "border border-white/25 bg-white/18 p-5 backdrop-blur-2xl",
        "rounded-3xl space-y-4",
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Stage tasks
        </h4>
        <span className="text-xs text-slate-500">
          {stagedTasks.length} task{stagedTasks.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-3">
        {stagedTasks.map((task) => {
          const token = taskTokens[task.status];
          const timestamp = renderTaskTimestamp(task);

          return (
            <div
              key={task.id}
              className={chatCardClass(TASK_CARD_BASE, "rounded-2xl p-4")}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {task.label}
                    </p>
                    <p className="text-xs text-slate-500">Owner: {task.owner}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                      token.badgeClass,
                    )}
                  >
                    {token.label}
                  </span>
                </div>
                {timestamp ? (
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.18em]",
                      token.helperClass,
                    )}
                  >
                    {timestamp}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  const extraMetaCard = !stage && timelineItem.meta ? (
    <div
      className={chatCardClass(
        TASK_CARD_BASE,
        "rounded-3xl p-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600",
      )}
    >
      <p className={timelineItem.statusHelperClass}>{timelineItem.meta}</p>
    </div>
  ) : null;

  const slides: StageSlide[] = [
    {
      id: "overview",
      heading: timelineItem.title,
      description: stage ? stage.description : timelineItem.description,
      content: (
        <div className="space-y-4">
          {overviewCard}
          {extraMetaCard}
        </div>
      ),
    },
  ];

  if (guidanceContent) {
    slides.push({
      id: "guidance",
      heading: "Guidance & focus",
      description: selectedRecommendedActivity
        ? selectedRecommendedActivity.description
        : "Choose a focus to see tailored guidance for this stage.",
      content: guidanceContent,
    });
  }

  if (tasksContent) {
    slides.push({
      id: "tasks",
      heading: "Stage tasks",
      description: `${stagedTasks.length} task${stagedTasks.length === 1 ? "" : "s"} in this stage`,
      content: tasksContent,
      footer: navigationControls ?? undefined,
    });
  } else if (navigationControls) {
    slides[slides.length - 1] = {
      ...slides[slides.length - 1],
      footer: navigationControls,
    };
  }

  return <StageSlideNavigator slides={slides} className="mt-6" />;
}
