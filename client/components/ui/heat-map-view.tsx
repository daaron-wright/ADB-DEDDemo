import React from "react";
import { motion } from "framer-motion";
import {
  areaProfiles,
  densityLayers,
  DensityLayerId,
} from "@/components/ui/location-density-data";

type HeatMapViewProps = {
  onBack: () => void;
};

type MetricOverlayCard = {
  id: DensityLayerId;
  title: string;
  value: string;
  note: string;
  source: string;
  style: React.CSSProperties;
};

type SourceOverlayCard = {
  id: "sources";
  title: string;
  lines: string[];
  style: React.CSSProperties;
};

const categoryOrder: DensityLayerId[] = ["residents", "office", "tourists"];

const layerMap: Record<DensityLayerId, (typeof densityLayers)[number]> = densityLayers.reduce(
  (acc, layer) => {
    acc[layer.id] = layer;
    return acc;
  },
  {} as Record<DensityLayerId, (typeof densityLayers)[number]>,
);

const HeatMapView: React.FC<HeatMapViewProps> = ({ onBack }) => {
  const focusArea =
    areaProfiles.find((profile) => profile.area === "Corniche") ?? areaProfiles[0]!;

  const overlayCards: MetricOverlayCard[] = focusArea
    ? [
        {
          id: "residents",
          title: "Residents",
          value: focusArea.metrics.residents.value,
          note: focusArea.metrics.residents.note,
          source: focusArea.metrics.residents.source,
          style: {
            top: "7%",
            right: "8%",
            width: "clamp(160px, 18%, 220px)",
          },
        },
        {
          id: "office",
          title: "Office workers",
          value: focusArea.metrics.office.value,
          note: focusArea.metrics.office.note,
          source: focusArea.metrics.office.source,
          style: {
            top: "35%",
            right: "5%",
            width: "clamp(160px, 18%, 220px)",
          },
        },
        {
          id: "tourists",
          title: "Tourists",
          value: focusArea.metrics.tourists.value,
          note: focusArea.metrics.tourists.note,
          source: focusArea.metrics.tourists.source,
          style: {
            bottom: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(160px, 18%, 220px)",
          },
        },
      ]
    : [];

  const dataSourceCard: SourceOverlayCard = {
    id: "sources",
    title: "Data sources",
    lines: [
      "Tawtheeq residential & commercial contracts",
      "DED licence registry and labour submissions",
      "Holiday Homes permits & DCT tourism statistics",
    ],
    style: {
      top: "36%",
      left: "7%",
      width: "clamp(180px, 20%, 240px)",
    },
  };

  const keyInsights = [
    {
      title: "Corniche waterfront towers",
      description:
        "6.5k Tawtheeq households sustain >92% occupancy, keeping resident-led demand constant across the week.",
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
  ];

  return (
    <div className="relative flex h-full min-h-[640px] flex-col overflow-x-hidden overflow-y-auto bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-160px] h-[380px] w-[380px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-160px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 lg:px-12">
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
            <span className="text-sm text-slate-500">Live location density view</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-6 pb-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#d8e4df] bg-gradient-to-br from-[#616161] to-[#4a4a4a] shadow-[0_32px_70px_-42px_rgba(11,64,55,0.35)]"
          style={{ aspectRatio: "800/556" }}
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
                <circle cx="106" cy="106" r="105" fill="url(#redGradient1)" />
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
                <circle cx="95" cy="95" r="94" fill="url(#redGradient2)" />
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
                <circle cx="88" cy="88" r="88" fill="url(#orangeGradient1)" />
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
                <circle cx="88" cy="88" r="88" fill="url(#orangeGradient2)" />
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
                <circle cx="124" cy="124" r="124" fill="url(#orangeGradient3)" />
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
                <circle cx="101" cy="75" r="101" fill="url(#yellowGradient)" />
                <defs>
                  <radialGradient id="yellowGradient" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
                    <stop stopColor="#FBFF00" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#F7FF00" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

          <div className="absolute inset-0">
            {[...overlayCards, dataSourceCard].map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="absolute"
                style={card.style}
              >
                <div className="rounded-xl border border-white/20 bg-black/25 p-3 text-white backdrop-blur">
                  {card.id === "sources" ? (
                    <div className="space-y-2 text-left">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                        {card.title}
                      </div>
                      <ul className="space-y-1 text-[11px] leading-snug text-white/80">
                        {card.lines.map((line) => (
                          <li key={line}>• {line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-left">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                        {card.title}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">{card.value}</div>
                      {card.note ? (
                        <p className="mt-1 text-[11px] text-white/80 leading-snug">{card.note}</p>
                      ) : null}
                      {card.source ? (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          {card.source}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute bottom-0 left-0 right-0 mx-4 mb-4 rounded-xl border border-white/20 bg-black/25 p-4 text-white backdrop-blur"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-white md:text-lg">{focusArea.area}</h3>
                <p className="text-xs text-white/85">
                  Cross-validated demand mix from Tawtheeq occupancy, DED employment filings, and tourism statistics.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {categoryOrder.map((categoryId) => {
                  const metric = focusArea.metrics[categoryId];
                  const layer = layerMap[categoryId];
                  return (
                    <div key={categoryId} className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/80">
                        {layer.label}
                      </span>
                      <span className="text-lg font-bold md:text-2xl">{metric.value}</span>
                      <span className="text-[11px] text-white/80 leading-snug">{metric.note}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                        {metric.source}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="grid gap-4 lg:grid-cols-3"
        >
          <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
              Key Insights
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {keyInsights.map((insight) => (
                <div key={insight.title}>
                  <p className="font-semibold text-slate-900">{insight.title}</p>
                  <p className="mt-1 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
              Density Legend
            </h3>
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
                          <span
                            className="inline-flex h-3 w-3 rounded-full"
                            style={{ backgroundImage: item.swatch }}
                          />
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
          </div>

          <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
              Next Actions
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                Sync with property desk for Corniche frontage availability.
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                Prepare zoning dossier for Saadiyat cultural strip.
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                Share density summary with reviewer workspace.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeatMapView;
