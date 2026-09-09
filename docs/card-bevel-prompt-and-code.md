# Card Bevel & Top Border Copy Kit

This document provides a **copy-pasteable AI prompt**, **extracted source code**, and **ready-to-use snippets** to replicate the exact top border highlight and tactile 3D bevel effect from `SimpleCard`.

---

## 1. AI Prompt (Copy & Paste to Any AI Assistant)

Use the prompt below whenever you want an AI to implement this exact border flare and 3D bevel card aesthetic in React, Tailwind, or standard CSS:

```text
Create a modern dark-mode card component (#151515 background) featuring a premium tactile 3D bevel feel and a top prismatic border highlight overlay.

Key Styling Requirements:
1. Top Prismatic Border Flare Overlay:
   - Position: absolute top-0 inset-x-0 with height of 1.5px, pointer-events-none, z-index 20.
   - Border radius: top corners rounded to match the container card (e.g., rounded-t-2xl).
   - Background Gradient: 90-degree horizontal gradient fading from transparent at 0%, to rgba(255,255,255,0.18) at 25%, to rgba(255,255,255,0.32) at 50%, back to rgba(255,255,255,0.18) at 75%, and transparent at 100%.

2. Multi-Layer Tactile 3D Bevel Box-Shadow & Perimeter Border:
   - Base Border: 1px solid rgba(255, 255, 255, 0.08)
   - Box-Shadow layers (MUST combine all 4):
     a) Top Inset Bevel Highlight: 0 2px 0 0 rgba(255, 255, 255, 0.06) inset
     b) Bottom Inset Rim Shadow: 0 -1px 0 0 rgba(0, 0, 0, 0.5) inset
     c) Deep Ambient Drop Shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.7)
     d) Crisp Elevation Shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.5)

3. Card Dimensions & Layout:
   - Rounded corners: rounded-2xl (16px radius).
   - Clean dark surface (#151515) with subtle inner padded content.
```

---

## 2. Direct Code Extract (Copy & Paste)

### A. The Top Border Highlight Element
Place this as the **first child inside your card** (ensure card has `relative overflow-hidden`):

```tsx
{/* Top Prismatic Border Highlight Overlay */}
<div
  className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl"
  style={{
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
  }}
/>
```

### B. The 3D Bevel Card Container Style
Apply these inline styles or CSS class to your card element:

```tsx
style={{
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow:
    "0 2px 0 0 rgba(255,255,255,0.06) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 32px 64px -12px rgba(0,0,0,0.7), 0 4px 24px -4px rgba(0,0,0,0.5)",
}}
```

---

## 3. Complete Drop-In Component (`BeveledCard.tsx`)

Here is a standalone, reusable React component ready to drop into any project:

```tsx
"use client";

import React from "react";

export type BeveledCardProps = {
  children?: React.ReactNode;
  className?: string;
  /** Primary highlight color stop (default: rgba(255,255,255,0.18)) */
  topHighlightColor?: string;
};

export function BeveledCard({
  children,
  className = "",
  topHighlightColor = "rgba(255,255,255,0.18)",
}: BeveledCardProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-[#151515] ${className}`}
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 2px 0 0 rgba(255,255,255,0.06) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 32px 64px -12px rgba(0,0,0,0.7), 0 4px 24px -4px rgba(0,0,0,0.5)",
      }}
    >
      {/* Prismatic Top-Border Highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${topHighlightColor} 25%, rgba(255,255,255,0.32) 50%, ${topHighlightColor} 75%, transparent 100%)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 p-4">
        {children}
      </div>
    </div>
  );
}
```

---

## 4. Pure CSS Class Version

If you are using raw CSS / SCSS:

```css
.beveled-card {
  position: relative;
  background-color: #151515;
  border-radius: 1rem; /* 16px */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 2px 0 0 rgba(255, 255, 255, 0.06) inset,
    0 -1px 0 0 rgba(0, 0, 0, 0.5) inset,
    0 32px 64px -12px rgba(0, 0, 0, 0.7),
    0 4px 24px -4px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* Prismatic top border highlight */
.beveled-card::before {
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
