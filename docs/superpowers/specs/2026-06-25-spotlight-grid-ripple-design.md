# Design Spec: Spotlight Grid Ripple Background

This document outlines the design specification for upgrading the `SpotlightGrid` component background with a premium, organic "Minimal Slate" interactive ripple wave behavior and a deep navy-slate color palette.

## Goal
Replace the default white/slate-200 cursor-tracking grid tilt and glow in `SpotlightGrid.tsx` with a highly fluid, responsive water-ripple animation. The ripple propagates concentric wave fronts outward from the cursor, tilting grid cells along the wave's slope, and revealing a dual-layer indigo/teal-slate spotlight glow.

---

## 1. Interaction & Motion System

### Spring-Interpolated Cursor
To create a sense of weight and fluid drag, the cursor coordinates $(x, y)$ inside the component will be interpolated using a spring damping effect. When the mouse moves quickly, the wave center lags slightly behind the mouse, catching up smoothly.

### Wave Equation
For each cell $i$, we calculate its center coordinates $(cx, cy)$.
* **Distance**: $d = \sqrt{(x - cx)^2 + (y - cy)^2}$
* **Phase**: $\theta = (t \times \text{speed}) - (d \times \text{frequency})$
* **Base Wave**: $R = \sin(\theta)$
* **Damping (Decay)**: $\text{decay} = \max\left(0, 1 - \frac{d}{\text{maxRadius}}\right)^{1.5}$
* **Ripple Displacement (Z-translation)**: $\text{lift} = R \times \text{decay} \times \text{maxLift}$
* **Cell Rotation (3D Tilt)**: 
  * $\text{tilt}_x = (y - cy) \times R \times \text{decay} \times \text{sensitivity}$
  * $\text{tilt}_y = -(x - cx) \times R \times \text{decay} \times \text{sensitivity}$

### Wave Parameters
* `maxRadius` = 500px (propagation distance of the wave)
* `maxLift` = 12px (maximum elevation of grid tiles)
* `speed` = 0.008 (speed of time-based wave propagation)
* `frequency` = 0.012 (density/frequency of the concentric ripples)
* `sensitivity` = 0.02 (intensity of the 3D tilt response)

---

## 2. Visual Styling & Color Palette

### Color Specification
* **Background Container**: Deep midnight-slate (`#020617` or `#050b14`).
* **Grid Tile Borders**:
  * **Idle State**: Very subtle, low-opacity slate color: `border-slate-800/15` (`rgba(30, 41, 59, 0.15)`).
  * **Wave Peak State**: Brightens and color-shifts to a soft teal-slate: `rgba(148, 163, 184, 0.4)` (slate-400) mixed with a subtle teal sheen `rgba(45, 212, 191, 0.25)` proportional to the wave's peak.
* **Cell Center Ambient Glow**: Soft radial gradient `radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.03) 0%, transparent 80%)`.

### Dual-Layer Spotlight (Foreground Overlay)
On top of the grid, a mouse-following dual-gradient spotlight is overlaid to create rich lighting overlays:
* **Teal-slate Glow**: `300px` radius, `rgba(20, 184, 166, 0.05)` (Teal 500).
* **Indigo-slate Glow**: `500px` radius, `rgba(99, 102, 241, 0.04)` (Indigo 500), slightly offset to produce a chromatic look.
* **Blend Mode**: Both spotlight overlays use `mix-blend-screen` or `mix-blend-plus-lighter` for vibrant hotspots where they intersect.

---

## 3. Performance & Optimization

* **Bypassing DOM Reads in Tick Loop**: All coordinates and dimensions are cached outside the animation frame loop.
* **Cell Culling**: Calculations and `el.style` updates are bypassed for cells beyond `maxRadius` that have already settled back to their idle state.
* **GPU Compositing**: Transform operations use `perspective()`, `translate3d()`, and `rotate3d()` to trigger GPU composition.

---

## Verification Plan

### Automated Checks
* Run `pnpm build` to verify there are no compilation errors.
* Run `pnpm lint` to ensure code style compliance.

### Manual Verification
* Deploy the local development server and test:
  * Interaction with the mouse cursor on the Spotlight Grid component.
  * Quality and fluidity of the concentric wave ripple.
  * Visually verify the navy-slate color palette and the dual-layer spotlight.
