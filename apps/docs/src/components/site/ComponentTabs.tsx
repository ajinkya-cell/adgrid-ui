"use client";
import { useState } from "react";
import { LivePreview } from "./LivePreview";
import { CopyButton } from "./CopyButton";
import type { RegistryEntry } from "@/registry";
import { useComponentPage } from "./ComponentPageLayout";
import type { PropDefinition } from "./PropsEditor";

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
  setupHtml?: string;
  setupCommand?: string;
  editableProps?: PropDefinition[];
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

export function ComponentTabs({
  rawCode,
  npmInstall,
  importCode,
  entry,
  additionalFiles,
  appCode,
  tsxHtml,
  bashHtml,
  setupHtml,
  setupCommand,
  editableProps,
}: Props) {
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
          editableProps={editableProps}
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
          editableProps={editableProps}
        />
      )}

      {tab === "install" && bashHtml && tsxHtml && (
        <div className="p-6 space-y-6 bg-surface-charcoal">

          {/* Step 1: One-time registry setup */}
          {setupHtml && setupCommand && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[9px] text-white/40 bg-white/10 px-2 py-0.5 tracking-widest uppercase">
                  STEP 01
                </span>
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  add void ui registry (one-time per project)
                </p>
              </div>
              <HtmlBlock html={setupHtml} code={setupCommand} />
            </div>
          )}

          {/* Step 2: Add the component */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[9px] text-white/40 bg-white/10 px-2 py-0.5 tracking-widest uppercase">
                STEP 02
              </span>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                add this component
              </p>
            </div>
            <HtmlBlock html={bashHtml} code={npmInstall} />
          </div>

          {/* Step 3: Import */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[9px] text-white/40 bg-white/10 px-2 py-0.5 tracking-widest uppercase">
                STEP 03
              </span>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                import and use
              </p>
            </div>
            <HtmlBlock
              html={tsxHtml}
              code={importCode}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border-hairline pt-6">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3">
              or copy the source directly
            </p>
            <HtmlBlock html={tsxHtml} code={rawCode} />
          </div>

        </div>
      )}
    </div>
  );
}
