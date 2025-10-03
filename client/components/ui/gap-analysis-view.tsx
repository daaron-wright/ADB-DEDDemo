import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";

interface GapAnalysisViewProps {
  onBack: () => void;
}

const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({ onBack }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex h-full min-h-[640px] flex-col overflow-x-hidden overflow-y-auto bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-160px] h-[360px] w-[360px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-180px] bottom-[-200px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/12 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-[#0E766E]/8 blur-[120px]" />
      </div>

      {/* Header */}
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
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
              Gap analysis report
            </span>
            <span className="text-sm text-slate-500">
              Abu Dhabi Corniche focus
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-10 lg:px-12">
        {/* Hero Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#d8e4df] bg-white/95 shadow-[0_32px_70px_-42px_rgba(11,64,55,0.32)]"
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="relative h-full">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/cd7db683579e5e37798772f5b1e4732900725750?width=2390"
                alt="Abu Dhabi Corniche skyline"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-slate-900/50 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-4 text-white">
                  <div className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                    Footfall insights
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
                    <span className="text-3xl font-semibold">6.3%</span>
                    <svg className="h-5 w-5 fill-[#54FFD4]" viewBox="0 0 17 15">
                      <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" />
                    </svg>
                  </div>
                </div>

                <div className="max-w-xl space-y-4 text-white">
                  <h2 className="text-2xl font-semibold">Abu Dhabi Corniche</h2>
                  <p className="text-base leading-relaxed text-white/90">
                    The Abu Dhabi Corniche presents a dynamic and lucrative
                    environment for F&B businesses, driven by a mix of
                    residents, tourists, and a strong culture of dining out.
                    Here is an overview of the key insights for the F&B sector
                    in this area.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="rounded-2xl border border-[#d8e4df] bg-white/90 p-6 shadow-[0_12px_32px_-26px_rgba(11,64,55,0.3)]">
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/613aa3868a1f461fc53f09303440118a5f5c5ca4?width=128"
                    alt="AI Business"
                    className="h-16 w-16 rounded-full border border-[#0E766E]/40"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      AI Business
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#0E766E]">
                      Gap analysis
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Insights for this area
                    </h3>
                    <p className="mt-1">
                      Emirati Fusion Cuisine with Japanese influence is shaping
                      new dining trends.
                    </p>
                  </div>
                  <p>
                    Strong demand exists for formal evening dining experiences
                    with premium ambience.
                  </p>
                  <div>
                    <p>Waterfront locations are most desirable.</p>
                    <p>
                      High-rise luxury experiences remain popular with affluent
                      segments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8e4df] bg-white/90 p-6 shadow-[0_12px_32px_-26px_rgba(11,64,55,0.3)]">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0E766E]">
                  Strategic guidance
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-flex h-1.5 w-1.5 rounded-full bg-[#0E766E]" />
                    Curate premium fusion tasting menus aligned with Japanese
                    influence trends.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-flex h-1.5 w-1.5 rounded-full bg-[#0E766E]" />
                    Prioritize venues offering skyline or waterfront views for
                    evening service.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 inline-flex h-1.5 w-1.5 rounded-full bg-[#0E766E]" />
                    Elevate guest journey with concierge-style reservations and
                    private dining.
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("openRetailLocations"))
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#0E766E]/25 bg-[#0E766E]/10 px-4 py-2 text-sm font-semibold text-[#0E766E] transition hover:bg-[#0E766E]/20"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                  Here are some retail locations available to rent
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom insight bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.24)]"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                Insights
              </span>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                Abu Dhabi Corniche metrics
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Corniche audiences blend affluent residents, luxury hotel
                guests, and experience-driven tourists, supporting elevated
                price points with high revisit frequency.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d8e4df] bg-slate-50/80 p-4 text-center sm:text-left">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Expats in area
                </div>
                <div className="mt-2 text-3xl font-bold text-[#0E766E]">
                  85-90%
                </div>
              </div>
              <div className="rounded-2xl border border-[#d8e4df] bg-slate-50/80 p-4 text-center sm:text-left">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Eat out weekly
                </div>
                <div className="mt-2 text-3xl font-bold text-[#0E766E]">
                  2.5x
                </div>
              </div>
              <div className="rounded-2xl border border-[#d8e4df] bg-slate-50/80 p-4 text-center sm:text-left">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  % who dine out
                </div>
                <div className="mt-2 text-3xl font-bold text-[#0E766E]">
                  78%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GapAnalysisView;
