---
name: roughly
description: Add hand-drawn annotations (underlines, circles, highlights, boxes, brackets, strike-throughs, cross-offs, check marks, arrows with handwritten labels, sticky notes, handwriting) to a web page with the Roughly React components, and get them right — which words deserve a mark, which mark, what size, what colour, in what order — then verify them on screenshots. Use when the user asks to annotate, mark up, hand-draw, sketch, doodle on, "add rough notation", "circle", "underline", "highlight", "point an arrow at", "add a sticky note to" text or elements on a page, landing page, pricing, docs, blog post or deck; or mentions Roughly, rough-notation or voidui annotations.
---

# roughly

Hand-drawn marks are the loudest thing on a page. Used well, one mark tells the reader what to take away.
Used on everything, they are noise and the page looks like homework. Your job is mostly **editorial**:
choose the few things worth marking, then draw each one with the right tool, at the right size, in the
right place, and prove it on a screenshot.

`<skill>` below means this skill's directory.

## Files

| File | Read it when |
|---|---|
| `references/choosing.md` | **Always.** Which mark for which intent, and what each mark must never be used for. |
| `references/sizing.md` | **Always.** Stroke, padding, arrow size, label size and the clearance each mark needs, keyed to font size. |
| `references/color.md` | **Always.** One ink per page, dark vs light surfaces, highlighter pairs, semantic red/green. |
| `references/arrows.md` | **Any arrow.** Placement, the bend that lands the head on the target, size, label, failure → fix. |
| `references/composition.md` | More than one mark on a page, any arrow or sticky, or mobile layouts. |
| `references/recipes.md` | Before writing code: copy the closest recipe instead of improvising. |
| `references/setup.md` | Roughly isn't installed yet, or fonts / Tailwind are missing. |
| `references/pitfalls.md` | Something looks wrong on the screenshot, or you're annotating inside tables, cards, scroll areas, MDX. |
| `references/props.md` | Exact props of each component. Generated from the source; trust it over memory. |
| `scripts/check.mjs` | Lints annotation usage. `node <skill>/scripts/check.mjs <src dirs>`; `--setup` checks install + fonts. |
| `scripts/screenshot.mjs` | Real 1440px and 390px full-page screenshots with marks fully drawn. `node <skill>/scripts/screenshot.mjs <url>` |
| `assets/qa-gallery.tsx` | A page with every recipe on dark and light. Mount it to sanity-check an install. |

## Workflow

Copy this checklist into your reply and tick it off:

```
Annotation progress:
- [ ] 1. Setup: Roughly installed, fonts loaded (check.mjs --setup)
- [ ] 2. Editorial pass: candidates → keep ≤ budget, with a reason each
- [ ] 3. Pick the mark for each (choosing.md)
- [ ] 4. Size + clearance for each (sizing.md)
- [ ] 5. Colour (color.md) and order/timing (composition.md)
- [ ] 6. Write the code from recipes.md; semantic HTML underneath
- [ ] 7. check.mjs clean
- [ ] 8. Screenshots at 1440 and 390 read; collisions, clipping, overflow fixed
- [ ] 9. Report
```

### 1. Setup
Run `node <skill>/scripts/check.mjs --setup .` from the project root. Fix what it reports with
`references/setup.md` (install, fonts, Tailwind, `"use client"`). Don't start annotating until it passes:
missing fonts make arrow labels and sticky notes render in the body font, which looks broken.

### 2. Editorial pass — before any code
Read the page's copy. List every candidate as `text → why a reader must notice it`. Then cut:

- **Budget:** 1 mark per section/viewport. **At most 3 marks above the fold**, at most ~1 per 400 words of
  prose. A checklist (check marks on every row) or a price change (strike + circle) counts as one mark.
- Keep a candidate only if removing the mark would change what a skimming reader takes away.
- Never mark two things in the same sentence. Never mark the thing that is already the biggest/boldest
  element on screen unless the mark adds meaning (e.g. the price changed).
- If the user named exactly what to mark, mark that — but still apply the rest of this skill to *how*.

Show the user the kept list (and what you cut) when you're annotating a whole page.

### 3–5. Choose, size, colour
Use the three references. They're short tables; follow them rather than taste. The common mistakes they
prevent: circling a whole sentence, highlighting a paragraph, a 2px line under 72px type, a rainbow of
colours, red used for emphasis, arrows without a label, marks that run into the next word.

**Arrows get their own pass** (`references/arrows.md`): pick the empty side for `placement`, then **leave
`bend` unset**. The component picks the bend whose sign lands the head *into* the target; a hand-set bend
with the wrong sign makes the head skim along the target's edge (the most common broken-looking arrow).

### 6. Write it
Start from the closest recipe in `references/recipes.md`. Rules that always apply:

- **Next.js App Router: `"use client";` at the top of every file that uses `Roughly.*`.** In a Server
  Component the dot-components are `undefined` and the page crashes. If the page must stay a Server
  Component, move the annotated section into its own client component.
- **Meaning lives in the HTML, not the drawing.** The SVG is `aria-hidden`. Strike-through → wrap in
  `<del>` (and the new value in `<ins>`); highlight → `<mark>`; a cross mark → add `sr-only` text
  ("not included"). Screen readers and copy-paste must read correctly with the marks gone.
- **Reserve space.** Circles, boxes, arrows and sticky notes draw *outside* their element and take no
  layout space. Give every one the margin/padding from `sizing.md` or it will sit on top of neighbours.
- **Wrap only the words.** `<Roughly.Underline>` goes around the 1–4 key words, not the whole `<h1>`.
- Use the namespaced components (`Roughly.Circle`, `Roughly.Arrow`, …) — they take every prop.
  `<Roughly type="…">` exposes fewer props.
- Never put a rough mark on text that is still changing (typewriter effects, live counters) — it draws to
  the first size it measures.

### 7. Lint
`node <skill>/scripts/check.mjs <the files you touched>` → 0 errors. Every warning is fixed or you can say
why it's intentional.

### 8. Verify on screenshots — required
With the dev server running:
```bash
node <skill>/scripts/screenshot.mjs http://localhost:3000/ --name annotated
node <skill>/scripts/screenshot.mjs http://localhost:3000/pricing --selector "#plans" --name plans
```
It renders with reduced motion so marks are fully drawn, scrolls the page so scroll-triggered marks fire,
uses true 390px mobile emulation, and prints `✖` if the page is an error screen and `⚠` with the
offending elements if anything overflows horizontally. Fix those first. `--selector "#id"` crops to one
section (with room around it for arrows/stickies). **Read every image.** For each mark check:

- It sits where intended: underline under the words, circle centred, arrow tip 6–12px from the target
  and the **arrowhead pointing into it** (not lying along its edge; arrows.md › Checklist).
- Nothing overlaps: no mark crosses neighbouring text, another mark, a button edge, or gets clipped by a
  card (`overflow:hidden`).
- At 390px: arrows and stickies still fit, nothing causes horizontal scroll, multi-line wraps still look
  intentional. If not, use the mobile rules in `composition.md` (move, shrink or drop the mark).
- The page still reads as one hand: same ink, similar weights, nothing louder than the headline.

Fix, re-shoot, re-read. Never report done from code alone. If a mark is missing in a shot: re-run with
`--wait 5000`, then try `--segments` (one shot per screen; some pages relayout during full-page capture
and drop marks there) or `--selector` on that section, before assuming a bug.

### 9. Report
List each mark: the text, the mark, why. Say what you cut. Give the screenshot paths. Mention anything you
couldn't verify (no dev server, auth wall).

## Hard rules (the short version)

1. Fewer marks. 1 per section, ≤ 3 above the fold.
2. Mark type follows intent (`choosing.md`), never decoration.
3. Stroke scales with the text (`sizing.md`): ≈ font-size ÷ 14, between 1.5 and 4.
4. One ink colour per page; red only for removal/negative, green only for done/positive.
5. Every overlay mark gets reserved space; nothing touches neighbouring text.
6. Arrows always carry a short label (≤ 4 words) unless pointing at something self-explanatory. Don't set
   `bend` unless you keep its auto sign; the head must point into the target.
7. Semantic HTML under every mark; reduced motion is handled by the components — don't fight it.
8. Screenshots at 1440 and 390, read, before you say done.
