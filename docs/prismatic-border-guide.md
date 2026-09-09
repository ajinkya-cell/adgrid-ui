# Crafting Prismatic & Layered Card Borders

This guide extracts and breaks down the high-end border and depth technique used in the `SimpleCard` component. It explains how each layer contributes to the sleek, tactile aesthetic and provides modular ways to reuse it in your projects.

---

## Anatomical Breakdown

The visual depth comes from combining **4 distinct layers**:

```
┌─────────────────────────────────────────────────────────┐  ◄── 1. Top Prismatic Highlight (Gradient line overlay, 1.5px)
│ ┌─────────────────────────────────────────────────────┐ │  ◄── 2. Top Inset Highlight (box-shadow inset light)
│ │                                                     │ │
│ │                      CONTENT                        │ │  ◄── 3. Base Outer Border (1px subtle border)
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │  ◄── 4. Bottom Inset Rim Shadow (box-shadow inset dark)
└─────────────────────────────────────────────────────────┘  ◄── Ambient Elevation Shadows (0 32px 64px -12px)
```

### 1. Prismatic Top-Border Flare
An overlay element positioned absolute at the top with a multi-stop horizontal linear gradient:
- **Gradient Formula**: `linear-gradient(90deg, transparent 0%, <accent> 25%, rgba(255,255,255,0.32) 50%, <accent> 75%, transparent 100%)`
- **Effect**: Creates a light-reflection lens flare across the top edge without bleeding onto the sides.

### 2. Multi-Layer Box Shadow (Depth & Inset Rims)
Combines inset light & dark rim strokes with multi-stage drop shadows:
- `0 2px 0 0 rgba(255,255,255,0.06) inset`: Simulates top inner bevel reflection.
- `0 -1px 0 0 rgba(0,0,0,0.5) inset`: Simulates bottom inner edge shadow.
- `0 32px 64px -12px rgba(0,0,0,0.7)`: Deep ambient shadow for grounding.
- `0 4px 24px -4px rgba(0,0,0,0.5)`: Crisp near shadow for elevation.

### 3. Outer Base Border
- `1px solid rgba(255,255,255,0.08)`: Low-contrast border that keeps the dark container clean against dark backdrops.

---

## Implementations

### Option A: Reusable React Wrapper Component

```tsx
import React from "react";

export type PrismaticCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Color stop for the sides of the top lens flare (default: white at 18% opacity) */
  topBorderColor?: string;
  borderRadius?: string; // e.g. "1rem" or "16px"
};

export function PrismaticCard({
  children,
  className = "",
  topBorderColor = "rgba(255, 255, 255, 0.18)",
  borderRadius = "1rem",
}: PrismaticCardProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#151515] ${className}`}
      style={{
        borderRadius,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: `
          0 2px 0 0 rgba(255, 255, 255, 0.06) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.5) inset,
          0 32px 64px -12px rgba(0, 0, 0, 0.7),
          0 4px 24px -4px rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* Prismatic Top Highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20"
        style={{
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          background: `linear-gradient(90deg, transparent 0%, ${topBorderColor} 25%, rgba(255,255,255,0.32) 50%, ${topBorderColor} 75%, transparent 100%)`,
        }}
      />

      {children}
    </div>
  );
}
```

---

### Option B: Pure CSS (Pseudo-elements)

If you prefer CSS without extra nested HTML nodes:

```css
.prismatic-card {
  position: relative;
  background-color: #151515;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 2px 0 0 rgba(255, 255, 255, 0.06) inset,
    0 -1px 0 0 rgba(0, 0, 0, 0.5) inset,
    0 32px 64px -12px rgba(0, 0, 0, 0.7),
    0 4px 24px -4px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* Prismatic top border highlight via ::before */
.prismatic-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  z-index: 20;
  pointer-events: none;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.18) 25%,
    rgba(255, 255, 255, 0.32) 50%,
    rgba(255, 255, 255, 0.18) 75%,
    transparent 100%
  );
}
```

---

### Option C: Tailwind Utility Extension (`tailwind.config.js`)

You can map the complex `boxShadow` into standard Tailwind utilities:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'prismatic': `
          0 2px 0 0 rgba(255, 255, 255, 0.06) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.5) inset,
          0 32px 64px -12px rgba(0, 0, 0, 0.7),
          0 4px 24px -4px rgba(0, 0, 0, 0.5)
        `,
      },
    },
  },
}
```

Then use in Tailwind HTML/JSX:

```html
<div class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-prismatic">
  <div class="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
  <!-- Card content -->
</div>
```

---

## Customization Variations

| Variation | `topBorderColor` / Gradient | Effect |
| :--- | :--- | :--- |
| **Neon Cyan** | `rgba(56, 189, 248, 0.4)` | Modern futuristic tech card |
| **Warm Gold** | `rgba(251, 191, 36, 0.4)` | Premium / VIP tier highlight |
| **Emerald Cyber** | `rgba(52, 211, 153, 0.4)` | Active / Online indicator card |
| **Subtle Pearl** | `rgba(255, 255, 255, 0.18)` | (Default) Elegant dark-mode glass bevel |
