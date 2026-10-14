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
// to item; Enter or a click runs the item and closes the menu. MenuSub opens a second panel to
// the side (hover, or ArrowRight); MenuRadioGroup holds pick-one items. Menubar (Menubar.tsx)
// lines several DropdownMenus up in a bar.

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

// Bottom layer under every item's content, so it never paints over text while gliding down.
const HIGHLIGHT = cn(
  "absolute inset-0 z-0 rounded-lg border border-white/[0.07] border-t-white/[0.13]",
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
  // Re-measuring drops the height cap for a moment; keep the panel's own scroll where it was.
  const scrolled = panel.scrollTop;
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
  panel.scrollTop = scrolled;
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
    // Follow the trigger when the page (or a scroller around it) scrolls, but not when the
    // panel scrolls its own content: re-placing it then would fight the user's scroll.
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      update();
    };
    update();
    focusRef.current(panel);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onScroll, true);
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
          // A submenu's panel sits inside this one in the DOM; its keys are its own business.
          if ((event.target as HTMLElement).closest("[popover]") !== event.currentTarget) return;
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

/** Items that belong to `panel` itself, not to a submenu nested inside it. */
const ownItems = (panel: HTMLElement | null) =>
  Array.from(panel?.querySelectorAll<HTMLElement>(ITEMS) ?? []).filter((item) => item.closest('[role="menu"]') === panel);

/** Arrow keys, Home/End and type-ahead within one menu panel. Returns true if it used the key. */
function navigateItems(event: KeyboardEvent<HTMLElement>, panel: HTMLElement, ahead: { text: string; timer: number }) {
  const list = ownItems(panel);
  if (!list.length) return false;
  const current = list.indexOf(document.activeElement as HTMLElement);
  const focusAt = (index: number) => list[(index + list.length) % list.length].focus({ preventScroll: false });
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusAt(current + 1);
      return true;
    case "ArrowUp":
      event.preventDefault();
      focusAt(current < 0 ? -1 : current - 1);
      return true;
    case "Home":
      event.preventDefault();
      focusAt(0);
      return true;
    case "End":
      event.preventDefault();
      focusAt(-1);
      return true;
  }
  // Type-ahead: letters typed within half a second jump to the first match.
  if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
    window.clearTimeout(ahead.timer);
    ahead.text += event.key.toLowerCase();
    ahead.timer = window.setTimeout(() => (ahead.text = ""), 500);
    const ordered = [...list.slice(current + 1), ...list.slice(0, current + 1)];
    const match = ordered.find((item) => (item.dataset.label ?? item.textContent ?? "").trim().toLowerCase().startsWith(ahead.text));
    match?.focus();
    return Boolean(match);
  }
  return false;
}

export interface DropdownMenuProps {
  trigger: ReactElement;
  /** MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuSub, MenuGroup, MenuLabel and MenuSeparator. */
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
  /** ArrowLeft/ArrowRight inside the menu (when no submenu takes it). Menubar uses this to move between menus. */
  onEdgeNavigate?: (direction: -1 | 1) => void;
  /** Land on the first item whenever it opens, however it was opened. */
  autoFocusFirst?: boolean;
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
  onEdgeNavigate,
  autoFocusFirst = false,
}: DropdownMenuProps) {
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const layoutId = useId();
  // Keyboard opening lands on the first (or last) item; a click opens with nothing highlighted.
  const startAt = useRef<"panel" | "first" | "last">("panel");
  const typeahead = useRef({ text: "", timer: 0 });

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
          const list = ownItems(panel);
          const mode = autoFocusFirst ? "first" : startAt.current;
          const target = mode === "first" ? list[0] : mode === "last" ? list[list.length - 1] : panel;
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
          if (event.key === "Tab") {
            setOpen(false);
            return;
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            if (onEdgeNavigate) {
              event.preventDefault();
              onEdgeNavigate(event.key === "ArrowLeft" ? -1 : 1);
            }
            return;
          }
          navigateItems(event, event.currentTarget, typeahead.current);
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
          data-highlight=""
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
  "relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm tracking-tight select-none outline-none [&>:not([data-highlight])]:z-[1]",
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

// ─── Submenu ────────────────────────────────────────────────────────────────

export interface MenuSubProps {
  /** The row that opens it. */
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  textValue?: string;
  /** Items of the submenu. */
  children: ReactNode;
  className?: string;
}

/**
 * A row that opens a second menu to its side: on hover (after a beat), ArrowRight, Enter or
 * Space. ArrowLeft or Escape closes just the submenu and returns to its row. Its panel lives
 * inside the parent's panel in the DOM (on the top layer visually), so the parent's outside-click
 * and focus checks count it as inside.
 */
export function MenuSub({ label, icon, disabled = false, textValue, children, className }: MenuSubProps) {
  const { menu, id, active, handlers } = useMenuItem(disabled);
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);
  const timer = useRef(0);
  const ahead = useRef({ text: "", timer: 0 });
  const layoutId = useId();
  const panelId = useId();

  const show = (withFocus: boolean) => {
    if (disabled) return;
    window.clearTimeout(timer.current);
    focusFirst.current = withFocus;
    if (open && withFocus) ownItems(panelRef.current)[0]?.focus({ preventScroll: true });
    setOpen(true);
  };
  const hide = (returnFocus: boolean) => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setHighlighted(null);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  // Another row of the parent highlighted: close after a beat, so a diagonal move into the
  // submenu across a neighbouring row doesn't snap it shut.
  useEffect(() => {
    if (!open || !menu?.highlighted || menu.highlighted === id) return;
    timer.current = window.setTimeout(() => hide(false), 160);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu?.highlighted, open, id]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    if (!open) {
      if (panel.matches(":popover-open")) panel.hidePopover();
      return;
    }
    if (!panel.matches(":popover-open")) panel.showPopover();
    place(trigger, panel, "right", "start", 4);
    // Line the first item up with the row that opened it (panel padding + border).
    panel.style.top = `${parseFloat(panel.style.top) - 5}px`;
    if (focusFirst.current) ownItems(panel)[0]?.focus({ preventScroll: true });
    focusFirst.current = false;
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-disabled={disabled || undefined}
        data-label={textValue}
        data-highlighted={active || open ? "" : undefined}
        data-state={open ? "open" : "closed"}
        className={cn(ITEM, className)}
        {...handlers}
        onPointerMove={(event) => {
          handlers.onPointerMove(event);
          if (disabled || open) return;
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => show(false), 100);
        }}
        onPointerLeave={() => {
          if (!open) window.clearTimeout(timer.current);
        }}
        onClick={() => (open ? ownItems(panelRef.current)[0]?.focus() : show(true))}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            show(true);
          }
        }}
      >
        <ItemBody active={active || open} icon={icon} shortcut={<ChevronRight />}>
          {label}
        </ItemBody>
      </button>

      <div
        ref={panelRef}
        id={panelId}
        popover="manual"
        role="menu"
        aria-label={typeof label === "string" ? label : undefined}
        tabIndex={-1}
        onPointerEnter={() => window.clearTimeout(timer.current)}
        onKeyDown={(event) => {
          // Only this panel's own keys; a deeper submenu handles its own.
          if ((event.target as HTMLElement).closest("[popover]") !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            hide(true);
            return;
          }
          if (event.key === "Tab") return; // let the root menu close on Tab
          if (navigateItems(event, event.currentTarget, ahead.current) || event.key === "ArrowRight") event.stopPropagation();
        }}
        className={cn(PANEL, "min-w-[200px] max-w-[min(320px,calc(100vw-16px))] rounded-xl p-1")}
      >
        {open && (
          <MenuContext.Provider
            value={{ highlighted, setHighlighted, close: menu?.close ?? (() => {}), layoutId, reduceMotion }}
          >
            <LayoutGroup id={layoutId}>{children}</LayoutGroup>
          </MenuContext.Provider>
        )}
      </div>
    </>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path d="m4.5 2.75 3.25 3.25-3.25 3.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Radio items ────────────────────────────────────────────────────────────

const RadioContext = createContext<{ value: string | undefined; onValueChange?: (value: string) => void } | null>(null);

export interface MenuRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  /** Shows a MenuLabel above the items. */
  label?: ReactNode;
  children: ReactNode;
}

/** A pick-one group inside a menu. */
export function MenuRadioGroup({ value, onValueChange, label, children }: MenuRadioGroupProps) {
  return (
    <RadioContext.Provider value={{ value, onValueChange }}>
      <MenuGroup label={label}>{children}</MenuGroup>
    </RadioContext.Provider>
  );
}

export interface MenuRadioItemProps extends Omit<MenuItemBaseProps, "destructive" | "icon"> {
  value: string;
}

/** One choice in a MenuRadioGroup. Stays open on select, so the change can be seen. */
export function MenuRadioItem({ value, children, shortcut, disabled = false, textValue, className }: MenuRadioItemProps) {
  const group = useContext(RadioContext);
  const { active, handlers } = useMenuItem(disabled);
  const checked = group?.value === value;
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-label={textValue}
      data-highlighted={active ? "" : undefined}
      className={cn(ITEM, className)}
      {...handlers}
      onClick={() => {
        if (!disabled) group?.onValueChange?.(value);
      }}
    >
      <ItemBody
        active={active}
        shortcut={shortcut}
        check={
          // A round well; chosen, a popout pearl rises in its centre.
          <span
            aria-hidden="true"
            className="relative grid size-4 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#070707] shadow-[inset_0_1px_2px_rgba(0,0,0,0.85)]"
          >
            <span
              className={cn(
                "size-[7px] rounded-full bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.6)]",
                "transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                checked ? "scale-100" : "scale-0"
              )}
            />
          </span>
        }
      >
        {children}
      </ItemBody>
    </button>
  );
}
