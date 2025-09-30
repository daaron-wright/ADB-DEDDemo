import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import BudgetRanges from "@/components/ui/budget-ranges";

interface BudgetRangesViewProps {
  onBack: () => void;
}

type ConceptKey = "boutique" | "flagship";

type BudgetBand = {
  area: string;
  totalRange: string;
  licensing: string;
  fitOut: string;
  staffing: string;
  marketing: string;
  timeframe: string;
  insight: string;
  desirabilityIndex: number;
};

const conceptMeta: Record<ConceptKey, { label: string; description: string }> = {
  boutique: {
    label: "Boutique concept",
    description: "1,800 – 2,400 sq ft, 70 – 90 covers",
  },
  flagship: {
    label: "Flagship dining",
    description: "3,200 – 4,800 sq ft, 120 – 160 covers",
  },
};

const conceptBudgets: Record<ConceptKey, BudgetBand[]> = {
  boutique: [
    {
      area: "Corniche Waterfront",
      totalRange: "AED 950K – 1.35M",
      licensing: "AED 18K – 28K",
      fitOut: "AED 420K – 560K",
      staffing: "AED 150K – 185K",
      marketing: "AED 65K – 90K",
      timeframe: "16 – 20 weeks",
      insight: "Scenic strip with premium leisure visitors seeking sunset dining.",
      desirabilityIndex: 88,
    },
    {
      area: "Al Maryah Island",
      totalRange: "AED 1.05M – 1.48M",
      licensing: "AED 22K – 30K",
      fitOut: "AED 470K – 620K",
      staffing: "AED 165K – 210K",
      marketing: "AED 75K – 95K",
      timeframe: "18 – 22 weeks",
      insight: "Financial district lunch and executive dining with corporate events.",
      desirabilityIndex: 84,
    },
    {
      area: "Al Reem Island",
      totalRange: "AED 780K – 1.12M",
      licensing: "AED 16K – 24K",
      fitOut: "AED 360K – 480K",
      staffing: "AED 130K – 170K",
      marketing: "AED 55K – 75K",
      timeframe: "14 – 18 weeks",
      insight: "High-density residential demand with strong evening family trade.",
      desirabilityIndex: 79,
    },
    {
      area: "Yas Island",
      totalRange: "AED 860K – 1.26M",
      licensing: "AED 18K – 26K",
      fitOut: "AED 410K – 540K",
      staffing: "AED 140K – 180K",
      marketing: "AED 60K – 85K",
      timeframe: "18 – 22 weeks",
      insight: "Tourist-driven mix with race-day and concert spikes in demand.",
      desirabilityIndex: 82,
    },
  ],
  flagship: [
    {
      area: "Corniche Waterfront",
      totalRange: "AED 1.65M – 2.25M",
      licensing: "AED 24K – 34K",
      fitOut: "AED 720K – 930K",
      staffing: "AED 260K – 310K",
      marketing: "AED 110K – 150K",
      timeframe: "24 – 30 weeks",
      insight: "Iconic promenade suited to destination fine dining concepts.",
      desirabilityIndex: 92,
    },
    {
      area: "Al Maryah Island",
      totalRange: "AED 1.8M – 2.4M",
      licensing: "AED 26K – 36K",
      fitOut: "AED 760K – 970K",
      staffing: "AED 280K – 340K",
      marketing: "AED 125K – 165K",
      timeframe: "26 – 32 weeks",
      insight: "Luxury hotels and business towers with weekday corporate spend.",
      desirabilityIndex: 90,
    },
    {
      area: "Saadiyat Island",
      totalRange: "AED 1.55M – 2.1M",
      licensing: "AED 22K – 32K",
      fitOut: "AED 680K – 860K",
      staffing: "AED 240K – 300K",
      marketing: "AED 105K – 140K",
      timeframe: "22 – 28 weeks",
      insight: "Cultural district attracting art patrons and resort guests.",
      desirabilityIndex: 86,
    },
    {
      area: "Yas Island",
      totalRange: "AED 1.7M – 2.3M",
      licensing: "AED 24K – 34K",
      fitOut: "AED 700K – 900K",
      staffing: "AED 250K – 320K",
      marketing: "AED 110K – 150K",
      timeframe: "24 – 30 weeks",
      insight: "Mega events and theme park traffic sustain premium visitor flow.",
      desirabilityIndex: 89,
    },
  ],
};

const BudgetRangesView: React.FC<BudgetRangesViewProps> = ({ onBack }) => {
  const [concept, setConcept] = useState<ConceptKey>("boutique");

  const bands = useMemo(() => conceptBudgets[concept], [concept]);

  const averageLicensingRange = useMemo(() => {
    const amounts = bands.map((band) => band.licensing.match(/\d+/g)?.map(Number) ?? []);
    const flattened = amounts.flat();
    if (flattened.length === 0) return "AED 0";
    const min = Math.min(...flattened);
    const max = Math.max(...flattened);
    return `AED ${min.toLocaleString()} – AED ${max.toLocaleString()}`;
  }, [bands]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-160px] h-[360px] w-[360px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-160px] bottom-[-200px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/12 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#0E766E]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm transition hover:bg-[#eff6f3] hover:text-[#0a5a55]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to dialogue
          </button>
          <BudgetRanges className="pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 pb-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="grid gap-6 rounded-3xl border border-[#dae5e1] bg-white/90 p-6 shadow-[0_32px_70px_-42px_rgba(11,64,55,0.25)] lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Investment focus by dining concept</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                    Compare licensing, fit-out, and operating budgets across Abu Dhabi's top-performing dining districts.
                    Adjust the concept profile to align with your restaurant footprint and seating ambition.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#0E766E]/15 bg-[#0E766E]/8 px-4 py-3 text-sm font-semibold text-[#0E766E] shadow-[0_12px_26px_-20px_rgba(14,118,110,0.52)]">
                  Avg. licensing envelope: <span className="ml-1 font-bold">{averageLicensingRange}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(conceptMeta) as ConceptKey[]).map((key) => {
                  const active = concept === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setConcept(key)}
                      className={"group inline-flex flex-col rounded-2xl border px-5 py-4 text-left shadow-sm transition" + (active
                        ? " border-[#0E766E] bg-[#0E766E]/10 text-[#0E766E] shadow-[0_16px_32px_-28px_rgba(14,118,110,0.6)]"
                        : " border-[#d7e3df] bg-white text-slate-600 hover:border-[#0E766E]/40 hover:text-[#0E766E]")}
                    >
                      <span className="text-sm font-semibold">{conceptMeta[key].label}</span>
                      <span className="mt-1 text-xs text-slate-500">{conceptMeta[key].description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#d7e3df] bg-slate-50/80 p-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">Timeline guidance</span>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Concepts move from licensing to soft opening in <span className="font-semibold text-slate-900">{concept === "boutique" ? "16-22 weeks" : "22-32 weeks"}</span>.
                  Fast-track options exist for shell-and-core venues and fit-out partners pre-approved by DCT.
                </p>
              </div>
              <div className="rounded-2xl bg-white/95 p-4 shadow-inner">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Capital intensity</span>
                  <span>{concept === "boutique" ? "AED 780K – 1.48M" : "AED 1.55M – 2.4M"}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#0E766E] via-[#14A39A] to-[#63D3C6]"
                    style={{ width: concept === "boutique" ? "52%" : "82%" }}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Gauge the overall capital required for launch, factoring in deposits, brand development, and contingency.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid gap-5 md:grid-cols-2"
          >
            {bands.map((band) => (
              <div
                key={`${concept}-${band.area}`}
                className="flex h-full flex-col justify-between rounded-3xl border border-[#d7e3df] bg-white/95 p-6 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.22)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{band.area}</h2>
                    <p className="text-xs tracking-[0.22em] uppercase text-[#0E766E]/80">{conceptMeta[concept].label}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] uppercase tracking-[0.26em] text-slate-400">Total investment</span>
                    <span className="text-base font-semibold text-[#0E766E]">{band.totalRange}</span>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <dt className="font-semibold text-slate-900">Licensing & permits</dt>
                    <dd>{band.licensing}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Fit-out & FF&E</dt>
                    <dd>{band.fitOut}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Pre-opening staffing</dt>
                    <dd>{band.staffing}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Launch marketing</dt>
                    <dd>{band.marketing}</dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Opening timeframe</span>
                    <span className="font-semibold text-slate-700">{band.timeframe}</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">{band.insight}</p>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Desirability index</span>
                    <span className="font-semibold text-[#0E766E]">{band.desirabilityIndex}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#0E766E] via-[#14A39A] to-[#63D3C6]"
                      style={{ width: `${band.desirabilityIndex}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-[#d7e3df] bg-white/90 p-6 text-sm text-slate-600 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.22)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl space-y-2">
                <h3 className="text-base font-semibold text-slate-900">Next steps to secure your preferred zone</h3>
                <p>
                  Engage with the property desk for shell-and-core availability, then align with Abu Dhabi Department of
                  Economic Development (ADDED) on licensing class. Our concierge can prepare tailored pro-forma budgets and
                  connect you with fit-out partners experienced in {concept === "boutique" ? "intimate dining concepts." : "flagship culinary destinations."}
                </p>
              </div>
              <div className="flex flex-col gap-3 text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-[0.24em] text-[#0E766E]">Support actions</span>
                <ul className="space-y-1">
                  <li>• Schedule cost workshop with AI Business concierge</li>
                  <li>• Receive landlord shortlist with rent benchmarks</li>
                  <li>• Request financing deck tailored to chosen concept</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetRangesView;
