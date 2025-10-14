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
import { cn } from "@/lib/utils";
import { Check, Download, FileText, Wallet } from "lucide-react";

interface DocumentSubmissionFocusContentProps {
  journeyNumber?: string;
  progressPercent?: number;
}

type DocumentStatus = "ready" | "requires_action" | "completed";

type DocumentVaultItem = {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceDetail: string;
  status: DocumentStatus;
  actionLabel: string;
  integrationBadge: string;
  isExpanded: boolean;
};

type LicenseDetails = {
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
};

const DOCUMENT_VAULT_SOURCE_LABEL = 'Synced from "My Business Documents" Vault';

const statusTokens: Record<
  DocumentStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ready: {
    label: "Ready",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    dotClass: "bg-[#0b7d6f]",
  },
  requires_action: {
    label: "Needs review",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    dotClass: "bg-[#b97324]",
  },
  completed: {
    label: "Complete",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
};

const INITIAL_DOCUMENTS: DocumentVaultItem[] = [
  {
    id: "tenancy-contract",
    title: "Tenancy Contract",
    description:
      "Omnis pulled your stamped tenancy contract directly from Tamkeen via AD Connect.",
    source: DOCUMENT_VAULT_SOURCE_LABEL,
    sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
    status: "completed",
    actionLabel: "View contract",
    integrationBadge: "AD Connect",
    isExpanded: false,
  },
  {
    id: "memorandum-of-association",
    title: "Memorandum of Association (MOA)",
    description:
      "Drafted with your shareholder details and ready for notarisation with the Abu Dhabi Judicial Department.",
    source: DOCUMENT_VAULT_SOURCE_LABEL,
    sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
    status: "requires_action",
    actionLabel: "Review with Omnis AI",
    integrationBadge: "ADJD",
    isExpanded: true,
  },
  {
    id: "founders-passports",
    title: "Shareholders’ Passports",
    description:
      "Securely stored copies of all shareholders’ passports, validated through your TAMM account login.",
    source: DOCUMENT_VAULT_SOURCE_LABEL,
    sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
    status: "completed",
    actionLabel: "Preview passport pack",
    integrationBadge: "TAMM",
    isExpanded: false,
  },
];

function DocumentVaultCard({
  item,
  isActive,
  onSelect,
  disabled,
}: {
  item: DocumentVaultItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const token = statusTokens[item.status];
  const isCompleted = item.status === "completed";

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      disabled={disabled}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 text-left shadow-[0_28px_60px_-56px_rgba(15,23,42,0.4)] transition",
        isActive && !isCompleted && "border-[#0f766e] bg-white",
        isCompleted && "border-[#d8e4df] bg-[#f8fbfa] text-slate-500",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-[#e6f2ed] bg-[#f7fbf9] text-[#0f766e] transition",
              isActive && !isCompleted && "border-[#0f766e] text-[#0f766e]",
              isCompleted && "border-[#d8e4df] bg-white text-[#94a3b8]",
            )}
          >
            <FileText className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p
              className={cn(
                "text-sm font-semibold",
                isCompleted ? "text-slate-500 line-through decoration-[#94d2c2]" : "text-slate-900",
              )}
            >
              {item.title}
            </p>
            <p className={cn("text-xs", isCompleted ? "text-slate-400" : "text-slate-500")}>{item.source}</p>
          </div>
        </div>
        <Badge
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            token.badgeClass,
            isCompleted && "border-[#d8e4df] bg-white text-[#0f766e]",
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", token.dotClass)} />
          {isCompleted ? "Stored" : token.label}
        </Badge>
      </div>
      <p className={cn("text-sm", isCompleted ? "text-slate-500" : "text-slate-600")}>{item.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            isCompleted ? "border-[#d8e4df] bg-white text-slate-400" : "border-[#0f766e]/30 bg-[#0f766e]/5 text-[#0f766e]",
          )}
        >
          {item.integrationBadge}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {item.sourceDetail}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold",
          isCompleted ? "text-slate-400" : "text-[#0f766e]",
        )}
      >
        {isCompleted ? "Document stored" : item.actionLabel}
        <Download
          className={cn(
            "h-4 w-4",
            isCompleted ? "opacity-40" : "transition group-hover:translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

function CollapsibleCard({
  value,
  title,
  subtitle,
  contentId,
  children,
}: {
  value: string;
  title: string;
  subtitle?: React.ReactNode;
  contentId?: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-3xl border border-[#d8e4df] bg-white shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]"
    >
      <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-slate-900 hover:no-underline">
        <div className="flex flex-1 flex-col text-left">
          <span>{title}</span>
          {subtitle ? (
            <span className="mt-1 text-sm font-normal text-slate-500">{subtitle}</span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent id={contentId} className="px-5 pb-5 pt-0">
        <div className="space-y-4 pt-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function DocumentSubmissionFocusContent({
  journeyNumber = "0987654321",
  progressPercent = 72,
}: DocumentSubmissionFocusContentProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = React.useState<DocumentVaultItem[]>(INITIAL_DOCUMENTS);
  const [activeDocumentId, setActiveDocumentId] = React.useState<string>(INITIAL_DOCUMENTS[1].id);
  const [showMoaAssistant, setShowMoaAssistant] = React.useState(true);
  const [isFinalisingMoa, setIsFinalisingMoa] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [hasPaid, setHasPaid] = React.useState(false);
  const [licenseDetails, setLicenseDetails] = React.useState<LicenseDetails | null>(null);
  const [progress, setProgress] = React.useState(progressPercent);

  const completionTimeoutRef = React.useRef<number | null>(null);
  const paymentTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
      if (paymentTimeoutRef.current) {
        window.clearTimeout(paymentTimeoutRef.current);
      }
    };
  }, []);

  const allDocumentsCompleted = React.useMemo(
    () => documents.every((item) => item.status === "completed"),
    [documents],
  );

  const handleSelectDocument = React.useCallback((id: string) => {
    setDocuments((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              isExpanded: item.status !== "completed",
            }
          : {
              ...item,
              isExpanded: false,
            },
      ),
    );
    setActiveDocumentId(id);
    setShowMoaAssistant(id === "memorandum-of-association");
  }, []);

  const handleCompleteMoa = React.useCallback(() => {
    if (isFinalisingMoa || activeDocumentId !== "memorandum-of-association") {
      return;
    }

    setIsFinalisingMoa(true);
    completionTimeoutRef.current = window.setTimeout(() => {
      setDocuments((previous) =>
        previous.map((item) =>
          item.id === "memorandum-of-association"
            ? {
                ...item,
                status: "completed" as const,
                source: DOCUMENT_VAULT_SOURCE_LABEL,
                sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
                actionLabel: "Download notarised MOA",
                isExpanded: false,
              }
            : item,
        ),
      );
      setIsFinalisingMoa(false);
      setShowMoaAssistant(false);
      setProgress((value) => Math.max(value, 88));
      toast({
        title: "MOA notarised",
        description: "ADJD sent back the stamped memorandum. We added it to your vault.",
      });
    }, 1200);
  }, [activeDocumentId, isFinalisingMoa, toast]);

  React.useEffect(() => {
    if (documents.some((item) => item.status !== "completed")) {
      return;
    }

    setProgress((value) => Math.max(value, 92));

    if (documents.some((item) => item.status === "completed" && item.isExpanded)) {
      setDocuments((previous) =>
        previous.map((item) =>
          item.status === "completed"
            ? {
                ...item,
                isExpanded: false,
              }
            : item,
        ),
      );
    }
  }, [documents]);

  const completedDocumentsCount = React.useMemo(
    () => documents.filter((item) => item.status === "completed").length,
    [documents],
  );

  const pendingDocument = React.useMemo(
    () => documents.find((item) => item.status !== "completed") ?? null,
    [documents],
  );

  const handleInitiatePayment = React.useCallback(() => {
    if (isPaying || hasPaid || !allDocumentsCompleted) {
      return;
    }

    setIsPaying(true);
    toast({
      title: "Opening AD Pay",
      description: "Pay the final licence issuance fee to move into operations.",
    });

    paymentTimeoutRef.current = window.setTimeout(() => {
      setIsPaying(false);
      setHasPaid(true);
      setProgress(100);
      const issuedLicense: LicenseDetails = {
        licenseNumber: "CN-7845126",
        issueDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "short", year: "numeric" },
        ),
      };
      setLicenseDetails(issuedLicense);
      toast({
        title: "Licence issued",
        description: "We pushed the licence PDF to your AD Locker and digital wallet.",
      });
    }, 1600);
  }, [allDocumentsCompleted, hasPaid, isPaying, toast]);

  const defaultOpenSections = React.useMemo(() => {
    const sections = ["action", "vault"];
    if (showMoaAssistant) {
      sections.push("moa");
    }
    if (allDocumentsCompleted) {
      sections.push("payment");
    }
    if (licenseDetails) {
      sections.push("license");
    }
    return sections;
  }, [allDocumentsCompleted, licenseDetails, showMoaAssistant]);

  const [openSections, setOpenSections] = React.useState<string[]>(defaultOpenSections);

  React.useEffect(() => {
    setOpenSections((previous) => {
      const merged = new Set(previous);
      defaultOpenSections.forEach((section) => merged.add(section));
      return Array.from(merged);
    });
  }, [defaultOpenSections]);

  const ensureSectionOpen = React.useCallback((sectionId: string) => {
    setOpenSections((previous) =>
      previous.includes(sectionId) ? previous : [...previous, sectionId],
    );
  }, []);

  const scrollToElement = React.useCallback((elementId: string) => {
    document
      .getElementById(elementId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDocumentClick = React.useCallback(
    (id: string) => {
      ensureSectionOpen("vault");
      handleSelectDocument(id);
      if (id === "memorandum-of-association") {
        ensureSectionOpen("moa");
      }
      scrollToElement("submit-stage-vault");
    },
    [ensureSectionOpen, handleSelectDocument, scrollToElement],
  );

  const nextAction = React.useMemo(
    () => {
      if (pendingDocument) {
        const isMoa = pendingDocument.id === "memorandum-of-association";
        return {
          subtitle: pendingDocument.title,
          description: isMoa
            ? "Open the MOA to review and notarise it."
            : "Open the document and confirm it is ready.",
          buttonLabel: `Review ${pendingDocument.title}`,
          onClick: () => {
            handleDocumentClick(pendingDocument.id);
          },
          disabled: false,
        } as const;
      }

      if (!hasPaid) {
        return {
          subtitle: "Pay the issuance fee",
          description: "All documents are ready. Complete payment to issue the licence.",
          buttonLabel: isPaying ? "Processing via AD Pay..." : "Pay with AD Pay",
          onClick: () => {
            ensureSectionOpen("payment");
            scrollToElement("submit-stage-payment");
            if (!isPaying) {
              handleInitiatePayment();
            }
          },
          disabled: isPaying,
        } as const;
      }

      return {
        subtitle: "Licence issued",
        description: "View the licence number and download your documents.",
        buttonLabel: "View licence details",
        onClick: () => {
          ensureSectionOpen("license");
          scrollToElement("submit-stage-license");
        },
        disabled: false,
      } as const;
    },
    [
      ensureSectionOpen,
      handleDocumentClick,
      handleInitiatePayment,
      hasPaid,
      isPaying,
      pendingDocument,
      scrollToElement,
    ],
  );

  const vaultSubtitle = `${completedDocumentsCount}/${documents.length} documents ready`;
  const moaSubtitle = showMoaAssistant
    ? "Omnis guidance for notarisation"
    : "Assistant closed — reopen anytime";
  const paymentSubtitle = hasPaid ? "Paid via AD Pay" : "AED 3,120 via AD Pay";
  const licenceSubtitle = licenseDetails ? "Stored in AD Locker" : "Issued after payment";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    </div>
  );
}
