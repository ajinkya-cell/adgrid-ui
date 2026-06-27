"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

/** Pure black button that reveals a luxury gold gradient under the cursor via a smooth radial mask. */
export interface VoidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  activeGradientClass?: string;
  activeTextClass?: string;
}

export function VoidButton({
  className,
  children,
  activeGradientClass = "bg-gradient-to-r from-[#ffe066] via-[#f39c12] to-[#ffffff]",
  activeTextClass = "text-black",
  ...props
}: VoidButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for hardware-accelerated cursor coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to eliminate mouse update stutter
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Generate dynamic CSS radial gradient mask template
  const maskTemplate = useMotionTemplate`radial-gradient(circle 65px at ${springX}px ${springY}px, black 25%, transparent 100%)`;

  return (
    <button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-48 h-12 rounded border border-neutral-900 bg-black font-mono text-xs uppercase tracking-widest cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300",
        className
      )}
      style={{
        boxShadow: "inset 0 3px 8px rgba(0,0,0,0.95), inset 0 -1px 2px rgba(255,255,255,0.04), 0 1px 1px rgba(0,0,0,0.5)",
      }}
      {...props}
    >
      {/* Base Layer: White text on black */}
      <span className="absolute inset-0 flex items-center justify-center text-white/90 font-bold transition-opacity duration-300">
        {children || "THE VOID"}
      </span>

      {/* Active Reveal Layer: Dark text on customizable gradient */}
      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none flex items-center justify-center",
          activeGradientClass
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          WebkitMaskImage: maskTemplate,
          maskImage: maskTemplate,
        }}
      >
        <span className={cn("font-black", activeTextClass)}>
          {children || "THE VOID"}
        </span>
      </motion.div>
    </button>
  );
}
