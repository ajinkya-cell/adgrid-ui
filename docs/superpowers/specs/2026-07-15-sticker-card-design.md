# Design Spec — Interactive Sticker Card Component

## Overview
This document specifies the integration of the physics-based `StickerCard` component into the `adgrid-ui` component registry and presentation ecosystem.

---

## 1. Directory Structure & Files Created
1. **Component Source:**
   * Path: `packages/ui/src/animated/StickerCard.tsx`
   * Responsibilities: Renders the central card with scattering, spring-animated tech-themed sticker icons.
2. **Library Exports:**
   * Path: `packages/ui/src/index.ts`
   * Action: Export `StickerCard` and its types.

---

## 2. Dynamic Component Registry
*   Path: `apps/docs/src/registry/index.ts`
*   Entry details:
    ```typescript
    {
      name: "Sticker Card",
      slug: "sticker-card",
      category: "animated",
      description: "An interactive card that scatters physics-based skeuomorphic stickers across the viewport on hover.",
      dependencies: ["framer-motion"],
      packagePath: "animated/StickerCard.tsx",
      files: ["animated/StickerCard.tsx"],
      presentationStrategy: "fullscreen",
    }
    ```

---

## 3. Presentation View Mapping
*   Path: `apps/docs/src/components/presentation/PresentationRenderer.tsx`
*   Action: Render the `<StickerCard />` component directly when the slug is `"sticker-card"`.
*   Layout constraints: Should be rendered straight onto the canvas workspace without being embedded inside a container card layout wrapper.

---

## 4. Mini Preview Overlay
*   Path: `apps/docs/src/components/presentation/PreviewOverlay.tsx`
*   Action: Add `StickerCard` to the lazy-loaded UI manifest and add a case mapping inside `MiniPreviewRenderer`.
