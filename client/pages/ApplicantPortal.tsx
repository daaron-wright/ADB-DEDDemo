import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PortalPageLayout } from "@/components/portal/PortalPageLayout";
import { PortalProfileMenu } from "@/components/portal/PortalProfileMenu";
import { cn } from "@/lib/utils";

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
  "In Review": "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
  "Awaiting Documents": "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  Approved: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
  Draft: "border-[#d8e4df] bg-[#f4f8f6] text-slate-600",
};

type JourneyTaskStatus = "completed" | "in_progress" | "pending";

type JourneyTask = {
  id: string;
  label: string;
  status: JourneyTaskStatus;
  owner: string;
  dueDate?: string;
  completedOn?: string;
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
      detail: "Finished 12 Mar 2024",
    },
    description:
      "Smart intake responses now prefill every downstream form automatically.",
    state: "done",
    statusDetail: "Completed 12 Mar 2024",
    tasks: [
      {
        id: "questionnaire-intake",
        label: "Complete smart intake questionnaire",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-12",
      },
      {
        id: "questionnaire-profile",
        label: "Review generated business profile",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-12",
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
        completedOn: "2024-03-13",
      },
      {
        id: "registration-initial-approval",
        label: "Initial approval (DED)",
        status: "completed",
        owner: "Department of Economic Development",
        completedOn: "2024-03-14",
      },
      {
        id: "registration-ownership",
        label: "Confirm ownership structure",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-14",
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
        completedOn: "2024-03-15",
      },
      {
        id: "documents-shareholder",
        label: "Shareholder Emirates IDs",
        status: "completed",
        owner: "Applicant",
        completedOn: "2024-03-15",
      },
      {
        id: "documents-review",
        label: "Compliance review (DED)",
        status: "completed",
        owner: "Department of Economic Development",
        completedOn: "2024-03-16",
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
        dueDate: "2024-03-22",
      },
      {
        id: "licensing-fee",
        label: "Settle AED 2,500 licensing fee",
        status: "pending",
        owner: "Applicant",
        dueDate: "2024-03-21",
      },
      {
        id: "licensing-analyst",
        label: "Compliance analyst review",
        status: "in_progress",
        owner: "Licensing analyst",
        dueDate: "2024-03-24",
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
        dueDate: "2024-03-28",
      },
      {
        id: "inspection-checklist",
        label: "Upload fit-out readiness checklist",
        status: "pending",
        owner: "Applicant",
        dueDate: "2024-03-30",
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
        updatedAt: "2024-03-10",
      },
      {
        id: "fitout-floor-plan",
        name: "Finalized kitchen and dining floor plan",
        type: "AutoCAD export",
        updatedAt: "2024-03-08",
      },
      {
        id: "fitout-haccp",
        name: "HACCP readiness checklist",
        type: "Checklist",
        updatedAt: "2024-03-09",
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

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function ApplicantPortal() {
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
    ? `Track your business license progress, ${firstName}, and know exactly what comes next.`
    : "Track your business license progress and know exactly what comes next.";
  const profileName = portalUser?.name ?? "Ahmed Al Mansoori";
  const profileEmail = portalUser?.email ?? "ahmed.almansoori@email.ae";
  const profileAvatar =
    portalUser?.avatarUrl ??
    "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80";
  const profileStatus: "online" | "offline" | "none" = "online";

  const primaryApplication = applications[0];
  const initialStageId =
    journeyStages.find((stage) => stage.state === "current")?.id ??
    journeyStages[0].id;

  const [activeStageId, setActiveStageId] = useState<string>(initialStageId);

  const activeStage =
    journeyStages.find((stage) => stage.id === activeStageId) ??
    journeyStages[0];
  const journeyHighlights = journeyStages.map((stage) => ({
    id: stage.id,
    label: stage.highlight.label,
    detail: stage.highlight.detail,
    state: stage.state,
  }));

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

  return (
    <PortalPageLayout
      title={workspaceTitle}
      subtitle="Business license portal"
      description={workspaceDescription}
      filters={filters}
      headerActions={headerActions}
    >
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
            className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-[0_12px_24px_-20px_rgba(11,64,55,0.28)] transition hover:bg-[#eaf7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
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
          <div className="mt-3 flex flex-wrap gap-3">
            {journeyHighlights.map((highlight) => {
              const tokens = journeyHighlightTokens[highlight.state];
              return (
                <div key={highlight.id} className="space-y-1">
                  <Badge
                    className={cn(
                      "border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                      tokens.badgeClass,
                    )}
                  >
                    {highlight.label}
                  </Badge>
                  {highlight.detail ? (
                    <p className={cn("text-xs", tokens.detailClass)}>
                      {highlight.detail}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_16px_32px_-28px_rgba(11,64,55,0.2)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            <ol className="space-y-4 lg:w-72">
              {journeyStages.map((stage) => {
                const tokens = journeyHighlightTokens[stage.state];
                const isActive = stage.id === activeStageId;

                return (
                  <li key={stage.id}>
                    <div
                      className={cn(
                        "rounded-2xl border px-4 py-3 transition-all duration-200",
                        isActive
                          ? "border-[#0f766e] bg-[#eaf7f3] shadow-[0_16px_32px_-28px_rgba(11,64,55,0.32)]"
                          : "border-[#d8e4df] bg-white hover:border-[#0f766e] hover:bg-[#f4faf8]",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveStageId(stage.id)}
                          className="flex-1 w-full rounded-none border-none bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "mt-1 h-2.5 w-2.5 rounded-full",
                                  tokens.dotClass,
                                )}
                                aria-hidden="true"
                              />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {stage.title}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={cn(
                                "border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                                tokens.badgeClass,
                              )}
                            >
                              {tokens.stateLabel}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600">
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
                        <Link
                          to={`/journey?stage=${stage.id}`}
                          className="inline-flex items-center rounded-full border border-[#0f766e] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#0f766e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                          aria-label={`Open ${stage.title} in the Investor Journey`}
                        >
                          Journey
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="flex-1 rounded-3xl border border-[#d8e4df] bg-[#f9fbfa] p-6">
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
                        <span className="font-semibold text-slate-900">
                          {task.owner}
                        </span>
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
                              className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-white px-4 py-2 text-xs font-semibold text-[#0f766e] shadow-[0_10px_20px_-18px_rgba(11,64,55,0.35)] transition hover:bg-[#eaf7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
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
                                  <span className="mt-0.5 h-2 w-2 rounded-full bg-[#0f766e]" aria-hidden="true" />
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {item.type} • Updated {dateFormatter.format(new Date(item.updatedAt))}
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

        <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 text-sm leading-relaxed text-slate-700">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Application summary
          </h3>
          <p className="mt-3">{primaryApplication.summary}</p>
        </div>
      </section>
    </PortalPageLayout>
  );
}
