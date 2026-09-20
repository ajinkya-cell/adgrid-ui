# Roughly Studio Playground 3-Column Layout Design Spec

**Date:** 2026-09-20  
**Status:** Approved  
**Topic:** 3-Column Studio Layout Refactoring for Roughly Interactive Playground (`apps/docs/src/app/roughly/page.tsx`)

---

## 1. Problem Statement & Motivation

In the existing Roughly playground (`apps/docs/src/app/roughly/page.tsx`), the interface uses a 2-column layout:
- **Left Column (`lg:col-span-5`)**: Contains the "Annotation Type" vertical table (8 items tall), followed directly beneath by sample text inputs, type-specific configuration controls (up to 9 distinct input fields for arrows), color swatches, and sliders.
- **Right Column (`lg:col-span-7`)**: Contains the Live Canvas preview at the top and the React code snippet box below it.

### UX Defect
Because the 8-item Annotation Type table sits at the top of the left column, all fine-tuning controls are pushed down to the bottom of the page. Meanwhile, the Live Canvas is situated at the top of the right column. Users editing controls cannot view the Live Canvas at eye level and must constantly scroll or visually bounce between the bottom-left controls and top-right preview.

---

## 2. Solution: 3-Column Studio Layout

We decouple the **Annotation Type** selector table from the **Active Controls** into a dedicated 3-column architecture, expanding the layout container so each area has generous width and breathing room.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Interactive Playground                                       │
├───────────────────────┬───────────────────────────────────┬──────────────────────────────────────┤
│ 1. Annotation Types   │ 2. Active Controls                │ 3. Live Canvas & Snippet (Sticky)   │
│    (Left Sidebar)     │    (Center Inspector)             │    (Right Stage)                     │
├───────────────────────┼───────────────────────────────────┼──────────────────────────────────────┤
│ • Underline           │ • Sample Text & Presets           │ ┌──────────────────────────────────┐ │
│ • Circle              │ • Type-Specific Settings:         │ │                                  │ │
│ • Strike              │   - Arrow: 8-dir placement,       │ │           Live Canvas            │ │
│ • Cross               │     trajectories, head style,     │ │         (Roughly Render)         │ │
│ • Bracket             │     iterations, distance, offset, │ │                                  │ │
│ • Box                 │     curvature, flip curve         │ └──────────────────────────────────┘ │
│ • Highlight           │   - Circle/Box/Bracket options    │                                      │
│ • Arrow               │ • Color Presets                   │ ┌──────────────────────────────────┐ │
│                       │ • Stroke Width & Duration sliders │ │ React Component Snippet (Copy)   │ │
│                       │                                   │ └──────────────────────────────────┘ │
└───────────────────────┴───────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Structural & Layout Specifications

### 3.1 Container Sizing
- **Main Container**: Update `w-full max-w-[960px]` on the outer container to `w-full max-w-7xl` (`1280px`).
- **Hero Header**: Preserved with `max-w-2xl mx-auto text-center`.
- **Editorial Typography Demonstration**: Kept readable with `max-w-4xl mx-auto` or full-width container styling.
- **API Reference Table**: Full width within the expanded container.

### 3.2 Grid Column Distribution
The interactive playground grid will use:
`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`

1. **Column 1 — Annotation Type Table (`lg:col-span-3 xl:col-span-3`)**:
   - Encapsulated in its own dedicated card (`bg-[#111114] border border-white/[0.08] p-4 rounded-2xl`).
   - Retains the exact 8 styles: Underline, Circle, Strike, Cross, Bracket, Box, Highlight, Arrow.
   - Preserves all icons, labels, active indicator pill/dot, and type selection callbacks.
   - Sits on the far left, acting as a clean category navigation panel.

2. **Column 2 — Active Controls Panel (`lg:col-span-4 xl:col-span-4`)**:
   - Encapsulated in its own card (`bg-[#111114] border border-white/[0.08] p-5 rounded-2xl space-y-5`).
   - Starts directly at the top of the viewport aligned with the Canvas.
   - Houses:
     - Editable Sample Text & quick preset buttons (`Short`, `Medium`, `Long` / `2 Lines`, `3 Lines`, `Code`).
     - Dynamic type-specific options (Arrow callout label, 8-direction placement grid, curve trajectories, arrowhead styles, passes, distance & offset sliders, curvature, invert button, Box/Circle/Bracket parameters).
     - Color presets with active ring/glow.
     - Stroke Width and Animation Duration sliders.

3. **Column 3 — Live Canvas & Code Box (`lg:col-span-5 xl:col-span-5`)**:
   - Includes `lg:sticky lg:top-24` so the preview card remains visible while scrolling down deep control panels (e.g. arrow options).
   - Top card: Live Canvas preview card with the warm paper grid `#f5f2eb`, re-render key triggers, and annotations.
   - Bottom card: React Component Snippet card with one-click copy button and syntax display.

### 3.3 Responsive Adaptations
- **Desktop (`lg` and `xl`, $\ge 1024\text{px}$)**: Full 3-column side-by-side layout (`col-span-3`, `col-span-4`, `col-span-5`).
- **Tablet / Medium (`md`, $768\text{px} - 1023\text{px}$)**:
  - Top row: Annotation Type (horizontal pills or 2-col compact grid) or left-docked with controls.
  - Controls and Canvas adapt to 2-column or stacked flow.
- **Mobile ($< 768\text{px}$)**:
  - Natural vertical stack:
    1. Annotation Type selector (compact)
    2. Live Canvas preview (immediate feedback on type change)
    3. Controls panel (fine tuning)
    4. Code snippet box

---

## 4. State Management & Component Contracts

- All existing React state hooks in `RoughlyPage` (`text`, `selectedType`, `selectedColor`, `strokeWidth`, `duration`, `bracketSide`, `bracketStyle`, `arrowPlacement`, `arrowVariant`, `arrowheadStyle`, `arrowIterations`, `arrowDistance`, `arrowOffset`, `arrowCurvature`, `arrowFlip`, `circlePaddingX`, `circlePaddingY`, `boxVariant`, etc.) remain identical and fully preserved.
- Code generator `generateSnippet()` continues to produce accurate copyable JSX snippets reflecting active controls.
- Replay draw mechanism (`replayKey` increment) functions seamlessly across all annotation types.

---

## 5. Verification Plan

### Automated Checks
- Run TypeScript build check: `pnpm --filter docs build` or `pnpm turbo build` to confirm zero type errors or broken imports.

### Manual Verification
1. Navigate to `/roughly` in the docs app.
2. Verify the 3-column alignment on desktop:
   - Left: Annotation Type selector.
   - Middle: Controls panel starting at top level.
   - Right: Live Canvas preview and code snippet.
3. Switch between all 8 annotation types (`underline`, `circle`, `strike-through`, `cross-off`, `bracket`, `box`, `highlight`, `arrow`) and confirm controls update dynamically in the middle column.
4. Modify text, arrow placements, trajectories, curvature, colors, and sliders; verify real-time canvas rendering at eye level.
5. Verify sticky behavior of the right-hand canvas when scrolling through extensive arrow controls.
6. Verify responsive layout on mobile viewport.
