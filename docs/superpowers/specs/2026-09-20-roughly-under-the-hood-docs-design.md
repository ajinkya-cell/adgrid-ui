# Roughly Under The Hood Documentation Spec

**Date:** 2026-09-20  
**Status:** Approved  
**Topic:** Minimal and Subtle "Under The Hood" Technical Documentation Page for Roughly (`/docs/roughly`)

---

## 1. Objective & Scope

Create a minimal, technical, and subtle documentation page for Roughly accessible at `/docs/roughly`. The page focuses strictly on the engineering mechanics and algorithms operating under the hood:
1. Jitter algorithms & mathematical perturbation (bowing, roughness, double sketch loops).
2. SVG path synthesis & GPU-accelerated stroke dash draw animation.
3. Font-ready geometry synchronization & ascender/descender protection.
4. Dynamic trajectory mathematics & tangent angles (RoughArrow vector physics).
5. Layout shift immunity & containing block boundaries.

The design avoids marketing fluff, maintaining a restrained, high-friction Void UI aesthetic with crisp monospace typography and bite-sized technical diagrams.

---

## 2. Information Architecture & Routing

### 2.1 Route Structure
- **Target Page**: `apps/docs/src/app/docs/roughly/page.tsx` (or integrated into `apps/docs/src/app/docs/[...slug]/page.tsx` under `pageSlug === "roughly"`).
- **Sidebar Integration**: In `apps/docs/src/components/site/Sidebar.tsx`, add an "Extension" section or item under Foundation:
  ```tsx
  { label: "Roughly (Architecture)", icon: "draw", href: "/docs/roughly" }
  ```
- **Cross-linking**:
  - Add a subtle header pill link on `apps/docs/src/app/roughly/page.tsx`:
    `"Under the Hood Architecture ↗"`
  - Add a link on `/docs/roughly` to `"Open Interactive Studio ↗"`.

---

## 3. Content Architecture

### 3.1 Hero Header
- Category badge: `DOCUMENTATION // ARCHITECTURE`
- Title: `Roughly: Under The Hood`
- Summary: Concise single-sentence overview of vector jitter synthesis and layout-shift immunity.
- Quick navigation pills: `[Interactive Studio ↗]` and `pnpm add @adgrid-ui/ui`.

### 3.2 Technical Deep Dive Sections

#### Section 01: Jitter Algorithm (Emulating Human Imperfection)
- Explanation of pseudo-random coordinate displacement:
  - `roughness` parameter ($1.0 - 2.0$): Jitter variance on Bézier control points.
  - `bowing` parameter: Curvature deviation along the line normal.
- Double-pass sketch loops: Two passes with varying pseudo-random seeds to replicate physical pen friction.

#### Section 02: SVG Path Synthesis & GPU Draw Strokes
- How Ops commands (`move`, `bcurveTo`, `lineTo`) serialize into standard SVG `<path d="..." />` markup.
- Hardware-accelerated entrance animation:
  - Measuring true arc length via `path.getTotalLength()`.
  - Setting `stroke-dasharray = L` and `stroke-dashoffset = L`.
  - Animating to `stroke-dashoffset = 0` via GPU-accelerated CSS keyframe or Framer Motion springs.

#### Section 03: Font-Ready Geometry & Ascender Protection
- The web font bounding box race condition: measuring DOM rects before custom fonts load leads to clipped ascenders and baseline drift.
- Solution: Hooking into `document.fonts.ready` before annotation initialization.
- Balanced symmetric padding matrices `[paddingY, paddingX, paddingY, paddingX]` ensuring circular and boxed annotations retain equal curvature without lateral clipping.

#### Section 04: Vector Trajectory Physics (RoughArrow Mathematics)
- How dynamic callout arrows calculate trajectory:
  - Origin point $P_0$ based on direction anchor (`top-right`, `bottom-left`, etc.) and `distance`.
  - Clearance gap $P_2$ based on target element edge and `offset`.
  - Curvature control point $P_1$ computed via perpendicular normal projection multiplied by `curvature` factor.
  - Tangent orientation angle $\theta = \operatorname{atan2}(P'_y(1), P'_x(1))$ aligning arrowheads precisely to entry trajectory.

#### Section 05: Layout Shift Immunity & Containing Blocks
- How `position: relative` containing block boundaries prevent SVG orphaning against `document.body`.
- Viewport entrance triggers via `IntersectionObserver` (threshold `0.15`) preventing off-screen resource waste.

---

## 4. Design & Aesthetic Specifications

- Container: Max width `max-w-4xl px-8 py-12 mx-auto`.
- Dark palette: Pure black `#09090b` / `#050505` background, `#111114` card containers, `border-white/[0.06]` hairline borders.
- Typography: Strict hierarchy with monospace labels, small caps section numbers (`01 //`, `02 //`), and high-contrast headings.
- Interactive minimal demos: Small, embedded interactive micro-annotations demonstrating each mathematical principle in isolation.

---

## 5. Verification Plan

### Automated Checks
- Run `pnpm turbo build --filter docs` to verify static compilation, type-checking, and routing for `/docs/roughly`.

### Manual Checks
1. Navigate to `/docs/roughly` via the documentation sidebar.
2. Confirm the clean, minimal Void UI aesthetic and technical content.
3. Test the cross-links between the Interactive Studio (`/roughly`) and the Architecture Docs (`/docs/roughly`).
