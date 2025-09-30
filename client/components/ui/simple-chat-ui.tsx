import React, { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Mic, Keyboard } from "lucide-react";

interface SimpleChatMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  type?: "text" | "budget-card" | "info-card";
}

interface SimpleChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const INITIAL_MESSAGES: SimpleChatMessage[] = [
  {
    id: "user-1",
    content: "I want to invest my money and open a restaurant business in Abu Dhabi. What commercial activities align with my business type and can you help me set up?",
    isAI: false,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "ai-1",
    content: "Opening a restaurant in Abu Dhabi involves several steps: planning, licensing, approvals, staffing, fit-out, and operations.",
    isAI: true,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "ai-2",
    content: "You will need a Commercial License for F&B. I have generated an investor journey below that will assist you.",
    isAI: true,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "user-2",
    content: "Where are existing establishments located for specific activities (on a heat map)?",
    isAI: false,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "ai-3",
    content: "I have created a heat map for the top areas and existing businesses",
    isAI: true,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "user-3",
    content: "Interesting looking at this in a map",
    isAI: false,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "user-4",
    content: "How much would it cost to open a restaurant",
    isAI: false,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "ai-4",
    content: "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.",
    isAI: true,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "user-5",
    content: "Can you give me any demographic data you have for this area.",
    isAI: false,
    timestamp: new Date(),
    type: "text",
  },
  {
    id: "ai-5",
    content: "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers: Yas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10). Al Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10). Saadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10). Al Reem Island – 30k residents, 35k daytime; dense community market (7/10). Al Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10). Corniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10). Al Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
    isAI: true,
    timestamp: new Date(),
    type: "text",
  },
];

const SimpleChatBubble = ({ message }: { message: SimpleChatMessage }) => {
  const aiAvatar = "https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128";
  const userAvatar = "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F0328efd91dae40ce9ab77be8bf461f9a?format=webp&width=800";

  if (message.isAI) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <img
          src={aiAvatar}
          alt="AI Business"
          className="w-10 h-10 rounded-full border border-[#54FFD4] flex-shrink-0"
        />
        <div className="flex flex-col max-w-[70%]">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-white text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-4 justify-end">
      <div className="flex flex-col max-w-[70%]">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-3 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
      <img
        src={userAvatar}
        alt="User"
        className="w-10 h-10 rounded-full border border-[#54FFD4] flex-shrink-0"
      />
    </div>
  );
};

const BudgetRangesCard = () => {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 mb-4 w-fit">
      <div className="flex items-center justify-center w-8 h-8 bg-[#169F9F] rounded-lg">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M27.0005 3.00003H5.00049C4.47006 3.00003 3.96135 3.21074 3.58627 3.58582C3.2112 3.96089 3.00049 4.4696 3.00049 5.00003V27C3.00049 27.5305 3.2112 28.0392 3.58627 28.4142C3.96135 28.7893 4.47006 29 5.00049 29H27.0005C27.5309 29 28.0396 28.7893 28.4147 28.4142C28.7898 28.0392 29.0005 27.5305 29.0005 27V5.00003C29.0005 4.4696 28.7898 3.96089 28.4147 3.58582C28.0396 3.21074 27.5309 3.00003 27.0005 3.00003ZM27.0005 5.00003V9.00003H5.00049V5.00003H27.0005ZM17.0005 11H27.0005V18H17.0005V11ZM15.0005 18H5.00049V11H15.0005V18ZM5.00049 20H15.0005V27H5.00049V20ZM17.0005 27V20H27.0005V27H17.0005Z" fill="#169F9F"/>
        </svg>
      </div>
      <span className="text-black text-sm font-semibold">Budget ranges</span>
    </div>
  );
};

const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
      <div className="flex-1 flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me..."
          className="flex-1 bg-transparent text-white placeholder-white/70 border-none outline-none text-sm"
        />
        <button type="button" className="text-white/70 hover:text-white transition-colors">
          <Mic size={16} />
        </button>
        <button type="button" className="text-white/70 hover:text-white transition-colors">
          <Keyboard size={16} />
        </button>
      </div>
    </form>
  );
};

export function SimpleChatUI({ isOpen, onClose, title = "AI Business" }: SimpleChatUIProps) {
  const [messages, setMessages] = useState<SimpleChatMessage[]>(INITIAL_MESSAGES);
  const [showBudgetCard, setShowBudgetCard] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback((content: string) => {
    const newMessage: SimpleChatMessage = {
      id: `user-${Date.now()}`,
      content,
      isAI: false,
      timestamp: new Date(),
      type: "text",
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: SimpleChatMessage = {
        id: `ai-${Date.now()}`,
        content: "I can help you with that. Let me provide you with more detailed information about restaurant setup in Abu Dhabi.",
        isAI: true,
        timestamp: new Date(),
        type: "text",
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Draggable handle=".drag-handle" bounds="parent">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md mx-4"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="drag-handle flex items-center justify-between p-4 border-b border-white/10 cursor-move">
              <div className="flex items-center gap-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                  alt="AI Business"
                  className="w-10 h-10 rounded-full border border-[#54FFD4]"
                />
                <div>
                  <h3 className="text-white font-semibold text-lg">{title}</h3>
                  <div className="flex items-center gap-1">
                    {/* Sound wave animation */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-[#54FFD4] rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 12 + 4}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {showBudgetCard && <BudgetRangesCard />}
              
              {messages.map((message) => (
                <SimpleChatBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSend={handleSendMessage} />
          </div>
        </motion.div>
      </Draggable>
    </div>
  );
}
