import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { conversationFlows } from "@/lib/conversations";
import { Button } from "@/components/ui/button";
import { UAEPassLogin } from "./uae-pass-login";
import BusinessLicensePortalSimplified from "./business-license-portal-simplified";

interface BusinessMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  rating?: number;
  hasActions?: boolean;
  type?: 'text' | 'heat-map';
}

interface BusinessChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  title?: string;
  initialMessage?: string;
}

type ChatView = "journey" | "discover-experience";

interface ChatThread {
  id: string;
  title: string;
  messages: BusinessMessage[];
  view: ChatView;
}

const SoundVisualization = () => {
  const bars = [
    { height: "4px" },
    { height: "8px" },
    { height: "16px" },
    { height: "10px" },
    { height: "6px" },
    { height: "18px" },
    { height: "24px" },
    { height: "14px" },
    { height: "3px" },
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

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill={star <= rating ? "#FFD700" : "none"}
          stroke={star <= rating ? "#FFD700" : "#666"}
          strokeWidth="1"
        >
          <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" />
        </svg>
      ))}
    </div>
  );
};

const KHALID_AVATAR =
  "https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131";

const AccessibleHeatMap = () => {
  const heatPoints = [
    { id: 1, x: 25, y: 35, intensity: 'high', label: 'Marina Royal Complex', businesses: 15 },
    { id: 2, x: 45, y: 45, intensity: 'medium', label: 'Al Khalidiya District', businesses: 8 },
    { id: 3, x: 65, y: 25, intensity: 'high', label: 'Corniche Area', businesses: 22 },
    { id: 4, x: 75, y: 55, intensity: 'medium', label: 'Al Bateen', businesses: 12 },
    { id: 5, x: 35, y: 65, intensity: 'low', label: 'Downtown District', businesses: 5 },
  ];

  return (
    <div className="mt-4 mb-2">
      {/* Heat map container */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl p-3 shadow-lg border border-white/20"
        role="img"
        aria-label="Heat map showing restaurant density across Abu Dhabi districts"
      >
        {/* Base map image */}
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386"
          alt="Abu Dhabi district map"
          className="w-full h-auto rounded-xl"
        />

        {/* Heat points overlay */}
        <div className="absolute inset-3">
          {heatPoints.map((point) => (
            <div
              key={point.id}
              className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: point.intensity === 'high' ? '64px' : point.intensity === 'medium' ? '48px' : '32px',
                height: point.intensity === 'high' ? '64px' : point.intensity === 'medium' ? '48px' : '32px',
                background: `radial-gradient(circle, ${
                  point.intensity === 'high' ? 'rgba(239, 68, 68, 0.6)' :
                  point.intensity === 'medium' ? 'rgba(245, 158, 11, 0.6)' :
                  'rgba(250, 204, 21, 0.6)'
                } 0%, transparent 70%)`,
              }}
              role="button"
              tabIndex={0}
              aria-label={`${point.label}: ${point.businesses} restaurants, ${point.intensity} density`}
              title={`${point.label}: ${point.businesses} restaurants`}
            >
              {/* Inner circle for better visibility */}
              <div className="absolute inset-2 rounded-full bg-white/20 border border-white/40"></div>

              {/* Business count indicator */}
              <div className="absolute -top-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-800 border border-gray-200 shadow-sm">
                {point.businesses}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible legend */}
      <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Restaurant Density Legend</h4>
        <div className="space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <span>High (15+ restaurants)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500/60"></div>
            <span>Medium (8-14 restaurants)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
            <span>Low (1-7 restaurants)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  onActionClick,
}: {
  message: BusinessMessage;
  onActionClick?: (action: string) => void;
}) => {
  const shouldShowBudgetButton =
    message.isAI && message.content.includes("AED 10,000 to AED 30,000");

  return (
    <div
      className={cn(
        "flex mb-4 gap-3 items-end",
        message.isAI ? "justify-start" : "justify-end",
      )}
    >
      {message.isAI && (
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
          alt="AI Assistant"
          className="w-10 h-10 rounded-full border border-[#54FFD4] object-cover"
        />
      )}
      <div
        className={cn(
          "max-w-[80%] flex flex-col gap-3",
          message.isAI ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "px-4 py-4 rounded-2xl text-base leading-relaxed shadow-sm border text-slate-900",
            message.isAI
              ? "bg-white border-slate-200 rounded-bl-sm"
              : "bg-[#E6F7F3] border-[#54FFD4]/60 rounded-br-sm",
          )}
        >
          {message.rating && <StarRating rating={message.rating} />}
          <div className="text-inherit whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Heat map visualization for location-related AI messages */}
        {message.isAI && message.type === 'heat-map' && (
          <AccessibleHeatMap />
        )}

        {/* Budget ranges button */}
        {shouldShowBudgetButton && onActionClick && (
          <button
            onClick={() => onActionClick("budget-ranges")}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.9998 3.00003H4.99976C4.46932 3.00003 3.96061 3.21074 3.58554 3.58582C3.21047 3.96089 2.99976 4.4696 2.99976 5.00003V27C2.99976 27.5305 3.21047 28.0392 3.58554 28.4142C3.96061 28.7893 4.46932 29 4.99976 29H26.9998C27.5302 29 28.0389 28.7893 28.414 28.4142C28.789 28.0392 28.9998 27.5305 28.9998 27V5.00003C28.9998 4.4696 28.789 3.96089 28.414 3.58582C28.0389 3.21074 27.5302 3.00003 26.9998 3.00003ZM26.9998 5.00003V9.00003H4.99976V5.00003H26.9998ZM16.9998 11H26.9998V18H16.9998V11ZM14.9998 18H4.99976V11H14.9998V18ZM4.99976 20H14.9998V27H4.99976V20ZM16.9998 27V20H26.9998V27H16.9998Z"
                  fill="#169F9F"
                />
              </svg>
            </div>
            <span className="text-black text-sm font-semibold">
              Budget ranges
            </span>
          </button>
        )}
      </div>
      {!message.isAI && (
        <img
          src={KHALID_AVATAR}
          alt="Khalid"
          className="w-10 h-10 rounded-full border-2 border-white/50"
        />
      )}
    </div>
  );
};

const InvestorJourneyCard = ({
  onClose,
  onSetupBusiness,
}: {
  onClose: () => void;
  onSetupBusiness: () => void;
}) => {
  return (
    <div className="bg-white/14 rounded-3xl p-6 mt-4">
      {/* Header image */}
      <div className="relative mb-4">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/e427a550c226e9eefd36bf66ddc6123d30377808?width=1186"
          alt="Abu Dhabi skyline"
          className="w-full h-25 object-cover rounded-2xl"
        />

        {/* Avatar and details overlay */}
        <div className="absolute left-6 top-4 flex items-center gap-4">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131"
            alt="Khalid"
            className="w-16 h-16 rounded-full border-2 border-[#54FFD4]"
          />
          <div>
            <h4 className="text-white text-lg font-semibold">
              Investor Journey
            </h4>
            <p className="text-white/90 text-lg">
              <span className="font-semibold">Khalid</span> Entrepreneur
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-white mb-6">
        <h3 className="text-xl font-bold mb-2">Your journey, powered by AI</h3>
        <p className="text-base leading-relaxed text-white/90">
          Discover a clear path for investors to plan, apply for, and
          successfully open a restaurant. In just four seamless stages, watch
          Khalid, an F&B entrepreneur, go from a business idea to a thriving
          restaurant.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full border-2 border-white text-white font-semibold text-base hover:bg-white/10 transition-colors"
        >
          Explore more options
        </button>
        <button
          onClick={onSetupBusiness}
          className="px-6 py-3 rounded-full bg-teal-gradient text-white font-semibold text-base hover:opacity-90 transition-opacity"
        >
          Set up business
        </button>
      </div>
    </div>
  );
};

const getCategoryBackground = (category: string) => {
  const backgrounds = {
    restaurants:
      "https://api.builder.io/api/v1/image/assets/TEMP/749c7b38ea45266634e7fb0c1ba7745f62d35ec3?width=2390",
    "fast-food":
      "https://api.builder.io/api/v1/image/assets/TEMP/93a8ccdd2ba263b5df1fa8ac003cfbbe0f2a04bf?width=766",
    branch:
      "https://api.builder.io/api/v1/image/assets/TEMP/474e9427353e36aa9e243c53c1ca9efe1f850f1a?width=788",
    "retail-store":
      "https://api.builder.io/api/v1/image/assets/TEMP/28a07c4a89a2e43c77d74ad46a6ad88ca8d969b3?width=616",
  };
  return (
    backgrounds[category as keyof typeof backgrounds] || backgrounds.restaurants
  );
};

const getCategoryTitle = (category: string) => {
  const titles = {
    restaurants: "Commercial License for Restaurants",
    "fast-food": "Commercial License for Fast Food",
    branch: "Dual License for Branch",
    "retail-store": "Commercial License for Retail Store",
  };
  return titles[category as keyof typeof titles] || "Commercial License";
};

const getCategoryName = (category: string) => {
  const names = {
    restaurants: "Restaurants",
    "fast-food": "Fast Food",
    branch: "Branch",
    "retail-store": "Retail Store",
  };
  return names[category as keyof typeof names] || "Business";
};

const DISCOVER_EXPERIENCE_BACKGROUND =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F9b0dc1e702cd47b081613f3972914c00?format=webp&width=800";

const DiscoverExperienceView = ({
  category,
  onSendMessage,
  isStandalone = false,
}: {
  category: string;
  onSendMessage: (message: string) => void;
  isStandalone?: boolean;
}) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<"heatmap" | "timeline">("heatmap");
  const [inputValue, setInputValue] = useState(
    isStandalone ? "Ask me..." : "I want to look at the Cornich",
  );

  const heatMapInsights = [
    {
      id: "corniche",
      name: "Corniche waterfront",
      summary:
        "Flagship promenade combining daily commuters, tourists, and premium dining demand across the waterfront.",
      footfall: "100K+ weekly visits",
      density: "Very high density",
      trend: "+14% YoY evening visitors",
      focus: "Fine dining, experiential cafes, promenade lounges",
      intensity: 96,
    },
    {
      id: "marina",
      name: "Abu Dhabi Marina & Breakwater",
      summary:
        "Destination leisure cluster anchored by luxury hotels, yacht clubs, and family attractions.",
      footfall: "40–55K weekly visits",
      density: "High density",
      trend: "+9% weekend uplift",
      focus: "Waterfront lounges, seafood houses, family dining",
      intensity: 84,
    },
    {
      id: "baniyas",
      name: "Baniyas community spine",
      summary:
        "Established residential corridor seeing strong family traffic and quick-service demand spikes.",
      footfall: "60–75K weekly visits",
      density: "Growing density",
      trend: "+11% midday demand",
      focus: "Family restaurants, fast casual, bakeries",
      intensity: 78,
    },
    {
      id: "khalifa-city",
      name: "Khalifa City",
      summary:
        "Expanding suburb with new schools, villas, and lifestyle centers attracting higher disposable income.",
      footfall: "25–35K weekly visits",
      density: "Emerging density",
      trend: "+6% new households",
      focus: "Community casual dining, specialty coffee",
      intensity: 68,
    },
    {
      id: "central",
      name: "Central business zone",
      summary:
        "High-rise core around Hamdan and Electra streets with office workers and late-night crowd overlap.",
      footfall: "70–85K weekly visits",
      density: "High mixed density",
      trend: "+8% lunch rush",
      focus: "Express lunch spots, premium quick service",
      intensity: 74,
    },
    {
      id: "coastal",
      name: "Coastal district",
      summary:
        "Lifestyle beachfront with active tourism calendar and family day-trip itineraries.",
      footfall: "35–50K weekly visits",
      density: "Seasonal peaks",
      trend: "+5% holiday uplift",
      focus: "Beach clubs, ice cream bars, casual dining",
      intensity: 64,
    },
  ];

  const insightById = heatMapInsights.reduce<
    Record<string, (typeof heatMapInsights)[number]>
  >((acc, spot) => {
    acc[spot.id] = spot;
    return acc;
  }, {});
  const activeInsightId = hoveredLocation ?? "corniche";
  const activeInsight = insightById[activeInsightId] ?? heatMapInsights[0];
  const progressValue = Math.min(
    Math.max(Math.round(activeInsight?.intensity ?? 0), 0),
    100,
  );
  const secondaryInsights = heatMapInsights.filter(
    (spot) => spot.id !== activeInsightId,
  );

  const conversationMessages = [
    {
      id: "user-1",
      content:
        "Where are existing establishments located for specific activities (on a heat map)?",
      isAI: false,
      timestamp: new Date(),
    },
    {
      id: "ai-1",
      content:
        "I have created a heat map for the top areas and existing businesses",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "user-2",
      content: "Interesting looking at this in a map",
      isAI: false,
      timestamp: new Date(),
    },
  ];

  // If this is a standalone discover experience (new tab), show just the input
  if (isStandalone) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ask About Your Business
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            Get detailed information about costs, demographics, and requirements
            for your business setup in Abu Dhabi.
          </p>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim() && inputValue !== "Ask me...") {
                onSendMessage(inputValue.trim());
                setInputValue("Ask me...");
              }
            }}
          >
            <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-white border border-slate-200 shadow-sm max-w-md mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => inputValue === "Ask me..." && setInputValue("")}
                onBlur={() => !inputValue && setInputValue("Ask me...")}
                className="flex-1 bg-transparent text-slate-900 text-sm placeholder-slate-400 outline-none"
                placeholder="Ask me..."
              />
              <div className="flex items-center gap-2">
                {/* Send button */}
                <button
                  type="submit"
                  className="p-2 rounded-full bg-[#54FFD4] text-slate-900 transition-colors hover:bg-[#3dd9b5]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* Microphone icon */}
                <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                  <svg
                    width="10"
                    height="15"
                    viewBox="0 0 10 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C5.63276 1.36502 5.25134 1.20687 4.85352 1.20687Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                {/* Keyboard icon */}
                <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                  <svg
                    width="15"
                    height="10"
                    viewBox="0 0 15 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Chat Messages */}
      <div className="space-y-4 mb-6">
        {/* User Question */}
        <div className="flex justify-end">
          <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#E6F7F3] border border-[#54FFD4]/60 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[0].content}
            </div>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex justify-start gap-3">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
            alt="AI Assistant"
            className="w-8 h-8 rounded-full border border-[#54FFD4] object-cover flex-shrink-0"
          />
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-slate-200 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[1].content}
            </div>
          </div>
        </div>

        {/* Heat Map Image */}
        <div className="flex justify-center my-6">
          <div className="relative">
            <button
              onClick={() => setShowMapModal(true)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386"
                alt="Abu Dhabi Heat Map"
                className="w-48 h-48 md:w-64 md:h-64 object-cover"
              />

              {/* Heat Map Overlay Circles */}
              <div className="absolute inset-0">
                {/* Red density circles */}
                <div
                  className="absolute w-8 h-8 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)",
                    top: "35%",
                    left: "30%",
                  }}
                />
                <div
                  className="absolute w-6 h-6 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)",
                    top: "40%",
                    left: "15%",
                  }}
                />

                {/* Orange density circles */}
                <div
                  className="absolute w-7 h-7 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)",
                    top: "25%",
                    left: "10%",
                  }}
                />
                <div
                  className="absolute w-7 h-7 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)",
                    top: "55%",
                    left: "30%",
                  }}
                />
                <div
                  className="absolute w-8 h-8 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)",
                    top: "25%",
                    right: "20%",
                  }}
                />

                {/* Yellow density circle */}
                <div
                  className="absolute w-7 h-7 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(251, 255, 0, 0.4) 0%, rgba(247, 255, 0, 0) 100%)",
                    top: "15%",
                    right: "25%",
                  }}
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8L15 3Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 3V9H20"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13L12 17L8 13"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17V9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* User Response */}
        <div className="flex justify-end">
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#E6F7F3] border border-[#54FFD4]/60 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[2].content}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              onSendMessage(inputValue.trim());
              setInputValue("");
            }
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 text-sm placeholder-slate-400 outline-none"
              placeholder="Ask me..."
            />
            <div className="flex items-center gap-2">
              {/* Send button */}
              <button
                type="submit"
                className="p-2 rounded-full bg-[#54FFD4] text-slate-900 transition-colors hover:bg-[#3dd9b5]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Microphone icon */}
              <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                <svg
                  width="10"
                  height="15"
                  viewBox="0 0 10 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C5.63276 1.36502 5.25134 1.20687 4.85352 1.20687Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              {/* Keyboard icon */}
              <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                <svg
                  width="15"
                  height="10"
                  viewBox="0 0 15 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Heat Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-2xl"
            onClick={() => {
              setShowMapModal(false);
              setHoveredLocation(null);
            }}
          />
          <div className="relative z-10 w-full max-w-6xl">
            <div className="flex h-full max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0c1f1b]/85 via-[#152d28]/82 to-[#091a17]/85 shadow-[0_32px_88px_-30px_rgba(9,29,23,0.65)] backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                <div className="space-y-3">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Heat map
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-white md:text-2xl">
                      Abu Dhabi F&B Hotspot Density
                    </h3>
                    <p className="max-w-xl text-sm text-white/70">
                      Compare licensing concentration and live footfall signals across the city&apos;s restaurant districts.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
                  >
                    Download heat map
                  </Button>
                  <button
                    onClick={() => {
                      setShowMapModal(false);
                      setHoveredLocation(null);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:border-white/30 hover:text-white"
                    aria-label="Close heat map"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid flex-1 gap-6 overflow-hidden px-6 py-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-white/12 bg-slate-900/40 p-4 shadow-[0_22px_50px_-34px_rgba(7,27,23,0.6)]">
                  <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src="https://api.builder.io/api/v1/image/assets/TEMP/df351a3a49f1c6b9b74765965e6ddb3ecf6799d7?width=1600"
                      alt="Abu Dhabi Map"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0">
                      <div
                        className="absolute cursor-pointer transition duration-300 hover:scale-110"
                        style={{
                          left: "35%",
                          top: "28%",
                          width: "26%",
                          height: "38%",
                        }}
                        onMouseEnter={() => setHoveredLocation("khalifa-city")}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <svg viewBox="0 0 212 212" className="h-full w-full">
                          <circle cx="106" cy="106" r="105" fill="url(#redGradient)" />
                          <defs>
                            <radialGradient id="redGradient">
                              <stop stopColor="#FF0000" stopOpacity="0.4" />
                              <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                        {hoveredLocation === "khalifa-city" && (
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.35)]">
                            <p className="text-sm font-semibold text-slate-900">
                              {insightById["khalifa-city"]?.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                              {insightById["khalifa-city"]?.trend}
                            </p>
                            <p className="text-xs text-slate-600">
                              {insightById["khalifa-city"]?.footfall}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute cursor-pointer transition duration-300 hover:scale-110"
                        style={{
                          left: "18%",
                          top: "38%",
                          width: "24%",
                          height: "34%",
                        }}
                        onMouseEnter={() => setHoveredLocation("marina")}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <svg viewBox="0 0 190 190" className="h-full w-full">
                          <circle cx="95" cy="95" r="94" fill="url(#redGradient2)" />
                          <defs>
                            <radialGradient id="redGradient2">
                              <stop stopColor="#FF0000" stopOpacity="0.4" />
                              <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                        {hoveredLocation === "marina" && (
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.35)]">
                            <p className="text-sm font-semibold text-slate-900">
                              {insightById["marina"]?.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                              {insightById["marina"]?.trend}
                            </p>
                            <p className="text-xs text-slate-600">
                              {insightById["marina"]?.footfall}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute cursor-pointer transition duration-300 hover:scale-110"
                        style={{
                          left: "18%",
                          top: "20%",
                          width: "22%",
                          height: "32%",
                        }}
                        onMouseEnter={() => setHoveredLocation("central")}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <svg viewBox="0 0 177 177" className="h-full w-full">
                          <circle cx="88" cy="88" r="88" fill="url(#orangeGradient)" />
                          <defs>
                            <radialGradient id="orangeGradient">
                              <stop stopColor="#FF9500" stopOpacity="0.4" />
                              <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                        {hoveredLocation === "central" && (
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.35)]">
                            <p className="text-sm font-semibold text-slate-900">
                              {insightById["central"]?.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                              {insightById["central"]?.trend}
                            </p>
                            <p className="text-xs text-slate-600">
                              {insightById["central"]?.footfall}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute cursor-pointer transition duration-300 hover:scale-110"
                        style={{
                          left: "35%",
                          top: "64%",
                          width: "22%",
                          height: "32%",
                        }}
                        onMouseEnter={() => setHoveredLocation("baniyas")}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <svg viewBox="0 0 177 177" className="h-full w-full">
                          <circle cx="88" cy="88" r="88" fill="url(#orangeGradient2)" />
                          <defs>
                            <radialGradient id="orangeGradient2">
                              <stop stopColor="#FF9500" stopOpacity="0.4" />
                              <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                        {hoveredLocation === "baniyas" && (
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.35)]">
                            <p className="text-sm font-semibold text-slate-900">
                              {insightById["baniyas"]?.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                              {insightById["baniyas"]?.trend}
                            </p>
                            <p className="text-xs text-slate-600">
                              {insightById["baniyas"]?.footfall}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute cursor-pointer transition duration-300 hover:scale-110"
                        style={{
                          left: "54%",
                          top: "13%",
                          width: "31%",
                          height: "45%",
                        }}
                        onMouseEnter={() => setHoveredLocation("corniche")}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <svg viewBox="0 0 249 249" className="h-full w-full">
                          <circle cx="124" cy="124" r="124" fill="url(#orangeGradientLarge)" />
                          <defs>
                            <radialGradient id="orangeGradientLarge">
                              <stop stopColor="#FF9500" stopOpacity="0.4" />
                              <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                        {hoveredLocation === "corniche" && (
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.35)]">
                            <p className="text-sm font-semibold text-slate-900">
                              {insightById["corniche"]?.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                              {insightById["corniche"]?.trend}
                            </p>
                            <p className="text-xs text-slate-600">
                              {insightById["corniche"]?.footfall}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute cursor-pointer transition duration-300 hover:scale-110"
                        style={{
                          left: "52%",
                          top: "-5%",
                          width: "25%",
                          height: "32%",
                        }}
                        onMouseEnter={() => setHoveredLocation("coastal")}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <svg viewBox="0 0 203 177" className="h-full w-full">
                          <circle cx="101" cy="75" r="101" fill="url(#yellowGradient)" />
                          <defs>
                            <radialGradient id="yellowGradient">
                              <stop stopColor="#FBFF00" stopOpacity="0.4" />
                              <stop offset="1" stopColor="#F7FF00" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                        {hoveredLocation === "coastal" && (
                          <div className="absolute top-full left-1/2 mt-3 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.35)]">
                            <p className="text-sm font-semibold text-slate-900">
                              {insightById["coastal"]?.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                              {insightById["coastal"]?.trend}
                            </p>
                            <p className="text-xs text-slate-600">
                              {insightById["coastal"]?.footfall}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-6 bottom-5 flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-8 rounded-full bg-[#ef4444]" />
                        High density
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-8 rounded-full bg-[#f59e0b]" />
                        Active growth
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-8 rounded-full bg-[#facc15]" />
                        Seasonal peaks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/12 bg-white/10 p-5 text-white backdrop-blur-lg">
                  <div className="rounded-2xl border border-white/15 bg-black/25 p-5 shadow-[0_18px_44px_-26px_rgba(12,46,39,0.55)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                      Focused district
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-white">
                      {activeInsight.name}
                    </h4>
                    <p className="mt-2 text-sm text-white/70">
                      {activeInsight.summary}
                    </p>
                    <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-white/70">
                      <div>
                        <dt className="text-white/50 uppercase tracking-[0.2em]">
                          Footfall
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {activeInsight.footfall}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/50 uppercase tracking-[0.2em]">
                          Density
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {activeInsight.density}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/50 uppercase tracking-[0.2em]">
                          Trend
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {activeInsight.trend}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/50 uppercase tracking-[0.2em]">
                          Cuisine focus
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {activeInsight.focus}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex-1 overflow-y-auto rounded-2xl border border-white/12 bg-white/12 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                      Other hotspots
                    </p>
                    <ul className="mt-3 space-y-3 text-sm">
                      {secondaryInsights.map((spot) => {
                        const isHighlighted = hoveredLocation === spot.id;
                        const width = `${Math.min(spot.intensity, 100)}%`;
                        return (
                          <li
                            key={spot.id}
                            className={cn(
                              "cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-3 transition",
                              isHighlighted
                                ? "border-[#54ffd4]/60 bg-[#54ffd4]/15 shadow-[0_18px_40px_-26px_rgba(84,255,212,0.45)]"
                                : "hover:border-white/20 hover:bg-white/16",
                            )}
                            onMouseEnter={() => setHoveredLocation(spot.id)}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <div className="flex items-center justify-between text-sm font-semibold">
                              <span>{spot.name}</span>
                              <span className="text-white/70">{spot.footfall}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                              <span>{spot.density}</span>
                              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/70">
                                {spot.trend}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#9df6d3] via-[#54ffd4] to-[#0f766e]"
                                style={{ width }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Powered by aggregated licensing &amp; mobility data (updated weekly)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const queryClient = new QueryClient();

export function BusinessChatUI({
  isOpen,
  onClose,
  category,
  title = "AI Business",
  initialMessage,
}: BusinessChatUIProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [showBusinessPortal, setShowBusinessPortal] = useState(false);
  const isLoggedIn = Boolean(loggedInUser);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const baseMessages =
      conversationFlows[category as keyof typeof conversationFlows] ||
      conversationFlows.general;
    const clonedMessages = baseMessages.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
      type: message.type || 'text',
    }));

    let seededMessages = clonedMessages;
    const trimmedInitial = initialMessage?.trim();

    if (trimmedInitial) {
      const userMessage = {
        id: `user-initial-${Date.now()}`,
        content: trimmedInitial,
        isAI: false,
        timestamp: new Date(),
      } satisfies BusinessMessage;

      if (seededMessages.length > 0 && seededMessages[0].isAI === false) {
        const [, ...rest] = seededMessages;
        seededMessages = [userMessage, ...rest];
      } else {
        seededMessages = [userMessage, ...seededMessages];
      }
    }

    const newThread: ChatThread = {
      id: `thread-${Date.now()}-${Math.random()}`,
      title: getCategoryTitle(category),
      messages: seededMessages,
      view: "journey",
    };

    setThreads([newThread]);
    setActiveThreadId(newThread.id);
  }, [isOpen, category, initialMessage]);

  // UAE PASS Login Handler
  const handleUAEPassLogin = (
    userType: "applicant" | "reviewer",
    userData: any,
  ) => {
    setLoggedInUser(userData);
    setShowBusinessPortal(false);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const updateThread = (
    threadId: string,
    updates: Partial<Omit<ChatThread, "id">>,
  ) => {
    setThreads(
      threads.map((t) => (t.id === threadId ? { ...t, ...updates } : t)),
    );
  };

  const handleSetupBusiness = () => {
    if (activeThreadId) {
      updateThread(activeThreadId, { view: "discover-experience" });
    }
  };

  const handleNewTab = () => {
    // Alternate between different conversation flows
    const isExtendedFlow = threads.length % 2 === 1;

    if (isExtendedFlow) {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: "Detailed Restaurant Analysis",
        messages: [
          {
            id: "user-detailed-cost-question",
            content:
              "What would the set up and running costs be to open a F&B Restaurant, with 300 covers?",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-detailed-cost-response",
            content:
              "Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs",
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: "user-demographic-question-2",
            content:
              "Can you give me any demographic data you have for this area.",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-demographic-response-2",
            content:
              "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: "user-corniche-question",
            content: "Great can you give me more details on The Corniche",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-corniche-response",
            content:
              "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.",
            isAI: true,
            timestamp: new Date(),
          },
        ],
        view: "discover-experience",
      };
      setThreads([...threads, newThread]);
      setActiveThreadId(newThread.id);
    } else {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: "Cost & Demographics",
        messages: [
          {
            id: "user-cost-question",
            content: "How much would it cost to open a restaurant",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-cost-response",
            content:
              "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.",
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: "user-demographic-question",
            content:
              "Can you give me any demographic data you have for this area.",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-demographic-response",
            content:
              "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
            isAI: true,
            timestamp: new Date(),
          },
        ],
        view: "discover-experience",
      };
      setThreads([...threads, newThread]);
      setActiveThreadId(newThread.id);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!activeThreadId) return;

    const userMessage: BusinessMessage = {
      id: `user-${Date.now()}`,
      content: message,
      isAI: false,
      timestamp: new Date(),
    };

    const aiResponse: BusinessMessage = {
      id: `ai-${Date.now()}`,
      content: generateAIResponse(message),
      isAI: true,
      timestamp: new Date(),
    };

    const activeThread = threads.find((t) => t.id === activeThreadId);
    if (activeThread) {
      const updatedMessages = [
        ...activeThread.messages,
        userMessage,
        aiResponse,
      ];
      updateThread(activeThreadId, { messages: updatedMessages });
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("corniche") &&
      (lowerMessage.includes("details") || lowerMessage.includes("more"))
    ) {
      return "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.";
    }

    if (lowerMessage.includes("corniche") || lowerMessage.includes("cornich")) {
      return "Abu Dhabi's Corniche is one of the most prestigious dining locations with ~20k daily leisure visitors and a scenic high-traffic zone rating of 8/10. The area attracts both tourists and locals, making it ideal for upscale restaurants. Would you like specific demographic data for this area?";
    }

    if (
      lowerMessage.includes("reports") ||
      lowerMessage.includes("deeper") ||
      lowerMessage.includes("generate")
    ) {
      return "I can generate detailed reports covering market analysis, competitor landscape, foot traffic patterns, seasonal variations, target demographics, pricing strategies, and location-specific recommendations for each area. What specific type of report would you like me to focus on?";
    }

    if (
      lowerMessage.includes("300 covers") ||
      lowerMessage.includes("f&b restaurant")
    ) {
      return "Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs";
    }

    if (
      lowerMessage.includes("cost") ||
      lowerMessage.includes("price") ||
      lowerMessage.includes("budget")
    ) {
      return "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.";
    }

    if (
      lowerMessage.includes("demographic") ||
      lowerMessage.includes("target") ||
      lowerMessage.includes("market")
    ) {
      return "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers: Yas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10). Al Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10). Saadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10). Al Reem Island – 30k residents, 35k daytime; dense community market (7/10). Al Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10). Corniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10). Al Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).";
    }

    return "I can help you with restaurant licensing, location analysis, cost estimates, and demographic data for Abu Dhabi. What specific information would you like to know?";
  };

  if (!isOpen) return null;

  const backgroundImage =
    activeThread?.view === "discover-experience"
      ? DISCOVER_EXPERIENCE_BACKGROUND
      : getCategoryBackground(category);
  const headerTitle =
    activeThread?.view === "discover-experience"
      ? `Your Investment Journey for ${getCategoryName(category)}`
      : getCategoryTitle(category);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence>
        {isOpen && (
          <div key="chat-ui" className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
              style={{
                backgroundImage: isLoggedIn ? 'none' : `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Gradient Background for logged-in users */}
              {isLoggedIn && (
                <>
                  {/* Background gradients matching Figma design */}
                  <div className="absolute inset-0 bg-white" />

                  {/* First gradient blob */}
                  <div
                    className="absolute w-[1028px] h-[1580px] opacity-80"
                    style={{
                      left: '-252px',
                      top: '-1048px',
                      background: 'linear-gradient(159deg, #AEAAFE 39.9%, #F0EEFD 71.79%)',
                      filter: 'blur(140px)',
                      borderRadius: '50%',
                    }}
                  />

                  {/* Second gradient blob */}
                  <div
                    className="absolute w-[936px] h-[834px] opacity-80"
                    style={{
                      right: '-300px',
                      top: '84px',
                      background: 'linear-gradient(159deg, #AEAAFE 39.9%, #F0EEFD 71.79%)',
                      filter: 'blur(140px)',
                      borderRadius: '50%',
                    }}
                  />

                  {/* Box shadow overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                    }}
                  />
                </>
              )}

              {/* Background overlay for non-logged-in users */}
              {!isLoggedIn && <div className="absolute inset-0 bg-black/30" />}

              {/* Header */}
              <div className="relative z-10 w-full h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
                <div className="flex items-center justify-center px-10 py-5 h-full relative">
                  {/* Left side - Logo and back button */}
                  <div className="absolute left-10 flex items-center gap-4">
                    {/* Tamm Logo */}
                    <svg
                      width="111"
                      height="50"
                      viewBox="0 0 111 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-auto"
                    >
                      <path d="M65.7294 29.4798V38.9241H63.8521V29.4798H60.2383V27.6816H69.3588V29.4798H65.7294Z" fill="black"/>
                      <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill="black"/>
                      <path d="M77.7754 38.9247V31.2004H79.5275V32.1855C80.0125 31.4193 80.8573 30.9659 81.7647 30.9815C82.7346 30.9346 83.642 31.4663 84.0643 32.3419C84.565 31.4506 85.5349 30.919 86.5518 30.9815C87.9441 30.9815 89.2582 31.8728 89.2582 33.9211V38.9247H87.4904V34.2339C87.4904 33.327 87.0367 32.6546 86.0199 32.6546C85.1438 32.6546 84.4242 33.3739 84.4242 34.2651C84.4242 34.2964 84.4242 34.312 84.4242 34.3433V38.9247H82.6251V34.2495C82.6251 33.3582 82.187 32.6702 81.1545 32.6702C80.2941 32.6546 79.5745 33.3582 79.5588 34.2182C79.5588 34.2651 79.5588 34.312 79.5588 34.359V38.9404L77.7754 38.9247Z" fill="black"/>
                      <path d="M91.5107 38.9247V31.2004H93.2629V32.1855C93.7479 31.4193 94.5926 30.9659 95.5 30.9815C96.4699 30.9346 97.3773 31.4663 97.7997 32.3419C98.3003 31.4506 99.2546 30.919 100.271 30.9815C101.664 30.9815 102.978 31.8728 102.978 33.9211V38.9247H101.257V34.2339C101.351 33.4677 100.819 32.7641 100.052 32.6546C99.9586 32.639 99.8647 32.639 99.7865 32.639C98.9104 32.639 98.1908 33.3582 98.1908 34.2495C98.1908 34.2808 98.1908 34.2964 98.1908 34.3277V38.9091H96.4074V34.2339C96.5012 33.4677 95.9693 32.7641 95.2028 32.6546C95.1089 32.639 95.015 32.639 94.9368 32.639C94.0764 32.6233 93.3568 33.327 93.3411 34.187C93.3411 34.2339 93.3411 34.2808 93.3411 34.3277V38.9091L91.5107 38.9247Z" fill="black"/>
                      <path d="M101.07 12.5309C101.586 12.5778 102.04 12.2182 102.086 11.7022C102.086 11.6709 102.086 11.6396 102.086 11.6084C102.024 11.0455 101.523 10.6233 100.96 10.6858C100.475 10.7327 100.1 11.1236 100.037 11.6084C100.037 12.1244 100.444 12.5309 100.96 12.5465C100.991 12.5465 101.038 12.5465 101.07 12.5309Z" fill="black"/>
                      <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill="black"/>
                      <path d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z" fill="black"/>
                      <path d="M27.4986 23.1025L26.8103 20.3818C26.3253 20.5069 25.8247 20.5851 25.3241 20.6007C24.8078 20.5538 24.2759 20.4913 23.7753 20.3818L23.0557 23.0713C23.8222 23.2902 24.6044 23.3996 25.4023 23.3996C26.1063 23.3996 26.8103 23.3058 27.4986 23.1025Z" fill="black"/>
                      <path d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z" fill="black"/>
                      <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6298 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0425C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="black"/>
                    </svg>

                    {/* Back button */}
                    <button
                      onClick={onClose}
                      className="w-11 h-11 rounded-full border border-black/18 bg-transparent flex items-center justify-center hover:bg-black/5 transition-colors"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 12L5 12M5 12L11 18M5 12L11 6"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Center title */}
                  <div className="text-black text-base font-medium text-center leading-[130%] max-w-[383px]">
                    {isLoggedIn ? 'Investor Journey for a Restaurant' : headerTitle}
                  </div>

                  {/* Right side - Sign in button (only for non-logged-in users) */}
                  {!isLoggedIn && (
                    <div className="absolute right-10 flex items-center">
                      <UAEPassLogin
                        onLogin={handleUAEPassLogin}
                        mode="quick"
                        defaultUserType="applicant"
                        trigger={
                          <span className="inline-flex cursor-pointer items-center transition-opacity hover:opacity-80">
                            <img
                              src="https://api.builder.io/api/v1/image/assets/TEMP/f35ba5a02338a961dd18f58928489d9e87ec7dc3?width=442"
                              alt="Sign in with UAE PASS"
                              className="h-8 rounded-full"
                            />
                          </span>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Container */}
              <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-87px)] p-8">
                <div className="w-full max-w-3xl bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
                  {/* Chat Header with Tabs */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-4 -mx-2">
                      {threads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setActiveThreadId(thread.id)}
                          className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                            activeThreadId === thread.id
                              ? "border-white text-white"
                              : "border-transparent text-white/60 hover:text-white hover:border-white/30",
                          )}
                        >
                          {thread.title}
                        </button>
                      ))}
                      <button
                        onClick={handleNewTab}
                        className="ml-4 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        aria-label="New Chat"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                        alt="AI Assistant"
                        className="w-16 h-16 rounded-full border border-[#54FFD4] object-cover"
                      />
                      <div className="flex-1">
                        <h2 className="text-white text-lg font-semibold">
                          AI Business
                        </h2>
                      </div>
                      <SoundVisualization />
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {activeThread?.messages.map((message) => {
                      const isJourneyIntro = Boolean(message.hasActions);

                      if (!isLoggedIn && isJourneyIntro) {
                        const promptMessage = {
                          ...message,
                          content: "Sign in with UAE Pass to generate your investor journey.",
                        };

                        return (
                          <div key={`${activeThread.id}-${message.id}`} className="space-y-4">
                            <MessageBubble
                              message={promptMessage}
                              onActionClick={(action) => {
                                if (action === "budget-ranges") {
                                  console.log("Budget ranges clicked");
                                }
                              }}
                            />

                            <UAEPassLogin
                              onLogin={handleUAEPassLogin}
                              mode="quick"
                              defaultUserType="applicant"
                              trigger={
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-200 group">
                                  <span className="text-white font-medium text-base">
                                    Let's get you logged in with UAE Pass
                                  </span>
                                  <img
                                    src="https://api.builder.io/api/v1/image/assets/TEMP/6af0c42146feff37d8c56f7d5b67c0ce1e2c12e1?width=348"
                                    alt="UAE Pass"
                                    className="w-[87px] h-[42px] rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </button>
                              }
                            />
                          </div>
                        );
                      }

                      const displayContent = isJourneyIntro
                        ? "I have generated an investor journey below that will assist you. Your journey, powered by AI."
                        : message.content;

                      const enrichedMessage =
                        displayContent === message.content
                          ? message
                          : { ...message, content: displayContent };

                      return (
                        <MessageBubble
                          key={`${activeThread.id}-${message.id}`}
                          message={enrichedMessage}
                          onActionClick={(action) => {
                            if (action === "budget-ranges") {
                              console.log("Budget ranges clicked");
                            }
                          }}
                        />
                      );
                    })}

                    {/* Show investor journey card after the last AI message */}
                    {isLoggedIn &&
                      activeThread?.view === "journey" &&
                      activeThread?.messages.length >= 3 &&
                      activeThread?.messages[2].hasActions && (
                        <InvestorJourneyCard
                          onClose={onClose}
                          onSetupBusiness={handleSetupBusiness}
                        />
                      )}

                    {/* Show discover experience content */}
                    {activeThread?.view === "discover-experience" && (
                      <div className="p-6">
                        <DiscoverExperienceView
                          category={category}
                          onSendMessage={handleSendMessage}
                          isStandalone={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Business License Portal */}
        {loggedInUser && showBusinessPortal && (
          <BusinessLicensePortalSimplified
            isOpen={showBusinessPortal}
            user={loggedInUser}
            onClose={() => setShowBusinessPortal(false)}
          />
        )}
      </AnimatePresence>
    </QueryClientProvider>
  );
}
