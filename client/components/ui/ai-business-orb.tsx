import { cn } from "@/lib/utils";

interface AIBusinessOrbProps {
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function AIBusinessOrb({
  className,
  showLabel = false,
  label = "AI",
}: AIBusinessOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full",
        "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.85),rgba(84,255,212,0.35)_35%,rgba(78,56,221,0.55)_62%,rgba(6,31,42,0.95)_100%)]",
        "shadow-[0_0_34px_-6px_rgba(84,255,212,0.55)] ring-1 ring-white/25",
        className,
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 120 120"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="orbGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="32%" stopColor="#54ffd4" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#4a63f6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#041f26" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id="networkLines" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#54ffd4" />
            <stop offset="100%" stopColor="#6d4dfc" />
          </linearGradient>
          <radialGradient id="nodeFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#6effe0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6d4dfc" stopOpacity="0.95" />
          </radialGradient>
          <filter id="nodeGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#orbGradient)" />
        <g stroke="url(#networkLines)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          <path d="M26 42 C42 24 74 22 88 38" />
          <path d="M30 74 C44 88 78 90 94 70" />
          <path d="M40 32 C30 60 30 78 52 92" />
          <path d="M68 24 C90 38 94 58 82 86" />
          <path d="M36 58 C52 46 70 46 88 58" />
        </g>
        <g filter="url(#nodeGlow)">
          <circle cx="26" cy="42" r="4.5" fill="url(#nodeFill)" />
          <circle cx="44" cy="28" r="3.5" fill="url(#nodeFill)" />
          <circle cx="68" cy="24" r="3.8" fill="url(#nodeFill)" />
          <circle cx="88" cy="38" r="4.2" fill="url(#nodeFill)" />
          <circle cx="94" cy="70" r="4.7" fill="url(#nodeFill)" />
          <circle cx="76" cy="94" r="4" fill="url(#nodeFill)" />
          <circle cx="52" cy="92" r="4.4" fill="url(#nodeFill)" />
          <circle cx="32" cy="78" r="3.6" fill="url(#nodeFill)" />
          <circle cx="36" cy="58" r="4" fill="url(#nodeFill)" />
          <circle cx="60" cy="56" r="5" fill="url(#nodeFill)" />
          <circle cx="82" cy="86" r="3.8" fill="url(#nodeFill)" />
        </g>
      </svg>
      <span className="pointer-events-none absolute inset-[22%] rounded-full bg-white/45 opacity-70 blur-2xl" />
      <span className="pointer-events-none absolute inset-[36%] rounded-full bg-white/30 opacity-60 blur-lg" />
      {showLabel ? (
        <span className="relative text-[11px] font-semibold uppercase tracking-[0.42em] text-white">
          {label}
        </span>
      ) : null}
    </span>
  );
}
