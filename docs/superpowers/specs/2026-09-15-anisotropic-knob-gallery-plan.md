# Implementation Plan: Anisotropic Knob /gallery Integration

**Date:** 2026-09-15  
**Spec Reference:** `docs/superpowers/specs/2026-09-15-anisotropic-knob-gallery-integration-design.md`

---

## Task 1: PresentationRenderer Auto-Demo Wrapper
- File: `apps/docs/src/components/presentation/PresentationRenderer.tsx`
- Implementation:
  - Add `AnisotropicKnobGalleryDemo` component that gently oscillates `value` between 20 and 80 using a sine wave on `requestAnimationFrame`.
  - In `case "anisotropic-knob"`, check `mode === "gallery"`:
    - If gallery mode: render `<AnisotropicKnobGalleryDemo size={132} sound={false} {...liveProps} />`.
    - If present mode: render `<AnisotropicKnob size={132} sound={playTactileSounds} {...liveProps} />`.

---

## Task 2: Embed Scaling Configuration
- File: `apps/docs/src/app/embed/[slug]/page.tsx`
- Implementation:
  - Verify and calibrate `getScaleClass`: for `"anisotropic-knob"`, return `scale-100 sm:scale-[1.05]` to give the knob an optimal showcase proportion inside a 4-col × 2-row card container.

---

## Task 3: Gallery Page Curation & Grid Layout
- File: `apps/docs/src/app/gallery/page.tsx`
- Implementation:
  - Add `"anisotropic-knob"` to `CURATED_GALLERY_SLUGS` immediately after `"laser-vault-password"`.
  - Update `getCardSpan` to include `"anisotropic-knob"` in the 2-row card group (`col-span-12 sm:col-span-6 lg:col-span-4 row-span-2`).

---

## Task 4: Verification & Smoke Test
- Run `pnpm turbo build` / Next.js typecheck to ensure zero regressions.
- Verify the gallery card renders, idle sweeps smoothly without audio, and links to `/present/primitives/anisotropic-knob`.
