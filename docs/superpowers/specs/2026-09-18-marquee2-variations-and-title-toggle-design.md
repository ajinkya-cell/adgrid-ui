# Marquee2 Variations & Hover Title Toggle Design Specification (Revised)

**Date:** 2026-09-18  
**Status:** Approved  
**Target:** `packages/ui/src/animated/Marquee2.tsx`, `apps/docs/src/registry/index.ts`, `apps/docs/public/r/marquee-2.json`

---

## 1. Overview

The `Marquee2` (`marquee-2`) component renders dynamic floating brand icons (`devicons-react`) along SVG motion paths.

Based on feedback:
1. Closed orbit shapes (`circle` and `infinity`) were removed due to aesthetic clutter on wide viewports.
2. The primary `wave` motion path is refined into a balanced, symmetrical sinusoidal flow with matching entrance/exit tangents and ample vertical clearance.
3. Added complementary banner-optimized curves: `valley` (inverted arch / smile curve) and `double-wave` (gentle harmonic ripple).
4. Refactored the title prop into `showTitleOnHover` (boolean, default: `true`). When enabled, brand titles appear elegantly on hover; when disabled, icons remain clean without hover tooltips.

---

## 2. Component Interface & Paths (`packages/ui/src/animated/Marquee2.tsx`)

### 2.1 Types & Props

```typescript
export type Marquee2Variant = "wave" | "arch" | "valley" | "double-wave";

export interface Marquee2Props {
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  variant?: Marquee2Variant;
  showTitleOnHover?: boolean;
  showTitle?: boolean; // alias for convenience & backwards compatibility
}
```

### 2.2 SVG Paths (`viewBox="0 0 1440 450"`)

- **`wave`**: A balanced, symmetrical S-curve centered at $y=225$ with peak at $y\approx 110$ and trough at $y\approx 340$:
  ```svg
  M -100 225 C 180 80, 440 80, 720 225 C 1000 370, 1260 370, 1540 225
  ```
- **`arch`**: A symmetrical dome curve rising to $y\approx 100$:
  ```svg
  M -100 400 C 320 0, 1120 0, 1540 400
  ```
- **`valley`**: An inverted smile curve dipping smoothly to $y\approx 350$:
  ```svg
  M -100 50 C 320 450, 1120 450, 1540 50
  ```
- **`double-wave`**: A smooth two-cycle harmonic wave with matching tangents at all inflections and endpoints:
  ```svg
  M -100 225 C 0 125, 210 125, 310 225 C 410 325, 620 325, 720 225 C 820 125, 1030 125, 1130 225 C 1230 325, 1440 325, 1540 225
  ```

### 2.3 Hover Title Tooltip

```tsx
<div className="relative flex flex-col items-center justify-center p-2 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
  <IconComp size={48} />
  {isTitleEnabled && (
    <span className="absolute -bottom-8 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-white/10 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl backdrop-blur-sm z-40">
      {item.name}
    </span>
  )}
</div>
```

---

## 3. Registry Definition (`apps/docs/src/registry/index.ts`)

```typescript
propDefs: [
  {
    name: "variant",
    type: "select",
    default: "wave",
    description: "Curved motion path style",
    options: ["wave", "arch", "valley", "double-wave"],
    required: false,
  },
  {
    name: "showTitleOnHover",
    type: "boolean",
    default: true,
    description: "Display brand title badge on mouse hover",
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
],
```

---

## 4. Verification

1. Compile `@adgrid-ui/ui` via `tsup`.
2. Build docs registry via `turbo build:registry`.
3. Verify Next.js build passes with no errors.
