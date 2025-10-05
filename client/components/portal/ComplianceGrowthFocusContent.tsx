import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, FileEdit } from "lucide-react";

interface ComplianceGrowthFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  progressPercent?: number;
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

const COMPLIANCE_STATUS_TOKENS: Record<ComplianceStatus, {
  Icon: React.ElementType;
  iconWrapperClass: string;
  iconClass: string;
  textClass: string;
}> = {
  error: {
    Icon: AlertCircle,
    iconWrapperClass: "border border-red-400/40 bg-red-500/20 text-red-100",
    iconClass: "text-red-200",
    textClass: "text-white",
  },
  warning: {
    Icon: AlertTriangle,
    iconWrapperClass: "border border-yellow-300/40 bg-yellow-400/15 text-yellow-100",
    iconClass: "text-yellow-200",
    textClass: "text-white",
  },
  success: {
    Icon: CheckCircle,
    iconWrapperClass: "border border-teal-200/50 bg-teal-400/15 text-teal-50",
    iconClass: "text-[#54FFD4]",
    textClass: "text-white",
  },
  info: {
    Icon: FileEdit,
    iconWrapperClass: "border border-white/30 bg-white/10 text-white/80",
    iconClass: "text-white",
    textClass: "text-white",
  },
};

type ToggleView = "compliance" | "growth";

export function ComplianceGrowthFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "78% complete",
  progressPercent = 78,
}: ComplianceGrowthFocusContentProps) {
  const [activeView, setActiveView] = React.useState<ToggleView>("compliance");

  const thingsToDo = 22;
  const complete = 78;
  const growthSteps = 9;
  const growthActions = 3;
  const growthProgress = 75;

  const urgentItems = COMPLIANCE_ITEMS.filter(item => item.status === "error" || item.status === "warning");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setActiveView("compliance")}
          className={cn(
            "flex-1 rounded-2xl border px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all",
            activeView === "compliance"
              ? "border-[#169F9F] bg-[#169F9F] text-white shadow-[0_18px_36px_-24px_rgba(23,135,126,0.45)]"
              : "border-white/20 bg-white/10 text-white/70 hover:bg-white/15",
          )}
        >
          Compliance
        </Button>
        <Button
          onClick={() => setActiveView("growth")}
          className={cn(
            "flex-1 rounded-2xl border px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all",
            activeView === "growth"
              ? "border-[#169F9F] bg-[#169F9F] text-white shadow-[0_18px_36px_-24px_rgba(23,135,126,0.45)]"
              : "border-white/20 bg-white/10 text-white/70 hover:bg-white/15",
          )}
        >
          Growth
        </Button>
      </div>

      {activeView === "compliance" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)]">
          <section
            className={chatCardClass(
              "space-y-6 border border-white/60 bg-white/95 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Compliance tracker
                </p>
                <p className="text-lg font-semibold text-slate-900">Regulatory obligations</p>
              </div>
              <Badge className="border-white/70 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                {complete}% compliant
              </Badge>
            </div>

            <div className="space-y-4 rounded-[32px] border border-[#0f766e]/25 bg-[#0f766e]/5 px-5 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Live compliance snapshot
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">{progressPercent}% progress</p>
                </div>
                <Badge className="inline-flex items-center gap-2 border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                  AI monitoring
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Things to do</p>
                  <p className="text-3xl font-semibold text-slate-900">{thingsToDo}%</p>
                  <p className="text-sm text-slate-600">Outstanding compliance actions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Complete</p>
                  <p className="text-3xl font-semibold text-slate-900">{complete}%</p>
                  <p className="text-sm text-slate-600">Authorities synced</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Compliance progress</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {COMPLIANCE_ITEMS.map((item) => {
                const token = COMPLIANCE_STATUS_TOKENS[item.status];
                const { Icon } = token;
                const statusLabel =
                  item.status === "success"
                    ? "Compliant"
                    : item.status === "warning"
                      ? "Action needed"
                      : item.status === "error"
                        ? "Urgent"
                        : "Information";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#d8e4df] bg-white/95 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                          token.iconWrapperClass,
                        )}
                      >
                        <Icon className={cn("h-5 w-5", token.iconClass)} />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    <Badge className="border-white/70 bg-[#0f766e]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      {statusLabel}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="space-y-5">
            <section
              className={chatCardClass(
                "space-y-4 border border-white/60 bg-white/95 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b91c1c]">Compliance alerts</p>
                <Badge className="border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700">
                  {urgentItems.length} open
                </Badge>
              </div>

              {urgentItems.length > 0 ? (
                <div className="space-y-3">
                  {urgentItems.map((item) => {
                    const token = COMPLIANCE_STATUS_TOKENS[item.status];
                    const { Icon } = token;

                    return (
                      <div
                        key={`alert-${item.id}`}
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-red-800">{item.label}</p>
                          <p className="text-xs text-red-600">{item.detail}</p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full border border-red-200 bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(185,28,28,0.45)] hover:bg-red-600"
                        >
                          Follow up
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600">All compliance checks are clear.</p>
              )}
            </section>

            <section
              className={chatCardClass(
                "space-y-4 border border-white/60 bg-white/95 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
              )}
            >
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Upcoming renewals</p>
                <p className="text-base font-semibold text-slate-900">Keep your documents current</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center justify-between rounded-2xl border border-[#d8e4df] bg-white/95 px-4 py-3">
                  <span>DED inspection follow-up</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b97324]">29 days</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl border border-[#d8e4df] bg-white/95 px-4 py-3">
                  <span>Visa renewals status</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Renewed</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl border border-[#d8e4df] bg-white/95 px-4 py-3">
                  <span>Tawtheeq certificate</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">320 days remaining</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {activeView === "growth" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)]">
          <section
            className={chatCardClass(
              "space-y-6 border border-white/60 bg-white/95 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                  Growth dashboard
                </p>
                <p className="text-lg font-semibold text-slate-900">Opportunities & insights</p>
              </div>
              <Badge className="border-white/70 bg-[#2563eb]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                {growthSteps} new steps
              </Badge>
            </div>

            <div className="space-y-4 rounded-[32px] border border-[#f59e0b]/30 bg-[#f59e0b]/8 px-5 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">
                    Growth status
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">75% momentum</p>
                </div>
                <Badge className="inline-flex items-center gap-2 border-[#f59e0b]/40 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b45309]">
                  AI recommendations
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">New growth steps</p>
                  <p className="text-3xl font-semibold text-slate-900">{growthSteps}</p>
                  <p className="text-sm text-slate-600">Expansion paths identified</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">Actions to take</p>
                  <p className="text-3xl font-semibold text-slate-900">{growthActions}</p>
                  <p className="text-sm text-slate-600">High impact follow-ups</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-[#fde4c7]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#f59e0b] shadow-[0_1px_6px_rgba(245,158,11,0.35)] transition-all"
                    style={{ width: `${growthProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Growth progress</span>
                  <span>{growthProgress}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-[#d9e6ff] bg-[#f5f8ff] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#c3d3ff] bg-white text-[#2563eb]">
                    <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.75 0.875C11.1147 0.875 11.4648 1.01948 11.7227 1.27734C11.9805 1.53521 12.125 1.88533 12.125 2.25V2.9375H14.1875C14.5522 2.9375 14.9023 3.08198 15.1602 3.33984C15.418 3.59771 15.5625 3.94783 15.5625 4.3125V18.75C15.5625 19.1147 15.418 19.4648 15.1602 19.7227C14.9023 19.9805 14.5522 20.125 14.1875 20.125H1.8125C1.44783 20.125 1.09771 19.9805 0.839844 19.7227C0.581981 19.4648 0.4375 19.1147 0.4375 18.75V4.3125C0.4375 3.94783 0.581981 3.59771 0.839844 3.33984C1.09771 3.08198 1.44783 2.9375 1.8125 2.9375H3.875V2.25C3.875 1.88533 4.01948 1.53521 4.27734 1.27734C4.53521 1.01948 4.88533 0.875 5.25 0.875H10.75Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">5 new economic trends</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Curated for hospitality</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-full border border-[#2563eb]/40 bg-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(37,99,235,0.45)] hover:bg-[#1e4fd7]"
                >
                  View report
                </Button>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-[#c9f1ea] bg-[#f1fcf8] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#a8e8db] bg-white text-[#0f766e]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5 5H15.8333V2.5H14.1667V5H5.83333V2.5H4.16667V5H2.5C1.81083 5 1.25 5.56083 1.25 6.25V17.5C1.25 18.1892 1.81083 18.75 2.5 18.75H17.5C18.1892 18.75 18.75 18.1892 18.75 17.5V6.25C18.75 5.56083 18.1892 5 17.5 5ZM17.5 17.5H2.5V8.33333H17.5V17.5Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">3 relevant services</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Marketplace matches</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-full border border-[#0f766e]/40 bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(15,118,110,0.45)] hover:bg-[#0c6059]"
                >
                  Explore
                </Button>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-[#ffe6aa] bg-[#fff8e6] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#ffd68a] bg-white text-[#ca8a04]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.875 20.625C7.63439 20.625 8.25 20.0094 8.25 19.25C8.25 18.4906 7.63439 17.875 6.875 17.875C6.11561 17.875 5.5 18.4906 5.5 19.25C5.5 20.0094 6.11561 20.625 6.875 20.625Z" fill="currentColor"/>
                      <path d="M16.5 20.625C17.2594 20.625 17.875 20.0094 17.875 19.25C17.875 18.4906 17.2594 17.875 16.5 17.875C15.7406 17.875 15.125 18.4906 15.125 19.25C15.125 20.0094 15.7406 20.625 16.5 20.625Z" fill="currentColor"/>
                      <path d="M19.25 4.81264H4.00125L3.4375 1.92514C3.40536 1.76751 3.31896 1.62615 3.19334 1.52565C3.06772 1.42516 2.91084 1.3719 2.75 1.37514H0V2.75014H2.18625L4.8125 15.9501C4.84464 16.1078 4.93104 16.2491 5.05666 16.3496C5.18228 16.4501 5.33916 16.5034 5.5 16.5001H17.875V15.1251H6.06375L5.5 12.3751H17.875C18.0339 12.379 18.1893 12.3277 18.3146 12.2299C18.44 12.1322 18.5276 11.994 18.5625 11.8389L19.9375 5.65139C19.9605 5.54938 19.96 5.44346 19.9359 5.34169C19.9119 5.23992 19.8649 5.14499 19.7986 5.06411C19.7323 4.98323 19.6484 4.91854 19.5534 4.87496C19.4583 4.83139 19.3545 4.81007 19.25 4.81264Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Marketplace suppliers</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">17 new matches</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-full border border-[#f59e0b]/40 bg-[#f59e0b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(245,158,11,0.45)] hover:bg-[#dd8505]"
                >
                  Meet suppliers
                </Button>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section
              className={chatCardClass(
                "space-y-4 border border-white/60 bg-white/95 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Visitors to Abu Dhabi
                </h3>
                <div className="flex items-center gap-2 text-[#0f766e]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 11L8.5 6.5L12.5 10.5L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">+12%</span>
                </div>
              </div>
              <p className="text-4xl font-semibold text-slate-900">5,932,234</p>
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Nationalities
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <svg width="27" height="20" viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0H26.6667V6.66667H0V0Z" fill="#FF9933"/>
                        <path d="M0 6.6665H26.6667V13.3332H0V6.6665Z" fill="white"/>
                        <path d="M0 13.3335H26.6667V20.0002H0V13.3335Z" fill="#128807"/>
                        <circle cx="13.3333" cy="10" r="2.66667" fill="#000088"/>
                      </svg>
                      <span className="text-sm font-medium text-slate-700">India</span>
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#e6f2ed]">
                        <div className="absolute h-full w-[83%] rounded-full bg-[#f59e0b]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">1,651,000</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <svg width="27" height="20" viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="26.6667" height="20" fill="#000066"/>
                        <path d="M0 0H13.3333V10H0V0Z" fill="#000066"/>
                        <path d="M1.5625 0L6.64583 3.77083L11.7083 0H13.3333V1.29167L8.33333 5.02083L13.3333 8.72917V10H11.6667L6.66667 6.27083L1.6875 10H0V8.75L4.97917 5.04167L0 1.33333V0H1.5625Z" fill="white"/>
                        <path d="M8.83333 5.85417L13.3333 9.16667V10L7.6875 5.85417H8.83333Z" fill="#C8102E"/>
                      </svg>
                      <span className="text-sm font-medium text-slate-700">Australia</span>
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#e6f2ed]">
                        <div className="absolute h-full w-[70%] rounded-full bg-[#2563eb]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">1,221,498</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={chatCardClass(
                "space-y-4 border border-white/60 bg-white/95 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#a8e8db] bg-[#0f766e]/10 text-[#0f766e]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.4901 16.1215H3.76074V14.5478C3.76074 13.7298 4.0855 12.9458 4.66229 12.369C5.23907 11.7922 6.02309 11.4674 6.84109 11.4674H11.4098C12.2278 11.4674 13.0118 11.7922 13.5886 12.369C14.1654 12.9458 14.4901 13.7298 14.4901 14.5478V16.1215Z" fill="currentColor"/>
                    <path d="M9.125 9.77758C10.7773 9.77758 12.118 8.43686 12.118 6.78458C12.118 5.1323 10.7773 3.79158 9.125 3.79158C7.47272 3.79158 6.13199 5.1323 6.13199 6.78458C6.13199 8.43686 7.47272 9.77758 9.125 9.77758Z" fill="currentColor"/>
                  </svg>
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Social media engagement</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">14,445 new followers</p>
                </div>
              </div>
              <div className="relative h-20">
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 226 77" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M33.06 46.849C17.5778 50 0 56 0 56V77H226V1.5C202.93 12.5777 201.578 18.8492 172.639 20C152.263 20.8103 140.622 21.5 121.161 25C99.2055 28.9486 89.1444 35 68.4278 40.5C48.2469 45.8577 53.9241 42.6026 33.06 46.849Z" fill="url(#paint0_linear_growth)"/>
                  <path d="M1.07031 55C1.07031 55 19.7211 49.2895 33.7386 46.6824C50.8499 43.5 60.7437 44.1995 79.7277 37C102.955 28.1911 99.8166 29 119.905 25C138.911 21.2158 153.76 20.8056 173.894 20C202.491 18.8558 201.948 12.514 224.744 1.5" stroke="#73CED0" strokeWidth="1.3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="paint0_linear_growth" x1="113.535" y1="-11.6868" x2="113.32" y2="77.0007" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4BA2A4"/>
                      <stop offset="1" stopColor="#041616" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute right-[30%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#0f766e] ring-4 ring-[#6ed6cc]" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 hover:bg-slate-50"
                >
                  Track insights
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-[#169F9F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(23,135,126,0.45)] hover:bg-[#128080]"
                >
                  Download report
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
