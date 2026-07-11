# Implementation Plan: CardsTwo 3D Circular Card Carousel

This document outlines the step-by-step technical plan to implement **CardsTwo** — a premium, physics-driven 3D circular card carousel component in `@adgrid-ui/ui` using React, TypeScript, Framer Motion, and Tailwind CSS v4.

---

## Architecture Overview

To achieve 60fps animations with 100+ cards, we avoid React re-renders for positional animations. Instead, we use Framer Motion `MotionValue`s to drive the 3D transforms. The geometry and layout computations are split into modular hooks.

```
[CardsTwo Container Component]
  ├── useRotation (Manages drag/momentum physics, scroll-wheel, autoplay)
  │     └── returns targetAngle (MotionValue), isDragging, togglePlay()
  ├── useCylinder (Computes spacing and angular layout)
  │     └── returns cardAngles array, angularSpacing
  ├── useCardTransforms (Calculates scale, translation, opacity, blur, brightness per card)
  │     └── returns transform styles driven by currentAngle (MotionValue)
  └── useCardsTwo (Exposes CardsTwoRef controls via imperative handle)
```

---

## Phase 1: Core Types & Exports (2 files)

### 1. Create `packages/ui/src/animated/CardsTwo/types.ts`
Define interfaces for the component props, card data structure, and the imperative ref handle:

```typescript
import { ReactNode } from "react";

export interface Card {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  background?: string;
  href?: string;
  content?: ReactNode;
  badge?: string;
  icon?: ReactNode;
}

export interface CardsTwoProps {
  cards: Card[];
  radius?: number;
  gap?: number;
  cardWidth?: number;
  cardHeight?: number;
  rotationAxis?: "x" | "y" | "z";
  rotationDirection?: "clockwise" | "counter-clockwise";
  rotationSpeed?: number;
  initialRotation?: number;
  rotationOffset?: number;
  autoRotate?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  scrollRotate?: boolean;
  snap?: boolean;
  perspective?: number;
  depth?: number;
  height?: number;
  visibleArc?: number;
  cameraDistance?: number;
  cameraFov?: number;
  activeScale?: number;
  activeOpacity?: number;
  activeBrightness?: number;
  sideScale?: number;
  sideOpacity?: number;
  sideBrightness?: number;
  backOpacity?: number;
  hideBackCards?: boolean;
  shadowIntensity?: number;
  depthBlur?: boolean;
  blurStrength?: number;
  reflection?: boolean;
  faceCamera?: boolean;
  tiltX?: number;
  tiltY?: number;
  tiltZ?: number;
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
  background?: "solid" | "gradient" | "transparent" | "noise" | "grid";
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

### 2. Create `packages/ui/src/animated/CardsTwo/index.ts`
Standard export file for clean imports:
```typescript
export { CardsTwo } from "./CardsTwo";
export type { CardsTwoProps, CardsTwoRef, Card } from "./types";
```

---

## Phase 2: Spacing & Geometric Engine (1 file)

### Create `packages/ui/src/animated/CardsTwo/hooks/useCylinder.ts`
Computes the angular layout for the cards:
- Converts a pixel-based gap to an angular gap: $\theta_{\text{gap}} = \frac{\text{gap}}{R}$.
- If `visibleArc` is $360^\circ$:
  - Cards are spaced evenly: $\theta_{\text{step}} = \frac{2\pi}{N}$.
  - Angular offsets are computed.
- If `visibleArc` is $< 360^\circ$:
  - Spans the visible arc: $\theta_{\text{step}} = \frac{\text{visibleArcDegrees} \times \pi / 180}{N - 1}$.
  - The start angle is: $-\frac{\text{visibleArcRadians}}{2}$.

```typescript
import { useMemo } from "react";

export function useCylinder(
  cardCount: number,
  radius: number,
  cardWidth: number,
  gap: number,
  visibleArcDegrees: number
) {
  return useMemo(() => {
    const visibleArcRadians = (visibleArcDegrees * Math.PI) / 180;
    let angularSpacing = 0;
    const cardAngles: number[] = [];

    if (visibleArcDegrees === 360) {
      // Calculate angular spacing using card size and gap in pixels
      const cardAngle = 2 * Math.asin(cardWidth / (2 * radius));
      const gapAngle = gap / radius;
      angularSpacing = cardAngle + gapAngle;

      for (let i = 0; i < cardCount; i++) {
        cardAngles.push(i * angularSpacing);
      }
    } else {
      // Spread cards evenly across the partial arc
      angularSpacing = cardCount > 1 ? visibleArcRadians / (cardCount - 1) : 0;
      const startAngle = -visibleArcRadians / 2;

      for (let i = 0; i < cardCount; i++) {
        cardAngles.push(startAngle + i * angularSpacing);
      }
    }

    return { cardAngles, angularSpacing };
  }, [cardCount, radius, cardWidth, gap, visibleArcDegrees]);
}
```

---

## Phase 3: Physics, Drag & Scroll Handlers (1 file)

### Create `packages/ui/src/animated/CardsTwo/hooks/useRotation.ts`
Manages auto-rotation, gestures, momentum, friction decay, snapping, and scroll-wheel:
1. Maintains a Framer Motion `targetAngle` and applies `useSpring` to derive `currentAngle`.
2. Handles continuous auto-rotation via `useAnimationFrame` from `framer-motion`.
3. Sets up drag pointer listeners:
   - Maps horizontal delta ($x$) or vertical delta ($y$) to angular changes: $\Delta\phi = \frac{\Delta x}{R}$.
   - Evaluates flick velocity at drag release: calculates projected angular rotation with friction:
     $$\phi_{\text{projected}} = \phi_{\text{current}} + \omega \times \text{decayFactor}$$
   - Snaps to the closest card step.
4. Listens for wheel events and adds scrolling torque to `targetAngle`.

```typescript
import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useAnimationFrame, PanInfo } from "framer-motion";

interface UseRotationParams {
  cardCount: number;
  angularSpacing: number;
  radius: number;
  rotationAxis: "x" | "y" | "z";
  rotationDirection: "clockwise" | "counter-clockwise";
  rotationSpeed: number; // degrees per second
  initialRotation: number; // degrees
  autoRotate: boolean;
  pauseOnHover: boolean;
  draggable: boolean;
  scrollRotate: boolean;
  snap: boolean;
}

export function useRotation({
  cardCount,
  angularSpacing,
  radius,
  rotationAxis,
  rotationDirection,
  rotationSpeed,
  initialRotation,
  autoRotate,
  pauseOnHover,
  draggable,
  scrollRotate,
  snap,
}: UseRotationParams) {
  const initialAngleRad = (initialRotation * Math.PI) / 180;
  const targetAngle = useMotionValue(initialAngleRad);
  const currentAngle = useSpring(targetAngle, {
    stiffness: 120,
    damping: 20,
    mass: 0.9,
    restDelta: 0.0001,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const isHoveredRef = useRef(false);

  // Speed in radians per frame
  const speedDirection = rotationDirection === "clockwise" ? 1 : -1;
  const speedRadPerSec = (rotationSpeed * Math.PI) / 180;

  // Auto-rotation loop
  useAnimationFrame((time, delta) => {
    if (!isPlaying) return;
    if (pauseOnHover && isHoveredRef.current) return;
    if (isDragging) return;

    const deltaSec = delta / 1000;
    const currentVal = targetAngle.get();
    targetAngle.set(currentVal + speedRadPerSec * speedDirection * deltaSec);
  });

  // Snap calculation helper
  const getSnappedAngle = (angle: number) => {
    const rawIndex = -angle / angularSpacing;
    const snappedIndex = Math.round(rawIndex);
    return -snappedIndex * angularSpacing;
  };

  // Drag Gesture Handlers
  const dragStartRef = useRef(0);
  const handleDragStart = () => {
    setIsDragging(true);
    dragStartRef.current = targetAngle.get();
  };

  const handleDrag = (info: PanInfo) => {
    const deltaPx = rotationAxis === "y" ? info.offset.x : -info.offset.y;
    // Map screen movement to angular displacement
    const deltaAngle = deltaPx / radius;
    targetAngle.set(dragStartRef.current + deltaAngle);
  };

  const handleDragEnd = (info: PanInfo) => {
    setIsDragging(false);

    const velocityPx = rotationAxis === "y" ? info.velocity.x : -info.velocity.y;
    const angularVelocity = velocityPx / radius;

    // Physics momentum decay projection
    const decayFactor = 0.18; // Seconds of decay
    const projectedAngle = targetAngle.get() + angularVelocity * decayFactor;

    if (snap) {
      const snappedAngle = getSnappedAngle(projectedAngle);
      targetAngle.set(snappedAngle);
    } else {
      targetAngle.set(projectedAngle);
    }
  };

  return {
    targetAngle,
    currentAngle,
    isDragging,
    isPlaying,
    setIsPlaying,
    isHoveredRef,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    getSnappedAngle,
  };
}
```

---

## Phase 4: GPU 3D Transforms Engine (1 file)

### Create `packages/ui/src/animated/CardsTwo/hooks/useCardTransforms.ts`
Transforms each card around the circular ring in 3D space:
- Reads the static angle of the card ($\theta_i$) and the cylinder's active rotation angle ($\phi$).
- Calculates relative displacement: $\alpha_i = \theta_i + \phi$.
- Calculates depth coordinates to assign correct `zIndex` dynamically.
- Interpolates scale, opacity, blur, and lighting brightness using exponential falloff curves.
- Applies standard card tilts and supports custom callbacks.

```typescript
import { useTransform, MotionValue } from "framer-motion";
import { Card } from "../types";

interface UseCardTransformsParams {
  index: number;
  cardAngle: number;
  currentAngle: MotionValue<number>;
  radius: number;
  depth: number;
  rotationAxis: "x" | "y" | "z";
  faceCamera: boolean;
  activeScale: number;
  activeOpacity: number;
  activeBrightness: number;
  sideScale: number;
  sideOpacity: number;
  sideBrightness: number;
  backOpacity: number;
  hideBackCards: boolean;
  depthBlur: boolean;
  blurStrength: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  getCardTransform?: any;
}

export function useCardTransforms({
  index,
  cardAngle,
  currentAngle,
  radius,
  depth,
  rotationAxis,
  faceCamera,
  activeScale,
  activeOpacity,
  activeBrightness,
  sideScale,
  sideOpacity,
  sideBrightness,
  backOpacity,
  hideBackCards,
  depthBlur,
  blurStrength,
  tiltX,
  tiltY,
  tiltZ,
  getCardTransform,
}: UseCardTransformsParams) {
  // Translate the current angle of rotation to style properties
  return useTransform(currentAngle, (ang) => {
    // Relative angle of the card from the front (radians)
    const alpha = cardAngle + ang;

    // Normalize angle to [-PI, PI] to handle continuous wrapping
    let relativeAngle = alpha % (2 * Math.PI);
    if (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    if (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    // Progress is the number of card steps offset from the center front
    const progress = angularSpacing > 0 ? relativeAngle / angularSpacing : 0;
    const cosVal = Math.cos(relativeAngle); // 1 at front, -1 at back

    // 1. Coordinates Calculation
    let x = 0;
    let y = 0;
    let z = radius * (cosVal - 1) - depth;

    if (rotationAxis === "y") {
      x = radius * Math.sin(relativeAngle);
    } else if (rotationAxis === "x") {
      y = radius * Math.sin(relativeAngle);
    } else if (rotationAxis === "z") {
      x = radius * Math.sin(relativeAngle);
      y = radius * Math.cos(relativeAngle);
      z = -depth;
    }

    // 2. Base rotations
    let rotX = tiltX;
    let rotY = tiltY;
    let rotZ = tiltZ;

    if (!faceCamera) {
      const angleDegrees = -(alpha * 180) / Math.PI;
      if (rotationAxis === "y") {
        rotY += angleDegrees;
      } else if (rotationAxis === "x") {
        rotX += angleDegrees;
      } else if (rotationAxis === "z") {
        rotZ += angleDegrees;
      }
    }

    // 3. Scale, Opacity, Brightness calculations (falloff based on proximity)
    const normalizedDistance = Math.min(1, Math.abs(progress)); // 0 to 1
    const factor = Math.exp(-Math.pow(progress * 1.5, 2)); // Bell-curve fallback

    let scale = sideScale + (activeScale - sideScale) * factor;
    let opacity = sideOpacity + (activeOpacity - sideOpacity) * factor;
    let brightness = sideBrightness + (activeBrightness - sideBrightness) * factor;
    let blurVal = 0;

    // Back card visibility adjustments
    if (cosVal < 0) {
      if (hideBackCards) {
        opacity = 0;
      } else {
        opacity = Math.min(opacity, backOpacity);
      }
    }

    // Depth Blur
    if (depthBlur) {
      blurVal = (1 - (1 + cosVal) / 2) * blurStrength;
    }

    // 4. Custom developer transforms hook (override engine)
    if (getCardTransform) {
      const custom = getCardTransform(index, progress);
      if (custom.rotateX !== undefined) rotX = custom.rotateX;
      if (custom.rotateY !== undefined) rotY = custom.rotateY;
      if (custom.rotateZ !== undefined) rotZ = custom.rotateZ;
      if (custom.scale !== undefined) scale = custom.scale;
      if (custom.opacity !== undefined) opacity = custom.opacity;
      if (custom.blur !== undefined) blurVal = custom.blur;
      if (custom.brightness !== undefined) brightness = custom.brightness;
      if (custom.translateX !== undefined) x = custom.translateX;
      if (custom.translateY !== undefined) y = custom.translateY;
      if (custom.translateZ !== undefined) z = custom.translateZ;
    }

    // Dynamic Z-Index Mapping
    const zIndex = Math.round(z + 10000);

    // Build standard high-performance hardware-accelerated style values
    const transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;

    const filter = [
      blurVal > 0 ? `blur(${blurVal}px)` : "",
      brightness !== 1 ? `brightness(${brightness})` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      transform,
      zIndex,
      opacity,
      filter: filter || "none",
    };
  });
}
```

---

## Phase 5: Component Ref & Imperative Handle (1 file)

### Create `packages/ui/src/animated/CardsTwo/hooks/useCardsTwo.ts`
Attaches API methods to the `ref` handle so parents can programmatically navigate:

```typescript
import { Ref, useImperativeHandle } from "react";
import { MotionValue } from "framer-motion";
import { CardsTwoRef } from "../types";

interface UseCardsTwoRefParams {
  ref: Ref<CardsTwoRef> | undefined;
  targetAngle: MotionValue<number>;
  angularSpacing: number;
  cardCount: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  getSnappedAngle: (angle: number) => number;
}

export function useCardsTwoRef({
  ref,
  targetAngle,
  angularSpacing,
  cardCount,
  isPlaying,
  setIsPlaying,
  getSnappedAngle,
}: UseCardsTwoRefParams) {
  useImperativeHandle(ref, () => ({
    next: () => {
      const current = targetAngle.get();
      targetAngle.set(current - angularSpacing);
    },
    previous: () => {
      const current = targetAngle.get();
      targetAngle.set(current + angularSpacing);
    },
    rotateTo: (index: number) => {
      const boundedIndex = Math.max(0, Math.min(cardCount - 1, index));
      targetAngle.set(-boundedIndex * angularSpacing);
    },
    rotateBy: (angleDegrees: number) => {
      const angleRad = (angleDegrees * Math.PI) / 180;
      targetAngle.set(targetAngle.get() + angleRad);
    },
    reset: () => {
      targetAngle.set(0);
    },
    pause: () => {
      setIsPlaying(false);
    },
    play: () => {
      setIsPlaying(true);
    },
    getActiveIndex: () => {
      const current = targetAngle.get();
      const rawIndex = -current / angularSpacing;
      return Math.max(0, Math.min(cardCount - 1, Math.round(rawIndex)));
    },
  }));
}
```

---

## Phase 6: Assembly & Rendering (1 file)

### Create `packages/ui/src/animated/CardsTwo/CardsTwo.tsx`
Orchestrates hooks and renders the DOM structure:
- Applies perspective styles to the container.
- Handles standard grid, noise, or solid backgrounds.
- Mounts drag mouse/touch listeners.
- Builds reflection layers beneath the cards.
- Handles keyboard events (`ArrowLeft`, `ArrowRight`, `Home`, `End`).

```typescript
import React, { forwardRef, useEffect } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { CardsTwoProps, CardsTwoRef } from "./types";
import { useCylinder } from "./hooks/useCylinder";
import { useRotation } from "./hooks/useRotation";
import { useCardTransforms } from "./hooks/useCardTransforms";
import { useCardsTwoRef } from "./hooks/useCardsTwo";
import { cn } from "../../lib/utils";

export const CardsTwo = forwardRef<CardsTwoRef, CardsTwoProps>(
  (
    {
      cards,
      radius = 500,
      gap = 20,
      cardWidth = 300,
      cardHeight = 400,
      rotationAxis = "y",
      rotationDirection = "counter-clockwise",
      rotationSpeed = 5,
      initialRotation = 0,
      rotationOffset = 0,
      autoRotate = false,
      pauseOnHover = true,
      draggable = true,
      scrollRotate = false,
      snap = true,
      perspective = 1200,
      depth = 0,
      height,
      visibleArc = 360,
      cameraDistance = 0,
      cameraFov = 60,
      activeScale = 1.1,
      activeOpacity = 1.0,
      activeBrightness = 1.0,
      sideScale = 0.8,
      sideOpacity = 0.6,
      sideBrightness = 0.7,
      backOpacity = 0.2,
      hideBackCards = false,
      shadowIntensity = 0.5,
      depthBlur = false,
      blurStrength = 8,
      reflection = false,
      faceCamera = true,
      tiltX = 0,
      tiltY = 0,
      tiltZ = 0,
      getCardTransform,
      renderCard,
      background = "transparent",
      className,
    },
    ref
  ) => {
    const { cardAngles, angularSpacing } = useCylinder(
      cards.length,
      radius,
      cardWidth,
      gap,
      visibleArc
    );

    const rotationState = useRotation({
      cardCount: cards.length,
      angularSpacing,
      radius,
      rotationAxis,
      rotationDirection,
      rotationSpeed,
      initialRotation,
      autoRotate,
      pauseOnHover,
      draggable,
      scrollRotate,
      snap,
    });

    useCardsTwoRef({
      ref,
      targetAngle: rotationState.targetAngle,
      angularSpacing,
      cardCount: cards.length,
      isPlaying: rotationState.isPlaying,
      setIsPlaying: rotationState.setIsPlaying,
      getSnappedAngle: rotationState.getSnappedAngle,
    });

    // Keyboard handlers
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        rotationState.targetAngle.set(rotationState.targetAngle.get() - angularSpacing);
      } else if (e.key === "ArrowLeft") {
        rotationState.targetAngle.set(rotationState.targetAngle.get() + angularSpacing);
      } else if (e.key === "Home") {
        rotationState.targetAngle.set(0);
      } else if (e.key === "End") {
        rotationState.targetAngle.set(-(cards.length - 1) * angularSpacing);
      }
    };

    // Scroll Wheel Wheel handler
    useEffect(() => {
      if (!scrollRotate) return;
      const el = document.getElementById("cards-two-container");
      if (!el) return;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * 0.001; // Scale factor
        rotationState.targetAngle.set(rotationState.targetAngle.get() - delta);
      };

      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }, [scrollRotate, rotationState.targetAngle]);

    return (
      <div
        id="cards-two-container"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          rotationState.isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          rotationState.isHoveredRef.current = false;
        }}
        className={cn(
          "relative flex items-center justify-center overflow-hidden w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl",
          background === "solid" && "bg-neutral-950",
          background === "gradient" && "bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900",
          className
        )}
        style={{
          perspective: `${perspective}px`,
          height: height || `${cardHeight * 1.5}px`,
        }}
      >
        {/* Visual Background Grids */}
        {background === "grid" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        )}
        {background === "noise" && (
          <div className="absolute inset-0 opacity-[0.015] bg-[url('/noise.svg')] pointer-events-none" />
        )}

        {/* 3D Ring Stage Wrapper */}
        <motion.div
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing preserve-3d"
          drag={draggable ? (rotationAxis === "y" ? "x" : "y") : false}
          onDragStart={rotationState.handleDragStart}
          onDrag={(e, info) => rotationState.handleDrag(info)}
          onDragEnd={(e, info) => rotationState.handleDragEnd(info)}
          style={{
            transformStyle: "preserve-3d",
            // Camera position
            transform: `translateZ(${cameraDistance}px)`,
          }}
        >
          {cards.map((card, idx) => (
            <CardItem
              key={card.id}
              card={card}
              index={idx}
              cardAngle={cardAngles[idx]}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              radius={radius}
              depth={depth}
              rotationAxis={rotationAxis}
              faceCamera={faceCamera}
              activeScale={activeScale}
              activeOpacity={activeOpacity}
              activeBrightness={activeBrightness}
              sideScale={sideScale}
              sideOpacity={sideOpacity}
              sideBrightness={sideBrightness}
              backOpacity={backOpacity}
              hideBackCards={hideBackCards}
              depthBlur={depthBlur}
              blurStrength={blurStrength}
              shadowIntensity={shadowIntensity}
              reflection={reflection}
              tiltX={tiltX}
              tiltY={tiltY}
              tiltZ={tiltZ}
              currentAngle={rotationState.currentAngle}
              getCardTransform={getCardTransform}
              renderCard={renderCard}
            />
          ))}
        </motion.div>
      </div>
    );
  }
);

CardsTwo.displayName = "CardsTwo";

// Internal Card Component for performance Isolation
interface CardItemProps {
  card: any;
  index: number;
  cardAngle: number;
  cardWidth: number;
  cardHeight: number;
  radius: number;
  depth: number;
  rotationAxis: "x" | "y" | "z";
  faceCamera: boolean;
  activeScale: number;
  activeOpacity: number;
  activeBrightness: number;
  sideScale: number;
  sideOpacity: number;
  sideBrightness: number;
  backOpacity: number;
  hideBackCards: boolean;
  depthBlur: boolean;
  blurStrength: number;
  shadowIntensity: number;
  reflection: boolean;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  currentAngle: any;
  getCardTransform: any;
  renderCard: any;
}

const CardItem = ({
  card,
  index,
  cardAngle,
  cardWidth,
  cardHeight,
  radius,
  depth,
  rotationAxis,
  faceCamera,
  activeScale,
  activeOpacity,
  activeBrightness,
  sideScale,
  sideOpacity,
  sideBrightness,
  backOpacity,
  hideBackCards,
  depthBlur,
  blurStrength,
  shadowIntensity,
  reflection,
  tiltX,
  tiltY,
  tiltZ,
  currentAngle,
  getCardTransform,
  renderCard,
}: CardItemProps) => {
  const styles = useCardTransforms({
    index,
    cardAngle,
    currentAngle,
    radius,
    depth,
    rotationAxis,
    faceCamera,
    activeScale,
    activeOpacity,
    activeBrightness,
    sideScale,
    sideOpacity,
    sideBrightness,
    backOpacity,
    hideBackCards,
    depthBlur,
    blurStrength,
    tiltX,
    tiltY,
    tiltZ,
    getCardTransform,
  });

  return (
    <motion.div
      className="absolute preserve-3d will-change-transform"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: useTransform(styles, (s) => s.transform),
        zIndex: useTransform(styles, (s) => s.zIndex),
        opacity: useTransform(styles, (s) => s.opacity),
        filter: useTransform(styles, (s) => s.filter),
      }}
    >
      {/* 3D Shadows */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-shadow duration-300"
        style={{
          boxShadow: `0 30px 60px -15px rgba(0,0,0,${shadowIntensity * 0.7})`,
        }}
      />

      {/* Main card body wrapper */}
      <div className="w-full h-full rounded-2xl overflow-hidden border border-neutral-800/40 bg-neutral-900/90 text-neutral-200">
        {renderCard ? (
          renderCard(card, false)
        ) : (
          <div
            className={cn(
              "relative flex flex-col justify-end w-full h-full p-6 bg-cover bg-center",
              card.background || "bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent"
            )}
            style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
          >
            {card.badge && (
              <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase border border-neutral-700 bg-neutral-950/70 text-neutral-300 rounded-full">
                {card.badge}
              </span>
            )}
            <div className="space-y-1 z-10">
              {card.icon && <div className="text-primary w-6 h-6 mb-2">{card.icon}</div>}
              <h3 className="text-xl font-bold tracking-tight text-white">{card.title}</h3>
              {card.subtitle && <p className="text-xs font-medium text-neutral-400">{card.subtitle}</p>}
              {card.description && <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5">{card.description}</p>}
            </div>
            {/* Soft Ambient Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Reflection Layer */}
      {reflection && (
        <div
          className="absolute left-0 w-full rounded-2xl overflow-hidden border border-neutral-800/20 bg-neutral-900/40 opacity-[0.15] pointer-events-none origin-bottom select-none"
          style={{
            height: `${cardHeight}px`,
            bottom: `-${cardHeight + 8}px`,
            transform: "scaleY(-1)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15))",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15))",
          }}
        >
          {renderCard ? (
            renderCard(card, false)
          ) : (
            <div
              className={cn(
                "relative flex flex-col justify-end w-full h-full p-6 bg-cover bg-center",
                card.background || "bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent"
              )}
              style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};
```

---

## Phase 7: Demo & Playground Integration (1 file)

### Create `apps/docs/src/app/gallery/cards-two/page.tsx`
Create a custom playground page in Next.js to test every prop in real time, featuring sidebar control knobs (radius, gap, snap, autoRotate, rotationAxis, blur, etc.).

---

## Execution Steps & Checklist

- [ ] **Step 1:** Create file `packages/ui/src/animated/CardsTwo/types.ts`
- [ ] **Step 2:** Create file `packages/ui/src/animated/CardsTwo/hooks/useCylinder.ts`
- [ ] **Step 3:** Create file `packages/ui/src/animated/CardsTwo/hooks/useRotation.ts`
- [ ] **Step 4:** Create file `packages/ui/src/animated/CardsTwo/hooks/useCardTransforms.ts`
- [ ] **Step 5:** Create file `packages/ui/src/animated/CardsTwo/hooks/useCardsTwo.ts`
- [ ] **Step 6:** Create file `packages/ui/src/animated/CardsTwo/CardsTwo.tsx`
- [ ] **Step 7:** Create file `packages/ui/src/animated/CardsTwo/index.ts`
- [ ] **Step 8:** Add export to `packages/ui/src/index.ts`
- [ ] **Step 9:** Build and verify compiling
- [ ] **Step 10:** Create interactive Next.js playground in `apps/docs/src/app/gallery/cards-two/page.tsx`
- [ ] **Step 11:** Verify layout, drag and touch physics on the dev server
