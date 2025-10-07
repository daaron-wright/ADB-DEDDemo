import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { chatCardClass } from "@/lib/chat-style";
import { Check } from "lucide-react";

interface BusinessRegistrationFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  tradeName?: string;
  isTradeNameAvailable?: boolean;
  progressPercent?: number;
}

const TRADE_NAME_CHECKS = [
  {
    title: "Character normalization",
    description:
      "We detect attempts to bypass filters by swapping characters or using deliberate misspellings (e.g., 4bu Dh@b1).",
  },
  {
    title: "Prohibited word checks",
    description:
      "We look for explicit and subtle use of restricted terms across the entire name.",
  },
  {
    title: "Cultural checks",
    description:
      "We flag references with religious, geographic, royal, or political sensitivity.",
  },
  {
    title: "Similar name checks",
    description:
      "We confirm there are no existing businesses with confusingly similar names.",
  },
  {
    title: "Transliteration check",
    description:
      "We verify that the Arabic and English renditions align and read correctly.",
  },
  {
    title: "Activity name check",
    description:
      "We ensure the English name aligns with your selected business activity.",
  },
  {
    title: "Suggest names",
    description:
      "We generate alternatives, rerun every check, and surface the results with any failures explained.",
  },
] as const;

export function BusinessRegistrationFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "4 of 8 complete",
  tradeName = "MARWAH",
  isTradeNameAvailable = true,
  progressPercent = 46,
}: BusinessRegistrationFocusContentProps) {
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
              <p className="text-lg font-semibold text-slate-900">
                {journeyNumber}
              </p>
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
                <p className="text-2xl font-semibold text-slate-900">
                  {tradeName}
                </p>
              </div>
              <Badge className="inline-flex items-center gap-1.5 border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f] shadow-sm">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                {isTradeNameAvailable ? "Available" : "Pending review"}
              </Badge>
            </div>
          </div>

          <div className="space-y-5 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0f766e]/15 text-[#0f766e]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    Trade Name Available
                  </h3>
                  <p className="text-sm text-slate-600">
                    The TAMM platform confirms availability. Final approval
                    remains with the Department of Economic Development.
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Reserve Trade Name
                    </p>
                    <p className="text-sm text-slate-600">
                      Secure this name now. Reservation stays active for one
                      calendar month.
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

        </div>
      </section>

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
              Generating your application
            </p>
          </div>
          <div className="ml-auto flex items-end gap-1 text-[#0f766e]">
            {[18, 28, 16, 22, 12, 26, 20, 32, 14].map((height, index) => (
              <span
                key={index}
                className="w-[3px] rounded-full bg-current/80"
                style={{ height: `${height}px` }}
              />
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
                Preparing documentation with local authorities
              </p>
            </div>
            <Badge className="border-white/70 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
              {progressPercent}% complete
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            The assistant is completing your trade name checks and generating
            the application package for submission.
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
                Trade name check
              </p>
              <p className="text-base font-semibold text-slate-900">
                Connected to Department of Economic Development
              </p>
            </div>
            <Badge className="border-white/70 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
              In progress
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            We’re confirming availability and reserving your trade name before
            moving to licensing.
          </p>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e6f2ed] bg-white px-4 py-4 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/aedca84491987116f058410105f4a516ff1a5477?width=424"
              alt="Department of Economic Development"
              className="h-12 w-auto"
            />
            <p className="text-sm font-medium text-slate-700">
              Status: verification synced with the Department of Economic
              Development
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
