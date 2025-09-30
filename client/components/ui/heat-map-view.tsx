import React from "react";
import { motion } from "framer-motion";
import { chatCardClass } from "@/lib/chat-style";

interface HeatMapViewProps {
  onBack: () => void;
}

const HeatMapView: React.FC<HeatMapViewProps> = ({ onBack }) => {
  return (
    <div className="relative flex h-full min-h-[640px] flex-col overflow-hidden bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-160px] h-[380px] w-[380px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-160px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 lg:px-12 lg:py-12">
        <div className="flex flex-col gap-6">
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
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Heat map insight</span>
              <span className="text-sm text-slate-500">Last updated 2 minutes ago</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8e4df] bg-white/95 shadow-[0_32px_70px_-42px_rgba(11,64,55,0.35)] backdrop-blur-sm">
            <div className="flex flex-col gap-6 border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Abu Dhabi Business Signals</p>
                <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">Live location density view</h1>
                <p className="max-w-2xl text-sm text-slate-600">
                  Density overlays combine UAE PASS check-ins, spend velocity, and licensing data to surface the most active commercial clusters.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Corniche & Saadiyat focus
                </div>
                <div className="rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  F&B category
                </div>
              </div>
            </div>

            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8 lg:py-8">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={chatCardClass(
                    "relative overflow-hidden border border-white/50 bg-white/85 shadow-[0_28px_70px_-38px_rgba(11,64,55,0.4)]"
                  )}
                >
                  <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F766E] shadow-sm">
                    Corniche density snapshot
                  </div>

                  <div className="relative flex flex-col gap-8 px-6 pb-6 pt-16 lg:flex-row lg:items-start lg:gap-10">
                    <div className="relative flex flex-col items-center gap-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative"
                      >
                        <img
                          src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=640"
                          alt="Abu Dhabi heat map showing business density"
                          className="h-auto w-full max-w-[360px] rounded-[32px] border border-white/30 shadow-[0_22px_65px_-30px_rgba(11,64,55,0.5)]"
                        />
                        <div className="pointer-events-none absolute inset-0">
                          {[
                            { size: 88, left: "48%", top: "42%" },
                            { size: 64, left: "38%", top: "35%" },
                            { size: 76, left: "62%", top: "48%" },
                            { size: 70, left: "55%", top: "68%" },
                            { size: 60, left: "72%", top: "22%" },
                          ].map((ring, index) => (
                            <motion.div
                              key={`ring-${index}`}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.45, delay: 0.45 + index * 0.08 }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                              style={{
                                width: ring.size,
                                height: ring.size,
                                left: ring.left,
                                top: ring.top,
                                background:
                                  "radial-gradient(50% 50% at 50% 50%, rgba(14,118,110,0.45) 0%, rgba(14,118,110,0) 100%)",
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.4 }}
                        className="w-full max-w-[360px] rounded-2xl border border-[#dbe9e3] bg-white/90 p-4 text-sm text-slate-600 shadow-sm"
                      >
                        <p className="font-semibold text-slate-900">Advisor</p>
                        <p className="mt-2 text-sm leading-relaxed">
                          I have created a heat map for the top areas and existing businesses. Corniche and Saadiyat light up because of evening spend velocity. Use this to prioritise scouting with the property desk.
                        </p>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.5 }}
                      className="flex-1 space-y-5"
                    >
                      <div className="rounded-2xl border border-[#dbe9e3] bg-white/90 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Highlighted hotspots</h3>
                        <div className="mt-4 space-y-4 text-sm text-slate-600">
                          <div>
                            <p className="font-semibold text-slate-900">Corniche Waterfront</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#0F766E]">96% evening footfall</p>
                            <p className="mt-2 leading-relaxed">Sunset promenade activity and premium dining rituals keep occupancy high across the strip.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Saadiyat Cultural District</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#0F766E]">+22% weekend uplift</p>
                            <p className="mt-2 leading-relaxed">Museum traffic spills into experiential dining requests following evening programmes.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Yas Marina</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#0F766E]">4.3★ visitor satisfaction</p>
                            <p className="mt-2 leading-relaxed">Events calendar spikes waterfront lounge demand—ideal for premium activation nights.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.3 }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {[
                    {
                      title: "Group conversion",
                      value: "+18%",
                      detail: "Conversion improves when map hotspot dossiers are shared alongside the investor pack.",
                    },
                    {
                      title: "Approval readiness",
                      value: "72 hrs",
                      detail: "Average document compilation time after attaching zoning proofs for shortlisted hotspots.",
                    },
                    {
                      title: "Premium spend lift",
                      value: "+21%",
                      detail: "Corniche density correlates with higher tasting menu adoption for premium venues.",
                    },
                    {
                      title: "Reviewer focus",
                      value: "3 areas",
                      detail: "Corniche, Saadiyat, and Yas flagged for closer reviewer collaboration this month.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.title}</p>
                      <p className="mt-2 text-2xl font-semibold text-[#0F766E]">{item.value}</p>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Key insights</h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900">Marina Royal Complex</p>
                      <p className="mt-1 leading-relaxed">Highest concentration of premium venues; anchor for signature tasting events.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Corniche Eastern Strip</p>
                      <p className="mt-1 leading-relaxed">Hybrid resident-tourist mix supports AAA rental pricing with consistent footfall.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Al Khalidiya District</p>
                      <p className="mt-1 leading-relaxed">Emerging residential towers—ideal for elevated casual dining concepts.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Density legend</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-4 w-4 rounded-full bg-[#0F766E]" />
                      <span>High activity (15+ licences within 500m)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-4 w-4 rounded-full bg-[#3AA99F]" />
                      <span>Medium activity (8-14 licences)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-4 w-4 rounded-full bg-[#9AD9D0]" />
                      <span>Emerging activity (1-7 licences)</span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl border border-[#e2ede8] bg-[#f6faf8] px-4 py-3 text-xs text-slate-500">
                    <p>Data fused from DED licensing submissions, UAE PASS check-ins, and tourism spend telemetry.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Next actions</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                      Sync with property desk to request Corniche frontage availability.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                      Prepare zoning dossier export for Saadiyat cultural strip.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                      Share density summary with reviewer workspace for pre-validation.
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMapView;
