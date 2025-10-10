import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CompetitorDataProps {
  className?: string;
}

const CompetitorDataSection: React.FC<CompetitorDataProps> = ({
  className,
}) => {
  const [isGathering, setIsGathering] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showRestaurants, setShowRestaurants] = useState(false);

  useEffect(() => {
    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsGathering(false);
            setShowRestaurants(true);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, []);

  const restaurants = [
    {
      name: "Shurfa Bay",
      location: "Al Bateen, Abu Dhabi",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/3e6d5f6b9acc69a87e4bcc76536ec7140340c252?width=680",
      delay: 0,
    },
    {
      name: "Palms & Pearls",
      location: "Corniche, Abu Dhabi",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/9c0a40e0fbebae5a6bba8355f1193760feb2d391?width=472",
      delay: 0.2,
    },
    {
      name: "Villa Toscana",
      location: "The St Regis Abu Dhabi",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/df1e40725eb1f230e3df15cd8d949ee274a1c9dd?width=496",
      delay: 0.4,
    },
    {
      name: "Mezlai",
      location: "Emirates Palace, Abu Dhabi",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/e025480e23c1f85c80c429859373ca005789365a?width=536",
      delay: 0.6,
    },
  ];

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <AnimatePresence mode="wait">
        {isGathering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-[#d7e3df] bg-white/95 p-8 text-center shadow-[0_24px_60px_-38px_rgba(11,64,55,0.22)]"
          >
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-[#0E766E] to-[#14A39A] p-4">
              <svg
                className="h-8 w-8 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Gathering Competitor Data
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Analyzing top restaurants in Abu Dhabi Corniche area
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
              Querying the "Investor Compass"
            </p>

            <div className="mx-auto max-w-xs">
              <div className="mb-2 flex justify-between text-sm text-slate-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-[#0E766E] via-[#14A39A] to-[#46FFD4]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {showRestaurants && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0E766E]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0E766E] shadow-[0_12px_24px_-18px_rgba(14,118,110,0.24)]">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Analysis Complete
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0E766E]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0E766E] shadow-[0_12px_24px_-18px_rgba(14,118,110,0.32)]">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Investor Compass data implemented
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                Top 4 Restaurants in Abu Dhabi Corniche
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Based on location proximity, cuisine alignment, and market
                positioning
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.name}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: restaurant.delay,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="group relative overflow-hidden rounded-3xl shadow-[0_24px_60px_-38px_rgba(11,64,55,0.22)] transition-transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-white/10 backdrop-blur-[40px] border-t border-white/20">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/90">
                        {restaurant.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="rounded-3xl border border-[#d7e3df] bg-white/90 p-6 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.22)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    Competitive Analysis Summary
                  </h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                    These establishments represent your primary competition in
                    the Corniche area. Each offers unique positioning in
                    cuisine, price point, and customer experience that can
                    inform your differentiation strategy.
                  </p>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                    Next Steps
                  </span>
                  <ul className="space-y-1">
                    <li>• Review detailed competitor pricing analysis</li>
                    <li>• Analyze menu positioning gaps</li>
                    <li>• Schedule site visits for concept validation</li>
                  </ul>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent("openCompetitorHeatMap"))
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[#0E766E]/25 bg-white px-4 py-2 text-sm font-semibold text-[#0E766E] shadow-[0_12px_32px_-20px_rgba(14,118,110,0.28)] transition hover:bg-[#0E766E]/10"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 2C7.89543 2 7 2.89543 7 4V6H6C4.89543 6 4 6.89543 4 8V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8C20 6.89543 19.1046 6 18 6H17V4C17 2.89543 16.1046 2 15 2H9ZM15 6V4H9V6H15ZM10.5 10C11.3284 10 12 10.6716 12 11.5C12 12.3284 11.3284 13 10.5 13C9.67157 13 9 12.3284 9 11.5C9 10.6716 9.67157 10 10.5 10ZM16 12C16.8284 12 17.5 12.6716 17.5 13.5C17.5 14.3284 16.8284 15 16 15C15.1716 15 14.5 14.3284 14.5 13.5C14.5 12.6716 15.1716 12 16 12ZM7 17.5C7 15.567 8.567 14 10.5 14H12.5C14.433 14 16 15.567 16 17.5V18H7V17.5Z" />
                      </svg>
                      View Competitors Map
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent("openGapAnalysis"))
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[#0E766E]/25 bg-[#0E766E]/10 px-4 py-2 text-sm font-semibold text-[#0E766E] transition hover:bg-[#0E766E]/20"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                      View Gap Analysis
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitorDataSection;
