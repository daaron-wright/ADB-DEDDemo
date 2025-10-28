import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    description:
      "Pins that mirror Shamma's experiential Emirati fusion positioning.",
  },
  {
    id: "highDemand",
    label: "High demand / Trendy",
    description:
      "Venues trending across social chatter and high booking momentum.",
  },
];

const metricOrder: CompetitorMetricId[] = [
  "googleRating",
  "socialBuzz",
  "sentiment",
];

const mapBackgroundImage =
  "https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=2048";

const formatPosition = (value: number) =>
  `${Math.min(Math.max(value, 4), 96)}%`;

const hotspotPalettes = {
  highDemandRelevant: {
    inner: "#FF5A3D",
    mid: "#FF9F6B",
    outer: "rgba(255,159,107,0)",
  },
  highDemand: {
    inner: "#FF8A3D",
    mid: "#FFC371",
    outer: "rgba(255,195,113,0)",
  },
  relevant: {
    inner: "#2DD4BF",
    mid: "#5EEAD4",
    outer: "rgba(94,234,212,0)",
  },
  default: {
    inner: "#2CB4FF",
    mid: "#7DD3FC",
    outer: "rgba(125,211,252,0)",
  },
} as const;

type HotspotPalette = (typeof hotspotPalettes)[keyof typeof hotspotPalettes];

const getHotspotPalette = (point: CompetitorPoint): HotspotPalette => {
  const hasRelevant = point.attributes.includes("relevant");
  const hasHighDemand = point.attributes.includes("highDemand");

  if (hasRelevant && hasHighDemand) {
    return hotspotPalettes.highDemandRelevant;
  }
  if (hasHighDemand) {
    return hotspotPalettes.highDemand;
  }
  if (hasRelevant) {
    return hotspotPalettes.relevant;
  }
  return hotspotPalettes.default;
};

const CompetitorHeatMap: React.FC<CompetitorHeatMapProps> = ({ onBack }) => {
  const [activeFilters, setActiveFilters] = useState<
    Record<CompetitorFilter, boolean>
  >({
    relevant: false,
    highDemand: false,
  });
  const [activePointId, setActivePointId] = useState<string>(
    competitorMapPoints[0]?.id ?? "",
  );

  const filteredPoints = useMemo(() => {
    const selectedFilters = (
      Object.entries(activeFilters) as Array<[CompetitorFilter, boolean]>
    )
      .filter(([, isActive]) => isActive)
      .map(([filterId]) => filterId);

    if (selectedFilters.length === 0) {
      return competitorMapPoints;
    }

    return competitorMapPoints.filter((point) =>
      selectedFilters.every((filterId) => point.attributes.includes(filterId)),
    );
  }, [activeFilters]);

  const showRelevantGap = activeFilters.relevant && filteredPoints.length === 0;

  useEffect(() => {
    if (filteredPoints.length === 0) {
      setActivePointId("");
      return;
    }

    const stillVisible = filteredPoints.some(
      (point) => point.id === activePointId,
    );
    if (!stillVisible) {
      setActivePointId(filteredPoints[0].id);
    }
  }, [filteredPoints, activePointId]);

  const activePoint = useMemo(() => {
    if (filteredPoints.length === 0) {
      return null;
    }
    return (
      filteredPoints.find((point) => point.id === activePointId) ??
      filteredPoints[0]
    );
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
            Investor Compass
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Corniche competitive landscape
          </h2>
          <p className="text-xs text-slate-600">
            Analyze Investor Compass signals to locate white space across
            Corniche waterfront dining.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E] shadow-sm transition hover:bg-[#eff6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
              backgroundSize: "105%",
              backgroundPosition: "center",
              filter: "saturate(0.88)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0b2b34]/75 via-[#0b2b34]/50 to-transparent" />

          <div className="relative z-10 flex h-full flex-col text-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  Corniche map view
                </h3>
                <p className="text-xs text-white/70">
                  Pins surface Investor Compass insight for waterfront
                  competitors meeting Shamma&apos;s filters.
                </p>
              </div>
              <div className="text-right text-xs text-white/70">
                {filteredPoints.length} of {competitorMapPoints.length} venues
                shown
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(84,255,212,0.12),transparent_65%)]" />
              <div className="absolute left-6 top-6 z-20 rounded-full bg-black/45 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white shadow-[0_12px_32px_-20px_rgba(8,22,30,0.7)]">
                Corniche · Investor Compass
              </div>

              {filteredPoints.map((point) => {
                const isActive = point.id === activePoint?.id;
                const baseSize = Math.max(22, point.baseSize ?? 26);
                const markerSize = Math.max(28, baseSize);
                const palette = getHotspotPalette(point);

                return (
                  <motion.button
                    key={point.id}
                    type="button"
                    onMouseEnter={() => setActivePointId(point.id)}
                    onClick={() => setActivePointId(point.id)}
                    onFocus={() => setActivePointId(point.id)}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-transform duration-300"
                    style={{
                      left: formatPosition(point.x),
                      top: formatPosition(point.y),
                      width: markerSize,
                      height: markerSize,
                    }}
                    aria-label={`${point.name}, ${point.cuisine}`}
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg viewBox="0 0 40 40" className="h-full w-full">
                      <circle
                        cx="20"
                        cy="20"
                        r="17"
                        fill="none"
                        stroke={palette.mid}
                        strokeWidth={isActive ? 3 : 2}
                        strokeOpacity={isActive ? 0.9 : 0.65}
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="10"
                        fill={palette.inner}
                        fillOpacity={isActive ? 0.95 : 0.75}
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="4"
                        fill="#fff"
                        fillOpacity={isActive ? 0.9 : 0.65}
                      />
                    </svg>
                    <span className="sr-only">{point.name}</span>
                  </motion.button>
                );
              })}

              {!filteredPoints.length && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl border border-white/25 bg-black/45 px-5 py-4 text-center text-sm text-white/80 backdrop-blur">
                    {showRelevantGap
                      ? "No Emirati fusion venues appear on the Corniche map yet. Shamma's concept fills this white space."
                      : "No competitors match the selected filters. Reset filters to view the full landscape."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="flex w-full flex-col overflow-visible rounded-3xl border border-[#d8e4df] bg-white/95 text-slate-700 shadow-[0_28px_70px_-48px_rgba(14,118,110,0.24)] lg:w-[360px]">
          <ScrollArea className="h-auto max-h-none">
            <div className="space-y-5 p-6 pr-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
                  Filter competitors
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Surface white space
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Select the attributes that matter most to Shamma&apos;s concept
                  to narrow in on comparable venues.
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
                        <span className="text-sm font-semibold text-slate-900">
                          {option.label}
                        </span>
                        <p className="text-xs text-slate-500">
                          {option.description}
                        </p>
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
                          Investor Compass signals
                        </p>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {activePoint.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {activePoint.location}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F766E] shadow">
                        {activePoint.cuisine}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {activePoint.summary}
                    </p>

                    <Accordion
                      type="multiple"
                      defaultValue={[]}
                      className="space-y-3"
                    >
                      {metricOrder.map((metricId) => {
                        const metric = activePoint.metrics[metricId];
                        const meta = competitorMetricsMeta[metricId];
                        if (!metric || !meta) {
                          return null;
                        }

                        const formattedValue = meta.formatter
                          ? meta.formatter(metric.value)
                          : metric.value.toString();

                        return (
                          <AccordionItem
                            key={metricId}
                            value={metricId}
                            className="overflow-hidden rounded-2xl border border-[#e2ece8] bg-white text-slate-700"
                          >
                            <AccordionTrigger className="flex items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E] hover:text-[#0b5a54]">
                              <span>{meta.label}</span>
                              <span className="text-base font-semibold tracking-normal text-slate-900">
                                {formattedValue}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="border-t border-[#e2ece8] bg-white px-4 py-3 text-sm text-slate-600">
                              <p className="font-medium text-slate-800">
                                {metric.description}
                              </p>
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                                {meta.legend}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {meta.subtitle}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>

                    <div className="space-y-2 text-sm text-slate-600">
                      {activePoint.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-start gap-2">
                          <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0F766E]" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500">
                      Locations refresh directly from the Investor Compass
                      explorer every 48 hours.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      Filters removed all visible competitors. Reset to review
                      the full landscape.
                    </p>
                    <p className="text-xs text-slate-500">
                      Investor Compass sync resumes once filters are cleared.
                    </p>
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
                            <span className="block font-semibold">
                              {point.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {point.location}
                            </span>
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                            View
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#d0e2dd] bg-white/70 px-3 py-4 text-center text-xs text-slate-500">
                      No venues meet the selected criteria yet. Widen your
                      filters to continue the journey before budgeting.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </motion.div>
  );
};

export default CompetitorHeatMap;
