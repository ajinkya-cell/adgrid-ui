# RoughArrow Callout Label Positioning & Interactive Visual Controls Design

## 1. Overview
Enhance the `RoughArrow` component and its interactive controls on the `/roughly` documentation playground to make positioning callout labels effortless, intuitive, and highly visual.

Key improvements:
1. **New Callout Label Props**:
   - `labelPlacement`: Directional alignment preset around the arrow tail (`"auto"` | `"top"` | `"bottom"` | `"left"` | `"right"`).
   - `labelDistance`: Spacing distance in pixels between the arrow tail and the callout label.
   - `labelRotate`: Rotation tilt in degrees for authentic, playful hand-drawn angles (e.g. `-12deg`, `+8deg`).
   - `labelColor`: Optional custom font color for the callout label (defaults to arrow `color`).
2. **Visual Compass & Arrow Nudge Controls in Playground**:
   - Replace the plain text arrow placement buttons with an 8-direction visual compass grid featuring directional arrow icons (`↖`, `↑`, `↗`, `→`, `↘`, `↓`, `↙`, `←`).
   - Add a dedicated Callout Label Positioning controller with:
     - 5-button `labelPlacement` selector (`Auto`, `Top`, `Bottom`, `Left`, `Right`) with directional icons.
     - An interactive 4-direction arrow nudge pad (`↑`, `↓`, `←`, `→`) + center reset button to easily nudge label offsets with live coordinate feedback.
     - Sliders for `labelDistance` (0px to 40px) and `labelRotate` (-30° to +30°).
   - Update code snippet generator and API documentation in the docs registry.

---

## 2. API & Type System Changes

### 2.1 Types (`packages/ui/src/animated/roughly/RoughArrow.tsx`)
```typescript
export type ArrowLabelPlacement = "auto" | "top" | "bottom" | "left" | "right";
```

### 2.2 `RoughArrowProps` Extensions
```typescript
export interface RoughArrowProps {
  // Existing props...
  label?: React.ReactNode;
  labelFont?: ArrowLabelFont;
  labelFontSize?: number;
  labelFontWeight?: number;
  labelOffsetX?: number;
  labelOffsetY?: number;

  // New positioning props:
  /** Relative placement of label around arrow tail: 'auto' | 'top' | 'bottom' | 'left' | 'right' (default: "auto") */
  labelPlacement?: ArrowLabelPlacement;
  /** Gap distance in pixels between arrow tail and callout label (default: 8) */
  labelDistance?: number;
  /** Rotation angle in degrees for playful hand-drawn tilt (default: 0) */
  labelRotate?: number;
  /** Optional custom text color for the callout label (defaults to arrow color) */
  labelColor?: string;
}
```

---

## 3. Geometric Calculation in `RoughArrow`

### 3.1 Resolving Directional Alignment
In `RoughArrow.tsx`, calculate `labelPos` and `labelTransform`:

1. **Base Tail Position**: `P_tail = { x, y }` from arrow placement and distance.
2. **Effective Placement**:
   If `labelPlacement === "auto"`, infer alignment from arrow `placement`:
   - `top`, `top-right`, `top-left` -> `"top"`
   - `bottom`, `bottom-right`, `bottom-left` -> `"bottom"`
   - `left` -> `"left"`
   - `right` -> `"right"`
3. **Offset Vectors according to `effectivePlacement`**:
   - `"top"`:
     - Position: `{ x: P_tail.x + labelOffsetX, y: P_tail.y - labelDistance + labelOffsetY }`
     - CSS Transform: `translate(-50%, -100%) rotate(${labelRotate}deg)`
   - `"bottom"`:
     - Position: `{ x: P_tail.x + labelOffsetX, y: P_tail.y + labelDistance + labelOffsetY }`
     - CSS Transform: `translate(-50%, 0) rotate(${labelRotate}deg)`
   - `"left"`:
     - Position: `{ x: P_tail.x - labelDistance + labelOffsetX, y: P_tail.y + labelOffsetY }`
     - CSS Transform: `translate(-100%, -50%) rotate(${labelRotate}deg)`
   - `"right"`:
     - Position: `{ x: P_tail.x + labelDistance + labelOffsetX, y: P_tail.y + labelOffsetY }`
     - CSS Transform: `translate(0, -50%) rotate(${labelRotate}deg)`

4. **Styling**:
   - Apply `color: labelColor || color`.
   - Apply `transform: labelTransform` with `transformOrigin: "center center"`.

---

## 4. Documentation Playground (`apps/docs/src/app/roughly/page.tsx`)

### 4.1 8-Direction Visual Arrow Placement Grid
Replace plain text buttons with rich visual compass buttons:
```tsx
const PLACEMENT_OPTIONS: { id: ArrowPlacement; label: string; icon: string }[] = [
  { id: "top-left", label: "Top Left", icon: "↖" },
  { id: "top", label: "Top", icon: "↑" },
  { id: "top-right", label: "Top Right", icon: "↗" },
  { id: "right", label: "Right", icon: "→" },
  { id: "bottom-right", label: "Btm Right", icon: "↘" },
  { id: "bottom", label: "Bottom", icon: "↓" },
  { id: "bottom-left", label: "Btm Left", icon: "↙" },
  { id: "left", label: "Left", icon: "←" },
];
```
Each button renders the directional arrow icon prominently beside/above the text, making the direction instantly recognizable.

### 4.2 Callout Label Positioning Control Section
Under the arrow callout controls in `/roughly`:
1. **Placement Preset Buttons** (`grid-cols-5`):
   - `Auto` (⟲), `Top` (↑), `Bottom` (↓), `Left` (←), `Right` (→).
2. **Interactive 4-Way Arrow Nudge Pad**:
   - Compact visual D-pad with 4 directional buttons (`↑`, `↓`, `←`, `→`) and center reset button (`⌂` or `0`).
   - Clicking `↑` decrements `labelOffsetY` by 4px.
   - Clicking `↓` increments `labelOffsetY` by 4px.
   - Clicking `←` decrements `labelOffsetX` by 4px.
   - Clicking `→` increments `labelOffsetX` by 4px.
   - Center button resets offsets to `(0, 0)`.
   - Displays live coordinates: `X: ${labelOffsetX > 0 ? `+${labelOffsetX}` : labelOffsetX}px, Y: ${labelOffsetY > 0 ? `+${labelOffsetY}` : labelOffsetY}px`.
3. **Sliders**:
   - `Label Gap / Distance`: slider from `0px` to `32px` (default: `8px`).
   - `Label Rotation Tilt`: slider from `-25°` to `+25°` (default: `0°`).

### 4.3 Code Snippet & Registry Sync
- Update `generateSnippet()` in `/roughly` to output `labelPlacement`, `labelDistance`, `labelRotate` when set to non-defaults.
- Update `apps/docs/src/registry/index.ts` to document the new props in the roughly registry entry.
- Re-run `pnpm --filter docs build:registry`.

---

## 5. Verification Plan

### Automated Verification
- `pnpm --filter @adgrid-ui/ui typecheck`
- `pnpm --filter @adgrid-ui/ui build`
- `pnpm --filter docs build:registry`

### Visual Verification
- Open `http://localhost:3000/roughly` in headless Edge.
- Switch to Arrow.
- Verify 8-direction compass grid icons render and function cleanly.
- Test clicking each `labelPlacement` option (Top, Bottom, Left, Right, Auto).
- Test clicking arrow nudge pad buttons (↑ ↓ ← →) to verify real-time label offset adjustment.
- Verify rotation tilt slider tilts label appropriately.
- Capture screenshots for walkthrough documentation.
