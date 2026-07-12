# adgrid-ui — Full Project Analysis

> Generated: July 12, 2026
> Monorepo: `adgrid-ui-monorepo` | Package Manager: `pnpm@10.10.0` | Build: Turborepo

---

## 1. Project Overview

**Root**: `C:\Users\ajink\OneDrive\Desktop\personal - coding - ventures\adgrid-ui\adgrid-ui`

**Workspaces**: `apps/*` and `packages/*`
**Node**: >=18, **pnpm**: >=8

### Root Scripts

| Script | Command |
|--------|---------|
| `build` | `turbo build` |
| `dev` | `turbo dev` |
| `lint` | `turbo lint` |
| `build:registry` | `turbo build:registry` |
| `release` | `turbo build && pnpm --filter void-ui publish --access public` |

---

## 2. Workspace Packages

### 2a. `@adgrid-ui/ui` (`packages/ui/`)

- **Version**: `0.1.0` | **Description**: "Dark-first React component library"
- **Build**: `tsup` → `dist/` (CJS + ESM)
- **Exports**: `.` (components), `./styles` (CSS)
- **Peer Deps**: `framer-motion >=11`, `gsap >=3`, `lucide-react >=0.300`, `matter-js >=0.19`, `react >=18`, `react-dom >=18`, `tailwindcss >=4`
- **Runtime Deps**: `@tabler/icons-react`, `clsx`, `lenis`, `react-icons`, `tailwind-merge`

#### Source Structure

```
packages/ui/src/
├── animated/          # ~39 files/directories (main components)
│   ├── AnisotropicKnob.tsx
│   ├── BrushedTitaniumButton.tsx
│   ├── Cards.tsx
│   ├── CardsTwo/
│   ├── ChromeInput.tsx
│   ├── ChromeSelect.tsx
│   ├── coverflow/
│   ├── DotMatrix.tsx
│   ├── DotPattern.tsx
│   ├── DotPatternPlayground.tsx
│   ├── expand-on-hover/
│   ├── FlickeringGrid.tsx
│   ├── FlickeringGridPlayground.tsx
│   ├── GravityCardStack.tsx
│   ├── GuillocheButton.tsx
│   ├── Hero.tsx
│   ├── ImageParallax.tsx
│   ├── ImageReveal.tsx
│   ├── InfiniteScroll.tsx
│   ├── LaserVaultPassword.tsx
│   ├── LiquidGoldButton.tsx
│   ├── LivingText.tsx
│   ├── LuxuryButtons.tsx
│   ├── MechanicalTimer.tsx
│   ├── MetallicForm.tsx
│   ├── MorphingNav.tsx
│   ├── NamesLanding/
│   ├── NowPlayingCard.tsx
│   ├── PookieForm.tsx
│   ├── PremiumHero.tsx
│   ├── react-wheel-picker/
│   ├── scrollpath/
│   ├── scrollprogress/
│   ├── SimpleCard.tsx
│   ├── spotlight-text/
│   ├── text-shuffle/
│   ├── VoidButton.tsx
│   ├── WeaponWheel.tsx
│   └── WheelPicker.tsx
├── backgrounds/       # 5 entries
│   ├── BreathingGrid.tsx
│   ├── FloatingEmbers.tsx
│   ├── LuminaWave.tsx
│   ├── PixelMelt.tsx
│   └── SpotlightGrid.tsx
├── lib/
│   └── utils.ts       # cn() utility (clsx + tailwind-merge)
├── matrix/            # DotMatrix sub-module
├── code.tsx
└── index.ts           # Main barrel export file
```

#### Exported Components (42 total)

1. `ImageReveal` — Diagonal stripe masking reveal
2. `InfiniteScroll` — Fullscreen parallax scroll with Lenis + GSAP
3. `ImageParallax` — Mouse-move/scroll parallax
4. `LivingText` — Cursor-proximity dynamic character animation
5. `SpotlightText` — Golden cursor-following spotlight on text
6. `GravityCardStack` — Matter.js physics card stack
7. `MorphingNav` — SVG morphing navigation
8. `VoidButton` — Black button with gold gradient reveal
9. `BrushedTitaniumButton` — Metallic texture button
10. `LiquidGoldButton` — Conic gradient rotating button
11. `GuillocheButton` — Watch-dial pattern button
12. `ChromeInput` — Dark glow input field
13. `ChromeSelect` — Chrome-styled select
14. `MetallicForm` — Machined metal form
15. `PookieForm` — Industrial registration plate form
16. `AnisotropicKnob` — Skeuomorphic rotary dial
17. `MechanicalTimer` — Tactile timer with Web Audio
18. `LaserVaultPassword` — Passcode vault keypad
19. `FlickeringGrid` — Flickering grid pattern
20. `FlickeringGridPlayground` — Interactive grid playground
21. `DotPattern` — SVG dot pattern
22. `DotPatternPlayground` — Interactive dot pattern playground
23. `CoverflowCarousel` — 3D coverflow carousel
24. `PremiumHero` — Interactive hero with 3D cards
25. `ScrollProgress` — Vertical scroll progress indicator
26. `NowPlayingCard` — Last.fm-powered vinyl player card
27. `WheelPicker` — 3D wheel picker with momentum
28. `ExpandOnHover` — Expandable preview cards
29. `DotMatrix` — Programmable LED dot matrix
30. `TextShuffle` — Character shuffling text animation
31. `Cards` — Fanned deck of editorial cards
32. `SimpleCard` — Single editorial card
33. `CardsTwo` — 3D orbit ring card carousel
34. `ScrollPathContainer` / `ScrollPathWaves` / `ScrollPathCircuit` / `ScrollPathProcess` — Scroll-linked SVG path drawer
35. `WeaponWheel` — GTA-style selection wheel
36. `NamesLanding` — Names constellation/catalogue display
37. `Hero` — Portfolio hero landing page
38. `PixelMeltBackground` — Full-viewport pixel grid
39. `BreathingGrid` — Orthogonal traveling wave grid
40. `FloatingEmbers` — Glowing ember particles
41. `SpotlightGrid` — Dark grid with spotlight
42. `LuminaWave` — WebGL aurora wave background

### 2b. `void-ui` CLI (`packages/cli/`)

- **Version**: `0.1.0` | **Description**: "CLI to add Void UI components to your project"
- **Binary**: `./bin/void-ui.js`
- **Dependencies**: `commander`, `chalk`, `ora`, `fs-extra`
- **Commands**:
  - `void-ui add <component>` — Fetches from registry API and writes files **(works)**
  - `void-ui init` — **PLACEHOLDER** (prints "init command is currently a placeholder")
  - `void-ui list` — Fetches and displays all components **(works)**

### 2c. Other Packages

| Package | Description |
|---------|-------------|
| `@repo/eslint-config` | Shared ESLint configs (base, next, react-internal) |
| `@repo/typescript-config` | Shared TS configs (base, nextjs, react-library) |
| `packages/public/` | Static assets (sword.png) |

---

## 3. Docs App (`apps/docs/`)

- **Framework**: Next.js 16.2.9 (App Router)
- **Key Deps**: `next`, `react 19`, `framer-motion`, `@codesandbox/sandpack-react`, `@next/mdx`, `shiki`, `zustand`, `@tabler/icons-react`, `lucide-react`, `matter-js`
- **Dev Deps**: `tailwindcss 4`, `tsx`, `eslint-config-next`
- **MDX**: `pageExtensions: ["ts", "tsx", "md", "mdx"]`, `mdxRs: true`, `@next/mdx` installed

### Site Config
- Custom theme colors: `background`, `surface-charcoal`, `pure-black`, `border-hairline`, `text-muted`, etc.
- Tailwind v4 with PostCSS
- Turbopack enabled

---

## 4. All Routes

### Pages

| Route | File | Lines | Status | Description |
|-------|------|-------|--------|-------------|
| `/` | `src/app/page.tsx` | 525 | **FULL** | Home page — ChaosFieldShader hero, HUD control deck (4 luxury buttons), bento grid (6 components), tech stack, CTA |
| `/gallery` | `src/app/gallery/page.tsx` | 594 | **FULL** | Component gallery — all 35 components, filter by category, search, thumbnails, links to present mode |
| `/components` | `src/app/components/page.tsx` | 5 | **STUB** | Redirects to `/gallery` |
| `/landing` | `src/app/landing/page.tsx` | 135 | **FULL** | Light-themed "adgrid" product landing page (separate brand) |
| `/hero-demo` | `src/app/hero-demo/page.tsx` | 55 | **FULL** | Standalone Hero component demo (light-themed) |
| `/matrix-demo` | `src/app/matrix-demo/page.tsx` | 185 | **FULL** | Interactive DotMatrix playground (11 animation modes, color picker, sliders) |
| `/present/[category]/[slug]` | `src/app/present/[category]/[slug]/page.tsx` | 58 | **FULL** | Full-screen present mode — sidebar, code viewer, props tweaker, floating dock, FPS monitor, keyboard shortcuts |

### API Routes

| Route | File | Lines | Description |
|-------|------|-------|-------------|
| `/r/[name].json` | `src/app/r/[name].json/route.ts` | 118 | shadcn registry — per-component JSON with file contents |
| `/r/registry.json` | `src/app/r/registry.json/route.ts` | 23 | shadcn registry catalog |
| `/api/registry/[slug]` | `src/app/api/registry/[slug]/route.ts` | 47 | Legacy/deprecated — single component by slug |
| `/api/registry/index` | `src/app/api/registry/index/route.ts` | 14 | Lists all component names/slugs/categories/descriptions |
| `/api/now-playing` | `src/app/api/now-playing/route.ts` | 88 | Last.fm currently-playing track (falls back to offline mode without API key) |

---

## 5. Registry System (`apps/docs/src/registry/index.ts`)

**Size**: 660 lines | **Components**: 38 registered

### RegistryEntry Schema

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✓ |
| `slug` | string | ✓ |
| `category` | ComponentCategory | ✓ |
| `description` | string | ✓ |
| `dependencies` | string[] | ✓ |
| `packagePath` | string | ✓ |
| `files` | string[] | ✓ |
| `propDefs` | PropDefinition[] | optional |
| `variants` | ComponentVariant[] | optional |
| `presentationStrategy` | DisplayStrategy | optional |

### Categories

| Category | Count | Components |
|----------|-------|------------|
| **animated** | 26 | Infinite Scroll, Image Reveal, Image Parallax, Living Text, Spotlight Text, Gravity Card Stack, Morphing Nav, Coverflow Carousel, Metallic Form, Pookie Form, Premium Hero, Dot Matrix, Scroll Progress, Scroll Path Draw, Now Playing Card, Wheel Picker, Weapon Wheel, Names Landing, Hero Landing, Expand On Hover, Text Shuffle, Cards, Simple Card, Cards Two (3D Orbit Ring), Flickering Grid Playground, Dot Pattern Playground |
| **buttons** | 4 | Void Button, Brushed Titanium Button, Liquid Gold Button, Guilloche Button |
| **backgrounds** | 5 | Pixel Melt, Breathing Grid, Floating Embers, Spotlight Grid, Lumina Wave |
| **primitives** | 1 | Anisotropic Knob |
| **widgets** | 2 | Mechanical Timer, Laser Vault Password |
| **charts** | **0** | **(category defined but empty)** |

### Components with Features

| Feature | Count |
|---------|-------|
| Has propDefs | 15 |
| Has variants | 1 (Spotlight Text) |
| Has presentationStrategy | 15 |
| Has presentationStrategy="fullscreen" | 11 |
| Has presentationStrategy="center" | 3 |
| Has presentationStrategy="cover" | 1 |

---

## 6. Site Components

### `apps/docs/src/components/site/` (16 files)

| Component | Role |
|-----------|------|
| `SiteChrome.tsx` | Root layout wrapper — conditionally renders Navbar (hidden in present mode) |
| `Navbar.tsx` | Fixed header with 5 links |
| `Footer.tsx` | Site footer |
| `BentoCard.tsx` | Bento grid card |
| `ChaosFieldShader.tsx` | WebGL shader background for home hero |
| `CodeBlock.tsx` | Code display block |
| `ComponentPageLayout.tsx` | Layout for component detail pages |
| `ComponentTabs.tsx` | Tab navigation |
| `CopyButton.tsx` | Clipboard copy |
| `DownloadButton.tsx` | Download button |
| `LivePreview.tsx` | Live preview component |
| `PageTransition.tsx` | Framer motion page transition wrapper |
| `PropsEditor.tsx` | Props editor |
| `PropsTable.tsx` | Props documentation table |
| `ShowcaseCard.tsx` | Showcase card |
| `Sidebar.tsx` | Sidebar navigation |

### `apps/docs/src/components/hero/` (12 files)

Sub-system for the PremiumHero showcase: `Hero.tsx`, `AnimatedCounter.tsx`, `BackgroundNotes.tsx`, `CTAButton.tsx`, `FloatingCard.tsx`, `FloatingCards.tsx`, `MouseParallax.tsx`, `Navbar.tsx`, `SearchBar.tsx`, `types.ts`, `useFloating.ts`, `useMouseParallax.ts`

### `apps/docs/src/components/presentation/` (23 files)

Full present mode system: `PresentationLayout.tsx`, `PresentationProvider.tsx`, `PresentationCanvas.tsx`, `PresentationBackground.tsx`, `PresentationRenderer.tsx` (888 lines), `PresentationSidebar.tsx`, `PresentationSettings.tsx`, `PresentationOverlays.tsx`, `PropsTweaker.tsx` (355 lines), `FloatingDock.tsx`, `CommandPalette.tsx`, `KeyboardShortcutsDisplay.tsx`, `FPSMonitor.tsx`, `SidebarTrigger.tsx`, `SidebarSearch.tsx`, `SidebarCategory.tsx`, `SidebarItem.tsx`, `DockButton.tsx`, `PreviewOverlay.tsx`, `MouseActivityProvider.tsx`, `presentation-registry.ts`, `types.ts`, plus 5 hooks.

---

## 7. GAP ANALYSIS — What's Missing

### 7a. Missing Pages

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| **Docs** | `/docs` | **ABSENT** | MDX infra is configured and ready — zero `.mdx` files exist |
| **About** | `/about` | **ABSENT** | No route, no page |
| **Hooks** | `/hooks` | **DEAD LINK** | Navbar links to `#` |
| **Showcase** | `/showcase` | **DEAD LINK** | Navbar links to `#` |
| **Templates** | `/templates` | **DEAD LINK** | Navbar links to `#` |
| **Components** | `/components` | **STUB** | Only redirects to `/gallery` |
| **not-found** | `not-found.tsx` | **ABSENT** | No custom 404 |
| **error** | `error.tsx` | **ABSENT** | No error boundary |
| **loading** | `loading.tsx` | **ABSENT** | No loading state |

### 7b. Navbar Dead Links

| Label | href | Status |
|-------|------|--------|
| Components | `/components` | Redirects to gallery |
| Gallery | `/gallery` | **OK** |
| Hooks | `#` | **DEAD** |
| Showcase | `#` | **DEAD** |
| Templates | `#` | **DEAD** |

### 7c. Components Missing from Registry

| Source File | Category | Notes |
|-------------|----------|-------|
| `FlickeringGrid.tsx` | animated | Only `FlickeringGridPlayground` is registered |
| `DotPattern.tsx` | animated | Only `DotPatternPlayground` is registered |
| `LuxuryButtons.tsx` | buttons | File exists, not in registry, not exported from `index.ts` |

### 7d. Charts Category — Empty

`ComponentCategory` includes `"charts"` but zero components are registered under it. The gallery page has no "Charts" tab (only: All, Animated, Buttons, Backgrounds, Primitives, Widgets).

### 7e. CLI Issues

- **`void-ui init`** — **PLACEHOLDER**. Prints "init command is currently a placeholder." Does nothing.
- CLI fetches from `https://void-ui.vercel.app/api/registry` — requires a deployed instance.

### 7f. Other Issues

| Issue | Details |
|-------|---------|
| **Hardcoded imports** | `PresentationRenderer.tsx` imports `Cards` and `ScrollPath*` via relative paths (`../../../../../packages/ui/src/...`) instead of `@adgrid-ui/ui` |
| **Missing package exports** | `LuxuryButtons`, `FlickeringGrid`, `DotPattern` not exported from `packages/ui/src/index.ts` |
| **No tests** | Zero test files anywhere in the project |
| **Mixed lock files** | `pnpm-lock.yaml` at root + `package-lock.json` in `apps/docs/` |
| **No CI/CD** | No `.github/` or CI configuration |
| **No dark mode toggle** | Navbar has dark_mode button but no toggle logic |
| **API key coupling** | `PremiumHero` uses `font-handwritten` class (`var(--font-caveat)`) defined only in docs site's `globals.css` |
| **Invalid prop type** | `names-landing` prop type `"string[]"` is not in the valid `PropDefinition.type` union |
| **MDX unused** | `@next/mdx` and `mdxRs` configured but no `.mdx` files exist |
| **Root `docs/` folder** | Standalone folder not part of workspace — purpose unclear |

### 7g. Components Without Dedicated Demo Pages

**28 out of 38 components** have no standalone interactive demo page. They only appear as static thumbnails in `/gallery` or can be viewed in present mode (`/present/{cat}/{slug}`):

| Component | Slug |
|-----------|------|
| Infinite Scroll | infinite-scroll |
| Image Reveal | image-reveal |
| Image Parallax | image-parallax |
| Living Text | living-text |
| Spotlight Text | spotlight-text |
| Gravity Card Stack | gravity-card-stack |
| Coverflow Carousel | coverflow-carousel |
| Pixel Melt | pixel-melt |
| Breathing Grid | breathing-grid |
| Floating Embers | floating-embers |
| Spotlight Grid | spotlight-grid |
| Lumina Wave | lumina-wave |
| Metallic Form | metallic-form |
| Pookie Form | pookie-form |
| Mechanical Timer | mechanical-timer |
| Laser Vault Password | laser-vault-password |
| Scroll Progress | scroll-progress |
| Now Playing Card | now-playing-card |
| Wheel Picker | wheel-picker |
| Weapon Wheel | weapon-wheel |
| Names Landing | names-landing |
| Hero Landing | hero |
| Cards | cards |
| Simple Card | simple-card |
| Cards Two (3D Orbit Ring) | cards-two |
| Flickering Grid Playground | flickering-grid-playground |
| Dot Pattern Playground | dot-pattern-playground |
| FlickeringGrid | *(not registered)* |
| DotPattern | *(not registered)* |

### 7h. Priority Ranking of Gaps

| Priority | Gap | Effort | Impact |
|----------|-----|--------|--------|
| **P0** | Docs page (`/docs`) | Medium | High — no documentation exists |
| **P0** | Fix navbar dead links | Low | High — UX polish |
| **P1** | Charts category needs components | High | Medium — category exists but empty |
| **P1** | About page | Low | Medium |
| **P1** | CLI `init` command | Medium | Medium |
| **P2** | 404 / Error / Loading pages | Low | Low-Medium |
| **P2** | Register missing components | Low | Low |
| **P2** | Add tests | High | Medium |
| **P3** | Standalone demo pages per component | High | Low (present mode covers this) |
| **P3** | Fix hardcoded imports | Low | Low |

---

## 8. Statistics Summary

| Metric | Count |
|--------|-------|
| Workspace packages | 5 |
| Apps | 1 (docs) |
| Registered components | 38 |
| Exported UI components | 42 |
| UI source files (animated) | ~39 |
| UI source files (backgrounds) | 5 |
| Docs page routes | 6 |
| Docs API routes | 5 |
| Presentation component files | 23 |
| Site component files | 16 |
| Hero component files | 12 |
| CLI commands | 3 (add ✓, init ✗, list ✓) |
| Components with propDefs | 15 |
| Components with variants | 1 |
| Components with presentationStrategy | 15 |
| Gallery categories | 7 (Charts missing from tabs) |
| Dead navbar links | 3 |
