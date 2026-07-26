"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../lib/utils";

export type BreathingScaleCardPreset =
  | "indigo"
  | "cyberpunk"
  | "emerald"
  | "amber"
  | "custom";

export type BreathingScalePatternVariant =
  | "diagonal"
  | "stripes"
  | "dots"
  | "grid";

export interface BreathingScaleCardProps
  extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  preset?: BreathingScaleCardPreset;
  patternVariant?: BreathingScalePatternVariant;
  patternColor?: string;
  duration?: number; // Speed of the loop in seconds (default: 7)
  glowColor?: string; // Custom glow color Tailwind class overlay
  patternSize?: number; // Size of repeating pattern in px (default: 10)
  angle?: number; // Angle of repeating linear gradient in deg (default: 315)
  overshoot?: boolean | number; // Overshoot line extension in px beyond corner intersections (default: 44)
  lineColor?: string; // Custom gradient/color override for border lines
  vignette?: boolean; // Enable soft edge & corner vignette mask (default: true)
  hoverEffect?: boolean; // Interactive subtle scale & glow boost on hover (default: true)
}

const PRESET_CONFIGS: Record<
  Exclude<BreathingScaleCardPreset, "custom">,
  { glowColor: string; lineColor: string; patternColor: string }
> = {
  indigo: {
    glowColor: "from-transparent via-indigo-500/25 to-transparent",
    lineColor: "bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent",
    patternColor: "rgba(99, 102, 241, 0.25)",
  },
  cyberpunk: {
    glowColor: "from-transparent via-fuchsia-500/30 to-transparent",
    lineColor: "bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent",
    patternColor: "rgba(236, 72, 153, 0.3)",
  },
  emerald: {
    glowColor: "from-transparent via-emerald-500/25 to-transparent",
    lineColor: "bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent",
    patternColor: "rgba(16, 185, 129, 0.25)",
  },
  amber: {
    glowColor: "from-transparent via-amber-500/25 to-transparent",
    lineColor: "bg-gradient-to-r from-transparent via-amber-400/40 to-transparent",
    patternColor: "rgba(245, 158, 11, 0.25)",
  },
};

function getPatternStyle(
  variant: BreathingScalePatternVariant,
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

export const BreathingScaleCard = ({
  children,
  className,
  preset = "indigo",
  patternVariant = "diagonal",
  patternColor: customPatternColor,
  duration = 7,
  glowColor: customGlowColor,
  patternSize = 10,
  angle = 315,
  overshoot = 44,
  lineColor: customLineColor,
  vignette = true,
  hoverEffect = true,
  ...props
}: BreathingScaleCardProps) => {
  const presetDefaults =
    preset !== "custom" ? PRESET_CONFIGS[preset] : undefined;

  const patternColor =
    customPatternColor ?? presetDefaults?.patternColor ?? "rgba(255, 255, 255, 0.25)";
  const glowColor =
    customGlowColor ?? presetDefaults?.glowColor ?? "from-transparent via-indigo-500/20 to-transparent";
  const lineColor =
    customLineColor ?? presetDefaults?.lineColor ?? "bg-gradient-to-r from-transparent via-white/40 to-transparent";

  const ext = typeof overshoot === "number" ? `${overshoot}px` : "44px";

  const basePatternStyle = getPatternStyle(patternVariant, patternColor, patternSize, angle, 1.25);
  const sweepPatternStyle = getPatternStyle(patternVariant, patternColor, patternSize, angle, 1.25);

  return (
    <motion.div
      className={cn("relative p-12 text-white", className)}
      whileHover={hoverEffect ? { scale: 1.015, transition: { duration: 0.3 } } : undefined}
      {...props}
    >
      {/* 4 Overshooting Corner Border Lines with Tapered Vignette Ends */}
      {overshoot && (
        <>
          {/* Top Horizontal Line */}
          <div
            className={cn(
              "absolute top-0 h-[1px] pointer-events-none z-20",
              lineColor
            )}
            style={{ left: `-${ext}`, right: `-${ext}` }}
          />
          {/* Bottom Horizontal Line */}
          <div
            className={cn(
              "absolute bottom-0 h-[1px] pointer-events-none z-20",
              lineColor
            )}
            style={{ left: `-${ext}`, right: `-${ext}` }}
          />
          {/* Left Vertical Line */}
          <div
            className={cn(
              "absolute left-0 w-[1px] pointer-events-none z-20",
              lineColor.includes("bg-gradient-to-r")
                ? lineColor.replace("bg-gradient-to-r", "bg-gradient-to-b")
                : lineColor
            )}
            style={{ top: `-${ext}`, bottom: `-${ext}` }}
          />
          {/* Right Vertical Line */}
          <div
            className={cn(
              "absolute right-0 w-[1px] pointer-events-none z-20",
              lineColor.includes("bg-gradient-to-r")
                ? lineColor.replace("bg-gradient-to-r", "bg-gradient-to-b")
                : lineColor
            )}
            style={{ top: `-${ext}`, bottom: `-${ext}` }}
          />
        </>
      )}

      {/* Inner Masked Animation Container */}
      <div className="absolute inset-0 overflow-hidden bg-neutral-950/90 shadow-2xl rounded-xl">
        {/* Soft Vignette Mask Layer */}
        <div
          className="absolute inset-0"
          style={
            vignette
              ? {
                  WebkitMaskImage:
                    "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
                  maskImage:
                    "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
                }
              : undefined
          }
        >
          {/* 1. Base Low-Opacity Scale Layer */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={basePatternStyle}
          />

          {/* 2. Framer Motion Ambient Sweeping Opacity Mask Layer */}
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

          {/* 3. Framer Motion Breathing Ambient Backlight */}
          <motion.div
            className={cn(
              "pointer-events-none absolute -inset-x-20 top-1/2 -translate-y-1/2 h-[300px] bg-gradient-to-r blur-3xl",
              glowColor
            )}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scaleY: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: duration * 0.8,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>

        {/* Soft Inner Shadow / Vignette Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,10,0.85)_100%)] z-10" />
      </div>

      {/* 4. Card Content Container */}
      <div className="relative z-20 flex items-center justify-center w-full h-full py-8 px-4">
        {children ?? (
          <h3 className="font-['Inter',sans-serif] text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-white/85 to-white/35 bg-clip-text text-transparent">
            Breathing Card
          </h3>
        )}
      </div>
    </motion.div>
  );
};
