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
import { useDocumentVaultContext } from "./DocumentVaultContext";

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
const DOCUMENT_VAULT_IMAGE_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fdcbbbf1fba0441838566c6e2d3105aa0?format=webp&width=800";
const INITIAL_MOA_CLAUSE_DRAFT = `Article 7 — Capital contributions & profit distribution

Each shareholder contributes AED 375,000, establishing AED 1,500,000 in paid-up capital. Profits are distributed quarterly in proportion to equity unless unanimously resolved otherwise.`;
const OMNIS_RECOMMENDED_MOA_CLAUSE = `Article 7 — Capital contributions & profit distribution
المادة 7 — ا��مساهمات ا��رأسمالية وتوزيع الأرب��ح

Each shareholder contributes AED 375,000, establishing AED 1,500,000 in paid-up capital. Profits are distributed quarterly in proportion to equity unless unanimously resolved otherwise. Distributions shall be supported by audited management accounts and bilingual notices issued at least five (5) working days in advance.`;

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
    actionLabel: "Review with Omnis",
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
  const [moaClauseDraft, setMoaClauseDraft] = React.useState<string>(INITIAL_MOA_CLAUSE_DRAFT);
  const [moaEditorNotes, setMoaEditorNotes] = React.useState<string>(
    "Omnis highlighted the bilingual clause to align with ADJD templates before notarisation.",
  );
  const [hasAppliedOmnisRevision, setHasAppliedOmnisRevision] = React.useState(false);
  const [isVaultSyncing, setIsVaultSyncing] = React.useState(false);

  const completionTimeoutRef = React.useRef<number | null>(null);
  const paymentTimeoutRef = React.useRef<number | null>(null);
  const vaultSyncTimeoutRef = React.useRef<number | null>(null);
  const previousDocumentsRef = React.useRef<DocumentVaultItem[]>(INITIAL_DOCUMENTS);

  React.useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
      if (paymentTimeoutRef.current) {
        window.clearTimeout(paymentTimeoutRef.current);
      }
      if (vaultSyncTimeoutRef.current) {
        window.clearTimeout(vaultSyncTimeoutRef.current);
        vaultSyncTimeoutRef.current = null;
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

  const handleApplyOmnisRevision = React.useCallback(() => {
    setMoaClauseDraft(OMNIS_RECOMMENDED_MOA_CLAUSE);
    setHasAppliedOmnisRevision(true);
    setMoaEditorNotes(
      "Omnis inserted the bilingual clause and aligned profit notices with ADJD templates.",
    );
    toast({
      title: "Omnis revisions applied",
      description:
        "Arabic translation and profit notice standards were merged into the draft.",
    });
  }, [toast]);

  const handleResetMoaRevision = React.useCallback(() => {
    setMoaClauseDraft(INITIAL_MOA_CLAUSE_DRAFT);
    setMoaEditorNotes(
      "Omnis highlighted the bilingual clause to align with ADJD templates before notarisation.",
    );
    setHasAppliedOmnisRevision(false);
  }, []);

  const handleCompleteMoa = React.useCallback(() => {
    if (isFinalisingMoa || activeDocumentId !== "memorandum-of-association") {
      return;
    }

    setIsFinalisingMoa(true);
    setIsVaultSyncing(true);
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
    const previous = previousDocumentsRef.current;
    const previousStatuses = previous.map((item) => item.status).join("|");
    const currentStatuses = documents.map((item) => item.status).join("|");

    if (previousStatuses !== currentStatuses) {
      setIsVaultSyncing(true);
      if (vaultSyncTimeoutRef.current) {
        window.clearTimeout(vaultSyncTimeoutRef.current);
      }
      vaultSyncTimeoutRef.current = window.setTimeout(() => {
        setIsVaultSyncing(false);
        vaultSyncTimeoutRef.current = null;
      }, 1200);
    }

    previousDocumentsRef.current = documents;
  }, [documents]);

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

  const vaultSubtitle = `${completedDocumentsCount}/${documents.length} documents ready`;
  const moaSubtitle = showMoaAssistant
    ? "Omnis guidance for notarisation"
    : "Assistant closed — reopen anytime";
  const paymentSubtitle = hasPaid ? "Paid via AD Pay" : "AED 3,120 via AD Pay";
  const licenceSubtitle = licenseDetails ? "Stored in AD Locker" : "Issued after payment";
  const isVaultProcessing = isVaultSyncing || isFinalisingMoa;
  const vaultStatusHeading = isVaultProcessing
    ? "Syncing your documents"
    : allDocumentsCompleted
      ? "Vault up to date"
      : "Sync in progress";
  const vaultStatusDescription = isVaultProcessing
    ? "Omnis is syncing new files from your journey stages."
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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-[#d8e4df] bg-white">
              <img
                src={DOCUMENT_VAULT_IMAGE_URL}
                alt="Documents syncing in the vault"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] backdrop-blur">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    {isVaultProcessing ? "Live sync" : "Auto-sync"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{vaultStatusHeading}</p>
                  <p className="text-xs text-slate-600">{vaultStatusDescription}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0f766e]/30 bg-white text-[#0f766e]">
                  {isVaultProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  )}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {documents.map((item) => (
                <DocumentVaultCard
                  key={item.id}
                  item={item}
                  isActive={item.isExpanded}
                  onSelect={handleDocumentClick}
                  disabled={isFinalisingMoa && item.id === "memorandum-of-association"}
                />
              ))}
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          value="moa"
          title="MOA assistant"
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
                    Guided notarisation with Omnis
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    Live collaboration mode
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                We filled the memorandum with shareholders, activities, and translations. Review and sign before we send it to ADJD.
              </p>
              <div className="rounded-3xl border border-[#0f766e]/20 bg-[#0f766e]/5 p-4 text-sm text-[#0f766e]">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                    Key clauses aligned in Arabic and English.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                    Omnis sends the signed MOA to ADJD and stores the notarised copy.
                  </li>
                </ul>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <MyTAMMDocuments
                  companyName="Marwah Restaurant Sole LLC"
                  isGenerating={isFinalisingMoa}
                />
                <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-5 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-[#0f766e]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Omnis live edit
                    </Badge>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {hasAppliedOmnisRevision ? "Updated moments ago" : "Awaiting confirmation"}
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
                        setHasAppliedOmnisRevision(false);
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
                      Omnis reviewer notes
                    </label>
                    <Textarea
                      id="moa-editor-notes"
                      value={moaEditorNotes}
                      onChange={(event) => setMoaEditorNotes(event.target.value)}
                      rows={4}
                      className="resize-none border-slate-200 bg-white text-sm leading-relaxed text-slate-700"
                    />
                    <p className="text-xs text-slate-500">
                      Omnis captures translation checks and board approvals inline with ADJD fields.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleApplyOmnisRevision}
                      disabled={isFinalisingMoa || hasAppliedOmnisRevision}
                      className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                    >
                      {hasAppliedOmnisRevision ? "Revision applied" : "Apply Omnis revision"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetMoaRevision}
                      disabled={isFinalisingMoa}
                      className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                    >
                      Reset draft
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleCompleteMoa}
                  disabled={isFinalisingMoa || !hasAppliedOmnisRevision}
                  className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.5)] hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFinalisingMoa
                    ? "Finalising with ADJD..."
                    : hasAppliedOmnisRevision
                      ? "Sign & notarise MOA"
                      : "Apply revisions to continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMoaAssistant(false)}
                  disabled={isFinalisingMoa}
                  className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                >
                  Hide assistant
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Reopen the assistant if you want Omnis to walk you through the MOA again.
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
                Reopen assistant
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
