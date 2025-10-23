import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { StageSlideNavigator, type StageSlide } from "./StageSlideNavigator";
import { useDocumentVault } from "./DocumentVaultContext";
import type { DocumentVaultItem } from "./document-vault-types";
import {
  PRIMARY_TRADE_NAME_EN,
  PRIMARY_TRADE_NAME_AR,
  MARWA_TRADE_NAME_EN,
  MARWA_TRADE_NAME_AR,
  TRADE_NAME_RECEIPT_DOCUMENT_ID,
  TRADE_NAME_RECEIPT_METADATA,
  TRADE_NAME_RECEIPT_IMAGE_URL,
} from "./trade-name-constants";
import { Check, X } from "lucide-react";

interface BusinessRegistrationFocusContentProps {
  journeyNumber?: string;
  tradeName?: string;
  isTradeNameAvailable?: boolean;
  progressPercent?: number;
  onTradeNameChange?: (tradeName: string | null) => void;
  onTradeNameSelected?: () => void;
  onTradeNameReservationSubmitted?: () => void;
  payAndIssueLabel?: string;
  payAndIssueToast?: string;
}

type TradeNameCheckStatus = "completed" | "current" | "pending" | "failed";

type LocalizedAgentNarrative = {
  en: string;
  ar: string;
};

type TradeNameVerificationStep = {
  title: string;
  description: string;
  summary: string;
  failureDetail?: string | LocalizedAgentNarrative;
  successDetail?: string | LocalizedAgentNarrative;
};

type ActivityOption = {
  id: string;
  label: string;
};

type TradeNameVerificationStepWithStatus = TradeNameVerificationStep & {
  status: TradeNameCheckStatus;
  progress: number;
};

const TRADE_NAME_CHECKS: ReadonlyArray<TradeNameVerificationStep> = [
  {
    title: "Text normalizer / spell checker / cultural checker",
    description:
      "Normalizes characters, corrects spelling, and screens for cultural or linguistic sensitivities in one pass.",
    summary:
      "Cleans the name and applies cultural guardrails before deeper analysis.",
  },
  {
    title: "Prohibited words agent",
    description:
      "Scans for explicit, implicit, or obfuscated restricted terms across the full trade name.",
    summary: "Blocks restricted or sensitive words from the name.",
  },
  {
    title: "Similarity agent",
    description:
      "Compares the proposed name against the full registry to prevent confusingly similar matches.",
    summary: "Prevents duplicates or confusingly similar business names.",
    failureDetail: {
      en: [
        "Agent responses (English):",
        "• Text normalizer / spell checker / cultural checker → Pass. Normalized name \"Marwa Restaurant\" is compliant.",
        "• Prohibited words agent → Pass. No restricted vocabulary detected across English and Arabic drafts.",
        "• Similarity agent → Fail. Matched existing trade name \"Marwa Restaurant\" with similarity score 0.81 (SIMILARITY_CONFLICT).",
        "• Transliteration agent → Pending. Awaiting Arabic submission to complete transliteration review.",
        "• Activity compatibility agent → Pass. Name aligns with licensed activity: Food & Beverage Restaurant.",
        "• Final decision engine → Reject. Decision recorded 2025-09-22T09:32Z, reference 452-889-552-2947.",
        "• Name suggester agent (rejected trade name) → Suggested alternatives: \"Marwa Culinary House\" and \"Marwa Coastal Kitchen\".",
      ].join("\n"),
      ar: [
        "استجابات الوكلاء (العربية):",
        "• مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. الاسم المعياري \"Marwa Restaurant\" متوافق.",
        "• وكيل الكلمات المحظورة → ناجح. لم يتم العثور على أي مفردات محظورة في النسختين العربية والإنجليزية.",
        "• وكيل التشابه → فشل. تم العثور على سجل مسجل \"Marwa Restaurant\" بنسبة تشابه 0.81 (SIMILARITY_CONFLICT).",
        "• وكيل التحويل الصوتي → قيد الانتظار. بانتظار إدخال النسخة العربية لاستكمال الفحص.",
        "• وكيل توافق الن��اط → ناجح. الاسم يتوافق مع النشاط المرخّص: مطعم ومشروبات.",
        "• محرك القرار النهائي → مرفوض. تم تسجيل القرار بتاريخ 22-09-2025 الساعة 09:32 بالمرجع 452-889-552-2947.",
        "• وكيل اقتراح الاسم (الاسم المرفوض) → اقترح البدائل: \"Marwa Culinary House\" و\"Marwa Coastal Kitchen\".",
      ].join("\n"),
    },
  },
  {
    title: "Transliteration agent",
    description:
      "Verifies Arabic and English spellings align phonetically and visually.",
    summary: "Keeps translations synchronized across both languages.",
  },
  {
    title: "Activity compatibility agent",
    description:
      "Checks the proposed name against your selected activity list to ensure compliance.",
    summary: "Confirms the name fits the licensed activity scope.",
    failureDetail: {
      en: [
        "Agent responses (English):",
        "• Text normalizer / spell checker / cultural checker → Pass. Normalized \"Bait El Khetyar\" without cultural conflicts.",
        "• Prohibited words agent → Pass. No prohibited lexicon detected in English or Arabic drafts.",
        "• Similarity agent → Pass. Nearest registry match similarity score 0.28 (below threshold).",
        "• Transliteration agent → Pass. Arabic transliteration \"بيت الختيار\" verified against phonetic rules.",
        "• Activity compatibility agent → Fail. Proposed name signals a heritage retail concept, not the F&B restaurant activity currently selected.",
        "• Final decision engine → Pending manual review. Escalation recommended or choose an aligned activity.",
        "• Name suggester agent (rejected trade name) → Suggested alternatives: \"Bait El Khetyar Restaurant\", \"Khetyar Dining House\".",
      ].join("\n"),
      ar: [
        "استجابات الوكلاء (العربية):",
        "• مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. تم توحيد \"بيت الختيار\" دون تعارضات ثقافية.",
        "• وكيل الكلمات المحظورة → ناجح. لم يتم العثور على مفردات محظورة في النسخ الإنجليزية أو العربية.",
        "• وكيل التشابه → ناجح. أقرب تشابه مسجل بنسبة 0.28 (أقل من الحد المطل��ب).",
        "• وكيل التحويل الصوتي → ناجح. تم التحقق من التحويل \"بيت الختيار\" وفق القواعد الصوتية.",
        "• وكيل توافق النشاط → فشل. الاسم يشير إلى مفهوم تراثي للبيع بالتجزئة وليس نشاط مطعم ومشروبات الحالي.",
        "• محرك القرار النهائي → قيد الانتظار للمراجعة اليدوية. يُنصح بالتصعيد أو اختيار نشاط متوافق.",
        "• وكيل اقتراح الاسم (الاسم المرفوض) → اقترح البدائل: \"Bait El Khetyar Restaurant\" و\"Khetyar Dining House\".",
      ].join("\n"),
    },
  },
  {
    title: "Final decision engine",
    description:
      "Aggregates every agent output, surfaces blockers, and records the approval decision trail.",
    summary: "Combines all agent signals into a single go / no-go result.",
    successDetail: {
      en: [
        "Agent responses (English):",
        "• Text normalizer / spell checker / cultural checker → Passed. Normalized \"Marwa Restaurant\" and confirmed cultural compliance.",
        "• Prohibited words agent → Passed. No restricted terms detected across English and Arabic drafts.",
        "• Similarity agent → Passed. Nearest registry match scored 0.12, below the 0.75 conflict threshold.",
        "• Transliteration agent → Passed. Arabic transliteration \"مطعم مروة\" validated against phonetic rules.",
        "• Activity compatibility agent → Passed. Name aligns with the licensed Food & Beverage restaurant activity.",
        "• Final decision engine → Approved 2025-09-22T09:32Z (confidence: high, score: 0.98).",
        "• Name suggester agent (rejected trade name) → No alternatives required; current name authorized.",
      ].join("\n"),
      ar: [
        "استجابات الوكلاء (العربية):",
        "• مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. تم توحيد \"Marwa Restaurant\" والتأكد من الملاءمة الثقافية.",
        "• وكيل الكلمات المحظورة → ناجح. لم يتم العثور على مصطلحات محظورة في النسختين العربية والإنجليزية.",
        "• وكيل التشابه → ناجح. أقرب تشابه في السجل بلغ 0.12 وهو أقل من حد التعارض 0.75.",
        "• وكيل التحويل الصوتي → ناجح. تم�� المصادقة على التحويل \"مطعم مروة\" وفق القواعد الصوتية.",
        "• وكيل توافق النشاط → ناجح. الاسم يتوافق مع نشاط المطعم المرخّص.",
        "• محرك القرار النهائي → معتمد بتاريخ 22-09-2025 الساعة 09:32 (درجة الثقة: عالية، النتيجة: 0.98).",
        "• وكيل اقتراح الاسم (الاسم المرفوض) → لا حاجة لبدائل؛ الاسم الحالي معتمد.",
      ].join("\n"),
    },
  },
  {
    title: "Name suggester agent (rejected trade name)",
    description:
      "Generates compliant alternatives, reruns the full agent pipeline, and highlights the best option to pursue next.",
    summary:
      "Keeps the journey moving with agent-reviewed fallback names.",
  },
];

const DEFAULT_FAILURE_STEP_INDEX = (() => {
  const index = TRADE_NAME_CHECKS.findIndex(
    (step) => step.title === "Similarity agent",
  );
  return index === -1 ? 3 : index;
})();

const ACTIVITY_FAILURE_STEP_INDEX = (() => {
  const index = TRADE_NAME_CHECKS.findIndex(
    (step) => step.title === "Activity compatibility agent",
  );
  return index === -1 ? DEFAULT_FAILURE_STEP_INDEX : index;
})();

const ACTIVITY_COMPATIBILITY_OPTIONS: ActivityOption[] = [
  { id: "fnb-restaurant", label: "Food & Beverage Restaurant" },
  { id: "heritage-retail", label: "Heritage Retail Concept" },
  { id: "culinary-studio", label: "Culinary Studio & Classes" },
  { id: "catering", label: "Catering & Events" },
];

const ACTIVITY_COMPATIBILITY_NAME = "BAIT EL KHETYAR";

const CONFLICTING_TRADE_NAME_NORMALIZED =
  PRIMARY_TRADE_NAME_EN.trim().toUpperCase();

type TradeNameSuggestion = {
  id: string;
  english: string;
  availability: "available" | "needs_review" | "not_recommended";
};

const SUGGESTION_AVAILABILITY_META: Record<
  TradeNameSuggestion["availability"],
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
  },
  needs_review: {
    label: "Needs review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  not_recommended: {
    label: "Not recommended",
    className: "border-rose-200 bg-rose-50 text-rose-600",
  },
};

const APPROVED_TRADE_NAMES = [
  MARWA_TRADE_NAME_EN.toUpperCase(),
  "MARWAH HOSPITALITY SOLE LLC",
  "CORNICHE CULINARY COLLECTIVE SOLE LLC",
  "PEARL HORIZON DINING SOLE LLC",
  "HORIZON COURTYARD DINING SOLE LLC",
] as const;

const TRADE_NAME_SUGGESTIONS: ReadonlyArray<TradeNameSuggestion> = [
  {
    id: "marwa-restaurant",
    english: MARWA_TRADE_NAME_EN,
    availability: "available",
  },
  {
    id: "azure-coast",
    english: "Azure Coast Kitchen Sole LLC",
    availability: "needs_review",
  },
  {
    id: "pearl-horizon",
    english: "Pearl Horizon Dining Sole LLC",
    availability: "needs_review",
  },
];

const TRADE_NAME_PAYMENT_DISPLAY_AMOUNT = "65 AED";

function createTradeNameReceiptDocument(): DocumentVaultItem {
  const {
    receiptNumber,
    transactionNumber,
    paymentDate,
    paymentAmountAed,
    paymentMethod,
    authority,
  } = TRADE_NAME_RECEIPT_METADATA;

  return {
    id: TRADE_NAME_RECEIPT_DOCUMENT_ID,
    title: "Trade Name Reservation Receipt",
    description: `Receipt for ${MARWA_TRADE_NAME_EN} confirming reservation ${transactionNumber} with AED ${paymentAmountAed} processed on ${paymentDate}. ${authority} may amend the trade name if reservation conditions are not met.`,
    source: authority,
    sourceDetail: `Receipt ${receiptNumber} · ${transactionNumber}`,
    status: "completed",
    actionLabel: "Download trade name receipt",
    integrationBadge: paymentMethod,
    isExpanded: true,
    previewImageUrl: TRADE_NAME_RECEIPT_IMAGE_URL,
    previewHref: TRADE_NAME_RECEIPT_IMAGE_URL,
    previewButtonLabel: "Open digital receipt",
  };
}

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

const TRANSLITERATION_PHRASE_OVERRIDES = new Map<string, string>([
  [MARWA_TRADE_NAME_EN.toLowerCase(), MARWA_TRADE_NAME_AR],
  ["marwah restaurant", MARWA_TRADE_NAME_AR],
  ["bait el khetyar", PRIMARY_TRADE_NAME_AR],
  ["bait al khetyar", PRIMARY_TRADE_NAME_AR],
]);

const TRANSLITERATION_WORD_OVERRIDES = new Map<string, string>([
  ["marwa", "مروة"],
  ["marwah", "مروة"],
  ["restaurant", "مطعم"],
  ["bait", "بيت"],
  ["el", "ال"],
  ["al", "ال"],
  ["khetyar", "الختيار"],
]);

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

      if (word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word.toUpperCase();
      }

      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function formatArabicName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function transliterateSegment(segment: string) {
  const normalized = segment.toLowerCase();
  let result = "";
  let index = 0;

  while (index < normalized.length) {
    const pair = normalized.slice(index, index + 2);
    if (DOUBLE_CHAR_MAP.has(pair)) {
      result += DOUBLE_CHAR_MAP.get(pair);
      index += 2;
      continue;
    }

    const char = normalized[index];
    if (SINGLE_CHAR_MAP.has(char)) {
      result += SINGLE_CHAR_MAP.get(char);
    } else {
      result += char;
    }
    index += 1;
  }

  return result;
}

function transliterateToArabic(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const normalizedPhrase = trimmed
    .replace(/[-\s]+/g, " ")
    .toLowerCase()
    .trim();
  const phraseOverride = TRANSLITERATION_PHRASE_OVERRIDES.get(normalizedPhrase);
  if (phraseOverride) {
    return phraseOverride;
  }

  const transliteratedTokens = normalizedPhrase
    .split(" ")
    .map((token) => {
      const normalizedToken = token.replace(/[^a-z]/g, "");
      if (normalizedToken) {
        const override = TRANSLITERATION_WORD_OVERRIDES.get(normalizedToken);
        if (override) {
          return override;
        }
      }

      return transliterateSegment(token);
    })
    .filter(Boolean);

  return transliteratedTokens.join(" ").replace(/\s+/g, " ").trim();
}

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function VerificationStepItem({
  step,
  index,
  totalSteps,
  onEscalate,
  isEscalated = false,
  activityOptions,
  selectedActivityId,
  onActivitySelect,
}: {
  step: TradeNameVerificationStepWithStatus;
  index: number;
  totalSteps: number;
  onEscalate?: (stepTitle: string) => void;
  isEscalated?: boolean;
  activityOptions?: ActivityOption[];
  selectedActivityId?: string | null;
  onActivitySelect?: (activityId: string) => void;
}) {
  const isFailed = step.status === "failed";
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";
  const [detailLanguage, setDetailLanguage] = React.useState<"en" | "ar">(
    "en",
  );

  React.useEffect(() => {
    setDetailLanguage("en");
  }, [step.title, step.status]);

  const detailVariantStyles = React.useMemo(
    () => ({
      failed: {
        container:
          "border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700",
        label:
          "text-xs font-semibold uppercase tracking-[0.18em] text-rose-500",
        toggleWrap:
          "inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white/80 p-1",
        toggleActive:
          "min-w-[36px] rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] bg-rose-500 text-white shadow-[0_8px_20px_-10px_rgba(225,29,72,0.45)]",
        toggleInactive:
          "min-w-[36px] rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500 transition hover:bg-rose-100",
      },
      success: {
        container:
          "border-[#94d2c2] bg-[#dff2ec]/90 px-3 py-2 text-sm text-[#0f766e]",
        label:
          "text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]",
        toggleWrap:
          "inline-flex items-center gap-1 rounded-full border border-[#94d2c2] bg-white/80 p-1",
        toggleActive:
          "min-w-[36px] rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] bg-[#0f766e] text-white shadow-[0_8px_20px_-10px_rgba(15,118,110,0.45)]",
        toggleInactive:
          "min-w-[36px] rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#0f766e]/10",
      },
    }),
    [],
  );

  const renderAgentNarrative = (
    detail: string | LocalizedAgentNarrative,
    variant: "failed" | "success",
  ) => {
    const styles = detailVariantStyles[variant];
    const isLocalized = typeof detail !== "string";
    const narrativeText =
      typeof detail === "string" ? detail : detail[detailLanguage];

    return (
      <div className={cn("space-y-2 rounded-xl", styles.container)}>
        {isLocalized ? (
          <div className="flex items-center justify-between gap-2">
            <span className={styles.label}>Agent responses</span>
            <div className={styles.toggleWrap}>
              {(["en", "ar"] as const).map((lang) => {
                const isActive = detailLanguage === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setDetailLanguage(lang)}
                    className={cn(
                      isActive ? styles.toggleActive : styles.toggleInactive,
                    )}
                  >
                    {lang === "en" ? "EN" : "AR"}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <p className="whitespace-pre-line">{narrativeText}</p>
      </div>
    );
  };

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
    ? "Enter a different trade name before continuing."
    : isCompleted
      ? "This check passed successfully."
      : isCurrent
        ? "We're processing this check right now."
        : "This check runs automatically after the previous ones.";

  return (
    <div className="space-y-3 rounded-2xl border border-[#e6f2ed] bg-white/95 p-4 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.25)]">
      <div className="flex flex-col gap-3">
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
      <div className="space-y-3 rounded-2xl border border-dashed border-[#e6f2ed] bg-white px-4 py-3 text-sm text-slate-600">
        <p>{step.description}</p>
        <div className="rounded-xl bg-[#0f766e]/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          {helperMessage}
        </div>
        {isFailed && step.failureDetail ? (
          <div className="space-y-3">
            {renderAgentNarrative(step.failureDetail, "failed")}
            {activityOptions && activityOptions.length ? (
              <div className="flex flex-wrap gap-2">
                {activityOptions.map((option) => {
                  const isActive = option.id === selectedActivityId;
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant="outline"
                      onClick={() => onActivitySelect?.(option.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                        isActive
                          ? "border-[#0f766e] bg-[#0f766e] text-white shadow-[0_18px_44px_-34px_rgba(15,118,110,0.45)]"
                          : "border-[#0f766e]/30 text-[#0f766e] hover:bg-[#0f766e]/10",
                      )}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}
            {onEscalate ? (
              <Button
                type="button"
                onClick={() => onEscalate(step.title)}
                disabled={isEscalated}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  isEscalated
                    ? "bg-rose-100 text-rose-500"
                    : "bg-rose-500 text-white shadow-[0_16px_34px_-22px_rgba(225,29,72,0.55)] hover:bg-rose-600",
                )}
              >
                {isEscalated ? "Escalation sent" : "Escalate to backend user"}
              </Button>
            ) : null}
          </div>
        ) : null}
        {isCompleted && step.successDetail
          ? renderAgentNarrative(step.successDetail, "success")
          : null}
      </div>
    </div>
  );
}

export function BusinessRegistrationFocusContent({
  journeyNumber = "0987654321",
  tradeName = "",
  isTradeNameAvailable = false,
  progressPercent = 46,
  onTradeNameChange,
  onTradeNameSelected,
  onTradeNameReservationSubmitted,
  payAndIssueLabel,
  payAndIssueToast,
}: BusinessRegistrationFocusContentProps) {
  const { toast } = useToast();
  const [tradeNameGuidance, setTradeNameGuidance] = React.useState<
    string | null
  >(null);
  const { setDocuments } = useDocumentVault();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const reservationTimeoutRef = React.useRef<number | null>(null);

  const initialFormattedName =
    formatTradeName(tradeName) || PRIMARY_TRADE_NAME_EN;

  const [activeEnglishTradeName, setActiveEnglishTradeName] =
    React.useState(initialFormattedName);
  const [activeArabicTradeName, setActiveArabicTradeName] = React.useState("");
  const [englishDraft, setEnglishDraft] = React.useState(initialFormattedName);
  const [arabicDraft, setArabicDraft] = React.useState("");
  const [isArabicSynced, setIsArabicSynced] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(true);
  const [pendingSubmission, setPendingSubmission] = React.useState<{
    english: string;
    arabic: string;
    normalized: string;
  } | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [hasPerformedCheck, setHasPerformedCheck] = React.useState(
    Boolean(tradeName) || isTradeNameAvailable,
  );
  const [hasRequestedSuggestions, setHasRequestedSuggestions] =
    React.useState(false);
  const [isNameAvailable, setIsNameAvailable] =
    React.useState(isTradeNameAvailable);
  const [hasSelectedApprovedTradeName, setHasSelectedApprovedTradeName] =
    React.useState(false);
  const [
    hasSubmittedReservationApplication,
    setHasSubmittedReservationApplication,
  ] = React.useState(false);
  const [isSubmittingReservation, setIsSubmittingReservation] =
    React.useState(false);
  const [automationProgress, setAutomationProgress] = React.useState(() =>
    clampProgress(progressPercent),
  );
  const [failedStepIndex, setFailedStepIndex] = React.useState<number | null>(
    isTradeNameAvailable ? null : DEFAULT_FAILURE_STEP_INDEX,
  );
  const [failureReason, setFailureReason] = React.useState<string | null>(null);
  const [escalatedStepIds, setEscalatedStepIds] = React.useState<Set<string>>(
    () => new Set<string>(),
  );
  const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(
    null,
  );
  const [activeSlideId, setActiveSlideId] =
    React.useState<StageSlide["id"]>("trade-name");

  const payAndIssueStepLabel = payAndIssueLabel ?? "Pay and Issue Trade Name";
  const tradeNamePaymentToastMessage =
    payAndIssueToast ??
    `Pay and issue the trade name for ${TRADE_NAME_PAYMENT_DISPLAY_AMOUNT} so Polaris can sync the receipt and unlock document submissions.`;

  const approvedNameSet = React.useMemo(
    () =>
      new Set(APPROVED_TRADE_NAMES.map((name) => name.trim().toUpperCase())),
    [],
  );

  const showVerificationSteps = hasPerformedCheck || isChecking;

  const canSubmitReservation = React.useMemo(
    () =>
      isNameAvailable &&
      hasSelectedApprovedTradeName &&
      !hasSubmittedReservationApplication,
    [
      hasSelectedApprovedTradeName,
      hasSubmittedReservationApplication,
      isNameAvailable,
    ],
  );

  const handleEscalation = React.useCallback(
    (stepTitle: string) => {
      setEscalatedStepIds((previous) => {
        if (previous.has(stepTitle)) {
          return previous;
        }
        const next = new Set(previous);
        next.add(stepTitle);
        return next;
      });
      toast({
        title: "Escalation sent to DED",
        description:
          "DED operations acknowledged the escalation and is addressing it now.",
      });
    },
    [toast],
  );

  const handleActivitySelect = React.useCallback((activityId: string) => {
    setSelectedActivityId(activityId);
  }, []);

  React.useEffect(() => {
    const english = englishDraft.trim();
    if (!english) {
      if (isArabicSynced && arabicDraft) {
        setArabicDraft("");
        setActiveArabicTradeName("");
      }
      return;
    }

    if (!isArabicSynced && arabicDraft.trim()) {
      return;
    }

    const transliterated = formatArabicName(transliterateToArabic(english));
    if (transliterated === arabicDraft) {
      return;
    }

    setArabicDraft(transliterated);
    setActiveArabicTradeName(transliterated);
    setIsArabicSynced(true);
  }, [
    arabicDraft,
    englishDraft,
    isArabicSynced,
    setActiveArabicTradeName,
    setArabicDraft,
    setIsArabicSynced,
  ]);

  const nextPrimaryAction = React.useMemo<
    "runChecks" | "selectName" | "submitReservation" | null
  >(() => {
    if (isChecking) {
      return null;
    }

    if (!isNameAvailable) {
      return "runChecks";
    }

    if (!hasSelectedApprovedTradeName) {
      return "selectName";
    }

    if (!hasSubmittedReservationApplication) {
      return "submitReservation";
    }

    return null;
  }, [
    hasSelectedApprovedTradeName,
    hasSubmittedReservationApplication,
    isChecking,
    isNameAvailable,
  ]);

  const tradeNameStatusToken = React.useMemo(() => {
    if (isChecking) {
      return {
        label: "Checking",
        className: "border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f766e]",
      };
    }

    if (hasSubmittedReservationApplication) {
      return {
        label: "Reserved",
        className: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
      };
    }

    if (isNameAvailable) {
      return {
        label: "Approved",
        className: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
      };
    }

    if (hasPerformedCheck) {
      return {
        label: "Needs attention",
        className: "border-rose-200 bg-rose-50 text-rose-600",
      };
    }

    return {
      label: "Not started",
      className: "border-slate-200 bg-white text-slate-500",
    };
  }, [
    hasPerformedCheck,
    hasSubmittedReservationApplication,
    isChecking,
    isNameAvailable,
  ]);

  const tradeNameStatusMessage = React.useMemo(() => {
    if (isChecking) {
      return "We're running the automated checks now.";
    }

    if (hasSubmittedReservationApplication) {
      return "Trade name issued. Submit your documents to continue.";
    }

    if (isNameAvailable) {
      return hasSelectedApprovedTradeName
        ? `${payAndIssueStepLabel} (${TRADE_NAME_PAYMENT_DISPLAY_AMOUNT}).`
        : "Trade name approved. Select it to move forward.";
    }

    if (hasPerformedCheck) {
      return "The last run flagged this trade name. Try updating and run the checks again.";
    }

    return "Provide a trade name and run the automated checks to continue.";
  }, [
    hasPerformedCheck,
    hasSelectedApprovedTradeName,
    hasSubmittedReservationApplication,
    isChecking,
    isNameAvailable,
    payAndIssueStepLabel,
  ]);

  const upsertTradeNameReceipt = React.useCallback(() => {
    const receiptDocument = createTradeNameReceiptDocument();

    setDocuments((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.id === TRADE_NAME_RECEIPT_DOCUMENT_ID,
      );

      if (existingIndex >= 0) {
        return previous.map((item, index) =>
          index === existingIndex
            ? { ...receiptDocument, isExpanded: true }
            : { ...item, isExpanded: false },
        );
      }

      return [
        { ...receiptDocument, isExpanded: true },
        ...previous.map((item) => ({ ...item, isExpanded: false })),
      ];
    });
  }, [setDocuments]);

  const verificationStatusLabel = isChecking
    ? "Checks running"
    : isNameAvailable
      ? "All checks passed"
      : hasPerformedCheck
        ? "Needs attention"
        : "No checks yet";

  const verificationSubtitle = showVerificationSteps
    ? "Full agent decision flow with localized transcripts."
    : "Run automated checks to populate the decision flow.";

  const finalDecisionSuccessDetail = React.useMemo(
    () =>
      TRADE_NAME_CHECKS.find(
        (step) => step.title === "Final decision engine",
      )?.successDetail ?? null,
    [],
  );

  const automationSteps = React.useMemo<
    TradeNameVerificationStepWithStatus[]
  >(() => {
    const failureDetail =
      failedStepIndex !== null
        ? TRADE_NAME_CHECKS[failedStepIndex]?.failureDetail ?? null
        : null;

    const decisionStatus: TradeNameCheckStatus = isChecking
      ? "current"
      : isNameAvailable
        ? "completed"
        : showVerificationSteps && failedStepIndex !== null
          ? "failed"
          : showVerificationSteps
            ? "pending"
            : "pending";

    const baseProgress = showVerificationSteps ? automationProgress : 0;
    const normalizedProgress =
      decisionStatus === "completed" || decisionStatus === "failed"
        ? 1
        : decisionStatus === "current"
          ? Math.max(baseProgress / 100, 0.12)
          : baseProgress > 0
            ? Math.max(baseProgress / 100, 0.06)
            : 0;

    return [
      {
        title: "Full decision flow",
        description:
          decisionStatus === "completed"
            ? "All agents approved the trade name."
            : decisionStatus === "failed"
              ? "Review the agent log to resolve the flagged issue."
              : "Polaris is orchestrating each agent’s checks.",
        summary: "Consolidated view of every agent verdict.",
        status: decisionStatus,
        progress: normalizedProgress,
        failureDetail: failureDetail ?? undefined,
        successDetail: finalDecisionSuccessDetail ?? undefined,
      },
    ];
  }, [
    automationProgress,
    failedStepIndex,
    finalDecisionSuccessDetail,
    isChecking,
    isNameAvailable,
    showVerificationSteps,
  ]);

  const completedVerificationSteps = automationSteps.filter(
    (step) => step.status === "completed",
  ).length;

  React.useEffect(() => {
    if (!isChecking) {
      return;
    }

    const interval = window.setInterval(() => {
      setAutomationProgress((previous) => {
        const next = Math.min(previous + 18, 100);

        if (next >= 100) {
          window.clearInterval(interval);

          const evaluationSource =
            pendingSubmission ??
            (activeEnglishTradeName
              ? {
                  english: activeEnglishTradeName,
                  arabic: activeArabicTradeName,
                  normalized: activeEnglishTradeName.trim().toUpperCase(),
                }
              : null);

          const normalizedName = evaluationSource?.normalized ?? "";
          const englishDisplay =
            evaluationSource?.english ?? englishDraft ?? PRIMARY_TRADE_NAME_EN;
          const arabicDisplay = evaluationSource?.arabic ?? arabicDraft ?? "";
          const isSuccess =
            Boolean(normalizedName) && approvedNameSet.has(normalizedName);

          setIsChecking(false);
          setIsNameAvailable(isSuccess);
          if (isSuccess) {
            setFailedStepIndex(null);
            setFailureReason(null);
          } else {
            if (normalizedName === CONFLICTING_TRADE_NAME_NORMALIZED) {
              setFailedStepIndex(DEFAULT_FAILURE_STEP_INDEX);
              setFailureReason(
                `We couldn’t reserve ${englishDisplay}. ${PRIMARY_TRADE_NAME_EN} (${PRIMARY_TRADE_NAME_AR}) is already registered. Try a unique variation that aligns with your selected activity.`,
              );
            } else if (normalizedName === ACTIVITY_COMPATIBILITY_NAME) {
              setFailedStepIndex(ACTIVITY_FAILURE_STEP_INDEX);
              setFailureReason(
                `We couldn’t reserve ${englishDisplay}. Select the activity that best matches the heritage concept or adjust the trade name.`,
              );
            } else {
              setFailedStepIndex(DEFAULT_FAILURE_STEP_INDEX);
              setFailureReason(
                normalizedName
                  ? `We couldn’t reserve ${englishDisplay}. Try a unique variation that aligns with your selected activity.`
                  : "Add English and Arabic trade names before running the automated checks.",
              );
            }
          }
          setPendingSubmission(null);
          setHasPerformedCheck(true);
          setActiveEnglishTradeName(englishDisplay || PRIMARY_TRADE_NAME_EN);
          setActiveArabicTradeName(arabicDisplay);
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
    englishDraft,
    arabicDraft,
    approvedNameSet,
  ]);

  React.useEffect(() => {
    return () => {
      if (reservationTimeoutRef.current) {
        window.clearTimeout(reservationTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isNameAvailable) {
      if (reservationTimeoutRef.current) {
        window.clearTimeout(reservationTimeoutRef.current);
        reservationTimeoutRef.current = null;
      }
      setHasSelectedApprovedTradeName(false);
      setHasSubmittedReservationApplication(false);
      setIsSubmittingReservation(false);
    }
  }, [isNameAvailable]);

  React.useEffect(() => {
    const formatted = formatTradeName(tradeName) || PRIMARY_TRADE_NAME_EN;
    setActiveEnglishTradeName(formatted);
    setEnglishDraft(formatted);
    setActiveArabicTradeName("");
    setArabicDraft("");
    setIsArabicSynced(false);
    setIsNameAvailable(isTradeNameAvailable);
    setFailedStepIndex(
      isTradeNameAvailable ? null : DEFAULT_FAILURE_STEP_INDEX,
    );
    setFailureReason(null);
    setAutomationProgress(clampProgress(progressPercent));
    setHasPerformedCheck(Boolean(tradeName) || isTradeNameAvailable);
    setEscalatedStepIds(() => new Set<string>());
    setSelectedActivityId(null);
    if (reservationTimeoutRef.current) {
      window.clearTimeout(reservationTimeoutRef.current);
      reservationTimeoutRef.current = null;
    }
    setHasSelectedApprovedTradeName(false);
    setHasSubmittedReservationApplication(false);
    setIsSubmittingReservation(false);
    setHasRequestedSuggestions(false);
    setIsEditing(true);
  }, [tradeName, isTradeNameAvailable, progressPercent]);

  React.useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isEditing]);

  const runChecksWithNames = React.useCallback(
    (englishName: string, arabicName: string) => {
      const formattedEnglish = formatTradeName(englishName);
      const formattedArabic = formatArabicName(arabicName);

      if (!formattedEnglish || !formattedArabic) {
        return false;
      }

      setEnglishDraft(formattedEnglish);
      setArabicDraft(formattedArabic);
      setActiveEnglishTradeName(formattedEnglish);
      setActiveArabicTradeName(formattedArabic);
      const autoArabic = formatArabicName(
        transliterateToArabic(formattedEnglish),
      );
      setIsArabicSynced(autoArabic === formattedArabic);
      setPendingSubmission({
        english: formattedEnglish,
        arabic: formattedArabic,
        normalized: formattedEnglish.toUpperCase(),
      });
      setAutomationProgress(0);
      setEscalatedStepIds(() => new Set<string>());
      setSelectedActivityId(null);
      setIsChecking(true);
      setIsNameAvailable(false);
      setFailedStepIndex(null);
      setFailureReason(null);
      setHasPerformedCheck(true);
      setIsEditing(true);
      setActiveSlideId("trade-name");
      onTradeNameChange?.(formattedEnglish);
      return true;
    },
    [onTradeNameChange, setActiveSlideId],
  );

  const handleRunChecks = React.useCallback(() => {
    if (isChecking) {
      return;
    }

    if (!englishDraft.trim() || !arabicDraft.trim()) {
      setIsEditing(true);
      toast({
        title: "Add trade names",
        description:
          "Provide both English and Arabic names before running the checks.",
        variant: "destructive",
      });
      return;
    }

    setTradeNameGuidance(null);
    const succeeded = runChecksWithNames(englishDraft, arabicDraft);

    if (!succeeded) {
      toast({
        title: "Invalid trade name",
        description:
          "Enter valid characters for both the English and Arabic names.",
        variant: "destructive",
      });
    }
  }, [
    arabicDraft,
    englishDraft,
    isChecking,
    runChecksWithNames,
    toast,
    setTradeNameGuidance,
  ]);

  const handleApplySuggestion = React.useCallback(
    (suggestion: TradeNameSuggestion) => {
      if (isChecking) {
        return;
      }

      const formattedEnglish = formatTradeName(suggestion.english);
      const transliteratedArabic = formatArabicName(
        transliterateToArabic(formattedEnglish),
      );
      setEnglishDraft(formattedEnglish);
      setActiveEnglishTradeName(formattedEnglish);
      setArabicDraft(transliteratedArabic);
      setActiveArabicTradeName(transliteratedArabic);
      setPendingSubmission(null);
      setAutomationProgress(0);
      setEscalatedStepIds(() => new Set<string>());
      setSelectedActivityId(null);
      setIsArabicSynced(Boolean(transliteratedArabic));
      setIsNameAvailable(false);
      setFailedStepIndex(DEFAULT_FAILURE_STEP_INDEX);
      setFailureReason(null);
      setHasSelectedApprovedTradeName(false);
      setHasSubmittedReservationApplication(false);
      setIsSubmittingReservation(false);
      setIsEditing(true);
      setActiveSlideId("trade-name");
      setTradeNameGuidance(null);
      onTradeNameChange?.(formattedEnglish);
    },
    [isChecking, onTradeNameChange, setActiveSlideId, setTradeNameGuidance],
  );

  const handleSelectApprovedTradeName = React.useCallback(() => {
    if (
      !isNameAvailable ||
      hasSelectedApprovedTradeName ||
      hasSubmittedReservationApplication ||
      isSubmittingReservation
    ) {
      return;
    }

    const formattedEnglish = formatTradeName(
      activeEnglishTradeName || englishDraft || PRIMARY_TRADE_NAME_EN,
    );
    const resolvedArabic = activeArabicTradeName
      ? formatArabicName(activeArabicTradeName)
      : formattedEnglish
        ? formatArabicName(transliterateToArabic(formattedEnglish))
        : "";

    setHasSelectedApprovedTradeName(true);
    setActiveEnglishTradeName(formattedEnglish);
    setActiveArabicTradeName(resolvedArabic);
    setEnglishDraft(formattedEnglish);
    setArabicDraft(resolvedArabic);
    setIsArabicSynced(true);
    setTradeNameGuidance(tradeNamePaymentToastMessage ?? null);
    onTradeNameChange?.(formattedEnglish);
    onTradeNameSelected?.();
  }, [
    activeArabicTradeName,
    activeEnglishTradeName,
    englishDraft,
    hasSelectedApprovedTradeName,
    hasSubmittedReservationApplication,
    isNameAvailable,
    isSubmittingReservation,
    onTradeNameSelected,
    onTradeNameChange,
    setTradeNameGuidance,
    tradeNamePaymentToastMessage,
  ]);

  const handleSubmitReservationApplication = React.useCallback(() => {
    if (
      !canSubmitReservation ||
      isSubmittingReservation ||
      hasSubmittedReservationApplication
    ) {
      return;
    }

    setActiveSlideId("trade-name");
    setIsSubmittingReservation(true);
    setTradeNameGuidance(null);
    if (reservationTimeoutRef.current) {
      window.clearTimeout(reservationTimeoutRef.current);
    }
    reservationTimeoutRef.current = window.setTimeout(() => {
      setIsSubmittingReservation(false);
      setHasSubmittedReservationApplication(true);
      upsertTradeNameReceipt();
      setAutomationProgress((value) => Math.max(value, 100));
      setIsEditing(true);
      onTradeNameReservationSubmitted?.();
      setTradeNameGuidance(null);
      reservationTimeoutRef.current = null;
    }, 1200);
  }, [
    canSubmitReservation,
    hasSubmittedReservationApplication,
    isSubmittingReservation,
    onTradeNameReservationSubmitted,
    setTradeNameGuidance,
    upsertTradeNameReceipt,
    setActiveSlideId,
  ]);

  const trimmedEnglishDraft = englishDraft.trim();
  const normalizedEnglishDraft = trimmedEnglishDraft.toUpperCase();
  const hasEnglishDraft = trimmedEnglishDraft.length > 0;
  const shouldShowSuggestionSection =
    hasEnglishDraft && hasPerformedCheck && !isNameAvailable;

  const baseCtaClasses =
    "rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60";
  const primaryCtaClasses =
    "border border-transparent bg-[#0f766e] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059]";
  const secondaryCtaClasses =
    "border border-[#0f766e]/40 bg-white text-[#0f766e] hover:bg-[#0f766e]/10";

  const slides: StageSlide[] = [
    {
      id: "trade-name",
      heading: "Trade name workspace",
      description:
        "Review the current status, edit details, and submit your reservation when ready.",
      content: (
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Journey number
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {journeyNumber}
                </p>
              </div>
              <Badge className="inline-flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Trade name workflow
              </Badge>
            </div>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Business registration
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Keep the trade name checks on track
                </h3>
                <p className="text-sm text-slate-600">
                  Review the current trade name status and run the automated
                  verification when you’re ready to move forward.
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Polaris handles each verification step automatically and flags
                anything that needs your approval here.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.32)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Trade name details
                </p>
                <h4 className="text-xl font-semibold text-slate-900">
                  {activeEnglishTradeName || PRIMARY_TRADE_NAME_EN}
                </h4>
                {activeArabicTradeName ? (
                  <p
                    className="text-base font-semibold text-[#0f766e]"
                    dir="rtl"
                  >
                    {activeArabicTradeName}
                  </p>
                ) : null}
              </div>
              <Badge
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  tradeNameStatusToken.className,
                )}
              >
                {tradeNameStatusToken.label}
              </Badge>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {tradeNameStatusMessage}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    English name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {activeEnglishTradeName || PRIMARY_TRADE_NAME_EN}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Arabic name (Transliteration)
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-semibold",
                      activeArabicTradeName
                        ? "text-[#0f766e]"
                        : "text-slate-400",
                    )}
                    dir={activeArabicTradeName ? "rtl" : "ltr"}
                  >
                    {activeArabicTradeName ||
                      "Transliteration will populate the Arabic name"}
                  </p>
                </div>
              </div>

              {failureReason && !isNameAvailable ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
                  {failureReason}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isEditing) {
                    setEnglishDraft(
                      activeEnglishTradeName || PRIMARY_TRADE_NAME_EN,
                    );
                    const restoredArabic = activeArabicTradeName || "";
                    setArabicDraft(restoredArabic);
                    setIsArabicSynced(Boolean(restoredArabic));
                  }
                  setIsEditing((previous) => !previous);
                }}
                disabled={isSubmittingReservation}
                className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEditing ? "Close editor" : "Edit trade name"}
              </Button>
              {!isNameAvailable ? (
                <Button
                  type="button"
                  onClick={handleRunChecks}
                  disabled={
                    isChecking ||
                    isSubmittingReservation ||
                    hasSubmittedReservationApplication
                  }
                  className={cn(
                    baseCtaClasses,
                    nextPrimaryAction === "runChecks"
                      ? primaryCtaClasses
                      : secondaryCtaClasses,
                  )}
                >
                  {isChecking ? "Running checks..." : "Run automated checks"}
                </Button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-4">
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleRunChecks();
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      English trade name
                    </label>
                    <Input
                      ref={inputRef}
                      value={englishDraft}
                      onChange={(event) => setEnglishDraft(event.target.value)}
                      placeholder={PRIMARY_TRADE_NAME_EN}
                      className="h-11 rounded-full border-slate-200 bg-white px-4 text-sm tracking-wide text-slate-900 placeholder:text-slate-400"
                      disabled={isChecking}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Arabic trade name (Transliteration)
                    </label>
                    <Input
                      value={arabicDraft}
                      onChange={(event) => {
                        const value = event.target.value;
                        setArabicDraft(value);
                        setActiveArabicTradeName(value);
                        setIsArabicSynced(false);
                      }}
                      placeholder="Transliteration auto-populates the Arabic name"
                      dir={arabicDraft ? "rtl" : "ltr"}
                      className="h-11 rounded-full border-slate-200 bg-white px-4 text-sm tracking-wide text-slate-900 placeholder:text-slate-400"
                      disabled={isChecking}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="submit"
                      disabled={isChecking}
                      className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isChecking ? "Checking..." : "Save & rerun checks"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      disabled={isChecking}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
                {shouldShowSuggestionSection ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Suggested trade names
                      </p>
                      {!hasRequestedSuggestions ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setHasRequestedSuggestions(true)}
                          disabled={isChecking}
                          className="w-fit rounded-full border-[#0f766e]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-sm hover:bg-[#0f766e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Show suggested names
                        </Button>
                      ) : null}
                    </div>
                    {hasRequestedSuggestions ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {TRADE_NAME_SUGGESTIONS.map((suggestion) => {
                          const isCurrentSuggestion =
                            normalizedEnglishDraft ===
                            suggestion.english.toUpperCase();
                          const availabilityMeta =
                            SUGGESTION_AVAILABILITY_META[
                              suggestion.availability
                            ];

                          return (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => handleApplySuggestion(suggestion)}
                              disabled={isChecking}
                              className={cn(
                                "flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition shadow-sm",
                                isCurrentSuggestion
                                  ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
                                  : "border-[#0f766e]/30 bg-white text-[#0f766e] hover:bg-[#0f766e]/10",
                                isChecking && "cursor-not-allowed opacity-60",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <Badge
                                  className={cn(
                                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                    availabilityMeta.className,
                                  )}
                                >
                                  {availabilityMeta.label}
                                </Badge>
                                {isCurrentSuggestion ? (
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                                    {isChecking ? "Checking..." : "Selected"}
                                  </span>
                                ) : null}
                              </div>
                              <span className="block text-[12px] font-semibold normal-case text-slate-900">
                                {suggestion.english}
                              </span>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Arabic generates after transliteration
                              </span>
                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                                {isCurrentSuggestion
                                  ? "In review"
                                  : "Use this name"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl border border-[#d8e4df] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.32)] overflow-hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="verification" className="border-none">
                <AccordionTrigger className="px-5 py-4 text-left hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30">
                  <div className="flex w-full flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Verification checks
                      </p>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {verificationStatusLabel}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {verificationSubtitle}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        isNameAvailable
                          ? "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]"
                          : isChecking
                            ? "border-[#0f766e]/40 bg-[#0f766e]/10 text-[#0f766e]"
                            : hasPerformedCheck
                              ? "border-rose-200 bg-rose-50 text-rose-600"
                              : "border-slate-200 bg-white text-slate-500",
                      )}
>
                      {completedVerificationSteps}/{automationSteps.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pt-3 space-y-3">
                  {showVerificationSteps ? (
                    <div className="space-y-3">
                      {automationSteps.map((step, index) => (
                        <VerificationStepItem
                          key={step.title}
                          step={step}
                          index={index}
                          totalSteps={automationSteps.length}
                          onEscalate={handleEscalation}
                          isEscalated={escalatedStepIds.has(step.title)}
                          activityOptions={
                            failedStepIndex === ACTIVITY_FAILURE_STEP_INDEX
                              ? ACTIVITY_COMPATIBILITY_OPTIONS
                              : undefined
                          }
                          selectedActivityId={
                            failedStepIndex === ACTIVITY_FAILURE_STEP_INDEX
                              ? selectedActivityId
                              : undefined
                          }
                          onActivitySelect={
                            failedStepIndex === ACTIVITY_FAILURE_STEP_INDEX
                              ? handleActivitySelect
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-500">
                      Run the automated checks to populate each verification
                      step.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          {isNameAvailable ? (
            <div className="rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.32)]">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectApprovedTradeName}
                  disabled={
                    hasSelectedApprovedTradeName ||
                    hasSubmittedReservationApplication ||
                    isSubmittingReservation
                  }
                  className={cn(
                    baseCtaClasses,
                    nextPrimaryAction === "selectName"
                      ? primaryCtaClasses
                      : secondaryCtaClasses,
                  )}
                >
                  {hasSubmittedReservationApplication
                    ? "Trade name reserved"
                    : hasSelectedApprovedTradeName
                      ? "Trade name selected"
                      : "Select trade name"}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitReservationApplication}
                  disabled={!canSubmitReservation || isSubmittingReservation}
                  className={cn(
                    baseCtaClasses,
                    nextPrimaryAction === "submitReservation"
                      ? primaryCtaClasses
                      : secondaryCtaClasses,
                  )}
                >
                  {hasSubmittedReservationApplication
                    ? "Reservation submitted"
                    : isSubmittingReservation
                      ? "Submitting reservation..."
                      : hasSelectedApprovedTradeName
                        ? payAndIssueStepLabel
                        : "Submit reservation & pay"}
                </Button>
              </div>
              {tradeNameGuidance ? (
                <p className="mt-2 w-full text-xs text-[#0f766e]">
                  {tradeNameGuidance}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <StageSlideNavigator
      slides={slides}
      activeSlideId={activeSlideId}
      onSlideChange={setActiveSlideId}
      className="mt-6"
    />
  );
}
