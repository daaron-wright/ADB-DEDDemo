import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ReviewQueueItem {
  id: string;
  applicantName: string;
  serviceName: string;
  directorate: string;
  priority: "High" | "Medium" | "Low";
  stage: string;
  submittedAt: string;
  dueAt: string;
  slaStatus: "On Track" | "At Risk" | "Breached";
  daysRemaining: number;
  assignedTo: string;
  attachments: number;
  summary: string;
  notes: string;
  completion: number;
}

const priorityStyles: Record<ReviewQueueItem["priority"], string> = {
  High: "border-[#f4bebe] bg-[#fdf1f0] text-[#b23b31]",
  Medium: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  Low: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
};

const slaStyles: Record<ReviewQueueItem["slaStatus"], string> = {
  "On Track": "text-[#0f766e] bg-[#eaf7f3] border-[#b7e1d4]",
  "At Risk": "text-[#b97324] bg-[#fdf6e4] border-[#f3dcb6]",
  Breached: "text-[#b23b31] bg-[#fdf1f0] border-[#f4bebe]",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface ReviewQueueCardProps {
  item: ReviewQueueItem;
  onOpen?: (item: ReviewQueueItem) => void;
}

export function ReviewQueueCard({ item, onOpen }: ReviewQueueCardProps) {
  const handleActivate = () => {
    onOpen?.(item);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <article
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen ? handleActivate : undefined}
      onKeyDown={onOpen ? handleKeyDown : undefined}
      className={cn(
        "rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_16px_36px_-30px_rgba(11,64,55,0.22)] transition hover:shadow-[0_22px_48px_-34px_rgba(11,64,55,0.30)] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:ring-offset-2",
        onOpen ? "cursor-pointer focus-visible:ring-[#0f766e]/40" : "",
      )}
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-slate-900">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            {item.id}
          </p>
          <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
            {item.serviceName}
          </h3>
          <p className="text-sm text-slate-600">{item.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-slate-900">
          <Badge
            className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${priorityStyles[item.priority]}`}
          >
            {item.priority} priority
          </Badge>
          <Badge className="border border-[#b7e1d4] bg-[#eaf7f3] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#0f766e]">
            {item.stage}
          </Badge>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 text-slate-900">
        <Info label="Applicant" value={item.applicantName} />
        <Info label="Directorate" value={item.directorate} />
        <Info label="Assigned to" value={item.assignedTo} />
        <Info
          label="Submitted"
          value={dateFormatter.format(new Date(item.submittedAt))}
        />
        <Info
          label="SLA due"
          value={dateFormatter.format(new Date(item.dueAt))}
        />
        <Info label="Attachments" value={`${item.attachments} supporting`} />
        <Info
          label="SLA status"
          value={item.slaStatus}
          badgeClass={slaStyles[item.slaStatus]}
        />
        <Info
          label="Days remaining"
          value={`${item.daysRemaining} days`}
          emphasise={item.daysRemaining <= 2}
        />
      </div>

      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-1 items-center gap-4 text-slate-900">
          <Progress
            value={item.completion}
            className="h-2 flex-1 overflow-hidden rounded-full bg-[#e3efea]"
          />
          <span className="text-sm font-medium text-[#0f766e]">
            {item.completion}% checklist complete
          </span>
        </div>
        <div className="max-w-md rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Reviewer notes</p>
          <p className="mt-1 leading-relaxed text-slate-600">{item.notes}</p>
        </div>
      </div>
    </article>
  );
}

interface InfoProps {
  label: string;
  value: string;
  badgeClass?: string;
  emphasise?: boolean;
}

function Info({ label, value, badgeClass, emphasise }: InfoProps) {
  return (
    <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
        {label}
      </p>
      {badgeClass ? (
        <span
          className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {value}
        </span>
      ) : (
        <p
          className={`mt-2 text-sm font-semibold ${emphasise ? "text-[#b23b31]" : "text-slate-900"}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
