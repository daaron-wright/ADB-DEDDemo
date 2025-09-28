import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { conversationFlows } from '@/lib/conversations';

interface BusinessMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  rating?: number;
  hasActions?: boolean;
}

interface BusinessChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  title?: string;
}

type ChatView = 'journey' | 'discover-experience';

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

const KHALID_AVATAR = 'https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131';

const MessageBubble = ({ message }: { message: BusinessMessage }) => {
  return (
    <div className={cn(
      "flex mb-4 gap-3 items-end",
      message.isAI ? "justify-start" : "justify-end"
    )}>
      {message.isAI && (
         <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
            alt="AI Assistant"
            className="w-10 h-10 rounded-full border border-[#54FFD4] object-cover"
          />
      )}
      <div className={cn(
        "max-w-[80%] px-4 py-4 rounded-2xl text-base leading-relaxed bg-white/20 backdrop-blur-sm border border-white/10",
        message.isAI ? "rounded-bl-sm" : "rounded-br-sm"
      )}>
        {message.rating && <StarRating rating={message.rating} />}
        <div className="text-white">{message.content}</div>
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

const InvestorJourneyCard = ({ onClose, onSetupBusiness }: { onClose: () => void; onSetupBusiness: () => void }) => {
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
            <h4 className="text-white text-lg font-semibold">Investor Journey</h4>
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
          Discover a clear path for investors to plan, apply for, and successfully open a restaurant. 
          In just four seamless stages, watch Khalid, an F&B entrepreneur, go from a business idea to a thriving restaurant.
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
    restaurants: "https://api.builder.io/api/v1/image/assets/TEMP/749c7b38ea45266634e7fb0c1ba7745f62d35ec3?width=2390",
    'fast-food': "https://api.builder.io/api/v1/image/assets/TEMP/93a8ccdd2ba263b5df1fa8ac003cfbbe0f2a04bf?width=766",
    branch: "https://api.builder.io/api/v1/image/assets/TEMP/474e9427353e36aa9e243c53c1ca9efe1f850f1a?width=788",
    'retail-store': "https://api.builder.io/api/v1/image/assets/TEMP/28a07c4a89a2e43c77d74ad46a6ad88ca8d969b3?width=616"
  };
  return backgrounds[category as keyof typeof backgrounds] || backgrounds.restaurants;
};

const getCategoryTitle = (category: string) => {
  const titles = {
    restaurants: "Commercial License for Restaurants",
    'fast-food': "Commercial License for Fast Food",
    branch: "Dual License for Branch",
    'retail-store': "Commercial License for Retail Store"
  };
  return titles[category as keyof typeof titles] || "Commercial License";
};

const getCategoryName = (category: string) => {
  const names = {
    restaurants: "Restaurants",
    'fast-food': "Fast Food",
    branch: "Branch",
    'retail-store': "Retail Store"
  };
  return names[category as keyof typeof names] || "Business";
};

const DISCOVER_EXPERIENCE_BACKGROUND = 'https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3bd661b83f654e47b8d088613c4aa854?format=webp&width=800';

const DiscoverExperienceView = ({ category }: { category: string }) => {
  return (
    <div className="relative w-full min-h-[60vh] flex items-center justify-center p-8">
      {/* Gradient Background with SVG */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1194 833"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="filter0_f_0_476" x="-1931" y="-1448" width="3110" height="2519" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur_0_476"/>
            </filter>
            <filter id="filter1_f_0_476" x="-743.381" y="-875.229" width="1960.57" height="1815.68" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur_0_476"/>
            </filter>
            <filter id="filter2_f_0_476" x="-886" y="-1599" width="1587.52" height="2140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="140" result="effect1_foregroundBlur_0_476"/>
            </filter>
            <filter id="filter3_f_0_476" x="-730" y="-1573" width="1720.17" height="2196" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur_0_476"/>
            </filter>
            <linearGradient id="paint0_linear_0_476" x1="237" y1="152" x2="-275" y2="-232" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0E0A2B" stopOpacity="0"/>
              <stop offset="1" stopColor="#0E0A2B"/>
            </linearGradient>
            <clipPath id="clip0_0_476">
              <rect width="1194" height="853" fill="white"/>
            </clipPath>
          </defs>
          <g clipPath="url(#clip0_0_476)">
            <rect width="1194" height="853" fill="#0B0C28"/>
            <g filter="url(#filter0_f_0_476)">
              <ellipse cx="-376" cy="-188.5" rx="1155" ry="859.5" fill="#0E0A2B"/>
            </g>
            <g filter="url(#filter1_f_0_476)">
              <ellipse cx="236.903" cy="32.6109" rx="613.417" ry="467.069" transform="rotate(30.0789 236.903 32.6109)" fill="#0919B6"/>
            </g>
            <g filter="url(#filter2_f_0_476)">
              <path d="M169 -506.5C169 -70.1951 693.262 261 231 261C-231.262 261 -606 -92.6951 -606 -529C-606 -965.305 -231.262 -1319 231 -1319C693.262 -1319 169 -942.805 169 -506.5Z" fill="#07D2FB"/>
            </g>
            <g filter="url(#filter3_f_0_476)">
              <path d="M-79 -455.5C-79 -70.0052 773 223 476 223C30.8585 223 -330 -89.5052 -330 -475C-330 -860.495 30.8585 -1173 476 -1173C921.141 -1173 -79 -840.995 -79 -455.5Z" fill="#21FCC6"/>
            </g>
            <g style={{mixBlendMode: 'hue'}}>
              <rect x="-275" y="-232" width="1024" height="768" fill="url(#paint0_linear_0_476)"/>
            </g>
          </g>
        </svg>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Discover Your Experience
        </h2>
        <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
          Welcome to your personalized investment journey for {getCategoryName(category).toLowerCase()}.
          Explore opportunities, understand requirements, and take the next steps towards your business goals.
        </p>

        {/* Action buttons or additional content can be added here */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-lg hover:bg-white/30 transition-colors">
            Explore Opportunities
          </button>
          <button className="px-8 py-4 rounded-full bg-gradient-to-r from-[#07D2FB] to-[#21FCC6] text-white font-semibold text-lg hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

export function BusinessChatUI({ isOpen, onClose, category, title = "AI Business" }: BusinessChatUIProps) {
  const [currentView, setCurrentView] = useState<ChatView>('journey');

  const getInitialMessages = () => {
    return conversationFlows[category as keyof typeof conversationFlows] || conversationFlows.general;
  }

  const [messages, setMessages] = usePersistentState<BusinessMessage[]>(
    `business-chat-messages-${category}`,
    getInitialMessages()
  );

  const handleSetupBusiness = () => {
    setCurrentView('discover-experience');
  };

  useEffect(() => {
    // Reset messages when category changes to ensure the correct flow is loaded
    setMessages(getInitialMessages());
    setCurrentView('journey'); // Reset view when category changes
  }, [category]);

  if (!isOpen) return null;

  const backgroundImage = currentView === 'discover-experience' ? DISCOVER_EXPERIENCE_BACKGROUND : getCategoryBackground(category);
  const categoryTitle = currentView === 'discover-experience'
    ? `Your Investment Journey for ${getCategoryName(category)}`
    : getCategoryTitle(category);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Background overlay */}
              <div className="absolute inset-0 bg-black/30" />
              
              {/* Header */}
              <div className="relative z-10 w-full h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
                <div className="flex items-center justify-between px-10 py-5 h-full">
                  {/* Left side - Logo and back button */}
                  <div className="flex items-center gap-4">
                    {/* Tamm Logo */}
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

                  {/* Center title */}
                  <div className="text-white text-base font-medium text-center">
                    {categoryTitle}
                  </div>

                  {/* Right side - Sign in button */}
                  <div className="flex items-center">
                    <img 
                      src="https://api.builder.io/api/v1/image/assets/TEMP/f35ba5a02338a961dd18f58928489d9e87ec7dc3?width=442"
                      alt="Sign in with UAE PASS"
                      className="h-8 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Chat Container */}
              <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-87px)] p-8">
                <div className="w-full max-w-3xl bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
                  {/* Chat Header */}
                  <div className="flex items-center gap-4 p-6 border-b border-white/10">
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

                  {/* Messages */}
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    
                    {/* Show investor journey card after the last AI message */}
                    {currentView === 'journey' && messages.length >= 3 && messages[2].hasActions && (
                      <InvestorJourneyCard onClose={onClose} onSetupBusiness={handleSetupBusiness} />
                    )}

                    {/* Show discover experience content */}
                    {currentView === 'discover-experience' && (
                      <DiscoverExperienceView category={category} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </QueryClientProvider>
  );
}
