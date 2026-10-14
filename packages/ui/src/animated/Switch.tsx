"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Two variants share one API:
// - "rocker" (default): the original mechanical rocker with a 3D tilt and an LED in the thumb.
// - "machined": the design-system switch. A dark raised thumb sits in a recessed track; switched
//   on, the thumb becomes the light popout surface and the track takes a faint fill. Pressing
//   stretches the thumb a little towards where it's going, then it springs across. No LED, no
//   colour, no font of its own. It's a real <button role="switch">, so keys and screen readers work.

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
  /** "rocker" (default) is the original; "machined" follows the design system. */
  variant?: "rocker" | "machined";
  /** Additional custom class names */
  className?: string;
  /**
   * Drive the thumb's travel from outside (0 = off, 1 = on), e.g. from a
   * video timeline, instead of the internal spring.
   */
  progress?: number;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = "md",
  variant = "rocker",
  className,
  progress,
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

  if (variant === "machined") {
    return (
      <MachinedSwitch
        checked={checked}
        onToggle={handleToggle}
        disabled={disabled}
        label={label}
        description={description}
        size={size}
        className={className}
        progress={progress}
      />
    );
  }

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
            ...(progress !== undefined
              ? { x: dimensions.translate * progress, rotateY: -12 + 24 * progress }
              : {}),
            backgroundColor: "#171717",
            boxShadow: checked
              ? "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.25), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.6), -2px 0 10px rgba(16, 185, 129, 0.3), 0 4px 10px rgba(0, 0, 0, 0.8)"
              : "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.8)",
          }}
          className={cn(
            "relative rounded-full border-t border-white/[0.25] border-x border-white/[0.04] border-b border-black/80 flex items-center justify-center shrink-0 z-10",
            dimensions.thumb
          )}
          animate={
            progress === undefined
              ? {
                  x: checked ? dimensions.translate : 0,
                  rotateY: checked ? 12 : -12,
                }
              : undefined
          }
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

// ─── Machined (design-system) variant ───────────────────────────────────────

const MACHINED = {
  // Thumb sits 2px inside the track on every side; travel = inner width − thumb − 4.
  sm: { track: "h-[18px] w-8", thumb: 12, travel: 14, stretch: 3, label: "text-[13px]", desc: "text-xs" },
  md: { track: "h-[22px] w-10", thumb: 16, travel: 18, stretch: 4, label: "text-sm", desc: "text-[13px]" },
  lg: { track: "h-[26px] w-12", thumb: 20, travel: 22, stretch: 5, label: "text-[15px]", desc: "text-sm" },
} as const;

const SPRING_CONTROL = { type: "spring", stiffness: 500, damping: 32 } as const;

function MachinedSwitch({
  checked,
  onToggle,
  disabled,
  label,
  description,
  size,
  className,
  progress,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled: boolean;
  label?: string;
  description?: string;
  size: "sm" | "md" | "lg";
  className?: string;
  progress?: number;
}) {
  const d = MACHINED[size];
  const reduceMotion = useReducedMotion() ?? false;
  const [pressed, setPressed] = useState(false);
  const id = useId();
  const on = progress !== undefined ? progress >= 0.5 : checked;
  const travel = progress !== undefined ? d.travel * progress : on ? d.travel : 0;
  // Held down, the thumb widens towards where it will go: right when off, left when on.
  const stretch = pressed && !disabled && !reduceMotion ? d.stretch : 0;

  return (
    <div className={cn("inline-flex items-start gap-3", disabled && "cursor-not-allowed opacity-40", className)}>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={on}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={onToggle}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        data-state={on ? "checked" : "unchecked"}
        className={cn(
          "group/switch relative mt-px shrink-0 cursor-pointer rounded-full border",
          "bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
          "transition-[border-color,background-color] duration-200",
          "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
          "disabled:cursor-not-allowed",
          on ? "border-white/[0.14] bg-[#0f0f10]" : "border-white/[0.08] hover:border-white/[0.14]",
          d.track
        )}
      >
        {/* Switched on, the well takes a faint fill: lit, not coloured. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full bg-white/[0.06] transition-opacity duration-200",
            on ? "opacity-100" : "opacity-0"
          )}
        />
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ x: on ? travel - stretch : travel, width: d.thumb + stretch }}
          transition={reduceMotion || progress !== undefined ? { duration: 0 } : SPRING_CONTROL}
          className={cn(
            "absolute top-1/2 left-[2px] block -translate-y-1/2 rounded-full border transition-[background,box-shadow,border-color] duration-200",
            on
              ? "border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6),0_2px_6px_-1px_rgba(0,0,0,0.5)]"
              : "border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#232325_0%,#1a1a1c_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.6)]"
          )}
          style={{ height: d.thumb, width: d.thumb }}
        />
      </button>

      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className={cn("cursor-pointer font-medium tracking-tight text-neutral-100", disabled && "cursor-not-allowed", d.label)}
            >
              {label}
            </label>
          )}
          {description && (
            <span id={`${id}-description`} className={cn("leading-relaxed text-neutral-400", d.desc)}>
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
