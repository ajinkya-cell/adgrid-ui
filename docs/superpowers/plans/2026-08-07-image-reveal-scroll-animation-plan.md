# Implementation Plan: 3D Receding Tunnel Image Scroll Animation

**Target Component**: [`packages/ui/src/animated/ImageReveal.tsx`](../../packages/ui/src/animated/ImageReveal.tsx)  
**Spec Reference**: [`docs/superpowers/specs/2026-08-07-image-reveal-scroll-animation-design.md`](../specs/2026-08-07-image-reveal-scroll-animation-design.md)

---

## Task 1: Update ImageLayer Motion Transforms in ImageReveal.tsx
- [ ] Define precise scroll step bounds:
  - `start = index / total`
  - `end = (index + 1) / total`
  - `peak = start + (end - start) * 0.25`
- [ ] Implement multi-stage transforms:
  - `scale`: `[1.15, 1.08, 0.88]` (recedes into 3D screen depth)
  - `brightness`: `[2.4, 2.0, 1.0]` (bright/punched-up active state normalizing to 1.0)
  - `contrast`: `[1.6, 1.4, 1.0]` (high contrast active state normalizing to 1.0)
  - `y`: `["100%", "0%"]` for $index > 0$, `0%` for $index == 0$
  - `dimOpacity`: `[0, 0.35]` ambient darkening as card moves into background depth
- [ ] Ensure correct `zIndex: index + 1` so subsequent active images stack directly over top of previous receded layers.

## Task 2: Refactor Physics & Wheel/Touch Controls in ImageReveal
- [ ] Update `useSpring` parameters: `stiffness: 70`, `damping: 28`, `mass: 1.2` for slow, luxurious inertia.
- [ ] Update wheel hook delta calculation with default sensitivity `1200`.
- [ ] Add touch interaction support (`touchstart`, `touchmove`) for mobile devices.
- [ ] Ensure smooth exit/entry prompt fading.

## Task 3: Build Verification & Code Quality
- [ ] Run `pnpm --filter @adgrid/ui build` or workspace build to verify zero TS/bundling errors.
- [ ] Verify exports in `packages/ui/src/animated/ImageReveal.tsx` and registry.
