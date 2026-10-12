# TiltedCollage — a masonry wall of mounted artwork

A gallery wall of images, each at its own shape (nothing is ever cropped), mounted on white paper with a soft shadow and set at a slight angle. The images flow into 1, 2 or 3 balanced columns depending on screen width, and every tile starts at a slightly different height, so the wall looks hand-placed rather than gridded. A **wide** image, such as a 5-frame storyboard strip, breaks out of the columns and runs across the whole collage, sitting almost level. The columns then pick up again beneath it. Hovering over any tile straightens it and lifts it toward you.

In the original portfolio this is the "Illustration" (digital artwork) section: 17 pieces of mixed portrait, landscape and square artwork, with two wide animation strips (2800×540) splitting it into three blocks.

> **For the implementing Claude:** reproduce this exactly. The tidy look comes from **CSS columns (not CSS grid, not a JS masonry library)**, each image at its natural ratio, fixed tilt and drop patterns, and wide pieces splitting the list into separate column blocks. It is a server component with zero client JavaScript. Keep it that way.

## Requirements

- React 18+ and **Tailwind CSS v4** (uses `rotate-(--tilt)`, `scale-103`, `@theme` tokens).
- `next/image` for the artwork. Outside Next.js, see [Without Next.js](#without-nextjs).

## 1. Add the easing to your global CSS

In the stylesheet that has `@import "tailwindcss";`:

```css
@theme inline {
  /* Quick start, long gentle settle: used for the hover lift. */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
}
```

## 2. Add the paper tile (shared)

Every piece is a `PaperTile`. The same file is used by the **StackedCards** component, so if you've already added it from that doc, reuse it.

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

`TiltedCollage.tsx`:

```tsx
import PaperTile, { type PaperImage } from "./PaperTile";

const COLUMN_SIZES = "(min-width: 1152px) 340px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw";
const WIDE_SIZES = "(min-width: 1152px) 1000px, 90vw";

// Columns of tiles at their own shape (nothing cropped), each mounted on white paper and set at a
// slight angle. A wide image breaks the columns and runs across the whole collage.
export default function TiltedCollage({ images }: { images: PaperImage[] }) {
  // Split the list into runs: each wide image on its own, and the images between them together.
  const runs: PaperImage[][] = [];
  for (const image of images) {
    const last = runs.at(-1);
    if (image.wide || !last || last[0].wide) runs.push([image]);
    else last.push(image);
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-14">
      {runs.map((run) =>
        run[0].wide ? (
          <div key={run[0].src} className="mx-auto w-full max-w-5xl px-2">
            <PaperTile image={run[0]} index={images.indexOf(run[0])} sizes={WIDE_SIZES} />
          </div>
        ) : (
          <ul key={run[0].src} className="columns-1 gap-8 px-2 sm:columns-2 sm:gap-10 lg:columns-3">
            {run.map((image) => (
              <li key={image.src} className="mb-8 break-inside-avoid sm:mb-10">
                <PaperTile image={image} index={images.indexOf(image)} sizes={COLUMN_SIZES} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
```

## 4. Use it

Put the images in `public/` and list them in the order you want them. `width` and `height` are each file's real pixel size (they set the tile's shape). Mark long strips with `wide: true`.

```tsx
import TiltedCollage from "./TiltedCollage";
import type { PaperImage } from "./PaperTile";

const ARTWORK: PaperImage[] = [
  { src: "/art/cottage.jpg", width: 2008, height: 2906, alt: "A cottage in a green meadow, seen through a stone wall" },
  { src: "/art/fields.png", width: 1920, height: 1080, alt: "Golden fields under a pastel sunset sky" },
  { src: "/art/daisy-girl.png", width: 406, height: 575, alt: "A girl in tall grass, her face hidden behind a giant daisy" },
  { src: "/art/sea.png", width: 1920, height: 1080, alt: "A golden sun over a rolling blue sea" },
  { src: "/art/pandas.png", width: 1920, height: 1318, alt: "Panda study: sketches of pandas walking and climbing" },
  { src: "/art/bombay.png", width: 595, height: 420, alt: "A pencil-and-wash sketch of Victoria Terminus" },
  // A storyboard strip: breaks the columns and runs full width.
  { src: "/art/bear-strip.png", width: 2800, height: 540, alt: "Five frames of a bear walking up to a basket", wide: true },
  { src: "/art/sheep.png", width: 1148, height: 841, alt: "Green hills with fluffy sheep" },
  // ...
];

export default function Illustration() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      <h3>Illustration</h3>
      <div className="mt-8 sm:mt-10">
        <TiltedCollage images={ARTWORK} />
      </div>
    </section>
  );
}
```

The `sizes` strings assume the collage sits in a container about 1152px wide at most (`max-w-6xl`). If yours is narrower or wider, adjust `COLUMN_SIZES` and `WIDE_SIZES`.

## How it works (base knowledge)

**Why it looks so evenly aligned.**

1. **CSS multi-column layout** (`columns-1 sm:columns-2 lg:columns-3`) is a true masonry. Each column stacks its tiles with no row gaps, so tiles of different heights pack tightly. The browser *balances* the columns (`column-fill: balance` is the default), so they end at nearly the same height.
2. **Every image keeps its own ratio** (`h-auto w-full` with the real `width`/`height`). Nothing is cropped to fit a grid cell, and the column width decides each tile's height.
3. **`break-inside-avoid`** on each `<li>` stops a tile from being split across two columns.
4. **Vertical spacing is `mb-*` on each item**, not `gap`. In a multi-column layout, `gap` sets only the space *between columns*, so the vertical rhythm has to come from margins.
5. **Wide pieces split the list into runs.** The loop walks the list and starts a new run at every wide image, giving each wide image its own run, while the normal images between wide ones share a run. Each normal run is its own `<ul>` with its own balanced columns. Each wide image is a full-width block (`max-w-5xl`, centred). So a wide strip never squeezes into one column, and each block of columns ends evenly before the strip starts.
6. **One parent spacing scale.** All runs sit in a `flex flex-col gap-10 sm:gap-14`, so the space around wide strips is consistent.

**The hand-placed feel** comes from two fixed patterns cycled by each image's index in the *whole* list (not its index within its run, so the pattern keeps flowing across the wide strips):

- **Tilt** (`TILTS`, 8 values between −2.5° and +2.5°), applied through a `--tilt` CSS variable. It is full strength from `sm` up and halved on phones (`rotate-[calc(var(--tilt)*0.5)]`). Wide strips use 30% of their tilt, since a long tile tilted 2° swings its ends far out.
- **Drop** (`DROPS`, 6 values from 0 to 20px), added as `paddingTop` on the tile's outer wrapper. It nudges tiles down by different amounts, so neighbouring columns never start on the same line. Wide strips get no drop.

The two lists have different lengths (8 and 6), so the tilt and the drop don't repeat in step. They are fixed, not random, so server and client render the same markup with no hydration mismatch, and the wall looks the same on every visit.

**The paper mount and hover.**

- **Mount:** `bg-white p-2 sm:p-3`, a long soft shadow (`0 10px 30px -12px` at 35% black) and a hairline `ring-1 ring-black/5` that crisps the edge on light backgrounds.
- **Hover:** the tile rotates to 0°, scales to 103%, gets a deeper shadow and `z-10`, so it lifts above its neighbours. It runs over 500ms on `ease-soft`, and is disabled under reduced motion.
- **Why `relative`:** the mount is `relative`, which is what makes that `z-index` work.

**Images and performance.**

- **Server component:** no client JS.
- **`sizes`:** `COLUMN_SIZES` and `WIDE_SIZES` tell the browser how wide each tile really is at each breakpoint, so it downloads an appropriately sized file. A 340px column doesn't pull a 3000px original.
- **No layout shift:** the `width`/`height` attributes reserve each tile's space before it loads, so the columns don't jump around as images arrive.

## Tuning

- **Column count:** `columns-1 sm:columns-2 lg:columns-3`. If you change it, update `COLUMN_SIZES`.
- **Spacing:** horizontal is `gap-8 sm:gap-10` on the `<ul>`, vertical is `mb-8 sm:mb-10` on the `<li>`. Keep the two the same so the gutters look even.
- **Messiness:** scale the values in `TILTS` / `DROPS`. Setting both lists to `[0]` gives a clean, straight masonry.
- **Order is layout.** Columns fill top-to-bottom, then the next column, so the *first third* of a run lands in column 1 on desktop. If one column ends noticeably longer, move a tall image to another position in the list. That is how the original was tuned to come out even.
- **Wide threshold:** mark an image `wide` when it's much wider than 2:1 (storyboards, panoramas). Shown in a single column, it would be a thin sliver.

## Without Next.js

In `PaperTile.tsx`, replace the `next/image` import and `<Image>` with:

```tsx
<img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" className="h-auto w-full" />
```

and drop the `sizes` prop (or pass it to `<img sizes>` together with a `srcSet`).
