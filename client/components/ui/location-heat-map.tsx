import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";

interface HeatMapPoint {
  id: string;
  x: number;
  y: number;
  intensity: "high" | "medium" | "low";
  size: number;
  businessType?: string;
}

interface LocationInsight {
  area: string;
  residents: string;
  visitors: string;
  description: string;
  rating: number;
}

const LocationHeatMap = ({ className = "" }: { className?: string }) => {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const heatPoints: HeatMapPoint[] = [
    { id: "corniche-1", x: 35, y: 45, intensity: "high", size: 60, businessType: "Premium Dining" },
    { id: "corniche-2", x: 20, y: 55, intensity: "medium", size: 44, businessType: "Casual Dining" },
    { id: "corniche-3", x: 55, y: 35, intensity: "medium", size: 55, businessType: "Fast Casual" },
    { id: "marina-1", x: 70, y: 60, intensity: "high", size: 65, businessType: "Waterfront" },
    { id: "marina-2", x: 45, y: 70, intensity: "low", size: 35, businessType: "Cafe" },
  ];

  const locationInsights: LocationInsight[] = [
    {
      area: "Yas Island",
      residents: "~10k residents",
      visitors: "25k+ daily visitors",
      description: "Strong tourist hub",
      rating: 8
    },
    {
      area: "Al Maryah Island", 
      residents: "7k residents",
      visitors: "20k workers/visitors",
      description: "Luxury and business dining",
      rating: 7
    },
    {
      area: "Corniche",
      residents: "~20k daily",
      visitors: "leisure visitors",
      description: "Scenic high-traffic zone",
      rating: 8
    }
  ];

  const getHeatPointColor = (intensity: "high" | "medium" | "low") => {
    switch (intensity) {
      case "high":
        return "radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)";
      case "medium":
        return "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)";
      case "low":
        return "radial-gradient(50% 50% at 50% 50%, rgba(251, 255, 0, 0.4) 0%, rgba(246, 255, 0, 0) 100%)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        chatCardClass("w-full bg-white/10 border border-white/20 overflow-hidden"),
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">Location Heat Map</h3>
            <p className="text-white/70 text-sm">Business density and opportunities</p>
          </div>
        </div>

        {/* Heat Map Visualization */}
        <div className="relative mb-6">
          <div 
            className="relative w-full h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl overflow-hidden border border-white/20"
            style={{
              backgroundImage: "url('https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* Overlay for better contrast */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Heat Points */}
            {heatPoints.map((point) => (
              <motion.div
                key={point.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: `${point.size}px`,
                  height: `${point.size}px`,
                  transform: "translate(-50%, -50%)",
                  background: getHeatPointColor(point.intensity),
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: Math.random() * 0.5 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
              />
            ))}

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-white text-xs font-semibold mb-2">Density</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-white text-xs">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-white text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-white text-xs">Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Point Info */}
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white/5 rounded-xl border border-white/20"
            >
              <div className="text-white font-semibold">
                {heatPoints.find(p => p.id === selectedPoint)?.businessType} Location
              </div>
              <div className="text-white/70 text-sm">
                High foot traffic area with excellent visibility
              </div>
            </motion.div>
          )}
        </div>

        {/* Location Insights */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-bold">Area Analysis</h4>
          {locationInsights.map((insight, index) => (
            <motion.div
              key={insight.area}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-semibold">{insight.area}</h5>
                <div className="flex items-center gap-1">
                  <span className="text-white font-bold">{insight.rating}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1l2.5 5L16 6.5l-4 3.5 1 5.5L8 13l-5 2.5 1-5.5-4-3.5L5.5 6L8 1z" fill="#FFE100"/>
                  </svg>
                  <span className="text-white/70 text-sm">/10</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/70">Residents</div>
                  <div className="text-white">{insight.residents}</div>
                </div>
                <div>
                  <div className="text-white/70">Visitors</div>
                  <div className="text-white">{insight.visitors}</div>
                </div>
              </div>
              <div className="mt-2 text-white/70 text-sm">{insight.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LocationHeatMap;
