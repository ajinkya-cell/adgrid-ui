import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

export async function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const html = await codeToHtml(code, {
    lang,
    theme: "github-dark-dimmed",
  });

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
      <div
        className="rounded-sm overflow-auto text-sm [&>pre]:p-5 [&>pre]:overflow-auto [&>pre]:bg-[#0d1117]!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}