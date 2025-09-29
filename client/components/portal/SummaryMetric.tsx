import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface SummaryMetricProps {
  label: string;
  value: string;
  helper?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function SummaryMetric({ label, value, helper, trend }: SummaryMetricProps) {
  return (
    <div className="rounded-2xl border border-[#d8e4df] bg-white px-6 py-5 shadow-[0_12px_28px_-24px_rgba(11,64,55,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
        {trend ? (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${trend.isPositive === false ? "text-rose-500" : "text-emerald-600"}`}
          >
            {trend.isPositive === false ? (
              <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            )}
            {trend.value}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{helper}</p> : null}
    </div>
  );
}
