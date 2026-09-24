"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Command,
  ArrowUpRight,
  CornerDownLeft,
  User,
  LayoutGrid,
  Copy,
  Layers,
  Zap,
  Sparkles,
  Terminal,
  Maximize2,
  Compass,
} from "lucide-react";
import { cn } from "../lib/utils";

// Custom High-Quality Brand SVG Icons
const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export interface CommandItem {
  id: string;
  label: string;
  category?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  url?: string;
  isExternal?: boolean;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback fired when palette closes */
  onClose?: () => void;
  /** Custom list of command items */
  items?: CommandItem[];
  /** Search input placeholder text */
  placeholder?: string;
  /** If true, renders inline inside container instead of fixed screen overlay modal */
  inline?: boolean;
  /** Custom class names */
  className?: string;
}

// Single Icon Right-Side Command Row Component
function CommandRow({
  item,
  isSelected,
  onClick,
}: {
  item: CommandItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const active = isSelected;

  return (
    <div
      onClick={onClick}
      style={
        active
          ? {
              backgroundColor: "rgba(255, 255, 255, 0.055)",
            }
          : undefined
      }
      className={cn(
        "relative flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer select-none transition-colors duration-150 group",
        active
          ? "border border-white/[0.08] text-white"
          : "border border-transparent text-neutral-300 hover:bg-white/[0.025] hover:text-white"
      )}
    >
      {/* Icon, Label & Description */}
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn("flex items-center justify-center shrink-0 [&>svg]:h-5 [&>svg]:w-5", active ? "text-neutral-100" : "text-neutral-500 group-hover:text-neutral-300")}>
          {item.icon || <Terminal className="w-5 h-5" />}
        </span>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs truncate",
                active ? "text-white font-medium" : "text-neutral-200"
              )}
            >
              {item.label}
            </span>
            {item.badge && (
              <span
                className={cn(
                  "text-[9px] tracking-wider px-1.5 py-0.5 rounded uppercase font-semibold shrink-0",
                  active
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-neutral-400 border border-white/10"
                )}
              >
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <span
              className={cn(
                "text-[10px] truncate",
                active ? "text-neutral-300" : "text-neutral-500"
              )}
            >
              {item.description}
            </span>
          )}
        </div>
      </div>

      {/* Right Side: Exactly ONE Single Action Icon */}
      <div className="shrink-0 ml-3 flex items-center justify-center">
        {item.isExternal || item.url?.startsWith("http") ? (
          <ArrowUpRight
            className={cn(
              "w-4 h-4 transition-colors",
              active ? "text-neutral-200" : "text-neutral-600 group-hover:text-neutral-400"
            )}
          />
        ) : (
          <CornerDownLeft
            className={cn(
              "w-4 h-4 transition-colors",
              active ? "text-neutral-200" : "text-neutral-600 group-hover:text-neutral-400"
            )}
          />
        )}
      </div>
    </div>
  );
}

// Complete Catalog of Items (Connect, Actions, & ALL AdGrid Components)
const defaultCommandItems: CommandItem[] = [
  // 1. CONNECT SECTION
  {
    id: "conn-github",
    label: "GitHub Profile",
    category: "Connect",
    description: "github.com/ajinkya-cell",
    url: "https://github.com/ajinkya-cell",
    isExternal: true,
    icon: <GithubIcon className="w-5 h-5" />,
    badge: "Official",
  },
  {
    id: "conn-linkedin",
    label: "LinkedIn Network",
    category: "Connect",
    description: "linkedin.com/in/ajinkya",
    url: "https://linkedin.com",
    isExternal: true,
    icon: <LinkedinIcon className="w-5 h-5" />,
  },
  {
    id: "conn-x",
    label: "X (Twitter)",
    category: "Connect",
    description: "x.com / twitter updates",
    url: "https://x.com",
    isExternal: true,
    icon: <XIcon className="w-5 h-5" />,
  },

  // 2. QUICK ACTIONS SECTION
  {
    id: "act-portfolio",
    label: "Visit Portfolio",
    category: "Quick Actions",
    description: "ajinkya.org personal portfolio",
    url: "https://ajinkya.org",
    isExternal: true,
    icon: <User className="w-5 h-5" />,
  },
  {
    id: "act-gallery",
    label: "Browse All Components",
    category: "Quick Actions",
    description: "Explore complete AdGrid UI component library",
    url: "/gallery",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    id: "act-copy-cli",
    label: "Copy CLI Install Command",
    category: "Quick Actions",
    description: "npx @adgrid-ui/cli add",
    icon: <Copy className="w-5 h-5" />,
    onSelect: () => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText("npx @adgrid-ui/cli add");
      }
    },
  },

  // 3. ALL COMPONENTS SECTION (Full Catalog)
  {
    id: "comp-image-parallax",
    label: "Image Parallax",
    category: "Components",
    description: "Smooth mouse-move & scroll-driven parallax perspective image",
    url: "/present/animated/image-parallax",
    icon: <Compass className="w-5 h-5" />,
    badge: "Popular",
  },
  {
    id: "comp-infinite-scroll",
    label: "Infinite Scroll",
    category: "Components",
    description: "Lenis & GSAP powered smooth parallax scroll engine",
    url: "/present/animated/infinite-scroll",
    icon: <Maximize2 className="w-5 h-5" />,
  },
  {
    id: "comp-image-reveal",
    label: "Image Reveal",
    category: "Components",
    description: "Diagonal stripe mask & sliding clip-path image reveal",
    url: "/present/animated/image-reveal",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "comp-sidebar",
    label: "Sidebar",
    category: "Components",
    description: "Skeuomorphic 3D tactile expandable sidebar navigation",
    url: "/present/animated/sidebar",
    icon: <Layers className="w-5 h-5" />,
    badge: "3D",
  },
  {
    id: "comp-command-palette",
    label: "Command Palette",
    category: "Components",
    description: "Tactile Cmd+K quick-search vault modal",
    url: "/present/animated/command-palette",
    icon: <Command className="w-5 h-5" />,
  },

  {
    id: "comp-pneumatic-button",
    label: "Pneumatic Press Button",
    category: "Components",
    description: "Skeuomorphic spring-loaded tactile push button",
    url: "/present/animated/pneumatic-button",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: "comp-neon-card",
    label: "Neon Glow Card",
    category: "Components",
    description: "Vibrant high-contrast glassmorphism card",
    url: "/present/animated/neon-card",
    icon: <Sparkles className="w-5 h-5" />,
  },
];

export function CommandPalette({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  items = defaultCommandItems,
  placeholder = "Search components, social links, or actions...",
  inline = false,
  className,
}: CommandPaletteProps) {
  const shouldReduceMotion = useReducedMotion();
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    }
    if (!isControlled) {
      setUncontrolledIsOpen(false);
    }
  }, [controlledOnClose, isControlled]);

  const handleOpen = useCallback(() => {
    if (!isControlled) {
      setUncontrolledIsOpen(true);
    }
  }, [isControlled]);

  // Global Cmd+K Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose, handleOpen]);

  // Robust Multi-word Token Search Filtering
  const filteredItems = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return items;

    const tokens = raw.split(/\s+/);
    return items.filter((item) => {
      const searchTarget = `${item.label} ${item.category || ""} ${item.description || ""} ${item.url || ""}`.toLowerCase();
      return tokens.every((token) => searchTarget.includes(token));
    });
  }, [items, searchQuery]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleSelect = (item: CommandItem) => {
    if (item.onSelect) {
      item.onSelect();
    }
    if (item.url) {
      if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.url;
      }
    }
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        if (prev === -1) return 0;
        return prev < filteredItems.length - 1 ? prev + 1 : 0;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        if (prev === -1) return filteredItems.length - 1;
        return prev > 0 ? prev - 1 : filteredItems.length - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape" && !inline) {
      e.preventDefault();
      handleClose();
    }
  };

  // Group items by category (Connect, Quick Actions, Components, etc.)
  const groupedItems = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filteredItems.forEach((item) => {
      const cat = item.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    return map;
  }, [filteredItems]);

  const paletteContent = (
    <motion.div
      key="skeuo-command-palette"
      initial={inline || shouldReduceMotion ? false : { scale: 0.98, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={inline || shouldReduceMotion ? undefined : { scale: 0.98, opacity: 0, y: -6 }}
      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.9), 0 30px 80px rgba(0, 0, 0, 0.75)",
        fontFamily: "Inter, var(--font-inter-loaded, sans-serif)",
      }}
      className={cn(
        "relative w-full max-w-xl rounded-2xl border-t border-white/[0.22] border-x border-white/[0.02] border-b border-white/10 overflow-hidden p-4 select-none",
        inline ? "mx-auto" : "",
        className
      )}
    >
      {/* Header Search Input Well */}
      <div
        style={{
          backgroundColor: "#050505",
          boxShadow: "inset 0 1.5px 3.5px rgba(0, 0, 0, 0.85)",
        }}
        className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/[0.08]"
      >
        <Search className="w-5 h-5 text-neutral-400 shrink-0" />
        <input
          type="text"
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-medium text-neutral-100 placeholder-neutral-500 focus:outline-none"
        />
        <span className="text-[10px] font-mono font-medium text-neutral-500 uppercase shrink-0 select-none">
          ESC
        </span>
      </div>

      {/* Command Items List / Debossed Recessed Tray */}
      <div
        style={{
          backgroundColor: "#070707",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
        className="mt-3 p-2 rounded-xl border border-white/[0.05] max-h-[360px] overflow-y-auto space-y-3"
      >
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Command className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              No matching results found
            </p>
          </div>
        ) : (
          Array.from(groupedItems.entries()).map(([category, catItems]) => (
            <div key={category} className="space-y-1">
              <div className="px-3 pt-1 pb-1 text-[10px] tracking-widest text-neutral-500 uppercase font-semibold flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[9px] text-neutral-600">{catItems.length}</span>
              </div>
              <div className="space-y-1">
                {catItems.map((item) => {
                  const globalIdx = filteredItems.indexOf(item);
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <CommandRow
                      key={item.id}
                      item={item}
                      isSelected={isSelected}
                      onClick={() => handleSelect(item)}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Instructions Bar */}
      <div className="flex items-center gap-4 pt-3 px-1 text-[11px] font-mono text-neutral-500 border-t border-white/5 mt-3 select-none">
        <span className="flex items-center gap-1.5">
          <span className="text-neutral-400 font-bold">↑↓</span>
          Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-neutral-400 font-bold">↵</span>
          Select
        </span>
      </div>
    </motion.div>
  );

  if (inline) {
    return paletteContent;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 cursor-default select-none"
        >
          {paletteContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const HoloCommandPalette = CommandPalette;
