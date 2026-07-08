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
6. **Slow, smooth glow transition**: Transition the radial glow on hover via a smooth opacity fade over 800ms using a `cubic-bezier(0.16, 1, 0.3, 1)` easing curve.

---

## 2. Targeted Files

*   `apps/docs/src/components/presentation/PresentationRenderer.tsx`
*   `apps/docs/src/components/presentation/PreviewOverlay.tsx`
*   `packages/ui/src/animated/spotlight-text/SpotlightText.tsx`

---

## 3. Style Updates

### 3.1 PresentationRenderer

Modify the container element for `spotlight-text` case.

```tsx
<div className="relative bg-surface-charcoal border-y border-border-hairline rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_35px_70px_-10px_rgba(0,0,0,1),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 p-6">
  <SpotlightText {...spotlightTextProps} />
</div>
```

### 3.2 PreviewOverlay

Modify the container element for `spotlight-text` case.

```tsx
<div className="relative w-full max-w-[280px] bg-surface-charcoal border-y border-border-hairline rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 p-5">
  <UI.SpotlightText text="Antimetal" theme="light" fontSize="2.5rem" />
</div>
```

```tsx
opacity: isActive ? 1 : 0,
transition: "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)",
```
