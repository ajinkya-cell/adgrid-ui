"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { presentationEntries, groupPresentationEntries, groupForEntry } from "./presentation-registry";
import { SidebarSearch } from "./SidebarSearch";
import { usePresentation } from "./hooks/usePresentation";
import type { PresentationSourceFile } from "./types";
import { SidebarItem, SidebarGroupHeader } from "./SidebarItem";
import { PreviewOverlay } from "./PreviewOverlay";
import { CodeStudioGuide } from "./CodeStudioGuide";
import { Check, Copy } from "lucide-react";

// While the list scrolls, rows passing under a still pointer shouldn't count as hovers: that
// re-renders rows and opens live previews mid-scroll. Hover is switched off during a scroll and
// back on just after it stops.
function usePauseHoverWhileScrolling(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  onScrollStart: () => void
) {
  const onStart = useRef(onScrollStart);
  onStart.current = onScrollStart;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;
    let idle = 0;
    let scrolling = false;
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        if (contentRef.current) contentRef.current.style.pointerEvents = "none";
        onStart.current();
      }
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        scrolling = false;
        if (contentRef.current) contentRef.current.style.pointerEvents = "";
      }, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
      if (contentRef.current) contentRef.current.style.pointerEvents = "";
    };
  }, [scrollRef, contentRef, enabled]);
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
      return [item.name, item.slug, groupForEntry(item).label, item.description].some((value) =>
        value.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const flatResults = filteredEntries;
  const groups = useMemo(() => groupPresentationEntries(flatResults), [flatResults]);

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
  // Only keyboard moves scroll the list; pointer moves already have the row in view.
  const scrollOnMove = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const listContentRef = useRef<HTMLDivElement>(null);

  // Keyboard listener for navigation inside flat list
  useEffect(() => {
    if (!open || activeTab !== "navigator") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollOnMove.current = true;
        keyboardNav.current = true;
        setNavIndex((prev) => {
          const current = prev !== null && prev < flatResults.length ? prev : defaultIndex;
          return (current + 1) % flatResults.length;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollOnMove.current = true;
        keyboardNav.current = true;
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
    if (!open || !scrollOnMove.current) return;
    scrollOnMove.current = false;
    const activeEl = document.querySelector(`[data-sidebar-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex, open]);

  // On open, start with the current component in view.
  useEffect(() => {
    if (!open || activeTab !== "navigator") return;
    const frame = requestAnimationFrame(() => {
      document.querySelector(`[data-sidebar-index="${defaultIndex}"]`)?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab]);

  const handleNavigate = useCallback(
    (target: RegistryEntry) => {
      setHoveredEntry(null);
      setHoveredRect(null);
      toggleSidebar();
      presentation.navigateTo(target);
    },
    [toggleSidebar, presentation]
  );

  const navigateRef = useRef(handleNavigate);
  navigateRef.current = handleNavigate;
  const selectEntry = useCallback((target: RegistryEntry) => navigateRef.current(target), []);
  // Which input moved the highlight last: keyboard-driven scrolls keep it, pointer scrolls clear it.
  const keyboardNav = useRef(false);
  const pointAt = useCallback((index: number) => {
    keyboardNav.current = false;
    setNavIndex(index);
  }, []);

  usePauseHoverWhileScrolling(listRef, listContentRef, open && activeTab === "navigator", () => {
    if (keyboardNav.current) return;
    setNavIndex(null);
    setHoveredEntry(null);
    setHoveredRect(null);
  });

  const handleHoverChange = useCallback(
    (hEntry: RegistryEntry | null, hRect: DOMRect | null) => {
      setHoveredEntry(hEntry);
      setHoveredRect(hRect);
    },
    []
  );

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
            className="fixed bottom-0 left-0 z-40 flex h-dvh flex-col border-r border-white/[0.06] bg-[#0a0a0a] p-0"
            style={{
              boxShadow: "inset -1px 0 0 rgba(255,255,255,0.02), 24px 0 60px -20px rgba(0,0,0,0.9)",
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
                <div
                  role="tablist"
                  aria-label="Code view"
                  className="flex items-center gap-0.5 rounded-xl border border-white/[0.06] bg-[#070707] p-[3px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]"
                >
                  {(["guide", "source"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={codeSubTab === tab}
                      onClick={() => setCodeSubTab(tab)}
                      className={`h-7 cursor-pointer rounded-[9px] border px-3.5 font-inter text-xs font-medium tracking-tight transition-colors duration-150 ${
                        codeSubTab === tab
                          ? "border-white/[0.07] border-t-white/[0.13] bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)] text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.5)]"
                          : "border-transparent text-neutral-500 hover:text-neutral-200"
                      }`}
                    >
                      {tab === "guide" ? "Guide" : "Code"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content area based on selected tab */}
            {activeTab === "navigator" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="mb-3 pl-6 pr-6">
                  <div className="mb-3 flex items-baseline justify-between px-1">
                    <span className="font-inter text-sm font-medium tracking-tight text-neutral-100">Components</span>
                    <span className="font-inter text-xs text-neutral-500 tabular-nums">
                      {query ? `${flatResults.length} of ${presentationEntries.length}` : flatResults.length}
                    </span>
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

                {/* Grouped list on one continuous ruler. The edge fades are overlays: a mask on the
                    scroller itself would repaint the whole list on every scroll frame. */}
                <div className="relative min-h-0 flex-1 flex flex-col">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-[linear-gradient(180deg,#0a0a0a,transparent)]" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-[linear-gradient(0deg,#0a0a0a,transparent)]" />
                <div
                  ref={listRef}
                  role="menu"
                  onMouseLeave={() => setNavIndex(null)}
                  style={{ "--tick": "rgba(255,255,255,0.22)" } as React.CSSProperties}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div ref={listContentRef} className="relative pt-[10px] pb-10">
                    {groups.map((group, groupIndex) => (
                      <div key={group.id} role="group" aria-label={group.label}>
                        <SidebarGroupHeader label={group.label} count={group.entries.length} first={groupIndex === 0} />
                        {group.entries.map((item, i) => {
                          const idx = flatResults.indexOf(item);
                          return (
                            <div key={item.slug} data-sidebar-index={idx}>
                              <SidebarItem
                                entry={item}
                                active={item.slug === entry.slug}
                                isFocused={navIndex !== null && idx === activeIndex}
                                onSelect={selectEntry}
                                onHoverChange={handleHoverChange}
                                index={idx}
                                onPoint={pointAt}
                                first={i === 0}
                                last={i === group.entries.length - 1}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {flatResults.length === 0 && (
                    <div className="mx-6 mt-2 flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-[#0c0c0d] px-4 py-6 text-center">
                      <span className="font-inter text-[13px] font-medium text-neutral-200">No matches</span>
                      <span className="font-inter text-xs text-neutral-500">Try a name or a group, like “inputs”.</span>
                    </div>
                  )}
                </div>
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
                              className={`h-7 px-3 text-xs font-mono rounded-lg border transition-colors duration-150 cursor-pointer ${
                                activeFileIndex === i
                                  ? "border-white/[0.07] border-t-white/[0.13] bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)] text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.5)]"
                                  : "border-transparent text-neutral-500 hover:text-neutral-200"
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
                          <Check className="h-3.5 w-3.5 text-neutral-100" />
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
                          <span className="h-2 w-2 rounded-full bg-white/[0.1]" />
                          <span className="h-2 w-2 rounded-full bg-white/[0.1]" />
                          <span className="h-2 w-2 rounded-full bg-white/[0.1]" />
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
