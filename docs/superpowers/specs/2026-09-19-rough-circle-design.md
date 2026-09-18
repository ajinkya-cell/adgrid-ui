# RoughCircle Component Design Spec

**Date:** 2026-09-19  
**Status:** Approved  
**Topic:** Standalone Hand-Drawn Sketchy Circle Component (`RoughCircle`) powered by `rough-notation`  

---

## 1. Executive Summary

The existing annotation implementation inside `Roughly.tsx` suffered from two primary issues:
1. **Asymmetric Curves & Spacing:** The right side of the circle was clipped and flat compared to the generous space, width, and sweeping curve of the left side.
2. **Animation Stutter:** The previous custom CSS `stroke-dashoffset` implementation used a hardcoded `1000px` fallback dasharray that jumped abruptly when the true path length was measured, resulting in jerky rendering.

To resolve these issues and establish a focused, scalable architecture, we are building **`RoughCircle` alone** as an isolated, standalone component powered by **`rough-notation`** (which bundles the `roughjs` engine). This provides authentic hand-drawn double-pass sketch lines, perfectly balanced symmetric lateral padding, and smooth, flicker-free stroke animation.

---

## 2. Architecture & File Structure

Instead of bundling all 7 annotation types inside a monolithic file, we isolate each annotation into its own dedicated subcomponent:

```
packages/ui/
└── src/
    └── animated/
        └── roughly/
            ├── RoughCircle.tsx       <-- Standalone Circle Component (Primary Target)
            └── index.ts              <-- Subcomponent barrel export
```

### Dependency Strategy
- Add `rough-notation` as a dependency in `packages/ui/package.json` (it is already installed in `apps/docs`).
- `packages/ui/src/index.ts` exports `RoughCircle` and `RoughCircleProps`.

---

## 3. Component Specification (`RoughCircle`)

### 3.1 Public Interface
```tsx
export interface RoughCircleProps {
  children: React.ReactNode;
  /** Circle stroke color (default: "#6366F1") */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Horizontal padding around the content in px (default: 22) */
  paddingX?: number;
  /** Vertical padding around the content in px (default: 10) */
  paddingY?: number;
  /** Drawing animation duration in milliseconds (default: 800) */
  animationDuration?: number;
  /** Whether the drawing stroke should animate into view (default: true) */
  animate?: boolean;
  /** Number of sketchy stroke loops (default: 2 for authentic hand-drawn look) */
  iterations?: number;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Additional CSS class names for the wrapping span */
  className?: string;
  /** Additional CSS class names for the inner text content */
  textClassName?: string;
}
```

### 3.2 Symmetric Geometry & Breathing Room
`rough-notation` accepts padding as `[top, right, bottom, left]`. We supply:
```ts
const resolvedPadding: [number, number, number, number] = [
  paddingY,
  paddingX,
  paddingY,
  paddingX,
];
```
By setting equal horizontal clearance on both right and left (defaulting to 22px):
- The right edge receives the exact same horizontal breathing room as the left edge.
- The `ellipse` generator in `roughjs` constructs a balanced bounding box, giving both sides equal curvature, width, and organic double-pass sketch loops.

### 3.3 React Lifecycle & Animation Smoothness
To guarantee stutter-free 60fps animation across Next.js SSR and client hydration:
1. **SSR Safety:** Component renders pure text on the server; the annotation initializes solely in client-side effects (`"use client"`).
2. **Font-Ready Synchronization:** To avoid bounding-box calculation shifts before custom web fonts load, the initial measurement synchronizes with `document.fonts.ready` (with fallback).
3. **Viewport-Triggered Entrance:** An `IntersectionObserver` with a `0.15` threshold ensures the animation fires smoothly when scrolled into view rather than running off-screen.
4. **Strict-Mode & Re-render Cleanup:** Every effect cycle cleans up by calling `annotation.remove()`, preventing ghost SVGs or memory leaks.
5. **Replay Ability:** When triggered (via key prop or playground controls), the previous annotation is destroyed and redrawn from zero offset with an authentic pen-stroke reveal.

---

## 4. Documentation & Playground (`/roughly`)

Update the interactive demo page at `apps/docs/src/app/roughly/page.tsx`:
1. **Dedicated RoughCircle Section:** Showcase `RoughCircle` with direct props controls.
2. **Symmetry Controls:** Interactive sliders for `paddingX` (10px to 40px) and `paddingY` (4px to 20px) to verify the balanced space and curves on both left and right.
3. **Animation Smoothness Controls:** Duration slider (300ms to 2000ms), iterations toggle (1 vs 2 loops), and a "Replay Draw" button to inspect stroke fluidity.

---

## 5. Verification Plan

### Automated Verification
- Run `pnpm typecheck` or `npm run typecheck` across `packages/ui` and `apps/docs`.
- Run Next.js build: `pnpm build` to verify clean SSR compilation without `window`/`document` reference errors.

### Manual Visual Verification
1. Navigate to `http://localhost:3000/roughly`.
2. Inspect the circle: verify the left and right sides have identical padding, width, and sweeping curve.
3. Click "Replay Draw": verify the animation draws smoothly from start to finish without jumping or flickering.
4. Test responsive text wrapping and font size changes.
