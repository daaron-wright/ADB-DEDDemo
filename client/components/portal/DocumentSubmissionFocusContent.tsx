import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Loader2, MessageCircle } from "lucide-react";

interface DocumentSubmissionFocusContentProps {
  journeyNumber?: string;
  progressPercent?: number;
}

type StepStatus = "completed" | "current" | "pending";
type SubStepStatus = "completed" | "in_progress" | "pending";

interface SubStep {
  id: string;
  label: string;
  authority?: string;
  status: SubStepStatus;
  isOptional?: boolean;
}

interface Step {
  id: number;
  label: string;
  status: StepStatus;
  subSteps?: SubStep[];
}

const INITIAL_DOCUMENT_SUBMISSION_STEPS: Step[] = [
  { id: 1, label: "Business Registration", status: "completed" },
  {
    id: 2,
    label: "Submission of Documents",
    status: "current",
    subSteps: [
      {
        id: "notarized-moa",
        label: "Notarized MOA",
        authority: "ADJD",
        status: "in_progress",
      },
      {
        id: "tenancy-confirmation",
        label: "Tenancy Confirmation",
        authority: "ADM",
        status: "in_progress",
      },
      {
        id: "site-plan-review",
        label: "Site Plan Review and Technical Consultation",
        authority: "ADAFSA",
        status: "in_progress",
      },
      {
        id: "convert-property",
        label: "Convert Residential to Commercial property",
        authority: "ADM",
        status: "pending",
        isOptional: true,
      },
    ],
  },
  { id: 3, label: "Business Licensing", status: "pending" },
  { id: 4, label: "Pre-Operational Inspection", status: "pending" },
];

const AUTHORITIES = [
  {
    id: "adjd",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/1981c3d7af8c84e9cbf44084322b4260bd08a6c3?width=384",
    alt: "Judicial Department",
  },
  {
    id: "adm",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/5a7f442966ee72dc36ffecad3b13703746d2ec1c?width=384",
    alt: "Abu Dhabi City Municipality",
  },
  {
    id: "adafsa",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/34a6ee9d8c89d380fc61f0ce59ce20d319f4ba50?width=384",
    alt: "Abu Dhabi Agriculture and Food Safety Authority",
  },
  {
    id: "tamm",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/f8630c65f7c5d218487e6f47386e7fcd3f1e9cfb?width=384",
    alt: "TAMM",
  },
];

const SUB_STEP_TOKENS: Record<
  SubStepStatus,
  { label: string; badgeClass: string; iconClass: string; dotClass: string }
> = {
  completed: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    iconClass: "text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
  in_progress: {
    label: "In progress",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    iconClass: "text-[#0b7d6f]",
    dotClass: "bg-[#0b7d6f]",
  },
  pending: {
    label: "Pending",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    iconClass: "text-[#b97324]",
    dotClass: "bg-[#b97324]",
  },
};

const DOCUMENT_USER_ACTIONS = [
  {
    id: "notarized-moa",
    title: "Notarized MOA (ADJD)",
    action: "Review the AI-prepared memorandum and apply your digital signature before notarization.",
  },
  {
    id: "tenancy-confirmation",
    title: "Tenancy confirmation (ADM)",
    action: "Upload the signed Ejari or municipality tenancy letter for the restaurant space.",
  },
  {
    id: "site-plan-review",
    title: "Site plan review (ADAFSA)",
    action: "Share the latest kitchen site plan PDF so ADAFSA can start the technical consultation.",
  },
  {
    id: "convert-property",
    title: "Convert property to commercial (ADM)",
    action: "Submit the property conversion request form with owner consent if this step applies to you.",
  },
] as const;

const STEP_STATUS_TOKENS: Record<
  StepStatus,
  {
    headline: string;
    badgeLabel: string;
    badgeClass: string;
    iconClass: string;
    iconType: "check" | "spinner" | "dot";
  }
> = {
  completed: {
    headline: "completed",
    badgeLabel: "Automation complete",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    iconClass: "text-[#0f766e]",
    iconType: "check",
  },
  current: {
    headline: "in progress",
    badgeLabel: "Automation syncing",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    iconClass: "text-[#0b7d6f]",
    iconType: "spinner",
  },
  pending: {
    headline: "pending",
    badgeLabel: "Awaiting kickoff",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    iconClass: "text-[#b97324]",
    iconType: "dot",
  },
};

const DOCUMENT_PREVIEWS = [
  {
    id: "preview-1",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/e935ed8e6b8aa085650edae1997167c9467b8f30?width=164",
    alt: "Document preview 1",
  },
  {
    id: "preview-2",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/e467ef8d4c6409cd0f0e485b663b7b5a5ff73d2b?width=174",
    alt: "Document preview 2",
  },
  {
    id: "preview-3",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/e6f6df90a2f485a0a3eed451704b3d9fb7375e09?width=164",
    alt: "Document preview 3",
  },
];

export function DocumentSubmissionFocusContent({
  journeyNumber = "0987654321",
  progressPercent: initialProgress = 45,
}: DocumentSubmissionFocusContentProps) {
  const [showDocuments, setShowDocuments] = React.useState(true);
  const [steps, setSteps] = React.useState<Step[]>(() =>
    INITIAL_DOCUMENT_SUBMISSION_STEPS.map((step) => ({
      ...step,
      subSteps: step.subSteps?.map((subStep) => ({ ...subStep })),
    })),
  );
  const [progress, setProgress] = React.useState(initialProgress);
  const [isLaunchDropdownOpen, setIsLaunchDropdownOpen] = React.useState(true);
  const [isCompletingMoa, setIsCompletingMoa] = React.useState(false);
  const completionTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const submissionStep = React.useMemo(() => steps.find((step) => step.id === 2), [steps]);
  const submissionToken = submissionStep
    ? STEP_STATUS_TOKENS[submissionStep.status]
    : STEP_STATUS_TOKENS.current;
  const notarizedMoa = submissionStep?.subSteps?.find((subStep) => subStep.id === "notarized-moa");
  const isMoaCompleted = notarizedMoa?.status === "completed";

  React.useEffect(() => {
    if (isMoaCompleted) {
      setIsLaunchDropdownOpen(false);
    }
  }, [isMoaCompleted]);

  const handleLaunchDropdownToggle = React.useCallback(() => {
    setIsLaunchDropdownOpen((value) => !value);
  }, []);

  const openLaunchDropdown = React.useCallback(() => {
    setIsLaunchDropdownOpen(true);
  }, []);

  const handleCompleteMoa = React.useCallback(() => {
    if (isCompletingMoa || isMoaCompleted) {
      return;
    }

    setIsCompletingMoa(true);
    completionTimeoutRef.current = window.setTimeout(() => {
      setSteps((previousSteps) =>
        previousSteps.map((step) => {
          if (step.id === 2) {
            const updatedSubSteps = step.subSteps?.map((subStep) => ({
              ...subStep,
              status: "completed" as const,
            }));

            return {
              ...step,
              status: "completed" as const,
              subSteps: updatedSubSteps,
            };
          }

          if (step.id === 3) {
            return {
              ...step,
              status: "current" as const,
            };
          }

          return step;
        }),
      );
      setProgress(90);
      setIsCompletingMoa(false);
      setIsLaunchDropdownOpen(false);
      completionTimeoutRef.current = null;
    }, 1200);
  }, [isCompletingMoa, isMoaCompleted]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)]">
        <section
          className={chatCardClass(
            "border border-white/25 bg-white/90 p-6 backdrop-blur-2xl shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
          )}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Journey number
                </p>
                <p className="text-lg font-semibold text-slate-900">{journeyNumber}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-[32px] border border-[#0f766e]/30 bg-[#0f766e]/5 px-5 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    {submissionStep
                      ? `Step ${submissionStep.id} ${submissionToken.headline}`
                      : "Step 2 in progress"}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">Submission of Documents</p>
                </div>
                <Badge
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    submissionToken.badgeClass,
                  )}
                >
                  {submissionToken.iconType === "check" ? (
                    <Check className={cn("h-3.5 w-3.5", submissionToken.iconClass)} strokeWidth={3} />
                  ) : submissionToken.iconType === "spinner" ? (
                    <Loader2 className={cn("h-3.5 w-3.5 animate-spin", submissionToken.iconClass)} />
                  ) : (
                    <span className={cn("block h-2 w-2 rounded-full", submissionToken.iconClass)} />
                  )}
                  {submissionToken.badgeLabel}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Document compilation</span>
                  <span>{progress}%</span>
                </div>
              </div>
          </div>

          {!isMoaCompleted ? (
            <div className="space-y-4 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleLaunchDropdownToggle();
                }}
                aria-expanded={isLaunchDropdownOpen}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Active document automation
                  </p>
                  <p className="text-lg font-semibold text-slate-900">Notarize MOA (ADJD)</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Launch AI assistant
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isLaunchDropdownOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </span>
              </button>
              {isLaunchDropdownOpen ? (
                <div className="space-y-5 rounded-2xl border border-[#e3ede8] bg-[#f9fbfa] p-4 text-sm text-slate-600">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1 space-y-3">
                      <p className="font-semibold text-slate-800">
                        {isCompletingMoa
                          ? "AI Business is finalizing your memorandum for ADJD."
                          : "AI Business will guide you through the notarization with ADJD."}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                          <span>Pre-fills the ADJD template with your approved company details.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                          <span>Verifies shareholder capital contributions and signatures.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                          <span>Syncs the notarized memorandum back to your workspace.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.15)] lg:max-w-[220px]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3ffa7aec67d74c31b0175b0538c93dfd?format=webp&width=800"
                        alt="Memorandum of Association preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {isCompletingMoa ? "Syncing with ADJD" : "Ready to notarize"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isCompletingMoa
                          ? "Keep this tab open while we submit the memorandum."
                          : "Your shareholder details and capital structure are pre-filled."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCompleteMoa();
                      }}
                      disabled={isCompletingMoa}
                      className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_-22px_rgba(11,64,55,0.4)] transition hover:bg-[#0c6059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isCompletingMoa ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{isCompletingMoa ? "Submitting to ADJD" : "Launch AI assistant to finalize"}</span>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/60 bg-white shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]">
              <Accordion type="single" collapsible defaultValue="moa-summary">
                <AccordionItem value="moa-summary" className="border-none">
                  <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-slate-900">
                    Notarized MOA synced with ADJD
                  </AccordionTrigger>
                  <AccordionContent className="px-5">
                    <div className="space-y-3 rounded-2xl border border-[#e3ede8] bg-[#f9fbfa] p-4 text-sm text-slate-600">
                      <p className="text-slate-800">
                        AI Business completed the notarization and updated your TAMM workspace with the signed memorandum.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                          <span>ADJD template populated with approved shareholder and capital details.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                          <span>Digital notary seal applied and archived to your document vault.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-1 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                          <span>All remaining submission tasks marked as complete.</span>
                        </li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {steps
              .filter((step) => step.subSteps && step.status !== "pending")
              .map((step) => {
                const completedCount = step.subSteps?.filter((item) => item.status === "completed").length ?? 0;
                const totalCount = step.subSteps?.length ?? 0;
                const isCompletedStep = step.status === "completed";

                return (
                  <div
                    key={step.id}
                    className="space-y-4 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {isCompletedStep ? "Completed sub-steps" : "Active sub-steps"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {isCompletedStep
                            ? "All required submissions have synced successfully."
                            : "Track each requirement before moving to the next stage."}
                        </p>
                      </div>
                      <Badge className="border-[#b7e1d4] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {completedCount} of {totalCount} complete
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {step.subSteps?.map((subStep) => {
                        const token = SUB_STEP_TOKENS[subStep.status];
                        const isInteractive = subStep.id === "notarized-moa" && subStep.status !== "completed";
                        const content = (
                          <>
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border",
                                  subStep.status === "completed" && "border-[#0f766e]/20 bg-[#0f766e]/10",
                                  subStep.status === "in_progress" && "border-[#94d2c2] bg-[#dff2ec]/70",
                                  subStep.status === "pending" && "border-slate-200 bg-white",
                                )}
                              >
                                {subStep.status === "completed" ? (
                                  <Check className={cn("h-4 w-4", token.iconClass)} strokeWidth={3} />
                                ) : subStep.status === "in_progress" ? (
                                  <Loader2 className={cn("h-4 w-4 animate-spin", token.iconClass)} />
                                ) : (
                                  <span className={cn("block h-2.5 w-2.5 rounded-full", token.dotClass)} />
                                )}
                              </span>
                              <div className="space-y-1">
                                <p className="text-base font-semibold text-slate-900">
                                  {subStep.label} {subStep.authority ? `(${subStep.authority})` : ""}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                  <span>{token.label}</span>
                                  {subStep.isOptional ? (
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                      Optional
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <Badge
                              className={cn(
                                "self-start border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                token.badgeClass,
                              )}
                            >
                              {token.label}
                            </Badge>
                          </>
                        );

                        if (isInteractive) {
                          return (
                            <button
                              key={subStep.id}
                              type="button"
                              onClick={openLaunchDropdown}
                              className="flex w-full flex-col gap-3 rounded-2xl border border-[#e3ede8] bg-white p-4 text-left transition hover:border-[#0f766e]/40 hover:shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] sm:flex-row sm:items-center sm:justify-between"
                            >
                              {content}
                            </button>
                          );
                        }

                        return (
                          <div
                            key={subStep.id}
                            className="flex flex-col gap-3 rounded-2xl border border-[#e3ede8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <div className="space-y-5">
          <section
            className={chatCardClass(
              "space-y-6 border border-white/60 bg-white/90 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
            )}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#0f766e]/20 bg-white shadow-[0_12px_22px_-14px_rgba(15,118,110,0.45)]">
                <AIBusinessOrb className="h-11 w-11" />
                <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#0f766e] text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  AI
                </span>
              </div>
              <div className="min-w-[180px] space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Business AI assistant
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {submissionStep?.status === "completed" ? "Documents notarized" : "Gathering your documents"}
                </p>
              </div>
              <div className="ml-auto flex items-end gap-1 text-[#0f766e]">
                {[18, 28, 16, 22, 12, 26, 20, 32, 14].map((height, index) => (
                  <span key={index} className="w-[3px] rounded-full bg-current/80" style={{ height: `${height}px` }} />
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Live automation
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    Syncing authority submissions
                  </p>
                </div>
                <Badge className="border-white/70 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                  {progress}% complete
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                AI Business is coordinating document hand-offs across TAMM and partner authorities to keep your application on schedule.
              </p>
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Automation progress</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Document sources
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    Authorities connected to your workspace
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {AUTHORITIES.map((authority) => (
                  <div
                    key={authority.id}
                    className="flex items-center justify-center rounded-full border border-[#e6f2ed] bg-white px-4 py-3 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]"
                  >
                    <img
                      src={authority.src}
                      alt={authority.alt}
                      className="h-auto max-h-[32px] w-auto max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className={chatCardClass(
              "space-y-4 border border-white/60 bg-white/90 p-6 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
            )}
          >
            <button
              type="button"
              onClick={() => setShowDocuments((value) => !value)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  My TAMM documents
                </p>
                <p className="text-base font-semibold text-slate-900">Latest synced files</p>
              </div>
              {showDocuments ? (
                <ChevronUp className="h-6 w-6 text-slate-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-slate-500" />
              )}
            </button>

            {showDocuments ? (
              <div className="flex gap-4">
                {DOCUMENT_PREVIEWS.map((preview) => (
                  <div key={preview.id} className="relative flex-shrink-0">
                    <img
                      src={preview.src}
                      alt={preview.alt}
                      className={cn(
                        "h-32 w-24 rounded-xl border border-white/70 object-cover shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]",
                        submissionStep?.status !== "completed" && "opacity-90",
                      )}
                    />
                    <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-[#0f766e] text-white shadow-[0_6px_18px_-10px_rgba(15,118,110,0.6)]">
                      {submissionStep?.status === "completed" ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
  );
}
