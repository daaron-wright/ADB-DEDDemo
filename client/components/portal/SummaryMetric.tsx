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
    <div className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-[0_24px_72px_-38px_rgba(0,0,0,0.85)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
        {trend ? (
          <span
            className={`text-xs font-semibold ${trend.isPositive === false ? 'text-rose-400' : 'text-emerald-400'}`}
          >
            {trend.isPositive === false ? '▼' : '▲'} {trend.value}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-sm text-neutral-400">{helper}</p> : null}
    </div>
  );
}
