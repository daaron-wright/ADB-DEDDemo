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
import { Check, X, ChevronDown } from "lucide-react";

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
  onPolarisPrompt?: (prompt: string, options?: { submit?: boolean }) => void;
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
        "Agent responses sequence:",
        '1. Text normalizer / spell checker / cultural checker → Passed. "Bait El Khetyar" cleared text validation with zero violations (processed in 653 ms).',
        "2. Prohibited words agent → Passed. No restricted vocabulary detected across English or Arabic drafts.",
        "3. Similarity agent → Passed. Registry lookup returned zero conflicting matches.",
        "4. Transliteration agent → Passed. Buckwalter phonetic check confirmed the Arabic rendering with 0.95 confidence.",
        "5. Activity compatibility agent → Passed. Licensed Food & Beverage activity remains aligned.",
        "6. Final decision engine → Rejected. Standard notice RTN-08: this trade name is already assigned; please submit an alternative.",
        '7. Name suggester agent (rejected trade name) → Guidance. Recommended option: "Khetyar\'s Courtyard".',
      ].join("\n"),
      ar: [
        "تسلسل استجابات الوكلاء:",
        '1. مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. اجتاز الاسم "بيت الختيار" التحقق النصي دون مخالفات (زمن المعالجة 653 ��للي ثانية).',
        "2. وكيل الكلمات ��لمحظورة → ناجح. لم يتم رصد مفردات محظورة في النسختين العربية أو الإنجليزية.",
        "3. وكيل التشابه → ناجح. لم يتم العثور على أسماء تجارية متعارضة؛ سج�� المطابقة أظهر صفراً من النتائج ا��متقاربة.",
        "4. وكيل التحويل الصوتي → ناجح. أكد محرك Buckwalter التوافق الصوتي للنسخة العربية بدرجة ثقة 0.95.",
        "5. وكيل توافق النشا�� → ناجح. الاسم ما ��زال متوافقاً مع نشاط المطاعم والمشروبا�� المرخّص.",
        "6. محرك القرار النهائي → مرفوض. إشعار RTN-08 المعياري: تم تسجيل هذا الاسم التجاري مسبقًا، يُرجى اقتراح بديل.",
        '7. وكيل اقتراح الاسم (الاسم المرفوض) → إرشاد. من البدائل الموصى بها: "ساحة الخي��يار".',
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
        "Agent responses sequence:",
        '1. Text normalizer / spell checker / cultural checker → Pass. Normalized "Bait El Khetyar" without cultural conflicts.',
        "2. Prohibited words agent → Pass. No prohibited lexicon detected in English or Arabic drafts.",
        "3. Similarity agent → Pass. Nearest registry match similarity score 0.28 (below threshold).",
        '4. Transliteration agent → Pass. Arabic transliteration "بيت الختيار" verified against phonetic rules.',
        "5. Activity compatibility agent → Guidance. Proposed name signals a heritage retail concept, not the F&B restaurant activity currently selected.",
        "6. Final decision engine → Pending manual review. Escalation recommended or choose an aligned activity.",
        '7. Name suggester agent (rejected trade name) → Suggested alternatives: "Bait El Khetyar Restaurant", "Khetyar Dining House".',
      ].join("\n"),
      ar: [
        "استجابات الوكلاء (العربية):",
        '• مدقق ا��نص / الت��قيق الإملائي / الفحص الثقافي → ناجح. تم توحيد "ب��ت الختيار" دون تعا��ضات ثقافية.',
        "• وكيل الكلمات المحظورة → ناجح. لم يتم العثور على مفردات محظورة في النسخ الإنجليزية أو العربية.",
        "• وكيل التشابه → ناجح. أ��رب تشابه مسجل بنسبة 0.28 (أقل من الحد المطلوب).",
        '• وكيل التحويل الصوتي → ناجح. تم التح��ق من التحويل "بيت الختيار" وفق القواعد الصوتية.',
        "• وكيل توافق ال��شاط → إرشاد. الاسم يشير إلى مفهوم تراثي للبيع بالتجزئة وليس نشاط مطعم ومشروبات الحالي.",
        "• محرك القرار النهائي → قيد الانتظار للمراجعة اليدوية. يُنصح بالتصعيد أو اختيار نشاط متوافق.",
        '• وكيل اقتراح الاسم (الاسم ال��رفوض) → اقترح البدائل: "Bait El Khetyar Restaurant" و"Khetyar Dining House".',
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
        "Agent responses sequence:",
        '1. Text normalizer / spell checker / cultural checker → Passed. Normalized "Marwa Restaurant" and confirmed cultural compliance.',
        "2. Prohibited words agent �� Passed. No restricted terms detected across English and Arabic drafts.",
        "3. Similarity agent → Passed. Nearest registry match scored 0.12, below the 0.75 conflict threshold.",
        '4. Transliteration agent → Passed. Arabic transliteration "مطعم مروة" validated against phonetic rules.',
        "5. Activity compatibility agent → Passed. Name aligns with the licensed Food & Beverage restaurant activity.",
        "6. Final decision engine → Approved 2025-09-22T09:32Z (confidence: high, score: 0.98).",
        "7. Name suggester agent (rejected trade name) → No alternatives required; current name authorized.",
      ].join("\n"),
      ar: [
        "استجابات الوكلاء (العربية):",
        '• مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. تم توحيد "Marwa Restaurant" والتأكد من الملاءمة ��لثقافية.',
        "• وكيل الكلمات المحظورة → ناجح. ل�� يتم العثور على مصطلحات محظورة في النسختين العربية والإنجليزية.",
        "• وكيل التشابه → ناجح. أقرب تشابه في السجل بلغ 0.12 وهو أقل من حد ال��عارض 0.75.",
        "• وكيل التحويل الصوتي → ناجح. تمت المصادقة على التحويل «مطعم مروة» وفق القواعد الصوتية.",
        "• وكيل توافق النشاط → ناجح. الاسم يتوافق مع نشاط المطعم المرخّص.",
        "• مح��ك القرار النهائي → معت��د بتاريخ 22-09-2025 الساعة 09:32 (درجة الثقة: عالية، النتيجة: 0.98).",
        "��� وكيل اقتراح الاسم (الاسم المرفوض) → ل�� حاجة لبدائل؛ الاسم الحالي معتمد.",
      ].join("\n"),
    },
  },
  {
    title: "Name suggester agent (rejected trade name)",
    description:
      "Generates compliant alternatives, reruns the full agent pipeline, and highlights the best option to pursue next.",
    summary: "Keeps the journey moving with agent-reviewed fallback names.",
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

const FINAL_DECISION_FAILURE_STEP_INDEX = (() => {
  const index = TRADE_NAME_CHECKS.findIndex(
    (step) => step.title === "Final decision engine",
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

const SIMILARITY_CONFLICT_SCORE = 0.81;
const SIMILARITY_CONFLICT_REFERENCE = "SIMILARITY_CONFLICT";
const ITERATION_DESCRIPTOR_FALLBACKS = [
  "Heritage Kitchen",
  "Culinary House",
  "Dining Atelier",
  "Gastronomy Studio",
];

const ACTIVITY_ALIGNMENT_DESCRIPTOR_SEQUENCE = [
  "Restaurant",
  "Dining House",
  "Kitchen",
  "Dining Room",
  "Culinary Studio",
  "Dining Collective",
];

function buildSimilarityConflictNarrative(
  attemptedName: string,
  iterationSuggestion: string,
): LocalizedAgentNarrative {
  const formattedAttempt = formatTradeName(attemptedName) || attemptedName;
  const sanitizedIteration = formatTradeName(iterationSuggestion) || iterationSuggestion;
  const hasIteration = Boolean(sanitizedIteration);

  const englishLines = [
    "Agent responses sequence:",
    `1. Text normalizer / spell checker / cultural checker → Passed. "${formattedAttempt}" cleared text validation with zero violations.`,
    "2. Prohibited words agent → Passed. No restricted vocabulary detected across English or Arabic drafts.",
    `3. Similarity agent → Failed. Matched existing trade name "${PRIMARY_TRADE_NAME_EN}" with similarity score ${SIMILARITY_CONFLICT_SCORE.toFixed(2)} (${SIMILARITY_CONFLICT_REFERENCE}).`,
    "4. Transliteration agent → Paused. Conflict must resolve before Arabic confirmation.",
    "5. Activity compatibility agent → Not evaluated. Waiting on a unique trade name.",
    `6. Final decision engine → Rejected. Conflict reference ${SIMILARITY_CONFLICT_REFERENCE}; submit a differentiated variation.`,
    hasIteration
      ? `7. Name suggester agent (rejected trade name) → Guidance. Draft alternative: "${sanitizedIteration}".`
      : "7. Name suggester agent (rejected trade name) → Guidance. Polaris recommends adding a geographic or specialty qualifier.",
  ];

  const arabicLines = [
    "تسل��ل استجابات الوكلاء:",
    `1. مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. اجتاز الاسم "${formattedAttempt}" التحقق الن��ي دون ��خالفات.`,
    "2. وكيل الكلمات المحظورة → ناجح. لم يتم رصد مفردات محظورة في النسختين العربية أ�� الإنجليزية.",
    `3. وكيل التشابه → فشل. تمت مطابقة الاسم المسجل "${PRIMARY_TRADE_NAME_AR}" بدرجة تشابه ${SIMILARITY_CONFLICT_SCORE.toFixed(2)} (${SIMILARITY_CONFLICT_REFERENCE}).`,
    "4. وكيل التحويل الصوتي → متوقف مؤقتًا. يجب معالجة التعارض قبل التأكيد.",
    "5. وكيل توافق النشاط → غير مقيم. في انتظار اسم تجاري فريد.",
    `6. محرك القرار النهائي → مرفوض. مرجع التعارض ${SIMILARITY_CONFLICT_REFERENCE}؛ يُرجى اقتر��ح اسم مختلف.`,
    hasIteration
      ? `7. وكيل اقتراح الاسم (الاسم المرفوض) → إرشاد. البديل المقترح: "${sanitizedIteration}".`
      : "7. وكيل اقتراح الاسم (الاس�� المرفوض) → إرشاد. ��وصي Polaris بإضافة توصيف خاص أو جغرافي.",
  ];

  return {
    en: englishLines.join("\n"),
    ar: arabicLines.join("\n"),
  };
}

function buildFinalDecisionRejectionNarrative(
  attemptedName: string,
): LocalizedAgentNarrative {
  const formattedAttempt = formatTradeName(attemptedName) || attemptedName;

  const englishLines = [
    "Agent responses sequence:",
    `1. Text normalizer / spell checker / cultural checker → Passed. "${formattedAttempt}" cleared text validation with zero violations.`,
    "2. Prohibited words agent → Passed. No restricted vocabulary detected across English or Arabic drafts.",
    "3. Similarity agent → Passed. Polaris confirmed this variation is unique in the registry.",
    "4. Transliteration agent → Passed. Arabic counterpart stays synchronized with phonetic rules.",
    "5. Activity compatibility agent → Guidance. Heritage positioning requires manual validation against the licensed activity plan.",
    "6. Final decision engine → Rejected. ESCALATE TO DED REVIEWER for manual adjudication and supporting document review.",
    "7. Name suggester agent → Guidance. Prepare your supporting rationale before escalating to the reviewer.",
  ];

  const arabicLines = [
    "استجابات الوكلاء (��لعربية):",
    `1. مدقق النص / التدقيق الإملائي / الفحص الثقافي → ناجح. تم اعتماد "${formattedAttempt}" دون مخالفات.`,
    "2. وكيل الكلمات المحظورة → ناجح. لا توجد مفردات محظورة في المسودة.",
    "3. وكيل التشابه → ناجح. تم تأكيد تميز الاسم في السجل.",
    "4. وكيل التحويل الصوتي → ناجح. النسخة العربية متوافقة مع القواعد الصوتية.",
    "5. وكيل توافق النشاط → إرشاد. النهج التراثي يتطلب تحققًا يدويًا من خطة النشاط.",
    "6. محرك القرار النهائي → مرفوض. ESCALATE TO DED REVIEWER لعرض الحالة على المراجع المختص.",
    "7. وكيل اقتراح الاسم → إرشاد. جهز المبررات الداعمة قبل التصعيد.",
  ];

  return {
    en: englishLines.join("\n"),
    ar: arabicLines.join("\n"),
  };
}

function suggestTradeNameIteration(baseName: string): string {
  const formatted = formatTradeName(baseName);
  if (!formatted) {
    return "";
  }

  if (/restaurant/i.test(formatted)) {
    return formatted.replace(/restaurant/gi, "Heritage Kitchen").replace(/\s+/g, " ").trim();
  }

  const lower = formatted.toLowerCase();
  for (const descriptor of ITERATION_DESCRIPTOR_FALLBACKS) {
    if (!lower.includes(descriptor.toLowerCase())) {
      return `${formatted} ${descriptor}`.replace(/\s+/g, " ").trim();
    }
  }

  return `${formatted} Signature`.replace(/\s+/g, " ").trim();
}

function suggestActivityAlignedTradeName(baseName: string): string {
  const formatted = formatTradeName(baseName);
  if (!formatted) {
    return "";
  }

  const lower = formatted.toLowerCase();
  const hasActivityKeyword = /(restaurant|dining|kitchen|culinary|cafe|café|eatery|bistro)/i.test(lower);

  if (!hasActivityKeyword) {
    return `${formatted} Restaurant`.replace(/\s+/g, " ").trim();
  }

  for (const descriptor of ACTIVITY_ALIGNMENT_DESCRIPTOR_SEQUENCE) {
    if (!lower.includes(descriptor.toLowerCase())) {
      return `${formatted} ${descriptor}`.replace(/\s+/g, " ").trim();
    }
  }

  const fallback = suggestTradeNameIteration(formatted);
  return fallback.toLowerCase() !== lower
    ? fallback
    : `${formatted} Dining Atelier`.replace(/\s+/g, " ").trim();
}

function buildChatDraftFromContext(
  status: "approved" | "rejected",
  englishName: string,
  context:
    | "similarity-conflict"
    | "activity-mismatch"
    | "missing-input"
    | "final-decision"
    | null,
  iterationSuggestion: string | null,
): string | null {
  if (status !== "rejected") {
    return null;
  }

  const formattedName = formatTradeName(englishName) || englishName;
  const formattedIteration = iterationSuggestion
    ? formatTradeName(iterationSuggestion) || iterationSuggestion
    : null;

  if (context === "similarity-conflict") {
    if (formattedIteration) {
      return `Polaris, let's rerun the trade name checks on "${formattedIteration}" so we avoid the similarity conflict with "${PRIMARY_TRADE_NAME_EN}".`;
    }
    return `Polaris, the similarity agent rejected "${formattedName}" because it conflicts with "${PRIMARY_TRADE_NAME_EN}". Suggest compliant alternatives with a unique qualifier.`;
  }

  if (context === "activity-mismatch") {
    if (formattedIteration) {
      return `Polaris, rerun the trade name checks on "${formattedIteration}" so the activity compatibility agent confirms it fits our Food & Beverage restaurant scope.`;
    }
    return `Polaris, help me adjust the trade name so it clearly fits the Food & Beverage restaurant activity before we rerun the checks.`;
  }

  if (context === "final-decision") {
    return `Polaris, escalate "${formattedName}" to the DED reviewer and list the supporting documents they need to complete the manual adjudication.`;
  }

  if (context === "missing-input") {
    return `Polaris, remind me what information I need to provide before we can rerun the trade name verification checks.`;
  }

  return null;
}

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

type AgentOutcome = "passed" | "failed" | "pending" | "rejected" | "info";

type ParsedAgentResponse = {
  order: number;
  title: string;
  status: AgentOutcome;
  detail?: string;
};

type ParsedAgentNarrative = {
  heading: string | null;
  responses: ParsedAgentResponse[];
};

const AGENT_OUTCOME_META: Record<
  AgentOutcome,
  { label: string; badgeClassName: string; indicatorClassName: string }
> = {
  passed: {
    label: "Passed",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    indicatorClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  failed: {
    label: "Failed",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-600",
    indicatorClassName: "border-rose-200 bg-rose-50 text-rose-600",
  },
  pending: {
    label: "Pending",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    indicatorClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  rejected: {
    label: "Rejected",
    badgeClassName: "border-rose-300 bg-rose-50 text-rose-600",
    indicatorClassName: "border-rose-300 bg-rose-100 text-rose-600",
  },
  info: {
    label: "Guidance",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-600",
    indicatorClassName: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

const AGENT_OUTCOME_KEYWORDS: Record<AgentOutcome, string[]> = {
  passed: ["pass", "passed", "approved", "ناجح", "معتمد"],
  failed: ["fail", "failed", "فشل"],
  pending: ["pending", "awaiting", "قيد الانتظار"],
  rejected: ["reject", "rejected", "مرفوض"],
  info: [
    "guidance",
    "suggested alternatives",
    "no alternatives required",
    "اقتراح البدائل",
    "لا حاجة لبدائل",
    "إرشاد",
  ],
};

const AGENT_STATUS_STRIP_PREFIXES: Record<AgentOutcome, string[]> = {
  passed: ["pass", "passed", "approved", "ناجح", "معتمد"],
  failed: ["fail", "failed", "فشل"],
  pending: ["pending manual review", "pending", "awaiting", "قيد الانتظار"],
  rejected: ["reject", "rejected", "مرفوض"],
  info: [
    "guidance",
    "suggested alternatives",
    "no alternatives required",
    "اقتراح البد��ئل",
    "لا حاجة لبدائل",
    "إرشاد",
  ],
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesAnyKeyword(source: string, keywords: string[]) {
  const normalized = source.trim().toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function normalizeAgentOutcome(rawStatus: string): AgentOutcome {
  if (!rawStatus.trim()) {
    return "info";
  }

  if (matchesAnyKeyword(rawStatus, AGENT_OUTCOME_KEYWORDS.rejected)) {
    return "rejected";
  }

  if (matchesAnyKeyword(rawStatus, AGENT_OUTCOME_KEYWORDS.failed)) {
    return "failed";
  }

  if (matchesAnyKeyword(rawStatus, AGENT_OUTCOME_KEYWORDS.pending)) {
    return "pending";
  }

  if (matchesAnyKeyword(rawStatus, AGENT_OUTCOME_KEYWORDS.passed)) {
    return "passed";
  }

  if (matchesAnyKeyword(rawStatus, AGENT_OUTCOME_KEYWORDS.info)) {
    return "info";
  }

  return "info";
}

function stripStatusPhrase(detail: string, outcome: AgentOutcome) {
  let result = detail.trim();
  const prefixes = AGENT_STATUS_STRIP_PREFIXES[outcome];

  for (const prefix of prefixes) {
    const regex = new RegExp(`^${escapeRegExp(prefix)}\\b[\\s.:;,-–—]*`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, "").trim();
      break;
    }
  }

  result = result.replace(/^[\s.:;,-–—]+/, "").trim();

  return result;
}

function parseAgentNarrativeLine(
  line: string,
  fallbackOrder: number,
): ParsedAgentResponse | null {
  const sanitizedLine = line.replace(/^•\s*/, "").trim();
  if (!sanitizedLine) {
    return null;
  }

  const arrowIndex = sanitizedLine.indexOf("→");
  if (arrowIndex === -1) {
    return null;
  }

  const titleSegment = sanitizedLine.slice(0, arrowIndex).trim();
  const statusSegment = sanitizedLine.slice(arrowIndex + 1).trim();
  const orderMatch = titleSegment.match(/^(\d+)\.\s*(.+)$/);
  const parsedOrder = orderMatch
    ? Number.parseInt(orderMatch[1], 10)
    : fallbackOrder;
  const order = Number.isNaN(parsedOrder) ? fallbackOrder : parsedOrder;
  const title = (orderMatch ? orderMatch[2] : titleSegment).trim();
  const outcome = normalizeAgentOutcome(statusSegment);
  const detail = stripStatusPhrase(statusSegment, outcome);

  return {
    order,
    title,
    status: outcome,
    detail: detail ? detail : undefined,
  };
}

function parseAgentNarrative(text: string): ParsedAgentNarrative | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return null;
  }

  let heading: string | null = null;
  const responses: ParsedAgentResponse[] = [];

  lines.forEach((line, index) => {
    if (!line.includes("→")) {
      if (!heading) {
        heading = line.replace(/^•\s*/, "");
      }
      return;
    }

    const parsed = parseAgentNarrativeLine(line, index + 1);
    if (parsed) {
      responses.push(parsed);
    }
  });

  if (!responses.length) {
    return null;
  }

  responses.sort((a, b) => a.order - b.order);

  return { heading, responses };
}

function extractEnglishNarrative(
  detail?: string | LocalizedAgentNarrative,
): string | null {
  if (!detail) {
    return null;
  }

  return typeof detail === "string" ? detail : detail.en;
}

function generatePolarisGuidanceFromFailure(
  detail?: string | LocalizedAgentNarrative,
): string {
  const englishNarrative = extractEnglishNarrative(detail);
  if (!englishNarrative) {
    return "Polaris needs the agent transcript to recommend alternatives. Rerun the checks and try again.";
  }

  const parsed = parseAgentNarrative(englishNarrative);
  if (!parsed) {
    return "Polaris could not interpret the agent transcript. Consider adjusting the trade name and re-running the verification.";
  }

  const failureSignal = parsed.responses.find((response) =>
    response.status === "failed" || response.status === "rejected",
  );
  const pendingSignal = parsed.responses.find(
    (response) => response.status === "pending",
  );
  const guidanceSignal = parsed.responses.find((response) =>
    response.status === "info" ||
    response.title.toLowerCase().includes("name suggester"),
  );

  const insights: string[] = [];

  if (failureSignal) {
    const reasonDetail = failureSignal.detail ?? failureSignal.title;
    insights.push(
      `The ${failureSignal.title} reports ${reasonDetail.replace(/\s+/g, " ")}.`,
    );
  }

  if (pendingSignal) {
    const pendingDetail = pendingSignal.detail
      ? pendingSignal.detail.replace(/\s+/g, " ")
      : pendingSignal.title;
    insights.push(
      `We still have ${pendingSignal.title.toLowerCase()} pending: ${pendingDetail}.`,
    );
  }

  if (guidanceSignal) {
    const suggestionDetail = guidanceSignal.detail
      ? guidanceSignal.detail.replace(/\s+/g, " ")
      : guidanceSignal.title;
    insights.push(`Consider ${suggestionDetail}.`);
  } else {
    insights.push(
      "Try adding a unique qualifier or geographic cue to differentiate the name, then re-run the verification checks.",
    );
  }

  return insights
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");
}

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
  ["k", "��"],
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

const ARABIC_CHAR_PATTERN = /[\u0600-\u06FF]/;
const QUOTED_TEXT_PATTERN = /["“”']([^"“”']{2,})["���”']/g;
const CHAT_NAME_TERMINATORS = /\b(?:instead|please|thanks|thank you|and then|and we|and i'll|because|so that|so we|so i)\b/i;
const CHAT_NAME_TRIGGER_PATTERN = /\b(?:use|try|consider|switch to|update to|rename(?:\s+it)?\s+to|call it|let(?:'s)? go with|let(?:'s)? call it|let(?:'s)? use)\s+([A-Za-z0-9][A-Za-z0-9\s'&()\-]{2,})/i;
const CHAT_TRADE_NAME_FALLBACK_PATTERN = /\btrade\s*name\b[^A-Za-z0-9]*([A-Za-z0-9][A-Za-z0-9\s'&()\-]{2,})/i;

function sanitizeTradeNameCandidate(value: string) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const terminationIndex = trimmed.search(CHAT_NAME_TERMINATORS);
  const truncated = terminationIndex > 0 ? trimmed.slice(0, terminationIndex) : trimmed;

  return truncated.replace(/^[\s"'“”'’]+|[\s"'“”'’.!,;:()\-]+$/g, "").trim();
}

function extractLabeledSegment(source: string, label: string) {
  const pattern = new RegExp(`${label}\\s*[:\\-]\\s*["“”']?([^"“”'\\n]+)["“”']?`, "i");
  const match = source.match(pattern);
  return match ? sanitizeTradeNameCandidate(match[1]) : null;
}

function containsArabicCharacters(value: string) {
  return ARABIC_CHAR_PATTERN.test(value);
}

function deriveTradeNamesFromMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) {
    return { english: null, arabic: null };
  }

  let english = extractLabeledSegment(trimmed, "english");
  let arabic = extractLabeledSegment(trimmed, "arabic");

  const seen = new Set<string>();
  QUOTED_TEXT_PATTERN.lastIndex = 0;
  let quoteMatch: RegExpExecArray | null;

  while ((quoteMatch = QUOTED_TEXT_PATTERN.exec(trimmed))) {
    const candidate = sanitizeTradeNameCandidate(quoteMatch[1]);
    if (!candidate || seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);

    if (containsArabicCharacters(candidate)) {
      if (!arabic) {
        arabic = candidate;
      }
    } else if (!english) {
      english = candidate;
    }

    if (english && arabic) {
      break;
    }
  }

  if (!english) {
    const triggerMatch = trimmed.match(CHAT_NAME_TRIGGER_PATTERN);
    if (triggerMatch) {
      english = sanitizeTradeNameCandidate(triggerMatch[1]);
    }
  }

  if (!english) {
    const fallbackMatch = trimmed.match(CHAT_TRADE_NAME_FALLBACK_PATTERN);
    if (fallbackMatch) {
      english = sanitizeTradeNameCandidate(fallbackMatch[1]);
    }
  }

  const resolvedEnglish = english && english.length > 1 ? english : null;
  const resolvedArabic = arabic && arabic.length > 1 ? arabic : null;

  return {
    english: resolvedEnglish,
    arabic: resolvedArabic,
  };
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
  onPolarisPrompt,
  showFinalDecisionEscalationControl = false,
}: {
  step: TradeNameVerificationStepWithStatus;
  index: number;
  totalSteps: number;
  onEscalate?: (stepTitle: string) => void;
  isEscalated?: boolean;
  activityOptions?: ActivityOption[];
  selectedActivityId?: string | null;
  onActivitySelect?: (activityId: string) => void;
  onPolarisPrompt?: (prompt: string, options?: { submit?: boolean }) => void;
  showFinalDecisionEscalationControl?: boolean;
}) {
  const isFailed = step.status === "failed";
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";
  const [detailLanguage, setDetailLanguage] = React.useState<"en" | "ar">("en");
  const failureDetailKey = React.useMemo(() => {
    if (typeof step.failureDetail === "string") {
      return step.failureDetail;
    }
    return step.failureDetail?.en ?? "";
  }, [step.failureDetail]);
  const [showFailureNarrative, setShowFailureNarrative] = React.useState(false);

  React.useEffect(() => {
    setDetailLanguage("en");
  }, [step.title, step.status]);

  React.useEffect(() => {
    setShowFailureNarrative(false);
  }, [isFailed, failureDetailKey]);

  const detailVariantStyles = React.useMemo(
    () => ({
      failed: {
        container:
          "border-[#0f766e]/30 bg-white px-3 py-2 text-sm text-[#0f766e]",
        label:
          "text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]",
        toggleWrap:
          "inline-flex items-center gap-1 rounded-full border border-[#0f766e]/30 bg-white/80 p-1",
        toggleActive:
          "min-w-[36px] rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] bg-[#0f766e] text-white shadow-[0_8px_20px_-10px_rgba(15,118,110,0.45)]",
        toggleInactive:
          "min-w-[36px] rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#0f766e]/10",
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
  narrativeOptions?: {
    activityOptions?: ActivityOption[];
    selectedActivityId?: string | null;
    onActivitySelect?: (activityId: string) => void;
  },
) => {
  const styles = detailVariantStyles[variant];
  const isLocalized = typeof detail !== "string";
  const narrativeText =
    typeof detail === "string" ? detail : detail[detailLanguage];

  const { activityOptions, selectedActivityId, onActivitySelect } =
    narrativeOptions ?? {};

  const parsedNarrative = parseAgentNarrative(narrativeText);
  const isArabicNarrative = isLocalized && detailLanguage === "ar";

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
        {parsedNarrative ? (
          <div
            className={cn(
              "space-y-3",
              isArabicNarrative ? "text-right" : "text-left",
            )}
            dir={isArabicNarrative ? "rtl" : "ltr"}
          >
            {parsedNarrative.heading ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {parsedNarrative.heading}
              </p>
            ) : null}
            <div className="space-y-2">
              {parsedNarrative.responses.map((item) => {
                const outcomeMeta = AGENT_OUTCOME_META[item.status];
                const normalizedTitle = item.title.toLowerCase();
                const shouldShowActivitySelector =
                  variant === "failed" &&
                  activityOptions &&
                  activityOptions.length > 0 &&
                  item.status === "info" &&
                  normalizedTitle.includes("activity compatibility agent");

                return (
                  <div
                    key={`${item.order}-${item.title}`}
                    className={cn(
                      "flex flex-col gap-2 rounded-2xl border border-[#e6f2ed] bg-white/80 p-3 shadow-sm",
                      isArabicNarrative && "text-right",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-start gap-3",
                        isArabicNarrative && "flex-row-reverse",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                          outcomeMeta.indicatorClassName,
                        )}
                      >
                        {item.order}
                      </span>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <Badge
                            className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                              outcomeMeta.badgeClassName,
                            )}
                          >
                            {outcomeMeta.label}
                          </Badge>
                        </div>
                        {item.detail ? (
                          <p className="text-sm text-slate-600">{item.detail}</p>
                        ) : null}
                      </div>
                    </div>
                    {shouldShowActivitySelector ? (
                      <div
                        className={cn(
                          "flex flex-wrap gap-2",
                          isArabicNarrative && "justify-end",
                        )}
                      >
                        {activityOptions?.map((option) => {
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
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-line">{narrativeText}</p>
        )}
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

  const polarisPrompt = React.useMemo(() => {
    const guidance = generatePolarisGuidanceFromFailure(step.failureDetail);
    return `Polaris, the ${step.title} check failed. ${guidance} Please suggest compliant trade name alternatives.`;
  }, [step.failureDetail, step.title]);

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
                {index === 0
                  ? "Decision Flow"
                  : `Step ${index + 1}/${totalSteps}: ${step.title}`}
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
            <button
              type="button"
              onClick={() => setShowFailureNarrative((previous) => !previous)}
              className="flex w-full items-center justify-between gap-2 rounded-2xl border border-[#0f766e]/30 bg-white px-4 py-3 text-left text-sm font-semibold text-[#0f766e] shadow-[0_18px_40px_-34px_rgba(15,118,110,0.35)] transition hover:border-[#0f766e]/45 hover:bg-[#0f766e]/5"
            >
              <span>View agent reasoning</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#0f766e] transition-transform",
                  showFailureNarrative && "rotate-180",
                )}
              />
            </button>
            {showFailureNarrative ? (
              <div className="space-y-3">
                {renderAgentNarrative(step.failureDetail, "failed", {
                  activityOptions,
                  selectedActivityId,
                  onActivitySelect,
                })}
                {onPolarisPrompt ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#0f766e]/25 bg-[#f4f9f7] px-4 py-3 text-xs text-[#0f766e]">
                    <span className="font-semibold uppercase tracking-[0.18em]">
                      Send follow-up via chat
                    </span>
                    <button
                      type="button"
                      onClick={() => onPolarisPrompt(polarisPrompt)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#0f766e]/10"
                    >
                      Draft in chat
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Tap to review the detailed agent transcript, then forward it to
                Polaris through the chat input below.
              </p>
            )}
            {isFailed && onEscalate ? (
              <button
                type="button"
                onClick={() => onEscalate(step.title)}
                disabled={isEscalated}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-90",
                  showFinalDecisionEscalationControl
                    ? isEscalated
                      ? "border-[#0f766e] bg-[#0f766e] text-white shadow-[0_16px_34px_-22px_rgba(15,118,110,0.55)]"
                      : "border-[#0f766e] bg-white text-[#0f766e] hover:bg-[#0f766e]/10"
                    : isEscalated
                      ? "border-rose-500 bg-rose-500 text-white shadow-[0_16px_34px_-22px_rgba(225,29,72,0.55)]"
                      : "border-rose-400 bg-white text-rose-500 hover:bg-rose-50 active:bg-rose-100",
                )}
              >
                {isEscalated
                  ? "Escalation sent"
                  : showFinalDecisionEscalationControl
                    ? "Escalate to DED reviewer"
                    : "Escalate to backend user"}
              </button>
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
  onPolarisPrompt,
}: BusinessRegistrationFocusContentProps) {
  const { toast } = useToast();
const [tradeNameGuidance, setTradeNameGuidance] = React.useState<
  string | null
>(null);
const forceActivityMismatchRef = React.useRef(false);
  const [currentFailureDetail, setCurrentFailureDetail] = React.useState<
    string | LocalizedAgentNarrative | null
  >(null);
  const [currentFailureContext, setCurrentFailureContext] = React.useState<
    | "similarity-conflict"
    | "activity-mismatch"
    | "missing-input"
    | "final-decision"
    | null
  >(null);
  const [suggestedIterationName, setSuggestedIterationName] = React.useState<string | null>(
    null,
  );
  const { setDocuments } = useDocumentVault();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const reservationTimeoutRef = React.useRef<number | null>(null);
  const verificationDispatchKeyRef = React.useRef<string | null>(null);

  const initialFormattedName = tradeName ? formatTradeName(tradeName) : "";

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
  const [selectedActivityId, setSelectedActivityId] = React.useState<
    string | null
  >(null);
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

  const handleActivitySelect = React.useCallback(
    (activityId: string) => {
      setSelectedActivityId(activityId);
      const activity = ACTIVITY_COMPATIBILITY_OPTIONS.find(
        (option) => option.id === activityId,
      );
      if (activity) {
        setTradeNameGuidance(
          `Activity alignment updated to ${activity.label}. Ask Polaris to rerun the checks once you confirm the plan.`,
        );
        toast({
          title: "Activity selected",
          description: `${activity.label} locked in for the next verification pass.`,
        });
      }
    },
    [setTradeNameGuidance, toast],
  );

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
      TRADE_NAME_CHECKS.find((step) => step.title === "Final decision engine")
        ?.successDetail ?? null,
    [],
  );

  const automationSteps = React.useMemo<
    TradeNameVerificationStepWithStatus[]
  >(() => {
    const failureDetail =
      failedStepIndex !== null
        ? currentFailureDetail ?? TRADE_NAME_CHECKS[failedStepIndex]?.failureDetail ?? null
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
    currentFailureDetail,
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
            evaluationSource?.english ?? englishDraft ?? "";
          const arabicDisplay = evaluationSource?.arabic ?? arabicDraft ?? "";
          const isSuccess =
            Boolean(normalizedName) && approvedNameSet.has(normalizedName);
          let resolvedFailureReason: string | null = null;

          setIsChecking(false);
          setIsNameAvailable(isSuccess);
          const shouldForceActivityMismatch =
            forceActivityMismatchRef.current &&
            normalizedName !== CONFLICTING_TRADE_NAME_NORMALIZED;

          if (isSuccess) {
            forceActivityMismatchRef.current = false;
            setFailedStepIndex(null);
            setFailureReason(null);
            setCurrentFailureDetail(null);
            setCurrentFailureContext(null);
            setSuggestedIterationName(null);
            setTradeNameGuidance(
              `All automation checks approved "${englishDisplay}". Continue with the reservation when ready.`,
            );
          } else if (normalizedName === CONFLICTING_TRADE_NAME_NORMALIZED) {
            forceActivityMismatchRef.current = true;
            resolvedFailureReason = `We couldn’t reserve ${englishDisplay}. ${PRIMARY_TRADE_NAME_EN} (${PRIMARY_TRADE_NAME_AR}) is already registered. Try a unique variation that aligns with your selected activity.`;
            const iterationSuggestion = suggestTradeNameIteration(englishDisplay);
            const conflictNarrative = buildSimilarityConflictNarrative(
              englishDisplay,
              iterationSuggestion,
            );
            setFailedStepIndex(DEFAULT_FAILURE_STEP_INDEX);
            setFailureReason(resolvedFailureReason);
            setCurrentFailureDetail(conflictNarrative);
            setCurrentFailureContext("similarity-conflict");
            setSuggestedIterationName(
              iterationSuggestion ? iterationSuggestion : null,
            );
            setTradeNameGuidance(
              iterationSuggestion
                ? `Similarity agent flagged "${englishDisplay}" for matching "${PRIMARY_TRADE_NAME_EN}". Try "${iterationSuggestion}" or ask Polaris for another variation.`
                : `Similarity agent flagged "${englishDisplay}" for matching "${PRIMARY_TRADE_NAME_EN}". Add a unique qualifier, then re-run the checks.`,
            );
          } else if (
            shouldForceActivityMismatch ||
            normalizedName === ACTIVITY_COMPATIBILITY_NAME
          ) {
            forceActivityMismatchRef.current = false;
            const activityAlignedSuggestion =
              suggestActivityAlignedTradeName(englishDisplay);
            const sanitizedIteration = activityAlignedSuggestion.trim();
            const iterationCandidate =
              sanitizedIteration &&
              sanitizedIteration.toUpperCase() !== normalizedName
                ? sanitizedIteration
                : "";
            resolvedFailureReason = `We couldn’t reserve ${englishDisplay}. Select the activity that best matches the heritage concept or adjust the trade name.`;
            setFailedStepIndex(ACTIVITY_FAILURE_STEP_INDEX);
            setFailureReason(resolvedFailureReason);
            setCurrentFailureDetail(
              TRADE_NAME_CHECKS[ACTIVITY_FAILURE_STEP_INDEX]?.failureDetail ?? null,
            );
            setCurrentFailureContext("activity-mismatch");
            setSuggestedIterationName(iterationCandidate || null);
            setTradeNameGuidance(
              iterationCandidate
                ? `Activity compatibility agent flagged "${englishDisplay}" as heritage-focused. Open the Guidance tab, select the activity that matches your concept, or try "${iterationCandidate}" before rerunning.`
                : "Activity compatibility agent flagged the concept as heritage-focused. Open the Guidance tab and choose the activity that matches your plan before rerunning the checks.",
            );
          } else if (normalizedName) {
            forceActivityMismatchRef.current = false;
            resolvedFailureReason = `Final decision engine rejected ${englishDisplay}. ESCALATE TO DED REVIEWER for manual adjudication.`;
            const finalDecisionNarrative =
              buildFinalDecisionRejectionNarrative(englishDisplay);
            setFailedStepIndex(FINAL_DECISION_FAILURE_STEP_INDEX);
            setFailureReason(resolvedFailureReason);
            setCurrentFailureDetail(finalDecisionNarrative);
            setCurrentFailureContext("final-decision");
            setSuggestedIterationName(null);
            setTradeNameGuidance(
              `Final decision engine rejected "${englishDisplay}". ESCALATE TO DED REVIEWER to continue the process.`,
            );
            toast({
              title: "ESCALATE TO DED REVIEWER",
              description: `Polaris recommends escalating "${englishDisplay}" for manual adjudication.`,
            });
          } else {
            forceActivityMismatchRef.current = false;
            resolvedFailureReason =
              "Enter both English and Arabic trade names before running the automated checks.";
            setFailedStepIndex(DEFAULT_FAILURE_STEP_INDEX);
            setFailureReason(resolvedFailureReason);
            setCurrentFailureDetail(
              TRADE_NAME_CHECKS[DEFAULT_FAILURE_STEP_INDEX]?.failureDetail ?? null,
            );
            setCurrentFailureContext("missing-input");
            setSuggestedIterationName(null);
            setTradeNameGuidance(
              "Add English and Arabic trade names before running the automated checks.",
            );
          }

          setPendingSubmission(null);
          setHasPerformedCheck(true);
          setActiveEnglishTradeName(englishDisplay);
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
    const formatted = tradeName ? formatTradeName(tradeName) : "";
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
    setCurrentFailureDetail(null);
    setCurrentFailureContext(null);
    setSuggestedIterationName(null);
    setTradeNameGuidance(null);
  }, [tradeName, isTradeNameAvailable, progressPercent]);

  React.useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isEditing]);

  React.useEffect(() => {
    if (isChecking || !hasPerformedCheck) {
      return;
    }

    const status = isNameAvailable ? "approved" : "rejected";
    const englishDisplay = activeEnglishTradeName || englishDraft || "";
    const arabicDisplay = activeArabicTradeName || arabicDraft || "";
    const failureDetail = status === "approved" ? null : failureReason ?? null;
    const draftPrompt = buildChatDraftFromContext(
      status,
      englishDisplay,
      currentFailureContext,
      suggestedIterationName,
    );
    const dispatchKey = [
      status,
      englishDisplay,
      arabicDisplay,
      failureDetail ?? "",
      draftPrompt ?? "",
      suggestedIterationName ?? "",
    ].join("|");

    if (verificationDispatchKeyRef.current === dispatchKey) {
      return;
    }

    verificationDispatchKeyRef.current = dispatchKey;

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("polarisTradeNameCheckComplete", {
            detail: {
              status,
              english: englishDisplay,
              arabic: arabicDisplay,
              failureReason: failureDetail,
              stageId: "trade-name-activities",
              draftPrompt,
              iterationSuggestion: suggestedIterationName ?? null,
            },
          }),
        );
      }, 0);
    }
  }, [
    isChecking,
    hasPerformedCheck,
    isNameAvailable,
    activeEnglishTradeName,
    activeArabicTradeName,
    englishDraft,
    arabicDraft,
    failureReason,
    currentFailureContext,
    suggestedIterationName,
  ]);

  const runChecksWithNames = React.useCallback(
    (englishName: string, arabicName: string) => {
      const formattedEnglish = formatTradeName(englishName);
      const formattedArabic = formatArabicName(arabicName);

      if (!formattedEnglish || !formattedArabic) {
        return false;
      }

      setCurrentFailureDetail(null);
      setCurrentFailureContext(null);
      setSuggestedIterationName(null);
      setTradeNameGuidance(null);
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

  const handleChatDrivenTradeName = React.useCallback(
    (message: string) => {
      if (!message || isChecking) {
        return;
      }

      const { english, arabic } = deriveTradeNamesFromMessage(message);
      if (!english) {
        return;
      }

      const formattedEnglish = formatTradeName(english);
      if (!formattedEnglish) {
        return;
      }

      const arabicSource =
        arabic && arabic.trim().length > 0
          ? arabic
          : transliterateToArabic(formattedEnglish);
      const formattedArabic = formatArabicName(arabicSource);

      if (!formattedArabic) {
        return;
      }

      const normalizedExistingEnglish = activeEnglishTradeName
        .trim()
        .toUpperCase();
      const normalizedIncomingEnglish = formattedEnglish.trim().toUpperCase();
      const normalizedExistingArabic = activeArabicTradeName.trim();

      if (
        normalizedExistingEnglish === normalizedIncomingEnglish &&
        normalizedExistingArabic === formattedArabic
      ) {
        return;
      }

      const succeeded = runChecksWithNames(formattedEnglish, formattedArabic);

      if (succeeded) {
        setTradeNameGuidance(
          `Synced with your chat adjustment. Polaris is re-running the checks for "${formattedEnglish}".`,
        );
        toast({
          title: "Re-running verification checks",
          description: `Polaris is processing the updated trade name ${formattedEnglish}.`,
        });
      } else {
        toast({
          title: "Update incomplete",
          description:
            "Include both English and Arabic trade names before submitting your chat adjustment.",
          variant: "destructive",
        });
      }
    },
    [
      activeArabicTradeName,
      activeEnglishTradeName,
      isChecking,
      runChecksWithNames,
      setTradeNameGuidance,
      toast,
    ],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (!detail || typeof detail.message !== "string") {
        return;
      }

      handleChatDrivenTradeName(detail.message);
    };

    window.addEventListener("polarisTradeNameChatSubmit", listener);

    return () => {
      window.removeEventListener("polarisTradeNameChatSubmit", listener);
    };
  }, [handleChatDrivenTradeName]);

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
      activeEnglishTradeName || englishDraft || "",
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
  const trimmedActiveEnglish = activeEnglishTradeName.trim();
  const hasDisplayedEnglishName =
    trimmedActiveEnglish.length > 0 || trimmedEnglishDraft.length > 0;
  const englishSummaryDisplay = hasDisplayedEnglishName
    ? trimmedActiveEnglish || trimmedEnglishDraft
    : "";

  const handleEnglishHotkey = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isSpaceKey =
        event.key === " " || event.code === "Space" || event.key === "Spacebar";
      if (!isSpaceKey) {
        return;
      }

      if (isChecking) {
        return;
      }

      const currentValue = event.currentTarget.value.trim();
      if (currentValue.length > 0) {
        return;
      }

      event.preventDefault();

      const formattedEnglish = formatTradeName(PRIMARY_TRADE_NAME_EN);
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
      setTradeNameGuidance(null);
    },
    [isChecking],
  );

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
                <h4
                  className={cn(
                    "text-xl font-semibold",
                    hasDisplayedEnglishName
                      ? "text-slate-900"
                      : "text-slate-400",
                  )}
                >
                  {englishSummaryDisplay}
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
                  <p
                    className={cn(
                      "mt-1 text-sm font-semibold",
                      hasDisplayedEnglishName
                        ? "text-slate-900"
                        : "text-slate-400",
                    )}
                  >
                    {englishSummaryDisplay}
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
                    const restoredEnglish =
                      activeEnglishTradeName || englishDraft || "";
                    setEnglishDraft(restoredEnglish);
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
                      onKeyDown={handleEnglishHotkey}
                      placeholder="Enter English trade name"
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
                          onPolarisPrompt={onPolarisPrompt}
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
