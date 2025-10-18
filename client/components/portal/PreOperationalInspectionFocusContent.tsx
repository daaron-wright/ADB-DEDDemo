import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

import { StageSlideNavigator, type StageSlide } from "./StageSlideNavigator";

const POLARIS_AUTOMATION_AVATAR_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F12dc61b502f74026abe87288234cc2f1?format=webp&width=800";
const POLARIS_AUTOMATION_AVATAR_ALT = "Polaris automation emblem";

interface PreOperationalInspectionFocusContentProps {
  journeyNumber?: string;
}

type SubStepStatus =
  | "completed"
  | "in_progress"
  | "pending"
  | "scheduled"
  | "account_linked";

type BankAccountPhase = "link" | "in_progress" | "account_linked";

interface SubStep {
  id: string;
  label: string;
  authority?: string;
  status: SubStepStatus;
  isOptional?: boolean;
}

interface NextAction {
  subtitle: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled: boolean;
}

const INITIAL_SUB_STEPS: SubStep[] = [
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
];

const SUB_STEP_TOKENS: Record<
  SubStepStatus,
  { label: string; badgeClass: string; iconClass: string; dotClass: string }
> = {
  completed: {
    label: "Completed",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    iconClass: "text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
  account_linked: {
    label: "Account linked",
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
}: PreOperationalInspectionFocusContentProps) {
  const [checklistItems, setChecklistItems] = React.useState<SubStep[]>(() =>
    INITIAL_SUB_STEPS.map((item) => ({ ...item })),
  );
  const [bankAccountPhase, setBankAccountPhase] =
    React.useState<BankAccountPhase>("link");
  const [activeSlideId, setActiveSlideId] = React.useState<StageSlide["id"]>(
    "overview",
  );
  const hasAutomationAvatar = POLARIS_AUTOMATION_AVATAR_URL.length > 0;

  const handleBankAccountAdvance = React.useCallback(() => {
    setActiveSlideId("checklist");
    setBankAccountPhase((previousPhase) => {
      if (previousPhase !== "link") {
        return previousPhase;
      }

      setChecklistItems((previous) =>
        previous.map((item) =>
          item.id === "bank-account"
            ? { ...item, status: "in_progress" }
            : item,
        ),
      );
      return "in_progress";
    });
  }, []);

  React.useEffect(() => {
    if (bankAccountPhase !== "in_progress") {
      return;
    }

    const timer = window.setTimeout(() => {
      setChecklistItems((previous) =>
        previous.map((item) => {
          if (item.id === "bank-account") {
            return { ...item, status: "account_linked" };
          }

          if (item.status === "pending") {
            return { ...item, status: "scheduled" };
          }

          return item;
        }),
      );
      setBankAccountPhase("account_linked");
      setActiveSlideId((current) =>
        current === "overview" ? current : "automation",
      );
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bankAccountPhase]);

  const requiredItems = React.useMemo(
    () => checklistItems.filter((item) => !item.isOptional),
    [checklistItems],
  );

  const completedRequiredCount = React.useMemo(
    () =>
      requiredItems.filter(
        (item) =>
          item.status === "completed" || item.status === "account_linked",
      ).length,
    [requiredItems],
  );

  const totalRequired = requiredItems.length;

  const outstandingRequired = React.useMemo(
    () =>
      requiredItems.find(
        (item) => item.status !== "completed" && item.status !== "account_linked",
      ) ?? null,
    [requiredItems],
  );

  const outstandingOptional = React.useMemo(
    () =>
      checklistItems.find((item) => item.isOptional && item.status !== "completed") ??
      null,
    [checklistItems],
  );

  const checklistSummary = `${completedRequiredCount} of ${totalRequired} required complete`;
  const automationSubtitle =
    bankAccountPhase === "account_linked"
      ? "Automation synced with every authority"
      : "Automation keeps certificates aligned";

  const nextAction = React.useMemo<NextAction>(() => {
    if (outstandingRequired) {
      const subtitle = outstandingRequired.authority
        ? `${outstandingRequired.label} (${outstandingRequired.authority})`
        : outstandingRequired.label;

      if (outstandingRequired.id === "bank-account") {
        const buttonLabel =
          bankAccountPhase === "link"
            ? "Link corporate bank account"
            : "Linking in progress...";
        return {
          subtitle,
          description:
            bankAccountPhase === "link"
              ? "Link your corporate bank account so we can verify payments and payroll readiness."
              : "Polaris is linking your bank account. Keep an eye on the checklist for updates.",
          buttonLabel,
          onClick: handleBankAccountAdvance,
          disabled: bankAccountPhase !== "link",
        };
      }

      return {
        subtitle,
        description:
          "Review this item and confirm it is complete to keep the inspection on track.",
        buttonLabel: "Open checklist",
        onClick: () => setActiveSlideId("checklist"),
        disabled: false,
      };
    }

    if (outstandingOptional) {
      return {
        subtitle: `${outstandingOptional.label}${outstandingOptional.authority ? ` (${outstandingOptional.authority})` : ""}`,
        description:
          "Optional tasks are coordinated automatically. Review them if you want to add extra services before opening.",
        buttonLabel: "Review optional tasks",
        onClick: () => setActiveSlideId("checklist"),
        disabled: false,
      };
    }

    return {
      subtitle: "All critical tasks complete",
      description:
        "Monitor automation updates, or explore optional services while inspectors schedule their visits.",
      buttonLabel: "View automation",
      onClick: () => setActiveSlideId("automation"),
      disabled: false,
    };
  }, [
    outstandingRequired,
    outstandingOptional,
    bankAccountPhase,
    handleBankAccountAdvance,
  ]);

  const slides = React.useMemo<StageSlide[]>(
    () => [
      {
        id: "overview",
        heading: "Stage overview",
        description:
          "Final checks before opening — Polaris keeps certificates, banking, and services aligned for inspectors.",
        content: (
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
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Automation syncing
              </Badge>
            </div>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Step 4 • Pre-operational inspection
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Final checks before opening
                </h3>
                <p className="text-sm text-slate-600">
                  Polaris keeps compliance certificates, bank coordination, and optional services aligned so inspectors can clear your venue faster.
                </p>
              </div>
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Automation progress</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "action",
        heading: "Next action",
        description: nextAction.subtitle,
        content: (
          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <p className="text-sm text-slate-600">{nextAction.description}</p>
            <Button
              type="button"
              size="sm"
              onClick={nextAction.onClick}
              disabled={nextAction.disabled}
              className="self-start rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              {nextAction.buttonLabel}
            </Button>
          </div>
        ),
      },
      {
        id: "checklist",
        heading: "Inspection checklist",
        description: checklistSummary,
        content: (
          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.24)]">
            <p className="text-sm text-slate-600">
              We keep each certificate and service in sync with the issuing authority. Review any items that need your input.
            </p>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  bankAccountPhase={bankAccountPhase}
                  onLinkAccount={() => {
                    if (bankAccountPhase === "link") {
                      handleBankAccountAdvance();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: "automation",
        heading: "Automation assistant",
        description: automationSubtitle,
        content: (
          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#0f766e]/20 bg-white">
                {hasAutomationAvatar ? (
                  <img
                    src={POLARIS_AUTOMATION_AVATAR_URL}
                    alt={POLARIS_AUTOMATION_AVATAR_ALT}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <AIBusinessOrb className="h-9 w-9" />
                )}
                <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#0f766e] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  AI
                </span>
              </div>
              <div className="min-w-[160px] space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Live automation
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Coordinating inspections
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Polaris retrieves certificates, confirms inspectors, and updates your checklist in real time across ADCDA, ADAFSA, and service providers.
            </p>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>Automation progress</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [
      automationSubtitle,
      bankAccountPhase,
      checklistItems,
      checklistSummary,
      handleBankAccountAdvance,
      journeyNumber,
      nextAction,
      progress,
    ],
  );

  return (
    <StageSlideNavigator
      slides={slides}
      activeSlideId={activeSlideId}
      onSlideChange={setActiveSlideId}
      className="mt-6"
    />
  );
}

function ChecklistItem({
  item,
  bankAccountPhase,
  onLinkAccount,
}: {
  item: SubStep;
  bankAccountPhase: BankAccountPhase;
  onLinkAccount: () => void;
}) {
  const token = SUB_STEP_TOKENS[item.status];
  const isBankAccount = item.id === "bank-account";
  const badgeLabel =
    isBankAccount && bankAccountPhase === "link"
      ? "Link account"
      : token.label;

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border",
              (item.status === "completed" || item.status === "account_linked") &&
                "border-[#0f766e]/20 bg-[#0f766e]/10 text-[#0f766e]",
              item.status === "in_progress" &&
                "border-[#94d2c2] bg-[#dff2ec]/70 text-[#0b7d6f]",
              item.status === "pending" &&
                "border-slate-200 bg-white text-[#b97324]",
              item.status === "scheduled" &&
                "border-[#cdd7f8] bg-[#eef2ff] text-[#3446b0]",
            )}
          >
            {item.status === "in_progress" ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", token.iconClass)} />
            ) : item.status === "completed" || item.status === "account_linked" ? (
              <Check className={cn("h-4 w-4", token.iconClass)} strokeWidth={3} />
            ) : (
              <span className={cn("block h-2.5 w-2.5 rounded-full", token.dotClass)} />
            )}
          </span>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900">
                {item.label}
                {item.authority ? (
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    ({item.authority})
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>
                  {isBankAccount && bankAccountPhase === "link"
                    ? "Connect the account used for operations."
                    : token.label}
                </span>
                {item.isOptional ? (
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Optional
                  </span>
                ) : null}
              </div>
            </div>
            {isBankAccount ? (
              <Button
                type="button"
                onClick={() => {
                  if (bankAccountPhase === "link") {
                    onLinkAccount();
                  }
                }}
                disabled={bankAccountPhase !== "link"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  bankAccountPhase === "link"
                    ? "bg-[#0f766e] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059]"
                    : "bg-[#0f766e]/10 text-[#0f766e] opacity-80",
                )}
              >
                {bankAccountPhase === "link" ? (
                  "Link corporate bank account"
                ) : bankAccountPhase === "in_progress" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Linking...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Account linked</span>
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
        <Badge
          className={cn(
            "self-start border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            token.badgeClass,
            isBankAccount && bankAccountPhase === "link" &&
              "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
          )}
        >
          {badgeLabel}
        </Badge>
      </div>
    </div>
  );
}
