import * as React from "react";
import { Button } from "@/components/ui/button";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface BusinessRegistrationFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  tradeName?: string;
  isTradeNameAvailable?: boolean;
  showAIProgress?: boolean;
  progressPercent?: number;
}

export function BusinessRegistrationFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "4 of 8 complete",
  tradeName = "MARWAH",
  isTradeNameAvailable = true,
  showAIProgress = false,
  progressPercent = 46,
}: BusinessRegistrationFocusContentProps) {
  const steps = [
    { id: 1, label: "Business Registration", status: "current" as const },
    { id: 2, label: "Submission of Documents", status: "pending" as const },
    { id: 3, label: "Business Licensing", status: "pending" as const },
    { id: 4, label: "Pre-Operational Inspection", status: "pending" as const },
  ];

  return (
    <div className="space-y-6">
      {showAIProgress ? (
        <div
          className={chatCardClass(
            "overflow-hidden rounded-3xl border border-white/25 bg-white/20 p-6 backdrop-blur-2xl shadow-[0_4px_44px_0_rgba(22,159,159,0.4)]",
            "rounded-3xl",
          )}
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                  alt="AI Business"
                  className="h-16 w-16 rounded-full border border-[#54FFD4]"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">AI Business</h3>
                  <div className="flex items-center gap-0.5">
                    {[23, 12, 20, 13, 9, 23, 30, 17, 5].map((height, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full bg-[#54FFD4]"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-base text-white">Generating application...</p>
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#54FFD4] to-[#54FFD4]/80 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-white">{progressPercent}% complete</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-base font-semibold text-white">
                Let's check your trade name with
              </p>
              <div className="flex items-center justify-center rounded-full bg-white px-6 py-4">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/aedca84491987116f058410105f4a516ff1a5477?width=424"
                  alt="Department of Economic Development"
                  className="h-auto w-52"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={chatCardClass(
            "overflow-hidden rounded-3xl border border-white/25 bg-white/20 p-6 backdrop-blur-2xl",
            "rounded-3xl",
          )}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">
                Journey Number: {journeyNumber}
              </h3>
              <span className="text-base text-[#54FFD4]">{completionStatus}</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-10">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#54FFD4]" />
                </div>
                <p className="text-lg text-white">Step 1: Business Registration</p>
              </div>

              <div className="rounded-[72px] bg-white/20 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[22px] font-semibold text-white">
                    {tradeName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#54FFD4]">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-base text-[#54FFD4]">
                      {isTradeNameAvailable ? "Available" : "Checking..."}
                    </span>
                  </div>
                </div>
              </div>

              {isTradeNameAvailable && (
                <div className="space-y-4 rounded-3xl border border-white/25 bg-white/80 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#54FFD4]">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Trade Name Available
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600">
                        Please note that the availability of a trade name on the TAMM platform does
                        not mean that the Department of Economic Development will necessarily
                        approve it.
                      </p>
                      <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                        <span className="text-2xl">📝</span>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-semibold text-slate-900">
                            Reserve Trade Name
                          </p>
                          <p className="text-xs text-slate-600">
                            Proceed to this service to reserve this trade name. You may reserve the
                            trade name for 1 month.
                          </p>
                        </div>
                        <button className="ml-2 text-slate-400 hover:text-slate-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-medium text-white hover:bg-[#0c6059]"
                        >
                          Try Another Name
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Go to My TAMM
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Need Support?
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-10">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      {step.status === "current" ? (
                        <Loader2 className="h-7 w-7 animate-spin text-[#54FFD4]" />
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-lg",
                        step.status === "current" ? "text-white" : "text-white/70",
                      )}
                    >
                      Step {step.id}: {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
