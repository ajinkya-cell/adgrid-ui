# Design Spec: 3D Receding Tunnel Image Scroll Animation

**Date**: 2026-08-07  
**Target Component**: [`ImageReveal.tsx`](../../packages/ui/src/animated/ImageReveal.tsx)

---

## 1. Goal & Requirements
Revamp the scroll animation in `ImageReveal` so that images transition smoothly with depth:
1. **Initial Active Image State**: Enters boosted in contrast and brightness with a slightly enlarged scale.
2. **Scroll Receding Effect**: As scrolling proceeds, the active image scales down into the screen depth (`scale` ~ `1.15` -> `0.88`) while its brightness and contrast filter smoothly return to 1.0 (original colors/settings).
3. **Overlapping Stack Layering**: As the active image shrinks back, the next image glides smoothly directly ON TOP of it (higher z-index).
4. **Cinematic Smoothness**: Slow, fluid spring physics (`stiffness: 70`, `damping: 28`) and sensitive wheel handling so scrolling feels polished and controlled.

---

## 2. Architecture & Motion Transforms

### 2.1 Per-Image Window Math
For total images $N$, each image index $i \in [0, N-1]$ occupies progress interval $[start, end]$:
- $start = i / N$
- $end = (i + 1) / N$
- $peak = start + (end - start) \times 0.25$

### 2.2 Transform Mappings for Layer $i$
- **Scale**:
  - `progress`: $[start, peak, end]$ $\rightarrow$ `scale`: $[1.15, 1.08, 0.88]$
- **Brightness Filter**:
  - `progress`: $[start, peak, end]$ $\rightarrow$ `brightness`: $[2.4, 2.0, 1.0]$
- **Contrast Filter**:
  - `progress`: $[start, peak, end]$ $\rightarrow$ `contrast`: $[1.6, 1.4, 1.0]$
- **Filter String**: `brightness(${b}) contrast(${c})`
- **Vertical Slide Y**:
  - For $i=0$, $y=0\%$.
  - For $i > 0$, $y$: $[start, peak]$ $\rightarrow$ `["100%", "0%"]`
- **Z-Index**: `index + 1` (guarantees next image renders over top of previous receded images).
- **Receding Dimming Overlay**:
  - `opacity`: $[peak, end]$ $\rightarrow$ $[0, 0.35]$ subtle dark backdrop vignette overlay.

---

## 3. Interaction & Smoothness Control

### 3.1 Spring Physics
- Use `useSpring` on `rawProgress` with parameters:
  - `stiffness`: 70
  - `damping`: 28
  - `mass`: 1.2
- Gives weight and slow, luxurious inertia to wheel scrolls.

### 3.2 Wheel & Touch Handlers
- `sensitivity`: 1200 (customizable prop) for smooth wheel delta scaling.
- Touch start / movement delta tracking for touch devices.

---

## 4. Testing & Verification
- Verify in `apps/docs` live preview or dev server that scrolling down:
  1. Image begins bright & large.
  2. As wheel turns, image recedes back into the container frame and normalizes brightness/contrast.
  3. Next image slides smoothly over top.
  4. Build check `npm run build` / `pnpm build` succeeds with zero errors.
