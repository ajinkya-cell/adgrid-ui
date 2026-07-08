# Design Spec: Spotlight Text Card Refinement

**Date**: 2026-07-08  
**Status**: Approved  

---

## 1. Goal

Refine the wrapper card of the **SpotlightText** component within the docs pages. The main goals are:
1. **Remove full borders**: Change the card border to be top-and-bottom only (`border-y border-border-hairline`).
2. **Rounded corners**: Increase the corner roundness from `rounded-xl` to `rounded-2xl` for a smoother appearance.
3. **Sophisticated shadow & inner border**: Implement an ambient background drop shadow with an inset top-edge highlight and a full 360-degree subtle inner 1px border (`inset_0_0_0_1px_rgba(255,255,255,0.05)`).
4. **Remove label and icon**: Completely remove the top-left "Spotlight" label and top-right `✦` icon box.
5. **Symmetric padding**: Adjust top padding from `pt-10`/`pt-9` to symmetric padding (`p-6`/`p-5`).
6. **No main code edits**: Ensure that the core implementation under `packages/ui/src/animated/spotlight-text/` is not touched.

---

## 2. Targeted Files

*   `apps/docs/src/components/presentation/PresentationRenderer.tsx`
*   `apps/docs/src/components/presentation/PreviewOverlay.tsx`

---

## 3. Style Updates

### 3.1 PresentationRenderer

Modify the container element for `spotlight-text` case.

**Before:**
```tsx
<div className="relative bg-surface-charcoal border border-border-hairline rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] transition-shadow duration-300 p-6 pt-10">
  <span className="absolute top-3 left-4 font-mono text-[8px] text-text-muted tracking-[0.2em] font-bold uppercase">
    Spotlight
  </span>
  <div className="absolute top-3 right-4 w-6 h-6 flex items-center justify-center border border-border-hairline bg-pure-black rounded">
    <span className="text-[8px] text-text-muted">✦</span>
  </div>
  <SpotlightText {...spotlightTextProps} />
</div>
```

**After:**
```tsx
<div className="relative bg-surface-charcoal border-y border-border-hairline rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_35px_70px_-10px_rgba(0,0,0,1),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 p-6">
  <SpotlightText {...spotlightTextProps} />
</div>
```

### 3.2 PreviewOverlay

Modify the container element for `spotlight-text` case.

**Before:**
```tsx
<div className="relative w-full max-w-[280px] bg-surface-charcoal border border-border-hairline rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] transition-shadow duration-300 p-5 pt-9">
  <span className="absolute top-3 left-4 font-mono text-[8px] text-text-muted tracking-[0.2em] font-bold uppercase">
    Spotlight
  </span>
  <div className="absolute top-3 right-4 w-6 h-6 flex items-center justify-center border border-border-hairline bg-pure-black rounded">
    <span className="text-[8px] text-text-muted">✦</span>
  </div>
  <UI.SpotlightText text="Antimetal" theme="light" fontSize="2.5rem" />
</div>
```

**After:**
```tsx
<div className="relative w-full max-w-[280px] bg-surface-charcoal border-y border-border-hairline rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 p-5">
  <UI.SpotlightText text="Antimetal" theme="light" fontSize="2.5rem" />
</div>
```
