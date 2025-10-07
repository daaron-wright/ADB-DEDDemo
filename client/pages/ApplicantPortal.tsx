import { useState, useCallback, useMemo, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BusinessChatUI } from "@/components/ui/business-chat-ui";
import { PortalPageLayout } from "@/components/portal/PortalPageLayout";
import { PortalProfileMenu } from "@/components/portal/PortalProfileMenu";
import { JourneyView } from "@/components/portal/JourneyView";
import type { JourneyStep } from "@/components/portal/JourneyStepper";
import type {
  ActorOption,
  BusinessActivity,
} from "@/components/portal/BusinessActivitiesSelection";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { ENTREPRENEUR_PROFILE } from "@/lib/profile";
import { MessageCircle, Plus, ChevronDown } from "lucide-react";
import {
  JourneyOrchestrationPanel,
  type JourneyOrchestrationPanelCopy,
} from "@/components/portal/JourneyOrchestrationPanel";
import type {
  JourneyAnimationPhase,
  JourneyHighlightState,
  JourneyStage,
  JourneyTimelineItem,
  JourneyTask,
  JourneyTaskStatus,
  NextActionItem,
} from "@/components/portal/journey-types";

interface ApplicationRecord {
  id: string;
  title: string;
  directorate: string;
  beneficiary: "Citizen" | "Resident" | "Investor" | "Visitor";
  status: "In Review" | "Awaiting Documents" | "Approved" | "Draft";
  licenseType: "Commercial License" | "Dual License";
  progress: number;
  submissionDate: string;
  lastUpdated: string;
  nextAction: string;
  summary: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatDisplayDate = (date: Date) => dateFormatter.format(date);

const isoDate = (date: Date) => date.toISOString();

const daysFromToday = (offset: number) => {
  const result = new Date();
  result.setDate(result.getDate() + offset);
  return result;
};

const applications: ApplicationRecord[] = [
  {
    id: "APP-48291",
    title: "Corniche Culinary Collective",
    directorate: "Department of Economic Development",
    beneficiary: "Citizen",
    status: "In Review",
    licenseType: "Commercial License",
    progress: 58,
    submissionDate: isoDate(daysFromToday(-14)),
    lastUpdated: isoDate(daysFromToday(-1)),
    nextAction:
      "Submit consolidated approvals package for ADAFSA and Abu Dhabi Municipality.",
    summary:
      "Your AI-assisted application is sequencing trade name reservation, co-founder onboarding, property confirmation, and downstream approvals for a Corniche restaurant.",
  },
];

const TARGET_TRADE_NAME = applications[0].title;
const TARGET_TRADE_NAME_LOWER = TARGET_TRADE_NAME.trim().toLowerCase();
const DEFAULT_WORKSPACE_TITLE = "Commercial License for Restaurant in Corniche";

const statusStyles: Record<ApplicationRecord["status"], string> = {
  "In Review": "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
  "Awaiting Documents": "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  Approved: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
  Draft: "border-[#d8e4df] bg-[#f4f8f6] text-slate-600",
};

const BUSINESS_AI_INTRO_MESSAGE =
  "Before initiating the licensing process, we need to identify the most suitable legal structure, business activities, and physical space requirements. While certain aspects may already be predefined, others require more clarification to ensure the right decisions are made.";

type PortalLanguage = "en" | "ar";

interface PortalLanguageCopy {
  languageLabel: string;
  englishLabel: string;
  arabicLabel: string;
  englishBadge: string;
  arabicBadge: string;
  subtitle: string;
  workspaceTitle: (name: string) => string;
  workspaceDescription: (name: string) => string;
  nextActionHeading: string;
  nextActionButton: string;
  journey: JourneyOrchestrationPanelCopy;
}

const PORTAL_LANGUAGE_COPY: Record<PortalLanguage, PortalLanguageCopy> = {
  en: {
    languageLabel: "Language",
    englishLabel: "English",
    arabicLabel: "Arabic",
    englishBadge: "English",
    arabicBadge: "Arabic • Translated",
    subtitle: "Business license portal",
    workspaceTitle: (name: string) =>
      name.endsWith("s") ? `${name}' workspace` : `${name}'s workspace`,
    workspaceDescription: (name: string) =>
      `Track your business license progress, ${name}, and know exactly what comes next.`,
    nextActionHeading: "Next action",
    nextActionButton: "Continue to Your Next Action",
    journey: {
      heading: "Journey orchestration",
      timelineLabel: "Journey timeline",
      activePrefix: "Active:",
      activeStage: "Active stage",
      yourNextStep: "Your next step",
      tasksCompleteMessage:
        "All tasks for this stage are complete. Monitor automation updates.",
      automationMessage: "Automation is handling the remaining work for you.",
      openNextTask: "Open next task",
      reviewStage: "Review stage",
      timelineAriaLabel: "Journey stages navigation",
    },
  },
  ar: {
    languageLabel: "اللغة",
    englishLabel: "English",
    arabicLabel: "العربية",
    englishBadge: "English",
    arabicBadge: "العربية • ترجمة",
    subtitle: "بوابة رخ��ة الأعمال",
    workspaceTitle: (name: string) => `مساحة عمل ${name}`,
    workspaceDescription: (name: string) =>
      `تابعي تقدم رخصة عملك يا ${name}، واعرفي تمامًا ما هي الخطوة التالية.`,
    nextActionHeading: "الإجراء التالي",
    nextActionButton: "انتقلي إلى الإجراء التالي",
    journey: {
      heading: "تنسيق الرحلة",
      timelineLabel: "الجدول الزمني للرحلة",
      activePrefix: "الحالة الحالية:",
      activeStage: "المرحلة النشطة",
      yourNextStep: "خطوتك التالية",
      tasksCompleteMessage:
        "تم إكمال كل المهام لهذه المرحلة. راقبي تحديثات الأتمتة.",
      automationMessage: "الأتمتة تتولى بقية العمل نيابةً عنك.",
      openNextTask: "افتحي المهمة التالية",
      reviewStage: "استعرضي المرحلة",
      timelineAriaLabel: "التنقل بين مراحل الرحلة",
    },
  },
};

const BUSINESS_ACTIVITY_GUIDANCE_MESSAGE =
  "You can select multiple business activities for a restaurant, provided they fall under the same business group. You can list a maximum of 10 activities on a single trade license.";

const journeyStages: JourneyStage[] = [
  {
    id: "questionnaire",
    title: "Questionnaire",
    highlight: {
      label: "Intake synced",
      detail: `Completed ${formatDisplayDate(daysFromToday(-16))}`,
    },
    description:
      "Layla completed the AI-guided questionnaire capturing business objectives, ownership, and operational preferences.",
    state: "done",
    statusDetail: "Workspace tailored to responses",
    tasks: [
      {
        id: "questionnaire-business-profile",
        label: "Complete business profile intake",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-17)),
      },
      {
        id: "questionnaire-location-plan",
        label: "Confirm preferred location insights",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-16)),
      },
      {
        id: "questionnaire-automation-sync",
        label: "Sync questionnaire with automation engine",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-15)),
      },
    ],
  },
  {
    id: "trade-name-activities",
    title: "Business Registration",
    highlight: {
      label: "Registration packet in progress",
      detail: "Awaiting shareholder confirmations",
    },
    description:
      "Trade name reservation, ownership structure setup, and registration documents are being finalized with AI guidance.",
    state: "current",
    statusDetail: "Registration documents awaiting signatures",
    tasks: [
      {
        id: "registration-trade-name",
        label: "Reserve Corniche Culinary Collective trade name",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-3)),
      },
      {
        id: "registration-ownership-structure",
        label: "Confirm ownership structure and shareholder records",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(1)),
      },
      {
        id: "registration-initial-approvals",
        label: "Generate initial registration documents",
        status: "pending",
        owner: "Department of Economic Development",
        dueDate: isoDate(daysFromToday(3)),
      },
    ],
  },
  {
    id: "document-submissions",
    title: "Submit Documents",
    highlight: {
      label: "Document package underway",
      detail: "Coordinating authority submissions",
    },
    description:
      "Gathering and submitting required documents from ADJD, ADM, and ADAFSA with automated reminders for each authority.",
    state: "current",
    statusDetail: "Authority submissions in progress",
    statusTransitions: [
      {
        id: "document-submissions-in-progress",
        status: "in_progress",
        label: "Submission of documents in progress",
        detail:
          "Coordinating notarized MOA, tenancy confirmation, and ADAFSA technical consultation.",
        timestamp: isoDate(daysFromToday(-1)),
      },
      {
        id: "document-submissions-scheduled",
        status: "scheduled",
        label: "Awaiting authority acknowledgements",
        detail: `Expected updates by ${formatDisplayDate(daysFromToday(3))}`,
        timestamp: isoDate(daysFromToday(3)),
      },
    ],
    tasks: [
      {
        id: "notarized-moa-adjd",
        label: "Submit Notarized MOA (ADJD)",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-2)),
      },
      {
        id: "tenancy-confirmation-adm",
        label: "Submit Tenancy Confirmation (ADM)",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(1)),
      },
      {
        id: "site-plan-review-adafsa",
        label: "Site Plan Review and Technical Consultation (ADAFSA)",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(2)),
      },
      {
        id: "convert-property-adm",
        label: "Convert Residential to Commercial property (ADM)",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(4)),
      },
    ],
  },
  {
    id: "license",
    title: "Business Licensing",
    highlight: {
      label: "License automation underway",
      detail: "DED automation running final checks",
    },
    description:
      "AI Business is coordinating with the Department of Economic Development to finalize the economic license issuance.",
    state: "current",
    statusDetail: "Economic license generation in progress",
    statusTransitions: [
      {
        id: "economic-license-in-progress",
        status: "in_progress",
        label: "Issuance of Economic License (DED)",
        detail: "DED automation is finalizing the issuance package.",
        timestamp: isoDate(daysFromToday(-1)),
      },
      {
        id: "economic-license-scheduled",
        status: "scheduled",
        label: "Awaiting license number sync",
        detail: `Expected within ${formatDisplayDate(daysFromToday(2))}`,
        timestamp: isoDate(daysFromToday(2)),
      },
    ],
    tasks: [
      {
        id: "license-economic-issuance",
        label: "Issuance of Economic License (DED)",
        status: "in_progress",
        owner: "Department of Economic Development",
        dueDate: isoDate(daysFromToday(2)),
      },
      {
        id: "license-automation-sync",
        label: "AI automation of license application",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(1)),
      },
      {
        id: "license-final-review",
        label: "Final license review and approval",
        status: "pending",
        owner: "Department of Economic Development",
        dueDate: isoDate(daysFromToday(3)),
      },
    ],
  },
  {
    id: "inspections",
    title: "Pre-Operational Inspection",
    highlight: {
      label: "Inspections underway",
      detail: `Processing ${formatDisplayDate(daysFromToday(0))}`,
    },
    description:
      "Pre-operational inspections and certifications by Civil Defense, ADAFSA, banking, and utility providers.",
    state: "current",
    statusDetail: "Certifications in progress",
    statusTransitions: [
      {
        id: "inspections-in-progress",
        status: "in_progress",
        label: "Pre-operational inspections in progress",
        detail:
          "Civil Defense and ADAFSA clearances secured; utilities coordination underway.",
        timestamp: isoDate(daysFromToday(-1)),
      },
      {
        id: "inspections-scheduled",
        status: "scheduled",
        label: "Final walkthrough scheduled",
        detail: `Telecommunication activation on ${formatDisplayDate(daysFromToday(2))}`,
        timestamp: isoDate(daysFromToday(2)),
      },
    ],
    tasks: [
      {
        id: "cert-conformity-adcda",
        label: "Certificate of Conformity (ADCDA)",
        status: "completed",
        owner: "Abu Dhabi Civil Defense",
        completedOn: isoDate(daysFromToday(-3)),
      },
      {
        id: "food-safety-cert-adafsa",
        label: "Food Safety Certification (ADAFSA)",
        status: "completed",
        owner: "Abu Dhabi Agriculture and Food Safety Authority",
        completedOn: isoDate(daysFromToday(-2)),
      },
      {
        id: "bank-account-opening",
        label: "Corporate Bank Account Opening",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(1)),
      },
      {
        id: "telecom-services",
        label: "Telecommunication Services (e&)",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(2)),
      },
    ],
  },
  {
    id: "compliance-growth",
    title: "Compliance / Growth",
    highlight: {
      label: "Ongoing compliance",
      detail: "78% compliant",
    },
    description:
      "Monitor compliance status, manage renewals, and explore growth opportunities for your business.",
    state: "upcoming",
    statusDetail: "Compliance tracking active",
    tasks: [
      {
        id: "compliance-civil-defence",
        label: "Resolve Civil Defence issues",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(5)),
      },
      {
        id: "compliance-ded-inspection",
        label: "DED inspection renewal",
        status: "pending",
        owner: "Department of Economic Development",
        dueDate: isoDate(daysFromToday(29)),
      },
      {
        id: "compliance-visa-renewal",
        label: "Employment visa renewals",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(14)),
      },
    ],
  },
];

const DEFAULT_ACTIVE_STAGE_ID =
  journeyStages.find((stage) => deriveStageState(stage) === "current")?.id ??
  journeyStages[0].id;

const STAGES_WITH_SUPPRESSED_CHAT = new Set<string>([
  "questionnaire",
  "trade-name-activities",
  "document-submissions",
  "license",
  "inspections",
  "compliance-growth",
]);

const journeyHighlightTokens: Record<
  JourneyHighlightState,
  {
    badgeClass: string;
    detailClass: string;
    dotClass: string;
    stateLabel: string;
  }
> = {
  done: {
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    detailClass: "text-slate-500",
    dotClass: "bg-[#0f766e]",
    stateLabel: "Completed",
  },
  current: {
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    detailClass: "text-[#0b7d6f]",
    dotClass: "bg-[#0b7d6f]",
    stateLabel: "In progress",
  },
  upcoming: {
    badgeClass: "border-[#dbe7e1] bg-[#f4f8f6] text-slate-600",
    detailClass: "text-slate-500",
    dotClass: "bg-[#a6bbb1]",
    stateLabel: "Next",
  },
};

const taskStatusTokens: Record<
  JourneyTaskStatus,
  { label: string; badgeClass: string; helperClass: string }
> = {
  completed: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    helperClass: "text-slate-500",
  },
  in_progress: {
    label: "In progress",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    helperClass: "text-[#0b7d6f]",
  },
  pending: {
    label: "Waiting on you",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    helperClass: "text-[#b97324]",
  },
};

function deriveStageState(stage: JourneyStage): JourneyHighlightState {
  const tasks = stage.tasks ?? [];
  if (tasks.length > 0) {
    if (tasks.every((task) => task.status === "completed")) {
      return "done";
    }

    const anyStarted = tasks.some((task) => task.status !== "pending");
    return anyStarted ? "current" : "upcoming";
  }

  const transitions = stage.statusTransitions ?? [];
  if (transitions.length > 0) {
    if (transitions.some((transition) => transition.status === "completed")) {
      return "done";
    }

    if (transitions.some((transition) => transition.status === "in_progress")) {
      return "current";
    }
  }

  return stage.state;
}

type BusinessAIFocusContext =
  | { type: "automation" }
  | { type: "stage"; stageId: string };

type PortalView = "overview" | "journey";

const JOURNEY_NUMBER = "0987654321";

const ACTOR_OPTIONS: ActorOption[] = [
  { id: "ded", label: "Department of Economic Development" },
  { id: "adafsa", label: "Abu Dhabi Agriculture & Food Safety Authority" },
  { id: "adm", label: "Abu Dhabi Municipality" },
  { id: "tamm", label: "TAMM" },
];

const JOURNEY_STEPS_CONFIG: JourneyStep[] = [
  { id: "questionnaire", label: "Questionnaire", state: "completed" },
  {
    id: "trade-name-activities",
    label: "Business Registration",
    state: "current",
  },
  {
    id: "document-submissions",
    label: "Submit Documents",
    state: "current",
  },
  { id: "license", label: "Business Licensing", state: "current" },
  { id: "inspections", label: "Pre-Operational Inspection", state: "current" },
  { id: "compliance-growth", label: "Compliance / Growth", state: "upcoming" },
];

const RECOMMENDED_ACTIVITIES: BusinessActivity[] = [
  {
    id: "full-service-restaurant",
    label: "Full-service restaurant",
    description: "Operate a dine-in restaurant with full kitchen facilities.",
    isRecommended: true,
    actors: ["ded", "adafsa"],
  },
  {
    id: "charcoal-bbq",
    label: "Charcoal/coal BBQ services",
    description: "Indoor and outdoor charcoal grilling operations.",
    isRecommended: true,
    actors: ["adafsa"],
  },
  {
    id: "hospitality-catering",
    label: "Hospitality and catering services",
    description: "Provide event catering and hospitality staffing support.",
    actors: ["adm"],
  },
];

const ADDITIONAL_ACTIVITIES: BusinessActivity[] = [
  {
    id: "delivery-kitchen",
    label: "Delivery-only kitchen",
    description: "Virtual kitchen focused on delivery-only operations.",
    actors: ["ded"],
  },
  {
    id: "food-truck",
    label: "Mobile food truck operations",
    description: "Serve food from licensed mobile units across Abu Dhabi.",
    actors: ["adm"],
  },
  {
    id: "pastry-production",
    label: "Central bakery and pastry production",
    description: "Produce baked goods for wholesale and retail distribution.",
    actors: ["adafsa"],
  },
];

const RECOMMENDED_STAGE_ACTIVITIES: Record<
  string,
  Array<{
    id: string;
    label: string;
    description: string;
    type: "trade-name" | "document" | "licensing" | "inspection" | "compliance" | "general";
  }>
> = {
  questionnaire: [
    {
      id: "activity-curation",
      label: "Recommended activities",
      description: "Curate the activities powering your restaurant license profile.",
      type: "general",
    },
    {
      id: "license-types",
      label: "License types",
      description: "Compare commercial versus professional pathways for your concept.",
      type: "licensing",
    },
  ],
  "trade-name-activities": [
    {
      id: "trade-name-ideas",
      label: "Trade name ideas",
      description: "Explore compliant trade name concepts aligned to your brand vision.",
      type: "trade-name",
    },
    {
      id: "ownership-structure",
      label: "Ownership structure guidance",
      description: "Review shareholder distribution and governance considerations.",
      type: "general",
    },
  ],
  "document-submissions": [
    {
      id: "document-checklist",
      label: "Document pre-validation",
      description: "Ensure every authority submission packet is fully prepared.",
      type: "document",
    },
    {
      id: "coordination-brief",
      label: "Authority coordination brief",
      description: "Understand which agency is handling each outstanding submission.",
      type: "document",
    },
  ],
  license: [
    {
      id: "licensing-scenarios",
      label: "License scenario comparison",
      description: "Compare economic license pathways and issuance timelines.",
      type: "licensing",
    },
    {
      id: "renewal-readiness",
      label: "Renewal readiness checklist",
      description: "Prepare for post-issuance obligations before launch.",
      type: "licensing",
    },
  ],
  inspections: [
    {
      id: "inspection-prep",
      label: "Inspection preparation",
      description: "Checklist for Civil Defense, ADAFSA, and ADM site readiness.",
      type: "inspection",
    },
    {
      id: "service-activation",
      label: "Service activation plan",
      description: "Coordinate utilities, banking, and telecom hand-offs.",
      type: "inspection",
    },
  ],
  "compliance-growth": [
    {
      id: "compliance-monitoring",
      label: "Compliance monitoring",
      description: "Track renewals, certifications, and upcoming obligations.",
      type: "compliance",
    },
    {
      id: "growth-opportunities",
      label: "Growth opportunity scan",
      description: "Identify expansion pathways and cross-sell options.",
      type: "compliance",
    },
  ],
};

const INITIAL_SELECTED_ACTIVITY_IDS = [
  "full-service-restaurant",
  "charcoal-bbq",
];

const computeSteps = (activeStepId: string): JourneyStep[] => {
  const targetIndex = JOURNEY_STEPS_CONFIG.findIndex(
    (step) => step.id === activeStepId,
  );

  return JOURNEY_STEPS_CONFIG.map((step, index) => {
    if (targetIndex === -1) {
      return { ...step };
    }

    const state =
      index < targetIndex
        ? "completed"
        : index === targetIndex
          ? "current"
          : "upcoming";

    return { ...step, state };
  });
};

const JOURNEY_ANIMATION_TIMELINE: JourneyAnimationPhase[] = [
  {
    stageId: "questionnaire",
    message: "Capturing questionnaire responses and tailoring the workspace...",
    percent: 12,
    keyConsiderations: ["Business intent", "Ownership structure"],
    dataTags: ["Business objectives", "Location preferences", "Owner profiles"],
  },
  {
    stageId: "trade-name-activities",
    message: "Preparing business registration packet...",
    percent: 28,
    keyConsiderations: ["Trade name reservation", "Shareholder records"],
    dataTags: ["Trade name", "Ownership documents", "Registration packet"],
  },
  {
    stageId: "document-submissions",
    message: "Gathering and submitting required documents...",
    percent: 44,
    keyConsiderations: ["Document requirements", "Authority coordination"],
    dataTags: ["Notarized MOA", "Tenancy confirmation", "Site plan review"],
  },
  {
    stageId: "license",
    message: "Automating economic license issuance...",
    percent: 68,
    keyConsiderations: ["Regulatory approvals", "License generation"],
    dataTags: [
      "Economic license",
      "DED coordination",
      "Application automation",
    ],
  },
  {
    stageId: "inspections",
    message: "Retrieving certifications and coordinating inspections...",
    percent: 83,
    keyConsiderations: ["Certifications", "Banking setup"],
    dataTags: ["Conformity certificate", "Food safety cert", "Bank account"],
  },
  {
    stageId: "compliance-growth",
    message: "Monitoring compliance and exploring growth opportunities...",
    percent: 95,
    keyConsiderations: [
      "Compliance tracking",
      "License renewals",
      "Expansion planning",
    ],
    dataTags: ["Compliance status", "Growth opportunities", "Renewal dates"],
  },
];

export default function ApplicantPortal() {
  const location = useLocation();
  const [language, setLanguage] = usePersistentState<PortalLanguage>(
    "portal-language",
    "en",
  );
  const [portalView, setPortalView] = useState<PortalView>("overview");
  const portalUser = (
    location.state as
      | {
          user?: {
            name?: string;
            role?: string;
            email?: string;
            avatarUrl?: string;
          };
        }
      | undefined
  )?.user;

  const profileName = portalUser?.name ?? ENTREPRENEUR_PROFILE.name;
  const firstName = profileName.split(" ")[0] ?? profileName;
  const languageCopy = PORTAL_LANGUAGE_COPY[language];
  const workspaceHeroTitle = languageCopy.workspaceTitle(firstName);
  const workspaceDescription = languageCopy.workspaceDescription(firstName);
  const profileEmail = portalUser?.email ?? "layla.almansoori@email.ae";
  const profileAvatar = portalUser?.avatarUrl ?? ENTREPRENEUR_PROFILE.avatar;
  const profileStatus: "online" | "offline" | "none" = "online";

  const [applicationWorkingTitle, setApplicationWorkingTitle] = useState<string>(
    DEFAULT_WORKSPACE_TITLE,
  );

  const primaryApplication = useMemo(
    () => ({ ...applications[0], title: applicationWorkingTitle }),
    [applicationWorkingTitle],
  );
  const initialStageId = DEFAULT_ACTIVE_STAGE_ID;

  const [activeStageId, setActiveStageId] = useState<string>(initialStageId);

  const defaultJourneyStepId =
    JOURNEY_STEPS_CONFIG.find((step) => step.state === "current")?.id ??
    JOURNEY_STEPS_CONFIG[0].id;

  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>(() =>
    computeSteps(defaultJourneyStepId),
  );
  const [currentJourneyStepId, setCurrentJourneyStepId] =
    useState<string>(defaultJourneyStepId);
  const [journeyActivities, setJourneyActivities] = useState<
    BusinessActivity[]
  >(RECOMMENDED_ACTIVITIES);
  const [selectedJourneyActivityIds, setSelectedJourneyActivityIds] = useState<
    string[]
  >(INITIAL_SELECTED_ACTIVITY_IDS);
  const [availableJourneyActivities, setAvailableJourneyActivities] = useState<
    BusinessActivity[]
  >(ADDITIONAL_ACTIVITIES);
  const [journeyAnimationIndex, setJourneyAnimationIndex] = useState(0);
  const [journeyProgressPercent, setJourneyProgressPercent] = useState(
    JOURNEY_ANIMATION_TIMELINE[0]?.percent ?? 0,
  );
  const [isStageManuallySelected, setIsStageManuallySelected] = useState(false);
  const [isTimelineBackgroundBlurred, setIsTimelineBackgroundBlurred] =
    useState(false);
  const [stageRecommendedSelections, setStageRecommendedSelections] = useState<
    Record<string, string | null>
  >({});
  const stageOrder = useMemo(
    () => journeyStages.map((stage) => stage.id),
    [],
  );
  const [stageProgress, setStageProgress] = useState<Record<string, JourneyHighlightState>>(() => {
    const initial: Record<string, JourneyHighlightState> = {};
    journeyStages.forEach((stage) => {
      initial[stage.id] = deriveStageState(stage);
    });
    return initial;
  });

  useEffect(() => {
    const targetIndex = stageOrder.indexOf(activeStageId);
    if (targetIndex === -1) {
      return;
    }

    setStageProgress((previous) => {
      let hasChange = false;
      const next: Record<string, JourneyHighlightState> = {};

      stageOrder.forEach((stageId, index) => {
        const nextState =
          index < targetIndex ? "done" : index === targetIndex ? "current" : "upcoming";
        next[stageId] = nextState;
        if (previous[stageId] !== nextState) {
          hasChange = true;
        }
      });

      return hasChange ? next : previous;
    });
  }, [activeStageId, stageOrder]);

  const updateCurrentJourneyStep = useCallback((stepId: string) => {
    if (!JOURNEY_STEPS_CONFIG.some((step) => step.id === stepId)) {
      return;
    }

    setJourneySteps(computeSteps(stepId));
    setCurrentJourneyStepId(stepId);
  }, []);

  const handleJourneyStepChange = useCallback(
    (stepId: string) => {
      updateCurrentJourneyStep(stepId);
    },
    [updateCurrentJourneyStep],
  );

  const handleJourneyActivityToggle = useCallback((activityId: string) => {
    setSelectedJourneyActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId],
    );
  }, []);

  const handleTradeNameChange = useCallback(
    (tradeName: string | null) => {
      const normalized = tradeName?.trim().toLowerCase() ?? "";
      setApplicationWorkingTitle(
        normalized === TARGET_TRADE_NAME_LOWER
          ? TARGET_TRADE_NAME
          : DEFAULT_WORKSPACE_TITLE,
      );
    },
    [setApplicationWorkingTitle],
  );

  const handleAddJourneyActivity = useCallback((activityId: string) => {
    setAvailableJourneyActivities((prev) => {
      const activity = prev.find((item) => item.id === activityId);
      if (!activity) {
        return prev;
      }

      setJourneyActivities((current) =>
        current.some((item) => item.id === activityId)
          ? current
          : [...current, activity],
      );
      setSelectedJourneyActivityIds((current) =>
        current.includes(activityId) ? current : [...current, activityId],
      );

      return prev.filter((item) => item.id !== activityId);
    });
  }, []);

  useEffect(() => {
    if (portalView !== "overview" || isStageManuallySelected) {
      return;
    }

    const timelineLength = JOURNEY_ANIMATION_TIMELINE.length;
    if (timelineLength <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setJourneyAnimationIndex((prev) => (prev + 1) % timelineLength);
    }, 5500);

    return () => {
      window.clearInterval(interval);
    };
  }, [portalView, isStageManuallySelected]);

  useEffect(() => {
    const phase =
      JOURNEY_ANIMATION_TIMELINE[journeyAnimationIndex] ??
      JOURNEY_ANIMATION_TIMELINE[0];
    if (!phase) {
      return;
    }

    setJourneyProgressPercent(phase.percent);

    if (!isStageManuallySelected) {
      setActiveStageId(phase.stageId);
    }
  }, [journeyAnimationIndex, isStageManuallySelected]);

  const completedJourneySteps = useMemo(
    () => journeySteps.filter((step) => step.state === "completed").length,
    [journeySteps],
  );

  const currentAnimationPhase =
    JOURNEY_ANIMATION_TIMELINE.find(
      (phase) => phase.stageId === activeStageId,
    ) ?? JOURNEY_ANIMATION_TIMELINE[journeyAnimationIndex];
  const clampedJourneyProgress = Math.min(
    Math.max(journeyProgressPercent, 0),
    100,
  );
  const chatPhase = currentAnimationPhase ?? JOURNEY_ANIMATION_TIMELINE[0];
  const chatProgress = currentAnimationPhase
    ? clampedJourneyProgress
    : Math.min(Math.max(chatPhase?.percent ?? 0, 0), 100);

  const handleLanguageChange = useCallback(
    (next: PortalLanguage) => {
      if (next === language) {
        return;
      }

      setLanguage(next);
    },
    [language, setLanguage],
  );

  const languageToggle = (
    <div className="flex flex-col items-end gap-1" aria-label={languageCopy.languageLabel}>
      <div className="inline-flex items-center gap-1 rounded-full border border-[#0f766e]/30 bg-white/90 p-1 shadow-[0_14px_28px_-24px_rgba(15,118,110,0.35)]">
        <button
          type="button"
          onClick={() => handleLanguageChange("en")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition",
            language === "en"
              ? "bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.45)]"
              : "text-[#0f766e]/80 hover:text-[#0f766e]",
          )}
          aria-pressed={language === "en"}
        >
          {languageCopy.englishLabel}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange("ar")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition",
            language === "ar"
              ? "bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.45)]"
              : "text-[#0f766e]/80 hover:text-[#0f766e]",
          )}
          aria-pressed={language === "ar"}
          lang="ar"
        >
          {languageCopy.arabicLabel}
        </button>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
        {language === "ar" ? languageCopy.arabicBadge : languageCopy.englishBadge}
      </span>
    </div>
  );

  const headerActions = (
    <div className="flex items-center gap-4">
      {languageToggle}
      <PortalProfileMenu
        name={profileName}
        email={profileEmail}
        avatarUrl={profileAvatar}
        status={profileStatus}
        onSignOut={() => window.location.assign("/")}
      />
    </div>
  );

  const keyDates = [
    {
      label: "Submitted",
      value: dateFormatter.format(new Date(primaryApplication.submissionDate)),
    },
    {
      label: "Last updated",
      value: dateFormatter.format(new Date(primaryApplication.lastUpdated)),
    },
  ];

  const discoveryGeneralChatLink = "/?chat=open";

  const [businessAIView, setBusinessAIView] = usePersistentState<
    "closed" | "side-panel" | "focus"
  >("portal-business-ai-view", "closed");

  const [focusContext, setFocusContext] =
    useState<BusinessAIFocusContext | null>(null);
  const [isJourneyOverviewOpen, setIsJourneyOverviewOpen] = useState(false);

  const isSidePanelView = businessAIView === "side-panel";
  const isFocusView = businessAIView === "focus";
  const isChatOpen = businessAIView !== "closed";

  const [focusedNextActionId, setFocusedNextActionId] = useState<string | null>(
    null,
  );
  const [todoCompletionState, setTodoCompletionState] = useState<
    Record<string, boolean>
  >({});

  const handleOpenSidePanel = useCallback(() => {
    setBusinessAIView("side-panel");
    setIsTimelineBackgroundBlurred(false);
    setFocusContext(null);
  }, [setBusinessAIView, setFocusContext, setIsTimelineBackgroundBlurred]);
  const handleCloseChat = useCallback(() => {
    setBusinessAIView("closed");
    setIsTimelineBackgroundBlurred(false);
    setFocusedNextActionId(null);
    setFocusContext(null);
  }, [
    setBusinessAIView,
    setFocusedNextActionId,
    setFocusContext,
    setIsTimelineBackgroundBlurred,
  ]);

  const handleTimelineFocusChange = useCallback(
    (isFocused: boolean) => {
      if (isChatOpen) {
        return;
      }

      if (!isFocused && isTimelineBackgroundBlurred) {
        setIsTimelineBackgroundBlurred(false);
      }
    },
    [isChatOpen, isTimelineBackgroundBlurred, setIsTimelineBackgroundBlurred],
  );
  const handleJourneyOverviewToggle = useCallback(() => {
    setIsJourneyOverviewOpen((prev) => {
      const next = !prev;
      if (!next) {
        setIsTimelineBackgroundBlurred(false);
      }
      return next;
    });
  }, [setIsTimelineBackgroundBlurred]);
  const handleJourneyOverviewKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleJourneyOverviewToggle();
      }
    },
    [handleJourneyOverviewToggle],
  );

  useEffect(() => {
    if (!isJourneyOverviewOpen) {
      setIsTimelineBackgroundBlurred(false);
    }
  }, [isJourneyOverviewOpen]);

  useEffect(() => {
    if (portalView !== "overview") {
      setIsTimelineBackgroundBlurred(false);
    }
  }, [portalView]);

  const handleViewJourney = useCallback(
    (stageId: string) => {
      setBusinessAIView("focus");
      setIsTimelineBackgroundBlurred(true);
      setFocusContext({ type: "stage", stageId });
      setIsStageManuallySelected(true);
      setActiveStageId(stageId);
      const timelineIndex = JOURNEY_ANIMATION_TIMELINE.findIndex(
        (phase) => phase.stageId === stageId,
      );
      if (timelineIndex >= 0) {
        setJourneyAnimationIndex(timelineIndex);
        setJourneyProgressPercent(
          JOURNEY_ANIMATION_TIMELINE[timelineIndex]?.percent ?? 0,
        );
      }
      const matchingStep = JOURNEY_STEPS_CONFIG.find(
        (step) => step.id === stageId,
      );
      if (matchingStep) {
        updateCurrentJourneyStep(stageId);
      }

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [
      setBusinessAIView,
      setIsTimelineBackgroundBlurred,
      setFocusContext,
      setIsStageManuallySelected,
      setActiveStageId,
      setJourneyAnimationIndex,
      setJourneyProgressPercent,
      updateCurrentJourneyStep,
    ],
  );

  const todoBankItems = useMemo<NextActionItem[]>(() => {
    const findStageIdByTitle = (title: string) => {
      const normalized = title.trim().toLowerCase();
      const match = journeyStages.find(
        (stage) => stage.title.toLowerCase() === normalized,
      );
      return match?.id ?? null;
    };

    const applicantTasks = journeyStages.flatMap((stage) =>
      stage.tasks
        .filter(
          (task) => task.owner === "Applicant" && task.status !== "completed",
        )
        .map<NextActionItem>((task) => ({
          id: task.id,
          label: task.label,
          status: task.status,
          stageId: stage.id,
          stageTitle: stage.title,
          dueDate: task.dueDate,
        })),
    );

    const uniqueApplicantTasks = applicantTasks.filter(
      (task, index, array) =>
        array.findIndex((candidate) => candidate.id === task.id) === index,
    );

    const questionnaireStageId = findStageIdByTitle("Questionnaire");
    const primaryOutstandingStage = journeyStages.find((stage) =>
      stage.tasks.some(
        (task) => task.owner === "Applicant" && task.status !== "completed",
      ),
    );

    return [
      {
        id: "business-activity-guidance",
        label: "Add licensing guidance to business activities questionnaire",
        status: "guidance",
        description: BUSINESS_ACTIVITY_GUIDANCE_MESSAGE,
        stageId: questionnaireStageId ?? undefined,
        stageTitle: "Questionnaire",
      },
      {
        id: "primary-application-next",
        label: primaryApplication.nextAction,
        status: "workflow",
        stageId: primaryOutstandingStage?.id ?? undefined,
        stageTitle: primaryOutstandingStage?.title ?? "Generating application",
      },
      ...uniqueApplicantTasks,
    ];
  }, [journeyStages, primaryApplication.nextAction]);

  const remainingTodoCount = useMemo(() => {
    return todoBankItems.reduce((count, item) => {
      return todoCompletionState[item.id] ? count : count + 1;
    }, 0);
  }, [todoBankItems, todoCompletionState]);

  const journeyTimelineItems = useMemo<JourneyTimelineItem[]>(() => {
    return journeyStages.map<JourneyTimelineItem>((stage) => {
      const resolvedState = stageProgress[stage.id] ?? deriveStageState(stage);
      const tokens = journeyHighlightTokens[resolvedState];
      return {
        id: stage.id,
        title: stage.title,
        description: stage.description,
        statusLabel: tokens.stateLabel,
        statusBadgeClass: tokens.badgeClass,
        statusHelperClass: tokens.detailClass,
        meta: stage.statusDetail,
        isCurrent: stage.id === activeStageId,
      };
    });
  }, [activeStageId, stageProgress]);

  const currentStageLabel = useMemo(() => {
    const prioritized = journeyTimelineItems.find((item) => item.isCurrent);
    if (prioritized) {
      return prioritized.title;
    }

    const fallbackStage = journeyStages.find(
      (stage) => stage.id === activeStageId,
    );
    return fallbackStage?.title ?? "Journey stage";
  }, [journeyTimelineItems, journeyStages, activeStageId]);

  useEffect(() => {
    setTodoCompletionState((prev) => {
      let hasChange = false;
      const nextState: Record<string, boolean> = { ...prev };

      todoBankItems.forEach((item) => {
        if (!(item.id in nextState)) {
          nextState[item.id] = false;
          hasChange = true;
        }
      });

      Object.keys(nextState).forEach((key) => {
        if (!todoBankItems.some((item) => item.id === key)) {
          delete nextState[key];
          hasChange = true;
        }
      });

      return hasChange ? nextState : prev;
    });
  }, [todoBankItems]);

  useEffect(() => {
    if (
      focusedNextActionId &&
      !todoBankItems.some((item) => item.id === focusedNextActionId)
    ) {
      setFocusedNextActionId(null);
    }
  }, [focusedNextActionId, todoBankItems, setFocusedNextActionId]);

  const handleContinueToNextAction = useCallback(() => {
    const firstNextAction =
      todoBankItems.find((item) => !todoCompletionState[item.id]) ??
      todoBankItems[0];
    const firstNextActionId = firstNextAction?.id ?? null;
    setFocusedNextActionId(firstNextActionId);
    setBusinessAIView("closed");
    setFocusContext(null);
    setIsJourneyOverviewOpen(true);
    setIsTimelineBackgroundBlurred(false);

    if (!firstNextAction) {
      return;
    }

    const normalizedStageTitle =
      firstNextAction.stageTitle?.toLowerCase() ?? null;
    const targetStage = firstNextAction.stageId
      ? journeyStages.find((stage) => stage.id === firstNextAction.stageId)
      : normalizedStageTitle
        ? journeyStages.find(
            (stage) => stage.title.toLowerCase() === normalizedStageTitle,
          )
        : null;

    if (!targetStage) {
      return;
    }

    setIsStageManuallySelected(true);
    setActiveStageId(targetStage.id);

    const timelineIndex = JOURNEY_ANIMATION_TIMELINE.findIndex(
      (phase) => phase.stageId === targetStage.id,
    );
    if (timelineIndex >= 0) {
      setJourneyAnimationIndex(timelineIndex);
      setJourneyProgressPercent(
        JOURNEY_ANIMATION_TIMELINE[timelineIndex]?.percent ?? 0,
      );
    }

    const matchingStep = JOURNEY_STEPS_CONFIG.find(
      (step) => step.id === targetStage.id,
    );
    if (matchingStep) {
      updateCurrentJourneyStep(targetStage.id);
    }
  }, [
    todoBankItems,
    todoCompletionState,
    setBusinessAIView,
    setFocusContext,
    setFocusedNextActionId,
    setIsJourneyOverviewOpen,
    setIsTimelineBackgroundBlurred,
    journeyStages,
    setIsStageManuallySelected,
    setActiveStageId,
    setJourneyAnimationIndex,
    setJourneyProgressPercent,
    updateCurrentJourneyStep,
  ]);

  const handleResumeAutomation = useCallback(() => {
    setIsStageManuallySelected(false);
    const timelineIndex = JOURNEY_ANIMATION_TIMELINE.findIndex(
      (phase) => phase.stageId === activeStageId,
    );
    const nextIndex = timelineIndex >= 0 ? timelineIndex : 0;
    setJourneyAnimationIndex(nextIndex);
    setJourneyProgressPercent(
      JOURNEY_ANIMATION_TIMELINE[nextIndex]?.percent ?? 0,
    );
  }, [activeStageId]);

  const formatJourneyDueDate = useCallback(
    (isoString: string) => dateFormatter.format(new Date(isoString)),
    [],
  );

  const focusViewContext = useMemo(() => {
    if (!focusContext) {
      return null;
    }

    if (focusContext.type === "automation") {
      const timelineItem = journeyTimelineItems.find(
        (item) => item.id === "generating-application",
      );
      return timelineItem ? { timelineItem } : null;
    }

    const stage = journeyStages.find(
      (item) => item.id === focusContext.stageId,
    );
    if (!stage) {
      return null;
    }

    const timelineItem = journeyTimelineItems.find(
      (item) => item.id === focusContext.stageId,
    );
    if (!timelineItem) {
      return null;
    }

    const resolvedStage = {
      ...stage,
      state: stageProgress[stage.id] ?? deriveStageState(stage),
    };

    const stageIndex = journeyStages.findIndex((item) => item.id === stage.id);
    const previousStage = stageIndex > 0 ? journeyStages[stageIndex - 1] : null;
    const nextStage =
      stageIndex >= 0 && stageIndex < journeyStages.length - 1
        ? journeyStages[stageIndex + 1]
        : null;

    return {
      timelineItem,
      stage: resolvedStage,
      navigation:
        previousStage || nextStage
          ? {
              onPrevious: previousStage
                ? () => handleViewJourney(previousStage.id)
                : undefined,
              onNext: nextStage ? () => handleViewJourney(nextStage.id) : undefined,
              previousLabel: previousStage?.title,
              nextLabel: nextStage?.title,
            }
          : undefined,
    };
  }, [
    focusContext,
    journeyTimelineItems,
    journeyStages,
    stageProgress,
    handleViewJourney,
  ]);

  const handleRecommendedActivityChange = useCallback(
    (stageId: string, activityId: string) => {
      setStageRecommendedSelections((prev) => ({
        ...prev,
        [stageId]: activityId,
      }));
    },
    [],
  );

  const journeyFocusViewProps = useMemo(() => {
    if (!focusViewContext) {
      return null;
    }

    const stageId = focusViewContext.stage?.id ?? focusViewContext.timelineItem.id;
    const recommendedOptions =
      stageId && stageId in RECOMMENDED_STAGE_ACTIVITIES
        ? RECOMMENDED_STAGE_ACTIVITIES[stageId]
        : undefined;
    const fallbackRecommendedId = recommendedOptions?.[0]?.id ?? null;
    const selectedRecommendedId =
      stageId && stageRecommendedSelections[stageId]
        ? stageRecommendedSelections[stageId]
        : fallbackRecommendedId;

    const stageActivityContext =
      stageId === "questionnaire"
        ? {
            recommended: RECOMMENDED_ACTIVITIES,
            selectedIds: selectedJourneyActivityIds,
            onToggle: handleJourneyActivityToggle,
            available: availableJourneyActivities,
            onAdd: handleAddJourneyActivity,
          }
        : undefined;

    return {
      timelineItem: focusViewContext.timelineItem,
      stage: focusViewContext.stage,
      highlightTokens: journeyHighlightTokens,
      taskTokens: taskStatusTokens,
      formatDate: formatJourneyDueDate,
      navigation: focusViewContext.navigation,
      recommendedActivities: recommendedOptions,
      activeRecommendedActivityId: selectedRecommendedId,
      onRecommendedActivityChange:
        stageId && recommendedOptions && recommendedOptions.length > 0
          ? (activityId: string) => handleRecommendedActivityChange(stageId, activityId)
          : undefined,
      stageActivities: stageActivityContext,
      tradeName: applicationWorkingTitle,
      onTradeNameChange: handleTradeNameChange,
    };
  }, [
    focusViewContext,
    formatJourneyDueDate,
    stageRecommendedSelections,
    handleRecommendedActivityChange,
    selectedJourneyActivityIds,
    handleJourneyActivityToggle,
    availableJourneyActivities,
    handleAddJourneyActivity,
    applicationWorkingTitle,
    handleTradeNameChange,
  ]);

  const shouldSuppressChatInterface = false;

  const filters = (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Workspace support
        </p>
        <div className="space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Need support?
            </h3>
            <p className="mt-2 leading-relaxed">
              Our licensing team is available Sunday to Thursday, 8:00–18:00
              GST. Reach out at{" "}
              <span className="font-medium text-[#0f766e]">
                licensing@adm.ae
              </span>{" "}
              or call{" "}
              <span className="font-medium text-[#0f766e]">800-555-0134</span>.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Key dates</h3>
            <dl className="mt-3 space-y-2">
              {keyDates.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-slate-600"
                >
                  <dt>{item.label}</dt>
                  <dd className="font-medium text-slate-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {languageCopy.nextActionHeading}
            </h3>
            <p className="mt-2 leading-relaxed">
              {primaryApplication.nextAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (portalView === "journey") {
    return (
      <div className="min-h-screen bg-slate-50">
        <JourneyView
          journeyNumber={JOURNEY_NUMBER}
          completedSteps={completedJourneySteps}
          totalSteps={journeySteps.length}
          currentStepId={currentJourneyStepId}
          steps={journeySteps}
          activities={journeyActivities}
          selectedActivityIds={selectedJourneyActivityIds}
          availableActivities={availableJourneyActivities}
          actorOptions={ACTOR_OPTIONS}
          onStepChange={handleJourneyStepChange}
          onActivityToggle={handleJourneyActivityToggle}
          onAddActivity={handleAddJourneyActivity}
          onClose={() => setPortalView("overview")}
        />
      </div>
    );
  }

  const heroSection = (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3f43] via-[#0f5f66] to-[#0f766e] p-6 text-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.35)] sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.6),rgba(4,32,36,0.2))]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={ENTREPRENEUR_PROFILE.avatar}
                alt={ENTREPRENEUR_PROFILE.name}
                className="h-14 w-14 rounded-2xl border border-white/50 object-cover shadow-[0_14px_28px_-20px_rgba(0,0,0,0.55)]"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  Investor Journey
                </p>
                <p className="text-sm font-semibold text-white">
                  {ENTREPRENEUR_PROFILE.name}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
              Your journey, powered by AI
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Discover a clear path to research market potential, plan key
              approvals, and prepare your business case with AI guidance. In
              just a few stages, explore how {ENTREPRENEUR_PROFILE.name} and
              other investors turn ideas into thriving restaurants across Abu
              Dhabi.
            </p>
          </div>
        </div>
        <div className="flex sm:w-auto sm:items-center">
          <Link
            to={discoveryGeneralChatLink}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-22px_rgba(0,0,0,0.35)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </span>
            Explore more options
          </Link>
        </div>
      </div>
    </section>
  );

  const journeyOverviewSection = (
    <section
      className={cn(
        "rounded-3xl border border-[#d8e4df] bg-white p-8 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.22)]",
        "transition-all duration-500",
        isTimelineBackgroundBlurred &&
          "relative z-[60] shadow-[0_32px_70px_-36px_rgba(11,64,55,0.32)]",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isJourneyOverviewOpen}
        aria-controls="journey-overview-panel"
        aria-label={`Toggle journey overview for ${primaryApplication.title}`}
        onClick={handleJourneyOverviewToggle}
        onKeyDown={handleJourneyOverviewKeyDown}
        className={cn(
          "space-y-8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30",
          isTimelineBackgroundBlurred && "relative overflow-hidden",
        )}
      >
        <div
          className={cn(
            "space-y-8",
            isTimelineBackgroundBlurred &&
              "pointer-events-none select-none filter blur-sm lg:blur-md",
          )}
        >
          <div className="space-y-6 text-slate-900">
            <div className="relative space-y-2 pr-12 lg:pr-16">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {primaryApplication.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {primaryApplication.directorate}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Badge
                    className={cn(
                      "border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                      statusStyles[primaryApplication.status],
                    )}
                  >
                    {primaryApplication.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {primaryApplication.id}
                  </span>
                </div>
              </div>
              <span className="absolute right-0 top-0 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#d8e4df] bg-white text-[#0f766e] shadow-[0_12px_24px_-20px_rgba(11,64,55,0.28)]">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isJourneyOverviewOpen ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="space-y-3">
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenSidePanel();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-[#0f766e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_-22px_rgba(11,64,55,0.4)] transition hover:bg-[#0c6059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Chat with AI
              </Button>
            </div>
          </div>
          <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Beneficiary
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {primaryApplication.beneficiary}
              </p>
            </div>
            <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                License type
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {primaryApplication.licenseType}
              </p>
            </div>
            <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Submission ID
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {primaryApplication.id}
              </p>
            </div>
            <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Last update
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {dateFormatter.format(new Date(primaryApplication.lastUpdated))}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                {languageCopy.nextActionHeading}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {primaryApplication.nextAction}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                handleContinueToNextAction();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-[0_12px_24px_-20px_rgba(11,64,55,0.28)] transition hover:bg-white hover:shadow-[0_16px_32px_-24px_rgba(11,64,55,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 10h10m0 0-4-4m4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {languageCopy.nextActionButton}
            </Button>
          </div>
        </div>
        {isTimelineBackgroundBlurred ? (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/45"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {isJourneyOverviewOpen ? (
        <div
          id="journey-overview-panel"
          className={cn(
            "relative mt-6 rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.22)] sm:p-7",
            isTimelineBackgroundBlurred &&
              "pointer-events-none select-none filter blur-sm lg:blur-md",
          )}
        >
          <JourneyOrchestrationPanel
            introMessage={BUSINESS_AI_INTRO_MESSAGE}
            actions={todoBankItems}
            remainingActionCount={remainingTodoCount}
            completionState={todoCompletionState}
            timelineItems={journeyTimelineItems}
            currentStageLabel={currentStageLabel}
            chatPhase={chatPhase ?? null}
            chatProgress={chatProgress}
            isStageManuallySelected={isStageManuallySelected}
            onResumeAutomation={handleResumeAutomation}
            onViewJourney={handleViewJourney}
            onTimelineFocusChange={handleTimelineFocusChange}
          />
          {isTimelineBackgroundBlurred ? (
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/45"
              aria-hidden="true"
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );

  return (
    <div className="relative">
      <PortalPageLayout
        title={workspaceHeroTitle}
        subtitle={languageCopy.subtitle}
        description={workspaceDescription}
        filters={filters}
        headerActions={headerActions}
        fullWidthSection={
          <>
            {heroSection}
            {journeyOverviewSection}
          </>
        }
      >
        <section className="space-y-6">
          <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 text-sm leading-relaxed text-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Application summary
            </h3>
            <p className="mt-3">{primaryApplication.summary}</p>
            <p className="mt-3 text-xs text-[#0f766e]">
              Your AI assistant will automatically pull the tenancy contract
              from ADM as soon as you register your lease.
            </p>
          </div>
        </section>
      </PortalPageLayout>
      {isTimelineBackgroundBlurred ? (
        <div className="fixed inset-0 z-40 bg-white/40 backdrop-blur-lg transition-opacity duration-500" />
      ) : null}
      <div className="relative z-[70]">
        <BusinessChatUI
          isOpen={isChatOpen}
          mode={isSidePanelView ? "side-panel" : "modal"}
          onClose={handleCloseChat}
          category="restaurants"
          title="Business AI"
          initialMessage={BUSINESS_AI_INTRO_MESSAGE}
          journeyFocusView={journeyFocusViewProps}
          suppressChatInterface={shouldSuppressChatInterface}
        />
      </div>
    </div>
  );
}
