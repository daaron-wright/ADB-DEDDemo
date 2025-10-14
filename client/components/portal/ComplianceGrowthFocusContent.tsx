import * as React from "react";

import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollapsibleCard } from "./StageCollapsibleCard";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Circle,
  FileEdit,
  Home,
  Loader2,
  ScanText,
  ShieldCheck,
  UploadCloud,
  Video,
} from "lucide-react";

interface ComplianceGrowthFocusContentProps {
  journeyNumber?: string;
  progressPercent?: number;
  growthUnlocked?: boolean;
}

type ComplianceStatus = "error" | "warning" | "success" | "info";
type ChecklistStatus = "in_progress" | "complete";
type ToggleView = "compliance" | "growth";
type TabKey = "compliance" | "growth";

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

type InspectionSubmissionStatus = "idle" | "ready" | "submitted";
type PipelineStatus = "complete" | "active" | "pending";

type PipelineStep = {
  id: string;
  title: string;
  description: string;
  helper: string;
};

type BoundingBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ReadinessStatus = "pass" | "attention";

type ReadinessItem = {
  id: string;
  label: string;
  detail?: string;
  status: ReadinessStatus;
};

type TextVerificationRow = {
  id: string;
  language: string;
  registered: string;
  extracted: string;
  matchScore: number;
  status: "PASS" | "REVIEW";
};

const REGISTERED_TRADE_NAMES = {
  english: "Marwah Restaurant Sole LLC",
  arabic: "مطعم مروى شركة ذات مسؤولية محدودة",
} as const;

const INSPECTION_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingest",
    title: "Secure video intake",
    description: "Video uploaded from Layla's workspace and encrypted for review.",
    helper: "14:32 GST • SHA-256 checksum verified",
  },
  {
    id: "sampling",
    title: "Frame sampling",
    description: "Extracting representative frames across exterior and interior walkthrough.",
    helper: "64 key frames prepared",
  },
  {
    id: "yolo",
    title: "YOLO signboard detection",
    description: "Detecting signage, Arabic lettering, and mounting compliance using CV model v8.2.",
    helper: "Confidence threshold 0.85",
  },
  {
    id: "ocr",
    title: "OCR text extraction",
    description: "Running Omnis OCR (Arabic + Latin) to capture bilingual trade name.",
    helper: "Detected 3 high-signal lines",
  },
  {
    id: "verification",
    title: "Text verification & inspector queue",
    description: "Cross-checking extracted text with registration records before inspector review.",
    helper: "Routing to DED inspector queue",
  },
];

const YOLO_DETECTION_SUMMARY = {
  totalFrames: 742,
  framesWithSignboard: 418,
  bestFrameConfidence: 0.97,
  bestFrame: {
    imageUrl:
      "https://images.pexels.com/photos/373541/pexels-photo-373541.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Exterior signage of Marwah Restaurant illuminated at night",
    boundingBox: {
      top: 18,
      left: 20,
      width: 60,
      height: 44,
    } satisfies BoundingBox,
  },
};

const SIGNBOARD_QUALITY_SUMMARY = {
  status: "SUITABLE",
  confidence: 0.94,
  highlights: [
    "Illuminance measured at 428 lux across lettering",
    "High contrast between gold lettering and charcoal background",
    "Arabic and English typography aligned within 1.4° tolerance",
  ],
};

const OCR_TEXT_LINES = [
  "Marwah Restaurant",
  "Sole LLC",
  "مطعم مروى شركة ذات مسؤولية محدودة",
  "رقم الرخصة 784323",
];

const PREMISES_READINESS_ITEMS: ReadinessItem[] = [
  {
    id: "entrance",
    label: "Entrance signboard illuminated",
    detail: "Measured lux ≥ 420 across captured frames",
    status: "pass",
  },
  {
    id: "interior",
    label: "Interior walkthrough recorded",
    detail: "Kitchen, counter, and dining zones documented",
    status: "pass",
  },
  {
    id: "storage",
    label: "Dry storage shelving labeling",
    detail: "Shelf 3 requires refreshed expiry labels",
    status: "attention",
  },
  {
    id: "safety",
    label: "Emergency egress routes visible",
    detail: "Exit signage unobstructed in frames 195-212",
    status: "pass",
  },
];

const TEXT_VERIFICATION_RESULTS: TextVerificationRow[] = [
  {
    id: "english",
    language: "English",
    registered: REGISTERED_TRADE_NAMES.english,
    extracted: "Marwah Restaurant Sole LLC",
    matchScore: 0.98,
    status: "PASS",
  },
  {
    id: "arabic",
    language: "Arabic",
    registered: REGISTERED_TRADE_NAMES.arabic,
    extracted: "مطعم م��وى شركة ذات مسؤولية محدودة",
    matchScore: 0.96,
    status: "PASS",
  },
];

const SUBMISSION_STATUS_TOKENS: Record<InspectionSubmissionStatus, { label: string; className: string }> = {
  idle: {
    label: "Awaiting upload",
    className: "border-[#d8e4df] bg-white text-slate-600",
  },
  ready: {
    label: "Ready to submit",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  submitted: {
    label: "Pending review",
    className: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  },
};

const PIPELINE_STATUS_TOKENS: Record<PipelineStatus, { icon: React.ElementType; wrapperClass: string; iconClass: string; connectorClass: string }> = {
  complete: {
    icon: CheckCircle,
    wrapperClass: "border-[#0f766e] bg-[#0f766e] text-white",
    iconClass: "h-4 w-4",
    connectorClass: "bg-[#0f766e]/30",
  },
  active: {
    icon: Loader2,
    wrapperClass: "border-[#0f766e] bg-[#f5faf7] text-[#0f766e]",
    iconClass: "h-4 w-4 animate-spin",
    connectorClass: "bg-[#0f766e]/30",
  },
  pending: {
    icon: Circle,
    wrapperClass: "border-[#d8e4df] bg-white text-[#d8e4df]",
    iconClass: "h-3.5 w-3.5",
    connectorClass: "bg-[#d8e4df]",
  },
};

const READINESS_STATUS_TOKENS: Record<ReadinessStatus, { label: string; className: string }> = {
  pass: {
    label: "Pass",
    className: "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]",
  },
  attention: {
    label: "Attention",
    className: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  },
};

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: "civil-defence", label: "Civil Defence", status: "error", detail: "2 issues to resolve" },
  { id: "ded-inspection", label: "DED inspection", status: "warning", detail: "29 days remaining" },
  { id: "food-safety", label: "Food & Safety inspection", status: "success", detail: "Pass" },
  { id: "employment-visas", label: "6 Employment Visas", status: "success", detail: "Renewed" },
  { id: "tawtheeq", label: "Tawtheeq", status: "info", detail: "Expires in 320 days" },
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

const CHECKLIST_BADGES: Record<ChecklistStatus, { label: string; className: string }> = {
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
  { id: "risk-assessment", label: "Risk assessment checklist", meta: "PDF • 3.2 MB", statusLabel: "Updated" },
  { id: "floor-plan", label: "Revised kitchen floor plan", meta: "DWG • 1.1 MB", statusLabel: "Pending upload" },
  { id: "certificates", label: "Calibration certificates", meta: "ZIP • 5 files", statusLabel: "Ready" },
];

const DED_MEDIA = [
  {
    id: "signboard-detection",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F4a6693266af74024a2dcab5cb492078f?format=webp&width=800",
    alt: "YOLO overlay highlighting the Marwah Restaurant exterior signboard with bounding boxes",
    caption: "Exterior signboard detection",
  },
  {
    id: "kitchen-detection",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F2331744306ad40c49e1cb65014f8c71a?format=webp&width=800",
    alt: "Computer vision detection of kitchen stations and equipment inside Marwah Restaurant",
    caption: "Kitchen station detection",
  },
  {
    id: "dining-room-detection",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F34a4ec9d31c84b2987a5bad7d5d23889?format=webp&width=800",
    alt: "Dining room view with YOLO detection labels across tables and seating",
    caption: "Dining room detection",
  },
  {
    id: "storage-room-detection",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F539b8c625fe247caa6b2c7b389922091?format=webp&width=800",
    alt: "Storage room shelving with detection overlays marking supplies and equipment",
    caption: "Storage room detection",
  },
];

const GROWTH_PROGRESS = 75;
const GROWTH_STEPS = 9;
const GROWTH_ACTIONS = 3;

const GROWTH_OPPORTUNITY_DEFINITIONS = [
  {
    id: "tourist-affluence",
    title: "Rising tourist affluence",
    subtitle: "Average visitor spend is up 18% compared with last year",
    buttonLabel: "Review trend insights",
  },
  {
    id: "catering-partner",
    title: "Partner with Emirates Culinary Catering",
    subtitle: "Co-create premium events with an established catering ally",
    buttonLabel: "Connect with catering partner",
  },
  {
    id: "al-ain-franchise",
    title: "Franchise expansion in Al Ain",
    subtitle: "Al Jimi Mall is inviting new F&B concepts with incentives",
    buttonLabel: "Review franchise playbook",
  },
] as const;

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
        <path d="M8.83333 5.85417L13.3333 9.16667V10L7.6875 5.85417H8.83333Z" fill="#C8102E" />
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
  growthUnlocked = false,
}: ComplianceGrowthFocusContentProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("compliance");
  const [complianceSections, setComplianceSections] = React.useState<string[]>([
    "action",
    "snapshot",
    "checklist",
    "alerts",
    "renewals",
  ]);
  const [growthSections, setGrowthSections] = React.useState<string[]>([
    "action",
    "snapshot",
    "opportunities",
    "tourism",
    "engagement",
  ]);
  const [showDedDetail, setShowDedDetail] = React.useState(false);
  const [inspectionEvidence, setInspectionEvidence] = React.useState<InspectionEvidence | null>(null);
  const [pendingInspection, setPendingInspection] = React.useState<InspectionEvidence | null>(null);
  const [inspectionSubmissionStatus, setInspectionSubmissionStatus] =
    React.useState<InspectionSubmissionStatus>("idle");
  const inspectionUploadInputRef = React.useRef<HTMLInputElement | null>(null);

  const showGrowthTab = Boolean(growthUnlocked);

  React.useEffect(() => {
    if (!showGrowthTab && activeTab === "growth") {
      setActiveTab("compliance");
    }
  }, [showGrowthTab, activeTab]);

  React.useEffect(() => {
    return () => {
      if (inspectionEvidence?.url) {
        URL.revokeObjectURL(inspectionEvidence.url);
      }
    };
  }, [inspectionEvidence]);

  React.useEffect(() => {
    return () => {
      if (
        pendingInspection?.url &&
        pendingInspection.url !== inspectionEvidence?.url
      ) {
        URL.revokeObjectURL(pendingInspection.url);
      }
    };
  }, [pendingInspection, inspectionEvidence]);

  const urgentItems = React.useMemo(
    () => COMPLIANCE_ITEMS.filter((item) => item.status === "error" || item.status === "warning"),
    [],
  );

  const complianceSummary = React.useMemo(
    () => `${urgentItems.length} urgent ${urgentItems.length === 1 ? "item" : "items"} • ${progressPercent}% compliant`,
    [progressPercent, urgentItems],
  );
  const growthSummary = `${GROWTH_OPPORTUNITY_DEFINITIONS.length} curated plays • ${GROWTH_ACTIONS} actions`;

  const scrollToElement = React.useCallback((elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const ensureSectionOpen = React.useCallback((view: ToggleView, sectionId: string) => {
    if (view === "compliance") {
      setComplianceSections((previous) => (previous.includes(sectionId) ? previous : [...previous, sectionId]));
    } else {
      setGrowthSections((previous) => (previous.includes(sectionId) ? previous : [...previous, sectionId]));
    }
  }, []);

  const complianceNextAction = React.useMemo(() => {
    const dedItem = COMPLIANCE_ITEMS.find((item) => item.id === "ded-inspection");
    if (!dedItem) {
      return {
        subtitle: "All compliance tasks",
        description: "Track authority updates and confirm each required inspection.",
        buttonLabel: "View compliance snapshot",
        onClick: () => {
          ensureSectionOpen("compliance", "snapshot");
          scrollToElement("compliance-snapshot-card");
        },
        disabled: false,
      } as const;
    }

    const token = COMPLIANCE_STATUS_TOKENS[dedItem.status];
    return {
      subtitle: `${dedItem.label} — ${token.badgeLabel}`,
      description:
        "Check the DED requirements and upload the requested evidence so the renewal closes early.",
      buttonLabel: "Open DED checklist",
      onClick: () => {
        ensureSectionOpen("compliance", "checklist");
        setShowDedDetail(true);
        scrollToElement("compliance-checklist-card");
      },
      disabled: false,
    } as const;
  }, [ensureSectionOpen, scrollToElement]);

  const growthNextAction = React.useMemo(
    () => ({
      subtitle: "Growth opportunities",
      description:
        "Open the opportunities card to explore affluent tourist trends, partner intros, and regional expansion leads.",
      buttonLabel: "Show opportunities",
      onClick: () => {
        ensureSectionOpen("growth", "opportunities");
        scrollToElement("growth-opportunities-card");
      },
      disabled: false,
    }) as const,
    [ensureSectionOpen, scrollToElement],
  );

  const handleInspectionUploadClick = React.useCallback(() => {
    inspectionUploadInputRef.current?.click();
  }, []);

  const handleInspectionFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const nextInspection: InspectionEvidence = {
        id: `inspection-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        sizeLabel: formatFileSize(file.size),
      };

      setPendingInspection((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }
        return nextInspection;
      });
      setInspectionSubmissionStatus("ready");

      event.target.value = "";
    },
    [],
  );

  const handleInspectionSubmit = React.useCallback(() => {
    if (!pendingInspection) {
      return;
    }

    setInspectionEvidence((previous) => {
      if (previous?.url && previous.url !== pendingInspection.url) {
        URL.revokeObjectURL(previous.url);
      }
      return pendingInspection;
    });
    setInspectionSubmissionStatus("submitted");
    setPendingInspection(null);
  }, [pendingInspection]);

  const handleResetPendingInspection = React.useCallback(() => {
    setPendingInspection((previous) => {
      if (previous?.url && previous.url !== inspectionEvidence?.url) {
        URL.revokeObjectURL(previous.url);
      }
      return null;
    });
    setInspectionSubmissionStatus(inspectionEvidence ? "submitted" : "idle");
  }, [inspectionEvidence]);

  const growthOpportunities = React.useMemo<GrowthOpportunity[]>(
    () =>
      GROWTH_OPPORTUNITY_DEFINITIONS.map((definition) => ({
        id: definition.id,
        title: definition.title,
        subtitle: definition.subtitle,
        buttonLabel: definition.buttonLabel,
        onClick: () => {
          ensureSectionOpen("growth", "opportunities");
          scrollToElement("growth-opportunities-card");
        },
      })),
    [ensureSectionOpen, scrollToElement],
  );

  const renderSummaryCard = React.useCallback(
    (tab: TabKey) => {
      const isCompliance = tab === "compliance";
      const badgeLabel = isCompliance ? "Live sync" : "Omnis insights";
      const heading = isCompliance ? "Stay inspection-ready" : "Unlock expansion plays";
      const description = isCompliance
        ? "Monitor obligations, evidence, and renewals before authorities request them."
        : "Use Omnis to surface high-value trends, partners, and regional expansion options.";
      const progress = isCompliance ? progressPercent : GROWTH_PROGRESS;
      const progressLabel = isCompliance ? "Compliance progress" : "Growth momentum";
      const summary = isCompliance ? complianceSummary : growthSummary;

      return (
        <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Journey number</p>
              <p className="text-lg font-semibold text-slate-900">{journeyNumber}</p>
            </div>
            <Badge className="inline-flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
              {badgeLabel}
            </Badge>
          </div>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Stage 5 · Compliance & growth</p>
              <h3 className="text-2xl font-semibold text-slate-900">{heading}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>{progressLabel}</span>
                <span>{progress}%</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{summary}</p>
            </div>
          </div>
        </div>
      );
    },
    [journeyNumber, complianceSummary, growthSummary, progressPercent],
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="space-y-6">
        <TabsList className="inline-flex gap-2 rounded-full border border-[#d8e4df] bg-[#f5faf7] p-1">
          <TabsTrigger value="compliance" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Compliance
          </TabsTrigger>
          {showGrowthTab ? (
            <TabsTrigger value="growth" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              Growth
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          {renderSummaryCard("compliance")}
          <Accordion
            type="multiple"
            value={complianceSections}
            onValueChange={(values) => setComplianceSections(values)}
            className="space-y-4"
          >
            <CollapsibleCard
              value="action"
              title="Next action"
              subtitle={complianceNextAction.subtitle}
              contentId="compliance-action-card"
            >
              <p className="text-sm text-slate-600">{complianceNextAction.description}</p>
              <Button
                type="button"
                size="sm"
                onClick={complianceNextAction.onClick}
                disabled={complianceNextAction.disabled}
                className="self-start rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {complianceNextAction.buttonLabel}
              </Button>
            </CollapsibleCard>

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
                  pendingInspection={pendingInspection}
                  submissionStatus={inspectionSubmissionStatus}
                  onClickUpload={handleInspectionUploadClick}
                  onFileChange={handleInspectionFileChange}
                  onSubmitInspection={handleInspectionSubmit}
                  onResetPending={handleResetPendingInspection}
                  inputRef={inspectionUploadInputRef}
                />
              ) : null}
            </CollapsibleCard>

            <CollapsibleCard
              value="alerts"
              title="Compliance alerts"
              subtitle={`${urgentItems.length} open • Calendar & Omnis`}
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
              <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-[#f8fbfa] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Calendar reminders</p>
                    <p className="text-xs text-slate-500">Sync deadlines to your Outlook, Google, or Apple calendar.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      ensureSectionOpen("compliance", "alerts");
                      scrollToElement("compliance-alerts-card");
                    }}
                    className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                  >
                    Add reminders
                  </Button>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Upcoming events are shared instantly with your calendar and notified 48h in advance.
                </p>
              </div>
              <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-[#f5faf7] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#94d2c2] bg-[#dff2ec]/70 text-[#0f766e]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.375 2.5H15.625C16.1753 2.5 16.6667 2.99137 16.6667 3.54167V16.0417C16.6667 16.592 16.1753 17.0833 15.625 17.0833H4.375C3.8247 17.0833 3.33333 16.592 3.33333 16.0417V3.54167C3.33333 2.99137 3.8247 2.5 4.375 2.5Z"
                        stroke="#0f766e"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M6.66667 0.833374V4.16671" stroke="#0f766e" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M13.3333 0.833374V4.16671" stroke="#0f766e" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M3.33333 6.66663H16.6667" stroke="#0f766e" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Proactive Omnis notifications</p>
                    <p className="text-xs text-slate-600">Omnis monitors authority responses and pings you instantly.</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                    WhatsApp + email alerts when an inspection date changes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                    Daily digest with upcoming renewals and risks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                    Escalation to inspectors if deadlines slip by 24h
                  </li>
                </ul>
                <Button
                  size="sm"
                  className="self-start rounded-full bg-[#169F9F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_-20px_rgba(23,135,126,0.45)] hover:bg-[#128080]"
                >
                  Configure Omnis alerts
                </Button>
              </div>
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
          </Accordion>

          {!showGrowthTab ? (
            <div className="rounded-3xl border border-dashed border-[#0f766e]/40 bg-[#f5faf7] p-5 text-sm text-[#0f766e]">
              Complete the earlier stages to unlock Omnis growth insights. Once the preceding steps are marked done, the Growth tab will appear automatically.
            </div>
          ) : null}
        </TabsContent>

        {showGrowthTab ? (
          <TabsContent value="growth" className="space-y-4">
            {renderSummaryCard("growth")}
            <Accordion
              type="multiple"
              value={growthSections}
              onValueChange={(values) => setGrowthSections(values)}
              className="space-y-4"
            >
              <CollapsibleCard
                value="action"
                title="Next action"
                subtitle={growthNextAction.subtitle}
                contentId="growth-action-card"
              >
                <p className="text-sm text-slate-600">{growthNextAction.description}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={growthNextAction.onClick}
                  disabled={growthNextAction.disabled}
                  className="self-start rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  {growthNextAction.buttonLabel}
                </Button>
              </CollapsibleCard>

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
                subtitle="Affluent visitor segments"
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
            </Accordion>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
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
  pendingInspection,
  submissionStatus,
  onClickUpload,
  onFileChange,
  onSubmitInspection,
  onResetPending,
  inputRef,
}: {
  inspectionEvidence: InspectionEvidence | null;
  pendingInspection: InspectionEvidence | null;
  submissionStatus: InspectionSubmissionStatus;
  onClickUpload: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmitInspection: () => void;
  onResetPending: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const pipelineSteps = React.useMemo(() => {
    let completedCount = 0;
    let activeIndex = 0;

    if (submissionStatus === "idle" || submissionStatus === "ready") {
      completedCount = 0;
      activeIndex = 0;
    } else if (submissionStatus === "submitted") {
      if (inspectionEvidence) {
        completedCount = 3;
        activeIndex = 3;
      } else {
        completedCount = 1;
        activeIndex = 1;
      }
    }

    return INSPECTION_PIPELINE_STEPS.map((step, index) => {
      let status: PipelineStatus = "pending";
      if (index < completedCount) {
        status = "complete";
      } else if (index === activeIndex) {
        status = "active";
      }
      return { ...step, status };
    });
  }, [inspectionEvidence, submissionStatus]);

  const hasSubmission =
    submissionStatus !== "idle" || inspectionEvidence !== null;

  return (
    <div className="space-y-6 rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_20px_48px_-44px_rgba(15,23,42,0.4)]">
      <InspectionTaskHeader submissionStatus={submissionStatus} />
      <InspectionUploadModule
        pendingInspection={pendingInspection}
        submissionStatus={submissionStatus}
        onClickUpload={onClickUpload}
        onFileChange={onFileChange}
        onSubmit={onSubmitInspection}
        onResetPending={onResetPending}
        inputRef={inputRef}
      />
      <InspectionEvidencesLibrary inspectionEvidence={inspectionEvidence} />
      <InspectionPipeline steps={pipelineSteps} hasSubmission={hasSubmission} />
      {inspectionEvidence ? (
        <InspectionAuditReport
          inspectionEvidence={inspectionEvidence}
          yoloSummary={YOLO_DETECTION_SUMMARY}
          qualitySummary={SIGNBOARD_QUALITY_SUMMARY}
          ocrLines={OCR_TEXT_LINES}
          readinessItems={PREMISES_READINESS_ITEMS}
          verificationRows={TEXT_VERIFICATION_RESULTS}
        />
      ) : (
        <InspectionAuditReportPlaceholder />
      )}
      <InspectionSupportingInfo />
    </div>
  );
}

function InspectionTaskHeader({
  submissionStatus,
}: {
  submissionStatus: InspectionSubmissionStatus;
}) {
  const token = SUBMISSION_STATUS_TOKENS[submissionStatus];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            DED inspection task
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            DED Inspection - Signboard &amp; Premises Verification
          </h3>
        </div>
        <Badge
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            token.className,
          )}
        >
          {token.label}
        </Badge>
      </div>
      <p className="text-sm text-slate-600">
        Layla captures a short video of the exterior signboard and a guided interior walkthrough so inspectors can pre-verify compliance remotely.
      </p>
    </div>
  );
}

function InspectionUploadModule({
  pendingInspection,
  submissionStatus,
  onClickUpload,
  onFileChange,
  onSubmit,
  onResetPending,
  inputRef,
}: {
  pendingInspection: InspectionEvidence | null;
  submissionStatus: InspectionSubmissionStatus;
  onClickUpload: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onResetPending: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const hasPending = Boolean(pendingInspection);
  const showSubmittedMessage =
    submissionStatus === "submitted" && !hasPending;

  return (
    <div className="space-y-4 rounded-3xl border border-[#e3eeea] bg-[#f5faf7] p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Signboard inspection upload
        </p>
        <p className="text-sm text-slate-600">
          Upload a continuous clip that shows the exterior signboard, entrance, dining floor, and kitchen stations for the digital inspection.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={onFileChange}
        className="hidden"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={onClickUpload}
          className="inline-flex items-center gap-2 rounded-full bg-[#169F9F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_-22px_rgba(23,135,126,0.45)] hover:bg-[#128080]"
        >
          <UploadCloud className="h-4 w-4" />
          Upload inspection video
        </Button>
        {hasPending ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetPending}
            className="rounded-full border-[#0f766e]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
          >
            Remove selection
          </Button>
        ) : null}
      </div>
      {hasPending ? (
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-white p-3">
          <video
            src={pendingInspection?.url ?? ""}
            controls
            className="h-52 w-full rounded-2xl bg-black/80 object-cover"
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {pendingInspection?.name}
              </p>
              <p className="text-xs text-slate-500">
                {pendingInspection?.sizeLabel}
              </p>
            </div>
            <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Review before submitting
            </Badge>
          </div>
        </div>
      ) : null}
      {showSubmittedMessage ? (
        <div className="rounded-2xl border border-[#d8e4df] bg-white p-3 text-sm text-slate-600">
          Video submitted. Omnis AI is analysing the frames while the inspector is notified.
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <LabeledReadOnlyField
          id="trade-name-english"
          label="Registered trade name (English)"
          value={REGISTERED_TRADE_NAMES.english}
        />
        <LabeledReadOnlyField
          id="trade-name-arabic"
          label="Registered trade name (Arabic)"
          value={REGISTERED_TRADE_NAMES.arabic}
          lang="ar"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!hasPending}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Submit for verification
        </Button>
        <p className="text-xs text-slate-500">
          Once submitted, Omnis queues YOLO detection, OCR, and text verification before the DED inspector reviews.
        </p>
      </div>
    </div>
  );
}

function LabeledReadOnlyField({
  id,
  label,
  value,
  lang,
}: {
  id: string;
  label: string;
  value: string;
  lang?: string;
}) {
  return (
    <label htmlFor={id} className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
        {label}
      </span>
      <Input
        id={id}
        value={value}
        readOnly
        lang={lang}
        className="h-12 rounded-2xl border-[#d8e4df] bg-white/90 text-sm font-medium text-slate-900"
      />
    </label>
  );
}

function InspectionEvidencesLibrary({
  inspectionEvidence,
}: {
  inspectionEvidence: InspectionEvidence | null;
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-[#e3eeea] bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Inspection evidences library
        </p>
        {inspectionEvidence ? (
          <Badge className="rounded-full border border-[#f3dcb6] bg-[#fdf6e4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b97324]">
            Pending review
          </Badge>
        ) : null}
      </div>
      {inspectionEvidence ? (
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-[#f5faf7] p-3">
          <video
            src={inspectionEvidence.url}
            controls
            className="h-52 w-full rounded-2xl bg-black/80 object-cover"
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {inspectionEvidence.name}
              </p>
              <p className="text-xs text-slate-500">
                {inspectionEvidence.sizeLabel}
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b97324]">
              Status: Pending review
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d8e4df] bg-[#f8fbfa] p-4 text-sm text-slate-600">
          Submitted videos will appear here together with their automated audit status.
        </div>
      )}
    </div>
  );
}

function InspectionPipeline({
  steps,
  hasSubmission,
}: {
  steps: Array<PipelineStep & { status: PipelineStatus }>;
  hasSubmission: boolean;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-[#e3eeea] bg-white p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Automated analysis pipeline
        </p>
        <p className="text-sm text-slate-600">
          {hasSubmission
            ? "Omnis processes the video through each stage before the inspector completes the review."
            : "Submit evidence to trigger the Omnis AI pipeline ahead of the inspector review."}
        </p>
      </div>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <PipelineStepItem
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function PipelineStepItem({
  step,
  isLast,
}: {
  step: PipelineStep & { status: PipelineStatus };
  isLast: boolean;
}) {
  const token = PIPELINE_STATUS_TOKENS[step.status];
  const Icon = token.icon;

  return (
    <div className="relative pl-12">
      <span
        className={cn(
          "absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border",
          token.wrapperClass,
        )}
      >
        <Icon className={token.iconClass} aria-hidden="true" />
        <span className="sr-only">{step.status}</span>
      </span>
      {!isLast ? (
        <span
          className={cn(
            "absolute left-3.5 top-8 h-[calc(100%-24px)] w-px",
            token.connectorClass,
          )}
          aria-hidden="true"
        />
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
        <p className="text-sm text-slate-600">{step.description}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {step.helper}
        </p>
      </div>
    </div>
  );
}

function InspectionAuditReport({
  inspectionEvidence,
  yoloSummary,
  qualitySummary,
  ocrLines,
  readinessItems,
  verificationRows,
}: {
  inspectionEvidence: InspectionEvidence;
  yoloSummary: typeof YOLO_DETECTION_SUMMARY;
  qualitySummary: typeof SIGNBOARD_QUALITY_SUMMARY;
  ocrLines: string[];
  readinessItems: ReadinessItem[];
  verificationRows: TextVerificationRow[];
}) {
  const bestFrameBox = yoloSummary.bestFrame.boundingBox;

  return (
    <div className="space-y-4 rounded-3xl border border-[#e3eeea] bg-white p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Detailed audit report
        </p>
        <p className="text-sm text-slate-600">
          Automated computer vision, OCR, and text verification results for {inspectionEvidence.name}.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-[#f5faf7] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#94d2c2] bg-white text-[#0f766e]">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">YOLO detection</p>
              <p className="text-xs text-slate-500">Model v8.2 · Signboard localisation</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Total frames
              </p>
              <p className="text-lg font-semibold text-slate-900">{yoloSummary.totalFrames}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Frames with signboards
              </p>
              <p className="text-lg font-semibold text-slate-900">{yoloSummary.framesWithSignboard}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Best frame confidence
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {Math.round(yoloSummary.bestFrameConfidence * 100)}%
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-[#d8e4df]">
            <img
              src={yoloSummary.bestFrame.imageUrl}
              alt={yoloSummary.bestFrame.alt}
              className="h-48 w-full object-cover"
            />
            <span
              className="absolute border-2 border-[#6ed6cc] bg-emerald-400/10"
              style={{
                top: `${bestFrameBox.top}%`,
                left: `${bestFrameBox.left}%`,
                width: `${bestFrameBox.width}%`,
                height: `${bestFrameBox.height}%`,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#94d2c2] bg-[#f5faf7] text-[#0f766e]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Signboard quality classification</p>
              <p className="text-xs text-slate-500">Lighting &amp; legibility scoring</p>
            </div>
          </div>
          <Badge className="rounded-full border border-[#94d2c2] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            {qualitySummary.status} · {Math.round(qualitySummary.confidence * 100)}%
          </Badge>
          <ul className="space-y-2 text-sm text-slate-600">
            {qualitySummary.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0f766e]" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#94d2c2] bg-[#f5faf7] text-[#0f766e]">
              <ScanText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">OCR text extraction</p>
              <p className="text-xs text-slate-500">Omnis OCR · Arabic + Latin</p>
            </div>
          </div>
          <ol className="space-y-2 text-sm text-slate-700">
            {ocrLines.map((line) => (
              <li key={line} className="rounded-xl bg-[#f5faf7] px-3 py-2">
                {line}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-[#f5faf7] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#94d2c2] bg-white text-[#0f766e]">
              <Home className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Premises operational readiness</p>
              <p className="text-xs text-slate-500">Interior walkthrough checklist</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {readinessItems.map((item) => {
              const token = READINESS_STATUS_TOKENS[item.status];
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    {item.detail ? (
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    ) : null}
                  </div>
                  <Badge
                    className={cn(
                      "self-start rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      token.className,
                    )}
                  >
                    {token.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl border border-[#d8e4df] bg-white p-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#94d2c2] bg-[#f5faf7] text-[#0f766e]">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Text verification audit</p>
              <p className="text-xs text-slate-500">Registered vs extracted trade names</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#d8e4df]">
            <table className="min-w-full divide-y divide-[#e3eeea] text-sm">
              <thead className="bg-[#f5faf7] text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Language</th>
                  <th className="px-4 py-3 text-left">Registered</th>
                  <th className="px-4 py-3 text-left">Extracted</th>
                  <th className="px-4 py-3 text-left">Match</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f5f3] text-slate-700">
                {verificationRows.map((row) => {
                  const statusClass =
                    row.status === "PASS"
                      ? "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]"
                      : "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]";

                  return (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{row.language}</td>
                      <td className="px-4 py-3">{row.registered}</td>
                      <td className="px-4 py-3" lang={row.language === "Arabic" ? "ar" : undefined}>
                        {row.extracted}
                      </td>
                      <td className="px-4 py-3">{Math.round(row.matchScore * 100)}%</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            statusClass,
                          )}
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectionAuditReportPlaceholder() {
  return (
    <div className="rounded-3xl border border-dashed border-[#d8e4df] bg-[#f8fbfa] p-4 text-sm text-slate-600">
      Submit a video to unlock the automated detection, OCR, and text verification insights.
    </div>
  );
}

function InspectionSupportingInfo() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-semibold text-slate-900">What DED needs</p>
        <p className="text-sm text-slate-600">{DED_SUMMARY}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Highlights</p>
        <ul className="space-y-2 text-sm text-slate-600">
          {DED_HIGHLIGHTS.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
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
                  {item.helper ? (
                    <p className="text-xs text-slate-500">{item.helper}</p>
                  ) : null}
                </div>
                <Badge
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    badge.className,
                  )}
                >
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Inspection evidence library</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DED_MEDIA.map((asset) => (
            <figure
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-[#d8e4df] bg-[#f8fbfa]"
            >
              <img
                src={asset.src}
                alt={asset.alt}
                className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <figcaption className="px-3 py-2 text-center text-xs font-medium text-slate-600">
                {asset.caption}
              </figcaption>
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
            fill="url(#paint0_linear_social)"
          />
          <path
            d="M1.07031 55C1.07031 55 19.7211 49.2895 33.7386 46.6824C50.8499 43.5 60.7437 44.1995 79.7277 37C102.955 28.1911 99.8166 29 119.905 25C138.911 21.2158 153.76 20.8056 173.894 20C202.491 18.8558 201.948 12.514 224.744 1.5"
            stroke="#73CED0"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear_social"
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
