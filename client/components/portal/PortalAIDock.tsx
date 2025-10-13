import { useMemo } from "react";

import { BusinessChatUI } from "@/components/ui/business-chat-ui";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";

const CHAT_STORAGE_KEY = "portal-business-ai-open";
const CHAT_VISITED_KEY = "portal-business-ai-visited";

const PERSISTENT_PHASE = {
  message: "Generating application...",
  percent: 15,
  keyConsiderations: [
    "Legal Structure",
    "Business Activities",
    "Physical Space",
  ],
  dataTags: ["UAE PASS profile", "Business intentions", "Workspace readiness"],
};

export function PortalAIDock() {
  const [isOpen, setIsOpen] = usePersistentState<boolean>(
    CHAT_STORAGE_KEY,
    false,
  );
  const [hasVisited, setHasVisited] = usePersistentState<boolean>(
    CHAT_VISITED_KEY,
    false,
  );
  const statusPill = useMemo(() => {
    if (isOpen) {
      return "Chat in progress";
    }
    if (hasVisited) {
      return "Chat ready";
    }
    return "Business AI ready";
  }, [hasVisited, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasVisited(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        <div className="w-[320px] rounded-3xl border border-white/50 bg-white/80 px-5 py-5 shadow-[0_22px_52px_-28px_rgba(11,64,55,0.38)] backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_14px_30px_-20px_rgba(11,64,55,0.5)]">
              <AIBusinessOrb className="h-10 w-10" />
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                  Business AI
                </p>
                <p className="text-sm font-medium leading-relaxed text-slate-800">
                  Before initiating the licensing process, we need to identify the most suitable legal structure, business activities, and physical space requirements. While certain aspects may already be predefined, others require more clarification to ensure the right decisions are made.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#0b7d6f]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf7f3] px-3 py-1 uppercase tracking-[0.2em]">
                    {statusPill}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0f766e]">
                  {PERSISTENT_PHASE.message}{" "}
                  <span>{PERSISTENT_PHASE.percent}% complete</span>
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e6f2ed]">
                  <div
                    className="h-full rounded-full bg-[#0f766e]"
                    style={{ width: `${PERSISTENT_PHASE.percent}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                  Key considerations: 1. Legal Structure. 2. Business Activities. 3. Physical Space.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERSISTENT_PHASE.keyConsiderations.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-[#eaf7f3] px-3 py-1 text-[11px] font-medium text-[#0b7d6f]"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
                  UAE PASS data points leveraged
                </p>
                <div className="flex flex-wrap gap-2">
                  {PERSISTENT_PHASE.dataTags.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-[#d8e4df] bg-white px-3 py-1 text-[11px] font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpen}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] shadow-[0_12px_24px_-18px_rgba(11,64,55,0.28)] transition",
                  "hover:bg-[#eaf7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-[#0f766e]/40 bg-white">
                  <AIBusinessOrb className="h-5 w-5" />
                </span>
                Chat with AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <BusinessChatUI
        isOpen={isOpen}
        onClose={handleClose}
        category="restaurants"
        title="Business AI"
        initialMessage="Before initiating the licensing process, we need to identify the most suitable legal structure, business activities, and physical space requirements. While certain aspects may already be predefined, others require some more clarification to ensure the right decisions are made."
      />
    </>
  );
}
