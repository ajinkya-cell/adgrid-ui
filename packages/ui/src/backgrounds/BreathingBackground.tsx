"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export type BreathingBackgroundPreset =
  | "indigo"
  | "cyberpunk"
  | "emerald"
  | "amber"
  | "custom";

export type BreathingBackgroundPatternVariant =
  | "diagonal"
  | "stripes"
  | "dots"
  | "grid";

export interface BreathingBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  preset?: BreathingBackgroundPreset;
  patternVariant?: BreathingBackgroundPatternVariant;
  patternColor?: string;
  duration?: number; // Speed of the loop in seconds (default: 8)
  glowColor?: string; // Custom glow color Tailwind gradient class
  patternSize?: number; // Size of repeating pattern in px (default: 16)
  angle?: number; // Angle of gradient in deg (default: 315)
  vignette?: boolean; // Enable edge & corner vignette mask (default: true)
}

const PRESET_CONFIGS: Record<
  Exclude<BreathingBackgroundPreset, "custom">,
  { glowColor: string; patternColor: string }
> = {
  indigo: {
    glowColor: "from-transparent via-indigo-500/20 to-transparent",
    patternColor: "rgba(99, 102, 241, 0.2)",
  },
  cyberpunk: {
    glowColor: "from-transparent via-fuchsia-500/25 to-transparent",
    patternColor: "rgba(236, 72, 153, 0.25)",
  },
  emerald: {
    glowColor: "from-transparent via-emerald-500/20 to-transparent",
    patternColor: "rgba(16, 185, 129, 0.2)",
  },
  amber: {
    glowColor: "from-transparent via-amber-500/20 to-transparent",
    patternColor: "rgba(245, 158, 11, 0.2)",
  },
};

function getPatternStyle(
  variant: BreathingBackgroundPatternVariant,
  color: string,
  size: number,
  angle: number,
  strokeWidth = 1.25
): React.CSSProperties {
  switch (variant) {
    case "stripes": {
      const stripeStep = Math.max(3, Math.round(size * 0.5));
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0px, ${color} ${strokeWidth}px, transparent ${strokeWidth}px, transparent ${stripeStep}px)`,
      };
    }
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle at ${strokeWidth}px ${strokeWidth}px, ${color} ${strokeWidth}px, transparent ${strokeWidth + 0.8}px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(to right, ${color} ${strokeWidth}px, transparent ${strokeWidth}px), linear-gradient(to bottom, ${color} ${strokeWidth}px, transparent ${strokeWidth}px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    case "diagonal":
    default:
      return {
        backgroundImage: `repeating-linear-gradient(${angle}deg, ${color} 0px, ${color} ${strokeWidth}px, transparent ${strokeWidth}px, transparent ${size}px)`,
      };
  }
}

export const BreathingBackground = ({
  children,
  className,
  preset = "indigo",
  patternVariant = "diagonal",
  patternColor: customPatternColor,
  duration = 8,
  glowColor: customGlowColor,
  patternSize = 16,
  angle = 315,
  vignette = true,
  ...props
}: BreathingBackgroundProps) => {
  const presetDefaults =
    preset !== "custom" ? PRESET_CONFIGS[preset] : undefined;

  const patternColor =
    customPatternColor ?? presetDefaults?.patternColor ?? "rgba(255, 255, 255, 0.2)";
  const glowColor =
    customGlowColor ?? presetDefaults?.glowColor ?? "from-transparent via-indigo-500/20 to-transparent";

  const basePatternStyle = getPatternStyle(patternVariant, patternColor, patternSize, angle, 1.25);
  const sweepPatternStyle = getPatternStyle(patternVariant, patternColor, patternSize, angle, 1.25);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-screen overflow-hidden bg-neutral-950 text-white",
        className
      )}
      {...props}
    >
      {/* 1. Vignette & Mask Layer Container */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={
          vignette
            ? {
                WebkitMaskImage:
                  "radial-gradient(ellipse 90% 85% at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
                maskImage:
                  "radial-gradient(ellipse 90% 85% at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
              }
            : undefined
        }
      >
        {/* Baseline Static Pattern Layer */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={basePatternStyle}
        />

        {/* Framer Motion Ambient Sweeping Opacity Mask Layer */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            ...sweepPatternStyle,
            WebkitMaskImage:
              "linear-gradient(115deg, transparent 20%, rgba(0,0,0,1) 50%, transparent 80%)",
            WebkitMaskSize: "200% 200%",
            maskImage:
              "linear-gradient(115deg, transparent 20%, rgba(0,0,0,1) 50%, transparent 80%)",
            maskSize: "200% 200%",
          }}
          animate={
            {
              WebkitMaskPosition: ["200% 0%", "-200% 0%"],
              maskPosition: ["200% 0%", "-200% 0%"],
            } as any
          }
          transition={{
            duration: duration,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* Framer Motion Breathing Ambient Backlight */}
        <motion.div
          className={cn(
            "pointer-events-none absolute -inset-x-40 top-1/2 -translate-y-1/2 h-[500px] bg-gradient-to-r blur-3xl opacity-50",
            glowColor
          )}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scaleY: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: duration * 0.8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>

      {/* 2. Soft Edge Radial Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,5,0.9)_100%)] z-0" />

      {/* 3. Children Content Container */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
};
