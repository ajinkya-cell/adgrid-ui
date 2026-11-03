# Setup

Run `node <skill>/scripts/check.mjs --setup .` from the project root first; it tells you which of these
steps are missing.

## Requirements

- React 18+ (Next.js, Vite, Remix, Astro islands… anything that renders React on the client).
- Tailwind CSS v3.4+ or v4 (the components use Tailwind classes, including arbitrary values).
- Node 22+ only for this skill's scripts.

## 1. Install the components

```bash
npx shadcn@latest add https://www.voidui.in/r/roughly.json
```

This writes the files under your `components/ui` alias (typically `components/ui/roughly/Roughly.tsx` and
`components/ui/roughly/roughly/*.tsx`) and installs `framer-motion`, `rough-notation`, `roughjs` and
`opentype.js`. Find where they landed:

```bash
# from the project root
ls components/ui/roughly 2>/dev/null || ls src/components/ui/roughly
```

Import:

```tsx
import { Roughly } from "@/components/ui/roughly/Roughly";
```

No shadcn setup (`components.json`)? Run `npx shadcn@latest init` first, or fetch
`https://www.voidui.in/r/roughly.json` and write each `files[].content` to its `path` yourself, then
`npm i framer-motion rough-notation roughjs opentype.js`.

If the project uses a different alias or folder, adjust the import paths in the recipes — never copy a
second set of the components.

## 2. Fonts

Arrow labels and sticky notes use **Caveat** (default), **Kalam** or **Reenie Beanie** by font-family name.
If the font isn't loaded the label silently renders in the page font, which looks wrong. Load the ones you use.

### Any framework (simplest)

In the document `<head>` (Next.js App Router: in `app/layout.tsx` inside `<head>`; Vite: `index.html`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&family=Reenie+Beanie&display=swap"
/>
```

Or the CSS `@import` in `assets/fonts.css` at the top of your global stylesheet.

### Next.js with next/font (Caveat only)

`next/font` renames font families, so it only works for Caveat, through the `--font-caveat` variable the
components read. See `assets/fonts-next.tsx`:

```tsx
import { Caveat } from "next/font/google";
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
// <html className={caveat.variable}>
```

Kalam / Reenie Beanie still need the `<link>` above if you use them.

### Handwriting component (`Roughly.Handwriting`)

It parses the actual font file to draw glyph outlines. It first tries `/fonts/Caveat-Regular.ttf`,
`/fonts/Kalam-Regular.ttf`, `/fonts/ReenieBeanie-Regular.ttf` from your public folder, then falls back to
GitHub's raw Google Fonts files. For production, put the files in `public/fonts/` (and if you have a CSP,
the fallback host won't be allowed anyway):

```bash
mkdir -p public/fonts
curl -L -o public/fonts/Caveat-Regular.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf"
curl -L -o public/fonts/Kalam-Regular.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/kalam/Kalam-Regular.ttf"
curl -L -o public/fonts/ReenieBeanie-Regular.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/reeniebeanie/ReenieBeanie.ttf"
```

Only download the ones you use. Or pass `fontUrl="/path/to/font.ttf"` for any TTF.

## 3. Tailwind

- **v4**: nothing to do if the components live inside the project (automatic source detection). If they're
  in a package outside the app, add `@source "../path/to/components";`.
- **v3**: make sure `content` in `tailwind.config` covers the components folder
  (e.g. `"./components/**/*.{ts,tsx}"`).

## 4. Client components

Every Roughly file starts with `"use client"`, but the **dot-components (`Roughly.Circle` …) don't work from a
Server Component** — they come back `undefined` and the page crashes. In the Next.js App Router, any file
that uses them needs `"use client";` at the top, or the annotated part moves into a small client component.
Pages Router, Vite, Remix, Astro islands: no action needed.

## 5. Sanity check

Mount `assets/qa-gallery.tsx` as a temporary page (e.g. `app/roughly-qa/page.tsx`, fix its import path),
then:

```bash
node <skill>/scripts/screenshot.mjs http://localhost:3000/roughly-qa --name qa
```

Read the images: every mark should be fully drawn, labels in a handwriting font, nothing overlapping.
Delete the page afterwards.
