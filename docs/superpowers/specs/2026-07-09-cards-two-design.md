# Design Spec: CardsTwo — Fully Configurable 3D Circular Card Carousel

**Date**: 2026-07-09  
**Status**: Proposed

---

## 1. Goal Description
Build a production-quality, premium React component named **CardsTwo** that arranges cards around an invisible 3D circular ring (cylinder), creating the visual effect of cards orbiting a central axis in 3D space. 

Inspired by spatial interfaces like Apple Vision Pro, Framer, and Linear, this component should feel physically believable, heavy, and extremely smooth. It must support complete configuration of rotation axis, radius, gap (angular spacing), sizing, perspective, lighting/brightness, snapping, momentum dragging, mouse wheel scroll-rotation, reflections, and depth blur.

Additionally, to act as a generic 3D layout engine, it will expose a card transform callback:
```typescript
getCardTransform?: (index: number, progress: number) => {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  brightness?: number;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
}
```
This enables developers to build custom helical, spiral, stacked, or elliptical structures easily.

---

## 2. Requirements & Constraints
- **Framework**: Next.js 16 + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4, dark-first premium aesthetics.
- **Animation**: Framer Motion (`framer-motion`), standard CSS 3D transforms. **No Three.js**.
- **Performance**: Maintain 60fps even with 100+ cards using GPU acceleration (`transform`, `opacity`, `filter`, `will-change`), minimizing layout thrashing.
- **Accessibility**: Keyboard navigation (Arrow keys, Home, End, Tab), ARIA roles, and support for reduced motion.

---

## 3. Mathematical Model & Coordinates

Let $N$ be the number of cards.  
Let $R$ be the radius of the cylinder in pixels.  
Let $W_{\text{card}}$ be the width of each card in pixels.

### A. Angular Distribution
Instead of a simple division of $360^\circ$, spacing should take the card width and a configurable `gap` (in pixels) into account:
1. The angular size of a card is approximately $\theta_{\text{card}} = 2 \arcsin\left(\frac{W_{\text{card}}}{2R}\right)$ radians.
2. The angular size of the gap is approximately $\theta_{\text{gap}} = \frac{\text{gap}}{R}$ radians.
3. Therefore, the angular step between cards is:
   $$\theta_{\text{step}} = \theta_{\text{card}} + \theta_{\text{gap}}$$
4. The static angle of card $i$ is:
   $$\theta_i = i \times \theta_{\text{step}}$$

If a custom `visibleArc` is specified (e.g., $180^\circ$ or $\pi$ radians), we can distribute the cards evenly within that arc:
$$\theta_{\text{step}} = \frac{\text{visibleArc}}{N - 1}$$
$$\theta_i = -\frac{\text{visibleArc}}{2} + i \times \theta_{\text{step}}$$

### B. Rotated Orbit Position
Let $\phi$ be the active rotation angle of the cylinder (driven by drag, scroll, auto-rotation).  
The relative angle of card $i$ from the front/center camera axis is:
$$\alpha_i = \theta_i + \phi$$

We calculate the 3D translation of card $i$ on the cylinder:
- **For `rotationAxis === "y"` (horizontal ring)**:
  $$X_i = R \sin(\alpha_i)$$
  $$Y_i = 0$$
  $$Z_i = R (\cos(\alpha_i) - 1) - \text{depth}$$
- **For `rotationAxis === "x"` (vertical ring)**:
  $$X_i = 0$$
  $$Y_i = R \sin(\alpha_i)$$
  $$Z_i = R (\cos(\alpha_i) - 1) - \text{depth}$$
- **For `rotationAxis === "z"` (flat clock-like rotation)**:
  $$X_i = R \cos(\alpha_i)$$
  $$Y_i = R \sin(\alpha_i)$$
  $$Z_i = -\text{depth}$$

### C. Normalized Offset (`progress`)
The relative angle $\alpha_i$ is normalized to the range $[-\pi, \pi]$ to support continuous cylinder wrapping:
$$\alpha_{i,\text{normalized}} = ((\alpha_i + \pi) \pmod{2\pi}) - \pi$$

The normalized offset of card $i$ from the center front position is:
$$\text{progress}_i = \frac{\alpha_{i,\text{normalized}}}{\theta_{\text{step}}}$$
- $\text{progress}_i = 0$ means the card is active and centered at the front.
- $\text{progress}_i > 0$ means the card is to the right/clockwise.
- $\text{progress}_i < 0$ means the card is to the left/counter-clockwise.

---

## 4. Visual Layout & Styling Parameters

1. **Facing the Camera**:
   - If `faceCamera` is true, the card does not rotate relative to its position on the circle, remaining parallel to the screen. For `rotationAxis === "y"`, this means applying `rotateY(0)`.
   - If `faceCamera` is false, the card preserves Y-axis world rotation: `rotateY(-\alpha_i \times \frac{180}{\pi})`.

2. **Z-Index Dynamics**:
   - Set dynamically based on the card's depth $Z_i$:
     $$\text{zIndex} = \text{Math.round}(Z_i + 10000)$$

3. **Active vs. Side Card Styles**:
   - Scale, opacity, brightness, and blur are calculated based on $\alpha_i$ (or $\text{progress}_i$):
     - **Scale**: $S_i = \text{sideScale} + (\text{activeScale} - \text{sideScale}) \cdot \exp(-k \cdot \text{progress}_i^2)$
     - **Opacity**: $O_i = \text{sideOpacity} + (\text{activeOpacity} - \text{sideOpacity}) \cdot \exp(-k \cdot \text{progress}_i^2)$
     - **Brightness**: $B_i = \text{sideBrightness} + (\text{activeBrightness} - \text{sideBrightness}) \cdot \frac{1 + \cos(\alpha_i)}{2}$
     - **Depth Blur**: If `depthBlur` is true, the blur filter is:
       $$\text{blur}_i = (1 - \frac{1 + \cos(\alpha_i)}{2}) \cdot \text{blurStrength}\text{ px}$$

4. **Back Cards Visibility**:
   - If `hideBackCards` is true and $\cos(\alpha_i) < 0$, card opacity is set to $0$.
   - Otherwise, if $\cos(\alpha_i) < 0$, opacity scales down to `backOpacity`.

5. **Reflection**:
   - If `reflection` is true, apply a mirrored card version directly underneath with a gradient mask (`mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15))`).

---

## 5. API & Types

```typescript
import { ReactNode } from "react";

export interface Card {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  background?: string; // Solid or gradient class
  href?: string;
  content?: ReactNode; // Rich content custom layout
  badge?: string;
  icon?: ReactNode;
}

export interface CardsTwoProps {
  cards: Card[];
  radius?: number; // default: 500
  gap?: number; // default: 20px (converted to angular gap)
  cardWidth?: number; // default: 300
  cardHeight?: number; // default: 400
  
  // Rotation system
  rotationAxis?: "x" | "y" | "z"; // default: "y"
  rotationDirection?: "clockwise" | "counter-clockwise"; // default: "counter-clockwise"
  rotationSpeed?: number; // auto-rotate speed: degrees per second. default: 5
  initialRotation?: number; // default: 0
  rotationOffset?: number; // constant angular offset. default: 0
  
  // Interactions
  autoRotate?: boolean; // default: false
  pauseOnHover?: boolean; // default: true
  draggable?: boolean; // default: true
  scrollRotate?: boolean; // default: false
  snap?: boolean; // default: true
  
  // 3D parameters
  perspective?: number; // default: 1200
  depth?: number; // default: 0 (z-depth offset)
  height?: number; // cylinder height adjustment (useful for X axis)
  visibleArc?: number; // angle in degrees (e.g. 180, 360). default: 360
  cameraDistance?: number; // default: 0
  cameraFov?: number; // default: 60
  
  // Focusing & Styling
  activeScale?: number; // default: 1.1
  activeOpacity?: number; // default: 1.0
  activeBrightness?: number; // default: 1.0
  
  sideScale?: number; // default: 0.8
  sideOpacity?: number; // default: 0.6
  sideBrightness?: number; // default: 0.7
  
  backOpacity?: number; // default: 0.2
  hideBackCards?: boolean; // default: false
  shadowIntensity?: number; // default: 0.5
  depthBlur?: boolean; // default: false
  blurStrength?: number; // default: 8
  reflection?: boolean; // default: false
  
  // Individual Card rotation & tilt
  faceCamera?: boolean; // default: true
  tiltX?: number; // default: 0
  tiltY?: number; // default: 0
  tiltZ?: number; // default: 0
  
  // Hooks / Advanced Extensions
  getCardTransform?: (
    index: number,
    progress: number
  ) => {
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
    opacity?: number;
    blur?: number;
    brightness?: number;
    translateX?: number;
    translateY?: number;
    translateZ?: number;
  };
  
  renderCard?: (card: Card, isActive: boolean) => ReactNode;
  background?: "solid" | "gradient" | "transparent" | "noise" | "grid"; // default: "transparent"
  className?: string;
}

export interface CardsTwoRef {
  next: () => void;
  previous: () => void;
  rotateTo: (index: number) => void;
  rotateBy: (angleDegrees: number) => void;
  reset: () => void;
  pause: () => void;
  play: () => void;
  getActiveIndex: () => number;
}
```

---

## 6. Directory Structure

The files will live in a modular structure:
`packages/ui/src/animated/CardsTwo/`
- `types.ts`: Shared props and card type interfaces.
- `hooks/useRotation.ts`: Manages dragging, wheel scrolling, snapping, and auto-rotation.
- `hooks/useCylinder.ts`: Calculates spacing, distribution angles, and 3D positioning.
- `hooks/useCardTransforms.ts`: Computes styles (translate3d, scale, opacity, filters) for each card using motion values.
- `hooks/useCardsTwo.ts`: Internal control controller matching `CardsTwoRef`.
- `CardsTwo.tsx`: Parent container binding hooks, rendering layout, reflection, background patterns.
- `index.ts`: Public API export file.

---

## 7. Interaction Physics & Drag Logic

We can implement dragging using a continuous Framer Motion `MotionValue` representing the current cylinder rotation angle in radians: `rotationAngle`.

1. **Velocity and Momentum**:
   - When the user drags, we track the drag delta $\Delta x$.
   - The delta is translated to an angular delta: $\Delta \phi = \frac{\Delta x}{R}$ radians.
   - On drag release, we use the gesture's velocity to let it spin with a high-friction decay.
2. **Snapping**:
   - When snapping is enabled, we determine the nearest card angle on drag end.
   - We target that angle and animate toward it using a spring transition.
   - Target index: $$\text{targetIndex} = \text{Math.round}\left(-\frac{\phi}{\theta_{\text{step}}}\right)$$
   - Snapped angle: $$\phi_{\text{snap}} = -\text{targetIndex} \times \theta_{\text{step}}$$
3. **Scroll Wheel**:
   - Wheel scroll adds an angular delta: $\Delta \phi = \text{deltaY} \times 0.001$ radians.
   - It updates the target rotation angle, triggering a smooth spring transition.

---

## 8. Accessibility Plan
- **Keyboard Navigation**:
  - `ArrowLeft` / `ArrowRight`: Rotates the cylinder by one card step ($\theta_{\text{step}}$).
  - `Home`: Rotates to index 0.
  - `End`: Rotates to index $N - 1$.
- **ARIA Elements**:
  - Main container has `role="region"` and `aria-label="3D Card Carousel"`.
  - Cards have `role="group"` and `aria-roledescription="card"` with `aria-label`.
- **Reduced Motion Support**:
  - If `window.matchMedia('(prefers-reduced-motion: reduce)')` is active, spring stiffness is reduced or animation is simplified to immediate state changes.
