import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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

const journeyHighlights: Array<{
  id: string;
  label: string;
  detail?: string;
  state: JourneyHighlightState;
}> = [
  {
    id: "submitted",
    label: "Application submitted",
    detail: "Completed 14 Mar 2024",
    state: "done",
  },
  {
    id: "documents",
    label: "Documents verified",
    detail: "All mandatory files cleared",
    state: "done",
  },
  {
    id: "licensing",
    label: "Licensing in progress",
    detail: "Specialists reviewing financial plan",
    state: "current",
  },
  {
    id: "inspection",
    label: "Inspection next",
    detail: "Scheduling once licensing completes",
    state: "upcoming",
  },
];

const journeyHighlightTokens: Record<
  JourneyHighlightState,
  { badgeClass: string; detailClass: string }
> = {
  done: {
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    detailClass: "text-slate-500",
  },
  current: {
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    detailClass: "text-[#0b7d6f]",
  },
  upcoming: {
    badgeClass: "border-[#dbe7e1] bg-[#f4f8f6] text-slate-600",
    detailClass: "text-slate-500",
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
          Reach out at <span className="font-medium text-[#0f766e]">licensing@adm.ae</span>
          or call <span className="font-medium text-[#0f766e]">800-555-0134</span>.
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Key dates</h3>
        <dl className="mt-3 space-y-2">
          {keyDates.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-slate-600">
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
              <span className="text-slate-900">{primaryApplication.progress}%</span>
            </div>
            <Progress value={primaryApplication.progress} className="mt-3 h-2" />
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

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Next action
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {primaryApplication.nextAction}
          </p>
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

        <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 text-sm leading-relaxed text-slate-700">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Application summary
          </h3>
          <p className="mt-3">
            {primaryApplication.summary}
          </p>
        </div>
      </section>
    </PortalPageLayout>
  );
}
