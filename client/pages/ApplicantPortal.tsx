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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FilterSection } from '@/components/portal/FilterSection';
import { SummaryMetric } from '@/components/portal/SummaryMetric';
import { PortalProfileMenu } from '@/components/portal/PortalProfileMenu';

interface ApplicationRecord {
  id: string;
  title: string;
  directorate: string;
  beneficiary: 'Citizen' | 'Resident' | 'Investor' | 'Visitor';
  status: 'In Review' | 'Awaiting Documents' | 'Approved' | 'Draft';
  licenseType: 'Commercial License' | 'Dual License' | 'Professional License';
  progress: number;
  submissionDate: string;
  lastUpdated: string;
  nextAction: string;
  summary: string;
}

const directorateOptions = [
  'Department of Economic Development',
  'Abu Dhabi Agriculture and Food Safety Authority',
  'Department of Health',
  'Department of Culture and Tourism',
] as const;

const beneficiaryOptions = [
  { label: 'All beneficiaries', value: 'all' },
  { label: 'Citizen', value: 'Citizen' },
  { label: 'Resident', value: 'Resident' },
  { label: 'Investor', value: 'Investor' },
  { label: 'Visitor', value: 'Visitor' },
] as const;

const licenseOptions = [
  { label: 'All license types', value: 'all' },
  { label: 'Commercial License', value: 'Commercial License' },
  { label: 'Dual License', value: 'Dual License' },
  { label: 'Professional License', value: 'Professional License' },
] as const;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const applications: ApplicationRecord[] = [
  {
    id: 'APP-48291',
    title: 'AI Hospitality Launch Permit',
    directorate: 'Department of Economic Development',
    beneficiary: 'Citizen',
    status: 'In Review',
    licenseType: 'Commercial License',
    progress: 68,
    submissionDate: '2024-03-14',
    lastUpdated: '2024-03-18',
    nextAction: 'Upload signed tenancy contract for Khalifa City premises.',
    summary:
      'Comprehensive restaurant launch covering trade name reservation, food safety clearance, and smart staffing approvals across the Abu Dhabi mainland.',
  },
  {
    id: 'APP-47903',
    title: 'AgriTech Research Hub License',
    directorate: 'Abu Dhabi Agriculture and Food Safety Authority',
    beneficiary: 'Investor',
    status: 'Awaiting Documents',
    licenseType: 'Dual License',
    progress: 51,
    submissionDate: '2024-03-05',
    lastUpdated: '2024-03-16',
    nextAction: 'Submit memorandum of association signed by all shareholders.',
    summary:
      'Dual mainland and free-zone registration for smart greenhouse operations including cross-emirate produce distribution and AI irrigation models.',
  },
  {
    id: 'APP-47112',
    title: 'Wellness Clinic Expansion',
    directorate: 'Department of Health',
    beneficiary: 'Resident',
    status: 'Approved',
    licenseType: 'Professional License',
    progress: 100,
    submissionDate: '2024-02-08',
    lastUpdated: '2024-03-12',
    nextAction: 'Schedule onboarding and collect final license packet from smart locker.',
    summary:
      'Professional services expansion for physiotherapy and AI-guided rehabilitation programs located within Reem Island innovation district.',
  },
  {
    id: 'APP-46744',
    title: 'Cultural Experience Studio',
    directorate: 'Department of Culture and Tourism',
    beneficiary: 'Citizen',
    status: 'Draft',
    licenseType: 'Commercial License',
    progress: 32,
    submissionDate: '2024-02-21',
    lastUpdated: '2024-03-02',
    nextAction: 'Confirm venue lease start date to trigger site inspection scheduling.',
    summary:
      'Immersive visitor studio combining AR-guided heritage tours with curated retail for Emirati artisans in the Yas Creative Hub.',
  },
];

const statusStyles: Record<ApplicationRecord['status'], string> = {
  'In Review': 'bg-purple-50 text-purple-700 border-purple-200',
  'Awaiting Documents': 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft: 'bg-slate-50 text-slate-600 border-slate-200',
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

type SortOption = 'recent' | 'progress';

const defaultDirectorates = directorateOptions.map((value) => value);

export default function ApplicantPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirectorates, setSelectedDirectorates] = useState<string[]>(defaultDirectorates);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<(typeof beneficiaryOptions)[number]['value']>('all');
  const [selectedLicenseType, setSelectedLicenseType] = useState<(typeof licenseOptions)[number]['value']>('all');
  const [progressThreshold, setProgressThreshold] = useState<number[]>([30]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const location = useLocation();
  const portalUser = (location.state as { user?: { name?: string; role?: string; email?: string; avatarUrl?: string } } | undefined)?.user;
  const firstName = portalUser?.name ? portalUser.name.split(' ')[0] : null;
  const workspaceTitle = firstName ? `${firstName}'s workspace` : 'Applicant workspace';
  const workspaceDescription = firstName
    ? `Track every application, ${firstName}, understand what is blocking approval, and continue building your business in Abu Dhabi with clarity.`
    : 'Track every application, understand what is blocking approval, and continue building your business in Abu Dhabi with clarity.';
  const profileName = portalUser?.name ?? 'Ahmed Al Mansoori';
  const profileEmail = portalUser?.email ?? 'ahmed.almansoori@email.ae';
  const profileAvatar = portalUser?.avatarUrl ?? 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80';
  const profileStatus: 'online' | 'offline' | 'none' = 'online';

  const handleSignOut = () => {
    window.location.assign('/');
  };

  const minProgress = progressThreshold[0] ?? 0;
  const allDirectoratesSelected = selectedDirectorates.length === directorateOptions.length;
  const someDirectoratesSelected = selectedDirectorates.length > 0 && !allDirectoratesSelected;

  const filteredApplications = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase();

    return applications
      .filter((application) => {
        const matchesSearch = loweredSearch
          ? application.title.toLowerCase().includes(loweredSearch) ||
            application.id.toLowerCase().includes(loweredSearch)
          : true;

        const matchesDirectorate = allDirectoratesSelected
          ? true
          : selectedDirectorates.includes(application.directorate);

        const matchesBeneficiary =
          selectedBeneficiary === 'all' ? true : application.beneficiary === selectedBeneficiary;

        const matchesLicense =
          selectedLicenseType === 'all' ? true : application.licenseType === selectedLicenseType;

        const matchesProgress = application.progress >= minProgress;

        return matchesSearch && matchesDirectorate && matchesBeneficiary && matchesLicense && matchesProgress;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          return b.progress - a.progress;
        }

        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  }, [
    searchTerm,
    selectedDirectorates,
    selectedBeneficiary,
    selectedLicenseType,
    minProgress,
    sortBy,
    allDirectoratesSelected,
  ]);

  const inReviewCount = applications.filter((item) =>
    item.status === 'In Review' || item.status === 'Awaiting Documents',
  ).length;
  const approvedCount = applications.filter((item) => item.status === 'Approved').length;
  const averageProgress = Math.round(
    applications.reduce((acc, item) => acc + item.progress, 0) / applications.length,
  );

  const latestSubmission = applications
    .map((item) => new Date(item.submissionDate))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const recentSubmissionsCount = applications.filter((item) => {
    const submissionDate = new Date(item.submissionDate);
    const diffInDays = (Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 14;
  }).length;

  const approvalsLastSevenDays = applications.filter((item) => {
    if (item.status !== 'Approved') {
      return false;
    }
    const approvalDate = new Date(item.lastUpdated);
    const diffInDays = (Date.now() - approvalDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  }).length;

  const activeReviewsUpdated = applications.filter((item) => {
    if (!(item.status === 'In Review' || item.status === 'Awaiting Documents')) {
      return false;
    }
    const updateDate = new Date(item.lastUpdated);
    const diffInDays = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
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
    setSelectedBeneficiary('all');
    setSelectedLicenseType('all');
    setProgressThreshold([30]);
    setSortBy('recent');
  };

  const filters = (
    <>
      <FilterSection title="Search and filter" description="Find an application quickly by service or reference ID.">
        <div className="relative">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by service or ID"
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
            id="all-directorates"
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
              id={`directorate-${slugify(option)}`}
              label={option}
              checked={selectedDirectorates.includes(option)}
              onCheckedChange={(checked) => handleDirectorateChange(option, checked)}
              checkboxClassName="border-neutral-300 text-purple-600 focus-visible:ring-purple-300"
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Beneficiary">
        <RadioGroup
          value={selectedBeneficiary}
          onValueChange={(value) =>
            setSelectedBeneficiary(value as (typeof beneficiaryOptions)[number]['value'])
          }
          className="space-y-2"
        >
          {beneficiaryOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]"
            >
              <RadioGroupItem
                value={option.value}
                id={`beneficiary-${option.value}`}
                className="border-neutral-300 text-purple-600 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-50"
              />
              <Label htmlFor={`beneficiary-${option.value}`} className="text-sm text-slate-900">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="License type">
        <Select
          value={selectedLicenseType}
          onValueChange={(value) =>
            setSelectedLicenseType(value as (typeof licenseOptions)[number]['value'])
          }
        >
          <SelectTrigger className="h-11 rounded-2xl border-neutral-200 bg-white text-sm text-slate-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-neutral-200 bg-white text-slate-900">
            <SelectGroup>
              {licenseOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-purple-50">
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Progress threshold" description="Only show applications above this completion level.">
        <div className="space-y-3">
          <Slider
            value={progressThreshold}
            onValueChange={(value) => setProgressThreshold(value)}
            min={0}
            max={100}
            step={5}
            className="py-3"
          />
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Minimum progress</span>
            <span>{minProgress}%</span>
          </div>
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-neutral-300 hover:text-slate-900"
      >
        Reset filters
      </button>
    </>
  );

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.45)] transition hover:bg-slate-800"
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
        New application
      </button>
      <PortalProfileMenu
        name={profileName}
        email={profileEmail}
        avatarUrl={profileAvatar}
        status={profileStatus}
        onSignOut={handleSignOut}
      />
    </div>
  );

  return (
    <PortalPageLayout
      title={workspaceTitle}
      subtitle="Business license portal"
      description={workspaceDescription}
      filters={filters}
      headerActions={headerActions}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryMetric
          label="Total applications"
          value={applications.length.toString()}
          helper={latestSubmission ? `Last submission ${dateFormatter.format(latestSubmission)}` : undefined}
          trend={{ value: `${recentSubmissionsCount} in 14 days`, isPositive: true }}
        />
        <SummaryMetric
          label="Active reviews"
          value={inReviewCount.toString()}
          helper={`${applications.filter((item) => item.status === 'Awaiting Documents').length} awaiting documents`}
          trend={{ value: `${activeReviewsUpdated} updated in 3 days`, isPositive: true }}
        />
        <SummaryMetric
          label="Average completion"
          value={`${averageProgress}%`}
          helper={`${approvalsLastSevenDays} approvals in 7 days`}
        />
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Application overview</h2>
            <p className="text-sm text-slate-600">
              Showing {filteredApplications.length} of {applications.length} applications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sort</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="h-10 w-48 rounded-2xl border-neutral-200 bg-white text-sm text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-neutral-200 bg-white text-slate-900">
                <SelectGroup>
                  <SelectItem value="recent" className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-purple-50">
                    Last updated
                  </SelectItem>
                  <SelectItem value="progress" className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-purple-50">
                    Progress (high to low)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-slate-600 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]">
            No applications match the current filters. Adjust your filters to see more results.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <article
                key={application.id}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_24px_48px_-30px_rgba(15,23,42,0.35)]"
              >
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {application.id}
                    </p>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                      {application.title}
                    </h3>
                    <p className="text-sm text-slate-600">{application.summary}</p>
                  </div>
                  <Badge
                    className={`border ${statusStyles[application.status]} px-3 py-1.5 text-xs font-semibold uppercase tracking-wide`}
                  >
                    {application.status}
                  </Badge>
                </header>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 text-slate-900">
                  <InfoItem label="Directorate" value={application.directorate} />
                  <InfoItem label="Beneficiary" value={application.beneficiary} />
                  <InfoItem label="License" value={application.licenseType} />
                  <InfoItem label="Submitted" value={dateFormatter.format(new Date(application.submissionDate))} />
                  <InfoItem label="Last update" value={dateFormatter.format(new Date(application.lastUpdated))} />
                  <InfoItem label="Progress" value={`${application.progress}%`} />
                  <InfoItem label="Next milestone" value={application.nextAction.split('.')[0]} />
                </div>

                <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex w-full flex-1 items-center gap-4">
                    <Progress value={application.progress} className="h-2 flex-1 overflow-hidden bg-neutral-200" />
                    <span className="text-sm font-medium text-slate-600">{application.progress}% complete</span>
                  </div>
                  <div className="max-w-md rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]">
                    <p className="font-semibold text-slate-900">Next action</p>
                    <p className="mt-1 leading-relaxed text-slate-600">{application.nextAction}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PortalPageLayout>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
