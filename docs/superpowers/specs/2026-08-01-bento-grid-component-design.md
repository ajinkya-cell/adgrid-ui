# BentoGrid Component Design Spec

## Overview
Design and implement a standalone **BentoGrid** component for VoidUI using our signature **3D Skeuomorphic Bevel** design language, **DM Sans** typography, minimal title + description text, and dynamic interactive logo hover animations.

---

## 1. Design Principles & Specifications

### A. 3D Bevel Aesthetic (`skeuo-bevel-card`)
- **Card Shell**: Dark metallic background (`#161616`) with top bevel highlight (`border-t: 1px solid rgba(255, 255, 255, 0.22)`), subtle side borders (`border-x: 1px solid rgba(255, 255, 255, 0.03)`), and bottom thickness lip (`border-b: 1px solid rgba(0, 0, 0, 0.6)`).
- **Socket Display Well**: Recessed inner socket (`#080808` with `inset 0 2px 5px rgba(0, 0, 0, 0.85)`) housing the animated logo.

### B. Typography
- **DM Sans Font**: Exclusively applied to titles and descriptions (`font-family: 'DM Sans', sans-serif`).
- **Minimal Content**: Each card contains **ONLY** a title and description, avoiding verbose copy or cluttered UI elements.

### C. Animated Logo on Hover
- **Interactive SVG Logo**: Each card features a custom VoidUI logo/icon (e.g. Void Cube, Cyber Sphere, Matrix Pulse, Quantum Loop, Titanium Shield, Spark Core).
- **Hover Micro-Interactions**:
  - Logo scales and rotates smoothly (`group-hover:scale-110 group-hover:rotate-12`).
  - Accent stroke/glow illuminates (`group-hover:drop-shadow-[0_0_15px_rgba(167,139,250,0.85)]`).
  - Pulsing background ring expands.

---

## 2. File Modifications & Structure

1. **`apps/docs/src/app/globals.css`**: Add DM Sans font `@import` and `--font-dm-sans` theme token.
2. **`packages/ui/src/animated/BentoGrid.tsx` [NEW]**: Create the `BentoGrid` and `BentoGridItem` component exports.
3. **`packages/ui/src/index.ts` [MODIFY]**: Export `BentoGrid` and `BentoGridItem` from `@adgrid-ui/ui`.
4. **`apps/docs/src/app/bento-demo/page.tsx` or component preview**: Showcase `BentoGrid` in action.

---

## 3. Verification Plan

1. **Build Verification**: Run `pnpm --filter @adgrid-ui/ui build` and `pnpm --filter docs build`.
2. **Visual Verification**: Confirm bevel shadows, DM Sans typography, and smooth logo hover animations.
