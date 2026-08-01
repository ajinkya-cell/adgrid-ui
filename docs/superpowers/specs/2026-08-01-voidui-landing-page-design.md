# VoidUI Minimal Landing Page Design Specification

## Overview
This specification details the design and architecture for the new ultra-minimalist, high-contrast landing page for **VoidUI**.
The highlight of the landing page is a viewport-filling **CurtainField** hero featuring symmetrical animated vector strands sweeping outward from a central `VoidUI.` logotype, followed by a dark, borderless component stream with spotlight cursor interactions.

---

## 1. Architecture & Component Hierarchy

```
apps/docs/src/app/
├── globals.css                       <-- Keyframe animations (strand-sway, strand-breathe, strand-glint) & utilities
├── page.tsx                          <-- Main landing page layout (Hero + Component Showcase + Terminal Deck + Footer)
└── components/
    └── site/
        ├── CurtainField.tsx          <-- Symmetrical SVG strand curtain animation component
        ├── HeroSection.tsx           <-- Fullscreen stage with VoidUI logotype & interactive copy pill
        ├── ComponentGrid.tsx         <-- Borderless grid of VoidUI component previews with spotlight tracking
        └── QuickStartTerminal.tsx    <-- Interactive terminal widget with package manager tabs
```

---

## 2. Key Features & Micro-Interactions

### A. Symmetrical Curtain Hero (`CurtainField.tsx`)
* **SVG Vector Strands**: 8 bezier curves (4 upward, 4 downward) mirrored horizontally (`transform="translate(800 0) scale(-1 1)"`) creating symmetrical curtain sweeps on left & right boundaries.
* **Animations**:
  * `strand-sway`: Gentle organic floating translation.
  * `strand-breathe`: Soft pulsing opacity using custom CSS properties `--strand-o`.
  * `strand-glint`: Highlight sweeps along strand paths with offset animation delays.
* **Interactive Parallax**: Dynamic tilt / displacement of curtain strands reacting to user cursor movement.
* **Gradients**: Linear gradient `strandAccent` (violet `#a78bfa`) and `strandFade` (monochrome `#f2f2f4`).

### B. Centered Logotype (`VoidUI.`)
* **Typography**: Clean, bold sans-serif with tracked letter spacing (`Syncopate` or custom display font).
* **Hover Interaction**: Dynamic sheen animation on hover with magnetic cursor shift.
* **Quick CLI Copy**: Interactive badge displaying `npx void-ui init` with click-to-copy functionality and animated copied state checkmark.

### C. Borderless Component Showcase Grid
* **Spotlight Cursor Tracking**: Radial spotlight gradient tracking cursor movement inside each component card (`--mouse-x`, `--mouse-y`).
* **Component Spectrum**:
  1. Titanium & Guilloche Metallic Buttons (`BrushedTitaniumButton`, `LiquidGoldButton`, `GuillocheButton`, `VoidButton`).
  2. DotMatrix & Anisotropic Controls (`DotMatrix`, `AnisotropicKnob`).
  3. Morphing Floating Nav & Expand Cards (`MorphingNav`, `ExpandOnHover`).
  4. Interactive Text & Scroll Path FX (`TextShuffle`, `ScrollPathProcess`).

---

## 3. CSS Keyframes Specification (`globals.css`)

```css
@keyframes strand-sway {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(8px, -12px, 0) rotate(0.5deg);
  }
}

@keyframes strand-breathe {
  0%, 100% {
    opacity: var(--strand-o, 0.4);
  }
  50% {
    opacity: calc(var(--strand-o, 0.4) * 0.35);
  }
}

@keyframes strand-glint {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

.bg-radial-vignette {
  background: radial-gradient(circle at 50% 50%, rgba(20, 19, 19, 0) 20%, rgba(10, 10, 10, 0.85) 75%, #0a0a0a 100%);
}

.bg-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
}
```

---

## 4. Verification Plan

1. **Build Verification**: Run `pnpm build` or `turbo build` across the monorepo to ensure zero TypeScript errors or broken imports.
2. **Visual Verification**: Check responsiveness across desktop and mobile screen sizes, ensuring `CurtainField` scales gracefully with `viewBox="0 0 800 740"`.
3. **Interactive Verification**: Test CLI copy interaction, spotlight hover effects, and strand animation performance.
