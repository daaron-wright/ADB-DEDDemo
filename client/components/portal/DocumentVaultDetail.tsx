import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DocumentVaultItem } from "./document-vault-types";
import { TRADE_NAME_RECEIPT_DOCUMENT_ID } from "./trade-name-constants";
import { TradeNameReceiptDetail } from "./TradeNameReceiptDetail";

interface DocumentVaultDetailProps {
  document: DocumentVaultItem | undefined;
}

export function DocumentVaultDetail({ document }: DocumentVaultDetailProps) {
  if (!document) {
    return null;
  }

  if (document.id === TRADE_NAME_RECEIPT_DOCUMENT_ID) {
    return <TradeNameReceiptDetail />;
  }

  return (
    <section className="mt-4 space-y-3 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.32)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0f766e]/15 bg-[#0f766e]/5 text-[#0f766e]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">{document.title}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {document.source}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            document.status === "completed"
              ? "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]"
              : "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
          )}
        >
          {document.status === "completed" ? "Stored" : "Needs review"}
        </Badge>
      </header>
      <p className="text-sm text-slate-600">{document.description}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span className="rounded-full border border-[#0f766e]/20 bg-[#0f766e]/5 px-3 py-1 text-[#0f766e]">
          {document.integrationBadge}
        </span>
        <span>{document.sourceDetail}</span>
        <span>{document.actionLabel}</span>
      </div>
    </section>
  );
}
