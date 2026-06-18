import { registry } from "@/registry";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const entry = registry.find((c) => c.slug === slug);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "../../packages/ui/src",
    entry.packagePath
  );

  const code = fs.readFileSync(filePath, "utf-8");

  return NextResponse.json({ ...entry, code });
}