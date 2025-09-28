import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyMapModal } from './property-map-modal';
import { ReportSummaryPage } from './report-summary-page';

interface GapAnalysisViewProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const SoundVisualization = () => {
  const bars = [
    { height: '4px' },
    { height: '8px' },
    { height: '16px' },
    { height: '10px' },
    { height: '6px' },
    { height: '18px' },
    { height: '24px' },
    { height: '14px' },
    { height: '3px' },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-0.5 bg-[#54FFD4] rounded-full transition-all duration-300"
          style={{ height: bar.height }}
        />
      ))}
    </div>
  );
};

const FootfallInsight = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCount(prev => {
          if (prev >= 6.3) {
            clearInterval(interval);
            return 6.3;
          }
          return prev + 0.1;
        });
      }, 50);
      return () => clearInterval(interval);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="absolute left-20 top-96"
    >
      <div className="text-white text-lg font-medium mb-2">
        Footfall insights
      </div>
      <div className="flex items-center gap-2">
        <div className="text-white text-5xl font-bold">
          {count.toFixed(1)}%
        </div>
        <svg width="19" height="19" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#54FFD4"/>
        </svg>
      </div>
    </motion.div>
  );
};

const StatisticsBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="absolute bottom-20 left-20 right-20"
    >
      <div className="bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-lg mb-1">INSIGHTS</div>
            <div className="text-white text-2xl font-bold">Abu Dhabi Corniche</div>
          </div>
          
          <div className="flex gap-12">
            <div className="text-center">
              <div className="text-white/70 text-lg mb-1">Expats in area</div>
              <div className="text-white text-5xl font-bold">85-90%</div>
            </div>
            
            <div className="text-center">
              <div className="text-white/70 text-lg mb-1">Eat out weekly</div>
              <div className="text-white text-5xl font-bold">2.5x</div>
            </div>
            
            <div className="text-center">
              <div className="text-white/70 text-lg mb-1">% who dine out</div>
              <div className="text-white text-5xl font-bold">78%</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GapAnalysisPanel = ({ onShowProperties }: { onShowProperties: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="absolute top-36 right-20"
    >
      <div className="w-[381px] h-[501px] rounded-3xl bg-white/14 backdrop-blur-md border border-white/20">
        {/* AI Business Header */}
        <div className="flex items-center gap-2 p-3 pl-4">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/613aa3868a1f461fc53f09303440118a5f5c5ca4?width=128"
            alt="AI Assistant"
            className="w-16 h-16 rounded-full border border-[#54FFD4] object-cover"
          />
          <div className="flex-1">
            <h3 className="text-white text-lg font-bold">AI Business</h3>
          </div>
          <SoundVisualization />
        </div>

        <div className="border-b border-white/20 mx-6"></div>

        {/* Gap Analysis Content */}
        <div className="px-9 pt-8 pb-6 h-full flex flex-col">
          <div className="text-white text-base font-normal mb-6 tracking-wide">GAP ANALYSIS</div>

          <h2 className="text-white text-2xl font-bold mb-24">Abu Dhabi Corniche</h2>

          <div className="text-white text-lg leading-relaxed flex-1">
            <div className="mb-4">
              <span className="font-bold">Insights for this area:</span>
            </div>
            <div className="space-y-4">
              <p>Emirati Fusion Cuisine Japanese influences new trend</p>
              <p>Demand for a formal evening dining experience. Waterfront locations</p>
              <p>High rise luxury experience popular.</p>
            </div>
          </div>

          {/* Properties Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-6"
          >
            <button
              onClick={onShowProperties}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium text-sm hover:bg-white/20 transition-colors"
            >
              Show me some available properties in the area that might work for my restaurant
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const MainContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="absolute top-40 left-20 max-w-md"
    >
      <div className="text-white text-lg font-bold leading-relaxed">
        The Abu Dhabi Corniche presents a dynamic and lucrative environment for F&B businesses, 
        driven by a mix of residents, tourists, and a strong culture of dining out. Here is an 
        overview of the key insights for the F&B sector in this area:
      </div>
    </motion.div>
  );
};

export function GapAnalysisView({ isOpen, onClose, category }: GapAnalysisViewProps) {
  const [showProperties, setShowProperties] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gap-analysis-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      >
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://api.builder.io/api/v1/image/assets/TEMP/3b6e0140bf72d8214b7baf7dc727cc0c1eb894d4?width=2390)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 w-full h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]"
        >
          <div className="flex items-center justify-between px-10 py-5 h-full">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/4f55495a54b1427b9bd40ba1c8f3c8aa/e9ee86b522ee4f309ae259a6480f85c2"
                alt="Tamm Logo"
                className="h-12"
              />
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full border border-white/18 bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12L5 12M5 12L11 18M5 12L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="text-white text-base font-medium text-center">
              Investor Journey for a Restaurant
            </div>

            <div className="flex items-center">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/f35ba5a02338a961dd18f58928489d9e87ec7dc3?width=442"
                alt="Sign in with UAE PASS"
                className="h-8 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 h-[calc(100vh-87px)] overflow-hidden">
          <MainContent />
          <FootfallInsight />
          <GapAnalysisPanel onShowProperties={() => setShowProperties(true)} />
          <StatisticsBar />
        </div>
      </motion.div>

      {/* Property Map Modal */}
      <PropertyMapModal
        key="property-map-modal"
        isOpen={showProperties}
        onClose={() => setShowProperties(false)}
        onReportRequest={() => {
          setShowProperties(false);
          setShowReport(true);
        }}
      />

      {/* Report Summary Page */}
      <ReportSummaryPage
        key="report-summary-page"
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        onExploreAnother={() => {
          setShowReport(false);
          // Could navigate back to main page or properties
        }}
      />
    </AnimatePresence>
  );
}
