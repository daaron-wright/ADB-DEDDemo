import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIBusinessOrbProps {
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const NODE_DATA = [
  { cx: 18, cy: 22, radius: 2.4, delay: 0 },
  { cx: 30, cy: 12, radius: 2, delay: 0.4 },
  { cx: 46, cy: 16, radius: 2.2, delay: 0.8 },
  { cx: 54, cy: 30, radius: 2.5, delay: 1.2 },
  { cx: 44, cy: 44, radius: 2.7, delay: 1.6 },
  { cx: 26, cy: 48, radius: 2.5, delay: 2 },
  { cx: 18, cy: 34, radius: 2.1, delay: 2.4 },
  { cx: 36, cy: 28, radius: 2.3, delay: 2.8 },
];

const CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
  [0, 6],
  [6, 5],
  [1, 7],
  [7, 3],
  [6, 7],
  [7, 4],
];

export function AIBusinessOrb({
  className,
  showLabel = false,
  label = "AI",
}: AIBusinessOrbProps) {
  const uniqueId = useId();
  const fillGradientId = `${uniqueId}-fill`;
  const strokeGradientId = `${uniqueId}-stroke`;
  const nodeGradientId = `${uniqueId}-node`;
  const highlightGradientId = `${uniqueId}-highlight`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#041c29]/75",
        "ring-1 ring-white/18 shadow-[0_0_18px_-8px_rgba(84,255,212,0.65)]",
        className,
      )}
    >
      <motion.svg
        className="pointer-events-none absolute inset-1"
        viewBox="0 0 64 64"
        initial={false}
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          <radialGradient id={fillGradientId} cx="30%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#54ffd4" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#6550ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#041c29" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id={strokeGradientId} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#6c5bff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#54ffd4" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id={nodeGradientId} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#54ffd4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6a54ff" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id={highlightGradientId} cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="28"
          fill={`url(#${fillGradientId})`}
          stroke={`url(#${strokeGradientId})`}
          strokeWidth="1.2"
          opacity="0.95"
        />
        <motion.circle
          cx="22"
          cy="18"
          r="12"
          fill={`url(#${highlightGradientId})`}
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.g
          animate={{ rotate: [0, 2.8, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          style={{ transformOrigin: "32px 32px" }}
          stroke={`url(#${strokeGradientId})`}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        >
          {CONNECTIONS.map(([from, to]) => {
            const start = NODE_DATA[from];
            const end = NODE_DATA[to];
            return (
              <line
                key={`edge-${from}-${to}`}
                x1={start.cx}
                y1={start.cy}
                x2={end.cx}
                y2={end.cy}
              />
            );
          })}
          {NODE_DATA.map((node, index) => (
            <motion.circle
              key={`node-${index}`}
              cx={node.cx}
              cy={node.cy}
              r={node.radius}
              fill={`url(#${nodeGradientId})`}
              animate={{ r: [node.radius * 0.9, node.radius, node.radius * 0.9] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: node.delay,
              }}
              opacity={0.92}
            />
          ))}
        </motion.g>
      </motion.svg>
      {showLabel ? (
        <span className="relative text-[11px] font-semibold uppercase tracking-[0.42em] text-white">
          {label}
        </span>
      ) : null}
    </span>
  );
}
