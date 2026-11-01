"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { playClickVoice, VOID_BUTTON_CLICK } from "../lib/click-voices";

export interface PixelButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Side of one pixel in CSS px. */
  cellSize?: number;
  /** Space between pixels in CSS px. */
  gap?: number;
  /** Share of pixels that light up on hover, 0–1. */
  density?: number;
  /** Any CSS color for the pixels. */
  pixelColor?: string;
  /** Play the tactile click on press. */
  sound?: boolean;
}

let pixelAudioCtx: AudioContext | null = null;

// Every state keeps the same five layers in the same order (two insets first) so the spring can
// interpolate between them. The edge is the third layer, a 1px spread ring, not a border.
const SHADOW_REST =
  "inset 0 1px 0 0 rgba(255,255,255,0.14), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.035), 0 1px 2px 0 rgba(0,0,0,0.6), 0 6px 16px -4px rgba(0,0,0,0.7)";
const SHADOW_HOVER =
  "inset 0 1px 0 0 rgba(255,255,255,0.2), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 2px 4px 0 rgba(0,0,0,0.6), 0 10px 24px -6px rgba(0,0,0,0.8)";
const SHADOW_PRESS =
  "inset 0 3px 8px 0 rgba(0,0,0,0.85), inset 0 -1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.025), 0 1px 1px 0 rgba(0,0,0,0.6), 0 2px 6px -2px rgba(0,0,0,0.6)";

const SPRING = { type: "spring", stiffness: 750, damping: 24, mass: 0.4 } as const;

interface Cell {
  x: number;
  y: number;
  rest: number; // resting alpha, 0 for most cells
  active: boolean; // lights up on hover
  spark: boolean; // peaks brighter than the rest
  phase: number;
  speed: number;
  delayIn: number; // ms after hover before this cell ignites
  delayOut: number; // ms after leave before this cell fades
  level: number; // 0–1, eased toward its target each frame
}

export function PixelButton({
  className,
  children = "Pixel button",
  cellSize = 3,
  gap = 2,
  density = 0.55,
  pixelColor = "#fff",
  sound = true,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onFocus,
  onBlur,
  ...props
}: PixelButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const reduceMotion = useReducedMotion();

  // The draw loop reads these through refs so hover changes don't rebuild the grid.
  const hoverRef = useRef({ on: false, since: 0 });
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    if (!button || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cells: Cell[] = [];
    let raf = 0;
    let last = 0;
    let cellPx = 1;

    // Work in device pixels so every square lands on whole pixels at any display scale.
    const build = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = button.offsetWidth;
      const h = button.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      cellPx = Math.max(1, Math.round(cellSize * dpr));
      const step = cellPx + Math.max(1, Math.round(gap * dpr));
      const cols = Math.floor((canvas.width + step - cellPx) / step);
      const rows = Math.floor((canvas.height + step - cellPx) / step);
      const ox = Math.floor((canvas.width - (cols * step - (step - cellPx))) / 2);
      const oy = Math.floor((canvas.height - (rows * step - (step - cellPx))) / 2);

      const prev = cells;
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const spark = Math.random() < 0.08;
          const x = ox + c * step;
          const y = oy + r * step;
          cells.push({
            x,
            y,
            rest: Math.random() < 0.2 ? 0.03 + Math.random() * 0.03 : 0,
            active: Math.random() < density,
            spark,
            phase: Math.random() * Math.PI * 2,
            speed: 1.2 + Math.random() * 3,
            delayIn: Math.random() * 350,
            delayOut: Math.random() * 300,
            level: prev[cells.length]?.level ?? 0,
          });
        }
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pixelColor;
      const secs = t / 1000;
      for (const cell of cells) {
        let a = cell.rest;
        if (cell.active && cell.level > 0.001) {
          // Cubing the wave keeps each pixel dark most of the time with short blinks, so it
          // reads as a scattered twinkle instead of a slow pulse.
          const wave = reduceMotion ? 0.5 : Math.pow(0.5 + 0.5 * Math.sin(cell.phase + secs * cell.speed), 3);
          const peak = cell.spark ? 0.22 : 0.12;
          a = Math.max(a, cell.level * (0.025 + peak * wave));
        }
        if (a <= 0.004) continue;
        ctx.globalAlpha = a;
        ctx.fillRect(cell.x, cell.y, cellPx, cellPx);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      const { on, since } = hoverRef.current;
      const elapsed = t - since;
      const ease = 1 - Math.exp(-dt / (reduceMotion ? 40 : 110));
      let awake = on;

      for (const cell of cells) {
        if (!cell.active) continue;
        const target = on ? (elapsed > cell.delayIn ? 1 : cell.level) : elapsed > cell.delayOut ? 0 : cell.level;
        cell.level += (target - cell.level) * ease;
        if (cell.level > 0.002) awake = true;
        else cell.level = 0;
      }

      draw(t);
      if (awake) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        last = 0;
      }
    };

    wakeRef.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    build();
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now());
      wakeRef.current();
    });
    ro.observe(button);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
    };
  }, [cellSize, gap, density, pixelColor, reduceMotion]);

  const setHover = (on: boolean) => {
    if (hoverRef.current.on === on) return;
    hoverRef.current = { on, since: performance.now() };
    setHovered(on);
    wakeRef.current();
  };

  const playClick = () => {
    if (!sound || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!pixelAudioCtx) pixelAudioCtx = new AudioContextClass();
      if (pixelAudioCtx.state === "suspended") pixelAudioCtx.resume();
      playClickVoice(pixelAudioCtx, VOID_BUTTON_CLICK);
    } catch (e) {}
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onPointerEnter={(e) => {
        setHover(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHover(false);
        setPressed(false);
        onPointerLeave?.(e);
      }}
      onPointerDown={(e) => {
        playClick();
        setPressed(true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        onPointerUp?.(e);
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) setHover(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setHover(false);
        onBlur?.(e);
      }}
      animate={{
        scale: pressed ? 0.96 : 1,
        y: pressed ? 1.5 : 0,
        boxShadow: pressed ? SHADOW_PRESS : hovered ? SHADOW_HOVER : SHADOW_REST,
      }}
      initial={false}
      transition={SPRING}
      className={cn(
        "relative inline-flex h-11 cursor-pointer select-none items-center justify-center overflow-hidden rounded-full px-5 outline-none",
        "bg-[linear-gradient(to_bottom,#1f1f1f,#121212)]",
        "font-sans text-[13px] font-semibold tracking-[-0.005em]",
        className
      )}
      {...(props as any)}
    >
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0" />

      {/* Glassy top half */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_45%)]"
      />

      <span
        className={cn(
          "relative z-10 inline-flex items-center transition-colors duration-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.85)]",
          hovered ? "text-white" : "text-white/85"
        )}
      >
        {children}
      </span>
    </motion.button>
  );
}
