"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

export interface ChromeSelectOption {
  value: string;
  label: string;
}

export interface ChromeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: ChromeSelectOption[];
  error?: string;
  label?: string;
}

export const ChromeSelect = React.forwardRef<HTMLSelectElement, ChromeSelectProps>(
  ({ className, options = [], error, label, children, ...props }, ref) => {
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
      if (containerRef.current) {
        mouseX.set(containerRef.current.offsetWidth / 2);
        mouseY.set(containerRef.current.offsetHeight / 2);
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

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
            ? "border-neutral-500 shadow-[0_0_16px_rgba(255,255,255,0.04)]"
            : isHovered
            ? "border-neutral-700/80"
            : "border-neutral-800/80"
        )}
        style={{
          backgroundImage: "linear-gradient(to bottom, #0a0a0d, #121215)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.5)",
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

        {/* Dropdown Container Wrapper */}
        <div className="relative z-10 flex items-center justify-between w-full h-11 px-4">
          <select
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full bg-transparent text-neutral-100 font-sans text-sm outline-none border-none appearance-none cursor-pointer pr-8",
              className
            )}
            {...props}
          >
            <option value="" className="bg-neutral-900 text-neutral-400">
              Select an option...
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-neutral-900 text-neutral-100"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Chevron indicator */}
          <div className="absolute right-4 pointer-events-none text-neutral-500">
            <svg
              className="w-4 h-4 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                transform: isFocused ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Metallic Bezel Inner Highlight Overlay */}
        <div className="absolute inset-0 border border-transparent rounded-lg pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]" />
      </div>
    );
  }
);

ChromeSelect.displayName = "ChromeSelect";
