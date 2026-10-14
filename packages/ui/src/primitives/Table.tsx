"use client";

import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cn } from "../lib/utils";

// A real <table> mounted in a raised card. The header is a darker tray band; rows are split by the
// machined cut line (a dark line with a faint lit one under it). Numbers sit right in tabular
// figures. Sortable headers are buttons that report aria-sort.

const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%, transparent 100%)";

const SectionContext = createContext<"head" | "body">("body");

// ─── Table ──────────────────────────────────────────────────────────────────

export interface TableProps extends Omit<HTMLAttributes<HTMLTableElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Sits right of the title, e.g. a button or a SegmentedControl. */
  action?: ReactNode;
  /** Content for the footer tray, e.g. a count or pagination. */
  footer?: ReactNode;
  /** Classes for the card around the table. */
  containerClassName?: string;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { title, description, action, footer, containerClassName, className, children, ...rest },
  ref
) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl text-neutral-100",
        "border border-white/[0.08] border-t-white/[0.1] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
        "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]",
        containerClassName
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px" style={{ background: PRISMATIC }} />

      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
          <div className="flex min-w-0 flex-col gap-1">
            {title && <h3 className="text-sm font-semibold tracking-[-0.01em] text-neutral-50">{title}</h3>}
            {description && <p className="text-[13px] leading-relaxed text-neutral-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="w-full overflow-x-auto [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]">
        <table {...rest} ref={ref} className={cn("w-full border-separate border-spacing-0 text-sm", className)}>
          {children}
        </table>
      </div>

      {footer && (
        <div className="flex items-center justify-between gap-4 border-t border-black/60 bg-black/25 px-5 py-3 text-xs text-neutral-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {footer}
        </div>
      )}
    </div>
  );
});

// ─── Sections ───────────────────────────────────────────────────────────────

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, ...rest }, ref) {
    return (
      <SectionContext.Provider value="head">
        <thead {...rest} ref={ref} className={cn("bg-[#0c0c0d]", className)} />
      </SectionContext.Provider>
    );
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...rest }, ref) {
    return (
      <SectionContext.Provider value="body">
        <tbody {...rest} ref={ref} className={className} />
      </SectionContext.Provider>
    );
  }
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row chosen; styled one step brighter and exposed as aria-selected. */
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, ...rest },
  ref
) {
  const section = useContext(SectionContext);
  return (
    <tr
      {...rest}
      ref={ref}
      aria-selected={selected || undefined}
      data-state={selected ? "selected" : undefined}
      className={cn(
        "group/row",
        section === "body" && [
          "transition-colors duration-150 hover:bg-white/[0.02]",
          "data-[state=selected]:bg-white/[0.035]",
          // The cut line: dark under every row but the last, lit on top of every row but the first.
          "[&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-black/50",
          "[&:not(:first-child)>td]:shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]",
        ],
        className
      )}
    />
  );
});

// ─── Cells ──────────────────────────────────────────────────────────────────

type Align = "left" | "right" | "center";
const ALIGN = { left: "text-left", right: "text-right", center: "text-center" };
const JUSTIFY = { left: "justify-start", right: "justify-end", center: "justify-center" };

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
  /** Right-aligns the column for numbers. */
  numeric?: boolean;
  /** Makes the header a sort button. `false` means sortable but not currently sorted. */
  sort?: "ascending" | "descending" | false;
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { align, numeric, sort, onSort, className, children, ...rest },
  ref
) {
  const side: Align = align ?? (numeric ? "right" : "left");
  const sortable = sort !== undefined;

  return (
    <th
      {...rest}
      ref={ref}
      scope={rest.scope ?? "col"}
      aria-sort={sortable ? sort || "none" : undefined}
      className={cn(
        "h-9 border-y border-black/60 px-5 align-middle text-xs font-medium whitespace-nowrap text-neutral-500",
        "shadow-[inset_0_-1px_0_rgba(255,255,255,0.03)] first:pl-5 last:pr-5",
        ALIGN[side],
        className
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "group/sort inline-flex w-full cursor-pointer items-center gap-1.5 rounded-md transition-colors duration-150",
            "outline-white/40 outline-offset-2 hover:text-neutral-200 focus-visible:outline focus-visible:outline-1",
            sort && "text-neutral-200",
            JUSTIFY[side],
            side === "right" && "flex-row-reverse"
          )}
        >
          <span>{children}</span>
          <svg
            viewBox="0 0 12 12"
            width="10"
            height="10"
            fill="none"
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-[opacity,rotate] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
              sort ? "opacity-100" : "opacity-0 group-hover/sort:opacity-60",
              sort === "descending" && "rotate-180"
            )}
          >
            <path d="M6 9.5V2.5M3 5.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
  /** Right-aligned tabular figures. */
  numeric?: boolean;
  /** The row's main cell: primary text instead of secondary. */
  primary?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric, primary, className, ...rest },
  ref
) {
  return (
    <td
      {...rest}
      ref={ref}
      className={cn(
        "h-11 px-5 align-middle whitespace-nowrap",
        primary ? "font-medium tracking-tight text-neutral-100" : "text-neutral-400",
        numeric && "tabular-nums",
        ALIGN[align ?? (numeric ? "right" : "left")],
        className
      )}
    />
  );
});
