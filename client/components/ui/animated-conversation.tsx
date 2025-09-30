import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ENTREPRENEUR_PROFILE, AI_ASSISTANT_PROFILE } from '@/lib/profile';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  rating?: number;
  hasActions?: boolean;
}

interface AnimatedConversationProps {
  messages: Message[];
  className?: string;
}

const AI_AVATAR = AI_ASSISTANT_PROFILE.avatar;

export function AnimatedConversation({ messages, className }: AnimatedConversationProps) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setVisibleMessages(prev => [...prev, messages[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500); // Time between messages

    return () => {
      clearInterval(interval)
      setVisibleMessages([])
    };
  }, [messages]);

  return (
    <div className={cn("p-4 space-y-4 overflow-hidden h-full w-full", className)}>
      <AnimatePresence>
        {visibleMessages.map((message, i) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "flex gap-2 items-end",
              message.isAI ? "justify-start" : "justify-end"
            )}
          >
            {message.isAI && (
              <img
                src={AI_AVATAR}
                alt={AI_ASSISTANT_PROFILE.name}
                className="w-6 h-6 rounded-full border border-[#54FFD4] object-cover"
              />
            )}
            <div
              className={cn(
                "max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed bg-white/20 backdrop-blur-sm border border-white/10",
                message.isAI ? "rounded-bl-sm" : "rounded-br-sm"
              )}
            >
              <div className="text-white">{message.content}</div>
            </div>
            {!message.isAI && (
              <img
                src={ENTREPRENEUR_PROFILE.avatar}
                alt={ENTREPRENEUR_PROFILE.name}
                className="w-6 h-6 rounded-full border-2 border-white/50"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
