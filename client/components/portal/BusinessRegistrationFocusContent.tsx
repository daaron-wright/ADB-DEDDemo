import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { useToast } from "@/hooks/use-toast";
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
  summary: string;
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
    summary: "Catches disguised characters or leetspeak before approval.",
  },
  {
    title: "Prohibited word checks",
    description:
      "We look for explicit and subtle use of restricted terms across the entire name.",
    summary: "Blocks restricted or sensitive words from the name.",
  },
  {
    title: "Cultural checks",
    description:
      "We flag references with religious, geographic, royal, or political sensitivity.",
    summary: "Confirms the name respects local cultural and religious norms.",
  },
  {
    title: "Similar name checks",
    description:
      "We confirm there are no existing businesses with confusingly similar names.",
    summary: "Prevents duplicates or confusingly similar business names.",
    failureDetail:
      "Matches an existing company chartered as Corniche Culinary Collective Trading.",
  },
  {
    title: "Transliteration check",
    description:
      "We verify that the Arabic and English renditions align and read correctly.",
    summary: "Aligns the English and Arabic spellings so they read the same.",
  },
  {
    title: "Activity name check",
    description:
      "We ensure the English name aligns with your selected business activity.",
    summary: "Checks the name matches your chosen business activity.",
  },
  {
    title: "Suggest names",
    description:
      "We generate alternatives, rerun every check, and surface the results with any failures explained.",
    summary: "Offers compliant alternatives automatically if something is flagged.",
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
    id: "marwah-restaurant-sole-llc",
    english: "Marwah Restaurant Sole LLC",
    arabic: "مطعم مروة الفردي ذ.م.م",
  },
  {
    id: "marwah-hospitality-sole-llc",
    english: "Marwah Hospitality Sole LLC",
    arabic: "ضيافة مروة الفردية ذ.م.م",
  },
  {
    id: "azure-coast-kitchen-sole-llc",
    english: "Azure Coast Kitchen Sole LLC",
    arabic: "مطبخ السا��ل اللازوردي الفردي ذ.م.م",
  },
  {
    id: "pearl-horizon-dining-sole-llc",
    english: "Pearl Horizon Dining Sole LLC",
    arabic: "مطعم أفق اللؤلؤ الفردي ذ.م.م",
  },
  {
    id: "harbor-lights-supper-club-sole-llc",
    english: "Harbor Lights Supper Club Sole LLC",
    arabic: "نادي عشاء أضواء الميناء الفردي ذ.م.م",
  },
  {
    id: "corniche-culinary-collective-sole-llc",
    english: "Corniche Culinary Collective Sole LLC",
    arabic: "مجموعة كورنيش للطهي الفردي ذ.م.م",
  },
  {
    id: "gulf-breeze-gastronomy-sole-llc",
    english: "Gulf Breeze Gastronomy Sole LLC",
    arabic: "مذاقات نسيم الخليج الفردي ذ.م.م",
  },
];

const APPROVED_TRADE_NAMES = [
  "MARWAH RESTAURANT SOLE LLC",
  "MARWAH HOSPITALITY SOLE LLC",
  "CORNICHE CULINARY COLLECTIVE SOLE LLC",
  "PEARL HORIZON DINING SOLE LLC",
] as const;

const UPPERCASE_EXCEPTIONS = new Set([
  "LLC",
  "L.L.C.",
  "LLP",
  "PJSC",
  "FZ-LLC",
  "FZCO",
  "SPC",
]);

const DOUBLE_CHAR_MAP = new Map<string, string>([
  ["aa", "ا"],
  ["ae", "اي"],
  ["ai", "اي"],
  ["ay", "اي"],
  ["ch", "تش"],
  ["dh", "ذ"],
  ["gh", "غ"],
  ["kh", "خ"],
  ["ph", "ف"],
  ["qu", "قو"],
  ["sh", "ش"],
  ["th", "ث"],
  ["wh", "و"],
  ["oo", "و"],
  ["ee", "ي"],
  ["ou", "و"],
  ["ia", "يا"],
]);

const SINGLE_CHAR_MAP = new Map<string, string>([
  ["a", "ا"],
  ["b", "ب"],
  ["c", "ك"],
  ["d", "د"],
  ["e", "ي"],
  ["f", "ف"],
  ["g", "ج"],
  ["h", "ه"],
  ["i", "ي"],
  ["j", "ج"],
  ["k", "ك"],
  ["l", "ل"],
  ["m", "م"],
  ["n", "ن"],
  ["o", "و"],
  ["p", "ب"],
  ["q", "ق"],
  ["r", "ر"],
  ["s", "س"],
  ["t", "ت"],
  ["u", "و"],
  ["v", "ف"],
  ["w", "و"],
  ["x", "كس"],
  ["y", "ي"],
  ["z", "ز"],
]);

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

function normalizeUppercaseWord(word: string) {
  return word.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function formatTradeName(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .split(/\s+/)
    .map((word) => {
      const normalized = normalizeUppercaseWord(word);
      if (normalized && UPPERCASE_EXCEPTIONS.has(normalized)) {
        return normalized;
      }

      if (word.length === 0) {
        return word;
      }

      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function formatArabicName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function transliterateToArabic(input: string) {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return "";
  }

  let result = "";
  let index = 0;

  while (index < trimmed.length) {
    const pair = trimmed.slice(index, index + 2);
    if (DOUBLE_CHAR_MAP.has(pair)) {
      result += DOUBLE_CHAR_MAP.get(pair);
      index += 2;
      continue;
    }

    const char = trimmed[index];
    if (SINGLE_CHAR_MAP.has(char)) {
      result += SINGLE_CHAR_MAP.get(char);
    } else {
      result += char;
    }
    index += 1;
  }

  return result.replace(/\s+/g, " ").trim();
}

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

function VerificationStepItem({
  step,
  index,
  totalSteps,
  value,
}: {
  step: TradeNameVerificationStepWithStatus;
  index: number;
  totalSteps: number;
  value: string;
}) {
  const isFailed = step.status === "failed";
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";

  const statusLabel = isFailed
    ? "Needs attention"
    : isCompleted
    ? "Passed"
    : isCurrent
    ? "Checking now"
    : "Upcoming";

  const indicatorClasses = cn(
    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold",
    isFailed && "border-rose-200 bg-rose-50 text-rose-600",
    isCompleted && "border-emerald-200 bg-emerald-50 text-emerald-700",
    isCurrent && "border-[#0f766e]/50 bg-[#0f766e]/10 text-[#0f766e]",
    step.status === "pending" && "border-slate-200 bg-white text-slate-400",
  );

  const statusBadgeClasses = cn(
    "rounded-full border px-3 py-1 text-xs font-semibold",
    isFailed && "border-rose-200 bg-rose-50 text-rose-600",
    isCompleted && "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    isCurrent && "border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f766e]",
    step.status === "pending" && "border-slate-200 bg-white text-slate-400",
  );

  const progressPercent = Math.round(step.progress * 100);
  const barFillWidth =
    isCompleted || isFailed
      ? "100%"
      : isCurrent
      ? `${Math.max(progressPercent, 12)}%`
      : progressPercent > 0
      ? `${Math.max(progressPercent, 6)}%`
      : "0%";

  const helperMessage = isFailed
    ? step.failureDetail ?? "This step needs a different trade name before you can continue."
    : isCompleted
    ? "This check passed successfully."
    : isCurrent
    ? "We’re processing this check right now."
    : "This check will run automatically once the previous ones finish.";

  return (
    <AccordionItem value={value} className="border-none">
      <AccordionTrigger className="group gap-4 rounded-2xl border border-[#e6f2ed] bg-white/90 px-4 py-4 text-left hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30 data-[state=open]:border-[#0f766e]/40">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex w-full items-center gap-3">
            <span className={indicatorClasses} aria-hidden>
              {isFailed ? (
                <X className="h-4 w-4" strokeWidth={3} />
              ) : isCompleted ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : isCurrent ? (
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-current/60" />
              )}
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {`Step ${index + 1}/${totalSteps}: ${step.title}`}
                </p>
                <span className={statusBadgeClasses}>{statusLabel}</span>
              </div>
              <p className="text-xs text-slate-500">{step.summary}</p>
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#eef5f2]">
            <span
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                isFailed ? "bg-rose-500" : "bg-[#0f766e]",
                isCurrent && "animate-pulse",
              )}
              style={{ width: barFillWidth }}
            />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <div className="space-y-3 rounded-2xl border border-dashed border-[#e6f2ed] bg-white px-4 py-3 text-sm text-slate-600">
          <p>{step.description}</p>
          <div className="rounded-xl bg-[#0f766e]/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            {helperMessage}
          </div>
          {isFailed && step.failureDetail ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700">
              {step.failureDetail}
            </div>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function BusinessRegistrationFocusContent({
  journeyNumber = "0987654321",
  tradeName = "",
  isTradeNameAvailable = false,
  progressPercent = 46,
  onTradeNameChange,
}: BusinessRegistrationFocusContentProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [englishInputValue, setEnglishInputValue] = React.useState(() =>
    formatTradeName(tradeName),
  );
  const [arabicInputValue, setArabicInputValue] = React.useState("");
  const [activeEnglishTradeName, setActiveEnglishTradeName] = React.useState(() =>
    formatTradeName(tradeName),
  );
  const [activeArabicTradeName, setActiveArabicTradeName] = React.useState("");
  const [pendingSubmission, setPendingSubmission] = React.useState<
    | {
        english: string;
        arabic: string;
        normalized: string;
      }
    | null
  >(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [hasPerformedCheck, setHasPerformedCheck] = React.useState(false);
  const [isNameAvailable, setIsNameAvailable] = React.useState(
    Boolean(tradeName) && isTradeNameAvailable,
  );
  const [automationProgress, setAutomationProgress] = React.useState(() =>
    clampProgress(progressPercent),
  );
  const [failedStepIndex, setFailedStepIndex] = React.useState<number | null>(
    Boolean(tradeName) && !isTradeNameAvailable ? DEFAULT_FAILURE_STEP_INDEX : null,
  );
  const [failureReason, setFailureReason] = React.useState<string | null>(null);
  const [hasUserOverride, setHasUserOverride] = React.useState(false);
  const [hasInitiatedPayment, setHasInitiatedPayment] = React.useState(false);

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

  const [tradeNameSuggestions, setTradeNameSuggestions] = React.useState<
    TradeNameIdeaSuggestion[]
  >([]);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = React.useState(false);

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
    setHasUserOverride(true);
    setHasInitiatedPayment(false);
  }, [availableTradeNameIdeas]);

  const trimmedEnglishInput = englishInputValue.trim();
  const trimmedArabicInput = arabicInputValue.trim();
  const isSubmitDisabled =
    isChecking ||
    trimmedEnglishInput.length === 0 ||
    trimmedArabicInput.length === 0;
  const displayProgress = Math.round(automationProgress);

  React.useEffect(() => {
    if (hasUserOverride) {
      return;
    }

    const formatted = formatTradeName(tradeName);
    setActiveEnglishTradeName(formatted);
    setEnglishInputValue(formatted);
    setActiveArabicTradeName("");
    setArabicInputValue("");
    setPendingSubmission(null);
    setIsNameAvailable(Boolean(tradeName) && isTradeNameAvailable);
    setFailedStepIndex(
      Boolean(tradeName) && !isTradeNameAvailable ? DEFAULT_FAILURE_STEP_INDEX : null,
    );
    setFailureReason(null);
    setAutomationProgress(clampProgress(progressPercent));
    setHasPerformedCheck(Boolean(tradeName));
    setHasInitiatedPayment(false);
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
        const next = Math.min(previous + 14, 100);

        if (next >= 100) {
          window.clearInterval(interval);

          const evaluationSource = pendingSubmission ??
            (activeEnglishTradeName
              ? {
                  english: activeEnglishTradeName,
                  arabic: activeArabicTradeName,
                  normalized: activeEnglishTradeName.trim().toUpperCase(),
                }
              : null);

          const normalizedName = evaluationSource?.normalized ?? "";
          const englishDisplay = evaluationSource?.english ?? trimmedEnglishInput ?? "";
          const arabicDisplay = evaluationSource?.arabic ?? trimmedArabicInput ?? "";
          const isSuccess =
            Boolean(normalizedName) && approvedNameSet.has(normalizedName);

          setIsChecking(false);
          setIsNameAvailable(isSuccess);
          setFailedStepIndex(isSuccess ? null : DEFAULT_FAILURE_STEP_INDEX);
          setFailureReason(
            isSuccess
              ? null
              : normalizedName
              ? `We couldn’t reserve ${englishDisplay}. Try Marwah Restaurant Sole LLC, Marwah Hospitality Sole LLC, or another unique variation aligned to your activity.`
              : "Please enter English and Arabic names to run the automated checks.",
          );
          setPendingSubmission(null);
          setHasPerformedCheck(true);
          setActiveEnglishTradeName(englishDisplay);
          setActiveArabicTradeName(arabicDisplay);
          setHasInitiatedPayment(false);
        }

        return next;
      });
    }, 420);

    return () => window.clearInterval(interval);
  }, [
    isChecking,
    pendingSubmission,
    activeEnglishTradeName,
    activeArabicTradeName,
    trimmedEnglishInput,
    trimmedArabicInput,
    approvedNameSet,
  ]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isChecking) {
        return;
      }

      if (!trimmedEnglishInput || !trimmedArabicInput) {
        toast({
          title: "Add both names",
          description: "Enter the English and Arabic trade names before running the checks.",
          variant: "destructive",
        });
        return;
      }

      const formattedEnglish = formatTradeName(trimmedEnglishInput);
      const formattedArabic = formatArabicName(trimmedArabicInput);
      const normalizedEnglish = formattedEnglish.toUpperCase();

      setActiveEnglishTradeName(formattedEnglish);
      setActiveArabicTradeName(formattedArabic);
      setPendingSubmission({
        english: formattedEnglish,
        arabic: formattedArabic,
        normalized: normalizedEnglish,
      });
      setAutomationProgress(0);
      setIsChecking(true);
      setIsNameAvailable(false);
      setFailedStepIndex(null);
      setFailureReason(null);
      setHasUserOverride(true);
      setHasPerformedCheck(true);
      setHasInitiatedPayment(false);
      notifyTradeNameChange(formattedEnglish);
    },
    [
      isChecking,
      trimmedEnglishInput,
      trimmedArabicInput,
      toast,
      notifyTradeNameChange,
    ],
  );

  const handleEnglishInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setEnglishInputValue(nextValue);
      setHasUserOverride(true);
      setHasPerformedCheck(false);
      setIsNameAvailable(false);
      setFailedStepIndex(null);
      setFailureReason(null);
      setAutomationProgress(0);
      setHasInitiatedPayment(false);
      notifyTradeNameChange(nextValue.trim() ? formatTradeName(nextValue) : null);
    },
    [notifyTradeNameChange],
  );

  const handleArabicInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setArabicInputValue(nextValue);
      setHasUserOverride(true);
      setHasPerformedCheck(false);
      setIsNameAvailable(false);
      setFailedStepIndex(null);
      setFailureReason(null);
      setAutomationProgress(0);
      setHasInitiatedPayment(false);
    },
    [],
  );

  const focusTradeNameInput = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleIdeaSelect = React.useCallback(
    (idea: TradeNameIdeaSuggestion) => {
      setEnglishInputValue(idea.english);
      setArabicInputValue(idea.arabic);
      setHasUserOverride(true);
      setPendingSubmission(null);
      setHasPerformedCheck(false);
      setIsNameAvailable(false);
      setFailedStepIndex(null);
      setFailureReason(null);
      setAutomationProgress(0);
      setHasInitiatedPayment(false);
      notifyTradeNameChange(idea.english);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [notifyTradeNameChange],
  );

  const handleTransliterate = React.useCallback(() => {
    if (!trimmedEnglishInput) {
      toast({
        title: "Enter an English name",
        description: "Add the English trade name first so we can transliterate it for you.",
      });
      return;
    }

    const transliterated = transliterateToArabic(trimmedEnglishInput);
    setArabicInputValue(transliterated);
    setHasUserOverride(true);
    setHasPerformedCheck(false);
    setIsNameAvailable(false);
    setFailedStepIndex(null);
    setFailureReason(null);
    setAutomationProgress(0);
    setHasInitiatedPayment(false);
  }, [toast, trimmedEnglishInput]);

  const handleInitiatePayment = React.useCallback(() => {
    if (!isNameAvailable) {
      focusTradeNameInput();
      return;
    }

    setHasInitiatedPayment(true);
    toast({
      title: "AD Pay checkout started",
      description: `We opened AD Pay so you can reserve ${activeEnglishTradeName}. Complete the payment to lock the name before licensing.`,
    });
  }, [toast, isNameAvailable, activeEnglishTradeName, focusTradeNameInput]);

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

  const totalVerificationSteps = automationSteps.length;
  const completedVerificationSteps = automationSteps.filter(
    (step) => step.status === "completed",
  ).length;
  const flaggedVerificationStep =
    automationSteps.find((step) => step.status === "failed") ?? null;
  const nowCheckingStep = isChecking
    ? automationSteps.find((step) => step.status === "current") ?? null
    : null;

  const flaggedStepIndexValue = flaggedVerificationStep
    ? automationSteps.findIndex((step) => step === flaggedVerificationStep)
    : -1;
  const checkingStepIndexValue = nowCheckingStep
    ? automationSteps.findIndex((step) => step === nowCheckingStep)
    : -1;

  const accordionDefaultValues = React.useMemo(() => {
    const defaults: string[] = [];
    if (flaggedStepIndexValue >= 0) {
      defaults.push(`step-${flaggedStepIndexValue}`);
    } else if (checkingStepIndexValue >= 0) {
      defaults.push(`step-${checkingStepIndexValue}`);
    }
    return defaults;
  }, [flaggedStepIndexValue, checkingStepIndexValue]);

  const accordionKey = React.useMemo(
    () =>
      `${flaggedStepIndexValue}-${checkingStepIndexValue}-${isChecking ? "checking" : "idle"}`,
    [flaggedStepIndexValue, checkingStepIndexValue, isChecking],
  );

  const hasActiveTradeName = activeEnglishTradeName.length > 0;

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
    ? "Trade Name Engine is reviewing your English and Arabic names against all automated checks."
    : !hasActiveTradeName
    ? "Enter the English and Arabic trade names to begin the validation process."
    : isNameAvailable
    ? "The Trade Name Engine cleared this name. Use AD Pay now to reserve it before moving into licensing."
    : "This name conflicts with an existing business record. Try a different variation to continue.";

  const tradeCheckDescription = isChecking
    ? "We’re synchronising with the Department of Economic Development through the Trade Name Engine."
    : !hasActiveTradeName
    ? "Start by entering English and Arabic trade names. We’ll run the automated checks once you submit."
    : isNameAvailable
    ? "All checks passed. Reserve the name now via AD Pay so it’s held for your application."
    : "The Trade Name Engine flagged a conflict, so this name can’t be reserved.";

  const statusSummary = isChecking
    ? `Status: running automated checks for ${activeEnglishTradeName || "your trade name"}`
    : !hasActiveTradeName
    ? "Status: awaiting trade name submission."
    : isNameAvailable
    ? "Result: Passed • Trade Name Engine confirms availability. Reserve with AD Pay."
    : `Result: Failed • Similar name conflict flagged for ${activeEnglishTradeName}.`;

  const registrationCta = React.useMemo(() => {
    if (!hasActiveTradeName) {
      return {
        headline: "Submit your trade names",
        description:
          "Enter your preferred English name with its Arabic equivalent so Omnis can validate availability.",
        buttonLabel: "Enter trade names",
        onClick: focusTradeNameInput,
        disabled: isChecking,
      };
    }

    if (isChecking) {
      return {
        headline: "Validation in progress",
        description:
          "Hold tight while we finish automated checks. You can review the verification steps anytime.",
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
        description:
          failureReason ?? "We couldn’t reserve the current name. Try a new unique variation.",
        buttonLabel: "Choose new name",
        onClick: focusTradeNameInput,
        disabled: false,
      };
    }

    if (hasInitiatedPayment) {
      return {
        headline: "Payment in progress",
        description:
          "AD Pay opened in a new tab. Complete the reservation payment to lock your trade name.",
        buttonLabel: "Payment complete with AD Pay",
        onClick: () => undefined,
        disabled: true,
      };
    }

    return {
      headline: "Reserve your approved name",
      description:
        "Pay the reservation fee now so the name stays exclusive to your application before licensing.",
      buttonLabel: "Pay with AD Pay",
      onClick: handleInitiatePayment,
      disabled: false,
    };
  }, [
    failureReason,
    focusTradeNameInput,
    handleInitiatePayment,
    hasActiveTradeName,
    hasInitiatedPayment,
    isChecking,
    isNameAvailable,
  ]);

  const tradeCheckBadgeLabel = isChecking
    ? "Checking"
    : !hasActiveTradeName
    ? "Awaiting input"
    : isNameAvailable
    ? hasInitiatedPayment
      ? "Payment complete with AD Pay"
      : "Ready to pay"
    : "Action needed";

  const tradeCheckBadgeClasses = cn(
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
    isChecking && "border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f766e]",
    !isChecking && !hasActiveTradeName && "border-slate-200 bg-white text-slate-400",
    !isChecking && hasActiveTradeName && isNameAvailable &&
      !hasInitiatedPayment && "border-white/70 bg-[#0f766e]/10 text-[#0f766e]",
    !isChecking && hasActiveTradeName && isNameAvailable && hasInitiatedPayment &&
      "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
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

          <div className="space-y-3 rounded-3xl border border-[#0f766e]/25 bg-[#0f766e]/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Current step
            </p>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-slate-900">
                {activeEnglishTradeName || "Trade name pending"}
              </h3>
              {activeArabicTradeName ? (
                <p className="text-base font-semibold text-[#0f766e]" dir="rtl">
                  {activeArabicTradeName}
                </p>
              ) : null}
            </div>
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
                Submit your trade names
              </p>
              <p className="text-sm text-slate-600">
                Enter the English name in the required format (e.g. “Marwah Restaurant Sole LLC”),
                then mirror it in Arabic. Use transliteration if you need help with the Arabic spelling.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  English trade name
                </label>
                <Input
                  ref={inputRef}
                  value={englishInputValue}
                  onChange={handleEnglishInputChange}
                  placeholder="Marwah Restaurant Sole LLC"
                  disabled={isChecking}
                  className="h-11 rounded-full border-slate-200 bg-white px-4 text-sm tracking-wide text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Arabic trade name
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTransliterate}
                    disabled={isChecking}
                    className="rounded-full border-[#0f766e]/40 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-sm transition hover:bg-[#0f766e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Transliterate
                  </Button>
                </div>
                <Input
                  value={arabicInputValue}
                  onChange={handleArabicInputChange}
                  placeholder="مطعم مروة الفردي ذ.م.م"
                  disabled={isChecking}
                  dir="rtl"
                  className="h-11 rounded-full border-slate-200 bg-white px-4 text-sm tracking-wide text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-[#0f766e] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_-18px_rgba(15,118,110,0.45)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitDisabled}
              >
                Run automated checks
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
                Get name recommendations
              </Button>
              {hasGeneratedSuggestions && tradeNameSuggestions.length === 0 ? (
                <span className="text-xs text-slate-500">
                  No approved suggestions yet��try again in a moment.
                </span>
              ) : null}
            </div>
            {tradeNameSuggestions.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {tradeNameSuggestions.slice(0, 4).map((idea) => (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => handleIdeaSelect(idea)}
                    className="rounded-2xl border border-[#0f766e]/40 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-sm transition hover:bg-[#0f766e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isChecking}
                  >
                    <span className="block text-[12px] text-slate-900">{idea.english}</span>
                    <span className="block text-[12px] text-[#0f766e]" dir="rtl">
                      {idea.arabic}
                    </span>
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
            {isChecking && nowCheckingStep ? (
              <div className="rounded-2xl border border-[#e6f2ed] bg-white/90 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  Checking now: {nowCheckingStep.title}
                </p>
                <p className="text-sm text-slate-600">
                  {nowCheckingStep.description}
                </p>
              </div>
            ) : flaggedVerificationStep ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
                <p className="font-semibold text-rose-700">
                  Flagged: {flaggedVerificationStep.title}
                </p>
                <p className="text-sm text-rose-600">
                  {flaggedVerificationStep.failureDetail ?? flaggedVerificationStep.description}
                </p>
              </div>
            ) : hasPerformedCheck && isNameAvailable ? (
              <div className="rounded-2xl border border-[#94d2c2] bg-[#dff2ec] px-4 py-3 text-sm text-[#0b7d6f]">
                All checks passed. Reserve the name with AD Pay to lock it in.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Trade name engine
              </p>
              <p className="text-base font-semibold text-slate-900">
                Connected to Department of Economic Development
              </p>
            </div>
            <Badge className={tradeCheckBadgeClasses}>{tradeCheckBadgeLabel}</Badge>
          </div>
          <p className="text-sm text-slate-600">{statusSummary}</p>
          {isNameAvailable ? (
            <div className="rounded-2xl border border-[#0f766e]/30 bg-[#0f766e]/5 p-4 text-sm text-[#0f766e]">
              Reservation fee: AED 620 • Pay through AD Pay to secure the name for 90 days.
            </div>
          ) : null}
        </div>

        <div
          id="registration-verification"
          className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                Verification steps
              </p>
              <p className="text-sm text-slate-600">
                Trade Name Engine runs {totalVerificationSteps} checks to confirm your name.
              </p>
            </div>
            {showVerificationSteps ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-xs font-semibold text-[#0b7d6f]">
                  {completedVerificationSteps}/{totalVerificationSteps} passed
                </span>
                {flaggedVerificationStep ? (
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                    Needs attention
                  </span>
                ) : null}
                {nowCheckingStep ? (
                  <span className="max-w-[220px] truncate rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 px-3 py-1 text-xs font-semibold text-[#0f766e]">
                    Checking: {nowCheckingStep.title}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          {showVerificationSteps ? (
            <Accordion
              type="multiple"
              key={accordionKey}
              defaultValue={accordionDefaultValues}
              className="space-y-3"
            >
              {automationSteps.map((step, index) => (
                <VerificationStepItem
                  key={step.title}
                  step={step}
                  index={index}
                  totalSteps={automationSteps.length}
                  value={`step-${index}`}
                />
              ))}
            </Accordion>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-500">
              Run the automated checks to view how each Trade Name Engine step progresses in real time.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
