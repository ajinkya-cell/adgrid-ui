"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { SEGMENT_CLASS } from "./Tabs";

// Vertical navigation for sidebars and drawers. The current item is the same raised segment as
// Tabs, and it glides between items, including into and out of collapsible sections. Sections
// open on a grid-rows transition, and their children hang off a machined rail.

const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;

interface NavContextValue {
  value: string;
  select: (value: string) => void;
  reduceMotion: boolean;
}

const NavContext = createContext<NavContextValue | null>(null);
const DepthContext = createContext(0);

function useNav(part: string) {
  const context = useContext(NavContext);
  if (!context) throw new Error(`<${part}> must be used inside <Nav>.`);
  return context;
}

// ─── Nav ────────────────────────────────────────────────────────────────────

export interface NavProps extends Omit<HTMLAttributes<HTMLElement>, "defaultValue" | "onChange"> {
  /** The current item's value. With a router, pass the current path. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Nav = forwardRef<HTMLElement, NavProps>(function Nav(
  { value: valueProp, defaultValue = "", onValueChange, className, children, ...rest },
  ref
) {
  const [own, setOwn] = useState(defaultValue);
  const value = valueProp ?? own;
  const reduceMotion = useReducedMotion() ?? false;
  const id = useId();

  const select = (next: string) => {
    if (valueProp === undefined) setOwn(next);
    if (next !== value) onValueChange?.(next);
  };

  return (
    <NavContext.Provider value={{ value, select, reduceMotion }}>
      <nav {...rest} ref={ref} className={cn("flex flex-col gap-5", className)}>
        <LayoutGroup id={id}>{children}</LayoutGroup>
      </nav>
    </NavContext.Provider>
  );
});

// ─── Group ──────────────────────────────────────────────────────────────────

export interface NavGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

export function NavGroup({ label, className, children, ...rest }: NavGroupProps) {
  const labelId = useId();
  return (
    <div {...rest} role="group" aria-labelledby={label ? labelId : undefined} className={cn("flex flex-col", className)}>
      {label && (
        <div id={labelId} className="px-2.5 pb-1.5 text-xs font-medium text-neutral-500">
          {label}
        </div>
      )}
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

// ─── Item ───────────────────────────────────────────────────────────────────

type ItemBase = {
  value: string;
  icon?: ReactNode;
  /** Shown on the right, e.g. a count or "New". */
  badge?: ReactNode;
  disabled?: boolean;
};

export type NavItemProps = ItemBase &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value">)
  );

const rowClass = (depth: number) =>
  cn(
    "group/nav relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left font-medium tracking-tight select-none",
    "transition-colors duration-150 outline-white/40 -outline-offset-1 focus-visible:outline focus-visible:outline-1",
    depth > 0 ? "h-8 text-[13px]" : "h-9 text-sm"
  );

/** A link (with `href`) or a button. Marks itself `aria-current="page"` when it's the current value. */
export function NavItem(props: NavItemProps) {
  const { value: current, select, reduceMotion } = useNav("NavItem");
  const depth = useContext(DepthContext);
  const { value, icon, badge, disabled, className, children, onClick, ...rest } = props;
  const active = value === current;

  const handleClick = (event: MouseEvent<HTMLAnchorElement & HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    (onClick as ((event: MouseEvent) => void) | undefined)?.(event);
    if (!event.defaultPrevented || props.href) select(value);
  };

  const classes = cn(
    rowClass(depth),
    active ? "text-neutral-50" : "text-neutral-400",
    !active && !disabled && "hover:bg-white/[0.03] hover:text-neutral-200",
    disabled && "cursor-not-allowed opacity-40",
    className
  );

  const inner = (
    <>
      {active && (
        <motion.span
          aria-hidden="true"
          layoutId="nav-current"
          transition={reduceMotion ? { duration: 0 } : SPRING}
          className={SEGMENT_CLASS}
        />
      )}
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex shrink-0 transition-colors duration-150 [&_svg]:size-4",
            active ? "text-neutral-100" : "text-neutral-500 group-hover/nav:text-neutral-300"
          )}
        >
          {icon}
        </span>
      )}
      <span className="relative min-w-0 flex-1 truncate">{children}</span>
      {badge != null && (
        <span
          className={cn(
            "relative inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[11px] font-medium",
            "border border-white/[0.06] bg-[#070707] text-neutral-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
          )}
        >
          {badge}
        </span>
      )}
    </>
  );

  return (
    <li className="list-none">
      {"href" in props && props.href !== undefined ? (
        <a
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled || undefined}
          data-state={active ? "active" : "inactive"}
          onClick={handleClick}
          className={classes}
        >
          {inner}
        </a>
      ) : (
        <button
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
          type="button"
          disabled={disabled}
          aria-current={active ? "page" : undefined}
          data-state={active ? "active" : "inactive"}
          onClick={handleClick}
          className={classes}
        >
          {inner}
        </button>
      )}
    </li>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

export interface NavSectionProps {
  label: ReactNode;
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

/** A collapsible parent. Its items hang off a cut-line rail. */
export function NavSection({
  label,
  icon,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: NavSectionProps) {
  const { reduceMotion } = useNav("NavSection");
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const contentId = useId();
  // Clip only while moving, so an open section never cuts off the highlight or focus ring.
  const [settled, setSettled] = useState(open);

  const toggle = () => {
    setSettled(false);
    if (openProp === undefined) setOwn(!open);
    onOpenChange?.(!open);
  };

  return (
    <li className={cn("list-none", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? "open" : "closed"}
        onClick={toggle}
        className={cn(rowClass(0), "text-neutral-300 hover:bg-white/[0.03] hover:text-neutral-100")}
      >
        {icon && (
          <span aria-hidden="true" className="inline-flex shrink-0 text-neutral-400 [&_svg]:size-4">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {/* The chevron sits in a small socket, like the Accordion's. */}
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-[#0d0d0e] text-neutral-500",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)]"
          )}
        >
          <svg
            viewBox="0 0 12 12"
            width="9"
            height="9"
            fill="none"
            className={cn(
              "transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              open && "rotate-90"
            )}
          >
            <path d="m4.5 2.5 3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div
        id={contentId}
        // Closed content is out of the tab order and the accessibility tree.
        inert={!open || undefined}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === "grid-template-rows") setSettled(open);
        }}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className={cn("min-h-0", !(open && (settled || reduceMotion)) && "overflow-hidden")}>
          <DepthContext.Provider value={1}>
            <ul
              className={cn(
                "relative mt-0.5 mb-1 ml-[17px] flex flex-col gap-0.5 pl-2.5",
                // The rail: a dark cut with a faint lit edge beside it.
                "before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-black/70 before:shadow-[1px_0_0_rgba(255,255,255,0.05)]"
              )}
            >
              {children}
            </ul>
          </DepthContext.Provider>
        </div>
      </div>
    </li>
  );
}
