import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";

interface CuisineDataPoint {
  name: string;
  percentage: string;
  description: string;
  color: string;
}

interface DemographicStat {
  label: string;
  value: string;
  description?: string;
}

const CuisinePopularityChart = ({ className = "" }: { className?: string }) => {
  const cuisines: CuisineDataPoint[] = [
    {
      name: "Middle Eastern",
      percentage: "30-35%",
      description: "Cultural resonance, traditional appeal",
      color: "from-emerald-500 to-teal-600"
    },
    {
      name: "American", 
      percentage: "20-25%",
      description: "Fast-food dominance, familiarity, chain presence",
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "Indian",
      percentage: "15-20%", 
      description: "Large expat community, flavor alignment with local preferences",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        chatCardClass("w-full bg-white/10 border border-white/20 p-6"),
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </div>
        <div>
          <h3 className="text-white text-xl font-bold">Cuisine Popularity Analysis</h3>
          <p className="text-white/70 text-sm">Market share breakdown</p>
        </div>
      </div>

      <div className="space-y-4">
        {cuisines.map((cuisine, index) => (
          <motion.div
            key={cuisine.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-bold text-lg">{cuisine.name}</h4>
              <span className="text-white text-xl font-bold">{cuisine.percentage}</span>
            </div>
            <p className="text-white/70 text-sm">{cuisine.description}</p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={cn("h-full bg-gradient-to-r rounded-full", cuisine.color)}
                style={{ width: parseInt(cuisine.percentage) + "%" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const CompetitorAnalysisChart = ({ className = "" }: { className?: string }) => {
  const competitors = [
    { name: "Shurfa Bay", description: "Waterfront premium seafood experience", rating: 4.8, priceRange: "$$$$" },
    { name: "Villa Toscana", description: "Luxury hotel-based Italian dining", rating: 4.7, priceRange: "$$$$" },
    { name: "Palms & Pearls", description: "Modern Middle Eastern on Corniche", rating: 4.3, priceRange: "$$$" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        chatCardClass("w-full bg-white/10 border border-white/20 p-6"),
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 20V10"/>
            <path d="M12 20V4"/>
            <path d="M6 20v-6"/>
          </svg>
        </div>
        <div>
          <h3 className="text-white text-xl font-bold">Competitor Analysis</h3>
          <p className="text-white/70 text-sm">Market leaders overview</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-white text-4xl font-bold">4.6</span>
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }, (_, i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        </div>
        <p className="text-white/70 text-sm">Average competitor rating</p>
      </div>

      <div className="space-y-3">
        {competitors.map((competitor, index) => (
          <motion.div
            key={competitor.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <div>
              <div className="text-white font-semibold">{competitor.name}</div>
              <div className="text-white/70 text-sm">{competitor.description}</div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm font-semibold">{competitor.rating}★</div>
              <div className="text-white/70 text-xs">{competitor.priceRange}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
        <h4 className="text-white font-semibold mb-3">Key Insights</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-white text-lg font-bold">3</div>
            <div className="text-white/70 text-xs">Market gaps</div>
          </div>
          <div>
            <div className="text-white text-lg font-bold">4.5★</div>
            <div className="text-white/70 text-xs">Avg rating</div>
          </div>
          <div>
            <div className="text-white text-lg font-bold">$$$$</div>
            <div className="text-white/70 text-xs">Price range</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VisitorTasteTrendsChart = ({ className = "" }: { className?: string }) => {
  const trends = [
    { label: "Tourists lean toward Emirati + Asian", percentage: 35, color: "bg-amber-500" },
    { label: "Locals prefer Emirati + Mediterranean", percentage: 55, color: "bg-teal-500" },
    { label: "Expats like Emirati + Indian", percentage: 25, color: "bg-red-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        chatCardClass("w-full bg-white border border-gray-200 p-4"),
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-gray-900 text-sm font-semibold">Visitor Taste Trends</h4>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" fill="#888888"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M7 4.7c.07-.12.11-.26.11-.41C7.11 3.81 6.73 3.43 6.24 3.43s-.87.38-.87.86c0 .47.38.85.87.85.31 0 .59-.17.73-.43zM5.68 5.68h.28h.56c.31 0 .56.25.56.56v.56v2.25c0 .31-.25.56-.56.56s-.56-.25-.56-.56V7.22c0-.23-.19-.42-.42-.42s-.42-.19-.42-.42v-.14c0-.2.1-.37.25-.47.09-.06.19-.09.31-.09z" fill="white"/>
          </svg>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#888" strokeWidth="1">
            <path d="M5 10H3V7M8 2h2v3"/>
          </svg>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gray-500 text-xs mb-1">Total survey this month</div>
        <div className="text-gray-900 text-2xl font-semibold">1230</div>
      </div>

      <div className="relative mb-4">
        <div className="flex gap-1 h-32">
          {trends.map((trend, index) => (
            <div key={index} className="flex-1 flex items-end">
              <div 
                className={cn("w-full rounded-t-sm", trend.color)}
                style={{ height: `${(trend.percentage / 60) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-1 mt-2 text-xs text-gray-500">
          <div>0</div>
          <div>10%</div>
          <div>20%</div>
          <div>30%</div>
          <div>40%</div>
          <div>50%</div>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-500">
        {trends.map((trend, index) => (
          <div key={index}>{trend.label}</div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs">
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 2v3.5M4 7h0" stroke="#434343" strokeWidth="1"/>
          </svg>
          <span className="text-gray-700">12%</span>
        </div>
        <span className="text-gray-500">vs last month</span>
      </div>
    </motion.div>
  );
};

const DemographicsCard = ({ className = "" }: { className?: string }) => {
  const demographics: DemographicStat[] = [
    { label: "Expats in area", value: "85-90%" },
    { label: "Eat out weekly", value: "2.5x" },
    { label: "% who dine out", value: "78%" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        chatCardClass("w-full bg-white/10 border border-white/20 p-6"),
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-white text-lg font-bold mb-2">Abu Dhabi Corniche</h3>
        <p className="text-white/70 text-sm">INSIGHTS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demographics.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="text-white text-4xl font-bold mb-2">{stat.value}</div>
            <div className="text-white/70 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="text-white font-semibold mb-2">Footfall Insights</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-white text-3xl font-bold">6.3%</span>
          <svg width="16" height="16" viewBox="0 0 17 15" fill="none">
            <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#54FFD4"/>
          </svg>
        </div>
        <p className="text-white/70 text-sm mt-1">Growth potential in Corniche area</p>
      </div>
    </motion.div>
  );
};

export {
  CuisinePopularityChart,
  CompetitorAnalysisChart,
  VisitorTasteTrendsChart,
  DemographicsCard
};
