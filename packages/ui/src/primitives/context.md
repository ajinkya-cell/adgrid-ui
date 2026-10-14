# Primitives — Fundamental Components Context

> **Location**: `packages/ui/src/primitives/`
> **Role**: The everyday components every interface needs (button, field, checkbox, dialog…), built in the library's own material.
> **Read with**: [`DESIGN.md`](../../../../DESIGN.md) (tokens, elevation tiers, bevel recipes) and [`apps/docs/PRODUCT.md`](../../../../apps/docs/PRODUCT.md) (tone, anti-references).

The animated catalogue is where the library shows off. This folder is what makes it a **system**: a small set of quiet, consistent building blocks that every page — and every agent generating a page — can be assembled from. When these and the showpieces disagree, these win.

---

## 1. The Essence

Distilled from the components that define the look — `Accordion`, `Toast`, `ButtonAlpha`, `Switch`, `ChromeInput`, `SimpleCard`. Not from the newer editorial pieces (see §7).

**One sentence:** dark machined objects, lit from directly above, that rise when they matter and sink when they hold something.

Five signatures carry the whole look. A primitive that has these reads as ours; one that misses them doesn't.

| # | Signature | What it looks like | Where it's used |
|---|---|---|---|
| 1 | **Top-lit bevel** | `inset 0 1.5px 0` white highlight on the top lip, `inset 0 -1px 0` black occlusion on the bottom lip | Every raised surface |
| 2 | **Prismatic edge** | A 1.5px gradient line on the top edge, bright in the middle and fading to nothing at the corners | Cards, dialogs, toasts, raised buttons |
| 3 | **Long soft drop** | A large, negative-spread shadow (`0 20px 40px -12px`) plus a tight anchor shadow | Anything floating above the page |
| 4 | **Sockets** | Small round or rounded wells cut into a surface with `inset` shadow — chevron holders, icon slots, unchecked boxes | Inner controls |
| 5 | **Popout** | The selected thing physically rises out of its socket and becomes the lightest object on screen | Checked, selected, primary |

### Restraint rules

These are what keep it subtle rather than poppy:

1. **Monochrome first.** Light and shadow do the work, not hue. Colour appears only to carry meaning (error, success), and then as a dot, a 1px edge tint or text — never a filled surface.
2. **Nothing glows, nothing pulses** unless it is live (recording, streaming). No LED dots on static state.
3. **One light source.** Highlights on top edges only. Never a highlight on a bottom edge of a raised surface.
4. **Gradients are lighting, not decoration.** A raised surface may be 4–8% lighter at the top than the bottom. No hue shifts, no gradient text.
5. **Motion confirms, it doesn't perform.** Under 250ms for controls, no idle animation, no cursor-parallax on text.
6. **Inner is darker than outer.** A child surface is always one tier deeper than its parent.

---

## 2. Canonical Values

`DESIGN.md` documents several variants of each recipe (three different prismatic opacities, two well colours…). Primitives use **one** value for each. Use these exactly; copy them into `globals.css` as CSS variables when the token pass happens.

### Surfaces

| Token | Value | Use |
|---|---|---|
| `surface-raised` | `linear-gradient(180deg, #1b1b1d 0%, #151516 100%)` | Buttons, cards, dialog panel |
| `surface-raised-hover` | `linear-gradient(180deg, #1f1f21 0%, #18181a 100%)` | Hover on the above |
| `surface-tray` | `#0c0c0d` | Recessed content area inside a raised surface |
| `surface-well` | `#070707` | Inputs, unchecked boxes, sockets |
| `surface-popout` | `linear-gradient(180deg, #f5f5f5 0%, #d9d9d9 100%)` | Checked, selected, primary button |
| `overlay` | `rgba(0, 0, 0, 0.62)` + `backdrop-filter: blur(3px)` | Behind dialogs and drawers. Never more blur — no frosted glass. |

### Edges and shadows

| Token | Value |
|---|---|
| `border` | `1px solid rgba(255,255,255,0.08)` |
| `border-hover` | `rgba(255,255,255,0.13)` |
| `border-top-lit` | `rgba(255,255,255,0.16)` on the top edge only, for raised controls |
| `prismatic` | `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)`, 1.5px tall |
| `shadow-raised` | `inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)` |
| `shadow-raised-hover` | `inset 0 1.5px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.6), 0 20px 40px -12px rgba(0,0,0,0.7), 0 2px 8px -2px rgba(0,0,0,0.5)` |
| `shadow-pressed` | `inset 0 3px 8px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.02)` |
| `shadow-overlay` | `inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1.5px 0 0 rgba(0,0,0,0.45), 0 40px 100px -20px rgba(0,0,0,0.9), 0 8px 24px -6px rgba(0,0,0,0.7)` |
| `shadow-well` | `inset 0 1.5px 3px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.05)` |
| `shadow-popout` | `inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.6), 0 4px 10px -2px rgba(0,0,0,0.5)` |
| `focus-ring` | `outline: 1px solid rgba(255,255,255,0.4); outline-offset: 2px` on `:focus-visible` only |

### Text

| Token | Tailwind | Use |
|---|---|---|
| `text-primary` | `text-neutral-100` | Labels, titles |
| `text-secondary` | `text-neutral-400` | Descriptions, body inside components |
| `text-tertiary` | `text-neutral-500` | Hints, placeholders, meta |
| `text-disabled` | `text-neutral-600` | Disabled labels |
| `text-on-popout` | `text-neutral-950` | Glyphs and labels on popout surfaces |

Type sizes: labels `text-sm font-medium tracking-tight`, descriptions `text-[13px] leading-relaxed`, meta `text-xs`. **Primitives never set or load a font family** — they inherit, so the app chooses. (No `<style>@import</style>` inside components.)

### Status (edge tints only)

| Token | Value |
|---|---|
| `danger` | `rgb(229 115 115)` |
| `success` | `rgb(126 190 152)` |
| `warning` | `rgb(214 178 106)` |

Used as text, a 6px dot, or `border-color` at 40% opacity. Never as a background fill above 10% opacity.

### Radius

| Size | Value | Use |
|---|---|---|
| `xs` | `rounded-md` (6px) | Checkbox, kbd, badge |
| `sm` | `rounded-lg` (8px) | Small controls, menu items |
| `md` | `rounded-xl` (12px) | Buttons, inputs, selects |
| `lg` | `rounded-2xl` (16px) | Cards, popovers, menus |
| `xl` | `rounded-3xl` (24px) | Dialogs, toasts, drawers |
| `full` | `rounded-full` | Radio, switch, avatar, sockets |

Nested radius = outer radius − padding, so inner corners stay concentric.

### Motion

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0.32, 0.72, 0, 1)` | Opening, expanding, entering |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Leaving |
| `duration-micro` | 150ms | Hover, colour, border |
| `duration-control` | 200ms | Check draw, thumb travel |
| `duration-panel` | 260ms enter / 180ms exit | Dialog, popover, accordion |
| `spring-control` | `{ type: "spring", stiffness: 500, damping: 32 }` | Thumbs, radio dot, press |

Every animation has a `prefers-reduced-motion` path that keeps opacity changes and drops movement.

---

## 3. Contracts Every Primitive Follows

1. **A native element underneath.** Checkbox is an `<input type="checkbox">`, Dialog is a `<dialog>`, Button is a `<button>`. Styling goes on a sibling or wrapper. This gives keyboard, form and screen-reader behaviour for free.
2. **Controlled and uncontrolled.** `value`/`defaultValue` (or `checked`/`defaultChecked`, `open`/`defaultOpen`) plus an `on…Change` callback.
3. **`forwardRef` to the native element**, and all native props pass through.
4. **`className` lands on the outermost element** and is merged with `cn()`.
5. **State is exposed as `data-*` attributes** (`data-state="checked"`, `data-disabled`, `data-invalid`) so consumers can style without forking.
6. **Sizes are `sm | md | lg`**, default `md`. Heights: 32 / 40 / 48px for buttons and inputs.
7. **Disabled** = 40% opacity, no shadow change, no hover, `cursor-not-allowed`.
8. **Invalid** = `danger` edge tint plus a message from `Field`. Never only colour.
9. **No sound, no fonts, no global CSS** by default. Sound can be an opt-in prop.
10. **One file per primitive**, no dependency beyond React, `cn()` and (only if needed) `framer-motion`.

---

## 4. Tier 1 — Core (every system has these)

Status key: ✅ exists and matches · ⚠️ exists but drifts from §1 · ❌ missing

### Button — ❌ (five showpiece buttons, no base)
- **Variants:**
  - `primary`: popout surface, `text-on-popout`.
  - `secondary`: raised surface with prismatic edge — this is the `DESIGN.md` scaffold trigger, made canonical.
  - `ghost`: no surface; hover shows `surface-tray`.
  - `danger`: secondary with `danger` text and a 40% danger top edge.
- **Press:** `shadow-pressed`, `translateY(1px)`, `scale(0.98)` via `spring-control`. No bigger squash.
- **Loading:** a spinner replaces the label but keeps the button's width; `aria-busy`.
- **Extras:** `leadingIcon` and `trailingIcon` slots; `asChild`-style rendering as a link.
- **Icon-only:** square, requires `aria-label`.

### Input — ⚠️ `ChromeInput`
- **Material:** well surface, `shadow-well`, `rounded-xl`, h-10.
- **States:**
  - Focus: border goes to `rgba(255,255,255,0.18)` and the well darkens slightly. No glow.
  - Placeholder: `text-tertiary` in the same font and size as the value.
- **Slots:** leading icon, trailing action (clear, show password), suffix text.
- **Drift:** `ChromeInput`'s placeholder uses Jura, 10px uppercase — hard to read. Its brushed-line texture and cursor spotlight can stay as an opt-in `texture` prop.

### Textarea — ❌
- Same well as Input, `rounded-xl`, min 3 rows, optional auto-grow and a character count in `text-tertiary`.

### Select — ⚠️ `ChromeSelect`
- **Trigger:** looks like Input, with a chevron in a small socket on the right — the Accordion chevron socket at 22px.
- **Listbox:** Popover material (below). The selected row gets a check glyph and `text-primary`; others are `text-secondary`. The highlighted row gets the `surface-tray` fill.
- **Keyboard:** type-ahead, arrows, Home/End.

### Checkbox — ✅ `Choice type="checkbox"` (`primitives/Choice.tsx`)
- **Unchecked:** an 18px well, `rounded-md`, `shadow-well`.
- **Checked:** the box becomes popout — it rises out of the well. Popout surface and shadow, `border rgba(255,255,255,0.4)`. The check glyph is `text-on-popout`, 2.25 stroke, drawn with `stroke-dashoffset` over `duration-control`.
- **Indeterminate:** popout with a 8px dash.
- **Hover:** well border `0.08 → 0.14`.
- **Press:** `scale(0.94)`.
- **Label:** `text-primary`, with an optional description in `text-secondary`. The whole row is clickable.

### Radio Group — ✅ `Choice type="radio"` + `ChoiceGroup` (`primitives/Choice.tsx`)
- **Unchecked:** an 18px round well.
- **Checked:** the well stays, and a 8px popout pearl rises in its centre (scale `0.4 → 1` via `spring-control`).
- **Keyboard:** arrow keys move selection inside the group; roving tabindex.
- **Card variant:** for plan or option pickers — each option is a raised card, and the selected one gains `border-top-lit` plus the prismatic edge.

### Switch — ⚠️ `Switch`
- **Material:** the recessed track and beveled thumb are exactly right.
- **Drift:** the emerald pulsing LED and green track wash are the loudest element in the core set.
- **Fix:**
  - Off: thumb `#171717`, track well.
  - On: the thumb becomes popout (light) and the track gets a faint `rgba(255,255,255,0.06)` fill.
  - Drop `rotateY` and the LED; keep `whileTap`.

### Field — ❌
- Wraps any control: `label` (`text-primary`), optional `description` (`text-secondary`), the control, then an `error` (`danger`, with an icon).
- Wires `htmlFor`/`id`, `aria-describedby` and `aria-invalid` automatically.
- Stack gap: 6px label→control, 6px control→message.

### Dialog / Modal — ✅ `Modal` (content) and `Dialog` (alert, confirm) + `DialogButton` (`primitives/Dialog.tsx`)
- **Element:** native `<dialog>` with `showModal()`. That gives focus trap, `Esc`, top layer and an inert background without a library. Locks body scroll; returns focus to the trigger.
- **Overlay:** `overlay` token.
- **Panel:**
  - Raised surface, `rounded-3xl`, `shadow-overlay`, prismatic edge.
  - Max width 440 (`sm`) / 560 (`md`) / 720 (`lg`), padding 24.
- **Anatomy:**
  - Title: `text-base font-semibold tracking-[-0.02em]`.
  - Description: `text-secondary`.
  - Body: optionally inside a `surface-tray` inset.
  - Footer: actions right-aligned — secondary then primary.
  - Close: a 32px round socket in the top-right — the Accordion chevron socket holding an ×.
- **Motion:**
  - Enter: opacity 0→1, `y 8→0`, `scale 0.98→1`, `blur(4px)→0` over 260ms `ease-out`. Overlay fades in.
  - Exit: 180ms `ease-in`.
- **Variants:**
  - `alert`: no close socket; must choose an action; `role="alertdialog"`.
  - `destructive`: the primary becomes `danger`.

### Popover — ❌
- **Panel:** raised surface, `rounded-2xl`, `shadow-overlay`, prismatic edge, padding 12.
- **Placement:** anchored with an 8px gap, flips at the viewport edge. Closes on outside click and `Esc`.
- **Motion:** `scale 0.97→1` and opacity over 160ms, from the anchor side (`transform-origin`).
- **Foundation:** this is what Select, Dropdown Menu, Combobox and Datepicker all sit on.

### Dropdown Menu — ❌
- **Material:** Popover material, padding 6.
- **Items:** h-9 `rounded-lg`. The highlighted item gets `surface-tray` + `text-primary`.
- **Content:** separators are 1px `rgba(255,255,255,0.06)` with 6px margin; group labels are `text-xs text-tertiary`; right-aligned `Kbd` for shortcuts; check and radio items; submenus.
- **Keyboard:** arrows, type-ahead, `Esc` returns to the trigger.

### Tooltip — ⚠️ `Tooltip`
- **Material:** small raised pill, `rounded-lg`, `text-xs text-primary`, `shadow-raised`, no prismatic edge (too small).
- **Timing:** 400ms open delay, 0ms when moving between tooltips.
- **Drift:** cursor-parallax tilt, the white pulsing dot and the 0.88 scale entrance. All three should go: opacity + 4px slide, 120ms.
- **A11y:** shows on keyboard focus too, not just hover.

### Tabs — ❌
- **List:** a `surface-well` track, `rounded-xl`, padding 4.
- **Active tab:** a raised segment that slides between tabs (shared `layoutId`, `spring-control`). Inactive tabs are `text-tertiary` → hover `text-secondary`.
- **Variant `underline`:** for page-level tabs, a 1.5px prismatic line under the active tab.
- **Keyboard:** arrow keys, automatic activation.

### Accordion — ✅ `Accordion`
- The reference implementation for raised surfaces, the chevron socket and panel motion. Keep it.
- **Gaps:**
  - The trigger lacks `aria-expanded` and `aria-controls`.
  - The `icon` field in the item data is never rendered.

### Toast — ⚠️ `Toast`
- **Material:** the stack, bevel and prismatic edge are right.
- **Drift:** the filled red 40px close button is the loudest thing in the component.
- **Fix:**
  - Use the 32px close socket from Dialog.
  - Show status as a 6px dot before the title.
  - Add an action-button slot and auto-dismiss that pauses on hover.

### Alert (inline) — ❌
- **Material:** a `surface-tray` panel, `rounded-xl`, padding 14.
- **Content:** status dot or icon, then title + description; optional action on the right.
- **Status:** the top edge is tinted with the status colour at 40%. No filled background, no left stripe (a `PRODUCT.md` anti-reference).

### Badge — ❌
- **Size:** h-5, `rounded-md`, `text-[11px] font-medium`, padding-x 6.
- **Variants:**
  - `neutral`: well surface + `text-secondary`.
  - `solid`: popout + `text-on-popout`.
  - `status`: neutral with a 5px status dot.
- **Never** uppercase-and-tracked as a kicker (anti-reference).

### Card — ⚠️ `SimpleCard`, `Cards`
- **Material:** the standard bevel card from `DESIGN.md` §5 becomes the primitive: raised surface, `rounded-2xl`, prismatic edge.
- **Anatomy:** optional header (title + description + action), body, footer.
- **Interactive variant:** hover uses `shadow-raised-hover` and `border-hover`. No translate.

### Avatar — ❌
- **Shape:** a round socket (`shadow-well`) holding the image.
- **Fallback:** initials in `text-secondary`.
- **Group:** overlapping avatars with a 2px ring in the parent surface colour.
- **Status:** a 8px dot at the bottom-right with a ring.

### Separator — ❌
- **Horizontal:** `0.5px` `rgba(255,255,255,0.06)` over a `0.5px` `rgba(0,0,0,0.5)` — a cut line, so it reads as machined rather than drawn.
- **Vertical:** the same on the vertical axis.

### Skeleton — ❌
- **Material:** well surface in the shape of the content it replaces.
- **Motion:** a slow highlight sweep (`rgba(255,255,255,0.04)`, 1.6s), disabled under reduced motion.

### Spinner — ⚠️ loaders exist (`Loaders1`) but none is a plain inline spinner
- **Shape:** a 16px ring at `rgba(255,255,255,0.15)` with a 90° arc in `text-primary`.
- **Motion:** 0.8s linear rotation (the one place linear easing is right).

### Table — ❌ (`docs/props-table-design.md` is the visual reference)
- **Material:** sits in a raised card. Header row is a `surface-tray` band with `text-xs text-tertiary`.
- **Rows:** h-11, separated by the Separator cut line. Row hover gets a `rgba(255,255,255,0.02)` fill.
- **Data:** numbers right-aligned in tabular figures; mono only for code values.

### Kbd — ❌
- **Shape:** a tiny raised key — `rounded-md`, h-5, min-w-5, `text-[11px] text-secondary`.
- **Bevel:** `shadow-raised` at 50% strength, so it reads as a physical key.

---

## 5. Tier 2 — Common

| Component | Status | Material and notes |
|---|---|---|
| Segmented Control | ❌ | Same as Tabs list; the selection is a raised segment. Used for 2–5 options inline. |
| Slider | ❌ | The track is a 6px well; the filled part is `rgba(255,255,255,0.5)`; the thumb is an 18px popout pearl. Value tooltip while dragging. |
| Progress | ⚠️ `Meter` | A 6px well track with a popout fill. Indeterminate = a slow sweep. |
| Drawer / Sheet | ⚠️ `Sidebar` | Dialog material anchored to an edge; `rounded-3xl` on the inner corners only. Slides 260ms `ease-out`. |
| Combobox | ❌ | Input + Popover listbox with filtering. Shares rows with Select. |
| Command Palette | ⚠️ `CommandPalette` | Dialog + Combobox. Check against Dialog motion and the restraint rules. |
| Breadcrumbs | ❌ | `text-tertiary` links, a `/` separator in `text-disabled`, the current page in `text-primary`. |
| Pagination | ❌ | Ghost buttons; the current page is a raised square. |
| Navbar | ⚠️ `NavBar1` | Floating raised bar, `rounded-2xl`, prismatic edge. |
| Datepicker | ⚠️ `Datepicker` | Popover + grid; the selected day is popout, today has a 1px ring. |
| OTP Input | ⚠️ `OTPInput` | A row of 48px wells; the active well gets the focus border; filled digits in `text-primary`. |
| Empty State | ❌ | An icon in a 48px socket, title, one line of `text-secondary`, one action. No illustrations. |
| File Upload | ❌ | A dashed `rgba(255,255,255,0.12)` well, `rounded-2xl`. On drag-over the border becomes `0.3` and the well lightens one step. |
| Stepper | ❌ | Steps are sockets; completed steps become popout pearls; connectors are Separator lines. |

---

## 6. Tier 3 — Layout (invisible, but they make generated pages consistent)

| Component | Purpose |
|---|---|
| `Stack` | Vertical or horizontal flex with gap from the 4px scale. The only way primitives get spaced in examples. |
| `Container` | Max-width (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280) + 16px side gutter, 24px from `sm` up. |
| `Grid` | Responsive columns with consistent gaps. |
| `VisuallyHidden` | Text for screen readers only. |
| `Portal` | Renders popovers and toasts at the document root. |
| `ScrollArea` | A thin 6px well-coloured scrollbar inside panels and menus. |

---

## 7. Drift Register

Known places where the library contradicts §1. Agents must **not** use these as style references until they're resolved.

### In the core set
- **Fonts:** about eight families in use. `Switch` and `Tooltip` inject DM Sans with a `<style>@import</style>` on every render; `ButtonAlpha` injects Geist Pixel. `DESIGN.md` says Inter, `globals.css` says Poppins.
- **Colour noise:** the emerald pulsing LED (`Switch`), the white pulsing dot (`Tooltip`), the filled red close (`Toast`). All three contradict `PRODUCT.md` ("no neon, no glow for glow's sake").
- **Motion that performs:** `Tooltip`'s cursor-parallax tilt, `Switch`'s `rotateY`.
- **Sound on by default:** `ButtonAlpha`.
- **Docs disagree:**
  - `DESIGN.md` says "no light mode" and "neon inner border" for focus.
  - `PRODUCT.md` says "dark-first, not dark-only" and "no neon".
  - There are three different prismatic-edge opacities.
  - §2 of this file is the tie-break for primitives.

### In the newer editorial pieces
These are well made, but they're a different material — **paper and craft**, not machined dark objects.
- **`StackedCards`, `TiltedCollage`, `TapedMarquee` (`animated/paper/`):** white paper mounts, warm ink `#e7e5df`, masking tape, serif italic display type.
- **`MoonPull`:** a gold disc with gold glow (`#f2c04a`), periwinkle yarn, italic hint, dashed focus outline.
- **`ScrollWater`:** closest to the core. It already uses `#151515` and the top-lit border; only the warm ink colour differs.

See the decision in the next section.

---

## 8. Open Decisions

| Decision | Options | Recommendation |
|---|---|---|
| Body font | Inter (DESIGN.md) · Poppins (globals.css) · DM Sans (in components) | Primitives inherit. Set **one** sans + one mono at the app level and delete in-component font loading. |
| Editorial pieces | Restyle into the machined material · keep as a separate "Editorial" line with its own rules | Keep them as a named line, but give them the shared contracts (§3) and monochrome accents, so they sit on the same page without clashing. |
| Light mode | No (DESIGN.md) · later (PRODUCT.md) | Define every token in §2 as a CSS variable now, so light mode is a token swap later rather than a rewrite. |

---

## 9. Checklist for a New Primitive

- [ ] Native element underneath; keyboard works with no extra code.
- [ ] Controlled + uncontrolled; `forwardRef`; `className` merges; `data-state` attributes.
- [ ] Uses only §2 values. No new hex codes, no arbitrary shadows.
- [ ] Has the right tier: raised (bevel + prismatic if ≥ 40px tall), well, or popout for selection.
- [ ] No glow, no pulse, no colour except status. Status is never colour-only.
- [ ] Motion uses §2 easings and durations, and has a reduced-motion path.
- [ ] `:focus-visible` ring from §2, visible on every surface.
- [ ] Disabled and invalid states designed, not just greyed.
- [ ] No font loading, no sound, no global CSS.
- [ ] Exported from `packages/ui/src/index.ts`, registered in `apps/docs/src/registry/index.ts` with `propDefs`, demoed in `PresentationRenderer.tsx`.
