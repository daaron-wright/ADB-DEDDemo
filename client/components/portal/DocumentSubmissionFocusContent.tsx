import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface DocumentSubmissionFocusContentProps {
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
  isOptional?: boolean;
}

interface Step {
  id: number;
  label: string;
  status: StepStatus;
  subSteps?: SubStep[];
}

const DOCUMENT_SUBMISSION_STEPS: Step[] = [
  { id: 1, label: "Business Registration", status: "completed" },
  {
    id: 2,
    label: "Submission of Documents",
    status: "current",
    subSteps: [
      { id: "notarized-moa", label: "Notarized MOA", authority: "ADJD", status: "completed" },
      { id: "tenancy-confirmation", label: "Tenancy Confirmation", authority: "ADM", status: "completed" },
      { id: "site-plan-review", label: "Site Plan Review and Technical Consultation", authority: "ADAFSA", status: "in_progress" },
      { id: "convert-property", label: "Convert Residential to Commercial property", authority: "ADM", status: "pending", isOptional: true },
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

export function DocumentSubmissionFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "5 of 8 complete",
  progressPercent = 51,
}: DocumentSubmissionFocusContentProps) {
  const [showDocuments, setShowDocuments] = React.useState(true);
  const steps = React.useMemo(() => DOCUMENT_SUBMISSION_STEPS, []);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section
        className={chatCardClass(
          "border border-white/25 bg-white/70 p-6 backdrop-blur-2xl shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Journey Number: {journeyNumber}</p>
            </div>
            <p className="text-base font-normal text-[#54ffd4]">{completionStatus}</p>
          </div>

          <div className="h-px bg-white/20" />

          <ol className="space-y-5">
            {steps.map((step) => (
              <li key={step.id} className="space-y-4">
                <div className="flex items-start gap-10">
                  <span
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition",
                      step.status === "completed" && "bg-[#54ffd4] text-white",
                      step.status === "current" && "animate-spin text-[#54ffd4]",
                      step.status === "pending" && "border-2 border-white bg-transparent text-white",
                    )}
                  >
                    {step.status === "completed" ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : step.status === "current" ? (
                      <Loader2 className="h-5 w-5" />
                    ) : (
                      ""
                    )}
                  </span>
                  <p className="text-lg font-normal leading-tight text-white">
                    Step {step.id}: {step.label}
                  </p>
                </div>

                {step.subSteps && step.status === "current" ? (
                  <div className="ml-14 space-y-3 rounded-2xl border border-white/30 bg-white/10 p-4">
                    {step.subSteps.map((subStep) => (
                      <div key={subStep.id} className="flex items-start gap-5">
                        <span
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                            subStep.status === "completed" && "bg-[#54ffd4]",
                            subStep.status === "in_progress" && "animate-spin text-[#54ffd4]",
                            subStep.status === "pending" && "border-2 border-white",
                          )}
                        >
                          {subStep.status === "completed" ? (
                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                          ) : subStep.status === "in_progress" ? (
                            <Loader2 className="h-5 w-5" />
                          ) : null}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-normal text-white">
                              {subStep.label} {subStep.authority ? `(${subStep.authority})` : ""}
                            </p>
                            {subStep.isOptional ? (
                              <span className="text-sm font-light text-white">optional</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="space-y-5">
        <section
          className={chatCardClass(
            "space-y-6 border border-white/40 bg-white/80 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
          )}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#54ffd4] bg-white shadow-[0_12px_22px_-14px_rgba(84,255,212,0.45)]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                alt="AI Business"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-[180px] space-y-1">
              <p className="text-lg font-semibold text-slate-900">AI Business</p>
            </div>
            <div className="ml-auto flex items-end gap-1 text-[#54ffd4]">
              {[18, 28, 16, 22, 12, 26, 20, 32, 14].map((height, index) => (
                <span
                  key={index}
                  className="w-[3px] rounded-full bg-current/80"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base font-normal text-white">Generating application...</p>
            <div className="relative h-5 overflow-hidden rounded-full bg-slate-300">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#54ffd4] via-[#7ff6e4] to-[#54ffd4]/70 shadow-[0_1px_6px_rgba(84,255,212,0.45)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-base font-normal text-white">{progressPercent}% complete</p>
          </div>

          <div className="h-px bg-white/30" />

          <div className="space-y-4">
            <p className="text-base font-semibold text-white">Gathering your documents from</p>
            <div className="grid grid-cols-2 gap-3">
              {AUTHORITIES.map((authority) => (
                <div
                  key={authority.id}
                  className="flex items-center justify-center rounded-full bg-white px-4 py-3 shadow-[0_12px_24px_-16px_rgba(0,0,0,0.15)]"
                >
                  <img
                    src={authority.src}
                    alt={authority.alt}
                    className="h-auto max-h-[30px] w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={chatCardClass(
            "border border-white/60 bg-[#54ffd4]/50 p-6 backdrop-blur-xl shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
          )}
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowDocuments(!showDocuments)}
              className="flex w-full items-center justify-between text-left"
            >
              <h3 className="text-base font-semibold text-white">My TAMM Documents</h3>
              {showDocuments ? (
                <ChevronUp className="h-6 w-6 text-white" />
              ) : (
                <ChevronDown className="h-6 w-6 text-white" />
              )}
            </button>

            {showDocuments ? (
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/e935ed8e6b8aa085650edae1997167c9467b8f30?width=164"
                    alt="Document 1"
                    className="h-28 w-20 rounded-lg border border-white/40 object-cover shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <div className="relative flex-shrink-0">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/e467ef8d4c6409cd0f0e485b663b7b5a5ff73d2b?width=174"
                    alt="Document 2"
                    className="h-28 w-20 rounded-lg border border-white/40 object-cover shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <div className="relative flex-shrink-0">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/e6f6df90a2f485a0a3eed451704b3d9fb7375e09?width=164"
                    alt="Document 3"
                    className="h-28 w-20 rounded-lg border border-white/40 object-cover opacity-60 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#54ffd4]" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
