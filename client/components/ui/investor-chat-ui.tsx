import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { chatCardClass } from '@/lib/chat-style';
import { AIBusinessOrb } from '@/components/ui/ai-business-orb';
import { ENTREPRENEUR_PROFILE } from '@/lib/profile';

interface InvestorMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  rating?: number;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary';
    action: string;
  }>;
  investorData?: {
    businessType: string;
    licenseType: string;
    entrepreneur?: {
      name: string;
      title: string;
      avatar: string;
    };
  };
}

interface InvestorChatUIProps {
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
    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-0.5 sm:w-1 bg-[#54FFD4] rounded-full transition-all duration-300 hover:bg-[#54FFD4]/80"
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

const ActionButton = ({
  label,
  type,
  onClick
}: {
  label: string;
  type: 'primary' | 'secondary';
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        type === 'primary'
          ? "bg-white/20 shadow-md text-white"
          : "bg-white/10 text-white border border-white/20"
      )}
    >
      {label}
    </button>
  );
};

const InvestorMessageBubble = ({ message }: { message: InvestorMessage }) => {
  return (
    <div className={cn(
      "flex mb-4",
      message.isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[90%] px-4 py-4 rounded-xl text-sm leading-relaxed bg-white/10 backdrop-blur-md border border-white/20 shadow-lg",
        message.isAI ? "rounded-tl-sm" : "rounded-tr-sm"
      )}>
        {message.rating && <StarRating rating={message.rating} />}

        <div className="mb-3 text-white">{message.content}</div>

        {message.investorData && (
          <div className="bg-white/10 rounded-lg p-4 mt-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              {message.investorData.entrepreneur && (
                <>
                  <img
                    src={message.investorData.entrepreneur.avatar}
                    alt={message.investorData.entrepreneur.name}
                    className="w-16 h-16 rounded-full border-2 border-[#54FFD4]"
                  />
                  <div>
                  <h4 className="font-bold text-lg text-white">Investor Journey</h4>
                  <p className="text-white/80">
                    <span className="font-bold">{message.investorData.entrepreneur.name}</span>
                  </p>
                  <p className="text-white/70 text-sm">
                    {message.investorData.entrepreneur.title}
                  </p>
                </div>
                </>
              )}
            </div>

            <div className="text-white/90 mb-4">
              <p className="font-bold text-lg mb-2 text-white">Your journey, powered by AI</p>
              <p className="text-sm leading-relaxed text-white/90">
                Discover a clear path for investors to plan, apply for, and successfully open a restaurant.
                In just four seamless stages, watch {ENTREPRENEUR_PROFILE.name}, an F&B entrepreneur, go from a business idea to a thriving restaurant.
              </p>
            </div>
          </div>
        )}

        {message.actions && (
          <div className="flex flex-wrap gap-3 mt-4">
            {message.actions.map((action, index) => (
              <ActionButton
                key={index}
                label={action.label}
                type={action.type}
                onClick={() => console.log(`Action: ${action.action}`)}
              />
            ))}
          </div>
        )}
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

const queryClient = new QueryClient();

export function InvestorChatUI({ isOpen, onClose, category, title = "Polaris" }: InvestorChatUIProps) {
  const [messages, setMessages] = useState<InvestorMessage[]>([
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
      investorData: {
        businessType: 'Restaurant',
        licenseType: 'Commercial License for F&B',
        entrepreneur: {
          name: ENTREPRENEUR_PROFILE.name,
          title: ENTREPRENEUR_PROFILE.title,
          avatar: ENTREPRENEUR_PROFILE.avatar,
        },
      },
      actions: [
        { label: 'Explore more options', type: 'secondary', action: 'explore' },
        { label: 'Set up business', type: 'primary', action: 'setup' }
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nodeRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: InvestorMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/generate', { 
        message: inputValue,
        category: category,
        type: 'investor'
      });
      
      const aiResponse: InvestorMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        isAI: true,
        timestamp: new Date(),
        actions: response.data.actions,
        investorData: response.data.investorData
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorResponse: InvestorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I am having trouble connecting. Please try again later.',
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const backgroundImage = getCategoryBackground(category);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Draggable nodeRef={nodeRef} handle=".drag-handle">
              <motion.div
                ref={nodeRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl h-[85vh]"
              >
                {/* Background Image */}
                <div
                  className={chatCardClass(
                    "w-full h-full overflow-hidden relative"
                  )}
                  style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30" />
                  
                  {/* Chat Container */}
                  <div
                    className={chatCardClass(
                      "relative z-10 flex flex-col h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                    )}
                  >
                    {/* Header */}
                    <div className="drag-handle flex items-center justify-between p-6 border-b border-white/20 cursor-move">
                      <div className="flex items-center gap-4">
                        <AIBusinessOrb className="h-16 w-16" />
                        <div>
                          <h2 className="text-white text-xl font-bold">
                            {title}
                          </h2>
                          <p className="text-white/70 text-sm">Investment Research Assistant</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <SoundVisualization />
                        <button
                          onClick={onClose}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                      {messages.map((message) => (
                        <InvestorMessageBubble key={message.id} message={message} />
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/20 text-white rounded-xl rounded-tl-sm px-4 py-3 text-sm backdrop-blur-sm">
                            Researching investment opportunities...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Footer */}
                    <div className="p-6 border-t border-white/20">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask about investment opportunities..."
                          className="flex-1 bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#54FFD4]/50 focus:border-[#54FFD4] transition-colors backdrop-blur-sm"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim()}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                            inputValue.trim()
                              ? "bg-[#54FFD4] hover:bg-[#54FFD4]/80 text-black hover:scale-105"
                              : "bg-white/10 text-white/40 cursor-not-allowed"
                          )}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 8L14 2L10 8L14 14L2 8Z" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Draggable>
          </div>
        )}
      </AnimatePresence>
    </QueryClientProvider>
  );
}
