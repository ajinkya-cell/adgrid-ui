import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { registry } from "@/registry";
import { PresentationLayout } from "@/components/presentation/PresentationLayout";
import type { PresentationSourceFile } from "@/components/presentation/types";

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

import { codeToHtml } from "shiki";

export default async function PresentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const resolvedParams = await params;
  if (!resolvedParams || !resolvedParams.category || !resolvedParams.slug) {
    return null;
  }
  const { category, slug } = resolvedParams;
  const entry = registry.find((component) => component.slug === slug && component.category === category);
  if (!entry) notFound();

  const sourceFiles = readSourceFiles(entry);
  
  // Highlight all source files on the server using Shiki
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
  return registry.map((component) => ({
    category: component.category,
    slug: component.slug,
  }));
}

