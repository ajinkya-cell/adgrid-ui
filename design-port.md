# design-port — the "Port" design language

> **What this is:** the design language behind the `developer-portfolio` template, written down so it can be reused for other things: landing pages, blogs, docs, changelogs, agency sites, link pages, resumes.
> **Source of truth:** `packages/ui/src/templates/developer-portfolio/` (tokens and primitives live in `parts.tsx`).
> **Not void-ui.** This is a separate language. No bevels, wells, popouts, prismatic edges, machined surfaces, or void primitives. If a page built from this file starts to look like `DESIGN.md`, it is wrong.

---

## 1. The idea in one paragraph

A page is an **engineer's notebook**. The base layer is a flat, precise, monochrome blueprint: dashed rails, hairline boxes, mono metadata, no shadows, no gradients. On top of it sits a small **human layer**: a taped polaroid, a pen underline, a sticky note, a handwritten signature, a sheet of lined paper. The blueprint says "this person is exact"; the human layer says "a person made this". Every page built in this language needs both layers, in roughly a 95 / 5 split.

Three rules follow from that:

1. **Flat and ruled.** Structure is drawn with lines, never with elevation. Dashed lines are structure, solid hairlines are objects.
2. **Monochrome with meaning-only colour.** The page is greys. Colour appears only when it means something: green = live/active, red = ended, amber = star, sky = verified, plus one pen colour.
3. **One pen, used sparingly.** Hand-drawn marks are scarce. A page with ten annotations has none.

---

## 2. Where it came from

The language is a fusion of three portfolios plus our own additions. Knowing which trait came from where helps when you need to push a new page in one direction.

| Source | What we took |
|---|---|
| **akkki.tech** | The three-column page on dashed rails: section titles in a left column, content in the middle, a sticky right column with search pill, theme toggle, "currently building" and a live index. Cabinet Grotesk display headings. |
| **manishx.in** | Corner-bracket section titles, dashed boxes, plain text nav with an "Open-source" pill, bullet intro with bold keywords, featured profile cards, the skills marquee, the dotted experience timeline with Active / Done pills, wide project cards. |
| **chanhdai.com** | Hatched strips between sections, Geist + Geist Mono, icon-boxed info rows, live local time with offset, superscript counts `(3)`, the flat grey contribution graph, light and dark themes. |
| **Ours** | The human layer: Roughly annotations in Reenie Beanie, the taped polaroid avatar, the lined-paper contact note, the hand-signed footer, the working terminal, the cover video. |

When a new page feels too much like one source, borrow from the other two (this happened once: the hero looked too much like chanhdai, and the fix was the polaroid, the terminal and the arrows).

---

## 3. Tokens

All colour is CSS variables on a root element, so light and dark are one switch. Prefix `--pf-` in the portfolio; keep the same names for new pages (or rename the prefix consistently).

### 3.1 Colour

| Token | Dark | Light | Use |
|---|---|---|---|
| `--pf-bg` | `#0a0a0a` | `#ffffff` | Page background |
| `--pf-fg` | `#fafafa` | `#09090b` | Headings, primary text, solid buttons |
| `--pf-muted` | `#a1a1aa` | `#52525b` | Body text, secondary text |
| `--pf-subtle` | `#71717a` | `#a1a1aa` | Metadata, placeholders, counts |
| `--pf-line` | `rgba(255,255,255,0.10)` | `#e4e4e7` | Solid hairlines: objects (buttons, tags, icon boxes, dialogs) |
| `--pf-dash` | `rgba(255,255,255,0.16)` | `#d4d4d8` | Dashed lines: structure (rails, section rules, card outlines) |
| `--pf-panel` | `#131315` | `#f7f7f8` | The only fill: tags, icon boxes, hover rows, terminal, kbd |
| `--pf-hatch` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.07)` | Diagonal hatch lines |
| `--pf-dot` | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.12)` | Dot-grid placeholders |
| `--pf-l0` … `--pf-l4` | `#18181b` `#3f3f46` `#71717a` `#a1a1aa` `#f4f4f5` | `#f0f0f2` `#d4d4d8` `#a1a1aa` `#52525b` `#18181b` | 5-step grey ramp for data (heatmap, bars, bullets) |

Text hierarchy is exactly three steps: **fg → muted → subtle**. Do not add a fourth.

### 3.2 Meaning colours (the only chromatic colour on the blueprint)

| Colour | Meaning | Recipe |
|---|---|---|
| Emerald 500 | Live, active, available, terminal prompt | text `emerald-500`, bg `emerald-500/10`, border `emerald-500/30` |
| Rose 500 | Ended, done, closed | same recipe with rose |
| Amber 400 | Star / open-source | filled icon only |
| Sky 500 | Verified badge | filled icon only |

Never use these decoratively. A green button is wrong; a green "Live" pill is right.

### 3.3 The pen (human layer)

| Token | Dark | Light | Use |
|---|---|---|---|
| Ink | `#FCD34D` (amber) | `#2563EB` (ballpoint blue) | Arrows, underlines, signature |
| Marker | `#4338CA` at 0.85 | `#FDE68A` at 0.8 | Highlighter behind text |
| Paper | `#FBF4DC` | same | Notes: paper keeps its own colour in both themes |
| Paper ink | `#3B2A14` | same | Writing on paper |
| Paper rule | `rgba(59,42,20,0.13)` | same | Lined-paper lines, 32px apart |
| Margin rule | `rgba(220,38,38,0.35)` | same | Red notebook margin |
| Tape | `rgba(226,214,178,0.6–0.7)` | same | Strip holding a photo or note |
| Photo border | `#FBFAF6` | same | Polaroid frame |

Ink is a real hex, not a variable, because the marks write it into SVG attributes. Pass it through context (`InkContext`, `PageThemeContext`).

### 3.4 Type

| Role | Font | Class |
|---|---|---|
| Body / UI | **Geist** 400–700 | root default |
| Display | **Cabinet Grotesk** 500 / 700 / 800 (Fontshare) | `.pf-display` |
| Metadata | **Geist Mono** 400–600 | `.pf-mono` |
| Handwriting | **Reenie Beanie** | Roughly `font="reenie-beanie"` |

Scale (px):

| Size | Weight / tracking | Use |
|---|---|---|
| 44 (32 on phones) | display 800, `-0.03em`, lh 1.05 | Page hero name / headline |
| 26 | display 700, `-0.02em` | Section title (in brackets) |
| 20 | display 700, tight | Card title |
| 18 | display 700, tight | Sidebar heading, list item title |
| 15 | regular, relaxed | Body copy, bullets, index links |
| 14 | medium | Nav, descriptions, links |
| 13 | regular / medium | Meta rows, buttons, terminal |
| 12 | mono | Dates, tags, counts, handles |
| 11 | mono or medium | Eyebrows, pill text, group labels |
| 10 | mono | `kbd` keys |

Handwriting sizes run much larger because the font is small-bodied: labels 28, sticky notes 26, note body 25/32, note title 42, signature 56.

Rules:
- Display font only for names and titles. Never for body copy.
- Mono is for **facts**: dates, counts, handles, versions, key hints, `tabular-nums` numbers. Never for sentences.
- Sentence case everywhere. No uppercase eyebrows, no letter-spaced labels.
- Dates read `Jan 2026 – Now` in prose and `01.2026 — ∞` in mono meta; durations `2y 4m`.

### 3.5 Shape and space

| Thing | Value |
|---|---|
| Buttons, tags, icon boxes, hover rows | `rounded-md` (6px) |
| Cards, dashed boxes, thumbnails, terminal | `rounded-lg` (8px) |
| Dialogs | `rounded-xl` (12px) |
| Cover / banner media | `rounded-2xl` (16px) |
| Pills, search, social cluster | `rounded-full` |
| Paper, polaroid | 2–3px (paper is cut, not rounded) |
| Heatmap cell | 2px |

| Space | Value |
|---|---|
| Page max width | 1200px, centred, dashed left/right rails from `xl` |
| Right sidebar | 240px, from `lg` |
| Title column | 230px, from `md` |
| Column padding | 20px (`px-5`) |
| Section padding | 32px top and bottom |
| Hatched gap between sections | 32px tall |
| Header | 56px, sticky |
| Control heights | 24 tag · 28 small button · 32 button · 36 pill/CTA · 48 search field |
| Card padding | 12–16px |
| Reading width | 65ch for prose, 30ch for title-column notes |

### 3.6 Shadow

The blueprint has **no shadows**. Shadows belong only to physical things in the human layer (photo, paper, tape) and to modal dialogs (`shadow-2xl` over a `black/50–60` backdrop with a 2px blur).

Paper shadow: `0 1px 1px rgba(0,0,0,0.15), 0 12px 30px -8px rgba(0,0,0,0.55)`.

---

## 4. Line language

Lines carry all the structure, so their meaning must stay fixed.

| Line | Means | Where |
|---|---|---|
| **Dashed 1px** (`--pf-dash`) | Structure of the page | Outer rails, column dividers, rules between sections, card and group outlines, timeline spine, list dividers |
| **Solid 1px** (`--pf-line`) | A discrete object | Buttons, tags, icon boxes, pills, dialogs, media frames, terminal window |
| **Corner brackets** (2px, `--pf-fg`, 8px arms) | "This is a section" | Section titles only |
| **Hatch** (−45°, 1px every 7px) | A pause, or a special zone | Strips between sections, the contact zone background |
| **Dot grid** (1px dots, 14px pitch) | Empty media | Missing cover, missing screenshot |

```css
/* hatch */  background: repeating-linear-gradient(-45deg, var(--pf-hatch) 0 1px, transparent 1px 7px);
/* dots  */  background: radial-gradient(var(--pf-dot) 1px, transparent 1px); background-size: 14px 14px;
```

Do not put a dashed border on a button or a solid border on a section. Do not use brackets on anything but a section title.

---

## 5. Layout

### 5.1 The frame

```
┌ header: sticky 56px, bg at 85% + blur, dashed bottom rule ───────────────┐
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┬╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┬╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤
│ title column  │ content                                │ sidebar        │
│ 230px         │ fluid                                  │ 240px, sticky  │
│ [ Title ](3)  │                                        │ search · theme │
│ one-line note │                                        │ now building   │
│ "see all" →   │                                        │ index          │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┴╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤                │
│ ///////////////// hatched gap, 32px ////////////////// │                │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┬╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤                │
│ [ Next ]      │ …                                      │                │
```

- **Title column** holds the bracketed title, an optional one-line note (≤ 30ch), and an optional aside (a "see all" link, a handle, a sticky note). It is sticky at `top: 80px`, so the title follows long sections.
- **Content column** holds one pattern per section (a list, a grid of cards, a timeline, prose).
- **Sidebar** is the page's control panel: search, theme, one "now" fact, and the index with the active section marked by a 16px rule that grows in.

### 5.2 Breakpoints

| Width | Behaviour |
|---|---|
| < 768 | One column. Title sits above content. Search and theme move into the header. Annotations that need gutter space are dropped (no arrows). |
| ≥ 768 (`md`) | Title column appears (230px). |
| ≥ 1024 (`lg`) | Sidebar appears (240px); header loses its search/theme buttons. |
| ≥ 1280 (`xl`) | Outer dashed rails appear. |

### 5.3 Rhythm

Every section is: dashed rule → title column + content → dashed rule → **hatched gap** → next section. The hatch is the breath of the page; never skip it and never put content in it. The closing section (contact / CTA) inverts this: the whole zone is hatched and a paper note sits on top.

---

## 6. Components

All of these exist in `parts.tsx` or `sections/`. Reuse them; do not restyle them.

### 6.1 Primitives

| Component | Spec |
|---|---|
| **Section** | Grid `230px / 1fr`, dashed bottom rule, `scroll-mt-16`. Props: `title`, `count`, `note`, `aside`. |
| **BracketTitle** | 26px display bold inside four 8px corner brackets; optional mono superscript count `(n)`. |
| **Gap** | 32px hatched strip with a dashed bottom rule. |
| **Tag** | 24px tall, mono 12px, solid hairline, panel fill, `rounded-md`. |
| **IconBox** | 28px square, solid hairline, panel fill, 14px icon. Used to lead info rows. |
| **StatusPill** | 20px tall, 11px medium, dot + label; tones `green` / `red` / `neutral`. |
| **LinkButton** | 32px tall, 13px medium. `solid` = fg on bg; `outline` = hairline, panel on hover. One solid button per view at most. |
| **Meta row** | 13px muted facts separated by short vertical hairlines (`h-3.5 border-l`), mono for numbers. |
| **RichText** | `**bold**` inside a sentence becomes fg-coloured semibold. This is how prose gets emphasis. |
| **kbd** | Mono 10–11px, hairline, 1px radius-ish, bg or panel fill. |

### 6.2 Patterns

| Pattern | Spec | Reuse for |
|---|---|---|
| **Plain nav** | Text links 14px medium; active = fg, rest = muted. No underline, no pill, no background. Right side: one outlined pill with a meaning icon. | Any site header |
| **Sidebar index** | 15px links; the active one gets a 16px leading rule that animates from 0. | Docs TOC, long articles, changelogs |
| **Search pill + ⌘K dialog** | Full-round pill with kbd hints; native `<dialog>` at 12vh, 560px, grouped results with mono 11px group labels, active row on panel fill with a return-key glyph. | Site search, command menu |
| **Bullet intro** | 15px muted lines, 8px grey dot bullets, bold keywords in fg. | Feature summaries, "what you get" lists |
| **Featured card** | Dashed box, 40px icon tile, title + subtitle (optional live dot), small action button. | Integrations, social proof, links |
| **Wide card** | Dashed box, media left (16:10, hairline frame) and text right: display title + status pill, mono date, description, "Technologies used:" + tags, small outline actions top-right. | Projects, case studies, products, features |
| **Dotted timeline** | Dashed box; dashed spine; 11px status dot (green with a soft ring = current, rose = past); 40px logo tile; row expands to roles, tags and bullets. | Experience, changelog, roadmap, order history |
| **Icon-box list** | IconBox + title + meta row, in a 2-column grid of dashed cards or a plain stack. | Achievements, education, features, specs |
| **Divided list** | Dashed top/bottom rules and dashed dividers; row = mono date line, display title, muted summary; hover fills with panel and reveals an arrow. | Blog index, releases, press, FAQs |
| **Marquee** | One or two rows of logo + label at 15px medium, edges masked out, pauses on hover, opposite directions per row, speed = 3.5s per item. | Skills, clients, integrations |
| **Flat data graph** | Grey ramp `l0–l4`, 2px-radius cells, 3px gap, month labels above, legend "Less ▢▢▢▢▢ More", a sentence with the total in mono. | Any heatmap, activity or usage grid |
| **Terminal** | Hairline window on panel fill, three traffic dots, mono 13/24, emerald `❯` prompt, max 300px tall, scrolls inside itself. Every answer is read from the page's data. | "Try it" blocks, CLI docs, playful FAQs |
| **Show more** | Underline-on-hover 13px muted text button with a chevron; never a boxed button. | Any long list |
| **Booking / media dialog** | Native `<dialog>`, `rounded-xl`, hairline, title bar with dashed rule and a close square. | Any embed |

### 6.3 Interaction states

| State | Treatment |
|---|---|
| Hover on text link | muted → fg, or underline with `underline-offset-4` |
| Hover on row / outline button | panel fill |
| Hover on hairline pill | border steps from `--pf-line` to `--pf-dash` |
| Hover on solid button | opacity 0.9 |
| Hover on paper / photo | rotates back to 0° and (buttons on paper) lifts 2px |
| Active nav / index | fg colour, plus the leading rule in the index |
| Focus | 2px solid fg outline, 2px offset, on everything. Never removed. |
| Selection | fg background, bg text (inverted) |

Transitions are `150ms` for colour, `200ms` for small transforms, `300ms` for paper tilt. No springs, no bounces, no scale-on-hover on the blueprint layer.

---

## 7. The human layer

This is what makes the language ours. It uses the Roughly components (`animated/Roughly`) and a few paper objects.

### 7.1 The vocabulary

| Mark | Meaning | Portfolio use |
|---|---|---|
| **Double underline** | "This is the one" — the single most important phrase on the page | The tagline's key words. Only one double underline per page. |
| **Highlight** | A clause worth remembering inside prose | One clause in About (≤ ~15 words) |
| **Arrow + handwritten label** | Pointing at a thing, with a human aside | "that's me" → photo; "say hello" → CTA |
| **Sticky note (taped)** | A side comment that isn't part of the content | A note under the Projects title (≤ 12 words) |
| **Handwriting** | A signature | First name in the footer |
| **Paper note** | A personal message | The contact section |
| **Polaroid + tape** | A real photo of a real person or thing | The avatar |

### 7.2 Budget and rules

- **Roughly one mark per screen, about six per page.** Each mark type appears once or twice at most.
- **One pen per page.** Amber on dark, ballpoint blue on light. Paper notes write in paper ink.
- **Marks point at meaning, never decorate.** If removing the mark loses nothing, remove it.
- **Reserve the space.** Arrows and stickies live in empty gutters. Give them real room with padding (an arrow at size 0.9 with a 28px label needs ~170px; at 1.1, ~200px; a 150px sticky needs ~110px below). Never let a mark overlap text.
- **Drop, don't shrink.** On phones, remove arrows rather than scaling them down.
- **Tilt is small.** Photo −3°, paper −1.5°, tape ±2–4°. Everything straightens on hover.
- **Stroke scales with text.** ~1.5 for 15px text, 2 for arrows and large handwriting, 1.2 for the 56px signature.
- **Stagger the drawing.** Delays of 200–900ms so marks draw in after the content, in reading order. Marks already on screen at load that wrap an image render pre-drawn (`animate={false}`).
- **Keep meaning in the DOM.** The highlight wraps a real `<mark>`; the signature has an `sr-only` name; decorative drawings are `aria-hidden`.

### 7.3 Paper recipe

```
background: repeating-linear-gradient(180deg, transparent 0 31px, PAPER_RULE 31px 32px), PAPER;
background-position: 0 22px;      /* so text sits on the lines */
font: 25px/32px 'Reenie Beanie';  /* line-height = rule spacing */
rotate: -1.5deg;  border-radius: 3px;  + paper shadow
+ a tape strip centred on the top edge, + a red margin rule 32px from the left (≥ 640px)
```

Buttons on paper are full-round, 1.5px paper-ink outline, handwriting at 24px; the primary one is filled with paper ink.

---

## 8. Voice and content

- **First person, plain, short.** "Things I've built, shipped and still maintain." Section notes are one line.
- **Facts over adjectives.** Dates, counts, durations, stack tags and live links do the persuading.
- **Counts as superscripts** next to titles: `Projects (3)`.
- **Live details** make the page feel inhabited: local time with offset ("1h ahead of you"), a greeting by the visitor's time of day, availability status, "currently building @thing", a real contribution graph.
- **Handwritten copy is lowercase and casual**: "that's me", "say hello", "hey, let's build something meaningful".
- **Empty means hidden.** A section with no data does not render, and it leaves the nav, index and search too. Never show an empty state on a showcase page.
- **Placeholders are designed**, not broken: no avatar → initials on a dark tile; no screenshot → dot grid with the name; no data → a labelled sample.

---

## 9. Motion and accessibility

- Honour `prefers-reduced-motion`: marquee stops, cover video stays a still, smooth scroll becomes instant, tilt transitions are removed.
- Everything animated is either a colour fade, a small transform, or a pen stroke drawing in. Nothing loops except the marquee and the cover video.
- Native elements first: `<dialog>` for modals, `<button aria-expanded>` for disclosure, `<mark>`, `<time>`, `<kbd>`, `<nav aria-label>`, `aria-current` on the active link.
- Widgets never steal keys or focus: the terminal stops key events from reaching page shortcuts and never autofocuses; ⌘K binds in the capture phase.
- Scroll inside the widget, not the page (terminal `max-h-[300px]`, results `max-h-[50vh]`).
- Both themes must pass contrast with the three text steps; meaning colours always come with a text label, never colour alone.

---

## 10. Porting it to other things

The method is the same every time:

1. **Keep the frame.** Header, rails, title column, hatched gaps, sidebar.
2. **Model the content as one data object.** Sections hide themselves when their list is empty.
3. **Map each content block to an existing pattern** (table below). Only invent a pattern when none fits, and build it from the same primitives.
4. **Pick the "now" fact** for the sidebar (portfolio: "currently building"; product: latest version; blog: latest post).
5. **Spend the pen budget last.** Choose the one phrase for the double underline, one highlight, one or two arrows, one note. Stop.

### 10.1 Content → pattern map

| You have | Use |
|---|---|
| A person / product / company identity | Hero: cover media, name in 44px display, one-line tagline with a double underline, action cluster |
| 3–5 selling points | Bullet intro with bold keywords |
| Things with a picture (projects, features, products, case studies) | Wide cards |
| Things with a logo and a date range (jobs, clients, releases, roadmap) | Dotted timeline |
| Things with an icon and a fact (awards, specs, perks, plan features) | Icon-box list |
| Things with a date and a title (posts, releases, talks, press) | Divided list |
| Many small logos (stack, customers, integrations) | Marquee |
| A number over time | Flat data graph on the grey ramp |
| Something to try | Terminal |
| The ask | Paper note on a hatched zone |

### 10.2 Recipes

**SaaS / product landing page**
- Hero: product name or headline, tagline with the key promise double-underlined, one solid CTA with a "try it" arrow, product screenshot as the cover.
- Sections: `Features` (wide cards) → `How it works` (timeline, neutral dots, steps instead of dates) → `Integrations` (marquee) → `Pricing` (2–3 dashed cards; the recommended plan gets a `StatusPill` and the only solid button; a sticky note may say "most people pick this") → `Changelog` (divided list) → `FAQ` (disclosure rows with dashed dividers).
- Sidebar "now" fact: latest version, mono.
- Close: paper note — "questions? write to us".

**Blog / writing site**
- Index page: `Writing (n)` as a divided list, optionally grouped by year with mono year labels in the title column.
- Post page: title column carries the bracketed post title's meta (date, read time, tags); content column is prose at 65ch, 15–16px relaxed; sidebar index becomes the post's table of contents. One highlight on the thesis sentence. Code blocks use the terminal chrome (hairline, panel fill, mono 13/24). Footer signed by hand.

**Docs page**
- Sidebar index = on-this-page; add a left nav using the plain-nav style (fg active, muted rest) in the title column's place.
- Callouts are dashed boxes with an IconBox; never coloured banners. A "tip" may be a sticky note, at most one per page.
- Install snippets use the terminal window, static.

**Changelog / roadmap**
- One dotted timeline per year. Green dot = shipped this cycle, neutral = older, rose = removed/deprecated. Version numbers in mono; each row expands to bullets and tags.

**Agency / studio / freelancer site**
- Hero as the portfolio's, with a team photo polaroid. `Work (n)` as wide cards with a "Live" pill, `Clients` marquee, `Process` timeline, `Team` as featured cards (photo tile, name, role, link), paper-note contact with the booking dialog.

**Resume / CV (one page, printable)**
- Drop the sidebar and the human layer except the signature. Keep title column + content, dashed rules, mono dates, tags. Force the light theme for print; hide hatched gaps or keep them at 16px.

**Link-in-bio / card page**
- Single 440px column on a fully hatched page. Polaroid, name, tagline with the underline, then a stack of featured cards. Signed at the bottom. No header, no sidebar.

**Event / launch page**
- Hero with a countdown in mono `tabular-nums`; `Schedule` as a timeline (green = happening now); `Speakers` as featured cards; RSVP as the paper note.

**Dashboard-ish page (stats, "year in review")**
- Dashed boxes as tiles; numbers in display 800 with mono units; charts only on the grey ramp with one emerald accent for "now". No coloured series.

### 10.3 Stretching the language

- **A different mood** comes from changing only: the cover media, the pen colour pair, and the paper colour. Leave the greys alone.
- **A brand colour**, if one is required, replaces the *pen* (ink + marker), not the blueprint. Buttons stay fg/bg.
- **More warmth** = more paper objects (a receipt, a ticket stub, an index card), not more marks.
- **More seriousness** = fewer marks (keep only the double underline and the signature).

---

## 11. Do / Don't

| Do | Don't |
|---|---|
| Draw structure with dashed lines | Use shadows, gradients, glows or glass on the blueprint |
| Keep the page grey; use colour only for meaning | Add a brand-coloured button, link or heading |
| Use the display font for names and titles only | Set paragraphs in Cabinet Grotesk or mono |
| Put facts in mono | Put sentences in mono or use uppercase eyebrows |
| One solid button per view | Stack several solid buttons |
| One double underline per page | Underline, circle and highlight everything |
| Give annotations real gutter space | Let a mark overlap text or shrink it on phones |
| Hide empty sections | Show "nothing here yet" on a showcase page |
| Keep paper its own colour in both themes | Invert paper in dark mode |
| Build with `Section`, `Tag`, `IconBox`, `StatusPill`, `LinkButton` | Import void-ui primitives (Button, Popover, CommandPalette, machined cards) |

---

## 12. Checklist before shipping a page in this language

- [ ] Frame intact: sticky header, dashed rails, title column, hatched gaps, sidebar (or a deliberate reason to drop one).
- [ ] Only the tokens from section 3; no new greys, no new radii.
- [ ] Three text steps only; mono only on facts.
- [ ] Dashed = structure, solid = object, brackets = section titles only.
- [ ] No shadow outside paper, photo, tape and dialogs.
- [ ] Meaning colours used for meaning, each with a label.
- [ ] Pen budget respected: ≤ ~6 marks, one double underline, one pen colour per theme.
- [ ] Every mark has reserved space and is dropped (not shrunk) on phones.
- [ ] Light and dark both checked; paper unchanged between them.
- [ ] Empty data hides its section, nav link, index entry and search entry.
- [ ] Reduced motion: marquee, video, smooth scroll and tilt all stand down.
- [ ] Focus ring visible everywhere; dialogs are native; widgets don't hijack keys or focus.
- [ ] Checked at 375, 768, 1024 and 1280+.

---

## 13. File map

| File | Holds |
|---|---|
| `parts.tsx` | `THEME_CSS` (tokens, fonts), `INK`, `MARKER`, `HAND`, class constants (`FG`, `MUTED`, `SUBTLE`, `LINE`, `DASH`, `FOCUS`, `HATCH`, `DOTS`), `Section`, `BracketTitle`, `Gap`, `Tag`, `IconBox`, `StatusPill`, `LinkButton`, `RichText`, date formatters, `SocialIcon` |
| `DeveloperPortfolio.tsx` | The frame, theme state, active-section tracking, ⌘K, section order |
| `types.ts` / `defaults.ts` | The single data object and its placeholder content |
| `sections/Header.tsx`, `Sidebar.tsx`, `Footer.tsx` | Plain nav, control sidebar, signed footer |
| `sections/Hero.tsx` | Cover, polaroid, tagline underline, social pill, bullet intro, featured cards, CTA arrow |
| `sections/Terminal.tsx` | The working terminal |
| `sections/Experience.tsx` | Dotted timeline |
| `sections/Projects.tsx` | Wide cards, sticky note |
| `sections/Lists.tsx` | Icon-box lists, divided list |
| `sections/Stack.tsx`, `skillIcons.tsx` | Marquee and brand logos |
| `sections/GithubActivity.tsx` | Flat data graph |
| `sections/Contact.tsx` | Paper note, booking dialog |
| `sections/SearchDialog.tsx` | ⌘K search |

When building something new, copy `parts.tsx` first (or lift it into a shared `templates/_port/` folder once a second template exists), then compose sections from the patterns above.
