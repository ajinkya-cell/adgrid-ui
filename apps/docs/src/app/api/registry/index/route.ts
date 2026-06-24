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
