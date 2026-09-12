# Void UI / Adgrid UI — Master Roadmap & Task Tracker (`todo.md`)

> **Last Updated**: September 2026  
> **Repository**: `adgrid-ui-monorepo`  
> **Status**: Active Development  

---

## 🏷️ Classification Legend

| Badge | Meaning | Description |
| :--- | :--- | :--- |
| 🚨 `[EMERGENCY]` | Critical / Blocker | Breaks build, broken runtime, broken imports, or blocks users. Must fix first. |
| 🔴 `[HIGH]` | High Priority | Core functionality missing, placeholder commands, or major DX gaps. |
| 🟡 `[MEDIUM]` | Medium Priority | Feature completeness, props tweaker expansion, component docs, and QoL improvements. |
| 🟢 `[LOW]` | Low / Polish | Visual polish, edge case enhancements, optional animations, and cosmetics. |

| Type Tag | Category |
| :--- | :--- |
| 🐛 `[BUG]` | Defect, broken path, or incorrect behavior |
| 🚀 `[FEATURE]` | New component, page, or capability |
| 🛠️ `[TOOLING]` | CLI, build system, CI/CD, and dependency management |
| 📚 `[DOCS]` | MDX guides, API references, and documentation |
| ⚡ `[PERF]` | Performance optimization, WebGL throttling, and bundle size |
| ♿ `[A11Y]` | Accessibility, ARIA semantics, and keyboard navigation |
| 🧪 `[TESTING]` | Unit tests, integration tests, and visual regression tests |
| 🎨 `[DESIGN]` | Visual refinement, skeuomorphism, and theme tokens |

---

## 🎯 Section 1: "What We Should Do Now" (Immediate Sprint Focus)

These are the immediate, actionable high-impact tasks derived from our current codebase inspection:

- [ ] 🚨 `[BUG]` `[EMERGENCY]` **Fix hardcoded relative imports in `PresentationRenderer.tsx`**  
  * **Location**: [`apps/docs/src/components/presentation/PresentationRenderer.tsx#L72-L78`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/components/presentation/PresentationRenderer.tsx#L72-L78)  
  * **Issue**: `Cards` and `ScrollPath*` components are imported using deep relative paths (`../../../../../packages/ui/src/...`) instead of the workspace package `@adgrid-ui/ui`.  
  * **Action**: Change imports to directly import from `@adgrid-ui/ui` since they are already exported in [`packages/ui/src/index.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/index.ts).

- [ ] 🔴 `[TOOLING]` `[HIGH]` **Remove redundant duplicate lockfile**  
  * **Location**: `apps/docs/package-lock.json`  
  * **Issue**: The monorepo uses `pnpm@10.10.0` with `pnpm-lock.yaml` at root. The presence of `package-lock.json` in `apps/docs` causes confusion and potential dependency mismatch.  
  * **Action**: Delete `apps/docs/package-lock.json` and ensure all dependencies resolve through root `pnpm install`.

- [ ] 🔴 `[FEATURE]` `[HIGH]` **Implement full `void-ui init` command in CLI**  
  * **Location**: [`packages/cli/src/commands/init.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/cli/src/commands/init.ts)  
  * **Issue**: `void-ui init` is currently a placeholder that only logs a console string.  
  * **Action**: Implement project initialization logic:
    1. Detect project type (Next.js, Vite, Remix, Create React App).
    2. Create `components.json` with path aliases (`@/components/ui`, `@/lib/utils`).
    3. Generate or ensure `lib/utils.ts` exists with `cn()` utility.
    4. Validate Tailwind CSS configuration.

- [ ] 🟡 `[DOCS]` `[MEDIUM]` **Complete `propDefs` for all components in registry**  
  * **Location**: [`apps/docs/src/registry/index.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/registry/index.ts)  
  * **Issue**: ~20 components lack `propDefs` objects in the registry, leaving the Props Tweaker panel empty in `/present/[category]/[slug]`.  
  * **Action**: Add strongly typed `propDefs` (with `name`, `type`, `default`, `min`, `max`, `step`, `options`, `description`) for components such as `Tooltip`, `Stepper`, `Timeline`, `Switch`, `OTPInput`, `DeveloperIdCard`, `GithubHeatmap`, `BevelAccordion`, `BevelAlertDialog`, `StickerCard`, `Datepicker`, `Marquee2`, `NavBar1`, and backgrounds.

- [ ] 🟡 `[FEATURE]` `[MEDIUM]` **Add Next.js App Router Error Boundary & Skeleton Loaders**  
  * **Location**: `apps/docs/src/app/`  
  * **Issue**: `apps/docs` has `not-found.tsx`, but lacks `error.tsx` (global error boundary) and `loading.tsx` (route transition skeletons).  
  * **Action**: Create `apps/docs/src/app/error.tsx` and `loading.tsx` with dark skeuomorphic styling and retry actions.

---

## 📦 Section 2: `@adgrid-ui/ui` Component Library

### Components & Features
- [ ] 🔴 `[FEATURE]` `[HIGH]` **Build `Charts` Category Components**  
  * **Category**: `"charts"` (currently defined in `ComponentCategory` type union but has 0 components).  
  * **Action**: Create high-fidelity dark-first chart primitives:
    * `FinancialCandlestick` (WebGL/Canvas interactive candlestick chart).
    * `Sparkline` (Minimal SVG inline sparkline with animated stroke glow).
    * `RadarChart` (Polygonal metric radar chart with hover tooltips).
    * `AreaStreamChart` (Smooth gradient area chart for real-time telemetry).
- [ ] 🟡 `[FEATURE]` `[MEDIUM]` **Register remaining unlisted UI components**  
  * **Files**: `packages/ui/src/animated/LuxuryButtons.tsx`, `packages/ui/src/animated/FlickeringGrid.tsx`, `packages/ui/src/animated/DotPattern.tsx`.  
  * **Action**: Ensure all standalone base components are registered in `apps/docs/src/registry/index.ts` alongside their playground variants.
- [ ] 🟢 `[FEATURE]` `[LOW]` **Sound FX Manager for Tactile Components**  
  * **Components**: `MechanicalTimer`, `LaserVaultPassword`, `Switch`, `WeaponWheel`, `AnisotropicKnob`.  
  * **Action**: Build a unified Web Audio API sound synthesizer module in `packages/ui/src/lib/sound.ts` with volume controls, mute toggles, and pitch-shifted mechanical clicks.

### Quality, Accessibility & Performance
- [ ] 🔴 `[A11Y]` `[HIGH]` **Full Accessibility & Keyboard Navigation Audit**  
  * **Action**: Ensure ARIA attributes, roles, and focus traps are implemented:
    * `BevelAlertDialog`: `role="alertdialog"`, `aria-modal="true"`, focus trapping with Escape key dismissal.
    * `Switch`: `role="switch"`, `aria-checked`, Space/Enter toggle support.
    * `AnisotropicKnob`: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, ArrowUp/ArrowDown control.
    * `CommandPalette`: Full keyboard navigation (ArrowUp, ArrowDown, Enter, Esc).
- [ ] ⚡ `[PERF]` `[MEDIUM]` **WebGL Canvas Lifecycle & Memory Cleanup Audit**  
  * **Components**: `LuminaWave`, `SpotlightGrid`, `PixelMelt`, `MatrixRain`, `Globe`.  
  * **Action**: Verify that `cancelAnimationFrame`, WebGL context destruction, and mouse listeners are cleanly unbound on React component unmount to prevent memory leaks.
- [ ] 🧪 `[TESTING]` `[MEDIUM]` **Scaffold Component Testing Suite**  
  * **Action**: Setup Vitest and React Testing Library in `packages/ui` to verify component rendering, prop changes, and callback events.

---

## 💻 Section 3: `void-ui` CLI (`packages/cli`)

- [ ] 🔴 `[FEATURE]` `[HIGH]` **Multi-Component Batch Installation**  
  * **Usage**: `npx void-ui add button card slider`  
  * **Action**: Update `packages/cli/src/commands/add.ts` to accept multiple arguments, resolving all manifests and batching dependency installation into a single package manager execution.
- [ ] 🔴 `[FEATURE]` `[HIGH]` **Interactive CLI File Conflict Resolution**  
  * **Action**: If a file already exists at `components/ui/<component>.tsx`, prompt the user via `@inquirer/prompts`:
    * `Overwrite` (replace existing file)
    * `Skip` (keep existing file)
    * `Rename` (save as `<component>.new.tsx`)
- [ ] 🟡 `[TOOLING]` `[MEDIUM]` **Configurable Registry URL & Offline Fallback**  
  * **Action**: Allow overriding registry URL via `--registry <url>` or environment variable `VOID_UI_REGISTRY_URL`. Support reading local registry manifest during development.
- [ ] 🟢 `[TOOLING]` `[LOW]` **CLI Self-Update Check**  
  * **Action**: Integrate `update-notifier` to alert developers when a newer version of `void-ui` CLI is published to npm.

---

## 🌐 Section 4: `apps/docs` Showcase & Studio Platform

### Documentation & MDX Pages
- [ ] 🔴 `[DOCS]` `[HIGH]` **MDX Documentation Pages for All Components**  
  * **Location**: `apps/docs/src/app/docs/[...slug]/`  
  * **Action**: Create structured documentation pages for every component featuring:
    * Interactive live preview card
    * Installation command (`pnpm add ...` or `npx void-ui add ...`)
    * Copyable code snippet
    * Complete Props Table automatically generated from `propDefs`
    * Usage examples & variant demos.
- [ ] 🟡 `[FEATURE]` `[MEDIUM]` **Global Search Modal (Cmd+K / Ctrl+K)**  
  * **Action**: Implement a site-wide search palette in `apps/docs` allowing instant navigation to any component, guide, or sandbox demo with fuzzy search.

### Presentation Studio Enhancements (`/present/[category]/[slug]`)
- [ ] 🟡 `[FEATURE]` `[MEDIUM]` **One-Click Online Sandbox Integration**  
  * **Action**: Add "Open in StackBlitz" / "Open in CodeSandbox" buttons in the presentation header, generating dynamic sandbox projects with all dependencies pre-configured.
- [ ] 🟡 `[DESIGN]` `[MEDIUM]` **Mobile & Tablet Responsive Dock / Inspector**  
  * **Action**: Implement collapsible bottom drawer and touch-friendly controls for the Props Tweaker on mobile viewports.
- [ ] ⚡ `[PERF]` `[HIGH]` **Gallery Viewport Animation Throttling**  
  * **Location**: `apps/docs/src/app/gallery/page.tsx`  
  * **Action**: Use `IntersectionObserver` to pause WebGL rendering and Framer Motion loops for gallery cards that are scrolled offscreen, drastically reducing GPU/CPU load.

---

## 📑 Section 5: Component Registry Subsystem (`apps/docs/src/registry`)

- [ ] 🟡 `[FEATURE]` `[MEDIUM]` **Structured Variants Preset Catalog**  
  * **Location**: `apps/docs/src/registry/index.ts`  
  * **Action**: Populate the `variants` field in `RegistryEntry` for all components (e.g. `LiquidGoldButton` -> `["molten-gold", "emerald-matrix", "cyber-cyan"]`), allowing users to click preset chips in the Presentation Studio.
- [ ] 🟡 `[TOOLING]` `[MEDIUM]` **Automated Registry Verification Script**  
  * **Location**: `apps/docs/scripts/build-registry.ts`  
  * **Action**: Validate that every file listed in `entry.files` actually exists on disk in `packages/ui/src/` and report any broken paths during `pnpm build:registry`.
- [ ] 🟢 `[FEATURE]` `[LOW]` **CSS / Asset Bundle Export in `/r/[name].json`**  
  * **Action**: Include custom CSS classes and animations in the shadcn JSON payload so consumer projects receive required Tailwind animation keyframes automatically.

---

## ⚙️ Section 6: Monorepo Infrastructure & CI/CD

- [ ] 🔴 `[TOOLING]` `[HIGH]` **GitHub Actions CI Workflow**  
  * **File**: `.github/workflows/ci.yml`  
  * **Pipeline**:
    1. Checkout repository & setup pnpm
    2. Install dependencies (`pnpm install --frozen-lockfile`)
    3. Typecheck all packages (`pnpm --filter "*" typecheck`)
    4. Lint all workspaces (`pnpm lint`)
    5. Build all packages & apps (`pnpm build`)
- [ ] 🟡 `[TOOLING]` `[MEDIUM]` **Automated Versioning with Changesets**  
  * **Action**: Install `@changesets/cli` at root to manage version bumps, changelog generation, and automated npm publishing for `@adgrid-ui/ui` and `void-ui`.
- [ ] 🟢 `[TOOLING]` `[LOW]` **Bundle Analyzer Plugin**  
  * **Action**: Add `@next/bundle-analyzer` in `apps/docs` and size reporting in `packages/ui` `tsup.config.ts`.

---

## 📊 Summary Statistics & Priority Matrix

| Urgency | Count | Key Immediate Items |
| :--- | :--- | :--- |
| 🚨 **Emergency** | 1 | Fix raw relative imports in `PresentationRenderer.tsx` |
| 🔴 **High** | 7 | Remove duplicate lockfile, implement `void-ui init`, add Charts category, MDX component docs, A11y audit, Multi-component CLI add, GitHub Actions CI |
| 🟡 **Medium** | 9 | Complete `propDefs`, App Router error/loading states, WebGL memory cleanup, Component testing suite, StackBlitz export, Gallery performance throttling, Registry variants, Automated registry validation, Changesets |
| 🟢 **Low** | 4 | Sound FX manager, CLI self-update check, CSS payload bundling in `/r/*`, Bundle analyzer |
