import * as React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

import { StageSlideNavigator, type StageSlide } from "./StageSlideNavigator";
import { PRIMARY_TRADE_NAME_AR } from "./trade-name-constants";

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
type WalkthroughSyncStatus = "idle" | "processing" | "ready";

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

const TRADE_NAME_AR = PRIMARY_TRADE_NAME_AR ?? "";

const PREOP_INSPECTION_IMAGES = [
  {
    id: "preop-exterior",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fff05a88e849e4b6d92be288131e17239?format=webp&width=1200",
    alt: "Exterior signboard detection outside Marwah Restaurant",
    caption: "Exterior signboard clearance",
  },
  {
    id: "preop-dining",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F917fd001495640468cc0b57b4a90beb8?format=webp&width=1200",
    alt: "Dining room walkthrough with detection overlays",
    caption: "Dining zone readiness",
  },
  {
    id: "preop-storage",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F376ee5cec4e8415c8a993ebbbe764879?format=webp&width=1200",
    alt: "Storage shelves with compliance annotations",
    caption: "Storage compliance",
  },
  {
    id: "preop-egress",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F560a466b672c40c5b9eea38c5cb30493?format=webp&width=1200",
    alt: "Emergency exit routes highlighted in dining room",
    caption: "Egress validation",
  },
  {
    id: "preop-kitchen",
    src: "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F4bc52f802a844bc1956968eb744f64ae?format=webp&width=1200",
    alt: "Kitchen equipment annotated for compliance",
    caption: "Kitchen inspection",
  },
] as const;

const MEGABYTE = 1024 * 1024;
const MAX_WALKTHROUGH_SIZE_BYTES = 2 * 1024 * 1024 * 1024;
const formatWalkthroughSize = (bytes: number) => `${(bytes / MEGABYTE).toFixed(2)} MB`;

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
  const walkthroughInputRef = React.useRef<HTMLInputElement | null>(null);
  const [walkthroughStatus, setWalkthroughStatus] =
    React.useState<WalkthroughSyncStatus>("idle");
  const uploadTimerRef = React.useRef<number | null>(null);
  const galleryTimerRef = React.useRef<number | null>(null);
  const [walkthroughFile, setWalkthroughFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = React.useState(0);
  const [reviewedImageIndices, setReviewedImageIndices] = React.useState<
    Set<number>
  >(() => new Set<number>());
  const [hasInspectionApproval, setHasInspectionApproval] = React.useState(false);
  const [activeSlideId, setActiveSlideId] = React.useState<StageSlide["id"]>(
    "overview",
  );
  const hasAutomationAvatar = POLARIS_AUTOMATION_AVATAR_URL.length > 0;
  const galleryLength = PREOP_INSPECTION_IMAGES.length;

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

  const resetWalkthroughInput = React.useCallback(() => {
    if (walkthroughInputRef.current) {
      walkthroughInputRef.current.value = "";
    }
  }, []);

  const handleWalkthroughButtonClick = React.useCallback(() => {
    if (walkthroughStatus === "processing") {
      return;
    }
    walkthroughInputRef.current?.click();
  }, [walkthroughStatus]);

  const handleAdvanceGallery = React.useCallback(() => {
    setActiveGalleryIndex((previousIndex) => {
      if (previousIndex === -1) {
        return -1;
      }
      const nextIndex = (previousIndex + 1) % galleryLength;
      setReviewedImageIndices((prev) => {
        const updated = new Set(prev);
        if (previousIndex >= 0) {
          updated.add(previousIndex);
        }
        return updated;
      });
      return nextIndex;
    });
  }, [galleryLength]);

  const handleWalkthroughSelect = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("video/")) {
        setUploadError("Upload MP4, MOV, or WebM footage.");
        setWalkthroughFile(null);
        setWalkthroughStatus("idle");
        setHasInspectionApproval(false);
        setReviewedImageIndices(() => new Set<number>());
        setActiveGalleryIndex(0);
        resetWalkthroughInput();
        return;
      }

      if (file.size > MAX_WALKTHROUGH_SIZE_BYTES) {
        setUploadError("Each walkthrough must be 2 GB or smaller before encryption.");
        setWalkthroughFile(null);
        setWalkthroughStatus("idle");
        setHasInspectionApproval(false);
        setReviewedImageIndices(() => new Set<number>());
        setActiveGalleryIndex(0);
        resetWalkthroughInput();
        return;
      }

      setUploadError(null);
      setHasInspectionApproval(false);
      setReviewedImageIndices(() => new Set<number>());
      setWalkthroughFile(file);
      setWalkthroughStatus("processing");
      setActiveGalleryIndex(0);

      if (uploadTimerRef.current) {
        window.clearTimeout(uploadTimerRef.current);
      }

      const timer = window.setTimeout(() => {
        setWalkthroughStatus("ready");
        uploadTimerRef.current = null;
      }, 1200);

      uploadTimerRef.current = timer;
      resetWalkthroughInput();
    },
    [resetWalkthroughInput],
  );

  React.useEffect(() => {
    if (walkthroughStatus !== "ready" || hasInspectionApproval || galleryLength === 0) {
      if (galleryTimerRef.current) {
        window.clearInterval(galleryTimerRef.current);
        galleryTimerRef.current = null;
      }
      return;
    }

    if (galleryTimerRef.current) {
      window.clearInterval(galleryTimerRef.current);
    }

    const timer = window.setInterval(() => {
      handleAdvanceGallery();
    }, 2600);

    galleryTimerRef.current = timer;

    return () => {
      window.clearInterval(timer);
      galleryTimerRef.current = null;
    };
  }, [
    walkthroughStatus,
    hasInspectionApproval,
    galleryLength,
    handleAdvanceGallery,
  ]);

  React.useEffect(() => {
    if (walkthroughStatus !== "ready") {
      setReviewedImageIndices(() => new Set<number>());
      setHasInspectionApproval(false);
      setActiveGalleryIndex(0);
    }
  }, [walkthroughStatus]);

  React.useEffect(() => {
    if (
      !hasInspectionApproval &&
      galleryLength > 0 &&
      reviewedImageIndices.size >= galleryLength
    ) {
      setHasInspectionApproval(true);
    }
  }, [hasInspectionApproval, reviewedImageIndices, galleryLength]);

  React.useEffect(() => {
    if (!hasInspectionApproval) {
      return;
    }

    if (galleryTimerRef.current) {
      window.clearInterval(galleryTimerRef.current);
      galleryTimerRef.current = null;
    }

    setReviewedImageIndices((prev) => {
      if (prev.size >= galleryLength) {
        return prev;
      }
      const completed = new Set<number>();
      for (let index = 0; index < galleryLength; index += 1) {
        completed.add(index);
      }
      return completed;
    });

    if (activeGalleryIndex !== -1) {
      setActiveGalleryIndex(-1);
    }
  }, [hasInspectionApproval, galleryLength, activeGalleryIndex]);

  React.useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        window.clearTimeout(uploadTimerRef.current);
        uploadTimerRef.current = null;
      }
      if (galleryTimerRef.current) {
        window.clearInterval(galleryTimerRef.current);
        galleryTimerRef.current = null;
      }
    };
  }, []);

  const isWalkthroughProcessing = walkthroughStatus === "processing";
  const isWalkthroughReady = walkthroughStatus === "ready";
  const activeInspectionImage =
    activeGalleryIndex >= 0
      ? PREOP_INSPECTION_IMAGES[activeGalleryIndex] ?? null
      : null;

  const requiredItems = React.useMemo(
    () => checklistItems.filter((item) => !item.isOptional),
    [checklistItems],
  );

  const optionalItems = React.useMemo(
    () => checklistItems.filter((item) => item.isOptional),
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
    () => optionalItems.find((item) => item.status !== "completed") ?? null,
    [optionalItems],
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
                {TRADE_NAME_AR ? (
                  <p className="mt-1 text-sm font-semibold text-[#0f766e]" dir="rtl">
                    {TRADE_NAME_AR}
                  </p>
                ) : null}
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
              <p className="text-sm text-slate-600">
                Automation runs in the background—when something needs you, it appears in the checklist immediately.
              </p>
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
              {requiredItems.map((item) => (
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
            {optionalItems.length > 0 ? (
              <div className="rounded-3xl border border-[#d8e4df] bg-[#f8fbfa] p-5 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Non-mandatory services
                  </p>
                  <p className="text-sm text-slate-600">
                    These optional services stay coordinated with their authorities and can be reviewed whenever you need them.
                  </p>
                </div>
                <Accordion type="single" collapsible className="mt-4 space-y-3">
                  {optionalItems.map((item) => {
                    const token = SUB_STEP_TOKENS[item.status];
                    return (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="overflow-hidden rounded-2xl border border-[#e6f2ed] bg-white"
                      >
                        <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:no-underline">
                          <div className="flex flex-col gap-1 text-left">
                            <span>
                              {item.label}
                              {item.authority ? (
                                <span className="ml-1 text-xs font-normal uppercase tracking-[0.16em] text-slate-500">
                                  {`(${item.authority})`}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Optional service
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              token.badgeClass,
                            )}
                          >
                            {token.label}
                          </Badge>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-0 text-sm text-slate-600">
                          Polaris keeps this optional service scheduled with the relevant authority. Expand whenever you want to update details or confirm readiness.
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ) : null}
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
                {TRADE_NAME_AR ? (
                  <p className="text-sm font-semibold text-[#0f766e]" dir="rtl">
                    {TRADE_NAME_AR}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Polaris retrieves certificates, confirms inspectors, and updates your checklist in real time across ADCDA, ADAFSA, and service providers.
            </p>
            <div className="overflow-hidden rounded-3xl border border-[#d8e4df] bg-white shadow-[0_20px_52px_-38px_rgba(15,23,42,0.28)]">
              <div className="flex flex-wrap items-center justify-between gap-3 p-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Inspection photo library
                  </p>
                  <p className="text-sm text-slate-600">
                    Full-width captures sync after your walkthrough upload completes.
                  </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                  <Button
                    type="button"
                    onClick={handleWalkthroughButtonClick}
                    disabled={isWalkthroughProcessing}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_-30px_rgba(15,118,110,0.55)] transition hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:bg-[#0f766e]/30"
                  >
                    {isWalkthroughProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isWalkthroughReady ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Walkthrough synced</span>
                      </>
                    ) : (
                      <span>Upload walkthrough</span>
                    )}
                  </Button>
                  <input
                    ref={walkthroughInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/mov,video/*"
                    className="hidden"
                    onChange={handleWalkthroughSelect}
                  />
                  <p className="text-[11px] text-slate-400 sm:text-right">
                    Accepted formats: MP4, MOV, WebM · Max 2 GB
                  </p>
                  {walkthroughFile ? (
                    <p className="text-[11px] text-slate-500 sm:text-right">
                      Selected
                      {" "}
                      <span className="font-semibold text-slate-900">
                        {walkthroughFile.name}
                      </span>
                      {" "}· {formatWalkthroughSize(walkthroughFile.size)}
                      {isWalkthroughProcessing ? (
                        <span className="text-[#0f766e]"> · Syncing...</span>
                      ) : null}
                      {isWalkthroughReady ? (
                        <span className="text-[#0f766e]"> · Synced</span>
                      ) : null}
                    </p>
                  ) : null}
                  {uploadError ? (
                    <p aria-live="polite" className="text-[11px] font-semibold text-[#b91c1c] sm:text-right">
                      {uploadError}
                    </p>
                  ) : null}
                </div>
              </div>
              {isWalkthroughReady ? (
                <>
                  <div className="border-t border-[#d8e4df]/80 bg-[#f9fbfd] px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {hasInspectionApproval
                            ? "Inspection walkthrough approved"
                            : "Inspection walkthrough in progress"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {hasInspectionApproval
                            ? "Polaris confirmed coverage across every capture. Proceed to compliance when you're ready."
                            : `Polaris is stepping through ${galleryLength} synced captures automatically.`}
                        </p>
                      </div>
                      {hasInspectionApproval ? (
                        <Badge className="rounded-full border border-[#0f766e]/35 bg-[#0f766e] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          Inspection approved
                        </Badge>
                      ) : activeInspectionImage ? (
                        <Badge className="flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#eaf7f3] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                          <span>Now reviewing</span>
                          <span className="text-[#0f766e]/80">
                            {activeInspectionImage.caption}
                          </span>
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  {hasInspectionApproval ? (
                    <div className="border-t border-[#d8e4df]/80 bg-[#ecfdf5] px-6 py-4">
                      <div className="flex items-start gap-3 rounded-2xl border border-[#0f766e]/25 bg-white/70 p-4 text-sm text-[#0f766e] shadow-[0_26px_58px_-48px_rgba(15,118,110,0.4)]">
                        <Check className="mt-0.5 h-4 w-4" strokeWidth={3} />
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                            Inspection approval received
                          </p>
                          <p className="text-sm">
                            Walkthrough evidence is filed with DED inspectors. Continue to the compliance stage when ready.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 gap-[2px] bg-[#d8e4df]/40 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {PREOP_INSPECTION_IMAGES.map((image, index) => {
                      const isActive = !hasInspectionApproval && index === activeGalleryIndex;
                      const hasBeenReviewed = reviewedImageIndices.has(index);
                      return (
                        <figure
                          key={image.id}
                          className={cn(
                            "group relative overflow-hidden border border-[#d8e4df]/80 bg-white transition duration-500",
                            isActive
                              ? "z-[1] scale-[1.01] shadow-[0_30px_68px_-42px_rgba(15,23,42,0.45)] ring-2 ring-[#0f766e]"
                              : hasBeenReviewed
                                ? "opacity-100 shadow-[0_18px_46px_-40px_rgba(15,23,42,0.32)]"
                                : "opacity-70 hover:opacity-100",
                          )}
                        >
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            <span>{image.caption}</span>
                            <div className="flex items-center gap-2">
                              {isActive ? (
                                <span className="rounded-full border border-[#94d2c2] bg-[#0f766e]/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#94d2c2]">
                                  Now reviewing
                                </span>
                              ) : hasBeenReviewed ? (
                                <span className="rounded-full bg-[#0f766e] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                                  Pass
                                </span>
                              ) : (
                                <span className="rounded-full border border-white/50 bg-white/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/80">
                                  Queued
                                </span>
                              )}
                            </div>
                          </figcaption>
                        </figure>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="border-t border-[#d8e4df]/80 bg-[#f9fbfd] px-6 py-12">
                  <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#d8e4df] bg-white/70 p-8 text-center">
                    <p className="text-sm font-semibold text-slate-900">
                      No walkthrough uploaded yet
                    </p>
                    <p className="text-xs text-slate-500">
                      Upload your pre-operational video walkthrough to unlock the inspection photo gallery. Polaris auto-populates frames once the footage syncs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [
      activeGalleryIndex,
      activeInspectionImage,
      automationSubtitle,
      bankAccountPhase,
      checklistItems,
      checklistSummary,
      galleryLength,
      handleBankAccountAdvance,
      handleWalkthroughButtonClick,
      handleWalkthroughSelect,
      hasInspectionApproval,
      isWalkthroughProcessing,
      isWalkthroughReady,
      journeyNumber,
      nextAction,
      reviewedImageIndices,
      uploadError,
      walkthroughFile,
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
