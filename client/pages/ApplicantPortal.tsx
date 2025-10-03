import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { MessageCircle, Plus } from "lucide-react";
import { JourneyOrchestrationPanel } from "@/components/portal/JourneyOrchestrationPanel";
import type {
  JourneyAnimationPhase,
  JourneyHighlightState,
  JourneyStage,
  JourneyTimelineItem,
  JourneyTask,
  JourneyTaskStatus,
  NextActionItem,
  NextActionStatus,
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
      "Layla's AI-assisted application is sequencing trade name reservation, co-founder onboarding, property confirmation, and downstream approvals for a Corniche restaurant.",
  },
];

const statusStyles: Record<ApplicationRecord["status"], string> = {
  "In Review": "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
  "Awaiting Documents": "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  Approved: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
  Draft: "border-[#d8e4df] bg-[#f4f8f6] text-slate-600",
};

const BUSINESS_AI_INTRO_MESSAGE =
  "Before initiating the licensing process, we need to identify the most suitable legal structure, business activities, and physical space requirements. While certain aspects may already be predefined, others require more clarification to ensure the right decisions are made.";

const BUSINESS_ACTIVITY_GUIDANCE_MESSAGE =
  "You can select multiple business activities for a restaurant, provided they fall under the same business group. You can list a maximum of 10 activities on a single trade license.";

const journeyStages: JourneyStage[] = [
  {
    id: "trade-name-activities",
    title: "Trade name & activities",
    highlight: {
      label: "Trade name secured",
      detail: `Approved ${formatDisplayDate(daysFromToday(-10))}`,
    },
    description:
      "Layla chose the Corniche Culinary Collective trade name and aligned restaurant activities.",
    state: "done",
    statusDetail: "Trade name approved",
    tasks: [
      {
        id: "trade-name-select",
        label: "Confirm preferred trade name",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-11)),
      },
      {
        id: "trade-name-activities",
        label: "Align business activity groupings",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-10)),
      },
    ],
  },
  {
    id: "owners",
    title: "Owners",
    highlight: {
      label: "Co-founders added",
      detail: `Verified ${formatDisplayDate(daysFromToday(-8))}`,
    },
    description:
      "Co-founder details and ownership percentages are registered and verified.",
    state: "done",
    statusDetail: "Ownership structure confirmed",
    tasks: [
      {
        id: "owners-add-partners",
        label: "Add co-founder details",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-9)),
      },
      {
        id: "owners-verify-ids",
        label: "Verify Emirates IDs for partners",
        status: "completed",
        owner: "Department of Economic Development",
        completedOn: isoDate(daysFromToday(-8)),
      },
    ],
  },
  {
    id: "premises",
    title: "Premises",
    highlight: {
      label: "Property confirmed",
      detail: `Corniche lease uploaded ${formatDisplayDate(daysFromToday(-6))}`,
    },
    description:
      "Property selection and tenancy documentation for the Corniche unit are confirmed.",
    state: "done",
    statusDetail: "Premises ready",
    tasks: [
      {
        id: "premises-confirm-property",
        label: "Confirm property selection",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-7)),
      },
      {
        id: "premises-upload-lease",
        label: "Upload signed tenancy contract",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-6)),
      },
    ],
  },
  {
    id: "approvals",
    title: "Approvals",
    highlight: {
      label: "Approvals in review",
      detail: "Coordinating ADAFSA and municipality supports",
    },
    description:
      "Layla is submitting sector approvals, food control clearance, and signage permits.",
    state: "current",
    statusDetail: "2 approval packages compiling",
    tasks: [
      {
        id: "approvals-adafsa",
        label: "Submit ADAFSA food control approval",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(2)),
      },
      {
        id: "approvals-signage",
        label: "Request municipality signage clearance",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(4)),
      },
      {
        id: "approvals-ded-review",
        label: "DED initial NOC review",
        status: "in_progress",
        owner: "Department of Economic Development",
        dueDate: isoDate(daysFromToday(3)),
      },
    ],
  },
  {
    id: "license",
    title: "License",
    highlight: {
      label: "License application next",
      detail: "Waiting for approvals bundle",
    },
    description:
      "Once approvals land, the unified license application will be compiled and submitted.",
    state: "upcoming",
    statusDetail: "Preparing application artifacts",
    tasks: [
      {
        id: "license-compile-application",
        label: "Compile unified license application",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(6)),
      },
      {
        id: "license-financials",
        label: "Upload financial statements",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(7)),
      },
      {
        id: "license-ded-analyst",
        label: "DED license analyst review",
        status: "pending",
        owner: "Department of Economic Development",
        dueDate: isoDate(daysFromToday(8)),
      },
    ],
  },
  {
    id: "banking-extras",
    title: "Banking & extras",
    highlight: {
      label: "Support services queued",
      detail: "Banking and utilities discovery",
    },
    description:
      "AI surfaces shortlisted banks, utilities, and telecom providers for onboarding.",
    state: "upcoming",
    statusDetail: "Discovery recommendations ready",
    tasks: [
      {
        id: "banking-shortlist",
        label: "Shortlist partner banks",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(9)),
      },
      {
        id: "extras-utilities",
        label: "Request telecom & utilities setup",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(10)),
      },
    ],
  },
  {
    id: "payment-issuance",
    title: "Payment & issuance",
    highlight: {
      label: "Payments upcoming",
      detail: "Consolidated voucher to be generated",
    },
    description:
      "Once the license packet is approved, Layla will pay and receive the digital license instantly.",
    state: "upcoming",
    statusDetail: "Awaiting payment release",
    tasks: [
      {
        id: "payment-generate-voucher",
        label: "Generate consolidated payment voucher",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(11)),
      },
      {
        id: "payment-settle-fees",
        label: "Pay issuance and licensing fees",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(12)),
      },
    ],
  },
  {
    id: "inspections",
    title: "Inspections",
    highlight: {
      label: "Inspection scheduling",
      detail: "Ready once license issued",
    },
    description:
      "Food safety and fit-out inspections will be coordinated to clear operational readiness.",
    state: "upcoming",
    statusDetail: "Inspection prep underway",
    tasks: [
      {
        id: "inspections-schedule",
        label: "Schedule food safety inspection",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(13)),
      },
      {
        id: "inspections-checklist",
        label: "Prepare inspection readiness checklist",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(14)),
      },
    ],
  },
  {
    id: "activation",
    title: "Activation",
    highlight: {
      label: "Launch readiness",
      detail: "Final countdown to opening",
    },
    description:
      "With inspections cleared and services active, Layla prepares to open the restaurant doors.",
    state: "upcoming",
    statusDetail: "Go-live planning",
    tasks: [
      {
        id: "activation-opening-date",
        label: "Set opening date and soft launch plan",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(16)),
      },
      {
        id: "activation-go-live",
        label: "Launch go-live checklist",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(17)),
      },
    ],
  },
];

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

type BusinessAIFocusContext =
  | { type: "automation" }
  | { type: "stage"; stageId: string };

const getNextActionToken = (
  status: NextActionStatus,
): { label: string; badgeClass: string; helperClass: string } => {
  if (status === "guidance") {
    return {
      label: "Questionnaire update",
      badgeClass: "border-[#cdd6fb] bg-[#eef1ff] text-[#3645b0]",
      helperClass: "text-[#3645b0]",
    };
  }

  if (status === "workflow") {
    return {
      label: "Workspace",
      badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
      helperClass: "text-[#0b7d6f]",
    };
  }

  return taskStatusTokens[status];
};

type PortalView = "overview" | "journey";

const JOURNEY_NUMBER = "0987654321";

const ACTOR_OPTIONS: ActorOption[] = [
  { id: "ded", label: "Department of Economic Development" },
  { id: "adafsa", label: "Abu Dhabi Agriculture & Food Safety Authority" },
  { id: "adm", label: "Abu Dhabi Municipality" },
  { id: "tamm", label: "TAMM" },
];

const JOURNEY_STEPS_CONFIG: JourneyStep[] = [
  {
    id: "trade-name-activities",
    label: "Trade name & activities",
    state: "completed",
  },
  { id: "owners", label: "Owners", state: "completed" },
  { id: "premises", label: "Premises", state: "completed" },
  { id: "approvals", label: "Approvals", state: "current" },
  { id: "license", label: "License", state: "upcoming" },
  { id: "banking-extras", label: "Banking / Extras", state: "upcoming" },
  { id: "payment-issuance", label: "Payment & Issuance", state: "upcoming" },
  { id: "inspections", label: "Inspections", state: "upcoming" },
  { id: "activation", label: "Activation", state: "upcoming" },
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
    stageId: "trade-name-activities",
    message: "Selecting trade name and restaurant activities...",
    percent: 18,
    keyConsiderations: ["Trade name options", "Activity scope"],
    dataTags: [
      "Preferred trade name",
      "Activity grouping",
      "Legal structure",
    ],
  },
  {
    stageId: "owners",
    message: "Capturing co-founders and ownership splits...",
    percent: 28,
    keyConsiderations: ["Shareholder IDs", "Equity splits"],
    dataTags: [
      "Co-founder records",
      "Emirates ID",
      "Ownership percentages",
    ],
  },
  {
    stageId: "premises",
    message: "Confirming Corniche property selection...",
    percent: 38,
    keyConsiderations: ["Lease agreement", "Zoning compliance"],
    dataTags: [
      "Tenancy contract",
      "Premises details",
      "Location insights",
    ],
  },
  {
    stageId: "approvals",
    message: "Coordinating sector approvals and permits...",
    percent: 52,
    keyConsiderations: ["Food control", "Municipal signage"],
    dataTags: [
      "ADAFSA package",
      "Municipality request",
      "DED clearance",
    ],
  },
  {
    stageId: "license",
    message: "Compiling unified license application...",
    percent: 66,
    keyConsiderations: ["Financial readiness", "Required attachments"],
    dataTags: [
      "Application draft",
      "Financial statements",
      "Compliance docs",
    ],
  },
  {
    stageId: "banking-extras",
    message: "Recommending banking and utility partners...",
    percent: 76,
    keyConsiderations: ["Working capital", "Utilities onboarding"],
    dataTags: [
      "Bank shortlist",
      "Utility checklist",
      "Telecom options",
    ],
  },
  {
    stageId: "payment-issuance",
    message: "Generating payment voucher and issuance steps...",
    percent: 86,
    keyConsiderations: ["Fee schedule", "Payment channels"],
    dataTags: ["Voucher", "Fee summary", "Receipt"],
  },
  {
    stageId: "inspections",
    message: "Scheduling inspections for operational readiness...",
    percent: 94,
    keyConsiderations: ["Inspection slots", "Fit-out readiness"],
    dataTags: [
      "Inspection calendar",
      "Readiness checklist",
      "Team contacts",
    ],
  },
  {
    stageId: "activation",
    message: "Activating license and preparing opening...",
    percent: 100,
    keyConsiderations: ["Launch planning", "Support services"],
    dataTags: ["Opening date", "Go-live tasks", "Support contacts"],
  },
];

export default function ApplicantPortal() {
  const location = useLocation();
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
  const firstName = profileName.split(" ")[0];
  const workspaceTitle = `${firstName}'s workspace`;
  const workspaceDescription = `Track your business license progress, ${firstName}, and know exactly what comes next.`;
  const profileEmail = portalUser?.email ?? "layla.almansoori@email.ae";
  const profileAvatar = portalUser?.avatarUrl ?? ENTREPRENEUR_PROFILE.avatar;
  const profileStatus: "online" | "offline" | "none" = "online";

  const primaryApplication = applications[0];
  const initialStageId =
    journeyStages.find((stage) => stage.state === "current")?.id ??
    journeyStages[0].id;

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

  const headerActions = (
    <PortalProfileMenu
      name={profileName}
      email={profileEmail}
      avatarUrl={profileAvatar}
      status={profileStatus}
      onSignOut={() => window.location.assign("/")}
    />
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

  const isSidePanelView = businessAIView === "side-panel";
  const isFocusView = businessAIView === "focus";
  const isChatOpen = businessAIView !== "closed";

  const [focusedNextActionId, setFocusedNextActionId] = useState<string | null>(
    null,
  );
  const nextActionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [todoCompletionState, setTodoCompletionState] = useState<
    Record<string, boolean>
  >({});

  const handleOpenSidePanel = useCallback(() => {
    setBusinessAIView("side-panel");
    setFocusContext(null);
  }, [setBusinessAIView, setFocusContext]);
  const handleOpenAutomationFocus = useCallback(() => {
    setBusinessAIView("focus");
    setFocusContext({ type: "automation" });
  }, [setBusinessAIView, setFocusContext]);
  const handleCloseChat = useCallback(() => {
    setBusinessAIView("closed");
    setFocusedNextActionId(null);
    setFocusContext(null);
  }, [setBusinessAIView, setFocusedNextActionId, setFocusContext]);

  const handleViewJourney = (stageId: string) => {
    setBusinessAIView("focus");
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
  };

  const todoBankItems = useMemo<NextActionItem[]>(() => {
    const applicantTasks = journeyStages.flatMap((stage) =>
      stage.tasks
        .filter(
          (task) => task.owner === "Applicant" && task.status !== "completed",
        )
        .map<NextActionItem>((task) => ({
          id: task.id,
          label: task.label,
          status: task.status,
          stageTitle: stage.title,
          dueDate: task.dueDate,
        })),
    );

    const uniqueApplicantTasks = applicantTasks.filter(
      (task, index, array) =>
        array.findIndex((candidate) => candidate.id === task.id) === index,
    );

    return [
      {
        id: "business-activity-guidance",
        label: "Add licensing guidance to business activities questionnaire",
        status: "guidance",
        description: BUSINESS_ACTIVITY_GUIDANCE_MESSAGE,
        stageTitle: "Questionnaire intake",
      },
      {
        id: "primary-application-next",
        label: primaryApplication.nextAction,
        status: "workflow",
        stageTitle: "Workspace overview",
      },
      ...uniqueApplicantTasks,
    ];
  }, [primaryApplication.nextAction]);

  const remainingTodoCount = useMemo(() => {
    return todoBankItems.reduce((count, item) => {
      return todoCompletionState[item.id] ? count : count + 1;
    }, 0);
  }, [todoBankItems, todoCompletionState]);

  const journeyTimelineItems = useMemo<JourneyTimelineItem[]>(() => {
    const automationToken = chatPhase
      ? taskStatusTokens.in_progress
      : taskStatusTokens.completed;

    const automationItem: JourneyTimelineItem = {
      id: "generating-application",
      title: "Generating application",
      description: chatPhase
        ? chatPhase.message
        : "Application workspace has been generated with the latest requirements and synced checkpoints.",
      statusLabel: chatPhase
        ? `${automationToken.label} • ${chatProgress}%`
        : automationToken.label,
      statusBadgeClass: automationToken.badgeClass,
      statusHelperClass: automationToken.helperClass,
      meta: chatPhase
        ? "Automation syncing requirements"
        : "Automation finished",
      isCurrent: Boolean(chatPhase),
      showProgress: Boolean(chatPhase),
    };

    const stageItems = journeyStages.map<JourneyTimelineItem>((stage) => {
      const tokens = journeyHighlightTokens[stage.state];
      return {
        id: stage.id,
        title: stage.title,
        description: stage.description,
        statusLabel: tokens.stateLabel,
        statusBadgeClass: tokens.badgeClass,
        statusHelperClass: tokens.detailClass,
        meta: stage.statusDetail,
        isCurrent: stage.id === activeStageId && !chatPhase,
      };
    });

    return [automationItem, ...stageItems];
  }, [chatPhase, chatProgress, journeyStages, activeStageId]);

  const currentStageLabel = useMemo(() => {
    const prioritized = journeyTimelineItems.find(
      (item) => item.isCurrent && item.id !== "generating-application",
    );
    if (prioritized) {
      return prioritized.title;
    }

    const automationCurrent = journeyTimelineItems.find(
      (item) => item.id === "generating-application" && item.isCurrent,
    );
    if (automationCurrent) {
      return automationCurrent.title;
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
    if (!focusedNextActionId) {
      return;
    }

    const node = nextActionRefs.current[focusedNextActionId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedNextActionId]);

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
    setBusinessAIView("side-panel");
    setFocusContext(null);
  }, [
    todoBankItems,
    todoCompletionState,
    setBusinessAIView,
    setFocusContext,
    setFocusedNextActionId,
  ]);

  const handleNextActionClick = useCallback(
    (action: NextActionItem) => {
      setFocusedNextActionId(action.id);
      setBusinessAIView("side-panel");
      setFocusContext(null);

      const stageMatch = journeyStages.find((stage) =>
        stage.tasks.some((task) => task.id === action.id),
      );

      if (stageMatch) {
        setIsStageManuallySelected(true);
        setActiveStageId(stageMatch.id);
        const timelineIndex = JOURNEY_ANIMATION_TIMELINE.findIndex(
          (phase) => phase.stageId === stageMatch.id,
        );
        if (timelineIndex >= 0) {
          setJourneyAnimationIndex(timelineIndex);
          setJourneyProgressPercent(
            JOURNEY_ANIMATION_TIMELINE[timelineIndex]?.percent ?? 0,
          );
        }
      }
    },
    [
      setBusinessAIView,
      setFocusContext,
      setFocusedNextActionId,
      setIsStageManuallySelected,
      setActiveStageId,
      setJourneyAnimationIndex,
      setJourneyProgressPercent,
    ],
  );

  const handleTodoToggle = useCallback((itemId: string) => {
    setTodoCompletionState((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

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

    return { timelineItem, stage };
  }, [focusContext, journeyTimelineItems]);

  const journeyFocusViewProps = useMemo(() => {
    if (!focusViewContext) {
      return null;
    }

    return {
      timelineItem: focusViewContext.timelineItem,
      stage: focusViewContext.stage,
      highlightTokens: journeyHighlightTokens,
      taskTokens: taskStatusTokens,
      formatDate: formatJourneyDueDate,
    };
  }, [focusViewContext, formatJourneyDueDate]);

  const filters = (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Journey overview
        </p>
        <JourneyOrchestrationPanel
          introMessage={BUSINESS_AI_INTRO_MESSAGE}
          actions={todoBankItems}
          remainingActionCount={remainingTodoCount}
          focusedActionId={focusedNextActionId}
          completionState={todoCompletionState}
          onToggleAction={handleTodoToggle}
          onActionClick={handleNextActionClick}
          nextActionRefs={nextActionRefs}
          getNextActionToken={getNextActionToken}
          timelineItems={journeyTimelineItems}
          currentStageLabel={currentStageLabel}
          chatPhase={chatPhase ?? null}
          chatProgress={chatProgress}
          isStageManuallySelected={isStageManuallySelected}
          onResumeAutomation={handleResumeAutomation}
          onViewJourney={handleViewJourney}
          onOpenAutomation={handleOpenAutomationFocus}
          formatDueDate={formatJourneyDueDate}
        />
      </div>
      <div className="space-y-6 text-sm text-slate-700">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Need support?
          </h3>
          <p className="mt-2 leading-relaxed">
            Our licensing team is available Sunday to Thursday, 8:00–18:00 GST.
            Reach out at{" "}
            <span className="font-medium text-[#0f766e]">licensing@adm.ae</span>
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
          <h3 className="text-sm font-semibold text-slate-900">Next action</h3>
          <p className="mt-2 leading-relaxed">
            {primaryApplication.nextAction}
          </p>
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

  return (
    <>
      <PortalPageLayout
        title={workspaceTitle}
        subtitle="Business license portal"
        description={workspaceDescription}
        filters={filters}
        headerActions={headerActions}
      >
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
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                    AI Discovery
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Research with Business Chat
                  </p>
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
                  other investors turn ideas into thriving restaurants across
                  Abu Dhabi.
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
        <section className="rounded-3xl border border-[#d8e4df] bg-white p-8 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.22)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2 text-slate-900">
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
              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  onClick={handleOpenSidePanel}
                  className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-[#0f766e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_-22px_rgba(11,64,55,0.4)] transition hover:bg-[#0c6059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Chat with AI
                </Button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCloseChat}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30",
                      isChatOpen
                        ? "border-[#0f766e] bg-white shadow-[0_12px_24px_-20px_rgba(11,64,55,0.28)] hover:bg-[#eaf7f3]"
                        : "border-[#d8e4df] bg-white text-slate-500",
                    )}
                  >
                    Close chat
                  </button>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]/70">
                  Current view: {isSidePanelView ? "Side panel" : isFocusView ? "Focus modal" : "Closed"}
                </p>
              </div>
            </div>
            <div className="w-full max-w-xs rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-4">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Overall progress</span>
                <span className="text-slate-900">
                  {primaryApplication.progress}%
                </span>
              </div>
              <Progress
                value={primaryApplication.progress}
                className="mt-3 h-2"
              />
              <p className="mt-3 text-xs text-slate-500">
                Stay on track by completing outstanding tasks before the SLA
                threshold.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
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

          <div className="mt-8 space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Next action
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {primaryApplication.nextAction}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleContinueToNextAction}
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
              Continue to Your Next Action
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 text-sm leading-relaxed text-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Application summary
            </h3>
            <p className="mt-3">{primaryApplication.summary}</p>
          </div>
        </section>
      </PortalPageLayout>
      <BusinessChatUI
        isOpen={isChatOpen}
        mode={isSidePanelView ? "side-panel" : "modal"}
        onClose={handleCloseChat}
        onMinimize={handleCloseChat}
        category="restaurants"
        title="Business AI"
        initialMessage={BUSINESS_AI_INTRO_MESSAGE}
        journeyFocusView={journeyFocusViewProps}
      />
    </>
  );
}
