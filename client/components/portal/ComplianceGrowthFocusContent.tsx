import * as React from "react";

import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "./StageCollapsibleCard";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileEdit,
} from "lucide-react";

interface ComplianceGrowthFocusContentProps {
  journeyNumber?: string;
  progressPercent?: number;
}

type ComplianceStatus = "error" | "warning" | "success" | "info";

type ToggleView = "compliance" | "growth";

type ChecklistStatus = "in_progress" | "complete";

type ComplianceItem = {
  id: string;
  label: string;
  status: ComplianceStatus;
  detail: string;
};

type ChecklistItem = {
  id: string;
  label: string;
  helper?: string;
  status: ChecklistStatus;
};

type DedDocument = {
  id: string;
  label: string;
  meta: string;
  statusLabel: string;
};

type GrowthOpportunity = {
  id: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onClick: () => void;
};

type InspectionEvidence = {
  id: string;
  name: string;
  url: string;
  sizeLabel: string;
};

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

const COMPLIANCE_STATUS_TOKENS: Record<
  ComplianceStatus,
  {
    Icon: React.ElementType;
    iconWrapperClass: string;
    iconClass: string;
    badgeClass: string;
    badgeLabel: string;
  }
> = {
  error: {
    Icon: AlertCircle,
    iconWrapperClass: "border border-red-400/40 bg-red-500/20 text-red-100",
    iconClass: "text-red-200",
    badgeClass: "border-red-200 bg-red-100 text-red-700",
    badgeLabel: "Urgent",
  },
  warning: {
    Icon: AlertTriangle,
    iconWrapperClass: "border border-amber-300/40 bg-amber-200/20 text-amber-100",
    iconClass: "text-amber-200",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    badgeLabel: "Action needed",
  },
  success: {
    Icon: CheckCircle,
    iconWrapperClass: "border border-emerald-200/50 bg-emerald-400/15 text-emerald-50",
    iconClass: "text-emerald-200",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeLabel: "Compliant",
  },
  info: {
    Icon: FileEdit,
    iconWrapperClass: "border border-slate-200/40 bg-slate-100/60 text-slate-500",
    iconClass: "text-slate-500",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    badgeLabel: "Information",
  },
};

const CHECKLIST_BADGES: Record<
  ChecklistStatus,
  { label: string; className: string }
> = {
  in_progress: {
    label: "In progress",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  complete: {
    label: "Complete",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

const DED_SUMMARY =
  "DED inspectors asked for the updated kitchen layout, staff training logs, and calibration certificates before they close the renewal.";

const DED_HIGHLIGHTS = [
  "Onsite visit slot still needs confirmation",
  "Upload the revised HACCP documentation",
  "Collect shift lead signatures on the training log",
];

const DED_CHECKLIST: ChecklistItem[] = [
  {
    id: "schedule-visit",
    label: "Confirm onsite visit slot with inspector H. Al-Nuaimi",
    helper: "Preferred window: 24–26 April",
    status: "in_progress",
  },
  {
    id: "upload-updates",
    label: "Upload updated kitchen HACCP documents",
    helper: "Draft prepared by operations team",
    status: "in_progress",
  },
  {
    id: "staff-logs",
    label: "Collect staff training compliance log",
    helper: "Shift leads to sign off",
    status: "in_progress",
  },
  {
    id: "previous-findings",
    label: "Review previous inspection findings",
    helper: "All corrective actions completed",
    status: "complete",
  },
];

const DED_DOCUMENTS: DedDocument[] = [
  {
    id: "risk-assessment",
    label: "Risk assessment checklist",
    meta: "PDF • 3.2 MB",
    statusLabel: "Updated",
  },
  {
    id: "floor-plan",
    label: "Revised kitchen floor plan",
    meta: "DWG • 1.1 MB",
    statusLabel: "Pending upload",
  },
  {
    id: "certificates",
    label: "Calibration certificates",
    meta: "ZIP • 5 files",
    statusLabel: "Ready",
  },
];

const DED_MEDIA = [
  {
    id: "smart-kitchen-monitoring",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/b8e81338fc04dbb1961cecf6a6b349e10dd288d5?width=824",
    alt: "DED inspector observing smart kitchen monitoring data on screen",
    caption: "Kitchen monitoring feed",
  },
  {
    id: "dining-floor-analytics",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/35354ebad5489f0ffae354b2521357c0e9b5d5fa?width=918",
    alt: "Analytics overlay highlighting compliance metrics across dining floor",
    caption: "Dining floor analytics",
  },
  {
    id: "storage-zone-alert",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/37e3d308bae6fa63163fe9e0bbe47135f19cab55?width=824",
    alt: "Alert shown for storage zone breach captured by surveillance",
    caption: "Storage zone alert",
  },
];

const GROWTH_PROGRESS = 75;
const GROWTH_STEPS = 9;
const GROWTH_ACTIONS = 3;

const GROWTH_OPPORTUNITY_CONTENT = {
  trends: {
    id: "trends",
    title: "5 new economic trends",
    subtitle: "Curated for hospitality",
    buttonLabel: "View report",
  },
  services: {
    id: "services",
    title: "3 relevant services",
    subtitle: "Marketplace matches",
    buttonLabel: "Explore services",
  },
  suppliers: {
    id: "suppliers",
    title: "Marketplace suppliers",
    subtitle: "17 new matches",
    buttonLabel: "Meet suppliers",
  },
};

const TOURISM_DELTA = 12;
const TOURISM_TOTAL = "5,932,234";

const TOURISM_BREAKDOWN = [
  {
    id: "india",
    label: "India",
    value: "1,651,000",
    progress: "83%",
    barClass: "bg-[#0f766e]",
    flag: (
      <svg
        width="27"
        height="20"
        viewBox="0 0 27 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0H26.6667V6.66667H0V0Z" fill="#FF9933" />
        <path d="M0 6.6665H26.6667V13.3332H0V6.6665Z" fill="white" />
        <path d="M0 13.3335H26.6667V20.0002H0V13.3335Z" fill="#128807" />
        <circle cx="13.3333" cy="10" r="2.66667" fill="#000088" />
      </svg>
    ),
  },
  {
    id: "australia",
    label: "Australia",
    value: "1,221,498",
    progress: "70%",
    barClass: "bg-[#54FFD4]",
    flag: (
      <svg
        width="27"
        height="20"
        viewBox="0 0 27 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="26.6667" height="20" fill="#000066" />
        <path d="M0 0H13.3333V10H0V0Z" fill="#000066" />
        <path
          d="M1.5625 0L6.64583 3.77083L11.7083 0H13.3333V1.29167L8.33333 5.02083L13.3333 8.72917V10H11.6667L6.66667 6.27083L1.6875 10H0V8.75L4.97917 5.04167L0 1.33333V0H1.5625Z"
          fill="white"
        />
        <path
          d="M8.83333 5.85417L13.3333 9.16667V10L7.6875 5.85417H8.83333Z"
          fill="#C8102E"
        />
      </svg>
    ),
  },
];

const SOCIAL_GROWTH = 14445;

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"] as const;
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const formatted = exponent === 0 ? Math.round(value).toString() : value.toFixed(1);

  return `${formatted} ${units[exponent]}`;
}

export function ComplianceGrowthFocusContent({
  journeyNumber = "0987654321",
  progressPercent = 78,
}: ComplianceGrowthFocusContentProps) {
  const [activeView, setActiveView] = React.useState<ToggleView>("compliance");
  const [complianceSections, setComplianceSections] = React.useState<string[]>([
    "action",
    "snapshot",
    "checklist",
  ]);
  const [growthSections, setGrowthSections] = React.useState<string[]>([
    "action",
    "snapshot",
    "opportunities",
  ]);
  const [showDedDetail, setShowDedDetail] = React.useState<boolean>(false);
  const [inspectionEvidence, setInspectionEvidence] = React.useState<InspectionEvidence | null>(null);

  const inspectionUploadInputRef = React.useRef<HTMLInputElement | null>(null);

  const urgentItems = React.useMemo(
    () => COMPLIANCE_ITEMS.filter((item) => item.status === "error" || item.status === "warning"),
    [],
  );

  const scrollToElement = React.useCallback((elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const ensureSectionOpen = React.useCallback(
    (view: ToggleView, sectionId: string) => {
      if (view === "compliance") {
        setComplianceSections((previous) => (previous.includes(sectionId) ? previous : [...previous, sectionId]));
      } else {
        setGrowthSections((previous) => (previous.includes(sectionId) ? previous : [...previous, sectionId]));
      }
    },
    [setComplianceSections, setGrowthSections],
  );

  const complianceSummary = React.useMemo(
    () =>
      `${urgentItems.length} urgent ${urgentItems.length === 1 ? "item" : "items"} • ${progressPercent}% compliant`,
    [progressPercent, urgentItems],
  );

  const complianceNextAction = React.useMemo(() => {
    const dedItem = COMPLIANCE_ITEMS.find((item) => item.id === "ded-inspection");
    if (!dedItem) {
      return {
        subtitle: "All compliance tasks",
        description: "Track authority updates and confirm each required inspection.",
        buttonLabel: "View compliance snapshot",
        onClick: () => ensureSectionOpen("compliance", "snapshot"),
        disabled: false,
      };
    }

    const token = COMPLIANCE_STATUS_TOKENS[dedItem.status];
    return {
      subtitle: `${dedItem.label} — ${token.badgeLabel}`,
      description:
        "Check the DED requirements and upload the requested evidence so the renewal can be cleared early.",
      buttonLabel: "Open DED checklist",
      onClick: () => {
        ensureSectionOpen("compliance", "checklist");
        setShowDedDetail(true);
        scrollToElement("compliance-checklist-card");
      },
      disabled: false,
    };
  }, [ensureSectionOpen, scrollToElement]);

  const growthNextAction = React.useMemo(() => {
    return {
      subtitle: "Marketplace services",
      description: "Review the three suggested services aligned to your growth plan this quarter.",
      buttonLabel: "View opportunities",
      onClick: () => {
        ensureSectionOpen("growth", "opportunities");
        scrollToElement("growth-opportunities-card");
      },
      disabled: false,
    };
  }, [ensureSectionOpen, scrollToElement]);

  const growthSummary = `${GROWTH_STEPS} new steps • ${GROWTH_ACTIONS} actions`;

  React.useEffect(() => {
    return () => {
      if (inspectionEvidence?.url) {
        URL.revokeObjectURL(inspectionEvidence.url);
      }
    };
  }, [inspectionEvidence]);

  const handleInspectionUploadClick = React.useCallback(() => {
    inspectionUploadInputRef.current?.click();
  }, []);

  const handleInspectionFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      setInspectionEvidence((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }
        return {
          id: `inspection-${Date.now()}`,
          name: file.name,
          url: URL.createObjectURL(file),
          sizeLabel: formatFileSize(file.size),
        };
      });
      event.target.value = "";
    },
    [],
  );

  const growthOpportunities = React.useMemo<GrowthOpportunity[]>(
    () => [
      {
        ...GROWTH_OPPORTUNITY_CONTENT.trends,
        onClick: () => {
          ensureSectionOpen("growth", "opportunities");
          scrollToElement("growth-opportunities-card");
        },
      },
      {
        ...GROWTH_OPPORTUNITY_CONTENT.services,
        onClick: () => {
          ensureSectionOpen("growth", "opportunities");
          scrollToElement("growth-opportunities-card");
        },
      },
      {
        ...GROWTH_OPPORTUNITY_CONTENT.suppliers,
        onClick: () => {
          ensureSectionOpen("growth", "opportunities");
          scrollToElement("growth-opportunities-card");
        },
      },
    ],
    [ensureSectionOpen, scrollToElement],
  );

  function handleViewChange(view: ToggleView) {
    setActiveView(view);
    requestAnimationFrame(() => {
      const anchor = view === "compliance" ? "compliance-action-card" : "growth-action-card";
      scrollToElement(anchor);
    });
  }

  const accordionValue = activeView === "compliance" ? complianceSections : growthSections;
  const setAccordionValue = activeView === "compliance" ? setComplianceSections : setGrowthSections;

  const nextAction = activeView === "compliance" ? complianceNextAction : growthNextAction;
  const summarySubtitle = activeView === "compliance" ? complianceSummary : growthSummary;
  const summaryProgress = activeView === "compliance" ? progressPercent : GROWTH_PROGRESS;
  const summaryLabel = activeView === "compliance" ? "Compliance progress" : "Growth progress";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Journey number</p>
            <p className="text-lg font-semibold text-slate-900">{journeyNumber}</p>
          </div>
          <Badge className="inline-flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
            Live sync
          </Badge>
        </div>
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Stage 5 • Compliance & growth</p>
              <h3 className="text-2xl font-semibold text-slate-900">Stay compliant while expanding</h3>
              <p className="text-sm text-slate-600">Switch views to follow regulatory tasks or act on new expansion opportunities.</p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleButton
                label="Compliance"
                isActive={activeView === "compliance"}
                onClick={() => handleViewChange("compliance")}
              />
              <ToggleButton
                label="Growth"
                isActive={activeView === "growth"}
                onClick={() => handleViewChange("growth")}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>{summarySubtitle}</span>
            </div>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] transition-all"
                  style={{ width: `${summaryProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>{summaryLabel}</span>
                <span>{summaryProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Accordion type="multiple" value={accordionValue} onValueChange={setAccordionValue} className="space-y-4">
        <CollapsibleCard
          value="action"
          title="Next action"
          subtitle={nextAction.subtitle}
          contentId={activeView === "compliance" ? "compliance-action-card" : "growth-action-card"}
        >
          <p className="text-sm text-slate-600">{nextAction.description}</p>
          <Button
            type="button"
            size="sm"
            onClick={nextAction.onClick}
            disabled={nextAction.disabled}
            className="self-start rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            {nextAction.buttonLabel}
          </Button>
        </CollapsibleCard>

        {activeView === "compliance" ? (
          <>
            <CollapsibleCard
              value="snapshot"
              title="Compliance snapshot"
              subtitle="Live monitoring across authorities"
              contentId="compliance-snapshot-card"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricSummary label="Outstanding actions" value="22%" helper="Items Omnis is tracking" />
                <MetricSummary label="Authorities synced" value="78%" helper="Latest authority responses" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Omnis updates these metrics each time an authority responds.
              </p>
            </CollapsibleCard>

            <CollapsibleCard
              value="checklist"
              title="Compliance checklist"
              subtitle="Track each requirement"
              contentId="compliance-checklist-card"
            >
              <p className="text-sm text-slate-600">
                Review outstanding tasks, then share evidence so inspectors can approve everything in one visit.
              </p>
              <div className="space-y-3">
                {COMPLIANCE_ITEMS.map((item) => (
                  <ComplianceChecklistItem
                    key={item.id}
                    item={item}
                    isDedDetailOpen={showDedDetail}
                    onToggleDedDetail={() => setShowDedDetail((value) => !value)}
                  />
                ))}
              </div>
              {showDedDetail ? (
                <DedDetailCard
                  inspectionEvidence={inspectionEvidence}
                  onClickUpload={handleInspectionUploadClick}
                  onFileChange={handleInspectionFileChange}
                  inputRef={inspectionUploadInputRef}
                />
              ) : null}
            </CollapsibleCard>

            <CollapsibleCard
              value="alerts"
              title="Compliance alerts"
              subtitle={`${urgentItems.length} open`}
              contentId="compliance-alerts-card"
            >
              {urgentItems.length > 0 ? (
                <div className="space-y-3">
                  {urgentItems.map((item) => (
                    <ComplianceAlert key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">All compliance checks are clear.</p>
              )}
            </CollapsibleCard>

            <CollapsibleCard
              value="renewals"
              title="Upcoming renewals"
              subtitle="Keep documents current"
              contentId="compliance-renewals-card"
            >
              <ul className="space-y-2 text-sm text-slate-600">
                <RenewalItem label="DED inspection follow-up" value="29 days" valueClass="text-[#b97324]" />
                <RenewalItem label="Visa renewals status" value="Renewed" valueClass="text-[#0f766e]" />
                <RenewalItem label="Tawtheeq certificate" value="320 days remaining" valueClass="text-slate-500" />
              </ul>
            </CollapsibleCard>
          </>
        ) : (
          <>
            <CollapsibleCard
              value="snapshot"
              title="Growth snapshot"
              subtitle="Momentum across insights"
              contentId="growth-snapshot-card"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricSummary label="New growth steps" value={`${GROWTH_STEPS}`} helper="Expansion paths identified" />
                <MetricSummary label="Actions to take" value={`${GROWTH_ACTIONS}`} helper="High impact follow-ups" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Omnis refreshes the growth plan with market signals and partner data.
              </p>
            </CollapsibleCard>

            <CollapsibleCard
              value="opportunities"
              title="Opportunities"
              subtitle="Act on the highest impact items"
              contentId="growth-opportunities-card"
            >
              <div className="space-y-3">
                {growthOpportunities.map((opportunity) => (
                  <GrowthOpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              value="tourism"
              title="Tourism insight"
              subtitle="Latest visitor data"
              contentId="growth-tourism-card"
            >
              <TourismInsight />
            </CollapsibleCard>

            <CollapsibleCard
              value="engagement"
              title="Engagement trends"
              subtitle="Social reach this month"
              contentId="growth-engagement-card"
            >
              <SocialInsight />
            </CollapsibleCard>
          </>
        )}
      </Accordion>
    </div>
  );

}

function ToggleButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
        isActive
          ? "border-[#169F9F] bg-[#169F9F] text-white shadow-[0_18px_36px_-24px_rgba(23,135,126,0.45)]"
          : "border-[#d8e4df] bg-white text-slate-700 hover:border-[#169F9F]/50 hover:text-[#0f766e]",
      )}
    >
      {label}
    </Button>
  );
}

function MetricSummary({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d8e4df] bg-white/95 p-4 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function ComplianceChecklistItem({
  item,
  isDedDetailOpen,
  onToggleDedDetail,
}: {
  item: ComplianceItem;
  isDedDetailOpen: boolean;
  onToggleDedDetail: () => void;
}) {
  const token = COMPLIANCE_STATUS_TOKENS[item.status];
  const { Icon } = token;
  const isDedItem = item.id === "ded-inspection";

  return (
    <div className="rounded-3xl border border-[#d8e4df] bg-white/95 p-4 shadow-[0_20px_45px_-40px_rgba(15,118,110,0.25)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", token.iconWrapperClass)}>
            <Icon className={cn("h-5 w-5", token.iconClass)} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.detail}</p>
          </div>
        </div>
        {isDedItem ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleDedDetail}
            className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
          >
            {isDedDetailOpen ? "Hide DED actions" : "View DED actions"}
          </Button>
        ) : (
          <Badge className={cn("self-start rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", token.badgeClass)}>
            {token.badgeLabel}
          </Badge>
        )}
      </div>
    </div>
  );
}

function DedDetailCard({
  inspectionEvidence,
  onClickUpload,
  onFileChange,
  inputRef,
}: {
  inspectionEvidence: InspectionEvidence | null;
  onClickUpload: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-5 rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_20px_48px_-44px_rgba(15,23,42,0.4)]">
      <div className="space-y-2">
        <p className="font-semibold text-slate-900">What DED needs</p>
        <p className="text-sm text-slate-600">{DED_SUMMARY}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Highlights</p>
        <ul className="space-y-2">
          {DED_HIGHLIGHTS.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0f766e]" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Checklist</p>
        <ul className="space-y-2">
          {DED_CHECKLIST.map((item) => {
            const badge = CHECKLIST_BADGES[item.status];
            return (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-[#e3eeea] bg-[#f5faf7] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  {item.helper ? <p className="text-xs text-slate-500">{item.helper}</p> : null}
                </div>
                <Badge className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", badge.className)}>
                  {badge.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Supporting files</p>
        <ul className="space-y-2">
          {DED_DOCUMENTS.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-2 rounded-2xl border border-[#e3eeea] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{doc.label}</p>
                <p className="text-xs text-slate-500">{doc.meta}</p>
              </div>
              <Badge className="rounded-full border border-[#d8e4df] bg-[#f5faf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                {doc.statusLabel}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Signboard inspection</p>
            <p className="text-sm text-slate-600">
              Upload a short video of the exterior signage so inspectors can review it remotely.
            </p>
          </div>
          <Badge className="rounded-full border border-[#0f766e]/25 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Investor view
          </Badge>
        </div>
        <input ref={inputRef} type="file" accept="video/*" onChange={onFileChange} className="hidden" />
        <button
          type="button"
          onClick={onClickUpload}
          className="flex h-20 w-full items-center justify-center rounded-3xl border border-dashed border-[#0f766e] bg-[#f5faf7] text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#0f766e]/10"
        >
          Upload inspection video
        </button>
        <div className="space-y-3 rounded-2xl border border-[#e3eeea] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Inspection evidences library</p>
            {inspectionEvidence ? (
              <Badge className="rounded-full border border-[#f3dcb6] bg-[#fdf6e4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b97324]">
                Pending review
              </Badge>
            ) : null}
          </div>
          {inspectionEvidence ? (
            <div className="space-y-3 rounded-2xl border border-[#e3eeea] bg-[#f5faf7] p-3">
              <video src={inspectionEvidence.url} controls className="h-52 w-full rounded-2xl bg-black/80 object-cover" />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{inspectionEvidence.name}</p>
                  <p className="text-xs text-slate-500">{inspectionEvidence.sizeLabel}</p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b97324]">Status: Pending review</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e3eeea] bg-[#f8fbfa] p-4 text-sm text-slate-500">
              No inspection videos yet. Upload evidence to trigger the remote review.
            </div>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Photo reference library</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DED_MEDIA.map((asset) => (
            <figure key={asset.id} className="group overflow-hidden rounded-2xl border border-[#d8e4df] bg-[#f8fbfa]">
              <img
                src={asset.src}
                alt={asset.alt}
                className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <figcaption className="px-3 py-2 text-center text-xs font-medium text-slate-600">{asset.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e3eeea] bg-[#f5faf7] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#94d2c2] bg-[#dff2ec]/70 text-[#0f766e]">
            <ArrowRight className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Follow up with DED inspector</p>
            <p className="text-xs text-slate-600">Share evidence and confirm the onsite visit in one step.</p>
          </div>
        </div>
        <Button className="rounded-full bg-[#169F9F] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_32px_-24px_rgba(23,135,126,0.45)] hover:bg-[#128080]">
          Follow up
        </Button>
      </div>
    </div>
  );
}

function ComplianceAlert({ item }: { item: ComplianceItem }) {
  const token = COMPLIANCE_STATUS_TOKENS[item.status];
  const { Icon } = token;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4">
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
}

function RenewalItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-[#d8e4df] bg-white/95 px-4 py-3">
      <span>{label}</span>
      <span className={cn("text-xs font-semibold uppercase tracking-[0.18em]", valueClass)}>{value}</span>
    </li>
  );
}

function GrowthOpportunityCard({ opportunity }: { opportunity: GrowthOpportunity }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#d8e4df] bg-white/95 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{opportunity.title}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{opportunity.subtitle}</p>
      </div>
      <Button
        size="sm"
        onClick={opportunity.onClick}
        className="rounded-full bg-[#169F9F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(23,135,126,0.45)] hover:bg-[#128080]"
      >
        {opportunity.buttonLabel}
      </Button>
    </div>
  );
}

function TourismInsight() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Visitors to Abu Dhabi</p>
          <p className="text-xs text-slate-500">Latest tourism intelligence</p>
        </div>
        <Badge className="border-white/70 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          +{TOURISM_DELTA}%
        </Badge>
      </div>
      <p className="text-4xl font-semibold text-slate-900">{TOURISM_TOTAL}</p>
      <div className="space-y-3 pt-2">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nationalities</div>
        <div className="space-y-3">
          {TOURISM_BREAKDOWN.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {item.flag}
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#e6f2ed]">
                  <div className={cn("absolute h-full rounded-full", item.barClass)} style={{ width: item.progress }} />
                </div>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialInsight() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#94d2c2] bg-[#dff2ec]/70 text-[#0f766e]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.4901 16.1215H3.76074V14.5478C3.76074 13.7298 4.0855 12.9458 4.66229 12.369C5.23907 11.7922 6.02309 11.4674 6.84109 11.4674H11.4098C12.2278 11.4674 13.0118 11.7922 13.5886 12.369C14.1654 12.9458 14.4901 13.7298 14.4901 14.5478V16.1215Z"
              fill="currentColor"
            />
            <path
              d="M9.125 9.77758C10.7773 9.77758 12.118 8.43686 12.118 6.78458C12.118 5.1323 10.7773 3.79158 9.125 3.79158C7.47272 3.79158 6.13199 5.1323 6.13199 6.78458C6.13199 8.43686 7.47272 9.77758 9.125 9.77758Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Social media engagement</p>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{SOCIAL_GROWTH.toLocaleString()} new followers</p>
        </div>
      </div>
      <div className="relative h-20">
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 226 77"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M33.06 46.849C17.5778 50 0 56 0 56V77H226V1.5C202.93 12.5777 201.578 18.8492 172.639 20C152.263 20.8103 140.622 21.5 121.161 25C99.2055 28.9486 89.1444 35 68.4278 40.5C48.2469 45.8577 53.9241 42.6026 33.06 46.849Z"
            fill="url(#paint0_linear_growth)"
          />
          <path
            d="M1.07031 55C1.07031 55 19.7211 49.2895 33.7386 46.6824C50.8499 43.5 60.7437 44.1995 79.7277 37C102.955 28.1911 99.8166 29 119.905 25C138.911 21.2158 153.76 20.8056 173.894 20C202.491 18.8558 201.948 12.514 224.744 1.5"
            stroke="#73CED0"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear_growth"
              x1="113.535"
              y1="-11.6868"
              x2="113.32"
              y2="77.0007"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4BA2A4" />
              <stop offset="1" stopColor="#041616" stopOpacity="0" />
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
    </div>
  );
}
