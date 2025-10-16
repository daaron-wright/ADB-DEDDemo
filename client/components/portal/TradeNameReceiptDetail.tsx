import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, ScrollText } from "lucide-react";

import {
  PRIMARY_TRADE_NAME_AR,
  PRIMARY_TRADE_NAME_EN,
  TRADE_NAME_RECEIPT_METADATA,
} from "./trade-name-constants";
import { CONTRACT_MAIN_SECTIONS } from "./trade-name-receipt-content";

type ParagraphColumnProps = {
  text: string;
  direction: "ltr" | "rtl";
};

function ParagraphColumn({ text, direction }: ParagraphColumnProps) {
  const paragraphs = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div className="space-y-2 text-sm" dir={direction}>
      {paragraphs.map((line, index) => {
        const isBullet = line.startsWith("•");
        const content = isBullet ? line.slice(1).trim() : line;

        return (
          <p
            key={`${direction}-${index}`}
            className={cn(
              "leading-relaxed text-slate-600",
              direction === "rtl" && "text-right",
              isBullet &&
                "relative pl-4 before:absolute before:left-1 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-[#0f766e] lg:pl-5 lg:before:left-2",
            )}
          >
            {content}
          </p>
        );
      })}
    </div>
  );
}

export function TradeNameReceiptDetail() {
  const {
    receiptNumber,
    transactionNumber,
    paymentDate,
    paymentAmountAed,
    paymentMethod,
    authority,
  } = TRADE_NAME_RECEIPT_METADATA;

  const metadataItems: Array<{
    label: string;
    value: string;
    direction?: "ltr" | "rtl";
  }> = [
    { label: "Receipt number", value: receiptNumber },
    { label: "Transaction", value: transactionNumber },
    { label: "Payment date", value: paymentDate },
    { label: "Amount (AED)", value: paymentAmountAed },
    { label: "Payment method", value: paymentMethod },
    { label: "Authority", value: authority },
    { label: "Trade name (EN)", value: PRIMARY_TRADE_NAME_EN },
    { label: "Trade name (AR)", value: PRIMARY_TRADE_NAME_AR, direction: "rtl" },
  ];

  return (
    <section className="mt-4 space-y-5 rounded-3xl border border-[#d8e4df] bg-white/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.32)] lg:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0f766e]/20 bg-[#0f766e]/5 text-[#0f766e]">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900">Trade Name Reservation Document</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              CONTRACT_main · Digitally signed
            </p>
          </div>
        </div>
        <Badge className="inline-flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
          <ScrollText className="h-3.5 w-3.5" strokeWidth={3} />
          Stored in vault
        </Badge>
      </header>

      <div className="grid gap-3 rounded-2xl border border-[#e6f2ed] bg-[#f8fbfa] p-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        {metadataItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </p>
            <p
              className={cn(
                "break-words text-sm font-semibold text-slate-900",
                item.direction === "rtl" && "text-[#0f766e]",
              )}
              dir={item.direction}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {CONTRACT_MAIN_SECTIONS.map((section) => (
          <article
            key={section.heading}
            className="space-y-3 rounded-2xl border border-[#e6f2ed] bg-white/95 p-4 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.28)]"
          >
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              {section.heading}
            </h4>
            <div className="grid gap-4 lg:grid-cols-2">
              <ParagraphColumn text={section.english} direction="ltr" />
              <ParagraphColumn text={section.arabic} direction="rtl" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
