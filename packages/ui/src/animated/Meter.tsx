"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "../lib/utils";

export interface MeterProps {
  /** Numerical score value (default range: -100 to +100) */
  value: number;
  /** Scale tick marks (default: [-100, -50, 0, 50, 100]) */
  ticks?: number[];
  /** Minimum score boundary (default: -100) */
  min?: number;
  /** Maximum score boundary (default: +100) */
  max?: number;
  /** Enable initial sweep calibration animation from min to max then to value (default: true) */
  sweepOnMount?: boolean;
  /** Display size variant (default: "md") */
  size?: "sm" | "md" | "lg";
  /** Optional custom container CSS classes */
  className?: string;
}

export function getSentimentStroke(score: number) {
  if (score > 15) return "#10B981"; // Emerald Green
  if (score < -15) return "#F43F5E"; // Rose
  return "#71717A"; // Original Zinc Grey
}

export function getNeedleCoordinates(
  score: number,
  minScore = -100,
  maxScore = 100,
  cx = 100,
  cy = 100,
  radius = 64
) {
  const clamped = Math.max(minScore, Math.min(maxScore, score));
  const norm = (clamped - minScore) / (maxScore - minScore); // 0 to 1
  // Start angle: 135deg (bottom-left), End angle: 405deg = 45deg (bottom-right)
  const angleInDegrees = 135 + norm * 270;
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const x = cx + radius * Math.cos(angleInRadians);
  const y = cy + radius * Math.sin(angleInRadians);
  return { x, y };
}

export function Meter({
  value,
  ticks = [-100, -50, 0, 50, 100],
  min = -100,
  max = 100,
  sweepOnMount = true,
  size = "md",
  className = "",
}: MeterProps) {
  const clampedValue = Math.max(min, Math.min(max, value));
  const strokeColor = getSentimentStroke(clampedValue);

  // Animated continuous score state for exact needle synchronization
  const [animatedScore, setAnimatedScore] = useState(
    sweepOnMount ? min : clampedValue
  );

  // Synchronized needle animation sequence on mount or value change (relaxed 2.8s sweep)
  useEffect(() => {
    if (!sweepOnMount) {
      setAnimatedScore(clampedValue);
      return;
    }

    const controls = animate(min, [min, max, clampedValue], {
      duration: 2.8,
      times: [0, 0.45, 1],
      ease: ["easeInOut", "easeOut"],
      onUpdate: (latest) => {
        setAnimatedScore(latest);
      },
    });

    return () => controls.stop();
  }, [clampedValue, min, max, sweepOnMount]);

  const displayScore = Math.round(animatedScore);
  const needleCoords = getNeedleCoordinates(animatedScore, min, max, 100, 100, 64);

  // Size dimensions map
  const sizeMap = {
    sm: "w-48 h-48",
    md: "w-64 h-64",
    lg: "w-80 h-80",
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Sub-tick positions (16 sub-ticks between main ticks for watch face precision)
  const subTicks = Array.from({ length: 17 }, (_, i) => min + (i / 16) * (max - min));

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none group",
        currentSize,
        className
      )}
    >
      {/* Google Poppins Font Import for SVG text rendering */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');`,
        }}
      />

      {/* Ambient Radial Backdrop Glow */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${strokeColor} 0%, transparent 70%)`,
        }}
      />

      {/* SVG Gauge Element */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible drop-shadow-md z-10"
      >
        <defs>
          {/* Ghost Laser Glow Filter */}
          <filter id="ghostGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Machined Metallic Bezel Gradient */}
          <linearGradient id="metalBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#71717A" />
            <stop offset="50%" stopColor="#3F3F46" />
            <stop offset="100%" stopColor="#18181B" />
          </linearGradient>

          {/* Inner Metallic Cap Specular Gradient */}
          <radialGradient id="metalCapGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#52525B" />
            <stop offset="60%" stopColor="#27272A" />
            <stop offset="100%" stopColor="#09090B" />
          </radialGradient>
        </defs>

        {/* Background Full Arc Track (r = 60) */}
        <path
          d="M 57.57 142.43 A 60 60 0 1 1 142.43 142.43"
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Full Colored Sentiment Track Outline */}
        <path
          d="M 57.57 142.43 A 60 60 0 1 1 142.43 142.43"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* Sub-ticks (Precision Watch Face Micro Lines r=62..66) */}
        {subTicks.map((subVal, idx) => {
          const norm = (subVal - min) / (max - min);
          const angleDeg = 135 + norm * 270;
          const rad = (angleDeg * Math.PI) / 180;

          const stx1 = 100 + 62 * Math.cos(rad);
          const sty1 = 100 + 62 * Math.sin(rad);
          const stx2 = 100 + 66 * Math.cos(rad);
          const sty2 = 100 + 66 * Math.sin(rad);

          return (
            <line
              key={`sub-${idx}`}
              x1={stx1}
              y1={sty1}
              x2={stx2}
              y2={sty2}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Main Scale Ticks and Spaced Numbers in Poppins Font */}
        {ticks.map((tickVal) => {
          const norm = (tickVal - min) / (max - min);
          const angleDeg = 135 + norm * 270;
          const rad = (angleDeg * Math.PI) / 180;

          // Tick lines (inner r=62, outer r=70)
          const tx1 = 100 + 62 * Math.cos(rad);
          const ty1 = 100 + 62 * Math.sin(rad);
          const tx2 = 100 + 70 * Math.cos(rad);
          const ty2 = 100 + 70 * Math.sin(rad);

          // Numbers with generous spacing (r=88)
          const lx = 100 + 88 * Math.cos(rad);
          const ly = 100 + 88 * Math.sin(rad);

          const isCurrentTick = Math.abs(displayScore - tickVal) < (max - min) / 10;

          return (
            <g key={tickVal} className="select-none">
              <line
                x1={tx1}
                y1={ty1}
                x2={tx2}
                y2={ty2}
                stroke={isCurrentTick ? strokeColor : "rgba(255, 255, 255, 0.16)"}
                strokeWidth={isCurrentTick ? "1.8" : "1"}
                className="transition-colors duration-200"
              />
              <text
                x={lx}
                y={ly + 3}
                textAnchor="middle"
                fill={isCurrentTick ? "#FFFFFF" : "rgba(161, 161, 170, 0.6)"}
                style={{ fontFamily: "'Poppins', sans-serif" }}
                className="text-[9px] font-semibold tracking-tight transition-colors duration-200"
              >
                {tickVal > 0 ? `+${tickVal}` : tickVal}
              </text>
            </g>
          );
        })}

        {/* Glowy Ghost Needle Hand (Length 64px, clean rounded tip) */}
        <g>
          {/* Ghost Glow Aura Line */}
          <line
            x1="100"
            y1="100"
            x2={needleCoords.x}
            y2={needleCoords.y}
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.35"
            filter="url(#ghostGlow)"
          />

          {/* Core Glowy Needle Line */}
          <line
            x1="100"
            y1="100"
            x2={needleCoords.x}
            y2={needleCoords.y}
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 5px currentColor)" }}
          />
        </g>

        {/* Machined Metallic Center Pivot Cap (Knob-Nudge Metal Finish, No Dot) */}
        <g>
          {/* Outer Metallic Bezel Ring */}
          <circle cx="100" cy="100" r="7.5" fill="url(#metalBezelGrad)" stroke="#52525B" strokeWidth="0.8" />
          {/* Inner Specular Metallic Cap */}
          <circle cx="100" cy="100" r="4.5" fill="url(#metalCapGrad)" stroke="#18181B" strokeWidth="0.5" />
          {/* Machined Metallic Center Nudge Core */}
          <circle cx="100" cy="100" r="2" fill="#27272A" stroke="#71717A" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

export default Meter;