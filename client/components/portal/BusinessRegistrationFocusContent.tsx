import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BusinessRegistrationFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  tradeName?: string;
  isTradeNameAvailable?: boolean;
  progressPercent?: number;
}

type StepStatus = "current" | "pending" | "completed";

interface StepItem {
  id: number;
  label: string;
  status: StepStatus;
}

const DEFAULT_STEPS: StepItem[] = [
  { id: 1, label: "Business Registration", status: "current" },
  { id: 2, label: "Submission of Documents", status: "pending" },
  { id: 3, label: "Business Licensing", status: "pending" },
  { id: 4, label: "Pre-Operational Inspection", status: "pending" },
];

export function BusinessRegistrationFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "4 of 8 complete",
  tradeName = "MARWAH",
  isTradeNameAvailable = true,
  progressPercent = 46,
}: BusinessRegistrationFocusContentProps) {
  const steps = React.useMemo(() => DEFAULT_STEPS, []);

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

          <div className="rounded-[32px] border border-[#0f766e]/30 bg-[#0f766e]/5 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Step 1 in progress
                </p>
                <p className="text-2xl font-semibold text-slate-900">{tradeName}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#54ffd4]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#0f766e] shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#54ffd4]"><Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /></span>
                {isTradeNameAvailable ? "Available" : "Pending review"}
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0f766e]/15 text-[#0f766e]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">Trade Name Available</h3>
                  <p className="text-sm text-slate-600">
                    The TAMM platform confirms availability. Final approval remains with the Department of Economic Development.
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Reserve Trade Name</p>
                    <p className="text-sm text-slate-600">
                      Secure this name now. Reservation stays active for one calendar month.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] hover:bg-[#0f766e]/10"
                  >
                    Continue
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_-18px_rgba(15,118,110,0.45)] hover:bg-[#0c6059]">
                    Try Another Name
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                  >
                    Go to My TAMM
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                  >
                    Need Support?
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.id} className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
                    step.status === "completed" && "border-[#0f766e] bg-[#0f766e] text-white",
                    step.status === "current" && "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]",
                    step.status === "pending" && "border-slate-200 bg-white text-slate-500",
                  )}
                >
                  {step.status === "completed" ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900">
                    Step {step.id}: {step.label}
                  </p>
                  <p className="text-sm text-slate-600">
                    {step.status === "current"
                      ? "Currently capturing your business details and verifying the trade name."
                      : "Pending action once current step is complete."}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={chatCardClass(
          "flex flex-col gap-6 border border-white/20 bg-gradient-to-br from-[#0a2d42] via-[#0d3a52] to-[#11455c] p-6 text-white/90 shadow-[0_42px_96px_-58px_rgba(10,45,66,0.65)]",
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
              alt="AI Business assistant"
              className="h-16 w-16 rounded-full border-2 border-[#54ffd4]"
            />
            <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#54ffd4] text-xs font-semibold text-[#0a2d42]">
              AI
            </span>
          </div>
          <div className="min-w-[180px] space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#54ffd4]">
              Business AI assistant
            </p>
            <p className="text-lg font-semibold text-white">Generating your application</p>
          </div>
          <div className="ml-auto flex items-end gap-1 text-[#54ffd4]">
            {[18, 28, 16, 22, 12, 26, 20, 32, 14].map((height, index) => (
              <span
                key={index}
                className="w-[3px] rounded-full bg-current opacity-80 transition"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/80">Preparing documentation and coordinating checks with local authorities.</p>
          <div className="space-y-2">
            <div className="relative h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#54ffd4] via-[#7ff6e4] to-[#54ffd4]/70 shadow-[0_1px_6px_rgba(84,255,212,0.45)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              <span>Progress</span>
              <span>{progressPercent}% complete</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/25 bg-white/10 p-4">
          <p className="text-sm font-semibold text-white">Trade name check</p>
          <p className="text-sm text-white/75">
            Confirming availability with the Department of Economic Development before submitting the final application.
          </p>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-[0_24px_48px_-48px_rgba(255,255,255,0.6)]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/aedca84491987116f058410105f4a516ff1a5477?width=424"
              alt="Department of Economic Development"
              className="h-12 w-auto"
            />
            <p className="text-sm font-medium text-slate-800">
              Connected to the Department of Economic Development
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
