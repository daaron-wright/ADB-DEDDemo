import * as React from "react";

import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { cn } from "@/lib/utils";
import { Check, Wallet } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { DocumentVaultCard } from "./DocumentVaultCard";
import { DocumentVaultLayout } from "./DocumentVaultLayout";
import { StageSlideNavigator, type StageSlide } from "./StageSlideNavigator";
import { CollapsibleCard } from "./StageCollapsibleCard";
import { useDocumentVault } from "./DocumentVaultContext";
import { DOCUMENT_VAULT_SOURCE_LABEL } from "./document-vault-data";
import { MyTAMMDocuments } from "./MyTAMMDocuments";
import {
  PRIMARY_TRADE_NAME_EN,
  MARWA_TRADE_NAME_EN,
  TRADE_NAME_RECEIPT_DOCUMENT_ID,
} from "./trade-name-constants";

interface DocumentSubmissionFocusContentProps {
  journeyNumber?: string;
  onLicenseIssued?: () => void;
}

type LicenseDetails = {
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
};

const INITIAL_MOA_CLAUSE_DRAFT = `Custom Article 7 — Capital contributions & profit distribution

Each shareholder contributes AED 375,000, establishing AED 1,500,000 in paid-up capital. Profits are distributed quarterly in proportion to equity unless unanimously resolved otherwise.`;
const POLARIS_RECOMMENDED_MOA_CLAUSE = `Custom Article 7 — Capital contributions & profit distribution
المادة 7 — المساهمات الرأسمالية وتوزيع الأرباح

Each shareholder contributes AED 375,000, establishing AED 1,500,000 in paid-up capital. Profits are distributed quarterly in proportion to equity unless unanimously resolved otherwise. Distributions shall be supported by audited management accounts and bilingual notices issued at least five (5) working days in advance. Polaris simulation includes bilingual notices and an ADJD review cover letter.`;

const ADJD_SOURCE_LABEL = "Abu Dhabi Judicial Department (ADJD)";
const ADJD_REVIEW_DETAIL = "Submitted for ADJD review • Pending approval";
const ADJD_APPROVED_DETAIL = "ADJD approval recorded • Notarised copy synced";

const CERTIFICATION_SOURCES = [
  {
    id: "adcda",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/65efb322c17c0c898b0d7f62a8594d539ea99380?width=384",
    alt: "Abu Dhabi Civil Defence",
  },
  {
    id: "adafsa",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/34a6ee9d8c89d380fc61f0ce59ce20d319f4ba50?width=384",
    alt: "Abu Dhabi Agriculture and Food Safety Authority",
  },
  {
    id: "fab",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/2c1eed059d09c72f13959f5658792c98a78bd9e1?width=384",
    alt: "First Abu Dhabi Bank",
  },
  {
    id: "etisalat",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/1e83f2e721687676d83cf73e4a7e5e455ff2f837?width=384",
    alt: "e&",
  },
];

const TAMM_DOCUMENT_PREVIEWS = [
  {
    id: "certificate",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/f4db5140ddd80fde530b18c48457b833a2fdbdfc?width=164",
    alt: "Certificate preview",
  },
  {
    id: "permit",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/6874f52d79db5dff4a42886b0395ffbe0cf14b5d?width=174",
    alt: "Permit preview",
  },
  {
    id: "compliance",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/f4db5140ddd80fde530b18c48457b833a2fdbdfc?width=164",
    alt: "Compliance document preview",
  },
  {
    id: "supporting",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/6874f52d79db5dff4a42886b0395ffbe0cf14b5d?width=174",
    alt: "Supporting document preview",
  },
];

export function DocumentSubmissionFocusContent({
  journeyNumber = "0987654321",
  onLicenseIssued,
}: DocumentSubmissionFocusContentProps) {
  const {
    documents,
    setDocuments,
    isVaultSyncing,
    triggerVaultSync,
    totalDocuments,
    completedDocuments,
    allDocumentsCompleted,
  } = useDocumentVault();

  const [activeSlideId, setActiveSlideId] = React.useState<StageSlide["id"]>(
    "overview",
  );
  const [activeDocumentId, setActiveDocumentId] = React.useState<string>(
    "memorandum-of-association",
  );
  const [showMoaAssistant, setShowMoaAssistant] = React.useState(true);
  const [isFinalisingMoa, setIsFinalisingMoa] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [hasPaid, setHasPaid] = React.useState(false);
  const [licenseDetails, setLicenseDetails] = React.useState<LicenseDetails | null>(
    null,
  );
  const [moaClauseDraft, setMoaClauseDraft] = React.useState<string>(
    INITIAL_MOA_CLAUSE_DRAFT,
  );
  const [moaEditorNotes, setMoaEditorNotes] = React.useState<string>(
    "Polaris is ready to simulate bilingual clauses and prepare the ADJD review packet.",
  );
  const [hasAppliedPolarisRevision, setHasAppliedPolarisRevision] =
    React.useState(false);

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

  const handleDocumentClick = React.useCallback(
    (id: string) => {
      handleSelectDocument(id);
      setActiveSlideId("vault");
    },
    [handleSelectDocument],
  );

  const handleApplyPolarisRevision = React.useCallback(() => {
    setMoaClauseDraft(POLARIS_RECOMMENDED_MOA_CLAUSE);
    setHasAppliedPolarisRevision(true);
    setMoaEditorNotes(
      "Polaris simulated bilingual clauses and prepared the ADJD review packet.",
    );
    setActiveSlideId("moa");
  }, []);

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
    setActiveSlideId("moa");

    setDocuments((previous) =>
      previous.map((item) =>
        item.id === "memorandum-of-association"
          ? {
              ...item,
              status: "ready",
              source: ADJD_SOURCE_LABEL,
              sourceDetail: ADJD_REVIEW_DETAIL,
              actionLabel: "Track ADJD review",
              description:
                "Polaris submitted your bilingual MOA to ADJD for notarisation and is monitoring the review.",
            }
          : item,
      ),
    );

    toast({
      title: "MOA submitted for ADJD review",
      description:
        "Polaris forwarded your memorandum to ADJD. We'll notify you as soon as the approval lands.",
    });

    triggerVaultSync();
    completionTimeoutRef.current = window.setTimeout(() => {
      setDocuments((previous) =>
        previous.map((item) =>
          item.id === "memorandum-of-association"
            ? {
                ...item,
                status: "completed" as const,
                source: ADJD_SOURCE_LABEL,
                sourceDetail: ADJD_APPROVED_DETAIL,
                actionLabel: "Download ADJD approved MOA",
                description:
                  "ADJD approved the notarised MOA. Polaris synced the stamped copy into your vault.",
                isExpanded: false,
              }
            : item,
        ),
      );
      toast({
        title: "ADJD approved your MOA",
        description:
          "Your notarised memorandum is now stored in the vault. You're clear to proceed to licence issuance.",
      });
      setIsFinalisingMoa(false);
      setShowMoaAssistant(false);
      setActiveSlideId("payment");
    }, 1400);
  }, [activeDocumentId, isFinalisingMoa, triggerVaultSync, setDocuments]);

  React.useEffect(() => {
    if (!allDocumentsCompleted) {
      return;
    }

  }, [allDocumentsCompleted]);

  const handleInitiatePayment = React.useCallback(() => {
    if (isPaying || hasPaid || !allDocumentsCompleted) {
      return;
    }

    setIsPaying(true);

    paymentTimeoutRef.current = window.setTimeout(() => {
      setIsPaying(false);
      setHasPaid(true);
      const issuedLicense: LicenseDetails = {
        licenseNumber: "CN-7845126",
        issueDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        expiryDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
      setLicenseDetails(issuedLicense);
      setActiveSlideId("license");
      onLicenseIssued?.();
    }, 1600);
  }, [allDocumentsCompleted, hasPaid, isPaying, onLicenseIssued]);

  React.useEffect(() => {
    const receiptDocument = documents.find(
      (item) => item.id === TRADE_NAME_RECEIPT_DOCUMENT_ID,
    );
    const hasReceipt = Boolean(receiptDocument);

    if (hasReceipt && !receiptAutoFocusRef.current) {
      receiptAutoFocusRef.current = true;
      handleSelectDocument(TRADE_NAME_RECEIPT_DOCUMENT_ID);
      setActiveSlideId("vault");
    }

    if (!hasReceipt) {
      receiptAutoFocusRef.current = false;
    }
  }, [documents, handleSelectDocument]);

  React.useEffect(() => {
    if (allDocumentsCompleted && !hasPaid) {
      setActiveSlideId((current) =>
        current === "license" ? current : "payment",
      );
    }
  }, [allDocumentsCompleted, hasPaid]);

  React.useEffect(() => {
    if (!hasPaid || !licenseDetails) {
      return;
    }

    onLicenseIssued?.();
  }, [hasPaid, licenseDetails, onLicenseIssued]);

  const vaultSubtitle = `${completedDocuments}/${totalDocuments} documents ready`;
  const moaSubtitle = showMoaAssistant
    ? "Al Yah guidance for notarisation"
    : "Al Yah simulation ready — reopen anytime";
  const paymentSubtitle = hasPaid ? "Paid via AD Pay" : "AED 3,120 via AD Pay";
  const licenceSubtitle = licenseDetails
    ? "Stored in AD Locker"
    : "Issued after payment";
  const isVaultProcessing = isVaultSyncing || isFinalisingMoa;
  const vaultStatusHeading = isVaultProcessing
    ? "Syncing your documents"
    : allDocumentsCompleted
      ? "Vault up to date"
      : "Sync in progress";
  const vaultStatusDescription = isVaultProcessing
    ? "Al Yah is syncing new files from your journey stages."
    : allDocumentsCompleted
      ? "Every document is stored with the latest updates."
      : "Documents update automatically whenever you finish a stage.";

  const renderPolarisGuidanceContent = React.useCallback(
    (variant: "card" | "inline" = "card") => {
      const content = showMoaAssistant ? (
        <>
          <p className="text-sm text-slate-600">
            Al Yah is simulating edits on your custom memorandum and preparing the ADJD review submission. Review the draft before we forward it.
          </p>
          <div className="rounded-3xl border border-[#0f766e]/20 bg-[#0f766e]/5 p-4 text-sm text-[#0f766e]">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                Simulated bilingual clauses aligned across the custom MOA.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                Al Yah forwards the custom MOA to ADJD for review and tracks responses.
              </li>
            </ul>
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <MyTAMMDocuments
              companyName={MARWA_TRADE_NAME_EN}
              isGenerating={isFinalisingMoa}
            />
            <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
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
                  Al Yah simulation notes
                </label>
                <Textarea
                  id="moa-editor-notes"
                  value={moaEditorNotes}
                  onChange={(event) => setMoaEditorNotes(event.target.value)}
                  rows={4}
                  className="resize-none border-slate-200 bg-white text-sm leading-relaxed text-slate-700"
                />
                <p className="text-xs text-slate-500">
                  Al Yah tracks translation checks and review requirements for ADJD submission.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleApplyPolarisRevision}
                  disabled={isFinalisingMoa}
                  className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {hasAppliedPolarisRevision
                    ? "Simulation prepared"
                    : "Simulate Al Yah edits"}
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
              onClick={() => {
                setShowMoaAssistant(false);
                setActiveSlideId("vault");
              }}
              disabled={isFinalisingMoa}
              className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
            >
              Hide guidance
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Reopen the guidance if you want Al Yah to rerun the custom MOA simulation.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowMoaAssistant(true);
              setActiveSlideId("moa");
              handleResetMoaRevision();
            }}
            className="self-start rounded-full border-[#0f766e]/40 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
          >
            Reopen guidance
          </Button>
        </div>
      );

      if (variant === "inline") {
        return <div className="space-y-6">{content}</div>;
      }

      return (
        <div className="space-y-6 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
          {content}
        </div>
      );
    },
    [
      handleApplyPolarisRevision,
      handleCompleteMoa,
      handleResetMoaRevision,
      hasAppliedPolarisRevision,
      isFinalisingMoa,
      moaClauseDraft,
      moaEditorNotes,
      setActiveSlideId,
      setHasAppliedPolarisRevision,
      setMoaClauseDraft,
      setMoaEditorNotes,
      setShowMoaAssistant,
      showMoaAssistant,
    ],
  );

  const slides = React.useMemo<StageSlide[]>(
    () => [
      {
        id: "overview",
        heading: "Stage overview",
        description:
          "Review synced updates before you jump into vault details or payment steps.",
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
              <p className="text-sm text-slate-600">
                Polaris keeps your submissions, signatures, and payments aligned automatically. Anything needing action will appear in the tasks below.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "vault",
        heading: "Document vault",
        description: vaultSubtitle,
        content: (
          <div className="space-y-5 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-40px_rgba(15,23,42,0.28)]">
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
                  disabled={
                    isFinalisingMoa && item.id === "memorandum-of-association"
                  }
                />
              ))}
            </DocumentVaultLayout>
            {allDocumentsCompleted ? (
              <div className="rounded-3xl border border-[#94d2c2] bg-[#dff2ec]/70 p-4 text-sm font-semibold text-[#0b7d6f]">
                Every document is signed and stored. You can issue the licence.
              </div>
            ) : null}
            <Accordion
              type="multiple"
              defaultValue={["moa-guidance"]}
              className="space-y-3"
            >
              <CollapsibleCard
                value="moa-guidance"
                title="Al Yah guidance"
                subtitle="Custom MOA simulation and ADJD routing"
              >
                {renderPolarisGuidanceContent("inline")}
              </CollapsibleCard>
              <CollapsibleCard
                value="certifications"
                title="Certification sources"
                subtitle="Active connections"
              >
                <p className="text-sm text-slate-600">
                  We pull confirmations directly from each authority so you always have the latest approvals.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CERTIFICATION_SOURCES.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-center rounded-full border border-[#e6f2ed] bg-white px-4 py-3 shadow-[0_18px_42px_-40px_rgba(15,118,110,0.25)]"
                    >
                      <img
                        src={cert.src}
                        alt={cert.alt}
                        className="h-auto max-h-[32px] w-auto max-w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
              <CollapsibleCard
                value="tamm-documents"
                title="My TAMM documents"
                subtitle='Synced from "My Business Documents" Vault'
              >
                <p className="text-sm text-slate-600">
                  Certificates and permits stay available here. Expand previews to confirm what inspectors can see in TAMM.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {TAMM_DOCUMENT_PREVIEWS.map((preview) => (
                    <img
                      key={preview.id}
                      src={preview.src}
                      alt={preview.alt}
                      className="h-32 w-full rounded-xl border border-white/70 object-cover shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
                    />
                  ))}
                </div>
              </CollapsibleCard>
            </Accordion>
          </div>
        ),
      },
      {
        id: "moa",
        heading: "Al Yah guidance",
        description: moaSubtitle,
        content: renderPolarisGuidanceContent(),
      },
      {
        id: "payment",
        heading: "Final licence fee",
        description: paymentSubtitle,
        content: (
          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <Badge className="w-fit rounded-full border border-[#0f766e]/25 bg-[#0f766e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              AED 3,120
            </Badge>
            <p className="text-sm text-slate-600">
              Pay once through AD Pay and we will push the licence to your wallet and AD Locker.
            </p>
            <Button
              type="button"
              onClick={handleInitiatePayment}
              disabled={!allDocumentsCompleted || hasPaid || isPaying}
              className="w-full rounded-full bg-[#0f766e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasPaid
                ? "Payment complete with AD Pay"
                : isPaying
                  ? "Processing via AD Pay..."
                  : "Pay and issue licence"}
            </Button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Tenancy • MOA • Payment synced automatically
            </p>
          </div>
        ),
      },
      {
        id: "license",
        heading: "Licence confirmation",
        description: licenceSubtitle,
        content: (
          <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 text-[#0f766e]">
                <Wallet className="h-5 w-5" />
              </span>
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  licenseDetails
                    ? "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]"
                    : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {licenseDetails ? "Issued" : "Pending"}
              </Badge>
            </div>
            {licenseDetails ? (
              <div className="space-y-3 rounded-3xl border border-[#94d2c2] bg-[#dff2ec]/60 p-5 text-sm text-[#0b7d6f]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold uppercase tracking-[0.18em]">
                    Licence number
                  </span>
                  <span className="text-base font-semibold">
                    {licenseDetails.licenseNumber}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Issued on
                    </p>
                    <p className="text-sm font-semibold">
                      {licenseDetails.issueDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Valid until
                    </p>
                    <p className="text-sm font-semibold">
                      {licenseDetails.expiryDate}
                    </p>
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
          </div>
        ),
      },
    ],
    [
      allDocumentsCompleted,
      documents,
      handleDocumentClick,
      handleApplyPolarisRevision,
      handleCompleteMoa,
      handleInitiatePayment,
      handleResetMoaRevision,
      hasAppliedPolarisRevision,
      hasPaid,
      isFinalisingMoa,
      isPaying,
      journeyNumber,
      licenseDetails,
      moaEditorNotes,
      moaClauseDraft,
      moaSubtitle,
      paymentSubtitle,
      licenceSubtitle,
      showMoaAssistant,
      vaultStatusDescription,
      vaultStatusHeading,
      vaultSubtitle,
      activeDocument,
      renderPolarisGuidanceContent,
    ],
  );

  const handleSlideSelection = React.useCallback((slideId: string) => {
    setActiveSlideId(slideId);
  }, []);

  return (
    <StageSlideNavigator
      slides={slides}
      activeSlideId={activeSlideId}
      onSlideChange={handleSlideSelection}
      className="mt-6"
    />
  );
}
