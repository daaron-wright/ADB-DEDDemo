import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReviewQueueItem, DocumentArtifact } from "@/components/portal/ReviewQueueCard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award,
  BadgeCheck,
  BarChart3,
  CircleCheck,
  FileSignature,
  FileText,
  Ruler,
} from "lucide-react";

interface ReviewFocusSheetProps {
  open: boolean;
  review: ReviewQueueItem | null;
  onClose: () => void;
}

const priorityStyles: Record<ReviewQueueItem["priority"], string> = {
  High: "border-[#f4bebe] bg-[#fdf1f0] text-[#b23b31]",
  Medium: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  Low: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
};

const slaStyles: Record<ReviewQueueItem["slaStatus"], string> = {
  "On Track": "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
  "At Risk": "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  Breached: "border-[#f4bebe] bg-[#fdf1f0] text-[#b23b31]",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const documentStatusStyles: Record<DocumentArtifact["status"], string> = {
  approved: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
  pending: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  rejected: "border-[#f4bebe] bg-[#fdf1f0] text-[#b23b31]",
  under_review: "border-[#c7d2fe] bg-[#f0f4ff] text-[#4f46e5]",
  required: "border-[#e0e7ff] bg-[#f8fafc] text-[#64748b]",
};

const documentTypeIcons: Record<DocumentArtifact["type"], ReactNode> = {
  certificate: <Award className="h-4 w-4" aria-hidden="true" />,
  license: <BadgeCheck className="h-4 w-4" aria-hidden="true" />,
  permit: <CircleCheck className="h-4 w-4" aria-hidden="true" />,
  form: <FileText className="h-4 w-4" aria-hidden="true" />,
  report: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
  contract: <FileSignature className="h-4 w-4" aria-hidden="true" />,
  plan: <Ruler className="h-4 w-4" aria-hidden="true" />,
};

const handleDocumentClick = (document: DocumentArtifact) => {
  if (document.url) {
    window.open(document.url, '_blank');
  } else {
    // Handle document preview/download logic here
    console.log('Opening document:', document.name);
  }
};

export function ReviewFocusSheet({
  open,
  review,
  onClose,
}: ReviewFocusSheetProps) {
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  if (!review) {
    return null;
  }

  type JourneyState = "approved" | "in_progress" | "needs_attention";

  const journeyState: JourneyState =
    review.completion >= 100 || review.stage.toLowerCase().includes("approved")
      ? "approved"
      : review.slaStatus === "Breached" || review.slaStatus === "At Risk"
        ? "needs_attention"
        : "in_progress";

  const journeyBadges: { id: JourneyState; label: string }[] = [
    { id: "approved", label: "Approved" },
    { id: "in_progress", label: "In Progress" },
    { id: "needs_attention", label: "Needs Attention" },
  ];

  const journeyBadgeStyles: Record<JourneyState, { active: string; inactive: string }> = {
    approved: {
      active: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
      inactive: "border-[#d8e4df] bg-white text-slate-500",
    },
    in_progress: {
      active: "border-[#bfd6f8] bg-[#eef4ff] text-[#1d4ed8]",
      inactive: "border-[#d8e4df] bg-white text-slate-500",
    },
    needs_attention: {
      active: "border-[#f4bebe] bg-[#fdf1f0] text-[#b23b31]",
      inactive: "border-[#d8e4df] bg-white text-slate-500",
    },
  };

  const keyDocuments = review.documents.slice(0, 3);
  const remainingDocuments = review.documents.slice(3);
  const documentsToShow = showAllDocuments ? review.documents : keyDocuments;

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-3xl flex-col border-l border-[#d8e4df] bg-white px-0 pb-0"
      >
        <SheetHeader className="space-y-3 px-6 pb-4 pt-6 text-left">
          <Badge
            className={`inline-flex w-fit items-center gap-2 border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${priorityStyles[review.priority]}`}
          >
            {review.priority} priority
          </Badge>
          <div className="space-y-1 text-left">
            <SheetTitle className="text-2xl font-semibold text-slate-900 md:text-3xl">
              {review.serviceName}
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-600">
              {review.summary}
            </SheetDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-900">
            <Badge className="border border-[#b7e1d4] bg-[#eaf7f3] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#0f766e]">
              {review.stage}
            </Badge>
            <Badge
              className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${slaStyles[review.slaStatus]}`}
            >
              {review.slaStatus}
            </Badge>
            <Badge className="border border-[#c7b0f5] bg-[#f3ecff] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#5b21b6]">
              OPA Review
            </Badge>
            <Badge className="border border-[#d8e4df] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {review.id}
            </Badge>
          </div>
        </SheetHeader>

        <Separator className="bg-[#e3efea]" />

        <ScrollArea className="flex-1">
          <div className="space-y-8 px-6 py-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                REVIEW JOURNEY
              </h3>
              <div className="flex flex-wrap gap-2">
                {journeyBadges.map((badge) => {
                  const isActive = journeyState === badge.id;
                  return (
                    <Badge
                      key={badge.id}
                      className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${journeyBadgeStyles[badge.id][isActive ? "active" : "inactive"]}`}
                    >
                      {badge.label}
                    </Badge>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Key Documents {!showAllDocuments && review.documents.length > 3 && `(${keyDocuments.length} of ${review.documents.length})`}
                </h3>
                {remainingDocuments.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllDocuments(!showAllDocuments)}
                    className="text-xs border-[#d8e4df] text-slate-600"
                  >
                    {showAllDocuments ? (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Show Less
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Show All ({review.documents.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {documentsToShow.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d8e4df] bg-white p-6 text-sm text-slate-600">
                    No documents have been attached to this review yet.
                  </div>
                ) : (
                  documentsToShow.map((document, index) => {
                    const isKeyDocument = index < 3;
                    return (
                      <div
                        key={document.id}
                        onClick={() => handleDocumentClick(document)}
                        className={cn(
                          "cursor-pointer rounded-2xl border bg-white p-4",
                          isKeyDocument ? "border-[#0f766e] bg-[#f9fbfa]" : "border-[#d8e4df]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8e4df] bg-white text-slate-600">
                                {documentTypeIcons[document.type]}
                              </span>
                              <h4 className="font-medium text-slate-900 text-sm leading-tight">
                                {document.name}
                              </h4>
                              {isKeyDocument && (
                                <Badge className="text-xs px-2 py-1 border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]">
                                  Key
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                              {document.issuer && (
                                <div>
                                  <span className="font-medium">Issuer:</span> {document.issuer}
                                </div>
                              )}
                              {document.uploadedAt && (
                                <div>
                                  <span className="font-medium">Uploaded:</span> {dateFormatter.format(new Date(document.uploadedAt))}
                                </div>
                              )}
                              {document.validUntil && (
                                <div>
                                  <span className="font-medium">Valid until:</span> {dateFormatter.format(new Date(document.validUntil))}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Size:</span> {document.size}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={`text-xs px-2 py-1 ${documentStatusStyles[document.status]}`}
                            >
                              {document.status.replace('_', ' ')}
                            </Badge>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
