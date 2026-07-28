"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface SwitchProps {
  /** Controlled checked state */
  checked?: boolean;
  /** Initial checked state if uncontrolled */
  defaultChecked?: boolean;
  /** Callback fired when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Optional label text */
  label?: string;
  /** Optional description subtext */
  description?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional custom class names */
  className?: string;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = "md",
  className,
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const handleToggle = () => {
    if (disabled) return;
    const nextChecked = !checked;
    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }
    onCheckedChange?.(nextChecked);
  };

  // Dimensions based on size
  const dimensions = {
    sm: { track: "w-12 h-6 p-0.5", thumb: "w-5 h-5", translate: 24, led: "w-1.5 h-1.5" },
    md: { track: "w-16 h-8 p-1", thumb: "w-6 h-6", translate: 32, led: "w-2 h-2" },
    lg: { track: "w-20 h-10 p-1", thumb: "w-8 h-8", translate: 40, led: "w-2.5 h-2.5" },
  }[size];

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-3 select-none font-['DM_Sans',sans-serif]",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer group",
        className
      )}
    >
      {/* Google DM Sans font loader */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      {/* 3D Mechanical Rocker Switch Track (Debossed Recessed Socket) */}
      <div
        style={{
          backgroundColor: "#050505",
          boxShadow:
            "inset 0 3px 6px rgba(0, 0, 0, 0.95), inset 0 1px 2px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
        className={cn(
          "relative rounded-full border border-white/[0.08] transition-all duration-300 flex items-center shrink-0",
          dimensions.track
        )}
      >
        {/* Track inner glow when checked */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none",
            checked ? "bg-emerald-500/10 opacity-100" : "opacity-0"
          )}
        />

        {/* 3D Tactile Rocker Switch Thumb (Raised Beveled Pill) */}
        <motion.div
          style={{
            backgroundColor: "#171717",
            boxShadow: checked
              ? "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.25), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.6), -2px 0 10px rgba(16, 185, 129, 0.3), 0 4px 10px rgba(0, 0, 0, 0.8)"
              : "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.8)",
          }}
          className={cn(
            "relative rounded-full border-t border-white/[0.25] border-x border-white/[0.04] border-b border-black/80 flex items-center justify-center shrink-0 z-10",
            dimensions.thumb
          )}
          animate={{
            x: checked ? dimensions.translate : 0,
            rotateY: checked ? 12 : -12,
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 24,
          }}
          whileTap={disabled ? undefined : { scale: 0.92 }}
        >
          {/* Integrated Glowing LED Indicator Dot */}
          <div
            className={cn(
              "rounded-full transition-all duration-300",
              dimensions.led,
              checked
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399,0_0_16px_#10b981] animate-pulse"
                : "bg-red-950 border border-red-800/40 shadow-inner"
            )}
          />
        </motion.div>
      </div>

      {/* Optional Label & Subtext */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-bold text-neutral-100 tracking-wide font-['DM_Sans',sans-serif] group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-neutral-400 font-['DM_Sans',sans-serif]">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
