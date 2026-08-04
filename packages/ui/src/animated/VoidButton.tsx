"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

export interface VoidButtonProps extends Omit<React.ComponentPropsWithoutRef<"button">, "style"> {
  variant?: "ambient" | "neon-edge" | "metallic-sheen" | "glassmorphic";
  style?: "default" | "pill" | React.CSSProperties;
  activeGradientClass?: string;
  activeTextClass?: string;
}

export function VoidButton({
  className,
  children,
  variant = "ambient",
  style = "default",
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
    if (props.onClick) props.onClick(e);
  };

  // Radial mask template for lighting reveal sweeps
  const maskTemplate = useMotionTemplate`radial-gradient(circle 85px at ${springX}px ${springY}px, black 30%, transparent 100%)`;

  let baseStyleClass = "bg-[#07070a] border-neutral-800 text-white/70";
  let activeGrad = activeGradientClass || "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800";
  let activeText = activeTextClass || "text-white";
  let fontClass = "font-syncopate text-[9px] uppercase tracking-[0.2em] font-bold";

  let shadowNormal = "inset 0 2px 6px rgba(255,255,255,0.06), inset 0 -2px 6px rgba(0,0,0,0.8), 0 12px 24px -4px rgba(0,0,0,0.6)";
  let shadowHover = "inset 0 2px 8px rgba(255,255,255,0.12), inset 0 -2px 6px rgba(0,0,0,0.7), 0 18px 36px -4px rgba(0,0,0,0.75)";
  let shadowTap = "inset 0 6px 16px rgba(0,0,0,0.95), inset 0 1px 2px rgba(255,255,255,0.02), 0 2px 6px rgba(0,0,0,0.5)";

  if (variant === "ambient") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#161619] via-[#2d2d35] to-[#161619]";
    activeText = activeTextClass || "text-white/95";
    shadowNormal = "inset 0 2px 6px rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.85), 0 12px 24px rgba(0,0,0,0.6)";
    shadowHover = "inset 0 2px 10px rgba(255,255,255,0.16), inset 0 -2px 6px rgba(0,0,0,0.75), 0 18px 36px rgba(0,0,0,0.75)";
    shadowTap = "inset 0 6px 18px rgba(0,0,0,0.95), inset 0 1px 1px rgba(255,255,255,0.03), 0 2px 6px rgba(0,0,0,0.5)";
  } else if (variant === "neon-edge") {
    baseStyleClass = "bg-[#07070a] border border-white/15 text-white/70";
    activeGrad = "bg-gradient-to-r from-neutral-900/60 via-neutral-800/60 to-neutral-900/60";
    activeText = "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]";
    shadowNormal = "0 0 8px rgba(255,255,255,0.06), inset 0 1.5px 3px rgba(255,255,255,0.04), inset 0 -2px 6px rgba(0,0,0,0.8)";
    shadowHover = "0 0 14px rgba(255,255,255,0.15), inset 0 2px 5px rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.7)";
    shadowTap = "0 0 6px rgba(255,255,255,0.1), inset 0 6px 16px rgba(0,0,0,0.95)";
  } else if (variant === "metallic-sheen") {
    baseStyleClass = "bg-gradient-to-b from-[#28282b] to-[#121214] border border-white/15 text-neutral-200";
    activeGrad = "bg-gradient-to-r from-white/10 via-white/25 to-white/10";
    activeText = "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]";
    shadowNormal = "inset 0 1.5px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.7), 0 10px 24px rgba(0,0,0,0.5)";
    shadowHover = "inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.65)";
    shadowTap = "inset 0 5px 16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.6)";
  } else if (variant === "glassmorphic") {
    baseStyleClass = "bg-white/5 border border-white/10 backdrop-blur-md text-white/80";
    activeGrad = "bg-white/15";
    activeText = "text-white";
    shadowNormal = "inset 0 1.5px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.3)";
    shadowHover = "inset 0 2px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2), 0 12px 40px rgba(0,0,0,0.4)";
    shadowTap = "inset 0 4px 14px rgba(0,0,0,0.75), inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)";
  }

  // Resolve shape/style class (default: rounded-xl, pill: rounded-full)
  const stylePresetMap: Record<string, string> = {
    default: "rounded-xl",
    pill: "rounded-full",
  };

  const roundedClass = typeof style === "string" ? (stylePresetMap[style] || "rounded-xl") : "rounded-xl";
  const customInlineStyle = typeof style === "object" ? style : undefined;

  return (
    <motion.button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      // 3D dynamic click spring animations (responsive clicky microswitch feel)
      whileTap={{
        scale: 0.95,
        y: 2,
        boxShadow: shadowTap,
      }}
      animate={{
        boxShadow: isHovered ? shadowHover : shadowNormal,
      }}
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
      className={cn(
        "relative w-48 h-12 border cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300 flex items-center justify-center",
        roundedClass,
        fontClass,
        baseStyleClass,
        className
      )}
      style={{
        ...customInlineStyle,
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

      {/* Subtle Monochrome Neon Edge Ring Overlay */}
      {variant === "neon-edge" && (
        <motion.div
          className="absolute inset-0 border border-white/80 rounded-[inherit] pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.5),inset_0_0_6px_rgba(255,255,255,0.25)] z-10"
          style={{
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
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
        "relative z-10 transition-colors duration-300 font-medium inline-flex items-center justify-center gap-2",
        isHovered ? activeText : "text-white/70"
      )}>
        {children || "VOID"}
      </span>
    </motion.button>
  );
}
