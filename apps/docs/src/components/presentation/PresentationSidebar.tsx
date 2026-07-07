"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { groupEntriesByCategory, presentationEntries, getImportStatement } from "./presentation-registry";
import { SidebarCategory } from "./SidebarCategory";
import { SidebarSearch } from "./SidebarSearch";
import { usePresentation } from "./hooks/usePresentation";
import type { PresentationSourceFile } from "./types";

function matches(entry: RegistryEntry, query: string, favorite: boolean, recent: boolean) {
  const q = query.trim().toLowerCase();
  if (q === "favorite" || q === "favorites") return favorite;
  if (q === "recent") return recent;
  if (!q) return true;
  return [entry.name, entry.slug, entry.category, entry.description].some((value) => value.toLowerCase().includes(q));
}

function CopyWidget({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-1.5">
      <div className="font-sans text-[10.5px] font-medium text-white/40">{label}</div>
      <div className="flex items-center gap-1.5 p-1 bg-[#050505] border border-white/5 rounded-xl relative group shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)]">
        <input
          readOnly
          value={value}
          className="flex-1 bg-transparent border-none outline-none font-mono text-[10px] text-white/70 pl-2 pr-12 select-all h-8 truncate"
        />
        <button
          onClick={handleCopy}
          className="px-2.5 h-8 bg-[#090909] border border-white/5 text-white/50 hover:text-white rounded-lg font-mono text-[9px] uppercase tracking-wider hover:bg-white/5 transition-all shrink-0 active:scale-95 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] hover:border-white/15"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function PresentationSidebar({
  entry,
  sourceFiles = [],
}: {
  entry: RegistryEntry;
  sourceFiles?: PresentationSourceFile[];
}) {
  const [query, setQuery] = useState("");
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const open = usePresentationStore((state) => state.sidebarOpen);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const activeTab = usePresentationStore((state) => state.sidebarTab);
  const setSidebarTab = usePresentationStore((state) => state.setSidebarTab);
  
  const favorites = usePresentationStore((state) => state.favorites);
  const recent = usePresentationStore((state) => state.recent);
  const toggleFavorite = usePresentationStore((state) => state.toggleFavorite);
  const presentation = usePresentation(entry);
  const recentSlugs = recent.map((item) => item.slug);

  const grouped = useMemo(() => {
    const filtered = presentationEntries.filter((item) =>
      matches(item, query, favorites.includes(item.slug), recentSlugs.includes(item.slug))
    );
    return groupEntriesByCategory(filtered);
  }, [favorites, query, recentSlugs]);

  const flatResults = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const currentFile = sourceFiles[activeFileIndex] || sourceFiles[0];

  const shadcnCommand = `pnpm dlx shadcn@latest add https://void-ui.vercel.app/r/${entry.slug}.json`;
  const depInstallCommand = `pnpm add ${Array.from(new Set(["framer-motion", "clsx", "tailwind-merge", ...(entry.dependencies || [])])).join(" ")}`;
  const importStatement = getImportStatement(entry);

  const [codeCopied, setCodeCopied] = useState(false);
  const handleCopyCode = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close component navigator"
            className="fixed inset-0 z-30 bg-black/24 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
          <motion.aside
            className="fixed bottom-0 left-0 z-40 flex h-[86dvh] w-full flex-col rounded-t-3xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 p-4 shadow-2xl backdrop-blur-2xl md:top-0 md:h-dvh md:max-h-none md:w-[480px] md:rounded-r-3xl md:rounded-tl-none md:border-y-0 md:border-l-0 md:border-r border-r-white/10"
            style={{
              backgroundColor: "#171717",
              boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
            }}
            initial={{ opacity: 0, x: -24, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -24, y: 12, filter: "blur(6px)" }}
            transition={{ type: "spring", duration: 0.32, bounce: 0 }}
          >
            {/* Header Tabs */}
            <div className="mb-4 flex items-center shrink-0 pl-14 md:pl-16">
              <div className="flex gap-1 p-1 bg-[#090909] border border-white/5 rounded-xl flex-1 max-w-[320px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.7)]">
                {(["navigator", "code", "props", "install"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSidebarTab(tab)}
                    className={`flex-1 py-1.5 font-mono text-[10px] capitalize tracking-wide rounded-lg transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-white text-black font-bold shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content area based on selected tab */}
            {activeTab === "navigator" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="mb-4">
                  <div className="mb-3">
                    <div className="font-mono text-[10.5px] text-white/40">Navigator</div>
                    <div className="mt-1 text-xs text-white/70">{flatResults.length} components</div>
                  </div>
                  <SidebarSearch
                    value={query}
                    onChange={setQuery}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && flatResults[0]) presentation.navigateTo(flatResults[0]);
                    }}
                  />
                </div>
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1 present-scroll">
                  {Object.entries(grouped).map(([category, entries]) => (
                    <SidebarCategory
                      key={category}
                      name={category}
                      entries={entries}
                      activeSlug={entry.slug}
                      favorites={favorites}
                      recentSlugs={recentSlugs}
                      onOpen={presentation.navigateTo}
                      onFavorite={toggleFavorite}
                    />
                  ))}
                  {flatResults.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/40">No matching components.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="mb-3">
                  <div className="font-mono text-[10.5px] text-white/40">Source Code</div>
                  <div className="mt-1 text-xs text-white/70">{entry.name} source files</div>
                </div>

                {/* File picker */}
                {sourceFiles.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
                    {sourceFiles.map((file, i) => (
                      <button
                        key={file.path}
                        onClick={() => setActiveFileIndex(i)}
                        className={`px-2.5 py-1 text-[9px] font-mono border rounded-lg transition-all cursor-pointer ${
                          activeFileIndex === i
                            ? "bg-white/10 border-white/30 text-white"
                            : "border-transparent text-white/40 hover:text-white/70"
                        }`}
                      >
                        {file.path.split("/").pop()}
                      </button>
                    ))}
                  </div>
                )}

                {/* Highlighted code viewport */}
                <div className="relative group/code flex-1 min-h-0 overflow-hidden border border-white/5 rounded-2xl flex flex-col bg-[#090909] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
                  {/* Copy button */}
                  <div className="absolute top-3 right-3 z-10 opacity-60 group-hover/code:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 bg-[#050505] hover:bg-[#0c0c0c] border border-white/5 text-white/70 hover:text-white rounded-lg text-[10px] font-mono capitalize transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] hover:border-white/15"
                    >
                      {codeCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  {/* Code frame */}
                  <div
                    className="flex-1 overflow-auto p-4 text-[10.5px] font-mono leading-relaxed [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! present-scroll"
                    dangerouslySetInnerHTML={{ __html: currentFile?.html ?? "" }}
                  />
                </div>
              </div>
            )}

            {activeTab === "props" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="mb-3 shrink-0">
                  <div className="font-mono text-[10.5px] text-white/40">Properties Reference</div>
                  <div className="mt-1 text-xs text-white/70">Tweakable options for {entry.name}</div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1 present-scroll">
                  {!entry.propDefs || entry.propDefs.length === 0 ? (
                    <div className="rounded-2xl bg-[#090909] border border-white/[0.04] p-5 text-[11px] font-mono leading-relaxed text-white/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] text-center">
                      This component does not define any customizable properties in the registry.
                    </div>
                  ) : (
                    <div className="border border-white/[0.05] rounded-2xl bg-[#090909] overflow-hidden shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                            <th className="p-3 font-semibold text-white/50 text-[10px] uppercase tracking-wider font-mono">Name</th>
                            <th className="p-3 font-semibold text-white/50 text-[10px] uppercase tracking-wider font-mono">Type</th>
                            <th className="p-3 font-semibold text-white/50 text-[10px] uppercase tracking-wider font-mono">Default</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.propDefs.map((prop) => (
                            <tr key={prop.name} className="border-b border-white/[0.04] hover:bg-white/[0.01] last:border-none">
                              <td className="p-3 align-top">
                                <div className="font-mono text-[10px] font-bold text-white flex flex-wrap items-center gap-1.5">
                                  {prop.name}
                                  {prop.required && (
                                    <span className="text-[7.5px] px-1 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-sm font-sans uppercase font-bold tracking-wider">Req</span>
                                  )}
                                </div>
                                <div className="text-[10.5px] text-white/40 mt-1 leading-relaxed">{prop.description}</div>
                              </td>
                              <td className="p-3 align-top">
                                <span className="font-mono text-[10px] text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">{prop.type}</span>
                              </td>
                              <td className="p-3 align-top">
                                <span className="font-mono text-[10px] text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                                  {prop.default !== undefined ? String(prop.default) : "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "install" && (
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-6 present-scroll">
                <div>
                  <div className="font-mono text-[10.5px] text-white/40">Installation</div>
                  <div className="mt-1 text-xs text-white/70">Integration instructions for {entry.name}</div>
                </div>

                <div className="space-y-5">
                  <CopyWidget
                    value={shadcnCommand}
                    label="1. CLI Installation (Recommended)"
                  />
                  <CopyWidget
                    value={depInstallCommand}
                    label="2. Peer Dependencies"
                  />
                  <CopyWidget
                    value={importStatement}
                    label="3. Import Statement"
                  />
                </div>

                <div className="rounded-2xl bg-[#090909] border border-white/[0.04] p-4 text-[10px] font-mono leading-relaxed text-white/50 space-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="text-white/70 font-semibold text-[10.5px]">Manual Installation:</div>
                  <p>
                    If you don't use shadcn CLI, you can switch to the <span className="text-white">Code</span> tab, copy the TSX code directly, and save it under your components directory.
                  </p>
                  <p>
                    Make sure you configure your tailwind settings to scan the components path.
                  </p>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

