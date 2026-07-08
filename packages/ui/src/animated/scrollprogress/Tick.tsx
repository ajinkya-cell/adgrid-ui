"use client";

import { motion, useTransform, MotionValue } from 'framer-motion';

interface TickProps {
  index: number;
  totalTicks: number;
  smoothProgress: MotionValue<number>;
  variant?: 'default' | 'prominent' | 'inverted';
}

export default function Tick({ index, totalTicks, smoothProgress, variant = 'default' }: TickProps) {
  // Positional progress value for this tick (from 0 at first tick to 1 at last tick)
  const tickPos = totalTicks > 1 ? index / (totalTicks - 1) : 0;

  // Track absolute distance from this tick to current indicator progress
  const distance = useTransform(smoothProgress, (progress) => {
    return Math.abs(progress - tickPos);
  });

  const isProminentTick = variant === 'prominent' && index % 5 === 0;

  // Map ranges based on variant configuration
  let widthRange: number[];
  let opacityRange: number[];
  let bgRange: string[];

  if (variant === 'prominent') {
    if (isProminentTick) {
      // Prominent ticks are wider and very bright/visible, changing scale only slightly
      widthRange = [18, 16, 15];
      opacityRange = [0.95, 0.88, 0.8]; // Highly visible, light white
      bgRange = [
        'rgba(255, 255, 255, 0.95)',
        'rgba(255, 255, 255, 0.88)',
        'rgba(255, 255, 255, 0.8)'
      ];
    } else {
      // Regular ticks in prominent mode stay clearly visible, changing scale only slightly
      widthRange = [12, 11, 10];
      opacityRange = [0.65, 0.55, 0.45]; // Muted but very visible, no visibility animation fadeout
      bgRange = [
        'rgba(255, 255, 255, 0.65)',
        'rgba(255, 255, 255, 0.55)',
        'rgba(255, 255, 255, 0.45)'
      ];
    }
  } else {
    // Default or inverted mode ranges with standard dynamic breathing animations
    widthRange = [14, 12, 10];
    opacityRange = [0.85, 0.4, 0.12];
    bgRange = variant === 'inverted'
      ? [
          'rgba(0, 0, 0, 0.85)',
          'rgba(0, 0, 0, 0.35)',
          'rgba(0, 0, 0, 0.12)'
        ]
      : [
          'rgba(255, 255, 255, 0.85)',
          'rgba(255, 255, 255, 0.35)',
          'rgba(255, 255, 255, 0.12)'
        ];
  }

  const width = useTransform(distance, [0, 0.08, 0.18], widthRange);
  const opacity = useTransform(distance, [0, 0.08, 0.18], opacityRange);
  const background = useTransform(distance, [0, 0.08, 0.18], bgRange);

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
