import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompetitorsViewProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
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

const NotificationBanner = () => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-lg p-5 w-[605px]">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800 mb-1">Analysis Complete</div>
            <div className="text-sm text-gray-600">
              Your restaurant market analysis for Abu Dhabi has been generated with key insights and recommendations.
            </div>
          </div>
          <button className="px-6 py-2 bg-gradient-to-b from-blue-500 to-blue-700 text-white text-xs font-semibold rounded-full hover:opacity-90">
            View details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CompetitorCard = ({ 
  name, 
  location, 
  image, 
  delay = 0 
}: { 
  name: string;
  location: string;
  image: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-64 md:h-80 object-cover rounded-3xl"
      />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/10 backdrop-blur-md rounded-b-3xl border-t border-white/20">
        <div className="p-4">
          <h3 className="text-white text-lg font-semibold mb-1">{name}</h3>
          <p className="text-white/80 text-sm">{location}</p>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingCard = ({ delay = 0 }: { delay?: number }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 76) {
            clearInterval(interval);
            return 76;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="w-full h-64 md:h-80 bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-500/50">
        <div className="text-center">
          <div className="text-6xl font-bold text-white mb-2">{progress}%</div>
          <div className="text-white text-sm">Gathering Competitor Data</div>
        </div>
      </div>
    </motion.div>
  );
};

const ChatInterface = () => {
  const messages = [
    {
      id: 1,
      isUser: true,
      text: "Who are the top competitors in the area?"
    },
    {
      id: 2,
      isUser: false,
      text: "Here are the top 4 restaurants in Abu Dhabi Corniche."
    },
    {
      id: 3,
      isUser: true,
      text: "Can you provide a gap analysis on these?"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 p-6 w-full max-w-md h-[441px]"
    >
      {/* Chat Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
          alt="AI Assistant"
          className="w-16 h-16 rounded-full border border-[#54FFD4] object-cover"
        />
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold">AI Business</h3>
        </div>
        <SoundVisualization />
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.3 }}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                message.isUser
                  ? 'bg-black/30 backdrop-blur-sm border border-white/10 rounded-br-sm'
                  : 'bg-white/20 backdrop-blur-sm border border-white/10 rounded-bl-sm'
              }`}
            >
              <div className="text-white">{message.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export function CompetitorsView({ isOpen, onClose, category }: CompetitorsViewProps) {
  if (!isOpen) return null;

  const competitors = [
    {
      name: "Shurfa Bay",
      location: "Al Bateen, Abu Dhabi",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/3e6d5f6b9acc69a87e4bcc76536ec7140340c252?width=680"
    },
    {
      name: "Palms & Pearls",
      location: "Corniche, Abu Dhabi", 
      image: "https://api.builder.io/api/v1/image/assets/TEMP/9c0a40e0fbebae5a6bba8355f1193760feb2d391?width=472"
    },
    {
      name: "Villa Toscana",
      location: "The St Regis Abu Dhabi",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/df1e40725eb1f230e3df15cd8d949ee274a1c9dd?width=496"
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      >
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://api.builder.io/api/v1/image/assets/TEMP/7e2092faf64b59c4ede24041656b85968d42a542?width=2388)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 w-full h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]"
        >
          <div className="flex items-center justify-between px-10 py-5 h-full">
            <div className="flex items-center gap-4">
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

            <div className="text-white text-base font-medium text-center">
              Investor Journey for a Restaurant
            </div>

            <div className="flex items-center">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/f35ba5a02338a961dd18f58928489d9e87ec7dc3?width=442"
                alt="Sign in with UAE PASS"
                className="h-8 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 p-8 h-[calc(100vh-87px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side - Competitors Grid */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Competitor Cards */}
                  {competitors.map((competitor, index) => (
                    <CompetitorCard
                      key={competitor.name}
                      name={competitor.name}
                      location={competitor.location}
                      image={competitor.image}
                      delay={0.4 + index * 0.2}
                    />
                  ))}
                  
                  {/* Loading Card */}
                  <LoadingCard delay={1.0} />
                </div>
              </div>

              {/* Right Side - Chat Interface */}
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
