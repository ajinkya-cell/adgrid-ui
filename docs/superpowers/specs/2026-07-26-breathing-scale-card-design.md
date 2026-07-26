# BreathingScaleCard Component Design Specification

**Date:** 2026-07-26  
**Status:** Approved  
**Target Package:** `@adgrid-ui/ui` (`packages/ui`)

---

## 1. Overview

`BreathingScaleCard` is a dark-first React card component featuring overshooting corner border lines, a soft vignette mask, breathing ambient backlight glows, and sweeping geometric pattern animations driven by Framer Motion and Tailwind CSS.

---

## 2. Component Architecture & Props Interface

### File Location
- Component: `packages/ui/src/animated/BreathingScaleCard.tsx`
- Exports: `packages/ui/src/index.ts`

### Interface Definitions

```typescript
export type BreathingScaleCardPreset = "indigo" | "cyberpunk" | "emerald" | "amber" | "custom";
export type BreathingScalePatternVariant = "diagonal" | "stripes" | "dots" | "grid";

export interface BreathingScaleCardProps {
  children?: React.ReactNode;
  className?: string;
  preset?: BreathingScaleCardPreset;
  patternVariant?: BreathingScalePatternVariant;
  patternColor?: string;
  duration?: number;
  glowColor?: string;
  patternSize?: number;
  angle?: number;
  overshoot?: boolean | number;
  lineColor?: string;
  vignette?: boolean;
  hoverEffect?: boolean;
}
```

---

## 3. Preset & Theme System

Presets map to curated color combinations:
- **`indigo`**:
  - `glowColor`: `"from-transparent via-indigo-500/25 to-transparent"`
  - `lineColor`: `"via-indigo-400/40"`
  - `patternColor`: `"rgba(99, 102, 241, 0.25)"`
- **`cyberpunk`**:
  - `glowColor`: `"from-transparent via-fuchsia-500/30 to-transparent"`
  - `lineColor`: `"via-cyan-400/50"`
  - `patternColor`: `"rgba(236, 72, 153, 0.3)"`
- **`emerald`**:
  - `glowColor`: `"from-transparent via-emerald-500/25 to-transparent"`
  - `lineColor`: `"via-emerald-400/40"`
  - `patternColor`: `"rgba(16, 185, 129, 0.25)"`
- **`amber`**:
  - `glowColor`: `"from-transparent via-amber-500/25 to-transparent"`
  - `lineColor`: `"via-amber-400/40"`
  - `patternColor`: `"rgba(245, 158, 11, 0.25)"`

---

## 4. Geometric Pattern Engine

Calculates `backgroundImage` dynamically according to `patternVariant`:
- **`diagonal`**: `repeating-linear-gradient(${angle}deg, ${color} 0, ${color} 1px, transparent 1px, transparent 50%)`
- **`stripes`**: `repeating-linear-gradient(90deg, ${color} 0, ${color} 1px, transparent 1px, transparent 50%)`
- **`dots`**: `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 0)`
- **`grid`**: linear repeating gradient overlaying horizontal and vertical 1px lines.

---

## 5. Animation & Reactivity

- **Mask Sweep**: Framer Motion loops `WebkitMaskPosition` & `maskPosition` across a 200% linear gradient mask.
- **Breathing Backlight**: Ease-in-out pulse loop on scale and opacity.
- **Hover Micro-interaction**: Optional `hoverEffect` elevates card scale (`scale: 1.015`) and intensifies glow layer on mouse enter.

---

## 6. Testing & Validation Plan

- Verify TypeScript compilation via `pnpm --filter @adgrid-ui/ui typecheck`.
- Build verification via `pnpm --filter @adgrid-ui/ui build`.
