# Design Spec: NamesLanding — Premium Infinite Interactive Names Hero

**Date**: 2026-07-11  
**Status**: Proposed  

---

## 1. Goal Description
Build a production-quality, premium React component named **NamesLanding** that creates an immersive, living typographic landscape. Instead of a traditional hero section with a fixed grid, it distributes hundreds of names naturally across a viewport using advanced procedural layout engines. 

The component will support three primary layout variants:
1. **Constellation**: An organic cluster layout with collision-avoidance relaxation.
2. **Grid**: A relaxed masonry column layout with organic offsets.
3. **Helical**: A spatial 3D spiral layout utilizing GPU-accelerated depth perspectives.

All typography, spacing, animation, interactions, and background options will be fully configurable via props.

---

## 2. Requirements & Constraints
- **Framework**: React 19 + TypeScript + Next.js compatibility.
- **Styling**: Tailwind CSS v4, dark-first premium aesthetics.
- **Animation**: Framer Motion (`framer-motion`) utilizing GPU-accelerated motion values. No Three.js/canvas.
- **Performance**: Support 500+ names at a stable 60fps using layout memoization, layer virtualization, and css transforms.
- **Custom Render**: Expose a `renderName` prop to allow custom component trees for items.

---

## 3. Architecture & API Specs

### Component Props
```typescript
export interface NamesLandingProps {
  names: string[];
  variant?: "constellation" | "grid" | "helical";
  title?: string;
  subtitle?: string;
  background?: "solid" | "noise" | "paper" | "grid" | "gradient" | "texture";
  density?: number; // 1 (Sparse), 2 (Balanced), 3 (Dense)
  spacing?: number; // Spacing scaling multiplier (default: 1.0)
  fontFamily?: "sans" | "mono" | "grotesk" | "serif" | "suisse";
  fontWeight?: number;
  fontScale?: number; // Overall text size scaling factor
  rotation?: number; // Maximum rotation angle in degrees (e.g. 12)
  animationSpeed?: number;
  hoverScale?: number;
  hoverBrightness?: number;
  mouseParallax?: boolean;
  depth?: number; // Number of visual depth layers (default: 3)
  noise?: boolean;
  grid?: boolean;
  showSearch?: boolean;
  highlightedNames?: string[];
  colorMode?: "light" | "dark";
  className?: string;
  renderName?: (
    name: string,
    index: number,
    state: { isHovered: boolean; isHighlighted: boolean; isMatched: boolean }
  ) => React.ReactNode;
}
```

### Module Structure
- `NamesLanding.tsx`: Coordinator containing state, layout selector, and presentation UI.
- `BackgroundLayer.tsx`: Canvas styling backdrop supporting CSS textures and light/dark color variables.
- `NameItem.tsx`: High-performance motion item using springs for mouse hover/parallax.
- `layoutEngine.ts`: Core placement algorithms calculating layout coordinates.
- `useMouseParallax.ts`: Hook mapping mouse position to spring-based coordinate offsets.

---

## 4. Verification Plan
- Verify responsive layout engine.
- Verify collision avoidance.
- Verify search query reactivity.
- Verify color mode styling.
