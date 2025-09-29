import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeatMapChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  type?: 'text' | 'heat-map';
}

const AccessibleMessageBubble = ({ message }: { message: Message }) => {
  return (
    <div
      className={cn(
        "flex mb-6 gap-4 items-start",
        message.isAI ? "justify-start" : "justify-end",
      )}
    >
      {message.isAI && (
        <div className="relative">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
            alt="AI Business Assistant"
            className="w-12 h-12 rounded-full border-2 border-[#54FFD4] object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#54FFD4] rounded-full border-2 border-white"></div>
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[85%] flex flex-col gap-2",
          message.isAI ? "items-start" : "items-end",
        )}
      >
        {/* Assistant label for screen readers */}
        {message.isAI && (
          <span className="text-sm font-medium text-gray-800 mb-1">
            AI Business
          </span>
        )}
        
        <div
          className={cn(
            "px-5 py-4 rounded-2xl text-base leading-relaxed shadow-lg border text-gray-900",
            message.isAI
              ? "bg-white border-gray-200 rounded-bl-md"
              : "bg-[#E6F7F3] border-[#54FFD4]/60 rounded-br-md",
          )}
          role={message.isAI ? "status" : "log"}
          aria-live={message.isAI ? "polite" : "off"}
        >
          <p className="font-medium leading-7 text-inherit whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Timestamp for accessibility */}
        <time 
          className="text-xs text-gray-500 px-2"
          dateTime={message.timestamp.toISOString()}
        >
          {message.timestamp.toLocaleTimeString()}
        </time>
      </div>
      
      {!message.isAI && (
        <div className="w-12 h-12 rounded-full bg-[#54FFD4] flex items-center justify-center text-slate-900 font-semibold text-sm border-2 border-[#1f6f63]/40">
          You
        </div>
      )}
    </div>
  );
};

const AccessibleHeatMap = () => {
  const heatPoints = [
    { id: 1, x: 25, y: 35, intensity: 'high', label: 'Marina Royal Complex', businesses: 15 },
    { id: 2, x: 45, y: 45, intensity: 'medium', label: 'Al Khalidiya District', businesses: 8 },
    { id: 3, x: 65, y: 25, intensity: 'high', label: 'Corniche Area', businesses: 22 },
    { id: 4, x: 75, y: 55, intensity: 'medium', label: 'Al Bateen', businesses: 12 },
    { id: 5, x: 35, y: 65, intensity: 'low', label: 'Downtown District', businesses: 5 },
  ];

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'from-red-500/60 to-red-600/40';
      case 'medium': return 'from-orange-500/60 to-yellow-500/40';
      case 'low': return 'from-yellow-400/60 to-green-400/40';
      default: return 'from-blue-500/60 to-blue-600/40';
    }
  };

  const getIntensitySize = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'w-16 h-16';
      case 'medium': return 'w-12 h-12';
      case 'low': return 'w-8 h-8';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div className="relative">
      {/* Heat map container */}
      <div 
        className="relative w-full max-w-md mx-auto bg-white rounded-3xl p-4 shadow-xl border border-gray-200"
        role="img" 
        aria-label="Heat map showing restaurant density across Abu Dhabi districts"
      >
        {/* Base map image */}
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386"
          alt="Abu Dhabi district map"
          className="w-full h-auto rounded-2xl"
        />
        
        {/* Heat points overlay */}
        <div className="absolute inset-4">
          {heatPoints.map((point) => (
            <div
              key={point.id}
              className={cn(
                "absolute rounded-full bg-gradient-radial transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110",
                getIntensityColor(point.intensity),
                getIntensitySize(point.intensity)
              )}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              role="button"
              tabIndex={0}
              aria-label={`${point.label}: ${point.businesses} restaurants, ${point.intensity} density`}
              title={`${point.label}: ${point.businesses} restaurants`}
            >
              {/* Inner circle for better visibility */}
              <div className="absolute inset-2 rounded-full bg-white/30 border border-white/50"></div>
              
              {/* Business count indicator */}
              <div className="absolute -top-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-800 border border-gray-300 shadow-sm">
                {point.businesses}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend for accessibility */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Heat Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500/60 to-red-600/40"></div>
            <span className="text-sm text-gray-700">High density (15+ restaurants)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500/60 to-yellow-500/40"></div>
            <span className="text-sm text-gray-700">Medium density (8-14 restaurants)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400/60 to-green-400/40"></div>
            <span className="text-sm text-gray-700">Low density (1-7 restaurants)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-3 bg-gray-800 rounded-full px-4 py-3 shadow-lg">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="I want to look at the Corniche"
          className="flex-1 bg-transparent text-white placeholder-gray-400 text-base outline-none"
          aria-label="Type your message"
        />
        
        <div className="flex items-center gap-2">
          {/* Microphone button */}
          <button
            type="button"
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Voice input"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300"
            >
              <path
                d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C6.15225 1.36502 5.25134 1.20687 4.85352 1.20687Z"
                fill="currentColor"
              />
            </svg>
          </button>
          
          {/* Keyboard button */}
          <button
            type="button"
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Show keyboard"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300"
            >
              <path
                d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z"
                fill="currentColor"
              />
            </svg>
          </button>
          
          {/* Send button */}
          <button
            type="submit"
            className="p-2 bg-[#54FFD4] hover:bg-[#54FFD4]/80 rounded-full transition-colors disabled:opacity-50"
            disabled={!inputValue.trim()}
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-800"
            >
              <path
                d="M8 1L15 8L8 15M15 8H1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
};

export const HeatMapChat: React.FC<HeatMapChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Where are existing establishments located for specific activities (on a heat map)?',
      isAI: false,
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: '2', 
      content: 'I have created a heat map for the top areas and existing businesses',
      isAI: true,
      timestamp: new Date(Date.now() - 60000),
      type: 'heat-map',
    },
    {
      id: '3',
      content: 'Interesting looking at this in a map',
      isAI: false,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isAI: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I can help you explore the ${content} area. This location shows medium to high restaurant density with several established businesses.`,
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
            role="dialog"
            aria-labelledby="heat-map-chat-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                  alt="AI Business Assistant"
                  className="w-10 h-10 rounded-full border-2 border-[#54FFD4]"
                />
                <div>
                  <h2 id="heat-map-chat-title" className="text-lg font-semibold text-gray-900">
                    AI Business
                  </h2>
                  <p className="text-sm text-gray-600">Location Analysis Assistant</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-600"
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

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id}>
                  <AccessibleMessageBubble message={message} />
                  {message.type === 'heat-map' && (
                    <div className="mt-4 mb-6">
                      <AccessibleHeatMap />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
