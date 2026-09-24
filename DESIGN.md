# adgrid-ui — Design System

> **Version**: 0.1.0  
> **Aesthetic**: Dark-First · Tactile Skeuomorphic · Machined Enclosure  
> **Default Font**: Inter  
> **Scaffold Font**: DM Sans  

---

## 1. Design Philosophy

adgrid-ui is built on a single mental model: **every UI element is a physical object**.

Surfaces are machined from dark polymer or brushed metal. Buttons have weight. Cards have depth. Inputs are recessed wells cut into chassis frames. Interactions feel tactile — there is always a sense of material resistance, specular light catch, and occlusion shadow communicating elevation.

### Core Principles

1. **Dark-first, always.** No light mode. The void is the canvas.
2. **Machined Enclosure mental model.** Every container is a physical chassis. Every input is a machined cutout. Every active element physically rises from its slot.
3. **Three elevation tiers.** All surfaces exist on exactly one of three physical layers:
   - **Raised / Embossed** — the console frame, lifted above the workspace
   - **Recessed / Debossed** — the tray cut into the frame, sinking inward
   - **Well** — the deepest point, where inputs and sub-controls live
4. **Physics over animation curves.** Spring easing and rigid-body physics preferred over linear or cubic-bezier curves.
5. **Light has a single source.** Overhead ambient light. Top edges catch it. Bottom lips cast occlusion shadows. Side edges are barely visible.

---

## 2. Color System

All colors are dark-spectrum. There is no light surface in this system.

### Core Palette

| Token | Hex | Usage |
|---|---|---|
| `--void` | `#050505` | Deepest wells — sub-input backgrounds, absolute bottom |
| `--obsidian-deep` | `#070707` | Inner socket backgrounds |
| `--obsidian` | `#090909` | Sunken trays, debossed parameter containers |
| `--charcoal-deep` | `#151515` | Card face, standard component background |
| `--charcoal` | `#171717` | Console frame, raised panel background |
| `--surface` | `#1c1c1c` | Slightly lifted surface above charcoal |
| `--muted` | `#888888` | Secondary text, placeholders, disabled states |
| `--text` | `#e5e5e5` | Primary body text |
| `--text-dim` | `#aaaaaa` | Tertiary text, captions |
| `--white` | `#ffffff` | Active selection pills, maximum contrast elements |
| `--accent-gold` | `#c9a84c` | Luxury accent — VoidButton, GuillocheButton, premium highlights |

### Border Opacity Scale

All borders use `rgba(255, 255, 255, N)` — white at controlled opacity on dark backgrounds.

| Usage | Value |
|---|---|
| Side edge definition | `rgba(255,255,255,0.02)` |
| Tray / card resting border | `rgba(255,255,255,0.04)` |
| Card hover border | `rgba(255,255,255,0.08)` |
| Standard control border | `rgba(255,255,255,0.08)` |
| Focus / active border | `rgba(255,255,255,0.20)` |
| Top specular bevel edge | `rgba(255,255,255,0.22)` |
| Active pill border | `rgba(255,255,255,0.35)` |

---

## 3. Typography — Two-Font System

This project uses a deliberate two-font split based on UI **layer**, not content type.

---

### A. Global Default — **Inter**

Inter is the default font for all application text, component internals, data, headings, body copy, and labels unless explicitly overridden.

```css
font-family: 'Inter', sans-serif;
```

#### Type Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display-lg` | 48px | 700 | 1.1 | Hero / landing headings |
| `display-md` | 36px | 700 | 1.15 | Major section headings |
| `headline` | 24px | 600 | 1.3 | Card titles, panel headings |
| `title` | 18px | 600 | 1.35 | Sub-section titles |
| `body-lg` | 16px | 400 | 1.6 | Primary reading body |
| `body-md` | 14px | 400 | 1.55 | Secondary body, descriptions |
| `body-sm` | 12px | 400 | 1.5 | Captions, meta, timestamps |
| `label` | 11px | 500 | 1.4 | Tags, badges, keyboard hints |

---

### B. Component Demo / Presentation Scaffold — **DM Sans**

DM Sans is used **exclusively on the scaffold layer** — the wrapper UI that introduces and demonstrates a component on the docs or showcase page.

```css
font-family: 'DM Sans', sans-serif;
```

#### What is the Scaffold Layer?

When a component is presented on the docs/showcase, it is wrapped in a presentation scaffold. This scaffold has three distinct zones, all using DM Sans:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Tactile Command Palette              ← Demo Title   │
│  [DM Sans 700, ~24px, #e5e5e5]                       │
│                                                      │
│  Press ⌘K anywhere or click the      ← Description  │
│  button below to open the palette.                   │
│  [DM Sans 400, 14px, #888888]                        │
│                                                      │
│  ┌──────────────────────────────────┐                │
│  │  Open Command Palette    ⌘K      │ ← Trigger Btn  │
│  │  [DM Sans 500, 14px]             │                │
│  └──────────────────────────────────┘                │
│                                                      │
└──────────────────────────────────────────────────────┘
                      ↓
        [Component renders — uses Inter internally]
```

#### Scaffold Typography Tokens

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Demo Title | DM Sans | 22–24px | 700 | `#e5e5e5` |
| Demo Description | DM Sans | 14–15px | 400 | `#888888` |
| Trigger Button Label | DM Sans | 14px | 500 | `#e5e5e5` |
| Keyboard Badge | DM Sans | 11px | 500 | `#aaaaaa` |

#### Reference Implementations

These components have a documented presentation scaffold that uses DM Sans:

| Component | Scaffold Element | File |
|---|---|---|
| `CommandPalette` | "Open Command Palette ⌘K" trigger button | [`packages/ui/src/animated/CommandPalette.tsx`](packages/ui/src/animated/CommandPalette.tsx) |
| `Sidebar` | "Open Sidebar" trigger button | [`packages/ui/src/animated/Sidebar.tsx`](packages/ui/src/animated/Sidebar.tsx) |
| `Tooltip` | "Hover to reveal" instruction text | [`packages/ui/src/animated/Tooltip.tsx`](packages/ui/src/animated/Tooltip.tsx) |

> **Rule**: If a UI element's job is to *introduce, instruct, or trigger* a component demonstration — it uses DM Sans. If it lives *inside* the component itself — it uses Inter.

---

#### Scaffold Trigger Button — Canonical Spec

Every "present section" trigger button **must** use the following exact styles. This is the standard machined dark button for the presentation scaffold layer. No exceptions.

**Tailwind + Inline Style (canonical form):**

```tsx
<button
  style={{
    backgroundColor: "#171717",
    boxShadow:
      "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.6)",
  }}
  className="px-5 h-11 rounded-xl text-xs font-bold text-neutral-200 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white cursor-pointer active:scale-95 transition-all"
>
  Open Command Palette
</button>
```

**Token Breakdown:**

| Property | Value | Purpose |
|---|---|---|
| `background` | `#171717` | Charcoal raised surface |
| `inset 0 1.5px 0 0 rgba(255,255,255,0.12)` | Top inner bevel | Overhead light catch on top lip |
| `inset 0 -1.5px 0 0 rgba(0,0,0,0.45)` | Bottom inner occlusion | Physical bottom-lip depth shadow |
| `0 4px 14px rgba(0,0,0,0.6)` | Drop shadow | Elevation above background |
| `border-t border-white/20` | Top edge `rgba(255,255,255,0.20)` | Strong specular top bevel |
| `border-x border-white/[0.02]` | Side edges | Near-invisible side definition |
| `border-b border-white/10` | Bottom edge `rgba(255,255,255,0.10)` | Shadow-side border |
| `rounded-xl` | 12px radius | Button corner geometry |
| `h-11 px-5` | 44px height, 20px x-padding | Comfortable tap/click target |
| `text-xs font-bold` | 12px, 700 weight | DM Sans bold label |
| `text-neutral-200` / `hover:text-white` | Resting → hover text | Subtle brightness lift on hover |
| `active:scale-95` | Scale down 95% | Tactile press-down feedback |
| `transition-all` | All properties | Smooth state transitions |

**Pure CSS equivalent:**

```css
.scaffold-trigger-button {
  background-color: #171717;
  box-shadow:
    inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12),
    inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45),
    0 4px 14px rgba(0, 0, 0, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.20);
  border-left: 1px solid rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 12px;          /* rounded-xl */
  height: 44px;                 /* h-11 */
  padding: 0 20px;              /* px-5 */
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;              /* text-xs */
  font-weight: 700;             /* font-bold */
  color: #e5e5e5;               /* text-neutral-200 */
  cursor: pointer;
  transition: all 150ms ease;
}

.scaffold-trigger-button:hover {
  color: #ffffff;
}

.scaffold-trigger-button:active {
  transform: scale(0.95);
}
```

---

## 4. Elevation & Depth System

> **Full token spec with CSS formulas**: [`docs/props-table-design.md`](docs/props-table-design.md)

All surfaces exist on one of three elevation tiers. This is the foundational rule of the entire design system.

### Tier 1 — Raised / Embossed (Console Frame)

The outermost chassis. Lifted above the workspace. Top edge catches overhead ambient light strongly.

```css
.tier-1-raised {
  background-color: #171717;
  border-top: 1px solid rgba(255, 255, 255, 0.20);    /* Strong top bevel highlight */
  border-left: 1px solid rgba(255, 255, 255, 0.02);   /* Soft side edge */
  border-right: 1px solid rgba(255, 255, 255, 0.02);  /* Soft side edge */
  border-bottom: 1px solid rgba(255, 255, 255, 0.10); /* Shadow transition */
  box-shadow:
    inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08),  /* Inner top specular catch */
    inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40),       /* Bottom lip occlusion */
    0 30px 80px rgba(0, 0, 0, 0.60);               /* Global ambient elevation shadow */
}
```

### Tier 2 — Recessed / Debossed (Parameter Tray)

Cut into the chassis. Light drops off at the top edge. Bottom rim catches light on the way out.

```css
.tier-2-recessed {
  background-color: #090909;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.80),   /* Deep top shadow — light occluded */
    0 1px 0 rgba(255, 255, 255, 0.05);      /* Bottom rim highlight catch */
}

.tier-2-recessed:hover {
  border-color: rgba(255, 255, 255, 0.08);
}
```

### Tier 3 — Well (Input / Sub-control)

The deepest point. No ambient light reaches here. Pure inset cavity.

```css
.tier-3-well {
  background-color: #050505;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1.5px 3px rgba(0, 0, 0, 0.60);
}

.tier-3-well:focus {
  border-color: rgba(255, 255, 255, 0.20);
}
```

### Active Selection Pill — Raised Toggle

When a toggle or pill is selected, it physically rises out of its well slot.

```css
.active-pill {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.20);
}
```

---

## 5. Card & Surface Language

> **Full bevel copy kit with components**: [`docs/card-bevel-prompt-and-code.md`](docs/card-bevel-prompt-and-code.md)

### Prismatic Top-Border Highlight

Every major card receives a razor-thin prismatic gradient overlay on its top edge. This simulates a light prism catching the overhead ambient source. It is always an `absolute` positioned element or `::before` pseudo-element.

```css
/* As a pseudo-element */
.skeuo-bevel-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  z-index: 20;
  pointer-events: none;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.18) 25%,
    rgba(255, 255, 255, 0.32) 50%,
    rgba(255, 255, 255, 0.18) 75%,
    transparent 100%
  );
}
```

### Standard Bevel Card

The default card surface used across the component library.

```css
.skeuo-bevel-card {
  position: relative;
  background-color: #151515;
  border-radius: 16px;                                    /* rounded-2xl */
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow:
    inset 0 2px 0 0 rgba(255, 255, 255, 0.06),           /* Top inner specular */
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.50),                /* Bottom lip occlusion */
    0 32px 64px -12px rgba(0, 0, 0, 0.70),               /* Low-freq depth shadow */
    0 4px 24px -4px rgba(0, 0, 0, 0.50);                 /* High-freq anchor shadow */
}
```

### Inner Socket

Any inner item container (icon slot, button frame, input) follows the sunken socket pattern.

```css
.skeuo-inner-socket {
  background-color: #070707;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1.5px 3.5px rgba(0, 0, 0, 0.85);
}
```

### Machined Console Variant

For full-panel containers (like the props table or settings panels) using the stronger machined enclosure spec:

```css
.skeuo-console {
  background-color: #171717;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  border-left: 1px solid rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08),
    inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45),
    0 4px 6px -1px rgba(0, 0, 0, 0.80),
    0 2px 4px -1px rgba(0, 0, 0, 0.90),
    0 30px 80px rgba(0, 0, 0, 0.65);
}
```

---

## 6. Spacing Scale

Base unit is **4px**. All spacing is a multiple of this unit.

| Token | Value | Tailwind |
|---|---|---|
| `space-1` | 4px | `p-1` / `gap-1` |
| `space-2` | 8px | `p-2` / `gap-2` |
| `space-3` | 12px | `p-3` / `gap-3` |
| `space-4` | 16px | `p-4` / `gap-4` |
| `space-6` | 24px | `p-6` / `gap-6` |
| `space-8` | 32px | `p-8` / `gap-8` |
| `space-12` | 48px | `p-12` / `gap-12` |
| `space-16` | 64px | `p-16` / `gap-16` |
| `space-20` | 80px | `p-20` / `gap-20` |

---

## 7. Roundness

| Context | Radius | Tailwind |
|---|---|---|
| Cards, panels, console frames | 16px | `rounded-2xl` |
| Inputs, inner pills, select dropdowns | 8px | `rounded-lg` |
| Tooltips, small badges | 6px | `rounded-md` |
| Buttons (standard) | 8–10px | `rounded-lg` |
| Full-round toggles, avatar pills | 9999px | `rounded-full` |

---

## 8. Motion & Animation Principles

### Easing Philosophy
- **Spring physics over cubic-bezier** — always prefer spring easing for interactive elements.
- **No linear easing** for any UI element interaction.
- Scroll animations use **Lenis smooth scroll + GSAP ticker**.
- Physics simulations (card stacks, drag) use **Matter.js rigid-body engine**.

### Timing Reference

| Interaction Type | Duration | Notes |
|---|---|---|
| Micro-interaction (hover, focus) | ≤ 200ms | Button glows, border transitions |
| Panel / overlay open | 300–400ms | Sidebar, CommandPalette |
| Page / section transition | 400–600ms | Hero reveals, route changes |
| Scroll-linked animation | Continuous | Tied to scroll position |
| Physics simulation | Real-time | Matter.js, no fixed duration |

### Framer Motion Spring Presets

```ts
// Snappy — for toggles, pills, micro UI
const springSnappy = { type: 'spring', stiffness: 500, damping: 30 };

// Fluid — for panels, cards, overlays
const springFluid = { type: 'spring', stiffness: 300, damping: 28 };

// Gentle — for large-scale reveals
const springGentle = { type: 'spring', stiffness: 180, damping: 24 };
```

---

## 9. Component Aesthetic Rules

Quick reference for implementing or generating new components in this system:

| Rule | Implementation |
|---|---|
| All surfaces use the bevel/elevation system | Never use flat `border` alone — always pair with `box-shadow` |
| Backgrounds always in dark range | `#050505` → `#1c1c1c` only |
| Resting borders are nearly invisible | `rgba(255,255,255,0.04)` to `rgba(255,255,255,0.08)` |
| Hover increases border visibility | Resting `0.04` → hover `0.08`, resting `0.08` → hover `0.12` |
| Focus states use neon inner border | `border: 1px solid rgba(255,255,255,0.20)` + optional glow |
| Selected/active elements rise | White `#fff` background, dark text, soft drop shadow |
| Interactive elements have haptic weight | Use spring easing, never instant |
| Inner containers are always darker than parent | `parent - 1 tier` in elevation |

---

## 10. Reference Documents

| Document | Purpose | Link |
|---|---|---|
| Elevation Token Spec | Full CSS formulas for all three elevation tiers, border recipes, and the machined panel spec | [`docs/props-table-design.md`](docs/props-table-design.md) |
| Card Bevel Copy Kit | Prismatic top-border gradient, multi-layer bevel box-shadow, `BeveledCard` React component, pure CSS class | [`docs/card-bevel-prompt-and-code.md`](docs/card-bevel-prompt-and-code.md) |

---

*This file is the single source of truth for adgrid-ui visual design decisions. When generating new components or screens, reference Sections 4–5 for surface treatment, Section 3 for font choices, and Section 9 for the component aesthetic checklist.*
