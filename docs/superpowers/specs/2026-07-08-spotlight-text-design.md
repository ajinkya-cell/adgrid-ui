# Design Spec: Spotlight Text Component

**Date**: 2026-07-08  
**Status**: Approved

---

## 1. Goal

Build a **SpotlightText** React component for the adgrid-ui library. Hovering over the text activates a warm golden spotlight clipped to glyph pixels only — the background stays flat. Idle text appears debossed/engraved; the lit area inverts to a raised embossed golden glow. Every `i` and `j` gets an auto-detected ascender-dot bulb that fades in on hover.

---

## 2. Themes

| Token | Light | Dark |
|---|---|---|
| Surface | `#eaeaea` | `#1a1a1a` |
| Idle text | `#b8b8b8` | `#454545` |
| Deboss highlight | `0 1px 0 rgba(255,255,255,0.9)` | `0 -1px 0 rgba(255,255,255,0.06)` |
| Deboss shadow | `0 -1px 2px rgba(0,0,0,0.15)` | `0 2px 4px rgba(0,0,0,0.6)` |
| Glow core | `#d4c050` | `#e8c848` |
| Glow mid | `#c0a830` | `#c8a030` |
| i-dot bulb | `#e8e85a` | `#f0e868` |

---

## 3. Technical Approach

**Dual-layer + `background-clip: text`** (recommended):

- **Base layer**: debossed gray text via `text-shadow`
- **Glow layer**: identical text, `color: transparent`, radial gradient at `--spotlight-x` / `--spotlight-y`, `background-clip: text`
- **i-dot bulbs**: parse text for `i`/`j`, wrap each in a positioned span with an absolutely-placed bulb element

---

## 4. i-Dot Behavior (Option A — Approved)

Auto-detect every `i` and `j` in the text. Place a ~16px warm yellow bulb at each ascender dot. Bulb opacity 0 → 1 on container hover; brightest when cursor is near the dot.

---

## 5. API

```typescript
export type SpotlightTextTheme = "light" | "dark";

export interface SpotlightTextProps {
  text: string;
  theme?: SpotlightTextTheme;
  spotlightRadius?: number;
  fontSize?: string | number;
  fontWeight?: number;
  letterSpacing?: string;
  showBulb?: boolean;
  glowColors?: { core?: string; mid?: string; bulb?: string };
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
}
```

---

## 6. File Structure

```
packages/ui/src/animated/spotlight-text/
├── SpotlightText.tsx
├── types.ts
├── themes.ts
├── hooks/useSpotlightCursor.ts
└── index.ts
```

---

## 7. Accessibility

- Glow layer: `aria-hidden`
- Base layer carries readable text
- `prefers-reduced-motion`: static warm tint, no cursor tracking
- Touch: `touchmove` / `touchstart` for mobile spotlight
