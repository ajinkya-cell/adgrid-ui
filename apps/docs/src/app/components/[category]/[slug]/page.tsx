import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { codeToHtml } from "shiki";
import { registry } from "@/registry";
import { ComponentTabs } from "@/components/site/ComponentTabs";
import { DownloadButton } from "@/components/site/DownloadButton";
import { Sidebar } from "@/components/site/Sidebar";
import { PropsTable } from "@/components/site/PropsTable";

// extract props from TSDoc comments in source — lightweight approach
function extractProps(code: string) {
  const props: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
    required: boolean;
  }> = [];
  const regex = /\/\*\*\s*(.*?)\s*\*\/\s*\n\s+(\w+)\??\s*:\s*([^;]+);/gs;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const [, description, name, type] = match;
    props.push({
      name,
      type: type.trim(),
      description: description.trim(),
      required: !match[0].includes("?"),
    });
  }
  return props;
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const entry = registry.find(
    (c) => c.slug === slug && c.category === category
  );
  if (!entry) notFound();

  const srcDir = path.join(process.cwd(), "../../packages/ui/src");

  const rawCode = fs.readFileSync(
    path.join(srcDir, entry.packagePath),
    "utf-8"
  );

  const utilsPath = path.join(srcDir, "lib/utils.ts");
  const utilsCode = fs.existsSync(utilsPath)
    ? fs.readFileSync(utilsPath, "utf-8")
    : null;

  const additionalFiles: Record<string, string> = {};
  if (utilsCode && rawCode.includes("../lib/utils")) {
    additionalFiles["/lib/utils.ts"] = utilsCode;
  }

  let appCode: string | undefined;
  const componentName = entry.name.replace(/\s/g, "");
  if (entry.slug === "text-reveal") {
    appCode = `
import { TextReveal } from "./TextReveal";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
    }}>
      <TextReveal text="This is a text reveal animation" />
    </div>
  );
}
`.trim();
  }

  const props = extractProps(rawCode);

  const npmInstall = `npm install @adgrid-ui/ui\n# or\npnpm add @adgrid-ui/ui`;
  const importCode = `import { ${componentName} } from "@adgrid-ui/ui";`;

  const [tsxHtml, bashHtml] = await Promise.all([
    codeToHtml(rawCode, { lang: "tsx", theme: "github-dark-dimmed" }),
    codeToHtml(npmInstall, { lang: "bash", theme: "github-dark-dimmed" }),
  ]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-10 py-12 max-w-4xl">
        <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-3">
          {entry.category}
        </p>
        <div className="flex items-start justify-between mb-3">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {entry.name}
          </h1>
          <DownloadButton slug={entry.slug} name={entry.name.replace(/\s/g, "")} />
        </div>
        <p className="text-white/40 mb-10">{entry.description}</p>

        {/* tabs */}
        <ComponentTabs
          rawCode={rawCode}
          npmInstall={npmInstall}
          importCode={importCode}
          entry={entry}
          additionalFiles={additionalFiles}
          appCode={appCode}
          tsxHtml={tsxHtml}
          bashHtml={bashHtml}
        />

        {/* props */}
        {props.length > 0 && (
          <div className="mt-16">
            <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-6">
              // props
            </p>
            <PropsTable props={props} />
          </div>
        )}
      </main>
    </div>
  );
}

export function generateStaticParams() {
  return registry.map((c) => ({ category: c.category, slug: c.slug }));
}