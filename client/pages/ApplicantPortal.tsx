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
import { Check, MessageCircle, Plus } from "lucide-react";

type JourneyHighlightState = "done" | "current" | "upcoming";

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
    progress: 68,
    submissionDate: isoDate(daysFromToday(-14)),
    lastUpdated: isoDate(daysFromToday(-2)),
    nextAction:
      "Upload signed tenancy contract for the Corniche location fit-out.",
    summary:
      "Full-service restaurant launch covering trade name reservation, food safety clearance, and smart staffing approvals for the Abu Dhabi mainland.",
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

type JourneyTaskStatus = "completed" | "in_progress" | "pending";

type JourneyTask = {
  id: string;
  label: string;
  status: JourneyTaskStatus;
  owner: string;
  dueDate?: string;
  completedOn?: string;
};

type NextActionStatus = JourneyTaskStatus | "guidance" | "workflow";

type NextActionItem = {
  id: string;
  label: string;
  status: NextActionStatus;
  stageTitle?: string;
  description?: string;
  dueDate?: string;
};

type JourneyTimelineItem = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusBadgeClass: string;
  statusHelperClass: string;
  meta?: string;
  isCurrent: boolean;
  showProgress?: boolean;
};

type JourneyStage = {
  id: string;
  title: string;
  highlight: {
    label: string;
    detail?: string;
  };
  description: string;
  state: JourneyHighlightState;
  statusDetail?: string;
  tasks: JourneyTask[];
};

const journeyStages: JourneyStage[] = [
  {
    id: "questionnaire",
    title: "Questionnaire intake",
    highlight: {
      label: "Questionnaire completed",
      detail: `Finished ${formatDisplayDate(daysFromToday(-12))}`,
    },
    description:
      "Smart intake responses now prefill every downstream form automatically.",
    state: "done",
    statusDetail: `Completed ${formatDisplayDate(daysFromToday(-12))}`,
    tasks: [
      {
        id: "questionnaire-intake",
        label: "Complete smart intake questionnaire",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-12)),
      },
      {
        id: "questionnaire-profile",
        label: "Review generated business profile",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-11)),
      },
    ],
  },
  {
    id: "business-registration",
    title: "Business registration",
    highlight: {
      label: "Trade name reserved",
      detail: "Marwah approved",
    },
    description:
      "Initial approvals secured, including trade name reservation and legal structure confirmation.",
    state: "done",
    statusDetail: "Initial approvals granted",
    tasks: [
      {
        id: "registration-trade-name",
        label: "Reserve trade name",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-10)),
      },
      {
        id: "registration-initial-approval",
        label: "Initial approval (DED)",
        status: "completed",
        owner: "Department of Economic Development",
        completedOn: isoDate(daysFromToday(-9)),
      },
      {
        id: "registration-ownership",
        label: "Confirm ownership structure",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-8)),
      },
    ],
  },
  {
    id: "submit-documents",
    title: "Document submission",
    highlight: {
      label: "Documents verified",
      detail: "All mandatory files cleared",
    },
    description:
      "All mandatory documents are uploaded and validated, including Emirates ID and tenancy contract.",
    state: "done",
    statusDetail: "5 documents verified",
    tasks: [
      {
        id: "documents-tenancy",
        label: "Tenancy contract upload",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-7)),
      },
      {
        id: "documents-shareholder",
        label: "Shareholder Emirates IDs",
        status: "completed",
        owner: "Applicant",
        completedOn: isoDate(daysFromToday(-6)),
      },
      {
        id: "documents-review",
        label: "Compliance review (DED)",
        status: "completed",
        owner: "Department of Economic Development",
        completedOn: isoDate(daysFromToday(-5)),
      },
    ],
  },
  {
    id: "business-licensing",
    title: "Business licensing",
    highlight: {
      label: "Licensing in progress",
      detail: "Specialists reviewing financial plan",
    },
    description:
      "Licensing specialists are reviewing the financial plan, compliance attachments, and fee payments.",
    state: "current",
    statusDetail: "In review now",
    tasks: [
      {
        id: "licensing-financials",
        label: "Upload revised financial projections",
        status: "in_progress",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(3)),
      },
      {
        id: "licensing-fee",
        label: "Settle AED 2,500 licensing fee",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(4)),
      },
      {
        id: "licensing-analyst",
        label: "Compliance analyst review",
        status: "in_progress",
        owner: "Licensing analyst",
        dueDate: isoDate(daysFromToday(5)),
      },
    ],
  },
  {
    id: "pre-operational-inspection",
    title: "Pre-operational inspection",
    highlight: {
      label: "Inspection next",
      detail: "Scheduling once licensing completes",
    },
    description:
      "Inspection will be scheduled once licensing is approved so you can activate utilities and begin fit-out.",
    state: "upcoming",
    statusDetail: "Awaiting scheduling",
    tasks: [
      {
        id: "inspection-slots",
        label: "Propose inspection time slots",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(8)),
      },
      {
        id: "inspection-checklist",
        label: "Upload fit-out readiness checklist",
        status: "pending",
        owner: "Applicant",
        dueDate: isoDate(daysFromToday(10)),
      },
    ],
  },
];

const documentLibraries: Record<
  JourneyTask["id"],
  | {
      title: string;
      description: string;
      items: { id: string; name: string; type: string; updatedAt: string }[];
    }
  | undefined
> = {
  "inspection-checklist": {
    title: "Fit-out readiness artifacts",
    description:
      "Upload inspection-ready evidence, including mechanical, electrical, and safety clearances before your fit-out walkthrough.",
    items: [
      {
        id: "fitout-fire-suppression",
        name: "Fire suppression compliance certificate",
        type: "Certificate",
        updatedAt: isoDate(daysFromToday(-3)),
      },
      {
        id: "fitout-floor-plan",
        name: "Finalized kitchen and dining floor plan",
        type: "AutoCAD export",
        updatedAt: isoDate(daysFromToday(-4)),
      },
      {
        id: "fitout-haccp",
        name: "HACCP readiness checklist",
        type: "Checklist",
        updatedAt: isoDate(daysFromToday(-5)),
      },
    ],
  },
};

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
  { id: "questionnaire", label: "Questionnaire", state: "completed" },
  {
    id: "business-registration",
    label: "Business Registration",
    state: "completed",
  },
  { id: "submit-documents", label: "Submit Documents", state: "completed" },
  { id: "business-licensing", label: "Business Licensing", state: "current" },
  {
    id: "pre-operational-inspection",
    label: "Pre-Operational Inspection",
    state: "upcoming",
  },
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

const JOURNEY_ANIMATION_TIMELINE: Array<{
  stageId: string;
  message: string;
  percent: number;
  keyConsiderations: string[];
  dataTags: string[];
}> = [
  {
    stageId: "questionnaire",
    message: "Generating application...",
    percent: 15,
    keyConsiderations: ["Legal structure", "Applicant identity"],
    dataTags: ["UAE PASS profile", "Emirates ID", "Digital signature"],
  },
  {
    stageId: "business-registration",
    message: "Validating trade name and ownership...",
    percent: 42,
    keyConsiderations: ["Legal structure", "Ownership model"],
    dataTags: ["Trade name reservation", "Shareholder IDs", "Economic directory"],
  },
  {
    stageId: "submit-documents",
    message: "Reviewing supporting documents...",
    percent: 63,
    keyConsiderations: ["Business activities", "Compliance attachments"],
    dataTags: ["Tenancy contract", "Financial statements", "Food safety certificates"],
  },
  {
    stageId: "business-licensing",
    message: "Aligning approvals across directorates...",
    percent: 78,
    keyConsiderations: ["Business activities", "Financial readiness"],
    dataTags: ["Fee schedule", "Payment verification", "Compliance analyst notes"],
  },
  {
    stageId: "pre-operational-inspection",
    message: "Scheduling inspection windows...",
    percent: 92,
    keyConsiderations: ["Physical space", "Fit-out readiness"],
    dataTags: ["Inspection availability", "Fit-out checklist", "Team contacts"],
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
  const profileEmail = portalUser?.email ?? "khalid.entrepreneur@email.ae";
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

  const updateCurrentJourneyStep = useCallback(
    (stepId: string) => {
      if (!JOURNEY_STEPS_CONFIG.some((step) => step.id === stepId)) {
        return;
      }

      setJourneySteps(computeSteps(stepId));
      setCurrentJourneyStepId(stepId);
    },
    [],
  );

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
  }, [setBusinessAIView]);
  const handleOpenFocus = useCallback(() => {
    setBusinessAIView("focus");
  }, [setBusinessAIView]);
  const handleCloseChat = useCallback(() => {
    setBusinessAIView("closed");
    setFocusedNextActionId(null);
  }, [setBusinessAIView, setFocusedNextActionId]);

  const handleViewJourney = (stageId: string) => {
    setPortalView("journey");
    const matchingStep = JOURNEY_STEPS_CONFIG.find((step) => step.id === stageId);
    if (matchingStep) {
      updateCurrentJourneyStep(stageId);
    }
  };

  const filters = (
    <div className="space-y-6 text-sm text-slate-700">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Need support?</h3>
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
        <p className="mt-2 leading-relaxed">{primaryApplication.nextAction}</p>
      </div>
    </div>
  );

  const todoBankItems = useMemo<NextActionItem[]>(() => {
    const applicantTasks = journeyStages.flatMap((stage) =>
      stage.tasks
        .filter(
          (task) =>
            task.owner === "Applicant" && task.status !== "completed",
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
  }, [
    todoBankItems,
    todoCompletionState,
    setBusinessAIView,
    setFocusedNextActionId,
  ]);

  const handleNextActionClick = useCallback(
    (action: NextActionItem) => {
      setFocusedNextActionId(action.id);

      if (action.id === "business-activity-guidance") {
        setBusinessAIView("focus");
        return;
      }

      const stageMatch = journeyStages.find((stage) =>
        stage.tasks.some((task) => task.id === action.id),
      );

      if (stageMatch) {
        setBusinessAIView("side-panel");
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
                  <p className="text-sm font-semibold text-white">{ENTREPRENEUR_PROFILE.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  AI Discovery
                </p>
                <p className="text-sm font-semibold text-white">Research with Business Chat</p>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
                Your journey, powered by AI
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/80">
                Discover a clear path to research market potential, plan key approvals, and prepare your
                business case with AI guidance. In just a few stages, explore how {ENTREPRENEUR_PROFILE.name} and
                other investors turn ideas into thriving restaurants across Abu Dhabi.
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
                  onClick={handleOpenFocus}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30",
                    isFocusView
                      ? "border-[#0f766e] bg-[#eaf7f3] text-[#0f766e] shadow-[0_12px_24px_-20px_rgba(11,64,55,0.28)] hover:bg-[#d9efe7]"
                      : "border-[#d8e4df] bg-white text-slate-600 hover:bg-[#f4faf8]",
                  )}
                >
                  Focus modal
                </button>
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
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Journey overview
          </h3>
          <div className="mt-4 flex w-full flex-col items-stretch gap-6 lg:flex-row">
            <div className="w-full max-w-3xl rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_48px_-32px_rgba(11,64,55,0.28)] backdrop-blur-xl">
              <div className="flex flex-col gap-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Journey orchestration
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {BUSINESS_AI_INTRO_MESSAGE}
                  </p>
                </div>
                {todoBankItems.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        To-do bank
                      </p>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {remainingTodoCount} of {todoBankItems.length} remaining
                      </span>
                    </div>
                    <ol className="space-y-3">
                      {todoBankItems.map((action) => {
                        const token = getNextActionToken(action.status);
                        const isFocused = focusedNextActionId === action.id;
                        const dueLabel = action.dueDate
                          ? dateFormatter.format(new Date(action.dueDate))
                          : null;
                        const isCompleted = todoCompletionState[action.id] ?? false;

                        return (
                          <li key={action.id}>
                            <div
                              ref={(node) => {
                                nextActionRefs.current[action.id] = node;
                              }}
                              className={cn(
                                "flex items-start gap-3 rounded-2xl border px-4 py-3 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0f766e]/40",
                                isFocused
                                  ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_16px_32px_-28px_rgba(11,64,55,0.32)]"
                                  : "border-[#d8e4df] bg-white hover:border-[#0f766e]/60 hover:bg-[#f4faf8]",
                                isCompleted && !isFocused
                                  ? "border-[#d8e4df] bg-white/80"
                                  : null,
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => handleTodoToggle(action.id)}
                                className={cn(
                                  "mt-1 flex h-8 w-8 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/40",
                                  isCompleted
                                    ? "border-[#0f766e] bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(11,64,55,0.35)]"
                                    : "border-[#cfe4dd] bg-white text-[#0f766e] hover:border-[#0f766e]"
                                )}
                                aria-pressed={isCompleted}
                                aria-label={
                                  isCompleted
                                    ? `Mark ${action.label} as not done`
                                    : `Mark ${action.label} as done`
                                }
                              >
                                {isCompleted ? (
                                  <Check className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                  <span className="h-3.5 w-3.5 rounded-full border-2 border-[#9dbbb1]" />
                                )}
                              </button>
                              <div className="flex-1 space-y-2">
                                <button
                                  type="button"
                                  onClick={() => handleNextActionClick(action)}
                                  className="w-full text-left"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p
                                      className={cn(
                                        "text-sm font-semibold text-slate-900",
                                        isCompleted && "text-slate-500 line-through decoration-1 decoration-slate-400"
                                      )}
                                    >
                                      {action.label}
                                    </p>
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                                        token.badgeClass,
                                        isCompleted && "opacity-70"
                                      )}
                                    >
                                      {token.label}
                                    </span>
                                  </div>
                                  {action.description ? (
                                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                      {action.description}
                                    </p>
                                  ) : null}
                                  {action.id === "business-activity-guidance" ? (
                                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3645b0]">
                                      Tap to open the business activities questionnaire.
                                    </p>
                                  ) : null}
                                  {(action.stageTitle || dueLabel) && (
                                    <p
                                      className={cn(
                                        "mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                        token.helperClass,
                                        isCompleted && "opacity-70"
                                      )}
                                    >
                                      {action.stageTitle ? `Stage: ${action.stageTitle}` : ""}
                                      {action.stageTitle && dueLabel ? " • " : ""}
                                      {dueLabel ? `Due ${dueLabel}` : ""}
                                    </p>
                                  )}
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-xl space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {journeyHighlightTokens[activeStage.state].stateLabel}
                      </p>
                      <h4 className="text-xl font-semibold text-slate-900">
                        {activeStage.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {activeStage.description}
                      </p>
                      {activeStage.statusDetail ? (
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                          {activeStage.statusDetail}
                        </p>
                      ) : null}
                    </div>
                    <Badge
                      className={cn(
                        "border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                        journeyHighlightTokens[activeStage.state].badgeClass,
                      )}
                    >
                      {journeyHighlightTokens[activeStage.state].stateLabel}
                    </Badge>
                  </div>
                  <div className="mt-6 space-y-3">
                    {activeStage.tasks.map((task) => {
                      const tokens = taskStatusTokens[task.status];
                      const meta = task.completedOn
                        ? `Completed ${dateFormatter.format(new Date(task.completedOn))}`
                        : task.dueDate
                          ? `Due ${dateFormatter.format(new Date(task.dueDate))}`
                          : null;
                      const library = documentLibraries[task.id];
                      const showFitOutLibrary =
                        activeStage.id === "pre-operational-inspection" && Boolean(library);

                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-[#d8e4df] bg-white p-4 shadow-[0_12px_24px_-20px_rgba(11,64,55,0.16)]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {task.label}
                            </p>
                            <Badge
                              className={cn(
                                "border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                                tokens.badgeClass,
                              )}
                            >
                              {tokens.label}
                            </Badge>
                          </div>
                          <p className={cn("mt-2 text-xs", tokens.helperClass)}>
                            Owner:{" "}
                            <span className="font-semibold text-slate-900">{task.owner}</span>
                            {meta ? ` • ${meta}` : null}
                          </p>
                          {showFitOutLibrary && library ? (
                            <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-[#c9e1d7] bg-[#f4faf8] p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {library.title}
                                  </p>
                                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                    {library.description}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-white px-4 py-2 text-xs font-semibold text-[#0f766e] shadow-[0_10px_20px_-18px_rgba(11,64,55,0.35)] transition hover:bg-white hover:shadow-[0_14px_28px_-22px_rgba(11,64,55,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M10 4v8m0 0 3-3m-3 3-3-3M4 14h12"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Upload fit-out readiness artifacts
                                </Button>
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                                  Document library
                                </p>
                                <ul className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                                  {library.items.map((item) => (
                                    <li
                                      key={item.id}
                                      className="flex items-start gap-2 rounded-xl border border-[#dbe7e1] bg-white px-3 py-2"
                                    >
                                      <span
                                        className="mt-0.5 h-2 w-2 rounded-full bg-[#0f766e]"
                                        aria-hidden="true"
                                      />
                                      <div>
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-[11px] text-slate-500">
                                          {item.type} • Updated{" "}
                                          {dateFormatter.format(new Date(item.updatedAt))}
                                        </p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
      />
    </>
  );
}
