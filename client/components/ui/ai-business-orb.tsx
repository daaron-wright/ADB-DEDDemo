import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIBusinessOrbProps {
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const NODE_DATA = [
  { cx: 24, cy: 22, radius: 2.6, delay: 0 },
  { cx: 34, cy: 18, radius: 2.3, delay: 0.5 },
  { cx: 44, cy: 24, radius: 2.5, delay: 1 },
  { cx: 40, cy: 34, radius: 2.7, delay: 1.5 },
  { cx: 30, cy: 36, radius: 2.4, delay: 2 },
  { cx: 22, cy: 30, radius: 2.1, delay: 2.5 },
  { cx: 28, cy: 28, radius: 2.2, delay: 3 },
];

const CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
  [6, 0],
  [6, 3],
  [6, 4],
  [1, 6],
];

export function AIBusinessOrb({
  className,
  showLabel = false,
  label = "AI",
}: AIBusinessOrbProps) {
  const uniqueId = useId();
  const haloGradientId = `${uniqueId}-halo`;
  const lineGradientId = `${uniqueId}-line`;
  const nodeGradientId = `${uniqueId}-node`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white",
        "ring-1 ring-emerald-200 shadow-[0_0_18px_-10px_rgba(16,185,129,0.55)]",
        className,
      )}
    >
      <motion.svg
        className="pointer-events-none absolute inset-[14%]"
        viewBox="0 0 60 60"
        initial={false}
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          <radialGradient id={haloGradientId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#a4ffe7" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#a4ffe7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={lineGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34f4c1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1eb394" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id={nodeGradientId} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#bfffe8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1ac79f" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="22" fill={`url(#${haloGradientId})`} />
        <motion.g
          animate={{ rotate: [0, 1.6, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          style={{ transformOrigin: "30px 30px" }}
        >
          <g
            stroke={`url(#${lineGradientId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
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
          </g>
          {NODE_DATA.map((node, index) => (
            <motion.circle
              key={`node-${index}`}
              cx={node.cx}
              cy={node.cy}
              r={node.radius}
              fill={`url(#${nodeGradientId})`}
              animate={{ r: [node.radius * 0.92, node.radius, node.radius * 0.92] }}
              transition={{
                duration: 6,
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
        <span className="relative text-[11px] font-semibold uppercase tracking-[0.42em] text-emerald-700">
          {label}
        </span>
      ) : null}
    </span>
  );
}
