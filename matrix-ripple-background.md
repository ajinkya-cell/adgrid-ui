# Matrix Ripple Background

A full-screen canvas of faint, slowly mutating characters (half-width Katakana, digits, symbols, Latin capitals). Clicking or tapping anywhere sends out a circular wave. As the crest passes, characters brighten to the accent colour, scramble, and fade back to rest. The idle state is about 3.5–6.5% opacity, so it reads as a texture, not a light show.

Taken from the homepage of my blog. This version is self-contained: one client component, no dependencies beyond React.

---

## 1. Prompt (paste this into your UI project's assistant)

> Add a `MatrixRippleBackground` component to this project using the code in this file, unchanged except for the import paths and these adaptations:
>
> 1. Put it in our components folder as `matrix-ripple-background.tsx` (kebab-case file, named export). It is a client component (`"use client"`).
> 2. Wire the colours to our theme. The default accent is `#7577E6`. If our design system has a brand/accent colour, pass it via the `accent` prop as an `[r, g, b]` tuple. Keep the light/dark ink defaults unless our tokens say otherwise.
> 3. Pass our monospace font stack via `fontFamily` if we load one (e.g. `var(--font-mono)` resolved to its family name, or `"JetBrains Mono", monospace`). Canvas can't read CSS variables directly, so use the literal family name.
> 4. Mount it once, as the first child of the page or section it sits behind. The parent must be `relative`, and the real content must sit above it (`relative z-10` or higher). It is `pointer-events-none`, so it never blocks clicks; it listens for `pointerdown` on `window` instead.
> 5. Dark mode is detected from a `dark` class on `<html>`, falling back to `prefers-color-scheme`. If our project toggles themes differently (e.g. `data-theme="dark"`), pass `isDark={() => document.documentElement.dataset.theme === "dark"}`.
> 6. Don't add any animation library. Don't convert it to WebGL. Don't remove the reduced-motion handling.
>
> After adding it, show me where you mounted it and which props you passed.

---

## 2. How it works

| Layer | What it does |
| --- | --- |
| **Grid** | A cell every `colSpacing × rowSpacing` px (20 × 22 by default), sized to the viewport, rebuilt on resize. Each cell holds a character, a resting opacity (`0.035–0.065`), and a countdown until its next ambient mutation. |
| **Ambient life** | Every frame, each cell's countdown ticks down; at zero it swaps to a random character and resets to 200–600 frames. Slow and quiet on purpose. |
| **Ripples** | Each `pointerdown` pushes a ripple `{x, y, startTime}`. Its radius is `elapsed × speed` (720 px/s). A cell's intensity is a **Gaussian of its distance from the crest** (σ = 0.38 × waveWidth), multiplied by a distance decay and a time decay, so the ring is soft-edged and dies out over `duration` (2.2 s). Overlapping ripples take the max, not the sum, so they never blow out. |
| **Scramble** | Cells above 12% intensity re-roll their character 45% of frames, which produces the "decoding" shimmer on the crest. |
| **Colour** | Above 5% intensity a cell draws in the accent at `baseOpacity + intensity × 0.8` (capped at 0.92); otherwise it draws in the resting ink at its base opacity. |
| **Crispness** | The canvas is sized at `devicePixelRatio` (capped at 2) and scaled back with CSS, so glyphs are sharp on retina without a 3× fill cost. |
| **Reduced motion** | With `prefers-reduced-motion: reduce`, it paints one static frame, never animates, and ignores clicks. |

---

## 3. Code: `matrix-ripple-background.tsx`

```tsx
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
```

> **Prop stability:** `accent`, `inkDark` and the other tuple props are effect dependencies. Define them as module-level constants (or `useMemo`) rather than inline array literals, or the canvas re-initialises on every render of the parent.

---

## 4. Usage

```tsx
import { MatrixRippleBackground } from "@/components/matrix-ripple-background";

const ACCENT = [117, 119, 230] as const;

export default function Page() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <MatrixRippleBackground accent={ACCENT} />
      <main className="relative z-10">{/* page content */}</main>
    </div>
  );
}
```

Contained in one section instead of the whole viewport:

```tsx
<section className="relative h-[560px] overflow-hidden rounded-2xl">
  <MatrixRippleBackground position="absolute" />
  <div className="relative z-10">…</div>
</section>
```

In `absolute` mode, ripples still start from any click on the page; ones outside the section just aren't visible.

---

## 5. Tuning knobs

| Want | Change |
| --- | --- |
| Quieter texture | Lower the resting range in `initGrid` (`0.035 + Math.random() * 0.03`), e.g. `0.02 + … * 0.02`. |
| Denser grid | Smaller `colSpacing` / `rowSpacing` (cost grows with cell count; 16 × 18 is a sensible floor). |
| Wider, softer wave | Raise `waveWidth` (the Gaussian σ scales with it). |
| Faster or longer wave | `speed` (px/s) and `duration` (ms). |
| Less shimmer on the crest | Lower the `0.45` scramble probability or raise the `0.12` threshold. |
| Pure-Latin "code rain" look | `chars="01"` or `chars="ABCDEF0123456789"`. |

**Performance:** cost is one `fillText` per cell per frame, so about 3,000 cells on a 1440 × 900 viewport. That's fine on any modern laptop or phone. If you need it cheaper, skip drawing cells whose intensity is 0 and whose base opacity is below a threshold, or halve the frame rate by drawing every other `requestAnimationFrame`.
