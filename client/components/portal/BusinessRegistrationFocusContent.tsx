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
  tradeName?: string;
  isTradeNameAvailable?: boolean;
  progressPercent?: number;
  onTradeNameChange?: (tradeName: string | null) => void;
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

type TradeNameIdeaSuggestion = {
  id: string;
  english: string;
  arabic: string;
};

const MAX_TRADE_NAME_SUGGESTIONS = 4;

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

const TRADE_NAME_IDEAS: ReadonlyArray<TradeNameIdeaSuggestion> = [
  {
    id: "corniche-culinary-collective",
    english: "Corniche Culinary Collective",
    arabic: "مجموعة كورنيش للطهي",
  },
  {
    id: "marwah",
    english: "Marwah",
    arabic: "مروة",
  },
  {
    id: "azure-coast-kitchen",
    english: "Azure Coast Kitchen",
    arabic: "مطبخ الساحل اللازوردي",
  },
  {
    id: "pearl-horizon-dining",
    english: "Pearl Horizon Dining",
    arabic: "مطعم أفق اللؤلؤ",
  },
  {
    id: "harbor-lights-supper-club",
    english: "Harbor Lights Supper Club",
    arabic: "نادي عشاء أضواء ��لميناء",
  },
  {
    id: "marina-ember-grill",
    english: "Marina Ember Grill",
    arabic: "مشويات جمرة المرسى",
  },
  {
    id: "gulf-breeze-gastronomy",
    english: "Gulf Breeze Gastronomy",
    arabic: "مذاقات نسيم الخليج",
  },
];

function sampleTradeNameIdeas(
  source: ReadonlyArray<TradeNameIdeaSuggestion>,
): TradeNameIdeaSuggestion[] {
  if (source.length <= MAX_TRADE_NAME_SUGGESTIONS) {
    return [...source];
  }

  const shuffled = [...source];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, MAX_TRADE_NAME_SUGGESTIONS);
}

const APPROVED_TRADE_NAMES = [
  "MARWAH",
  "CORNICHE CULINARY COLLECTIVE",
] as const;

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
  tradeName = "",
  isTradeNameAvailable = false,
  progressPercent = 46,
  onTradeNameChange,
}: BusinessRegistrationFocusContentProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeTradeName, setActiveTradeName] = React.useState(tradeName);
  const [pendingTradeName, setPendingTradeName] = React.useState<string | null>(
    null,
  );
  const [inputValue, setInputValue] = React.useState("");
  const [isChecking, setIsChecking] = React.useState(false);
  const [hasPerformedCheck, setHasPerformedCheck] = React.useState(false);
  const [isNameAvailable, setIsNameAvailable] = React.useState(
    Boolean(tradeName) && isTradeNameAvailable,
  );
  const [automationProgress, setAutomationProgress] = React.useState(() =>
    clampProgress(progressPercent),
  );
  const [hasUserOverride, setHasUserOverride] = React.useState(false);
  const [failedStepIndex, setFailedStepIndex] = React.useState<number | null>(
    Boolean(tradeName) && !isTradeNameAvailable ? DEFAULT_FAILURE_STEP_INDEX : null,
  );
  const [failureReason, setFailureReason] = React.useState<string | null>(null);

  const approvedNameSet = React.useMemo(
    () =>
      new Set(
        APPROVED_TRADE_NAMES.map((name) => name.trim().toUpperCase()),
      ),
    [],
  );

  const availableTradeNameIdeas = React.useMemo(() => {
    const filtered = TRADE_NAME_IDEAS.filter((idea) =>
      approvedNameSet.has(idea.english.trim().toUpperCase()),
    );

    return filtered.length > 0 ? filtered : TRADE_NAME_IDEAS;
  }, [approvedNameSet]);

  const [tradeNameSuggestions, setTradeNameSuggestions] = React.useState<TradeNameIdeaSuggestion[]>([]);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = React.useState(false);
  const continueButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const notifyTradeNameChange = React.useCallback(
    (value: string | null) => {
      onTradeNameChange?.(value);
    },
    [onTradeNameChange],
  );

  const handleGenerateAvailableIdeas = React.useCallback(() => {
    const generated = sampleTradeNameIdeas(availableTradeNameIdeas);
    setTradeNameSuggestions(generated);
    setHasGeneratedSuggestions(true);
  }, [availableTradeNameIdeas]);

  const trimmedInput = inputValue.trim();
  const isSubmitDisabled = isChecking || trimmedInput.length === 0;
  const displayProgress = Math.round(automationProgress);

  React.useEffect(() => {
    if (hasUserOverride) {
      return;
    }

    const normalizedTradeName = tradeName.trim().toUpperCase();

    setActiveTradeName(normalizedTradeName);
    setPendingTradeName(null);
    setIsNameAvailable(false);
    setFailedStepIndex(null);
    setFailureReason(null);
    setAutomationProgress(0);
    setHasPerformedCheck(false);
  }, [hasUserOverride, tradeName, isTradeNameAvailable, progressPercent]);

  React.useEffect(() => {
    setHasUserOverride(false);
    setHasPerformedCheck(false);
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

          const evaluatedName = (pendingTradeName ?? activeTradeName)
            .trim()
            .toUpperCase();
          const isSuccess =
            Boolean(evaluatedName) &&
            APPROVED_TRADE_NAMES.some((name) => name === evaluatedName);

          setIsChecking(false);
          setIsNameAvailable(isSuccess);
          setFailedStepIndex(isSuccess ? null : DEFAULT_FAILURE_STEP_INDEX);
          setFailureReason(
            isSuccess
              ? null
              : evaluatedName
              ? `We couldn’t reserve ${evaluatedName}. Try ${APPROVED_TRADE_NAMES.join(" or ")} or another unique variation.`
              : "Please enter a trade name to run the automated checks.",
          );
          setPendingTradeName(null);
          setHasPerformedCheck(true);
        }

        return next;
      });
    }, 420);

    return () => window.clearInterval(interval);
  }, [isChecking, pendingTradeName, activeTradeName]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isChecking) {
        return;
      }

      if (!trimmedInput) {
        return;
      }

      const normalizedInput = trimmedInput.toUpperCase();

      setActiveTradeName(normalizedInput);
      setPendingTradeName(normalizedInput);
      setAutomationProgress(0);
      setInputValue("");
      setIsChecking(true);
      setIsNameAvailable(false);
      setFailedStepIndex(null);
      setFailureReason(null);
      setHasUserOverride(true);
      setHasPerformedCheck(true);
      notifyTradeNameChange(normalizedInput);
    },
    [isChecking, notifyTradeNameChange, trimmedInput],
  );

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setInputValue(nextValue);
      setHasUserOverride(true);
      notifyTradeNameChange(nextValue.trim() ? nextValue.trim() : null);

      if (!isChecking) {
        setHasPerformedCheck(false);
        setIsNameAvailable(false);
        setFailedStepIndex(null);
        setFailureReason(null);
        setAutomationProgress(0);
      }
    },
    [isChecking, notifyTradeNameChange],
  );

  const focusTradeNameInput = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleIdeaSelect = React.useCallback(
    (idea: string) => {
      setInputValue(idea);
      setHasUserOverride(true);
      setPendingTradeName(null);
      notifyTradeNameChange(idea);

      if (!isChecking) {
        setHasPerformedCheck(false);
        setIsNameAvailable(false);
        setFailedStepIndex(null);
        setFailureReason(null);
        setAutomationProgress(0);
      }

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [isChecking, notifyTradeNameChange],
  );

  const showVerificationSteps = hasPerformedCheck || isChecking;

  const automationSteps = React.useMemo<TradeNameVerificationStepWithStatus[]>(() => {
    const totalSteps = TRADE_NAME_CHECKS.length;

    if (!showVerificationSteps) {
      return TRADE_NAME_CHECKS.map((step) => ({
        ...step,
        status: "pending" as TradeNameCheckStatus,
        progress: 0,
      }));
    }

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
  }, [automationProgress, failedStepIndex, isNameAvailable, showVerificationSteps]);

  const currentAutomationStep = React.useMemo(() => {
    const current = automationSteps.find((step) => step.status === "current");
    return current ?? (automationSteps.length > 0 ? automationSteps[0] : null);
  }, [automationSteps]);

  const hasActiveTradeName = activeTradeName.length > 0;

  const badgeLabel = isChecking
    ? "Checking..."
    : !hasActiveTradeName
    ? "Awaiting name"
    : isNameAvailable
    ? "Available"
    : "Unavailable";

  const availabilityBadgeClasses = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm transition-colors",
    isChecking && "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    !isChecking && !hasActiveTradeName && "border-slate-200 bg-white text-slate-400",
    !isChecking && hasActiveTradeName && isNameAvailable &&
      "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    !isChecking && hasActiveTradeName && !isNameAvailable &&
      "border-rose-200 bg-rose-50 text-rose-600",
  );

  const badgeIcon = isChecking ? (
    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  ) : !hasActiveTradeName ? (
    <span className="h-2 w-2 rounded-full bg-current" />
  ) : isNameAvailable ? (
    <Check className="h-3.5 w-3.5" strokeWidth={3} />
  ) : (
    <X className="h-3.5 w-3.5" strokeWidth={3} />
  );

  const statusDescription = isChecking
    ? "We’re running automated validation before reserving the name."
    : !hasActiveTradeName
    ? "Enter a trade name to begin the automated validation process."
    : isNameAvailable
    ? "The TAMM platform confirms availability. Final approval remains with the Department of Economic Development."
    : "This name matches an existing business record. Try a different variation to continue.";

  const tradeCheckDescription = isChecking
    ? "We’re synchronising with the Department of Economic Development to confirm availability."
    : !hasActiveTradeName
    ? "Start by entering a trade name to run the automated checks."
    : isNameAvailable
    ? "We’re confirming availability and reserving your trade name before moving to licensing."
    : "The checks flagged a conflict with an existing registration, so this name can’t proceed.";

  const statusSummary = isChecking
    ? `Status: running automated checks for ${activeTradeName || "your trade name"}`
    : !hasActiveTradeName
    ? "Status: awaiting trade name submission."
    : isNameAvailable
    ? "Status: verification synced with the Department of Economic Development"
    : `Status: similar name conflict flagged for ${activeTradeName}.`;

  const registrationCta = React.useMemo(() => {
    if (!hasActiveTradeName) {
      return {
        headline: "Submit your trade name",
        description: "Enter a preferred business name so Omnis can validate availability.",
        buttonLabel: "Enter trade name",
        onClick: focusTradeNameInput,
        disabled: isChecking,
      };
    }

    if (isChecking) {
      return {
        headline: "Validation in progress",
        description: "Hold tight while we finish automated checks. You can review the verification steps anytime.",
        buttonLabel: "View verification",
        onClick: () => {
          document.getElementById("registration-verification")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        },
        disabled: false,
      };
    }

    if (!isNameAvailable) {
      return {
        headline: "Try another name",
        description: failureReason ?? "We couldn't reserve the current name. Try a new unique variation.",
        buttonLabel: "Choose new name",
        onClick: focusTradeNameInput,
        disabled: false,
      };
    }

    return {
      headline: "Reserve your approved name",
      description: "Lock in this trade name before moving to licensing.",
      buttonLabel: "Reserve name",
      onClick: () => {
        continueButtonRef.current?.focus();
      },
      disabled: false,
    };
  }, [failureReason, focusTradeNameInput, hasActiveTradeName, isChecking, isNameAvailable]);

  const tradeCheckBadgeLabel = isChecking
    ? "Checking"
    : !hasActiveTradeName
    ? "Awaiting input"
    : isNameAvailable
    ? "In progress"
    : "Action needed";

  const tradeCheckBadgeClasses = cn(
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
    isChecking && "border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f766e]",
    !isChecking && !hasActiveTradeName && "border-slate-200 bg-white text-slate-400",
    !isChecking && hasActiveTradeName && isNameAvailable &&
      "border-white/70 bg-[#0f766e]/10 text-[#0f766e]",
    !isChecking && hasActiveTradeName && !isNameAvailable &&
      "border-rose-200 bg-rose-50 text-rose-600",
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section
        className={chatCardClass(
          "border border-white/25 bg-white/90 p-6 backdrop-blur-2xl shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
        )}
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Journey number
              </p>
              <p className="text-lg font-semibold text-slate-900">{journeyNumber}</p>
            </div>
            <Badge className={availabilityBadgeClasses}>
              {badgeIcon}
              {badgeLabel}
            </Badge>
          </div>

          <div className="space-y-2 rounded-3xl border border-[#0f766e]/25 bg-[#0f766e]/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Current step
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {activeTradeName || "Trade name pending"}
            </h3>
            <p className="text-sm text-slate-700">{statusDescription}</p>
          </div>

          <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_18px_42px_-32px_rgba(15,118,110,0.25)]">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                What happens next
              </p>
              <p className="text-base font-semibold text-slate-900">
                {registrationCta.headline}
              </p>
              <p className="text-sm text-slate-600">{registrationCta.description}</p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={registrationCta.onClick}
              disabled={registrationCta.disabled}
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              {registrationCta.buttonLabel}
            </Button>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-5">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Try another trade name
              </p>
              <p className="text-sm text-slate-600">
                Enter a new option and Omnis will check it automatically.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateAvailableIdeas}
                disabled={isChecking}
                className="rounded-full border-[#0f766e]/40 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-sm transition hover:bg-[#0f766e]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Get name ideas
              </Button>
              {hasGeneratedSuggestions && tradeNameSuggestions.length === 0 ? (
                <span className="text-xs text-slate-500">
                  No approved suggestions yet—try again in a moment.
                </span>
              ) : null}
            </div>
            {tradeNameSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tradeNameSuggestions.slice(0, 4).map((idea) => (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => handleIdeaSelect(idea.english)}
                    className="rounded-full border border-[#0f766e]/40 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-sm transition hover:bg-[#0f766e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isChecking}
                  >
                    {idea.english}
                  </button>
                ))}
              </div>
            )}
            {!isChecking && !isNameAvailable && failureReason ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
                {failureReason}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className={chatCardClass(
          "space-y-5 border border-white/60 bg-white/90 p-6 text-slate-800 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.45)]",
        )}
      >
        <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#0f766e]/20 bg-white shadow-[0_12px_22px_-14px_rgba(15,118,110,0.45)]">
              <AIBusinessOrb className="h-10 w-10" />
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#0f766e] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                AI
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Omnis assistant
              </p>
              <p className="text-base font-semibold text-slate-900">
                Preparing your paperwork
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {tradeCheckDescription}
          </p>
          <div className="space-y-2">
            <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] transition-all duration-500 ease-out"
                style={{ width: `${automationProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Automation progress</span>
              <span>{displayProgress}%</span>
            </div>
            {currentAutomationStep ? (
              <div className="rounded-2xl border border-[#e6f2ed] bg-white/90 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  Currently checking: {currentAutomationStep.title}
                </p>
                <p className="text-sm text-slate-600">
                  {currentAutomationStep.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white p-5">
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
          <p className="text-sm text-slate-600">{statusSummary}</p>
        </div>
      </section>
    </div>
  );
}
