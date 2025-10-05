import * as React from "react";
import { ArrowLeft, Clock, Download, ExternalLink, FileText, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ComplianceDetailModalProps {
  data: ComplianceDetailModalData | null;
  onClose: () => void;
}

export interface ComplianceDetailModalData {
  id: string;
  title: string;
  statusLabel: string;
  statusTone: "warning" | "info" | "success";
  summary: string;
  dueLabel: string;
  progressPercent: number;
  outstandingPercent: number;
  checklist: {
    id: string;
    label: string;
    helper?: string;
    status: "in_progress" | "complete";
  }[];
  documents: {
    id: string;
    label: string;
    meta: string;
    statusLabel: string;
  }[];
  highlights: string[];
}

export function ComplianceDetailModal({ data, onClose }: ComplianceDetailModalProps) {
  if (!data) return null;

  const toneClass = {
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[data.statusTone];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-[#d8e4df] bg-white shadow-[0_36px_120px_-60px_rgba(11,64,55,0.45)]">
        <header className="flex flex-col gap-4 border-b border-[#e3eeea] bg-[#f8fbf9] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Compliance detail
            </p>
            <h2 className="text-lg font-semibold text-slate-900">{data.title}</h2>
            <p className="text-sm text-slate-600">{data.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${toneClass}`}>
              {data.statusLabel}
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

        <div className="space-y-6 px-6 py-6">
          <section className="grid gap-4 rounded-2xl border border-[#d8e4df] bg-[#f8fbfa] p-5 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Live progress
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.progressPercent}%</p>
              <p className="text-sm text-slate-600">{data.outstandingPercent}% outstanding • {data.dueLabel}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Highlights
              </p>
              <ul className="space-y-1 text-sm text-slate-600">
                {data.highlights.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0f766e]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Checklist</h3>
            <ul className="space-y-2">
              {data.checklist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between rounded-2xl border border-[#e3eeea] bg-white px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    {item.helper ? <p className="text-xs text-slate-500">{item.helper}</p> : null}
                  </div>
                  <Badge
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      item.status === "complete"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status === "complete" ? "Complete" : "In progress"}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Supporting files</h3>
            <ul className="space-y-2">
              {data.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-2xl border border-[#e3eeea] bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{doc.label}</p>
                    <p className="text-xs text-slate-500">{doc.meta}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full border border-[#d8e4df] bg-[#f5faf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      {doc.statusLabel}
                    </Badge>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e4df] bg-white text-slate-500 transition hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d8e4df] bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Follow-up within 5 business days.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
              >
                <FileText className="mr-2 h-4 w-4" /> Export summary
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[#169F9F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#128080]"
              >
                Request assistance
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
