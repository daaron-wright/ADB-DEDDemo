import * as React from "react";
import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DocumentStatus, DocumentVaultItem } from "./document-vault-types";

const statusTokens: Record<
  DocumentStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ready: {
    label: "Ready",
    badgeClass: "border-[#94d2c2] bg-[#dff2ec] text-[#0b7d6f]",
    dotClass: "bg-[#0b7d6f]",
  },
  requires_action: {
    label: "Needs review",
    badgeClass: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    dotClass: "bg-[#b97324]",
  },
  completed: {
    label: "Complete",
    badgeClass: "border-[#b7e1d4] bg-[#eaf7f3] text-[#0f766e]",
    dotClass: "bg-[#0f766e]",
  },
};

export interface DocumentVaultCardProps {
  item: DocumentVaultItem;
  isActive?: boolean;
  onSelect?: (id: string) => void;
  disabled?: boolean;
}

export function DocumentVaultCard({
  item,
  isActive = false,
  onSelect,
  disabled = false,
}: DocumentVaultCardProps) {
  const token = statusTokens[item.status];
  const isCompleted = item.status === "completed";
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(item.id) : undefined}
      disabled={onSelect ? disabled : undefined}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 text-left shadow-[0_28px_60px_-56px_rgba(15,23,42,0.4)] transition",
        isActive && !isCompleted && "border-[#0f766e] bg-white",
        isCompleted && "border-[#d8e4df] bg-[#f8fbfa] text-slate-500",
        disabled && "cursor-not-allowed opacity-60",
        !onSelect && "cursor-default",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-[#e6f2ed] bg-[#f7fbf9] text-[#0f766e] transition",
              isActive && !isCompleted && "border-[#0f766e] text-[#0f766e]",
              isCompleted && "border-[#d8e4df] bg-white text-[#94a3b8]",
            )}
          >
            <FileText className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p
              className={cn(
                "text-sm font-semibold",
                isCompleted ? "text-slate-600" : "text-slate-900",
              )}
            >
              {item.title}
            </p>
            <p className={cn("text-xs", isCompleted ? "text-slate-400" : "text-slate-500")}>{item.source}</p>
          </div>
        </div>
        <Badge
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            token.badgeClass,
            isCompleted && "border-[#d8e4df] bg-white text-[#0f766e]",
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", token.dotClass)} />
          {isCompleted ? "Stored" : token.label}
        </Badge>
      </div>
      <p className={cn("text-sm", isCompleted ? "text-slate-500" : "text-slate-600")}>{item.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            isCompleted ? "border-[#d8e4df] bg-white text-slate-400" : "border-[#0f766e]/30 bg-[#0f766e]/5 text-[#0f766e]",
          )}
        >
          {item.integrationBadge}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {item.sourceDetail}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold",
          isCompleted ? "text-slate-400" : "text-[#0f766e]",
        )}
      >
        {isCompleted ? "Document stored" : item.actionLabel}
        <Download
          className={cn(
            "h-4 w-4",
            isCompleted ? "opacity-40" : "transition group-hover:translate-x-1",
          )}
        />
      </span>
    </Wrapper>
  );
}
