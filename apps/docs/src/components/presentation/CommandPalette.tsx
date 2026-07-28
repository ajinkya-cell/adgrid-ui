"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Command,
  ArrowUpRight,
  CornerDownLeft,
  User,
  Layers,
  LayoutGrid,
} from "lucide-react";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { presentationEntries } from "./presentation-registry";
import { usePresentation } from "./hooks/usePresentation";
import { usePresentationSettings } from "./hooks/usePresentationSettings";

// Custom High-Quality Brand SVG Icons
const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function CommandPalette({ entry }: { entry: RegistryEntry }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const open = usePresentationStore((state) => state.commandPaletteOpen);
  const toggleCommandPalette = usePresentationStore((state) => state.toggleCommandPalette);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const toggleSettings = usePresentationStore((state) => state.toggleSettings);
  const presentation = usePresentation(entry);
  const { updateSettings } = usePresentationSettings();

  const closeThen = (run: () => void) => {
    run();
    toggleCommandPalette();
  };

  const connectItems = [
    {
      id: "conn-github",
      name: "GitHub Profile",
      category: "Connect",
      description: "github.com/ajinkya-cell",
      icon: <GithubIcon className="w-4 h-4" />,
      action: () => window.open("https://github.com/ajinkya-cell", "_blank"),
    },
    {
      id: "conn-linkedin",
      name: "LinkedIn Network",
      category: "Connect",
      description: "linkedin.com/in/ajinkya",
      icon: <LinkedinIcon className="w-4 h-4" />,
      action: () => window.open("https://linkedin.com", "_blank"),
    },
    {
      id: "conn-x",
      name: "X (Twitter)",
      category: "Connect",
      description: "x.com updates & announcements",
      icon: <XIcon className="w-4 h-4" />,
      action: () => window.open("https://x.com", "_blank"),
    },
    {
      id: "conn-portfolio",
      name: "Visit Portfolio",
      category: "Connect",
      description: "ajinkya.org personal portfolio",
      icon: <User className="w-4 h-4" />,
      action: () => window.open("https://ajinkya.org", "_blank"),
    },
  ];

  const actionItems = [
    {
      id: "act-exit",
      name: "Exit Presentation Mode",
      category: "Quick Actions",
      description: "Return to doc viewer",
      action: presentation.exit,
    },
    {
      id: "act-sidebar",
      name: "Toggle Component Navigator",
      category: "Quick Actions",
      description: "Open/close sidebar list",
      action: toggleSidebar,
    },
    {
      id: "act-settings",
      name: "Open Settings Panel",
      category: "Quick Actions",
      description: "Configure presentation environment",
      action: toggleSettings,
    },
    {
      id: "act-bg-solid",
      name: "Stage Background: Solid",
      category: "Quick Actions",
      description: "Switch to solid dark backdrop",
      action: () => updateSettings({ backgroundMode: "solid" }),
    },
    {
      id: "act-bg-grid",
      name: "Stage Background: Grid",
      category: "Quick Actions",
      description: "Switch to blueprint grid backdrop",
      action: () => updateSettings({ backgroundMode: "grid" }),
    },
    {
      id: "act-bg-aurora",
      name: "Stage Background: Aurora",
      category: "Quick Actions",
      description: "Switch to dynamic ambient aurora glow",
      action: () => updateSettings({ backgroundMode: "aurora" }),
    },
  ];

  // Robust Multi-token Matching for Components
  const filteredComponents = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return presentationEntries;

    const tokens = raw.split(/\s+/);
    return presentationEntries.filter((item) => {
      const searchTarget = `${item.name} ${item.slug} ${item.category} ${item.description}`.toLowerCase();
      return tokens.every((token) => searchTarget.includes(token));
    });
  }, [query]);

  const filteredConnect = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return connectItems;

    const tokens = raw.split(/\s+/);
    return connectItems.filter((item) => {
      const searchTarget = `${item.name} ${item.description}`.toLowerCase();
      return tokens.every((token) => searchTarget.includes(token));
    });
  }, [query]);

  const filteredActions = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return actionItems;

    const tokens = raw.split(/\s+/);
    return actionItems.filter((item) => {
      const searchTarget = `${item.name} ${item.description}`.toLowerCase();
      return tokens.every((token) => searchTarget.includes(token));
    });
  }, [query]);

  const allFilteredList = useMemo(() => {
    return [
      ...filteredConnect.map((c) => ({ type: "connect" as const, data: c })),
      ...filteredActions.map((a) => ({ type: "action" as const, data: a })),
      ...filteredComponents.map((comp) => ({ type: "component" as const, data: comp })),
    ];
  }, [filteredConnect, filteredActions, filteredComponents]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const executeItem = (item: (typeof allFilteredList)[number]) => {
    if (item.type === "connect") {
      closeThen(item.data.action);
    } else if (item.type === "action") {
      closeThen(item.data.action);
    } else if (item.type === "component") {
      closeThen(() => presentation.navigateTo(item.data));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh] font-['DM_Sans',sans-serif]">
          {/* DM Sans Font Loader */}
          <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCommandPalette}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            style={{
              backgroundColor: "#171717",
              boxShadow:
                "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.9), 0 30px 80px rgba(0, 0, 0, 0.75)",
            }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border-t border-white/[0.22] border-x border-white/[0.02] border-b border-white/10 p-4 select-none backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            {/* Header Search Input Well */}
            <div
              style={{
                backgroundColor: "#050505",
                boxShadow: "inset 0 1.5px 3.5px rgba(0, 0, 0, 0.85)",
              }}
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/[0.08]"
            >
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") toggleCommandPalette();
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) => {
                      if (prev === -1) return 0;
                      return prev < allFilteredList.length - 1 ? prev + 1 : 0;
                    });
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) => {
                      if (prev === -1) return allFilteredList.length - 1;
                      return prev > 0 ? prev - 1 : allFilteredList.length - 1;
                    });
                  }
                  if (e.key === "Enter" && selectedIndex >= 0 && allFilteredList[selectedIndex]) {
                    e.preventDefault();
                    executeItem(allFilteredList[selectedIndex]);
                  }
                }}
                placeholder="Search components, actions, social links..."
                className="w-full bg-transparent text-xs font-medium text-neutral-100 placeholder-neutral-500 font-['DM_Sans',sans-serif] focus:outline-none"
              />
              <kbd
                style={{
                  backgroundColor: "#121214",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.6)",
                }}
                className="px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-mono font-bold text-neutral-400 uppercase shrink-0 select-none"
              >
                ESC
              </kbd>
            </div>

            {/* Recessed Items Tray */}
            <div
              style={{
                backgroundColor: "#070707",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
              className="mt-3 p-2 rounded-xl border border-white/[0.05] max-h-[380px] overflow-y-auto space-y-3"
            >
              {allFilteredList.length === 0 ? (
                <div className="py-10 text-center space-y-2 font-['DM_Sans',sans-serif]">
                  <Command className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
                    No matching items found
                  </p>
                </div>
              ) : (
                <>
                  {/* Connect Section */}
                  {filteredConnect.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 pt-1 pb-1 text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold flex items-center justify-between">
                        <span>Connect</span>
                        <span className="text-[9px] text-neutral-600 font-mono">{filteredConnect.length} LINKS</span>
                      </div>
                      {filteredConnect.map((item) => {
                        const globalIdx = allFilteredList.findIndex(
                          (entry) => entry.type === "connect" && entry.data.id === item.id
                        );
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => closeThen(item.action)}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: "rgba(255, 255, 255, 0.10)",
                                    boxShadow:
                                      "inset 0 1px 0 0 rgba(255, 255, 255, 0.20), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 0 20px 0 rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0, 0, 0, 0.4)",
                                  }
                                : undefined
                            }
                            className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                              isSelected
                                ? "border border-white/20 text-white font-semibold"
                                : "border border-transparent text-neutral-300 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-white/15 border border-white/30 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                                    : "bg-[#050505] border border-white/10 text-neutral-400 group-hover:text-white"
                                }`}
                              >
                                {item.icon}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`block text-xs font-['DM_Sans',sans-serif] ${isSelected ? "text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "text-neutral-200 font-medium"}`}>
                                  {item.name}
                                </span>
                                <span className={`block text-[10px] font-['DM_Sans',sans-serif] truncate ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                                  {item.description}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 ml-3 flex items-center justify-center">
                              <ArrowUpRight className={`w-4 h-4 transition-all ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-neutral-500 group-hover:text-neutral-300"}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Actions Section */}
                  {filteredActions.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 pt-1 pb-1 text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold flex items-center justify-between">
                        <span>Quick Actions</span>
                        <span className="text-[9px] text-neutral-600 font-mono">{filteredActions.length} ACTIONS</span>
                      </div>
                      {filteredActions.map((item) => {
                        const globalIdx = allFilteredList.findIndex(
                          (entry) => entry.type === "action" && entry.data.id === item.id
                        );
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => closeThen(item.action)}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: "rgba(255, 255, 255, 0.10)",
                                    boxShadow:
                                      "inset 0 1px 0 0 rgba(255, 255, 255, 0.20), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 0 20px 0 rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0, 0, 0, 0.4)",
                                  }
                                : undefined
                            }
                            className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                              isSelected
                                ? "border border-white/20 text-white font-semibold"
                                : "border border-transparent text-neutral-300 hover:text-white"
                            }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className={`text-xs font-['DM_Sans',sans-serif] ${isSelected ? "text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "text-neutral-200 font-medium"}`}>
                                {item.name}
                              </span>
                              <span className={`text-[10px] font-['DM_Sans',sans-serif] truncate ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                                {item.description}
                              </span>
                            </div>
                            <div className="shrink-0 ml-3 flex items-center justify-center">
                              <CornerDownLeft className={`w-4 h-4 transition-all ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-neutral-500 group-hover:text-neutral-300"}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Components Section (ALL Components from registry) */}
                  {filteredComponents.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 pt-1 pb-1 text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold flex items-center justify-between">
                        <span>Components</span>
                        <span className="text-[9px] text-neutral-600 font-mono">{filteredComponents.length} COMPONENTS</span>
                      </div>
                      {filteredComponents.map((item) => {
                        const globalIdx = allFilteredList.findIndex(
                          (entry) => entry.type === "component" && entry.data.slug === item.slug
                        );
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <button
                            key={item.slug}
                            type="button"
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => closeThen(() => presentation.navigateTo(item))}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: "rgba(255, 255, 255, 0.10)",
                                    boxShadow:
                                      "inset 0 1px 0 0 rgba(255, 255, 255, 0.20), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 0 20px 0 rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0, 0, 0, 0.4)",
                                  }
                                : undefined
                            }
                            className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                              isSelected
                                ? "border border-white/20 text-white font-semibold"
                                : "border border-transparent text-neutral-300 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-white/15 border border-white/30 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                                    : "bg-[#050505] border border-white/10 text-neutral-400 group-hover:text-white"
                                }`}
                              >
                                <Layers className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`block text-xs font-['DM_Sans',sans-serif] ${isSelected ? "text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "text-neutral-200 font-medium"}`}>
                                  {item.name}
                                </span>
                                <span className={`block text-[10px] font-['DM_Sans',sans-serif] truncate ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                                  {item.category} • {item.description}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 ml-3 flex items-center justify-center">
                              <CornerDownLeft className={`w-4 h-4 transition-all ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-neutral-500 group-hover:text-neutral-300"}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 px-1 text-[11px] font-mono text-neutral-500 border-t border-white/5 mt-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-neutral-400 font-mono font-bold">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-neutral-400 font-mono font-bold">↵</kbd>
                  Open Component
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                <Command className="w-3 h-3 text-neutral-400" />
                AdGrid Vault
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
