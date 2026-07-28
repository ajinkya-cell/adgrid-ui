"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export interface TooltipProps {
  /** Tooltip popover content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactNode;
  /** Side position relative to trigger */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment relative to side */
  align?: "start" | "center" | "end";
  /** Delay before showing tooltip in ms */
  delay?: number;
  /** Additional custom class names for tooltip container */
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 150,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate normalized offset from center (-15px to 15px) for 3D parallax tracking
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);

    setMousePos({
      x: Math.max(-12, Math.min(12, offsetX * 12)),
      y: Math.max(-12, Math.min(12, offsetY * 12)),
    });
  };

  // Position & Alignment offset classes
  const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";
  const sidePositions = {
    top: `bottom-full mb-3 ${alignClass}`,
    bottom: `top-full mt-3 ${alignClass}`,
    left: "right-full mr-3 top-1/2 -translate-y-1/2",
    right: "left-full ml-3 top-1/2 -translate-y-1/2",
  }[side];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="relative inline-flex items-center justify-center font-['DM_Sans',sans-serif]"
    >
      {/* DM Sans font loader */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      {/* Trigger Target Element */}
      {children}

      {/* Magnetic Hologram Chat Tooltip Popover */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: side === "top" ? 6 : side === "bottom" ? -6 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              x: mousePos.x,
              y: mousePos.y,
              rotateX: -mousePos.y * 0.8,
              rotateY: mousePos.x * 0.8,
              backgroundColor: "rgba(20, 20, 22, 0.92)",
              boxShadow:
                "inset 0 1px 0 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 0 rgba(0, 0, 0, 0.6), 0 0 20px 0 rgba(255, 255, 255, 0.10), 0 10px 30px rgba(0, 0, 0, 0.8)",
            }}
            className={cn(
              "absolute z-50 px-3.5 py-2 rounded-xl border border-white/20 backdrop-blur-xl pointer-events-none select-none text-xs font-semibold text-white whitespace-nowrap font-['DM_Sans',sans-serif] flex items-center gap-2",
              sidePositions,
              className
            )}
          >
            {/* Soft monochrome glowing sheen overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />

            {/* Glowing monochrome white LED dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] shrink-0 animate-pulse" />

            {/* Content text / node */}
            <span className="relative z-10 text-neutral-100 font-medium tracking-wide">{content}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
