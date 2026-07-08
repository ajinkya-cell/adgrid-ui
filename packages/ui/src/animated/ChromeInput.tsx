"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

export interface ChromeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const ChromeInput = React.forwardRef<HTMLInputElement, ChromeInputProps>(
  ({ className, type = "text", error, label, children, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Motion values for spotlight tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 90, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 90, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      // Return springs to center
      if (containerRef.current) {
        mouseX.set(containerRef.current.offsetWidth / 2);
        mouseY.set(containerRef.current.offsetHeight / 2);
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    // Anisotropic sweep highlight translation
    const sweepX = useTransform(springX, (x) => {
      if (!containerRef.current) return 0;
      const width = containerRef.current.offsetWidth || 200;
      return ((x / width) * 100) - 50;
    });

    const spotlightBg = useMotionTemplate`radial-gradient(circle 100px at ${springX}px ${springY}px, rgba(255, 255, 255, 0.06), transparent)`;

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative w-full rounded-lg overflow-hidden border transition-all duration-300",
          error
            ? "border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
            : isFocused
            ? "border-white/15 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),0_0_8px_rgba(255,255,255,0.02)]"
            : isHovered
            ? "border-white/10"
            : "border-white/[0.05]"
        )}
        style={{
          backgroundColor: "#050505",
          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.8)",
        }}
      >
        {/* Brushed Micro-lines Texture */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 2px)",
          }}
        />

        {/* Sweep Highlight */}
        <motion.div
          className="absolute inset-y-0 -left-[20%] w-[140%] pointer-events-none opacity-20 mix-blend-overlay"
          animate={{ opacity: isHovered || isFocused ? 0.35 : 0.2 }}
          transition={{ duration: 0.3 }}
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 52%, transparent 60%)",
            x: sweepX,
          }}
        />

        {/* Mouse Spotlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isHovered || isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: spotlightBg }}
        />

        {/* Actual Input */}
        <input
          ref={ref}
          type={type}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "relative z-10 w-full h-11 px-4 bg-transparent text-neutral-100 font-plus-jakarta text-sm outline-none border-none",
            "placeholder:text-neutral-600/70 placeholder:font-jura placeholder:text-[10px] placeholder:uppercase placeholder:tracking-wider placeholder:font-semibold",
            className
          )}
          {...props}
        />

        {/* Metallic Bezel Inner Highlight Overlay */}
        <div className="absolute inset-0 border border-transparent rounded-lg pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]" />
      </div>
    );
  }
);

ChromeInput.displayName = "ChromeInput";
