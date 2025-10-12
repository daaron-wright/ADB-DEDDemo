import React, { useState, useRef, useEffect, useMemo } from "react";
import Draggable from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import { usePersistentState } from "@/hooks/use-persistent-state";

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  length: number;
  item(index: number): SpeechRecognitionAlternativeLike;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  item(index: number): SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionResultEventLike {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

const getSpeechRecognitionConstructor =
  (): SpeechRecognitionConstructor | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const browserWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    return (
      browserWindow.SpeechRecognition ??
      browserWindow.webkitSpeechRecognition ??
      null
    );
  };

interface ChatMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

const createIntroMessage = (content: string): ChatMessage => ({
  id: `intro-${Date.now()}`,
  content,
  isAI: true,
  timestamp: new Date(),
});

interface OpenChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  businessCategories?: Array<{ id: string; title: string; prompt?: string }>;
  onCategoryClick?: (id: string, title: string) => void;
  mode?: "general" | "category";
  initialCategoryId?: string;
  initialCategoryTitle?: string;
  onPromptSubmit?: (options: {
    categoryId?: string | null;
    message?: string | null;
  }) => void;
}

type ChatState = "idle" | "listening" | "thinking" | "responding";

// Chat icon component with animation based on Figma design
const ChatIcon = ({ isAnimated = false, isDark = false }: { isAnimated?: boolean; isDark?: boolean }) => {
  const bars = [
    { width: "5.77px", height: "3.297px" },
    { width: "11.952px", height: "3.297px" },
    { width: "19.783px", height: "3.297px" },
    { width: "13.189px", height: "3.297px" },
    { width: "8.655px", height: "3.297px" },
    { width: "23.081px", height: "3.297px" },
    { width: "30.499px", height: "3.297px" },
    { width: "16.898px", height: "3.297px" },
    { width: "4.534px", height: "3.297px" },
  ];

  const color = isDark ? "#0E766E" : "#FFF";

  return (
    <div className="inline-flex justify-center items-center gap-0.5 w-12 h-8">
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          className="transform rotate-90 rounded-full"
          style={{
            width: bar.height,
            height: bar.width,
            background: color,
          }}
          animate={
            isAnimated
              ? {
                  opacity: [0.6, 1, 0.6],
                  scale: [0.8, 1.1, 0.8],
                }
              : {}
          }
          transition={{
            duration: 0.8 + index * 0.1,
            repeat: isAnimated ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const SoundVisualization = ({ isActive = false }: { isActive?: boolean }) => {
  const bars = [
    { baseHeight: "6px", maxHeight: "12px" },
    { baseHeight: "12px", maxHeight: "24px" },
    { baseHeight: "20px", maxHeight: "40px" },
    { baseHeight: "13px", maxHeight: "26px" },
    { baseHeight: "9px", maxHeight: "18px" },
    { baseHeight: "23px", maxHeight: "46px" },
    { baseHeight: "30px", maxHeight: "60px" },
    { baseHeight: "17px", maxHeight: "34px" },
    { baseHeight: "5px", maxHeight: "10px" },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          className="w-0.5 bg-[#54FFD4] rounded-full"
          style={{ height: bar.baseHeight }}
          animate={
            isActive
              ? {
                  height: [bar.baseHeight, bar.maxHeight, bar.baseHeight],
                  opacity: [0.7, 1, 0.7],
                }
              : {}
          }
          transition={{
            duration: 0.6 + index * 0.1,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  return (
    <div
      className={cn(
        "mb-3 flex",
        message.isAI ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl border px-4 py-3 text-sm leading-relaxed backdrop-blur-xl",
          message.isAI
            ? "rounded-tl-sm border-black/10 bg-white/85 text-slate-900 shadow-[0_18px_40px_-30px_rgba(10,18,40,0.35)]"
            : "rounded-tr-sm border-[#54FFD4]/45 bg-[#54FFD4]/25 text-[#0F2F28] shadow-[0_24px_55px_-28px_rgba(10,18,40,0.45)]",
        )}
      >
        {message.content}
      </div>
    </div>
  );
};

const ChatStateIndicator = ({ state }: { state: ChatState }) => {
  const getStateText = () => {
    switch (state) {
      case "listening":
        return "Listening...";
      case "thinking":
        return "Thinking...";
      case "responding":
        return "Responding...";
      default:
        return "";
    }
  };

  if (state === "idle") return null;

  return (
    <div className="mb-3 flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-black/10 bg-white/85 px-3 py-2 text-sm text-slate-900 shadow-sm">
        <div className="flex gap-1">
          <motion.div
            className="h-1 w-1 rounded-full bg-[#54FFD4]"
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

export function OpenChatUI({
  isOpen,
  onClose,
  title = "Omnis",
  businessCategories,
  onCategoryClick,
  mode = "general",
  initialCategoryId,
  initialCategoryTitle,
  onPromptSubmit,
}: OpenChatUIProps) {
  const [messages, setMessages] = usePersistentState<ChatMessage[]>(
    "open-chat-messages",
    [
      {
        id: "1",
        content:
          "Welcome to the future of government services. I can help you discover, set up, and grow your business. To get started, you can ask me a question or select one of the popular business categories below.",
        isAI: true,
        timestamp: new Date(),
      },
    ],
  );

  const [inputValue, setInputValue] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [isListening, setIsListening] = useState(false);
  const nodeRef = useRef(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const selectedCategory = useMemo(
    () =>
      initialCategoryId
        ? businessCategories?.find(
            (category) => category.id === initialCategoryId,
          )
        : undefined,
    [businessCategories, initialCategoryId],
  );

  const promptSuggestions = useMemo(() => {
    if (mode !== "category") {
      return [] as Array<{ id: string; message: string }>;
    }

    const baseTitle = selectedCategory?.title ?? initialCategoryTitle;
    if (!baseTitle) {
      return [] as Array<{ id: string; message: string }>;
    }

    const normalizedTitle = baseTitle.toLowerCase();
    const basePrompt =
      selectedCategory?.prompt ??
      `I'm exploring opportunities around ${baseTitle}. What should I consider?`;

    const suggestions = [
      basePrompt,
      `What licenses do I need for a ${normalizedTitle}?`,
      `What costs should I plan for when launching a ${normalizedTitle}?`,
    ];

    const unique = Array.from(
      new Set(suggestions.map((entry) => entry.trim()).filter(Boolean)),
    );
    const baseId = selectedCategory?.id ?? initialCategoryId ?? "category";

    return unique.map((message, index) => ({
      id: `${baseId}-prompt-${index}`,
      message,
    }));
  }, [mode, selectedCategory, initialCategoryTitle, initialCategoryId]);

  const isIntroMode = mode === "category" && Boolean(onPromptSubmit);

  const placeholderSubject = selectedCategory?.title ?? initialCategoryTitle;
  const placeholderText =
    isIntroMode && placeholderSubject
      ? `Ask about ${placeholderSubject.toLowerCase()}...`
      : "Type your message...";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isIntroMode) {
      const introTarget = selectedCategory?.title ?? initialCategoryTitle;
      const introContent = introTarget
        ? `You're exploring ${introTarget}. Choose a suggested prompt below or type your own question to continue.`
        : "Choose a suggested prompt below or type your own question to continue.";
      setMessages([createIntroMessage(introContent)]);
      setInputValue("");
      setChatState("idle");
      return;
    }

    if (mode === "general") {
      setMessages([
        createIntroMessage(
          "Welcome to the future of government services. I can help you discover, set up, and grow your business. To get started, you can ask me a question or select one of the popular business categories below.",
        ),
      ]);
      setInputValue("");
      setChatState("idle");
    }
  }, [
    isOpen,
    isIntroMode,
    selectedCategory,
    mode,
    initialCategoryTitle,
    setMessages,
    setInputValue,
    setChatState,
  ]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setChatState("listening");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const firstResult = event.results[0] ?? event.results.item(0);
      const firstAlternative = firstResult
        ? (firstResult[0] ?? firstResult.item?.(0))
        : undefined;
      const transcript = firstAlternative?.transcript ?? "";

      if (transcript) {
        setInputValue(transcript);
      }

      setChatState("idle");
      setIsListening(false);
    };

    recognition.onerror = () => {
      setChatState("idle");
      setIsListening(false);
    };

    recognition.onend = () => {
      setChatState("idle");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
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
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (isIntroMode && onPromptSubmit) {
      onPromptSubmit({
        categoryId: selectedCategory?.id ?? initialCategoryId ?? null,
        message: trimmedValue,
      });
      setInputValue("");
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: trimmedValue,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setChatState("thinking");

    try {
      const response = await axios.post("/api/generate", {
        message: trimmedValue,
        type: "open-chat",
      });

      setChatState("responding");

      // Simulate typing delay
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content:
            response.data.response ||
            "I understand your question. Let me help you with that information.",
          isAI: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setChatState("idle");
      }, 1500);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setChatState("responding");
      setTimeout(() => {
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          isAI: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
        setChatState("idle");
      }, 1000);
    }
  };

  const handlePromptSelection = (message: string) => {
    if (isIntroMode && onPromptSubmit) {
      onPromptSubmit({
        categoryId: selectedCategory?.id ?? initialCategoryId ?? null,
        message,
      });
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <Draggable
              nodeRef={nodeRef}
              handle=".drag-handle"
              bounds="parent"
              defaultPosition={{ x: 0, y: 0 }}
            >
              <motion.div
                ref={nodeRef}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute top-6 right-6 w-full max-w-md h-[500px] cursor-grab active:cursor-grabbing pointer-events-auto"
              >
                {/* Chat Container */}
                <div
                  className={chatCardClass(
                    "flex flex-col h-full overflow-hidden border border-black/15 ring-1 ring-black/10 bg-gradient-to-br from-white/40 via-white/18 to-white/8 text-slate-900 backdrop-blur-3xl shadow-[0_28px_70px_-24px_rgba(10,18,40,0.55)]"
                  )}
                >
                  {/* Header */}
                  <div className="drag-handle flex items-center justify-between p-4 border-b border-black/10 bg-white/80 backdrop-blur-xl cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border border-[#54FFD4] bg-white/80 flex items-center justify-center">
                        <ChatIcon isAnimated={chatState === "responding"} isDark={true} />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ChatIcon
                        isAnimated={isListening || chatState === "responding"}
                        isDark={false}
                      />
                      <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-slate-700 transition-colors hover:bg-white"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 4L4 12M4 4L12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isIntroMode && promptSuggestions.length > 0 && (
                      <div className="pt-2">
                        <div className="mb-3 px-2 text-xs text-slate-600">
                          {placeholderSubject
                            ? `Quick prompts for ${placeholderSubject}:`
                            : "Quick prompts to get started:"}
                        </div>
                        <div className="flex flex-col gap-2">
                          {promptSuggestions.map((prompt) => (
                            <button
                              key={prompt.id}
                              onClick={() =>
                                handlePromptSelection(prompt.message)
                              }
                              className="rounded-md border border-black/10 bg-white/85 px-3 py-2 text-sm font-medium text-slate-900 backdrop-blur-xl transition-colors hover:bg-white"
                            >
                              {prompt.message}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {mode === "general" &&
                      messages.length === 1 &&
                      messages[0].isAI &&
                      businessCategories &&
                      onCategoryClick && (
                        <div className="pt-2">
                          <div className="mb-3 px-2 text-xs text-slate-600">
                            Or select a category to get started:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {businessCategories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() =>
                                  onCategoryClick(category.id, category.title)
                                }
                                className="rounded-md border border-black/10 bg-white/85 px-3 py-2 text-xs font-medium text-slate-900 backdrop-blur-xl transition-colors hover:bg-white"
                              >
                                {category.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    <ChatStateIndicator state={chatState} />
                  </div>

                  {/* Input Footer */}
                  <div className="border-t border-black/10 bg-white/70 p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholderText}
                        className="flex-1 rounded-md border border-black/10 bg-white/85 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 transition-colors backdrop-blur-2xl focus:border-[#54FFD4] focus:outline-none focus:ring-1 focus:ring-[#54FFD4]/50"
                        disabled={chatState !== "idle"}
                      />

                      {/* Microphone Button */}
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={
                          chatState === "thinking" || chatState === "responding"
                        }
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-200",
                          isListening
                            ? "border-red-500/40 bg-red-500/80 hover:bg-red-500 text-white"
                            : chatState === "idle"
                              ? "border-[#54FFD4]/45 bg-[#54FFD4]/30 text-[#082C25] hover:bg-[#54FFD4]/40"
                              : "border-black/10 bg-white/70 text-slate-500 cursor-not-allowed",
                        )}
                      >
                        {isListening ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="6"
                              y="6"
                              width="12"
                              height="12"
                              rx="2"
                              fill="currentColor"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z"
                              fill="currentColor"
                            />
                            <path
                              d="M8 18v3a1 1 0 0 1-2 0v-3a8 8 0 1 1 16 0v3a1 1 0 0 1-2 0v-3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || chatState !== "idle"}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-200",
                          inputValue.trim() && chatState === "idle"
                            ? "border-[#54FFD4]/45 bg-[#54FFD4]/30 text-[#082C25] hover:bg-[#54FFD4]/40 hover:scale-105"
                            : "border-black/10 bg-white/70 text-slate-500 cursor-not-allowed",
                        )}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 8L14 2L10 8L14 14L2 8Z"
                            fill="currentColor"
                          />
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
