import * as React from "react";

import { chatCardClass } from "@/lib/chat-style";
import { Loader2 } from "lucide-react";
import { PRIMARY_TRADE_NAME_EN, MARWA_TRADE_NAME_EN } from "./trade-name-constants";

interface MyTAMMDocumentsProps {
  companyName?: string;
  isGenerating?: boolean;
}

export function MyTAMMDocuments({
  companyName = PRIMARY_TRADE_NAME_EN,
  isGenerating = true,
}: MyTAMMDocumentsProps) {
  return (
    <div
      className={chatCardClass(
        "space-y-6 border border-slate-200 bg-white p-6 shadow-[0_36px_80px_-60px_rgba(15,23,42,0.18)] sm:p-8",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">
          My TAMM Documents
        </h3>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex gap-3 lg:flex-col">
          <div className="relative flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/6874f52d79db5dff4a42886b0395ffbe0cf14b5d?width=174"
              alt="Document 1"
              className="h-28 w-20 rounded-lg border border-slate-200 object-cover shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]"
            />
          </div>
          <div className="relative flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/f4db5140ddd80fde530b18c48457b833a2fdbdfc?width=164"
              alt="Document 2"
              className="h-28 w-20 rounded-lg border border-slate-200 object-cover shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]"
            />
          </div>
          <div className="relative flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/170ef7e3e49b30637afc0c58c2de19a1200601c3?width=164"
              alt="Document 3"
              className="h-28 w-20 rounded-lg border border-slate-200 object-cover opacity-60 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]"
            />
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#54ffd4]" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_56px_-32px_rgba(0,0,0,0.3)]">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fee137034581f487e985a3286267255c8?format=webp&width=1256"
              alt={`Memorandum of Association preview for ${MARWA_TRADE_NAME_EN.toUpperCase()}`}
              className="h-auto w-full"
            />
            <div className="absolute left-[14%] top-[8.6%] w-[39%]">
              <div className="h-5 bg-[#a6ffe8]/60" />
            </div>
            <div className="absolute left-[13.5%] top-[41.2%] w-[27.5%]">
              <div className="h-[18px] bg-[#a6ffe8]/60" />
            </div>
            <div className="absolute left-[27%] top-[41.2%] flex w-[31%] items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 flex-shrink-0 animate-spin text-[#169f9f]" />
              <div className="h-[18px] flex-1 bg-[#a6ffe8]/60" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2 backdrop-blur-sm">
            <p className="text-xs text-slate-900">{companyName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
