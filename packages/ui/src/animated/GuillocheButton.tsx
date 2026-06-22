"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

export interface GuillocheButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function GuillocheButton({ className, children, ...props }: GuillocheButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth hardware-accelerated cursor coordinates
  const mouseX = useMotionValue(96);
  const mouseY = useMotionValue(24);

  // Smooth springs to eliminate mouse update stutter
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
    if (containerRef.current) {
      mouseX.set(containerRef.current.offsetWidth / 2);
      mouseY.set(containerRef.current.offsetHeight / 2);
    }
  };

  // Concentric radial coordinate circles centered on cursor (Moire generation)
  const moireTemplate = useMotionTemplate`repeating-radial-gradient(circle at ${springX}px ${springY}px, transparent 0px, transparent 1.5px, #ffffff 1.5px, #ffffff 2.5px)`;

  // Spotlight background template
  const spotlightBg = useMotionTemplate`radial-gradient(circle 120px at ${springX}px ${springY}px, rgba(37, 99, 235, 0.3), transparent 75%)`;

  return (
    <button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-48 h-12 rounded font-mono text-xs uppercase tracking-widest cursor-pointer select-none overflow-hidden outline-none border border-white/10 bg-slate-950 transition-all duration-300",
        className
      )}
      style={{
        boxShadow: isHovered 
          ? "0 8px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
      {...props}
    >
      {/* Luxury Indigo/Slate Blue Watch-Dial Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black pointer-events-none" />

      {/* Shifting Sapphire Blue Spotlight */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: spotlightBg
        }}
      />

      {/* Guilloché concentric micro-patterns layer 1 (Static) */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "repeating-radial-gradient(circle at 50% 50%, transparent 0px, transparent 1.5px, #ffffff 1.5px, #ffffff 2px)"
        }}
      />

      {/* Guilloché layer 2 (Concentric lines centered on cursor generating dynamic Moire Waves on hover) */}
      <motion.div 
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.08 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundImage: moireTemplate
        }}
      />

      {/* Standard Watches Gold Rim Highlight */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffe066]/30 to-transparent opacity-60 pointer-events-none"
      />

      {/* Button Text */}
      <span className="relative z-10 flex items-center justify-center h-full text-slate-300 font-bold tracking-widest">
        {children || "GUILLOCHÉ"}
      </span>
    </button>
  );
}
