# RoughArrow Component & Playground Evolution: Trajectory, Arrowhead & Callout Fonts

## 1. Overview
Refine the `RoughArrow` component and its Interactive Studio Playground on `/roughly` by:
1. Removing the `"curved"` arrowhead style (retaining `"open"` and `"filled"`).
2. Removing the `"loop"` curve trajectory (retaining `"curved"`, `"s-curve"`, and `"straight"`).
3. Introducing callout label font choices:
   - **Caveat** (Current default handwriting font)
   - **Reenie Beanie** (Tall, light, scratchy ballpoint script)
   - **Cedarville Cursive** (Elegant, classic flowing cursive script)

---

## 2. API & Type System Changes

### 2.1 `ArrowheadStyle`
In `packages/ui/src/animated/roughly/RoughArrow.tsx` and exported via `@adgrid-ui/ui`:
```typescript
export type ArrowheadStyle = "open" | "filled";
```
- `"open"`: Minimal angled hand-drawn chevrons (`>`).
- `"filled"`: Solid sketched triangular arrowhead.
- Deprecate / remove `"curved"`.

### 2.2 `ArrowVariant`
In `packages/ui/src/animated/roughly/RoughArrow.tsx` and exported via `@adgrid-ui/ui`:
```typescript
export type ArrowVariant = "curved" | "straight" | "s-curve";
```
- `"curved"`: Smooth quadratic/cubic arc bow.
- `"s-curve"`: Double-reversed wave trajectory.
- `"straight"`: Direct sketched line from tail to tip.
- Deprecate / remove `"loop"`.

### 2.3 `ArrowLabelFont`
In `packages/ui/src/animated/roughly/RoughArrow.tsx` and exported via `@adgrid-ui/ui`:
```typescript
export type ArrowLabelFont = "caveat" | "reenie-beanie" | "cedarville-cursive";
```
Added to `RoughArrowProps`:
```typescript
export interface RoughArrowProps {
  ...
  /** Callout label font family (default: "caveat") */
  labelFont?: ArrowLabelFont;
}
```

Font class resolution inside `RoughArrow`:
```typescript
const labelFontClassMap: Record<ArrowLabelFont, string> = {
  caveat: "font-[family-name:var(--font-caveat),cursive] text-lg",
  "reenie-beanie": "font-[family-name:'Reenie_Beanie',cursive] text-2xl font-normal tracking-wide",
  "cedarville-cursive": "font-[family-name:'Cedarville_Cursive',cursive] text-lg font-normal",
};
```

---

## 3. Font Asset Provisioning

In `apps/docs/src/app/layout.tsx`:
Add Google Fonts prefetch `<link>`:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Reenie+Beanie&display=swap"
  rel="stylesheet"
/>
```

In `apps/docs/src/app/globals.css`:
```css
.font-reenie-beanie {
  font-family: 'Reenie Beanie', cursive, sans-serif;
}
.font-cedarville-cursive {
  font-family: 'Cedarville Cursive', cursive, sans-serif;
}
.font-caveat {
  font-family: var(--font-caveat, 'Caveat', cursive, sans-serif);
}
```

---

## 4. Interactive Studio Playground Updates (`apps/docs/src/app/roughly/page.tsx`)

1. **Arrowhead Style Selector**:
   - 2-button toggle: `Open` and `Filled`.
2. **Curve Trajectory Selector**:
   - 3-column grid (`grid-cols-3`): `Curved`, `S-Curve`, `Straight`.
3. **Callout Font Selector**:
   - 3-column font picker displaying live font style previews:
     - `Caveat` (Default)
     - `Reenie Beanie`
     - `Cedarville`
   - Dynamically updates the Callout input field font to match the chosen font!
4. **Code Snippet Generator & API Reference**:
   - Updates `generateSnippet()` to include `labelFont="..."` when changed from `"caveat"`.
   - Updates API Reference table to document the refined props.

---

## 5. Verification Plan
1. **Compilation & Type Check**: Run `pnpm turbo build` across both packages (`@adgrid-ui/ui` and `docs`).
2. **Playground Verification**:
   - Select each curve variant (`Curved`, `S-Curve`, `Straight`).
   - Select each arrowhead style (`Open`, `Filled`).
   - Switch between all 3 callout fonts (`Caveat`, `Reenie Beanie`, `Cedarville Cursive`) and observe immediate visual handwriting typography change.
