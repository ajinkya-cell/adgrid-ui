---
name: void
description: Revamp an existing website or app into the adgrid-ui (void-ui) design system — dark machined surfaces, top-lit bevels, wells and popouts — and build any component the system doesn't have yet in the same material. Use when the user asks to revamp, restyle, reskin, redesign or migrate a site, page or component "to our design system", "to adgrid", "to void-ui", "in our style"; when they want a new component made to match the system; or when they want a page audited for how far it is from the system.
---

# void

Turn an existing site into one that looks built from adgrid-ui, without changing what it does.

**One rule above all:** the old site decides *what* each part does (its content, states and behaviour).
The design system decides *how it looks*. Never carry over the old site's styling, and never invent new
styling: everything is built from the system's material.

`<skill>` below means this skill's directory.

## What's in here

| File | Read it when |
|---|---|
| `references/primitives.md` | **Always, before any work.** The essence, canonical values (§2), contracts (§3), what exists and what drifts. It is the tie-break over everything else. |
| `references/recipes.md` | Mapping old patterns to ours, page-level rules (type, containers, sections), and recipes for cards, badges, alerts, navbar, footer, hero. |
| `references/catalog.md` | Finding a component, its install command and its props. Search it (`grep -n "### " catalog.md`); don't read it whole. |
| `references/product.md` | Tone and the anti-references (glass, gradient text, kickers, side stripes, neon). Short; read it once. |
| `references/design.md` | Long-form material spec. Only when primitives.md doesn't answer a material question. Where they disagree, primitives.md wins. |
| `assets/tokens.css` | Copy into the target project: CSS variables + material classes (`.v-raised`, `.v-well`, `.v-popout`…). |
| `assets/tailwind-theme.css` | Copy too if the target uses Tailwind v4: token utilities (`bg-surface-well`, `shadow-raised`, `text-fg-secondary`…). |
| `assets/revamp-plan.md` | The template for the audit and plan you write in phase 1. |
| `scripts/lint.mjs` | Flags off-system code. `node <skill>/scripts/lint.mjs <src dirs>` |
| `scripts/screenshot.mjs` | Screenshots a URL at 1440px and 390px with the local Chrome/Edge. `node <skill>/scripts/screenshot.mjs <url> --name before` |
| `scripts/sync.ts` | Maintainers only: rebuilds `references/` from the adgrid-ui repo. |

## Workflow

Copy this checklist into your reply and tick it off as you go:

```
Revamp progress:
- [ ] 1. Audit: stack, pages, screenshots, lint baseline, revamp/plan.md
- [ ] 2. Foundation: tokens, fonts, page background, global CSS
- [ ] 3. Components: replace page by page from the plan
- [ ] 4. Gaps: compose → build → place → record
- [ ] 5. Verify: lint clean, screenshots read and compared, behaviour intact
- [ ] 6. Report
```

### 1. Audit

1. **Read** `references/primitives.md` and `references/product.md`.
2. **Find the stack.** Framework (Next, Vite, Astro, Vue, plain HTML…), styling (Tailwind v3/v4, CSS modules,
   styled-components, plain CSS), component library in use (shadcn, MUI, Chakra, Bootstrap…). This decides how
   phase 3 works (see *Stack paths*).
3. **List the pages/routes** and pick the order: the most-visited or most representative page first, as the
   pilot. Agree the scope with the user if the site is big.
4. **Screenshot the current state** of each page in scope. You need a running site; use the user's dev server
   if one is up, otherwise start one (or ask).
   ```bash
   node <skill>/scripts/screenshot.mjs http://localhost:3000/pricing --name pricing-before
   ```
   Read every image it prints.
5. **Lint baseline** to size the job: `node <skill>/scripts/lint.mjs src` (or the right source dirs).
6. **Write `revamp/plan.md`** from `assets/revamp-plan.md`: for every UI element on the pages in scope, its
   mapping (catalog component, recipe, or **gap**), and the page order. Use the mapping table in
   `references/recipes.md` §1. Show the plan to the user before phase 3 if the job is more than one page.

### 2. Foundation

Do this once, before touching any component:

1. Copy `assets/tokens.css` (and `assets/tailwind-theme.css` for Tailwind v4) into the project's styles and
   import them at the app root. For Tailwind v3, map the same variables in `tailwind.config` `theme.extend`
   instead.
2. Set `body` to `background: var(--v-page); color: var(--v-text-primary)`.
3. Fonts: one sans and one mono, set once at the root. Remove every other font load.
4. Remove or neutralise global styles that fight the system: brand colour variables, global glows/gradients,
   heavy `backdrop-filter`, light-mode-only resets. Keep resets and layout utilities.
5. If an old component library owns the look (MUI, Chakra, Bootstrap), don't theme it to look like us. Replace
   its components in phase 3, one page at a time, and remove the dependency when nothing uses it.

### 3. Components

Go page by page in the plan's order. For each element:

1. **Catalog component exists** → install it (see *Stack paths*), swap it in, and wire the old props, state
   and handlers across. Keep the old behaviour: same submit handlers, validation, routes, analytics hooks, test
   ids, `aria-*`.
2. **Recipe exists** (`references/recipes.md`) → build it from the recipe with the site's real content.
3. **Neither** → it's a gap: phase 4.

After each page: lint that page's files, screenshot it, **read the screenshots**, fix what looks wrong, then
move on. Don't batch ten pages and look at the end.

Page-level rules (recipes.md §2) apply too: one page background, the type scale, containers, section rhythm.
Strip the anti-references as you go: gradient text, glass, glows, coloured section bands, kickers, side stripes,
hero metric strips.

### 4. Missing components

When the site needs something the system hasn't got, in this order:

1. **Compose it.** Most "new" things are existing pieces in a raised card: a pricing card is card + badge +
   list + Button; a stat card is card + number + Progress or Gauge. Check recipes.md §4–§6.
2. **Build it in the material** if composing can't do it:
   - Pick the tier by what it *is*: floats → raised; holds a value → well; selected/primary/filled → popout;
     content area inside a raised surface → tray. Inner is always one tier darker than outer.
   - Only §2 values: no new hex codes, shadows, radii, easings or fonts. Colour only for status, as a dot, text
     or a 40% edge, and never alone.
   - Follow the §3 contracts and the §9 checklist in primitives.md: native element underneath, `data-*`
     state attributes, `sm|md|lg`, focus ring, disabled/invalid designed, reduced-motion path, no idle motion.
   - Screenshot it **next to existing primitives** (a Button, a card). If it doesn't sit naturally beside them,
     it isn't done. A first attempt usually looks too thin and too flat; most things here are objects with
     presence: a raised body, a sunken socket, a popout part.
3. **Place it.**
   - Specific to this site (an itinerary card, an order timeline) → a local component in the target project,
     built from the tokens and primitives.
   - Reusable by any site (avatar, badge, empty state, stepper) → also flag it for promotion to the library:
     note it in `revamp/plan.md` under *Promote*. If you're working inside the adgrid-ui repo itself, follow
     `apps/docs/AGENTS.md` to add it (library file, export, registry, presentation, demo, registry JSON).
4. **Record it** in `revamp/plan.md` › Gaps: what it is, where it lives, local or promote.

### 5. Verify

Done means all of these, with evidence:

- [ ] `node <skill>/scripts/lint.mjs <src>`: **0 errors**. Every remaining warning is either fixed or has a
      `void-lint-ignore: <reason>` comment that holds up (a brand logo's colour, a photo, a chart series).
- [ ] After-screenshots of every page at 1440 and 390, **read**, and compared with the before-shots: nothing
      lost, nothing overflowing at 390px, nothing clipped.
- [ ] Against primitives.md §1: monochrome, one light source from above, nothing glows or pulses, inner
      darker than outer, the primary action is the lightest object on screen.
- [ ] Behaviour unchanged: forms submit, links route, menus open with the keyboard, focus rings show,
      existing tests pass, the project typechecks and builds.
- [ ] No old component library or brand-colour leftovers in the pages in scope.

If something doesn't pass, fix it and check again. Never report "done" from code alone; the screenshots are
the proof. A page that passes lint can still look wrong.

### 6. Report

Tell the user, briefly: pages done, components swapped, gaps built (local vs to promote), lint before → after,
anything you couldn't verify, and the before/after screenshot paths. Keep `revamp/plan.md` up to date as the
record.

## Stack paths

| Target | How components get in |
|---|---|
| React + Tailwind v4 | `npx shadcn@latest add https://void-ui-phi.vercel.app/r/<slug>.json`. Files land in `components/ui/` and need `cn` in `@/lib/utils` (clsx + tailwind-merge); create it if missing. Or install the package `@adgrid-ui/ui`. |
| React + Tailwind v3 | Same install. Then check the classes the component uses: v4-only syntax (`size-*` is fine on v3.4; `bg-white/[0.06]` is fine) and arbitrary values work, but CSS-first `@theme` doesn't: map tokens in `tailwind.config`. |
| React without Tailwind | Add Tailwind v4 if the user agrees (the cleanest path). Otherwise rebuild each primitive's look with `assets/tokens.css` classes, keeping its structure and behaviour. |
| Vue, Svelte, Astro, plain HTML | Port: read the primitive's source in the catalog for structure, states and motion, then write it in the target framework with `tokens.css` classes. Keep the native element underneath. Astro can use the React components directly via islands. |

framer-motion is a dependency of several primitives; install it when the shadcn CLI doesn't.

## Things that go wrong

- **Restyling the old components instead of replacing them.** A Bootstrap button themed dark is still a
  Bootstrap button: it keeps its hover, focus and spacing. Replace.
- **Keeping the brand colour "just for buttons".** Primary is popout. If the brand needs presence, the logo
  carries it.
- **Thin, flat first drafts.** A bare outline or a hairline arc reads as a wireframe. Give things a body:
  raised surface, sunken socket, popout part.
- **Copying one-off values from screenshots of the library.** Use the tokens; values in older showpieces drift.
- **Blank or half-animated screenshots.** The first load on a dev server may come back blank while the route
  compiles; just run it again. Mount animations can be caught mid-way; judge the resting state.
- **Big-bang rewrites.** One page, verified, then the next.

## Maintaining this skill

The references are copies. After changing components or `context.md` in the adgrid-ui repo, rebuild them from
the repo root:

```bash
npx -y tsx .claude/skills/void/scripts/sync.ts
```

To use the skill in other projects, copy this folder to `~/.claude/skills/void/` (re-copy after a sync).
