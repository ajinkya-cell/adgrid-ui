"use client";

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { DropdownMenu } from "./Popover";

// A slim raised bar of menus: File, Edit, View… Each menu is a DropdownMenu, so the items,
// submenus, radio and check items, shortcuts and keyboard all come from Popover.tsx.
//
// The open menu's trigger sinks into the bar: a tray-coloured, inset segment that glides from
// trigger to trigger as you move between menus. Once one menu is open, hovering another trigger
// opens that one instead; ArrowLeft/ArrowRight inside a menu move to the neighbouring menu.
// Closed, the triggers are one tab stop with arrow keys between them.

const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

const PRESSED = cn(
  "absolute inset-0 z-0 rounded-lg border border-black/50 bg-[#0c0c0d]",
  "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.75),0_1px_0_rgba(255,255,255,0.05)]"
);

interface MenubarState {
  open: number | null;
  focusFirst: boolean;
  setOpen: (index: number | null, focusFirst?: boolean) => void;
  /** Close `index` only if it's still the open one (a newer menu may have taken over). */
  closeIfOpen: (index: number) => void;
  /** When a menu was last opened by hovering its trigger. */
  hoverOpenedAt: React.MutableRefObject<number>;
  tabStop: number;
  setTabStop: (index: number) => void;
  count: number;
  layoutId: string;
  reduceMotion: boolean;
  triggers: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}

const MenubarContext = createContext<MenubarState | null>(null);
const IndexContext = createContext(0);

export interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  /** MenubarMenu elements. */
  children: ReactNode;
}

export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(function Menubar({ children, className, ...rest }, ref) {
  const menus = Children.toArray(children).filter(isValidElement);
  const [open, setOpenState] = useState<number | null>(null);
  const [focusFirst, setFocusFirst] = useState(false);
  const [tabStop, setTabStop] = useState(0);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverOpenedAt = useRef(0);
  const reduceMotion = useReducedMotion() ?? false;
  const layoutId = useId();

  const setOpen = useCallback((index: number | null, first = false) => {
    setFocusFirst(first);
    setOpenState(index);
    if (index !== null) setTabStop(index);
  }, []);
  const closeIfOpen = useCallback((index: number) => setOpenState((current) => (current === index ? null : current)), []);

  return (
    <div
      {...rest}
      ref={ref}
      role="menubar"
      aria-orientation="horizontal"
      className={cn(
        "inline-flex h-10 items-center gap-0.5 rounded-xl p-1",
        "border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_10px_24px_-10px_rgba(0,0,0,0.6),0_1px_3px_-1px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <MenubarContext.Provider
        value={{ open, focusFirst, setOpen, closeIfOpen, hoverOpenedAt, tabStop, setTabStop, count: menus.length, layoutId, reduceMotion, triggers }}
      >
        <LayoutGroup id={layoutId}>
          {menus.map((menu, index) => (
            <IndexContext.Provider key={menu.key ?? index} value={index}>
              {menu}
            </IndexContext.Provider>
          ))}
        </LayoutGroup>
      </MenubarContext.Provider>
    </div>
  );
});

export interface MenubarMenuProps {
  /** The trigger's text. */
  label: ReactNode;
  /** Menu items: MenuItem, MenuSub, MenuCheckboxItem, MenuRadioGroup, MenuGroup, MenuSeparator… */
  children: ReactNode;
  disabled?: boolean;
  /** Classes for the menu panel. */
  className?: string;
}

export function MenubarMenu({ label, children, disabled = false, className }: MenubarMenuProps) {
  const bar = useContext(MenubarContext);
  const index = useContext(IndexContext);
  if (!bar) throw new Error("MenubarMenu must be inside a Menubar.");
  const isOpen = bar.open === index;

  const move = (direction: -1 | 1, from = index) => (from + direction + bar.count) % bar.count;

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = move(event.key === "ArrowLeft" ? -1 : 1);
    bar.setTabStop(next);
    bar.triggers.current[next]?.focus();
    // Arrowing along the bar with a menu open carries the open menu with it.
    if (bar.open !== null) bar.setOpen(next, true);
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(next) => {
        if (next) bar.setOpen(index);
        else bar.closeIfOpen(index);
      }}
      onEdgeNavigate={(direction) => {
        const next = move(direction);
        bar.setOpen(next, true);
        bar.triggers.current[next]?.focus({ preventScroll: true });
      }}
      autoFocusFirst={isOpen && bar.focusFirst}
      matchTriggerWidth={false}
      aria-label={typeof label === "string" ? label : undefined}
      className={cn("min-w-[220px]", className)}
      trigger={
        <button
          ref={(node) => {
            bar.triggers.current[index] = node;
          }}
          type="button"
          role="menuitem"
          disabled={disabled}
          tabIndex={bar.tabStop === index ? 0 : -1}
          data-state={isOpen ? "open" : "closed"}
          onKeyDown={onTriggerKeyDown}
          onFocus={() => bar.setTabStop(index)}
          onPointerEnter={() => {
            // With a menu open, the pointer switches menus by hovering.
            if (bar.open !== null && bar.open !== index && !disabled) {
              bar.hoverOpenedAt.current = Date.now();
              bar.setOpen(index);
            }
          }}
          onClick={(event) => {
            // The click that lands right after a hover-open would otherwise toggle it shut again.
            if (isOpen && Date.now() - bar.hoverOpenedAt.current < 500) event.preventDefault();
          }}
          className={cn(
            "relative inline-flex h-8 cursor-pointer items-center rounded-lg px-3 text-[13px] font-medium tracking-tight select-none",
            "transition-colors duration-150 [&>:not([data-pressed])]:z-[1]",
            "outline-white/40 outline-offset-1 focus-visible:outline focus-visible:outline-1",
            "disabled:cursor-not-allowed disabled:opacity-40",
            isOpen ? "text-neutral-50" : "text-neutral-400 hover:text-neutral-100"
          )}
        >
          {/* The open trigger sinks into the bar; the sunken segment glides between menus. */}
          {isOpen && (
            <motion.span
              aria-hidden="true"
              data-pressed=""
              layoutId="menubar-pressed"
              transition={bar.reduceMotion ? { duration: 0 } : SPRING}
              className={PRESSED}
            />
          )}
          <span className="relative">{label}</span>
        </button>
      }
    >
      {children}
    </DropdownMenu>
  );
}
