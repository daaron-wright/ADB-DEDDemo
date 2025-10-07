import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface BusinessLicensingFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  progressPercent?: number;
}

type StepStatus = "completed" | "current" | "pending";
type SubStepStatus = "completed" | "in_progress" | "pending";

interface SubStep {
  id: string;
  label: string;
  authority?: string;
  status: SubStepStatus;
}

interface Step {
  id: number;
  label: string;
  status: StepStatus;
  subSteps?: SubStep[];
}

const BUSINESS_LICENSING_STEPS: Step[] = [
  { id: 1, label: "Business Registration", status: "completed" },
  { id: 2, label: "Submission of Documents", status: "completed" },
  {
    id: 3,
    label: "Business Licensing",
    status: "current",
    subSteps: [
      {
        id: "economic-license-ded",
        label: "Issuance of Economic License",
        authority: "DED",
        status: "in_progress",
      },
    ],
  },
  { id: 4, label: "Pre-Operational Inspection", status: "pending" },
];

const SUB_STEP_TOKENS: Record<SubStepStatus, { label: string; badgeClass: string; iconClass: string; dotClass: string }> = {
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

export function BusinessLicensingFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "6 of 8 complete",
  progressPercent = 64,
}: BusinessLicensingFocusContentProps) {
  const [showDocuments, setShowDocuments] = React.useState(true);
  const steps = React.useMemo(() => BUSINESS_LICENSING_STEPS, []);

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
            <Badge className="border-white/60 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
              {completionStatus}
            </Badge>
          </div>

          <div className="space-y-4 rounded-[32px] border border-[#0f766e]/30 bg-[#0f766e]/5 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Step 3 in progress
                </p>
                <p className="text-2xl font-semibold text-slate-900">Business Licensing</p>
              </div>
              <Badge className="inline-flex items-center gap-2 border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Automation syncing
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>License generation</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          </div>

          {steps
            .filter((step) => step.subSteps && step.status === "current")
            .map((step) => (
              <div
                key={step.id}
                className="space-y-4 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Active licensing actions
                    </p>
                    <p className="text-sm text-slate-600">
                      AI Business is coordinating with the Department of Economic Development.
                    </p>
                  </div>
                  <Badge className="border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                    {step.subSteps?.filter((item) => item.status === "completed").length} of {step.subSteps?.length} complete
                  </Badge>
                </div>

                <div className="space-y-3">
                  {step.subSteps?.map((subStep) => {
                    const token = SUB_STEP_TOKENS[subStep.status];

                    return (
                      <div
                        key={subStep.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
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
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          <ol className="space-y-4">
            {steps.map((step) => {
              const token = STEP_STATUS_TOKENS[step.status];

              return (
                <li key={step.id} className="flex items-start gap-4">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
                      token.indicatorClass,
                    )}
                  >
                    {step.status === "completed" ? <Check className="h-4 w-4" strokeWidth={3} /> : step.status === "current" ? <Loader2 className="h-4 w-4 animate-spin" /> : step.id}
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                      Step {step.id}: {step.label}
                    </p>
                    <p className="text-sm text-slate-600">
                      {token.helper === "Completed"
                        ? "Finished and synced with your workspace."
                        : token.helper === "In progress"
                          ? "Automating license issuance and regulatory approvals."
                          : "Queued until the current licensing step is complete."}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
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
              <p className="text-lg font-semibold text-slate-900">Automating application process</p>
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
                  Generating application...
                </p>
              </div>
              <Badge className="border-white/70 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                {progressPercent}% complete
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              AI Business is automating the license application process with regulatory authorities.
            </p>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>Automation progress</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  License issuance
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Issuing your Economic License with
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-full border border-[#e6f2ed] bg-white px-6 py-4 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/aedca84491987116f058410105f4a516ff1a5477?width=424"
                alt="Department of Economic Development"
                className="h-16 w-auto"
              />
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
            {showDocuments ? <ChevronUp className="h-6 w-6 text-slate-500" /> : <ChevronDown className="h-6 w-6 text-slate-500" />}
          </button>

          {showDocuments ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/f4db5140ddd80fde530b18c48457b833a2fdbdfc?width=164"
                  alt="Document preview 1"
                  className="h-32 w-full rounded-xl border border-white/70 object-cover shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
                />
              </div>
              <div className="relative flex-shrink-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/6874f52d79db5dff4a42886b0395ffbe0cf14b5d?width=174"
                  alt="Document preview 2"
                  className="h-32 w-full rounded-xl border border-white/70 object-cover shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
                />
              </div>
              <div className="relative flex-shrink-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/f4db5140ddd80fde530b18c48457b833a2fdbdfc?width=164"
                  alt="Document preview 3"
                  className="h-32 w-full rounded-xl border border-white/70 object-cover shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
                />
              </div>
              <div className="relative flex-shrink-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/6874f52d79db5dff4a42886b0395ffbe0cf14b5d?width=174"
                  alt="Document preview 4"
                  className="h-32 w-full rounded-xl border border-white/70 object-cover shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
                />
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
