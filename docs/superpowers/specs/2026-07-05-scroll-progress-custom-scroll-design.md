# Design Spec: ScrollProgress Custom Scroll Tracking Fix

This document outlines the design specification for refactoring the `ScrollProgress` component and its hook `useScrollProgress` to support robust custom scrollable container tracking.

---

## 1. Problem Statement
The current implementation of `ScrollProgress` relies on Framer Motion's `useScroll` with a custom `container` ref. In Next.js (SSR) environments and dynamic presentation canvases (like the docs app's presentation canvas), the ref is initially `null` on mount and later populated via React state. Framer Motion's `useScroll` does not reliably track this transition because React ref mutations do not trigger effect dependencies. As a result, the scroll progress remains static and does not respond to mouse scrolling or dragging.

---

## 2. Proposed Changes

### Custom Event-Driven Hook (`packages/ui/src/animated/scrollprogress/useScrollProgress.ts`)
We will replace `useScroll` with a custom `useScrollProgress` hook:
*   Accepts an optional `containerRef` parameter: `React.RefObject<HTMLElement | null>`.
*   Uses a Framer Motion `scrollYProgress` (`useMotionValue(0)`).
*   Registers an event listener in a `useEffect` that listens for scroll events on either `containerRef.current` or `window`.
*   Tracks changes to `containerRef.current` by including it in the `useEffect` dependency array.
*   Calculates scroll percentage:
    *   For container: `progress = container.scrollTop / (container.scrollHeight - container.clientHeight)`
    *   For window: `progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)`
*   Translates scroll velocity using `useVelocity` on a `useSpring` wrapper.

### Component Logic Update (`packages/ui/src/animated/scrollprogress/ScrollProgress.tsx`)
*   Refactor the dragging callback `handleDrag` to safely scroll either the custom container (`container.scrollTop = progress * maxScroll`) or the window (`window.scrollTo(0, progress * maxScroll)`).
*   Ensure that all props (`ticks`, `color`, `glow`, `height`, `width`, `variant`, `containerRef`) are typed correctly and utilized properly.

---

## 3. Verification Plan

### Automated Build Verification
*   Run `pnpm build` to compile the library and ensure TypeScript validation passes.

### Manual Behavior Verification
*   Mount the component in the docs app presentation canvas (`/presentation/scroll-progress`).
*   Verify that mouse scrolling inside the canvas updates the progress bar and tick positions.
*   Verify that dragging the indicator scrolls the canvas smoothly.
*   Verify that scrolling speed stretches the indicator and intensifies the glow.
