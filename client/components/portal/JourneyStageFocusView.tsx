import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { validateActivityCompatibility } from "@/lib/trade-license-api";
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

interface LicenseTypeProfile {
  id: string;
  title: string;
  summary: string;
  feeEstimate: string;
  highlights: string[];
  evaluationPrompt: string;
}

interface LicenseEvaluation {
  compatibilityScore: number;
  isConsistent: boolean;
  reason?: string | null;
  threshold?: number | null;
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

function normalizeCompatibilityPercent(score?: number | null): number | null {
  if (typeof score !== "number" || Number.isNaN(score) || !Number.isFinite(score)) {
    return null;
  }

  const scaled =
    score > 1 && score <= 100
      ? score
      : score * 100;

  const clamped = Math.min(Math.max(scaled, 0), 100);
  return Math.round(clamped);
}

const LICENSE_TYPE_PROFILES: LicenseTypeProfile[] = [
  {
    id: "commercial",
    title: "Commercial license",
    summary: "Full trading privileges for dine-in, delivery, and catering services.",
    feeEstimate: "AED 3,000 – 8,000",
    highlights: [
      "Allows bundling of multiple restaurant activities",
      "Supports investor visas and banking onboarding",
    ],
    evaluationPrompt:
      "Commercial license scenario: Operate a dine-in restaurant in Abu Dhabi with delivery and catering under a commercial Department of Economic Development license.",
  },
  {
    id: "professional",
    title: "Professional license",
    summary: "Ideal for consultancy-led or niche culinary services.",
    feeEstimate: "AED 3,000 – 8,000",
    highlights: [
      "Lower upfront cost and flexible ownership structures",
      "Suited for chef-driven or boutique concepts",
    ],
    evaluationPrompt:
      "Professional license scenario: Offer consultancy-led culinary services and boutique concepts with flexible ownership under a professional license structure.",
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
  const [licenseEvaluations, setLicenseEvaluations] = useState<Record<string, LicenseEvaluation>>({});
  const [isLicenseEvaluationLoading, setIsLicenseEvaluationLoading] = useState(false);
  const [licenseEvaluationError, setLicenseEvaluationError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRecommendedId !== "activity-curation") {
      setShowActivityCatalog(false);
    }
  }, [selectedRecommendedId]);

  const effectiveTradeName =
    tradeName && tradeName.trim().length > 0
      ? tradeName.trim()
      : timelineItem.title;

  useEffect(() => {
    if (selectedRecommendedId !== "license-types") {
      return;
    }

    if (!LICENSE_TYPE_PROFILES.length) {
      setLicenseEvaluations({});
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    const tradeNameForEvaluation =
      effectiveTradeName && effectiveTradeName.length > 0
        ? effectiveTradeName
        : "Trade License";

    setIsLicenseEvaluationLoading(true);
    setLicenseEvaluationError(null);
    setLicenseEvaluations({});

    validateActivityCompatibility(
      {
        trade_name: tradeNameForEvaluation,
        business_activities: LICENSE_TYPE_PROFILES.map(
          (profile) => profile.evaluationPrompt,
        ),
        language: "english",
        enable_llm_judge: false,
      },
      { signal: controller.signal },
    )
      .then((response) => {
        if (isCancelled) {
          return;
        }

        const mappedEvaluations: Record<string, LicenseEvaluation> = {};
        const resultMap = new Map(
          response.results.map((item) => [item.activity_description, item]),
        );

        LICENSE_TYPE_PROFILES.forEach((profile) => {
          const match = resultMap.get(profile.evaluationPrompt);
          if (!match) {
            return;
          }

          mappedEvaluations[profile.id] = {
            compatibilityScore: match.compatibility_score,
            isConsistent: match.is_consistent,
            reason: match.reason ?? null,
            threshold: match.threshold ?? response.threshold_used,
          };
        });

        setLicenseEvaluations(mappedEvaluations);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        const errorObject = error as Error | DOMException;
        const errorName = errorObject?.name ?? "";
        const errorMessage = (errorObject?.message ?? "").toLowerCase();

        if (errorName === "AbortError" || errorMessage.includes("aborted")) {
          return;
        }

        console.error("Failed to load license compatibility", error);
        setLicenseEvaluationError("Unable to load license compatibility insights.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLicenseEvaluationLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [effectiveTradeName, selectedRecommendedId]);

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

  return (
    <div className="space-y-5 sm:space-y-6">
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
                <span
                  className={highlightToken?.detailClass ?? "text-slate-500"}
                >
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

          {showRecommendedSelector ? (
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/30 bg-white/14 p-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Recommended focus
                </p>
                <p className="text-sm text-slate-600">
                  Tailored actions to accelerate this stage.
                </p>
              </div>
              <div className="flex min-w-[240px] max-w-full flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {recommendedActivities.map((activity) => {
                    const isActive = activity.id === activeRecommendedActivityId;
                    return (
                      <Button
                        key={activity.id}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        onClick={() =>
                          onRecommendedActivityChange?.(activity.id)
                        }
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
                {selectedRecommendedId === "license-types" ? (
                  <div className="space-y-3 rounded-2xl border border-white/30 bg-white/16 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        License comparison
                      </h4>
                      <span className={cn(
                        "text-xs",
                        licenseEvaluationError ? "text-rose-600" : "text-slate-500",
                      )}>
                        {isLicenseEvaluationLoading
                          ? "Evaluating license fit…"
                          : licenseEvaluationError ?? `Matched to ${effectiveTradeName}`}
                      </span>
                    </div>
                    {licenseEvaluationError ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-600">
                        {licenseEvaluationError}
                      </div>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {LICENSE_TYPE_PROFILES.map((profile) => {
                        const evaluation = licenseEvaluations[profile.id];
                        const compatibilityPercent = normalizeCompatibilityPercent(
                          evaluation?.compatibilityScore ?? null,
                        );
                        const thresholdPercent = normalizeCompatibilityPercent(
                          evaluation?.threshold ?? null,
                        );
                        const consistencyClass = evaluation
                          ? evaluation.isConsistent
                            ? "border-[#0f766e]/50 bg-[#0f766e]/10 text-[#0f766e]"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-500";
                        const compatibilityDisplay = evaluation
                          ? compatibilityPercent !== null
                            ? `${compatibilityPercent}%`
                            : "N/A"
                          : isLicenseEvaluationLoading
                            ? "Evaluating…"
                            : "Awaiting data";

                        return (
                          <div
                            key={profile.id}
                            className="rounded-xl border border-[#0f766e]/20 bg-white/80 p-4 shadow-[0_20px_55px_-48px_rgba(15,118,110,0.4)]"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-900">
                                  {profile.title}
                                </p>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                                    consistencyClass,
                                  )}
                                >
                                  {evaluation
                                    ? evaluation.isConsistent
                                      ? "Consistent"
                                      : "Review required"
                                    : "Pending"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {profile.summary}
                              </p>
                              <ul className="space-y-1 text-xs text-slate-600">
                                {profile.highlights.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0f766e]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                                {profile.feeEstimate}
                              </p>
                              <div className="space-y-2 rounded-lg border border-[#0f766e]/25 bg-[#0f766e]/5 p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                                    Compatibility
                                  </span>
                                  <span className="text-sm font-semibold text-[#0f766e]">
                                    {compatibilityDisplay}
                                  </span>
                                </div>
                                {evaluation?.reason ? (
                                  <p className="text-xs text-[#0f766e]">
                                    {evaluation.reason}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-600">
                                    {isLicenseEvaluationLoading
                                      ? "We’re checking alignment with this license profile."
                                      : evaluation
                                        ? "No additional concerns flagged."
                                        : "Insights will appear once the evaluation completes."}
                                  </p>
                                )}
                                {thresholdPercent !== null ? (
                                  <p className="text-[11px] text-[#0f766e]/70">
                                    Threshold: {thresholdPercent}% required
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Cost shown is indicative and subject to change based on the business activity and other regulatory requirements.
                    </p>
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
                            <span className={cn(
                              "mt-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                              isSelected
                                ? "border-[#0f766e]/40 bg-[#0f766e]/15 text-[#0f766e]"
                                : "border-slate-200 bg-white text-slate-500",
                            )}>
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

                {selectedRecommendedId !== "license-types" &&
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

          {stage ? (
            <div className="space-y-4 border-t border-white/40 pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Stage tasks
                </h4>
                <span className="text-xs text-slate-500">
                  {stagedTasks.length} item{stagedTasks.length === 1 ? "" : "s"}
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
                            <p className="text-xs text-slate-500">
                              Owner: {task.owner}
                            </p>
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
          ) : null}

          {navigationControls ? (
            <div className="border-t border-white/40 pt-5">
              {navigationControls}
            </div>
          ) : null}
        </div>
      </div>

      {!stage && timelineItem.meta ? (
        <div
          className={chatCardClass(
            TASK_CARD_BASE,
            "rounded-2xl p-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600",
          )}
        >
          <p className={timelineItem.statusHelperClass}>{timelineItem.meta}</p>
        </div>
      ) : null}
    </div>
  );
}
