import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";

interface HeatMapViewProps {
  onBack: () => void;
}

const HeatMapView: React.FC<HeatMapViewProps> = ({ onBack }) => {
  return (
    <div className="relative h-full min-h-[460px] flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          <span className="text-sm font-medium">Back to Chat</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Business Location Analysis</h1>
        <div className="w-20" />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 p-4">
        {/* User Question Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-4 right-16 z-10"
        >
          <div className={chatCardClass(
            "max-w-[268px] p-3 bg-gray-800/70 backdrop-blur-sm text-white text-sm leading-relaxed",
            "rounded-xl"
          )}>
            Where are existing establishments located for specific activities (on a heat map)?
          </div>
        </motion.div>

        {/* AI Response Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute top-24 left-4 z-10"
        >
          <div className={chatCardClass(
            "max-w-[285px] p-3 bg-white/80 backdrop-blur-sm text-black text-base font-medium leading-relaxed border border-white/40",
            "rounded-xl"
          )}>
            I have created a heat map for the top areas and existing businesses
          </div>
        </motion.div>

        {/* Heat Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="absolute left-4 top-40 z-20"
        >
          <div className="relative">
            {/* Main Heat Map Image */}
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386"
              alt="Abu Dhabi heat map showing business density"
              className="w-[193px] h-[187px] rounded-3xl shadow-lg border border-white/20"
            />

            {/* Heat Map Overlay Circles */}
            <div className="absolute inset-0">
              {/* Red circles for high density areas */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="absolute w-[60px] h-[60px] rounded-full"
                style={{
                  left: '69px',
                  top: '60px',
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.40) 0%, rgba(255, 0, 0, 0.00) 100%)'
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="absolute w-[44px] h-[44px] rounded-full"
                style={{
                  left: '41px',
                  top: '72px',
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.40) 0%, rgba(255, 0, 0, 0.00) 100%)'
                }}
              />

              {/* Orange circles for medium density */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute w-[55px] h-[55px] rounded-full"
                style={{
                  left: '26px',
                  top: '39px',
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.40) 0%, rgba(255, 178, 0, 0.00) 100%)'
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="absolute w-[55px] h-[55px] rounded-full"
                style={{
                  left: '69px',
                  top: '116px',
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.40) 0%, rgba(255, 178, 0, 0.00) 100%)'
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="absolute w-[65px] h-[65px] rounded-full"
                style={{
                  left: '115px',
                  top: '38px',
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.40) 0%, rgba(255, 178, 0, 0.00) 100%)'
                }}
              />

              {/* Yellow circle for lower density */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="absolute w-[55px] h-[55px] rounded-full"
                style={{
                  left: '110px',
                  top: '-3px',
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(251, 255, 0, 0.40) 0%, rgba(246, 255, 0, 0.00) 100%)'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* User Follow-up Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="absolute bottom-8 right-16 z-10"
        >
          <div className={chatCardClass(
            "max-w-[268px] p-3 bg-gray-800/70 backdrop-blur-sm text-white text-sm leading-relaxed",
            "rounded-xl"
          )}>
            Interesting looking at this in a map
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Density</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500/60"></div>
              <span className="text-xs text-gray-700">High density (15+ businesses)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500/60"></div>
              <span className="text-xs text-gray-700">Medium density (8-14 businesses)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-400/60"></div>
              <span className="text-xs text-gray-700">Low density (1-7 businesses)</span>
            </div>
          </div>
        </motion.div>

        {/* Insights Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 2.0 }}
          className="absolute right-4 top-48 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40 max-w-[280px]"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Insights</h3>
          <div className="space-y-3 text-xs text-gray-700">
            <div>
              <div className="font-medium text-gray-900">Marina Royal Complex</div>
              <div>Highest business concentration with premium positioning</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Corniche Area</div>
              <div>Prime waterfront location with tourist footfall</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Al Khalidiya District</div>
              <div>Growing residential area with development potential</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeatMapView;
