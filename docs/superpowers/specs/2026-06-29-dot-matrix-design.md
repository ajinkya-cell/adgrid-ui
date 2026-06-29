# Dot Matrix Component Design Spec

This specification details the architecture, animation plugins, performance structures, and implementation steps for building the programmable, DOM-based LED Dot Matrix component.

## Overview
We are building a highly performance-optimized, programmable LED Dot Matrix component for React, Next.js 16, and TypeScript. The component renders an arbitrary grid of dot elements (CSS grid), managing states (brightness, scale, colors) at 60 FPS using a `requestAnimationFrame` loop that directly mutates DOM styles via a flat reference array. This avoids React state overhead and enables 1000+ interactive dots.

- **Location of Code**: `packages/ui/src/matrix/`
- **Monorepo Export**: Exported from `@adgrid-ui/ui`.
- **Target Demo Route**: `/matrix-demo` inside `apps/docs/src/app/matrix-demo/page.tsx` for showcase.

---

## 1. Props API

```typescript
export interface DotMatrixProps {
  rows?: number;
  columns?: number;
  dotSize?: number;
  gap?: number;
  borderRadius?: string;
  color?: string;           // Active LED color (hex/rgb)
  inactiveColor?: string;   // Base LED color (hex/rgb)
  animation?: 
    | "random" | "wave" | "text" | "scroll-text" | "clock" 
    | "equalizer" | "audio" | "noise" | "pulse" | "sparkle" | "ripple";
  text?: string;
  speed?: number;
  fps?: number;             // Configurable FPS cap (default 60)
  loop?: boolean;           // Loop scrolling/typing text
  delay?: number;           // Entry/loop delay in ms
  interactive?: boolean;    // Enable mouse proximity glows/zooms
  glow?: boolean;           // Enable custom CSS drop shadows
  blur?: number;            // Glow blur radius in px
  radius?: number;          // Mouse influence radius in px
  repelMode?: "repel" | "magnet" | "glow"; // Mouse mode
  noiseScale?: number;      // Perlin noise frequency scale
  seed?: number;            // Simplex noise seed
  pattern?: number[][];     // Custom static matrix patterns
  patternB?: number[][];    // Custom secondary pattern for morphing
  morphProgress?: number;   // 0 to 1 progress for transition morphs
}
```

---

## 2. Component Structure

### A. Utility Helpers (`packages/ui/src/matrix/utils/`)
* `bitmap.ts`: Implements character bitmap mappings. Bundles a high-resolution grid (e.g. 7x9 or 7x12) for letters A-Z, numbers 0-9, and symbols (like `:`) to support text display, clock rendering, and scrolling.
* `noise.ts`: A self-contained 2D Simplex/Perlin noise function, returning values between `-1.0` and `1.0` for organic animations.
* `distance.ts`: Calculates Euclidean and Chebyshev distance matrices for coordinate lookups and mouse/ripple vectors.

### B. Core Hooks (`packages/ui/src/matrix/hooks/`)
* `useRAF.ts`: Sets up a high-precision `requestAnimationFrame` loop that caps ticks matching target FPS parameters, delivering delta time indicators.
* `useMouseInfluence.ts`: Coordinates cursor locations relative to matrix dimensions, producing normalized positions and tracking states.

### C. Shared Plugin Engine (`packages/ui/src/matrix/animations/`)
A unified framework where adding a new visual state just requires writing a file implementing `AnimationPlugin`:

```typescript
export interface AnimationContext {
  elements: HTMLDivElement[];
  rows: number;
  columns: number;
  time: number;
  deltaTime: number;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  color: string;
  inactiveColor: string;
  speed: number;
  text?: string;
  audioAnalyser: AnalyserNode | null;
  options: Record<string, any>;
}

export interface AnimationPlugin {
  name: string;
  init?: (context: AnimationContext) => void;
  update: (context: AnimationContext) => void;
  cleanup?: (context: AnimationContext) => void;
}
```

---

## 3. Visual States & Plugin Logics

1. **random**: Assigns random values: $b = \text{Math.random()}$, $opacity = 0.2 + 0.8 \cdot b$.
2. **wave**: Applies horizontal, vertical, or diagonal waves: $b = 0.5 + 0.5 \cdot \sin(\vec{x} \cdot \vec{k} - t \cdot \text{speed})$.
3. **noise**: Generates simplex textures matching coordinates and delta time variables.
4. **pulse**: Breathes collectively: $b = 0.5 + 0.5 \cdot \sin(t \cdot \text{speed})$.
5. **clock**: Displays current HH:MM:SS by rendering numbers onto characters grids. Updates every second.
6. **equalizer**: Generates vertical column amplitude animations. Falls back to procedurally simulated sine waveforms if no audio permission is active.
7. **audio**: Connects to the Web Audio Analyser node to scale dots and glow depths matching frequency ranges.
8. **scroll-text**: Shifts text bitmap coordinates across columns indefinitely.

---

## 4. Verification Plan
* **Typing Checks**: Build package and resolve all TypeScript interfaces.
* **Performance Analysis**: Render a 30x60 grid (1800 dots) and confirm it runs at 60 FPS under Perlin and Equalizer modes.
* **Accessibility**: Verify screen readers skip continuous dot nodes (marked as `aria-hidden`), and check that the component halts JS animation ticks when `prefers-reduced-motion` is active.
