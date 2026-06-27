# Design Spec: Ferrofluid Gooey Dock

This document outlines the design specification for implementing a liquid-metal magnetic navigation dock (`FerrofluidDock`) inside the `@adgrid/ui` package.

## Goal
Implement a premium, floating menu bar containing buttons that animate with liquid-metal gooey stretch highlights. When moving between items or hovering the cursor, the active background behaves like magnetic ferrofluid or liquid mercury.

---

## 1. Component Props & API

The React component `FerrofluidDock` will support the following properties:

```typescript
import React from "react";

export interface DockItem {
  id: string;
  label: string;
  icon: string;      // Name of the Material Symbol icon
  href?: string;
}

export interface FerrofluidDockProps {
  items: DockItem[];
  activeId?: string;
  onActiveChange?: (id: string) => void;
  className?: string;
}
```

---

## 2. Interaction & Gooey Filter Mechanics

### SVG Gooey Filter
We use a high-contrast alpha channel filter matrix to create the organic liquid merging effect.
```xml
<filter id="ferrofluid-goo">
  <!-- Blur elements to overlap their boundaries -->
  <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
  <!-- Dynamic alpha threshold matrix to solidify the blur into sharp gooey curves -->
  <feColorMatrix 
    in="blur" 
    mode="matrix" 
    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" 
    result="goo" 
  />
  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
</filter>
```

### Background Animation
1. **Pill Indicator**: A `motion.div` capsule positioned behind the active dock item.
2. **Magnetic Snapping**: When changing active items, the pill morphs and slides using Framer Motion springs (`stiffness: 140, damping: 16`). As it passes intermediate items, the blur filter makes it look like a physical mercury drop stretching and splitting.
3. **Cursor Attraction Droplet**: An invisible cursor tracking element that renders a small blurred circle under the cursor when hovering inside the dock. When the cursor approaches the active item, the bubble merges into the capsule.

---

## 3. Visual Style & Aesthetic Specifications

- **Container Chassis**: A floating rounded obsidian pill (`background: "rgba(10, 10, 12, 0.75)"`) with a heavy backdrop-blur (`backdropFilter: "blur(20px)"`), structured with a refined steel hair-line border.
- **Liquid Blob Accent**: The gooey backing pill renders with a molten liquid silver gradient:
  `linear-gradient(to right, #9c9c9c, #ffffff, #9c9c9c)`
  having a glowing white border shadow.
- **Icons & Text**: Pure white and grey states, rendering in a layer *above* the SVG filter container to prevent the font edges from blurring.

---

## Verification Plan

### Automated Checks
- Rebuild registry and verify TypeScript builds cleanly.

### Manual Verification
- Move active state between items and verify visual stretch and delay.
- Hover cursor in/out of items to check gooey bubble attraction.
