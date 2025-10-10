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
  return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
};

const getPointStyle = (point: CompetitorPoint, metricId: CompetitorMetricId) => {
  const metric = point.metrics[metricId];
  const normalizedValue = Math.min(1, Math.max(0, metric.value / (metricId === "fnb" ? 12 : 100)));
  const size = point.baseSize + normalizedValue * 24;

  return {
    left: formatPosition(point.x),
    top: formatPosition(point.y),
    width: `${size}px`,
    height: `${size}px`,
    transform: "translate(-50%, -50%)",
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
    <motion.div className="relative flex h-full flex-col bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-160px] h-[360px] w-[360px] rounded-full bg-[#0E766E]/16 blur-3xl" />
        <div className="absolute right-[-160px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/12 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-[#d8e4df] bg-white/90 px-6 py-4 backdrop-blur">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Investor Compass</p>
          <h2 className="text-lg font-semibold text-slate-900">Competitor Heat Map</h2>
          <p className="text-xs text-slate-600">
            Interact with live competitor signals across Abu Dhabi&apos;s premium dining districts.
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

      <div className="relative z-10 flex flex-1 flex-col gap-6 overflow-hidden px-6 pb-8 pt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
          <div
            className={chatCardClass(
              "relative w-full overflow-hidden rounded-3xl border border-[#d8e4df] bg-white/95 shadow-[0_32px_80px_-54px_rgba(14,118,110,0.35)]",
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
                filter: "saturate(0.82)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0b2b34]/82 via-[#0b2b34]/68 to-transparent" />

            <div className="relative z-10 h-full w-full text-white">
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">Metric focus</h3>
                  <p className="text-xs text-white/60">{competitorMetricsMeta[selectedMetric].subtitle}</p>
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
                            : "border-white/35 bg-white/10 text-white/70 hover:border-white/50",
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

              <div className="relative mx-5 mb-5 rounded-2xl border border-white/20 bg-black/45 p-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Hover to explore</div>
                <p className="mt-2 text-xs text-white/70">
                  Dot intensity reflects {competitorMetricsMeta[selectedMetric].legend}. Select a node to reveal competitive
                  positioning and revenue signals.
                </p>
              </div>

              <div className="relative mx-5 mb-6 h-[360px] overflow-hidden rounded-3xl border border-white/18 bg-black/35">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(84,255,212,0.12),transparent_65%)]" />
                {competitorMapPoints.map((point) => {
                  const isActive = point.id === activePoint?.id;
                  const style = getPointStyle(point, selectedMetric);
                  const accent = competitorMetricsMeta[selectedMetric].accent;
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
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(50% 50% at 50% 50%, ${hexToRgba(accent, 0.4)} 0%, ${hexToRgba(
                            accent,
                            0,
                          )} 100%)`,
                          border: `1px solid ${hexToRgba(accent, 0.65)}`,
                          boxShadow: isActive
                            ? `0 0 0 2px rgba(255,255,255,0.85), 0 18px 38px -24px ${hexToRgba(accent, 0.7)}`
                            : `0 14px 32px -28px ${hexToRgba(accent, 0.55)}`,
                        }}
                      />
                      <span
                        className="absolute"
                        style={{
                          inset: "32%",
                          borderRadius: "50%",
                          backgroundColor: hexToRgba(accent, 0.92),
                          boxShadow: `0 0 14px ${hexToRgba(accent, 0.55)}`,
                        }}
                      />
                      <span
                        className={cn(
                          "absolute left-1/2 top-[calc(100%+8px)] min-w-[140px] -translate-x-1/2 rounded-full border px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-0 shadow-lg transition group-hover:opacity-100",
                          isActive ? "border-white/45 bg-black/80" : "border-white/30 bg-black/65",
                        )}
                      >
                        {point.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white/95 p-6 text-slate-700 shadow-[0_28px_70px_-48px_rgba(14,118,110,0.24)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
                  Spotlight competitor
                </p>
                <h3 className="text-xl font-semibold text-slate-900">{activePoint?.name}</h3>
                <p className="text-sm text-slate-600">{activePoint?.location}</p>
              </div>
              <span className="inline-flex items-center rounded-full border border-[#e2ece8] bg-[#f1f6f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                {activePoint?.cuisine}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">{activePoint?.summary}</p>

            <div className="space-y-3">
              {metricOrder.map((metricId) => {
                const metric = activePoint?.metrics[metricId];
                if (!metric) return null;
                const isActive = metricId === selectedMetric;
                return (
                  <div
                    key={metricId}
                    className={cn(
                      "rounded-2xl border px-4 py-3 transition",
                      isActive
                        ? "border-[#0F766E]/35 bg-[#e7f5f2] shadow-[0_20px_46px_-34px_rgba(14,118,110,0.4)]"
                        : "border-[#e2ece8] bg-[#f8fbfa]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="max-w-xs">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-[#0F766E]">{metric.label}</div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{metric.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900">
                          {competitorMetricsMeta[metricId].formatter
                            ? competitorMetricsMeta[metricId].formatter?.(metric.value)
                            : `${metric.value} ${metric.unit}`}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{metric.unit}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#e2ece8] bg-[#f8fbfa] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Highlights</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {activePoint?.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]/65" />
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
