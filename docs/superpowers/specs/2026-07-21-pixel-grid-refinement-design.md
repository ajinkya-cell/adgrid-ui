# PixelGrid Refinement & Machined Pixel Studio Specification

**Date**: 2026-07-21  
**Status**: Proposed / Pending Review  
**Target File**: `packages/ui/src/animated/PixelGrid.tsx`

---

## 1. Overview & Goals

`PixelGrid` will be upgraded into a flagship **Machined Pixel Studio & Fluid Engine**. This transformation fixes critical drawing usability bugs (choppy drag painting and undo stack pollution) while elevating the visual aesthetic with 3D beveled console toolbars, rich retro color palettes, shape tools (Line & Rectangle), live brush hover previews, and authentic physical pixel rendering (micro-beveled pixel blocks + technical checkerboard canvas for empty cells).

---

## 2. Key Refinements & Features

### A. Drawing Engine & Fluid Drag Tracking
- **Global Pointer Tracking**: Move pointer tracking from individual cell `onPointerEnter` handlers to a central board pointer listener (`onPointerDown`, `onPointerMove`, `onPointerUp`). This fixes browser `setPointerCapture` bugs and guarantees 100% fluid drag painting across all grid sizes.
- **Single-Stroke Undo History**: A continuous pointer drag gesture (painting multiple cells) is recorded as **1 single undo action** when released, preventing undo stack pollution.
- **Interactive Hover Cursor**: Displays a live semi-transparent cell highlight ring matching the selected brush size (1x1, 2x2, 3x3) and active color when hovering over the grid.

### B. Refined Pixel & Canvas Aesthetics
- **Physical Pixel Blocks**: Painted pixels feature subtle inner/outer micro-bevels (`shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.4)]`) for an authentic arcade/LED physical pixel block look.
- **Technical Checkerboard Canvas**: Empty/unpainted cells feature a crisp dark checkerboard grid pattern (`#121215` / `#1a1a1e`) so empty canvas cells look like a professional pixel art studio (Aseprite / Photoshop canvas) rather than plain empty gaps.
- **Rich 16-Color Palette**: 16 curated retro & arcade color swatches (Ink, Obsidian, White, Crimson, Amber, Emerald, Cyan, Electric Blue, Violet, Magenta, Coral, Gold, Slate, Mint, Rose, Translucent) + a built-in Hex color input picker.

### C. Toolsuite Expansion
1. **Paint (Brush)**: Freehand drawing with selectable brush sizes (1x1, 2x2, 3x3).
2. **Erase**: Clear cells with brush size support or right-click drag.
3. **Fill (Bucket)**: Flood fill contiguous matching color regions.
4. **Eyedropper (Pipette)**: Click any painted cell to pick its exact color into the active swatch.
5. **Line Tool**: Click-and-drag preview to draw straight pixel lines (Bresenham line algorithm).
6. **Rectangle Tool**: Click-and-drag preview to draw filled or outline rectangles.
7. **Select Tool**: Drag rectangle marquee selection to move or clear selected region.

### D. Machined Console Toolbar & Controls
- **ADGRID Machined Aesthetic**: Recessed console wells, 3D beveled borders, and active LED indicators (`bg-emerald-500 shadow-[0_0_8px_#10b981]`).
- **Tactile Sound Effects**: Subtle web audio mechanical clicks when switching tools, selecting colors, or clearing.
- **Preset Artworks**: Instant switcher with pre-populated, high-resolution artwork templates:
  - Cat
  - Space Invader
  - Sword
  - Heart
  - Retro Controller
  - Star
- **Export Options**:
  - **PNG Download**: Exports the artwork as a high-res PNG image file.
  - **SVG Download**: Exports vector SVG file of the pixel grid.
  - **JSON Copy**: Copies artwork matrix JSON array to clipboard.

---

## 3. Component Interface & Types

```typescript
export type PixelGridTool = "paint" | "erase" | "fill" | "pipette" | "line" | "rectangle" | "select";
export type PixelGridCell = string | null;
export type PixelGridArtwork = PixelGridCell[][];

export interface PixelGridPaletteColor {
  id: string;
  label: string;
  color: string;
}

export interface PixelGridProps {
  value?: PixelGridArtwork;
  defaultValue?: PixelGridArtwork;
  rows?: number;
  columns?: number;
  editable?: boolean;
  palette?: PixelGridPaletteColor[];
  activeColorId?: string;
  defaultTool?: PixelGridTool;
  defaultBrushSize?: number;
  showToolbar?: boolean;
  showGridLines?: boolean;
  cellSize?: number;
  gap?: number;
  backgroundColor?: string;
  gridLineColor?: string;
  emptyColor?: string;
  sound?: boolean;
  className?: string;
  boardClassName?: string;
  onChange?: (artwork: PixelGridArtwork) => void;
}
```

---

## 4. Verification & Testing Plan

1. **Fluid Drag Test**: Click and drag quickly across cells to confirm continuous, unbroken painting without pointer capture dropouts.
2. **Stroke Undo Test**: Paint a multi-cell stroke in one drag, press Undo, verify that the ENTIRE stroke is undone in a single step.
3. **Refined Pixel Appearance**: Verify empty cells display the technical checkerboard pattern and painted cells display crisp micro-beveled pixel blocks.
4. **Tools Test**: Test Bucket Fill, Eyedropper, Line tool, Rectangle tool, Brush sizes, and Preset switcher.
5. **Export Test**: Test PNG download, SVG download, and JSON copy to clipboard.
6. **Build Test**: Run `pnpm --filter docs build` to verify clean compilation without TypeScript or Next.js errors.
