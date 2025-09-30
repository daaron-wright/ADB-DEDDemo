import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import { Badge } from "@/components/ui/badge";
import { AI_ASSISTANT_PROFILE } from "@/lib/profile";
import { CuisinePopularityChart, CompetitorAnalysisChart, VisitorTasteTrendsChart, DemographicsCard } from "@/components/ui/data-visualizations";

interface PropertyCard {
  id: string;
  title: string;
  location: string;
  price: string;
  currency: string;
  rating: number;
  image: string;
  status?: string;
}

interface ConsultationMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  type?: "text" | "property-cards" | "insights" | "investor-journey" | "cuisine-analysis" | "competitor-analysis" | "demographics" | "market-trends";
  data?: any;
}

interface BusinessConsultationChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const PROPERTY_CARDS: PropertyCard[] = [
  {
    id: "1",
    title: "Retail Opportunity | Abu Dhabi Corniche | Ready Nov 2025",
    location: "Abu Dhabi Corniche",
    price: "640,000",
    currency: "AED",
    rating: 4.9,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/321de87c306c0308a02c60a25803d7fd29f66f22?width=600",
  },
  {
    id: "2", 
    title: "Retail Opportunity | Canal View | Ready to Move",
    location: "Canal View",
    price: "580,000",
    currency: "AED",
    rating: 4.7,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/90b42e755964109a96d26e28153d3260c27dab3c?width=600",
  },
  {
    id: "3",
    title: "Retail Space | Corniche Beach, Abu Dhabi", 
    location: "Corniche Beach",
    price: "495,000",
    currency: "AED",
    rating: 4.3,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/a9f0bf6d758ce0797379785bd5ae18dfc4113f43?width=600",
  }
];

const PropertyCardComponent = ({ property }: { property: PropertyCard }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={chatCardClass("w-full max-w-xs bg-white/10 border border-white/20 overflow-hidden")}
  >
    <div className="relative">
      <img 
        src={property.image} 
        alt={property.title}
        className="w-full h-44 object-cover"
      />
      <div className="absolute top-3 left-3 flex items-center gap-1">
        <div className="flex items-center justify-center w-4 h-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M7.99965 1L5.72465 5.61L0.639648 6.345L4.31965 9.935L3.44965 15L7.99965 12.61L12.5496 15L11.6796 9.935L15.3596 6.35L10.2746 5.61L7.99965 1Z" 
              fill="#FFE100"
            />
          </svg>
        </div>
        <span className="text-white text-lg font-normal opacity-70">{property.rating}</span>
      </div>
    </div>
    
    <div className="p-6 space-y-4">
      <p className="text-white text-base font-normal leading-[120%] tracking-[0.051px]">
        {property.title}
      </p>
      
      <div className="flex items-center gap-2">
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
          <g clipPath="url(#clip0_dirham)">
            <path 
              d="M19.8428 8.49013L19.9994 8.63411V8.19651C19.9994 7.23289 19.3081 6.44838 18.459 6.44838H17.1013C16.1513 2.58029 12.915 0.5 8.10057 0.5C5.0348 0.5 4.64099 0.5 1.73762 0.5C1.73762 0.5 2.60933 1.21591 2.60933 3.47022V6.45065H1.00394C0.691915 6.45065 0.399026 6.33275 0.156594 6.10998L0 5.96601V6.4036C0 7.36779 0.691335 8.15173 1.54042 8.15173H2.60991V9.85167H1.00452C0.692495 9.85167 0.399606 9.73434 0.157174 9.511L0.000579979 9.36703V9.80406C0.000579979 10.7677 0.691915 11.551 1.541 11.551H2.61049V14.6624C2.61049 16.8532 1.73878 17.5 1.73878 17.5H8.10173C13.0675 17.5 16.2006 15.405 17.1134 11.5493H18.9961C19.3081 11.5493 19.601 11.6667 19.8434 11.8894L20 12.0334V11.5964C20 10.6328 19.3087 9.84884 18.4596 9.84884H17.3634C17.382 9.57222 17.3918 9.28937 17.3918 8.99858C17.3918 8.7078 17.3814 8.42551 17.3623 8.14889H18.9961C19.3075 8.14889 19.601 8.26623 19.8434 8.48956L19.8428 8.49013ZM5.21691 1.35082H7.8767C11.4552 1.35082 13.528 2.89999 14.1463 6.44895L5.21691 6.45009V1.35082ZM7.89932 16.6509H5.21633V11.5505L14.1405 11.5493C13.5622 14.761 11.7005 16.559 7.89932 16.6509ZM14.3446 9.00028C14.3446 9.29107 14.3382 9.57449 14.3249 9.84997L5.21691 9.85111V8.15116L14.3255 8.15003C14.3382 8.42438 14.3446 8.70723 14.3446 9.00028Z" 
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_dirham">
              <rect width="20" height="17" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
          </defs>
        </svg>
        <span className="text-white text-xl font-bold leading-[100%] tracking-[0.064px]">
          {property.price} / year
        </span>
      </div>
    </div>
  </motion.div>
);

const InsightsCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={chatCardClass("w-full bg-white/10 border border-white/20 p-6")}
  >
    <h3 className="text-white text-xl font-semibold mb-4">Market Insights</h3>
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-white text-3xl font-bold">85-90%</div>
          <div className="text-white/70 text-sm">Expats in area</div>
        </div>
        <div>
          <div className="text-white text-3xl font-bold">2.5x</div>
          <div className="text-white/70 text-sm">Eat out weekly</div>
        </div>
        <div>
          <div className="text-white text-3xl font-bold">78%</div>
          <div className="text-white/70 text-sm">Who dine out</div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-white text-lg font-semibold mb-3">Gap Analysis</h4>
        <div className="space-y-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-lg">
            <div className="text-white font-semibold">Emirati Fusion Cuisine</div>
            <div className="text-white/70 text-sm">Japanese influences creating new trend</div>
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
              High Opportunity
            </Badge>
          </div>
          <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <div className="text-white font-semibold">Formal Evening Dining</div>
            <div className="text-white/70 text-sm">Waterfront locations with luxury experience</div>
            <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-blue-400/30">
              Medium Opportunity
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const InvestorJourneyCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={chatCardClass("w-full bg-white/10 border border-white/20 overflow-hidden")}
  >
    <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-[#54FFD4] overflow-hidden">
          <img 
            src={AI_ASSISTANT_PROFILE.avatar} 
            alt="Khalid"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-white text-xl font-bold">Investor Journey</h3>
          <p className="text-white/80">Khalid Entrepreneur</p>
        </div>
      </div>
    </div>
    
    <div className="p-6 space-y-4">
      <div>
        <h4 className="text-white text-lg font-bold mb-2">Your journey, powered by AI</h4>
        <p className="text-white/80 text-sm leading-relaxed">
          Discover a clear path for investors to plan, apply for, and successfully open a restaurant. 
          In just four seamless stages, watch Khalid, an F&B entrepreneur, go from a business idea to a thriving restaurant.
        </p>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-full text-sm font-semibold hover:from-teal-500 hover:to-teal-700 transition-colors">
          Start a Demo
        </button>
        <button className="px-4 py-2 border-2 border-white text-white rounded-full text-sm font-semibold hover:bg-white/10 transition-colors">
          Explore more options
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-full text-sm font-semibold hover:from-teal-500 hover:to-teal-700 transition-colors">
          Set up business
        </button>
      </div>
    </div>
  </motion.div>
);

const BusinessConsultationChat: React.FC<BusinessConsultationChatProps> = ({
  isOpen,
  onClose,
  className = ""
}) => {
  const [messages, setMessages] = useState<ConsultationMessage[]>([
    {
      id: "1",
      content: "I want to invest my money and open a restaurant business in Abu Dhabi. What commercial activities align with my business type and can you help me set up?",
      isAI: false,
      timestamp: new Date(),
    },
    {
      id: "2", 
      content: "Opening a restaurant in Abu Dhabi involves several steps: planning, licensing, approvals, staffing, fit-out, and operations.",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "3",
      content: "You will need a Commercial License for F&B. I have generated an investor journey below that will assist you.",
      isAI: true,
      timestamp: new Date(),
      type: "investor-journey"
    },
    {
      id: "4",
      content: "Here are some retail locations available to rent.",
      isAI: true,
      timestamp: new Date(),
      type: "property-cards"
    },
    {
      id: "5",
      content: "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers. Here are key insights for the F&B sector:",
      isAI: true,
      timestamp: new Date(),
      type: "insights"
    },
    {
      id: "6",
      content: "Let me show you the cuisine popularity analysis for Abu Dhabi:",
      isAI: true,
      timestamp: new Date(),
      type: "cuisine-analysis"
    },
    {
      id: "7",
      content: "Here's a detailed competitor analysis for the area:",
      isAI: true,
      timestamp: new Date(),
      type: "competitor-analysis"
    },
    {
      id: "8",
      content: "Key demographics and market trends for Abu Dhabi Corniche:",
      isAI: true,
      timestamp: new Date(),
      type: "demographics"
    }
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: ConsultationMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isAI: false,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ConsultationMessage = {
        id: (Date.now() + 1).toString(),
        content: "I understand you're interested in exploring this further. Let me provide more detailed insights about the Abu Dhabi restaurant market and investment opportunities.",
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            "w-full max-w-6xl max-h-[90vh] overflow-hidden",
            chatCardClass("bg-white/10 border border-white/20"),
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <img
                src={AI_ASSISTANT_PROFILE.avatar}
                alt={AI_ASSISTANT_PROFILE.name}
                className="w-12 h-12 rounded-full border-2 border-[#54FFD4]"
              />
              <div>
                <h2 className="text-white text-lg font-bold">Business Consultation</h2>
                <p className="text-white/70 text-sm">AI Business Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.isAI ? "justify-start" : "justify-end"
                )}
              >
                {message.isAI && (
                  <img
                    src={AI_ASSISTANT_PROFILE.avatar}
                    alt="AI"
                    className="w-8 h-8 rounded-full border border-[#54FFD4] flex-shrink-0"
                  />
                )}
                
                <div className={cn(
                  "max-w-lg",
                  message.isAI ? "order-2" : "order-1"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl",
                    message.isAI 
                      ? "bg-white/10 border border-white/20" 
                      : "bg-black/30 border border-white/20"
                  )}>
                    <p className="text-white text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  
                  {/* Special content based on message type */}
                  {message.type === "property-cards" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {PROPERTY_CARDS.map((property) => (
                        <PropertyCardComponent key={property.id} property={property} />
                      ))}
                    </div>
                  )}
                  
                  {message.type === "insights" && (
                    <div className="mt-4">
                      <InsightsCard />
                    </div>
                  )}
                  
                  {message.type === "investor-journey" && (
                    <div className="mt-4">
                      <InvestorJourneyCard />
                    </div>
                  )}

                  {message.type === "cuisine-analysis" && (
                    <div className="mt-4">
                      <CuisinePopularityChart />
                    </div>
                  )}

                  {message.type === "competitor-analysis" && (
                    <div className="mt-4">
                      <CompetitorAnalysisChart />
                    </div>
                  )}

                  {message.type === "demographics" && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <DemographicsCard />
                      <VisitorTasteTrendsChart />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about business setup, market insights, or investment opportunities..."
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#54FFD4]/50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-full font-semibold hover:from-teal-500 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BusinessConsultationChat;
