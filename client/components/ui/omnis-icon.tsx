import { cn } from "@/lib/utils";

export interface OmnisIconProps extends React.SVGAttributes<SVGSVGElement> {
  variant?: "default" | "badge";
}

export function OmnisIcon({ className, variant = "default", ...props }: OmnisIconProps) {
  const sizeClasses = variant === "badge" ? "h-14 w-14" : "h-16 w-16";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={cn("shrink-0", sizeClasses, className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient
          id="omnisMonoCore"
          cx="50%"
          cy="50%"
          r="55%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#F4F4F4" />
          <stop offset="45%" stopColor="#C8C8C8" />
          <stop offset="100%" stopColor="#111111" />
        </radialGradient>
        <linearGradient
          id="omnisMonoArc"
          x1="12%"
          y1="18%"
          x2="88%"
          y2="82%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#FAFAFA" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#D9D9D9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7C7C7C" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient
          id="omnisMonoWave"
          x1="18%"
          y1="32%"
          x2="84%"
          y2="70%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#F0F0F0" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#BFBFBF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#161616" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id="omnisMonoHighlight" cx="36%" cy="28%" r="32%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="omnisMonoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#omnisMonoGlow)">
        <circle cx="32" cy="32" r="27" fill="url(#omnisMonoCore)" />
      </g>

      <circle cx="23" cy="23" r="14" fill="url(#omnisMonoHighlight)" />

      <path
        d="M13.2 31.6c3.1-10.4 14.7-16 25.2-12.3 9.5 3.4 14.2 13 10.2 20.9-3.7 7.4-13.1 10.6-20.4 6.7"
        stroke="url(#omnisMonoArc)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      <path
        d="M46.4 24.5c3.5 10-1.2 21.1-10.8 25-8.2 3.3-18.1 0.7-23.5-6.8"
        stroke="url(#omnisMonoWave)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />

      <path
        d="M19.5 21.2c6-5.8 15.8-6.6 23-1.8 6.1 3.9 9.2 10.4 8.4 16.8"
        stroke="url(#omnisMonoWave)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />

      <circle cx="44.6" cy="18.8" r="3.2" fill="#F0F0F0" opacity="0.85" />
      <circle cx="17.9" cy="45.6" r="2.4" fill="#BEBEBE" opacity="0.65" />
      <circle cx="36.8" cy="47.2" r="3.1" fill="#1D1D1D" opacity="0.8" />
    </svg>
  );
}
