import { registry } from "@/registry";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UI_SRC = path.join(process.cwd(), "../../packages/ui/src");

// Determine the base directory for relative path calculations.
// For multi-file components use the first file's directory, not packagePath
// (packagePath may be a legacy entry in a different directory, e.g. dot-matrix).
function getBaseDir(packagePath: string, files: string[]): string {
  const source = files.length > 1 ? files[0] : packagePath;
  const parts = source.split("/");
  parts.pop();
  return parts.join("/");
}

// Compute the target path where a file lands in the user's project
// Single-file components → components/ui/FileName.tsx (flat)
// Multi-file components  → components/ui/[slug]/relative/path.tsx
function buildTargetPath(
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
  if (filePath.includes("/hooks/") || /use[A-Z]/.test(filePath)) {
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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  const rawName = params["name"] ?? "";
  // Strip .json suffix so both /r/dot-matrix and /r/dot-matrix.json work
  const slug = rawName.replace(/\.json$/, "");

  const entry = registry.find((c) => c.slug === slug);
  if (!entry) {
    return NextResponse.json({ error: `Component "${slug}" not found.` }, { status: 404 });
  }

  const sourceFiles = entry.files;
  const isMultiFile = sourceFiles.length > 1;
  const baseDir = getBaseDir(entry.packagePath, sourceFiles);

  const files: Array<{ path: string; content: string; type: string }> = [];
  const missingFiles: string[] = [];

  for (const filePath of sourceFiles) {
    const absolutePath = path.join(UI_SRC, filePath);
    if (!fs.existsSync(absolutePath)) {
      missingFiles.push(filePath);
      continue;
    }
    const content = fs.readFileSync(absolutePath, "utf-8");
    const target = buildTargetPath(slug, filePath, baseDir, isMultiFile);

    files.push({
      path: target,
      content,
      type: getFileType(filePath),
    });
  }

  // Include lib/utils.ts if any file imports from it
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

  if (missingFiles.length > 0) {
    console.warn(`[registry] Missing files for "${slug}":`, missingFiles);
  }

  return NextResponse.json({
    name: entry.slug,
    type: "registry:ui",
    title: entry.name,
    description: entry.description,
    ...(entry.dependencies.length > 0 && { dependencies: entry.dependencies }),
    files,
  });
}
