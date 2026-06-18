# adgrid-ui (void/ui)

> **Dark-first, zero-bloat React component library.** Built for the void.

## Tech Stack

| Layer            | Tech                               |
| ---------------- | ---------------------------------- |
| Framework        | Next.js 16 (App Router)            |
| Language         | TypeScript                         |
| Styling          | Tailwind CSS v4 + PostCSS          |
| Animation        | framer-motion, gsap                |
| Monorepo         | Turborepo v2.9+ / pnpm v10.10     |
| Fonts            | Space Grotesk (display), Inter (body), JetBrains Mono (mono) |

## Project Structure

```
adgrid-ui/
├── apps/docs/                         # Next.js documentation site
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (Navbar + fonts + globals.css)
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── globals.css           # Global Tailwind + custom styles
│   │   │   ├── components/           # Component detail pages
│   │   │   │   ├── page.tsx          # Component listing
│   │   │   │   └── [category]/[slug]/page.tsx  # Individual component page
│   │   │   └── api/registry/[slug]/route.ts    # Registry JSON API
│   │   ├── components/site/          # Docs site UI components
│   │   └── registry/index.ts         # Component registry manifest
│   └── scripts/build-registry.ts
│
├── packages/ui/                       # @adgrid-ui/ui — the component library
│   ├── src/
│   │   ├── index.ts                  # Public API barrel exports
│   │   ├── lib/utils.ts             # cn() utility (clsx + tailwind-merge)
│   │   ├── primitives/
│   │   │   ├── Button.tsx           # Core button (default/outline/secondary/ghost)
│   │   │   └── Card.tsx             # Surface card (Card, CardHeader, CardTitle, CardBody)
│   │   └── animated/
│   │       ├── MagneticButton.tsx   # Spring-physics mouse-follow button
│   │       ├── TextReveal.tsx       # Scroll-triggered word reveal
│   │       ├── FadeIn.tsx           # Viewport-triggered directional fade
│   │       ├── GlitchText.tsx       # CSS-only RGB-split glitch hover effect
│   │       └── CountUp.tsx          # Scroll-triggered number counter
│   └── styles/globals.css           # void design tokens
│
├── packages/eslint-config/
├── packages/typescript-config/
├── turbo.json
└── pnpm-workspace.yaml
```

## Routes (Pages)

| Route                                            | Purpose                                        |
| ------------------------------------------------ | ---------------------------------------------- |
| `/`                                              | Landing/home — hero + live showcases + bento grid |
| `/components`                                    | Component listing (3-column grid by category)   |
| `/components/[category]/[slug]`                  | Component detail (preview, code, install, props) |
| `/api/registry/[slug]`                           | JSON API — returns component source + metadata  |
| `/docs/getting-started`                          | **Planned** — docs page (linked in navbar)     |
| `/playground`                                    | **Planned** — playground page (linked in navbar) |

## Components (`@adgrid-ui/ui`)

### Animated
| Component        | Slug              | Description                                    |
| ---------------- | ----------------- | ---------------------------------------------- |
| MagneticButton   | magnetic-button   | Button follows cursor with spring physics       |
| TextReveal       | text-reveal       | Words fade in sequentially on scroll            |
| FadeIn           | fade-in           | Directional fade-in on viewport enter           |
| GlitchText       | glitch-text       | CSS-only RGB-split glitch on hover              |
| CountUp          | count-up          | Animated counter triggered on scroll            |

### Primitives
| Component | Slug    | Description                         |
| --------- | ------- | ----------------------------------- |
| Button    | button  | Core button (4 variants, 3 sizes)   |
| Card      | card    | Surface card with optional hover     |

## Docs Site UI Components

| Component        | Purpose                                    |
| ---------------- | ------------------------------------------ |
| Navbar           | Sticky top nav (void/ui brand, links, GitHub) |
| Sidebar          | Category/component sidebar for doc pages    |
| Footer           | Links + Connect + "built for the void"      |
| ShowcaseCard     | Home page live preview card                 |
| ComponentTabs    | Preview / Code / Install tab switcher       |
| LivePreview      | Sandpack live editor + preview              |
| CodeBlock        | Shiki syntax-highlighted code + copy        |
| CopyButton       | Clipboard copy with feedback                |
| DownloadButton   | One-click .tsx download                     |
| PropsTable       | Component props documentation table         |

## Registry Categories (Future)

| Category   | Status      |
| ---------- | ----------- |
| animated   | ✅ 5 components |
| primitives | ✅ 2 components |
| charts     | 🚧 0 components (placeholder) |
| widgets    | 🚧 0 components (placeholder) |

## Styling & Design Language

- **Dark-first**: Black background (`--void-bg: #030303`), card surfaces at `#0a0a0a`, subtle white-on-black gradients
- **Monochrome palette**: Whites / off-whites / near-blacks — no accent color
- **Typography**: Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Components use `cn()`**: `clsx` + `tailwind-merge` for conditional class merging

## Commands

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `pnpm dev`            | Start all dev servers           |
| `pnpm build`          | Build all packages              |
| `pnpm lint`           | Lint all packages               |
| `pnpm build:registry` | Generate registry JSON files    |
| `pnpm release`        | Build + publish to npm          |
