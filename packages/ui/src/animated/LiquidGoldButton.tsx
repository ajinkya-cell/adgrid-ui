"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

/** Liquid-gold button with rotating conic gradient behind a frosted glass blur layer, with a 1px border that catches light only at the top. */
export interface LiquidGoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function LiquidGoldButton({ className, children, ...props }: LiquidGoldButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-48 h-12 rounded font-syncopate text-[9px] uppercase tracking-[0.25em] font-bold cursor-pointer select-none overflow-hidden outline-none transition-all duration-300",
        className
      )}
      style={{
        border: "1px solid transparent",
        borderTopColor: "rgba(255, 224, 102, 0.45)",
        borderBottomColor: "rgba(0, 0, 0, 0.6)",
        borderLeftColor: "rgba(255, 224, 102, 0.08)",
        borderRightColor: "rgba(255, 224, 102, 0.08)",
        boxShadow: isHovered
          ? "inset 0 1px 0 rgba(255,224,102,0.35), 0 8px 20px rgba(243,156,18,0.25)"
          : "inset 0 1px 0 rgba(255,224,102,0.15), 0 4px 10px rgba(0,0,0,0.4)",
      }}
      {...props}
    >
      {/* Rotating Conic-Gradient representing Liquid Gold */}
      <motion.div
        className="absolute -inset-10 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4.8, ease: "linear" }}
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, #ffe066 0%, #f39c12 25%, #d35400 50%, #f39c12 75%, #ffe066 100%)",
          filter: "blur(4px)"
        }}
      />

      {/* Frosted Glass Layer */}
      <div className="absolute inset-0 bg-neutral-950/25 backdrop-blur-[8px] pointer-events-none" />

      {/* Surface reflection shine */}
      <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Button Text */}
      <span className="relative z-10 flex items-center justify-center h-full text-white font-black tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {children || "GOLD"}
      </span>
    </button>
  );
}
