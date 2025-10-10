import React, { useEffect, useMemo, useState } from "react";
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

const categoryOrder: DensityLayerId[] = ["residents", "office", "tourists"];

const layerMap: Record<DensityLayerId, (typeof densityLayers)[number]> = densityLayers.reduce(
  (acc, layer) => {
    acc[layer.id] = layer;
    return acc;
  },
  {} as Record<DensityLayerId, (typeof densityLayers)[number]>,
);

const SPARKLINE_WIDTH = 280;
const SPARKLINE_HEIGHT = 72;

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
  const deltaDescriptor = latestDelta > 0 ? "up" : latestDelta < 0 ? "down" : "flat";
  const formattedTrendValue = formatTrendValue(activeTrendDatum?.value);
  const formattedDelta = formatDeltaValue(activeTrendDatum?.yoyDelta);

  const headerSubtitle = isMarketView ? "Live location density view" : "Regional trend signals";

  const trendNarrative = activeTrendDatum
    ? `Latest ${activeTrend.label.toLowerCase()} reading for ${activeTrendDatum.month} is ${formattedTrendValue} (${formattedDelta} year-on-year). Momentum is ${trendDirection} across Corniche, Al Maryah, and Yas visitor corridors.`
    : activeTrend?.description ?? "";

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

            <div className="absolute inset-0">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute"
                style={{
                  width: "clamp(150px, 26%, 211px)",
                  height: "clamp(150px, 26%, 211px)",
                  left: "35%",
                  top: "28%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg className="h-full w-full" viewBox="0 0 212 212" fill="none">
                  <circle
                    cx="106"
                    cy="106"
                    r="105"
                    fill={isMarketView ? "url(#redGradient1)" : trendAccent}
                    fillOpacity={isMarketView ? 1 : 0.18}
                  />
                  <defs>
                    <radialGradient id="redGradient1" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#FF0000" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute"
                style={{
                  width: "clamp(120px, 24%, 189px)",
                  height: "clamp(120px, 24%, 189px)",
                  left: "18%",
                  top: "38%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg className="h-full w-full" viewBox="0 0 190 190" fill="none">
                  <circle
                    cx="95"
                    cy="95"
                    r="94"
                    fill={isMarketView ? "url(#redGradient2)" : trendAccent}
                    fillOpacity={isMarketView ? 1 : 0.13}
                  />
                  <defs>
                    <radialGradient id="redGradient2" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#FF0000" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute"
                style={{
                  width: "clamp(110px, 22%, 176px)",
                  height: "clamp(110px, 22%, 176px)",
                  left: "18%",
                  top: "20%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg className="h-full w-full" viewBox="0 0 177 177" fill="none">
                  <circle
                    cx="88"
                    cy="88"
                    r="88"
                    fill={isMarketView ? "url(#orangeGradient1)" : trendAccent}
                    fillOpacity={isMarketView ? 1 : 0.18}
                  />
                  <defs>
                    <radialGradient id="orangeGradient1" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#FF9500" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute"
                style={{
                  width: "clamp(110px, 22%, 176px)",
                  height: "clamp(110px, 22%, 176px)",
                  left: "35%",
                  top: "64%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg className="h-full w-full" viewBox="0 0 177 177" fill="none">
                  <circle
                    cx="88"
                    cy="88"
                    r="88"
                    fill={isMarketView ? "url(#orangeGradient2)" : trendAccent}
                    fillOpacity={isMarketView ? 1 : 0.14}
                  />
                  <defs>
                    <radialGradient id="orangeGradient2" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#FF9500" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="absolute"
                style={{
                  width: "clamp(180px, 31%, 248px)",
                  height: "clamp(180px, 31%, 248px)",
                  left: "54%",
                  top: "13%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg className="h-full w-full" viewBox="0 0 249 249" fill="none">
                  <circle
                    cx="124"
                    cy="124"
                    r="124"
                    fill={isMarketView ? "url(#orangeGradient3)" : trendAccent}
                    fillOpacity={isMarketView ? 1 : 0.12}
                  />
                  <defs>
                    <radialGradient id="orangeGradient3" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#FF9500" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute"
                style={{
                  width: "clamp(150px, 25%, 203px)",
                  height: "clamp(150px, 25%, 203px)",
                  left: "52%",
                  top: "-5%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <svg className="h-full w-full" viewBox="0 0 203 177" fill="none">
                  <circle
                    cx="101"
                    cy="75"
                    r="101"
                    fill={isMarketView ? "url(#yellowGradient)" : trendAccent}
                    fillOpacity={isMarketView ? 1 : 0.1}
                  />
                  <defs>
                    <radialGradient id="yellowGradient" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                      <stop stopColor="#FBFF00" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#F7FF00" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>

            {isMarketView ? (
              <div className="pointer-events-none absolute inset-0">
                {["residents", "tourists"].map((key, index) => {
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
            ) : (
              <>
                <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2">
                  {trendMetrics.map((metric) => {
                    const isActive = metric.id === selectedTrendId;
                    return (
                      <button
                        key={metric.id}
                        type="button"
                        onClick={() => setSelectedTrendId(metric.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                          isActive
                            ? "border-white bg-white/15 text-white"
                            : "border-white/30 bg-black/30 text-white/70 hover:border-white/50"
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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute bottom-6 left-6 right-6 z-20 space-y-4 rounded-3xl border border-white/20 bg-black/65 p-5 text-white shadow-[0_20px_52px_-34px_rgba(10,35,30,0.7)] backdrop-blur-lg"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">Selected period</div>
                      <div className="text-lg font-semibold">{activeTrendDatum?.month ?? "–"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                        {activeTrend?.label ?? "Metric"}
                      </div>
                      <div className="text-lg font-semibold">{formatTrendValue(activeTrendDatum?.value)}</div>
                      <div
                        className={`text-sm font-semibold ${latestDelta >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                      >
                        {formatDeltaValue(activeTrendDatum?.yoyDelta)}
                      </div>
                    </div>
                  </div>

                  <svg
                    viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                    className="w-full"
                    role="img"
                    aria-label={`${activeTrend?.label ?? "Trend"} sparkline showing recent movement`}
                  >
                    {sparklineFillPath ? (
                      <path d={sparklineFillPath} fill={trendAccent} fillOpacity={0.15} />
                    ) : null}
                    {sparklinePath ? (
                      <path
                        d={sparklinePath}
                        fill="none"
                        stroke={trendAccent}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    ) : null}
                    {activeTrendPoint ? (
                      <circle
                        cx={activeTrendPoint.x}
                        cy={activeTrendPoint.y}
                        r={4.5}
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
                    className="w-full"
                    style={{ accentColor: trendAccent }}
                    aria-label="Select period"
                  />

                  <p className="text-xs leading-relaxed text-white/80">{activeTrend?.subtitle}</p>
                </motion.div>
              </>
            )}
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
                    {categoryOrder.map((categoryId) => {
                      const metric = focusArea.metrics[categoryId];
                      const layer = layerMap[categoryId];
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
                    {categoryOrder.map((categoryId) => {
                      const layer = layerMap[categoryId];
                      return (
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
                      );
                    })}
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
                transition={{ duration: 0.6, delay: 0.9 }}
                className="rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_28px_70px_-38px_rgba(11,64,55,0.32)]"
              >
                <h3 className="text-base font-semibold text-slate-900 md:text-lg">Trend interpretation</h3>
                <p className="mt-2 text-sm text-slate-600">{trendNarrative}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="grid gap-4 lg:grid-cols-2"
              >
                <section className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Signals across priority zones</h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-600">
                    {areaProfiles.map((profile) => (
                      <div key={profile.area}>
                        <p className="font-semibold text-slate-900">{profile.area}</p>
                        <p className="mt-1 leading-relaxed">
                          {profile.area} couples {profile.metrics.residents.value.toLowerCase()} with {profile.metrics.tourists.value.toLowerCase()} and {profile.metrics.office.value.toLowerCase()}, amplifying {activeTrend?.label.toLowerCase()} uplift for operators along the corridor.
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
