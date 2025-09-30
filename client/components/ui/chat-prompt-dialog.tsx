import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ChatPromptOption {
  id: string;
  title: string;
  prompt: string;
  description?: string;
}

interface ChatPromptDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  options: ChatPromptOption[];
  onSelect: (option: ChatPromptOption) => void;
}

export function ChatPromptDialog({ open, onOpenChange, options, onSelect }: ChatPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-white/60 bg-white/95 p-8 shadow-[0_30px_80px_-60px_rgba(24,32,63,0.55)] backdrop-blur-xl">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            Start a conversation
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Choose a quick question to jump into the investor journey, or craft your own once the chat opens.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-[0_16px_36px_-28px_rgba(24,32,63,0.4)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 hover:border-emerald-200 hover:shadow-[0_20px_42px_-30px_rgba(24,32,63,0.45)]",
              )}
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                  <p className="text-sm text-slate-600">{option.prompt}</p>
                  {option.description ? (
                    <p className="text-xs text-slate-400">{option.description}</p>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-7 flex justify-end">
          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
            >
              Maybe later
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
