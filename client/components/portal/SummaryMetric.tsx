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
    <div className="rounded-3xl border border-white/30 bg-white/90 p-5 shadow-[0_18px_44px_-28px_rgba(24,32,63,0.55)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-500/70">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
        {trend ? (
          <span
            className={`text-xs font-semibold ${trend.isPositive === false ? 'text-rose-500' : 'text-emerald-500'}`}
          >
            {trend.isPositive === false ? '▼' : '▲'} {trend.value}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}
