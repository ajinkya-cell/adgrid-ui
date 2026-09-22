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
            {/* Header: Clearance for the 2 fixed trigger buttons on the left + Guide/Source toggle on right */}
            <div className={`h-[48px] mb-4 mt-6 flex items-center justify-end shrink-0 pl-64 ${isExpandedCode ? "pr-8" : "pr-6"}`}>
              {isExpandedCode && (
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.2)] active:scale-95"
                      >
                        {codeCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-violet-300" />
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
