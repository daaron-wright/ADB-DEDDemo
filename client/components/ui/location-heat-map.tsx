import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import {
  areaProfiles,
  densityLayers,
  DensityLayerId,
  HeatIntensity,
  trendMetrics,
  TrendMetric,
} from "@/components/ui/location-density-data";

const SPARKLINE_WIDTH = 280;
const SPARKLINE_HEIGHT = 72;

type ViewMode = "market" | "trends";

const LocationHeatMap = ({ className = "" }: { className?: string }) => {
  const [activeLayerId, setActiveLayerId] = useState<DensityLayerId>("residents");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedTrendId, setSelectedTrendId] = useState<TrendMetric["id"]>(
    trendMetrics[0]?.id ?? "tourism",
  );
  const [activeTrendIndex, setActiveTrendIndex] = useState<number>(
    (trendMetrics[0]?.data.length ?? 1) - 1,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("market");

  const isMarketView = viewMode === "market";

  const activeLayer = useMemo(
    () => densityLayers.find((layer) => layer.id === activeLayerId) ?? densityLayers[0],
    [activeLayerId],
  );

  const activePoint = useMemo(
    () => activeLayer.points.find((point) => point.id === selectedPointId) ?? null,
    [activeLayer, selectedPointId],
  );

  const activeTrend = useMemo(
    () => trendMetrics.find((metric) => metric.id === selectedTrendId) ?? trendMetrics[0],
    [selectedTrendId],
  );

  useEffect(() => {
    setSelectedPointId(null);
  }, [activeLayerId]);

  useEffect(() => {
    if (!isMarketView) {
      setSelectedPointId(null);
    }
  }, [isMarketView]);

  useEffect(() => {
    setActiveTrendIndex((activeTrend?.data.length ?? 1) - 1);
  }, [selectedTrendId, activeTrend?.data.length]);

  const getHeatPointColor = (intensity: HeatIntensity) => {
    return activeLayer.palette[intensity];
  };

  const trendAccent = activeTrend?.accent ?? "#0E766E";

  const sparklineCoordinates = useMemo(() => {
    if (!activeTrend) {
      return [] as Array<{ x: number; y: number; value: number }>;
    }

    const values = activeTrend.data.map((point) => point.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const step =
      activeTrend.data.length > 1 ? SPARKLINE_WIDTH / (activeTrend.data.length - 1) : SPARKLINE_WIDTH;

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

  const deltaUnit = useMemo(() => {
    if (!activeTrend) {
      return "";
    }

    const unitLower = activeTrend.unit.toLowerCase();
    if (unitLower.includes("aed")) {
      return " bn";
    }
    if (unitLower.includes("index")) {
      return " pts";
    }
    if (unitLower.includes("buzz")) {
      return " pts";
    }
    if (unitLower.includes("%")) {
      return " %";
    }
    return activeTrend.unit ? ` ${activeTrend.unit}` : "";
  }, [activeTrend]);

  const formatDeltaValue = (value?: number) => {
    if (value === undefined || value === null || !activeTrend) {
      return "–";
    }

    const unitLower = activeTrend.unit.toLowerCase();
    const decimals = unitLower.includes("aed") ? 1 : 0;
    const signedValue = value >= 0 ? `+${value.toFixed(decimals)}` : value.toFixed(decimals);
    return `${signedValue}${deltaUnit}`;
  };

  const subheadingText = isMarketView ? activeLayer.subtitle : activeTrend?.subtitle ?? "";
  const summaryText = isMarketView ? activeLayer.summary : activeTrend?.description ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        chatCardClass("w-full bg-white/10 border border-white/20 overflow-hidden"),
        className,
      )}
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-bold">Location Intelligence Map</h3>
            <p className="text-white/70 text-sm max-w-md">{subheadingText}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setViewMode("market")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                isMarketView ? "bg-white text-slate-900 shadow" : "text-white/70 hover:text-white",
              )}
            >
              Total addressable market
            </button>
            <button
              type="button"
              onClick={() => setViewMode("trends")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                !isMarketView ? "bg-white text-slate-900 shadow" : "text-white/70 hover:text-white",
              )}
            >
              Visualize trends
            </button>
          </div>
        </div>

        {isMarketView ? (
          <div className="flex flex-wrap items-center gap-2">
            {densityLayers.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayerId(layer.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                  activeLayerId === layer.id
                    ? "border-white bg-white/15 text-white shadow-[0_12px_28px_-16px_rgba(14,118,110,0.45)]"
                    : "border-white/30 bg-white/5 text-white/70 hover:border-white/50",
                )}
              >
                {layer.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {trendMetrics.map((metric) => {
              const isActive = metric.id === selectedTrendId;
              return (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => setSelectedTrendId(metric.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    isActive ? "border-white bg-white/15 text-white" : "border-white/25 bg-white/5 text-white/60 hover:border-white/40",
                  )}
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
        )}

        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">{summaryText}</p>

        <div className="relative mb-2">
          <div
            className="relative h-64 w-full overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"
            style={{
              backgroundImage:
                "url('https://api.builder.io/api/v1/image/assets/TEMP/df351a3a49f1c6b9b74765965e6ddb3ecf6799d7?width=1600')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/45" />

            {activeLayer.points.map((point) => (
              <motion.button
                key={point.id}
                type="button"
                className="absolute"
                style={
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: `${point.size}px`,
                    height: `${point.size}px`,
                    transform: "translate(-50%, -50%)",
                    background: isMarketView ? getHeatPointColor(point.intensity) : trendAccent,
                    borderRadius: "50%",
                    boxShadow: isMarketView
                      ? selectedPointId === point.id
                        ? "0 0 0 2px rgba(255,255,255,0.35)"
                        : "0 0 0 1px rgba(255,255,255,0.15)"
                      : "0 0 0 1px rgba(255,255,255,0.2)",
                    opacity: isMarketView ? 1 : 0.7,
                    pointerEvents: isMarketView ? "auto" : "none",
                  } as React.CSSProperties
                }
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
                whileHover={isMarketView ? { scale: 1.1 } : undefined}
                onClick={() =>
                  setSelectedPointId((current) => (current === point.id ? null : point.id))
                }
                aria-pressed={selectedPointId === point.id}
                aria-label={`${point.title}, ${point.density}`}
              />
            ))}

            {isMarketView ? (
              <div className="absolute top-4 right-4 space-y-3 rounded-xl border border-white/15 bg-black/60 p-3 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  {activeLayer.label} density
                </div>
                <div className="space-y-2">
                  {activeLayer.legend.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 text-xs text-white/80">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundImage: item.swatch }}
                        aria-hidden="true"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-white">{item.label}</span>
                        <span className="text-white/60">{item.threshold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 z-10 space-y-4 rounded-2xl border border-white/15 bg-black/65 p-4 backdrop-blur"
              >
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">Selected period</div>
                    <div className="text-white text-lg font-semibold">
                      {activeTrendDatum?.month ?? "–"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                      {activeTrend?.label ?? "Metric"}
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {formatTrendValue(activeTrendDatum?.value)}
                    </div>
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        (activeTrendDatum?.yoyDelta ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300",
                      )}
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

                <p className="text-xs leading-relaxed text-white/70">
                  {activeTrend?.subtitle}
                </p>
              </motion.div>
            )}
          </div>

          {isMarketView && activePoint ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-white/15 bg-white/8 p-4 text-sm text-white/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-white text-base font-semibold">
                    {activePoint.title}
                  </div>
                  <div className="text-white/60 text-xs uppercase tracking-[0.2em]">
                    {activeLayer.label} density
                  </div>
                </div>
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {activePoint.density}
                </div>
              </div>
              <p className="mt-3 text-white/80">{activePoint.insight}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
                Derived from {activeLayer.dataSources.join(", ")}
              </p>
            </motion.div>
          ) : null}
        </div>

        {isMarketView ? (
          <>
            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">Area analysis</h4>
              {areaProfiles.map((profile, index) => {
                const layerMetric = profile.metrics[activeLayerId];
                return (
                  <motion.div
                    key={profile.area}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-white text-base font-semibold">{profile.area}</div>
                        <p className="text-white/70 text-sm max-w-xl">{profile.description}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                        <span>{profile.rating.toFixed(1)}</span>
                        <span className="text-white/60">/10</span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="text-white/60 text-xs uppercase tracking-[0.2em]">
                          {activeLayer.label} snapshot
                        </div>
                        <div className="mt-2 text-white text-lg font-semibold">
                          {layerMetric.value}
                        </div>
                        <p className="mt-1 text-sm text-white/70">{layerMetric.note}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/40">
                          {layerMetric.source}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
              <div className="font-semibold uppercase tracking-[0.24em] text-white/70">
                Data provenance
              </div>
              <p className="mt-2 text-white/70">
                Density layers consolidate Tawtheeq contracts, Department of Economic Development licence intel,
                employment submissions, Holiday Homes permits, and Department of Culture & Tourism hotel statistics.
                Values are normalised per square kilometre using occupancy, licence, and tourism indicators.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/6 p-4 text-xs text-white/70">
            <div className="font-semibold uppercase tracking-[0.24em] text-white/65">
              Data sources
            </div>
            <ul className="mt-2 space-y-1 text-white/60">
              {(activeTrend?.sources ?? []).map((source) => (
                <li key={source} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LocationHeatMap;
