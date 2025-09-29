import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AIChatPanelProps {
  className?: string;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ className = "" }) => {
  const [progress, setProgress] = useState(15);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (isGenerating && progress < 76) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + 1, 76));
      }, 200);
      return () => clearTimeout(timer);
    }

    if (progress >= 76) {
      setIsGenerating(false);
    }
  }, [progress, isGenerating]);

  const waveformBars = [
    { width: 5.77, height: 3.297 },
    { width: 11.952, height: 3.297 },
    { width: 19.783, height: 3.297 },
    { width: 13.189, height: 3.297 },
    { width: 8.655, height: 3.297 },
    { width: 23.081, height: 3.297 },
    { width: 30.499, height: 3.297 },
    { width: 16.898, height: 3.297 },
    { width: 4.534, height: 3.297 },
  ];

  return (
    <div className={`w-full max-w-[446px] ${className}`}>
      <div className="relative h-[426px] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/80 backdrop-blur-2xl shadow-[0_28px_60px_-34px_rgba(15,23,42,0.45)]">
        <div className="flex w-full flex-col gap-2 px-6 pt-4 pb-2">
          <div className="flex w-full items-center gap-3">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
              alt="AI Assistant"
              className="h-16 w-16 flex-shrink-0 rounded-full border border-[#54FFD4]"
            />
            <div className="flex-1">
              <span className="font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px] text-slate-900">
                AI Business
              </span>
            </div>
            <div className="flex items-center justify-center gap-[2.061px]">
              {waveformBars.map((bar, index) => (
                <motion.div
                  key={index}
                  className="rounded-[15.737px] bg-[#54FFD4]"
                  style={{
                    width: `${bar.height}px`,
                    height: `${bar.width}px`,
                  }}
                  animate={{
                    scaleY: [1, 1.5, 0.8, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6">
          <div className="space-y-2">
            <p className="font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px] text-slate-700">
              {isGenerating
                ? "Generating application..."
                : "Application ready for review"}
            </p>
            <div className="space-y-2">
              <div className="h-[19px] w-full max-w-[275px] overflow-hidden rounded-full border border-white/70 bg-white/70 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#54FFD4] to-[#21FCC6]"
                  initial={{ width: "15%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px] text-slate-600">
                {progress}% complete
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-white/70" />

        <div className="px-6 pt-6">
          <div className="space-y-4">
            <p className="font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px] text-slate-900">
              Key considerations:
            </p>
            <div className="space-y-2">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-[#54FFD4]" />
                <span className="font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px] text-slate-700">
                  Legal Structure
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-[#54FFD4]" />
                <span className="font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px] text-slate-700">
                  Business Activities
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-[#54FFD4]" />
                <span className="font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px] text-slate-700">
                  Physical Space
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-6 bottom-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-[#54FFD4]"
                animate={{
                  opacity: isGenerating ? [1, 0.3, 1] : 1,
                  scale: isGenerating ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isGenerating ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
              <span className="font-['DM_Sans'] text-sm text-slate-500">
                {isGenerating ? "Processing..." : "Ready"}
              </span>
            </div>

            {!isGenerating && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-lg border border-[#54FFD4]/40 bg-[#54FFD4]/15 px-4 py-2 font-['DM_Sans'] text-sm font-medium text-[#0c8f8a] transition-colors duration-200 hover:bg-[#54FFD4]/25"
                onClick={() => {
                  setProgress(15);
                  setIsGenerating(true);
                }}
              >
                Regenerate
              </motion.button>
            )}
          </div>
        </div>

        <div className="absolute right-6 top-[19px]">
          <button className="h-5 w-5 text-slate-400 transition-colors hover:text-slate-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="19" cy="12" r="1" fill="currentColor" />
              <circle cx="5" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
