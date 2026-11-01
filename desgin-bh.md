# design.md — "Editorial Dark Glass" Portfolio System

> Reverse-engineered from **aayushbharti.in** (inspected live, Oct 2026).
> Every value marked **[measured]** was read from computed styles in the browser. Values marked **[inferred]** were judged from behaviour/screenshots — tune by eye.
> Use this as a spec for the *design language and interaction craft*. Swap in your own content, photos, logo and projects — don't ship someone else's identity.

---

## 0. TL;DR — what makes it feel "perfect"

1. **Two-font tension.** A condensed editorial serif (Instrument Serif) for display, a quirky grotesk (Bricolage Grotesque) for everything else. Italic serif + animated gradient on *one* accent word per heading.
2. **Near-black, not black.** `#0D0D0F` page, `#131314` cards, hairline borders at `oklch(0.27 0 0)`. Contrast comes from opacity steps of white (100 / 70 / 65 / 55 / 50%), not from new grays.
3. **Visible structure.** The page sits inside a framed column with 1px vertical rails, and sections are separated by hatched strips with tiny square "nodes" at the rail intersections — it reads like a technical drawing.
4. **Physical materials.** Liquid-glass nav pill, glass "chips", cream polaroid frames, a lanyard ID card with physics, a wand, sticky notes — every object has a real-world referent with appropriate shadows.
5. **Motion with restraint.** Springs for anything the pointer touches; long linear loops (6s gradient, 12s badge spin, 50–90s marquees) for ambient life; `scale: .98` on press everywhere. Loops pause off-screen.
6. **Isometric line illustrations** that *activate on card hover* (stroke → blue fill, checkmarks appear). Rest state is monochrome; hover state adds exactly one accent colour.
7. **Micro-labels everywhere.** 10–13px uppercase tracked labels ("NOW", "CASE STUDIES", "SAME TIMEZONE · 11:09 AM") give the page an instrument-panel density.

---

## 1. Tech stack (detected)

| Concern | Choice | Evidence |
|---|---|---|
| Framework | **Next.js (App Router)**, `next/font`, `next/image` | `/_next/static/immutable/…`, `meta-next-size-adjust`, `_next/image?url=` |
| Styling | **Tailwind CSS v4** with minified/hashed custom-property names | class names like `dark:bg-card/15`, `in-data-tray:`, `ring-1 ring-border`, mangled `--XwEvwj` vars |
| Tokens | shadcn/ui-style semantic tokens (`background`, `card`, `border`, `ring`, `chart-1..5`) in **oklch** | `.dark` rule values |
| Animation | **Motion (motion.dev / framer-motion)** for springs, layout and pointer-driven values; plain CSS `@keyframes` for loops | inline `transform: translateX(212px)` with 0s CSS transition on nav indicator; 29 named keyframes |
| Enter/exit | `tailwindcss-animate`-style `enter`/`exit` keyframes (opacity + translate3d + scale + rotate + **blur**) | keyframe bodies |
| Command palette | cmdk-style palette with preview pane | ⌘K UI |
| Theme | `next-themes` (class strategy, `light / system / dark`) | `html.dark`, 3-way toggle in footer |
| Smooth scroll | **None** (native scroll, `scroll-behavior: auto`) | no Lenis |
| Canvas/WebGL | **None** — lanyard, wand, maps are DOM/SVG | no `<canvas>` |

Root font size is **17px** [measured] — so `1rem = 17px` and all rem-based Tailwind spacing is ~6% larger than default. This is why sizes look like 12.75px (0.75rem), 21.25px (1.25rem), 14.625px radius. **Set `html { font-size: 17px }`** to reproduce the proportions exactly.

---

## 2. Design tokens

### 2.1 Colour — dark (default for the experience)

```css
:root.dark {
  /* surfaces */
  --page:          #0D0D0F;            /* body bg  [measured rgb(13,13,15)] */
  --card:          #131314;            /* bento cards [measured rgb(19,19,20)] */
  --card-hover:    #0F0F10;            /* cards darken slightly on hover (bg-card/5) */
  --popover:       oklch(20.5% 0 0);
  --muted:         oklch(26.9% 0 0);

  /* lines */
  --border:        oklch(27% 0 0);     /* every hairline, ring-1 on cards [measured] */
  --border-soft:   oklch(100% 0 0 / .15);

  /* text — use opacity steps of one white */
  --fg:            oklch(98.5% 0 0);   /* primary */
  --fg-90:         oklch(87% 0 0);     /* card titles [measured] */
  --fg-70:         oklch(98.5% 0 0 / .70); /* secondary links, CTA text */
  --fg-65:         oklch(98.5% 0 0 / .65); /* inactive nav */
  --fg-55:         oklch(98.5% 0 0 / .55); /* micro-labels */
  --fg-50:         oklch(98.5% 0 0 / .50); /* tiny eyebrows */
  --fg-muted:      oklch(70.8% 0 0);   /* "AI full-stack engineer" */

  /* accents (shadcn chart palette) */
  --blue:          oklch(48.8% .243 264.376);  /* primary accent, active dots */
  --blue-label:    oklch(78.5% .115 274.713);  /* eyebrow on card hover [measured] */
  --emerald:       oklch(69.6% .17 162.48);    /* "NOW" square */
  --amber:         oklch(76.9% .188 70.08);
  --purple:        oklch(62.7% .265 303.9);
  --rose:          oklch(64.5% .246 16.439);
  --destructive:   oklch(70.4% .191 22.216);

  /* glass */
  --glass-bg:      rgba(40, 40, 44, .78);
  --glass-sheen:   rgba(255,255,255,.07);
  --glass-edge-1:  rgba(255,255,255,.26);
  --glass-edge-2:  rgba(255,255,255,.05);
  --glass-edge-3:  rgba(255,255,255,.10);
  --chip-top:      rgba(255,255,255,.24);
  --chip-bottom:   rgba(255,255,255,.11);
  --indicator-top: rgba(255,255,255,.17);
  --indicator-bot: rgba(255,255,255,.08);

  /* paper (polaroids) */
  --paper:         #F2EFE7;            /* [measured rgb(242,239,231)] */
}
```

### 2.2 Colour — light

```css
:root {
  --page:       #F4F4F4;               /* [measured] also <meta theme-color> */
  --fg:         oklch(14.5% 0 0);      /* [measured] */
  --glass-bg:   rgba(234, 234, 239, .82);
  /* glass shadows become 0.06 / 0.10 / 0.24 black instead of 0.5 / 0.5 / 0.75 */
  --chip-bottom-hover: rgb(234 234 238);
  --chip-bottom-active: rgb(226 226 232);
}
```
In light mode the animated gradient word is a flat blue; cards become `bg-surface` → `hover:bg-white`.

### 2.3 Signature gradients

```css
/* Hero accent word ("pipelines") */
--grad-hero: linear-gradient(100deg,
  #0044FF 0%, #3B6CFF 40%, #8B4DFF 68%, #E83DCF 86%, #FF7A1A 100%);

/* Section-heading accent word ("work", "writings", "everything", "say hello") */
--grad-section: linear-gradient(288deg,
  #FF8000 0%, #FF00CC 53.24%, #0044FF 100%);
```
Both run `background-size: 200% 200%` + `animation: gradient-x 6s ease infinite` (see §6).

### 2.4 Typography

| Role | Font | Size [measured @1536px] | Weight | Tracking | Line-height | Notes |
|---|---|---|---|---|---|---|
| Hero H1 | Instrument Serif | 76.8px (`~4.5rem`, fluid) | 400 | −0.025em (−1.92px) | 0.98 | accent word italic + `--grad-hero` |
| Section H2 | Instrument Serif | 63.75px (3.75rem) | 400 | −0.025em | 1.0 | glow `text-shadow` (below) |
| Hero name | Instrument Serif | 92.16px | 400 | −0.025em | 0.95 | `color: transparent` + silver gradient clip |
| Project title (H3) | Instrument Serif | 38.25px (2.25rem) | 400 | **+0.025em** | 1.1 | serif goes *positive* tracking at small sizes |
| Footer wordmark | Instrument Serif | ~281px (fluid, ~18vw) | 400 | tight | 1 | line-hatched fill |
| Hero sub-role | Bricolage | 31.875px (1.875rem) | 400 | −0.025em | — | `--fg-muted` |
| Card title | Bricolage | 21.25px (1.25rem) | 500 | −0.025em | 1.375 | `--fg-90` |
| Body / About | Bricolage | 17–20px | 400 | +0.01em | 1.6 | generous leading |
| Nav link | Bricolage | 13.5px | 500 | normal | — | |
| Card eyebrow | Bricolage | 12.75px (0.75rem) | 400 | +0.05em | — | UPPERCASE |
| Micro label | Bricolage | 10px | 400 | **+0.28em** (2.8px) | — | UPPERCASE, `--fg-70` ("REMOTE · INDIA · 3+ YEARS BUILDING") |
| Footer CTA | Bricolage | 51px (3rem) | **300** + **800** | +0.025em | 1.2 | UPPERCASE, light words + heavy keyword |
| Handwritten notes | Caveat 500 | 25.5px | 500 | — | — | rotated −3°, with hand-drawn SVG arrow |
| Code / data | Geist Mono 100–900 | — | — | — | — | timestamps, kbd, stats |

```css
/* Section heading glow — this is why headings look "lit" */
h2.display { text-shadow: 0 4px 8px rgba(255,255,255,.05), 0 8px 30px rgba(255,255,255,.20); }
```

Load via `next/font/google`: `Instrument_Serif({ weight:'400', style:['normal','italic'] })`, `Bricolage_Grotesque({ weight: 'variable' /*200–800*/ })`, `Geist_Mono`, `Caveat({ weight:'500' })`. Use `display: 'swap'` and `adjustFontFallback` (the site ships `… Fallback` faces to kill CLS).

### 2.5 Radius, borders, shadows

| Token | Value |
|---|---|
| `--r-card` | 14.625px (`rounded-xl` @17px root) |
| `--r-glass` | 22px |
| `--r-pill` | 9999px |
| `--r-project-bezel` | ~20px outer / ~14px inner |
| Card border | `box-shadow: 0 0 0 1px var(--border)` (Tailwind `ring-1`, not `border`, so it doesn't affect layout) |
| Rail/divider lines | 0.8px `var(--border)` |

```css
/* Elevated glass container (nav pill, search button) */
--shadow-glass:
  inset 0 -10px 18px -14px rgba(0,0,0,.5),
  0 1px 2px rgba(0,0,0,.5),
  0 16px 36px -14px rgba(0,0,0,.75);

/* Raised glass chip / active indicator */
--shadow-chip:
  inset 0 1px 0 rgba(255,255,255,.20),
  inset 0 -1px 0 rgba(0,0,0,.30),
  0 0 0 .5px rgba(0,0,0,.35),
  0 1px 2px rgba(0,0,0,.35),
  0 4px 10px -4px rgba(0,0,0,.5);

/* Dialog / palette */
--shadow-panel:
  inset 0 1px 0 #ffffff29, inset 0 0 0 1px #ffffff12, inset 0 -1px 1px #ffffff0a, 0 0 0 .5px #0009,
  0 2px 8px -2px #0006, 0 22px 50px -16px #000000bf;
```

### 2.6 Easing & timing

| Name | Value | Used for |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.4, 0, .2, 1)` | colour/bg transitions |
| fast | 150ms | nav link colour, chip states, press scale |
| base | 300ms | card bg, hover states |
| slow | 500ms | eyebrow colour → blue, illustration activation |
| Spring (pointer) | `{ type:'spring', stiffness: 400–500, damping: 30–35, mass: .6 }` [inferred] | nav indicator, cursor badge, dock |
| Spring (layout) | `{ type:'spring', bounce: .15, duration: .45 }` [inferred] | nav pill → mega-menu morph |
| Press | `scale: .98` on `:active` | every clickable card/button (`.press`) |

---

## 3. Layout system

### 3.1 The framed column
- Viewport content is wrapped in a `.container` ~**1436px** wide at 1536 viewport (≈ 84.5rem) with **left + right 0.8px rails** (`border-inline: .8px solid var(--border)`), running the full page height.
- Logo sits top-left *inside* the rails; nav is **fixed, centered**, overlaying the rails.
- Inner content padding: ~20px on bento grids, ~60px on hero/text sections.

### 3.2 Section dividers ("hatch strips")
Between major sections:

```
──■───────────────────────────────────────────────■──   ← 0.8px hairline, 7px squares at rail x-positions
//////////////////////////////////////////////////////   ← 43px tall full-bleed strip of faint diagonal hatch
──■───────────────────────────────────────────────■──
```

```css
.hatch-strip {
  height: 43px;                                     /* [measured] */
  border-block: .8px solid var(--border);
  background: repeating-linear-gradient(135deg,
      color-mix(in oklab, var(--fg) 6%, transparent) 0 1px,
      transparent 1px 6px);
  position: relative;
}
.hatch-strip::before, .hatch-strip::after {           /* nodes at the rail intersections */
  content:""; position:absolute; width:7px; height:7px;
  background: var(--border); top:-3.5px;
  left: calc(50% - var(--container)/2 - 3.5px);       /* mirror for the right rail */
}
```
The strip spans the full viewport (outside the rails) — that bleed is what makes the rails feel like a drawn frame.

### 3.3 Grids
| Section | Grid |
|---|---|
| Status strip (Now / Building / Writing / Reach out) | 4 equal columns, dividers via `border-left`, ~135px tall |
| Bento row 1 | `1.42fr 1fr` (≈ 818 / 580) |
| Bento row 2 | 3 equal columns |
| Projects | `grid-template-columns: 860.5px 573.7px` ≈ **60 / 40**, left = media stack, right = **sticky** header |
| Blog | 3 equal cards |
| Explore | 3 equal cards (Workstation / Behind the code / Guestbook) |
| Footer | 3 link columns left, info column right |

Card gap: 12px. Cards: `rounded-xl ring-1 ring-border bg-card/15 hover:bg-card/5 transition-all duration-300`.

---

## 4. Page anatomy (top → bottom)

```
┌ Fixed glass nav (centered) + search button ──────────────────────────────┐
│ HERO: H1 serif (2 lines) + micro-label        │ "New launch" callout + iso keyboard │
│       Polaroid stack (4 photos)               │ Role (grotesk) + Name (serif, silver)│
├ STATUS STRIP: Now · Building · Writing · Reach out (CTA button) ──────────┤
├ hatch ────────────────────────────────────────────────────────────────────┤
│ BENTO: How I Work (iso illus.) │ Daily Drivers (4-row marquee + filters)  │
│ What You Get (conveyor)  │ Remote, Worldwide (dot map) │ Workstation (dock)│
├ hatch ────────────────────────────────────────────────────────────────────┤
│ CASE STUDIES / "Curated work"                                             │
│ [project media card]           │ sticky: index rail · title · tags · copy │
│ × 5 projects                   │          · bullets · Read case study      │
├ hatch ────────────────────────────────────────────────────────────────────┤
│ KNOW ABOUT ME / heading + bio + socials │ wand + lanyard ID card (physics)│
├ hatch ────────────────────────────────────────────────────────────────────┤
│ FROM THE DESK / "Thoughts & writings"  + Read all posts → 3 blog cards     │
├ hatch ────────────────────────────────────────────────────────────────────┤
│ MY SITE / "Explore, experiment && say hello" → 3 cards                     │
├ hatch ────────────────────────────────────────────────────────────────────┤
│ CTA: dot-matrix art · winged emblem · GOT AN IDEA… · OPEN TO WORK seal    │
├ hatch ────────────────────────────────────────────────────────────────────┤
│ FOOTER: links · local time · email(copy) · legal · theme toggle            │
│ Giant hatched serif wordmark, fading out at the bottom                     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Components — structure, styles, interactions, recipe

### 5.1 Glass nav pill with sliding indicator

**Look.** Fixed, top: ~23px, centered. 481×44px pill. Items: Home · About · Work · Blog · More ⌄ · **Book a Call** (raised glass chip) — and a separate 38px circular glass search button (⌘K).

**Layers (bottom → top):**
1. `.glass-pill` — absolute, `inset:0`, radius 22px, `background: var(--glass-bg)` + top sheen `linear-gradient(180deg, var(--glass-sheen) 0, transparent 55%)`, `backdrop-filter: blur(22px) saturate(185%)`, `box-shadow: var(--shadow-glass)`.
2. `.glass-pill::before` — **gradient hairline border** via mask-composite (the "liquid glass" edge):
   ```css
   .glass-pill::before{
     content:""; position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
     background: linear-gradient(172deg, var(--glass-edge-1) 0, var(--glass-edge-2) 42%, var(--glass-edge-3) 100%);
     -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
     -webkit-mask-composite: xor; mask-composite: exclude;
   }
   ```
3. **Indicator** `<span>` — absolute, full-height pill, `background: linear-gradient(180deg, var(--indicator-top), var(--indicator-bot))`, `box-shadow: var(--shadow-chip)`.
4. Links — `padding: 8.5px 17px`, 13.5px/500, inactive `--fg-65`, active/hovered `#fff`, `transition: color .15s, scale .15s`.

**Interaction [measured]:**
- Indicator sits under the active route (opacity 1).
- On hover over another link: indicator **springs** to it — JS writes `width` and `translateX` (e.g. `width:63px; transform:translateX(212px)`) and drops opacity to **0.85**. There is **no CSS transition** — it's Motion.
- On `mouseleave` of the whole nav, it springs back to the active link (opacity 1).
- `:active` on links/chips → `scale: .98`.

```tsx
const [hover, setHover] = useState<string|null>(null);
const target = hover ?? activeHref;
const rect = rects[target];               // measured via refs + ResizeObserver
<motion.span
  className="indicator"
  animate={{ x: rect.left, width: rect.width, opacity: hover && hover!==activeHref ? .85 : 1 }}
  transition={{ type:'spring', stiffness:500, damping:35, mass:.6 }} />
<ul onMouseLeave={()=>setHover(null)}>{links.map(l =>
  <li onMouseEnter={()=>setHover(l.href)} ref={setRef(l.href)}>…</li>)}</ul>
```

**"Book a Call" chip (`.glass-chip`):**
```css
.glass-chip{
  --chip-top: rgba(255,255,255,.24); --chip-bottom: rgba(255,255,255,.11);
  background-image: linear-gradient(180deg, var(--chip-top), var(--chip-bottom));
  box-shadow: var(--shadow-chip); border-radius:9999px; padding:8px 16px; font:500 13.5px/1 var(--font-sans);
  transition: all .15s var(--ease-standard);
}
.glass-chip:hover  { --chip-top: rgba(255,255,255,.30); }
.glass-chip:active { --chip-top: rgba(255,255,255,.14); --chip-bottom: rgba(255,255,255,.06); scale:.98; }
.glass-chip:focus-visible { box-shadow: var(--shadow-chip), 0 0 0 2px rgb(255 255 255 / .25); }
```
Animating custom props (`--chip-top`) instead of `background` keeps the gradient transitionable. Register them with `@property` for smooth interpolation.

### 5.2 "More" → mega panel (pill morph)

Clicking **More** expands the *same* glass pill from **481×44 → 600×326** [measured]; links stay in place on top; panel content fades in below.
- Left column: 5 rows, each = 32px rounded-square app-icon (colour-coded: amber Guestbook, rose Bucket List, slate Uses, pink Colophon, sky Links) + title (14px/500) + one-line description (12px, `--fg-55`). Row hover = `bg-white/6`, radius 10px.
- Right column: **live preview card** of the hovered destination (screenshot thumbnail in a rounded frame) + caption row `Title ………… domain/path`. Preview cross-fades on row hover.
- Bottom: search row "Search posts, projects and pages" + `⌘` `K` kbd chips → opens §5.3.
- Chevron rotates 180°. Esc / outside click closes; pill springs back.

Recipe: render the pill as `motion.div layout` with `transition={{ type:'spring', bounce:.15, duration:.45 }}`; put panel content in `AnimatePresence` with `initial={{opacity:0, y:-4, filter:'blur(4px)'}}`. Use `layout="position"` on the link row so text never stretches.

### 5.3 ⌘K command palette
- Trigger: `⌘K` / `Ctrl+K`, search button, or panel search row.
- Overlay dims + blurs the page. Panel ~760×480, glass (`--shadow-panel`), radius ~18px.
- Top: borderless 18px input "Search posts, projects, pages…".
- Left list (scrollable, thin custom scrollbar): groups **Recent** (with "Clear"), **Latest**, **Pages**. Rows = 24px icon + title + right-aligned type tag (`Recent`, `Post`, `Project`, `Current` in blue, `Page`). Selected row: `bg-white/8`.
- Right pane: preview image, title, 2-line description, metadata table (Type / Published / …).
- Footer: theme toggle (moon) bottom-left; actions bottom-right as glass buttons with kbd hints: **View Project ↵** · **Close esc**.
- Build on `cmdk`; preview = `selected` item's data.

### 5.4 Hero

**Left**
- H1 two lines: "Complex web apps, / from pixels to *pipelines*". Visually-hidden prefix span for SEO ("Name, role: ") — keeps the visible headline short while the `<h1>` reads fully.
- Accent word:
  ```css
  .accent-hero{ font-style:italic; background:var(--grad-hero); background-size:200% 200%;
    -webkit-background-clip:text; background-clip:text; color:transparent;
    animation: gradient-x 6s ease infinite; padding-right:.08em; /* italic overhang */ }
  ```
- Micro-label: 10px, `letter-spacing:.28em`, uppercase, `--fg-70`, separators " · ".

**Polaroid stack (4 photos)**
- Each card is absolutely positioned from a shared centre with a transform [measured]:

  | # | x | y | rotate | z (rest) |
  |---|---|---|---|---|
  | 1 | −160px | 18px | −3° | 30 |
  | 2 | −10px | 4px | +1.5° | 40 |
  | 3 | +140px | 14px | −2° | 50* |
  | 4 | +290px | 6px | +3° | 10 |

- Frame: `background: var(--paper)` (#F2EFE7), `padding: 10.6px` (0.625rem) all sides (classic polaroid would be thicker at the bottom — this one is even), soft shadow `0 1px 2px rgba(0,0,0,.1), 0 12px 30px -10px rgba(0,0,0,.6)`, ~226–231px square.
- **Hover:** hovered card gets `z-index: 50`; its inner layer animates to `scale(1.03) translateY(−10px)` and rotates *toward* 0° (net tilt roughly halves). Others stay. Spring, ~300ms.
- On load: cards deal in from the centre with stagger (opacity 0→1, rotate from 0 → final, `filter: blur(6px)→0`).

```tsx
<motion.div style={{ x, y, rotate, zIndex: hovered ? 50 : z }}>
  <motion.div whileHover={{ scale:1.03, y:-10, rotate: -rotate/2 }}
              transition={{ type:'spring', stiffness:300, damping:22 }}
              className="bg-[--paper] p-[.625rem] shadow-polaroid">
    <Image … />
  </motion.div>
</motion.div>
```

**Right**
- "NEW LAUNCH" (10px, +0.1em, `--fg-50`) over "Try Keythm" (Instrument Serif ~26px) + 28px square glass icon button `↗`.
- A **leader line**: 1px vertical line from the label down to a **blue dot** on an isometric line-drawn keyboard. Load animation: line `leader-in` (scaleY 0→1, origin top) then dot `dot-in` (opacity 0, scale .2 → 1).
- Isometric keyboard (SVG, stroke `--fg` @ ~35%): **keys under the pointer press** (`key-tap`: translateY 0→2px→0) and tint blue. Implement by hit-testing pointer against each key `<g>` (or `onPointerEnter` per key).
- Role "AI full-stack engineer" — Bricolage 31.9px, `--fg-muted`, −0.025em.
- Name — Instrument Serif 92px, right-aligned, 2 lines, `color: transparent` with a silver vertical gradient clip (`linear-gradient(180deg,#fff 0%, #cfcfd4 55%, #8a8a90 100%)` [inferred]).

### 5.5 Status strip
4 cells, each: 10.6px colour square (emerald / orange / sky / rose) + uppercase label (12.75px, `--fg-55`, +0.025em) + arrow `→` top-right (`--fg-50`, slides 2px right on hover) / title (17px/500) / sub (`--fg-55`).
Cell 4 is a **CTA button** instead: full-width pill, `bg #1a1a1c`, ring-1 border, label centered, **white circular arrow knob** on the right (36px, black arrow). Hover: knob slides/rotates arrow −45°→0, button bg lightens.

### 5.6 Bento cards (shared shell)

```css
.bento{ position:relative; overflow:hidden; border-radius:var(--r-card);
  background:#131314; box-shadow:0 0 0 1px var(--border);
  transition: background-color .3s var(--ease-standard); }
.bento:hover{ background:#0F0F10; }
.bento .eyebrow{ font-size:.75rem; letter-spacing:.05em; text-transform:uppercase; color:var(--fg-55);
  transition: color .5s var(--ease-standard); }
.bento:hover .eyebrow{ color: var(--blue-label); }
.bento .title{ font:500 1.25rem/1.375 var(--font-sans); letter-spacing:-.025em; color:var(--fg-90); }
.bento .go{ position:absolute; right:20px; bottom:20px; width:34px; height:34px; border-radius:9999px;
  opacity:0; translate:0 6px; transition:all .3s; }   /* round glass arrow button */
.bento:hover .go{ opacity:1; translate:0 0; }
.bento:active{ scale:.98; }
```
Card background often carries a faint **isometric grid** (SVG `<pattern>` 36×18 of diamond lines, stroke-opacity .06, `stroke-width .6`) — exact pattern found: `M0 9 L18 0 L36 9 M0 9 L18 18 L36 9`.

**5.6.1 How I Work** — isometric SVG: a paper strip folding through `SPEC → DECIDED → SHIPPED`, with bars labelled W1–W3 and a QR on the "shipped" end; crosshair "×" marks at the drawing's corners.
- Rest: all monochrome strokes.
- Hover: bars fill blue (gradient `#1d4ed8 → #0b1a4a`), small **checkmarks** draw in on the spec sheet (stroke-dashoffset), a blue under-glow fades in. 500ms.

**5.6.2 Daily Drivers (skills)**
- 4 horizontal marquee rows of tech chips; each row's content is **duplicated (×3)** and animates `translateX(0 → var(--tech-row-shift, −33.333%))`.
  | Row | Content | Duration | Direction |
  |---|---|---|---|
  | 1 | Frontend | 50s | normal |
  | 2 | Backend | 65s | reverse |
  | 3 | AI | 90s | normal |
  | 4 | Tools | 85s | reverse |
- Container mask: `mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)`.
- **Paused off-screen**: `animation-play-state: paused` until an IntersectionObserver marks it visible. Also pause on hover.
- Chip: brand icon (14px, brand colour) + label 12px; `padding: 4px 9px; border-radius: 6px; background: rgba(255,255,255,.03); box-shadow: 0 0 0 1px var(--border)`.
- **Filter tabs** (ALL · FRONTEND · BACKEND · AI · TOOLS): 10px uppercase +0.1em; each preceded by a 5px square (outlined when inactive, solid blue when active). Selecting a category **stops the marquee and lays out only that category's chips as a static wrapped grid** (fade + slight y). ALL returns to the marquee.

**5.6.3 What You Get** — isometric conveyor belt with boxes passing through a scanner gantry; the box under the gantry glows blue with `{T}` (typed). Footer label "TYPED END TO END". Hover [inferred]: belt advances (boxes translate along iso axis), scanned box pulses.

**5.6.4 Remote, Worldwide (timezone map)**
- Dot-matrix world map (SVG circles on a grid, `--fg` @ 15–30%), home marker: blue 6px square + "NEW DELHI" micro-label.
- A **sun glyph with radial amber glow** placed at the current subsolar point (moves with real time).
- Toggles: `LOCAL · US · UK` (square-dot tabs as in 5.6.2).
- Right label: live clock — `SAME TIMEZONE · 11:09 AM` for local; `NEW YORK · 1:43 AM` when US selected.
- Selecting US/UK: adds a city marker and **draws a blue great-circle arc** from New Delhi to it (`pathLength` 0→1, ~700ms ease-out), label crossfades.
  ```tsx
  <motion.path d={arc(delhi, target)} stroke="var(--blue)" fill="none"
     initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:.7, ease:[.4,0,.2,1]}}/>
  // arc(): quadratic bezier with control point lifted by ~25% of distance
  ```
  Clock: `Intl.DateTimeFormat('en-US',{timeZone, hour:'numeric', minute:'2-digit'})` updated every 30s.

**5.6.5 Workstation (macOS dock)**
- Frosted dock bar (radius 16px, `bg-white/4`, ring), 38px app icons with a **running-indicator dot** (3px) under each, a thin vertical separator before the last group.
- **Magnification** [measured]: icon at cursor ≈ **62px**, neighbours ≈ 52px → 46px → back to 38px. Width-based (layout reflows, the bar grows), driven by pointer distance:
  ```tsx
  const mouseX = useMotionValue(Infinity);
  // per icon:
  const d = useTransform(mouseX, x => x - (ref.current?.getBoundingClientRect().x ?? 0) - 19);
  const size = useSpring(useTransform(d, [-120, 0, 120], [38, 62, 38]), { mass:.1, stiffness:170, damping:12 });
  ```
- **Tooltip**: dark pill (`bg #2a2a2e`, 11px, radius 8px) with a tiny caret, 8px above the icon.
- **Idle demo** [observed]: when not hovered, the tooltip auto-cycles through icons every ~2s (gentle hint that it's interactive).
- Footer micro-label: `MACBOOK M5 PRO · 24GB · 1TB`.

### 5.7 Section headings

```html
<p class="eyebrow-center">CASE STUDIES</p>
<h2 class="display">Curated <span class="accent">work</span></h2>
```
- Eyebrow 12.75px uppercase +0.05em `--fg-70`.
- H2 Instrument Serif 63.75px, glow `text-shadow` (§2.4).
- Accent span: italic, `--grad-section`, 6s `gradient-x`, plus **scroll-triggered mask sweep reveal**:
  ```css
  .accent{ -webkit-mask-image: linear-gradient(to right, #000 70%, transparent 100%);
           -webkit-mask-size: 0 100%; -webkit-mask-repeat:no-repeat; }
  .accent.in-view{ animation: mask-sweep 1.1s cubic-bezier(.4,0,.2,1) forwards, gradient-x 6s ease infinite; }
  @keyframes mask-sweep{ from{ -webkit-mask-size:0 100% } to{ -webkit-mask-size:200% 100% } }
  ```
  The word "writes itself" left→right with a soft trailing edge (the 70%→100% fade in the mask).

### 5.8 Projects — sticky split ("Curated work")

**Left column — media cards (one per project)**
- Outer **bezel**: dark device-like frame, radius ~20px, `padding: 8px`, background `#141416`, `box-shadow: 0 0 0 1px var(--border), inset 0 1px 0 rgba(255,255,255,.06), 0 30px 60px -30px #000`.
- Inner panel: radius ~14px, **per-project accent gradient** background (Keythm magenta `#b0135f→#e84fa0`, Nextdemy indigo `#2b2fd6→#5b6cff`, Venture Den slate grey, Finote violet, StarForge pink), headline in Bricolage 26px/500 white top-left, `→` top-right.
- Product screenshot(s) set into the panel, slightly perspective-tilted or layered (multiple screens fanned for some projects), bleeding off the bottom edge.
- Vertical gap between cards ≈ 110px so the sticky header has scroll distance per project.
- **Cursor badge**: on hover, the native cursor area gets a **76px circular badge** that *follows the pointer* (spring) — white ring with "VIEW · EXPLORE · DISCOVER ·" set on an SVG `<textPath>` circle, rotating at **12s linear infinite** (`spin-slow`), eye icon in a dark centre disc. It is `pointer-events:none`, scales in from 0.6 on enter, out on leave.
  ```tsx
  const x = useSpring(0,{stiffness:350,damping:30}), y = useSpring(0,{stiffness:350,damping:30});
  onPointerMove={e=>{ const r=e.currentTarget.getBoundingClientRect(); x.set(e.clientX-r.left); y.set(e.clientY-r.top); }}
  <motion.div style={{x,y,translateX:'-50%',translateY:'-50%'}} className="pointer-events-none absolute">
    <div className="animate-[spin-slow_12s_linear_infinite]"><svg viewBox="0 0 100 100">
      <defs><path id="c" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
      <text font-size="10" letter-spacing="2.4"><textPath href="#c">VIEW · EXPLORE · DISCOVER · </textPath></text>
    </svg></div>
  </motion.div>
  ```

**Right column — sticky header** [measured `position: sticky; top: 102px`]
- **Index rail** left of the title: 5 short horizontal dashes stacked vertically (one per project). Active dash is longer (~22px vs 10px) and takes the **project's accent colour**; others `--fg-30`. Transitions width + colour 300ms.
- Title: Instrument Serif 38px, +0.025em; type tag beside it (10px uppercase, +0.1em, `--fg-50`): `WEB APP`, `SAAS APP`, `MOBILE APP`, `STARTER`.
- Tech tags: pills, 13px, `padding: 3px 10px`, ring-1, radius 9999.
- Description: Bricolage 17px/1.55, `--fg` @ 90%.
- Bullets: 4-point **sparkle** glyph (✦) in the project accent colour + 15px `--fg-70` text.
- "Read case study" (14.9px/500, `--fg-70`) + 22px round glass arrow chip; hover → text to white, arrow nudges right.
- **Swap behaviour:** as each left card crosses the viewport centre (IntersectionObserver, `rootMargin: '-50% 0px -50% 0px'`), the sticky header crossfades to that project's data (opacity + 8px y + blur 4px → 0; ~350ms). Accent colour is a CSS variable set on the header so dashes/sparkles recolour in sync.

### 5.9 About ("Full-Stack Developer and a little bit of *everything*")
- Left: eyebrow, H2, 3 bio paragraphs (Bricolage ~19px, `--fg-70`, +0.01em, lh 1.6), social icon row (LinkedIn/GitHub/X, 20px, `--fg-55` → white), "Work experience →" link.
- Background of the whole section: very subtle diagonal fabric/noise texture.
- **Wand** (SVG, carved-wood segments, a small blue gem/rune): free-standing vertical; on drag it **follows/tilts toward the pointer** (rotate around its base with a spring) [measured: moves with drag]; a sparkle trail is a nice addition [inferred]. Handwritten Caveat annotation "*wave it*" with a looping hand-drawn SVG arrow pointing at it.
- **Lanyard ID card**: a fabric strap (repeating vertical "AAYUSHBHARTI.IN" text, 7px, letterspaced) hangs from the top of the section → metal clip → card.
  - Back face (default): dark carbon-fibre texture, centered monogram, name in 9px tracked caps at bottom.
  - **Drag it**: the card swings like a pendulum on its strap (rope = 2–3 verlet points or a damped spring on angle), tilts in 3D, and **flips to the front face** (photo, serif name, role) when rotated past ~90°. Release → swings back with damping.
  - Caveat "*tap it ✦*" annotation, `rotate: -3deg`.
  - Recipe (no canvas needed):
    ```ts
    // angle physics
    let a=0, v=0; const k=0.02, damp=0.92;
    function tick(){ if(!dragging){ v += -k*a; v*=damp; a+=v; } el.style.transform=`rotate(${a}rad)`; raf(tick); }
    // card face: rotateY = clamp(dragVelocityX*…) ; backface-visibility:hidden on both faces
    ```
    The strap is an SVG path from the anchor to the clip, recomputed each frame (quadratic curve sagging toward the card).

### 5.10 Blog cards ("Thoughts & writings")
- Header row: H2 left, "Read all posts →" right (same link style as "Read case study").
- Card: bento shell + `padding: 10px`; cover image (radius 10px, aspect ~16/8.5) with a **centered short title overlaid** in white Bricolage 22px/500 with soft text-shadow (cover-as-thumbnail); a darkening bottom gradient on the image.
- Body: title 19px/600, 2-line clamped excerpt `--fg-55`, footer row `12 MIN READ · OCT 20, 2026` (11px uppercase +0.05em, `--fg-50`) and "Read article →" right.
- Hover: image `scale(1.04)` (700ms ease-out), card bg darkens, arrow `→` gains a trailing dot sliding in (seen in one hover screenshot) [inferred timing].

### 5.11 "Explore, experiment && say hello"
H2 where the second line is the accent: "&& say hello" (literal `&&` — code joke).
Three cards:
1. **Workstation** — reuses the dock from 5.6.5.
2. **Behind the Code** — the lanyard card in miniature hanging from a strap (idle bob — the site ships `snitch-hover` translateY 0→−3px, likely used for this or a hovering trinket [inferred]).
3. **Guestbook** — a corkboard of **paper notes** (kraft, lined, airmail-bordered postcards) held by **wooden clothes-pegs and pins**, each with a short testimonial in a handwriting/serif font and an attribution. Interactions use these keyframes:
   - `note-swing` (rotate 0 → 1.4° → −0.7° → 0.3° → 0) on hover — paper sways from its peg.
   - `note-peel` (perspective 900px, rotateX 0 → 9° → 5° → 6°) — the bottom edge lifts toward you.
   - `peg-open` (rotate to `var(--peg)` and back with −15% overshoot) — the peg jaw opens.
   - `pin-press` (scale 1 → .85 → 1.06 → 1) — push-pin presses in.
   - `clip-jiggle` (−8° → 5° → −2° → 0) — paperclip wiggle.
   - `pencil-scribble` — a pencil jitters as if writing on the "Your note here →" postcard.

### 5.12 Footer CTA
- Background: **dot-matrix pixel art** (two figures/shapes at left & right) built from tiny glyphs — `○`, `◎`, `+`, `×`, `·` — in mixed colours (amber, sky, rose, violet, white @ 30–80%), scattered sparse stars across the section. Subtle twinkle via `pulse` on random cells [inferred].
- Emblem: circular navy badge with monogram flanked by gold line-art **wings** (SVG).
- Headline: `GOT AN IDEA WORTH **BUILDING?**` / `LET'S TALK IT **THROUGH**` — Bricolage 51px uppercase, **weight 300 with the key word at 800**, +0.025em.
- **"OPEN TO WORK" seal**: 110px dark disc overlapping the end of the headline, text on a circle path ("OPEN TO WORK · OPEN TO WORK ·"), blue ✦ centre, rotating (`spin-slow`), ring shadow.
- Button: "Start a conversation" pill (same as status-strip CTA).
- Sub: Instrument Serif 26px "I'm taking on freelance projects…" + Bricolage 19px `--fg-70` "Tell me what you're working on."

### 5.13 Footer
- 3 link columns (WORK / SITE / SOCIAL headings in 10px tracked caps `--fg-50`; links 17px `--fg-70` → white on hover).
- Right: LOCAL TIME `11:11 AM IST · Remote, India` (live), EMAIL with a **copy icon** (click → icon swaps to ✓ for 1.5s + toast).
- Bottom row: © year · legal links (Privacy, Terms, Sitemap, RSS, llms.txt) · **segmented theme toggle** (sun / monitor / moon in a rounded glass track, active segment raised chip).
- **Giant wordmark**: name in Instrument Serif at ~18vw spanning the container, filled with **fine diagonal hairlines** and faded out downward:
  ```css
  .wordmark{ font-size: clamp(120px, 18.3vw, 300px); line-height:1; white-space:nowrap;
    background:
      repeating-linear-gradient(160deg, oklab(.985 0 0/.22) 0 1px, transparent 1px 3px),
      linear-gradient(oklab(.985 0 0/.06), oklab(.985 0 0/.06));
    -webkit-background-clip:text; background-clip:text; color:transparent; }
  .wordmark-wrap{ -webkit-mask-image: linear-gradient(#000 60%, transparent); overflow:hidden; }
  /* each letter rises in when the footer enters view */
  .wordmark .ch{ display:inline-block; animation: footer-mark-rise .9s cubic-bezier(.2,.7,.2,1) both;
                 animation-delay: calc(var(--i) * 45ms); }
  @keyframes footer-mark-rise{ 0%{opacity:0; translate:0 105%} 45%{opacity:1} }
  ```

---

## 6. Motion catalogue (all 29 keyframes, verbatim logic)

```css
@keyframes gradient-x   { 0%,100%{background-position:0 50%} 50%{background-position:100% 50%} }   /* 6s ease infinite */
@keyframes spin-slow    { to{transform:rotate(1turn)} }                                             /* 12s linear infinite */
@keyframes tech-row     { to{transform:translateX(var(--tech-row-shift,-33.333%))} }                /* 50–90s linear */
@keyframes rise-in      { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none} } /* scroll reveals */
@keyframes mask-sweep   { from{mask-size:0 100%} to{mask-size:200% 100%} }
@keyframes footer-mark-rise { 0%{opacity:0; translate:0 105%} 45%{opacity:1} }
@keyframes leader-in    { 0%{transform:scaleY(0)} }
@keyframes dot-in       { 0%{opacity:0; scale:.2} }
@keyframes key-tap      { 0%,100%{transform:translateY(0)} 40%{transform:translateY(2px)} }
@keyframes snitch-hover { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes eq           { 0%,100%{height:30%} 50%{height:100%} }                                   /* now-playing bars */
@keyframes note-swing   { 0%,100%{transform:rotate(0)} 20%{transform:rotate(1.4deg)} 45%{transform:rotate(-.7deg)} 70%{transform:rotate(.3deg)} }
@keyframes note-peel    { 0%{transform:perspective(900px) rotateX(0)} 45%{transform:perspective(900px) rotateX(9deg)} 75%{transform:perspective(900px) rotateX(5deg)} 100%{transform:perspective(900px) rotateX(6deg)} }
@keyframes clip-jiggle  { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 55%{transform:rotate(5deg)} 80%{transform:rotate(-2deg)} }
@keyframes pin-press    { 0%,100%{transform:scale(1)} 40%{transform:scale(.85)} 75%{transform:scale(1.06)} }
@keyframes peg-open     { 0%,100%{transform:rotate(0)} 35%{transform:rotate(var(--peg))} 70%{transform:rotate(calc(var(--peg)*-.15))} }
@keyframes pencil-scribble { 0%,100%{transform:translate(0) rotate(0)} 35%{transform:translate(-5px,-1.5px) rotate(-1.5deg)} 70%{transform:translate(2px,.5px) rotate(.5deg)} }
/* "shore" scene (used on an inner page illustration) */
@keyframes shore-wash    { from{transform:translateY(-6px)} to{transform:translateY(8px)} }
@keyframes shore-sway    { from{transform:rotate(-4deg)} to{transform:rotate(5deg)} }
@keyframes shore-step    { 0%,100%{opacity:0} 6%,45%{opacity:.55} 60%{opacity:0} }
@keyframes shore-ripple  { from{opacity:.6; transform:scale(.6)} to{opacity:0; transform:scale(1.5)} }
@keyframes shore-owl     { 0%{transform:translate(-160px,470px)} 35%,100%{transform:translate(1620px,-60px)} }
@keyframes shore-shimmer { from{transform:translate(-3px) scaleY(1)} to{transform:translate(3px) scaleY(1.03)} }
@keyframes shore-bob     { from{transform:translateY(-2px) rotate(-2deg)} to{transform:translateY(2px) rotate(2deg)} }
/* utilities */
@keyframes spin  { to{transform:rotate(1turn)} }
@keyframes ping  { 75%,100%{opacity:0; transform:scale(2)} }
@keyframes pulse { 50%{opacity:.5} }
/* tailwindcss-animate style — note the blur channel */
@keyframes enter { from{ opacity:var(--tw-enter-opacity,1);
  transform:translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0) scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1)) rotate(var(--tw-enter-rotate,0));
  filter:blur(var(--tw-enter-blur,0)); } }
@keyframes exit  { to{ opacity:var(--tw-exit-opacity,1);
  transform:translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0) scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1)) rotate(var(--tw-exit-rotate,0));
  filter:blur(var(--tw-exit-blur,0)); } }
```

### Motion rules (the "perfection" part)
1. **Pointer-touched = spring. Ambient = linear loop. State change = 150–500ms standard ease.** Never mix: the nav indicator has *zero* CSS transition so CSS and Motion don't fight.
2. **Press feedback everywhere**: `.press:active { scale:.98 }` and shadow layers collapse to transparent while pressed.
3. **Blur is part of entrances**: overlays, palette, project-info swaps use `filter: blur(4–6px) → 0` with opacity — it reads as focus, not just fade.
4. **Loops pause when invisible** (IntersectionObserver toggling `animation-play-state`), and on hover where reading matters (marquees).
5. **One accent colour per interaction.** Hover activates blue (cards, eyebrows, illustration). Projects use their own accent but only on dashes, sparkles and the media gradient.
6. **Stagger small**: 40–60ms between siblings (polaroids, wordmark letters, list rows).
7. **Idle hints**: dock tooltip auto-cycles, wand/lanyard have "wave it / tap it" annotations, badge spins — so interactivity is discoverable without instructions.
8. **`prefers-reduced-motion`**: disable loops (marquee becomes static wrap, badges stop), replace springs with instant state, keep colour transitions.

---

## 7. Scroll behaviour
- Native scrolling (no Lenis). Fixed nav never hides.
- Section content reveals with `rise-in` (14px, ~600ms, standard ease) once 15% visible, children staggered 60ms.
- Heading accent words: `mask-sweep` on first entry.
- Projects: sticky right header swap (§5.8).
- Footer wordmark: per-letter `footer-mark-rise` on entry.

---

## 8. Accessibility & perf details worth copying
- "Skip to content" link first in DOM.
- Visually-hidden SEO prefix inside the H1.
- Every decorative SVG `aria-hidden`; icon buttons have `aria-label` ("Search (⌘K)").
- Focus rings: `focus-visible:ring-2 ring-white/25` (dark) / `ring-blue-500/40` (light).
- `next/image` everywhere, responsive `w=` sizes; fonts with metric-matched fallbacks.
- No canvas/WebGL — all illustrations are SVG, so they recolour with CSS variables and theme instantly.
- Marquees/loops paused off-screen → low idle CPU.
- Ships `llms.txt`, RSS, sitemap, OG image route (`/opengraph-image`).

---

## 9. Build order (recommended)

1. **Foundation** — Next.js + Tailwind v4, `html{font-size:17px}`, fonts, tokens (§2) as CSS vars, `next-themes`.
2. **Frame** — container rails + hatch-strip divider component with nodes (§3).
3. **Primitives** — `GlassPill`, `GlassChip`, `Bento`, `Eyebrow`, `DisplayHeading` (with `Accent` gradient + mask sweep), `ArrowLink`, `PillCTA` with knob.
4. **Nav** — sliding indicator → mega-panel morph → ⌘K palette.
5. **Hero** — headline, polaroid stack, keyboard callout, name.
6. **Bento** — marquee + filters, timezone map + arc, dock magnification, iso illustrations with hover activation.
7. **Projects** — sticky split + cursor badge + index rail.
8. **About** — lanyard physics + wand.
9. **Blog / Explore / Guestbook notes**.
10. **CTA + footer** — dot-matrix art, seal, wordmark rise.
11. **Polish pass** — press states, reduced motion, pause-offscreen, focus rings, light theme parity.

---

## 10. Agent prompt (paste this with the file)

> Build a Next.js 15 + Tailwind v4 + Motion portfolio that follows `design.md` exactly. Treat **[measured]** values as fixed and **[inferred]** as starting points. Use my own content/photos/projects (placeholders where missing). Implement components in the build order of §9, one PR-sized step at a time, and after each step screenshot it and compare against the spec's interaction notes (hover, press, spring, loop, reduced-motion). Do not add new colours, fonts or radii outside §2.
