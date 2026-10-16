"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { rankMatches } from "./search";

// A grouped navigation list hung off a ruler: every 30px row carries six evenly spaced ticks
// (5px pitch), one of them level with the label, so the ticks run unbroken down each group.
// Each group's ruler starts on its first item's label tick and ends on its last one's; group
// headings stand clear of it.
//
// When the pointer (or keyboard) reaches a row, its label tick stretches out and lights up and
// the label springs right, overshooting a touch before it settles. Leaving, it eases back on a
// calmer spring, so moving down the list leaves a soft trail of rows settling behind the pointer.
// The current item keeps its tick extended and its label shifted.

export interface RulerNavItem {
  id: string;
  label: string;
  /** Extra words the search matches on, e.g. a description or aliases */
  keywords?: string;
  /** "new" draws a small dot; anything else renders as a quiet trailing badge */
  badge?: "new" | React.ReactNode;
  disabled?: boolean;
}

export interface RulerNavGroup {
  id: string;
  label: string;
  items: RulerNavItem[];
}

export interface RulerNavProps {
  groups: RulerNavGroup[];
  /** Current item id (controlled) */
  value?: string;
  /** Initial current item id (uncontrolled) */
  defaultValue?: string;
  /** Called when an item is chosen by click or Enter */
  onValueChange?: (id: string, item: RulerNavItem) => void;
  /** Called after the pointer rests on a row for a moment, with the row's rect; null when it leaves. Use it for hover previews. */
  onHoverItem?: (item: RulerNavItem | null, rect: DOMRect | null) => void;
  /** Heading above the search (default: "Components") */
  title?: React.ReactNode;
  /** Show the search field (default: true) */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Group headings fold their group away when clicked (default: true) */
  collapsible?: boolean;
  /** Group ids that start folded */
  defaultCollapsed?: string[];
  /** Color of the lit tick and the current item's marker (default: "#fafafa") */
  accent?: string;
  /** Show item counts on the title and group headings (default: true) */
  showCounts?: boolean;
  /** Message shown when the search matches nothing */
  emptyMessage?: React.ReactNode;
  className?: string;
}

// Entering: a soft spring with a visible bounce. Leaving: no bounce, so the trail reads smooth.
const ENTER = { type: "spring", stiffness: 260, damping: 14, mass: 0.6 } as const;
const LEAVE = { type: "spring", stiffness: 220, damping: 26, mass: 0.7 } as const;
// The label tick (row centre, 15px) and the five around it, on a 5px grid. The first row of a
// group drops the ones above its label, the last row the ones below.
const ABOVE = [0, 5, 10];
const LABEL_TICK = 15;
const BELOW = [20, 25];
const ROW = 30;
const TICK = 14;
const LIT_LENGTH = 34;
const SHIFT = 10;

// A line width in whole device pixels. A 1px line at 125% scaling is 1.25 device pixels, which
// crispEdges rounds to 1 or 2 depending on where it lands, so every few ticks came out thick.
function subscribeToPixelRatio(onChange: () => void) {
  let query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  const listen = () => {
    onChange();
    query.removeEventListener("change", listen);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener("change", listen);
  };
  query.addEventListener("change", listen);
  return () => query.removeEventListener("change", listen);
}
function useHairline() {
  return useSyncExternalStore(
    subscribeToPixelRatio,
    () => Math.max(1, Math.floor(window.devicePixelRatio)) / window.devicePixelRatio,
    () => 1
  );
}

function RowTicks({ first, last }: { first: boolean; last: boolean }) {
  const ticks = [...(first ? [] : ABOVE), LABEL_TICK, ...(last ? [] : BELOW)];
  const hairline = useHairline();
  return (
    <svg
      aria-hidden="true"
      width={TICK}
      height={ROW}
      shapeRendering="crispEdges"
      className="pointer-events-none absolute top-0 left-6 overflow-visible"
    >
      {ticks.map((y) => (
        <line key={y} x1={0} x2={TICK} y1={y} y2={y} strokeWidth={hairline} stroke="rgba(255,255,255,0.22)" />
      ))}
    </svg>
  );
}

/** The label with the part matching the search drawn brighter. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-neutral-50 underline decoration-white/30 underline-offset-[3px]">
        {text.slice(at, at + q.length)}
      </span>
      {text.slice(at + q.length)}
    </>
  );
}

interface RowProps {
  item: RulerNavItem;
  domId: string;
  index: number;
  current: boolean;
  focused: boolean;
  first: boolean;
  last: boolean;
  query: string;
  accent: string;
  onSelect: (item: RulerNavItem) => void;
  onPoint: (index: number) => void;
  onHover?: (item: RulerNavItem | null, rect: DOMRect | null) => void;
}

const Row = memo(function Row({
  item,
  domId,
  index,
  current,
  focused,
  first,
  last,
  query,
  accent,
  onSelect,
  onPoint,
  onHover,
}: RowProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const rowRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lit = (current || focused) && !item.disabled;
  const hairline = useHairline();
  const transition = reduceMotion ? { duration: 0 } : lit ? ENTER : LEAVE;

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  return (
    <div
      ref={rowRef}
      id={domId}
      data-item-id={item.id}
      role="option"
      aria-selected={current}
      aria-disabled={item.disabled || undefined}
      onMouseEnter={() => {
        onPoint(index);
        if (!onHover) return;
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        // a short rest before reporting, so quick passes don't churn a preview
        hoverTimer.current = setTimeout(() => {
          if (rowRef.current) onHover(item, rowRef.current.getBoundingClientRect());
        }, 160);
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        onHover?.(null, null);
      }}
      onClick={() => !item.disabled && onSelect(item)}
      className={`relative flex h-[30px] items-center pr-6 pl-[58px] select-none ${
        item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      }`}
    >
      <RowTicks first={first} last={last} />
      {/* The label tick lit: a line over the resting one, pinned at the same left edge and
          growing only to the right. Its end point animates (not a scale), so it stays crisp. */}
      <svg
        aria-hidden="true"
        width={LIT_LENGTH}
        height={ROW}
        shapeRendering="crispEdges"
        className="pointer-events-none absolute top-0 left-6 overflow-visible"
      >
        <motion.line
          x1={0}
          y1={LABEL_TICK}
          y2={LABEL_TICK}
          strokeWidth={hairline}
          stroke={accent}
          initial={false}
          animate={{ x2: lit ? LIT_LENGTH : TICK, opacity: lit ? 1 : 0 }}
          // Length bounces; brightness just eases, so it never flickers through the overshoot.
          transition={{ ...transition, opacity: { duration: reduceMotion ? 0 : lit ? 0.12 : 0.28, ease: "easeOut" } }}
        />
      </svg>

      <motion.span
        initial={false}
        animate={{ x: lit ? SHIFT : 0 }}
        transition={transition}
        className={`flex min-w-0 flex-1 items-center gap-2 font-inter text-[14px] tracking-[-0.01em] transition-colors duration-200 ${
          lit ? "text-neutral-50" : "text-neutral-400"
        } ${current ? "font-medium" : ""}`}
      >
        <span className="truncate">
          <Highlighted text={item.label} query={query} />
        </span>
        {item.badge === "new" ? (
          <span aria-label="New" className="size-[5px] shrink-0 rounded-full bg-neutral-300" />
        ) : item.badge != null ? (
          <span className="ml-auto shrink-0 rounded-md border border-white/[0.06] bg-[#0f0f10] px-1.5 py-px font-inter text-[10px] text-neutral-500 tabular-nums shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            {item.badge}
          </span>
        ) : null}
      </motion.span>
    </div>
  );
});

/** A group heading: stands clear of the ruler; folds its group away when collapsible. */
function GroupHeader({
  label,
  count,
  first,
  collapsible,
  collapsed,
  showCount,
  controls,
  onToggle,
}: {
  label: string;
  count: number;
  first: boolean;
  collapsible: boolean;
  collapsed: boolean;
  showCount: boolean;
  controls: string;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const content = (
    <>
      <span className="font-inter text-[15px] font-medium tracking-[-0.015em] text-neutral-100">{label}</span>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.07),transparent)]" />
      {showCount && <span className="font-inter text-xs text-neutral-600 tabular-nums">{count}</span>}
      {collapsible && (
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          width="10"
          height="10"
          fill="none"
          className="shrink-0 text-neutral-600 transition-colors group-hover/header:text-neutral-300"
          initial={false}
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
        >
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      )}
    </>
  );
  const className = `group/header relative flex h-[40px] w-full items-center gap-3 pr-6 pl-[58px] text-left select-none ${
    first ? "" : "mt-[10px]"
  }`;
  return collapsible ? (
    <button
      type="button"
      tabIndex={-1}
      aria-expanded={!collapsed}
      aria-controls={controls}
      onClick={onToggle}
      className={`${className} cursor-pointer`}
    >
      {content}
    </button>
  ) : (
    <div role="presentation" className={className}>
      {content}
    </div>
  );
}

export function RulerNav({
  groups,
  value,
  defaultValue,
  onValueChange,
  onHoverItem,
  title = "Components",
  searchable = true,
  searchPlaceholder = "Search",
  collapsible = true,
  defaultCollapsed = [],
  accent = "#fafafa",
  showCounts = true,
  emptyMessage = "No matches. Try another word.",
  className = "",
}: RulerNavProps) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentId = value !== undefined ? value : innerValue;
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(defaultCollapsed));
  const [navIndex, setNavIndex] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Only keyboard moves scroll the list; pointer moves already have the row in view.
  const scrollOnMove = useRef(false);
  const keyboardNav = useRef(false);

  const totalItems = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);
  const searching = query.trim().length > 0;

  // Filter each group with the shared ranking, keeping group order; empty groups drop out.
  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: searching
            ? rankMatches(group.items, query, (i) => i.label, (i) => `${i.label} ${group.label} ${i.keywords ?? ""}`)
            : group.items,
        }))
        .filter((group) => group.items.length > 0),
    [groups, query, searching]
  );
  const matchCount = visibleGroups.reduce((n, g) => n + g.items.length, 0);

  // Rows the keyboard can reach: folded groups are skipped, except while searching.
  const flat = useMemo(
    () =>
      visibleGroups.flatMap((group) =>
        !searching && collapsed.has(group.id) ? [] : group.items.filter((i) => !i.disabled)
      ),
    [visibleGroups, collapsed, searching]
  );
  const indexOf = useMemo(() => new Map(flat.map((item, i) => [item.id, i])), [flat]);
  const currentIndex = currentId !== undefined ? indexOf.get(currentId) ?? -1 : -1;
  const activeIndex = navIndex !== null && navIndex < flat.length ? navIndex : currentIndex;

  const select = useCallback(
    (item: RulerNavItem) => {
      if (value === undefined) setInnerValue(item.id);
      onValueChange?.(item.id, item);
    },
    [value, onValueChange]
  );
  const selectRef = useRef(select);
  selectRef.current = select;
  const stableSelect = useCallback((item: RulerNavItem) => selectRef.current(item), []);

  const pointAt = useCallback((index: number) => {
    keyboardNav.current = false;
    setNavIndex(index);
  }, []);

  const move = (to: number) => {
    if (flat.length === 0) return;
    scrollOnMove.current = true;
    keyboardNav.current = true;
    setNavIndex(((to % flat.length) + flat.length) % flat.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const from = activeIndex < 0 ? -1 : activeIndex;
    const inSearch = event.target === searchRef.current;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(from + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(from < 0 ? flat.length - 1 : from - 1);
        break;
      case "Home":
        if (inSearch) return;
        event.preventDefault();
        move(0);
        break;
      case "End":
        if (inSearch) return;
        event.preventDefault();
        move(flat.length - 1);
        break;
      case "Enter": {
        const target = flat[activeIndex] ?? flat[0];
        if (target) {
          event.preventDefault();
          select(target);
        }
        break;
      }
      case "Escape":
        if (query) {
          event.preventDefault();
          setQuery("");
          setNavIndex(null);
        }
        break;
      case "/":
        if (!inSearch && searchRef.current) {
          event.preventDefault();
          searchRef.current.focus();
        }
        break;
    }
  };

  // Keep the keyboard highlight in view.
  useEffect(() => {
    if (!scrollOnMove.current) return;
    scrollOnMove.current = false;
    const id = flat[activeIndex]?.id;
    const el = id ? listRef.current?.querySelector(`[data-item-id="${CSS.escape(id)}"]`) : null;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, flat]);

  // Start with the current item in view.
  useEffect(() => {
    if (currentId === undefined) return;
    const frame = requestAnimationFrame(() => {
      const el = listRef.current?.querySelector(`[data-item-id="${CSS.escape(currentId)}"]`);
      el?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While the list scrolls, rows passing under a still pointer shouldn't count as hovers: that
  // re-renders rows and fires previews mid-scroll. Hover is off during a scroll and back just after.
  const onHoverRef = useRef(onHoverItem);
  onHoverRef.current = onHoverItem;
  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    let idle = 0;
    let scrolling = false;
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        if (contentRef.current) contentRef.current.style.pointerEvents = "none";
        if (!keyboardNav.current) {
          setNavIndex(null);
          onHoverRef.current?.(null, null);
        }
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
    };
  }, []);

  const toggleGroup = (id: string) => {
    setNavIndex(null);
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className={`flex h-full min-h-0 flex-col bg-[#0a0a0a] ${className}`}
    >
      {(title || searchable) && (
        <div className="mb-3 shrink-0 px-6 pt-5">
          {title && (
            <div className="mb-3 flex items-baseline justify-between px-1">
              <span className="font-inter text-sm font-medium tracking-tight text-neutral-100">{title}</span>
              {showCounts && (
                <span className="font-inter text-xs text-neutral-500 tabular-nums">
                  {searching ? `${matchCount} of ${totalItems}` : totalItems}
                </span>
              )}
            </div>
          )}
          {searchable && (
            <label
              className={[
                "flex h-9 w-full items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#070707] px-3",
                "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
                "transition-[border-color,background-color] duration-150 hover:border-white/[0.13]",
                "has-[input:focus]:border-white/[0.18] has-[input:focus]:bg-[#050505]",
              ].join(" ")}
            >
              <span className="sr-only">Search</span>
              <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" className="shrink-0 text-neutral-500">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setNavIndex(null);
                }}
                placeholder={searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls={`${uid}-list`}
                aria-activedescendant={flat[activeIndex] ? `${uid}-${flat[activeIndex].id}` : undefined}
                className="h-full min-w-0 flex-1 bg-transparent font-inter text-[13px] tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setQuery("")}
                  className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-md text-neutral-500 transition-colors duration-150 hover:text-neutral-100"
                >
                  <svg viewBox="0 0 12 12" width="9" height="9" fill="none" aria-hidden="true">
                    <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <kbd className="shrink-0 rounded-[5px] border border-white/[0.08] bg-white/[0.03] px-1.5 font-inter text-[10px] leading-4 text-neutral-500">
                  /
                </kbd>
              )}
            </label>
          )}
        </div>
      )}

      {/* The edge fades are overlays: a mask on the scroller itself would repaint the whole list on
          every scroll frame. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-[linear-gradient(180deg,#0a0a0a,transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-[linear-gradient(0deg,#0a0a0a,transparent)]" />
        <div
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={searchable ? -1 : 0}
          aria-label={typeof title === "string" ? title : "Navigation"}
          aria-activedescendant={!searchable && flat[activeIndex] ? `${uid}-${flat[activeIndex].id}` : undefined}
          onMouseLeave={() => setNavIndex(null)}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div ref={contentRef} className="relative pt-[10px] pb-10">
            {visibleGroups.map((group, groupIndex) => {
              const folded = !searching && collapsed.has(group.id);
              return (
                <div key={group.id} role="group" aria-label={group.label}>
                  <GroupHeader
                    label={group.label}
                    count={group.items.length}
                    first={groupIndex === 0}
                    collapsible={collapsible && !searching}
                    collapsed={folded}
                    showCount={showCounts}
                    controls={`${uid}-group-${group.id}`}
                    onToggle={() => toggleGroup(group.id)}
                  />
                  <AnimatePresence initial={false}>
                    {!folded && (
                      <motion.div
                        id={`${uid}-group-${group.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 36, opacity: { duration: 0.15 } }}
                        className="overflow-hidden"
                      >
                        {group.items.map((item, i) => {
                          const idx = indexOf.get(item.id) ?? -1;
                          return (
                            <Row
                              key={item.id}
                              item={item}
                              domId={`${uid}-${item.id}`}
                              index={idx}
                              current={item.id === currentId}
                              focused={navIndex !== null && idx === activeIndex}
                              first={i === 0}
                              last={i === group.items.length - 1}
                              query={query}
                              accent={accent}
                              onSelect={stableSelect}
                              onPoint={pointAt}
                              onHover={onHoverItem}
                            />
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          {matchCount === 0 && (
            <div className="mx-6 mt-2 flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-[#0c0c0d] px-4 py-6 text-center shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.7)]">
              <span className="font-inter text-[13px] font-medium text-neutral-200">Nothing found</span>
              <span className="font-inter text-xs text-neutral-500">{emptyMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
