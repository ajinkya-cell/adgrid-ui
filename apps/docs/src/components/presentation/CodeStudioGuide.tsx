"use client";

import { useState } from "react";
import type { RegistryEntry } from "@/registry";
import type { PresentationSourceFile } from "./types";
import { getComponentName } from "./presentation-registry";
import { Copy, Check } from "lucide-react";

type PackageManager = "pnpm" | "yarn" | "npm" | "bun";

function getCliCommand(pm: PackageManager, slug: string): string {
  const baseUrl =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://void-ui-phi.vercel.app";
  const url = `${baseUrl}/r/${slug}.json`;
  switch (pm) {
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${url}`;
    case "yarn":
      return `yarn dlx shadcn@latest add ${url}`;
    case "npm":
      return `npx shadcn@latest add ${url}`;
    case "bun":
      return `bunx --bun shadcn@latest add ${url}`;
  }
}

/**
 * Authentic brand icons for the package managers (switched dynamically)
 */
function renderPackageManagerIcon(pm: PackageManager) {
  switch (pm) {
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
          <path
            d="M7.5 13.5c1.2 1.8 3.5 2.5 5.5 1.5 1.5-.7 2.2-1.8 2.2-3 0-1.8-1.5-2.8-3.2-2.8-1.5 0-2.8.8-3.2 2"
            stroke="#2C8EBB"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
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

/**
 * Colorful authentic brand SVG icons for dependencies (rendered at 24px)
 */
function renderDependencyIcon(name: string, className = "h-6 w-6 shrink-0") {
  const lower = name.toLowerCase();

  if (lower.includes("tailwind")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#38BDF8">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
      </svg>
    );
  }

  if (lower.includes("framer-motion")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <path d="M4 0h16v8h-8z" fill="#0055FF" />
        <path d="M4 8h8l8 8H4z" fill="#7B2BF9" />
        <path d="M4 16h8v8z" fill="#00D8FF" />
      </svg>
    );
  }

  if (lower.includes("lucide")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#F97316" fillOpacity="0.3" />
      </svg>
    );
  }

  if (lower.includes("tabler")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#0054a6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    );
  }

  if (lower.includes("gsap")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <rect width="24" height="24" rx="4" fill="#0AE448" fillOpacity="0.25" />
        <path d="M7 16V8h10v2.5H9.5v1h6.5v4.5H7zm4-2h3v.5h-3V14z" fill="#0AE448" />
      </svg>
    );
  }

  if (lower.includes("lenis")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#FF3B30" strokeWidth="2.4" strokeLinecap="round">
        <path d="M3 13c3-6 6-6 9 0s6 6 9 0" />
      </svg>
    );
  }

  if (lower.includes("matter")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="8" cy="8" r="4.5" fill="#F59E0B" />
        <circle cx="16" cy="14" r="5" fill="#F59E0B" fillOpacity="0.8" />
        <circle cx="9" cy="18" r="3" fill="#F59E0B" fillOpacity="0.6" />
      </svg>
    );
  }

  if (lower.includes("cobe")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
      </svg>
    );
  }

  if (lower.includes("rough")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#FACC15" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18c4-2 7-1 11-3s3-1 5-2" />
        <path d="M5 21c3-1 8-2 14-4" />
      </svg>
    );
  }

  if (lower.includes("three")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 3 2 21 22 21" fill="#38BDF8" fillOpacity="0.15" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    );
  }

  if (lower.includes("react-icons") || lower.includes("react")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#00D8FF" strokeWidth="1.8">
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="#00D8FF" />
      </svg>
    );
  }

  if (lower.includes("devicon")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }

  // Fallback icon for standard libraries (e.g. clsx)
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}

export function CodeStudioGuide({
  entry,
}: {
  entry: RegistryEntry;
  sourceFiles?: PresentationSourceFile[];
  activeFileIndex?: number;
  onSelectFileIndex?: (idx: number) => void;
  onSwitchToSource?: () => void;
}) {
  const [cliPm, setCliPm] = useState<PackageManager>("pnpm");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dependencies: include tailwindcss + component dependencies
  const rawDeps =
    entry.dependencies && entry.dependencies.length > 0
      ? entry.dependencies
      : ["framer-motion"];
  const displayDeps = Array.from(new Set(["tailwindcss", ...rawDeps]));

  const usageCode = getDemonstrationSnippet(entry);

  return (
    <div className="space-y-6 pb-12 present-scroll">
      {/* Component Title & Summary */}
      <div className="pt-1">
        <h2 className="text-base font-sans font-semibold text-white tracking-tight">
          {entry.name}
        </h2>
        {entry.description && (
          <p className="mt-1 text-xs text-white/50 leading-relaxed font-sans">
            {entry.description}
          </p>
        )}
      </div>

      {/* 1. CLI Command Block (Props-Table inspired 3D chassis with dual inset bevel shadows) */}
      <div
        className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Dynamic Package Manager Icon */}
            <div className="flex items-center">
              {renderPackageManagerIcon(cliPm)}
            </div>

            {/* Package Manager Tabs with active underline indicator */}
            <div className="flex items-center gap-4">
              {(["pnpm", "yarn", "npm", "bun"] as const).map((mgr) => {
                const isActive = cliPm === mgr;
                return (
                  <button
                    key={mgr}
                    onClick={() => setCliPm(mgr)}
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

          {/* Minimal Copy Button on Right */}
          <button
            onClick={() => handleCopy(getCliCommand(cliPm, entry.slug), "cli")}
            className="flex items-center justify-center p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
            title="Copy command"
            aria-label="Copy CLI command"
          >
            {copiedId === "cli" ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Command Body */}
        <div className="p-4 overflow-x-auto present-scroll">
          <div className="flex items-center gap-2 font-mono text-xs text-white/90">
            <span className="text-white/30 select-none font-normal">$</span>
            <span className="select-all whitespace-nowrap">
              {getCliCommand(cliPm, entry.slug)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Dependencies (Icon-only, prominent size, no outer box, no text) */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">
          Dependencies
        </h3>
        <div className="flex flex-wrap items-center gap-4 py-1">
          {displayDeps.map((dep) => (
            <div
              key={dep}
              title={dep}
              className="transition-transform duration-150 hover:scale-110 cursor-default opacity-90 hover:opacity-100"
            >
              {renderDependencyIcon(dep, "h-6 w-6 shrink-0")}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Usage Section (Props-Table inspired 3D chassis) */}
      <section className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">Usage</h3>

        <div
          className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
          style={{
            backgroundColor: "#171717",
            boxShadow:
              "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Header Bar with 3 MacBook Dots */}
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
              className="flex items-center justify-center p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
              title="Copy usage code"
            >
              {copiedId === "usage" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Code Body */}
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

      {/* 4. Props Section (Props-Table inspired 3D chassis) */}
      {entry.propDefs && entry.propDefs.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">Props</h3>

          <div
            className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
            style={{
              backgroundColor: "#171717",
              boxShadow:
                "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
            }}
          >
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
                  {entry.propDefs.map((prop) => (
                    <tr key={prop.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-white whitespace-nowrap">
                        {prop.name}
                        {prop.required && (
                          <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/80 border border-white/10">
                            req
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/70">
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
        </section>
      )}
    </div>
  );
}

/**
 * Clean syntax colorizer for the demonstration code snippet
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
    if (["onClick", "onChange", "variant", "size", "className", "min", "max", "step", "soundEffect", "glowColor"].includes(token)) {
      return <span key={idx} className="text-neutral-300">{token}</span>;
    }
    return <span key={idx}>{token}</span>;
  });
}
