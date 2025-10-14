import * as React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CollapsibleCardProps {
  value: string;
  title: string;
  subtitle?: React.ReactNode;
  contentId?: string;
  children: React.ReactNode;
}

export function CollapsibleCard({
  value,
  title,
  subtitle,
  contentId,
  children,
}: CollapsibleCardProps) {
  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-3xl border border-[#d8e4df] bg-white shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]"
    >
      <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-slate-900 hover:no-underline">
        <div className="flex flex-1 flex-col text-left">
          <span>{title}</span>
          {subtitle ? (
            <span className="mt-1 text-sm font-normal text-slate-500">{subtitle}</span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent id={contentId} className="px-5 pb-5 pt-0">
        <div className="space-y-4 pt-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
