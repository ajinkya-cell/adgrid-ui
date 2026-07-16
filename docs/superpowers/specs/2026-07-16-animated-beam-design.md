# Design Specification: Animated Beam & Beveled Node System

This specification defines the architecture, files, and styling tokens for the self-contained `animated-beam` namespace in the `@adgrid-ui/ui` package. It includes coordinate-tracking SVG path beams, recessed premium bevel node containers, and a ready-to-use surround-grid hub showcase.

## 1. Goal & Objectives
Create a completely self-contained Animated Beam coordinate-connecting animation system. All components must be native to `@adgrid-ui/ui` (no external downloads). Nodes must use the premium recessed beveled aesthetic (`border border-white/5 bg-[#070707] shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.8)]`).

---

## 2. Component System Architecture

The component system consists of three distinct modules defined in the `packages/ui/src/animated/animated-beam` folder:

```
+-----------------------------------------------------------------------------------+
| BeveledBeamShowcase (Parent layout container)                                      |
|                                                                                   |
|  [Left Nodes]                     [Center Node]                   [Right Nodes]   |
|  +---------------+                +---------------+               +---------------+ |
|  | BeveledNode 1 | ---- Beam ---->| BeveledNode C |<---- Beam ----| BeveledNode 4 | |
|  +---------------+                +---------------+               +---------------+ |
|  | BeveledNode 2 | ---- Beam ---->|               |<---- Beam ----| BeveledNode 5 | |
|  +---------------+                |               |               +---------------+ |
|  | BeveledNode 3 | ---- Beam ---->|               |<---- Beam ----| BeveledNode 6 | |
|  +---------------+                +---------------+               +---------------+ |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Visual Styling Specs

### BeveledNode styling
Represents a machined, sunken keyway or socket where icons sit.
- **Background**: `#070707` (pure matte black depth)
- **Border**: `border border-white/5`
- **Inset Shadow**: `inset 0 1.5px 3.5px rgba(0, 0, 0, 0.8)`
- **Hover transition**: Glow/neon borders or light reflections on hover.

### AnimatedBeam styling
SVG curves tracking positions dynamically:
- **Default path**: thin, low-opacity lines (`rgba(255,255,255,0.06)` or customized).
- **Sweep path**: overlay animated gradient moving along coordinates with custom speeds, colors, and curvature.

---

## 4. Detailed Component API

### A. `AnimatedBeam`
- Connects start and end points via SVG quadratic Bezier path (`M startX,startY Q controlX,controlY endX,endY`).
- Integrates browser `ResizeObserver` on parent container to automatically re-render and re-calculate bounds when viewport/layout updates.

### B. `BeveledNode`
- High-contrast recessed container.
- Configurable shapes: `"circle" | "square" | "rounded"`.

### C. `BeveledBeamShowcase`
- Auto-allocates React `useRef` instances dynamically.
- Connects peripheral nodes to center node automatically using `<AnimatedBeam>`.
- Fully customizable layout and color parameters via data props.
