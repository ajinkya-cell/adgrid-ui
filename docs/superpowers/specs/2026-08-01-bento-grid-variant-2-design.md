# BentoGrid Variant 2 (Radiant Edge Glow) Design Spec

## Overview
Introduce a second variant to the **BentoGrid** component family:
- **Variant 1 (`variant="beveled"`)**: Signature 3D skeuomorphic bevel style with top highlight borders and inset sockets.
- **Variant 2 (`variant="radiant"`)**: Minimalist dark card with soft drop shadows, interactive internal spotlight aura, and **dynamic cursor-tracking edge radiance** illuminating the perimeter as the mouse moves.

---

## 1. Variant 2 Specifications (`variant="radiant"`)

### A. Minimalist Edge Radiance Architecture
- **No Heavy Bevels**: Clean, flat dark card container (`#0c0c0c` / `#101010`) with refined subtle rounded corners (`rounded-xl`).
- **Cursor Tracking**: `onMouseMove` event tracking updates CSS custom variables `--mouse-x` and `--mouse-y` relative to the card dimensions.
- **Perimeter Edge Glow**: An absolute border overlay rendering a `radial-gradient(220px circle at var(--mouse-x) var(--mouse-y), rgba(167,139,250,0.65), transparent 100%)` masked border that highlights the edge wherever the cursor hovers.
- **Internal Spotlight Aura**: Soft radial fill (`radial-gradient(450px circle at var(--mouse-x) var(--mouse-y), rgba(167,139,250,0.08), transparent 80%)`) illuminating the card interior.

### B. Props API
```tsx
export type BentoGridVariant = "beveled" | "radiant";

export interface BentoGridProps {
  children: React.ReactNode;
  variant?: BentoGridVariant;
  className?: string;
}

export interface BentoGridItemProps {
  title: string;
  description: string;
  variant?: BentoGridVariant;
  icon?: BentoIconType;
  className?: string;
  children?: React.ReactNode;
}
```

### C. Typography & Copy
- **DM Sans Font**: Applied to title and description text.
- **Minimal Copy**: Concise title and description.

---

## 2. File Modifications

1. **`packages/ui/src/animated/BentoGrid.tsx`**: Add `variant` prop support (`"beveled" | "radiant"`), cursor-tracking event handler, and radiant edge glow border styles.
2. **`apps/docs/src/components/presentation/PresentationRenderer.tsx`**: Add variant selector toggle or side-by-side showcase of both `beveled` and `radiant` variants.

---

## 3. Verification Plan

1. **Build Verification**: Run `pnpm --filter @adgrid-ui/ui build` and `pnpm --filter docs build`.
2. **Interactive Verification**: Move cursor over `variant="radiant"` cards to verify radiant edge light follow behavior.
