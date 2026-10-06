# 3D Code Studio & Terminal Windows (`code.md`)

This guide provides the complete source code, visual design anatomy, and adaptation recipes for the **macOS-inspired Code Studio component** found in Void UI's sidebar (`visit code` section). It details the 3-dot window chassis, multi-file switcher, CLI package manager runner with SVG brand icons, line-numbered viewport, and syntax highlighting techniques.

---

## Table of Contents
1. [Visual Anatomy & Design Highlights](#1-visual-anatomy--design-highlights)
2. [Original Void UI Implementations](#2-original-void-ui-implementations)
   - [Sidebar Source Code View (`PresentationSidebar.tsx`)](#sidebar-source-code-view-presentationsidebar-tsx)
   - [CLI Runner, Usage Box & Props Table (`CodeStudioGuide.tsx`)](#cli-runner-usage-box--props-table-codestudioguide-tsx)
3. [Universal Standalone Components](#3-universal-standalone-components)
   - [Component 1: `CodeWindow.tsx` (macOS 3-Dot Code Viewport)](#component-1-codewindowtsx-macos-3-dot-code-viewport)
   - [Component 2: `CliCommandRunner.tsx` (Package Manager Switcher)](#component-2-clicommandrunnertsx-package-manager-switcher)
   - [Component 3: `MultiFileCodeViewer.tsx` (Tabbed File Explorer)](#component-3-multifilecodeviewertsx-tabbed-file-explorer)
   - [Component 4: `BeveledPropsTable.tsx` (macOS 3-Dot Props Reference)](#component-4-beveledpropstabletsx-macos-3-dot-props-reference)
4. [Syntax Highlighting Strategies](#4-syntax-highlighting-strategies)
   - [Method A: Zero-Dependency Pure React Tokenizer](#method-a-zero-dependency-pure-react-tokenizer-client-safe)
   - [Method B: Shiki Server-Side Highlighting](#method-b-shiki-server-side-highlighting-nextjs-app-router)
5. [How to Use Somewhere Else (Landing Pages, Docs, Dashboards)](#5-how-to-use-somewhere-else-landing-pages-docs-dashboards)

---

## 1. Visual Anatomy & Design Highlights

When users click **"visit code"** in Void UI, the code component renders inside a physical 3D chassis with precise macOS hardware aesthetics:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │  ● ● ●   components/VoidButton.tsx                           (128 lines) [Copy] │ ◄── Header bar: bg-white/[0.02] border-b
  ├────────────────────────────────────────────────────────────────────────┤
  │   1 | "use client";                                                    │ ◄── Gutter: text-white/20 select-none
  │   2 |                                                                  │
  │   3 | import * as React from "react";                                  │ ◄── Monospace tokens: text-[11px] leading-relaxed
  │   4 | import { motion } from "framer-motion";                          │
  │   5 |                                                                  │
  │   6 | export function VoidButton({ variant = "default", children }) {  │
  └────────────────────────────────────────────────────────────────────────┘
  ▲
  └── 3D Bevel: border-t-white/20, inset specular catchlight, deep diffuse drop shadow
```

### Key Visual Attributes:
1. **macOS Traffic Light Window Controls**:
   - Close: `#ff5f56`
   - Minimize: `#ffbd2e`
   - Maximize: `#27c93f`
   - Sized at `h-2.5 w-2.5 rounded-full` with 6px spacing.
2. **Tactile Beveled Chassis**:
   - `background: #171717`
   - `border-top: 1px solid rgba(255, 255, 255, 0.20)`
   - `boxShadow: inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)`
3. **Interactive Package Manager Switcher**:
   - Tabs for `pnpm`, `yarn`, `npm`, and `bun` with authentic SVG brand logos.
   - Active tab features a floating white underline indicator.
   - Command line prompt has a non-selectable `$` prefix followed by selectable command text.
4. **Instant Copy-to-Clipboard with Micro-feedback**:
   - Hover state illuminates subtle glass panel.
   - Click toggles from `Copy` icon to `Check` icon in vibrant `#34d399` (emerald-400) for 2 seconds.

---

## 2. Original Void UI Implementations

### Sidebar Source Code View (`PresentationSidebar.tsx`)
```tsx
{/* Highlighted code viewport - Props chassis styled */}
<div
  className="relative group/code flex-1 min-h-0 overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 flex flex-col"
  style={{
    backgroundColor: "#171717",
    boxShadow:
      "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
  }}
>
  {/* Window Header with 3 MacBook dots */}
  <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 shrink-0">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
      </div>
      <span className="text-[11px] font-mono text-white/50">
        {currentFile?.path.split("/").pop()}
      </span>
    </div>
    <span className="text-[10px] font-mono text-white/30">
      {currentFile?.code.split("\n").length ?? 0} lines
    </span>
  </div>

  <div
    className="flex-1 overflow-auto p-5 text-xs font-mono leading-relaxed [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! present-scroll"
    dangerouslySetInnerHTML={{ __html: currentFile?.html ?? "" }}
  />
</div>
```

---

### CLI Runner & Usage Code Box (`CodeStudioGuide.tsx`)
```tsx
{/* 1. CLI Command Block */}
<div
  className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
  style={{
    backgroundColor: "#171717",
    boxShadow:
      "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
  }}
>
  <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
    <div className="flex items-center gap-3">
      {renderPackageManagerIcon(cliPm)}
      <div className="flex items-center gap-4">
        {(["pnpm", "yarn", "npm", "bun"] as const).map((mgr) => {
          const isActive = cliPm === mgr;
          return (
            <button
              key={mgr}
              onClick={() => setCliPm(mgr)}
              className={`relative py-1 text-xs font-mono transition-colors cursor-pointer ${
                isActive ? "text-white font-medium" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span>{mgr}</span>
              {isActive && (
                <div className="absolute -bottom-[11px] inset-x-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>

    <button
      onClick={() => handleCopy(getCliCommand(cliPm, entry.slug), "cli")}
      className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      {copiedId === "cli" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  </div>

  <div className="p-4 overflow-x-auto">
    <div className="flex items-center gap-2 font-mono text-xs text-white/90">
      <span className="text-white/30 select-none">$</span>
      <span className="select-all whitespace-nowrap">{getCliCommand(cliPm, entry.slug)}</span>
    </div>
  </div>
</div>

{/* 2. Usage Code Block with 3-Dot Controls */}
<div
  className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
  style={{
    backgroundColor: "#171717",
    boxShadow:
      "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
  }}
>
  <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
      </div>
      <span className="text-[11px] font-mono text-white/50">app/page.tsx</span>
    </div>
    <button
      onClick={() => handleCopy(usageCode, "usage")}
      className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      {copiedId === "usage" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  </div>
  <div className="p-4 overflow-x-auto font-mono text-[11px] leading-relaxed select-text">
    {/* Line numbers + syntax highlighted tokens */}
  </div>
</div>

{/* 3. 3D Beveled Props Table with macOS 3-Dot Controls */}
<div
  className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
  style={{
    backgroundColor: "#171717",
    boxShadow:
      "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
  }}
>
  <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
      </div>
      <span className="text-[11px] font-mono text-white/50">
        interface {compName}Props
      </span>
    </div>

    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-mono text-white/30">
        {effectiveProps.length} props
      </span>
      <button
        onClick={() => handleCopy(generatePropsInterface(compName, effectiveProps), "props-interface")}
        className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
        title="Copy TypeScript Props interface"
      >
        {copiedId === "props-interface" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  </div>

  <table className="w-full text-left text-xs">
    <thead>
      <tr className="border-b border-white/[0.06] bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/50">
        <th className="px-4 py-2.5">Prop</th>
        <th className="px-4 py-2.5">Type</th>
        <th className="px-4 py-2.5">Default</th>
        <th className="px-4 py-2.5">Description</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/[0.04]">
      {/* Prop rows with pill badges and descriptions */}
    </tbody>
  </table>
</div>
```

---

## 3. Universal Standalone Components

### Component 1: `CodeWindow.tsx` (macOS 3-Dot Code Viewport)
Save this in `components/CodeWindow.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CodeWindowProps {
  filename?: string;
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeWindow({
  filename = "Component.tsx",
  code,
  language = "tsx",
  showLineNumbers = true,
  className = "",
}: CodeWindowProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.trim().split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 flex flex-col font-mono text-xs ${className}`}
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* macOS Window Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 select-none">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[11px] text-white/50">{filename}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30 hidden sm:inline">
            {lines.length} lines
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer active:scale-95"
            title="Copy code"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto p-4 leading-relaxed select-text">
        <pre className="table w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              {showLineNumbers && (
                <span className="table-cell select-none pr-4 text-right text-white/20 text-[10px] w-8">
                  {idx + 1}
                </span>
              )}
              <span className="table-cell whitespace-pre text-neutral-300 font-mono text-[11.5px]">
                {line}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
```

---

### Component 2: `CliCommandRunner.tsx` (Package Manager Switcher)
Save this in `components/CliCommandRunner.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export interface CliCommandRunnerProps {
  packageName?: string;
  commandFormat?: (pm: PackageManager, name: string) => string;
  className?: string;
}

export function CliCommandRunner({
  packageName = "@adgrid-ui/ui",
  commandFormat,
  className = "",
}: CliCommandRunnerProps) {
  const [pm, setPm] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);

  const getCommand = (selectedPm: PackageManager) => {
    if (commandFormat) return commandFormat(selectedPm, packageName);
    switch (selectedPm) {
      case "pnpm":
        return `pnpm add ${packageName}`;
      case "npm":
        return `npm install ${packageName}`;
      case "yarn":
        return `yarn add ${packageName}`;
      case "bun":
        return `bun add ${packageName}`;
    }
  };

  const command = getCommand(pm);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIcon = (manager: PackageManager) => {
    switch (manager) {
      case "pnpm":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
            <rect x="2" y="2" width="5.5" height="5.5" fill="#F69220" rx="1" />
            <rect x="9.25" y="2" width="5.5" height="5.5" fill="#F69220" rx="1" />
            <rect x="16.5" y="2" width="5.5" height="5.5" fill="#F69220" rx="1" />
            <rect x="9.25" y="9.25" width="5.5" height="5.5" fill="#F69220" rx="1" />
            <rect x="16.5" y="9.25" width="5.5" height="5.5" fill="#4E4E4E" rx="1" />
            <rect x="2" y="16.5" width="5.5" height="5.5" fill="#F69220" rx="1" />
            <rect x="9.25" y="16.5" width="5.5" height="5.5" fill="#F69220" rx="1" />
            <rect x="16.5" y="16.5" width="5.5" height="5.5" fill="#F69220" rx="1" />
          </svg>
        );
      case "yarn":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
            <circle cx="12" cy="12" r="9.5" fill="#2C8EBB" fillOpacity="0.15" stroke="#2C8EBB" strokeWidth="1.5" />
            <path d="M7.5 13.5c1.2 1.8 3.5 2.5 5.5 1.5 1.5-.7 2.2-1.8 2.2-3 0-1.8-1.5-2.8-3.2-2.8-1.5 0-2.8.8-3.2 2" stroke="#2C8EBB" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case "npm":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
            <rect width="24" height="24" rx="3" fill="#CB3837" />
            <path d="M4 6h16v12H12v-8H8v8H4V6zm10 4h2v4h-2v-4z" fill="#FFFFFF" />
          </svg>
        );
      case "bun":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
            <circle cx="12" cy="13" r="8.5" fill="#FDF6E2" stroke="#D97736" strokeWidth="1.5" />
            <ellipse cx="12" cy="9" rx="3.5" ry="1.8" fill="#D97736" />
            <circle cx="9.5" cy="13" r="1" fill="#262626" />
            <circle cx="14.5" cy="13" r="1" fill="#262626" />
            <path d="M11 15.5c.5.5 1.5.5 2 0" stroke="#D97736" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 ${className}`}
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Header with Manager Switchers */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-3">
          {renderIcon(pm)}
          <div className="flex items-center gap-3.5">
            {(["pnpm", "npm", "yarn", "bun"] as const).map((mgr) => {
              const isActive = pm === mgr;
              return (
                <button
                  key={mgr}
                  onClick={() => setPm(mgr)}
                  className={`relative py-1 text-xs font-mono transition-colors cursor-pointer ${
                    isActive
                      ? "text-white font-medium"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span>{mgr}</span>
                  {isActive && (
                    <div className="absolute -bottom-[11px] inset-x-0 h-[2px] bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer active:scale-95"
          title="Copy command"
          aria-label="Copy CLI command"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Terminal Command Prompt */}
      <div className="p-4 overflow-x-auto">
        <div className="flex items-center gap-2.5 font-mono text-xs text-white/90">
          <span className="text-white/30 select-none font-normal">$</span>
          <span className="select-all whitespace-nowrap">{command}</span>
        </div>
      </div>
    </div>
  );
}
```

---

### Component 3: `MultiFileCodeViewer.tsx` (Tabbed File Explorer)
Save this in `components/MultiFileCodeViewer.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CodeFile {
  name: string;
  code: string;
}

export function MultiFileCodeViewer({
  files,
  className = "",
}: {
  files: CodeFile[];
  className?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = files[activeIdx] || files[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Tab Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                activeIdx === i
                  ? "bg-white text-black font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-white/40"
                  : "border border-white/10 bg-black/40 text-white/50 hover:text-white/80 hover:border-white/20"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Copy active file"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* 3D Code Viewport */}
      <div
        className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 font-mono text-xs"
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[11px] text-white/50">{currentFile?.name}</span>
          </div>
          <span className="text-[10px] text-white/30">
            {currentFile?.code.split("\n").length} lines
          </span>
        </div>

        <div className="p-4 overflow-x-auto leading-relaxed">
          <pre className="text-neutral-300 font-mono text-[11.5px]">
            {currentFile?.code}
          </pre>
        </div>
      </div>
    </div>
  );
}
```

---

### Component 4: `BeveledPropsTable.tsx` (macOS 3-Dot Props Reference)
Save this in `components/BeveledPropsTable.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface PropItem {
  name: string;
  type: string;
  default?: string | number | boolean;
  description: string;
  required?: boolean;
  options?: string[];
}

export interface BeveledPropsTableProps {
  componentName: string;
  props: PropItem[];
  className?: string;
}

export function BeveledPropsTable({
  componentName,
  props,
  className = "",
}: BeveledPropsTableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyInterface = () => {
    const lines = props.map((p) => {
      const typeStr = p.options ? p.options.map(o => `"${o}"`).join(" | ") : p.type;
      const optMark = p.required ? "" : "?";
      return `  /** ${p.description} */\n  ${p.name}${optMark}: ${typeStr};`;
    });
    const code = `export interface ${componentName}Props {\n${lines.join("\n")}\n}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 ${className}`}
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* macOS Window Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[11px] font-mono text-white/50">
            interface {componentName}Props
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-white/30">
            {props.length} {props.length === 1 ? "prop" : "props"}
          </span>
          <button
            onClick={handleCopyInterface}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer active:scale-95"
            title="Copy TypeScript Props interface"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Table Viewport */}
      <div className="overflow-x-auto present-scroll">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/50">
              <th className="px-4 py-2.5">Prop</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Default</th>
              <th className="px-4 py-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {props.map((item) => (
              <tr key={item.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-white whitespace-nowrap">
                  <span>{item.name}</span>
                  {item.required && (
                    <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/80 border border-white/10">
                      req
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/70">
                    {item.type}
                    {item.options ? ` (${item.options.length})` : ""}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-white/50 whitespace-nowrap">
                  {item.default !== undefined ? String(item.default) : "—"}
                </td>
                <td className="px-4 py-3 text-white/70 leading-relaxed text-[11px] font-sans">
                  <div>{item.description}</div>
                  {item.options && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.options.map((opt) => (
                        <span
                          key={opt}
                          className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40 border border-white/5"
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
  );
}
```

---

## 4. Syntax Highlighting Strategies

### Method A: Zero-Dependency Pure React Tokenizer (Client Safe)
Void UI's `CodeStudioGuide.tsx` contains a fast, zero-dependency token colorizer that runs in any client component without adding bundle bloat:

```tsx
export function formatSyntax(line: string) {
  if (line.trim().startsWith("//")) {
    return <span className="text-neutral-500 italic">{line}</span>;
  }
  if (line.includes('"use client"')) {
    return <span className="text-emerald-400">{line}</span>;
  }

  // Tokenize keywords, strings, booleans, and component names
  const tokens = line.split(/(\s+|[{}\[\](),:;=<>"])/);
  return tokens.map((token, idx) => {
    if (["import", "export", "default", "function", "return", "const", "let", "from"].includes(token)) {
      return <span key={idx} className="text-neutral-400 font-medium">{token}</span>;
    }
    if (["true", "false"].includes(token)) {
      return <span key={idx} className="text-amber-300">{token}</span>;
    }
    if (token.startsWith('"') && token.endsWith('"')) {
      return <span key={idx} className="text-emerald-300">{token}</span>;
    }
    if (/^[A-Z][a-zA-Z0-9]+$/.test(token)) {
      return <span key={idx} className="text-cyan-300">{token}</span>;
    }
    if (["onClick", "onChange", "variant", "size", "className"].includes(token)) {
      return <span key={idx} className="text-neutral-300">{token}</span>;
    }
    return <span key={idx}>{token}</span>;
  });
}
```

### Method B: Shiki Server-Side Highlighting (Next.js App Router)
For pixel-perfect VS Code syntax highlighting, use Shiki on the server:

```bash
pnpm add shiki
```

In your server component or route (`app/code-demo/page.tsx`):
```tsx
import { codeToHtml } from "shiki";

export async function HighlightedCode({ code }: { code: string }) {
  const html = await codeToHtml(code, {
    lang: "tsx",
    theme: "github-dark-dimmed",
  });

  return (
    <div
      className="p-4 text-xs font-mono overflow-x-auto [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0!"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

---

## 5. How to Use Somewhere Else (Landing Pages, Docs, Dashboards)

### Example: Landing Page Quick Start Section
```tsx
import { CliCommandRunner } from "@/components/CliCommandRunner";
import { CodeWindow } from "@/components/CodeWindow";

export default function LandingSection() {
  const sampleSnippet = `"use client";

import { VoidButton } from "@/components/ui/VoidButton";

export default function Hero() {
  return (
    <div className="flex gap-4">
      <VoidButton variant="glow" glowColor="#8b5cf6">
        Get Started
      </VoidButton>
    </div>
  );
}`;

  return (
    <section className="max-w-2xl mx-auto py-16 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Quick Installation</h2>
        <p className="text-xs text-white/50">Install the package and drop the button into your app.</p>
      </div>

      {/* Package Manager runner */}
      <CliCommandRunner packageName="@my-org/components" />

      {/* Code window with line numbers */}
      <CodeWindow filename="app/page.tsx" code={sampleSnippet} />
    </section>
  );
}
```
