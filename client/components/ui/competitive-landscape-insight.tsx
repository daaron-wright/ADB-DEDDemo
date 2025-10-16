import { useMemo, useState } from "react";
import { CheckSquare, MapPin, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitorPoint {
  id: string;
  name: string;
  concept: string;
  location: string;
  coordinates: { left: number; top: number };
  isRelevant: boolean;
  rating: number;
  socialMentions: number;
  summary: string;
  highlights: string[];
}

interface CompetitiveLandscapeInsightProps {}

type FilterId = "relevant" | "premium";

const mapBackground =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F102dee5e7077472a97a6fd7c7dd5f5fd?format=webp&width=1280";

const competitors: CompetitorPoint[] = [
  {
    id: "azure-corniche",
    name: "Azure Corniche Lounge",
    concept: "Coastal fine dining",
    location: "Corniche Rd W",
    coordinates: { left: 46, top: 42 },
    isRelevant: true,
    rating: 4.6,
    socialMentions: 1240,
    summary:
      "Sunset-forward dining with experiential mixology. Strong weekend peaks but weekday capacity still available.",
    highlights: ["18% YoY growth in premium bookings", "High influencer share of voice"],
  },
  {
    id: "khalidiya-haven",
    name: "Khalidiya Haven",
    concept: "Modern Levantine",
    location: "Al Khalidiya",
    coordinates: { left: 28, top: 58 },
    isRelevant: true,
    rating: 4.3,
    socialMentions: 860,
    summary:
      "Family-oriented venue drawing consistent local traffic. Limited late-evening activation leaves white space.",
    highlights: ["Strong lunch conversion", "Room to differentiate on experiential evenings"],
  },
  {
    id: "marina-social",
    name: "Marina Social House",
    concept: "Contemporary fusion",
    location: "Marina Mall district",
    coordinates: { left: 20, top: 46 },
    isRelevant: false,
    rating: 4.1,
    socialMentions: 540,
    summary:
      "Tourist-heavy casual spot. Concept diverges from Layla's fine dining positioning but informs volume baselines.",
    highlights: ["High tourist mix", "Strong proximity to family attractions"],
  },
  {
    id: "saadiyat-collective",
    name: "Saadiyat Collective",
    concept: "Cultural tasting menu",
    location: "Saadiyat Cultural District",
    coordinates: { left: 58, top: 28 },
    isRelevant: true,
    rating: 4.8,
    socialMentions: 1520,
    summary:
      "Art-led tasting menu with museum partnerships. Waitlist demand signals appetite for experiential dining.",
    highlights: ["Top quartile review quality", "Museum partnerships drive traffic"],
  },
];

const filterDefinitions: Array<{ id: FilterId; label: string; description: string }> = [
  {
    id: "relevant",
    label: "Relevant to my concept",
    description: "Keep concepts aligned to Layla's waterfront fine dining positioning.",
  },
  {
    id: "premium",
    label: "Rated 4.5★ and above",
    description: "Highlight operators capturing top-tier sentiment in Corniche and Saadiyat.",
  },
];

const percentage = (value: number) => `${Math.min(Math.max(value, 6), 94)}%`;

export const CompetitiveLandscapeInsight: React.FC<CompetitiveLandscapeInsightProps> = () => {
  const [activeFilters, setActiveFilters] = useState<Record<FilterId, boolean>>({
    relevant: true,
    premium: false,
  });
  const [activeCompetitorId, setActiveCompetitorId] = useState<string>("azure-corniche");

  const visibleCompetitors = useMemo(() => {
    return competitors.filter((competitor) => {
      const matchesRelevant = !activeFilters.relevant || competitor.isRelevant;
      const matchesPremium = !activeFilters.premium || competitor.rating >= 4.5;
      return matchesRelevant && matchesPremium;
    });
  }, [activeFilters]);

  const hasFiltersApplied = Object.values(activeFilters).some(Boolean);
  const activeCompetitor = useMemo(() => {
    if (!visibleCompetitors.length) {
      return undefined;
    }
    const stillVisible = visibleCompetitors.some((item) => item.id === activeCompetitorId);
    if (!stillVisible) {
      setActiveCompetitorId(visibleCompetitors[0].id);
    }
    return visibleCompetitors.find((item) => item.id === activeCompetitorId) ?? visibleCompetitors[0];
  }, [activeCompetitorId, visibleCompetitors]);

  const resetFilters = () => setActiveFilters({ relevant: false, premium: false });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
          Step 2 · Competitive landscape analysis
        </p>
        <h3 className="text-xl font-semibold text-slate-900">Filter the Corniche competition before budgeting</h3>
        <p className="text-sm text-slate-600">
          Layla selects the Corniche cluster and applies checkboxes to surface concepts that mirror her positioning.
          Polaris instantly removes outliers and spotlights the remaining white space on the investor compass.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),minmax(280px,340px)]">
        <div className="relative overflow-hidden rounded-3xl border border-[#dce9e4] bg-[#0b2b34] shadow-[0_30px_80px_-48px_rgba(10,20,40,0.55)]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${mapBackground}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(0.85)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#061721]/85 via-[#061721]/55 to-transparent" />

          <div className="relative z-10 space-y-4 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  Investor compass
                </span>
                <h4 className="text-base font-semibold">Corniche &amp; Saadiyat competitors</h4>
              </div>
              <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
                {visibleCompetitors.length} of {competitors.length} venues shown
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/25">
              {visibleCompetitors.map((competitor) => {
                const isActive = competitor.id === activeCompetitor?.id;
                return (
                  <button
                    key={competitor.id}
                    type="button"
                    onClick={() => setActiveCompetitorId(competitor.id)}
                    className={cn(
                      "group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-white/90 p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      isActive && "border-[#54ffd4] bg-[#54ffd4]/95 text-slate-900",
                    )}
                    style={{ left: percentage(competitor.coordinates.left), top: percentage(competitor.coordinates.top) }}
                    aria-label={`${competitor.name}, ${competitor.concept}`}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                        isActive
                          ? "bg-[#0F766E] text-white"
                          : "bg-white text-[#0F766E] group-hover:bg-[#54ffd4] group-hover:text-[#0b2b34]",
                      )}
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}

              {!visibleCompetitors.length ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-3xl border border-white/25 bg-black/65 px-5 py-4 text-sm font-semibold text-white/80">
                    Filters removed all competitors. Corniche reveals a clear white space for Layla&apos;s concept.
                  </div>
                </div>
              ) : null}

              {visibleCompetitors.length > 0 && visibleCompetitors.length <= 2 ? (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-6 rounded-3xl border border-dashed border-emerald-300/60" />
                  <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-emerald-400/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-900 shadow">
                    White space
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="flex h-full flex-col gap-5 rounded-3xl border border-[#dce9e4] bg-white/95 p-6 text-slate-700 shadow-[0_30px_80px_-52px_rgba(14,118,110,0.3)]">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
              Checkbox filters
            </h4>
            <p className="text-xs text-slate-500">
              Layla toggles filters to remove irrelevant operators. No toggles here—only deliberate checkbox
              selections to focus the investor lens.
            </p>
          </div>

          <div className="space-y-3">
            {filterDefinitions.map((filter) => {
              const isChecked = activeFilters[filter.id];
              const matchCount = competitors.filter((competitor) => {
                if (filter.id === "relevant") return competitor.isRelevant;
                if (filter.id === "premium") return competitor.rating >= 4.5;
                return true;
              }).length;

              return (
                <label
                  key={filter.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition",
                    isChecked
                      ? "border-[#0F766E]/45 bg-[#e8f6f2] shadow-[0_24px_60px_-45px_rgba(14,118,110,0.42)]"
                      : "border-[#e1ece6] bg-[#f8fbfa] hover:border-[#cfe1da]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      setActiveFilters((previous) => ({ ...previous, [filter.id]: !previous[filter.id] }))
                    }
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border",
                      isChecked ? "border-transparent bg-[#0F766E] text-white" : "border-[#cfded8] bg-white text-transparent",
                    )}
                    aria-hidden="true"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">
                    <span className="text-sm font-semibold text-slate-900">{filter.label}</span>
                    <p className="text-xs text-slate-500">{filter.description}</p>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
                    {matchCount}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-[0.2em] text-slate-400">
              {hasFiltersApplied ? "Filtered view" : "Full competitive set"}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E] hover:text-[#0b5a54]"
            >
              <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="rounded-3xl border border-[#e2ece8] bg-[#f8fbfa] p-5 shadow-[0_24px_60px_-50px_rgba(14,118,110,0.3)]">
            {activeCompetitor ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
                      Competitor snapshot
                    </p>
                    <h4 className="text-lg font-semibold text-slate-900">{activeCompetitor.name}</h4>
                    <p className="text-xs text-slate-500">{activeCompetitor.location}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E] shadow">
                    {activeCompetitor.concept}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{activeCompetitor.summary}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#e2ece8] bg-white px-4 py-3 text-sm text-slate-700">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                      Ratings
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-slate-900">
                        {activeCompetitor.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">/5</span>
                    </div>
                    <div className="text-xs text-slate-500">Average guest reviews</div>
                  </div>

                  <div className="rounded-2xl border border-[#e2ece8] bg-white px-4 py-3 text-sm text-slate-700">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                      Social media mentions
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {activeCompetitor.socialMentions.toLocaleString("en-US")}
                    </div>
                    <div className="text-xs text-slate-500">Trailing 90-day Investor Compass pulse</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  {activeCompetitor.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0F766E]" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                No competitors match the current filters. Layla can claim this white space with a Corniche launch.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompetitiveLandscapeInsight;
