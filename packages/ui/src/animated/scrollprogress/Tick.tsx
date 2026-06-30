"use client";

import { motion, useTransform, MotionValue } from 'framer-motion';

interface TickProps {
  index: number;
  totalTicks: number;
  smoothProgress: MotionValue<number>;
  color?: string;
  isProminent?: boolean;
  isInverted?: boolean;
  scrollbarVariant?: "default" | "inverted" | "prominent";
}

export default function Tick({
  index,
  totalTicks,
  smoothProgress,
  color = "#a855f7",
  isProminent = false,
  isInverted = false,
  scrollbarVariant = "default",
}: TickProps) {
  const tickPosition = index / Math.max(1, totalTicks - 1);

  // Dynamically compute opacity based on proximity to the active scroll position
  const opacity = useTransform(smoothProgress, (progress) => {
    const distance = Math.abs(progress - tickPosition);
    const maxDistance = 0.08; // Distance range where the tick gets illuminated
    
    const isProminentScrollbar = scrollbarVariant === "prominent";
    
    // Regular ticks in a prominent scrollbar remain idle
    if (isProminentScrollbar && !isProminent) {
      return 0.12;
    }
    
    const baseOpacity = isProminent ? 0.45 : 0.25;
    const maxOpacity = 1.0;
    if (distance > maxDistance) return baseOpacity;
    const factor = 1 - distance / maxDistance;
    return baseOpacity + factor * (maxOpacity - baseOpacity);
  });

  // Scale the tick width slightly as the indicator passes it
  const scaleX = useTransform(smoothProgress, (progress) => {
    const distance = Math.abs(progress - tickPosition);
    const maxDistance = 0.06;
    
    const isProminentScrollbar = scrollbarVariant === "prominent";
    
    // Regular ticks in a prominent scrollbar do not scale
    if (isProminentScrollbar && !isProminent) {
      return 1;
    }
    
    if (distance > maxDistance) return 1;
    const factor = 1 - distance / maxDistance;
    
    const maxScale = isProminent ? 1.6 : 1.5;
    return 1 + factor * (maxScale - 1);
  });

  // Animate the tick background color toward the active theme color on hover/proximity
  const bg = useTransform(smoothProgress, (progress) => {
    const distance = Math.abs(progress - tickPosition);
    const maxDistance = 0.05;
    const idleColor = isInverted ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.35)";
    const prominentColor = isInverted ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.55)";
    const baseColor = isProminent ? prominentColor : idleColor;
    
    const isProminentScrollbar = scrollbarVariant === "prominent";
    if (isProminentScrollbar && !isProminent) {
      return baseColor;
    }
    
    if (distance > maxDistance) return baseColor;
    const factor = 1 - distance / maxDistance;
    
    // We parse hex colors to rgba for dynamic blending
    const baseAlpha = isProminent ? 0.55 : 0.35;
    return hexToRgba(color, baseAlpha + factor * (1.0 - baseAlpha));
  });

  const baseWidth = isProminent ? "w-[16px]" : "w-[10px]";

  return (
    <motion.div
      style={{
        opacity,
        scaleX,
        backgroundColor: bg,
      }}
      className={`${baseWidth} h-[1px] rounded-full origin-center`}
    />
  );
}

// Simple helper to convert hex to rgba to support custom theme colors dynamically
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 3 && cleanHex.length !== 6) {
    return `rgba(168, 85, 247, ${alpha})`; // fallback to default purple
  }
  const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
