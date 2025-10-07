import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface BusinessRegistrationFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  tradeName?: string;
  isTradeNameAvailable?: boolean;
  progressPercent?: number;
}

type TradeNameCheckStatus = "completed" | "current" | "pending" | "failed";

type TradeNameVerificationStep = {
  title: string;
  description: string;
  failureDetail?: string;
};

type TradeNameVerificationStepWithStatus = TradeNameVerificationStep & {
  status: TradeNameCheckStatus;
  progress: number;
};

const TRADE_NAME_CHECKS: ReadonlyArray<TradeNameVerificationStep> = [
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
    failureDetail:
      "Matches an existing company chartered as Corniche Culinary Collective Trading.",
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
];

const DEFAULT_FAILURE_STEP_INDEX = (() => {
  const index = TRADE_NAME_CHECKS.findIndex(
    (step) => step.title === "Similar name checks",
  );
  return index === -1 ? 3 : index;
})();

const STATUS_LABELS: Record<TradeNameCheckStatus, string> = {
  completed: "Completed",
  current: "Running",
  pending: "Queued",
  failed: "Failed",
};

function getStepStatus(
  progressPercent: number,
  stepIndex: number,
  totalSteps: number,
  isNameAvailable: boolean,
  failedStepIndex: number | null,
): { status: TradeNameCheckStatus; progress: number } {
  if (totalSteps <= 0) {
    return { status: "pending", progress: 0 };
  }

  const segmentSize = 100 / totalSteps;
  const segmentStart = segmentSize * stepIndex;
  const segmentEnd = segmentStart + segmentSize;
  const normalizedProgress = Math.min(
    Math.max((progressPercent - segmentStart) / segmentSize, 0),
    1,
  );

  if (failedStepIndex !== null) {
    if (stepIndex < failedStepIndex) {
      if (progressPercent >= segmentEnd) {
        return { status: "completed", progress: 1 };
      }

      if (progressPercent <= segmentStart) {
        return { status: "pending", progress: 0 };
      }

      return { status: "current", progress: normalizedProgress };
    }

    if (stepIndex === failedStepIndex) {
      if (!isNameAvailable && progressPercent >= segmentEnd) {
        return { status: "failed", progress: 1 };
      }

      if (progressPercent <= segmentStart) {
        return { status: "pending", progress: 0 };
      }

      return { status: "current", progress: normalizedProgress };
    }

    return { status: "pending", progress: 0 };
  }

  if (progressPercent >= segmentEnd) {
    return { status: "completed", progress: 1 };
  }

  if (progressPercent <= segmentStart) {
    return { status: "pending", progress: 0 };
  }

  return { status: "current", progress: normalizedProgress };
}

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function BusinessRegistrationFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "4 of 8 complete",
  tradeName = "MARWAH",
  isTradeNameAvailable = true,
  progressPercent = 46,
}: BusinessRegistrationFocusContentProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeTradeName, setActiveTradeName] = React.useState(tradeName);
  const [inputValue, setInputValue] = React.useState("");
  const [isChecking, setIsChecking] = React.useState(false);
  const [isNameAvailable, setIsNameAvailable] = React.useState(isTradeNameAvailable);
  const [automationProgress, setAutomationProgress] = React.useState(() =>
    clampProgress(progressPercent),
  );
  const [hasUserOverride, setHasUserOverride] = React.useState(false);
  const [failedStepIndex, setFailedStepIndex] = React.useState<number | null>(
    isTradeNameAvailable ? null : DEFAULT_FAILURE_STEP_INDEX,
  );
  const [failureReason, setFailureReason] = React.useState<string | null>(null);

  const trimmedInput = inputValue.trim();
  const isSubmitDisabled = isChecking || trimmedInput.length === 0;
  const displayProgress = Math.round(automationProgress);

  React.useEffect(() => {
    if (hasUserOverride) {
      return;
    }

    setActiveTradeName(tradeName);
    setIsNameAvailable(isTradeNameAvailable);
    setFailedStepIndex(
      isTradeNameAvailable ? null : DEFAULT_FAILURE_STEP_INDEX,
    );
    setAutomationProgress(clampProgress(progressPercent));
  }, [hasUserOverride, tradeName, isTradeNameAvailable, progressPercent]);

  React.useEffect(() => {
    setHasUserOverride(false);
  }, [tradeName, isTradeNameAvailable, progressPercent]);

  React.useEffect(() => {
    if (!isChecking) {
      return;
    }

    const interval = window.setInterval(() => {
      setAutomationProgress((previous) => {
        const next = Math.min(previous + 12, 100);

        if (next >= 100) {
          window.clearInterval(interval);
          setIsChecking(false);
          setIsNameAvailable(false);
          setFailureReason(
            "This name conflicts with an existing Corniche Culinary Collective registration.",
          );
        }

        return next;
      });
    }, 420);

    return () => window.clearInterval(interval);
  }, [isChecking]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isChecking) {
        return;
      }

      if (!trimmedInput) {
        return;
      }

      setActiveTradeName(trimmedInput);
      setAutomationProgress(0);
      setInputValue("");
      setIsChecking(true);
      setIsNameAvailable(true);
      setFailedStepIndex(DEFAULT_FAILURE_STEP_INDEX);
      setFailureReason(null);
      setHasUserOverride(true);
    },
    [isChecking, trimmedInput],
  );

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    },
    [],
  );

  const automationSteps = React.useMemo<TradeNameVerificationStepWithStatus[]>(() => {
    const totalSteps = TRADE_NAME_CHECKS.length;

    return TRADE_NAME_CHECKS.map((step, index) => {
      const { status, progress } = getStepStatus(
        automationProgress,
        index,
        totalSteps,
        isNameAvailable,
        failedStepIndex,
      );

      return {
        ...step,
        status,
        progress,
      };
    });
  }, [automationProgress, failedStepIndex, isNameAvailable]);

  const badgeLabel = isChecking
    ? "Checking..."
    : isNameAvailable
    ? "Available"
    : "Unavailable";

  const availabilityBadgeClasses = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm transition-colors",
    isChecking && "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    !isChecking && isNameAvailable && "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    !isChecking && !isNameAvailable && "border-rose-200 bg-rose-50 text-rose-600",
  );

  const badgeIcon = isChecking ? (
    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  ) : isNameAvailable ? (
    <Check className="h-3.5 w-3.5" strokeWidth={3} />
  ) : (
    <X className="h-3.5 w-3.5" strokeWidth={3} />
  );

  const statusIconWrapperClasses = cn(
    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors",
    isChecking || isNameAvailable
      ? "bg-[#0f766e]/15 text-[#0f766e]"
      : "bg-rose-100 text-rose-600",
  );

  const statusCardIcon = isChecking ? (
    <span className="relative flex h-4 w-4 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current/60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  ) : isNameAvailable ? (
    <Check className="h-4 w-4" strokeWidth={3} />
  ) : (
    <X className="h-4 w-4" strokeWidth={3} />
  );

  const statusHeading = isChecking
    ? "Checking trade name"
    : isNameAvailable
    ? "Trade name available"
    : "Trade name unavailable";

  const statusDescription = isChecking
    ? "We’re running automated validation before reserving the name."
    : isNameAvailable
    ? "The TAMM platform confirms availability. Final approval remains with the Department of Economic Development."
    : "This name matches an existing business record. Try a different variation to continue.";

  const tradeCheckDescription = isChecking
    ? "We’re synchronising with the Department of Economic Development to confirm availability."
    : isNameAvailable
    ? "We’re confirming availability and reserving your trade name before moving to licensing."
    : "The checks flagged a conflict with an existing registration, so this name can’t proceed.";

  const statusSummary = isChecking
    ? `Status: running automated checks for ${activeTradeName}`
    : isNameAvailable
    ? "Status: verification synced with the Department of Economic Development"
    : `Status: similar name conflict flagged for ${activeTradeName}.`;

  const tradeCheckBadgeLabel = isChecking
    ? "Checking"
    : isNameAvailable
    ? "In progress"
    : "Action needed";

  const tradeCheckBadgeClasses = cn(
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
    isChecking && "border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f766e]",
    !isChecking && isNameAvailable && "border-white/70 bg-[#0f766e]/10 text-[#0f766e]",
    !isChecking && !isNameAvailable && "border-rose-200 bg-rose-50 text-rose-600",
  );

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
                  {activeTradeName}
                </p>
              </div>
              <Badge className={availabilityBadgeClasses}>
                {badgeIcon}
                {badgeLabel}
              </Badge>
            </div>
          </div>

          <div className="space-y-5 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_28px_60px_-54px_rgba(15,23,42,0.4)]">
            <div className="flex items-start gap-3">
              <div className={statusIconWrapperClasses}>{statusCardIcon}</div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {statusHeading}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {statusDescription}
                  </p>
                </div>
                {!isChecking && !isNameAvailable && failureReason && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
                    {failureReason}
                  </div>
                )}
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Try another trade name
                    </p>
                    <p className="text-xs text-slate-500">
                      Enter a new option to rerun the automated checks instantly.
                    </p>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Enter a new trade name"
                      disabled={isChecking}
                      className="h-11 rounded-full border-slate-200 bg-white px-4 text-sm tracking-wide text-slate-900 placeholder:text-slate-400 sm:flex-1"
                    />
                    <Button
                      type="submit"
                      className="h-11 rounded-full bg-[#0f766e] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_-18px_rgba(15,118,110,0.45)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSubmitDisabled}
                    >
                      Run checks
                    </Button>
                  </form>
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
                    className="h-9 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] hover:bg-[#0f766e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isChecking || !isNameAvailable}
                  >
                    Continue
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    disabled={isChecking}
                    className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_-18px_rgba(15,118,110,0.45)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Type another name
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
              {displayProgress}% complete
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            The assistant is completing your trade name checks and generating
            the application package for submission.
          </p>
          <div className="space-y-2">
            <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all duration-500 ease-out"
                style={{ width: `${automationProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Automation progress</span>
              <span>{displayProgress}%</span>
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
            <Badge className={tradeCheckBadgeClasses}>{tradeCheckBadgeLabel}</Badge>
          </div>
          <p className="text-sm text-slate-600">
            {tradeCheckDescription}
          </p>
          <div className="space-y-4 rounded-2xl border border-[#e6f2ed] bg-white/95 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
              Automated verification steps
            </p>
            <ul className="space-y-4">
              {automationSteps.map((step, index) => (
                <li
                  key={step.title}
                  className={cn(
                    "flex gap-3 rounded-2xl border border-transparent bg-white/0 p-3 transition-all duration-500 ease-out",
                    step.status === "completed" &&
                      "border-[#0f766e]/40 bg-[#0f766e]/5 shadow-[0_12px_24px_-20px_rgba(15,118,110,0.45)]",
                    step.status === "current" &&
                      "border-[#0f766e]/30 bg-[#0f766e]/8 shadow-[0_10px_20px_-20px_rgba(15,118,110,0.45)]",
                    step.status === "failed" &&
                      "border-rose-200 bg-rose-50/80 shadow-[0_10px_24px_-22px_rgba(225,29,72,0.45)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-500 ease-out",
                      step.status === "completed" &&
                        "border-[#0f766e] bg-[#0f766e] text-white shadow-[0_8px_18px_-10px_rgba(15,118,110,0.55)]",
                      step.status === "current" &&
                        "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e] animate-pulse",
                      step.status === "pending" &&
                        "border-slate-200 bg-white text-slate-400",
                      step.status === "failed" &&
                        "border-rose-300 bg-rose-100 text-rose-600",
                    )}
                  >
                    {step.status === "completed" ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : step.status === "failed" ? (
                      <X className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {step.title}
                        </p>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {step.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                          step.status === "completed" &&
                            "bg-[#0f766e]/10 text-[#0f766e]",
                          step.status === "current" &&
                            "bg-[#0f766e]/15 text-[#0f766e]",
                          step.status === "pending" &&
                            "bg-slate-100 text-slate-500",
                          step.status === "failed" &&
                            "bg-rose-100 text-rose-600",
                        )}
                      >
                        {STATUS_LABELS[step.status]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500 ease-out",
                            step.status === "pending" && "bg-[#0f766e]/30",
                            step.status === "current" && "bg-[#0f766e]",
                            step.status === "completed" && "bg-[#0f766e]",
                            step.status === "failed" && "bg-rose-500",
                          )}
                          style={{ width: `${step.progress * 100}%` }}
                        />
                      </div>
                      {step.status === "failed" && step.failureDetail && (
                        <p className="text-sm font-medium text-rose-600">
                          {step.failureDetail}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e6f2ed] bg-white px-4 py-4 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/aedca84491987116f058410105f4a516ff1a5477?width=424"
              alt="Department of Economic Development"
              className="h-12 w-auto"
            />
            <p className="text-sm font-medium text-slate-700">
              {statusSummary}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
