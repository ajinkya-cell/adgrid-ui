"use client";

import { forwardRef, useId, useRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Page through a long list. The numbers are quiet ghost squares; the current page is a raised
// segment that glides from number to number as the page changes. The row always has the same
// number of slots (first, last, the current page's neighbours, and an ellipsis where pages are
// skipped), so nothing jumps sideways as you move through it. The compact variant reads
// "Page 5 of 20" and rolls the number up or down the way it moved.

export type PaginationVariant = "numbers" | "compact";
export type PaginationSize = "sm" | "md";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  totalPages: number;
  /** 1-based. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. Default 1. */
  siblingCount?: number;
  /** Pages always shown at each end. Default 1. */
  boundaryCount?: number;
  /** Default "numbers". */
  variant?: PaginationVariant;
  /** 32 or 36px squares. Default "md". */
  size?: PaginationSize;
  /** Render real links (for crawlable pages). onPageChange still fires on click. */
  href?: (page: number) => string;
}

type Slot = number | "start-ellipsis" | "end-ellipsis";

const range = (from: number, to: number) => Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);

/** The page numbers to show, with ellipses. Always the same length for a given total. */
export function pageRange(total: number, page: number, siblings = 1, boundary = 1): Slot[] {
  const slots = boundary * 2 + siblings * 2 + 3; // ends + neighbours + current + two ellipses
  if (total <= slots) return range(1, total);

  const start = range(1, boundary);
  const end = range(total - boundary + 1, total);
  // Keep the window the same width near either end by sliding it inward.
  const low = Math.max(Math.min(page - siblings, total - boundary - siblings * 2 - 1), boundary + 2);
  const high = Math.min(Math.max(page + siblings, boundary + siblings * 2 + 2), total - boundary - 1);

  return [
    ...start,
    low > boundary + 2 ? "start-ellipsis" : boundary + 1,
    ...range(low, high),
    high < total - boundary - 1 ? "end-ellipsis" : total - boundary,
    ...end,
  ];
}

const SIZES = {
  sm: { box: "h-8 min-w-8 rounded-lg px-1.5 text-[13px]", icon: "size-8 rounded-lg" },
  md: { box: "h-9 min-w-9 rounded-[10px] px-2 text-sm", icon: "size-9 rounded-[10px]" },
} as const;

const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

// Raised, like the highlights in menus; it sits under the number (z-0, the number z-[1]) so it
// never covers a label while gliding.
const CURRENT = cn(
  "absolute inset-0 z-0 rounded-[inherit] border border-white/[0.08] border-t-white/[0.14]",
  "bg-[linear-gradient(180deg,#232325_0%,#1c1c1e_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_10px_-4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.5)]"
);

const GHOST = cn(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center font-medium tabular-nums tracking-tight select-none",
  "transition-colors duration-150 outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
  "[&>:not([data-current-indicator])]:z-[1]"
);

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    totalPages,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    variant = "numbers",
    size = "md",
    href,
    className,
    "aria-label": ariaLabel = "Pagination",
    ...rest
  },
  ref
) {
  const total = Math.max(1, Math.floor(totalPages));
  const [own, setOwn] = useState(defaultPage);
  const page = Math.min(Math.max(pageProp ?? own, 1), total);
  const reduceMotion = useReducedMotion() ?? false;
  const layoutId = useId();
  const direction = useRef<1 | -1>(1);
  const s = SIZES[size];

  const go = (next: number) => {
    const target = Math.min(Math.max(next, 1), total);
    if (target === page) return;
    direction.current = target > page ? 1 : -1;
    if (pageProp === undefined) setOwn(target);
    onPageChange?.(target);
  };

  /** A page control: a link when `href` is given, else a button. */
  const control = (
    target: number,
    props: { className: string; label?: string; current?: boolean; disabled?: boolean },
    children: ReactNode
  ) => {
    const common = {
      "aria-label": props.label,
      "aria-current": props.current ? ("page" as const) : undefined,
      className: props.className,
    };
    if (href && !props.disabled) {
      return (
        <a
          {...common}
          href={href(target)}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // new tab etc.
            go(target);
          }}
        >
          {children}
        </a>
      );
    }
    return (
      <button {...common} type="button" disabled={props.disabled} onClick={() => go(target)}>
        {children}
      </button>
    );
  };

  const arrow = (dir: -1 | 1) =>
    control(
      page + dir,
      {
        label: dir < 0 ? "Previous page" : "Next page",
        disabled: dir < 0 ? page <= 1 : page >= total,
        className: cn(
          GHOST,
          s.icon,
          "text-neutral-400 hover:bg-[#0c0c0d] hover:text-neutral-100",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        ),
      },
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
        <path
          d={dir < 0 ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  return (
    <nav
      {...rest}
      ref={ref}
      aria-label={ariaLabel}
      data-variant={variant}
      className={cn("inline-flex items-center", className)}
    >
      {variant === "compact" ? (
        <div className="flex items-center gap-2">
          {arrow(-1)}
          <span className={cn("flex items-center gap-1.5 tracking-tight text-neutral-500 tabular-nums", size === "sm" ? "text-[13px]" : "text-sm")}>
            Page
            <span className="relative inline-flex h-5 min-w-[1.5ch] items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout" custom={direction.current}>
                <motion.span
                  key={page}
                  custom={direction.current}
                  variants={{
                    enter: (dir: number) => ({ y: reduceMotion ? 0 : dir * 10, opacity: 0 }),
                    centre: { y: 0, opacity: 1 },
                    exit: (dir: number) => ({ y: reduceMotion ? 0 : -dir * 10, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="centre"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="block font-medium text-neutral-100"
                >
                  {page}
                </motion.span>
              </AnimatePresence>
            </span>
            of <span className="text-neutral-300">{total}</span>
          </span>
          {arrow(1)}
        </div>
      ) : (
        <ul className="flex items-center gap-1">
          <li>{arrow(-1)}</li>
          <LayoutGroup id={layoutId}>
            {pageRange(total, page, siblingCount, boundaryCount).map((slot) =>
              typeof slot === "number" ? (
                <li key={`p${slot}`}>
                  {control(
                    slot,
                    {
                      label: `Page ${slot}`,
                      current: slot === page,
                      className: cn(
                        GHOST,
                        s.box,
                        slot === page ? "text-neutral-50" : "text-neutral-400 hover:bg-[#0c0c0d] hover:text-neutral-100"
                      ),
                    },
                    <>
                      {slot === page && (
                        <motion.span
                          aria-hidden="true"
                          data-current-indicator=""
                          layoutId="pagination-current"
                          transition={reduceMotion ? { duration: 0 } : SPRING}
                          className={CURRENT}
                        />
                      )}
                      <span className="relative">{slot}</span>
                    </>
                  )}
                </li>
              ) : (
                <li key={slot} aria-hidden="true" className={cn("inline-flex items-center justify-center text-neutral-600 select-none", s.box)}>
                  …
                </li>
              )
            )}
          </LayoutGroup>
          <li>{arrow(1)}</li>
        </ul>
      )}
    </nav>
  );
});
