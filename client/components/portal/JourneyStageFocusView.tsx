import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import type {
  JourneyHighlightState,
  JourneyStage,
  JourneyTaskStatus,
  JourneyTimelineItem,
} from "./journey-types";
import { BusinessRegistrationFocusContent } from "./BusinessRegistrationFocusContent";
import { MyTAMMDocuments } from "./MyTAMMDocuments";

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

export function JourneyStageFocusView({
  timelineItem,
  stage,
  highlightTokens,
  taskTokens,
  formatDate,
}: JourneyStageFocusViewProps) {
  const highlightToken = stage ? highlightTokens[stage.state] : null;
  const stagedTasks = stage?.tasks ?? [];

  const [quickNotes, setQuickNotes] = React.useState("");
  const [customItemLabel, setCustomItemLabel] = React.useState("");
  const [customItems, setCustomItems] = React.useState<
    Array<{ id: string; label: string; completed: boolean }>
  >([]);
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([]);

  const renderTaskTimestamp = (task: JourneyStage["tasks"][number]) => {
    if (task.completedOn) {
      return `Completed ${formatDate(task.completedOn)}`;
    }
    if (task.dueDate) {
      return `Due ${formatDate(task.dueDate)}`;
    }
    return null;
  };

  const handleAddCustomItem = () => {
    const trimmed = customItemLabel.trim();
    if (!trimmed) {
      return;
    }

    setCustomItems((items) => [
      ...items,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: trimmed,
        completed: false,
      },
    ]);
    setCustomItemLabel("");
  };

  const handleToggleCustomItem = (itemId: string) => {
    setCustomItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const handleRemoveCustomItem = (itemId: string) => {
    setCustomItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleFilesSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []).map((file) => file.name);
    setSelectedFiles(files);
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  const isBusinessRegistrationStage = stage?.id === "trade-name-activities";

  if (isBusinessRegistrationStage) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <BusinessRegistrationFocusContent
          journeyNumber="0987654321"
          completionStatus="4 of 8 complete"
          tradeName="MARWAH"
          isTradeNameAvailable={true}
          progressPercent={46}
        />

        <MyTAMMDocuments
          companyName="Marwah Emirati Fusion LLC"
          isGenerating={true}
        />

        <div
          className={chatCardClass(
            TASK_CARD_BASE,
            "space-y-4 rounded-2xl p-5",
          )}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Capture notes
              </h4>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Private to you
              </span>
            </div>
            <Textarea
              value={quickNotes}
              onChange={(event) => setQuickNotes(event.target.value)}
              placeholder="Add context, decisions, or blockers for this stage."
              className="min-h-[120px] rounded-2xl border-white/60 bg-white/70 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition focus-visible:ring-[#0f766e]/30"
            />
            {quickNotes.trim() ? (
              <p className="text-xs text-[#0f766e]">
                Saved locally for this session.
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Attach supporting documents
              </h4>
              {selectedFiles.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFiles}
                  className="h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-[#0f766e]"
                >
                  Clear selection
                </Button>
              ) : null}
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/70 bg-white/70 px-6 py-6 text-center text-sm text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:border-[#0f766e] hover:text-[#0f766e]">
              <span className="font-semibold">Drop files here or browse</span>
              <span className="text-xs text-slate-500">
                PDF, DOCX, XLSX, and images up to 25 MB each
              </span>
              <Input
                type="file"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
            </label>
            {selectedFiles.length > 0 ? (
              <div className="space-y-2 rounded-2xl border border-white/70 bg-white/80 p-3 text-sm shadow-[0_12px_24px_-20px_rgba(11,64,55,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Selected files
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {selectedFiles.map((file) => (
                    <li key={file} className="truncate">
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
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

      <div
        className={chatCardClass(
          TASK_CARD_BASE,
          "space-y-4 rounded-2xl p-5",
        )}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Capture notes
            </h4>
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Private to you
            </span>
          </div>
          <Textarea
            value={quickNotes}
            onChange={(event) => setQuickNotes(event.target.value)}
            placeholder="Add context, decisions, or blockers for this stage."
            className="min-h-[120px] rounded-2xl border-white/60 bg-white/70 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition focus-visible:ring-[#0f766e]/30"
          />
          {quickNotes.trim() ? (
            <p className="text-xs text-[#0f766e]">
              Saved locally for this session.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Add checklist items
            </h4>
            {customItems.length > 0 ? (
              <span className="text-xs text-slate-500">
                {customItems.filter((item) => item.completed).length} of {" "}
                {customItems.length} complete
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={customItemLabel}
              onChange={(event) => setCustomItemLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddCustomItem();
                }
              }}
              placeholder="Add an action item or reminder"
              className="rounded-2xl border-white/70 bg-white/80 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            />
            <Button
              type="button"
              onClick={handleAddCustomItem}
              className="rounded-2xl border border-[#0f766e] bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_-20px_rgba(11,64,55,0.3)] transition hover:bg-[#0c6059]"
            >
              Add item
            </Button>
          </div>
          {customItems.length > 0 ? (
            <div className="space-y-2">
              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm shadow-[0_12px_24px_-20px_rgba(11,64,55,0.18)]"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCustomItem(item.id)}
                    className={cn(
                      "flex flex-1 items-center gap-3 text-left transition",
                      item.completed ? "opacity-70" : undefined,
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                        item.completed
                          ? "border-[#0f766e] bg-[#0f766e] text-white"
                          : "border-[#cfe4dd] bg-white text-[#0f766e]",
                      )}
                      aria-hidden="true"
                    >
                      {item.completed ? "✓" : ""}
                    </span>
                    <span
                      className={cn(
                        item.completed
                          ? "line-through decoration-slate-400"
                          : undefined,
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomItem(item.id)}
                    className="h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-[#0f766e]"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Attach supporting documents
            </h4>
            {selectedFiles.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFiles}
                className="h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-[#0f766e]"
              >
                Clear selection
              </Button>
            ) : null}
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/70 bg-white/70 px-6 py-6 text-center text-sm text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:border-[#0f766e] hover:text-[#0f766e]">
            <span className="font-semibold">Drop files here or browse</span>
            <span className="text-xs text-slate-500">
              PDF, DOCX, XLSX, and images up to 25 MB each
            </span>
            <Input
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
          {selectedFiles.length > 0 ? (
            <div className="space-y-2 rounded-2xl border border-white/70 bg-white/80 p-3 text-sm shadow-[0_12px_24px_-20px_rgba(11,64,55,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Selected files
              </p>
              <ul className="space-y-1 text-sm text-slate-700">
                {selectedFiles.map((file) => (
                  <li key={file} className="truncate">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
