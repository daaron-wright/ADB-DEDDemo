import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface PreOperationalInspectionFocusContentProps {
  journeyNumber?: string;
  progressPercent?: number;
}

type StepStatus = "completed" | "current" | "pending";
type SubStepStatus = "completed" | "in_progress" | "pending" | "scheduled" | "account_linked";

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

const PRE_OPERATIONAL_STEPS: Step[] = [
  { id: 1, label: "Business Registration", status: "completed" },
  { id: 2, label: "Submission of Documents", status: "completed" },
  { id: 3, label: "Business Licensing", status: "completed" },
  {
    id: 4,
    label: "Pre-Operational Inspection",
    status: "current",
    subSteps: [
      {
        id: "certificate-conformity",
        label: "Certificate of Conformity",
        authority: "ADCDA",
        status: "completed",
      },
      {
        id: "food-safety-cert",
        label: "Food Safety Certification",
        authority: "ADAFSA",
        status: "completed",
      },
      {
        id: "bank-account",
        label: "Corporate Bank Account Opening",
        status: "pending",
      },
      {
        id: "telecom-services",
        label: "Telecommunication Services",
        authority: "e&",
        status: "pending",
        isOptional: true,
      },
      {
        id: "exterior-seating",
        label: "Permit for Exterior Seating Area",
        authority: "ADM",
        status: "pending",
        isOptional: true,
      },
      {
        id: "sme-insurance",
        label: "SME General Insurance",
        status: "pending",
        isOptional: true,
      },
    ],
  },
];

const CERTIFICATIONS = [
  {
    id: "adcda",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/65efb322c17c0c898b0d7f62a8594d539ea99380?width=384",
    alt: "Abu Dhabi Civil Defence",
  },
  {
    id: "adafsa",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/34a6ee9d8c89d380fc61f0ce59ce20d319f4ba50?width=384",
    alt: "Abu Dhabi Agriculture and Food Safety Authority",
  },
  {
    id: "fab",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/2c1eed059d09c72f13959f5658792c98a78bd9e1?width=384",
    alt: "First Abu Dhabi Bank",
  },
  {
    id: "etisalat",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/1e83f2e721687676d83cf73e4a7e5e455ff2f837?width=384",
    alt: "e&",
  },
];

const STEP_STATUS_TOKENS: Record<StepStatus, { indicatorClass: string; helper: string }> = {
  completed: {
    indicatorClass: "border-[#0f766e] bg-[#0f766e] text-white",
    helper: "Completed",
  },
  current: {
    indicatorClass: "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]",
    helper: "In progress",
  },
  pending: {
    indicatorClass: "border-slate-200 bg-white text-slate-500",
    helper: "Pending",
  },
};

const SUB_STEP_TOKENS: Record<SubStepStatus, { label: string; badgeClass: string; iconClass: string; dotClass: string }> = {
  completed: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    iconClass: "text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
  account_linked: {
    label: "Account Linked",
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
  scheduled: {
    label: "Scheduled",
    badgeClass: "border-[#cdd7f8] bg-[#eef2ff] text-[#3446b0]",
    iconClass: "text-[#3446b0]",
    dotClass: "bg-[#3446b0]",
  },
};

export function PreOperationalInspectionFocusContent({
  journeyNumber = "0987654321",
  progressPercent = 83,
}: PreOperationalInspectionFocusContentProps) {
  const [showDocuments, setShowDocuments] = React.useState(true);
  const [steps, setSteps] = React.useState<Step[]>(() =>
    PRE_OPERATIONAL_STEPS.map((step) => ({
      ...step,
      subSteps: step.subSteps?.map((subStep) => ({ ...subStep })),
    })),
  );
  const [bankAccountPhase, setBankAccountPhase] = React.useState<"link" | "in_progress" | "account_linked">("link");

  const handleBankAccountAdvance = React.useCallback(() => {
    setBankAccountPhase((previousPhase) => {
      if (previousPhase !== "link") {
        return previousPhase;
      }

      setSteps((previousSteps) =>
        previousSteps.map((step) => {
          if (step.id !== 4) {
            return step;
          }

          return {
            ...step,
            subSteps: step.subSteps?.map((subStep) => {
              if (subStep.id === "bank-account") {
                return { ...subStep, status: "in_progress" };
              }

              return subStep;
            }),
          };
        }),
      );

      return "in_progress";
    });
  }, []);

  React.useEffect(() => {
    if (bankAccountPhase !== "in_progress") {
      return;
    }

    const timer = setTimeout(() => {
      setSteps((previousSteps) =>
        previousSteps.map((step) => {
          if (step.id !== 4) {
            return step;
          }

          return {
            ...step,
            subSteps: step.subSteps?.map((subStep) => {
              if (subStep.id === "bank-account") {
                return { ...subStep, status: "account_linked" };
              }

              if (subStep.status === "pending") {
                return { ...subStep, status: "scheduled" };
              }

              return subStep;
            }),
          };
        }),
      );

      setBankAccountPhase("account_linked");
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [bankAccountPhase]);

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
                  Step 4 in progress
                </p>
                <p className="text-2xl font-semibold text-slate-900">Pre-Operational Inspection</p>
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
                <span>Certification retrieval</span>
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
                      Pre-operational checklist
                    </p>
                    <p className="text-sm text-slate-600">
                      Certifications and services required before opening.
                    </p>
                  </div>
                  <Badge className="border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                    {step.subSteps?.filter((item) => item.status === "completed").length} of {step.subSteps?.filter(item => !item.isOptional).length} required complete
                  </Badge>
                </div>

                <div className="space-y-3">
                  {step.subSteps?.map((subStep) => {
                    const isBankAccount = subStep.id === "bank-account";
                    const token = SUB_STEP_TOKENS[subStep.status];
                    const badgeLabel = isBankAccount
                      ? bankAccountPhase === "link"
                        ? "Link account"
                        : token.label
                      : token.label;

                    return (
                      <div
                        key={subStep.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border",
                              (subStep.status === "completed" || subStep.status === "account_linked") &&
                                "border-[#0f766e]/20 bg-[#0f766e]/10",
                              subStep.status === "in_progress" && "border-[#94d2c2] bg-[#dff2ec]/70",
                              subStep.status === "pending" && "border-slate-200 bg-white",
                              subStep.status === "scheduled" && "border-[#cdd7f8] bg-[#eef2ff]",
                            )}
                          >
                            {subStep.status === "in_progress" ? (
                              <Loader2 className={cn("h-4 w-4 animate-spin", token.iconClass)} />
                            ) : subStep.status === "completed" || subStep.status === "account_linked" ? (
                              <Check className={cn("h-4 w-4", token.iconClass)} strokeWidth={3} />
                            ) : (
                              <span className={cn("block h-2.5 w-2.5 rounded-full", token.dotClass)} />
                            )}
                          </span>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-slate-900">
                                {subStep.label} {subStep.authority ? `(${subStep.authority})` : ""}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                <span>{badgeLabel}</span>
                                {subStep.isOptional ? (
                                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Optional
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            {isBankAccount ? (
                              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-3">
                                <Button
                                  type="button"
                                  onClick={handleBankAccountAdvance}
                                  disabled={bankAccountPhase !== "link"}
                                  className={cn(
                                    "inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_-22px_rgba(11,64,55,0.4)] transition",
                                    bankAccountPhase !== "link" && "cursor-default bg-[#0f766e]/60 hover:bg-[#0f766e]/60",
                                  )}
                                >
                                  {bankAccountPhase === "link" ? (
                                    "Link corporate bank account"
                                  ) : bankAccountPhase === "in_progress" ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>In progress...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4" />
                                      <span>Account linked</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "self-start border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            token.badgeClass,
                          )}
                        >
                          {badgeLabel}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

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
              AI Business is retrieving certifications and coordinating final inspections across authorities.
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
                  Certification sources
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Retrieving your certifications from
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-center rounded-full border border-[#e6f2ed] bg-white px-4 py-3 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]"
                >
                  <img
                    src={cert.src}
                    alt={cert.alt}
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
