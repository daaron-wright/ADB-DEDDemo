import { cn } from "@/lib/utils";

export interface PolarisIconProps extends React.SVGAttributes<SVGSVGElement> {
  variant?: "default" | "badge";
}

export function PolarisIcon({ className, variant = "default", ...props }: PolarisIconProps) {
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
          id="polarisMonoCore"
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
          id="polarisMonoArc"
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
        <radialGradient id="polarisMonoHighlight" cx="36%" cy="28%" r="32%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="polarisMonoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#polarisMonoGlow)">
        <circle cx="32" cy="32" r="27" fill="url(#polarisMonoCore)" />
      </g>

      <circle cx="23" cy="23" r="14" fill="url(#polarisMonoHighlight)" />

      <path
        d="M13.2 31.6c3.1-10.4 14.7-16 25.2-12.3 9.5 3.4 14.2 13 10.2 20.9-3.7 7.4-13.1 10.6-20.4 6.7"
        stroke="url(#polarisMonoArc)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      <circle cx="44.6" cy="18.8" r="3.2" fill="#F0F0F0" opacity="0.85" />
      <circle cx="17.9" cy="45.6" r="2.4" fill="#BEBEBE" opacity="0.65" />
      <circle cx="36.8" cy="47.2" r="3.1" fill="#1D1D1D" opacity="0.8" />
    </svg>
  );
}
