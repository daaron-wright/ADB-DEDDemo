import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ChatPromptOption {
  id: string;
  title: string;
  prompt: string;
  description?: string;
  tag?: string;
}

interface ChatPromptDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  options: ChatPromptOption[];
  onSelect: (option: ChatPromptOption) => void;
  onSkip: () => void;
}

export function ChatPromptDialog({
  open,
  onOpenChange,
  options,
  onSelect,
  onSkip,
}: ChatPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[34px] border border-white/70 bg-white/95 p-8 shadow-[0_42px_120px_-60px_rgba(24,32,63,0.55)] backdrop-blur-2xl sm:p-10">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-3xl font-semibold text-slate-900">
            Start a conversation
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Choose a guided starter based on what you explored. Each path mirrors
            the AI tips you saw on the tiles, so you can pick up the same flow
            inside the chat.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "group h-full w-full rounded-3xl border border-white/60 bg-white/65 px-6 py-6 text-left shadow-[0_26px_60px_-42px_rgba(24,32,63,0.45)] transition hover:-translate-y-0.5 hover:border-emerald-200/70 hover:shadow-[0_30px_68px_-40px_rgba(24,32,63,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 backdrop-blur-xl",
              )}
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/70 bg-emerald-50/80 text-sm font-semibold text-emerald-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-2">
                    {option.tag ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                        {option.tag}
                      </span>
                    ) : null}
                    <p className="text-lg font-semibold text-slate-900">
                      {option.title}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {option.description ?? option.prompt}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  Use this starter
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L13 6M19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/75 px-5 py-4 text-sm text-slate-600 backdrop-blur-xl shadow-[0_20px_55px_-40px_rgba(24,32,63,0.35)] sm:flex-row sm:items-center sm:justify-between">
          <p className="sm:max-w-md">
            Prefer to write your own? Skip the presets and I’ll start with a quick
            orientation covering all four opportunities.
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            Start without a starter
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
