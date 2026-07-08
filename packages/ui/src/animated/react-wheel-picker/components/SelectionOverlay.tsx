"use client";

import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

interface SelectionOverlayProps {
  variant: "glass" | "minimal";
  itemHeight: number;
  visibleItems: number;
  className?: string;
  showIndicator?: boolean;
}

export function SelectionOverlay({
  variant,
  itemHeight,
  visibleItems,
  className,
  showIndicator = true,
}: SelectionOverlayProps) {
  const centerPosition = (visibleItems - 1) / 2;

  if (!showIndicator) return null;

  return (
    <motion.div
      className={cn(
        "absolute left-2 right-2 pointer-events-none z-10 border transition-all duration-300",
        variant === "glass" &&
          "rounded-xl bg-gradient-to-b from-white/10 via-white/5 to-transparent border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.4),inset_0_-1px_1px_rgba(0,0,0,0.2)]",
        variant === "minimal" &&
          "rounded-lg bg-[#050505] border border-white/[0.04] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)]",
        className
      )}
      style={{
        height: `${itemHeight}px`,
        top: `${centerPosition * itemHeight}px`,
      }}
    >
      {variant !== "minimal" && (
        <>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/3 to-transparent" />
        </>
      )}
    </motion.div>
  );
}