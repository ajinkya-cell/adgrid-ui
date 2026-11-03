# Colour

## The rules

1. **Always pass `color`.** Each Roughly type has a different default (indigo underline, pink circle,
   emerald box, amber arrow, red strike…). Leaving defaults on gives you a rainbow.
2. **One ink per page.** Every non-semantic mark (underline, circle, box, bracket, arrow + label,
   handwriting) uses the same ink, like one pen. Define it once: `const INK = "#FCD34D";`
3. **Semantic colours only for semantic marks.** Red = removed / wrong / not included (strike, cross-off,
   cross mark). Green = done / included (check mark). Never use red for emphasis or green for decoration.
4. **At most 2 emphasis hues on screen**: the ink + the highlighter (or the ink + one semantic colour).
   A checklist's green checks and red crosses are one semantic pair and don't break this rule.
5. **Contrast.** Strokes need ≥ 3:1 against the background (WCAG non-text). Highlighted text needs ≥ 4.5:1
   against the highlighter colour (as blended over the page).

## Picking the ink

Use the site's accent colour if it passes 3:1 against the background; otherwise shift it lighter (on dark)
or darker (on light) until it does. If the site is monochrome/neutral, use a pencil ink (below) or
amber — a warm hand-drawn colour reads as "a person wrote this" against a cold UI.

### Dark surfaces (background lightness < ~25%)

| Ink | Hex | Use |
|---|---|---|
| Amber (default pick) | `#FCD34D` | Most pages. Warm, legible, reads as a marker |
| Sky | `#7DD3FC` | Cool/technical brands |
| Rose | `#FDA4AF` | Playful brands (not near red semantic marks) |
| Lime | `#BEF264` | Energetic; avoid next to green check marks |
| Chalk / pencil | `#E7E5E4` | Monochrome design systems; subtle, editorial |

Avoid mid-tone saturated colours (`#6366F1`, `#EC4899`, `#10B981`) as stroke ink on near-black: they sit
around 3–4.5:1 and thin strokes look muddy.

| Highlighter on dark | Hex | `opacity` | Text colour |
|---|---|---|---|
| Indigo (default) | `#4338CA` | 0.85 | white / neutral-100 |
| Plum | `#6D28D9` | 0.8 | white |
| Deep teal | `#0F766E` | 0.85 | white |
| Amber-brown | `#92400E` | 0.85 | white |

Never a light highlighter (yellow-200) under white text on a dark page — the text vanishes.

### Light surfaces

| Ink | Hex | Use |
|---|---|---|
| Blue (default pick) | `#2563EB` | Most pages; reads like a ballpoint pen |
| Orange | `#EA580C` | Warm brands |
| Violet | `#7C3AED` | Creative brands |
| Graphite | `#262626` | Editorial/monochrome; like a pencil |

| Highlighter on light | Hex | `opacity` | Text colour |
|---|---|---|---|
| Yellow (classic) | `#FDE68A` | 0.8 | neutral-900 |
| Green | `#BBF7D0` | 0.8 | neutral-900 |
| Blue | `#BFDBFE` | 0.8 | neutral-900 |
| Pink | `#FBCFE8` | 0.8 | neutral-900 |

### Semantic colours

| Meaning | On dark | On light |
|---|---|---|
| Removed / not included (strike, cross-off, `mark="cross"`) | `#F87171` | `#DC2626` |
| Included / done (`mark="check"`) | `#4ADE80` | `#15803D` |

### Sticky notes

Paper `#FDE68A` (default yellow) with ink `#3B2A14` works on both dark and light pages. Alternatives:
`#FBCFE8` pink, `#BAE6FD` blue, `#D9F99D` green — one paper colour per page. The label ink stays dark
brown/graphite regardless of the page ink: it's written on paper, not on the page.

## Pages with both themes

If the site switches light/dark, the ink must switch too. Read the theme the same way the site does
(e.g. `useTheme()` from next-themes, a `dark` class on `<html>`, or a CSS variable) and pick from the tables:

```tsx
const { resolvedTheme } = useTheme();
const INK = resolvedTheme === "dark" ? "#FCD34D" : "#2563EB";
```

Pass a real colour value (hex/rgb). Don't pass `var(--…)`: several marks write the colour into SVG
`stroke`/`fill` attributes, where CSS variables aren't reliable.

## Images and colourful backgrounds

On photos, gradients or brand-coloured sections, test the ink on the screenshot. If any part of the stroke
drops below 3:1 against what's behind it, switch to white (dark/busy image) or graphite (light image), and
consider a slightly heavier stroke (+0.5).
