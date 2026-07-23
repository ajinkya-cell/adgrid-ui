import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { registry } from "@/registry";
import { PresentationLayout } from "@/components/presentation/PresentationLayout";
import type { PresentationSourceFile } from "@/components/presentation/types";
import { codeToHtml } from "shiki";

function readSourceFiles(entry: (typeof registry)[number]) {
  const srcDir = path.join(process.cwd(), "../../packages/ui/src");
  const files = Array.from(new Set([entry.packagePath, ...entry.files]));

  return files.reduce<PresentationSourceFile[]>((sourceFiles, file) => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) return sourceFiles;
    sourceFiles.push({ path: file, code: fs.readFileSync(filePath, "utf-8") });
    return sourceFiles;
  }, []);
}

export default async function PresentCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  if (!resolvedParams || !resolvedParams.slug || resolvedParams.slug.length === 0) {
    notFound();
  }

  const slugParts = resolvedParams.slug;
  let entry;

  if (slugParts.length >= 2) {
    const category = slugParts[0];
    const itemSlug = slugParts[slugParts.length - 1];
    entry =
      registry.find((c) => c.slug === itemSlug && c.category === category) ||
      registry.find((c) => c.slug === itemSlug);
  } else {
    const itemSlug = slugParts[0];
    entry = registry.find((c) => c.slug === itemSlug);
  }

  if (!entry) notFound();

  const sourceFiles = readSourceFiles(entry);

  const highlightedFiles = await Promise.all(
    sourceFiles.map(async (file) => {
      const html = await codeToHtml(file.code, {
        lang: "tsx",
        theme: "github-dark-dimmed",
      });
      return {
        ...file,
        html,
      };
    })
  );

  const rawCode = highlightedFiles.find((file) => file.path === entry.packagePath)?.code ?? "";

  return <PresentationLayout payload={{ entry, rawCode, sourceFiles: highlightedFiles }} />;
}

export function generateStaticParams() {
  const params: { slug: string[] }[] = [];
  for (const component of registry) {
    // 2-segment path: /present/category/slug
    params.push({ slug: [component.category, component.slug] });
    // 1-segment path: /present/slug
    params.push({ slug: [component.slug] });
  }
  return params;
}
