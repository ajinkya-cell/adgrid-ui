"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "../../../lib/utils";

interface SelectionOverlayProps {
  variant: "glass" | "minimal";
  itemHeight: number;
  visibleItems: number;
  smoothIndex: MotionValue<number>;
  totalItems: number;
  loop: boolean;
  className?: string;
  showIndicator?: boolean;
}

export function SelectionOverlay({
  variant,
  itemHeight,
  visibleItems,
  smoothIndex,
  totalItems,
  loop,
  className,
  showIndicator = true,
}: SelectionOverlayProps) {
  const centerPosition = (visibleItems - 1) / 2;

  const indicatorOffset = useTransform(smoothIndex, (latest) => {
    let rounded = Math.round(latest);
    if (loop) {
      rounded = ((rounded % totalItems) + totalItems) % totalItems;
    }
    return (centerPosition - rounded) * itemHeight;
  });

  if (!showIndicator) return null;

  return (
    <motion.div
      className={cn(
        "absolute left-0 right-0 pointer-events-none rounded-xl z-10 border transition-all duration-300",
        variant === "glass" &&
          "bg-gradient-to-b from-white/10 via-white/5 to-transparent border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.4),inset_0_-1px_1px_rgba(0,0,0,0.2)]",
        variant === "minimal" && "bg-white/5 border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.2)]",
        className
      )}
      style={{
        height: `${itemHeight}px`,
        top: `${centerPosition * itemHeight}px`,
        y: indicatorOffset,
      }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/3 to-transparent" />
    </motion.div>
  );
}