import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface ReviewQueueItem {
  id: string;
  applicantName: string;
  serviceName: string;
  directorate: string;
  priority: 'High' | 'Medium' | 'Low';
  stage: string;
  submittedAt: string;
  dueAt: string;
  slaStatus: 'On Track' | 'At Risk' | 'Breached';
  daysRemaining: number;
  assignedTo: string;
  attachments: number;
  summary: string;
  notes: string;
  completion: number;
}

const priorityStyles: Record<ReviewQueueItem['priority'], string> = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const slaStyles: Record<ReviewQueueItem['slaStatus'], string> = {
  'On Track': 'text-emerald-600 bg-emerald-50 border-emerald-100',
  'At Risk': 'text-amber-600 bg-amber-50 border-amber-100',
  Breached: 'text-rose-600 bg-rose-50 border-rose-100',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

interface ReviewQueueCardProps {
  item: ReviewQueueItem;
}

export function ReviewQueueCard({ item }: ReviewQueueCardProps) {
  return (
    <article className="rounded-3xl border border-white/30 bg-white/95 p-6 shadow-[0_28px_64px_-34px_rgba(24,32,63,0.6)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-500/70">{item.id}</p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            {item.serviceName}
          </h3>
          <p className="text-sm text-slate-600">{item.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${priorityStyles[item.priority]}`}>
            {item.priority} priority
          </Badge>
          <Badge className="border border-purple-200 bg-purple-50/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-700">
            {item.stage}
          </Badge>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Applicant" value={item.applicantName} />
        <Info label="Directorate" value={item.directorate} />
        <Info label="Assigned to" value={item.assignedTo} />
        <Info label="Submitted" value={dateFormatter.format(new Date(item.submittedAt))} />
        <Info label="SLA due" value={dateFormatter.format(new Date(item.dueAt))} />
        <Info label="Attachments" value={`${item.attachments} supporting`} />
        <Info label="SLA status" value={item.slaStatus} badgeClass={slaStyles[item.slaStatus]} />
        <Info label="Days remaining" value={`${item.daysRemaining} days`} emphasise={item.daysRemaining <= 2} />
      </div>

      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-1 items-center gap-4">
          <Progress value={item.completion} className="h-2 flex-1 overflow-hidden bg-purple-100" />
          <span className="text-sm font-medium text-slate-600">{item.completion}% checklist complete</span>
        </div>
        <div className="max-w-md rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-3 text-sm text-purple-800">
          <p className="font-semibold text-purple-900">Reviewer notes</p>
          <p className="mt-1 leading-relaxed text-purple-700">{item.notes}</p>
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
    <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-500/70">{label}</p>
      {badgeClass ? (
        <span className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <p className={`mt-2 text-sm font-semibold ${emphasise ? 'text-rose-600' : 'text-slate-800'}`}>
          {value}
        </p>
      )}
    </div>
  );
}
