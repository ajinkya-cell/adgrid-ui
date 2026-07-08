"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

export interface VoidButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "ambient" | "neon-edge" | "metallic-sheen" | "glassmorphic" | "cyber-laser" | "classic-gold";
  activeGradientClass?: string;
  activeTextClass?: string;
}

export function VoidButton({
  className,
  children,
  variant = "ambient",
  activeGradientClass,
  activeTextClass,
  ...props
}: VoidButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Pointer position tracker (initialized to standard w-48 h-12 button center)
  const mouseX = useMotionValue(96);
  const mouseY = useMotionValue(24);

  // Smooth springs to eliminate lag
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  useEffect(() => {
    if (containerRef.current) {
      mouseX.set(containerRef.current.offsetWidth / 2);
      mouseY.set(containerRef.current.offsetHeight / 2);
    }
  }, []);

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

  // Radial mask template for lighting reveal sweeps
  const maskTemplate = useMotionTemplate`radial-gradient(circle 75px at ${springX}px ${springY}px, black 25%, transparent 100%)`;

  let baseStyleClass = "bg-[#07070a] border-neutral-900 text-white/70";
  let activeGrad = activeGradientClass || "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800";
  let activeText = activeTextClass || "text-white";
  let defaultShadow = "inset 0 3px 8px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(255,255,255,0.03), 0 2px 4px rgba(0,0,0,0.4)";
  let tappedShadow = "inset 0 8px 24px rgba(0,0,0,0.95), 0 1px 1px rgba(0,0,0,0.8)";
  let fontClass = "font-syncopate text-[9px] uppercase tracking-[0.2em] font-bold";

  if (variant === "classic-gold") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#ffe066] via-[#f39c12] to-[#ffffff]";
    activeText = activeTextClass || "text-black";
    fontClass = "font-cinzel text-xs uppercase tracking-widest font-black";
  } else if (variant === "ambient") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#161619] via-[#2d2d35] to-[#161619]";
    activeText = activeTextClass || "text-white/95";
  } else if (variant === "neon-edge") {
    activeGrad = "bg-transparent";
    activeText = "text-white/95";
  } else if (variant === "metallic-sheen") {
    activeGrad = "bg-transparent";
    activeText = "text-white";
  } else if (variant === "glassmorphic") {
    baseStyleClass = "bg-white/5 border-white/10 backdrop-blur-md text-white/80";
    activeGrad = "bg-white/15";
    activeText = "text-white";
    defaultShadow = "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)";
    tappedShadow = "inset 0 4px 12px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.2)";
  } else if (variant === "cyber-laser") {
    baseStyleClass = "bg-[#060608] border-neutral-900 text-neutral-400";
    activeGrad = "bg-[#0c0c10]";
    activeText = "text-[#ff5500]";
  }

  return (
    <motion.button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      // 3D dynamic click spring animations
      whileTap={{
        scale: 0.95,
        y: 2,
        boxShadow: tappedShadow,
      }}
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
      className={cn(
        "relative w-48 h-12 border cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300 flex items-center justify-center",
        className?.includes("rounded-") ? "" : "rounded-xl",
        fontClass,
        baseStyleClass,
        className
      )}
      style={{
        boxShadow: defaultShadow,
      }}
      {...(props as any)}
    >
      {/* Dynamic Conic Specular Sheen (Anisotropic response) */}
      {variant === "metallic-sheen" && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay rounded-[inherit]"
          style={{
            backgroundImage: "conic-gradient(from 0deg at 50% 50%, #000 0%, #52525b 25%, #000 50%, #52525b 75%, #000 100%)",
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {/* Dynamic Neon Edge Border Overlay */}
      {variant === "neon-edge" && (
        <motion.div
          className="absolute inset-0 border border-white/50 rounded-[inherit] pointer-events-none"
          style={{
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {/* Cyber Sweep Laser Cursor Line */}
      {variant === "cyber-laser" && isHovered && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#ff5500] to-transparent shadow-[0_0_8px_#ff4400]"
        />
      )}

      {/* Active Reveal Background Layer (Radial mask overlay) */}
      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none rounded-[inherit]",
          activeGrad
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          WebkitMaskImage: maskTemplate,
          maskImage: maskTemplate,
        }}
      />

      {/* Centered Single Text Label */}
      <span className={cn(
        "relative z-10 transition-colors duration-300 font-medium",
        isHovered ? activeText : "text-white/70"
      )}>
        {children || "VOID"}
      </span>
    </motion.button>
  );
}
