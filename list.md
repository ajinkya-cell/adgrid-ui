# Primitives — What's Left

> The build list for finishing the design system. Specs and canonical values live in
> [`packages/ui/src/primitives/context.md`](packages/ui/src/primitives/context.md); this file is the
> to-do and the order to do it in.

Every new piece follows the same recipe as `Choice` and `Dialog`: a native element underneath,
controlled + uncontrolled, `forwardRef`, `data-state` attributes, only the §2 values, no fonts, no
sound, no glow, and a reduced-motion path. Done means: exported from `packages/ui/src/index.ts`,
registered with `propDefs`, demoed in `PresentationRenderer.tsx`, and `pnpm build:registry` run.

---

## 1. Done

| Component | File | Notes |
|---|---|---|
| Checkbox, Radio, Radio Card | `primitives/Choice.tsx` | One `Choice` + `ChoiceGroup`. The reference for wells and popouts. |
| Modal, Dialog, DialogButton | `primitives/Dialog.tsx` | Native `<dialog>`. The reference for overlays and panel motion. |
| Command Palette | `animated/CommandPalette.tsx` | Revamped onto the Dialog shell. Should move to `primitives/` (see §4). |
| Tabs | `primitives/Tabs.tsx` | `segment` and `underline` variants, sliding indicator, roving tabindex. Exports `SEGMENT_CLASS` / `TRACK_CLASS`. |
| Segmented Control | `primitives/SegmentedControl.tsx` | Native radios underneath; shares the segment and track look with Tabs. |
| Drawer | `primitives/Drawer.tsx` | Native `<dialog>`, floats 8px off the edge, title + close socket + footer tray. Exports `CloseSocket`, `DRAWER_PANEL_CLASS`. |
| Nav | `primitives/Nav.tsx` | Groups, items (link or button), collapsible sections on a rail; gliding current-page segment. |
| Sidebar | `animated/Sidebar.tsx` | Rebuilt on Drawer + Nav. Same props as before. |
| Progress | `primitives/Progress.tsx` | Well track, popout fill; indeterminate sweep via the Web Animations API (no global CSS). |
| Combobox | `primitives/Combobox.tsx` | List on the top layer (native `popover`), flips above when cramped, sunken gliding highlight. Shares `search.ts` with the Command Palette. |
| Table | `primitives/Table.tsx` | Native `<table>` in a raised card; tray header, cut-line rows, numeric + sortable columns, title/action/footer slots. |
| Breadcrumbs | `primitives/Breadcrumbs.tsx` | Folds the middle into a socket; `linkAs` for router links. |
| Accordion | `animated/Accordion.tsx` | The reference for raised surfaces and the chevron socket. Small a11y gaps (§3). |

---

## 2. To build (new)

Grouped by what unlocks what. Build top to bottom: later items reuse earlier ones.

### Wave 1 — Foundations (everything else sits on these)

| # | Component | Why first | Key details |
|---|---|---|---|
| 1 | **Button** | `DialogButton` already is 80% of it. Every demo and page needs one. | Promote `DialogButton` into `primitives/Button.tsx` with `primary · secondary · ghost · danger`, `sm · md · lg` (32/40/48), `loading`, leading/trailing icon slots, icon-only (requires `aria-label`), `asChild` for links. `DialogButton` becomes a thin re-export. |
| 2 | **Kbd** | Already written privately inside `CommandPalette`. | Lift it out: tiny raised key, `rounded-md`, h-5. Used by Palette, Dropdown, Tooltip, docs. |
| 3 | **Separator** | One line, used by Menu, Table, Stepper, Card. | The machined cut line: 0.5px light over 0.5px dark. Horizontal + vertical. |
| 4 | **Spinner** | Needed by Button `loading`. One already lives inside `Dialog.tsx`. | Lift it out: 16px ring, 90° arc, 0.8s linear. |
| 5 | **Field** | Wires labels and errors for every input below. | `label`, `description`, `error` (danger + icon, never colour only). Auto `htmlFor`, `aria-describedby`, `aria-invalid` via context. |
| 6 | **Input** | The most-used control after Button. | Well surface, `rounded-xl`, h-10. Leading icon, trailing action (clear, show password), suffix text. Focus = border to 0.18, no glow. Replaces `ChromeInput` as the base (§3). |
| 7 | **Textarea** | Same material as Input. | Min 3 rows, optional auto-grow, character count. |
| 8 | **Popover** | The base for Select, Dropdown, Combobox, Datepicker, Tooltip. | Use the native `popover` attribute + CSS anchor positioning with a JS fallback for flip. Raised, `rounded-2xl`, prismatic edge, 160ms scale from the anchor side. |

### Wave 2 — Core controls

| # | Component | Key details |
|---|---|---|
| 9 | **Switch** (primitive) | Rebuild on `<input type="checkbox" role="switch">` the same way `Choice` is built. Off: dark thumb in a well. On: thumb becomes popout, track gets a faint 0.06 fill. No LED, no `rotateY`. (Replaces the animated `Switch`, §3.) |
| 10 | **Select** | Trigger looks like Input with a chevron socket. Listbox on Popover; highlighted row = the same raised gliding segment as the Command Palette. Type-ahead, Home/End. Native `<select>` hidden underneath for forms. |
| 11 | **Dropdown Menu** | Popover, padding 6, h-9 rows, group labels, Separators, `Kbd` shortcuts, check/radio items, submenus. Reuses the palette's gliding highlight. |
| 12 | **Tooltip** (primitive) | 400ms open delay, 0ms when moving between tooltips, opacity + 4px slide, 120ms. Shows on keyboard focus. Built on Popover. (Replaces the animated `Tooltip`, §3.) |
| 13 | ~~**Tabs**~~ ✅ | Well track, raised active segment that slides (`layoutId`). `underline` variant with a prismatic line. Arrow keys, automatic activation. |
| 14 | ~~**Segmented Control**~~ ✅ | Same as the Tabs list, used inline for 2–5 options. Can share the Tabs internals. |
| 15 | **Card** | Raised, `rounded-2xl`, prismatic edge. Header (title, description, action) / body / footer tray (same as the Dialog footer). `interactive` variant uses the hover shadow, no translate. |
| 16 | **Badge** | h-5, `neutral · solid · status`. Never uppercase-tracked. The Palette already has an inline one to lift out. |
| 17 | **Alert** (inline) | Tray panel, status dot, title + description, optional action. Status tints the top edge only, no fill, no left stripe. |
| 18 | **Toast** (primitive) | Keep today's stack and bevel; add a 6px status dot, the round close socket, an action slot and pause-on-hover auto-dismiss. Expose an imperative `toast()` + `<Toaster />`. (Replaces the animated `Toast`, §3.) |

### Wave 3 — Common

| # | Component | Key details |
|---|---|---|
| 19 | **Avatar** + group | Round socket holding the image, initials fallback, overlapping group with a ring, status dot. |
| 20 | **Skeleton** | Well surface in the content's shape, slow 1.6s highlight sweep, off under reduced motion. |
| 21 | **Slider** | 6px well track, 0.5 white fill, 18px popout pearl thumb (same as the radio pearl), value tooltip while dragging. Native `<input type="range">` underneath. |
| 22 | ~~**Progress**~~ ✅ | Well track with a popout fill; indeterminate = slow sweep. (`Meter` covers part of this, §3.) |
| 23 | ~~**Combobox**~~ ✅ | Input + Popover listbox with filtering. The Command Palette's search and row code should be shared here, not copied. |
| 24 | ~~**Table**~~ ✅ | Lives in a Card. Tray header band, h-11 rows split by Separator, 0.02 hover fill, tabular numbers right-aligned. `docs/props-table-design.md` is the visual reference. |
| 25 | ~~**Breadcrumbs**~~ ✅ | Tertiary links, `/` in disabled text, current page in primary. |
| 26 | **Pagination** | Ghost buttons, the current page is a raised square. |
| 27 | **Empty State** | Icon in a 48px socket, title, one line, one action. The Palette's "No results" is already this; lift it. |
| 28 | **File Upload** | Dashed well; on drag-over the border goes to 0.3 and the well lightens one step. File rows with Progress. |
| 29 | **Stepper** | Sockets that become popout pearls when done, Separator connectors. |
| 30 | ~~**Drawer / Sheet**~~ ✅ | Dialog shell anchored to an edge, 260ms slide. Reuse the `Dialog.tsx` shell (export it as an internal). |

### Wave 4 — Layout (invisible, but they make generated pages consistent)

| # | Component | Purpose |
|---|---|---|
| 31 | **Stack** | Flex with gaps from the 4px scale. |
| 32 | **Container** | Max widths 640 / 768 / 1024 / 1280 + 16px gutter (24px from `sm`). |
| 33 | **Grid** | Responsive columns with consistent gaps. |
| 34 | **ScrollArea** | Thin 6px well-coloured scrollbar for panels and menus (the Palette tray needs this). |
| 35 | **VisuallyHidden** | Screen-reader-only text. |
| 36 | **Portal** | For anything the native top layer doesn't cover. |

---

## 3. To revamp (existing components that drift)

The animated versions can stay in the catalogue as showpieces. The fix is to build the primitive
from the parts that are right and strip what breaks the restraint rules.

| Component | Keep | Fix | Becomes |
|---|---|---|---|
| **Switch** | The recessed track and beveled thumb. | Remove the DM Sans `@import`, the emerald LED with `animate-pulse`, the green track wash, and the `rotateY` flip. Rebuild on a native checkbox with `role="switch"`. | `primitives/Switch.tsx` (#9) |
| **Tooltip** | Small raised pill. | Remove the DM Sans `@import`, the cursor-parallax tilt (`rotateY`), the pulsing white dot and the 0.88 scale entrance. Add focus trigger and open delay. | `primitives/Tooltip.tsx` (#12) |
| **Toast** | The stack, bevel and prismatic edge. | Replace the filled red close button (`#d34044`) with the round close socket from `Modal`; status as a dot; add action slot and pause-on-hover. | `primitives/Toast.tsx` (#18) |
| **ChromeInput** | The well. | Placeholder is Jura 10px uppercase: make it the value's font and size in tertiary. Brushed texture and cursor spotlight become an opt-in `texture` prop. | Base for `Input` (#6) |
| **ChromeSelect** | The well trigger. | Rebuild the listbox on Popover with proper `role="listbox"` / `aria-activedescendant`, type-ahead and the gliding highlight. | `Select` (#10) |
| **Datepicker** | The grid layout. | Remove the default-on `Audio` sounds and the glows; drop the hard-coded Inter. Put it on Popover; selected day = popout, today = 1px ring. | `primitives/Datepicker.tsx` |
| **OTPInput** | The row of wells. | Remove the purple accent (`#a78bfa`), the emerald success fill and the pulse; DM Sans `@import`. Active well gets the focus border; success/error as status edge tint + message via `Field`. | `primitives/OTPInput.tsx` |
| **Meter** | The idea of a well track with a fill. | Remove the Poppins `@import`, the zinc/rose/emerald hex palette. Rebuild as `Progress` (#22) with a popout fill; keep `Meter` for labelled value ranges with status tints only. | `Progress` + `Meter` |
| ~~**Sidebar**~~ ✅ | Rebuilt on `Drawer` + `Nav`. | Done: no DM Sans, no purple, no emerald, no glow. | `Sidebar` (same props) |
| **NavBar1** | The floating raised bar. | Remove default `Audio` and the emerald `animate-ping` dot. `rounded-2xl` + prismatic edge. The site's own `Navbar.tsx` should then use it. | `primitives/Navbar.tsx` |
| **Loaders1 / LoaderCard** | — | Rainbow of status hexes, `rotateY`, sound. Keep as showpieces; the system only needs `Spinner` (#4) and `Skeleton` (#20). | Showpiece only |
| **SimpleCard / Cards** | The bevel card. | Normalise to the §2 surface tokens (it uses `#151515` instead of the raised gradient). | `Card` (#15) |
| **Accordion** | Everything visual. | Add `aria-expanded` / `aria-controls` to the trigger; render the `icon` field that's currently ignored; move to `primitives/`. | `primitives/Accordion.tsx` |
| **Timeline** | Layout. | Remove the DM Sans `@import` and the glow. Can be rebuilt on `Stepper` (#29) parts. | Showpiece or `Stepper` variant |
| **CommandPalette** | Already revamped. | Move to `primitives/`, use the shared `Kbd`, `Badge`, `EmptyState` and `ScrollArea` once they exist, and share search/rows with `Combobox`. Then move the docs' `/present` palette (`apps/docs/.../presentation/CommandPalette.tsx`) onto it, as the home page already is. | `primitives/CommandPalette.tsx` |

---

## 4. System chores (not components, but needed to call it "done")

1. **Tokens as CSS variables.** Put every §2 value (surfaces, shadows, prismatic, status, easings) in `globals.css` as variables, and have primitives read them. This is what makes light mode a token swap later rather than a rewrite.
2. **Shared internals.** Export the `Dialog.tsx` shell, `PRISMATIC`, `POPOUT`, the well shadow and the close socket from one `primitives/internal.ts` instead of redefining them per file (they're already duplicated in `Choice`, `Dialog` and `CommandPalette`).
3. **One font.** Pick one sans + one mono at the app level and delete every in-component `@import` (Switch, Tooltip, OTPInput, Meter, Sidebar, Timeline, ButtonAlpha, the docs demos).
4. **Sound is opt-in.** `Datepicker`, `NavBar1`, `Loaders1`, `ButtonAlpha` play audio by default; flip to a `sound` prop defaulting to `false`.
5. **Docs demos.** Several demos in `PresentationRenderer.tsx` still inject DM Sans and use ad-hoc button styles; switch them to `Button` once it exists.
6. **Keep `primitives/context.md` in sync.** Flip each ⚠️/❌ to ✅ as pieces land.

---

## 5. Suggested order

1. Button → Kbd → Separator → Spinner (one sitting; mostly lifting code that exists)
2. Field → Input → Textarea
3. Popover → Tooltip → Select → Dropdown Menu
4. Switch → Tabs → Segmented Control
5. Card → Badge → Alert → Toast
6. Shared internals + CSS variables (§4.1–4.2) before the list gets longer
7. Wave 3, then layout helpers
