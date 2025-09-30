import React from "react";
import { motion } from "framer-motion";

interface HeatMapViewProps {
  onBack: () => void;
}

const HeatMapView: React.FC<HeatMapViewProps> = ({ onBack }) => {
  return (
    <div className="relative flex h-full min-h-[640px] flex-col overflow-x-hidden overflow-y-auto bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-160px] h-[380px] w-[380px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-160px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 lg:px-12">
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
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Abu Dhabi Business Signals</span>
            <span className="text-sm text-slate-500">Live location density view</span>
          </div>
        </div>
      </div>

      {/* Main Map Container - Now Predominant */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-6 pb-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#d8e4df] bg-gradient-to-br from-[#616161] to-[#4a4a4a] shadow-[0_32px_70px_-42px_rgba(11,64,55,0.35)]"
          style={{ aspectRatio: "800/556" }}
        >
          {/* Map Background */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/df351a3a49f1c6b9b74765965e6ddb3ecf6799d7?width=1600"
            alt="Abu Dhabi heat map"
            className="absolute inset-0 h-full w-full object-cover rounded-3xl"
          />

          {/* Heat Map Overlays */}
          <div className="absolute inset-0">
            {/* Large Red Circle - Center */}
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

            {/* Medium Red Circle - Left */}
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

            {/* Orange Circle - Upper Right */}
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

            {/* Orange Circle - Lower Center */}
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

            {/* Large Orange Circle - Right */}
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

            {/* Yellow Circle - Top Right */}
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

          {/* Data Overlay Cards */}
          <div className="absolute inset-0">
            {/* Top Right Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="absolute"
              style={{
                top: "7%",
                right: "8%",
                width: "clamp(120px, 16%, 160px)",
              }}
            >
              <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 p-3 text-white">
                <div className="text-center">
                  <div className="text-xs font-semibold leading-tight">Average visitors</div>
                  <div className="text-xs font-bold">200-300</div>
                </div>
              </div>
            </motion.div>

            {/* Middle Right Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="absolute"
              style={{
                top: "35%",
                right: "5%",
                width: "clamp(120px, 16%, 160px)",
              }}
            >
              <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 p-3 text-white">
                <div className="text-center">
                  <div className="text-xs font-semibold leading-tight">Average visitors</div>
                  <div className="text-xs font-bold">450-700</div>
                </div>
              </div>
            </motion.div>

            {/* Lower Center Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute"
              style={{
                bottom: "25%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "clamp(120px, 16%, 160px)",
              }}
            >
              <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 p-3 text-white">
                <div className="text-center">
                  <div className="text-xs font-semibold leading-tight">Average visitors</div>
                  <div className="text-xs font-bold">900-1500</div>
                </div>
              </div>
            </motion.div>

            {/* Left Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="absolute"
              style={{
                top: "36%",
                left: "7%",
                width: "clamp(120px, 16%, 160px)",
              }}
            >
              <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 p-3 text-white">
                <div className="text-center">
                  <div className="text-xs font-semibold leading-tight">Average visitors</div>
                  <div className="text-xs font-bold">1800-2500</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Statistics Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute bottom-0 left-0 right-0 mx-4 mb-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 p-4 md:p-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-white md:text-lg">The Corniche</h3>
                <p className="text-xs text-white/90">Average weekly footfall</p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-white">
                <div className="flex flex-col">
                  <span className="text-xs text-white/90">Khalifa City</span>
                  <span className="text-lg font-bold md:text-2xl">25-35K</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-white/90">Abu Dhabi Marina</span>
                  <span className="text-lg font-bold md:text-2xl">40-55K</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-white/90">Baniyas</span>
                  <span className="text-lg font-bold md:text-2xl">60-75K</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-white/90">Corniche</span>
                  <span className="text-lg font-bold md:text-2xl">100K+</span>
                </div>
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
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Key Insights</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Marina Royal Complex</p>
                <p className="mt-1 leading-relaxed">Highest concentration of premium venues with consistent evening footfall.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Corniche Eastern Strip</p>
                <p className="mt-1 leading-relaxed">Hybrid resident-tourist mix supports premium pricing with reliable traffic.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Density Legend</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-4 w-4 rounded-full bg-red-500" />
                <span>High activity (15+ venues)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-4 w-4 rounded-full bg-orange-500" />
                <span>Medium activity (8-14 venues)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-4 w-4 rounded-full bg-yellow-400" />
                <span>Emerging activity (1-7 venues)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.25)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Next Actions</h3>
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
