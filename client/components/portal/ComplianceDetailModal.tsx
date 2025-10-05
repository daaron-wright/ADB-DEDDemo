import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ComplianceTaskStatus = "priority" | "in_progress" | "complete";

export interface ComplianceDetailTask {
  id: string;
  label: string;
  status: ComplianceTaskStatus;
  detail?: string;
}

export interface ComplianceDetailMetric {
  id: string;
  label: string;
  value: string;
  helper?: string;
}

export interface ComplianceDetailFootage {
  id: string;
  title: string;
  imageSrc: string;
  caption: string;
}

export interface ComplianceDetailModalData {
  id: string;
  title: string;
  statusLabel: string;
  statusBadgeClass?: string;
  summary: string;
  dueLabel: string;
  progressPercent: number;
  outstandingPercent: number;
  metrics: ComplianceDetailMetric[];
  tasks: ComplianceDetailTask[];
  documents: { id: string; label: string; type: string; status: string }[];
  footage: ComplianceDetailFootage[];
}

interface ComplianceDetailModalProps {
  data: ComplianceDetailModalData | null;
  onClose: () => void;
}

const TASK_STATUS_META: Record<
  ComplianceTaskStatus,
  { label: string; badgeClass: string; badgeText: string }
> = {
  priority: {
    label: "Priority",
    badgeClass: "border-red-200 bg-red-50",
    badgeText: "text-red-700",
  },
  in_progress: {
    label: "In progress",
    badgeClass: "border-amber-200 bg-amber-50",
    badgeText: "text-amber-700",
  },
  complete: {
    label: "Complete",
    badgeClass: "border-emerald-200 bg-emerald-50",
    badgeText: "text-emerald-700",
  },
};

export function ComplianceDetailModal({ data, onClose }: ComplianceDetailModalProps) {
  if (!data) return null;

  const {
    title,
    statusLabel,
    statusBadgeClass,
    summary,
    dueLabel,
    progressPercent,
    outstandingPercent,
    metrics,
    tasks,
    documents,
    footage,
  } = data;

  const circleRadius = 28;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const completeStroke = (progressPercent / 100) * circleCircumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-[#d8e4df] bg-white shadow-[0_40px_120px_-60px_rgba(11,64,55,0.45)]">
        <header className="flex flex-col gap-4 border-b border-[#e3eeea] bg-[#f7fbf9] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Compliance dashboard
            </p>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                statusBadgeClass ?? "border-amber-200 bg-amber-50 text-amber-700",
              )}
            >
              {statusLabel}
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e4df] bg-white text-slate-500 transition hover:bg-slate-100"
              aria-label="Close compliance detail"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#d8e4df] bg-[#f8fbfa] p-5">
              <div className="flex items-center gap-4">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 62 62" fill="none">
                    <circle
                      cx="31"
                      cy="31"
                      r={circleRadius}
                      stroke="#e6f2ed"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="31"
                      cy="31"
                      r={circleRadius}
                      stroke="#0f766e"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${completeStroke} ${circleCircumference}`}
                      fill="none"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold text-[#0f766e]">{progressPercent}%</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Complete</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Things to do
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{outstandingPercent}% remaining</p>
                    <p>{dueLabel}</p>
                  </div>
                  {metrics.map((metric) => (
                    <div key={metric.id}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {metric.label}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">{metric.value}</p>
                      {metric.helper ? <p>{metric.helper}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> DED checklist
              </h3>
              <ul className="space-y-3">
                {tasks.map((task) => {
                  const meta = TASK_STATUS_META[task.status];

                  return (
                    <li
                      key={task.id}
                      className="flex items-start gap-3 rounded-2xl border border-[#e3eeea] bg-white p-4"
                    >
                      <Badge
                        className={cn(
                          "mt-0.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                          meta.badgeClass,
                          meta.badgeText,
                        )}
                      >
                        {meta.label}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-slate-900">{task.label}</p>
                        {task.detail ? <p className="text-xs text-slate-500">{task.detail}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                <FileText className="h-4 w-4 text-slate-500" /> Documents
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded-2xl border border-[#e3eeea] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{doc.label}</p>
                      <p className="text-xs text-slate-500">{doc.type}</p>
                    </div>
                    <Badge className="rounded-full border border-[#d8e4df] bg-[#f5faf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      {doc.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={onClose}
              className="w-full rounded-full bg-[#169F9F] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#128080]"
            >
              Share follow-up plan
            </Button>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-[#d8e4df] bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                  DED inspection footage
                </h3>
                <Badge className="rounded-full border border-[#b7e1d4] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  {footage.length} clips
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {footage.map((clip) => (
                  <figure
                    key={clip.id}
                    className="overflow-hidden rounded-2xl border border-[#e3eeea]"
                  >
                    <img
                      src={clip.imageSrc}
                      alt={clip.title}
                      className="h-36 w-full object-cover"
                    />
                    <figcaption className="px-3 py-2 text-xs text-slate-600">
                      {clip.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e4df] bg-white p-5">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Next follow-up window</span>
                </div>
                <span className="font-semibold text-slate-900">Within 5 business days</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                >
                  Export log
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-[#169F9F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#128080]"
                >
                  Request maintenance
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e4df] bg-[#f8fbfa] p-5">
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Notes for inspector</p>
                <p>
                  Provide documentation for kitchen layout updates and confirm staff training logs prior to the onsite visit.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
