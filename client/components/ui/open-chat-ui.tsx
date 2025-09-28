import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

interface OpenChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

type ChatState = 'idle' | 'listening' | 'thinking' | 'responding';

const SoundVisualization = ({ isActive = false }: { isActive?: boolean }) => {
  const bars = [
    { baseHeight: '6px', maxHeight: '12px' },
    { baseHeight: '12px', maxHeight: '24px' },
    { baseHeight: '20px', maxHeight: '40px' },
    { baseHeight: '13px', maxHeight: '26px' },
    { baseHeight: '9px', maxHeight: '18px' },
    { baseHeight: '23px', maxHeight: '46px' },
    { baseHeight: '30px', maxHeight: '60px' },
    { baseHeight: '17px', maxHeight: '34px' },
    { baseHeight: '5px', maxHeight: '10px' },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          className="w-0.5 bg-[#54FFD4] rounded-full"
          style={{ height: bar.baseHeight }}
          animate={isActive ? {
            height: [bar.baseHeight, bar.maxHeight, bar.baseHeight],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{
            duration: 0.6 + (index * 0.1),
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  return (
    <div className={cn(
      "flex mb-3",
      message.isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
        message.isAI 
          ? "bg-black/80 text-white rounded-tl-sm" 
          : "bg-white/80 text-gray-700 rounded-tr-sm"
      )}>
        {message.content}
      </div>
    </div>
  );
};

const ChatStateIndicator = ({ state }: { state: ChatState }) => {
  const getStateText = () => {
    switch (state) {
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      case 'responding': return 'Responding...';
      default: return '';
    }
  };

  if (state === 'idle') return null;

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-black/80 text-white/70 rounded-2xl rounded-tl-sm px-3 py-2 text-sm flex items-center gap-2">
        <div className="flex gap-1">
          <motion.div
            className="w-1 h-1 bg-[#54FFD4] rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1 h-1 bg-[#54FFD4] rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-1 h-1 bg-[#54FFD4] rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        {getStateText()}
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

export function OpenChatUI({ isOpen, onClose, title = "AI Business" }: OpenChatUIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'How can I help you get started in your investor journey',
      isAI: true,
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [isListening, setIsListening] = useState(false);
  const nodeRef = useRef(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setChatState('listening');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setChatState('idle');
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setChatState('idle');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setChatState('idle');
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setChatState('thinking');

    try {
      const response = await axios.post('/api/generate', { 
        message: inputValue,
        type: 'open-chat'
      });
      
      setChatState('responding');
      
      // Simulate typing delay
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.response || "I understand your question. Let me help you with that information.",
          isAI: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setChatState('idle');
      }, 1500);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setChatState('responding');
      setTimeout(() => {
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
          isAI: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
        setChatState('idle');
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

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
                className="w-full max-w-md h-[500px]"
              >
                {/* Chat Container */}
                <div className="flex flex-col h-full bg-gradient-to-br from-black/20 to-gray-600/20 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="drag-handle flex items-center justify-between p-4 border-b border-white/10 cursor-move">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                        alt="AI Assistant"
                        className="w-12 h-12 rounded-full border border-[#54FFD4] object-cover"
                      />
                      <div>
                        <h2 className="text-white text-lg font-semibold font-dm-sans">
                          {title}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <SoundVisualization isActive={isListening || chatState === 'responding'} />
                      <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4L4 12M4 4L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    <ChatStateIndicator state={chatState} />
                  </div>

                  {/* Input Footer */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-xl px-3 py-2 text-sm font-dm-sans focus:outline-none focus:ring-1 focus:ring-[#54FFD4]/50 focus:border-[#54FFD4] transition-colors backdrop-blur-sm"
                        disabled={chatState !== 'idle'}
                      />
                      
                      {/* Microphone Button */}
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={chatState === 'thinking' || chatState === 'responding'}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                          isListening
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : chatState === 'idle'
                            ? "bg-[#54FFD4] hover:bg-[#54FFD4]/80 text-black"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                        )}
                      >
                        {isListening ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" fill="currentColor"/>
                            <path d="M8 18v3a1 1 0 0 1-2 0v-3a8 8 0 1 1 16 0v3a1 1 0 0 1-2 0v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>

                      {/* Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || chatState !== 'idle'}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                          inputValue.trim() && chatState === 'idle'
                            ? "bg-[#54FFD4] hover:bg-[#54FFD4]/80 text-black hover:scale-105"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 8L14 2L10 8L14 14L2 8Z" fill="currentColor"/>
                        </svg>
                      </button>
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

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
