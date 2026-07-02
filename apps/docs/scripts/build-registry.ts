/**
 * build-registry.ts
 *
 * Generates shadcn-compatible static registry files into public/r/:
 *   public/r/registry.json          — catalog (all components, no file content)
 *   public/r/[slug].json            — per-component (with full file content)
 *
 * Run with:  pnpm build:registry   (from apps/docs)
 *            or: tsx scripts/build-registry.ts
 */

import { registry } from "../src/registry";
import fs from "fs";
import path from "path";

const UI_SRC = path.join(__dirname, "../../../packages/ui/src");
const OUTPUT = path.join(__dirname, "../public/r");

fs.mkdirSync(OUTPUT, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────────

function getBaseDir(packagePath: string, files?: string[]): string {
  // For multi-file components, base the relative path off the first file
  // rather than packagePath (which may be a legacy entry point in a different dir)
  const source = files && files.length > 1 ? files[0] : packagePath;
  const parts = source.split("/");
  parts.pop();
  return parts.join("/");
}

function getTargetPath(
  slug: string,
  filePath: string,
  baseDir: string,
  isMultiFile: boolean
): string {
  if (!isMultiFile) {
    return `components/ui/${path.basename(filePath)}`;
  }
  const relative = path.relative(baseDir, filePath).replace(/\\/g, "/");
  return `components/ui/${slug}/${relative}`;
}

function getFileType(filePath: string): string {
  if (filePath.includes("/hooks/") || filePath.match(/use[A-Z]/)) {
    return "registry:hook";
  }
  if (
    filePath.includes("/utils/") ||
    filePath.includes("/lib/") ||
    filePath.endsWith("utils.ts") ||
    filePath.endsWith("types.ts") ||
    filePath.endsWith("index.ts")
  ) {
    return "registry:lib";
  }
  return "registry:ui";
}

// ─── Build each component ────────────────────────────────────────────────────

const catalogItems: object[] = [];
let built = 0;
let skipped = 0;

for (const entry of registry) {
  const { slug } = entry;
  const sourceFiles = entry.files;
  const isMultiFile = sourceFiles.length > 1;
  const baseDir = getBaseDir(entry.packagePath, sourceFiles);

  const files: Array<{ path: string; content: string; type: string }> = [];
  const missing: string[] = [];

  for (const filePath of sourceFiles) {
    const absolutePath = path.join(UI_SRC, filePath);
    if (!fs.existsSync(absolutePath)) {
      missing.push(filePath);
      continue;
    }
    const content = fs.readFileSync(absolutePath, "utf-8");
    const target = getTargetPath(slug, filePath, baseDir, isMultiFile);
    files.push({ path: target, content, type: getFileType(filePath) });
  }

  // Include lib/utils.ts when needed
  const needsUtils = files.some(
    (f) =>
      f.content.includes("from '../lib/utils'") ||
      f.content.includes('from "../lib/utils"') ||
      f.content.includes("from '@/lib/utils'") ||
      f.content.includes('from "@/lib/utils"')
  );
  if (needsUtils) {
    const utilsPath = path.join(UI_SRC, "lib/utils.ts");
    if (fs.existsSync(utilsPath)) {
      files.push({
        path: "lib/utils.ts",
        content: fs.readFileSync(utilsPath, "utf-8"),
        type: "registry:lib",
      });
    }
  }

  if (missing.length > 0) {
    console.warn(`  ⚠ Missing files for "${entry.slug}":`, missing.join(", "));
    skipped++;
  }

  // Per-component JSON (with full file content)
  const componentJson = {
    name: slug,
    type: "registry:ui",
    title: entry.name,
    description: entry.description,
    ...(entry.dependencies.length > 0 && { dependencies: entry.dependencies }),
    files,
  };

  fs.writeFileSync(
    path.join(OUTPUT, `${slug}.json`),
    JSON.stringify(componentJson, null, 2)
  );
  built++;

  // Catalog entry (no file content — just metadata + file paths)
  catalogItems.push({
    name: slug,
    type: "registry:ui",
    title: entry.name,
    description: entry.description,
    ...(entry.dependencies.length > 0 && { dependencies: entry.dependencies }),
    files: sourceFiles.map((f) => ({
      path: getTargetPath(slug, f, baseDir, isMultiFile),
      type: getFileType(f),
    })),
  });
}

// ─── Write registry.json catalog ────────────────────────────────────────────

const registryJson = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "voidui",
  homepage: "https://void-ui.vercel.app",
  items: catalogItems,
};

fs.writeFileSync(
  path.join(OUTPUT, "registry.json"),
  JSON.stringify(registryJson, null, 2)
);

console.log(`\n✓ Registry built to public/r/`);
console.log(`  ${built} component${built !== 1 ? "s" : ""} written`);
if (skipped > 0) console.log(`  ${skipped} component${skipped !== 1 ? "s" : ""} had missing files`);
console.log(`  registry.json catalog written\n`);
