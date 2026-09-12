# App Context: `apps/docs` (Void UI / Adgrid UI Showcase & Studio)

> **Location**: `apps/docs/`  
> **Framework**: Next.js 16.2.9 (App Router) + React 19.2.4  
> **Role**: Interactive Component Gallery, Presentation Engine, Playground, and shadcn-Compatible Distribution Server  

---

## 1. Overview & Purpose

`apps/docs` is the central web platform for the Void UI / Adgrid UI ecosystem. It serves four distinct purposes:
1. **Interactive Showcase**: Live gallery (`/gallery`) where developers can explore, filter, search, and preview 38+ registered motion components.
2. **Full-Screen Presentation Studio**: Presentation mode (`/present/[category]/[slug]`) with live rendering, a real-time **Props Tweaker**, FPS diagnostics, code inspector, and sandbox mode.
3. **Dedicated Interactive Playgrounds**: Standalone deep-dive demos like `/matrix-demo` (programmable LED dot matrix) and `/hero-demo`.
4. **Component Distribution API**: shadcn-style distribution endpoints (`/r/[name].json` and `/r/registry.json`) allowing CLI users to install components directly into their own projects.

---

## 2. Technical Stack & Tooling

* **Framework**: Next.js 16.2.9 with App Router and Turbopack
* **UI & Rendering**: React 19.2.4, Framer Motion, Shiki syntax highlighter
* **Styling**: Tailwind CSS v4 with PostCSS (`@tailwindcss/postcss`)
* **State Management**: Zustand v5
* **Live Sandbox**: `@codesandbox/sandpack-react`
* **Local Package Integration**: Consumes `@adgrid-ui/ui` via pnpm workspace (`workspace:*`)
* **Build Script**: `pnpm --filter docs build:registry` runs `tsx scripts/build-registry.ts` to precompile component registry data.

---

## 3. Directory Layout

```
apps/docs/
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── components.json              # shadcn-compatible configuration
├── scripts/
│   └── build-registry.ts        # Script to generate JSON payloads for CLI distribution
└── src/
    ├── app/                     # Next.js App Router routes
    │   ├── layout.tsx           # Root layout with fonts & SiteChrome wrapper
    │   ├── page.tsx             # Minimalist VoidUI landing page with CurtainField
    │   ├── globals.css          # Design system CSS variables & Tailwind v4 theme
    │   ├── not-found.tsx        # Custom 404 error page
    │   ├── gallery/             # Filterable component gallery with search & cards
    │   ├── present/             # Fullscreen presentation studio route
    │   │   └── [category]/[slug]/page.tsx
    │   ├── docs/                # Documentation section ([...slug])
    │   ├── getting-started/     # Onboarding & quickstart guides
    │   ├── installation/        # CLI & manual installation guides
    │   ├── theming/             # Dark mode & custom theme docs
    │   ├── lab/                 # Experimental component testing sandbox
    │   ├── matrix-demo/         # 11-mode DotMatrix playground
    │   ├── hero-demo/           # Interactive Hero layout demo
    │   ├── landing/             # Alternative marketing landing variant
    │   ├── embed/               # Embeddable widget viewports
    │   ├── r/                   # shadcn-compatible registry endpoints
    │   │   ├── [name].json/route.ts
    │   │   └── registry.json/route.ts
    │   └── api/                 # Internal API endpoints
    │       ├── now-playing/route.ts
    │       └── registry/
    ├── components/
    │   ├── site/                # Global site chrome (Navbar, Footer, Bento, etc.)
    │   ├── hero/                # PremiumHero modular sub-components
    │   └── presentation/        # 23-file Presentation Studio Engine
    ├── lib/                     # Client utilities and font configurations
    └── registry/                # Central component metadata index & types
```

---

## 4. Routes & Applications Map

| Route | File Location | Purpose & Features |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Minimalist brand homepage featuring `CurtainField` and typography. |
| `/gallery` | `src/app/gallery/page.tsx` | Main showcase catalog. Filter by category (All, Animated, Buttons, Backgrounds, Primitives, Widgets), real-time search, live hover previews, and direct links to Present Mode. |
| `/present/[category]/[slug]` | `src/app/present/[category]/[slug]/page.tsx` | Full-screen presentation workbench with real-time props tweaker, canvas scaler, dark background presets, FPS monitor, and code tabs. |
| `/matrix-demo` | `src/app/matrix-demo/page.tsx` | Dedicated DotMatrix sandbox with 11 animation modes, text input, LED color selection, brightness, and wave physics sliders. |
| `/hero-demo` | `src/app/hero-demo/page.tsx` | Standalone interactive hero demo. |
| `/docs/[...slug]` | `src/app/docs/[...slug]/page.tsx` | Documentation hub for guides and API references. |
| `/getting-started` | `src/app/getting-started/page.tsx` | Quickstart setup instructions. |
| `/installation` | `src/app/installation/page.tsx` | CLI and manual package installation steps. |
| `/theming` | `src/app/theming/page.tsx` | Theme system and CSS variable customization guide. |

---

## 5. Key Subsystems in `apps/docs`

### A. Presentation Studio Subsystem (`src/components/presentation/`)
A modular 23-file presentation suite that powers `/present/[category]/[slug]`:
* **`PresentationRenderer.tsx`** (~888 lines): The core dynamic component dispatcher. It receives the active component slug and user-tweaked props and mounts the live component.
* **`PropsTweaker.tsx`** (~355 lines): Inspector panel dynamically generated from the component's `propDefs`. Renders sliders for numbers, color pickers for colors, dropdown selects, and toggle switches.
* **`FloatingDock.tsx`**: Bottom floating HUD with quick navigation, category switcher, and view modes.
* **`FPSMonitor.tsx`**: Real-time render loop performance and frame rate monitor.
* **`PresentationCanvas.tsx` & `PresentationBackground.tsx`**: Viewport canvas container with zoom/pan capabilities and background atmosphere switching (solid, grid, dots, radial).

### B. Distribution API (`src/app/r/`)
* **`/r/[name].json`**: Serves a single component's manifest, dependencies, and raw source code files in standard shadcn JSON schema.
* **`/r/registry.json`**: Serves the complete catalog index of all available components.

---

## 6. Development Scripts

```bash
# Start Next.js development server
pnpm --filter docs dev

# Build for production
pnpm --filter docs build

# Pre-generate registry distribution artifacts
pnpm --filter docs build:registry
```
