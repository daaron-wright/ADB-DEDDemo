import { Download, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessViabilitySummaryProps {
  onExportPlan?: () => void;
  onBeginApplication?: () => void;
  onMaybeLater?: () => void;
}

const summaryPoints = [
  {
    title: "Demand signals align",
    description:
      "Corniche + Saadiyat catchments provide 10k–15k residents, steady tourist peaks, and 14k daily workers within a 10-minute radius.",
  },
  {
    title: "White space identified",
    description:
      "Filters remove non-aligned operators, exposing premium experiential gaps across Corniche sunset dining windows.",
  },
  {
    title: "Budget sits within target",
    description:
      "Operating costs benchmark at AED 520k–700k annually with service charges and utilities transparently itemised.",
  },
];

const nextSteps = [
  "Reserve the trade name Omnis suggested",
  "Auto-fill the investor workspace and checklist",
  "Sync Bayut spaces to the applicant portal for due diligence",
];

export const BusinessViabilitySummary: React.FC<BusinessViabilitySummaryProps> = ({
  onExportPlan,
}) => {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F766E]">
          Step 4 · Business viability summary
        </p>
        <h3 className="text-xl font-semibold text-slate-900">
          Layla&apos;s ideation journey is complete—time to move into application
        </h3>
        <p className="text-sm text-slate-600">
          Omnis consolidates the findings, generates a business-plan ready export, and keeps the chat experience as the
          primary call to action for the next phase.
        </p>
      </header>

      <section className="space-y-3">
        {summaryPoints.map((point) => (
          <div
            key={point.title}
            className="rounded-3xl border border-[#e2ece8] bg-[#f8fbfa] px-5 py-4 text-sm text-slate-700 shadow-[0_26px_70px_-52px_rgba(14,118,110,0.32)]"
          >
            <h4 className="text-base font-semibold text-slate-900">{point.title}</h4>
            <p className="mt-1 leading-relaxed">{point.description}</p>
          </div>
        ))}
      </section>

      <div className="rounded-3xl border border-[#e2ece8] bg-[#eef7f3] px-5 py-4 text-sm text-slate-700">
        <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0F766E]">Next steps</h4>
        <ul className="mt-3 space-y-2">
          {nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0F766E]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e2ece8] bg-white/90 px-5 py-4 shadow-[0_28px_70px_-52px_rgba(14,118,110,0.28)]">
        <div>
          <p className="text-sm font-semibold text-slate-900">Export your business plan &amp; CX data packs</p>
          <p className="text-xs text-slate-500">
            Download a PDF of every insight plus the curated CX data-packs prepared by the DED customer experience team.
          </p>
        </div>
        <button
          type="button"
          onClick={onExportPlan}
          className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/30 bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-[0_22px_60px_-40px_rgba(14,118,110,0.5)] transition hover:bg-[#0b5a54]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export everything
        </button>
      </div>

      <section className="space-y-4 rounded-3xl border border-[#e2ece8] bg-white px-5 py-5 shadow-[0_28px_72px_-58px_rgba(14,118,110,0.28)]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F766E]/12 text-[#0F766E]">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0F766E]">Omnis conversational handoff</p>
            <div className="rounded-2xl border border-[#e2ece8] bg-[#f8fbfa] px-4 py-3 text-sm leading-relaxed text-slate-700">
              "Congratulations, Layla. Your concept is highly viable. Ready for me to carry this into the formal
              application with the investor workspace?"
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBeginApplication}
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-[0_22px_60px_-40px_rgba(14,118,110,0.5)] transition",
              "hover:bg-[#0b5a54]",
            )}
          >
            Yes, begin the application
          </button>
          <button
            type="button"
            onClick={onMaybeLater}
            className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] transition hover:bg-[#f0faf7]"
          >
            Review other tracks
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Choosing the affirmative option above triggers the application workspace handoff in Omnis and syncs Lyla&apos;s
          progress with the formal applicant portal.
        </p>
      </section>
    </div>
  );
};

export default BusinessViabilitySummary;
