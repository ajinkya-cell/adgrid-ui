# Design Specification: Organic Curves Visibility in Components Tab

## Overview
The `OrganicCurves` component is a high-performance SVG-based background component located in the `@adgrid-ui/ui` package but is not registered or visible in the docs site. This specification outlines registering the component to make it accessible under the "backgrounds" category in the documentation tab.

---

## Design Approaches for Miniature Preview

To represent `OrganicCurves` in the component directory grid, we evaluated three approaches for the preview card:

### Approach A: Static SVG
- **Description:** A static representation of the concentric SVG curves and the center dot.
- **Trade-offs:** Simple and performs well, but lacks the organic animation characteristic of the actual component.

### Approach B: CSS-Animated SVG (Recommended)
- **Description:** A lightweight, self-contained SVG mockup matching the layout of the component, animated with subtle CSS pulse and scale keyframes.
- **Trade-offs:** Beautifully represents the dynamic nature of the component without the performance overhead of running the full background canvas inside a small grid item.

### Approach C: Full Component Rendering
- **Description:** Directly render the `<OrganicCurves />` component inside the card, scaled down.
- **Trade-offs:** Highly accurate, but results in multiple full-viewport background components rendering in small containers, degrading page performance.

---

## Proposed Changes

### 1. Register Component in Docs Registry
- **File:** [registry/index.ts](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/registry/index.ts)
- **Action:** Add `OrganicCurves` to the `registry` array.
- **Category:** `backgrounds`
- **Slug:** `organic-curves`
- **Package Path:** `backgrounds/OrganicCurves.tsx`

### 2. Configure Props Schema & Sandbox App Code
- **File:** [app/components/[category]/[slug]/page.tsx](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/components/[category]/[slug]/page.tsx)
- **Action:**
  - Define prop schemas for `lineColor`, `backgroundColor`, `dotColor`, and `animated`.
  - Add a dedicated React template inside the dynamic page file to render a full-screen preview when the user clicks onto the component page.
  - Include `"organic-curves"` under the `isDefaultWide` components list.

### 3. Add Component Preview Card & Tags
- **File:** [app/components/page.tsx](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/components/page.tsx)
- **Action:**
  - Map `"organic-curves"` to tags `["SVG", "AMBIENT", "PULSE"]` in `categoryTags`.
  - Add an animated SVG preview representation of organic pulsing curves in the card grid.

### 4. Build Registry
- **Action:** Run `pnpm build:registry` to generate the component JSON metadata file in `public/registry`.

---

## Verification Plan

### Manual Verification
1. Run `pnpm build:registry` to verify JSON files build correctly.
2. Launch the dev server via `pnpm dev`.
3. Check `/components` to verify "Organic Curves" is visible in the "backgrounds" category and displays the animated preview card.
4. Click through to `/components/backgrounds/organic-curves` and test the sandbox editor, props controls, and responsiveness.
