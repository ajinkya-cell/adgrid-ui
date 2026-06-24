# Component Design Principles

> Practical guidelines for building void/ui components — for both human contributors and AI agents.

---

## 1. Technical Foundation

### Stack

| Layer | Technology |
|---|---|
| Framework | React 19+ (Server & Client Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + PostCSS |
| Motion | framer-motion (primary), GSAP (when needed for timeline-heavy work) |
| Utilities | `clsx` + `tailwind-merge` via `cn()` |

### Component Boilerplate

```typescript
"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface ComponentNameProps {
  className?: string;
}

export function ComponentName({ className }: ComponentNameProps) {
  return (
    <div className={cn("...", className)}>
      {/* ... */}
    </div>
  );
}
```

Rules:
- Always `"use client"` — void/ui components are interactive by nature
- Extend native HTML props via `React.ComponentPropsWithoutRef<"element">` when wrapping a native element
- Always accept `className` and pass it through `cn()`
- Export a clean `interface` for props (for documentation generation)

### File Structure

```
packages/ui/src/
├── animated/         # Motion-driven interactive components
│   ├── VoidButton.tsx
│   ├── LivingText.tsx
│   └── ...
├── backgrounds/      # Canvas/CSS ambient background patterns
│   ├── PixelMelt.tsx
│   ├── BreathingGrid.tsx
│   └── ...
└── lib/
    └── utils.ts      # cn() utility
```

Each component file should be self-contained. No barrel files, no splitting into sub-files unless absolutely necessary (component + sub-components can coexist in one file).

---

## 2. The Luxury Toolkit

### Layer Composition Pattern

Most void/ui components follow a layer stack. This is the single most important pattern:

```
┌─────────────────────────────────────────────┐
│  Layer 4: Content (text, icons, children)    │  ← z-index: highest
├─────────────────────────────────────────────┤
│  Layer 3: Cursor-reactive spotlight          │  ← z-index: 2
├─────────────────────────────────────────────┤
│  Layer 2: Texture / pattern / gradient       │  ← z-index: 1
├─────────────────────────────────────────────┤
│  Layer 1: Base surface / background          │  ← z-index: 0
└─────────────────────────────────────────────┘
```

**Example — GuillocheButton:**
- Layer 1: Slate-blue base gradient
- Layer 2: Static guilloché circles + dynamic Moire pattern centered on cursor
- Layer 3: Blue spotlight gradient following cursor
- Layer 4: Text + gold rim highlight

### Micro-textures via CSS

Texture adds material authenticity without images:

```css
/* Brushed metal */
background-image: repeating-linear-gradient(
  0deg,
  rgba(255,255,255,0.04) 0px,
  rgba(255,255,255,0.04) 1px,
  transparent 1px,
  transparent 2px
);
```

```css
/* Carbon fiber weave */
background-image:
  linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
  linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%);
background-size: 20px 20px;
```

```css
/* Fine grain / noise (subtle) */
background-image: url("data:image/svg+xml,...");
```

### Spotlight / Flashlight Effect

The cursor-reactive spotlight is a void/ui signature:

```tsx
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);
const springX = useSpring(mouseX, { stiffness: 90, damping: 20 });
const springY = useSpring(mouseY, { stiffness: 90, damping: 20 });

const spotlightBg = useMotionTemplate`
  radial-gradient(
    circle 80px at ${springX}px ${springY}px,
    rgba(255,255,255,0.08),
    transparent
  )
`;
```

### Edge Lighting

A subtle rim light elevates dark surfaces:

```css
/* Top edge catch light */
border-top-color: rgba(255, 224, 102, 0.45);

/* Or as a gradient strip */
.edge-light {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0.05) 0%,
    transparent 1px
  );
}
```

### Conic Gradients for Dynamic Surfaces

Rotating conic gradients create living surfaces (LiquidGoldButton):

```tsx
background: "conic-gradient(from 0deg at 50% 50%, #ffe066 0%, #f39c12 25%, #d35400 50%, #f39c12 75%, #ffe066 100%)";
filter: "blur(4px)";
```

### SVG Filters for Organic Effects

Use SVG displacement maps for organic deformation (LivingText):

```tsx
<filter id="liquify">
  <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
  <feDisplacementMap in="SourceGraphic" in2="noise" scale={strength} />
</filter>
```

---

## 3. Motion Philosophy

### When to Use What

| Tool | Best For |
|---|---|
| **framer-motion** `motion.div` | Spring-based interactions, layout animations, mount/unmount |
| **framer-motion** `useSpring` | Cursor tracking, smooth value interpolation |
| **framer-motion** `useScroll` / `useInView` | Scroll-triggered reveals |
| **GSAP** | Timelines, complex sequence chaining, scroll-triggered timelines |
| **CSS transitions** | Simple hover states, opacity/color shifts |
| **CSS animations** | Ambient/loop animations (rotation, breathe) |

### Spring Physics Rules

Use spring physics for *interactive* motion (things the user touches). Use `duration` + `ease` for *ambient* motion (things that happen on their own).

```tsx
// Interactive — buttery, responsive
transition={{ type: "spring", stiffness: 120, damping: 22 }}

// Ambient — controlled, predictable
transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
```

### GPU-Accelerated Properties Only

Animate only these for 60fps performance:

```
transform   → translate, scale, rotate
opacity
filter      → blur (GPU on some browsers)
```

Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow` — these trigger layout or paint.

### Enter / Exit Convention

Components that enter the viewport use this pattern:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>
```

### prefers-reduced-motion

Every component must respect reduced motion:

```tsx
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

// Inside the component:
if (prefersReducedMotion) {
  // Skip motion, show static state
}
```

---

## 4. Dark-First Design System

### Token Reference

```css
--void-bg: #000000;           /* Deepest void — page backgrounds */
--void-surface: #0a0a0a;      /* Card surfaces — subtle differentiation */
--void-card: #111111;         /* Elevated surfaces — hover states, modals */
--void-border: #1a1a1a;       /* Hairline borders — structural lines */
--void-border-hover: #333333; /* Border on hover — subtle reveal */
--void-muted: #555555;        /* Secondary text, labels */
--void-text: #ffffff;         /* Primary text */
```

### The Black-on-Black Rule

Good black design uses multiple blacks. Pure `#000000` is reserved for the deepest backgrounds. Every layer up gets slightly lighter:
- Page BG: `#000000`
- Card: `#0a0a0a`
- Input/Interactive: `#111111`
- Hovered: `#1a1a1a`

This creates hierarchy without color.

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Space Grotesk | Headings, hero text, large typography |
| Body | Inter | Paragraphs, descriptions, UI labels |
| Mono | JetBrains Mono | Code blocks, props, technical data |

Styling conventions:
- Uppercase with wide tracking (`tracking-widest`) for luxury labels and button text
- Monospace for technical data (coordinates, props, stats)
- Minimal font weights — black for display, regular for body, never go below 400

---

## 5. Interaction Patterns

### Cursor-Reactive

The void/ui signature — components that respond to cursor position:

| Technique | Use Case | Example |
|---|---|---|
| Radial spotlight | Reveal material/color under cursor | VoidButton |
| Spring offset | Push/pull elements away from cursor | LivingText |
| Anisotropic sweep | Metallic highlight that follows cursor | BrushedTitaniumButton |
| Moire wave | Dynamic pattern centered on cursor | GuillocheButton |

Implementation pattern:

```tsx
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);
const springX = useSpring(mouseX, { stiffness: 90, damping: 20 });
const springY = useSpring(mouseY, { stiffness: 90, damping: 20 });

const handleMouseMove = (e: React.MouseEvent) => {
  const rect = containerRef.current.getBoundingClientRect();
  mouseX.set(e.clientX - rect.left);
  mouseY.set(e.clientY - rect.top);
};
```

### Scroll-Triggered

| Technique | Use Case | Example |
|---|---|---|
| Fade + translate | Element enters viewport with motion | FadeIn |
| Sequential word reveal | Typography reveals word-by-word | TextReveal |
| Number counter | Statistic animates on scroll | CountUp |
| Parallax | Image shifts at different rate | ImageParallax |

### Hover-Slate

Hover is a moment of *reward*, not overwhelm. A button shouldn't do three things at once on hover. Pick one:
- A spotlight that reveals the material (VoidButton)
- A texture that comes alive (GuillocheButton)
- A transformation of the surface (BrushedTitaniumButton)

Never combine all three.

---

## 6. The "Interesting Different" Test

Before shipping any component, run through this checklist:

### Design Checklist

- [ ] **First impression**: Is it clean? Does it look intentional, not generated?
- [ ] **Interaction**: Is there a moment of "oh, that's cool" when you engage with it?
- [ ] **Depth**: Does sustained attention reveal more detail?
- [ ] **Material**: Does it feel made of something real?
- [ ] **Motion**: Is it buttery? Does it serve the interaction or distract from it?
- [ ] **Minimalism**: Can anything be removed without losing character? If yes, remove it.

### Technical Checklist

- [ ] TypeScript strict — no `any`, no loose types
- [ ] `cn()` used for className merging
- [ ] `prefers-reduced-motion` respected
- [ ] No layout-triggering animations (width, height, top, left)
- [ ] Spring physics for interactive, timed easing for ambient
- [ ] Props accept `className` pass-through
- [ ] No external dependencies beyond framer-motion (unless unavoidable)
- [ ] Works at 60fps on mid-range device

### The "Show Someone" Test

The final gate: show the component to someone who hasn't seen it. If they don't react — no curiosity, no "how'd they do that" — it needs more work.

---

## 7. Design Pattern Library

### Button Architecture (Reference)

Every luxury button follows this structure:

```tsx
<button className="relative overflow-hidden">
  {/* Layer 1: Base surface */}
  <div className="absolute inset-0 bg-gradient..." />

  {/* Layer 2: Texture / pattern */}
  <div className="absolute inset-0 opacity-40 mix-blend-overlay" />

  {/* Layer 3: Cursor-reactive spotlight */}
  <motion.div className="absolute inset-0" style={{ background: spotlightBg }} />

  {/* Layer 4: Edge lighting */}
  <div className="absolute inset-x-0 top-0 h-px bg-gradient..." />

  {/* Layer 5: Content */}
  <span className="relative z-10">{children}</span>
</button>
```

### Card / Surface Architecture

```tsx
<div className="relative overflow-hidden rounded border border-void-border bg-void-surface">
  {/* Optional background texture */}
  <div className="absolute inset-0 opacity-[0.03]" />

  {/* Content */}
  <div className="relative z-10 p-6">
    {children}
  </div>

  {/* Optional hover edge glow */}
  <motion.div
    className="absolute inset-0 opacity-0"
    animate={{ opacity: isHovered ? 1 : 0 }}
    style={{ background: spotlightBg }}
  />
</div>
```

---

## 8. Color & Material Palette Guidelines

### Base Tones (Black / Dark)

```
#000000 — Void (deepest)
#0a0a0a — Surface
#111111 — Card
#1a1a1a — Border
#333333 — Border hover
#555555 — Muted
```

### Luxury Accent Families

| Family | Base | Light | Dark | Use Case |
|---|---|---|---|---|
| Gold | `#f39c12` | `#ffe066` | `#d35400` | Prestige, warmth, classic luxury |
| Platinum | `#e2e8f0` | `#ffffff` | `#94a3b8` | Modern, cold, precision |
| Copper | `#d97706` | `#fbbf24` | `#92400e` | Warmth, vintage, artisanal |
| Blue | `#3b82f6` | `#60a5fa` | `#1e40af` | Tech, control, depth |
| Indigo | `#6366f1` | `#818cf8` | `#4338ca` | Luxury tech, watch faces |
| Crimson | `#ef4444` | `#f87171` | `#b91c1c` | Power, passion, danger |

### Material Keywords

When designing a component, use these as your material brief:

- **Liquid**: Rotating conic gradients, blurred layers, dynamic displacement
- **Brushed**: Repeating micro-lines, anisotropic highlight shifts
- **Engraved**: Repeating radial patterns, concentric circles, precision spacing
- **Faceted**: Hard-edge gradients, angular highlights, geometric cuts
- **Frosted**: Backdrop-blur, translucent overlays, layered depth
- **Raw**: Noise textures, irregular borders, matte finishes
- **Polished**: Sharp gradients, mirror-like reflections, crisp shadows
- **Machined**: Perfect symmetry, chamfered edges, uniform grooves

---

## 9. Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do This Instead |
|---|---|---|
| Animating `width`/`height` | Triggers layout, janky | Use `scaleX`/`scaleY` |
| Multiple simultaneous hover effects | Overwhelming, feels chaotic | Pick one primary effect |
| Using Inter + standard font stack | Generic, forgettable | Space Grotesk for display, Inter for body |
| Purple gradient on black | 2023 AI-slop cliché | Gold, platinum, indigo, or deep blue |
| `any` types | Breaks DX, no autocomplete | Proper TypeScript generics |
| Over-nesting motion.divs | Performance cost | Minimize animated elements |
| Effects that trigger on page load | Sensory overload | Scroll-trigger or interaction-trigger |

---

## 10. Component Lifecycle

### Creating a New Component

1. **Concept**: Define the material and interaction in one sentence (e.g., "a button whose brushed titanium surface follows the cursor")
2. **Minimal prototype**: Get the core interaction working in a single file with minimal styling
3. **Luxury layer**: Add texture, spotlight, edge lighting, material depth
4. **Polish**: Tune spring physics, test at various mouse speeds, check reduced motion
5. **Review**: Run through the checklists in section 6
6. **Ship**: Register in `packages/ui/src/index.ts` and `apps/docs/src/registry/index.ts`
