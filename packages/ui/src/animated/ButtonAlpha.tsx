"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface ButtonAlphaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shape?: "pill" | "full" | "square";
  theme?: "charcoal" | "danger" | "tactical";
  children?: React.ReactNode;
}

export function ButtonAlpha({
  className,
  shape = "pill",
  theme = "charcoal",
  children,
  onClick,
  ...props
}: ButtonAlphaProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Inject Geist Pixel Google Font on mount (only once)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const fontId = "google-font-geistpixel";
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Geist+Pixel&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  // Play crisp tactile mechanical click sound on press
  const playClickSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.005);

      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.006);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.007);
    } catch (e) {}
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  // High-stiffness spring physics matching VoidButton physical depth feedback
  const springTransition = {
    type: "spring",
    stiffness: 450,
    damping: 18,
  };

  // Border radius map matching SimpleCard finish
  const roundedClasses = {
    pill: "rounded-xl",
    full: "rounded-full",
    square: "rounded-none",
  };

  const roundedClass = roundedClasses[shape];

  // Theme-specific parameters inspired by SimpleCard precision & VoidButton depth
  const themeStyles = {
    charcoal: {
      bgColor: "#151515",
      textColor: "text-neutral-300 group-hover:text-white active:text-white/80",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      topHighlightGradient:
        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.2) 75%, transparent 100%)",
      shadowNormal:
        "0 2px 0 0 rgba(255, 255, 255, 0.08) inset, 0 -1px 0 0 rgba(0, 0, 0, 0.5) inset, 0 20px 40px -8px rgba(0, 0, 0, 0.65), 0 4px 16px -2px rgba(0, 0, 0, 0.4)",
      shadowHover:
        "0 2px 0 0 rgba(255, 255, 255, 0.15) inset, 0 -1px 0 0 rgba(0, 0, 0, 0.4) inset, 0 28px 56px -10px rgba(0, 0, 0, 0.8), 0 6px 20px -2px rgba(0, 0, 0, 0.5)",
      shadowTap:
        "inset 0 8px 20px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.02), 0 2px 4px rgba(0, 0, 0, 0.6)",
    },
    danger: {
      bgColor: "#1e1010",
      textColor: "text-red-400 group-hover:text-red-300 active:text-red-200",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      topHighlightGradient:
        "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.25) 25%, rgba(255,255,255,0.4) 50%, rgba(239,68,68,0.25) 75%, transparent 100%)",
      shadowNormal:
        "0 2px 0 0 rgba(239, 68, 68, 0.2) inset, 0 -1px 0 0 rgba(0, 0, 0, 0.6) inset, 0 20px 40px -8px rgba(0, 0, 0, 0.65), 0 4px 16px -2px rgba(239, 68, 68, 0.15)",
      shadowHover:
        "0 2px 0 0 rgba(239, 68, 68, 0.32) inset, 0 -1px 0 0 rgba(0, 0, 0, 0.5) inset, 0 28px 56px -10px rgba(0, 0, 0, 0.8), 0 6px 20px -2px rgba(239, 68, 68, 0.25)",
      shadowTap:
        "inset 0 8px 20px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(239, 68, 68, 0.05), 0 2px 4px rgba(0, 0, 0, 0.6)",
    },
    tactical: {
      bgColor: "#0f1a12",
      textColor: "text-emerald-400 group-hover:text-emerald-300 active:text-emerald-200",
      border: "1px solid rgba(34, 197, 94, 0.2)",
      topHighlightGradient:
        "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.25) 25%, rgba(255,255,255,0.4) 50%, rgba(34,197,94,0.25) 75%, transparent 100%)",
      shadowNormal:
        "0 2px 0 0 rgba(34, 197, 94, 0.2) inset, 0 -1px 0 0 rgba(0, 0, 0, 0.6) inset, 0 20px 40px -8px rgba(0, 0, 0, 0.65), 0 4px 16px -2px rgba(34, 197, 94, 0.15)",
      shadowHover:
        "0 2px 0 0 rgba(34, 197, 94, 0.32) inset, 0 -1px 0 0 rgba(0, 0, 0, 0.5) inset, 0 28px 56px -10px rgba(0, 0, 0, 0.8), 0 6px 20px -2px rgba(34, 197, 94, 0.25)",
      shadowTap:
        "inset 0 8px 20px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(34, 197, 94, 0.05), 0 2px 4px rgba(0, 0, 0, 0.6)",
    },
  };

  const styleConfig = themeStyles[theme];

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileTap={{
        scale: 0.95,
        y: 3,
        boxShadow: styleConfig.shadowTap,
      }}
      transition={springTransition}
      className={cn(
        "group relative w-48 h-12 font-medium cursor-pointer select-none overflow-hidden outline-none transition-colors duration-200 flex items-center justify-center",
        roundedClass,
        className
      )}
      style={{
        backgroundColor: styleConfig.bgColor,
        border: styleConfig.border,
        boxShadow: isHovered ? styleConfig.shadowHover : styleConfig.shadowNormal,
      }}
      {...(props as any)}
    >
      {/* Prismatic top-border highlight (SimpleCard style) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20"
        style={{
          background: styleConfig.topHighlightGradient,
        }}
      />

      {/* Embedded Typographic Label */}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center tracking-[0.12em] text-[13px] uppercase pointer-events-none select-none transition-colors duration-200",
          styleConfig.textColor
        )}
        style={{
          fontFamily: '"Geist Pixel", monospace',
        }}
      >
        {children || "ACTIVATE"}
      </span>
    </motion.button>
  );
}
