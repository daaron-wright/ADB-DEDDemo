import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import {
  areaProfiles,
  densityLayers,
  DensityLayerId,
  HeatIntensity,
} from "@/components/ui/location-density-data";

const LocationHeatMap = ({ className = "" }: { className?: string }) => {
  const [activeLayerId, setActiveLayerId] = useState<DensityLayerId>("residents");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const activeLayer = useMemo(
    () => densityLayers.find((layer) => layer.id === activeLayerId) ?? densityLayers[0],
    [activeLayerId],
  );

  const activePoint = useMemo(
    () => activeLayer.points.find((point) => point.id === selectedPointId) ?? null,
    [activeLayer, selectedPointId],
  );

  useEffect(() => {
    setSelectedPointId(null);
  }, [activeLayerId]);

  const getHeatPointColor = (intensity: HeatIntensity) => {
    return activeLayer.palette[intensity];
  };

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
            <h3 className="text-white text-xl font-bold">Location Density Map</h3>
            <p className="text-white/70 text-sm max-w-md">{activeLayer.subtitle}</p>
          </div>
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
        </div>

        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          {activeLayer.summary}
        </p>

        <div className="relative mb-2">
          <div
            className="relative h-64 w-full overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"
            style={{
              backgroundImage:
                "url('https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386')",
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
                    background: getHeatPointColor(point.intensity),
                    borderRadius: "50%",
                    boxShadow:
                      selectedPointId === point.id
                        ? "0 0 0 2px rgba(255,255,255,0.35)"
                        : "0 0 0 1px rgba(255,255,255,0.15)",
                  } as React.CSSProperties
                }
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
                whileHover={{ scale: 1.1 }}
                onClick={() =>
                  setSelectedPointId((current) => (current === point.id ? null : point.id))
                }
                aria-pressed={selectedPointId === point.id}
                aria-label={`${point.title}, ${point.density}`}
              />
            ))}

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
          </div>

          {activePoint ? (
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
      </div>
    </motion.div>
  );
};

export default LocationHeatMap;
