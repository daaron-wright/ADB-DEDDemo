import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";

type DensityLayerId = "residents" | "office" | "tourists";

type HeatIntensity = "high" | "medium" | "low";

interface HeatMapPoint {
  id: string;
  x: number;
  y: number;
  intensity: HeatIntensity;
  size: number;
}

interface DensityPoint extends HeatMapPoint {
  title: string;
  density: string;
  insight: string;
}

interface DensityLayer {
  id: DensityLayerId;
  label: string;
  subtitle: string;
  palette: Record<HeatIntensity, string>;
  legend: Array<{ label: string; threshold: string; swatch: string }>;
  points: DensityPoint[];
  dataSources: string[];
  summary: string;
}

interface AreaProfileMetric {
  value: string;
  note: string;
  source: string;
}

interface AreaProfile {
  area: string;
  rating: number;
  description: string;
  metrics: Record<DensityLayerId, AreaProfileMetric>;
}

const densityLayers: DensityLayer[] = [
  {
    id: "residents",
    label: "Residents",
    subtitle:
      "Household density derived from Tawtheeq residential contracts and occupancy filings (Q1 2025).",
    palette: {
      high:
        "radial-gradient(50% 50% at 50% 50%, rgba(14,118,110,0.55) 0%, rgba(14,118,110,0) 100%)",
      medium:
        "radial-gradient(50% 50% at 50% 50%, rgba(45,196,154,0.48) 0%, rgba(45,196,154,0) 100%)",
      low:
        "radial-gradient(50% 50% at 50% 50%, rgba(148,231,204,0.42) 0%, rgba(148,231,204,0) 100%)",
    },
    legend: [
      {
        label: "High density",
        threshold: "> 5k households/km²",
        swatch: "linear-gradient(135deg, #0E766E, #1dd8a4)",
      },
      {
        label: "Medium density",
        threshold: "2k – 5k households/km²",
        swatch: "linear-gradient(135deg, #2DC49A, #6EE7B7)",
      },
      {
        label: "Emerging clusters",
        threshold: "< 2k households/km²",
        swatch: "linear-gradient(135deg, #94E7CC, #ECFDF5)",
      },
    ],
    points: [
      {
        id: "corniche-res",
        x: 38,
        y: 47,
        intensity: "high",
        size: 74,
        title: "Corniche waterfront towers",
        density: "6.5k Tawtheeq households",
        insight: "High-rise residences sustain 92% average occupancy across Corniche blocks.",
      },
      {
        id: "khalidiya-res",
        x: 24,
        y: 58,
        intensity: "medium",
        size: 56,
        title: "Khalidiya family district",
        density: "3.1k households",
        insight:
          "Mixed-use towers with large family apartments; long-term lease renewals remain stable.",
      },
      {
        id: "reems-res",
        x: 58,
        y: 36,
        intensity: "medium",
        size: 60,
        title: "Al Reem Island",
        density: "4.7k households",
        insight: "Fast-growing residential hub with sustained expatriate demand and new towers coming online.",
      },
      {
        id: "mbz-res",
        x: 72,
        y: 63,
        intensity: "low",
        size: 44,
        title: "MBZ City villas",
        density: "1.6k households",
        insight: "Lower-rise suburban villas with steady Emirati occupancy, suitable for destination dining.",
      },
    ],
    dataSources: [
      "Tawtheeq occupancy registry",
      "Municipal build-to-rent permits",
    ],
    summary: "Identify neighbourhoods with resident-led, everyday demand baselines.",
  },
  {
    id: "office",
    label: "Office workers",
    subtitle:
      "Employment clusters reconciled from Tawtheeq commercial leases, DED licences, and labour filings (2024).",
    palette: {
      high:
        "radial-gradient(50% 50% at 50% 50%, rgba(37,99,235,0.55) 0%, rgba(37,99,235,0) 100%)",
      medium:
        "radial-gradient(50% 50% at 50% 50%, rgba(96,165,250,0.48) 0%, rgba(96,165,250,0) 100%)",
      low:
        "radial-gradient(50% 50% at 50% 50%, rgba(191,219,254,0.42) 0%, rgba(191,219,254,0) 100%)",
    },
    legend: [
      {
        label: "High daytime load",
        threshold: "> 12k workers",
        swatch: "linear-gradient(135deg, #2563EB, #60A5FA)",
      },
      {
        label: "Balanced mix",
        threshold: "6k – 12k workers",
        swatch: "linear-gradient(135deg, #60A5FA, #93C5FD)",
      },
      {
        label: "Support offices",
        threshold: "< 6k workers",
        swatch: "linear-gradient(135deg, #BFDBFE, #EFF6FF)",
      },
    ],
    points: [
      {
        id: "maryah-office",
        x: 49,
        y: 42,
        intensity: "high",
        size: 72,
        title: "Al Maryah financial cluster",
        density: "14.2k office workers",
        insight:
          "ADGM towers, Galleria, and Cleveland Clinic daytime population drive premium lunch demand.",
      },
      {
        id: "capital-gate-office",
        x: 64,
        y: 30,
        intensity: "medium",
        size: 58,
        title: "Capital Centre & ADNEC",
        density: "8.9k workers",
        insight:
          "Convention-focused corridor with strong weekday peaks and event surges tied to exhibitions.",
      },
      {
        id: "airport-office",
        x: 80,
        y: 56,
        intensity: "low",
        size: 46,
        title: "Airport free zone",
        density: "5.1k staff",
        insight: "Logistics and aviation tenants create early-morning and late-shift demand windows.",
      },
    ],
    dataSources: [
      "Tawtheeq commercial lease records",
      "DED licence renewals",
      "Abu Dhabi employment statistics",
    ],
    summary: "Highlight weekday peaks driven by corporate and government campuses.",
  },
  {
    id: "tourists",
    label: "Tourists",
    subtitle:
      "Short-stay visitor density reconciled from Holiday Homes permits, hotel inventory, and DCT tourism statistics (FY 2024).",
    palette: {
      high:
        "radial-gradient(50% 50% at 50% 50%, rgba(236,72,153,0.55) 0%, rgba(236,72,153,0) 100%)",
      medium:
        "radial-gradient(50% 50% at 50% 50%, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0) 100%)",
      low:
        "radial-gradient(50% 50% at 50% 50%, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0) 100%)",
    },
    legend: [
      {
        label: "Peak visitor nights",
        threshold: "> 8k beds occupied",
        swatch: "linear-gradient(135deg, #EC4899, #F97316)",
      },
      {
        label: "Stable visitor flow",
        threshold: "3k – 8k beds",
        swatch: "linear-gradient(135deg, #F97316, #FBBF24)",
      },
      {
        label: "Emerging stay zones",
        threshold: "< 3k beds",
        swatch: "linear-gradient(135deg, #FBBF24, #FEF3C7)",
      },
    ],
    points: [
      {
        id: "yas-tourism",
        x: 62,
        y: 24,
        intensity: "high",
        size: 78,
        title: "Yas Island leisure core",
        density: "9.3k nightly visitors",
        insight:
          "Theme parks, hotels, and holiday homes sustain high weekend and event-driven spikes.",
      },
      {
        id: "corniche-tourism",
        x: 34,
        y: 50,
        intensity: "medium",
        size: 60,
        title: "Corniche resorts",
        density: "5.7k nightly visitors",
        insight: "Beachfront hotels with consistent winter occupancy and family holiday homes.",
      },
      {
        id: "saadiyat-tourism",
        x: 48,
        y: 32,
        intensity: "medium",
        size: 56,
        title: "Saadiyat cultural district",
        density: "4.1k nightly visitors",
        insight:
          "Museum and resort stays yield premium spend profiles with longer average lengths of stay.",
      },
      {
        id: "city-centre-tourism",
        x: 28,
        y: 66,
        intensity: "low",
        size: 44,
        title: "City centre boutique stays",
        density: "2.4k nightly visitors",
        insight: "Holiday-home conversions supply flexible inventory serving short corporate visits.",
      },
    ],
    dataSources: [
      "Holiday Homes permits",
      "Department of Culture & Tourism hotel statistics",
      "Airport arrivals trend reports",
    ],
    summary: "Surface zones influenced by short-stay visitor spend and seasonal peaks.",
  },
];

const areaProfiles: AreaProfile[] = [
  {
    area: "Corniche",
    rating: 8.4,
    description:
      "Scenic promenade attracting residents, office workers, and beach visitors with steady year-round activity.",
    metrics: {
      residents: {
        value: "6.5k Tawtheeq households",
        note: "Clustered towers (Zones C1–C4) with >92% renewal rates.",
        source: "Tawtheeq occupancy registry, Q1 2025",
      },
      office: {
        value: "11.8k daily workers",
        note: "Government complexes and consultancy offices within a 10-minute walk.",
        source: "DED licences + employment statistics, 2024",
      },
      tourists: {
        value: "5.7k nightly visitors",
        note: "Beachfront resorts averaging 78% occupancy across winter peak.",
        source: "DCT hotel performance report, FY 2024",
      },
    },
  },
  {
    area: "Al Maryah Island",
    rating: 8.1,
    description:
      "Financial district anchored by ADGM, premium hotels, and Cleveland Clinic creating lunch and evening demand.",
    metrics: {
      residents: {
        value: "2.2k Tawtheeq households",
        note: "High-income apartments in The Galleria residences with rapid lease absorption.",
        source: "Tawtheeq occupancy registry, Q1 2025",
      },
      office: {
        value: "14.2k office workers",
        note: "Corporate HQ concentration across ADGM towers and adjacent campuses.",
        source: "Tawtheeq commercial leases & DED licence renewals, 2024",
      },
      tourists: {
        value: "3.6k nightly visitors",
        note: "Four and five-star hotels with medical tourism extensions.",
        source: "DCT tourism statistics, FY 2024",
      },
    },
  },
  {
    area: "Yas Island",
    rating: 8.7,
    description:
      "Entertainment-led destination with significant tourist inflow and growing residential catchment.",
    metrics: {
      residents: {
        value: "3.4k Tawtheeq households",
        note: "New mid-rise communities in Yas Gateway expanding permanent base.",
        source: "Tawtheeq occupancy registry, Q1 2025",
      },
      office: {
        value: "4.9k workers",
        note: "Theme-park operations and support offices concentrated around Yas South.",
        source: "Employment statistics, 2024",
      },
      tourists: {
        value: "9.3k nightly visitors",
        note: "Theme parks and hotels driving weekend and event surges (F1, concerts).",
        source: "Holiday Homes + DCT hotel statistics, FY 2024",
      },
    },
  },
];

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
            Values are normalised per square kilometre to replace legacy footfall assumptions.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationHeatMap;
