import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { conversationFlows } from '@/lib/conversations';
import { SummaryDashboard } from './summary-dashboard';
import { UAEPassLogin } from './uae-pass-login';
import { BusinessLicensePortal } from './business-license-portal';

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

interface ChatThread {
  id: string;
  title: string;
  messages: BusinessMessage[];
  view: ChatView;
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

const KHALID_AVATAR = 'https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131';

const MessageBubble = ({ message, onActionClick }: { message: BusinessMessage; onActionClick?: (action: string) => void }) => {
  const shouldShowBudgetButton = message.isAI && message.content.includes('AED 10,000 to AED 30,000');

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
        "max-w-[80%] flex flex-col gap-3",
        message.isAI ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "px-4 py-4 rounded-2xl text-base leading-relaxed bg-white/20 backdrop-blur-sm border border-white/10",
          message.isAI ? "rounded-bl-sm" : "rounded-br-sm"
        )}>
          {message.rating && <StarRating rating={message.rating} />}
          <div className="text-white">{message.content}</div>
        </div>

        {/* Budget ranges button */}
        {shouldShowBudgetButton && onActionClick && (
          <button
            onClick={() => onActionClick('budget-ranges')}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26.9998 3.00003H4.99976C4.46932 3.00003 3.96061 3.21074 3.58554 3.58582C3.21047 3.96089 2.99976 4.4696 2.99976 5.00003V27C2.99976 27.5305 3.21047 28.0392 3.58554 28.4142C3.96061 28.7893 4.46932 29 4.99976 29H26.9998C27.5302 29 28.0389 28.7893 28.414 28.4142C28.789 28.0392 28.9998 27.5305 28.9998 27V5.00003C28.9998 4.4696 28.789 3.96089 28.414 3.58582C28.0389 3.21074 27.5302 3.00003 26.9998 3.00003ZM26.9998 5.00003V9.00003H4.99976V5.00003H26.9998ZM16.9998 11H26.9998V18H16.9998V11ZM14.9998 18H4.99976V11H14.9998V18ZM4.99976 20H14.9998V27H4.99976V20ZM16.9998 27V20H26.9998V27H16.9998Z" fill="#169F9F"/>
              </svg>
            </div>
            <span className="text-black text-sm font-semibold">Budget ranges</span>
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

const DISCOVER_EXPERIENCE_BACKGROUND = 'https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F9b0dc1e702cd47b081613f3972914c00?format=webp&width=800';

const DiscoverExperienceView = ({ category, onSendMessage, isStandalone = false }: { category: string; onSendMessage: (message: string) => void; isStandalone?: boolean }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(isStandalone ? 'Ask me...' : 'I want to look at the Cornich');

  const conversationMessages = [
    {
      id: 'user-1',
      content: 'Where are existing establishments located for specific activities (on a heat map)?',
      isAI: false,
      timestamp: new Date()
    },
    {
      id: 'ai-1',
      content: 'I have created a heat map for the top areas and existing businesses',
      isAI: true,
      timestamp: new Date()
    },
    {
      id: 'user-2',
      content: 'Interesting looking at this in a map',
      isAI: false,
      timestamp: new Date()
    }
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
            Get detailed information about costs, demographics, and requirements for your business setup in Abu Dhabi.
          </p>

          {/* Chat Input */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim() && inputValue !== 'Ask me...') {
              onSendMessage(inputValue.trim());
              setInputValue('Ask me...');
            }
          }}>
            <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 max-w-md mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => inputValue === 'Ask me...' && setInputValue('')}
                onBlur={() => !inputValue && setInputValue('Ask me...')}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
                placeholder="Ask me..."
              />
              <div className="flex items-center gap-2">
                {/* Send button */}
                <button
                  type="submit"
                  className="p-1 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {/* Microphone icon */}
                <div className="w-4 h-4 flex items-center justify-center text-white/70">
                  <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C5.63276 1.36502 5.25134 1.20687 4.85352 1.20687Z" fill="white"/>
                  </svg>
                </div>
                {/* Keyboard icon */}
                <div className="w-4 h-4 flex items-center justify-center text-white/70">
                  <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z" fill="white"/>
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
          <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-black/30 backdrop-blur-sm border border-white/10">
            <div className="text-white text-sm leading-relaxed">
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
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white/20 backdrop-blur-sm border border-white/10">
            <div className="text-white text-sm leading-relaxed">
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
                <div className="absolute w-8 h-8 rounded-full" style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)',
                  top: '35%',
                  left: '30%'
                }} />
                <div className="absolute w-6 h-6 rounded-full" style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)',
                  top: '40%',
                  left: '15%'
                }} />

                {/* Orange density circles */}
                <div className="absolute w-7 h-7 rounded-full" style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)',
                  top: '25%',
                  left: '10%'
                }} />
                <div className="absolute w-7 h-7 rounded-full" style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)',
                  top: '55%',
                  left: '30%'
                }} />
                <div className="absolute w-8 h-8 rounded-full" style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)',
                  top: '25%',
                  right: '20%'
                }} />

                {/* Yellow density circle */}
                <div className="absolute w-7 h-7 rounded-full" style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(251, 255, 0, 0.4) 0%, rgba(247, 255, 0, 0) 100%)',
                  top: '15%',
                  right: '25%'
                }} />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8L15 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 3V9H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13L12 17L8 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* User Response */}
        <div className="flex justify-end">
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-sm bg-black/30 backdrop-blur-sm border border-white/10">
            <div className="text-white text-sm leading-relaxed">
              {conversationMessages[2].content}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="mt-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
          }
        }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
              placeholder="Ask me..."
            />
            <div className="flex items-center gap-2">
              {/* Send button */}
              <button
                type="submit"
                className="p-1 rounded-full hover:bg-white/10 text-white/70 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Microphone icon */}
              <div className="w-4 h-4 flex items-center justify-center text-white/70">
                <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C5.63276 1.36502 5.25134 1.20687 4.85352 1.20687Z" fill="white"/>
                </svg>
              </div>
              {/* Keyboard icon */}
              <div className="w-4 h-4 flex items-center justify-center text-white/70">
                <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Heat Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-gray-800/50 border border-white/10 rounded-3xl w-full h-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-white text-xl font-semibold">Abu Dhabi Business Heat Map</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="relative p-6 flex-grow overflow-y-auto">
              <div className="relative w-full aspect-[200/139] rounded-2xl overflow-hidden shadow-lg">
                {/* Background Map */}
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/df351a3a49f1c6b9b74765965e6ddb3ecf6799d7?width=1600"
                  alt="Abu Dhabi Map"
                  className="w-full h-full object-cover"
                />

                {/* Heat Map Density Circles with Hover Areas */}
                <div className="absolute inset-0">
                  {/* Khalifa City Area - Red Circle */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ left: '35%', top: '28%', width: '26%', height: '38%' }}
                    onMouseEnter={() => setHoveredLocation('khalifa-city')}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <svg viewBox="0 0 212 212" className="w-full h-full">
                      <circle cx="106" cy="106" r="105" fill="url(#redGradient)" />
                      <defs>
                        <radialGradient id="redGradient">
                          <stop stopColor="#FF0000" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    {hoveredLocation === 'khalifa-city' && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm whitespace-nowrap z-10">
                        <div className="font-semibold">Khalifa City</div>
                        <div>Average visitors: 1800-2500</div>
                        <div>Weekly footfall: 25-35K</div>
                      </div>
                    )}
                  </div>

                  {/* Marina Area - Red Circle */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ left: '18%', top: '38%', width: '24%', height: '34%' }}
                    onMouseEnter={() => setHoveredLocation('marina')}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <svg viewBox="0 0 190 190" className="w-full h-full">
                      <circle cx="95" cy="95" r="94" fill="url(#redGradient2)" />
                      <defs>
                        <radialGradient id="redGradient2">
                          <stop stopColor="#FF0000" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    {hoveredLocation === 'marina' && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm whitespace-nowrap z-10">
                        <div className="font-semibold">Abu Dhabi Marina</div>
                        <div>Average visitors: 450-700</div>
                        <div>Weekly footfall: 40-55K</div>
                      </div>
                    )}
                  </div>

                  {/* Central Area - Orange Circle */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ left: '18%', top: '20%', width: '22%', height: '32%' }}
                    onMouseEnter={() => setHoveredLocation('central')}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <svg viewBox="0 0 177 177" className="w-full h-full">
                      <circle cx="88" cy="88" r="88" fill="url(#orangeGradient)" />
                      <defs>
                        <radialGradient id="orangeGradient">
                          <stop stopColor="#FF9500" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    {hoveredLocation === 'central' && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm whitespace-nowrap z-10">
                        <div className="font-semibold">Central District</div>
                        <div>Average visitors: 900-1500</div>
                        <div>Weekly footfall: 60-75K</div>
                      </div>
                    )}
                  </div>

                  {/* Baniyas Area - Orange Circle */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ left: '35%', top: '64%', width: '22%', height: '32%' }}
                    onMouseEnter={() => setHoveredLocation('baniyas')}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <svg viewBox="0 0 177 177" className="w-full h-full">
                      <circle cx="88" cy="88" r="88" fill="url(#orangeGradient2)" />
                      <defs>
                        <radialGradient id="orangeGradient2">
                          <stop stopColor="#FF9500" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    {hoveredLocation === 'baniyas' && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm whitespace-nowrap z-10">
                        <div className="font-semibold">Baniyas</div>
                        <div>Average visitors: 200-300</div>
                        <div>Weekly footfall: 60-75K</div>
                      </div>
                    )}
                  </div>

                  {/* Corniche Area - Large Orange Circle */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ left: '54%', top: '13%', width: '31%', height: '45%' }}
                    onMouseEnter={() => setHoveredLocation('corniche')}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <svg viewBox="0 0 249 249" className="w-full h-full">
                      <circle cx="124" cy="124" r="124" fill="url(#orangeGradientLarge)" />
                      <defs>
                        <radialGradient id="orangeGradientLarge">
                          <stop stopColor="#FF9500" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    {hoveredLocation === 'corniche' && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm whitespace-nowrap z-10">
                        <div className="font-semibold">The Corniche</div>
                        <div>Average visitors: 2000+</div>
                        <div>Weekly footfall: 100K+</div>
                      </div>
                    )}
                  </div>

                  {/* Coastal Area - Yellow Circle */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ left: '52%', top: '-5%', width: '25%', height: '32%' }}
                    onMouseEnter={() => setHoveredLocation('coastal')}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <svg viewBox="0 0 203 177" className="w-full h-full">
                      <circle cx="101" cy="75" r="101" fill="url(#yellowGradient)" />
                      <defs>
                        <radialGradient id="yellowGradient">
                          <stop stopColor="#FBFF00" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#F7FF00" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    {hoveredLocation === 'coastal' && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm whitespace-nowrap z-10">
                        <div className="font-semibold">Coastal District</div>
                        <div>Average visitors: 800-1200</div>
                        <div>Weekly footfall: 35-50K</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Statistics Panel */}
              <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h4 className="text-white text-lg font-semibold mb-1">The Corniche</h4>
                    <p className="text-white/70 text-sm">Average weekly footfall</p>
                  </div>

                  <div className="flex items-end gap-6">
                    <div className="text-center">
                      <div className="text-white/70 text-xs mb-1">Khalifa City</div>
                      <div className="text-white text-2xl font-bold">25-35K</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/70 text-xs mb-1">Abu Dhabi Marina</div>
                      <div className="text-white text-2xl font-bold">40-55K</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/70 text-xs mb-1">Baniyas</div>
                      <div className="text-white text-2xl font-bold">60-75K</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/70 text-xs mb-1">Corniche</div>
                      <div className="text-white text-2xl font-bold">100K+</div>
                    </div>
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

export function BusinessChatUI({ isOpen, onClose, category, title = "AI Business" }: BusinessChatUIProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showSummaryDashboard, setShowSummaryDashboard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialMessages = conversationFlows[category as keyof typeof conversationFlows] || conversationFlows.general;
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: getCategoryTitle(category),
        messages: initialMessages,
        view: 'journey',
      };
      setThreads([newThread]);
      setActiveThreadId(newThread.id);
    }
  }, [isOpen, category]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const updateThread = (threadId: string, updates: Partial<Omit<ChatThread, 'id'>>) => {
    setThreads(threads.map(t => t.id === threadId ? { ...t, ...updates } : t));
  };

  const handleSetupBusiness = () => {
    if (activeThreadId) {
      updateThread(activeThreadId, { view: 'discover-experience' });
    }
  };

  const handleNewTab = () => {
    // Alternate between different conversation flows
    const isExtendedFlow = threads.length % 2 === 1;

    if (isExtendedFlow) {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: 'Detailed Restaurant Analysis',
        messages: [
          {
            id: 'user-detailed-cost-question',
            content: 'What would the set up and running costs be to open a F&B Restaurant, with 300 covers?',
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: 'ai-detailed-cost-response',
            content: 'Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs',
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: 'user-demographic-question-2',
            content: 'Can you give me any demographic data you have for this area.',
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: 'ai-demographic-response-2',
            content: 'Abu Dhabi\'s dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).',
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: 'user-corniche-question',
            content: 'Great can you give me more details on The Corniche',
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: 'ai-corniche-response',
            content: 'The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.',
            isAI: true,
            timestamp: new Date(),
          }
        ],
        view: 'discover-experience',
      };
      setThreads([...threads, newThread]);
      setActiveThreadId(newThread.id);
    } else {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: 'Cost & Demographics',
        messages: [
          {
            id: 'user-cost-question',
            content: 'How much would it cost to open a restaurant',
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: 'ai-cost-response',
            content: 'Estimated set up costs could range from: There isn\'t a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don\'t allow full restaurant operations start at AED 790.',
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: 'user-demographic-question',
            content: 'Can you give me any demographic data you have for this area.',
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: 'ai-demographic-response',
            content: 'Abu Dhabi\'s dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).',
            isAI: true,
            timestamp: new Date(),
          }
        ],
        view: 'discover-experience',
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

    const activeThread = threads.find(t => t.id === activeThreadId);
    if (activeThread) {
      const updatedMessages = [...activeThread.messages, userMessage, aiResponse];
      updateThread(activeThreadId, { messages: updatedMessages });
    }
  };

  const handleSummarize = () => {
    setShowSummaryDashboard(true);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('corniche') && (lowerMessage.includes('details') || lowerMessage.includes('more'))) {
      return "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.";
    }

    if (lowerMessage.includes('corniche') || lowerMessage.includes('cornich')) {
      return "Abu Dhabi's Corniche is one of the most prestigious dining locations with ~20k daily leisure visitors and a scenic high-traffic zone rating of 8/10. The area attracts both tourists and locals, making it ideal for upscale restaurants. Would you like specific demographic data for this area?";
    }

    if (lowerMessage.includes('reports') || lowerMessage.includes('deeper') || lowerMessage.includes('generate')) {
      return "I can generate detailed reports covering market analysis, competitor landscape, foot traffic patterns, seasonal variations, target demographics, pricing strategies, and location-specific recommendations for each area. What specific type of report would you like me to focus on?";
    }

    if (lowerMessage.includes('300 covers') || lowerMessage.includes('f&b restaurant')) {
      return "Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs";
    }

    if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('budget')) {
      return "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.";
    }

    if (lowerMessage.includes('demographic') || lowerMessage.includes('target') || lowerMessage.includes('market')) {
      return "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers: Yas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10). Al Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10). Saadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10). Al Reem Island – 30k residents, 35k daytime; dense community market (7/10). Al Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10). Corniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10). Al Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).";
    }

    return "I can help you with restaurant licensing, location analysis, cost estimates, and demographic data for Abu Dhabi. What specific information would you like to know?";
  };

  if (!isOpen) return null;

  const backgroundImage = activeThread?.view === 'discover-experience' ? DISCOVER_EXPERIENCE_BACKGROUND : getCategoryBackground(category);
  const headerTitle = activeThread?.view === 'discover-experience'
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
                    {headerTitle}
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
                  {/* Chat Header with Tabs */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-4 -mx-2">
                      {threads.map(thread => (
                        <button
                          key={thread.id}
                          onClick={() => setActiveThreadId(thread.id)}
                          className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                            activeThreadId === thread.id
                              ? "border-white text-white"
                              : "border-transparent text-white/60 hover:text-white hover:border-white/30"
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
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
                    {activeThread?.messages.map((message) => (
                      <MessageBubble
                        key={`${activeThread.id}-${message.id}`}
                        message={message}
                        onActionClick={(action) => {
                          if (action === 'budget-ranges') {
                            // Budget ranges button - demographic question is already in the predefined flow
                            console.log('Budget ranges clicked');
                          }
                        }}
                      />
                    ))}

                    {/* Summarize Button */}
                    {activeThread?.messages && activeThread.messages.length > 2 && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleSummarize}
                          className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 4H10C7.79 4 6 5.79 6 8V24C6 26.21 7.79 28 10 28H22C24.21 28 26 26.21 26 24V8C26 5.79 24.21 4 22 4ZM22 24H10V8H22V24Z" fill="#169F9F"/>
                              <path d="M12 14H20V16H12V14Z" fill="#169F9F"/>
                              <path d="M12 20H20V22H12V20Z" fill="#169F9F"/>
                            </svg>
                          </div>
                          <span className="text-black text-sm font-semibold">Summarize</span>
                        </button>
                      </div>
                    )}

                    {/* Show investor journey card after the last AI message */}
                    {activeThread?.view === 'journey' && activeThread?.messages.length >= 3 && activeThread?.messages[2].hasActions && (
                      <InvestorJourneyCard onClose={onClose} onSetupBusiness={handleSetupBusiness} />
                    )}

                    {/* Show discover experience content */}
                    {activeThread?.view === 'discover-experience' && (
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

        {/* Summary Dashboard */}
        <SummaryDashboard
          key="summary-dashboard"
          isOpen={showSummaryDashboard}
          onClose={() => setShowSummaryDashboard(false)}
          category={category}
        />
      </AnimatePresence>
    </QueryClientProvider>
  );
}
