"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Popover and Dropdown Menu share one floating panel. It opens on the browser's top layer (the
// native `popover` attribute), so no overflow or z-index can clip it; it sits 8px off its trigger,
// flips to the other side when there's no room and stays inside the viewport. It closes on Escape
// (focus goes back to the trigger), on a click outside, and when focus leaves it. Entrance: scale
// 0.97 → 1 and fade over 160ms, growing from the trigger's side.
//
// Popover holds anything: a form, a note, a picker. DropdownMenu fills the same panel with a list
// of actions: arrow keys, Home/End and type-ahead move a raised highlight that glides from item
// to item; Enter or a click runs the item and closes the menu.

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

const GAP = 8;
const EDGE = 8;
const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

const PANEL = cn(
  "fixed inset-auto m-0 overflow-y-auto overscroll-contain text-neutral-100 [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]",
  "border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_24px_60px_-16px_rgba(0,0,0,0.9),0_6px_18px_-6px_rgba(0,0,0,0.7)]",
  "transition-[opacity,scale] duration-[160ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity",
  "starting:scale-[0.97] starting:opacity-0",
  "data-[side=bottom]:origin-top data-[side=top]:origin-bottom data-[side=left]:origin-right data-[side=right]:origin-left",
  "outline-none"
);

const HIGHLIGHT = cn(
  "absolute inset-0 rounded-lg border border-white/[0.07] border-t-white/[0.13]",
  "bg-[linear-gradient(180deg,#232325_0%,#1c1c1e_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_10px_-4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.5)]"
);

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const ITEMS = '[role^="menuitem"]:not([aria-disabled="true"])';

// ─── Shared floating panel ──────────────────────────────────────────────────

function useOpenState(open: boolean | undefined, defaultOpen: boolean, onOpenChange?: (open: boolean) => void) {
  const [own, setOwn] = useState(defaultOpen);
  const isOpen = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setOwn(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  return [isOpen, setOpen] as const;
}

/** The element's own ref, on React 19 (props.ref) and 18 (element.ref). */
function elementRef(element: ReactElement): Ref<HTMLElement> | undefined {
  return (element.props as { ref?: Ref<HTMLElement> }).ref ?? (element as unknown as { ref?: Ref<HTMLElement> }).ref;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T }).current = value;
}

/**
 * Where the panel goes: the preferred side if it fits, else the opposite one if that fits, else
 * whichever has more room, with the panel capped to that room and scrolling inside. Kept on screen.
 */
function place(trigger: HTMLElement, panel: HTMLElement, side: PopoverSide, align: PopoverAlign, offset: number) {
  panel.style.maxHeight = "";
  const t = trigger.getBoundingClientRect();
  const width = panel.offsetWidth;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let height = panel.offsetHeight;

  const room = {
    bottom: vh - EDGE - t.bottom - offset,
    top: t.top - offset - EDGE,
    right: vw - EDGE - t.right - offset,
    left: t.left - offset - EDGE,
  };
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const vertical0 = side === "top" || side === "bottom";
  const need = vertical0 ? height : width;
  let actual: PopoverSide = side;
  if (room[side] < need) {
    actual = room[opposite[side]] >= need || room[opposite[side]] > room[side] ? opposite[side] : side;
  }
  // Still too tall for its side: cap it and let it scroll.
  if ((actual === "top" || actual === "bottom") && height > room[actual]) {
    height = Math.max(room[actual], 120);
    panel.style.maxHeight = `${height}px`;
  }

  const vertical = actual === "top" || actual === "bottom";
  const crossStart = vertical ? t.left : t.top;
  const crossSize = vertical ? t.width : t.height;
  const ownSize = vertical ? width : height;
  let cross = align === "start" ? crossStart : align === "end" ? crossStart + crossSize - ownSize : crossStart + crossSize / 2 - ownSize / 2;
  cross = Math.min(Math.max(cross, EDGE), (vertical ? vw : vh) - ownSize - EDGE);

  const main =
    actual === "bottom" ? t.bottom + offset : actual === "top" ? t.top - offset - height : actual === "right" ? t.right + offset : t.left - offset - width;

  panel.style.left = `${vertical ? cross : main}px`;
  panel.style.top = `${vertical ? main : cross}px`;
  panel.dataset.side = actual;
}

interface FloatingProps {
  trigger: ReactElement;
  open: boolean;
  setOpen: (open: boolean) => void;
  side: PopoverSide;
  align: PopoverAlign;
  offset: number;
  matchTriggerWidth: boolean;
  role: "dialog" | "menu";
  /** Where focus goes on open. */
  initialFocus: (panel: HTMLElement) => void;
  onTriggerKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onPanelKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

function Floating({
  trigger,
  open,
  setOpen,
  side,
  align,
  offset,
  matchTriggerWidth,
  role,
  initialFocus,
  onTriggerKeyDown,
  onPanelKeyDown,
  className,
  ariaLabel,
  children,
}: FloatingProps) {
  const panelId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef(initialFocus);
  focusRef.current = initialFocus;

  const close = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [setOpen]
  );

  // Show on the top layer, place, move focus in; keep placed on scroll and resize.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = triggerRef.current;
    if (!panel || !anchor) return;
    if (!open) {
      if (panel.matches(":popover-open")) panel.hidePopover();
      return;
    }
    if (!panel.matches(":popover-open")) panel.showPopover();
    if (matchTriggerWidth) panel.style.minWidth = `${anchor.getBoundingClientRect().width}px`;
    const update = () => place(anchor, panel, side, align, offset);
    update();
    focusRef.current(panel);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, side, align, offset, matchTriggerWidth]);

  // A click outside both the trigger and the panel closes it, without stealing focus.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  const anchor = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          assignRef(elementRef(trigger), node);
        },
        "aria-haspopup": role,
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          (trigger.props as { onClick?: (event: MouseEvent<HTMLElement>) => void }).onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          (trigger.props as { onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void }).onKeyDown?.(event);
          if (!event.defaultPrevented) onTriggerKeyDown?.(event);
        },
      })
    : null;

  return (
    <>
      {anchor}
      <div
        ref={panelRef}
        id={panelId}
        popover="manual"
        role={role}
        aria-label={ariaLabel}
        tabIndex={-1}
        data-state={open ? "open" : "closed"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close(true);
            return;
          }
          onPanelKeyDown?.(event);
        }}
        onBlur={(event) => {
          // Focus left for somewhere other than the trigger: close quietly.
          const next = event.relatedTarget as Node | null;
          if (next && !panelRef.current?.contains(next) && !triggerRef.current?.contains(next)) close(false);
        }}
        className={cn(PANEL, className)}
      >
        {open && (
          <FloatingContext.Provider value={{ close: () => close(true) }}>{children}</FloatingContext.Provider>
        )}
      </div>
    </>
  );
}

const FloatingContext = createContext<{ close: () => void } | null>(null);

/** Closes the surrounding Popover or DropdownMenu and returns focus to its trigger. */
export function usePopoverClose() {
  return useContext(FloatingContext)?.close ?? (() => {});
}

// ─── Popover ────────────────────────────────────────────────────────────────

export interface PopoverProps {
  /** The element that opens it, usually a Button. It gets the click and aria wiring. */
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flips when there's no room. Default "bottom". */
  side?: PopoverSide;
  /** Default "start". */
  align?: PopoverAlign;
  /** Gap to the trigger in px. Default 8. */
  offset?: number;
  /** At least as wide as the trigger. */
  matchTriggerWidth?: boolean;
  /** Names the panel for screen readers. */
  "aria-label"?: string;
  /** Classes for the panel. */
  className?: string;
}

export function Popover({
  trigger,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  offset = GAP,
  matchTriggerWidth = false,
  "aria-label": ariaLabel,
  className,
}: PopoverProps) {
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  return (
    <Floating
      trigger={trigger}
      open={open}
      setOpen={setOpen}
      side={side}
      align={align}
      offset={offset}
      matchTriggerWidth={matchTriggerWidth}
      role="dialog"
      ariaLabel={ariaLabel}
      initialFocus={(panel) => (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus({ preventScroll: true })}
      className={cn("w-max max-w-[min(360px,calc(100vw-16px))] rounded-2xl p-3", className)}
    >
      {children}
    </Floating>
  );
}

// ─── Dropdown Menu ──────────────────────────────────────────────────────────

const MenuContext = createContext<{
  highlighted: string | null;
  setHighlighted: (id: string | null) => void;
  close: () => void;
  layoutId: string;
  reduceMotion: boolean;
} | null>(null);

export interface DropdownMenuProps {
  trigger: ReactElement;
  /** MenuItem, MenuCheckboxItem, MenuLabel and MenuSeparator. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Default "bottom". */
  side?: PopoverSide;
  /** Default "start". */
  align?: PopoverAlign;
  offset?: number;
  /** Default true: at least as wide as the trigger. */
  matchTriggerWidth?: boolean;
  "aria-label"?: string;
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  offset = GAP,
  matchTriggerWidth = true,
  "aria-label": ariaLabel,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const layoutId = useId();
  // Keyboard opening lands on the first (or last) item; a click opens with nothing highlighted.
  const startAt = useRef<"panel" | "first" | "last">("panel");
  const typeahead = useRef({ text: "", timer: 0 });

  const items = (panel: HTMLElement | null) => Array.from(panel?.querySelectorAll<HTMLElement>(ITEMS) ?? []);

  const focusAt = (panel: HTMLElement | null, index: number) => {
    const list = items(panel);
    if (!list.length) return;
    list[(index + list.length) % list.length].focus({ preventScroll: false });
  };

  return (
    <MenuContext.Provider
      value={{ highlighted, setHighlighted, close: () => setOpen(false), layoutId, reduceMotion }}
    >
      <Floating
        trigger={trigger}
        open={open}
        setOpen={(next) => {
          if (!next) setHighlighted(null);
          setOpen(next);
        }}
        side={side}
        align={align}
        offset={offset}
        matchTriggerWidth={matchTriggerWidth}
        role="menu"
        ariaLabel={ariaLabel}
        initialFocus={(panel) => {
          const list = items(panel);
          const target = startAt.current === "first" ? list[0] : startAt.current === "last" ? list[list.length - 1] : panel;
          (target ?? panel).focus({ preventScroll: true });
          startAt.current = "panel";
        }}
        onTriggerKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            startAt.current = event.key === "ArrowUp" ? "last" : "first";
            setOpen(true);
          } else if (event.key === "Enter" || event.key === " ") {
            // The click that follows opens it; this just says where focus should land.
            startAt.current = "first";
          }
        }}
        onPanelKeyDown={(event) => {
          const panel = event.currentTarget;
          const list = items(panel);
          const current = list.indexOf(document.activeElement as HTMLElement);
          switch (event.key) {
            case "ArrowDown":
              event.preventDefault();
              focusAt(panel, current + 1);
              return;
            case "ArrowUp":
              event.preventDefault();
              focusAt(panel, current < 0 ? -1 : current - 1);
              return;
            case "Home":
              event.preventDefault();
              focusAt(panel, 0);
              return;
            case "End":
              event.preventDefault();
              focusAt(panel, -1);
              return;
            case "Tab":
              setOpen(false);
              return;
          }
          // Type-ahead: letters typed within half a second jump to the first match.
          if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
            const ahead = typeahead.current;
            window.clearTimeout(ahead.timer);
            ahead.text += event.key.toLowerCase();
            ahead.timer = window.setTimeout(() => (ahead.text = ""), 500);
            const ordered = [...list.slice(current + 1), ...list.slice(0, current + 1)];
            const match = ordered.find((item) => (item.dataset.label ?? item.textContent ?? "").trim().toLowerCase().startsWith(ahead.text));
            match?.focus();
          }
        }}
        className={cn("min-w-[200px] max-w-[min(320px,calc(100vw-16px))] rounded-xl p-1", className)}
      >
        <LayoutGroup id={layoutId}>{children}</LayoutGroup>
      </Floating>
    </MenuContext.Provider>
  );
}

interface MenuItemBaseProps {
  children: ReactNode;
  icon?: ReactNode;
  /** Right-aligned hint, e.g. "⌘K". */
  shortcut?: ReactNode;
  disabled?: boolean;
  /** Danger tint for actions like Delete. */
  destructive?: boolean;
  /** Plain text for type-ahead when the children aren't plain text. */
  textValue?: string;
  className?: string;
}

function useMenuItem(disabled: boolean) {
  const menu = useContext(MenuContext);
  const id = useId();
  return {
    menu,
    id,
    active: menu?.highlighted === id,
    handlers: {
      onFocus: () => menu?.setHighlighted(id),
      // Moving between items hands the highlight over (so it glides); leaving the menu clears it.
      onBlur: (event: FocusEvent<HTMLElement>) => {
        const next = event.relatedTarget as HTMLElement | null;
        if (next?.closest('[role="menu"]') === event.currentTarget.closest('[role="menu"]') && next?.matches(ITEMS)) return;
        if (menu?.highlighted === id) menu.setHighlighted(null);
      },
      onPointerMove: (event: MouseEvent<HTMLElement>) => {
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
      },
    },
  };
}

function ItemBody({
  active,
  icon,
  shortcut,
  destructive,
  check,
  children,
}: {
  active: boolean;
  icon?: ReactNode;
  shortcut?: ReactNode;
  destructive?: boolean;
  check?: ReactNode;
  children: ReactNode;
}) {
  const menu = useContext(MenuContext);
  return (
    <>
      {/* The highlight: one raised segment that glides from item to item. */}
      {active && (
        <motion.span
          aria-hidden="true"
          layoutId={`${menu?.layoutId}-highlight`}
          transition={menu?.reduceMotion ? { duration: 0 } : SPRING}
          className={HIGHLIGHT}
        />
      )}
      {check}
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex shrink-0 [&_svg]:size-4 transition-colors duration-150",
            destructive ? "text-[rgb(229_115_115)]" : active ? "text-neutral-100" : "text-neutral-500"
          )}
        >
          {icon}
        </span>
      )}
      <span
        className={cn(
          "relative min-w-0 flex-1 truncate transition-colors duration-150",
          destructive ? (active ? "text-[rgb(240_140_140)]" : "text-[rgb(229_115_115)]") : active ? "text-neutral-50" : "text-neutral-300"
        )}
      >
        {children}
      </span>
      {shortcut && (
        <span className={cn("relative shrink-0 text-xs tabular-nums transition-colors duration-150", active ? "text-neutral-400" : "text-neutral-600")}>
          {shortcut}
        </span>
      )}
    </>
  );
}

const ITEM = cn(
  "relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm tracking-tight select-none outline-none",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
);

export interface MenuItemProps extends MenuItemBaseProps {
  /** Runs on click or Enter. Call event.preventDefault() to keep the menu open. */
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
  /** Render as a link. */
  href?: string;
}

export function MenuItem({ children, icon, shortcut, disabled = false, destructive = false, textValue, onSelect, href, className }: MenuItemProps) {
  const { menu, active, handlers } = useMenuItem(disabled);
  const close = useContext(FloatingContext)?.close;
  const props = {
    role: "menuitem",
    tabIndex: -1,
    "aria-disabled": disabled || undefined,
    "data-label": textValue,
    "data-highlighted": active ? "" : undefined,
    className: cn(ITEM, className),
    ...handlers,
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onSelect?.(event);
      if (!event.defaultPrevented) {
        menu?.setHighlighted(null);
        close?.();
      }
    },
  };
  const body = (
    <ItemBody active={active} icon={icon} shortcut={shortcut} destructive={destructive}>
      {children}
    </ItemBody>
  );
  return href && !disabled ? (
    <a href={href} {...props}>
      {body}
    </a>
  ) : (
    <button type="button" {...props}>
      {body}
    </button>
  );
}

export interface MenuCheckboxItemProps extends Omit<MenuItemBaseProps, "destructive"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** A toggle. Stays open on select, so several can be flipped in a row. */
export function MenuCheckboxItem({ children, icon, shortcut, disabled = false, textValue, checked, onCheckedChange, className }: MenuCheckboxItemProps) {
  const { active, handlers } = useMenuItem(disabled);
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-label={textValue}
      data-highlighted={active ? "" : undefined}
      className={cn(ITEM, className)}
      {...handlers}
      onClick={() => {
        if (!disabled) onCheckedChange?.(!checked);
      }}
    >
      <ItemBody
        active={active}
        icon={icon}
        shortcut={shortcut}
        check={
          // A small socket; checked, a popout check rises in it.
          <span
            aria-hidden="true"
            className={cn(
              "relative grid size-4 shrink-0 place-items-center rounded-[5px] border transition-[background,border-color,box-shadow] duration-150",
              checked
                ? "border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.6)]"
                : "border-white/[0.08] bg-[#070707] shadow-[inset_0_1px_2px_rgba(0,0,0,0.85)]"
            )}
          >
            {checked && (
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                <path d="M2.6 6.3 4.9 8.6 9.4 3.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        }
      >
        {children}
      </ItemBody>
    </button>
  );
}

/** A quiet heading over a group of items. */
export function MenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="presentation" className={cn("px-2.5 pt-2 pb-1 text-xs font-medium text-neutral-500 select-none", className)}>
      {children}
    </div>
  );
}

/** A machined cut line between groups. */
export function MenuSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn("mx-1 my-1.5 h-px bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.05)]", className)}
    />
  );
}

/** Groups items for screen readers; pass a label to show a MenuLabel above them. */
export function MenuGroup({ label, children }: { label?: ReactNode; children: ReactNode }) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={label ? labelId : undefined}>
      {label && (
        <div id={labelId}>
          <MenuLabel>{label}</MenuLabel>
        </div>
      )}
      {Children.toArray(children)}
    </div>
  );
}
