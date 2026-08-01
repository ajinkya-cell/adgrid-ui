# VoidUI Glowing Filament Beams Curtain Design Spec (v3)

## Overview
Refine `CurtainField` to use **Glowing Filament Beams**—a sleek, high-contrast visual style with 4 refined Bezier strands per corner (Top-Right and Bottom-Left), featuring dual-layer rendering (soft ambient blur underneath, crisp hairline stroke on top) and traveling light glints.

---

## 1. Filament Beam Specifications

### Top-Right Cluster (4 Strands)
- `Strand 1 (Leading)`: `M 1000 30 C 860 70, 710 150, 590 300` (Width: 1.2px, Delay: 0s, Duration: 22s)
- `Strand 2 (Mid-Outer)`: `M 980 120 C 820 180, 730 240, 630 350` (Width: 0.9px, Delay: 2.1s, Duration: 26s)
- `Strand 3 (Mid-Inner)`: `M 940 0 C 810 110, 690 190, 560 260` (Width: 1.0px, Delay: 1.2s, Duration: 24s)
- `Strand 4 (Atmospheric)`: `M 1000 240 C 890 300, 780 340, 680 400` (Width: 0.7px, Delay: 3.5s, Duration: 28s)

### Bottom-Left Cluster (4 Strands)
- `Strand 1 (Leading)`: `M 410 500 C 290 650, 140 730, 0 770` (Width: 1.2px, Delay: 0.8s, Duration: 23s)
- `Strand 2 (Mid-Outer)`: `M 370 450 C 270 580, 170 650, 20 720` (Width: 0.9px, Delay: 2.5s, Duration: 27s)
- `Strand 3 (Mid-Inner)`: `M 440 540 C 310 680, 210 750, 90 800` (Width: 1.0px, Delay: 1.6s, Duration: 25s)
- `Strand 4 (Atmospheric)`: `M 320 400 C 220 490, 120 540, 0 600` (Width: 0.7px, Delay: 4.1s, Duration: 29s)

---

## 2. Rendering Technique

1. **Glow Layer (Underneath)**:
   - Stroke width: `width * 2.2`
   - Opacity: `0.3` to `0.5`
   - SVG Filter: `filter="url(#filamentGlow)"` (`feGaussianBlur stdDeviation="2"`)
   - Accent gradient: `url(#filamentAccent)` (`#a78bfa` violet glow to `#c4b5fd`).

2. **Crisp Filament Layer (Top)**:
   - Stroke width: `width` (`0.7px` to `1.2px` hairline)
   - Multi-stop gradient: `url(#filamentGradient)` tapering off at both extremities.

3. **Traveling Light Glints**:
   - `strokeDasharray="30 250"` with animated `strokeDashoffset` for smooth light pulses sweeping down the filament fibers.

---

## 3. Verification Plan

1. **Visual Verification**:
   - Ensure the 4 top-right and 4 bottom-left strands are beautifully curved and spaced out.
   - Verify the optical fiber glow effect (`filamentGlow` filter) rendered softly around hair-line paths.
   - Confirm center `VoidUI.` text remains unobstructed.
2. **Build Verification**:
   - Run `pnpm --filter docs build` to guarantee clean compilation.
