import { Badge } from "@/components/ui/badge";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import type {
  JourneyHighlightState,
  JourneyStage,
  JourneyTaskStatus,
  JourneyTimelineItem,
} from "./journey-types";

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

export interface JourneyStageFocusViewProps {
  timelineItem: JourneyTimelineItem;
  stage?: JourneyStage | null;
  highlightTokens: Record<JourneyHighlightState, StageTokens>;
  taskTokens: Record<JourneyTaskStatus, TaskToken>;
  formatDate: (isoString: string) => string;
}

const TASK_CARD_BASE =
  "border border-white/25 bg-white/16 backdrop-blur-xl shadow-[0_30px_80px_-65px_rgba(15,23,42,0.4)]";
const TASK_CARD_SIDE_PANEL =
  "border-slate-200 bg-white/95 backdrop-blur-none shadow-[0_24px_60px_-48px_rgba(15,23,42,0.22)]";

export function JourneyStageFocusView({
  timelineItem,
  stage,
  highlightTokens,
  taskTokens,
  formatDate,
}: JourneyStageFocusViewProps) {
  const highlightToken = stage ? highlightTokens[stage.state] : null;

  const renderTaskTimestamp = (task: JourneyStage["tasks"][number]) => {
    if (task.completedOn) {
      return `Completed ${formatDate(task.completedOn)}`;
    }
    if (task.dueDate) {
      return `Due ${formatDate(task.dueDate)}`;
    }
    return null;
  };

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
        </div>
      </div>

      {stage ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Stage tasks
            </h4>
            <span className="text-xs text-slate-500">
              {stage.tasks.length} item{stage.tasks.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-3">
            {stage.tasks.map((task) => {
              const token = taskTokens[task.status];
              const timestamp = renderTaskTimestamp(task);

              return (
                <div
                  key={task.id}
                  className={chatCardClass(
                    TASK_CARD_BASE,
                    "rounded-2xl p-4",
                  )}
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
      ) : (
        <div
          className={chatCardClass(
            TASK_CARD_BASE,
            "rounded-2xl p-5 text-sm text-slate-600",
          )}
        >
          <p className="text-sm leading-relaxed text-slate-700">
            {timelineItem.description}
          </p>
          {timelineItem.meta ? (
            <p
              className={cn(
                "mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]",
                timelineItem.statusHelperClass,
              )}
            >
              {timelineItem.meta}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
