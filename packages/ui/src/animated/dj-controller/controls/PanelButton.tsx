"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { alpha, raised, SHADOW_PRESSED, SPRING_CONTROL } from "../material";

export interface PanelButtonProps {
  children: ReactNode;
  /** Lit: the label takes the colour and the button gets a thin edge in it. */
  lit?: boolean;
  color?: string;
  ariaLabel?: string;
  onPress: () => void;
  onRelease?: () => void;
  className?: string;
  width?: number;
  height?: number;
}

/** A small rubber key on the panel (SYNC, IN, OUT, CUE…). Fires on pointer down, like hardware. */
export function PanelButton({ children, lit = false, color = "#f2f2f2", ariaLabel, onPress, onRelease, className, width, height = 22 }: PanelButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={lit}
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-md px-2 text-[9px] font-semibold uppercase tracking-[0.08em] outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        className
      )}
      style={{
        ...raised,
        width,
        height,
        color: lit ? color : "rgb(140,140,140)",
        borderColor: lit ? alpha(color, 0.55) : "rgba(255,255,255,0.08)",
        transition: "color 150ms, border-color 150ms",
      }}
      whileTap={{ scale: 0.96, boxShadow: SHADOW_PRESSED }}
      transition={SPRING_CONTROL}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        onPress();
      }}
      onPointerUp={onRelease}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          onPress();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") onRelease?.();
      }}
    >
      {children}
    </motion.button>
  );
}

export interface TransportButtonProps {
  kind: "cue" | "play";
  lit: boolean;
  deck: 0 | 1;
  onPress: () => void;
  onRelease?: () => void;
  size?: number;
}

const TRANSPORT = { cue: "#f08c3a", play: "#3fd07a" };

/** The big round CUE and PLAY/PAUSE keys, each ringed by its light. */
export function TransportButton({ kind, lit, deck, onPress, onRelease, size = 64 }: TransportButtonProps) {
  const color = TRANSPORT[kind];
  return (
    <motion.button
      type="button"
      aria-label={kind === "cue" ? `Deck ${deck + 1} cue` : `Deck ${deck + 1} play / pause`}
      aria-pressed={kind === "play" ? lit : undefined}
      className="relative flex shrink-0 select-none items-center justify-center rounded-full outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40"
      style={{ ...raised, width: size, height: size }}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_CONTROL}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          onPress();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") onRelease?.();
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: 4,
          border: `2px solid ${alpha(color, lit ? 0.95 : 0.28)}`,
          boxShadow: lit ? `0 0 10px -2px ${alpha(color, 0.75)}` : "none",
          transition: "border-color 120ms, box-shadow 120ms",
        }}
      />
      {kind === "cue" ? (
        <span className="text-[11px] font-semibold tracking-[0.08em] text-neutral-200">CUE</span>
      ) : (
        <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden className="text-neutral-200">
          <path d="M1 1 L10 6 L1 11 Z" fill="currentColor" />
          <rect x="15" y="1" width="3" height="10" rx="0.5" fill="currentColor" />
          <rect x="21" y="1" width="3" height="10" rx="0.5" fill="currentColor" />
        </svg>
      )}
    </motion.button>
  );
}
