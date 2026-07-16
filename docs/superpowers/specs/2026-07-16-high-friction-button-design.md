# Design Specification: High-Friction 3D Skeuomorphic Button (Button-alpha)

This specification defines the architecture, visual layers, and interaction kinetics of the `Button-alpha` (ButtonAlpha) component. It is a hyper-tactile "machined polymer" physical UI element that demonstrates deep mechanical compression when pressed.

## 1. Goal & Objectives
Create a single, macro-view, isolated UI button element showcasing a premium physical polymer switch aesthetic. The button must float at high elevation, feel heavy and satisfying to press, and capture overhead light using fine bevel offsets.

---

## 2. Technical Design & Architecture

### Component Anatomy
The button is built as a React component using **Framer Motion** for state-driven spring animation curves and **Tailwind CSS** for layout.

```
+-------------------------------------------------------------+
| motion.button (Global drop shadow & Y-axis spring offset)    |
|  +-------------------------------------------------------+  |
|  | div (Bevel Border Ring: Top/Sides/Bottom light leaks)  |  |
|  |  +-------------------------------------------------+  |  |
|  |  | motion.div (Matte Charcoal Face: #171717)        |  |  |
|  |  |  Inset shadow top (gloss line)                  |  |  |
|  |  |  Inset shadow bottom (physical occlusion)       |  |  |
|  |  |  +-------------------------------------------+  |  |  |
|  |  |  | span (Silver-Gray text: "ACTIVATE")       |  |  |  |
|  |  |  +-------------------------------------------+  |  |  |
|  |  +-------------------------------------------------+  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### Properties (`ButtonAlphaProps`)
The component extends standard HTML button properties:
```typescript
import React from "react";

export interface ButtonAlphaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}
```

---

## 3. Visual Styling Specs

The component implements the following design parameters:

| Visual Element | Parameter / Value | CSS Implementation |
| :--- | :--- | :--- |
| **Shape** | Rectangular pill, smooth corners | `rounded-lg` (8px border-radius) |
| **Base Color** | Matte dark charcoal | `#171717` |
| **Top Bevel Highlight** | Specular overhead highlight | `border-t: 1px solid rgba(255, 255, 255, 0.2)` |
| **Side Border Geometry** | Soft edge definitions | `border-x: 1px solid rgba(255, 255, 255, 0.02)` |
| **Bottom Border Geometry** | Medium transition boundary | `border-b: 1px solid rgba(255, 255, 255, 0.1)` |
| **Inner Top Highlight** | Inset top gloss | `inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08)` |
| **Inner Bottom Shadow** | Inset bottom occlusion shadow | `inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4)` |
| **Global Drop Shadow** | Large ambient blur at depth | `0 30px 80px rgba(0, 0, 0, 0.6)` |
| **Text** | Light silver-gray, clean sans-serif | `text-neutral-300 font-sans tracking-wider uppercase font-semibold` |

---

## 4. Interaction Kinetics (Deep Z-Axis Compression)

To simulate tactile friction and weight, the button shifts its elevation and inner highlights during interaction.

### States & Transitions

1. **Default State**:
   - `y: 0`, `scale: 1.0`
   - Global Drop Shadow: `0 30px 80px rgba(0, 0, 0, 0.6)`
   - Inner Top Highlight: `inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08)`
   - Inner Bottom Shadow: `inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4)`
2. **Hover State**:
   - `y: -2` (elevates)
   - Global Drop Shadow: `0 35px 90px rgba(0, 0, 0, 0.7)` (larger, softer shadow)
   - Inner Top Highlight: `inset 0 1.8px 0 0 rgba(255, 255, 255, 0.1)`
   - Inner Bottom Shadow: `inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.35)`
3. **Tap/Press State**:
   - `y: 4` (compresses downwards past resting position)
   - `scale: 0.96`
   - Global Drop Shadow: `0 6px 15px rgba(0, 0, 0, 0.75)` (crunched shadow)
   - Inner Top Highlight: `inset 0 0.5px 0 0 rgba(255, 255, 255, 0.03)` (gloss line narrows as switch is depressed)
   - Inner Bottom Shadow: `inset 0 -3.5px 0 0 rgba(0, 0, 0, 0.6)` (occlusion shadow thickens from friction bottoming out)

---

## 5. Registry & Integration Setup

1. **Package Export**: Export from `packages/ui/src/index.ts`.
2. **Registry Inclusion**: Registered under slug `button-alpha` in `apps/docs/src/registry/index.ts` with properties metadata.
3. **Docs App Preview**: Registered inside `PresentationRenderer.tsx` and `PreviewOverlay.tsx` to showcase the design details under the `/r/button-alpha` preview canvas.
4. **Registry Rebuild**: Run `pnpm build:registry` to generate registry JSON schemas.
