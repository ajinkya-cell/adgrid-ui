"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Tabs switch between panels of one view. The list is a well; the active tab is a raised segment
// that slides between tabs (or, for page-level tabs, a prismatic line under the label). Arrow keys
// move focus and select in one step, with a roving tabindex so the list is a single Tab stop.

export type TabsVariant = "segment" | "underline";
export type TabsSize = "sm" | "md" | "lg";

const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;
const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)";

// Track heights 32 / 40 / 48; a segment fills the track minus its 4px padding.
const SIZES = {
  sm: { tab: "h-6 px-2.5 text-xs", line: "h-8 px-1 text-xs", gap: "gap-1.5" },
  md: { tab: "h-8 px-3 text-sm", line: "h-10 px-1 text-sm", gap: "gap-2" },
  lg: { tab: "h-10 px-4 text-sm", line: "h-12 px-1 text-[15px]", gap: "gap-2" },
} as const;

/** The raised segment: a small slab lifted out of the well. Shared look with SegmentedControl. */
export const SEGMENT_CLASS = cn(
  "absolute inset-0 rounded-lg border border-white/[0.07] border-t-white/[0.13]",
  "bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_10px_-4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.5)]"
);

/** The well the segments sit in. */
export const TRACK_CLASS = cn(
  "rounded-xl border border-white/[0.06] bg-[#070707] p-1",
  "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]"
);

const safeId = (value: string) => value.replace(/[^\w-]/g, "_");

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  baseId: string;
  fullWidth: boolean;
  reduceMotion: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string) {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${part}> must be used inside <Tabs>.`);
  return context;
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "segment" is a raised slab in a well; "underline" is a light line for page-level tabs. */
  variant?: TabsVariant;
  size?: TabsSize;
  /** Tabs share the list's full width equally. */
  fullWidth?: boolean;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    variant = "segment",
    size = "md",
    fullWidth = false,
    className,
    children,
    ...rest
  },
  ref
) {
  const [own, setOwn] = useState(defaultValue);
  const value = valueProp ?? own;
  const baseId = useId();
  const reduceMotion = useReducedMotion() ?? false;

  const select = useCallback(
    (next: string) => {
      if (valueProp === undefined) setOwn(next);
      if (next !== value) onValueChange?.(next);
    },
    [valueProp, value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, select, variant, size, baseId, fullWidth, reduceMotion }}>
      <div {...rest} ref={ref} data-variant={variant} className={cn("grid grid-cols-1 gap-4", className)}>
        <LayoutGroup id={baseId}>{children}</LayoutGroup>
      </div>
    </TabsContext.Provider>
  );
});

// ─── List ───────────────────────────────────────────────────────────────────

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, onKeyDown, children, ...rest },
  ref
) {
  const { variant, fullWidth, select } = useTabs("TabsList");

  // Automatic activation: moving focus selects. Disabled tabs are skipped.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const target =
      event.key === "ArrowRight" ? tabs[(current + 1) % tabs.length]
      : event.key === "ArrowLeft" ? tabs[(current - 1 + tabs.length) % tabs.length]
      : event.key === "Home" ? tabs[0]
      : event.key === "End" ? tabs[tabs.length - 1]
      : undefined;
    if (!target) return;
    event.preventDefault();
    target.focus();
    select(target.dataset.value!);
  };

  return (
    <div
      {...rest}
      ref={ref}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex items-center",
        fullWidth ? "w-full" : "w-fit max-w-full",
        variant === "segment"
          ? cn(TRACK_CLASS, "gap-0.5 overflow-x-auto [scrollbar-width:none]")
          : // A machined cut line under the row: a dark line with a faint light one beneath it.
            "gap-5 overflow-x-auto border-b border-black/60 shadow-[0_1px_0_rgba(255,255,255,0.05)] [scrollbar-width:none]",
        className
      )}
    >
      {children}
    </div>
  );
});

// ─── Tab ────────────────────────────────────────────────────────────────────

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  /** Shown before the label. */
  icon?: ReactNode;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, icon, disabled, className, children, onClick, ...rest },
  ref
) {
  const { value: selected, select, variant, size, baseId, fullWidth, reduceMotion } = useTabs("Tab");
  const active = value === selected;
  const isSegment = variant === "segment";
  const s = SIZES[size];

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${safeId(value)}`}
      aria-selected={active}
      aria-controls={`${baseId}-panel-${safeId(value)}`}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={active ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select(value);
      }}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center font-medium tracking-tight whitespace-nowrap select-none",
        "transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0",
        "outline-white/40 focus-visible:outline focus-visible:outline-1",
        isSegment ? cn(s.tab, "rounded-lg outline-offset-1") : cn(s.line, "rounded-md outline-offset-2"),
        s.gap,
        fullWidth && "flex-1",
        active ? "text-neutral-100" : "text-neutral-500 hover:text-neutral-400",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-neutral-500",
        className
      )}
    >
      {active &&
        (isSegment ? (
          <motion.span
            aria-hidden="true"
            layoutId="tabs-indicator"
            transition={reduceMotion ? { duration: 0 } : SPRING}
            className={SEGMENT_CLASS}
          />
        ) : (
          <motion.span
            aria-hidden="true"
            layoutId="tabs-indicator"
            transition={reduceMotion ? { duration: 0 } : SPRING}
            className="absolute inset-x-0 bottom-0 h-[1.5px]"
            style={{ background: PRISMATIC }}
          />
        ))}
      {icon && <span className="relative inline-flex">{icon}</span>}
      <span className="relative">{children}</span>
    </button>
  );
});

// ─── Panel ──────────────────────────────────────────────────────────────────

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

/**
 * Every panel sits in the same grid cell, so the area is always as tall as the tallest panel and
 * switching never moves the tabs or what's below. Inactive panels are hidden (no focus, not read
 * out); the active one settles in with a short fade.
 */
export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value, className, children, ...rest },
  ref
) {
  const { value: selected, baseId, reduceMotion } = useTabs("TabsPanel");
  const active = value === selected;

  return (
    <motion.div
      {...(rest as Record<string, unknown>)}
      ref={ref}
      role="tabpanel"
      id={`${baseId}-panel-${safeId(value)}`}
      aria-labelledby={`${baseId}-tab-${safeId(value)}`}
      tabIndex={active ? 0 : -1}
      data-state={active ? "active" : "inactive"}
      initial={false}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 4 }}
      transition={active && !reduceMotion ? { duration: 0.2, ease: [0.32, 0.72, 0, 1] } : { duration: 0 }}
      className={cn(
        "col-start-1 row-start-2 rounded-xl outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
        !active && "pointer-events-none invisible",
        className
      )}
    >
      {children}
    </motion.div>
  );
});
