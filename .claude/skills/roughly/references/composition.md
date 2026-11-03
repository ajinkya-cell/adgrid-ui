# Composition: several marks, timing, layout, mobile

## Budget

| Area | Max marks |
|---|---|
| Above the fold / hero | 3 (typically: 1 underline + 1 arrow, or 1 circle) |
| Any other section | 1 (a checklist or a price change counts as one) |
| Long-form article | ~1 per 400 words, never 2 in a paragraph |
| Sticky notes | 1 per page |
| Arrows | 2 per page, never 2 in one viewport |

If everything is marked, nothing is. When in doubt, cut the weaker mark.

What counts as **one** mark:
- A price change (strike + circle on the same price).
- A list with a check/cross on every row (one idea: "here's what you get").
- A cross-off column plus the check column it's compared with.

What **doesn't count**: a sign-off signature (decorative, at the end of the page).

Pricing pages: per-plan feature checklists are a normal pattern and count as the cards section's one mark —
then don't add another mark inside the cards (circle the price *or* check the features, not both). In
prose, ~330 words allows 1 mark; ~800 allows 2.

## Hierarchy

The mark should be *one step louder* than the text it marks, not the loudest thing on the page.
- The headline mark gets the heaviest stroke on the page; marks lower down are lighter (sizing.md).
- Don't put a heavier mark in a sub-section than in the hero.
- Never mark the primary CTA with a circle or box (it already has a button shape); point at it with an arrow
  + label, or leave it.

## Order and timing (when animated)

Marks draw when they scroll into view. Within one viewport, choreograph them in **reading order**:

1. The page/section settles first: first mark at `animationDelay` 300–500ms (lets entry animations and
   fonts finish, and the reader land).
2. Then each following mark +250–400ms after the previous one *starts* (they overlap slightly, like a hand
   moving on).
3. Arrows last: they point at something the reader already saw.
4. List check marks: +120–180ms per row.

Total sequence in one viewport ≤ ~2s. Separate sections need no coordination: each fires on scroll.

```tsx
<Roughly.Underline animationDelay={400}>…</Roughly.Underline>      {/* 1. claim */}
<Roughly.Circle animationDelay={750}>…</Roughly.Circle>            {/* 2. number */}
<Roughly.Arrow animationDelay={1100} label="start here">…</Roughly.Arrow> {/* 3. CTA */}
```

`animate={false}` draws instantly — right for marks inside content that re-renders a lot (tables, editors),
print styles, screenshots/OG images. Reduced motion is handled automatically: when the visitor asks for it,
every mark renders fully drawn with no animation. Don't add your own `prefers-reduced-motion` logic.

## Placement and spacing

- **Arrows point inward**: tail in empty space (margin, gutter, whitespace beside a button), tip at the
  target. Pick the `placement` whose side of the target is empty. Never route an arrow across text.
- **Labels must not touch other text.** Check the label's box against headlines/buttons on the screenshot.
- **Two marks need ≥ 24px between their drawn edges** (including circle/box padding and arrow tails).
  Exception: the two halves of one idea (strike on the old price + circle on the new) may sit 8–16px apart —
  they're read together.
- Overlay marks may extend into the page gutter (a circle on the first item of a left-aligned row pokes out
  past the column edge); that's fine as long as it stays inside the viewport and isn't clipped.
- Marks inside cards: make sure the card doesn't clip (`overflow:hidden`, `overflow-x-auto`, `rounded` +
  `overflow-hidden` images). Either give the mark room inside the padding or move the mark outside the
  clipped element. See pitfalls.md.
- **Sticky notes** overlap the target's corner (`offset` negative) or sit in clear whitespace beside it —
  never covering content the reader needs.

## Mobile (390px)

Overlay marks don't move out of the way on narrow screens; check every one on the 390px shot.

| Problem at 390px | Fix |
|---|---|
| Arrow/sticky on the `right`/`left` runs off-screen or causes horizontal scroll | Switch to a `bottom-*` / `top-*` placement on mobile (hook below), or hide it below `sm` |
| Circle target wraps onto two lines | `whitespace-nowrap` on the target, or underline instead |
| Reserved side padding (`pr-[170px]`) squeezes content | Make it responsive: `pb-[120px] sm:pb-0 sm:pr-[170px]` together with the placement switch |
| Too many marks in one small screen | Drop the lowest-value one on mobile: render that text without its mark when `useIsNarrow()` is true |
| Underline target wraps onto two lines | Reads as two marks and can mis-draw after layout shifts. `whitespace-nowrap` on the underline; if that overflows at 390px, underline fewer words |

A tiny hook for responsive placement (no dependency):

```tsx
"use client";
import { useEffect, useState } from "react";

export function useIsNarrow(query = "(max-width: 639px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return narrow;
}

// usage
const narrow = useIsNarrow();
<Roughly.Sticky placement={narrow ? "bottom-right" : "right"} … />
```

(`useIsNarrow` reads the media query after mount, so it's hydration-safe.)

## Static images / decks / print

For OG images, screenshots, PDFs or slides captured from the page: `animate={false}` on every mark, and
capture after `document.fonts.ready`.
