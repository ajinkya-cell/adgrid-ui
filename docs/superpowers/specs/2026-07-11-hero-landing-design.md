# Design Spec: Hero — Premium Modular Pixel Hero Section

**Date**: 2026-07-11  
**Status**: Proposed  

---

## 1. Goal Description
Build a production-quality, premium React hero landing component named **Hero** using Next.js 15, TypeScript, Tailwind CSS v4, and Framer Motion. The layout features a solid saturated background with a technical grid overlay, a giant lowercase serif wordmark, custom pixel-art icons, floating animated cross elements, and minimalist metadata details.

---

## 2. Requirements & Constraints
- **Framework**: React 19 + Next.js App Router compatible.
- **Styling**: Tailwind CSS v4, custom runtime themes via CSS properties.
- **Animation**: Framer Motion spring-based physics, parallax cursor follows.
- **Icons**: Pre-bundled inline SVG pixel-art components (Flower, Heart, Star, Skull, Crown, Ghost).
- **Fonts**: Dynamic font-pairing imports from Google Fonts (Instrument Serif, DotGothic16, etc.) injected at runtime.

---

## 3. API & Props Definition

```typescript
export interface HeroProps {
  name: string;
  role: string;
  location: string;
  year: string;
  navLinks?: { label: string; href: string; hasDropdown?: boolean }[];
  socials?: { label: string; href: string }[];
  availability?: string;
  availabilityDate?: string;
  scrollLabel?: string;
  copyrightName?: string;
  bgColor?: string;
  accentColors?: string[];
  fontFamily?: "instrument" | "fraunces" | "playfair" | "newsreader" | "custom";
  monoFontFamily?: "dotgothic" | "silkscreen" | "pressstart" | "vt323" | "pixelify" | "jersey";
  gridOpacity?: number;
  iconVariant?: "flower" | "heart" | "star" | "skull" | "crown" | "ghost" | "none";
  iconAnimation?: "static" | "hover-bloom" | "idle-loop" | "scroll-linked" | "clickable";
  pixelDensity?: "sparse" | "medium" | "dense";
  crossPositions?: { x: number; y: number; size: number }[];
  enableParallax?: boolean;
  animationSpeed?: "slow" | "normal" | "fast";
}
```

---

## 4. Verification Plan
- Manual test in Docs app with customizable controls.
- Verify fonts load and render correctly.
- Verify pixel icon animation states and hover actions.
