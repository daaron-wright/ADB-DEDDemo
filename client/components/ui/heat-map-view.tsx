import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  areaProfiles,
  densityLayers,
  DensityLayerId,
  trendMetrics,
  TrendMetric,
} from "@/components/ui/location-density-data";

type HeatMapViewProps = {
  onBack: () => void;
};

type ViewMode = "market" | "trends";

type MarketBlobConfig = {
  id: string;
  style: React.CSSProperties;
  viewBox: string;
  circle: { cx: number; cy: number; r: number };
  gradientStops: Array<{ offset: number; color: string; opacity: number }>;
  delay: number;
};

type TrendPointConfig = {
  id: string;
  left: number;
  top: number;
  baseSize: number;
};

const SPARKLINE_WIDTH = 280;
const SPARKLINE_HEIGHT = 72;

const marketBlobConfigs: MarketBlobConfig[] = [
  {
    id: "market-blob-1",
    style: {
      width: "clamp(150px, 26%, 211px)",
      height: "clamp(150px, 26%, 211px)",
      left: "35%",
      top: "28%",
      transform: "translate(-50%, -50%)",
    },
    viewBox: "0 0 212 212",
    circle: { cx: 106, cy: 106, r: 105 },
    gradientStops: [
      { offset: 0, color: "#FF0000", opacity: 0.4 },
      { offset: 1, color: "#FF0000", opacity: 0 },
    ],
    delay: 0.3,
  },
  {
    id: "market-blob-2",
    style: {
      width: "clamp(120px, 24%, 189px)",
      height: "clamp(120px, 24%, 189px)",
      left: "18%",
      top: "38%",
      transform: "translate(-50%, -50%)",
    },
    viewBox: "0 0 190 190",
    circle: { cx: 95, cy: 95, r: 94 },
    gradientStops: [
      { offset: 0, color: "#FF0000", opacity: 0.4 },
      { offset: 1, color: "#FF0000", opacity: 0 },
    ],
    delay: 0.4,
  },
  {
    id: "market-blob-3",
    style: {
      width: "clamp(110px, 22%, 176px)",
      height: "clamp(110px, 22%, 176px)",
      left: "18%",
      top: "20%",
      transform: "translate(-50%, -50%)",
    },
    viewBox: "0 0 177 177",
    circle: { cx: 88, cy: 88, r: 88 },
    gradientStops: [
      { offset: 0, color: "#FF9500", opacity: 0.4 },
      { offset: 1, color: "#FFB300", opacity: 0 },
    ],
    delay: 0.5,
  },
  {
    id: "market-blob-4",
    style: {
      width: "clamp(110px, 22%, 176px)",
      height: "clamp(110px, 22%, 176px)",
      left: "35%",
      top: "64%",
      transform: "translate(-50%, -50%)",
    },
    viewBox: "0 0 177 177",
    circle: { cx: 88, cy: 88, r: 88 },
    gradientStops: [
      { offset: 0, color: "#FF9500", opacity: 0.4 },
      { offset: 1, color: "#FFB300", opacity: 0 },
    ],
    delay: 0.6,
  },
  {
    id: "market-blob-5",
    style: {
      width: "clamp(180px, 31%, 248px)",
      height: "clamp(180px, 31%, 248px)",
      left: "54%",
      top: "13%",
      transform: "translate(-50%, -50%)",
    },
    viewBox: "0 0 249 249",
    circle: { cx: 124, cy: 124, r: 124 },
    gradientStops: [
      { offset: 0, color: "#FF9500", opacity: 0.4 },
      { offset: 1, color: "#FFB300", opacity: 0 },
    ],
    delay: 0.7,
  },
  {
    id: "market-blob-6",
    style: {
      width: "clamp(150px, 25%, 203px)",
      height: "clamp(150px, 25%, 203px)",
      left: "52%",
      top: "-5%",
      transform: "translate(-50%, -50%)",
    },
    viewBox: "0 0 203 177",
    circle: { cx: 101, cy: 75, r: 101 },
    gradientStops: [
      { offset: 0, color: "#FBFF00", opacity: 0.4 },
      { offset: 1, color: "#F7FF00", opacity: 0 },
    ],
    delay: 0.8,
  },
];

const trendPointConfigs: TrendPointConfig[] = [
  { id: "trend-point-1", left: 36, top: 28, baseSize: 26 },
  { id: "trend-point-2", left: 22, top: 40, baseSize: 22 },
  { id: "trend-point-3", left: 18, top: 18, baseSize: 20 },
  { id: "trend-point-4", left: 40, top: 62, baseSize: 24 },
  { id: "trend-point-5", left: 56, top: 18, baseSize: 28 },
  { id: "trend-point-6", left: 50, top: 8, baseSize: 18 },
  { id: "trend-point-7", left: 62, top: 40, baseSize: 24 },
  { id: "trend-point-8", left: 72, top: 60, baseSize: 20 },
];

const trendPointMultipliers: Record<TrendMetric["id"], number[]> = {
  tourism: [1.2, 0.9, 0.8, 1, 1.1, 0.75, 1.05, 0.85],
  social: [0.95, 1.1, 0.85, 1.05, 0.9, 0.8, 1.15, 1],
  fnb: [1.05, 0.95, 1.1, 1.2, 0.9, 0.8, 1, 1.15],
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  if (fullHex.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);
  const clampedAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
};

const HeatMapView: React.FC<HeatMapViewProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("market");
  const [selectedTrendId, setSelectedTrendId] = useState<TrendMetric["id"]>(
    trendMetrics[0]?.id ?? "tourism",
  );
  const [activeTrendIndex, setActiveTrendIndex] = useState<number>(
    (trendMetrics[0]?.data.length ?? 1) - 1,
  );

  const isMarketView = viewMode === "market";

  const focusArea =
    areaProfiles.find((profile) => profile.area === "Corniche") ?? areaProfiles[0]!;

  const activeTrend = useMemo(
    () => trendMetrics.find((metric) => metric.id === selectedTrendId) ?? trendMetrics[0],
    [selectedTrendId],
  );

  useEffect(() => {
    setActiveTrendIndex((activeTrend?.data.length ?? 1) - 1);
  }, [selectedTrendId, activeTrend?.data.length]);

  const sparklineCoordinates = useMemo(() => {
    if (!activeTrend) {
      return [] as Array<{ x: number; y: number; value: number }>;
    }

    const values = activeTrend.data.map((point) => point.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const step = activeTrend.data.length > 1 ? SPARKLINE_WIDTH / (activeTrend.data.length - 1) : SPARKLINE_WIDTH;

    return activeTrend.data.map((point, index) => {
      const x = index * step;
      const normalized = maxValue === minValue ? 0.5 : (point.value - minValue) / (maxValue - minValue);
      const y = SPARKLINE_HEIGHT - normalized * SPARKLINE_HEIGHT;
      return { x, y, value: point.value };
    });
  }, [activeTrend]);

  const sparklinePath = useMemo(() => {
    if (!sparklineCoordinates.length) {
      return "";
    }

    return sparklineCoordinates
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
  }, [sparklineCoordinates]);

  const sparklineFillPath = useMemo(() => {
    if (!sparklineCoordinates.length) {
      return "";
    }

    const baseLine = `${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT} L 0 ${SPARKLINE_HEIGHT} Z`;
    return `${sparklinePath} L ${baseLine}`;
  }, [sparklineCoordinates, sparklinePath]);

  const fallbackTrendPoint = sparklineCoordinates[sparklineCoordinates.length - 1];
  const activeTrendPoint =
    sparklineCoordinates[activeTrendIndex] ?? fallbackTrendPoint ?? { x: 0, y: SPARKLINE_HEIGHT / 2, value: 0 };
  const fallbackTrendDatum = activeTrend?.data[activeTrend?.data.length - 1];
  const activeTrendDatum = activeTrend?.data[activeTrendIndex] ?? fallbackTrendDatum;

  const trendAccent = activeTrend?.accent ?? "#0F766E";

  const formatTrendValue = (value?: number) => {
    if (value === undefined || value === null || !activeTrend) {
      return "–";
    }

    const unitLower = activeTrend.unit.toLowerCase();
    if (unitLower.includes("aed")) {
      return `${value.toFixed(1)} ${activeTrend.unit}`;
    }

    if (unitLower.includes("index")) {
      return `${Math.round(value)} ${activeTrend.unit}`;
    }

    return `${Math.round(value)} ${activeTrend.unit}`;
  };

  const formatDeltaValue = (value?: number) => {
    if (value === undefined || value === null || !activeTrend) {
      return "–";
    }

    const unitLower = activeTrend.unit.toLowerCase();
    const decimals = unitLower.includes("aed") ? 1 : 0;
    const signedValue = value >= 0 ? `+${value.toFixed(decimals)}` : value.toFixed(decimals);
    const suffix = unitLower.includes("aed")
      ? " bn"
      : unitLower.includes("index") || unitLower.includes("buzz")
      ? " pts"
      : unitLower.includes("%")
      ? " %"
      : activeTrend.unit
      ? ` ${activeTrend.unit}`
      : "";
    return `${signedValue}${suffix}`;
  };

  const latestDelta = activeTrendDatum?.yoyDelta ?? 0;
  const trendDirection = latestDelta > 0 ? "accelerating" : latestDelta < 0 ? "moderating" : "steady";
  const formattedTrendValue = formatTrendValue(activeTrendDatum?.value);
  const formattedDelta = formatDeltaValue(activeTrendDatum?.yoyDelta);
  const deltaColorClass = latestDelta > 0 ? "text-emerald-600" : latestDelta < 0 ? "text-rose-600" : "text-slate-600";

  const headerSubtitle = isMarketView ? "Live location density view" : "Regional trend signals";

  const trendNarrative = activeTrendDatum
    ? `Latest ${activeTrend.label.toLowerCase()} reading for ${activeTrendDatum.month} is ${formattedTrendValue} (${formattedDelta} year-on-year). Momentum is ${trendDirection} across Corniche, Al Maryah, and Yas visitor corridors.`
    : activeTrend?.description ?? "";

  const gradientPrefix = useId();

  const renderMarketBlob = useCallback(
    (blob: MarketBlobConfig) => {
      const gradientId = `${gradientPrefix}-${blob.id}`;
      return (
        <svg className="h-full w-full" viewBox={blob.viewBox} fill="none">
          <defs>
            <radialGradient id={gradientId} cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
              {blob.gradientStops.map((stop) => (
                <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
              ))}
            </radialGradient>
          </defs>
          <circle cx={blob.circle.cx} cy={blob.circle.cy} r={blob.circle.r} fill={`url(#${gradientId})`} />
        </svg>
      );
    },
    [gradientPrefix],
  );

  const activeMultipliers = trendPointMultipliers[selectedTrendId] ?? trendPointMultipliers.tourism;

  return (
    <div className="relative flex h-full min-h-[640px] flex-col overflow-x-hidden overflow-y-auto bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-160px] h-[380px] w-[380px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-160px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[920px] px-6 py-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm transition hover:bg-[#eff6f3] hover:text-[#0a5a55]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to dialogue
          </button>
          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
              Abu Dhabi Business Signals
            </span>
            <span className="text-sm text-slate-500">{headerSubtitle}</span>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center rounded-full border border-[#d8e4df] bg-white/70 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("market")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 ${
              isMarketView ? "bg-[#0F766E] text-white shadow" : "text-[#0F766E] hover:bg-white"
            }`}
          >
            Total addressable market
          </button>
          <button
            type="button"
            onClick={() => setViewMode("trends")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 ${
              !isMarketView ? "bg-[#0F766E] text-white shadow" : "text-[#0F766E] hover:bg-white"
            }`}
          >
            Visualize trends
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[920px] flex-1 px-6 pb-10 lg:px-10">
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-[#d8e4df] bg-gradient-to-br from-[#616161] to-[#4a4a4a] shadow-[0_32px_70px_-42px_rgba(11,64,55,0.35)]"
            style={{ aspectRatio: "920/600", minHeight: "480px" }}
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/df351a3a49f1c6b9b74765965e6ddb3ecf6799d7?width=1600"
              alt="Abu Dhabi location density map"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover"
            />

            <div className="pointer-events-none absolute inset-0">
              {isMarketView ? (
                marketBlobConfigs.map((blob) => (
                  <motion.div
                    key={blob.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: blob.delay }}
                    className="absolute"
                    style={blob.style}
                  >
                    {renderMarketBlob(blob)}
                  </motion.div>
                ))
              ) : (
                trendPointConfigs.map((point, index) => {
                  const multiplier = activeMultipliers[index % activeMultipliers.length] ?? 1;
                  const size = point.baseSize * multiplier;
                  return (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                      className="absolute"
                      style={{
                        left: `${point.left}%`,
                        top: `${point.top}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          background: `radial-gradient(50% 50% at 50% 50%, ${hexToRgba(trendAccent, 0.4)} 0%, ${hexToRgba(
                            trendAccent,
                            0,
                          )} 100%)`,
                          border: `1px solid ${hexToRgba(trendAccent, 0.6)}`,
                          boxShadow: `0 16px 40px -28px ${hexToRgba(trendAccent, 0.65)}`,
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            inset: "32%",
                            borderRadius: "50%",
                            backgroundColor: hexToRgba(trendAccent, 0.85),
                            boxShadow: `0 0 14px ${hexToRgba(trendAccent, 0.55)}`,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {!isMarketView ? (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute top-6 left-6 z-20 max-w-[260px] rounded-2xl border border-white/25 bg-black/50 p-4 text-white shadow-[0_18px_44px_-30px_rgba(13,38,32,0.55)] backdrop-blur"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/70">Trend metric</div>
                <div className="mt-2 text-lg font-semibold leading-tight">{activeTrend?.label}</div>
                <div className="mt-1 text-xs text-white/65">{activeTrend?.subtitle}</div>
              </motion.div>
            ) : null}

            {isMarketView ? (
              <div className="pointer-events-none absolute inset-0">
                {(["residents", "tourists"] as const).map((key, index) => {
                  const card =
                    key === "residents"
                      ? {
                          id: "residents" as const,
                          title: "Residents",
                          value: focusArea.metrics.residents.value,
                          note: focusArea.metrics.residents.note,
                          source: focusArea.metrics.residents.source,
                          style: {
                            top: "14%",
                            right: "4%",
                            width: "clamp(120px, 26vw, 160px)",
                          } as React.CSSProperties,
                        }
                      : {
                          id: "tourists" as const,
                          title: "Tourists",
                          value: focusArea.metrics.tourists.value,
                          note: focusArea.metrics.tourists.note,
                          source: focusArea.metrics.tourists.source,
                          style: {
                            bottom: "16%",
                            left: "6%",
                            width: "clamp(120px, 28vw, 160px)",
                          } as React.CSSProperties,
                        };
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 + index * 0.08 }}
                      className="absolute"
                      style={card.style}
                    >
                      <div className="rounded-2xl border border-white/25 bg-black/45 p-3 text-white shadow-[0_18px_44px_-30px_rgba(13,38,32,0.55)] backdrop-blur">
                        <div className="text-left">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                            {card.title}
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">{card.value}</div>
                          <p className="mt-1 text-[11px] text-white/80 leading-snug">{card.note}</p>
                          <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/60">{card.source}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <motion.div
                  key="sources"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.06 }}
                  className="absolute"
                  style={{
                    bottom: "6%",
                    right: "4%",
                    width: "clamp(150px, 32vw, 190px)",
                  }}
                >
                  <div className="rounded-2xl border border-white/25 bg-black/45 p-3 text-white shadow-[0_18px_44px_-30px_rgba(13,38,32,0.55)] backdrop-blur">
                    <div className="space-y-1 text-left text-[11px] leading-relaxed">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Data sources</div>
                      <div>• Tawtheeq residential & commercial contracts</div>
                      <div>• DED licence registry and employment filings</div>
                      <div>• Holiday Homes permits & DCT tourism data</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </motion.div>

          {isMarketView ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_28px_70px_-38px_rgba(11,64,55,0.32)]"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-slate-900 md:text-lg">{focusArea.area}</h3>
                    <p className="text-xs text-slate-600">
                      Cross-validated demand mix from Tawtheeq occupancy, DED employment filings, and tourism statistics.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(["residents", "office", "tourists"] as DensityLayerId[]).map((categoryId) => {
                      const metric = focusArea.metrics[categoryId];
                      const layer = densityLayers.find((l) => l.id === categoryId)!;
                      return (
                        <div
                          key={categoryId}
                          className="flex flex-col gap-1 rounded-2xl border border-[#e2ece8] bg-white/90 p-4"
                        >
                          <span className="text-xs uppercase tracking-[0.2em] text-[#0F766E]">{layer.label}</span>
                          <span className="text-lg font-bold text-slate-900 md:text-2xl">{metric.value}</span>
                          <span className="text-[11px] text-slate-600 leading-snug">{metric.note}</span>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{metric.source}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="grid gap-4 lg:grid-cols-3"
              >
                <section className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Key Insights</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {[
                      {
                        title: "Corniche waterfront towers",
                        description:
                          "6.5k residential households sustain >92% occupancy, with Tawtheeq rental contracts feeding the counts each quarter.",
                      },
                      {
                        title: "Al Maryah employment spine",
                        description:
                          "14.2k office workers validated by Tawtheeq and DED licences drive lunchtime peaks and evening corporate dining.",
                      },
                      {
                        title: "Yas Island visitor surge",
                        description:
                          "9.3k nightly visitors from hotels and holiday homes anchor weekend highs and event-led spending.",
                      },
                      {
                        title: "Corniche eastern promenade",
                        description:
                          "Balanced mix of residents, office staff, and beach tourists supports premium pricing along the frontage.",
                      },
                    ].map((insight) => (
                      <div key={insight.title}>
                        <p className="font-semibold text-slate-900">{insight.title}</p>
                        <p className="mt-1 leading-relaxed">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Density Legend</h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-600">
                    {densityLayers.map((layer) => (
                      <div key={layer.id} className="rounded-xl border border-[#e2ece8] bg-white/90 p-3 shadow-sm">
                        <div className="font-semibold text-slate-900">{layer.label}</div>
                        <p className="mt-1 text-xs text-slate-500">{layer.summary}</p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {layer.legend.map((item) => (
                            <li key={item.label} className="flex items-center gap-3">
                              <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundImage: item.swatch }} />
                              <span>
                                {item.label} ({item.threshold})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#d8e4df] bg-white/95 p-4 shadow-[0_18px_48px_-32px_rgba(11,64,55,0.3)]">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0F766E]">Next Actions</h3>
                  <ul className="mt-3 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="inline-flex h-1 w-1 rounded-full bg-[#0F766E]" />
                      Sync with property desk for Corniche frontage availability.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-flex h-1 w-1 rounded-full bg-[#0F766E]" />
                      Prepare zoning dossier for Saadiyat cultural strip.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-flex h-1 w-1 rounded-full bg-[#0F766E]" />
                      Share density summary with reviewer workspace.
                    </li>
                  </ul>
                </section>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_28px_70px_-38px_rgba(11,64,55,0.32)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
                      Trend visualisation
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-slate-900 md:text-lg">
                      {activeTrend?.label}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{activeTrend?.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {trendMetrics.map((metric) => {
                      const isActive = metric.id === selectedTrendId;
                      return (
                        <button
                          key={metric.id}
                          type="button"
                          onClick={() => setSelectedTrendId(metric.id)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 ${
                            isActive
                              ? "border-[#0F766E] bg-[#0F766E] text-white shadow-sm"
                              : "border-[#d8e4df] bg-white text-[#0F766E] hover:bg-[#eff6f3]"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: metric.accent }}
                          />
                          {metric.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#e2ece8] bg-white p-5">
                  <svg
                    viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                    className="h-28 w-full"
                    role="img"
                    aria-label={`${activeTrend?.label ?? "Trend"} sparkline showing recent movement`}
                  >
                    {sparklineFillPath ? <path d={sparklineFillPath} fill={hexToRgba(trendAccent, 0.08)} /> : null}
                    {sparklinePath ? (
                      <path
                        d={sparklinePath}
                        fill="none"
                        stroke={trendAccent}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity={0.85}
                      />
                    ) : null}
                    {activeTrendPoint ? (
                      <circle
                        cx={activeTrendPoint.x}
                        cy={activeTrendPoint.y}
                        r={3.5}
                        fill="#ffffff"
                        stroke={trendAccent}
                        strokeWidth={2}
                      />
                    ) : null}
                  </svg>

                  <input
                    type="range"
                    min={0}
                    max={(activeTrend?.data.length ?? 1) - 1}
                    value={activeTrendIndex}
                    onChange={(event) => setActiveTrendIndex(Number(event.target.value))}
                    className="mt-4 w-full"
                    style={{ accentColor: trendAccent }}
                    aria-label="Select period"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#e2ece8] bg-[#f5f8f6] p-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Selected period</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{activeTrendDatum?.month ?? "–"}</div>
                    </div>
                    <div className="rounded-2xl border border-[#e2ece8] bg-[#f5f8f6] p-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{activeTrend?.label ?? "Metric"}</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{formattedTrendValue}</div>
                    </div>
                    <div className="rounded-2xl border border-[#e2ece8] bg-[#f5f8f6] p-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">YoY delta</div>
                      <div className={`mt-2 text-lg font-semibold ${deltaColorClass}`}>{formattedDelta}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Momentum {trendDirection}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.95 }}
                className="rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_28px_70px_-38px_rgba(11,64,55,0.32)]"
              >
                <h3 className="text-base font-semibold text-slate-900 md:text-lg">Trend interpretation</h3>
                <p className="mt-2 text-sm text-slate-600">{trendNarrative}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.05 }}
                className="grid gap-4 lg:grid-cols-2"
              >
                <section className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Signals across priority zones</h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-600">
                    {areaProfiles.map((profile) => (
                      <div key={profile.area}>
                        <p className="font-semibold text-slate-900">{profile.area}</p>
                        <p className="mt-1 leading-relaxed">
                          {profile.area} couples {profile.metrics.residents.value.toLowerCase()} with {profile.metrics.tourists.value.toLowerCase()} and {profile.metrics.office.value.toLowerCase()}, amplifying {(activeTrend?.label ?? "demand").toLowerCase()} uplift for operators along the corridor.
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Data sources</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {(activeTrend?.sources ?? []).map((source) => (
                      <li key={source} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                        <span>{source}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatMapView;
