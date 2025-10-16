import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompetitorDataSection from "@/components/ui/competitor-data";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";

interface ComprehensiveReportProps {
  className?: string;
}

const VisitorTasteTrendsChart: React.FC = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const chartData = [
    {
      label: "Tourists lean toward Emirati + Asian",
      value: 25,
      color: "#E29F37",
    },
    {
      label: "Locals prefer Emirati + Mediterranean",
      value: 45,
      color: "#429195",
    },
    { label: "Expats like Emirati + Indian", value: 18, color: "#A02E1F" },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Visitor Taste Trends
          </h3>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400">
            <span className="text-xs text-white">?</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs shadow-sm">
          <svg
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.7594 11.176H2.94824V8.36481M8.00833 3.30472H10.8195V6.11588"
              stroke="#888888"
              strokeWidth="0.843348"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500">Total survey this month</div>
        <div className="text-2xl font-bold text-gray-900">1230</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5">
            <svg
              width="8"
              height="8"
              viewBox="0 0 9 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.86888 3.02015V7.58232H4.11923V3.02015L2.10869 5.03068L1.57861 4.50061L4.49406 1.58517L7.40945 4.50061L6.87938 5.03068L4.86888 3.02015Z"
                fill="#434343"
              />
            </svg>
            <span className="text-xs font-medium text-gray-700">12%</span>
          </div>
          <span>vs last month</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex justify-between">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="h-32 w-px bg-gray-100" />
          ))}
        </div>

        <div className="relative space-y-4 py-4">
          {chartData.map((item, index) => (
            <div key={item.label} className="relative">
              <div className="mb-1 text-xs text-gray-500">{item.label}</div>
              <div className="relative h-5 rounded bg-gray-100">
                <motion.div
                  className="h-full rounded"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={animate ? { width: `${item.value}%` } : { width: 0 }}
                  transition={{ duration: 1.5, delay: index * 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%</span>
          <span>40%</span>
          <span>50%</span>
        </div>
      </div>
    </div>
  );
};

const CuisinePopularityCard: React.FC = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const cuisines = [
    {
      name: "Middle Eastern",
      popularity: "30-35%",
      context:
        "Cultural resonance and strong appeal with both residents and regional tourists",
    },
    {
      name: "American",
      popularity: "20-25%",
      context:
        "International familiarity and presence of quick-service dining footprints",
    },
    {
      name: "Indian",
      popularity: "15-20%",
      context: "Large expat communities with high frequency dining preferences",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={
        showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
      }
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-[#d7e3df] bg-white/95 p-6 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.22)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
            Polaris summary
          </span>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Popularity of cuisines in Abu Dhabi
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Demand clustering across the Corniche showcases which cuisine
            profiles are primed for a differentiated launch.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#d7e3df] bg-slate-50/80 px-4 py-3">
          <AIBusinessOrb className="h-12 w-12" />
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Polaris
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Insight engine
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#d7e3df] bg-white/98">
        <div className="grid grid-cols-[1.1fr,0.9fr,1.4fr] gap-4 bg-[#f3f7f5] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          <span>Cuisine</span>
          <span>Popularity</span>
          <span>Supporting context</span>
        </div>
        {cuisines.map((cuisine, index) => (
          <motion.div
            key={cuisine.name}
            initial={{ opacity: 0, y: 12 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.35 + index * 0.18 }}
            className={`grid grid-cols-[1.1fr,0.9fr,1.4fr] gap-4 px-6 py-4 text-sm leading-relaxed text-slate-600 ${
              index > 0 ? "border-t border-[#e4ede9]" : ""
            }`}
          >
            <div className="text-base font-semibold text-slate-900">
              {cuisine.name}
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {cuisine.popularity}
            </div>
            <div>{cuisine.context}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const DemographicsHighlight: React.FC = () => {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={showStats ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
      className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center shadow-lg"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={showStats ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="text-8xl font-bold text-gray-900"
      >
        78%
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={showStats ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-4 text-sm text-gray-600"
      >
        Residents eat out twice a week
      </motion.div>
    </motion.div>
  );
};

const ComprehensiveReport: React.FC<ComprehensiveReportProps> = ({
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompetitorData, setShowCompetitorData] = useState(false);

  useEffect(() => {
    const steps = [
      { delay: 0 },
      { delay: 2000 },
      { delay: 4000 },
      { delay: 6000 },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => setCurrentStep(index + 1), step.delay);
    });
  }, []);

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-[#0E766E]/20 bg-[#0E766E]/5 p-6"
      >
        <h2 className="text-lg font-semibold text-[#0E766E]">
          Comprehensive Market Analysis
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Synthesizing location data, demographic patterns, budget requirements,
          and taste preferences
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-[#0E766E]"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(currentStep * 25, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.min(currentStep * 25, 100)}%
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {currentStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VisitorTasteTrendsChart />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CuisinePopularityCard />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <DemographicsHighlight />
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Key Insights Summary
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="font-medium text-gray-900">
                    Prime Location
                  </div>
                  <div>
                    Corniche waterfront offers premium positioning for high-end
                    dining
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="font-medium text-gray-900">
                    Investment Range
                  </div>
                  <div>Boutique concepts: AED 780K - 1.48M</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="font-medium text-gray-900">Target Market</div>
                  <div>
                    Locals prefer Middle Eastern + Mediterranean cuisines
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStep >= 4 && (
          <motion.button
            type="button"
            onClick={() => setShowCompetitorData(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="group w-full rounded-3xl border border-[#0E766E]/25 bg-white px-6 py-6 text-left shadow-[0_24px_60px_-38px_rgba(11,64,55,0.28)] transition-transform hover:-translate-y-0.5 hover:border-[#0E766E]/35 hover:shadow-[0_30px_70px_-36px_rgba(14,118,110,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E766E]/40 focus-visible:ring-offset-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0E766E]/25 bg-[#0E766E]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
              <span className="h-2 w-2 rounded-full bg-[#0E766E]" />
              Analysis Complete
            </span>
            <span className="mt-3 block text-base font-semibold text-slate-900">
              Want to know the top competitors in the area?
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-slate-600">
              Here are the top 4 restaurants in Abu Dhabi Corniche.
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompetitorData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <CompetitorDataSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComprehensiveReport;
