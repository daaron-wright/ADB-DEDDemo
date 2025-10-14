import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { useToast } from "@/hooks/use-toast";
import { chatCardClass } from "@/lib/chat-style";
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
    source: "Auto-fetched",
    sourceDetail: "Synced by AD Connect",
    status: "completed",
    actionLabel: "View contract",
    integrationBadge: "AD Connect",
  },
  {
    id: "memorandum-of-association",
    title: "Memorandum of Association (MOA)",
    description:
      "Drafted with your shareholder details and ready for notarisation with the Abu Dhabi Judicial Department.",
    source: "Awaiting notarisation",
    sourceDetail: "Prepared for ADJD",
    status: "requires_action",
    actionLabel: "Review with Omnis AI",
    integrationBadge: "ADJD",
  },
  {
    id: "founders-passports",
    title: "Shareholders’ Passports",
    description:
      "Securely stored copies of all shareholders’ passports, validated through your TAMM account login.",
    source: "Available",
    sourceDetail: "Uploaded previously",
    status: "completed",
    actionLabel: "Preview passport pack",
    integrationBadge: "TAMM",
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

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      disabled={disabled}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 text-left shadow-[0_28px_60px_-56px_rgba(15,23,42,0.4)] transition",
        isActive && "border-[#0f766e] bg-white",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-[#e6f2ed] bg-[#f7fbf9] text-[#0f766e]",
              isActive && "border-[#0f766e] text-[#0f766e]",
            )}
          >
            <FileText className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-500">{item.source}</p>
          </div>
        </div>
        <Badge
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            token.badgeClass,
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", token.dotClass)} />
          {token.label}
        </Badge>
      </div>
      <p className="text-sm text-slate-600">{item.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          {item.integrationBadge}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {item.sourceDetail}
        </span>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]">
        {item.actionLabel}
        <Download className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </button>
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

  const activeDocument = React.useMemo(
    () => documents.find((item) => item.id === activeDocumentId) ?? documents[0],
    [activeDocumentId, documents],
  );

  const allDocumentsCompleted = React.useMemo(
    () => documents.every((item) => item.status === "completed"),
    [documents],
  );

  const handleSelectDocument = React.useCallback((id: string) => {
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
                source: "Ready",
                sourceDetail: "Notarised via ADJD",
                actionLabel: "Download notarised MOA",
              }
            : item,
        ),
      );
      setIsFinalisingMoa(false);
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
  }, [documents]);

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

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section
        className={chatCardClass(
          "space-y-5 border border-white/25 bg-white/90 p-6 backdrop-blur-2xl shadow-[0_36px_84px_-60px_rgba(15,23,42,0.5)]",
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Journey number
              </p>
              <p className="text-lg font-semibold text-slate-900">{journeyNumber}</p>
            </div>
            <Badge className="inline-flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              Auto-fetch enabled
            </Badge>
          </div>

          <div className="space-y-4 rounded-[32px] border border-[#0f766e]/30 bg-[#0f766e]/5 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Step 3 • Document submission & licence issuance
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  Once-and-done paperwork vault
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[#0f766e]">
                Tenancy, MOA, and IDs synced automatically
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-[#e6f2ed]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0f766e] shadow-[0_1px_6px_rgba(15,118,110,0.35)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>Automation progress</span>
                <span>{progress}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Omnis keeps your document vault current by connecting to AD Connect, ADJD, TAMM, and AD Pay.
              Review anything that needs your signature, then we handle the rest until your licence is live.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/60 bg-white p-6 shadow-[0_28px_60px_-56px_rgba(15,23,42,0.4)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  My business documents
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Vault is pre-populated for Layla
                </p>
              </div>
              <Badge className="rounded-full border border-[#0f766e]/25 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Once and done
              </Badge>
            </div>
            <div className="space-y-3">
              {documents.map((item) => (
                <DocumentVaultCard
                  key={item.id}
                  item={item}
                  isActive={activeDocumentId === item.id}
                  onSelect={handleSelectDocument}
                  disabled={isFinalisingMoa && item.id === "memorandum-of-association"}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={chatCardClass(
          "space-y-5 border border-white/60 bg-white/92 p-6 shadow-[0_36px_84px_-60px_rgba(15,23,42,0.45)]",
        )}
      >
        {showMoaAssistant ? (
          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#0f766e]/25 bg-white">
                <AIBusinessOrb className="h-10 w-10" />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#0f766e] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  AI
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Omnis Guidance for MOA
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Abu Dhabi Judicial Department notarisation
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              We pre-filled the memorandum with shareholder allocations, business activities, and Arabic translations.
              Review the key clauses, ask Omnis anything, and sign digitally before we dispatch it to ADJD.
            </p>
            <div className="rounded-3xl border border-[#0f766e]/20 bg-[#0f766e]/5 p-5 text-sm text-[#0f766e]">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                  Company objects translated in Arabic and English for court submission.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                  Share capital allocation and director mandates already validated against your trade name.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                  Omnis will dispatch the signed MOA to ADJD and add the notarised PDF back here.
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleCompleteMoa}
                disabled={isFinalisingMoa}
                className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFinalisingMoa ? "Finalising with ADJD..." : "Sign & notarise MOA"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMoaAssistant(false)}
                className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
              >
                Close assistant
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#d8e4df] bg-white/80 p-6 text-sm text-slate-500">
            Select a document from the vault to review or reopen Omnis guidance for the MOA.
          </div>
        )}

        <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Final licence fee
              </p>
              <p className="text-base font-semibold text-slate-900">
                Settle via AD Pay to issue your licence
              </p>
            </div>
            <Badge className="rounded-full border border-[#0f766e]/25 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              AED 3,120
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            Once all documents are confirmed, AD Pay processes the issuance fee instantly. Omnis then pushes the licence
            to your digital wallet and AD Locker.
          </p>
          <Button
            type="button"
            onClick={handleInitiatePayment}
            disabled={!allDocumentsCompleted || hasPaid || isPaying}
            className="w-full rounded-full bg-[#0f766e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasPaid ? "Payment complete with AD Pay" : isPaying ? "Processing via AD Pay..." : "Pay and issue licence"}
          </Button>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tenancy (AD Connect) • MOA (ADJD) • Payment (AD Pay)
          </p>
        </div>

        <div className="rounded-3xl border border-[#d8e4df] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 text-[#0f766e]">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Licence confirmation
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Added to AD Locker & digital wallet
                </p>
              </div>
            </div>
            <Badge className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              licenseDetails ? "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]" : "border-slate-200 bg-white text-slate-400",
            )}>
              {licenseDetails ? "Issued" : "Pending"}
            </Badge>
          </div>
          {licenseDetails ? (
            <div className="mt-4 space-y-3 rounded-3xl border border-[#94d2c2] bg-[#dff2ec]/60 p-5 text-sm text-[#0b7d6f]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold uppercase tracking-[0.18em]">Licence number</span>
                <span className="text-base font-semibold">{licenseDetails.licenseNumber}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Issued on</p>
                  <p className="text-sm font-semibold">{licenseDetails.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Valid until</p>
                  <p className="text-sm font-semibold">{licenseDetails.expiryDate}</p>
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                We emailed the PDF, stored it in AD Locker, and synced it to your wallet for inspections.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Complete the final payment through AD Pay to generate your licence instantly. We will display the licence
              number and store it in AD Locker automatically.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
