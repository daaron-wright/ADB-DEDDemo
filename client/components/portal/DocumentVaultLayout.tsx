import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { TRADE_NAME_RECEIPT_IMAGE_URL } from "./trade-name-constants";

interface DocumentVaultLayoutProps {
  isProcessing: boolean;
  statusHeading: string;
  statusDescription: string;
  children: React.ReactNode;
  className?: string;
}

export function DocumentVaultLayout({
  isProcessing,
  statusHeading,
  statusDescription,
  children,
  className,
}: DocumentVaultLayoutProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]", className)}>
      <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-[#d8e4df] bg-white">
        <img
          src={TRADE_NAME_RECEIPT_IMAGE_URL}
          alt="Trade name reservation receipt stored in the vault"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              {isProcessing ? "Live sync" : "Auto-sync"}
            </p>
            <p className="text-sm font-semibold text-slate-900">{statusHeading}</p>
            <p className="text-xs text-slate-600">{statusDescription}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0f766e]/30 bg-white text-[#0f766e]">
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Check className="h-5 w-5" strokeWidth={3} />
            )}
          </span>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
