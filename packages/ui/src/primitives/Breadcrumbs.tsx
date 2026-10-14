"use client";

import { forwardRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

// Where you are, as a trail of quiet links. Ancestors are tertiary text, the separators sit back
// in disabled text, and only the current page is primary. Long trails fold their middle into an
// ellipsis that opens in place.

export interface BreadcrumbItem {
  label: ReactNode;
  /** Ancestors link somewhere; the last item is the current page and never links. */
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Fold the middle when there are more items than this. Keeps the first and the last two. */
  maxItems?: number;
  separator?: ReactNode;
  /** Renders links, e.g. Next's Link. Receives `href`, `className` and `children`. */
  linkAs?: ElementType;
}

const focusRing = "rounded-md outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1";

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxItems, separator = "/", linkAs: Link = "a", className, ...rest },
  ref
) {
  const [expanded, setExpanded] = useState(false);
  const fold = !expanded && maxItems !== undefined && items.length > maxItems && items.length > 3;
  // Indexes shown, with -1 standing for the ellipsis.
  const shown: number[] = fold
    ? [0, -1, items.length - 2, items.length - 1]
    : items.map((_, index) => index);

  return (
    <nav {...rest} ref={ref} aria-label={rest["aria-label"] ?? "Breadcrumb"} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {shown.map((index, position) => {
          const last = index === items.length - 1;
          const item = items[index];
          return (
            <li key={index} className="flex min-w-0 items-center gap-2">
              {position > 0 && (
                <span aria-hidden="true" className="shrink-0 text-neutral-600 select-none">
                  {separator}
                </span>
              )}
              {index === -1 ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  aria-label={`Show ${items.length - 3} more`}
                  className={cn(
                    "inline-flex h-5 cursor-pointer items-center rounded-md px-1.5 text-neutral-500",
                    "border border-white/[0.06] bg-[#070707] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]",
                    "transition-colors duration-150 hover:text-neutral-200",
                    focusRing
                  )}
                >
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor" aria-hidden="true">
                    <circle cx="2.5" cy="6" r="1" />
                    <circle cx="6" cy="6" r="1" />
                    <circle cx="9.5" cy="6" r="1" />
                  </svg>
                </button>
              ) : last || !item!.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(
                    "inline-flex min-w-0 items-center gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0",
                    last ? "font-medium tracking-tight text-neutral-100" : "text-neutral-500"
                  )}
                >
                  {item!.icon}
                  <span className="truncate">{item!.label}</span>
                </span>
              ) : (
                <Link
                  href={item!.href}
                  className={cn(
                    "inline-flex min-w-0 items-center gap-1.5 text-neutral-500 transition-colors duration-150 hover:text-neutral-200",
                    "[&_svg]:size-4 [&_svg]:shrink-0",
                    focusRing
                  )}
                >
                  {item!.icon}
                  <span className="truncate">{item!.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
