import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  JourneyHighlightState,
  JourneyStage,
  JourneyTaskStatus,
  JourneyTimelineItem,
} from "./journey-types";
import { BusinessRegistrationFocusContent } from "./BusinessRegistrationFocusContent";
import { DocumentSubmissionFocusContent } from "./DocumentSubmissionFocusContent";
import { BusinessLicensingFocusContent } from "./BusinessLicensingFocusContent";
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

export interface JourneyStageFocusViewProps {
  timelineItem: JourneyTimelineItem;
  stage?: JourneyStage | null;
  highlightTokens: Record<JourneyHighlightState, StageTokens>;
  taskTokens: Record<JourneyTaskStatus, TaskToken>;
  formatDate: (isoString: string) => string;
  showTradeNameIdeas?: boolean;
  navigation?: StageNavigationConfig;
}

const TASK_CARD_BASE =
  "border border-white/25 bg-white/16 backdrop-blur-xl shadow-[0_30px_80px_-65px_rgba(15,23,42,0.4)]";

export function JourneyStageFocusView({
  timelineItem,
  stage,
  highlightTokens,
  taskTokens,
  formatDate,
  showTradeNameIdeas = false,
  navigation,
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
  const isBusinessLicensingStage = stage?.id === "license";
  const isPreOperationalInspectionStage = stage?.id === "inspections";
  const isComplianceGrowthStage = stage?.id === "compliance-growth";

  const hasNavigationControls = Boolean(
    navigation && (navigation.onNext || navigation.onPrevious),
  );

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

  if (isComplianceGrowthStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <ComplianceGrowthFocusContent
          journeyNumber="0987654321"
          completionStatus="8 of 10 complete"
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
          completionStatus="7 of 8 complete"
          progressPercent={83}
        />
        {navigationControls}
      </div>
    );
  }

  if (isBusinessLicensingStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <BusinessLicensingFocusContent
          journeyNumber="0987654321"
          completionStatus="6 of 8 complete"
          progressPercent={64}
        />
        {navigationControls}
      </div>
    );
  }

  if (isDocumentSubmissionStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <DocumentSubmissionFocusContent
          journeyNumber="0987654321"
          completionStatus="5 of 8 complete"
          progressPercent={51}
        />
      </div>
    );
  }

  if (isBusinessRegistrationStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <BusinessRegistrationFocusContent
          journeyNumber="0987654321"
          completionStatus="4 of 8 complete"
          progressPercent={46}
          showTradeNameIdeas={showTradeNameIdeas}
        />
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
        <div className="flex flex-col gap-4">
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
        </div>
      </div>

      {stage ? (
        <div className="space-y-4">
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
      ) : timelineItem.meta ? (
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
