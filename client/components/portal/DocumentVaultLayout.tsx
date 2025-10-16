import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DOCUMENT_VAULT_IMAGE_URL } from "./document-vault-data";
import type { DocumentVaultItem } from "./document-vault-types";
import {
  TRADE_NAME_RECEIPT_DOCUMENT_ID,
  TRADE_NAME_RECEIPT_IMAGE_URL,
} from "./trade-name-constants";

interface DocumentVaultLayoutProps {
  isProcessing: boolean;
  statusHeading: string;
  statusDescription: string;
  children: React.ReactNode;
  className?: string;
  activeDocument?: DocumentVaultItem;
}

export function DocumentVaultLayout({
  isProcessing,
  statusHeading,
  statusDescription,
  children,
  className,
  activeDocument,
}: DocumentVaultLayoutProps) {
  const previewImageSrc =
    activeDocument?.id === TRADE_NAME_RECEIPT_DOCUMENT_ID
      ? TRADE_NAME_RECEIPT_IMAGE_URL
      : DOCUMENT_VAULT_IMAGE_URL;

  const previewAlt = activeDocument
    ? `${activeDocument.title} preview`
    : "Documents syncing in the vault";

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]", className)}>
      <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-[#d8e4df] bg-white">
        <img src={previewImageSrc} alt={previewAlt} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              {isProcessing ? "Live sync" : "Auto-sync"}
            </p>
            <p className="text-sm font-semibold text-slate-900">{statusHeading}</p>
            <p className="text-xs text-slate-600">{statusDescription}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeDocument?.id === TRADE_NAME_RECEIPT_DOCUMENT_ID ? (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-[#0f766e] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#0c6059]"
              >
                <a href={TRADE_NAME_RECEIPT_IMAGE_URL} target="_blank" rel="noreferrer">
                  Open digital receipt
                </a>
              </Button>
            ) : null}
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0f766e]/30 bg-white text-[#0f766e]">
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" strokeWidth={3} />
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
