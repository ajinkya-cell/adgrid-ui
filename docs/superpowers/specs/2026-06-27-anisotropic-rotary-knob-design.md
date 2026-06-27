# Design Spec: Anisotropic Rotary Knob Component

This document outlines the design specification for implementing a highly-tactile rotary dial component (`AnisotropicKnob`) inside the `@adgrid/ui` package.

## Goal
Create a premium, luxury watch-dial or high-end audio hardware knob control featuring responsive anisotropic metallic light reflections, tick snapping, bounding configurations, and a clean pure silver/white color palette.

---

## 1. Component Props & API

The React component `AnisotropicKnob` will support the following properties:

```typescript
import React from "react";

export interface AnisotropicKnobProps {
  variant?: "slider" | "infinite"; // 'slider' snapped 270-degree range, or 'infinite' continuous spin
  min?: number;                    // Minimum value for slider (default: 0)
  max?: number;                    // Maximum value for slider (default: 100)
  value?: number;                  // Controlled value
  onChange?: (value: number) => void;
  defaultValue?: number;           // Default starting value
  step?: number;                   // Snap resolution steps (default: 1)
  size?: number;                   // Diameter in pixels (default: 96)
  label?: string;                  // Under-knob descriptor label
  className?: string;              // Custom wrapper classes
}
```

---

## 2. Interaction & Physics Mechanics

### Angle tracking via pan gestures
Drag coordinates are captured relative to the dial center:
1. When dragging, we fetch the bounding rect coordinates of the knob container.
2. Determine `centerX = rect.left + rect.width / 2` and `centerY = rect.top + rect.height / 2`.
3. Compute the angle relative to the 12 o'clock positions using:
   `const angleRad = Math.atan2(clientY - centerY, clientX - centerX);`
   `let angleDeg = angleRad * (180 / Math.PI) + 90;` (normalized to vertical start).

### Range Mapping
- **Slider Variant (Bounded)**:
  - Constrained to a $270^\circ$ sweep: from $-135^\circ$ to $+135^\circ$.
  - Values outside this gap snap to the closer boundary.
  - Linear mapping: maps the rotation degrees linearly to `[min, max]`.
- **Infinite Variant (Unbounded)**:
  - Free $360^\circ$ rotation.
  - Keeps count of full revolutions to compute values.

---

## 3. Visual Style & Aesthetic Specifications

### Anisotropic Sweep Highlights
The machined steel circular brushed effect is rendered using a dynamic CSS conic gradient offset by the current rotation angle:
```css
conic-gradient(
  from [angle]deg,
  #0b0b0c 0%,
  #eaeaea 25%,
  #0b0b0c 50%,
  #eaeaea 75%,
  #0b0b0c 100%
)
```

### Luxury Bezel Details
- **Ticks**: 24 radial indicator ticks around the outer bezel. In slider mode, active ticks (values $\le$ current) glow pure white (`rgba(255,255,255,0.9)`), while inactive ticks stay dim (`rgba(255,255,255,0.15)`).
- **LED Marker**: A single glowing white marker dot (`#ffffff`) near the outer edge of the rotating cylinder representing the active value.
- **Micro-brushed cap**: A raised centre cap overlay (`backgroundImage: "radial-gradient(circle, #252528, #0e0e10)"`) with a beveled metal border highlight catching light refractions.

---

## 4. Reduced Motion & Accessibility

- **Keyboard Control**: When focused, the dial can be adjusted using standard Arrow keys (`ArrowUp`/`ArrowRight` to increase, `ArrowDown`/`ArrowLeft` to decrease).
- **Accessibility Roles**: Proper `role="slider"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, animations on dial snap snaps are disabled, snapping values instantly.

---

## Verification Plan

### Automated Checks
- Verify clean compilation using `pnpm build`.
- Check zero lints or typescript errors.

### Manual Verification
- Verify pointer pan dragging functions at all drag angles.
- Verify snapping behaviors match the configured `step` increments.
