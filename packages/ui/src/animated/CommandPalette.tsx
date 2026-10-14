"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Command,
  ArrowUpRight,
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
import { rankMatches } from "../primitives/search";

// Dialog + Combobox in the primitives' material: a raised panel on a native <dialog>, the results
// in a recessed tray, and the highlighted row rising out of the tray and gliding between rows.
// The input keeps focus the whole time; the list is driven through aria-activedescendant.

const EXIT_MS = 180;
const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)";
const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

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
  /** Keys shown on the right, e.g. ["⌘", "G"]. Display only. */
  shortcut?: string[];
  /** Extra words the search matches but doesn't show. */
  keywords?: string[];
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
  /** Handles internal urls, e.g. a client-side router push. Defaults to a full page load. */
  onNavigate?: (url: string) => void;
  /** Custom class names */
  className?: string;
}

const isExternalItem = (item: CommandItem) => Boolean(item.isExternal || item.url?.startsWith("http"));

// ─── Small parts ────────────────────────────────────────────────────────────

/** A tiny raised key. */
function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-grid h-5 min-w-5 place-items-center rounded-md px-1.5 font-sans text-[11px] leading-none font-medium text-neutral-400",
        "border border-white/[0.08] border-t-white/[0.12] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}

function CommandRow({
  item,
  optionId,
  active,
  highlightId,
  reduceMotion,
  onPoint,
  onChoose,
}: {
  item: CommandItem;
  optionId: string;
  active: boolean;
  highlightId: string;
  reduceMotion: boolean;
  onPoint: () => void;
  onChoose: () => void;
}) {
  return (
    <div
      id={optionId}
      role="option"
      aria-selected={active}
      data-active={active ? "" : undefined}
      onPointerMove={active ? undefined : onPoint}
      // Keep focus in the search field.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onChoose}
      className="group/row relative flex h-12 cursor-pointer items-center gap-3 rounded-xl px-2.5 select-none"
    >
      {/* The highlight: one raised segment that glides from row to row. */}
      {active && (
        <motion.span
          aria-hidden="true"
          layoutId={highlightId}
          transition={reduceMotion ? { duration: 0 } : SPRING}
          className={cn(
            "absolute inset-0 rounded-xl border border-white/[0.07] border-t-white/[0.13]",
            "bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_6px_14px_-6px_rgba(0,0,0,0.8),0_1px_3px_rgba(0,0,0,0.5)]"
          )}
        />
      )}

      <span
        aria-hidden="true"
        className={cn(
          "relative grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-[#070707]",
          "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
          "transition-colors duration-150 [&>svg]:size-4",
          active ? "text-neutral-100" : "text-neutral-500"
        )}
      >
        {item.icon || <Terminal />}
      </span>

      <span className="relative flex min-w-0 flex-1 items-baseline gap-2.5">
        <span
          className={cn(
            "shrink-0 truncate text-sm font-medium tracking-tight transition-colors duration-150",
            active ? "text-neutral-50" : "text-neutral-300"
          )}
        >
          {item.label}
        </span>
        {item.description && (
          <span
            className={cn(
              "min-w-0 truncate text-[13px] transition-colors duration-150",
              active ? "text-neutral-400" : "text-neutral-500"
            )}
          >
            {item.description}
          </span>
        )}
      </span>

      <span className="relative flex shrink-0 items-center gap-2">
        {item.badge && (
          <span className="inline-flex h-5 items-center rounded-md border border-white/[0.06] bg-[#070707] px-1.5 text-[11px] font-medium text-neutral-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
            {item.badge}
          </span>
        )}
        {item.shortcut ? (
          <span className="flex items-center gap-1">
            {item.shortcut.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </span>
        ) : isExternalItem(item) ? (
          <ArrowUpRight
            aria-hidden="true"
            className={cn("size-4 transition-colors duration-150", active ? "text-neutral-300" : "text-neutral-600")}
          />
        ) : null}
      </span>
    </div>
  );
}

// ─── Default content ────────────────────────────────────────────────────────

const defaultCommandItems: CommandItem[] = [
  {
    id: "act-gallery",
    label: "Browse components",
    category: "Quick actions",
    description: "The full AdGrid UI library",
    url: "/gallery",
    icon: <LayoutGrid />,
    shortcut: ["G", "C"],
  },
  {
    id: "act-copy-cli",
    label: "Copy install command",
    category: "Quick actions",
    description: "npx @adgrid-ui/cli add",
    icon: <Copy />,
    keywords: ["cli", "terminal", "npm"],
    onSelect: () => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText("npx @adgrid-ui/cli add");
      }
    },
  },
  {
    id: "act-portfolio",
    label: "Visit portfolio",
    category: "Quick actions",
    description: "ajinkya.org",
    url: "https://ajinkya.org",
    isExternal: true,
    icon: <User />,
  },
  {
    id: "comp-image-parallax",
    label: "Image Parallax",
    category: "Components",
    description: "Mouse and scroll driven depth",
    url: "/present/animated/image-parallax",
    icon: <Compass />,
    badge: "Popular",
  },
  {
    id: "comp-infinite-scroll",
    label: "Infinite Scroll",
    category: "Components",
    description: "Lenis and GSAP parallax scroll",
    url: "/present/animated/infinite-scroll",
    icon: <Maximize2 />,
  },
  {
    id: "comp-image-reveal",
    label: "Image Reveal",
    category: "Components",
    description: "Striped clip-path reveal",
    url: "/present/animated/image-reveal",
    icon: <Sparkles />,
  },
  {
    id: "comp-sidebar",
    label: "Sidebar",
    category: "Components",
    description: "Tactile expandable navigation",
    url: "/present/animated/sidebar",
    icon: <Layers />,
  },
  {
    id: "comp-command-palette",
    label: "Command Palette",
    category: "Components",
    description: "This one",
    url: "/present/animated/command-palette",
    icon: <Command />,
  },
  {
    id: "comp-pneumatic-button",
    label: "Pneumatic Button",
    category: "Components",
    description: "Spring-loaded push button",
    url: "/present/animated/pneumatic-button",
    icon: <Zap />,
  },
  {
    id: "conn-github",
    label: "GitHub",
    category: "Connect",
    description: "github.com/ajinkya-cell",
    url: "https://github.com/ajinkya-cell",
    isExternal: true,
    icon: <GithubIcon />,
  },
  {
    id: "conn-linkedin",
    label: "LinkedIn",
    category: "Connect",
    description: "linkedin.com/in/ajinkya",
    url: "https://linkedin.com",
    isExternal: true,
    icon: <LinkedinIcon />,
  },
  {
    id: "conn-x",
    label: "X",
    category: "Connect",
    description: "x.com",
    url: "https://x.com",
    isExternal: true,
    icon: <XIcon />,
    keywords: ["twitter"],
  },
];

// ─── Search ─────────────────────────────────────────────────────────────────

/** Every word must match somewhere; label hits rank above description hits. Groups keep their first-seen order. */
function search(items: CommandItem[], query: string) {
  const results = rankMatches(
    items,
    query,
    (item) => item.label,
    (item) => [item.label, item.category, item.description, item.url, ...(item.keywords ?? [])].join(" ")
  );

  const groups = new Map<string, CommandItem[]>();
  for (const item of results) {
    const key = item.category || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  // Keyboard order follows what's on screen, group by group.
  const ordered = Array.from(groups.values()).flat();
  return { groups: Array.from(groups.entries()), ordered };
}

// ─── Palette ────────────────────────────────────────────────────────────────

export function CommandPalette({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  items = defaultCommandItems,
  placeholder = "Search components, actions and links…",
  inline = false,
  onNavigate,
  className,
}: CommandPaletteProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [state, setState] = useState<"open" | "closed">("closed");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollOnChange = useRef(false);

  const baseId = useId();
  const listId = `${baseId}-list`;
  const highlightId = `${baseId}-highlight`;
  const optionId = (id: string) => `${baseId}-option-${id}`;

  const isControlled = controlledIsOpen !== undefined;
  const open = inline || (isControlled ? controlledIsOpen : uncontrolledIsOpen);

  const handleClose = useCallback(() => {
    controlledOnClose?.();
    if (!isControlled) setUncontrolledIsOpen(false);
  }, [controlledOnClose, isControlled]);
  const closeRef = useRef(handleClose);
  closeRef.current = handleClose;

  // ⌘K / Ctrl+K toggles from anywhere. When controlled, the owner binds its own shortcut.
  useEffect(() => {
    if (inline || isControlled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) handleClose();
        else setUncontrolledIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inline, isControlled, open, handleClose]);

  // Same lifecycle as the Dialog primitive: showModal, then animate in; animate out, then close.
  useEffect(() => {
    if (inline) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        inputRef.current?.focus();
      }
      const frame = requestAnimationFrame(() => setState("open"));
      return () => cancelAnimationFrame(frame);
    }
    setState("closed");
    if (!dialog.open) return;
    const timer = window.setTimeout(() => {
      dialog.close();
      setQuery("");
      setActiveIndex(0);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [inline, open]);

  useEffect(() => {
    if (inline || !open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [inline, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (inline || !dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [inline]);

  const { groups, ordered } = useMemo(() => search(items, query), [items, query]);
  const active = ordered[Math.min(activeIndex, ordered.length - 1)];

  useEffect(() => {
    setActiveIndex(0);
    listRef.current?.scrollTo({ top: 0 });
  }, [query]);

  // Keyboard moves bring the row into view; pointer moves never scroll.
  useEffect(() => {
    if (!scrollOnChange.current || !active) return;
    scrollOnChange.current = false;
    document.getElementById(optionId(active.id))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const choose = (item: CommandItem) => {
    item.onSelect?.();
    if (item.url) {
      if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else if (onNavigate) {
        onNavigate(item.url);
      } else {
        window.location.href = item.url;
      }
    }
    if (!inline) handleClose();
  };

  const move = (next: number) => {
    if (!ordered.length) return;
    scrollOnChange.current = true;
    setActiveIndex((next + ordered.length) % ordered.length);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const current = Math.min(activeIndex, ordered.length - 1);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(current - 1);
    } else if (event.key === "Home" && event.ctrlKey) {
      event.preventDefault();
      move(0);
    } else if (event.key === "End" && event.ctrlKey) {
      event.preventDefault();
      move(ordered.length - 1);
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      choose(active);
    }
  };

  const actionLabel = !active ? null : isExternalItem(active) ? "Open link" : active.url ? "Go to page" : "Run command";

  const panel = (
    <div
      data-state={inline ? "open" : state}
      className={cn(
        "relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-3xl text-neutral-100",
        "border border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
        "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_40px_100px_-20px_rgba(0,0,0,0.9),0_8px_24px_-6px_rgba(0,0,0,0.7)]",
        !inline && [
          "max-h-[calc(100dvh-24vh)]",
          // Exit (default): quick and accelerating. Entrance: slower and settling.
          "-translate-y-2 scale-[0.98] opacity-0 blur-[4px]",
          "transition-[opacity,translate,scale,filter] duration-[180ms] ease-[cubic-bezier(0.4,0,1,1)]",
          "data-[state=open]:translate-y-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=open]:blur-[0px]",
          "data-[state=open]:duration-[260ms] data-[state=open]:ease-[cubic-bezier(0.32,0.72,0,1)]",
          "motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-[0px]",
        ],
        inline && "mx-auto",
        className
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1.5px]" style={{ background: PRISMATIC }} />

      {/* Search: set straight into the panel, no box of its own. */}
      <div className="flex h-[60px] shrink-0 items-center gap-3 px-5">
        <Search aria-hidden="true" className="size-[18px] shrink-0 text-neutral-500" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active.id) : undefined}
          aria-label="Search commands"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500"
        />
        {inline ? (
          <span className="flex shrink-0 items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 cursor-pointer rounded-md outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
            aria-label="Close"
          >
            <Kbd className="transition-colors duration-150 hover:text-neutral-200">Esc</Kbd>
          </button>
        )}
      </div>

      {/* Results sit in a tray cut into the panel. */}
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Commands"
        className={cn(
          "mx-2 min-h-0 overflow-y-auto overscroll-contain rounded-2xl border border-black/50 bg-[#0c0c0d] p-1",
          "shadow-[inset_0_2px_6px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.05)]",
          "max-h-[min(400px,52dvh)] [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]"
        )}
      >
        {ordered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full border border-white/[0.06] bg-[#070707] text-neutral-500 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]"
            >
              <Search className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium tracking-tight text-neutral-100">No results for “{query.trim()}”</p>
              <p className="text-[13px] leading-relaxed text-neutral-500">Try a component name, an action or a link.</p>
            </div>
          </div>
        ) : (
          <LayoutGroup id={baseId}>
            {groups.map(([category, groupItems], groupIndex) => (
              <div key={category} role="group" aria-labelledby={`${baseId}-group-${groupIndex}`}>
                <div
                  id={`${baseId}-group-${groupIndex}`}
                  className={cn("px-3 pb-1.5 text-xs font-medium text-neutral-500", groupIndex === 0 ? "pt-2" : "pt-3.5")}
                >
                  {category}
                </div>
                {groupItems.map((item) => (
                  <CommandRow
                    key={item.id}
                    item={item}
                    optionId={optionId(item.id)}
                    active={item === active}
                    highlightId={highlightId}
                    reduceMotion={reduceMotion}
                    onPoint={() => setActiveIndex(ordered.indexOf(item))}
                    onChoose={() => choose(item)}
                  />
                ))}
              </div>
            ))}
          </LayoutGroup>
        )}
      </div>

      {/* Footer: how to drive it, and what Enter will do right now. */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-4 px-5 text-xs text-neutral-500">
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </span>
          Navigate
        </span>
        {actionLabel && (
          <span className="flex items-center gap-2">
            {actionLabel}
            <Kbd>↵</Kbd>
          </span>
        )}
      </div>
    </div>
  );

  if (inline) return panel;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      data-state={state}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      className={cn(
        "group/palette mx-auto mt-[12vh] mb-auto h-fit max-h-none w-[calc(100vw-32px)] max-w-[640px] overflow-visible border-0 bg-transparent p-0 outline-none",
        "backdrop:bg-black/60 backdrop:opacity-0 backdrop:backdrop-blur-[3px]",
        "backdrop:transition-opacity backdrop:duration-[180ms]",
        "data-[state=open]:backdrop:opacity-100 data-[state=open]:backdrop:duration-[260ms]"
      )}
    >
      {panel}
    </dialog>
  );
}

export const HoloCommandPalette = CommandPalette;
