"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { presentationEntries } from "./presentation-registry";
import { SidebarSearch } from "./SidebarSearch";
import { usePresentation } from "./hooks/usePresentation";
import type { PresentationSourceFile } from "./types";
import { SidebarItem } from "./SidebarItem";
import { PreviewOverlay } from "./PreviewOverlay";
import { CodeStudioGuide } from "./CodeStudioGuide";
import { Check, Copy, FileCode } from "lucide-react";

export function PresentationSidebar({
  entry,
  sourceFiles = [],
}: {
  entry: RegistryEntry;
  sourceFiles?: PresentationSourceFile[];
}) {
  const [query, setQuery] = useState("");
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [codeSubTab, setCodeSubTab] = useState<"guide" | "source">("guide");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const open = usePresentationStore((state) => state.sidebarOpen);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const activeTab = usePresentationStore((state) => state.sidebarTab);
  const setSidebarTab = usePresentationStore((state) => state.setSidebarTab);
  
  const isExpandedCode = activeTab === "code";
  const expandedWidth = Math.min(920, Math.max(300, Math.round(windowWidth * 0.94)));
  const currentWidth = isExpandedCode ? expandedWidth : 300;
  
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
  const [hoveredTab, setHoveredTab] = useState<"code" | null>(null);

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
            className="fixed bottom-0 left-0 z-40 flex h-dvh flex-col border-r border-white/10 p-0 shadow-2xl backdrop-blur-2xl"
            style={{
              backgroundColor: "#070707fa",
              boxShadow: isExpandedCode
                ? "0 0 100px rgba(0,0,0,0.95), 25px 0 70px rgba(0,0,0,0.75)"
                : "0 0 80px rgba(0,0,0,0.85)",
            }}
            initial={{ opacity: 0, x: -20, width: currentWidth }}
            animate={{ opacity: 1, x: 0, width: currentWidth }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
            role="navigation"
            aria-label="Component selector"
          >
            {/* Header Tabs: Horizontal row of icon buttons to the right of the trigger button */}
            <div className={`h-[44px] mb-4 mt-6 flex items-center justify-between shrink-0 pl-20 ${isExpandedCode ? "pr-8" : "pr-6"}`}>
              <div className="flex items-center gap-2.5">
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredTab("code")}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <motion.button
                    onClick={() => setSidebarTab(activeTab === "code" ? "navigator" : "code")}
                    whileHover={{ scale: 1.08, y: -1 }}
                    whileTap={{ scale: 0.94 }}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200 cursor-pointer ${
                      activeTab === "code"
                        ? "border-violet-400/40 text-violet-300"
                        : "border-white/25 text-white/50 hover:text-white/90 hover:border-white/35"
                    }`}
                    style={{
                      backgroundColor: "#171717",
                      boxShadow: activeTab === "code"
                        ? "inset 0 1.5px 0 0 rgba(167,139,250,0.12), inset 0 -1.5px 0 0 rgba(0,0,0,0.45), 0 0 14px rgba(139,92,246,0.18), 0 8px 24px rgba(0,0,0,0.5)"
                        : "inset 0 1.5px 0 0 rgba(255,255,255,0.10), inset 0 -1.5px 0 0 rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)",
                    }}
                    type="button"
                    aria-label="Code Studio"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {hoveredTab === "code" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5, x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.8, y: 5, x: "-50%" }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="absolute top-10 left-1/2 z-50 px-2.5 py-1 rounded-lg border border-white/10 bg-neutral-950 text-white/90 font-mono text-[9px] uppercase tracking-wider shadow-[0_5px_15px_rgba(0,0,0,0.6)] pointer-events-none whitespace-nowrap"
                      >
                        <div className="absolute -top-[4.5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-t border-l border-white/10 bg-neutral-950" />
                        <span className="relative z-10">Code</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sub-tab view toggle & Actions in Code mode */}
              {isExpandedCode ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-white/10 bg-black/50 p-1">
                    <button
                      onClick={() => setCodeSubTab("guide")}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-poppins text-xs font-medium transition-all cursor-pointer ${
                        codeSubTab === "guide"
                          ? "bg-violet-500/20 text-violet-200 border border-violet-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                          : "text-white/50 hover:text-white border border-transparent"
                      }`}
                    >
                      <span>Guide</span>
                    </button>
                    <button
                      onClick={() => setCodeSubTab("source")}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-poppins text-xs font-medium transition-all cursor-pointer ${
                        codeSubTab === "source"
                          ? "bg-violet-500/20 text-violet-200 border border-violet-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                          : "text-white/50 hover:text-white border border-transparent"
                      }`}
                    >
                      <span>Code</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSidebarTab("navigator")}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-poppins text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer active:scale-95"
                  >
                    <span>Navigator</span>
                  </button>
                </div>
              ) : (
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/20 select-none">
                  {activeTab === "navigator" ? "Explore" : activeTab}
                </span>
              )}
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
              codeSubTab === "guide" ? (
                <div className="flex-1 min-h-0 overflow-y-auto present-scroll px-8 pt-2">
                  <CodeStudioGuide
                    entry={entry}
                    sourceFiles={sourceFiles}
                    activeFileIndex={activeFileIndex}
                    onSelectFileIndex={setActiveFileIndex}
                    onSwitchToSource={() => setCodeSubTab("source")}
                  />
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col px-8 pb-6 pt-1">
                  {/* File selector & Action toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      {sourceFiles.length > 1 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {sourceFiles.map((file, i) => (
                            <button
                              key={file.path}
                              onClick={() => setActiveFileIndex(i)}
                              className={`px-3 py-1.5 text-xs font-mono border rounded-lg transition-all cursor-pointer ${
                                activeFileIndex === i
                                  ? "bg-violet-500/20 border-violet-500/40 text-white font-medium shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                                  : "border-white/10 bg-black/40 text-white/50 hover:text-white/80 hover:border-white/20"
                              }`}
                            >
                              {file.path.split("/").pop()}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-violet-400" />
                          <span className="font-mono text-xs font-medium text-white/90">
                            {currentFile?.path.split("/").pop()}
                          </span>
                          <span className="font-mono text-[10px] text-white/40">
                            ({currentFile?.code.split("\n").length ?? 0} lines)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCodeSubTab("guide")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer"
                      >
                        <span>Guide</span>
                      </button>

                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.2)] active:scale-95"
                      >
                        {codeCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-violet-300" />
                            <span className="font-medium">Copy Source</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Highlighted code viewport - wide, spacious, clean */}
                  <div className="relative group/code flex-1 min-h-0 overflow-hidden border border-white/10 rounded-2xl flex flex-col bg-[#050505] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                    <div
                      className="flex-1 overflow-auto p-6 text-xs font-mono leading-relaxed [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! present-scroll"
                      dangerouslySetInnerHTML={{ __html: currentFile?.html ?? "" }}
                    />
                  </div>
                </div>
              )
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
