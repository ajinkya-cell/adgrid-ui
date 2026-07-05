"use client";

import { motion, useTransform, MotionValue } from 'framer-motion';

interface TickProps {
  index: number;
  totalTicks: number;
  smoothProgress: MotionValue<number>;
}

export default function Tick({ index, totalTicks, smoothProgress }: TickProps) {
  // Positional progress value for this tick (from 0 at first tick to 1 at last tick)
  const tickPos = totalTicks > 1 ? index / (totalTicks - 1) : 0;

  // Track absolute distance from this tick to current indicator progress (runs on GPU)
  const distance = useTransform(smoothProgress, (progress) => {
    return Math.abs(progress - tickPos);
  });

  // Map distance to width, opacity, and background color:
  // - Close ticks (<0.08 distance): wider (14px), brighter, highly opaque.
  // - Sibling ticks (<0.18 distance): intermediate size/opacity.
  // - Distant ticks (>0.18 distance): default size (10px), lower opacity (0.12).
  const width = useTransform(distance, [0, 0.08, 0.18], [14, 12, 10]);
  const opacity = useTransform(distance, [0, 0.08, 0.18], [0.85, 0.4, 0.12]);
  const background = useTransform(
    distance,
    [0, 0.08, 0.18],
    [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 255, 255, 0.35)',
      'rgba(255, 255, 255, 0.12)'
    ]
  );

  return (
    <motion.div
      style={{
        width,
        opacity,
        background,
      }}
      className="h-[1.5px] rounded-full shrink-0 origin-center"
    />
  );
}
