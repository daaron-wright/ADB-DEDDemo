import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, Wallet } from "lucide-react";
import { CollapsibleCard } from "./StageCollapsibleCard";
import { MyTAMMDocuments } from "./MyTAMMDocuments";
import { DocumentVaultCard } from "./DocumentVaultCard";
import { DocumentVaultLayout } from "./DocumentVaultLayout";
import { useDocumentVault } from "./DocumentVaultContext";
import { DOCUMENT_VAULT_SOURCE_LABEL } from "./document-vault-data";
import { PRIMARY_TRADE_NAME_EN, TRADE_NAME_RECEIPT_DOCUMENT_ID } from "./trade-name-constants";

interface DocumentSubmissionFocusContentProps {
  journeyNumber?: string;
  progressPercent?: number;
}

type LicenseDetails = {
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
};

const INITIAL_MOA_CLAUSE_DRAFT = `Custom Article 7 — Capital contributions & profit distribution

Each shareholder contributes AED 375,000, establishing AED 1,500,000 in paid-up capital. Profits are distributed quarterly in proportion to equity unless unanimously resolved otherwise.`;
const POLARIS_RECOMMENDED_MOA_CLAUSE = `Custom Article 7 — Capital contributions & profit distribution
المادة 7 — ا��مساهمات ا��رأسمالية وتو��يع الأرب����ح

Each shareholder contributes AED 375,000, establishing AED 1,500,000 in paid-up capital. Profits are distributed quarterly in proportion to equity unless unanimously resolved otherwise. Distributions shall be supported by audited management accounts and bilingual notices issued at least five (5) working days in advance. Polaris simulation includes bilingual notices and an ADJD review cover letter.`;


export function DocumentSubmissionFocusContent({
  journeyNumber = "0987654321",
  progressPercent = 72,
}: DocumentSubmissionFocusContentProps) {
  const { toast } = useToast();
  const {
    documents,
    setDocuments,
    isVaultSyncing,
    triggerVaultSync,
    totalDocuments,
    completedDocuments,
    allDocumentsCompleted,
  } = useDocumentVault();

  const [activeDocumentId, setActiveDocumentId] = React.useState<string>("memorandum-of-association");
  const [showMoaAssistant, setShowMoaAssistant] = React.useState(true);
  const [isFinalisingMoa, setIsFinalisingMoa] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [hasPaid, setHasPaid] = React.useState(false);
  const [licenseDetails, setLicenseDetails] = React.useState<LicenseDetails | null>(null);
  const [progress, setProgress] = React.useState(progressPercent);
  const [moaClauseDraft, setMoaClauseDraft] = React.useState<string>(INITIAL_MOA_CLAUSE_DRAFT);
  const [moaEditorNotes, setMoaEditorNotes] = React.useState<string>(
    "Polaris is ready to simulate bilingual clauses and prepare the ADJD review packet.",
  );
  const [hasAppliedPolarisRevision, setHasAppliedPolarisRevision] = React.useState(false);

  const activeDocument = React.useMemo(
    () => documents.find((item) => item.id === activeDocumentId),
    [documents, activeDocumentId],
  );

  const receiptAutoFocusRef = React.useRef(false);
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

  const handleSelectDocument = React.useCallback(
    (id: string) => {
      setDocuments((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                isExpanded: true,
              }
            : {
                ...item,
                isExpanded: false,
              },
        ),
      );
      setActiveDocumentId(id);
      setShowMoaAssistant(id === "memorandum-of-association");
    },
    [setDocuments],
  );

  const handleApplyPolarisRevision = React.useCallback(() => {
    setMoaClauseDraft(POLARIS_RECOMMENDED_MOA_CLAUSE);
    setHasAppliedPolarisRevision(true);
    setMoaEditorNotes(
      "Polaris simulated bilingual clauses and prepared the ADJD review packet.",
    );
    toast({
      title: "Polaris simulation ready",
      description: "Custom MOA edits packaged for ADJD review.",
    });
  }, [toast]);

  const handleResetMoaRevision = React.useCallback(() => {
    setMoaClauseDraft(INITIAL_MOA_CLAUSE_DRAFT);
    setMoaEditorNotes(
      "Polaris is ready to simulate bilingual clauses and prepare the ADJD review packet.",
    );
    setHasAppliedPolarisRevision(false);
  }, []);

  const handleCompleteMoa = React.useCallback(() => {
    if (isFinalisingMoa || activeDocumentId !== "memorandum-of-association") {
      return;
    }

    setIsFinalisingMoa(true);
    triggerVaultSync();
    completionTimeoutRef.current = window.setTimeout(() => {
      setDocuments((previous) =>
        previous.map((item) =>
          item.id === "memorandum-of-association"
            ? {
                ...item,
                status: "completed" as const,
                source: DOCUMENT_VAULT_SOURCE_LABEL,
                sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
                actionLabel: "Download ADJD review packet",
                isExpanded: false,
              }
            : item,
        ),
      );
      setIsFinalisingMoa(false);
      setShowMoaAssistant(false);
      setProgress((value) => Math.max(value, 88));
      toast({
        title: "Custom MOA sent to ADJD",
        description: "Polaris submitted the custom memorandum for review and saved a copy in your vault.",
      });
    }, 1200);
  }, [activeDocumentId, isFinalisingMoa, toast, triggerVaultSync]);

  React.useEffect(() => {
    if (!allDocumentsCompleted) {
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
  }, [allDocumentsCompleted, documents, setDocuments]);

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
    const sections = ["vault"];
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
  const vaultManuallyCollapsedRef = React.useRef(false);

  React.useEffect(() => {
    setOpenSections((previous) => {
      const merged = new Set(previous);
      defaultOpenSections.forEach((section) => {
        if (section === "vault" && vaultManuallyCollapsedRef.current) {
          return;
        }
        merged.add(section);
      });
      return Array.from(merged);
    });
  }, [defaultOpenSections]);

  const ensureSectionOpen = React.useCallback(
    (sectionId: string, options?: { bypassCollapsedGuard?: boolean }) => {
      setOpenSections((previous) => {
        const isVault = sectionId === "vault";
        if (isVault && vaultManuallyCollapsedRef.current && !options?.bypassCollapsedGuard) {
          return previous;
        }
        if (previous.includes(sectionId)) {
          return previous;
        }
        if (isVault) {
          vaultManuallyCollapsedRef.current = false;
        }
        return [...previous, sectionId];
      });
    },
    [],
  );

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

  React.useEffect(() => {
    const receiptDocument = documents.find((item) => item.id === TRADE_NAME_RECEIPT_DOCUMENT_ID);
    const hasReceipt = Boolean(receiptDocument);

    if (hasReceipt && !receiptAutoFocusRef.current) {
      receiptAutoFocusRef.current = true;
      handleSelectDocument(TRADE_NAME_RECEIPT_DOCUMENT_ID);
      ensureSectionOpen("vault");
      scrollToElement("submit-stage-vault");
    }

    if (!hasReceipt) {
      receiptAutoFocusRef.current = false;
    }
  }, [documents, ensureSectionOpen, handleSelectDocument, scrollToElement]);

  const vaultSubtitle = `${completedDocuments}/${totalDocuments} documents ready`;
  const moaSubtitle = showMoaAssistant
    ? "Polaris guidance for notarisation"
    : "Polaris simulation ready — reopen anytime";
  const paymentSubtitle = hasPaid ? "Paid via AD Pay" : "AED 3,120 via AD Pay";
  const licenceSubtitle = licenseDetails ? "Stored in AD Locker" : "Issued after payment";
  const isVaultProcessing = isVaultSyncing || isFinalisingMoa;
  const vaultStatusHeading = isVaultProcessing
    ? "Syncing your documents"
    : allDocumentsCompleted
      ? "Vault up to date"
      : "Sync in progress";
  const vaultStatusDescription = isVaultProcessing
    ? "Polaris is syncing new files from your journey stages."
    : allDocumentsCompleted
      ? "Every document is stored with the latest updates."
      : "Documents update automatically whenever you finish a stage.";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
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
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Submit documents & licence issuance
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              Everything synced in your vault
            </h3>
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

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={(values) => setOpenSections(values)}
        className="space-y-4"
      >
        <CollapsibleCard
          value="vault"
          title="Document vault"
          subtitle={vaultSubtitle}
          contentId="submit-stage-vault"
        >
          <DocumentVaultLayout
            isProcessing={isVaultProcessing}
            statusHeading={vaultStatusHeading}
            statusDescription={vaultStatusDescription}
            activeDocument={activeDocument}
          >
            {documents.map((item) => (
              <DocumentVaultCard
                key={item.id}
                item={item}
                isActive={item.isExpanded}
                onSelect={handleDocumentClick}
                disabled={isFinalisingMoa && item.id === "memorandum-of-association"}
              />
            ))}
          </DocumentVaultLayout>
          {allDocumentsCompleted ? (
            <div className="rounded-3xl border border-[#94d2c2] bg-[#dff2ec]/70 p-4 text-sm font-semibold text-[#0b7d6f]">
              Every document is signed and stored. You can issue the licence.
            </div>
          ) : null}
        </CollapsibleCard>

        <CollapsibleCard
          value="moa"
          title="Polaris guidance for notarisation"
          subtitle={moaSubtitle}
          contentId="submit-stage-moa"
        >
          {showMoaAssistant ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#0f766e]/25 bg-white">
                  <AIBusinessOrb className="h-8 w-8" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#0f766e] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    AI
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Custom MOA simulation with Polaris
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Live collaboration mode
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Polaris is simulating edits on your custom memorandum and preparing the ADJD review submission. Review the draft before we forward it.
              </p>
              <div className="rounded-3xl border border-[#0f766e]/20 bg-[#0f766e]/5 p-4 text-sm text-[#0f766e]">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                    Simulated bilingual clauses aligned across the custom MOA.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                    Polaris forwards the custom MOA to ADJD for review and tracks responses.
                  </li>
                </ul>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <MyTAMMDocuments
                  companyName={PRIMARY_TRADE_NAME_EN}
                  isGenerating={isFinalisingMoa}
                />
                <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-[#0f766e]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Polaris simulated edit
                    </Badge>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {hasAppliedPolarisRevision ? "Updated moments ago" : "Awaiting confirmation"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="moa-clause-draft"
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                    >
                      Clause preview
                    </label>
                    <Textarea
                      id="moa-clause-draft"
                      value={moaClauseDraft}
                      onChange={(event) => {
                        setMoaClauseDraft(event.target.value);
                        setHasAppliedPolarisRevision(false);
                      }}
                      rows={10}
                      className="min-h-[200px] resize-none border-[#0f766e]/20 bg-[#f9fbfa] text-sm leading-relaxed text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="moa-editor-notes"
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                    >
                      Polaris simulation notes
                    </label>
                    <Textarea
                      id="moa-editor-notes"
                      value={moaEditorNotes}
                      onChange={(event) => setMoaEditorNotes(event.target.value)}
                      rows={4}
                      className="resize-none border-slate-200 bg-white text-sm leading-relaxed text-slate-700"
                    />
                    <p className="text-xs text-slate-500">
                      Polaris tracks translation checks and review requirements for ADJD submission.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleApplyPolarisRevision}
                      disabled={isFinalisingMoa || hasAppliedPolarisRevision}
                      className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                    >
                      {hasAppliedPolarisRevision ? "Simulation prepared" : "Simulate Polaris edits"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetMoaRevision}
                      disabled={isFinalisingMoa}
                      className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                    >
                      Reset simulation
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleCompleteMoa}
                  disabled={isFinalisingMoa || !hasAppliedPolarisRevision}
                  className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFinalisingMoa
                    ? "Sending to ADJD..."
                    : hasAppliedPolarisRevision
                      ? "Send to ADJD for review"
                      : "Simulate edits to continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMoaAssistant(false)}
                  disabled={isFinalisingMoa}
                  className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                >
                  Hide guidance
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Reopen the guidance if you want Polaris to rerun the custom MOA simulation.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMoaAssistant(true);
                  ensureSectionOpen("moa");
                  handleResetMoaRevision();
                }}
                className="self-start rounded-full border-[#0f766e]/40 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
              >
                Reopen guidance
              </Button>
            </div>
          )}
        </CollapsibleCard>

        <CollapsibleCard
          value="payment"
          title="Final licence fee"
          subtitle={paymentSubtitle}
          contentId="submit-stage-payment"
        >
          <Badge className="w-fit rounded-full border border-[#0f766e]/25 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            AED 3,120
          </Badge>
          <p className="text-sm text-slate-600">
            Pay once through AD Pay and we will push the licence to your wallet and AD Locker.
          </p>
          <Button
            type="button"
            onClick={() => {
              ensureSectionOpen("payment");
              scrollToElement("submit-stage-payment");
              if (!hasPaid && !isPaying && allDocumentsCompleted) {
                handleInitiatePayment();
              }
            }}
            disabled={!allDocumentsCompleted || hasPaid || isPaying}
            className="w-full rounded-full bg-[#0f766e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasPaid ? "Payment complete with AD Pay" : isPaying ? "Processing via AD Pay..." : "Pay and issue licence"}
          </Button>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tenancy • MOA • Payment synced automatically
          </p>
        </CollapsibleCard>

        <CollapsibleCard
          value="license"
          title="Licence confirmation"
          subtitle={licenceSubtitle}
          contentId="submit-stage-license"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 text-[#0f766e]">
              <Wallet className="h-5 w-5" />
            </span>
            <Badge
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                licenseDetails ? "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]" : "border-slate-200 bg-white text-slate-400",
              )}
            >
              {licenseDetails ? "Issued" : "Pending"}
            </Badge>
          </div>
          {licenseDetails ? (
            <div className="space-y-3 rounded-3xl border border-[#94d2c2] bg-[#dff2ec]/60 p-5 text-sm text-[#0b7d6f]">
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
                We emailed the PDF and stored it in AD Locker for inspections.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Once the payment clears, we show the licence number here and sync it automatically.
            </p>
          )}
        </CollapsibleCard>
      </Accordion>
    </div>
  );
}
