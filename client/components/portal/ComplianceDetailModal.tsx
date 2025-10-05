import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileEdit,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComplianceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ComplianceStatus = "error" | "warning" | "success" | "info";

interface ComplianceItem {
  id: string;
  label: string;
  status: ComplianceStatus;
  detail: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: "civil-defence",
    label: "Civil Defence",
    status: "error",
    detail: "2 issues to resolve",
  },
  {
    id: "ded-inspection",
    label: "DED inspection",
    status: "warning",
    detail: "29 days remaining",
  },
  {
    id: "food-safety",
    label: "Food & Safety inspection",
    status: "success",
    detail: "Pass",
  },
  {
    id: "employment-visas",
    label: "6 Employment Visas",
    status: "success",
    detail: "Renewed",
  },
  {
    id: "tawtheeq",
    label: "Tawtheeq",
    status: "info",
    detail: "Expires in 320 days",
  },
];

const STATUS_META: Record<
  ComplianceStatus,
  {
    Icon: React.ElementType;
    iconWrapperClass: string;
    iconClass: string;
    badgeClass: string;
    badgeTextClass: string;
  }
> = {
  error: {
    Icon: AlertCircle,
    iconWrapperClass: "bg-red-50 text-red-500",
    iconClass: "text-red-500",
    badgeClass: "border-red-200 bg-red-50",
    badgeTextClass: "text-red-700",
  },
  warning: {
    Icon: AlertTriangle,
    iconWrapperClass: "bg-amber-50 text-amber-500",
    iconClass: "text-amber-500",
    badgeClass: "border-amber-200 bg-amber-50",
    badgeTextClass: "text-amber-700",
  },
  success: {
    Icon: CheckCircle,
    iconWrapperClass: "bg-emerald-50 text-emerald-500",
    iconClass: "text-emerald-500",
    badgeClass: "border-emerald-200 bg-emerald-50",
    badgeTextClass: "text-emerald-700",
  },
  info: {
    Icon: FileEdit,
    iconWrapperClass: "bg-slate-100 text-slate-500",
    iconClass: "text-slate-500",
    badgeClass: "border-slate-200 bg-slate-100",
    badgeTextClass: "text-slate-600",
  },
};

export function ComplianceDetailModal({ isOpen, onClose }: ComplianceDetailModalProps) {
  if (!isOpen) return null;

  const thingsToDo = 22;
  const complete = 78;
  const circleRadius = 28;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const completeStroke = (complete / 100) * circleCircumference;

  const renderStatusLabel = (status: ComplianceStatus) => {
    switch (status) {
      case "error":
        return "Urgent";
      case "warning":
        return "Action needed";
      case "success":
        return "Compliant";
      default:
        return "FYI";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-[#d8e4df] bg-white shadow-[0_40px_120px_-60px_rgba(11,64,55,0.45)]">
        <header className="flex flex-col gap-4 border-b border-[#e3eeea] bg-[#f7fbf9] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Compliance dashboard
            </p>
            <h2 className="text-xl font-semibold text-slate-900">DED inspection review</h2>
            <p className="text-sm text-slate-600">
              Quick status summary, priority actions, and latest footage.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                    <span className="text-2xl font-semibold text-[#0f766e]">{complete}%</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Complete</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Things to do
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{thingsToDo}% remaining</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Agencies
                    </p>
                    <p className="text-lg font-semibold text-slate-900">DED • Civil Defence</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                Checkpoints
              </h3>
              <ul className="space-y-3">
                {COMPLIANCE_ITEMS.map((item) => {
                  const meta = STATUS_META[item.status];
                  const StatusIcon = meta.Icon;
                  const statusLabel = renderStatusLabel(item.status);

                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-[#e3eeea] bg-white p-4"
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                          meta.iconWrapperClass,
                        )}
                      >
                        <StatusIcon className={cn("h-5 w-5", meta.iconClass)} />
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                      <Badge
                        className={cn(
                          "px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          meta.badgeClass,
                          meta.badgeTextClass,
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </li>
                  );
                })}
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
                  Kitchen snapshots
                </h3>
                <Badge className="border-[#b7e1d4] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  2 feeds
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <figure className="overflow-hidden rounded-2xl border border-[#e3eeea]">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fb8e81338fc04dbb1961cecf6a6b349e10dd288d5?format=webp&width=412"
                    alt="Kitchen station overview"
                    className="h-36 w-full object-cover"
                  />
                  <figcaption className="px-3 py-2 text-xs text-slate-600">
                    Temperature variance flagged for station three.
                  </figcaption>
                </figure>
                <figure className="overflow-hidden rounded-2xl border border-[#e3eeea]">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F35354ebad5489f0ffae354b2521357c0e9b5d5fa?format=webp&width=458"
                    alt="Dining floor with overlays"
                    className="h-36 w-full object-cover"
                  />
                  <figcaption className="px-3 py-2 text-xs text-slate-600">
                    Seating compliance meets occupancy targets.
                  </figcaption>
                </figure>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e4df] bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                  Fire exit check
                </h3>
                <Badge className="border-[#b7e1d4] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Clear
                </Badge>
              </div>
              <figure className="mt-4 overflow-hidden rounded-2xl border border-[#e3eeea]">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F37e3d308bae6fa63163fe9e0bbe47135f19cab55?format=webp&width=412"
                  alt="Fire exit corridor"
                  className="h-40 w-full object-cover"
                />
                <figcaption className="px-3 py-2 text-xs text-slate-600">
                  Corridor unobstructed; signage refresh in 5 days.
                </figcaption>
              </figure>
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
          </section>
        </div>
      </div>
    </div>
  );
}
