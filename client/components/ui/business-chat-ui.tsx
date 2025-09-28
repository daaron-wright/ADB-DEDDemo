import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { usePersistentState } from '@/hooks/use-persistent-state';

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

const MessageBubble = ({ message }: { message: BusinessMessage }) => {
  return (
    <div className={cn(
      "flex mb-4",
      message.isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[90%] px-4 py-4 rounded-2xl text-base leading-relaxed bg-white/20 backdrop-blur-sm border border-white/10",
        message.isAI ? "rounded-tl-sm" : "rounded-tr-sm"
      )}>
        {message.rating && <StarRating rating={message.rating} />}
        <div className="text-white">{message.content}</div>
      </div>
    </div>
  );
};

const InvestorJourneyCard = () => {
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
        <button className="px-6 py-3 rounded-full border-2 border-white text-white font-semibold text-base hover:bg-white/10 transition-colors">
          Explore more options
        </button>
        <button className="px-6 py-3 rounded-full bg-teal-gradient text-white font-semibold text-base hover:opacity-90 transition-opacity">
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

const queryClient = new QueryClient();

export function BusinessChatUI({ isOpen, onClose, category, title = "AI Business" }: BusinessChatUIProps) {
  const [messages, setMessages] = useState<BusinessMessage[]>([
    {
      id: '1',
      content: 'I want to invest my money and open a restaurant business in Abu Dhabi. What commercial activities align with my business type and can you help me set up?',
      isAI: false,
      timestamp: new Date(),
      rating: 5,
    },
    {
      id: '2',
      content: 'Opening a restaurant in Abu Dhabi involves several steps: planning, licensing, approvals, staffing, fit-out, and operations.',
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: '3',
      content: 'You will need a Commercial License for F&B. I have generated an investor journey below that will assist you.',
      isAI: true,
      timestamp: new Date(),
      hasActions: true,
    }
  ]);

  if (!isOpen) return null;

  const backgroundImage = getCategoryBackground(category);
  const categoryTitle = getCategoryTitle(category);

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
                    <button
                      onClick={onClose}
                      className="w-11 h-11 rounded-full border border-white/18 bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12L5 12M5 12L11 18M5 12L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    {/* Tamm Logo */}
                    <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M65.7295 29.4802V38.9245H63.8522V29.4802H60.2384V27.6821H69.359V29.4802H65.7295Z" fill="white"/>
                      <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill="white"/>
                      <path d="M77.7755 38.9245V31.2002H79.5277V32.1852C80.0126 31.4191 80.8574 30.9656 81.7648 30.9813C82.7347 30.9344 83.6421 31.466 84.0645 32.3416C84.5651 31.4503 85.535 30.9187 86.5519 30.9813C87.9442 30.9813 89.2583 31.8725 89.2583 33.9209V38.9245H87.4905V34.2336C87.4905 33.3267 87.0369 32.6543 86.02 32.6543C85.1439 32.6543 84.4243 33.3736 84.4243 34.2649C84.4243 34.2961 84.4243 34.3118 84.4243 34.343V38.9245H82.6252V34.2492C82.6252 33.358 82.1872 32.67 81.1547 32.67C80.2942 32.6543 79.5746 33.358 79.5589 34.218C79.5589 34.2649 79.5589 34.3118 79.5589 34.3587V38.9401L77.7755 38.9245Z" fill="white"/>
                      <path d="M91.511 38.9245V31.2002H93.2631V32.1852C93.7481 31.4191 94.5929 30.9656 95.5003 30.9813C96.4702 30.9344 97.3775 31.466 97.7999 32.3416C98.3006 31.4503 99.2549 30.9187 100.272 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.053 32.6543C99.9588 32.6387 99.865 32.6387 99.7868 32.6387C98.9107 32.6387 98.191 33.358 98.191 34.2492C98.191 34.2805 98.191 34.2961 98.191 34.3274V38.9088H96.4076V34.2336C96.5015 33.4674 95.9696 32.7638 95.203 32.6543C95.1091 32.6387 95.0153 32.6387 94.9371 32.6387C94.0766 32.6231 93.357 33.3267 93.3414 34.1867C93.3414 34.2336 93.3414 34.2805 93.3414 34.3274V38.9088L91.511 38.9245Z" fill="white"/>
                      <path d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z" fill="white"/>
                      <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill="white"/>
                      <path d="M69.6406 18.3629C69.6406 18.2378 69.6406 18.1127 69.6406 17.972C69.6406 15.8142 68.3264 14.3756 66.3553 14.3756C64.7126 14.3131 63.289 15.5327 63.1013 17.1745C61.2866 17.2683 60.2384 18.4723 60.2384 20.505V22.741H62.0062V20.8021C62.0062 19.8014 62.3347 19.1134 63.1326 19.0039C63.4455 20.5207 64.8065 21.5839 66.3396 21.5057C67.3878 21.5526 68.3734 21.0679 68.9991 20.2236H102.963V13.5782H101.179V18.3629H69.6406ZM67.8571 17.9251C67.8571 18.957 67.2939 19.645 66.3553 19.645C65.5105 19.645 64.8065 18.9727 64.8065 18.1127C64.8065 18.0501 64.8065 17.9876 64.8221 17.9251C64.8221 16.8774 65.4323 16.1738 66.3553 16.1738C67.2626 16.1738 67.8571 16.8774 67.8571 17.9251Z" fill="white"/>
                    </svg>
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
                    {messages.length >= 3 && messages[2].hasActions && (
                      <InvestorJourneyCard />
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
