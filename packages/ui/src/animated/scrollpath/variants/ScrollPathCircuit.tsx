"use client";

import { motion } from "framer-motion";
import { useScrollPath } from "../ScrollPathContext";

export interface ScrollPathCircuitProps {
  strokeWidth?: number;
  glow?: boolean;
  color?: string;
  glowColor?: string;
  className?: string;
}

const circuitPaths = [
  // Top Left Track -> Left Node
  { d: "M 100 150 L 300 150 L 350 200 L 350 450 L 580 450", nodeX: 580, nodeY: 450, triggerProgress: 0.5 },
  // Top Right Track -> Right Node
  { d: "M 1340 150 L 1140 150 L 1090 200 L 1090 450 L 860 450", nodeX: 860, nodeY: 450, triggerProgress: 0.5 },
  // Bottom Left Track -> Core Bottom
  { d: "M 100 740 L 400 740 L 450 690 L 650 690 L 720 590", nodeX: 720, nodeY: 590, triggerProgress: 0.7 },
  // Bottom Right Track -> Core Bottom
  { d: "M 1340 740 L 1040 740 L 990 690 L 790 690 L 720 590", nodeX: 720, nodeY: 590, triggerProgress: 0.7 },
  // Extra branching tracks
  { d: "M 350 280 L 420 350 L 550 350", nodeX: 550, nodeY: 350, triggerProgress: 0.4 },
  { d: "M 1090 280 L 1020 350 L 890 350", nodeX: 890, nodeY: 350, triggerProgress: 0.4 },
];

export default function ScrollPathCircuit({
  strokeWidth = 2,
  glow = true,
  color = "#00f0ff", // Cyberpunk Neon Cyan
  glowColor = "rgba(0, 240, 255, 0.4)",
  className = "",
}: ScrollPathCircuitProps) {
  const { scrollProgress } = useScrollPath();

  // Multi-stage animations:
  // Tracks animate in the first 80% of scroll.
  // The center core power-up and ambient details animate in the last 20%.
  const trackProgress = Math.min(1, scrollProgress / 0.8);
  const coreProgress = scrollProgress > 0.8 ? (scrollProgress - 0.8) / 0.2 : 0;

  return (
    <div className={`w-full px-4 flex justify-center ${className}`}>
      <svg
        width="1440"
        height="890"
        viewBox="0 0 1440 890"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-7xl"
      >
        {/* Glow Filters */}
        <defs>
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>

        {/* Grid Background details */}
        <g stroke="#ffffff" strokeWidth="0.5" className="opacity-[0.03]">
          <path d="M 0 100 L 1440 100 M 0 200 L 1440 200 M 0 300 L 1440 300 M 0 400 L 1440 400 M 0 500 L 1440 500 M 0 600 L 1440 600 M 0 700 L 1440 700 M 0 800 L 1440 800" />
          <path d="M 100 0 L 100 890 M 200 0 L 200 890 M 300 0 L 300 890 M 400 0 L 400 890 M 500 0 L 500 890 M 600 0 L 600 890 M 700 0 L 700 890 M 800 0 L 800 890 M 900 0 L 900 890 M 1000 0 L 1000 890 M 1100 0 L 1100 890 M 1200 0 L 1200 890 M 1300 0 L 1300 890" />
        </g>

        {/* Circuit Tracks */}
        {circuitPaths.map((p, idx) => (
          <g key={idx}>
            {glow && (
              <motion.path
                d={p.d}
                stroke={glowColor}
                strokeWidth={strokeWidth * 3}
                fill="none"
                filter="url(#circuitGlow)"
                className="opacity-40"
                initial={false}
                animate={{ pathLength: trackProgress }}
                transition={{ type: "tween", duration: 0.1, ease: "easeOut" }}
              />
            )}
            <motion.path
              d={p.d}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              initial={false}
              animate={{ pathLength: trackProgress }}
              transition={{ type: "tween", duration: 0.1, ease: "easeOut" }}
            />

            {/* Glowing nodes at path ends */}
            {trackProgress >= p.triggerProgress && (
              <motion.circle
                cx={p.nodeX}
                cy={p.nodeY}
                r={5}
                fill={color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              />
            )}
            {trackProgress >= p.triggerProgress && glow && (
              <motion.circle
                cx={p.nodeX}
                cy={p.nodeY}
                r={10}
                fill={color}
                filter="url(#circuitGlow)"
                className="opacity-50"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </g>
        ))}

        {/* Central Core Microchip */}
        <g transform="translate(650, 380)">
          {/* Core Outer Frame */}
          <rect
            x="0"
            y="0"
            width="140"
            height="140"
            rx="12"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            className="opacity-30"
          />

          {/* Core Power Glow */}
          {coreProgress > 0 && (
            <motion.rect
              x="10"
              y="10"
              width="120"
              height="120"
              rx="8"
              fill={color}
              filter="url(#circuitGlow)"
              style={{ opacity: coreProgress * 0.3 }}
            />
          )}

          {/* Core Inner Pattern */}
          <rect
            x="15"
            y="15"
            width="110"
            height="110"
            rx="6"
            fill="#090d16"
            stroke={color}
            strokeWidth="2"
            className="shadow-2xl"
          />

          {/* Glowing processor details */}
          <motion.g
            animate={
              coreProgress > 0.5
                ? { opacity: [0.6, 1, 0.6] }
                : { opacity: coreProgress }
            }
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <rect x="35" y="35" width="70" height="70" rx="4" fill="none" stroke={color} strokeWidth="1" />
            <circle cx="70" cy="70" r="15" fill="none" stroke={color} strokeWidth="2" />
            {/* Inner dots */}
            <circle cx="70" cy="70" r="4" fill={color} />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
