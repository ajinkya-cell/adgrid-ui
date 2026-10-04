"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
import { Check, Copy } from "lucide-react";

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
  const defaultIndex = useMemo(() => {
    const idx = flatResults.findIndex((item) => item.slug === entry.slug);
    return idx !== -1 ? idx : 0;
  }, [flatResults, entry.slug]);

  const [navIndex, setNavIndex] = useState<number | null>(null);
  const activeIndex = navIndex !== null && navIndex < flatResults.length ? navIndex : defaultIndex;
  const [hoveredEntry, setHoveredEntry] = useState<RegistryEntry | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  // Keyboard listener for navigation inside flat list
  useEffect(() => {
    if (!open || activeTab !== "navigator") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setNavIndex((prev) => {
          const current = prev !== null && prev < flatResults.length ? prev : defaultIndex;
          return (current + 1) % flatResults.length;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setNavIndex((prev) => {
          const current = prev !== null && prev < flatResults.length ? prev : defaultIndex;
          return (current - 1 + flatResults.length) % flatResults.length;
        });
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
  }, [open, activeTab, flatResults, activeIndex, defaultIndex, toggleSidebar, presentation]);

  // Smooth scroll item container on active index changes
  useEffect(() => {
    if (!open) return;
    const activeEl = document.querySelector(`[data-sidebar-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex, open]);

  const handleNavigate = useCallback(
    (target: RegistryEntry) => {
      setHoveredEntry(null);
      setHoveredRect(null);
      toggleSidebar();
      presentation.navigateTo(target);
    },
    [toggleSidebar, presentation]
  );

  const handleHoverChange = useCallback(
    (hEntry: RegistryEntry | null, hRect: DOMRect | null) => {
      setHoveredEntry(hEntry);
      setHoveredRect(hRect);
    },
    []
  );

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
            {/* Header: Clearance for the 2 fixed trigger buttons on the left + Guide/Source toggle on right */}
            <div className={`h-[48px] mb-4 mt-6 flex items-center justify-end shrink-0 pl-64 ${isExpandedCode ? "pr-8" : "pr-6"}`}>
              {isExpandedCode && (
                <div className="relative flex items-center rounded-full border border-white/10 bg-[#0d0d0d] p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                  <button
                    onClick={() => setCodeSubTab("guide")}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-medium transition-all cursor-pointer ${
                      codeSubTab === "guide"
                        ? "bg-white text-black font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                        : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    <span>Guide</span>
                  </button>
                  <button
                    onClick={() => setCodeSubTab("source")}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-medium transition-all cursor-pointer ${
                      codeSubTab === "source"
                        ? "bg-white text-black font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                        : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    <span>Code</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content area based on selected tab */}
            {activeTab === "navigator" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="mb-4 pl-9 pr-6">
                  <div className="mb-3">
                   
                    <div className="mt-1 text-xs text-white/60 font-medium">{flatResults.length} components</div>
                  </div>
                  <SidebarSearch
                    value={query}
                    onChange={(val) => {
                      setQuery(val);
                      setNavIndex(null);
                    }}
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
                        onSelect={handleNavigate}
                        onHoverChange={handleHoverChange}
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
                              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                                activeFileIndex === i
                                  ? "bg-white text-black font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-white/40"
                                  : "border border-white/10 bg-black/40 text-white/50 hover:text-white/80 hover:border-white/20"
                              }`}
                            >
                              {file.path.split("/").pop()}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
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
                        onClick={handleCopyCode}
                        title={codeCopied ? "Copied!" : "Copy code"}
                        aria-label={codeCopied ? "Copied!" : "Copy code"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white/60 hover:text-white transition-all cursor-pointer active:scale-95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                      >
                        {codeCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-white/60" />
                        )}
                      </button>
                    </div>
                  </div>

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
