import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { PortalPageLayout } from "@/components/portal/PortalPageLayout";
import { FilterSection } from "@/components/portal/FilterSection";
import { SummaryMetric } from "@/components/portal/SummaryMetric";
import {
  ReviewQueueCard,
  type ReviewQueueItem,
} from "@/components/portal/ReviewQueueCard";
import { PortalProfileMenu } from "@/components/portal/PortalProfileMenu";
import { ReviewFocusSheet } from "@/components/portal/ReviewFocusSheet";

const stageOptions = [
  { label: "All stages", value: "all" },
  { label: "Questionnaire", value: "Questionnaire" },
  { label: "Business Registration", value: "Business Registration" },
  { label: "Submit Documents", value: "Submit Documents" },
  { label: "Business Licensing", value: "Business Licensing" },
  { label: "Pre-Operational Inspection", value: "Pre-Operational Inspection" },
] as const;

const policyAgentOptions = [
  { id: "policy-ai", label: "Policy AI Specialist" },
  { id: "compliance-lead", label: "Compliance Lead" },
  { id: "operations-mentor", label: "Operations Mentor" },
  { id: "legal-reviewer", label: "Legal Reviewer" },
] as const;

const policyGlossary = [
  {
    id: "foreign-ownership-policy",
    document: "Foreign ownership structure",
    summary:
      "Clarifies mainland vs. freezone equity rules, Emirati partner requirements, and capital thresholds for each business type.",
    category: "Governance",
    defaultAgent: "policy-ai",
  },
  {
    id: "food-safety-blueprint",
    document: "Food safety blueprint",
    summary:
      "Outlines HACCP certification evidence, cold-chain monitoring expectations, and seasonal permit escalation timelines.",
    category: "Operations",
    defaultAgent: "compliance-lead",
  },
  {
    id: "retail-fitout-policy",
    document: "Retail fit-out compliance",
    summary:
      "Details signage, accessibility, and fire-suppression design standards for retail and F&B fit-outs in Abu Dhabi.",
    category: "Infrastructure",
    defaultAgent: "operations-mentor",
  },
  {
    id: "dual-license-guidance",
    document: "Dual license guidance",
    summary:
      "Explains documentation for dual mainland-freezone licensing, including attestation flow and SLA expectations.",
    category: "Licensing",
    defaultAgent: "legal-reviewer",
  },
] as const;

const reviewQueue: ReviewQueueItem[] = [
  {
    id: "REV-20347",
    applicantName: "Corniche Culinary Collective",
    serviceName: "Commercial Kitchen Fit-Out Inspection",
    directorate: "Department of Economic Development",
    priority: "High",
    stage: "Business Licensing",
    submittedAt: "2024-03-15",
    dueAt: "2024-03-22",
    slaStatus: "At Risk",
    daysRemaining: 3,
    assignedTo: "Sarah Al Zaabi",
    attachments: 5,
    documents: [
      {
        id: "doc-economic-license",
        name: "Economic License (DED)",
        type: "license",
        status: "approved",
        issuer: "Department of Economic Development",
        validUntil: "2025-03-15",
        uploadedAt: "2024-03-10",
        size: "2.1 MB"
      },
      {
        id: "doc-certificate-conformity",
        name: "Certificate of Conformity (ADCDA)",
        type: "certificate",
        status: "approved",
        issuer: "Abu Dhabi City and Districts Center",
        uploadedAt: "2024-03-12",
        size: "1.8 MB"
      },
      {
        id: "doc-food-safety-cert",
        name: "Food Safety Certification (ADAFSA)",
        type: "certificate",
        status: "under_review",
        issuer: "Abu Dhabi Agriculture and Food Safety Authority",
        uploadedAt: "2024-03-14",
        size: "3.2 MB"
      },
      {
        id: "doc-fire-suppression",
        name: "Fire Suppression Layout",
        type: "plan",
        status: "pending",
        uploadedAt: "2024-03-15",
        size: "5.4 MB"
      },
      {
        id: "doc-tenancy-contract",
        name: "Signed Tenancy Contract",
        type: "contract",
        status: "required",
        size: "Expected"
      }
    ],
    summary:
      "Full-service restaurant launch requiring updated fire suppression layout, IoT kitchen monitoring configuration, and tenancy validation.",
    notes:
      "Awaiting revised fire suppression drawings before issuing final clearance.",
    completion: 54,
  },
  {
    id: "REV-20318",
    applicantName: "Falafel Express Drive-Thru",
    serviceName: "Drive-Thru Operations Permit",
    directorate: "Abu Dhabi Agriculture and Food Safety Authority",
    priority: "Medium",
    stage: "Submit Documents",
    submittedAt: "2024-03-12",
    dueAt: "2024-03-24",
    slaStatus: "On Track",
    daysRemaining: 5,
    assignedTo: "Omar Rahman",
    attachments: 7,
    documents: [
      {
        id: "doc-franchise-agreement",
        name: "Franchise Agreement",
        type: "contract",
        status: "approved",
        uploadedAt: "2024-03-10",
        size: "4.2 MB"
      },
      {
        id: "doc-supplier-contracts",
        name: "Supplier Contracts",
        type: "contract",
        status: "under_review",
        uploadedAt: "2024-03-11",
        size: "6.8 MB"
      },
      {
        id: "doc-packaging-approval",
        name: "Packaging Material Approval",
        type: "permit",
        status: "pending",
        issuer: "ADAFSA",
        uploadedAt: "2024-03-12",
        size: "2.1 MB"
      },
      {
        id: "doc-cold-chain-sop",
        name: "Cold Chain SOP",
        type: "report",
        status: "required",
        size: "Expected"
      }
    ],
    summary:
      "Quick-service franchise expansion focused on supplier traceability, packaging approvals, and delivery routing compliance.",
    notes:
      "Verify cold chain SOP signatures and update drive-thru traffic management map.",
    completion: 68,
  },
  {
    id: "REV-20294",
    applicantName: "Global Tech Branch Setup",
    serviceName: "Dual License Compliance Review",
    directorate: "Department of Economic Development",
    priority: "High",
    stage: "Business Registration",
    submittedAt: "2024-03-09",
    dueAt: "2024-03-19",
    slaStatus: "Breached",
    daysRemaining: -1,
    assignedTo: "Mariam Al Nuaimi",
    attachments: 4,
    documents: [
      {
        id: "doc-governance-docs",
        name: "Updated Governance Documents",
        type: "form",
        status: "approved",
        uploadedAt: "2024-03-08",
        size: "3.5 MB"
      },
      {
        id: "doc-shareholder-attestation",
        name: "Foreign Shareholder Attestations",
        type: "certificate",
        status: "under_review",
        uploadedAt: "2024-03-09",
        size: "2.4 MB"
      },
      {
        id: "doc-shareholder-resolution",
        name: "Notarized Shareholder Resolution",
        type: "form",
        status: "required",
        size: "Expected"
      }
    ],
    summary:
      "Branch launch requiring cross-jurisdiction approvals, updated governance documents, and foreign shareholder attestations.",
    notes:
      "Waiting for notarized shareholder resolution before restoring SLA status.",
    completion: 42,
  },
  {
    id: "REV-20288",
    applicantName: "Luxe Abaya Retail Flagship",
    serviceName: "Retail Fit-Out Approval",
    directorate: "Department of Culture and Tourism",
    priority: "Medium",
    stage: "Pre-Operational Inspection",
    submittedAt: "2024-03-08",
    dueAt: "2024-03-28",
    slaStatus: "On Track",
    daysRemaining: 10,
    assignedTo: "Fatima Al Mazrouei",
    attachments: 6,
    documents: [
      {
        id: "doc-merchandising-layout",
        name: "Merchandising Layout Plans",
        type: "plan",
        status: "approved",
        uploadedAt: "2024-03-07",
        size: "8.2 MB"
      },
      {
        id: "doc-signage-compliance",
        name: "Signage Compliance Report",
        type: "report",
        status: "under_review",
        uploadedAt: "2024-03-08",
        size: "3.1 MB"
      },
      {
        id: "doc-visitor-flow",
        name: "Visitor Flow Analysis",
        type: "report",
        status: "approved",
        uploadedAt: "2024-03-06",
        size: "4.7 MB"
      },
      {
        id: "doc-storefront-renders",
        name: "Updated Storefront Renders",
        type: "plan",
        status: "required",
        size: "Expected"
      }
    ],
    summary:
      "Luxury retail experience reviewing merchandising layouts, signage compliance, and visitor flow plans for the flagship store.",
    notes:
      "Awaiting updated storefront renders with bilingual signage placements.",
    completion: 47,
  },
  {
    id: "REV-20277",
    applicantName: "Harbor Street Food Pods",
    serviceName: "Outdoor Food Cluster Permit",
    directorate: "Abu Dhabi Municipality",
    priority: "Low",
    stage: "Questionnaire",
    submittedAt: "2024-03-10",
    dueAt: "2024-03-20",
    slaStatus: "At Risk",
    daysRemaining: 2,
    assignedTo: "Yousef Al Ameri",
    attachments: 9,
    documents: [
      {
        id: "doc-zoning-validation",
        name: "Zoning Validation Report",
        type: "report",
        status: "approved",
        issuer: "Abu Dhabi Municipality",
        uploadedAt: "2024-03-09",
        size: "5.3 MB"
      },
      {
        id: "doc-waste-management",
        name: "Waste Management Plan",
        type: "plan",
        status: "under_review",
        uploadedAt: "2024-03-10",
        size: "3.8 MB"
      },
      {
        id: "doc-safety-planning",
        name: "Safety Planning Document",
        type: "report",
        status: "approved",
        uploadedAt: "2024-03-08",
        size: "4.1 MB"
      },
      {
        id: "doc-waste-disposal",
        name: "Final Waste Disposal Schedule",
        type: "plan",
        status: "required",
        size: "Expected"
      },
      {
        id: "doc-crowd-management",
        name: "Updated Crowd Management Layout",
        type: "plan",
        status: "required",
        size: "Expected"
      }
    ],
    summary:
      "Seasonal fast-food cluster across the marina boardwalk needing zoning validation, waste management, and safety planning.",
    notes:
      "Need final waste disposal schedule and updated crowd management layout.",
    completion: 61,
  },
];

const priorityWeight: Record<ReviewQueueItem["priority"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

type PolicyAgentId = (typeof policyAgentOptions)[number]["id"];
type PolicyId = (typeof policyGlossary)[number]["id"];

const buildDefaultPolicyAssignments = (): Record<PolicyId, PolicyAgentId> =>
  policyGlossary.reduce(
    (acc, item) => {
      acc[item.id] = item.defaultAgent;
      return acc;
    },
    {} as Record<PolicyId, PolicyAgentId>,
  );

export default function ReviewerPortal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] =
    useState<(typeof stageOptions)[number]["value"]>("all");
  const [daysThreshold, setDaysThreshold] = useState<number[]>([7]);
  const [sortBy, setSortBy] = useState<"due" | "priority">("due");
  const [policyAssignments, setPolicyAssignments] = useState<
    Record<PolicyId, PolicyAgentId>
  >(() => buildDefaultPolicyAssignments());
  const [focusedReview, setFocusedReview] = useState<ReviewQueueItem | null>(
    null,
  );

  const location = useLocation();
  const portalUser = (
    location.state as
      | {
          user?: {
            name?: string;
            role?: string;
            email?: string;
            avatarUrl?: string;
          };
        }
      | undefined
  )?.user;
  const firstName = portalUser?.name ? portalUser.name.split(" ")[0] : null;
  const pageTitle = firstName
    ? `${firstName}'s review desk`
    : "Reviewer command center";
  const pageDescription = firstName
    ? `Monitor the unified queue, ${firstName}, keep SLAs healthy, and collaborate with your team to move applications forward.`
    : "Monitor the unified queue, keep SLAs healthy, and collaborate with your team to move applications forward.";
  const profileName = portalUser?.name ?? "Sarah Al Zaabi";
  const profileEmail = portalUser?.email ?? "sarah.alzaabi@adm.ae";
  const profileAvatar =
    portalUser?.avatarUrl ??
    "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80";
  const profileStatus: "online" | "offline" | "none" = "online";

  const handleSignOut = () => {
    window.location.assign("/");
  };

  const handlePolicyAgentChange = (
    policyId: PolicyId,
    agentId: PolicyAgentId,
  ) => {
    setPolicyAssignments((prev) => ({ ...prev, [policyId]: agentId }));
  };

  const handleFocusOpen = (review: ReviewQueueItem) => {
    setFocusedReview(review);
  };

  const handleFocusClose = () => {
    setFocusedReview(null);
  };

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

        const matchesStage =
          selectedStage === "all" ? true : item.stage === selectedStage;

        const matchesDays = item.daysRemaining <= daysUpperBound;

        return matchesSearch && matchesStage && matchesDays;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        }

        return a.daysRemaining - b.daysRemaining;
      });
  }, [searchTerm, selectedStage, daysUpperBound, sortBy]);

  const atRiskCount = reviewQueue.filter(
    (item) => item.slaStatus === "At Risk" || item.slaStatus === "Breached",
  ).length;
  const breachedCount = reviewQueue.filter(
    (item) => item.slaStatus === "Breached",
  ).length;
  const recoverableCount = reviewQueue.filter(
    (item) => item.slaStatus === "At Risk" && item.daysRemaining > 0,
  ).length;
  const highPriorityCount = reviewQueue.filter(
    (item) => item.priority === "High",
  ).length;
  const averageDaysRemaining = Math.round(
    reviewQueue.reduce((acc, item) => acc + item.daysRemaining, 0) /
      reviewQueue.length,
  );
  const latestIntake = reviewQueue
    .map((item) => new Date(item.submittedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const newIntakes48h = reviewQueue.filter((item) => {
    const submitted = new Date(item.submittedAt);
    const diffInDays =
      (Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 2;
  }).length;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStage("all");
    setDaysThreshold([7]);
    setSortBy("due");
    setPolicyAssignments(buildDefaultPolicyAssignments());
    setFocusedReview(null);
  };

  const filters = (
    <>
      <FilterSection
        title="Search and filter"
        description="Search by applicant, service name, or queue reference."
      >
        <div className="relative">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by applicant or ID"
            className="h-11 rounded-2xl border-[#d8e4df] bg-white pr-11 text-sm text-slate-900 placeholder:text-slate-400"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m16 16 4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </FilterSection>

      <FilterSection
        title="Display policy glossary"
        description="Reference key policies and choose which agent should surface insights per document."
      >
        <div className="space-y-3 lg:max-h-72 lg:overflow-y-auto lg:pr-1">
          {policyGlossary.map((policy) => {
            const assignedAgent = policyAssignments[policy.id];
            const selectedAgentLabel = policyAgentOptions.find(
              (agent) => agent.id === assignedAgent,
            )?.label;

            return (
              <div
                key={policy.id}
                className="rounded-2xl border border-[#d8e4df] bg-white p-3 shadow-[0_12px_24px_-20px_rgba(11,64,55,0.16)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf7f3] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f766e]">
                      <span>{policy.category}</span>
                      <span
                        className="h-1 w-1 rounded-full bg-[#0f766e]/40"
                        aria-hidden="true"
                      />
                      <span>{selectedAgentLabel ?? "Agent not set"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {policy.document}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {policy.summary}
                      </p>
                    </div>
                  </div>

                  <Select
                    value={assignedAgent}
                    onValueChange={(value) =>
                      handlePolicyAgentChange(policy.id, value as PolicyAgentId)
                    }
                  >
                    <SelectTrigger className="h-10 min-w-[10rem] rounded-2xl border-[#d8e4df] bg-white text-sm text-slate-900">
                      <SelectValue
                        aria-label={selectedAgentLabel ?? "Select policy agent"}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-[#d8e4df] bg-white text-slate-900">
                      <SelectGroup>
                        {policyAgentOptions.map((agent) => (
                          <SelectItem
                            key={agent.id}
                            value={agent.id}
                            className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                          >
                            {agent.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Workflow stage">
        <Select
          value={selectedStage}
          onValueChange={(value) =>
            setSelectedStage(value as (typeof stageOptions)[number]["value"])
          }
        >
          <SelectTrigger className="h-11 rounded-2xl border-[#d8e4df] bg-white text-sm text-slate-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-[#d8e4df] bg-white text-slate-900">
            <SelectGroup>
              {stageOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection
        title="Due within"
        description="Focus on items with the tightest SLA window."
      >
        <div className="space-y-3">
          <Slider
            value={daysThreshold}
            onValueChange={(value) => setDaysThreshold(value)}
            min={-2}
            max={14}
            step={1}
            className="py-3"
          />
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Days remaining</span>
            <span>{daysUpperBound} days</span>
          </div>
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold text-[#0f766e] transition hover:bg-[#eaf7f3]"
      >
        Reset filters
      </button>
    </>
  );

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-full border border-[#d8e4df] bg-white px-4 py-3 text-sm font-semibold text-[#0f766e] transition hover:bg-[#eaf7f3]"
      >
        Export queue
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#0f766e] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(11,64,55,0.45)] transition hover:bg-[#0c635d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Assign reviewer
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
          helper={
            latestIntake
              ? `Latest intake ${latestIntake.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
              : undefined
          }
          trend={{ value: `${newIntakes48h} in 48 hours`, isPositive: true }}
        />
        <SummaryMetric
          label="At risk or breached"
          value={atRiskCount.toString()}
          helper={`${breachedCount} breached • ${recoverableCount} recoverable`}
          trend={{
            value: `${recoverableCount} within SLA`,
            isPositive: recoverableCount > 0,
          }}
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
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Review queue
            </h2>
            <p className="text-sm text-slate-600">
              Showing {filteredQueue.length} of {reviewQueue.length} cases.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Sort
            </span>
            <Select
              value={sortBy}
              onValueChange={(value: "due" | "priority") => setSortBy(value)}
            >
              <SelectTrigger className="h-10 w-48 rounded-2xl border-[#d8e4df] bg-white text-sm text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-[#d8e4df] bg-white text-slate-900">
                <SelectGroup>
                  <SelectItem
                    value="due"
                    className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                  >
                    Soonest SLA first
                  </SelectItem>
                  <SelectItem
                    value="priority"
                    className="rounded-xl text-sm text-slate-900 data-[state=checked]:bg-[#dff2ec] data-[state=checked]:text-[#0b7d6f]"
                  >
                    Priority (high to low)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d8e4df] bg-white p-10 text-center text-sm text-slate-600 shadow-[0_12px_28px_-20px_rgba(11,64,55,0.18)]">
            No review cases match the current filters. Adjust your filters to
            see more results.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQueue.map((item) => (
              <ReviewQueueCard
                key={item.id}
                item={item}
                onOpen={handleFocusOpen}
              />
            ))}
          </div>
        )}
      </section>

      <ReviewFocusSheet
        open={Boolean(focusedReview)}
        review={focusedReview}
        onClose={handleFocusClose}
      />
    </PortalPageLayout>
  );
}
