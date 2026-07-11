# Design Spec: Weapon Wheel Aesthetic Polish (Wheel-2 Variant)

**Date**: 2026-07-11  
**Status**: Approved  

---

## 1. Goal

Refine the **WeaponWheel** component (specifically the `wheel-2` and `wheel-3` variants) to match the approved design details, transitioning the "PropsTable / PropsTweaker card" styling from the outer container of the component to the wheel itself.

1. **Outer Container Card (`innerContent`)**: Remove the conditional `#171717` background, 3D bevel borders, and heavy inset/outset shadows. The outer card will always use the default flat/translucent dark card container (`bg-zinc-950/20 border border-zinc-900/30 backdrop-blur-sm`).
2. **Wheel Background Disk**: Add a new absolute-positioned circular `div` behind the SVG wheel structure. This disk will have a diameter matching the active outer radius of the slices, styled with the `#171717` background, 3D bevel borders, and inset box shadows.
3. **Center Circular Display**: Replace the SVG `<circle>` center background with an HTML absolute overlay `div`, styled with the same bevel borders and inset/outset shadows as the background disk.
4. **Slices Integration**: Override the slice colors for the `wheel-2`/`wheel-3` variant to blend cleanly over the solid `#171717` background disk.

---

## 2. Component Structure Changes

### 2.1 Background Disk
A new wrapper layer is introduced directly behind the `<svg>`:
```tsx
const currentOuterR = isWheel3 ? subOuterR : outerR;

{/* WHEEL BACKGROUND DISK (ONLY FOR WHEEL-2/WHEEL-3) */}
{isWheel2 && (
  <div
    className="absolute rounded-full border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 select-none pointer-events-none"
    style={{
      width: currentOuterR * 2,
      height: currentOuterR * 2,
      backgroundColor: "#171717",
      boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
    }}
  />
)}
```

### 2.2 Center Display Overlay
Replacing the SVG `<circle>` element with an HTML `div` overlay centered over the wheel:
```tsx
{/* CENTER AREA DISPLAY (HTML OVERLAY FOR PERFECT CSS BEVELS & SHADOWS) */}
<div
  className={cn(
    "absolute rounded-full flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-2xl transition-all duration-300",
    isWheel2
      ? "border-t border-white/20 border-x border-white/[0.02] border-b border-white/10"
      : "border border-zinc-800 bg-zinc-950/85 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
  )}
  style={{
    width: innerR * 2,
    height: innerR * 2,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: isWheel2 ? "#171717" : undefined,
    boxShadow: isWheel2
      ? "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 10px 30px rgba(0,0,0,0.5)"
      : undefined
  }}
>
  {/* Content (Active tool name, icon, category) */}
</div>
```

---

## 3. Slice Colors (Wheel-2 specific overrides)

For primary level slices and secondary level nested slices (when `isWheel2` is true):
* **Inactive segment fill**: `rgba(0, 0, 0, 0.15)`
* **Inactive segment stroke**: `rgba(255, 255, 255, 0.04)` (or matching hairline border style)
* **Hover segment fill**: `rgba(255, 255, 255, 0.06)`
* **Hover segment stroke**: `rgba(255, 255, 255, 0.35)`
* **Active segment fill**: `rgba(99, 102, 241, 0.1)`
* **Active segment stroke**: `rgba(99, 102, 241, 0.6)`
