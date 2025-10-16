import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { AI_ASSISTANT_PROFILE } from "@/lib/profile";

interface AIAssistantPanelProps {
  assistantName?: string;
  avatarUrl?: string;
  status: "listening" | "speaking" | "thinking" | "idle";
  statusMessage: string;
  progressPercentage: number;
  message: string;
  className?: string;
}

export function AIAssistantPanel({
  assistantName = AI_ASSISTANT_PROFILE.name,
  avatarUrl,
  status,
  statusMessage,
  progressPercentage,
  message,
  className,
}: AIAssistantPanelProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const resolvedAvatarUrl = (avatarUrl ?? AI_ASSISTANT_PROFILE.avatar).trim();
  const hasAvatarImage = resolvedAvatarUrl.length > 0;

  // Reset animation when status changes
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [status]);

  // Audio visualization bars
  const AudioVisualization = () => {
    const bars = [
      { height: "6px", delay: "0ms" },
      { height: "12px", delay: "100ms" },
      { height: "20px", delay: "200ms" },
      { height: "14px", delay: "300ms" },
      { height: "9px", delay: "400ms" },
      { height: "23px", delay: "500ms" },
      { height: "30px", delay: "600ms" },
      { height: "17px", delay: "700ms" },
      { height: "5px", delay: "800ms" },
    ];

    return (
      <div className="flex items-end gap-0.5 h-8">
        {bars.map((bar, index) => (
          <div
            key={`${animationKey}-${index}`}
            className={cn(
              "w-1 bg-[#54FFD4] rounded-full transition-all duration-300",
              status === "speaking" ? "animate-pulse" : "",
            )}
            style={{
              height: status === "speaking" ? bar.height : "3px",
              animationDelay: bar.delay,
              transform: "rotate(-90deg)",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden",
        "bg-white/20 backdrop-blur-xl",
        "shadow-[0_4px_44px_0_#0E766E]", // Cyan glow
        "border border-white/20",
        "w-[446px] h-[426px]",
        className,
      )}
    >
      {/* Header Section */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            {hasAvatarImage ? (
              <img
                src={resolvedAvatarUrl}
                alt={assistantName}
                className="h-16 w-16 rounded-full border-2 border-[#0E766E] object-cover"
              />
            ) : (
              <AIBusinessOrb className="h-16 w-16" />
            )}
          </div>

          {/* Assistant Name */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {assistantName}
            </h3>
          </div>

          {/* Audio Visualization */}
          <div className="flex items-center">
            <AudioVisualization />
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          <p className="text-base font-normal text-white">{statusMessage}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#38e2c8] to-[#0E766E] transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-base font-normal text-white mt-2">
            {progressPercentage}% complete
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.18] mx-6 my-6" />

      {/* Message Content */}
      <div className="px-6 pb-6">
        <p className="text-lg font-normal text-white leading-relaxed">
          {message}
        </p>
      </div>

      {/* Optional three dots menu */}
      <div className="absolute top-5 right-5">
        <button
          type="button"
          className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="4" r="1.5" fill="currentColor" />
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            <circle cx="10" cy="16" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
