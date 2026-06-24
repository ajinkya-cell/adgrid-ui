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
  if (!fs.existsSync(componentPath)) {
    return NextResponse.json({ error: "Component file not found" }, { status: 500 });
  }
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
    code,
    files,
    registryDependencies: [],
  });
}