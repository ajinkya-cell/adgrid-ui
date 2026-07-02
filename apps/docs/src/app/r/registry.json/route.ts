import { registry } from "@/registry";
import { NextResponse } from "next/server";

export async function GET() {
  const items = registry.map((entry) => ({
    name: entry.slug,
    type: "registry:ui",
    title: entry.name,
    description: entry.description,
    ...(entry.dependencies.length > 0 && { dependencies: entry.dependencies }),
    files: entry.files.map((f) => ({
      path: f,
      type: "registry:ui",
    })),
  }));

  return NextResponse.json({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "voidui",
    homepage: "https://void-ui.vercel.app",
    items,
  });
}
