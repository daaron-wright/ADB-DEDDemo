import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import {
  competitorMapPoints,
  competitorMetricsMeta,
  CompetitorFilter,
  CompetitorMetricId,
  CompetitorPoint,
} from "@/components/ui/competitor-map-data";

interface CompetitorHeatMapProps {
  onBack: () => void;
}

const filterOptions: Array<{
  id: CompetitorFilter;
  label: string;
  description: string;
}> = [
  {
    id: "relevant",
    label: "Relevant to my business concept (Emirati Fusion)",
    description: "Pins that mirror Lyla's experiential Emirati fusion positioning.",
  },
  {
    id: "highDemand",
    label: "High demand / Trendy",
    description: "Venues trending across social chatter and high booking momentum.",
  },
];

const metricOrder: CompetitorMetricId[] = ["googleRating", "socialBuzz", "sentiment"];

const mapBackgroundImage =
  "https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=1280";

const formatPosition = (value: number) => `${Math.min(Math.max(value, 4), 96)}%`;

const ActiveCompetitorPopup = ({ point }: { point: CompetitorPoint }) => (
  <div className="pointer-events-none relative">
    <div className="pointer-events-auto w-[min(320px,85vw)] rounded-3xl border border-white/35 bg-[#072027]/95 p-4 shadow-[0_28px_60px_-34px_rgba(8,22,30,0.65)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
            Corniche competitor
          </p>
          <h4 className="text-lg font-semibold text-white">{point.name}</h4>
          <p className="text-xs text-white/60">{point.location}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow">
          {point.cuisine}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/80">{point.summary}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {metricOrder.map((metricId) => {
          const metric = point.metrics[metricId];
          const meta = competitorMetricsMeta[metricId];
          if (!metric || !meta) {
            return null;
          }

          const formattedValue = meta.formatter
            ? meta.formatter(metric.value)
            : `${metric.value}`;

          return (
            <div
              key={metricId}
              className="rounded-2xl border border-white/15 bg-white/10 p-3"
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: meta.accent }}
              >
                {meta.label}
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{formattedValue}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                {metric.unit}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-1 text-xs text-white/60">
        <p>Signals derived from Investor Compass social scraping and review analytics.</p>
        <p>Use filters to surface white space where Corniche demand is underserved.</p>
      </div>
    </div>
    <span
      className="absolute left-1/2 top-full block h-4 w-4 -translate-x-1/2 rotate-45"
      style={{
        background: "rgba(7, 32, 39, 0.95)",
        borderColor: "rgba(255,255,255,0.2)",
        borderStyle: "solid",
        borderWidth: "1px",
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
      }}
      aria-hidden="true"
    />
  </div>
);

const CompetitorHeatMap: React.FC<CompetitorHeatMapProps> = ({ onBack }) => {
  const [activeFilters, setActiveFilters] = useState<Record<CompetitorFilter, boolean>>({
    relevant: false,
    highDemand: false,
  });
  const [activePointId, setActivePointId] = useState<string>(competitorMapPoints[0]?.id ?? "");

  const filteredPoints = useMemo(() => {
    const selectedFilters = (Object.entries(activeFilters) as Array<[CompetitorFilter, boolean]>)
      .filter(([, isActive]) => isActive)
      .map(([filterId]) => filterId);

    if (selectedFilters.length === 0) {
      return competitorMapPoints;
    }

    return competitorMapPoints.filter((point) =>
      selectedFilters.every((filterId) => point.attributes.includes(filterId)),
    );
  }, [activeFilters]);

  useEffect(() => {
    if (filteredPoints.length === 0) {
      setActivePointId("");
      return;
    }

    const stillVisible = filteredPoints.some((point) => point.id === activePointId);
    if (!stillVisible) {
      setActivePointId(filteredPoints[0].id);
    }
  }, [filteredPoints, activePointId]);

  const activePoint = useMemo(() => {
    if (filteredPoints.length === 0) {
      return null;
    }
    return filteredPoints.find((point) => point.id === activePointId) ?? filteredPoints[0];
  }, [filteredPoints, activePointId]);

  const toggleFilter = (filterId: CompetitorFilter) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: !prev[filterId],
    }));
  };

  const handleResetFilters = () => {
    setActiveFilters({ relevant: false, highDemand: false });
  };

  const hasFiltersApplied = useMemo(
    () => Object.values(activeFilters).some((value) => value),
    [activeFilters],
  );

  return (
    <motion.div className="relative flex h-full flex-col bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-160px] h-[360px] w-[360px] rounded-full bg-[#0E766E]/16 blur-3xl" />
        <div className="absolute right-[-160px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/12 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-[#d8e4df] bg-white/90 px-6 py-4 backdrop-blur">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Investor Compass</p>
          <h2 className="text-lg font-semibold text-slate-900">Competitive Landscape</h2>
          <p className="text-xs text-slate-600">
            Pinpoint existing venues across Abu Dhabi&apos;s waterfront districts and surface gaps before budgeting.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E] shadow-sm transition hover:bg-[#eff6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6L9 12L15 18" />
            <path d="M19 12H5" />
          </svg>
          Back to summary
        </button>
      </header>

      <div className="relative z-10 flex flex-1 flex-col gap-6 overflow-hidden px-6 pb-8 pt-6 lg:flex-row">
        <div
          className={chatCardClass(
            "relative flex-1 overflow-hidden rounded-3xl border border-[#d8e4df] bg-white/95 shadow-[0_32px_80px_-54px_rgba(14,118,110,0.35)]",
          )}
          style={{ minHeight: "520px" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${mapBackgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(0.88)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0b2b34]/75 via-[#0b2b34]/50 to-transparent" />

          <div className="relative z-10 flex h-full flex-col text-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  Map view
                </h3>
                <p className="text-xs text-white/65">
                  Pins highlight F&amp;B competitors aligned to Lyla&apos;s concept filters.
                </p>
              </div>
              <div className="text-right text-xs text-white/70">
                {filteredPoints.length} of {competitorMapPoints.length} venues shown
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(84,255,212,0.12),transparent_65%)]" />

              {filteredPoints.map((point) => {
                const isActive = point.id === activePoint?.id;
                const baseSize = Math.max(22, point.baseSize ?? 26);
                const haloColor = point.attributes.includes("highDemand") ? "#54FFD4" : "#4EC7C0";
                const rimColor = point.attributes.includes("relevant") ? "#0D5E56" : "#134E60";
                const coreAccent = point.attributes.includes("relevant") ? "#11A598" : "#1C8BA6";

                return (
                  <motion.button
                    key={point.id}
                    type="button"
                    onMouseEnter={() => setActivePointId(point.id)}
                    onClick={() => setActivePointId(point.id)}
                    onFocus={() => setActivePointId(point.id)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    style={{
                      left: formatPosition(point.x),
                      top: formatPosition(point.y),
                    }}
                    aria-label={`${point.name}, ${point.cuisine}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span
                      className="relative flex items-center justify-center"
                      style={{ width: baseSize, height: baseSize }}
                    >
                      <span
                        className="absolute -inset-3 rounded-full opacity-55 blur-[22px] transition group-hover:opacity-85"
                        style={{
                          background: `radial-gradient(circle at center, ${haloColor}66 0%, transparent 70%)`,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="absolute inset-0 rounded-full shadow-[0_0_0_1.25px_rgba(15,118,110,0.45)]"
                        style={{
                          background: `radial-gradient(circle at 50% 35%, ${haloColor} 0%, ${rimColor} 75%)`,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "absolute inset-[22%] rounded-full border border-white/35",
                          isActive ? "bg-white/10" : "bg-white/5",
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className="absolute inset-[34%] rounded-full"
                        style={{
                          background: `radial-gradient(circle at 45% 35%, #ffffff 0%, ${coreAccent} 65%)`,
                          boxShadow: "0 0 0 1px rgba(255,255,255,0.45)",
                        }}
                        aria-hidden="true"
                      />
                      <span className="relative h-[6px] w-[6px] rounded-full bg-white" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        "mt-3 block rounded-full bg-black/65 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      {point.name}
                    </span>
                  </motion.button>
                );
              })}

              {!filteredPoints.length && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl border border-white/25 bg-black/45 px-5 py-4 text-center text-sm text-white/80 backdrop-blur">
                    No competitors match the selected filters. Reset filters to view the full landscape.
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <aside className="flex w-full flex-col gap-5 rounded-3xl border border-[#d8e4df] bg-white/95 p-6 text-slate-700 shadow-[0_28px_70px_-48px_rgba(14,118,110,0.24)] lg:w-[360px]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
              Filter competitors
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Surface white space</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Select the attributes that matter most to Lyla&apos;s concept to narrow in on comparable venues.
            </p>
          </div>

          <div className="space-y-3">
            {filterOptions.map((option) => {
              const isChecked = activeFilters[option.id];
              const matches = competitorMapPoints.filter((point) =>
                point.attributes.includes(option.id),
              ).length;

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition",
                    isChecked
                      ? "border-[#0F766E]/45 bg-[#e7f5f2] shadow-[0_20px_46px_-34px_rgba(14,118,110,0.4)]"
                      : "border-[#e2ece8] bg-[#f8fbfa] hover:border-[#cbdcd6]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFilter(option.id)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border",
                      isChecked
                        ? "border-transparent bg-[#0F766E] text-white"
                        : "border-[#cbdcd6] bg-white text-transparent",
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6.5 4.5 9 10 3.5" />
                    </svg>
                  </span>
                  <span className="flex-1">
                    <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                    <p className="text-xs text-slate-500">{option.description}</p>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
                    {matches}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {hasFiltersApplied
                ? "Filters applied"
                : "No filters applied — showing full landscape"}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasFiltersApplied}
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.2em]",
                hasFiltersApplied
                  ? "text-[#0F766E] hover:text-[#0b5a54]"
                  : "text-slate-400",
              )}
            >
              Reset
            </button>
          </div>

          <div className="rounded-3xl border border-[#e2ece8] bg-[#f8fbfa] p-5 shadow-[0_24px_60px_-48px_rgba(14,118,110,0.28)]">
            {activePoint ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
                      Investor Compass data
                    </p>
                    <h4 className="text-lg font-semibold text-slate-900">{activePoint.name}</h4>
                    <p className="text-xs text-slate-500">{activePoint.location}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F766E] shadow">
                    {activePoint.cuisine}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{activePoint.summary}</p>

                <div className="space-y-3">
                  {metricOrder.map((metricId) => {
                    const metric = activePoint.metrics[metricId];
                    const meta = competitorMetricsMeta[metricId];
                    if (!metric || !meta) {
                      return null;
                    }

                    return (
                      <div
                        key={metricId}
                        className="rounded-2xl border border-[#e2ece8] bg-white px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="max-w-[60%]">
                            <div
                              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                              style={{ color: meta.accent }}
                            >
                              {meta.label}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{metric.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-slate-900">
                              {meta.formatter
                                ? meta.formatter(metric.value)
                                : `${metric.value} ${metric.unit}`}
                            </div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                              {metric.unit}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  {activePoint.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0F766E]" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500">
                  Locations refresh directly from the Investor Compass explorer every 48 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-600">
                <p>Filters removed all visible competitors. Reset to review the full landscape.</p>
                <p className="text-xs text-slate-500">Investor Compass sync resumes once filters are cleared.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e2ece8] bg-[#f8fbfa] p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
                Matches
              </div>
              <span className="text-xs text-slate-500">
                {filteredPoints.length} selected
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {filteredPoints.length ? (
                filteredPoints.map((point) => {
                  const isActive = point.id === activePoint?.id;
                  return (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => setActivePointId(point.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition",
                        isActive
                          ? "border-[#0F766E]/45 bg-white text-[#0F766E] shadow-[0_12px_32px_-24px_rgba(14,118,110,0.45)]"
                          : "border-transparent bg-white/60 text-slate-700 hover:border-[#d0e2dd] hover:bg-white",
                      )}
                    >
                      <span className="flex-1">
                        <span className="block font-semibold">{point.name}</span>
                        <span className="text-xs text-slate-500">{point.location}</span>
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                        View
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-[#d0e2dd] bg-white/70 px-3 py-4 text-center text-xs text-slate-500">
                  No venues meet the selected criteria yet. Widen your filters to continue the journey before budgeting.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default CompetitorHeatMap;
