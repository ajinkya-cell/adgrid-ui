"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import type { PresentationSourceFile } from "./types";
import { getComponentName } from "./presentation-registry";
import {
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
} from "lucide-react";

type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

function getPackageManagerCommand(
  pm: PackageManager,
  deps: string[]
): string {
  const depStr = deps.join(" ");
  switch (pm) {
    case "pnpm":
      return `pnpm add ${depStr}`;
    case "npm":
      return `npm install ${depStr}`;
    case "yarn":
      return `yarn add ${depStr}`;
    case "bun":
      return `bun add ${depStr}`;
  }
}

function getCliCommand(pm: PackageManager, slug: string): string {
  const url = `https://void-ui.vercel.app/r/${slug}.json`;
  switch (pm) {
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${url}`;
    case "npm":
      return `npx shadcn@latest add ${url}`;
    case "yarn":
      return `yarn dlx shadcn@latest add ${url}`;
    case "bun":
      return `bunx --bun shadcn@latest add ${url}`;
  }
}

function getDemonstrationSnippet(entry: RegistryEntry): string {
  const compName = getComponentName(entry);

  if (entry.slug === "void-button") {
    return `"use client";

import { VoidButton } from "@/components/ui/VoidButton";

export default function DemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4 bg-[#0a0a0a] p-8">
      {/* 1. Default Skeuo Clicky Button */}
      <VoidButton variant="default" onClick={() => console.log("Default button pressed!")}>
        Default
      </VoidButton>

      {/* 2. Audio Click Feedback */}
      <VoidButton variant="audio" soundEffect="click">
        Audio Click
      </VoidButton>

      {/* 3. Glowing Neon Accent */}
      <VoidButton variant="glow" glowColor="#8b5cf6">
        Violet Glow
      </VoidButton>
    </main>
  );
}`;
  }

  if (entry.slug === "anisotropic-knob") {
    return `"use client";

import { useState } from "react";
import { AnisotropicKnob } from "@/components/ui/AnisotropicKnob";

export default function DemoPage() {
  const [level, setLevel] = useState(50);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] p-8">
      <AnisotropicKnob
        value={level}
        onChange={setLevel}
        min={0}
        max={100}
        step={1}
        size={180}
        label="Gain"
      />
      <div className="font-mono text-sm text-neutral-400">
        Current Level: <span className="font-bold text-white">{Math.round(level)}%</span>
      </div>
    </main>
  );
}`;
  }

  if (entry.slug === "tooltip") {
    return `"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";

export default function DemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-8">
      <Tooltip>
        <TooltipTrigger className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium">
          Hover over me
        </TooltipTrigger>
        <TooltipContent side="top">
          Smooth spring animated tooltip
        </TooltipContent>
      </Tooltip>
    </main>
  );
}`;
  }

  const isBackground = entry.category === "backgrounds";
  const sampleProps = (entry.propDefs || [])
    .slice(0, 4)
    .map((p) => {
      if (p.default !== undefined) {
        if (typeof p.default === "string") return `        ${p.name}="${p.default}"`;
        if (typeof p.default === "boolean") return p.default ? `        ${p.name}` : `        ${p.name}={false}`;
        return `        ${p.name}={${p.default}}`;
      }
      if (p.type === "number") return `        ${p.name}={${p.min ?? 0}}`;
      if (p.type === "boolean") return `        ${p.name}={true}`;
      if (p.type === "select" && p.options?.[0]) return `        ${p.name}="${p.options[0]}"`;
      return `        ${p.name}="..."`;
    })
    .join("\n");

  const propsBlock = sampleProps ? `\n${sampleProps}\n      ` : " ";

  if (isBackground) {
    return `"use client";

import { ${compName} } from "@/components/ui/${compName}";

export default function DemoPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background Canvas Layer */}
      <${compName}${propsBlock}/>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">${entry.name}</h1>
        <p className="mt-2 text-neutral-400">${entry.description}</p>
      </div>
    </main>
  );
}`;
  }

  return `"use client";

import { ${compName} } from "@/components/ui/${compName}";

export default function DemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-8">
      <${compName}${propsBlock}/>
    </main>
  );
}`;
}

export function CodeStudioGuide({
  entry,
  sourceFiles = [],
  activeFileIndex,
  onSelectFileIndex,
  onSwitchToSource,
}: {
  entry: RegistryEntry;
  sourceFiles?: PresentationSourceFile[];
  activeFileIndex: number;
  onSelectFileIndex: (idx: number) => void;
  onSwitchToSource: () => void;
}) {
  const [pm, setPm] = useState<PackageManager>("pnpm");
  const [cliPm, setCliPm] = useState<PackageManager>("pnpm");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dependencies = Array.from(
    new Set(["framer-motion", "clsx", "tailwind-merge", ...(entry.dependencies || [])])
  );

  const currentFile = sourceFiles[activeFileIndex] || sourceFiles[0];
  const primaryFileName = currentFile?.path ? currentFile.path.split("/").pop() : `${getComponentName(entry)}.tsx`;
  const usageCode = getDemonstrationSnippet(entry);

  return (
    <div className="space-y-7 pb-12 present-scroll">
      {/* Top action row */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <h2 className="text-base font-poppins font-semibold text-white tracking-tight">{entry.name}</h2>
        <button
          onClick={onSwitchToSource}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-poppins font-medium text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer active:scale-95"
        >
          <Code2 className="h-3.5 w-3.5 text-violet-400" />
          <span>View Source</span>
          <ChevronRight className="h-3 w-3 text-white/40" />
        </button>
      </div>

      {/* Section 1: CLI (Moved to Top) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-poppins uppercase tracking-wider text-white/80 font-semibold">CLI</h3>
          <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-0.5">
            {(["pnpm", "npm", "yarn", "bun"] as const).map((mgr) => (
              <button
                key={mgr}
                onClick={() => setCliPm(mgr)}
                className={`rounded-full px-3 py-0.5 font-poppins text-[11px] transition-all cursor-pointer ${
                  cliPm === mgr
                    ? "bg-white/15 text-white font-medium shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {mgr}
              </button>
            ))}
          </div>
        </div>

        <div className="group relative rounded-xl border border-white/10 bg-[#060606] p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto present-scroll font-mono text-xs text-white/90">
              <span className="text-violet-400 font-bold select-none">$</span>
              <span className="select-all whitespace-nowrap">
                {getCliCommand(cliPm, entry.slug)}
              </span>
            </div>
            <button
              onClick={() => handleCopy(getCliCommand(cliPm, entry.slug), "cli")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111111] px-3.5 py-1.5 font-poppins text-xs font-medium text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white shrink-0 active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              {copiedId === "cli" ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-white/60" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Dependencies */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-poppins uppercase tracking-wider text-white/80 font-semibold">Dependencies</h3>
          <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-0.5">
            {(["pnpm", "npm", "yarn", "bun"] as const).map((mgr) => (
              <button
                key={mgr}
                onClick={() => setPm(mgr)}
                className={`rounded-full px-3 py-0.5 font-poppins text-[11px] transition-all cursor-pointer ${
                  pm === mgr
                    ? "bg-white/15 text-white font-medium shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {mgr}
              </button>
            ))}
          </div>
        </div>

        <div className="group relative rounded-xl border border-white/10 bg-[#060606] p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto present-scroll font-mono text-xs text-white/90">
              <span className="text-violet-400 font-bold select-none">$</span>
              <span className="select-all whitespace-nowrap">
                {getPackageManagerCommand(pm, dependencies)}
              </span>
            </div>
            <button
              onClick={() => handleCopy(getPackageManagerCommand(pm, dependencies), "deps")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111111] px-3.5 py-1.5 font-poppins text-xs font-medium text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white shrink-0 active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              {copiedId === "deps" ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-white/60" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-2">
            {dependencies.map((dep) => (
              <span
                key={dep}
                className="rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-0.5 font-mono text-[10px] text-white/50"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Component Source (Redesigned with Premium File Chooser) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-poppins uppercase tracking-wider text-white/80 font-semibold">Component Source</h3>
          <span className="font-mono text-[10px] text-white/40">
            {sourceFiles.length} {sourceFiles.length === 1 ? "file" : "files"}
          </span>
        </div>

        {/* Multi-file selection rail */}
        {sourceFiles.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto present-scroll pb-1">
            {sourceFiles.map((file, idx) => {
              const isSelected = activeFileIndex === idx;
              const fileName = file.path.split("/").pop();
              const lineCount = file.code.split("\n").length;
              return (
                <button
                  key={file.path}
                  onClick={() => onSelectFileIndex(idx)}
                  className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-poppins text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "border-violet-500/40 bg-violet-500/15 text-white font-medium shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                      : "border-white/10 bg-black/40 text-white/50 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      isSelected
                        ? "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]"
                        : "bg-white/30 group-hover:bg-white/60"
                    }`}
                  />
                  <span>{fileName}</span>
                  <span className="font-mono text-[10px] text-white/40">({lineCount}L)</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Source Card */}
        <div className="rounded-2xl border border-white/10 bg-[#060606] p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.15)] shrink-0">
                <FileCode className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="font-mono text-xs text-white/90 font-medium flex items-center gap-1.5">
                  <span className="text-white/40">components/ui/</span>
                  <span className="text-white">{primaryFileName}</span>
                </div>
                <span className="font-mono text-[10px] text-white/40">
                  {currentFile?.code.split("\n").length ?? 0} lines • TypeScript React
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111111] px-3.5 py-1.5 font-poppins text-xs text-white/70 transition-all hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
              >
                {previewOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span>{previewOpen ? "Hide" : "Preview"}</span>
              </button>

              <button
                onClick={() => handleCopy(currentFile?.code ?? "", "source-code")}
                className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 font-poppins text-xs font-medium text-violet-200 transition-all hover:bg-violet-500/20 hover:border-violet-400/50 hover:text-white cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
              >
                {copiedId === "source-code" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-violet-300" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Viewport */}
          <AnimatePresence>
            {previewOpen && currentFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/10 pt-3"
              >
                <div className="max-h-[240px] overflow-auto present-scroll rounded-xl bg-black/60 p-3.5 font-mono text-[10.5px] leading-relaxed text-white/80 select-text border border-white/5">
                  <pre className="whitespace-pre">{currentFile.code.slice(0, 1000)}...</pre>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-poppins text-white/40 px-1">
                  <span>Snippet preview ({currentFile.code.split("\n").length} total lines)</span>
                  <button
                    onClick={onSwitchToSource}
                    className="text-violet-400 hover:text-violet-300 underline font-medium cursor-pointer"
                  >
                    View full source &rarr;
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Section 4: Usage */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-poppins uppercase tracking-wider text-white/80 font-semibold">Usage</h3>

          <button
            onClick={() => handleCopy(usageCode, "usage")}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111111] px-3.5 py-1 font-poppins text-xs font-medium text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            {copiedId === "usage" ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-white/60" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#050505] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2 text-[10px] font-mono text-white/40">
            <span className="text-white/60 font-medium">app/page.tsx</span>
          </div>

          <div className="p-4 overflow-x-auto present-scroll font-mono text-[11px] leading-relaxed select-text">
            <pre className="text-neutral-300">
              {usageCode.split("\n").map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-white/20 text-[10px]">
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {formatSyntax(line)}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </section>

      {/* Section 5: Props */}
      {entry.propDefs && entry.propDefs.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-xs font-poppins uppercase tracking-wider text-white/80 font-semibold">Props</h3>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#060606] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="overflow-x-auto present-scroll">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] font-poppins text-[10px] uppercase tracking-wider text-white/50">
                    <th className="px-4 py-2.5">Prop</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Default</th>
                    <th className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {entry.propDefs.map((prop) => (
                    <tr key={prop.name} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-violet-300 whitespace-nowrap">
                        {prop.name}
                        {prop.required && (
                          <span className="ml-1.5 rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-[9px] text-rose-300 border border-rose-500/25">
                            req
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-white/70">
                          {prop.type}
                          {prop.options ? ` (${prop.options.length})` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-white/50 whitespace-nowrap">
                        {prop.default !== undefined ? String(prop.default) : "—"}
                      </td>
                      <td className="px-4 py-3 text-white/70 leading-relaxed text-[11px] font-sans">
                        {prop.description}
                        {prop.options && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {prop.options.map((opt) => (
                              <span
                                key={opt}
                                className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/40 border border-white/5"
                              >
                                &quot;{opt}&quot;
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Lightweight syntax colorizer for the client demonstration snippet
 */
function formatSyntax(line: string) {
  if (line.trim().startsWith("//")) {
    return <span className="text-neutral-500 italic">{line}</span>;
  }
  if (line.includes('"use client"')) {
    return <span className="text-emerald-400">{line}</span>;
  }

  // Tokens highlighting
  const tokens = line.split(/(\s+|[{}\[\](),:;=<>"])/);
  return tokens.map((token, idx) => {
    if (["import", "export", "default", "function", "return", "const", "let", "from"].includes(token)) {
      return <span key={idx} className="text-purple-400 font-medium">{token}</span>;
    }
    if (["true", "false"].includes(token)) {
      return <span key={idx} className="text-amber-400">{token}</span>;
    }
    if (token.startsWith('"') && token.endsWith('"')) {
      return <span key={idx} className="text-emerald-300">{token}</span>;
    }
    if (/^[A-Z][a-zA-Z0-9]+$/.test(token)) {
      return <span key={idx} className="text-cyan-300">{token}</span>;
    }
    if (["onClick", "onChange", "variant", "size", "className", "min", "max", "step", "soundEffect", "glowColor"].includes(token)) {
      return <span key={idx} className="text-amber-300/90">{token}</span>;
    }
    return <span key={idx}>{token}</span>;
  });
}
