# Project Context: `adgrid-ui` Monorepo

> **Monorepo**: `adgrid-ui-monorepo`  
> **Package Manager**: `pnpm@10.10.0` (with Workspaces)  
> **Build Orchestration**: Turborepo  
> **Node Engine**: `>=18`  

---

## 1. Monorepo Overview

`adgrid-ui` (also distributed as `void-ui`) is a motion-focused, dark-first UI ecosystem. It provides luxury skeuomorphic components, physics simulations (Matter.js), GPU shader backgrounds (WebGL), tactile audio feedback, and an interactive studio platform.

The project is architected as a modular monorepo divided into dedicated packages and applications.

---

## 2. Dedicated Section Contexts

Each section of the repository maintains its own exhaustive, specialized `context.md` file:

| Section / Subsystem | Path | Description & Deep-Dive |
| :--- | :--- | :--- |
| **UI Component Library** | [`packages/ui/context.md`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/context.md) | `@adgrid-ui/ui` library — 42 exported components across Animated, Luxury Buttons, Backgrounds, Primitives, and Widgets. Covers physics, WebGL, build pipeline, and styling conventions. |
| **Docs & Showcase App** | [`apps/docs/context.md`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/context.md) | Next.js 16 App Router application — Home landing, Gallery (`/gallery`), Presentation Studio (`/present/[category]/[slug]`), standalone sandboxes (`/matrix-demo`, `/hero-demo`), and distribution endpoints. |
| **Component Registry & Runtime** | [`apps/docs/src/registry/context.md`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/registry/context.md) | Central single source of truth (`registry/index.ts`) for component schemas, prop definitions (`PropDefinition`), dynamic Props Tweaker controls, and shadcn CLI schema generation. |
| **Void UI CLI** | [`packages/cli/context.md`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/cli/context.md) | `void-ui` CLI package — `add`, `list`, and `init` commands for downloading component source code into user codebases with automated dependency installation. |

---

## 3. Workspace Layout & Package Graph

```
adgrid-ui/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── packages/
│   ├── ui/                    # @adgrid-ui/ui (Core component library)
│   ├── cli/                   # void-ui (Developer CLI tool)
│   ├── typescript-config/     # Shared tsconfig base, nextjs, react-library
│   ├── eslint-config/         # Shared ESLint configurations
│   └── public/                # Shared static assets
└── apps/
    └── docs/                  # Next.js showcase, gallery, presentation studio & API
```

### Dependency Flow
* `apps/docs` depends on `packages/ui` (via pnpm workspace reference `workspace:*`).
* `packages/cli` interacts with `apps/docs` distribution API (`/r/[name].json` & `/r/registry.json`) to fetch and copy component source files.
* Both `apps/docs` and `packages/ui` share TypeScript and ESLint standards from `@repo/typescript-config` and `@repo/eslint-config`.

---

## 4. Root Monorepo Scripts

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts development servers across apps and packages via Turborepo. |
| `pnpm build` | Compiles `@adgrid-ui/ui` with `tsup`, builds the CLI, and runs `next build` on docs. |
| `pnpm lint` | Runs ESLint across all workspaces. |
| `pnpm build:registry` | Runs the registry pre-compilation script in `apps/docs`. |
| `pnpm release` | Builds monorepo and publishes `void-ui` package to npm. |

---

## 5. Development Guidelines

1. **New Components**: Implement under `packages/ui/src/animated/` or `packages/ui/src/backgrounds/`, export in `packages/ui/src/index.ts`, and register in `apps/docs/src/registry/index.ts`.
2. **Component Customization**: Always provide typed `propDefs` in the registry entry to automatically enable live editing in the `/present` studio's Props Tweaker panel.
3. **Distribution**: Keep dependencies in `registry/index.ts` synchronized with any new external packages used by the component.
