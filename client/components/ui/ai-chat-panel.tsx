import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AIChatPanelProps {
  className?: string;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ className = '' }) => {
  const [progress, setProgress] = useState(15);
  const [isGenerating, setIsGenerating] = useState(true);

  // Simulate progress animation
  useEffect(() => {
    if (isGenerating && progress < 76) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 1, 76));
      }, 200);
      return () => clearTimeout(timer);
    } else if (progress >= 76) {
      setIsGenerating(false);
    }
  }, [progress, isGenerating]);

  // Audio waveform data for visualization
  const waveformBars = [
    { width: 5.77, height: 3.297 },
    { width: 11.952, height: 3.297 },
    { width: 19.783, height: 3.297 },
    { width: 13.189, height: 3.297 },
    { width: 8.655, height: 3.297 },
    { width: 23.081, height: 3.297 },
    { width: 30.499, height: 3.297 },
    { width: 16.898, height: 3.297 },
    { width: 4.534, height: 3.297 }
  ];

  return (
    <div className={`w-full max-w-[446px] ${className}`}>
      {/* Main Glass Container */}
      <div className="w-full h-[426px] rounded-3xl bg-white/20 backdrop-blur-xl border border-white/10 relative overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col w-full px-6 pt-4 pb-2 gap-2">
          {/* App Bar */}
          <div className="flex items-center gap-2 w-full">
            {/* AI Assistant Avatar */}
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
              alt="AI Assistant"
              className="w-16 h-16 rounded-full border border-[#54FFD4] flex-shrink-0"
            />
            
            {/* AI Business Label */}
            <div className="flex-1">
              <span className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
                AI Business
              </span>
            </div>
            
            {/* Audio Waveform Visualization */}
            <div className="flex items-center justify-center gap-[2.061px]">
              {waveformBars.map((bar, index) => (
                <motion.div
                  key={index}
                  className="bg-[#54FFD4] rounded-[15.737px] transform rotate-90"
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
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 space-y-4">
          {/* Status Text */}
          <div className="space-y-2">
            <p className="text-white font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px]">
              {isGenerating ? 'Generating application...' : 'Application ready for review'}
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full max-w-[275px] h-[19px] bg-gray-600/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#54FFD4] to-[#21FCC6] rounded-full"
                  initial={{ width: '15%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              
              <p className="text-white font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px]">
                {progress}% complete
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/18 mt-6" />

        {/* Key Considerations Section */}
        <div className="px-6 pt-6">
          <div className="space-y-4">
            <p className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
              Key considerations:
            </p>
            
            <div className="space-y-2">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 bg-[#54FFD4] rounded-full flex-shrink-0" />
                <span className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                  Legal Structure
                </span>
              </motion.div>
              
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-2 h-2 bg-[#54FFD4] rounded-full flex-shrink-0" />
                <span className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                  Business Activities
                </span>
              </motion.div>
              
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-2 h-2 bg-[#54FFD4] rounded-full flex-shrink-0" />
                <span className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                  Physical Space
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Additional Status Indicators */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-[#54FFD4] rounded-full"
                animate={{ 
                  opacity: isGenerating ? [1, 0.3, 1] : 1,
                  scale: isGenerating ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: isGenerating ? Infinity : 0,
                  ease: "easeInOut" 
                }}
              />
              <span className="text-white/70 font-['DM_Sans'] text-sm">
                {isGenerating ? 'Processing...' : 'Ready'}
              </span>
            </div>
            
            {/* Action Button */}
            {!isGenerating && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="px-4 py-2 bg-[#54FFD4]/20 hover:bg-[#54FFD4]/30 border border-[#54FFD4]/40 rounded-lg text-[#54FFD4] font-['DM_Sans'] text-sm font-medium transition-colors duration-200"
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

        {/* Overflow Menu Icon (top right) */}
        <div className="absolute top-[19px] right-6">
          <button className="w-5 h-5 text-white/50 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="19" cy="12" r="1" fill="currentColor"/>
              <circle cx="5" cy="12" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
