"use client";

import { useEffect, useRef } from "react";

const DEFAULT_CHARS =
  "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789+-*/=<>!?#$%&@~^ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type RGB = readonly [number, number, number];

// Module-level so the defaults keep one identity across renders — they are
// effect dependencies, and a fresh array each render would rebuild the canvas.
const DEFAULT_ACCENT: RGB = [117, 119, 230];
const DEFAULT_ACCENT_LIGHT: RGB = [99, 102, 220];
const DEFAULT_INK_DARK: RGB = [200, 205, 255];
const DEFAULT_INK_LIGHT: RGB = [15, 23, 42];

export interface MatrixRippleBackgroundProps {
  /** Characters the grid draws from. */
  chars?: string;
  /** Wave-crest colour in dark mode. */
  accent?: RGB;
  /** Wave-crest colour in light mode (a touch deeper so it holds on white). */
  accentLight?: RGB;
  /** Resting character colour in dark mode. */
  inkDark?: RGB;
  /** Resting character colour in light mode. */
  inkLight?: RGB;
  /** Canvas font stack — a literal family name, not a CSS variable. */
  fontFamily?: string;
  fontSize?: number;
  colSpacing?: number;
  rowSpacing?: number;
  /** Ripple speed in px/s. */
  speed?: number;
  /** Width of the bright band in px. */
  waveWidth?: number;
  /** How long a ripple lives, in ms. */
  duration?: number;
  /** Theme check, run every frame. Defaults to `.dark` on <html>. */
  isDark?: () => boolean;
  /** `fixed` covers the viewport; `absolute` fills the nearest positioned parent. */
  position?: "fixed" | "absolute";
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  maxRadius: number;
}

interface Cell {
  char: string;
  baseOpacity: number;
  ambientCooldown: number;
}

function defaultIsDark(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

export function MatrixRippleBackground({
  chars = DEFAULT_CHARS,
  accent = DEFAULT_ACCENT,
  accentLight = DEFAULT_ACCENT_LIGHT,
  inkDark = DEFAULT_INK_DARK,
  inkLight = DEFAULT_INK_LIGHT,
  fontFamily = '"JetBrains Mono", "Geist Mono", Menlo, monospace',
  fontSize = 12,
  colSpacing = 20,
  rowSpacing = 22,
  speed = 720,
  waveWidth = 130,
  duration = 2200,
  isDark = defaultIsDark,
  position = "fixed",
  className = "",
}: Readonly<MatrixRippleBackgroundProps>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!(canvas && ctx)) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let grid: Cell[][] = [];
    const ripples: Ripple[] = [];

    const randomChar = () =>
      chars[Math.floor(Math.random() * chars.length)] ?? "0";

    function initGrid() {
      cols = Math.ceil(width / colSpacing) + 1;
      rows = Math.ceil(height / rowSpacing) + 1;
      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          char: randomChar(),
          baseOpacity: 0.035 + Math.random() * 0.03,
          ambientCooldown: Math.floor(Math.random() * 300),
        }))
      );
    }

    function measure() {
      if (!canvas) return;
      if (position === "fixed") {
        width = window.innerWidth;
        height = window.innerHeight;
      } else {
        const rect = canvas.parentElement?.getBoundingClientRect();
        width = rect?.width ?? window.innerWidth;
        height = rect?.height ?? window.innerHeight;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Assigning width/height resets the context transform, so scale is
      // applied fresh each time rather than compounding.
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.scale(dpr, dpr);
      initGrid();
    }

    function draw(now: number, animate: boolean) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const dark = isDark();

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        if (ripple && now - ripple.startTime > duration) ripples.splice(i, 1);
      }

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const crest = dark ? accent : accentLight;
      const ink = dark ? inkDark : inkLight;
      const sigma = waveWidth * 0.38;

      for (let r = 0; r < rows; r++) {
        const row = grid[r];
        if (!row) continue;
        const cellY = r * rowSpacing;

        for (let c = 0; c < cols; c++) {
          const cell = row[c];
          if (!cell) continue;
          const cellX = c * colSpacing;

          if (animate) {
            cell.ambientCooldown--;
            if (cell.ambientCooldown <= 0) {
              cell.char = randomChar();
              cell.ambientCooldown = 200 + Math.floor(Math.random() * 400);
            }
          }

          let intensity = 0;
          for (const ripple of ripples) {
            const age = now - ripple.startTime;
            const radius = (age / 1000) * speed;
            const fromCrest = Math.abs(
              Math.hypot(cellX - ripple.x, cellY - ripple.y) - radius
            );
            if (fromCrest >= waveWidth) continue;
            const gaussian = Math.exp(
              -(fromCrest * fromCrest) / (2 * sigma * sigma)
            );
            const distanceDecay = Math.max(0, 1 - radius / ripple.maxRadius);
            const timeDecay = Math.max(0, 1 - age / duration);
            intensity = Math.max(intensity, gaussian * distanceDecay * timeDecay);
          }

          if (intensity > 0.12 && Math.random() < 0.45) {
            cell.char = randomChar();
          }

          ctx.fillStyle =
            intensity > 0.05
              ? rgba(crest, Math.min(0.92, cell.baseOpacity + intensity * 0.8))
              : rgba(ink, cell.baseOpacity);
          ctx.fillText(cell.char, cellX, cellY);
        }
      }
    }

    function loop(now: number) {
      draw(now, true);
      frameId = requestAnimationFrame(loop);
    }

    function handlePointerDown(event: PointerEvent) {
      const rect = canvas?.getBoundingClientRect();
      ripples.push({
        x: event.clientX - (rect?.left ?? 0),
        y: event.clientY - (rect?.top ?? 0),
        startTime: performance.now(),
        maxRadius: Math.hypot(width, height) * 0.95,
      });
    }

    function handleResize() {
      measure();
      if (reducedMotion) draw(performance.now(), false);
    }

    measure();
    window.addEventListener("resize", handleResize);

    if (reducedMotion) {
      // One quiet static frame; no loop, no ripples.
      draw(performance.now(), false);
      return () => window.removeEventListener("resize", handleResize);
    }

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    chars,
    accent,
    accentLight,
    inkDark,
    inkLight,
    fontFamily,
    fontSize,
    colSpacing,
    rowSpacing,
    speed,
    waveWidth,
    duration,
    isDark,
    position,
  ]);

  return (
    <canvas
      aria-hidden="true"
      className={`pointer-events-none inset-0 z-0 h-full w-full ${
        position === "fixed" ? "fixed" : "absolute"
      } ${className}`}
      ref={canvasRef}
    />
  );
}
