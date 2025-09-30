import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const BRAND_LOGO_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F67c03d8c981249bc809a682c60a2173f?format=webp&width=800";

const APPLICANT_AVATAR_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Ffdd0903634a841018729b20c0d63aecb?format=webp&width=200";

type TimelineStatus = "completed" | "in_progress" | "pending";

type TimelineView = "graph" | "timeline";

interface TimelineNode {
  id: string;
  name: string;
  status: TimelineStatus;
  description: string;
  owner: string;
  duration: string;
}

interface WorkflowAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const TIMELINE_NODES: TimelineNode[] = [
  {
    id: "intake",
    name: "Submission intake",
    status: "completed",
    description: "DED validates Emirates ID, trade name, and activity scope submitted by the applicant.",
    owner: "Applications team",
    duration: "12h service goal",
  },
  {
    id: "documents",
    name: "Document verification",
    status: "in_progress",
    description: "Cross-agency review across health, food safety, and tourism for restaurant operations.",
    owner: "Specialist reviewers",
    duration: "1-2 business days",
  },
  {
    id: "inspection",
    name: "Site inspection",
    status: "pending",
    description: "Municipality schedules pre-opening hygiene inspection and uploads field report.",
    owner: "Municipality",
    duration: "Awaiting scheduling",
  },
  {
    id: "approval",
    name: "Final approval",
    status: "pending",
    description: "Economic department publishes license once all obligations and fees clear.",
    owner: "DED licensing",
    duration: "Post-review",
  },
];

const WORKFLOW_ACTIONS: WorkflowAction[] = [
  {
    id: "open-node-review",
    label: "Open node review",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
      >
        <path d="M6.5 4.5L10 8l-3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "start-walkthrough",
    label: "Start walkthrough",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
      >
        <path d="M5 4h6l1 4-1 4H5l-1-4 1-4Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "previous",
    label: "Previous",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
        <path d="M9.5 4.5L6 8l3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "next",
    label: "Next",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
        <path d="M6.5 4.5L10 8l-3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    disabled: true,
  },
];

const statusStyles: Record<TimelineStatus, { bg: string; dot: string; text: string }> = {
  completed: {
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
  in_progress: {
    bg: "bg-sky-500/10",
    dot: "bg-sky-400",
    text: "text-sky-300",
  },
  pending: {
    bg: "bg-slate-500/10",
    dot: "bg-slate-400",
    text: "text-slate-300",
  },
};

const gradientOverlay = (
  <>
    <div className="absolute inset-0 bg-[#050713]" />
    <div className="absolute inset-0 bg-gradient-to-br from-[#101F5B]/70 via-transparent to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-tr from-[#12B5C9]/25 via-transparent to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-bl from-[#38C28B]/20 via-transparent to-transparent" />
    <div className="absolute inset-0 bg-black/30" />
  </>
);

export function StateMachineViewer(): JSX.Element {
  const [view, setView] = useState<TimelineView>("graph");

  const progress = useMemo(() => {
    const completed = TIMELINE_NODES.filter((node) => node.status === "completed").length;
    return Math.round((completed / TIMELINE_NODES.length) * 100);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050713] text-white">
      <div className="absolute inset-0 -z-10">{gradientOverlay}</div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopHeader />

        <div className="flex flex-1 flex-col gap-6 px-6 pb-12 pt-8 lg:px-12">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
            <main className="space-y-6">
              <JourneySummaryCard />
              <ApplicantOverviewCard progress={progress} />
              <ViewToggle currentView={view} onViewChange={setView} />
              <StateMachineCanvas view={view} />
            </main>

            <aside className="space-y-6">
              <OverviewPanel />
              <WorkflowControls />
              <AutomationChecklist />
              <PublicationReadiness />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopHeader(): JSX.Element {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl lg:px-12 lg:py-6">
      <div className="flex items-center gap-3">
        <img src={BRAND_LOGO_URL} alt="Abu Dhabi Government Services" className="h-12 w-auto" />
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            Abu Dhabi Government Services
          </span>
          <p className="text-sm font-medium text-white">Business license portal</p>
        </div>
      </div>

      <div className="hidden items-center gap-3 text-sm font-medium text-white/80 md:flex">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1">
          <Dot className="h-2 w-2 bg-emerald-400" />
          Live state machine sync
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1">
          <Dot className="h-2 w-2 bg-sky-400" />
          Reviewer channel connected
        </span>
      </div>

      <button
        type="button"
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        Exit timeline
      </button>
    </header>
  );
}

function JourneySummaryCard(): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.8)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
            Application Journey
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">Review timeline</h2>
            <p className="max-w-xl text-sm text-white/70 lg:text-base">
              Comprehensive state machine visual for Abu Dhabi DED real beneficiary declaration service, covering all nine
              business routines and their orchestration.
            </p>
          </div>
        </div>

        <div className="grid w-full gap-4 text-sm text-white/80 sm:grid-cols-2 lg:w-auto">
          <MetricTile label="Progress" value="0%" />
          <MetricTile label="Nodes reviewed" value="0 of 0" />
        </div>
      </div>
    </section>
  );
}

function ApplicantOverviewCard({ progress }: { progress: number }): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={APPLICANT_AVATAR_URL}
            alt="Ahmed Al Mansoori"
            className="h-16 w-16 rounded-2xl border border-white/20 object-cover"
          />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Ahmed Al Mansoori</h3>
            <p className="text-sm text-white/70">ahmed.almansoori@email.ae</p>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">License applicant</p>
          </div>
        </div>

        <div className="grid gap-4 text-sm text-white/80 sm:grid-cols-2 lg:flex lg:items-center lg:gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Progress</p>
            <div className="flex items-center gap-3">
              <div className="relative h-2 w-40 overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-white">{progress}%</span>
            </div>
            <p className="text-xs text-white/60">0 workflow branches remaining</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">View</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Graph · Timeline · Audit
            </div>
            <p className="text-xs text-white/60">Secure reviewer access enabled</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewToggle({ currentView, onViewChange }: { currentView: TimelineView; onViewChange: (view: TimelineView) => void }): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
        View
      </div>
      <div className="flex items-center gap-2">
        {(["graph", "timeline"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewChange(mode)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition",
              currentView === mode ? "bg-white text-slate-950" : "text-white/70 hover:text-white",
            )}
            aria-pressed={currentView === mode}
          >
            {mode === "graph" ? "Graph" : "Timeline"}
          </button>
        ))}
      </div>
    </div>
  );
}

function StateMachineCanvas({ view }: { view: TimelineView }): JSX.Element {
  if (view === "timeline") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="relative">
          <div className="absolute left-5 top-1 bottom-1 w-px bg-gradient-to-b from-white/20 to-white/5" aria-hidden />
          <div className="space-y-8">
            {TIMELINE_NODES.map((node, index) => (
              <TimelineItem key={node.id} node={node} isLast={index === TIMELINE_NODES.length - 1} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b142f]/80 p-8">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,115,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:120px_120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:120px_120px]" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">State machine graph</p>
            <h3 className="text-xl font-semibold text-white">Real-time policy orchestration</h3>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white hover:bg-white/20"
          >
            Export timeline
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIMELINE_NODES.map((node) => (
            <div
              key={node.id}
              className={cn(
                "rounded-2xl border border-white/15 p-4 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.35)]",
                statusStyles[node.status].bg,
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">{node.owner}</span>
                <span className={cn("text-xs font-semibold", statusStyles[node.status].text)}>
                  {formatStatusLabel(node.status)}
                </span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-white">{node.name}</h4>
              <p className="mt-2 text-sm text-white/70">{node.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                <span>{node.duration}</span>
                <Dot className={cn("h-2 w-2", statusStyles[node.status].dot)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ node, isLast }: { node: TimelineNode; isLast: boolean }): JSX.Element {
  return (
    <div className="relative pl-12">
      <div
        className={cn(
          "absolute left-4 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2",
          node.status === "completed" && "border-emerald-300",
          node.status === "in_progress" && "border-sky-300",
          node.status === "pending" && "border-white/30",
        )}
      >
        <Dot
          className={cn(
            "h-2 w-2",
            node.status === "completed" && "bg-emerald-300",
            node.status === "in_progress" && "bg-sky-300",
            node.status === "pending" && "bg-white/30",
          )}
        />
      </div>
      {!isLast && <div className="absolute left-5 top-6 bottom-0 w-px bg-white/10" aria-hidden />}
      <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="font-semibold uppercase tracking-[0.28em]">{node.owner}</span>
          <span className="font-semibold text-white/70">{formatStatusLabel(node.status)}</span>
        </div>
        <h4 className="mt-3 text-lg font-semibold text-white">{node.name}</h4>
        <p className="mt-2 text-sm text-white/70">{node.description}</p>
        <p className="mt-4 text-xs text-white/50">{node.duration}</p>
      </div>
    </div>
  );
}

function OverviewPanel(): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Overview</span>
        <h2 className="text-xl font-semibold text-white">Select a state</h2>
        <p className="text-sm text-white/70">Choose a node from the graph to inspect responsibilities, owners, and linked policies.</p>
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/60">
          Awaiting selection
        </div>
      </div>
    </section>
  );
}

function WorkflowControls(): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="space-y-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">Workflow controls</h3>
          <p className="text-sm text-white/70">Manage walkthrough review flow and navigation.</p>
        </div>
      </header>

      <div className="mt-6 space-y-4">
        <button
          type="button"
          className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <span className="flex items-center gap-3">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M5 4h6l1 4-1 4H5l-1-4 1-4Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Start walkthrough
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-white/50">Alt + W</span>
        </button>

        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOW_ACTIONS.slice(0, 2).map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOW_ACTIONS.slice(2).map((action) => (
            <ActionButton key={action.id} action={action} secondary />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionButton({ action, secondary }: { action: WorkflowAction; secondary?: boolean }): JSX.Element {
  return (
    <button
      type="button"
      disabled={action.disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition",
        secondary
          ? "border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:text-white"
          : "border-white/20 bg-white/10 text-white hover:bg-white/20",
        action.disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

function AutomationChecklist(): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Automation checklist</h3>
        <p className="text-sm text-white/70">Tracking each automation bound to this state.</p>
      </header>
      <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/60">
        No automation functions documented for this state.
      </div>
    </section>
  );
}

function PublicationReadiness(): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Publication readiness</h3>
        <p className="text-sm text-white/70">
          {"0 approved · 0 pending · 0 flagged"}
        </p>
      </header>
      <div className="mt-6 space-y-4">
        <MetricTile label="Overall progress" value="0 / 0" />
        <MetricTile label="Version" value="1.0 · 63 total states" />
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Approve all
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-white/60 opacity-60"
          >
            Publish
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M8 3.5v8.5M8 3.5L5 6.5M8 3.5l3 3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="space-y-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function Dot({ className }: { className?: string }): JSX.Element {
  return <span className={cn("inline-block rounded-full", className)} aria-hidden />;
}

function formatStatusLabel(status: TimelineStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    default:
      return "Pending";
  }
}

export default StateMachineViewer;
