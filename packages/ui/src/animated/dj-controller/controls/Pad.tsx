"use client";

import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { alpha, SHADOW_WELL, SPRING_CONTROL } from "../material";

export interface PadProps {
  color: string;
  /** Lit at full brightness (a set hot cue, an active loop). */
  lit: boolean;
  /** Breathe on the beat while lit: the pad's loop is running. Seconds per beat. */
  pulse?: number | null;
  label: string;
  ariaLabel: string;
  onPress: () => void;
  onRelease?: () => void;
  /** Right-click (e.g. clear a hot cue). */
  onClear?: () => void;
  size?: number;
  reducedMotion?: boolean;
}

/** A rubber performance pad lit from inside: dim in its colour at rest, bright while lit or held. */
export function Pad({ color, lit, pulse, label, ariaLabel, onPress, onRelease, onClear, size = 64, reducedMotion }: PadProps) {
  const [held, setHeld] = useState(false);
  const on = lit || held;

  const down = () => {
    setHeld(true);
    onPress();
  };
  const up = () => {
    if (!held) return;
    setHeld(false);
    onRelease?.();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      down();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") up();
  };

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={on}
      className="relative flex touch-none select-none items-end justify-center overflow-hidden rounded-lg pb-1.5 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40"
      style={{
        width: size,
        height: size,
        background: on ? `linear-gradient(180deg, ${alpha(color, 0.95)} 0%, ${alpha(color, 0.78)} 100%)` : "#0e0e0f",
        border: `1px solid ${alpha(color, on ? 0.9 : 0.45)}`,
        boxShadow: on
          ? `inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 14px -3px ${alpha(color, 0.75)}`
          : `${SHADOW_WELL}, inset 0 0 10px -2px ${alpha(color, 0.18)}`,
        transition: "background 120ms, box-shadow 120ms, border-color 120ms",
      }}
      animate={{ scale: held ? 0.955 : 1 }}
      transition={SPRING_CONTROL}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        down();
      }}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => {
        if (!onClear) return;
        e.preventDefault();
        onClear();
      }}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {lit && pulse && !reducedMotion && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-white"
          initial={{ opacity: 0.22 }}
          animate={{ opacity: [0.22, 0, 0.22] }}
          transition={{ duration: pulse, repeat: Infinity, ease: "easeOut", times: [0, 0.6, 1] }}
        />
      )}
      <span
        className="relative text-[9px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: on ? "rgba(10,10,10,0.8)" : alpha(color, 0.75) }}
      >
        {label}
      </span>
    </motion.button>
  );
}
