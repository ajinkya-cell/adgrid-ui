# Implementation Plan: Glass Surface Primitive & Glass Morphing Nav

This plan details the step-by-step implementation of the `<GlassSurface />` component, the new `<GlassMorphingNav />` variant with high-refraction glass optics, and the fix for the top-shade overflow bug in the original `<MorphingNav />`.

---

## Phase 1: Fix Existing `MorphingNav` Overflow Shading Bug

### 1. Update `packages/ui/src/animated/MorphingNav.tsx`
- **Issue**: Upper side shade/drop shadow bleeding out of top bounds causing unwanted dark artifacts.
- **Fix**:
  1. Add `overflow-hidden` to the outer `<nav>` container or properly clip the backdrop glow.
  2. Set explicit height and overflow bounds on the relative parent wrapper so SVG drop shadows don't bleed out of top padding bounds.
  3. Ensure active tab highlights and submenus remain clean with smooth motion spring transitions.

---

## Phase 2: Create `<GlassSurface />` Primitive

### 2. Create `packages/ui/src/primitives/GlassSurface.tsx`
- Implement full JavaScript + SVG dynamic displacement map component adapted from React Bits.
- Support real-time `ResizeObserver` for width/height recalculations.
- Expose parameters: `width`, `height`, `borderRadius`, `borderWidth`, `brightness`, `opacity`, `blur`, `displace`, `backgroundOpacity`, `saturation`, `distortionScale`, `redOffset`, `greenOffset`, `blueOffset`, `xChannel`, `yChannel`, `mixBlendMode`, `className`, `style`.
- Render inline SVG `<filter>` with `<feDisplacementMap>`, `<feColorMatrix>`, `<feBlend>`, and `<feGaussianBlur>`.

### 3. Create `packages/ui/src/primitives/GlassSurface.css`
- Standardize CSS rules for `.glass-surface`, `.glass-surface__filter`, `.glass-surface__content`, `.glass-surface--svg`, `.glass-surface--fallback`.
- Add dark mode, `@supports not (backdrop-filter)` fallback handling, and focus-visible styling.

---

## Phase 3: Create `<GlassMorphingNav />` Variant

### 4. Create `packages/ui/src/animated/GlassMorphingNav.tsx`
- Build the morphing navigation bar using `<GlassSurface />` as its optical backplate foundation.
- Wrap SVG bezier morphing paths (`closedPath`, `productsPath`, `solutionsPath`, `resourcesPath`) with glass specular borders.
- Guarantee strict `overflow-hidden` bounds on all container states (`isOpen`, `activeItem`) so top-edge shade bleed is impossible.
- Add Framer Motion spring physics for tab switching and submenu expanding.

---

## Phase 4: Library Exports & Documentation Registry

### 5. Update `packages/ui/src/index.ts`
- Export `GlassSurface` from `./primitives/GlassSurface`.
- Export `GlassMorphingNav` from `./animated/GlassMorphingNav`.

### 6. Update Registry in `apps/docs/src/registry/index.ts`
- Register `glass-surface` under `primitives`.
- Register `glass-morphing-nav` under `animated`.

### 7. Wire Up Presentation Routes
- Update `apps/docs/src/components/presentation/PresentationRenderer.tsx` to add `"glass-morphing-nav"` and `"glass-surface"` rendering cases.
- Update `apps/docs/src/components/presentation/PreviewOverlay.tsx` with lazy imports for `GlassMorphingNav` and `GlassSurface`.

---

## Phase 5: Verification & Quality Assurance
1. Test component build across `packages/ui` and `apps/docs`.
2. Inspect original `MorphingNav` for clean edge rendering without top shade artifacts.
3. Validate dynamic SVG filter rendering on `GlassSurface` and `GlassMorphingNav`.
