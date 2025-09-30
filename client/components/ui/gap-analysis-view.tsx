import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GapAnalysisViewProps {
  onBack: () => void;
}

const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({ onBack }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex h-full min-h-[90vh] flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/cd7db683579e5e37798772f5b1e4732900725750?width=2390"
          alt="Abu Dhabi Corniche"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6 lg:p-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to dialogue
          </button>

          <div className="max-w-md text-white">
            <div className="text-lg font-medium">Footfall insights</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold">6.3%</span>
              <svg className="h-5 w-5 fill-[#54FFD4]" viewBox="0 0 17 15">
                <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-semibold leading-relaxed">
              The Abu Dhabi Corniche presents a dynamic and lucrative environment for F&B businesses, 
              driven by a mix of residents, tourists, and a strong culture of dining out. Here is an 
              overview of the key insights for the F&B sector in this area:
            </p>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          {/* Left Side - Gap Analysis Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-[40px] lg:w-96"
          >
            {/* AI Business Header */}
            <div className="mb-6 flex items-center gap-4">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/613aa3868a1f461fc53f09303440118a5f5c5ca4?width=128"
                alt="AI Business"
                className="h-16 w-16 rounded-full border border-[#54FFD4]"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">AI Business</h2>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full bg-[#54FFD4]"
                        style={{
                          width: [6, 12, 20, 14, 9, 23, 31, 17, 5][i] || 8,
                          transform: 'rotate(-90deg)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Analysis Content */}
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium uppercase tracking-wider text-white/80">
                  GAP ANALYSIS
                </span>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Abu Dhabi Corniche
                </h3>
              </div>

              <div className="space-y-4 text-white">
                <div>
                  <h4 className="font-semibold text-white">Insights for this area:</h4>
                  <p className="mt-1 leading-relaxed text-white/90">
                    Emirati Fusion Cuisine Japanese influences new trend
                  </p>
                </div>

                <p className="leading-relaxed text-white/90">
                  Demand for a formal evening dining experience.
                </p>

                <div>
                  <p className="leading-relaxed text-white/90">Waterfront locations</p>
                  <p className="leading-relaxed text-white/90">
                    High rise luxury experience popular.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Spacer for layout */}
          <div className="flex-1" />
        </div>

        {/* Bottom Statistics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-auto rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-[40px]"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-lg font-medium text-white">INSIGHTS</span>
              <h3 className="text-2xl font-semibold text-white">Abu Dhabi Corniche</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center lg:text-left">
                <div className="text-sm text-white/80">Expats in area</div>
                <div className="text-4xl font-bold text-white lg:text-5xl">85-90%</div>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="text-sm text-white/80">Eat out weekly</div>
                <div className="text-4xl font-bold text-white lg:text-5xl">2.5x</div>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="text-sm text-white/80">% who dine out</div>
                <div className="text-4xl font-bold text-white lg:text-5xl">78%</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GapAnalysisView;
