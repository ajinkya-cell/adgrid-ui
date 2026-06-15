"use client";
import { useState } from "react";
import { LivePreview } from "./LivePreview";
import { CopyButton } from "./CopyButton";
import type { RegistryEntry } from "@/registry";

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
        className="rounded-sm overflow-auto text-sm [&>pre]:p-5 [&>pre]:overflow-auto [&>pre]:bg-[#0d1117]!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function ComponentTabs({ rawCode, npmInstall, importCode, entry, additionalFiles, appCode, tsxHtml, bashHtml }: Props) {
  const [tab, setTab] = useState<Tab>("preview");

  return (
    <div className="border border-white/10 rounded-sm overflow-hidden">
      <div className="flex items-center border-b border-white/10 bg-[#0a0a0a] px-4">
        {(["preview", "code", "install"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-xs font-mono transition-colors ${
              tab === t
                ? "text-white border-b border-white"
                : "text-white/30 hover:text-white/60"
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
        />
      )}

      {tab === "code" && tsxHtml && (
        <div className="bg-[#0d1117]">
          <HtmlBlock html={tsxHtml} code={rawCode} />
        </div>
      )}

      {tab === "install" && bashHtml && tsxHtml && (
        <div className="p-6 space-y-6 bg-[#0a0a0a]">
          <div>
            <p className="text-xs font-mono text-white/25 mb-3">npm package</p>
            <HtmlBlock html={bashHtml} code={npmInstall} />
          </div>
          <div>
            <p className="text-xs font-mono text-white/25 mb-3">then import</p>
            <HtmlBlock html={tsxHtml} code={importCode} />
          </div>
          <div>
            <p className="text-xs font-mono text-white/25 mb-3">or copy-paste</p>
            <HtmlBlock html={tsxHtml} code={rawCode} />
          </div>
        </div>
      )}
    </div>
  );
}