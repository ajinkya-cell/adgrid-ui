# Design Specification: Glass Surface Primitive & Glass Morphing Nav

## 1. Overview
This specification details the implementation of the `<GlassSurface />` component adapted from React Bits, a new high-refraction component variant `<GlassMorphingNav />`, and visual fixes for top-edge shade bleed artifacts on the original `<MorphingNav />`.

---

## 2. Component Specifications

### 2.1 `<GlassSurface />` Primitive
- **Files**:
  - `packages/ui/src/primitives/GlassSurface.tsx`
  - `packages/ui/src/primitives/GlassSurface.css`
- **Functionality**:
  - Dynamically builds SVG displacement filters via `feDisplacementMap`, `feColorMatrix`, and `feBlend` with real-time `ResizeObserver` recalculation.
  - Exposes all customizable parameters: `width`, `height`, `borderRadius`, `borderWidth`, `brightness`, `opacity`, `blur`, `displace`, `backgroundOpacity`, `saturation`, `distortionScale`, `redOffset`, `greenOffset`, `blueOffset`, `xChannel`, `yChannel`, `mixBlendMode`, `className`, `style`.
  - Includes standard glass fallback styling for environments without full SVG filter support.

### 2.2 `<GlassMorphingNav />` Variant
- **File**: `packages/ui/src/animated/GlassMorphingNav.tsx`
- **Functionality**:
  - Combines morphing path transitions (quadratic bezier bezier paths) with `<GlassSurface />` optical glass backplate.
  - Encapsulates content within strict `overflow-hidden` rounded boundaries to eliminate top/bottom shade bleed.
  - Interactive navigation items, submenu drop-downs with spring physics animations (`framer-motion`).

### 2.3 `<MorphingNav />` Shading Fix
- **File**: `packages/ui/src/animated/MorphingNav.tsx`
- **Fix**:
  - Adjust SVG viewBox and top margin padding.
  - Add strict container `overflow-hidden` positioning to remove top-edge dark shadow artifact clipping.

---

## 3. Registry & Library Exports

1. **`packages/ui/src/index.ts`**:
   - Export `GlassSurface` from `./primitives/GlassSurface`
   - Export `GlassMorphingNav` from `./animated/GlassMorphingNav`

2. **`apps/docs/src/registry/index.ts`**:
   - Register `glass-surface` and `glass-morphing-nav`.

3. **`apps/docs/src/components/presentation/PresentationRenderer.tsx`**:
   - Render `GlassMorphingNav` for the `/present/animated/glass-morphing-nav` route.

---

## 4. Acceptance Criteria
- [x] `<GlassSurface />` correctly renders with dynamic SVG displacement map and fallback styling.
- [x] `<GlassMorphingNav />` operates smoothly with morphing shapes and high-friction glass aesthetics.
- [x] `<MorphingNav />` top-side shade defect is completely resolved with zero visual artifacts.
- [x] Both components build without TypeScript or CSS errors in `packages/ui` and `apps/docs`.
