import * as React from "react";

import { cn } from "@/lib/utils";

export interface OmnisIconProps extends React.SVGAttributes<SVGSVGElement> {
  variant?: "default" | "badge";
}

export function OmnisIcon({ className, variant = "default", ...props }: OmnisIconProps) {
  const sizeClasses =
    variant === "badge"
      ? "h-14 w-14"
      : "h-16 w-16";

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
          id="omnisOrb"
          cx="50%"
          cy="45%"
          r="65%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#39c1b4" />
          <stop offset="45%" stopColor="#3f9de1" />
          <stop offset="100%" stopColor="#7a4dd6" />
        </radialGradient>
        <linearGradient
          id="omnisRing"
          x1="10%"
          y1="20%"
          x2="90%"
          y2="78%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#f7fdfa" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#d7f4ef" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c5defa" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <g filter="url(#omnisGlow)">
        <circle cx="32" cy="32" r="28" fill="url(#omnisOrb)" />
      </g>

      <path
        d="M14.5 30.4c2.7-10 13.9-15.3 24.4-11.5 9.2 3.3 13.6 13.2 9.5 21.2-3.5 6.9-12.4 9.7-19.3 6.3"
        stroke="url(#omnisRing)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      <circle cx="27.6" cy="32.8" r="9.8" fill="rgba(255,255,255,0.25)" />
      <circle cx="27.6" cy="32.8" r="6.4" fill="rgba(255,255,255,0.85)" />

      <circle
        cx="45.5"
        cy="17.4"
        r="4.6"
        fill="rgba(255,255,255,0.72)"
        transform="rotate(12 45.5 17.4)"
      />

      <circle cx="21.2" cy="48.2" r="3" fill="rgba(230,255,250,0.65)" />

      <defs>
        <filter id="omnisGlow" x="0" y="0" width="64" height="64">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
