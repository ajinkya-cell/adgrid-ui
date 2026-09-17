# Marquee2 Variations & Logo Title Toggle Design Specification

**Date:** 2026-09-18  
**Status:** Approved  
**Target:** `packages/ui/src/animated/Marquee2.tsx`, `apps/docs/src/registry/index.ts`, `apps/docs/public/r/marquee-2.json`

---

## 1. Overview

The `Marquee2` (`marquee-2`) component in Void UI / Adgrid UI renders dynamic floating brand icons (`devicons-react`) along parametric SVG paths using `performance.now()` and `requestAnimationFrame`.

Currently, `Marquee2` only provides open path options: `"wave"` and `"arch"`. Additionally, brand labels/names are only displayed on mouse hover within an absolute-positioned tooltip.

This update introduces:
1. **New Motion Path Variations**:
   - `"circle"`: A closed circular orbit centered at $(720, 225)$ with radius $R=170\text{px}$.
   - `"infinity"`: A smooth $C^1$-continuous figure-8 lemniscate curve crossing through $(720, 225)$.
2. **Logo Title Toggle (`showTitle?: boolean`)**:
   - A toggle prop allowing users to display brand title labels permanently below each logo or keep them as hover-only tooltips.

---

## 2. Component Specifications

### 2.1 Component Interface (`packages/ui/src/animated/Marquee2.tsx`)

```typescript
export type Marquee2Variant = "wave" | "arch" | "circle" | "infinity";

export interface Marquee2Props {
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  variant?: Marquee2Variant;
  showTitle?: boolean;
}
```

### 2.2 SVG Motion Paths

ViewBox: `0 0 1440 450` (center at $x=720, y=225$).

- **`wave`**:
  `"M -100 240 C 250 80, 550 380, 850 200 S 1300 60, 1550 260"`
- **`arch`**:
  `"M -100 480 C 200 40, 1240 40, 1540 480"`
- **`circle`**:
  `"M 720 55 A 170 170 0 1 1 720 395 A 170 170 0 1 1 720 55 Z"`
  - Center $(720, 225)$, radius $170\text{px}$, circumference $\approx 1068\text{px}$.
  - Seamless loop with equidistant spacing ($\approx 67\text{px}$) across all 16 brand icons.
- **`infinity`**:
  `"M 720 225 C 860 100, 1140 100, 1140 225 C 1140 350, 860 350, 720 225 C 580 100, 300 100, 300 225 C 300 350, 580 350, 720 225 Z"`
  - Symmetrical two-lobe lemniscate with matching incoming/outgoing tangent vectors at the $(720, 225)$ crossing point for smooth velocity and zero jerkiness.

### 2.3 Logo Title Tag Display

```tsx
<div className="relative flex flex-col items-center justify-center p-2 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
  <IconComp size={48} />
  <span
    className={cn(
      "px-2 py-0.5 rounded bg-neutral-900/90 border border-white/10 text-[10px] font-mono text-white/80 whitespace-nowrap shadow-lg transition-all duration-200",
      showTitle
        ? "mt-1.5 opacity-100"
        : "absolute -bottom-8 opacity-0 group-hover:opacity-100 pointer-events-none"
    )}
  >
    {item.name}
  </span>
</div>
```

- When `showTitle = true`: Text label renders right beneath the icon as a clear badge.
- When `showTitle = false`: Preserves existing tooltip behavior (absolute positioned, appears only on hover).

---

## 3. Monorepo & Registry Integration

### 3.1 Registry Configuration (`apps/docs/src/registry/index.ts`)

Update `marquee-2` `propDefs`:
```typescript
{
  name: "variant",
  type: "select",
  default: "wave",
  description: "Curved motion path style",
  options: ["wave", "arch", "circle", "infinity"],
  required: false,
},
{
  name: "showTitle",
  type: "boolean",
  default: false,
  description: "Always display brand title label below each logo",
  required: false,
},
{
  name: "speed",
  type: "number",
  default: 1,
  description: "Animation speed multiplier",
  required: false,
  min: 0.2,
  max: 5,
  step: 0.1,
},
{
  name: "pauseOnHover",
  type: "boolean",
  default: true,
  description: "Pause marquee sliding on mouse hover",
  required: false,
},
```

### 3.2 Presentation Studio & Precompiled Artifacts

- Presentation studio (`apps/docs/src/components/presentation/PresentationRenderer.tsx`) already spreads `liveProps` directly onto `<Marquee2 />`.
- Precompile registry outputs using `pnpm build:registry` to update `apps/docs/public/r/marquee-2.json` and `apps/docs/public/r/registry.json`.

---

## 4. Verification Plan

1. **Typecheck & Lint**: Verify TypeScript compiles without errors across `@adgrid-ui/ui` and `apps/docs`.
2. **Registry Generation**: Run `turbo build:registry` and ensure JSON schemas build cleanly.
3. **Interactive Studio Verification**: Test switching `variant` across `"wave"`, `"arch"`, `"circle"`, and `"infinity"` and toggling `showTitle` in the presentation studio tweaker.
