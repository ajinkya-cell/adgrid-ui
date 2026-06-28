"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

/** Brushed titanium machined-metal button with anisotropic highlight sweeps and reactive spotlight illumination. */
export interface BrushedTitaniumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function BrushedTitaniumButton({ className, children, ...props }: BrushedTitaniumButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth hardware-accelerated cursor position
  const mouseX = useMotionValue(96);
  const mouseY = useMotionValue(24);

  // Smooth springs to eliminate input stutter
  const springX = useSpring(mouseX, { stiffness: 90, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Return springs to center for a natural resting shadow reflection
    if (containerRef.current) {
      mouseX.set(containerRef.current.offsetWidth / 2);
      mouseY.set(containerRef.current.offsetHeight / 2);
    }
  };

  // Translate the sweep highlight layer using GPU transform (silky smooth)
  const sweepX = useTransform(springX, (x) => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.offsetWidth || 192;
    // Map mouse position to highlight shift offset
    return ((x / width) * 120) - 60;
  });

  // Dynamic spotlight background template
  const spotlightBg = useMotionTemplate`radial-gradient(circle 80px at ${springX}px ${springY}px, rgba(255, 255, 255, 0.08), transparent)`;

  return (
    <button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-48 h-12 rounded font-syncopate text-[9px] uppercase tracking-[0.25em] font-bold cursor-pointer select-none overflow-hidden outline-none border border-neutral-700/60 bg-neutral-900 transition-shadow duration-300",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(to bottom, #2c2c2e, #1c1c1e)",
        boxShadow: isHovered 
          ? "0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)"
          : "0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
      {...props}
    >
      {/* Brushed Micro-lines Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)"
        }}
      />

      {/* Anisotropic sweep highlight (GPU-accelerated horizontal translation) */}
      <motion.div 
        className="absolute inset-y-0 -left-[25%] w-[150%] pointer-events-none opacity-40 mix-blend-overlay"
        animate={{ opacity: isHovered ? 0.75 : 0.4 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.15) 48%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 52%, transparent 65%)`,
          x: sweepX
        }}
      />

      {/* Spot Flashlight Highlight */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: spotlightBg
        }}
      />

      {/* Button Text */}
      <span className="relative z-10 flex items-center justify-center h-full text-neutral-300 font-bold tracking-widest text-shadow-sm">
        {children || "TITANIUM"}
      </span>
    </button>
  );
}
