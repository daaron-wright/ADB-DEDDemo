import { useMemo, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import LocationHeatMap from "@/components/ui/location-heat-map";
import { densityLayers, trendMetrics } from "@/components/ui/location-density-data";
import { cn } from "@/lib/utils";

interface MarketOpportunityInsightProps {
  onOpenHeatMap?: () => void;
}

type MarketBand = {
  id: string;
  label: string;
  range: string;
  narrative: string;
};

type TrendSummary = {
  id: string;
  label: string;
  accent: string;
  rangeLabel: string;
  latestLabel: string;
  deltaLabel: string;
  sliderPercent: number;
};

const MARKET_BANDS: MarketBand[] = [
  {
    id: "residents",
    label: "Residents",
    range: "10,200 – 14,800 households",
    narrative:
      "Corniche towers and Khalidiya villas sustain everyday demand with >90% Tawtheeq renewal rates.",
  },
  {
    id: "tourists",
    label: "Tourists",
    range: "3,900 – 6,100 nightly visitors",
    narrative:
      "Beachfront resorts and Saadiyat cultural stays keep premium spenders in the district year-round.",
  },
  {
    id: "daily-workers",
    label: "Daily workers",
    range: "9,500 – 14,200 office professionals",
    narrative:
      "Al Maryah and Corniche government complexes feed consistent weekday lunch and grab-and-go demand.",
  },
];

const PRIORITY_ZONES = [
  "Corniche Waterfront promenades",
  "Saadiyat Cultural District (spotlight)",
  "Al Maryah Financial Core",
  "Tourist Club & Mina Zayed",
];

const clampPercent = (value: number) => Math.min(95, Math.max(5, value));

const buildTrendSummaries = (): TrendSummary[] => {
  return trendMetrics.map((metric) => {
    const values = metric.data.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const latestPoint = metric.data[metric.data.length - 1];

    const formatValue = (value: number) => {
      const unit = metric.unit.toLowerCase();
      if (unit.includes("aed")) {
        return `${value.toFixed(1)} ${metric.unit}`;
      }
      if (unit.includes("index")) {
        return `${Math.round(value)} ${metric.unit}`;
      }
      return `${Math.round(value)} ${metric.unit}`;
    };

    const formatDelta = (delta: number) => {
      const unit = metric.unit.toLowerCase();
      const decimals = unit.includes("aed") ? 1 : 0;
      const prefix = delta >= 0 ? "+" : "";
      const suffix = unit.includes("aed")
        ? " bn"
        : unit.includes("index") || unit.includes("buzz")
        ? " pts"
        : " %";
      return `${prefix}${delta.toFixed(decimals)}${suffix}`;
    };

    const percent =
      maxValue === minValue ? 50 : ((latestPoint.value - minValue) / (maxValue - minValue)) * 100;

    return {
      id: metric.id,
      label: metric.label,
      accent: metric.accent,
      rangeLabel: `${formatValue(minValue)} – ${formatValue(maxValue)}`,
      latestLabel: formatValue(latestPoint.value),
      deltaLabel: `YoY change ${formatDelta(latestPoint.yoyDelta)}`,
      sliderPercent: clampPercent(percent),
    };
  });
};

export const MarketOpportunityInsight: React.FC<MarketOpportunityInsightProps> = ({
  onOpenHeatMap,
}) => {
  const [hoveredTrendId, setHoveredTrendId] = useState<string | null>(null);

  const trendSummaries = useMemo(() => buildTrendSummaries(), []);

  const primaryLayer = densityLayers.find((layer) => layer.id === "residents");
  const sources = Array.from(
    new Set([
      ...(primaryLayer?.dataSources ?? []),
      ...trendSummaries.flatMap((summary) => {
        const metric = trendMetrics.find((item) => item.id === summary.id);
        return metric?.sources ?? [];
      }),
    ]),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
          Step 1 · Market opportunity & demographics
        </p>
        <h3 className="text-xl font-semibold text-slate-900">
          Interactive demand intelligence for Shamma&apos;s Corniche concept
        </h3>
        <p className="text-sm text-slate-600">
          Polaris visualises the total addressable market and demographic depth before highlighting the most
          investable zones along Abu Dhabi&apos;s waterfront.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)]">
        <div className="space-y-3">
          <LocationHeatMap />
          {onOpenHeatMap ? (
            <button
              type="button"
              onClick={onOpenHeatMap}
              className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/25 bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm transition hover:border-[#0F766E]/45 hover:bg-[#f2fbf8]"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              Open full interactive heat map
            </button>
          ) : null}
        </div>

        <aside className="flex h-full flex-col gap-5 rounded-3xl border border-[#dce9e4] bg-white/95 p-6 text-slate-700 shadow-[0_24px_60px_-40px_rgba(14,118,110,0.35)]">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
              Addressable market
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Ranges reconcile Tawtheeq contracts, DCT visitation, and employment filings. Values are presented as
              bands so Shamma can stress-test upside and downside scenarios.
            </p>
          </div>

          <dl className="space-y-4">
            {MARKET_BANDS.map((band) => (
              <div
                key={band.id}
                className="rounded-2xl border border-[#e2ece8] bg-[#f7fbfa] p-4 shadow-[0_16px_40px_-36px_rgba(14,118,110,0.35)]"
              >
                <dt className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">{band.label}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                    {band.range}
                  </span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600">{band.narrative}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
              Priority zones surfaced by Al Yah
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {PRIORITY_ZONES.map((zone) => (
                <li key={zone} className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0F766E]" />
                  <span>{zone}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="rounded-3xl border border-[#e0ebe6] bg-white/95 p-6 shadow-[0_26px_70px_-50px_rgba(14,118,110,0.28)]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
              Visualise trends
            </h4>
            <p className="text-sm text-slate-600">
              Shamma hovers to view the year-over-year change for tourism, social buzz, and F&amp;B gross output.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Sources reconciled from {sources.slice(0, 2).join(", ")} and more.
          </div>
        </header>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {trendSummaries.map((trend) => (
            <div
              key={trend.id}
              onMouseEnter={() => setHoveredTrendId(trend.id)}
              onMouseLeave={() => setHoveredTrendId((current) => (current === trend.id ? null : current))}
              className={cn(
                "relative overflow-hidden rounded-3xl border border-[#e5f1ec] bg-[#f8fbfa] p-5 transition",
                "shadow-[0_24px_60px_-50px_rgba(14,118,110,0.4)] hover:border-[#d1e4dd]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
                    {trend.label}
                  </span>
                  <p className="mt-1 text-sm text-slate-600">Range {trend.rangeLabel}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest</div>
                  <div className="text-base font-semibold text-slate-900">{trend.latestLabel}</div>
                </div>
              </div>

              <div className="relative mt-5 h-2 w-full rounded-full bg-slate-200/80">
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    width: `${trend.sliderPercent}%`,
                    background: `linear-gradient(90deg, ${trend.accent}, rgba(14,118,110,0.25))`,
                  }}
                />
              </div>

              {hoveredTrendId === trend.id ? (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-2xl border border-[#d0e4dd] bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow">
                  {trend.deltaLabel}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MarketOpportunityInsight;
