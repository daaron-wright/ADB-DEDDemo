import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SummaryDashboardProps {
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

const VisitorTrendsChart = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const chartData = [
    { label: 'Tourists lean toward Emirati + Asian', value: 30, color: '#E29F37' },
    { label: 'Locals prefer Emirati + Mediterranean', value: 45, color: '#429195' },
    { label: 'Expats like Emirati + Indian', value: 20, color: '#A02E1F' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 w-64 h-72"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Visitor Taste Trends</h3>
          <div className="w-3 h-3 rounded-full bg-gray-400 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-full bg-white shadow-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.7594 11.1759H2.94824V8.36478M8.00833 3.30469H10.8195V6.11585" stroke="#888888" strokeWidth="0.843348" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-1">Total survey this month</p>
        <p className="text-2xl font-semibold text-gray-800">1230</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
            <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.86888 3.02024V7.58241H4.11923V3.02024L2.10869 5.03077L1.57861 4.5007L4.49406 1.58527L7.40945 4.5007L6.87938 5.03077L4.86888 3.02024Z" fill="#434343"/>
            </svg>
            <span className="text-xs text-gray-600">12%</span>
          </div>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      </div>

      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="relative">
            <motion.div
              initial={{ width: 0 }}
              animate={isVisible ? { width: `${item.value * 2}px` } : { width: 0 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className="h-5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>0</span>
        <span>10%</span>
        <span>20%</span>
        <span>30%</span>
        <span>40%</span>
        <span>50%</span>
      </div>
    </motion.div>
  );
};

const CuisinePopularityPanel = () => {
  const cuisines = [
    {
      name: 'Middle Eastern',
      popularity: '30-35%',
      context: 'Cultural resonance, traditional appeal'
    },
    {
      name: 'American', 
      popularity: '20-25%',
      context: 'Fast-food dominance, familiarity, chain presence'
    },
    {
      name: 'Indian',
      popularity: '15-20%', 
      context: 'Large expat community, flavor alignment with local preferences'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 p-8 w-[472px] h-[589px]"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-white">Popularity of cuisines in Abu Dhabi</h2>
        <div className="w-5 h-5 bg-white/10 rounded"></div>
      </div>

      <div className="space-y-6">
        {cuisines.map((cuisine, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
            className="border-b border-white/10 pb-6"
          >
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="text-white font-semibold text-sm">{cuisine.name}</h3>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Popularity</p>
                <p className="text-white/80 text-sm">{cuisine.popularity}</p>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Supporting Context</p>
                <p className="text-white/80 text-sm">{cuisine.context}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const StatisticCard = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCount(prev => {
          if (prev >= 78) {
            clearInterval(interval);
            return 78;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.5 }}
      className="text-center"
    >
      <div className="text-8xl font-bold text-white mb-4">
        {count}%
      </div>
      <p className="text-white/70 text-sm max-w-[140px]">
        Residents eat out twice a week
      </p>
    </motion.div>
  );
};

const NotificationBanner = () => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-lg p-5 w-[605px]">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800 mb-1">Analysis Complete</div>
            <div className="text-sm text-gray-600">
              Your restaurant market analysis for Abu Dhabi has been generated with key insights and recommendations.
            </div>
          </div>
          <button className="px-6 py-2 bg-gradient-to-b from-blue-500 to-blue-700 text-white text-xs font-semibold rounded-full hover:opacity-90">
            View details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export function SummaryDashboard({ isOpen, onClose, category }: SummaryDashboardProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      >
        {/* Background with gradient */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F9b0dc1e702cd47b081613f3972914c00?format=webp&width=800)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Notification Banner */}
        <NotificationBanner />

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
        <div className="relative z-10 p-8 h-[calc(100vh-87px)] overflow-y-auto">
          {/* AI Business Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4 mb-8"
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
              alt="AI Assistant"
              className="w-16 h-16 rounded-full border border-[#54FFD4] object-cover"
            />
            <div className="flex-1">
              <h2 className="text-white text-lg font-semibold">AI Business</h2>
            </div>
            <SoundVisualization />
          </motion.div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Charts */}
            <div className="col-span-4 space-y-8">
              <VisitorTrendsChart />
              
              {/* Heat Map Analysis */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="w-52 h-52 rounded-3xl overflow-hidden shadow-lg"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/eade8edabdbb717ecdef1b65c3b40e5d1928605a?width=418"
                  alt="F&B Hotspot Analysis"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Center Column - Cuisine Popularity */}
            <div className="col-span-5">
              <CuisinePopularityPanel />
            </div>

            {/* Right Column - Statistics & Map */}
            <div className="col-span-3 space-y-8">
              <StatisticCard />
              
              {/* Interactive Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="w-80 h-80 rounded-3xl overflow-hidden shadow-lg"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/6217a05a0af8f9420e0485cc166613634d45f299?width=634"
                  alt="Abu Dhabi Restaurant Locations"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>

          {/* Summary Insights */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Key Insights Summary</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-medium mb-3">Market Opportunity</h4>
                  <ul className="text-white/80 text-sm space-y-2">
                    <li>• Middle Eastern cuisine dominates with 30-35% market share</li>
                    <li>• Strong dining culture: 78% eat out twice weekly</li>
                    <li>• The Corniche offers premium location with 100K+ weekly footfall</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">Investment Considerations</h4>
                  <ul className="text-white/80 text-sm space-y-2">
                    <li>• Setup costs: AED 6.5M - 14M for 300-cover restaurant</li>
                    <li>• Monthly operating: AED 545K - 1.3M</li>
                    <li>• Cultural alignment crucial for success</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* "See Top Competitors" Button */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="mt-8 text-center"
          >
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-colors">
              See Top Competitors in the Area
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
