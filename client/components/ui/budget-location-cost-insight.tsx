import { Building2, ExternalLink } from "lucide-react";

interface CostBreakdown {
  label: string;
  value: string;
  description: string;
}

interface RetailSpace {
  id: string;
  title: string;
  address: string;
  footage: string;
  availability: string;
  platform: string;
  monthlyRange: string;
  annualRange: string;
  costs: CostBreakdown[];
  highlight: string;
}

interface BudgetLocationCostInsightProps {
  onViewAllLocations?: () => void;
}

const retailSpaces: RetailSpace[] = [
  {
    id: "corniche-podium",
    title: "Corniche Tower Retail Podium",
    address: "Corniche Rd W, Abu Dhabi",
    footage: "3,050 sq ft",
    availability: "Shell & core · Bayut verified",
    platform: "Bayut",
    monthlyRange: "AED 52k – 58k",
    annualRange: "AED 624k – 696k",
    costs: [
      { label: "Base rent", value: "AED 480k", description: "Pro-forma lease for a 3-year term" },
      { label: "Service charge", value: "AED 84k", description: "Bayut owners association estimate" },
      { label: "Utilities", value: "AED 38k", description: "Cooling + DEWA baseline for similar footprints" },
      { label: "Fit-out reserve", value: "AED 220k", description: "FOH dining + kitchen back-of-house" },
    ],
    highlight: "Sea-view frontage with pre-installed grease trap and exhaust riser",
  },
  {
    id: "saadiyat-galleria",
    title: "Saadiyat Boardwalk Gallery",
    address: "Saadiyat Cultural District",
    footage: "2,480 sq ft",
    availability: "Fitted · Ready Q4 2025",
    platform: "Bayut",
    monthlyRange: "AED 46k – 51k",
    annualRange: "AED 552k – 612k",
    costs: [
      { label: "Base rent", value: "AED 420k", description: "Indicative landlord proposal" },
      { label: "Service charge", value: "AED 72k", description: "Includes chilled water provision" },
      { label: "Utilities", value: "AED 34k", description: "Museum district blended benchmark" },
      { label: "Fit-out reserve", value: "AED 190k", description: "Gallery-grade interior finishes" },
    ],
    highlight: "Footfall uplift from Louvre Abu Dhabi weekend traffic",
  },
  {
    id: "marina-promenade",
    title: "Marina Promenade Retail Bay",
    address: "Marina Mall District",
    footage: "2,920 sq ft",
    availability: "Warm shell · Delivery in 120 days",
    platform: "Bayut",
    monthlyRange: "AED 44k – 47k",
    annualRange: "AED 528k – 564k",
    costs: [
      { label: "Base rent", value: "AED 396k", description: "Two-year break clause negotiated" },
      { label: "Service charge", value: "AED 66k", description: "Covers common area maintenance" },
      { label: "Utilities", value: "AED 32k", description: "Cooling, water, and power blended" },
      { label: "Fit-out reserve", value: "AED 170k", description: "Waterfront glazing and terrace uplift" },
    ],
    highlight: "Dual access for boardwalk and mall circulation",
  },
];

export const BudgetLocationCostInsight: React.FC<BudgetLocationCostInsightProps> = ({
  onViewAllLocations,
}) => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
          Step 3 · Budget & location cost analysis
        </p>
        <h3 className="text-xl font-semibold text-slate-900">
          Model operating costs before committing to the Corniche lease
        </h3>
        <p className="text-sm text-slate-600">
          Omnis pulls Bayut-aligned listings so Layla can validate operating cost ranges, service charges, and fit-out
          reserves for each shortlisted location along the Corniche and neighbouring districts.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {retailSpaces.map((space) => (
          <article
            key={space.id}
            className="flex h-full flex-col rounded-3xl border border-[#dce9e4] bg-white/95 p-6 text-slate-700 shadow-[0_28px_70px_-52px_rgba(14,118,110,0.32)]"
          >
            <header className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
                    {space.platform}
                  </span>
                  <h4 className="text-lg font-semibold text-slate-900">{space.title}</h4>
                  <p className="text-xs text-slate-500">{space.address}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f6f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {space.footage}
                </span>
              </div>
              <p className="text-xs text-slate-500">{space.availability}</p>
            </header>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-slate-900">Monthly</span>
                <span>{space.monthlyRange}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-slate-900">Annualised</span>
                <span>{space.annualRange}</span>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              {space.costs.map((cost) => (
                <div
                  key={`${space.id}-${cost.label}`}
                  className="rounded-2xl border border-[#e2ece8] bg-[#f8fbfa] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm font-semibold text-slate-900">{cost.label}</dt>
                    <dd className="text-sm font-semibold text-[#0F766E]">{cost.value}</dd>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{cost.description}</p>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-2xl border border-[#e2ece8] bg-[#eef7f3] px-4 py-3 text-sm text-slate-700">
              {space.highlight}
            </p>
          </article>
        ))}
      </div>

      {onViewAllLocations ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onViewAllLocations}
            className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm transition hover:border-[#0F766E]/50 hover:bg-[#f2fbf8]"
          >
            View full retail shortlist
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default BudgetLocationCostInsight;
