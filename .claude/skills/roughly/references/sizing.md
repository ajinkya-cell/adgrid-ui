# Sizing and clearance

Everything scales with the **computed font size of the annotated text** (`fs`, in px). Find it from the
Tailwind class (`text-base` = 16, `text-lg` = 18, `text-xl` = 20, `text-2xl` = 24, `text-3xl` = 30,
`text-4xl` = 36, `text-5xl` = 48, `text-6xl` = 60, `text-7xl` = 72) or the CSS. For responsive type
(`text-4xl sm:text-6xl`) compute the stroke for both sizes; if they differ by more than 1, use the
**midpoint** (36px → 2.5 and 60px → 4 gives 3) and check both shots. Don't swap `strokeWidth` with a
media-query hook: one value that reads well at both sizes is more robust. Padding and clearance follow the
larger size (more room is harmless; too little overlaps).

These values were tuned on screenshots at 16, 32, 48 and 64px on dark and light pages.

## Stroke width

`strokeWidth ≈ fs / 14`, rounded to 0.5, clamped to **1.5 … 4**.

| Text | fs | Underline / circle / box / cross | Strike | Bracket | Arrow |
|---|---|---|---|---|---|
| Small / UI | 12–14 | 1.5 | 1.5 | 1.5 | 1.5 |
| Body | 16–18 | 1.5–2 | 1.5 | 2 | 2 |
| Lead / H4 | 20–24 | 2 | 2 | 2 | 2 |
| H3 / H2 | 28–36 | 2.5 | 2 | 2.5 | 2.5 |
| H1 | 40–48 | 3 | 2.5 | 3 | 2.5 |
| Hero | 56–80+ | 3.5–4 | 3 | 3 | 3 |

- Strikes are half a step lighter than other marks: the text must stay readable through them.
- Never below 1.5 (it disappears on low-DPI screens) or above 4 (it looks like a marker accident).
- `Check` marks size themselves from the line height; leave `size` and `strokeWidth` at defaults unless
  the list text is ≥ 24px (then `strokeWidth={3}`).
- Highlights don't take `strokeWidth` normally — the marker height follows the text. Leave it unset.

## Padding (how far the mark sits from the text)

| Mark | Prop | Formula | 16px | 32px | 48px | 64px |
|---|---|---|---|---|---|---|
| Circle | `paddingX`, `paddingY` | 0.35em, 0.15em | 6, 3 | 11, 5 | 17, 7 | 22, 10 |
| Box | `padding={[y, x]}` | 0.2em, 0.4em (min 4, 8) | [4, 8] | [6, 13] | [10, 19] | [13, 26] |
| Highlight | `padding={[y, x]}` | 0.1em, 0.25em (min 2, 4) | [2, 4] | [3, 8] | [5, 12] | [6, 16] |
| Cross-off | `padding` | 0.3em (min 4) | 5 | 10 | 14 | 19 |
| Bracket | `bracketPadding` | 10–16 | 10 | 12 | 14 | 16 |
| Underline | — | fixed (sits ~4px under the baseline) | | | | |

The circle's defaults (`paddingX 22, paddingY 10`) are for display type; **always pass them for body
text**, or the loop swallows neighbouring words.

## Clearance (reserve space so marks don't sit on neighbours)

Circle, box, highlight, cross, arrow and sticky are drawn **outside** their element and take **no layout
space**. You must reserve it:

| Mark | Reserve |
|---|---|
| Circle | `margin-inline ≥ paddingX + strokeWidth`; `margin-block ≥ paddingY + 0.2em + strokeWidth` whenever there is text above/below (the ellipse is drawn around the font's content box, which is ~1.2em tall — taller than a tight line box) |
| Box | `margin ≥ padding + strokeWidth` on every side that has a neighbour |
| Highlight (inline) | none horizontally (it's a marker); keep `leading-normal` or more so lines don't overlap |
| Cross-off | same as its `padding` |
| Underline | ~6px below the line: keep `leading-snug` or more on the next line (headlines with `leading-none` collide). Always `whitespace-nowrap` on the target |
| Arrow | see below |
| Sticky | `width + offset + 12` on its side (the tilt adds ~12px) |

### Arrow geometry

`size` scales the whole arrow. Length `D = 65 × size` px, gap to the target `8 × size` px. The label sits
`labelDistance` (default 8) beyond the tail.

| Target | `size` | `strokeWidth` | `labelFontSize` |
|---|---|---|---|
| Inline word in body text | 0.7–0.8 | 1.5–2 | 18–20 |
| Button / input / card | 1–1.2 | 2–2.5 | 20–24 |
| Hero heading / big screenshot | 1.4–1.8 | 2.5–3 | 26–34 |

Label font size ≈ 1.2–1.5× the surrounding body text; Caveat (default) at < 18px is hard to read.

Space the arrow needs **beyond the target's edge**:

| `placement` | Block space (above/below) | Inline space (side) |
|---|---|---|
| `top-right` / `top-left` | above: `73·size + 8 + 1.2·labelFontSize` | right/left: `49·size + labelWidth/2` |
| `bottom-right` / `bottom-left` | below: same as above | right/left: same |
| `top` / `bottom` | that side: same | ~`23·size + labelWidth/2` to the right |
| `left` / `right` | none | that side: `73·size + 8 + labelWidth` |

`labelWidth` ≈ characters × 0.45 × `labelFontSize` for Caveat. Example: a `size={1.2}` arrow at
`bottom-right` of a button with "free, no card" at 24px needs ~120px below and ~140px to the right
(`pb-[120px] pr-[140px]` on the wrapper, or make sure that space is genuinely empty).

## Sticky note

| Prop | Value |
|---|---|
| `width` | 140–180 (150 default). Wider than 200 stops looking like a sticky |
| `fontSize` | 18–22 (Caveat) |
| text | ≤ 12 words → 2–3 lines |
| `rotate` | leave default (±4°); never more than ±8° |
| `offset` | 6 default; negative (-12…-24) to overlap the target's corner like it's stuck on |

## Handwriting

`fontSize` 36–56 for a signature, `strokeWidth` 1–1.5. Keep ≤ 6 words. It renders the glyph outlines; the
bigger it is the longer the draw (default duration 1200ms is right for 1–2 words; +300ms per extra word).

## Animation timing

| Mark | `animationDuration` | Notes |
|---|---|---|
| Underline, strike | 500–700 (default 650) | short marks should be quick |
| Circle, box, highlight | 700–900 (default 800) | |
| Bracket | 600–800 | |
| Arrow | 700–900 (default 800) | head and label follow the shaft automatically |
| Check | 400–500 per row | stagger rows 120–180ms |
| Sticky | 450–600 | |

Total choreography of a section: ≤ 2s from first to last mark. See `composition.md` for ordering.
