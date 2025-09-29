import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Badge } from "@/components/ui/badge";

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

const documentTypeIcons: Record<DocumentArtifact["type"], string> = {
  certificate: "🏆",
  license: "📜",
  permit: "✅",
  form: "📋",
  report: "📊",
  contract: "📄",
  plan: "📐",
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
  if (!review) {
    return null;
  }

  const timeline = [
    {
      label: "Submitted",
      value: dateFormatter.format(new Date(review.submittedAt)),
    },
    { label: "SLA due", value: dateFormatter.format(new Date(review.dueAt)) },
    { label: "Days remaining", value: `${review.daysRemaining} days` },
  ];

  const dossier = [
    { label: "Applicant", value: review.applicantName },
    { label: "Directorate", value: review.directorate },
    { label: "Assigned to", value: review.assignedTo },
    { label: "Attachments", value: `${review.attachments} supporting files` },
  ];

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
            <Badge className="border border-[#d8e4df] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {review.id}
            </Badge>
          </div>
        </SheetHeader>

        <Separator className="bg-[#e3efea]" />

        <ScrollArea className="flex-1">
          <div className="space-y-8 px-6 py-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dossier.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {timeline.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#d8e4df] bg-white px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
              <div className="rounded-2xl border border-[#d8e4df] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Completion
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Progress
                    value={review.completion}
                    className="h-2 flex-1 overflow-hidden rounded-full bg-[#e3efea]"
                  />
                  <span className="text-sm font-semibold text-[#0f766e]">
                    {review.completion}%
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Document Artifacts ({review.documents.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {review.documents.map((document) => (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document)}
                    className="group cursor-pointer rounded-2xl border border-[#d8e4df] bg-white p-4 transition-all hover:border-[#0f766e] hover:shadow-[0_8px_24px_-12px_rgba(11,64,55,0.25)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{documentTypeIcons[document.type]}</span>
                          <h4 className="font-medium text-slate-900 text-sm leading-tight truncate">
                            {document.name}
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {document.issuer && (
                            <p className="text-xs text-slate-600">Issued by: {document.issuer}</p>
                          )}
                          {document.uploadedAt && (
                            <p className="text-xs text-slate-500">
                              Uploaded: {dateFormatter.format(new Date(document.uploadedAt))}
                            </p>
                          )}
                          {document.validUntil && (
                            <p className="text-xs text-slate-500">
                              Valid until: {dateFormatter.format(new Date(document.validUntil))}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">{document.size}</p>
                        </div>
                      </div>
                      <Badge
                        className={`text-xs px-2 py-1 ${documentStatusStyles[document.status]}`}
                      >
                        {document.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Reviewer notes
              </h3>
              <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-5 py-4 text-sm leading-relaxed text-slate-700">
                {review.notes}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Suggested follow-up
              </h3>
              <div className="rounded-2xl border border-[#d8e4df] bg-white px-5 py-4 text-sm text-slate-700">
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    Confirm outstanding documents and notify {review.assignedTo}{" "}
                    of updated SLA expectations.
                  </li>
                  <li>
                    Review supporting files ({review.attachments}) for
                    compliance deviations before next stage.
                  </li>
                  <li>
                    Coordinate with the {review.directorate} team for any
                    dependencies impacting the business journey.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
