# Anisotropic Knob /gallery Integration Design Specification

**Date:** 2026-09-15  
**Status:** Approved  
**Target:** `apps/docs` (/gallery, /embed, PresentationRenderer)

---

## 1. Overview

The goal is to feature the **Anisotropic Knob** (`anisotropic-knob`) component in the curated `/gallery` showcase at `apps/docs/src/app/gallery/page.tsx`.

The Anisotropic Knob is a machined metal rotary dial component with dynamic rotating anisotropic highlights, snapper increments, and accessibility controls. To showcase its tactile metal finish effectively within the gallery grid:
- It will be displayed in a **2-row card** (`col-span-12 sm:col-span-6 lg:col-span-4 row-span-2`, 464px height) alongside widgets like Laser Vault and Dot Matrix.
- In `/gallery` preview mode, it will run a gentle, subtle oscillating idle animation so visitors immediately observe the sweeping anisotropic reflection across the dial face.
- Audio click sounds will be muted during gallery preview idle oscillation to avoid intrusive background noise.
- Clicking the card will navigate directly to `/present/primitives/anisotropic-knob` where users can fully interact with manual drag rotation, tactile click sounds, and prop controls.

---

## 2. Architecture & Changes

### 2.1 Gallery Page (`apps/docs/src/app/gallery/page.tsx`)
1. **`CURATED_GALLERY_SLUGS`**:
   Add `"anisotropic-knob"` right after `"laser-vault-password"` to place it alongside premium skeuomorphic hardware controls.
2. **`getCardSpan`**:
   Include `"anisotropic-knob"` in the 4-column, 2-row interactive card group:
   ```typescript
   if (
     slug === "laser-vault-password" ||
     slug === "datepicker" ||
     slug === "dot-matrix" ||
     slug === "anisotropic-knob"
   ) {
     return "col-span-12 sm:col-span-6 lg:col-span-4 row-span-2";
   }
   ```

### 2.2 Presentation Renderer (`apps/docs/src/components/presentation/PresentationRenderer.tsx`)
1. Create an internal helper `AnisotropicKnobGalleryDemo` for gallery preview mode:
   * Uses `requestAnimationFrame` or a gentle periodic interval/sine wave to smoothly oscillate the controlled `value` between `20` and `80` over ~5 seconds.
   * Forces `sound={false}` so no click audio is generated while scrolling the gallery.
   * Passes `size={132}` with appropriate label.
2. When `mode === "gallery"`:
   * Render `<AnisotropicKnobGalleryDemo {...liveProps} />`.
3. When `mode === "present"`:
   * Render `<AnisotropicKnob size={132} sound={playTactileSounds} {...liveProps} />` with full user drag interactivity and sound effects.

### 2.3 Embed Route Scaling (`apps/docs/src/app/embed/[slug]/page.tsx`)
1. In `getScaleClass`:
   * Ensure `anisotropic-knob` in gallery mode uses `scale-100` or `scale-[1.05]` to fill the 2-row card preview area comfortably with clear tick ring visibility.

---

## 3. Verification Plan

1. **Visual & Layout Check**:
   * Inspect `/gallery` route in browser/build.
   * Verify the card displays with 4-column × 2-row grid footprint.
   * Verify the knob rotates smoothly back and forth in idle preview mode.
   * Verify no audio plays on gallery page load.
2. **Navigation Check**:
   * Click the card in `/gallery` and verify transition to `/present/primitives/anisotropic-knob`.
   * Verify full interactive dragging and audio feedback work as expected in presentation mode.
3. **Build Check**:
   * Run `pnpm build` or Next.js typecheck to verify zero TypeScript or bundle regressions.
