# Implementation: Registry CLI (shadcn-style)

## Goal
Replace npm publishing of `@adgrid-ui/ui` with a CLI tool (`npx adgrid-ui add <component>`) that copies component source code + installs only per-component dependencies — same model as shadcn/ui, radix-ui, and others.

---

## Architecture

```
        User's Terminal                          Your Infrastructure
  ┌──────────────────┐                   ┌──────────────────────────┐
  │ npx adgrid-ui    │  ─── HTTP GET ──→ │ docs.adgrid-ui.com      │
  │ add image-reveal │  ←── JSON ────── │ /api/registry/image-reveal│
  └──────────────────┘                   └──────────────────────────┘
         │                                        │
         │ 1. Fetch component source + deps       │ reads from packages/ui/src/
         │ 2. Write ./components/ui/...           │ via registry/index.ts
         │ 3. npm install framer-motion           │
         │ 4. Done                                │
```

## What already exists

### Registry Infrastructure (Done — 60% complete)

| File | What it does |
|---|---|
| `apps/docs/src/registry/index.ts` | Registry metadata for all 16 components — name, slug, category, description, `dependencies[]`, `packagePath` |
| `apps/docs/scripts/build-registry.ts` | Pre-builds `public/registry/*.json` files with source code baked in |
| `apps/docs/src/app/api/registry/[slug]/route.ts` | API endpoint that serves `{ ...entry, code }` per component |
| `apps/docs/src/components/site/DownloadButton.tsx` | Client-side download of a single `.tsx` file |

### Registry Entry Structure (Current)

```typescript
interface RegistryEntry {
  name: string;           // "Image Reveal"
  slug: string;           // "image-reveal"
  category: string;       // "animated"
  description: string;    // Human-readable
  dependencies: string[]; // ["framer-motion"]
  packagePath: string;    // "animated/ImageReveal.tsx"
}
```

---

## What needs to be built

### 1. Enhance the Registry API Response

The current API returns `{ ...entry, code }`. We need to add:

| New Field | Type | Purpose |
|---|---|---|
| `files` | `Record<string, string>` | All files the component needs (key=relative path, value=source) |
| `registryDependencies` | `string[]` | Other registry components this depends on |
| `tailwindConfig` | `object?` | Optional tailwind config additions needed |

**Enhanced response shape:**
```json
{
  "name": "Image Reveal",
  "slug": "image-reveal",
  "dependencies": ["framer-motion"],
  "code": "import { useState ...",
  "files": {
    "components/ui/image-reveal.tsx": "import { useState ...",
    "lib/utils.ts": "import { type ClassValue ..."
  },
  "registryDependencies": [],
  "tailwindConfig": {}
}
```

#### Where to modify: `api/registry/[slug]/route.ts`

- Read the component source via existing `packagePath`
- Check if source imports `../lib/utils` → include `utils.ts` from `packages/ui/src/lib/utils.ts` in `files`
- Return `files` map instead of bare `code`
- Keep `code` field for backward compat (DownloadButton)

### 2. Create the CLI Package

#### Package Structure

```
packages/cli/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts              # CLI entry: parses commands
│   ├── commands/
│   │   ├── add.ts            # `add <component>` main logic
│   │   ├── init.ts           # `init` — optional project setup
│   │   └── list.ts           # `list` — show available components
│   ├── utils/
│   │   ├── fetch-registry.ts # HTTP fetch from registry API
│   │   ├── install-deps.ts   # Detect npm/pnpm/yarn, install
│   │   ├── write-files.ts    # Write files to user's project
│   │   └── detect-pm.ts      # Detect package manager
│   └── types.ts              # Shared types
├── bin/
│   └── adgrid-ui.js          # Shebang entry point
```

#### `package.json`
```json
{
  "name": "adgrid-ui",
  "version": "0.1.0",
  "description": "CLI to add AdGrid UI components to your project",
  "bin": {
    "adgrid-ui": "./bin/adgrid-ui.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "pnpm build"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "fs-extra": "^11.0.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### CLI Entry (`src/index.ts`)

```typescript
#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";

const program = new Command()
  .name("adgrid-ui")
  .description("CLI tool for AdGrid UI components")
  .version("0.1.0");

program
  .command("add")
  .description("Add a component to your project")
  .argument("<component>", "Component slug (e.g., image-reveal)")
  .option("-o, --output <path>", "Output directory", "components/ui")
  .option("--registry <url>", "Registry URL")
  .action(addCommand);

program
  .command("init")
  .description("Initialize AdGrid UI in your project")
  .option("--registry <url>", "Registry URL")
  .action(initCommand);

program
  .command("list")
  .description("List all available components")
  .option("--registry <url>", "Registry URL")
  .action(listCommand);

program.parse();
```

#### Command: `add` (`src/commands/add.ts`)

```typescript
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { fetchComponent } from "../utils/fetch-registry";
import { installDependencies } from "../utils/install-deps";
import { detectPackageManager } from "../utils/detect-pm";

interface AddOptions {
  output?: string;
  registry?: string;
}

export async function addCommand(component: string, options: AddOptions) {
  const spinner = ora();

  // 1. Resolve registry URL
  const registryUrl =
    options.registry ?? "https://adgrid-ui.vercel.app/api/registry";

  // 2. Fetch component
  spinner.start(`Fetching ${chalk.cyan(component)}...`);
  const entry = await fetchComponent(registryUrl, component);
  spinner.succeed(`Fetched ${chalk.cyan(entry.name)}`);

  // 3. Write files
  spinner.start("Writing files...");
  
  // Determine output directory (project root or custom)
  const cwd = process.cwd();
  const outputDir = path.resolve(cwd, options.output ?? "components/ui");
  
  // Determine base directory for relative imports
  // e.g., if output is "components/ui", lib goes to "lib/"
  const srcDir = path.resolve(cwd, "src");
  const libDir = outputDir.includes("src/") 
    ? path.resolve(outputDir, "../../lib") 
    : path.resolve(cwd, "lib");

  for (const [filePath, code] of Object.entries(entry.files)) {
    const absolutePath = filePath.startsWith("lib/")
      ? path.join(libDir, filePath.replace("lib/", ""))
      : path.join(outputDir, path.basename(filePath));

    await fs.ensureDir(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, code, "utf-8");
    spinner.text = `  Wrote ${path.relative(cwd, absolutePath)}`;
  }
  spinner.succeed("Files written");

  // 4. Install dependencies
  if (entry.dependencies.length > 0) {
    spinner.start("Installing dependencies...");
    const pm = detectPackageManager(cwd);
    await installDependencies(pm, entry.dependencies);
    spinner.succeed(
      `Installed: ${chalk.dim(entry.dependencies.join(", "))}`
    );
  }

  // 5. Print success
  const componentName = entry.name.replace(/\s/g, "");
  const importPath = outputDir.includes("src/")
    ? `../${path.relative(srcDir, outputDir)}/${componentName}`
    : `@/components/ui/${componentName}`;
  
  console.log("");
  console.log(chalk.green("✓ Component added successfully!"));
  console.log("");
  console.log(chalk.dim("Import it:"));
  console.log(`  import { ${componentName} } from "${importPath}"`);
  console.log("");
}
```

#### Utility: `fetch-registry.ts`
```typescript
interface RegistryResponse {
  name: string;
  slug: string;
  dependencies: string[];
  files: Record<string, string>;
  registryDependencies: string[];
}

export async function fetchComponent(
  registryUrl: string,
  slug: string
): Promise<RegistryResponse> {
  const url = `${registryUrl.replace(/\/$/, "")}/${slug}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `Component "${slug}" not found. Run \`npx adgrid-ui list\` to see available components.`
      );
    }
    throw new Error(`Registry request failed: ${res.statusText}`);
  }

  return res.json();
}

export async function listComponents(
  registryUrl: string
): Promise<Array<{ slug: string; name: string; description: string }>> {
  const url = `${registryUrl.replace(/\/$/, "")}/index`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Registry request failed: ${res.statusText}`);
  return res.json();
}
```

#### Utility: `detect-pm.ts`
```typescript
import fs from "fs";
import path from "path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export function detectPackageManager(cwd: string): PackageManager {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  if (fs.existsSync(path.join(cwd, "bun.lock"))) return "bun";
  return "npm";
}
```

#### Utility: `install-deps.ts`
```typescript
import { execSync } from "child_process";
import type { PackageManager } from "./detect-pm";

export async function installDependencies(
  pm: PackageManager,
  deps: string[]
): Promise<void> {
  const cmdMap: Record<PackageManager, (deps: string[]) => string> = {
    npm: (d) => `npm install ${d.join(" ")}`,
    pnpm: (d) => `pnpm add ${d.join(" ")}`,
    yarn: (d) => `yarn add ${d.join(" ")}`,
    bun: (d) => `bun add ${d.join(" ")}`,
  };

  execSync(cmdMap[pm](deps), {
    stdio: "pipe",
    cwd: process.cwd(),
  });
}
```

#### Utility: `write-files.ts`
```typescript
import fs from "fs-extra";
import path from "path";

export async function writeFiles(
  files: Record<string, string>,
  outputDir: string,
  libDir: string
): Promise<string[]> {
  const written: string[] = [];

  for (const [filePath, code] of Object.entries(files)) {
    const absolutePath = filePath.startsWith("lib/")
      ? path.join(libDir, filePath.replace("lib/", ""))
      : path.join(outputDir, path.basename(filePath));

    await fs.ensureDir(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, code, "utf-8");
    written.push(absolutePath);
  }

  return written;
}
```

### 3. Enhance the Registry API

#### Modify `api/registry/[slug]/route.ts`

```typescript
import { registry } from "@/registry";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UI_SRC = path.join(process.cwd(), "../../packages/ui/src");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const entry = registry.find((c) => c.slug === slug);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Read main component source
  const componentPath = path.join(UI_SRC, entry.packagePath);
  const code = fs.readFileSync(componentPath, "utf-8");

  // Build files map — includes component + dependencies
  const files: Record<string, string> = {
    [`components/ui/${entry.slug}.tsx`]: code,
  };

  // If component imports ../lib/utils, include it
  if (code.includes("../lib/utils")) {
    const utilsPath = path.join(UI_SRC, "lib/utils.ts");
    if (fs.existsSync(utilsPath)) {
      files["lib/utils.ts"] = fs.readFileSync(utilsPath, "utf-8");
    }
  }

  return NextResponse.json({
    name: entry.name,
    slug: entry.slug,
    description: entry.description,
    dependencies: entry.dependencies,
    files,
    registryDependencies: [],
  });
}
```

#### Add `api/registry/index/route.ts`

```typescript
import { registry } from "@/registry";
import { NextResponse } from "next/server";

export async function GET() {
  const list = registry.map((entry) => ({
    name: entry.name,
    slug: entry.slug,
    category: entry.category,
    description: entry.description,
    dependencies: entry.dependencies,
  }));

  return NextResponse.json(list);
}
```

### 4. Add Monorepo Workspace Entry

#### Modify root `pnpm-workspace.yaml`
```yaml
packages:
  - "packages/*"
  - "apps/*"
```

Already includes `packages/*` — the CLI at `packages/cli/` will be auto-detected.

#### Update root `package.json` scripts
```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "release": "turbo build && pnpm --filter adgrid-ui publish --access public"
  }
}
```

### 5. Publish the CLI

```bash
# 1. Build all packages
pnpm build

# 2. Publish CLI to npm
cd packages/cli
pnpm publish --access public

# Or from root:
pnpm --filter adgrid-ui publish --access public
```

---

## Per-Component Dependency Map

| Component | `dependencies` | `registryDependencies` | Needs `utils.ts` |
|---|---|---|---|
| ImageReveal | framer-motion | — | No |
| ImageStack | framer-motion | — | No |
| ImageParallax | framer-motion | — | No |
| LivingText | framer-motion | — | Yes |
| GravityCardStack | matter-js, gsap | — | No |
| MorphingNav | framer-motion, lucide-react | — | No |
| StoryTimeline | gsap, lucide-react | — | No |
| VoidButton | framer-motion | — | Yes |
| BrushedTitaniumButton | framer-motion | — | Yes |
| LiquidGoldButton | framer-motion | — | Yes |
| GuillocheButton | framer-motion | — | Yes |
| PixelMelt | — | — | No |
| BreathingGrid | — | — | No |
| FloatingEmbers | — | — | No |
| ScanlineDrift | — | — | No |

---

## User Flow

### Installing a component
```bash
# Navigate to their project
cd my-project

# Add a component
npx adgrid-ui@latest add image-reveal

# Output:
# ✓ Fetched Image Reveal
# ✓ Wrote components/ui/image-reveal.tsx
# ✓ Installed: framer-motion
#
# ✓ Component added successfully!
#
# Import it:
#   import { ImageReveal } from "@/components/ui/ImageReveal"
```

### Listing available components
```bash
npx adgrid-ui list
# Available components:
#   animated/
#     image-reveal        Image Reveal
#     image-stack         Image Stack
#     image-parallax      Image Parallax
#     living-text         Living Text
#     gravity-card-stack  Gravity Card Stack
#     morphing-nav        Morphing Nav
#     story-timeline      Story Timeline
#   buttons/
#     void-button         Void Button
#     brushed-titanium... Brushed Titanium Button
#     liquid-gold-button  Liquid Gold Button
#     guilloche-button    Guilloche Button
#   backgrounds/
#     pixel-melt          Pixel Melt
#     breathing-grid      Breathing Grid
#     floating-embers     Floating Embers
#     scanline-drift      Scanline Drift
```

### Initializing in a project (future)
```bash
npx adgrid-ui init
# Creates components/ui/ directory
# Adds tailwind config if needed
# Sets up globals.css import reference
```

---

## File-by-File Summary

| File | Action |
|---|---|
| `packages/cli/package.json` | **Create** — CLI package definition |
| `packages/cli/tsconfig.json` | **Create** — TypeScript config for CLI |
| `packages/cli/tsup.config.ts` | **Create** — Bundle CLI to single file |
| `packages/cli/bin/adgrid-ui.js` | **Create** — Shebang entry: `#!/usr/bin/env node` + `require("../dist/index.js")` |
| `packages/cli/src/index.ts` | **Create** — Commander-based CLI entry |
| `packages/cli/src/commands/add.ts` | **Create** — Add component command |
| `packages/cli/src/commands/init.ts` | **Create** — Init command (skeleton) |
| `packages/cli/src/commands/list.ts` | **Create** — List components command |
| `packages/cli/src/utils/fetch-registry.ts` | **Create** — HTTP fetch helper |
| `packages/cli/src/utils/install-deps.ts` | **Create** — Dependency installer |
| `packages/cli/src/utils/write-files.ts` | **Create** — File writer |
| `packages/cli/src/utils/detect-pm.ts` | **Create** — Package manager detector |
| `apps/docs/src/app/api/registry/[slug]/route.ts` | **Modify** — Return enhanced response with `files` map |
| `apps/docs/src/app/api/registry/index/route.ts` | **Create** — List all components endpoint |
| `apps/docs/src/registry/index.ts` | **No change** — Already has correct structure |

---

## Verification Checklist

- [ ] `npx adgrid-ui list` shows all 16 components grouped by category
- [ ] `npx adgrid-ui add image-reveal` fetches, writes `components/ui/image-reveal.tsx`, installs `framer-motion`
- [ ] `npx adgrid-ui add void-button` also writes `lib/utils.ts` alongside the component
- [ ] Components without deps (PixelMelt, etc.) skip the install step entirely
- [ ] CLI detects pnpm vs npm vs yarn vs bun correctly
- [ ] Custom `--output ./src/components/my-ui` redirects files correctly
- [ ] Custom `--registry https://my-custom-host.com/api/registry` works
- [ ] `api/registry/[slug]` returns enhanced response (backward-compatible `code` + new `files`)
- [ ] `api/registry/index` returns the full component list
- [ ] Existing `DownloadButton.tsx` still works (backward compat)
- [ ] CLI published to npm and installable via `npx adgrid-ui@latest add <component>`
