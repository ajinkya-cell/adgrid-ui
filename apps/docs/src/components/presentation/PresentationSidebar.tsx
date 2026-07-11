"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { presentationEntries, getImportStatement } from "./presentation-registry";
import { SidebarSearch } from "./SidebarSearch";
import { usePresentation } from "./hooks/usePresentation";
import type { PresentationSourceFile } from "./types";
import { SidebarItem } from "./SidebarItem";
import { PreviewOverlay } from "./PreviewOverlay";

function CopyWidget({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-1.5 px-6">
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
  
  const presentation = usePresentation(entry);

  // Grouped is still used for stats or other parts if needed, but we flatten for navigator list
  const filteredEntries = useMemo(() => {
    return presentationEntries.filter((item) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [item.name, item.slug, item.category, item.description].some((value) =>
        value.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const flatResults = filteredEntries;

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

  // Keyboard navigation & Hover coordinates state
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredEntry, setHoveredEntry] = useState<RegistryEntry | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [hoveredTab, setHoveredTab] = useState<"code" | "install" | null>(null);

  // Set starting index to the active page component
  useEffect(() => {
    const idx = flatResults.findIndex((item) => item.slug === entry.slug);
    if (idx !== -1) setActiveIndex(idx);
  }, [entry.slug, flatResults]);

  // Keyboard listener for navigation inside flat list
  useEffect(() => {
    if (!open || activeTab !== "navigator") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[activeIndex]) {
          toggleSidebar();
          presentation.navigateTo(flatResults[activeIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, activeTab, flatResults, activeIndex, toggleSidebar, presentation]);

  // Smooth scroll item container on active index changes
  useEffect(() => {
    if (!open) return;
    const activeEl = document.querySelector(`[data-sidebar-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex, open]);

  const handleNavigate = (target: RegistryEntry) => {
    toggleSidebar();
    presentation.navigateTo(target);
  };

  // Generate stable numbering prefix based on full registry listing index
  const getStableNumber = (target: RegistryEntry) => {
    const idx = presentationEntries.findIndex((item) => item.slug === target.slug);
    return String(idx + 1).padStart(2, "0");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dismissal Overlay */}
          <motion.button
            type="button"
            aria-label="Close component navigator"
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
          
          <motion.aside
            className="fixed bottom-0 left-0 z-40 flex h-dvh w-[300px] flex-col border-r border-white/10 p-0 shadow-2xl backdrop-blur-2xl"
            style={{
              backgroundColor: "#070707e5",
              boxShadow: "0 0 80px rgba(0,0,0,0.85)"
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            role="navigation"
            aria-label="Component selector"
          >
            {/* Header Tabs: Horizontal row of icon buttons to the right of the trigger button */}
            <div className="h-[44px] mb-4 mt-6 flex items-center justify-between shrink-0 pl-20 pr-6">
              <div className="flex items-center gap-2.5">
                {(["code", "install"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <div
                      key={tab}
                      className="relative"
                      onMouseEnter={() => setHoveredTab(tab)}
                      onMouseLeave={() => setHoveredTab(null)}
                    >
                      <motion.button
                        onClick={() => setSidebarTab(isActive ? "navigator" : tab)}
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.94 }}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200 cursor-pointer ${
                          isActive
                            ? "border-violet-400/40 text-violet-300"
                            : "border-white/25 text-white/50 hover:text-white/90 hover:border-white/35"
                        }`}
                        style={{
                          backgroundColor: "#171717",
                          boxShadow: isActive
                            ? "inset 0 1.5px 0 0 rgba(167,139,250,0.12), inset 0 -1.5px 0 0 rgba(0,0,0,0.45), 0 0 14px rgba(139,92,246,0.18), 0 8px 24px rgba(0,0,0,0.5)"
                            : "inset 0 1.5px 0 0 rgba(255,255,255,0.10), inset 0 -1.5px 0 0 rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)",
                        }}
                        type="button"
                      >
                        {tab === "code" && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </svg>
                        )}
                        {tab === "install" && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 17 10 11 4 5" />
                            <line x1="12" y1="19" x2="20" y2="19" />
                          </svg>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {hoveredTab === tab && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 5, x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.8, y: 5, x: "-50%" }}
                            transition={{ type: "spring", stiffness: 350, damping: 20 }}
                            className="absolute top-10 left-1/2 z-50 px-2.5 py-1 rounded-lg border border-white/10 bg-neutral-950 text-white/90 font-mono text-[9px] uppercase tracking-wider shadow-[0_5px_15px_rgba(0,0,0,0.6)] pointer-events-none whitespace-nowrap"
                          >
                            {/* Chat bubble pointer arrow */}
                            <div className="absolute -top-[4.5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-t border-l border-white/10 bg-neutral-950" />
                            <span className="relative z-10">
                              {tab === "code" ? "Source Code" : "CLI Install"}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/20 select-none">
                {activeTab === "navigator" ? "Explore" : activeTab}
              </span>
            </div>

            {/* Content area based on selected tab */}
            {activeTab === "navigator" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="mb-4 pl-9 pr-6">
                  <div className="mb-3">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">Navigator</div>
                    <div className="mt-1 text-xs text-white/60 font-medium">{flatResults.length} components</div>
                  </div>
                  <SidebarSearch
                    value={query}
                    onChange={setQuery}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && flatResults[0]) handleNavigate(flatResults[0]);
                    }}
                  />
                </div>
                
                {/* Numbered components list */}
                <div className="min-h-0 flex-1 overflow-y-auto present-scroll py-2 space-y-0 select-none" role="menu">
                  {flatResults.map((item, idx) => (
                    <div key={item.slug} data-sidebar-index={idx}>
                      <SidebarItem
                        entry={item}
                        active={item.slug === entry.slug}
                        itemNumber={getStableNumber(item)}
                        isFocused={idx === activeIndex}
                        onNavigate={() => handleNavigate(item)}
                        onHoverChange={(hEntry, hRect) => {
                          setHoveredEntry(hEntry);
                          setHoveredRect(hRect);
                        }}
                      />
                    </div>
                  ))}
                  {flatResults.length === 0 && (
                    <div className="mx-9 mt-4 rounded-xl border border-white/5 bg-white/[0.01] p-5 text-xs font-mono text-white/35">
                      No matching components.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="flex-1 min-h-0 flex flex-col px-6">
                <div className="mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">Source Code</div>
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
                <div className="relative group/code flex-1 min-h-0 overflow-hidden border border-white/5 rounded-2xl flex flex-col bg-[#050505] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] mb-6">
                  {/* Copy button */}
                  <div className="absolute top-3 right-3 z-10 opacity-60 group-hover/code:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 bg-[#0b0b0b] hover:bg-[#121212] border border-white/5 text-white/70 hover:text-white rounded-lg text-[10px] font-mono capitalize transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] hover:border-white/15"
                    >
                      {codeCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  {/* Code frame */}
                  <div
                    className="flex-1 overflow-auto p-4 text-[10px] font-mono leading-relaxed [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! present-scroll"
                    dangerouslySetInnerHTML={{ __html: currentFile?.html ?? "" }}
                  />
                </div>
              </div>
            )}



            {activeTab === "install" && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-6 present-scroll mb-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 px-6">Installation</div>
                  <div className="mt-1 text-xs text-white/70 px-6">CLI integration helpers</div>
                </div>

                <div className="space-y-4">
                  <CopyWidget
                    value={shadcnCommand}
                    label="1. CLI Add Component"
                  />
                  <CopyWidget
                    value={depInstallCommand}
                    label="2. Install Dependencies"
                  />
                  <CopyWidget
                    value={importStatement}
                    label="3. ES6 Import"
                  />
                </div>

                <div className="mx-6 rounded-xl bg-[#050505] border border-white/[0.04] p-4 text-[9.5px] font-mono leading-relaxed text-white/50 space-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]">
                  <div className="text-white/70 font-semibold text-[10px]">Manual Setup:</div>
                  <p>
                    You can copy the code directly under the <span className="text-white">Code</span> tab and paste it into your local directory.
                  </p>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Active Live Preview Portal Overlay */}
          <PreviewOverlay
            isVisible={hoveredEntry !== null}
            entry={hoveredEntry}
            anchorRect={hoveredRect}
          />
        </>
      )}
    </AnimatePresence>
  );
}
