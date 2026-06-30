# Design Spec: Expand On Hover Component

**Date**: 2026-07-01  
**Status**: Proposed

---

## 1. Goal Description
Build a production-quality, premium **Expand On Hover** React component for **Next.js 16 + TypeScript** using **Tailwind CSS v4** and **Framer Motion (`motion/react`)**. 

The component creates a vertical stack of compact preview cards that smoothly expand into large detailed content panels on hover/focus. When hovered, the selected card expands, and neighboring cards physically "part away" (above move up, below move down) to create a premium, physically believable, elastic feel resembling designs on Apple, Linear, or Framer.

---

## 2. Requirements & Constraints
- **Next.js 16 + React 19 + Strict TypeScript**.
- **Tailwind CSS v4** for modern visual styling.
- **Framer Motion** for all transitions (no GSAP).
- **Layout Constraints**:
  - Vertical stack layout.
  - Gap: 10–16px.
  - Collapsed Height: 40–70px (default 52px).
  - Expanded Height: 320–520px (default 420px).
  - Customizable card border-radius: default 24px (must not clip or distort during animations).
- **Interactions**:
  - Hovering a card expands it. Surrounding cards scale down slightly (0.98), decrease opacity (0.7), and translate outward.
  - Sibling cards *above* translate upward (negative Y).
  - Sibling cards *below* translate downward (positive Y).
  - Cursor tracking: very subtle card tilt (max 3°) and slow image translation (parallax within ±8px) based on mouse position.
  - Auto-collapse on mouse leave (if configured).
  - Mobile support: hover turns into a tap toggle.
  - Accessibility: Full keyboard support (arrow keys, Enter to expand, Escape to collapse, ARIA properties, proper focus rings).
- **No hardcoded text** inside the component; fully driven by item data or custom render props.

---

## 3. Folder Structure
The component files will be placed under:
`packages/ui/src/animated/expand-on-hover/`
- `components/expand-on-hover/ExpandOnHover.tsx` (Container)
- `components/expand-on-hover/ExpandCard.tsx` (Card wrapper)
- `components/expand-on-hover/CardContent.tsx` (Detail view)
- `components/expand-on-hover/Preview.tsx` (Collapsed view)
- `hooks/useExpand.ts` (State & Interaction hook)
- `types.ts` (Type declarations)
- `index.ts` (Entry exports)

---

## 4. API & Types (`types.ts`)
```typescript
import { ReactNode } from "react";

export interface ExpandItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  description?: string;
  badge?: string;
  accent?: string; // Optional custom color/accent class
}

export type ExpandVariant = "modern" | "minimal";
export type ExpandAnimationType = "spring" | "smooth";

export interface ExpandOnHoverProps {
  items: ExpandItem[];
  variant?: ExpandVariant;
  expandHeight?: number;
  collapsedHeight?: number;
  animation?: ExpandAnimationType;
  
  // Controlled mode props
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  defaultExpanded?: string | null;
  
  // Interaction behaviors
  allowMultiple?: boolean;
  hoverDelay?: number;
  clickToExpand?: boolean;
  autoCollapseOnLeave?: boolean;
  
  // Render overrides
  renderItem?: (item: ExpandItem, isExpanded: boolean) => ReactNode;
  
  // Style overrides
  className?: string;
  cardClassName?: string;
}

export interface ExpandOnHoverRef {
  expand: (index: number) => void;
  collapse: () => void;
  next: () => void;
  prev: () => void;
}
```

---

## 5. Animation Details (Approach 1)

### **Layout Projection & Height Interpolation**
- Use Framer Motion's `layout` projection.
- Give each card an explicit height configuration: `style={{ height: isExpanded ? expandHeight : collapsedHeight }}`.
- To prevent text/child distortion during layout height animations, children of the card will use `<motion.div layout="position">` to keep their aspect ratio and positioning exact without stretching.

### **Spring & Smooth Configuration**
- **Spring**:
  - `stiffness: 170`
  - `damping: 22`
  - `mass: 0.8`
- **Smooth**:
  - `type: "tween"`
  - `ease: [0.16, 1, 0.3, 1]` (custom easeOutExpo)
  - `duration: 0.6`

### **Sibling Offset & Parting Motion**
- When card $i$ is expanded:
  - Cards $j < i$ get translation `y: -12` and scale `0.98`.
  - Cards $j > i$ get translation `y: 12` and scale `0.98`.
- If no card is expanded, all translations reset to `y: 0` and scale `1`.

### **Subtle Tilt and Parallax Effect**
- Mouse move tracking updates relative `mouseX` and `mouseY` variables (from `-0.5` to `0.5` relative to the card bounds).
- Card tilt is animated via `rotateX` and `rotateY` matching `mouseY * -3` and `mouseX * 3` degrees respectively.
- Background image shifts via `x` and `y` matching `mouseX * 8` and `mouseY * 8` pixels.

### **Staggered Content Reveal**
- Once expanded, the inner details (Subtitle, Description, Badge, Metadata) reveal sequentially using a staggered fade/slide upward:
  - Outer container transition `staggerChildren: 0.05` and `delayChildren: 0.1`.
  - Child elements animate `opacity: [0, 1]` and `y: [15, 0]` with a spring.

---

## 6. Visual Polish & Styling
- **Modern Variant**:
  - Glassmorphic accents, soft ambient shadows (multiple box shadow layers).
  - Background overlay on the image using standard black-to-transparent gradients to keep dynamic text legible.
  - Border radius `24px` maintained perfectly by wrapping the content card in an outer layout container that has `border-radius: 24px` and `overflow: hidden`.
- **Minimal Variant**:
  - Minimalistic thin border, flat colors, no shadows.
- **Images**:
  - Black and white high-contrast photography from Unsplash matching Indian architecture/landscapes/culture.

---

## 7. Accessibility Plan
- Card components will render as buttons (`role="button"`) or have correct focus traits.
- Keyboard interaction:
  - ArrowUp/ArrowDown: Moves focus between cards.
  - Space/Enter: Expands the focused card.
  - Escape: Collapses the currently expanded card.
- ARIA:
  - `aria-expanded={isExpanded}` on each card.
  - `aria-controls={`panel-${id}`}`.
- Focus visible indicator: clear custom rings that do not clip.
