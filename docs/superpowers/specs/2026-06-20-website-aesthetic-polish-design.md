# Design Spec: Website Aesthetic Polish & Visual Redesign

This document outlines the design specification for upgrading the visual aesthetic, layout, and performance profile of the `void/ui` documentation site.

## Goal
Elevate the website's design to a premium, high-density "Command Center" HUD aesthetic. Remove the heavy `InteractiveGlobe` component and replace it with direct showcase components of newly added luxury buttons and custom scroll/grid animations.

---

## 1. Codebase Cleanup & Dependency Pruning

To improve bundle size, rendering performance, and clear unused components, we will remove WebGL / Three.js.

### Target Files
* **DELETE**: `packages/ui/src/animated/InteractiveGlobe.tsx`
* **DELETE**: `apps/docs/public/registry/interactive-globe.json` (auto-generated registry artifact)

### Code Modifications
* **MODIFY** `packages/ui/src/index.ts`: Remove imports and exports of `InteractiveGlobe`.
* **MODIFY** `apps/docs/src/registry/index.ts`: Remove the `interactive-globe` entry from the component registry.
* **MODIFY** `apps/docs/src/app/components/[category]/[slug]/page.tsx`: Remove the custom preview layout code and sandpack mock files for `interactive-globe`.

### Package Dependencies Removal
* **MODIFY** `packages/ui/package.json`: Remove `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing` from `devDependencies`.
* **MODIFY** `apps/docs/package.json`: Remove `three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing` from `dependencies`.

---

## 2. Hero Section Redesign & Visual Polish

Redesign the homepage hero from a single-column layout into a dual-column technical HUD layout.

### Target Files
* **MODIFY** `apps/docs/src/app/page.tsx`
* **MODIFY** `apps/docs/src/app/globals.css`

### Layout Architecture
* **Layout**: A responsive two-column grid (`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`) on larger screens.
* **Left Column (col-span-7)**: Typographic Hero content.
  * Keep the existing system status badge (`SYSTEM_STATUS: STABLE // V1.0.4`).
  * Display a bold, uppercase typography header with a technical scanline overlay.
  * Introduce an inline copyable command prompt widget (`npm install @void/ui`) with a copy indicator to improve initial developer ergonomics.
* **Right Column (col-span-5)**: The "Luxury Deck" HUD Control Panel.
  * Encased in a technical frame with styled corner brackets and status lines (`[CORE_TEMP: 32C]`, `[VOLTAGE: 1.25V]`).
  * Display a grid of the 4 new luxury button components for immediate preview and interaction:
    1. **Void Button**: Golden radial gradient cursor reveal.
    2. **Brushed Titanium Button**: Metallic sweeping anisotropic highlights.
    3. **Liquid Gold Button**: Conic gold rotation behind frosted glass.
    4. **Guilloche Button**: Moire patterned clock dial spotlight.

### Background and Overlay effects
* Set the WebGL `ChaosFieldShader` background opacity to `0.25` (down from `0.40`) to maintain a high text contrast.
* Add a technical backdrop grid under the right-side control deck using CSS radial-gradients.

---

## 3. Bento Grid Showcase Redesign & Card Animations

Redesign the Bento Grid section on the homepage with micro-animations, glowing border sweeps, and reactive mouse backgrounds.

### Target Files
* **MODIFY** `apps/docs/src/app/page.tsx`
* **MODIFY** `apps/docs/src/components/site/ShowcaseCard.tsx` (or directly within `page.tsx`)

### Layout Architecture & Redesigned Showcases
* **Card 1 (col-span-7)**: `GravityCardStack` showcase.
  * Render a miniature interactive `GravityCardStack` component that runs the Matter.js physics engine locally.
* **Card 2 (col-span-5)**: `GlitchText` showcase.
  * Enhance with a modern RGB chromatic aberration transition on hover.
* **Card 3 (col-span-5)**: `MorphingNav` showcase.
  * Embed a working preview of the SVG liquid nav bar.
* **Card 4 (col-span-7)**: `ImageStack` / `ImageReveal` showcase.
  * Combine them into a clean swipe-to-reveal image container.

### Interactive Effects
* **Border Beam Effect**: Add a glowing sweep animation around card borders on hover (implemented via CSS animation / conic-gradient).
* **Grid Glow**: Implement a cursor-tracking radial spotlight effect on bento card backgrounds.
* **Technical details**: Embed micro corner brackets and pixel coordinates on the cards.

---

## 4. Global Polish & Aesthetics Overhaul

Add smooth navigation transitions, sticky filter bars, and clean, cohesive scrollbars.

### Target Files
* **MODIFY** `apps/docs/src/app/layout.tsx`
* **MODIFY** `apps/docs/src/app/components/page.tsx` (Components directory page)
* **MODIFY** `apps/docs/src/app/globals.css`
* **MODIFY** `apps/docs/src/components/site/Navbar.tsx`

### Upgrades
* **Global Route Transitions**: Wrap page layouts with a client component that animates pages on enter (e.g. fade-in slide-up via `framer-motion`).
* **Category Filtering Tabs**: Add a sticky filter bar at the top of the `/components` page to filter between category categories (All, Animated, Primitives, Buttons) with active styling.
* **Navigation Polish**: Upgrade the main navigation header to use a glassmorphic background blur (`backdrop-blur-md bg-background/80`).
* **Uniform Scrollbars**: Implement global CSS rules to force custom thin scrollbars on all code wrappers, sidebars, and pre-blocks across Webkit, Firefox, and Chromium engines.

---

## Verification Plan

### Automated Checks
* Run `pnpm build` to verify there are no compilation errors or broken imports after removing `InteractiveGlobe`.
* Run `pnpm lint` to ensure the codebase remains clean.

### Manual Verification
* Deploy the dev server and test:
  * Interaction with the 4 luxury buttons on the homepage hero.
  * Interaction with the `GravityCardStack` and `MorphingNav` in the bento grid.
  * Transition fluidity when navigating between route endpoints.
  * category filtering behaviour on `/components`.
