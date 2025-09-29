import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PortalPageLayout } from "@/components/portal/PortalPageLayout";
import { FilterSection } from "@/components/portal/FilterSection";
import { SummaryMetric } from "@/components/portal/SummaryMetric";
import { PortalProfileMenu } from "@/components/portal/PortalProfileMenu";
import { cn } from "@/lib/utils";
import { JourneyView } from "@/components/portal/JourneyView";
import type { JourneyStep } from "@/components/portal/JourneyStepper";
import type {
  BusinessActivity,
  ActorOption,
} from "@/components/portal/BusinessActivitiesSelection";

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

const directorateOptions = [
  "Department of Economic Development",
  "Abu Dhabi Agriculture and Food Safety Authority",
  "Department of Culture and Tourism",
] as const;

const beneficiaryOptions = [
  { label: "All beneficiaries", value: "all" },
  { label: "Citizen", value: "Citizen" },
  { label: "Resident", value: "Resident" },
  { label: "Investor", value: "Investor" },
  { label: "Visitor", value: "Visitor" },
] as const;

const licenseOptions = [
  { label: "All license types", value: "all" },
  { label: "Commercial License", value: "Commercial License" },
  { label: "Dual License", value: "Dual License" },
] as const;

const applications: ApplicationRecord[] = [
  {
    id: "APP-48291",
    title: "Corniche Culinary Collective",
    directorate: "Department of Economic Development",
    beneficiary: "Citizen",
    status: "In Review",
    licenseType: "Commercial License",
    progress: 68,
    submissionDate: "2024-03-14",
    lastUpdated: "2024-03-18",
    nextAction:
      "Upload signed tenancy contract for the Corniche location fit-out.",
    summary:
      "Full-service restaurant launch covering trade name reservation, food safety clearance, and smart staffing approvals for the Abu Dhabi mainland.",
  },
];

const statusStyles: Record<ApplicationRecord["status"], string> = {
  "In Review": "bg-[#dff2ec] text-[#0b7d6f] border-[#94d2c2]",
  "Awaiting Documents": "bg-[#fdf6e4] text-[#b97324] border-[#f3dcb6]",
  Approved: "bg-[#eaf7f3] text-[#0f766e] border-[#b7e1d4]",
  Draft: "bg-[#f4f8f6] text-slate-600 border-[#d8e4df]",
};

type JourneyState = "done" | "current" | "upcoming";

type JourneyTaskStatus = "completed" | "in_progress" | "pending";

interface JourneyTask {
  id: string;
  label: string;
  status: JourneyTaskStatus;
  owner: string;
  dueDate?: string;
  completedOn?: string;
  tag?: string;
  description?: string;
}

const applicantJourney: Array<{
  id: string;
  title: string;
  description: string;
  state: JourneyState;
  statusDetail?: string;
  tasks: JourneyTask[];
}> = [
  {
    id: "questionnaire",
    title: "Questionnaire",
    description:
      "Personalized intake is complete and responses now prefill every downstream form automatically.",
    state: "done",
    statusDetail: "Finished 12 Mar 2024",
    tasks: [
      {
        id: "questionnaire-intake",
        label: "Complete smart intake questionnaire",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-12",
        tag: "Intake",
        description:
          "AI prompts captured business profile, ownership, and activity preferences.",
      },
      {
        id: "questionnaire-review",
        label: "Review generated business profile summary",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-12",
        tag: "Review",
        description:
          "Confirmed trade name spelling and legal representatives before submission.",
      },
    ],
  },
  {
    id: "business-registration",
    title: "Business Registration",
    description:
      "Trade name is reserved and the entity profile has been registered with the Department of Economic Development.",
    state: "done",
    statusDetail: "Certificate issued 14 Mar 2024",
    tasks: [
      {
        id: "registration-tradename",
        label: "Confirm reserved trade name",
        status: "completed",
        owner: "DED Licensing",
        completedOn: "2024-03-14",
        tag: "Approval",
        description:
          "DED licensing team verified the trade name reservation reference.",
      },
      {
        id: "registration-shareholder",
        label: "Upload shareholder resolution",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-13",
        tag: "Documents",
        description:
          "Signed resolution stored in the corporate documents vault.",
      },
      {
        id: "registration-payment",
        label: "Pay registration fees",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-14",
        tag: "Payment",
        description: "Receipt #INV-09231 is available in the payment center.",
      },
    ],
  },
  {
    id: "submit-documents",
    title: "Submit Documents",
    description:
      "All mandatory files are uploaded and validated, including Emirates ID, tenancy contract, and shareholder agreements.",
    state: "done",
    statusDetail: "5 documents verified",
    tasks: [
      {
        id: "documents-tenancy",
        label: "Tenancy contract upload",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-15",
        tag: "Documents",
        description: "Verified by licensing operations with no exceptions.",
      },
      {
        id: "documents-shareholder-ids",
        label: "Shareholder Emirates IDs",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-15",
        tag: "Identity",
        description: "5 Emirates ID cards validated through UAE PASS.",
      },
      {
        id: "documents-projections",
        label: "Financial projections workbook",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-15",
        tag: "Finance",
        description: "Used by compliance to confirm capital adequacy.",
      },
    ],
  },
  {
    id: "business-licensing",
    title: "Business Licensing",
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
        dueDate: "2024-03-22",
        tag: "Documents",
        description:
          "Analyst requested an additional 12-month cash-flow scenario.",
      },
      {
        id: "licensing-fee",
        label: "Settle AED 2,500 licensing fee",
        status: "pending",
        owner: "Applicant",
        dueDate: "2024-03-21",
        tag: "Payment",
        description: "Secure payment link is available in the invoices hub.",
      },
      {
        id: "licensing-review",
        label: "Compliance analyst review",
        status: "in_progress",
        owner: "Licensing analyst (Layla Al Mazrouei)",
        dueDate: "2024-03-24",
        tag: "Internal",
        description:
          "Layla is checking safety, staffing, and food handling attachments.",
      },
    ],
  },
  {
    id: "pre-operational-inspection",
    title: "Pre-Operational Inspection",
    description:
      "Inspection will be scheduled once licensing is approved so you can activate utilities and begin fit-out.",
    state: "upcoming",
    statusDetail: "Awaiting scheduling",
    tasks: [
      {
        id: "inspection-windows",
        label: "Propose inspection windows",
        status: "pending",
        owner: "Applicant",
        dueDate: "2024-03-28",
        tag: "Scheduling",
        description:
          "Choose two preferred two-hour slots for facilities inspection.",
      },
      {
        id: "inspection-checklist",
        label: "Upload fit-out readiness checklist",
        status: "pending",
        owner: "Applicant",
        dueDate: "2024-03-30",
        tag: "Checklist",
        description:
          "Include kitchen calibration logs and health & safety sign-off.",
      },
    ],
  },
];

const journeyStateTokens: Record<
  JourneyState,
  { label: string; badgeClass: string; dotClass: string }
> = {
  done: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
  current: {
    label: "In progress",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    dotClass: "bg-[#0b7d6f]",
  },
  upcoming: {
    label: "Next",
    badgeClass: "border-[#dbe7e1] bg-[#f4f8f6] text-slate-600",
    dotClass: "bg-[#a6bbb1]",
  },
};

const taskStatusTokens: Record<
  JourneyTaskStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  completed: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
  in_progress: {
    label: "In progress",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    dotClass: "bg-[#0b7d6f]",
  },
  pending: {
    label: "Waiting on you",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    dotClass: "bg-[#d8a437]",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type SortOption = "recent" | "progress";

const defaultDirectorates = directorateOptions.map((value) => value);

export default function ApplicantPortal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDirectorates, setSelectedDirectorates] =
    useState<string[]>(defaultDirectorates);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<(typeof beneficiaryOptions)[number]["value"]>("all");
  const [selectedLicenseType, setSelectedLicenseType] =
    useState<(typeof licenseOptions)[number]["value"]>("all");
  const [progressThreshold, setProgressThreshold] = useState<number[]>([30]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [activeJourneyStageId, setActiveJourneyStageId] = useState(
    () =>
      applicantJourney.find((stage) => stage.state === "current")?.id ??
      applicantJourney[0].id,
  );
  const [showJourneyView, setShowJourneyView] = useState(false);
  const [selectedBusinessActivities, setSelectedBusinessActivities] = useState<
    string[]
  >(["full-service-restaurant", "charcoal-bbq"]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const actorOptions = useMemo<ActorOption[]>(
    () => [
      {
        id: "economic-reviewer",
        label: "Economic Development Reviewer",
        description: "Validates business alignment with economic priorities.",
      },
      {
        id: "health-safety",
        label: "Health & Safety Officer",
        description: "Ensures compliance with health and safety standards.",
      },
      {
        id: "fire-marshal",
        label: "Fire Marshal",
        description: "Evaluates occupancy and fire preparedness requirements.",
      },
      {
        id: "environmental-review",
        label: "Environmental Review Board",
        description: "Reviews sustainability criteria for approvals.",
      },
    ],
    [],
  );

  const activityCatalog = useMemo<BusinessActivity[]>(
    () => [
      {
        id: "full-service-restaurant",
        label: "Full-service restaurant",
        isRecommended: true,
        actors: ["economic-reviewer", "health-safety"],
      },
      {
        id: "charcoal-bbq",
        label: "Charcoal/coal BBQ services",
        isRecommended: true,
        actors: ["health-safety", "fire-marshal"],
      },
      {
        id: "hospitality-catering",
        label: "Hospitality and catering services",
        isRecommended: true,
        actors: ["economic-reviewer"],
      },
      {
        id: "food-truck",
        label: "Mobile food truck operations",
        description:
          "Covers mobile kitchens serving food across multiple districts.",
        actors: ["health-safety", "fire-marshal", "environmental-review"],
      },
      {
        id: "shared-kitchen",
        label: "Shared commercial kitchen",
        description:
          "Multi-tenant facility providing licensed preparation space.",
        actors: ["economic-reviewer", "health-safety"],
      },
      {
        id: "culinary-incubator",
        label: "Culinary incubator program",
        description:
          "Supports early-stage food businesses with advisory services.",
        actors: ["economic-reviewer", "environmental-review"],
      },
    ],
    [],
  );

  const initialActivityIds = useMemo(
    () => ["full-service-restaurant", "charcoal-bbq", "hospitality-catering"],
    [],
  );

  // Map journey data to stepper format
  const journeySteps: JourneyStep[] = applicantJourney.map((stage) => ({
    id: stage.id,
    label: stage.title,
    state: stage.state,
  }));

  // Business activities data
  const [businessActivities, setBusinessActivities] = useState<
    BusinessActivity[]
  >(() =>
    activityCatalog.filter((activity) =>
      initialActivityIds.includes(activity.id),
    ),
  );

  const availableActivities = useMemo(
    () =>
      activityCatalog.filter(
        (activity) =>
          !businessActivities.some((item) => item.id === activity.id),
      ),
    [activityCatalog, businessActivities],
  );

  const activeJourneyStage = useMemo(
    () =>
      applicantJourney.find((stage) => stage.id === activeJourneyStageId) ??
      applicantJourney[0],
    [activeJourneyStageId],
  );
  const activeJourneyTokens = journeyStateTokens[activeJourneyStage.state];

  const location = useLocation();
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
  const firstName = portalUser?.name ? portalUser.name.split(" ")[0] : null;
  const workspaceTitle = firstName
    ? `${firstName}'s workspace`
    : "Applicant workspace";
  const workspaceDescription = firstName
    ? `Track every application, ${firstName}, understand what is blocking approval, and continue building your business in Abu Dhabi with clarity.`
    : "Track every application, understand what is blocking approval, and continue building your business in Abu Dhabi with clarity.";
  const profileName = portalUser?.name ?? "Ahmed Al Mansoori";
  const profileEmail = portalUser?.email ?? "ahmed.almansoori@email.ae";
  const profileAvatar =
    portalUser?.avatarUrl ??
    "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80";
  const profileStatus: "online" | "offline" | "none" = "online";

  const handleSignOut = () => {
    window.location.assign("/");
  };

  const minProgress = progressThreshold[0] ?? 0;
  const allDirectoratesSelected =
    selectedDirectorates.length === directorateOptions.length;
  const someDirectoratesSelected =
    selectedDirectorates.length > 0 && !allDirectoratesSelected;

  const filteredApplications = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase();

    return applications
      .filter((application) => {
        const matchesSearch = loweredSearch
          ? application.title.toLowerCase().includes(loweredSearch) ||
            application.id.toLowerCase().includes(loweredSearch)
          : true;

        const matchesDirectorate = allDirectoratesSelected
          ? true
          : selectedDirectorates.includes(application.directorate);

        const matchesBeneficiary =
          selectedBeneficiary === "all"
            ? true
            : application.beneficiary === selectedBeneficiary;

        const matchesLicense =
          selectedLicenseType === "all"
            ? true
            : application.licenseType === selectedLicenseType;

        const matchesProgress = application.progress >= minProgress;

        return (
          matchesSearch &&
          matchesDirectorate &&
          matchesBeneficiary &&
          matchesLicense &&
          matchesProgress
        );
      })
      .sort((a, b) => {
        if (sortBy === "progress") {
          return b.progress - a.progress;
        }

        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
  }, [
    searchTerm,
    selectedDirectorates,
    selectedBeneficiary,
    selectedLicenseType,
    minProgress,
    sortBy,
    allDirectoratesSelected,
  ]);

  const inReviewCount = applications.filter(
    (item) =>
      item.status === "In Review" || item.status === "Awaiting Documents",
  ).length;
  const approvedCount = applications.filter(
    (item) => item.status === "Approved",
  ).length;
  const averageProgress = Math.round(
    applications.reduce((acc, item) => acc + item.progress, 0) /
      applications.length,
  );

  const latestSubmission = applications
    .map((item) => new Date(item.submissionDate))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const recentSubmissionsCount = applications.filter((item) => {
    const submissionDate = new Date(item.submissionDate);
    const diffInDays =
      (Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 14;
  }).length;

  const approvalsLastSevenDays = applications.filter((item) => {
    if (item.status !== "Approved") {
      return false;
    }
    const approvalDate = new Date(item.lastUpdated);
    const diffInDays =
      (Date.now() - approvalDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  }).length;

  const activeReviewsUpdated = applications.filter((item) => {
    if (
      !(item.status === "In Review" || item.status === "Awaiting Documents")
    ) {
      return false;
    }
    const updateDate = new Date(item.lastUpdated);
    const diffInDays =
      (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
  }).length;

  const handleDirectorateChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedDirectorates((prev) => {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      });
    } else {
      setSelectedDirectorates((prev) => prev.filter((item) => item !== value));
    }
  };

  const handleToggleAllDirectorates = (checked: boolean) => {
    if (checked) {
      setSelectedDirectorates(defaultDirectorates);
    } else {
      setSelectedDirectorates([]);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDirectorates(defaultDirectorates);
    setSelectedBeneficiary("all");
    setSelectedLicenseType("all");
    setProgressThreshold([30]);
    setSortBy("recent");
  };

  const handleJourneyStepChange = (stepId: string) => {
    setActiveJourneyStageId(stepId);
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedBusinessActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId],
    );
  };

  const handleAddActivity = (activityId: string) => {
    const catalogActivity = activityCatalog.find(
      (activity) => activity.id === activityId,
    );
    if (!catalogActivity) {
      return;
    }

    setBusinessActivities((prev) => {
      if (prev.some((activity) => activity.id === catalogActivity.id)) {
        return prev;
      }
      return [...prev, catalogActivity];
    });

    setSelectedBusinessActivities((prev) =>
      prev.includes(activityId) ? prev : [...prev, activityId],
    );
  };

  const handleOpenJourneyView = () => {
    setShowJourneyView(true);
  };

  const handleCloseJourneyView = () => {
    setShowJourneyView(false);
  };

  const filters = (
    <>
      <FilterSection
        title="Search and filter"
        description="Find an application quickly by service or reference ID."
      >
        <div className="relative">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by service or ID"
            className="h-11 rounded-2xl border-[#d8e4df] bg-white pr-11 text-sm text-slate-900 placeholder:text-slate-400"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m16 16 4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </FilterSection>

      <FilterSection title="Directorate">
        <div className="space-y-3">
          <Checkbox
            label="All directorates"
            checked={allDirectoratesSelected}
            indeterminate={someDirectoratesSelected && !allDirectoratesSelected}
            onCheckedChange={handleToggleAllDirectorates}
          />

          {directorateOptions.map((option) => (
            <Checkbox
              key={option}
              label={option}
              checked={selectedDirectorates.includes(option)}
              onCheckedChange={(checked) =>
                handleDirectorateChange(option, checked)
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Beneficiary">
        <RadioGroup
          value={selectedBeneficiary}
          onValueChange={(value) =>
            setSelectedBeneficiary(
              value as (typeof beneficiaryOptions)[number]["value"],
            )
          }
          className="space-y-2"
        >
          {beneficiaryOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-[#d8e4df] bg-white px-3 py-2 shadow-[0_12px_24px_-20px_rgba(11,64,55,0.16)]"
            >
              <RadioGroupItem
                value={option.value}
                id={`beneficiary-${option.value}`}
                className="border-[#c6d8d1] text-[#0f766e] data-[state=checked]:border-[#0f766e] data-[state=checked]:bg-[#dff2ec]"
              />
              <Label
                htmlFor={`beneficiary-${option.value}`}
                className="text-sm text-slate-900"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="License type">
        <Select
          value={selectedLicenseType}
          onValueChange={(value) =>
            setSelectedLicenseType(
              value as (typeof licenseOptions)[number]["value"],
            )
          }
        >
          <SelectTrigger className="h-11 rounded-2xl border-[#d8e4df] bg-white text-sm text-slate-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-[#d8e4df] bg-white text-slate-900">
            <SelectGroup>
              {licenseOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection
        title="Progress threshold"
        description="Only show applications above this completion level."
      >
        <div className="space-y-3">
          <Slider
            value={progressThreshold}
            onValueChange={(value) => setProgressThreshold(value)}
            min={0}
            max={100}
            step={5}
            className="py-3"
          />
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Minimum progress</span>
            <span>{minProgress}%</span>
          </div>
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold text-[#0f766e] transition hover:bg-[#eaf7f3]"
      >
        Reset filters
      </button>
    </>
  );

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#0f766e] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(11,64,55,0.45)] transition hover:bg-[#0c635d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        New application
      </button>
      <PortalProfileMenu
        name={profileName}
        email={profileEmail}
        avatarUrl={profileAvatar}
        status={profileStatus}
        onSignOut={handleSignOut}
      />
    </div>
  );

  return (
    <>
      <PortalPageLayout
        title={workspaceTitle}
        subtitle="Business license portal"
        description={workspaceDescription}
        filters={filters}
        headerActions={headerActions}
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryMetric
            label="Total applications"
            value={applications.length.toString()}
            helper={
              latestSubmission
                ? `Last submission ${dateFormatter.format(latestSubmission)}`
                : undefined
            }
            trend={{
              value: `${recentSubmissionsCount} in 14 days`,
              isPositive: true,
            }}
          />
          <SummaryMetric
            label="Active reviews"
            value={inReviewCount.toString()}
            helper={`${applications.filter((item) => item.status === "Awaiting Documents").length} awaiting documents`}
            trend={{
              value: `${activeReviewsUpdated} updated in 3 days`,
              isPositive: true,
            }}
          />
          <SummaryMetric
            label="Average completion"
            value={`${averageProgress}%`}
            helper={`${approvalsLastSevenDays} approvals in 7 days`}
          />
        </section>

        {/* Application Overview Pill */}
        <section className="mt-6">
          <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="w-full max-w-2xl bg-gradient-to-r from-[#0f766e] to-[#0c635d] hover:from-[#0c635d] hover:to-[#0a524a] rounded-full px-6 py-4 shadow-[0_16px_32px_-16px_rgba(11,64,55,0.4)] transition-all duration-200 hover:shadow-[0_20px_40px_-16px_rgba(11,64,55,0.5)] group"
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-full p-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{applications[0].title}</h3>
                      <p className="text-white/80 text-sm">{applications[0].directorate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-sm font-medium">{applications[0].status}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{applications[0].progress}%</div>
                      <div className="text-white/80 text-sm">Complete</div>
                    </div>
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {applications[0].title}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Application Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Application ID:</span>
                        <span className="font-medium">{applications[0].id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Directorate:</span>
                        <span className="font-medium">{applications[0].directorate}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Beneficiary:</span>
                        <span className="font-medium">{applications[0].beneficiary}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">License Type:</span>
                        <span className="font-medium">{applications[0].licenseType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Status:</span>
                        <Badge className={cn("px-3 py-1", statusStyles[applications[0].status])}>
                          {applications[0].status}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Submitted:</span>
                        <span className="font-medium">{new Date(applications[0].submissionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Last Updated:</span>
                        <span className="font-medium">{new Date(applications[0].lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Progress Overview</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Overall Progress</span>
                        <span className="text-lg font-semibold text-slate-900">{applications[0].progress}%</span>
                      </div>
                      <Progress value={applications[0].progress} className="h-3" />
                      <div className="text-sm text-slate-500">
                        {applications[0].progress < 50 ? "Early stages" :
                         applications[0].progress < 80 ? "Good progress" :
                         "Near completion"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Application Summary</h4>
                    <p className="text-slate-700 leading-relaxed">{applications[0].summary}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Next Action Required
                    </h5>
                    <p className="text-blue-800">{applications[0].nextAction}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <h5 className="font-semibold text-slate-900 mb-2">Quick Actions</h5>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#0f766e] hover:bg-[#eaf7f3] transition-colors">
                        <span className="text-sm font-medium text-slate-900">Upload Documents</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#0f766e] hover:bg-[#eaf7f3] transition-colors">
                        <span className="text-sm font-medium text-slate-900">Schedule Inspection</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#0f766e] hover:bg-[#eaf7f3] transition-colors">
                        <span className="text-sm font-medium text-slate-900">Contact Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        <section className="mt-6 rounded-3xl border border-[#d8e4df] bg-white p-8 shadow-[0_16px_36px_-28px_rgba(11,64,55,0.22)]">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-start">
            <div className="xl:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Application journey
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {firstName
                  ? `${firstName}'s application timeline`
                  : "Your application timeline"}
              </h2>
              <p className="mt-4 text-sm text-slate-600">
                Follow each milestone from the initial questionnaire through
                pre-operational inspection. Statuses here mirror what support
                teams see so everyone stays aligned.
              </p>
            </div>
            <div className="flex flex-col gap-8 xl:flex-1 xl:flex-row xl:items-start xl:gap-10">
              <ol
                className="space-y-5 xl:w-80"
                role="tablist"
                aria-label="Application journey"
                aria-orientation="vertical"
              >
                {applicantJourney.map((stage, index) => {
                  const tokens = journeyStateTokens[stage.state];
                  const isLast = index === applicantJourney.length - 1;
                  const isActive = stage.id === activeJourneyStageId;

                  return (
                    <li key={stage.id} className="relative pl-9">
                      <span
                        className={cn(
                          "absolute left-0 top-2 block h-2.5 w-2.5 rounded-full transition-shadow duration-200",
                          tokens.dotClass,
                          isActive
                            ? "ring-4 ring-[#c8e7df] ring-offset-2 ring-offset-white"
                            : "",
                        )}
                      />
                      {!isLast && (
                        <span className="absolute left-[5px] top-6 bottom-0 w-px bg-[#d8e4df]" />
                      )}
                      <button
                        type="button"
                        role="tab"
                        id={`journey-tab-${stage.id}`}
                        aria-selected={isActive}
                        aria-controls={`journey-panel-${stage.id}`}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setActiveJourneyStageId(stage.id)}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30",
                          isActive
                            ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_16px_32px_-28px_rgba(11,64,55,0.32)]"
                            : "border-[#d8e4df] bg-white hover:border-[#0f766e] hover:shadow-[0_16px_30px_-28px_rgba(11,64,55,0.24)]",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {stage.title}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tokens.badgeClass}`}
                          >
                            {tokens.label}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {stage.description}
                        </p>
                        {stage.statusDetail ? (
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            {stage.statusDetail}
                          </p>
                        ) : null}
                        {isActive ? (
                          <span className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                            Viewing tasks
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div
                role="tabpanel"
                id={`journey-panel-${activeJourneyStage.id}`}
                aria-labelledby={`journey-tab-${activeJourneyStage.id}`}
                className="flex-1 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_16px_36px_-30px_rgba(11,64,55,0.2)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      {activeJourneyTokens.label}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">
                      {activeJourneyStage.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {activeJourneyStage.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${activeJourneyTokens.badgeClass}`}
                    >
                      {activeJourneyTokens.label}
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenJourneyView}
                      className="flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(11,64,55,0.45)] transition hover:bg-[#0c635d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Open Journey View
                    </button>
                  </div>
                </div>
                {activeJourneyStage.statusDetail ? (
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {activeJourneyStage.statusDetail}
                  </p>
                ) : null}
                <div className="mt-6 space-y-3">
                  {activeJourneyStage.tasks.length > 0 ? (
                    <ul className="space-y-3">
                      {activeJourneyStage.tasks.map((task) => {
                        const taskTokens = taskStatusTokens[task.status];
                        const timelineCopy =
                          task.status === "completed" && task.completedOn
                            ? `Completed ${dateFormatter.format(new Date(task.completedOn))}`
                            : task.dueDate
                              ? `Due ${dateFormatter.format(new Date(task.dueDate))}`
                              : null;

                        return (
                          <li
                            key={task.id}
                            className="rounded-2xl border border-[#d8e4df] bg-white px-4 py-4 shadow-[0_12px_26px_-20px_rgba(11,64,55,0.18)]"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex h-2.5 w-2.5 rounded-full ${taskTokens.dotClass}`}
                                  />
                                  <p className="text-sm font-semibold text-slate-900">
                                    {task.label}
                                  </p>
                                </div>
                                {task.description ? (
                                  <p className="text-sm text-slate-600">
                                    {task.description}
                                  </p>
                                ) : null}
                                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                  <span>Assigned to {task.owner}</span>
                                  {timelineCopy ? (
                                    <span>{timelineCopy}</span>
                                  ) : null}
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${taskTokens.badgeClass}`}
                              >
                                {taskTokens.label}
                              </span>
                            </div>
                            {task.tag ? (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f4f8f6] px-3 py-1 text-xs font-medium text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#a6bbb1]" />
                                {task.tag}
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-[#d8e4df] bg-white px-4 py-6 text-sm text-slate-600">
                      No user tasks are assigned to this journey stage yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Application overview
              </h2>
              <p className="text-sm text-slate-600">
                Showing {filteredApplications.length} of {applications.length}{" "}
                applications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Sort
              </span>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="h-10 w-48 rounded-2xl border-[#d8e4df] bg-white text-sm text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-[#d8e4df] bg-white text-slate-900">
                  <SelectGroup>
                    <SelectItem
                      value="recent"
                      className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                    >
                      Last updated
                    </SelectItem>
                    <SelectItem
                      value="progress"
                      className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                    >
                      Progress (high to low)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d8e4df] bg-white p-10 text-center text-sm text-slate-600 shadow-[0_12px_28px_-20px_rgba(11,64,55,0.18)]">
              No applications match the current filters. Adjust your filters to
              see more results.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_16px_36px_-30px_rgba(11,64,55,0.22)]"
                >
                  <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {application.id}
                      </p>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                        {application.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {application.summary}
                      </p>
                    </div>
                    <Badge
                      className={`border ${statusStyles[application.status]} px-3 py-1.5 text-xs font-semibold uppercase tracking-wide`}
                    >
                      {application.status}
                    </Badge>
                  </header>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 text-slate-900">
                    <InfoItem
                      label="Directorate"
                      value={application.directorate}
                    />
                    <InfoItem
                      label="Beneficiary"
                      value={application.beneficiary}
                    />
                    <InfoItem label="License" value={application.licenseType} />
                    <InfoItem
                      label="Submitted"
                      value={dateFormatter.format(
                        new Date(application.submissionDate),
                      )}
                    />
                    <InfoItem
                      label="Last update"
                      value={dateFormatter.format(
                        new Date(application.lastUpdated),
                      )}
                    />
                    <InfoItem
                      label="Progress"
                      value={`${application.progress}%`}
                    />
                    <InfoItem
                      label="Next milestone"
                      value={application.nextAction.split(".")[0]}
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full flex-1 items-center gap-4">
                      <Progress
                        value={application.progress}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-[#e3efea]"
                      />
                      <span className="text-sm font-medium text-[#0f766e]">
                        {application.progress}% complete
                      </span>
                    </div>
                    <div className="max-w-md rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">
                        Next action
                      </p>
                      <p className="mt-1 leading-relaxed text-slate-600">
                        {application.nextAction}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </PortalPageLayout>

      {/* Journey View Modal */}
      {showJourneyView && (
        <JourneyView
          journeyNumber="0987654321"
          completedSteps={3}
          totalSteps={8}
          currentStepId={activeJourneyStageId}
          steps={journeySteps}
          activities={businessActivities}
          selectedActivityIds={selectedBusinessActivities}
          availableActivities={availableActivities}
          actorOptions={actorOptions}
          onStepChange={handleJourneyStepChange}
          onActivityToggle={handleActivityToggle}
          onAddActivity={handleAddActivity}
          onClose={handleCloseJourneyView}
        />
      )}
    </>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
