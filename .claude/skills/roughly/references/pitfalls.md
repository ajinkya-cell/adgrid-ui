# Pitfalls: symptom → cause → fix

## On the screenshot

| Symptom | Cause | Fix |
|---|---|---|
| Circle/box loop runs over the neighbouring word | Overlay marks take no layout space | Margin = padding + stroke on that side (sizing.md › Clearance) |
| Circle cuts through the caption/line below | The ellipse wraps the font's content box (~1.2em), taller than a tight line box | `margin-bottom ≥ paddingY + 0.2em + stroke` |
| Underline drawn on the wrong line / only part of it | Target wrapped, and the layout shifted after it was measured (font swap, responsive type) | `className="whitespace-nowrap"` on the underline, or fewer words |
| A highlighted/struck phrase jumps onto its own line and the paragraph reflows | Older Roughly version wrapped multiline marks in `inline-block` | Re-install (`npx shadcn@latest add https://www.voidui.in/r/roughly.json --overwrite`), or pass `className="!inline"` |
| Error page: "Element type is invalid… got: undefined" | `Roughly.X` used in a Server Component | `"use client"` at the top of the file (Structure › Server Components) |
| Arrow or sticky cut off at an edge | An ancestor has `overflow:hidden` / `overflow-x-auto` / `overflow-clip`, or the viewport edge | Reserve space inside the clipping box, move the mark out of it, or change `placement` |
| Horizontal scrollbar at 390px (screenshot.mjs warns) | Reserved side space or a side placement doesn't fit | Responsive placement (`useIsNarrow`) and responsive padding; see composition.md › Mobile |
| Highlight invisible | Marker drawn at z-index −1 slipped behind an opaque parent background | `isolate` (isolation: isolate) on the nearest block parent |
| Highlighted text hard to read | Light marker under light text or dark marker under dark text | Use the pairs in color.md |
| Arrowhead lies along the target's edge or points past it | `bend` set with the wrong sign for the placement (e.g. `bottom-right` with a positive bend) | Remove `bend`; the auto bend lands the head head-on (arrows.md › Bend) |
| Arrow is a loop / half-circle | `bend` beyond ±0.5 | Remove it, or ±0.2–0.4 with the auto sign |
| Arrowhead looks oversized | Thick stroke on a short arrow (head ≥ 3.5 × stroke) | `strokeWidth` 1.5 for `size < 0.8`, or `arrowhead="filled"` |
| Arrow label in the page font, not handwriting | Caveat/Kalam/Reenie Beanie not loaded | setup.md › Fonts |
| Handwriting doesn't render | Font file 404 and the CDN fallback is blocked (CSP/offline) | Put the TTFs in `public/fonts/` |
| Mark offset from its text after load | Web font swapped in after measuring and something stopped the remeasure (fixed widths, `transform: scale` ancestors) | Marks re-measure on resize and `document.fonts.ready`; avoid animating `scale` on an annotated ancestor; or set `animate={false}` and render after fonts load |
| Mark drawn at the wrong place inside an animated/scaled container | rough-notation measures with `getBoundingClientRect`; transforms during entry animations distort it | Delay the mark (`animationDelay` > the container's animation) or annotate outside the transformed element |
| Marks missing in a screenshot | Captured before they drew | Re-run `screenshot.mjs` with `--wait 5000` (it already forces reduced motion so marks render finished) |
| Two marks fighting | Too many marks in one viewport | Cut one (composition.md › Budget) |
| Colours look random | `color` not passed; each type has a different default | Pass the one ink everywhere |

## Structure

- **Tables**: never annotate a `<td>`/`<tr>` directly (rough-notation inserts an SVG sibling, which breaks
  table layout). Wrap the cell content in a `<span>` and annotate that.
- **Lists**: use `Roughly.Check as="li"` directly inside `<ul>`; other marks go *inside* the `<li>`.
- **Links and buttons**: put the mark inside the `<a>`/`<button>` around the text, or around the whole
  element for a box/arrow. Don't underline links (they look like links already — use highlight or circle).
- **Flex/grid children**: overlay marks are `inline-block`; in a flex row they become flex items, so the
  row's `gap` doesn't include the drawing. Add margin as in sizing.md.
- **MDX / markdown**: import Roughly in the MDX file (or provide it via `components`) and wrap the words:
  `Ship it <Roughly.Underline color="#FCD34D" className="whitespace-nowrap">today</Roughly.Underline>.` Keep
  marks out of headings that generate anchor IDs if the slug would pick up odd text.
- **Server Components (Next.js App Router)**: `Roughly.Underline` and the other dot-components are
  **undefined inside a Server Component** ("Element type is invalid… got: undefined"): a client module
  imported into a server file is a reference proxy that doesn't carry static members. Either put
  `"use client";` at the top of the file that uses them (simplest for a page/section), or move the
  annotated section into a small client component and render that from the server page. `check.mjs` flags
  files under `app/` that use `Roughly.*` without `"use client"`.
- **Changing text**: the marks re-measure when `children` change, but don't annotate text that animates its
  width (typewriters, counters). Mark the stable word next to it.

## Accessibility

- The drawings are `aria-hidden`. Meaning must be in the markup:
  - strike → `<del>` (old) + `<ins>` (new)
  - highlight → `<mark>` (reset its background: `bg-transparent text-inherit`)
  - cross mark in a list → `sr-only` "(not included)"
  - handwriting → the real text in an `sr-only` span, the drawing `aria-hidden`
  - arrow label / sticky note → plain text in the DOM, readable as is; keep it meaningful out of context
- Reduced motion: handled by the components (they render fully drawn). Don't add your own handling.
- Colour isn't the only signal: cross vs check differ in shape, strike vs underline in position.

## Deprecated / wrong props

| Don't | Do |
|---|---|
| `type="crossed-off"` | `type="cross-off"` or `Roughly.Cross` |
| `arrowCurvature`, `curvature`, `flipCurve` | `bend` (−1…1; negative flips) / `arrowBend` on `<Roughly type="arrow">` |
| `bowing` | nothing (unused) |
| `brackets` on `Roughly.Bracket` | `side` |
| `<Roughly type="circle" paddingX…>` | `Roughly.Circle` (the `type` form doesn't forward every prop) |
