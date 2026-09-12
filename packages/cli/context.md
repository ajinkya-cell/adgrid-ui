# Package Context: `packages/cli` (`void-ui` CLI)

> **Location**: `packages/cli/`  
> **Package Name**: `void-ui`  
> **Version**: `0.1.0`  
> **Role**: Command-Line Interface to add Void UI components directly into React/Next.js projects  

---

## 1. Overview & Purpose

`void-ui` is a developer CLI tool designed to make component integration effortless, following the popular copy-paste distribution model (similar to shadcn/ui). Instead of forcing monolithic node_modules dependencies, `void-ui` allows developers to download pure TypeScript component code directly into their `components/ui/` folder, with automated dependency installation and path resolution.

---

## 2. Package Architecture & Tooling

### Package Configuration (`package.json`)
* **Binary Bin**: `"./bin/void-ui.js"` (launches the bundled executable in `dist/index.js`).
* **Bundle Engine**: `tsup` targeting ESM Node execution.
* **Dependencies**:
  * `commander` (CLI command routing & options parser)
  * `chalk` (Terminal color styling)
  * `ora` (Animated terminal loading spinners)
  * `fs-extra` (Filesystem operations and directory creation)

---

## 3. Directory Layout

```
packages/cli/
├── bin/
│   └── void-ui.js            # Node executable entry wrapper with #!/usr/bin/env node
├── package.json
├── tsup.config.ts            # Bundles src/index.ts -> dist/index.js
├── tsconfig.json
└── src/
    ├── index.ts              # Commander setup & entrypoint
    ├── commands/
    │   ├── add.ts            # Component fetcher, file writer & dependency installer
    │   ├── list.ts           # Registry catalog viewer
    │   └── init.ts           # Project initialization placeholder
    └── utils/
        ├── detect-pm.ts      # Package manager detection (pnpm, npm, yarn, bun)
        ├── fetch-registry.ts # HTTP client to query docs registry endpoints
        ├── install-deps.ts   # Runs detected package manager install command
        └── write-files.ts    # Writes source files and utility helpers locally
```

---

## 4. CLI Commands & Workflows

### A. `void-ui add <component>`
Adds one or more Void UI components into the user's local project.
1. **Fetch**: Queries the registry endpoint (`https://void-ui.vercel.app/api/registry` or custom via `--registry`) for the component manifest and source files.
2. **Path Resolution**: Determines whether the project uses `src/` directory conventions or root folders, defaulting target output to `components/ui/`.
3. **Write Files**: Copies the component files and generates `lib/utils.ts` (`cn()` helper) if missing.
4. **Install Dependencies**: Detects the active package manager (`pnpm`, `npm`, `yarn`, or `bun`) by checking for lockfiles and runs the corresponding install command for peer packages (e.g. `framer-motion`, `matter-js`, `gsap`).
5. **Import Instructions**: Outputs ready-to-use TypeScript import code to the terminal.

### B. `void-ui list`
Queries the registry index endpoint and outputs a formatted list of all available components with their slugs, categories, and descriptions.

### C. `void-ui init`
Sets up project foundations (`components.json`, Tailwind config, utils helper). *(Currently a placeholder ready for expansion)*.

---

## 5. Development & Publishing

```bash
# Build CLI binary
pnpm --filter void-ui build

# Test CLI locally
node ./packages/cli/bin/void-ui.js list
node ./packages/cli/bin/void-ui.js add gravity-card-stack

# Publish to npm
pnpm --filter void-ui publish --access public
```
