# Design Spec: ScrollPathDraw Component

This document outlines the design specification for the `ScrollPathDraw` component, which animates SVG paths based on scroll progress. It supports scroll-locked (scroll-jacked) animation and passive scroll-driven animation.

---

## 1. Problem Statement / Goal
The goal is to create a reusable component that replicates the scroll-linked SVG path-drawing behavior provided by the user. The component must support:
1. **Multiple path visual variants**:
   * **Waves**: The original 5-line flowing colored wave design.
   * **Circuit**: A cyberpunk circuit-board design where orthogonal paths draw and light up nodes.
   * **Process**: A timeline flow where a single path connects distinct step cards as they draw.
2. **Flexible integration modes**:
   * **Scroll-jacked**: Keeps the viewport locked while scroll/touch increments the drawing progress. Once complete, it unlocks. On scroll-up to the top, it re-locks.
   * **Passive**: Animates drawing progress based on standard viewport scroll (without lock/jack).
3. **Modular and extensible structure**: Separate the scroll-tracking provider from the visual SVG renderer.

---

## 2. Proposed Architecture

### Composed Container & Subcomponents (`packages/ui/src/animated/scrollpath/`)
We will create a directory containing:
*   `ScrollPathContext.tsx`: React Context providing the normalized `scrollProgress` (a number between 0 and 1).
*   `ScrollPathContainer.tsx`: Standard wrapper that handles the scroll mechanics (mouse wheel, touch swipe, scroll-jacking scroll lock/unlock, or passive viewport tracking via framer-motion `useScroll`).
*   `variants/ScrollPathWaves.tsx`: Original multi-colored waves.
*   `variants/ScrollPathCircuit.tsx`: Cyberpunk circuit layout.
*   `variants/ScrollPathProcess.tsx`: Visual step-by-step card connector.

### Component Props Interfaces

```typescript
export interface ScrollPathContainerProps {
  mode?: "scroll-jack" | "passive";
  sensitivity?: number; // Adjusts wheel scroll scale
  children: React.ReactNode;
  className?: string;
}

export interface ScrollPathVariantProps {
  strokeWidth?: number;
  glow?: boolean;
  glowColor?: string;
  className?: string;
}
```

---

## 3. Implementation Details

### A. Scroll Tracking Logic
*   **Scroll-jacked**: Registers wheel and touch listeners on the container. We accumulate a vertical scroll value inside a React `useRef` clamped between `0` and `window.innerHeight`. The normalized progress is `scrollProgress = current / window.innerHeight`. We set `document.body.style.overflow = "hidden"` while drawing is incomplete. If drawing finishes, or if drawing is at `0` and scroll is scrolling up, we restore `document.body.style.overflow = ""`.
*   **Passive**: Uses Framer Motion's `useScroll` with container target, passing the viewport progress to the React Context.

### B. Path Variants
*   **Waves**: Draws the five provided bezier curves using different colors and customizable glow SVG filters.
*   **Circuit**: Draws standard orthogonal circuit traces with circles at path terminations that pulse and glow when `scrollProgress` exceeds the point's position.
*   **Process**: Renders 3 cards (Step 1, Step 2, Step 3) arranged vertically or horizontally, with an SVG path connecting them. As progress increases, the path grows to each card and reveals them with a bounce/fade animation.

---

## 4. Verification Plan

### Automated Build Verification
*   Run `pnpm build` to compile the library and verify no TypeScript or bundle-time errors occur.

### Manual Behavior Verification
*   Create a demo page in `apps/docs/src/app/gallery/scroll-path/page.tsx` or similar.
*   Verify that scroll-jacking locks scrolling, draws waves/circuit/process to completion, and unlocks correctly.
*   Verify that passive scrolling draws components smoothly without locking.
