import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ApplicationProgressCardProps {
  message: string;
  className?: string;
}

const TARGET_PROGRESS = 78;
const INITIAL_PROGRESS = 18;

export function ApplicationProgressCard({
  message,
  className,
}: ApplicationProgressCardProps) {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      setProgress((prev) => {
        if (!isGenerating) {
          return prev;
        }

        const increment = Math.random() * 6 + 2;
        const next = prev + increment;

        if (next >= TARGET_PROGRESS) {
          setIsGenerating(false);
          return TARGET_PROGRESS;
        }

        return Math.min(next, TARGET_PROGRESS);
      });

      if (isGenerating) {
        rafId = window.setTimeout(tick, 480);
      }
    };

    rafId = window.setTimeout(tick, 520);

    return () => {
      window.clearTimeout(rafId);
    };
  }, [isGenerating]);

  const phaseItems = useMemo(
    () => [
      {
        id: "legal-structure",
        label: "Legal structure validation",
        delay: 0.15,
      },
      {
        id: "activities",
        label: "Business activities alignment",
        delay: 0.3,
      },
      {
        id: "space",
        label: "Physical space readiness",
        delay: 0.45,
      },
    ],
    [],
  );

  const progressLabel = `${Math.round(progress)}% complete`;

  return (
    <div
      className={cn(
        "relative w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/40 bg-white/75 p-6 shadow-[0_32px_80px_-48px_rgba(14,118,110,0.42)] backdrop-blur-[18px]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E766E]/12 text-[#0E766E]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 7V12L15 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
            Generating application
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-800">{message}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3 w-full overflow-hidden rounded-full border border-[#dbe9e3] bg-white/70">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7] shadow-[0_1px_4px_rgba(14,118,110,0.35)]"
            initial={{ width: `${INITIAL_PROGRESS}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{progressLabel}</span>
          <span>{isGenerating ? "Processing" : "Ready for review"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          What we're validating
        </p>
        <ul className="space-y-2 text-sm text-slate-700">
          {phaseItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <AnimatePresence>
                <motion.span
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#0E766E]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: item.delay }}
                />
              </AnimatePresence>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#dbe9e3] bg-white/80 px-4 py-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2 w-2 rounded-full bg-[#0E766E]"
            animate={{ opacity: isGenerating ? [1, 0.3, 1] : 1 }}
            transition={{ repeat: isGenerating ? Infinity : 0, duration: 1.4 }}
          />
          <span>{isGenerating ? "Live review in progress" : "Checks complete"}</span>
        </div>
        <span className="font-medium text-slate-600">AI Business</span>
      </div>
    </div>
  );
}
