# StackedCards — a paper pile that deals out into a collage

A loose pile of paper sheets sits in the middle of the section. Each sheet leans at a different angle and is nudged off-centre, and one chosen sheet lies straight on top. A small typewriter caption under it reads "Tap to spread". Hovering over the pile fans it out a bit, as the leans almost double. Clicking it **deals every sheet out**: one after another, 25ms apart, each sheet glides and straightens into its place in a 2-, 3- or 4-column masonry collage, while the section grows to fit. A small round "gather" button with a circular arrow stays pinned to the bottom-right of the screen while you scroll through the collage. Clicking it gathers the sheets back into the pile in reverse order, scrolls the pile back into view, and the section shrinks once the last sheet has landed.

Each sheet is the image at its own shape, never cropped. It sits on a white paper mount with a soft shadow and a slight tilt, and in the collage, hovering over a sheet straightens it and lifts it toward you.

> **For the implementing Claude:** reproduce this exactly. The core idea, explained under [How it works](#how-it-works-base-knowledge), is that **the collage is always laid out and the pile is just transforms on top of it**. Don't rebuild it as two separate layouts with a crossfade, or as absolute positioning.

## Requirements

- React 18+ and **Tailwind CSS v4** (uses `rotate-(--tilt)`, `scale-103`, `ring-heading/50`, `@theme` tokens).
- `next/image` for the sheets. Outside Next.js, see [Without Next.js](#without-nextjs).
- A browser with `inert` support (all current browsers).

## 1. Add the theme tokens to your global CSS

In the stylesheet that has `@import "tailwindcss";`. If your library already has these colours and fonts under other names, swap the class names in the component instead.

```css
@theme inline {
  /* The slow, soft ease every motion in this component uses. */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);

  /* Dark brown for the caption, focus ring and gather button. */
  --color-heading: #4b3621;
  /* Cream page colour, used behind the gather button. */
  --color-background: #fbf8f1;
  /* Typewriter face for the "Tap to spread" caption (Special Elite in the original). */
  --font-typewriter: "Special Elite", ui-monospace, monospace;
}
```

Load the font however your app does it. In Next.js:

```tsx
import { Special_Elite } from "next/font/google";
const specialElite = Special_Elite({ variable: "--font-special-elite", weight: "400", subsets: ["latin"] });
// put specialElite.variable on <html>, and use --font-typewriter: var(--font-special-elite) above
```

## 2. Add the paper tile (shared)

Every sheet is a `PaperTile`. The same file is used by the **TiltedCollage** component, so if you've already added it from that doc, reuse it.

`PaperTile.tsx`:

```tsx
import Image from "next/image";
import type { CSSProperties } from "react";

// `wide`: a long strip (e.g. a 5-frame storyboard), shown across the whole collage instead of in a column.
export type PaperImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  wide?: boolean;
};

// Each tile's tilt (deg) and drop from the tile above (px), cycled through in order. Fixed rather
// than random so the layout looks the same on every load and the server and client agree.
export const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 0.5];
const DROPS = [0, 14, 6, 20, 10, 2];

// White paper mount; on hover it straightens and lifts. Tilt comes from --tilt (halved on phones).
export const MOUNT =
  "relative bg-white p-2 shadow-[0_10px_30px_-12px_rgba(23,23,23,0.35)] ring-1 ring-black/5 transition duration-500 ease-soft rotate-[calc(var(--tilt)*0.5)] sm:p-3 sm:rotate-(--tilt) hover:z-10 hover:rotate-0 hover:scale-103 hover:shadow-[0_20px_40px_-14px_rgba(23,23,23,0.45)] motion-reduce:transition-none motion-reduce:hover:scale-100";

// An image at its own shape (nothing cropped), mounted on white paper and set at a slight angle.
export default function PaperTile({ image, index, sizes }: { image: PaperImage; index: number; sizes: string }) {
  // Wide strips sit nearly level; a big tilt on a long tile swings its ends far out.
  const tilt = TILTS[index % TILTS.length] * (image.wide ? 0.3 : 1);
  const style = {
    "--tilt": `${tilt}deg`,
    paddingTop: image.wide ? 0 : DROPS[index % DROPS.length],
  } as CSSProperties;

  return (
    <div style={style}>
      <div className={MOUNT}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
```

## 3. Add the component

`StackedCards.tsx`:

```tsx
"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import PaperTile, { type PaperImage } from "./PaperTile";

const SIZES = "(min-width: 1152px) 250px, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw";

// Each sheet's lean (deg) and nudge (px) in the pile, cycled through in order. Fixed rather than
// random so the pile looks the same on every load and the server and client agree.
const PILE = [
  { r: -7, x: -10, y: 6 },
  { r: 5, x: 12, y: -4 },
  { r: -3, x: -4, y: -10 },
  { r: 8, x: 8, y: 8 },
  { r: -9, x: -14, y: -2 },
  { r: 3, x: 4, y: 12 },
  { r: 6, x: 14, y: 2 },
  { r: -5, x: -8, y: -8 },
];
// Gap (ms) between one sheet setting off and the next, as they deal out or gather back.
const STAGGER = 25;

// `pile`: height of the stacked section; `full`: height of the spread-out collage; `moves`: how far
// each sheet travels from its place in the collage to the middle of the pile.
type Layout = { pile: number; full: number; moves: { dx: number; dy: number }[] };

// A loose pile of paper with `topSrc` on top. Clicking the pile deals every sheet out to its place
// in a masonry collage; a handle that stays in view while scrolling through the collage gathers them
// back. The collage is always laid out underneath, and the pile is just each sheet moved
// (transformed) from its own spot to the centre, so the two states always agree and the move
// between them is one transition.
export default function StackedCards({
  images,
  topSrc,
  hint = "Tap to spread",
  spreadLabel = `Spread out all ${images.length} images`,
  gatherLabel = "Stack the images back into a pile",
}: {
  images: PaperImage[];
  // The image that lies straight on top of the pile. Defaults to the first.
  topSrc?: string;
  // Caption under the closed pile.
  hint?: string;
  spreadLabel?: string;
  gatherLabel?: string;
}) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pileButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [fanned, setFanned] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  // Off until the first layout is in place, so the sheets don't fly into the pile on load.
  const [animate, setAnimate] = useState(false);
  // True while the sheets deal out or gather back; only then are their starts staggered, so the
  // hover fan answers at once.
  const [moving, setMoving] = useState(false);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const top = topSrc ? images.findIndex((image) => image.src === topSrc) : 0;
  const last = (images.length - 1) * STAGGER;

  // Measure where every sheet sits in the collage, again whenever the column count changes. The
  // observer reports once straight away, before the first paint.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const items = [...list.children] as HTMLElement[];
      const pile = Math.max(...items.map((item) => item.offsetHeight)) + 72;
      const centreX = list.clientWidth / 2;
      setLayout({
        pile,
        full: list.offsetHeight + 24,
        moves: items.map((item) => ({
          dx: centreX - (item.offsetLeft + item.offsetWidth / 2),
          dy: pile / 2 - (item.offsetTop + item.offsetHeight / 2),
        })),
      });
    });
    observer.observe(list);
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(settle.current);
    };
  }, []);

  function travel() {
    setMoving(true);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => setMoving(false), last + 700);
  }

  function spread() {
    travel();
    setOpen(true);
    setFanned(false);
    requestAnimationFrame(() => backButton.current?.focus({ preventScroll: true }));
  }

  function gather() {
    travel();
    setOpen(false);
    // The section shrinks back to the pile; bring the pile into view rather than leaving the reader
    // in the empty space below it.
    const wrap = wrapRef.current;
    if (wrap) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollTo({ top: wrap.getBoundingClientRect().top + scrollY - 160, behavior: reduce ? "auto" : "smooth" });
    }
    requestAnimationFrame(() => pileButton.current?.focus({ preventScroll: true }));
  }

  return (
    <div ref={wrapRef}>
      <div
        className={`relative overflow-y-clip ${layout ? "" : "h-[420px] sm:h-[500px]"} ${
          animate ? "transition-[height] duration-700 ease-soft motion-reduce:transition-none" : ""
        }`}
        // Opening, the section grows ahead of the sheets; closing, it waits for the last one to
        // land before shrinking, so no sheet is clipped on the way.
        style={layout ? { height: open ? layout.full : layout.pile, transitionDelay: open ? "0ms" : `${last}ms` } : undefined}
      >
        <ul
          ref={listRef}
          id={listId}
          inert={!open}
          className="relative columns-2 gap-5 px-2 sm:columns-3 sm:gap-7 lg:columns-4"
        >
          {images.map((image, i) => {
            const move = layout?.moves[i];
            const lean = PILE[i % PILE.length];
            const isTop = i === top;
            const tilt = isTop ? -1 : lean.r * (fanned ? 1.8 : 1);
            const style: CSSProperties = {
              zIndex: isTop ? images.length + 1 : images.length - i,
              visibility: move ? undefined : "hidden",
              transform:
                open || !move
                  ? undefined
                  : `translate(${move.dx + (isTop ? 0 : lean.x)}px, ${move.dy + (isTop ? 0 : lean.y)}px) rotate(${tilt}deg)`,
              transitionDelay: moving ? `${open ? i * STAGGER : last - i * STAGGER}ms` : undefined,
            };
            return (
              <li
                key={image.src}
                style={style}
                className={`relative mb-5 break-inside-avoid sm:mb-7 ${
                  animate ? "transition-transform duration-700 ease-soft motion-reduce:transition-none" : ""
                }`}
              >
                <PaperTile image={image} index={i} sizes={SIZES} />
              </li>
            );
          })}
        </ul>

        {!open && (
          <button
            ref={pileButton}
            type="button"
            aria-expanded={false}
            aria-controls={listId}
            aria-label={spreadLabel}
            onClick={spread}
            onPointerEnter={() => setFanned(true)}
            onPointerLeave={() => setFanned(false)}
            onFocus={() => setFanned(true)}
            onBlur={() => setFanned(false)}
            className="absolute inset-x-0 top-0 z-50 mx-auto block h-full w-full max-w-sm cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-heading/50"
          />
        )}
      </div>

      {open ? (
        // A small "gather" arrow at the right, pinned to the bottom of the screen while the collage
        // is being scrolled through.
        <div className="pointer-events-none sticky bottom-6 z-30 mt-4 flex justify-end">
          <button
            ref={backButton}
            type="button"
            aria-expanded
            aria-controls={listId}
            aria-label={gatherLabel}
            title="Stack them back"
            onClick={gather}
            className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full bg-background/85 text-heading shadow-[0_6px_18px_-10px_rgba(23,23,23,0.45)] backdrop-blur transition duration-500 ease-soft hover:-rotate-90 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading motion-reduce:transition-none motion-reduce:hover:rotate-0"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 2.64-6.36" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      ) : (
        hint && (
          <p aria-hidden className="mt-3 text-center font-typewriter text-sm tracking-wide text-heading sm:text-base">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
```

## 4. Use it

Put the images in `public/` and list them. `width` and `height` are each file's real pixel size; only the ratio matters.

```tsx
import StackedCards from "./StackedCards";
import type { PaperImage } from "./PaperTile";

const PENCIL: PaperImage[] = [
  { src: "/pencil/woman-leaves.jpg", width: 742, height: 1356, alt: "A seated woman with leaves sprouting from her head" },
  { src: "/pencil/plants.jpg", width: 1306, height: 850, alt: "A row of strange plants with flat, umbrella-like caps" },
  { src: "/pencil/pond.jpg", width: 1046, height: 1600, alt: "A dreamlike pond of giant hanging leaves and ferns" },
  // ...the original uses 17 sheets
];

export default function PencilSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-8">
      <h3>Sketches</h3>
      <div className="mt-6 sm:mt-10">
        <StackedCards images={PENCIL} topSrc="/pencil/girl-curls.jpg" />
      </div>
    </section>
  );
}
```

### Props

| Prop | Default | What it does |
| --- | --- | --- |
| `images` | — | The sheets, in collage order. Each needs `src`, `width`, `height`, `alt`. |
| `topSrc` | first image | Which sheet lies straight on top of the pile. Pick your best-looking one. |
| `hint` | `"Tap to spread"` | Caption under the closed pile. `""` hides it. |
| `spreadLabel` | `"Spread out all N images"` | Screen-reader name of the pile button. |
| `gatherLabel` | `"Stack the images back into a pile"` | Screen-reader name of the gather button. |

## How it works (base knowledge)

**One layout, two states.** The `<ul>` is *always* a real CSS-columns masonry collage (`columns-2 sm:columns-3 lg:columns-4`, `break-inside-avoid` on each item). The pile is not a second layout. Each `<li>` gets a `transform` that moves it from its own collage spot to the centre of the pile, plus its lean. To spread, remove the transforms; to gather, put them back. Because both states come from the same boxes, they can never disagree, and the move between them is a single CSS `transition-transform`.

**Measuring.** A `ResizeObserver` on the list reads each item's `offsetLeft`, `offsetTop`, `offsetWidth` and `offsetHeight`. These are relative to the `<ul>`, which is `relative`, and **unaffected by transforms**, so the measurements are correct even while the sheets are piled. From them it works out:

- `dx = listWidth/2 − itemCentreX` and `dy = pileHeight/2 − itemCentreY`: the move to the pile centre.
- `pile` = the tallest item + 72px of breathing room: the closed section's height.
- `full` = the list's height + 24px: the open section's height.

The observer fires again when the column count changes at a breakpoint, so the pile stays centred at every width. ResizeObserver reports once before first paint, and until then the sheets are `visibility: hidden` and the section has a placeholder height (`h-[420px] sm:h-[500px]`), so nothing flashes.

**No fly-in on load.** Transitions are switched on only after two animation frames (`animate` state). Without that, the sheets would visibly fly from the collage into the pile when the page loads.

**The section height** animates between `pile` and `full`, with `overflow-y-clip` hiding the collage below the pile.

- **Opening:** the height grows immediately (`transitionDelay: 0ms`), ahead of the sheets.
- **Closing:** the height waits `last` ms, the time until the final sheet sets off, so no sheet gets clipped mid-flight.

**Stagger.** While dealing or gathering (`moving`), each sheet gets `transitionDelay`: `i × 25ms` opening, and the reverse (`last − i × 25ms`) closing, so the pile deals out first-to-last and gathers last-to-first. `moving` turns off 700ms after the last sheet, so the **hover fan** isn't delayed by the stagger.

**Pile look.** `PILE` is a fixed list of 8 `{ rotation, x-nudge, y-nudge }` values, cycled through. It is deterministic, not random, so server and client render the same markup with no hydration mismatch.

- **Top sheet:** sits dead centre at −1°.
- **Stack order:** `zIndex = length − i`, so earlier sheets sit higher; the top sheet gets `length + 1`.
- **Fan:** hovering or focusing the pile sets `fanned`, which multiplies every lean by 1.8.

**Interaction and accessibility.**

- **Pile button:** while closed, the whole pile is covered by one invisible `<button>` (`max-w-sm`, centred, `z-50`). It has `aria-expanded={false}` and `aria-controls` pointing at the list.
- **Closed collage:** the list is `inert` while closed, so its images can't be tabbed into or clicked through.
- **Focus:** after spreading, focus moves to the gather button; after gathering, back to the pile button. Both use `preventScroll`, so the page doesn't jump.
- **Gather button:** it is `sticky bottom-6` inside a `pointer-events-none` row, so it rides along the bottom of the screen while you scroll through a long collage, and stops at the end of the section.
- **Scroll back:** gathering scrolls the window so the pile's top sits 160px below the viewport top, instantly under reduced motion.

**PaperTile.**

- **Mount:** each image sits in a white mount (`p-2 sm:p-3`, soft shadow, hairline ring).
- **Tilt:** set through a `--tilt` CSS variable, applied at full strength from `sm` up and halved on phones (`rotate-[calc(var(--tilt)*0.5)]`).
- **Drop:** a small `paddingTop` drop, cycled from `DROPS`, staggers the tops so the collage looks hand-placed rather than gridded.
- **Hover:** the tile straightens to 0°, scales to 103% and gets a deeper shadow over 500ms with `ease-soft`.

## Tuning

- **Columns:** `columns-2 sm:columns-3 lg:columns-4` on the `<ul>`. If you change them, update `SIZES` to match each column's real width (the `sizes` attribute tells the browser which image file to download).
- **Speed:** `duration-700` (on the items and the section), `STAGGER`, and the `+ 700` in `travel()`, which must match the duration.
- **Pile messiness:** the values in `PILE`; the `1.8` fan multiplier.
- **Placeholder height** before first measure: `h-[420px] sm:h-[500px]`. Set it close to your real pile height.
- **Order matters.** CSS columns fill top-to-bottom, then the next column. Reorder `images` until the columns come out even at the bottom.

## Without Next.js

In `PaperTile.tsx`, replace the `next/image` import and `<Image>` with:

```tsx
<img src={image.src} alt={image.alt} width={image.width} height={image.height} className="h-auto w-full" />
```

and drop the `sizes` prop (or pass it to `<img sizes>` if you also provide `srcSet`).
