import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

interface ChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const SoundVisualization = () => {
  const bars = [
    { height: '6px' },
    { height: '12px' },
    { height: '20px' },
    { height: '13px' },
    { height: '9px' },
    { height: '23px' },
    { height: '30px' },
    { height: '17px' },
    { height: '5px' },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-1 bg-[#54FFD4] rounded-full"
          style={{ height: bar.height }}
        />
      ))}
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  return (
    <div className={cn(
      "flex mb-3",
      message.isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed",
        message.isAI 
          ? "bg-black/80 text-white rounded-tl-sm" 
          : "bg-white/80 text-gray-700 rounded-tr-sm"
      )}>
        {message.content}
      </div>
    </div>
  );
};

export function ChatUI({ isOpen, onClose, title = "AI Business" }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'How can I help you get started in your investor journey',
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: '2',
      content: 'How do I open a restaurant in Abu Dhabi?',
      isAI: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'd be happy to help you with opening a restaurant in Abu Dhabi. The process involves several steps including obtaining the necessary licenses, finding a suitable location, and meeting health and safety requirements. Would you like me to guide you through each step?",
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Chat Container */}
        <div
          className="flex w-full h-[450px] sm:h-[500px] p-3 rounded-3xl shadow-2xl"
          style={{
            background: 'linear-gradient(213deg, rgba(0, 0, 0, 0.23) 23.21%, rgba(102, 102, 102, 0.23) 102.41%)',
          }}
        >
          <div className="flex flex-col w-full h-full rounded-2xl bg-transparent backdrop-blur-sm">
            {/* App Bar */}
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                  alt="AI Assistant"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#54FFD4] object-cover"
                />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-base sm:text-lg font-bold font-dm-sans tracking-wide truncate">
                  {title}
                </h2>
              </div>

              {/* Sound Visualization */}
              <div className="flex-shrink-0">
                <SoundVisualization />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="ml-1 sm:ml-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#54FFD4]/50 focus:border-[#54FFD4]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    inputValue.trim()
                      ? "bg-[#54FFD4] hover:bg-[#54FFD4]/80 text-black"
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
      </div>
    </div>
  );
}
