import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import {
  competitorMapPoints,
  competitorMetricsMeta,
  CompetitorMetricId,
  CompetitorPoint,
} from "@/components/ui/competitor-map-data";

interface CompetitorHeatMapProps {
  onBack: () => void;
}

const metricOrder: CompetitorMetricId[] = ["tourism", "social", "fnb"];

const formatPosition = (value: number) => `${Math.max(0, Math.min(100, value))}%`;

const getPointStyle = (
  point: CompetitorPoint,
  selectedMetric: CompetitorMetricId,
  isActive: boolean,
) => {
  const metric = point.metrics[selectedMetric];
  const accent = competitorMetricsMeta[selectedMetric].accent;
  const normalizedValue = Math.min(1, Math.max(0, metric.value / (selectedMetric === "fnb" ? 12 : 100)));
  const size = point.baseSize + normalizedValue * 24;

  return {
    left: formatPosition(point.x),
    top: formatPosition(point.y),
    width: `${size}px`,
    height: `${size}px`,
    transform: "translate(-50%, -50%)",
    background: `radial-gradient(circle, ${accent}80 0%, ${accent}10 55%, transparent 70%)`,
    boxShadow: isActive
      ? `0 0 0 2px rgba(255,255,255,0.9), 0 0 25px ${accent}66`
      : `0 0 0 1px rgba(255,255,255,0.35)`,
  } as React.CSSProperties;
};

const CompetitorHeatMap: React.FC<CompetitorHeatMapProps> = ({ onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState<CompetitorMetricId>("tourism");
  const [activePointId, setActivePointId] = useState<string>(competitorMapPoints[0]?.id ?? "");

  const activePoint = useMemo(
    () => competitorMapPoints.find((point) => point.id === activePointId) ?? competitorMapPoints[0],
    [activePointId],
  );

  return (
    <motion.div className="flex h-full flex-col bg-[#0B1F26]">
      <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#54FFD4]">
            Investor Compass
          </p>
          <h2 className="text-lg font-semibold text-white">Competitor Heat Map</h2>
          <p className="text-xs text-white/70">
            Interact with live competitor signals across Abu Dhabi&apos;s premium dining districts.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <span>Back to summary</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
          <div
            className={chatCardClass(
              "relative w-full overflow-hidden rounded-3xl border border-white/18 bg-white/5 shadow-[0_28px_80px_-46px_rgba(12,68,74,0.45)]",
            )}
            style={{ minHeight: "360px" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url('https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=1280')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(0.85)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#041018]/80 via-[#041018]/65 to-transparent" />

            <div className="relative z-10 h-full w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
                    Metric focus
                  </h3>
                  <p className="text-white/60 text-xs">
                    {competitorMetricsMeta[selectedMetric].subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {metricOrder.map((metricId) => {
                    const meta = competitorMetricsMeta[metricId];
                    const isActive = selectedMetric === metricId;
                    return (
                      <button
                        key={metricId}
                        type="button"
                        onClick={() => setSelectedMetric(metricId)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition",
                          isActive
                            ? "border-white bg-white/20 text-white shadow-[0_12px_32px_-18px_rgba(84,255,212,0.35)]"
                            : "border-white/30 bg-white/5 text-white/60 hover:border-white/45",
                        )}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: meta.accent }}
                          aria-hidden="true"
                        />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mx-5 mb-5 rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Hover to explore
                </div>
                <p className="mt-2 text-xs text-white/70">
                  Pin intensity reflects {competitorMetricsMeta[selectedMetric].legend}. Select a point to reveal competitive
                  positioning and revenue signals.
                </p>
              </div>

              <div className="relative mx-5 mb-6 h-[360px] overflow-hidden rounded-3xl border border-white/15 bg-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(84,255,212,0.08),transparent_65%)]" />
                {competitorMapPoints.map((point) => {
                  const isActive = point.id === activePoint?.id;
                  const style = getPointStyle(point, selectedMetric, isActive);
                  return (
                    <motion.button
                      key={point.id}
                      type="button"
                      style={style}
                      className="group absolute overflow-visible"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      whileHover={{ scale: 1.08 }}
                      onClick={() => setActivePointId(point.id)}
                      onFocus={() => setActivePointId(point.id)}
                      onMouseEnter={() => setActivePointId(point.id)}
                      aria-pressed={isActive}
                      aria-label={`${point.name}, ${point.cuisine}`}
                    >
                      <span className="absolute inset-0 rounded-full border border-white/40" />
                      <span
                        className="absolute left-1/2 top-[calc(100%+8px)] min-w-[140px] -translate-x-1/2 rounded-full border border-white/30 bg-black/70 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-0 shadow-lg transition group-hover:opacity-100"
                      >
                        {point.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-white/15 bg-white/5 p-6 text-white/80">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Spotlight competitor
                </p>
                <h3 className="text-xl font-semibold text-white">{activePoint?.name}</h3>
                <p className="text-sm text-white/70">{activePoint?.location}</p>
              </div>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                {activePoint?.cuisine}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-white/75">{activePoint?.summary}</p>

            <div className="space-y-3">
              {metricOrder.map((metricId) => {
                const metric = activePoint?.metrics[metricId];
                if (!metric) return null;
                const meta = competitorMetricsMeta[metricId];
                const isActive = metricId === selectedMetric;
                return (
                  <div
                    key={metricId}
                    className={cn(
                      "rounded-2xl border px-4 py-3",
                      isActive
                        ? "border-white/25 bg-white/15"
                        : "border-white/12 bg-white/8",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="max-w-xs">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">{metric.label}</div>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">
                          {metric.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-lg font-semibold">
                          {competitorMetricsMeta[metricId].formatter
                            ? competitorMetricsMeta[metricId].formatter?.(metric.value)
                            : `${metric.value} ${metric.unit}`}
                        </div>
                        <div className="text-white/50 text-[11px] uppercase tracking-[0.18em]">
                          {metric.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                Highlights
              </div>
              <ul className="mt-2 space-y-2 text-sm text-white/70">
                {activePoint?.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default CompetitorHeatMap;
