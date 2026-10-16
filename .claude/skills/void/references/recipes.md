# Recipes

How common website patterns are built in the adgrid-ui material. Use these when the catalog has no
component for something. Every value here comes from `primitives.md` §2. Each recipe is given as
Tailwind (using the classes from `assets/tailwind-theme.css`) and as plain CSS classes from
`assets/tokens.css`. Copy the structure, then fill in the site's real content.

## Contents
1. Mapping table: old pattern → our answer
2. Page level: background, type, containers, sections
3. Building blocks: card, tray, well, popout, separator, status
4. Cards: stat, pricing, profile, feature, testimonial, media
5. Small pieces: badge, avatar, kbd, alert, empty state
6. Site chrome: navbar, footer, hero
7. Showpieces: when and where

---

## 1. Mapping table

Check this first. Left: what the old site has. Right: what it becomes.

| Old site has | Becomes |
|---|---|
| Any `<button>`, CTA, link-button | `Button` (`primary` for the one main action per view, `secondary` otherwise, `ghost` in toolbars) |
| Text input, textarea, labelled field | `TextField` (label, description and error are built in) |
| `<select>`, custom dropdown | `Select`; with search → `Combobox` |
| Checkbox, radio, toggle list | `Choice` / `ChoiceGroup`; plan pickers → `Choice variant="card"` |
| On/off toggle | `Switch` from the catalog only after its drift fix (primitives.md §4); until then a `Choice` checkbox |
| Tabs, pill switcher | `Tabs` (content panels) or `SegmentedControl` (2–5 inline options) |
| Modal, lightbox, confirm | `Modal` (content) or `Dialog` (alert/confirm) |
| Side panel, mobile menu | `Drawer` (+ `Nav` for menu content) |
| Dropdown menu, kebab menu | `DropdownMenu` + `MenuItem` |
| Popup content anchored to a trigger | `Popover` |
| Menu bar | `Menubar` |
| Toast, snackbar, flash message | `Toaster` + `toast()` |
| Progress bar, loading bar | `Progress` |
| Score, usage, capacity, rating dial | `Gauge` |
| Spinner, loader | `Spinner` |
| Data table | `Table` |
| Pagination | `Pagination` |
| Breadcrumbs | `Breadcrumbs` |
| File drop zone | `FileUpload` |
| OTP / PIN boxes | `OTPInput` |
| Colour input | `ColorPicker` |
| Card of any kind | §4 recipes on the base card (§3) |
| Badge, tag, chip, pill label | §5 Badge |
| Avatar | §5 Avatar |
| Inline alert, callout, banner | §5 Alert |
| Empty state | §5 Empty state |
| Tooltip | Catalog `Tooltip` has drift (primitives.md §7): use it with the fix, or a `title` + Popover |
| Horizontal rule, divider | §3 Separator |
| Navbar / header | §6 Navbar |
| Footer | §6 Footer |
| Hero | §6 Hero |
| Coloured section backgrounds, gradient blobs | Remove. The page is one dark field; depth comes from surfaces. |
| Glassmorphism panels | A raised card (§3). No frosted glass anywhere. |
| Gradient headline, glowing text | Solid `text-fg-primary`. |
| Icon in a coloured circle | Icon in a 40–48px socket (§3 Well, `rounded-full`), `text-fg-secondary` |
| Brand accent colour on buttons/links | Popout for primary actions; links are `text-fg-primary` with an underline on hover |
| Uppercase tracked eyebrow above headings | Delete it, or make it a plain `text-sm text-fg-tertiary` line |
| Left-border callouts | §5 Alert (status on the top edge) |

---

## 2. Page level

**Background.** One field: `--v-page` (`#050505`) on `body`. No section bands of different colours, no
gradient blobs, no noise unless the site's identity depends on it.

**Fonts.** Set exactly one sans and one mono at the root (keep the site's own if it's a decent neutral
sans; otherwise Inter). Components inherit. Remove any per-component font loading.

**Type scale** (all `text-fg-primary` unless noted, `tracking-tight` or tighter on headings):

| Role | Tailwind |
|---|---|
| Display (hero) | `text-5xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]` |
| H1 | `text-4xl font-semibold tracking-[-0.03em]` |
| H2 (section) | `text-2xl sm:text-3xl font-semibold tracking-[-0.03em]` |
| H3 (card title) | `text-base font-semibold tracking-[-0.02em]` |
| Body | `text-[15px] leading-relaxed text-fg-secondary` |
| Small / meta | `text-xs text-fg-tertiary` |

Max line length for body copy: `max-w-[60ch]`.

**Containers.** `mx-auto w-full max-w-5xl px-4 sm:px-6` (use `max-w-6xl` for dense grids). 16px gutter on
phones, 24px from `sm` up.

**Section rhythm.** `py-20 sm:py-28` between sections, `gap-6` inside grids, `gap-3` inside cards. All spacing
on the 4px scale.

---

## 3. Building blocks

### Raised card (the base of every card)
```html
<div class="prismatic relative rounded-v-lg border border-edge bg-surface-raised p-6 shadow-raised">…</div>
<!-- plain CSS -->
<div class="v-raised v-prismatic" style="border-radius:var(--v-radius-lg);padding:24px">…</div>
```
- Interactive (whole card is a link): add `transition-[box-shadow,border-color] duration-150 hover:border-edge-hover hover:shadow-raised-hover hover:bg-surface-raised-hover`. No translate, no scale.
- Prismatic edge only on surfaces 40px tall or more.
- Nested radius = outer radius − padding (a `rounded-2xl` card with `p-2` holds a `rounded-lg` child).

### Tray (content area inside a raised surface)
```html
<div class="rounded-v-md border border-white/[0.04] bg-surface-tray p-4">…</div>
```

### Well / socket (holds something: input, icon slot, track)
```html
<span class="grid size-10 place-items-center rounded-full border border-white/[0.06] bg-surface-well shadow-well text-fg-secondary">
  <svg …/>
</span>
```

### Popout (the selected, primary, filled thing)
```html
<span class="rounded-v-sm border border-white/40 bg-surface-popout px-3 py-1.5 text-fg-on-popout shadow-popout">Selected</span>
```

### Separator (machined cut line)
```html
<hr class="h-px border-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_50%,rgba(0,0,0,0.5)_50%)]" />
```

### Status
Never a fill. A 6px dot, text, or a top edge at 40%:
```html
<span class="size-1.5 rounded-full bg-success"></span>
<div class="… border-t-danger/40">…</div>
```
Always pair colour with a word or icon.

---

## 4. Cards

All start from the raised card in §3. Inner things are one tier deeper.

### Stat card
```html
<div class="prismatic relative rounded-v-lg border border-edge bg-surface-raised p-5 shadow-raised">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium tracking-tight text-fg-secondary">Monthly revenue</span>
    <span class="flex items-center gap-1.5 text-xs text-fg-tertiary"><span class="size-1.5 rounded-full bg-success"></span>+12.4%</span>
  </div>
  <div class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg-primary tabular-nums">$48,210</div>
  <div class="mt-4"><!-- optional: <Progress size="sm" value={…} /> or a sparkline in text-fg-tertiary strokes --></div>
</div>
```
Don't make a "hero metric" wall (a row of giant numbers as the page's centrepiece): an anti-reference.
For a single headline score or capacity, use `Gauge`.

### Pricing card
- Raised card, `p-6`, `rounded-v-lg`. Plan name (H3), one line `text-fg-secondary`, price `text-4xl font-semibold tabular-nums` + `/mo` in `text-fg-tertiary`.
- Feature list: `text-sm text-fg-secondary`, each item with a 16px check in `text-fg-tertiary`, `gap-2.5`.
- Action: `Button` `secondary`, full width. The recommended plan's button is `primary`, and its card gets `border-t-edge-lit` (the top-lit border). **No** coloured "Popular" ribbon: a §5 Badge `solid` in the header is enough.
- Monthly/yearly switch above the grid: `SegmentedControl`.

### Profile / team card
- Raised card. §5 Avatar (48px), name `text-sm font-medium text-fg-primary`, role `text-xs text-fg-tertiary`.
- Social links as ghost icon buttons (`Button variant="ghost"` icon-only, `aria-label` required).

### Feature card
- Raised card, `p-6`. Icon in a 40px socket (§3 Well), title H3, two lines max of `text-fg-secondary`.
- In a grid: all cards equal height (`h-full`), `gap-6`. No per-card colours.

### Testimonial
- Raised card, quote in `text-[15px] leading-relaxed text-fg-primary` (not italic, no giant quote glyph), then a row: avatar 32px, name, role in `text-fg-tertiary`.

### Media card (image + text)
- Raised card with `overflow-hidden p-2`. Image in a `rounded-[calc(var(--v-radius-lg)-8px)]` tray (concentric radius), then text at `px-3 pb-3 pt-4`.
- Images keep their own colour; don't tint them.

---

## 5. Small pieces

These are ❌ (not built yet) in primitives.md, so build them from these specs. If a site needs one
in more than one place, consider promoting it (SKILL.md › Missing components).

### Badge
```html
<!-- neutral -->
<span class="inline-flex h-5 items-center gap-1 rounded-v-xs border border-white/[0.06] bg-surface-well px-1.5 text-[11px] font-medium text-fg-secondary shadow-well">Beta</span>
<!-- solid -->
<span class="inline-flex h-5 items-center rounded-v-xs border border-white/40 bg-surface-popout px-1.5 text-[11px] font-medium text-fg-on-popout shadow-popout">New</span>
<!-- status: neutral + a 5px dot -->
<span class="… (neutral classes)"><span class="size-[5px] rounded-full bg-success"></span>Live</span>
```
Never uppercase-and-tracked.

### Avatar
```html
<span class="relative inline-grid size-10 place-items-center overflow-hidden rounded-full border border-white/[0.06] bg-surface-well shadow-well text-xs font-medium text-fg-secondary">
  <img src="…" alt="" class="size-full object-cover" />  <!-- or initials -->
</span>
```
Group: overlap with `-ml-2` and `ring-2 ring-[#151516]` (the parent surface). Status: an 8px dot bottom-right with the same ring.

### Kbd
```html
<kbd class="inline-grid h-5 min-w-5 place-items-center rounded-v-xs border border-edge bg-surface-raised px-1 text-[11px] text-fg-secondary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.4)]">⌘K</kbd>
```

### Alert (inline)
```html
<div role="status" class="flex gap-3 rounded-v-md border border-white/[0.04] border-t-warning/40 bg-surface-tray p-3.5">
  <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"></span>
  <div class="min-w-0 flex-1">
    <p class="text-sm font-medium text-fg-primary">Your trial ends in 3 days</p>
    <p class="mt-0.5 text-[13px] leading-relaxed text-fg-secondary">Add a card to keep your projects.</p>
  </div>
  <!-- optional action: <Button size="sm" variant="secondary"> -->
</div>
```
No filled background, no left stripe.

### Empty state
Icon in a 48px socket, title `text-sm font-medium`, one line of `text-fg-secondary`, one `Button`. Centred, `py-12`. No illustrations.

---

## 6. Site chrome

### Navbar
- Floating raised bar: `sticky top-3 z-40 mx-auto max-w-5xl rounded-v-lg border border-edge bg-surface-raised shadow-raised prismatic`, height 56px, `px-3`.
- Logo left; links as `text-sm text-fg-tertiary hover:text-fg-primary`; current page `text-fg-primary`.
- Right: one `Button` (secondary, or primary for the single main CTA).
- Mobile: a ghost icon button opens a `Drawer` with `Nav`.
- No transparent-blur header. If the site needs a full-width header, use the page colour with a bottom §3 Separator.

### Footer
- On the page background, separated from the content by a §3 Separator.
- Columns: a heading in `text-sm font-medium text-fg-primary`, then links in `text-sm text-fg-tertiary hover:text-fg-primary`, `gap-2.5`.
- Bottom row: copyright in `text-xs text-fg-tertiary`, social icons as ghost icon buttons.

### Hero
- Display heading, one line of body copy (`text-lg text-fg-secondary max-w-[52ch]`), then at most two buttons (primary + secondary).
- Visual: real product UI built from primitives inside a raised frame, or one showpiece (§7). Not both.
- Avoid: gradient headline, metric strip under the hero, eyebrow kicker, centred text over a glowing blob.

---

## 7. Showpieces

The non-primitive catalog entries (backgrounds, animated cards, fancy buttons) are the library showing
off. In a revamp:
- At most **one** showpiece per viewport, and at most two per page.
- They go where the page calls for a moment: the hero visual, a section background, a signature interaction. Never as everyday controls (a `LiquidGoldButton` is not the form's submit button).
- Check primitives.md §7 (Drift Register) first: some ship fonts or glows that must be removed when used on a revamped site.
