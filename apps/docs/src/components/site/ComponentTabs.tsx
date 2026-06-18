"use client";
import { useState } from "react";
import { LivePreview } from "./LivePreview";
import { CopyButton } from "./CopyButton";
import type { RegistryEntry } from "@/registry";
import { useComponentPage } from "./ComponentPageLayout";

type Tab = "preview" | "code" | "install";

interface Props {
  rawCode: string;
  npmInstall: string;
  importCode: string;
  entry: RegistryEntry;
  additionalFiles?: Record<string, string>;
  appCode?: string;
  tsxHtml?: string;
  bashHtml?: string;
}

function HtmlBlock({ html, code }: { html: string; code: string }) {
  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
      <div
        className="overflow-auto text-sm [&>pre]:p-5 [&>pre]:overflow-auto [&>pre]:bg-[#0d1117]!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function ComponentTabs({ rawCode, npmInstall, importCode, entry, additionalFiles, appCode, tsxHtml, bashHtml }: Props) {
  const [tab, setTab] = useState<Tab>("preview");
  const { isWide } = useComponentPage();

  return (
    <div id="preview" className="border border-border-hairline overflow-hidden">
      <div className="flex items-center border-b border-border-hairline bg-surface-charcoal px-4">
        {(["preview", "code", "install"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-xs font-mono transition-colors uppercase tracking-wider select-none cursor-pointer ${
              tab === t
                ? "text-white border-b-2 border-white"
                : "text-text-muted hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "preview" && (
        <LivePreview
          code={rawCode}
          componentName={entry.name.replace(/\s/g, "")}
          dependencies={entry.dependencies}
          additionalFiles={additionalFiles}
          appCode={appCode}
          showCode={false}
          isWide={isWide}
        />
      )}

      {tab === "code" && (
        <LivePreview
          code={rawCode}
          componentName={entry.name.replace(/\s/g, "")}
          dependencies={entry.dependencies}
          additionalFiles={additionalFiles}
          appCode={appCode}
          showCode={true}
          isWide={isWide}
        />
      )}

      {tab === "install" && bashHtml && tsxHtml && (
        <div className="p-6 space-y-6 bg-surface-charcoal">
          <div>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3">npm package</p>
            <HtmlBlock html={bashHtml} code={npmInstall} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3">then import</p>
            <HtmlBlock html={tsxHtml} code={importCode} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3">or copy-paste</p>
            <HtmlBlock html={tsxHtml} code={rawCode} />
          </div>
        </div>
      )}
    </div>
  );
}
