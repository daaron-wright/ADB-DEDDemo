import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FilterSection } from '@/components/portal/FilterSection';
import { SummaryMetric } from '@/components/portal/SummaryMetric';
import { ReviewQueueCard, type ReviewQueueItem } from '@/components/portal/ReviewQueueCard';
import { PortalProfileMenu } from '@/components/portal/PortalProfileMenu';

const directorateOptions = [
  'Department of Economic Development',
  'Abu Dhabi Municipality',
  'Civil Defense',
  'Department of Health',
  'Department of Culture and Tourism',
] as const;

const slaOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'On track', value: 'On Track' },
  { label: 'At risk', value: 'At Risk' },
  { label: 'Breached', value: 'Breached' },
] as const;

const priorityOptions = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
] as const;

const stageOptions = [
  { label: 'All stages', value: 'all' },
  { label: 'Technical Review', value: 'Technical Review' },
  { label: 'Compliance Check', value: 'Compliance Check' },
  { label: 'Field Inspection', value: 'Field Inspection' },
  { label: 'Financial Vetting', value: 'Financial Vetting' },
] as const;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const reviewQueue: ReviewQueueItem[] = [
  {
    id: 'REV-20347',
    applicantName: 'Quantum Café LLC',
    serviceName: 'Commercial Kitchen Fit-Out Inspection',
    directorate: 'Department of Economic Development',
    priority: 'High',
    stage: 'Technical Review',
    submittedAt: '2024-03-15',
    dueAt: '2024-03-22',
    slaStatus: 'At Risk',
    daysRemaining: 3,
    assignedTo: 'Sarah Al Zaabi',
    attachments: 5,
    summary:
      'Kitchen expansion requiring fire safety clearance, IoT monitoring compliance, and zoning validation for delivery drones.',
    notes: 'Awaiting updated hydraulic calculations from engineering consultant before final sign-off.',
    completion: 54,
  },
  {
    id: 'REV-20318',
    applicantName: 'Lumina Health FZ-LLC',
    serviceName: 'Telehealth Platform License Renewal',
    directorate: 'Department of Health',
    priority: 'Medium',
    stage: 'Compliance Check',
    submittedAt: '2024-03-12',
    dueAt: '2024-03-24',
    slaStatus: 'On Track',
    daysRemaining: 5,
    assignedTo: 'Omar Rahman',
    attachments: 7,
    summary:
      'Renewal focused on patient data residency, AI triage accuracy, and cross-border telemedicine coverage for GCC nationals.',
    notes: 'Verify SOC2 certificate validity and capture updated cybersecurity audit letter.',
    completion: 68,
  },
  {
    id: 'REV-20294',
    applicantName: 'Heritage Immersive Studios',
    serviceName: 'Immersive Event Permit',
    directorate: 'Department of Culture and Tourism',
    priority: 'High',
    stage: 'Field Inspection',
    submittedAt: '2024-03-09',
    dueAt: '2024-03-19',
    slaStatus: 'Breached',
    daysRemaining: -1,
    assignedTo: 'Mariam Al Nuaimi',
    attachments: 4,
    summary:
      'Night-time projection across Qasr Al Hosn with synchronized crowd routing and live translation features.',
    notes: 'Inspection slot missed yesterday—reschedule with operations and inform safety command.',
    completion: 42,
  },
  {
    id: 'REV-20288',
    applicantName: 'GreenWave Mobility',
    serviceName: 'Autonomous Fleet Expansion',
    directorate: 'Abu Dhabi Municipality',
    priority: 'Low',
    stage: 'Financial Vetting',
    submittedAt: '2024-03-08',
    dueAt: '2024-03-28',
    slaStatus: 'On Track',
    daysRemaining: 10,
    assignedTo: 'Fatima Al Mazrouei',
    attachments: 6,
    summary:
      'Fleet expansion of electric autonomous shuttles across Yas Island including updated insurance and depot readiness.',
    notes: 'Awaiting insurer confirmation for additional vehicles and LiDAR warranty extension.',
    completion: 47,
  },
  {
    id: 'REV-20277',
    applicantName: 'Skyline Construction',
    serviceName: 'High-Rise Safety Re-certification',
    directorate: 'Civil Defense',
    priority: 'Medium',
    stage: 'Technical Review',
    submittedAt: '2024-03-10',
    dueAt: '2024-03-20',
    slaStatus: 'At Risk',
    daysRemaining: 2,
    assignedTo: 'Yousef Al Ameri',
    attachments: 9,
    summary:
      'Annual recertification for fire suppression and evacuation systems across 52-storey mixed-use tower.',
    notes: 'Need final signatures from mechanical engineer before issuing compliance certificate.',
    completion: 61,
  },
];

const priorityWeight: Record<ReviewQueueItem['priority'], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const defaultDirectorates = directorateOptions.map((value) => value);

export default function ReviewerPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirectorates, setSelectedDirectorates] = useState<string[]>(defaultDirectorates);
  const [selectedSlaStatus, setSelectedSlaStatus] = useState<(typeof slaOptions)[number]['value']>('all');
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]['value']>('all');
  const [selectedStage, setSelectedStage] = useState<(typeof stageOptions)[number]['value']>('all');
  const [daysThreshold, setDaysThreshold] = useState<number[]>([7]);
  const [sortBy, setSortBy] = useState<'due' | 'priority'>('due');

  const location = useLocation();
  const portalUser = (location.state as { user?: { name?: string; role?: string; email?: string; avatarUrl?: string } } | undefined)?.user;
  const firstName = portalUser?.name ? portalUser.name.split(' ')[0] : null;
  const pageTitle = firstName ? `${firstName}'s review desk` : 'Reviewer command center';
  const pageDescription = firstName
    ? `Monitor the unified queue, ${firstName}, keep SLAs healthy, and collaborate with your team to move applications forward.`
    : 'Monitor the unified queue, keep SLAs healthy, and collaborate with your team to move applications forward.';
  const profileName = portalUser?.name ?? 'Sarah Al Zaabi';
  const profileEmail = portalUser?.email ?? 'sarah.alzaabi@adm.ae';
  const profileAvatar = portalUser?.avatarUrl ?? 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80';
  const profileStatus: 'online' | 'offline' | 'none' = 'online';

  const handleSignOut = () => {
    window.location.assign('/');
  };

  const allDirectoratesSelected = selectedDirectorates.length === directorateOptions.length;
  const someDirectoratesSelected = selectedDirectorates.length > 0 && !allDirectoratesSelected;
  const daysUpperBound = daysThreshold[0] ?? 7;

  const filteredQueue = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase();

    return reviewQueue
      .filter((item) => {
        const matchesSearch = loweredSearch
          ? item.applicantName.toLowerCase().includes(loweredSearch) ||
            item.serviceName.toLowerCase().includes(loweredSearch) ||
            item.id.toLowerCase().includes(loweredSearch)
          : true;

        const matchesDirectorate = allDirectoratesSelected
          ? true
          : selectedDirectorates.includes(item.directorate);

        const matchesSla = selectedSlaStatus === 'all' ? true : item.slaStatus === selectedSlaStatus;

        const matchesPriority = priorityFilter === 'all' ? true : item.priority === priorityFilter;

        const matchesStage = selectedStage === 'all' ? true : item.stage === selectedStage;

        const matchesDays = item.daysRemaining <= daysUpperBound;

        return (
          matchesSearch &&
          matchesDirectorate &&
          matchesSla &&
          matchesPriority &&
          matchesStage &&
          matchesDays
        );
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        }

        return a.daysRemaining - b.daysRemaining;
      });
  }, [
    searchTerm,
    selectedDirectorates,
    selectedSlaStatus,
    priorityFilter,
    selectedStage,
    daysUpperBound,
    sortBy,
    allDirectoratesSelected,
  ]);

  const atRiskCount = reviewQueue.filter((item) => item.slaStatus === 'At Risk' || item.slaStatus === 'Breached').length;
  const breachedCount = reviewQueue.filter((item) => item.slaStatus === 'Breached').length;
  const recoverableCount = reviewQueue.filter((item) => item.slaStatus === 'At Risk' && item.daysRemaining > 0).length;
  const highPriorityCount = reviewQueue.filter((item) => item.priority === 'High').length;
  const averageDaysRemaining = Math.round(
    reviewQueue.reduce((acc, item) => acc + item.daysRemaining, 0) / reviewQueue.length,
  );
  const latestIntake = reviewQueue
    .map((item) => new Date(item.submittedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const newIntakes48h = reviewQueue.filter((item) => {
    const submitted = new Date(item.submittedAt);
    const diffInDays = (Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 2;
  }).length;

  const handleDirectorateChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedDirectorates((prev) => {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      });
    } else {
      setSelectedDirectorates((prev) => prev.filter((item) => item !== value));
    }
  };

  const handleToggleAllDirectorates = (checked: boolean) => {
    if (checked) {
      setSelectedDirectorates(defaultDirectorates);
    } else {
      setSelectedDirectorates([]);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDirectorates(defaultDirectorates);
    setSelectedSlaStatus('all');
    setPriorityFilter('all');
    setSelectedStage('all');
    setDaysThreshold([7]);
    setSortBy('due');
  };

  const filters = (
    <>
      <FilterSection title="Search and filter" description="Search by applicant, service name, or queue reference.">
        <div className="relative">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by applicant or ID"
            className="h-11 rounded-2xl border-neutral-200 bg-white pr-11 text-sm text-slate-900 placeholder:text-slate-400"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </FilterSection>

      <FilterSection title="Directorate">
        <div className="space-y-3">
          <Checkbox
            id="review-all-directorates"
            label="All directorates"
            checked={allDirectoratesSelected}
            indeterminate={someDirectoratesSelected && !allDirectoratesSelected}
            onCheckedChange={handleToggleAllDirectorates}
            className="border-neutral-200"
            checkboxClassName="border-neutral-300 text-purple-600 focus-visible:ring-purple-300"
          />

          {directorateOptions.map((option) => (
            <Checkbox
              key={option}
              id={`review-directorate-${slugify(option)}`}
              label={option}
              checked={selectedDirectorates.includes(option)}
              onCheckedChange={(checked) => handleDirectorateChange(option, checked)}
              checkboxClassName="border-neutral-300 text-purple-600 focus-visible:ring-purple-300"
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="SLA status">
        <RadioGroup
          value={selectedSlaStatus}
          onValueChange={setSelectedSlaStatus}
          className="space-y-2"
        >
          {slaOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]"
            >
              <RadioGroupItem
                value={option.value}
                id={`sla-${option.value}`}
                className="border-neutral-300 text-purple-600 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-50"
              />
              <Label htmlFor={`sla-${option.value}`} className="text-sm text-slate-900">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Priority">
        <RadioGroup value={priorityFilter} onValueChange={setPriorityFilter} className="space-y-2">
          {priorityOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]"
            >
              <RadioGroupItem
                value={option.value}
                id={`priority-${option.value}`}
                className="border-neutral-300 text-purple-600 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-50"
              />
              <Label htmlFor={`priority-${option.value}`} className="text-sm text-slate-900">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Workflow stage">
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="h-11 rounded-2xl border-neutral-200 bg-white text-sm text-slate-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-neutral-200 bg-white text-slate-900">
            <SelectGroup>
              {stageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-purple-50">
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Due within" description="Focus on items with the tightest SLA window.">
        <div className="space-y-3">
          <Slider
            value={daysThreshold}
            onValueChange={(value) => setDaysThreshold(value)}
            min={-2}
            max={14}
            step={1}
            className="py-3"
          />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
            <span>Days remaining</span>
            <span>{daysUpperBound} days</span>
          </div>
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-white"
      >
        Reset filters
      </button>
    </>
  );

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-full border border-neutral-600 bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-400 hover:text-white"
      >
        Export queue
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-[0_22px_60px_-30px_rgba(0,0,0,0.75)] transition hover:bg-neutral-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Assign reviewer
      </button>
    </div>
  );

  return (
    <PortalPageLayout
      title={pageTitle}
      subtitle="Business license portal"
      description={pageDescription}
      filters={filters}
      headerActions={headerActions}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryMetric
          label="Queue volume"
          value={reviewQueue.length.toString()}
          helper={latestIntake ? `Latest intake ${latestIntake.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : undefined}
          trend={{ value: `${newIntakes48h} in 48 hours`, isPositive: true }}
        />
        <SummaryMetric
          label="At risk or breached"
          value={atRiskCount.toString()}
          helper={`${breachedCount} breached • ${recoverableCount} recoverable`}
          trend={{ value: `${recoverableCount} within SLA`, isPositive: recoverableCount > 0 }}
        />
        <SummaryMetric
          label="High priority"
          value={highPriorityCount.toString()}
          helper={`Avg days remaining ${averageDaysRemaining}d`}
        />
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Review queue</h2>
            <p className="text-sm text-neutral-300">
              Showing {filteredQueue.length} of {reviewQueue.length} cases.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Sort</span>
            <Select value={sortBy} onValueChange={(value: 'due' | 'priority') => setSortBy(value)}>
              <SelectTrigger className="h-10 w-48 rounded-2xl border-neutral-700 bg-neutral-900 text-sm text-neutral-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-neutral-800 bg-neutral-950/95 text-neutral-100">
                <SelectGroup>
                  <SelectItem value="due" className="rounded-xl text-sm text-neutral-100 data-[state=checked]:bg-neutral-800">
                    Soonest SLA first
                  </SelectItem>
                  <SelectItem value="priority" className="rounded-xl text-sm text-neutral-100 data-[state=checked]:bg-neutral-800">
                    Priority (high to low)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-900/80 p-10 text-center text-sm text-neutral-300">
            No review cases match the current filters. Adjust your filters to see more results.
          </div>
        ) : (
          <div className="space-y-6 text-neutral-100">
            {filteredQueue.map((item) => (
              <ReviewQueueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </PortalPageLayout>
  );
}
