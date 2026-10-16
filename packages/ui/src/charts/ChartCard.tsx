"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { tone } from "./scale";

// The shell every chart sits in: a raised card with the prismatic edge, a header (title, a
// headline value and a delta chip), the plot cut into the card as a recessed tray, and a legend.
// A visually hidden table carries the data for screen readers, the way Gauge carries a <meter>.

export type ChartSize = "sm" | "md" | "lg" | "fluid";

export interface LegendItem {
  label: ReactNode;
  tone: number;
  /** The swatch draws the series' real mark. Default "line". */
  mark?: "line" | "bar" | "dot";
  /** A custom fill for "bar" swatches (donut slices, rings). */
  fill?: string;
}

export interface ChartTable {
  columns: string[];
  rows: (string | number)[][];
}

export interface ChartCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Card title, and the chart's accessible name. */
  label?: ReactNode;
  /** A line under the title. */
  description?: ReactNode;
  /** The headline number. */
  value?: ReactNode;
  /** Small text beside the headline ("vs last month"). */
  valueCaption?: ReactNode;
  /** Change since the last period; shows as a chip with a status dot and a signed number. */
  delta?: number;
  /** Formats the delta. Default: signed percent with one decimal. */
  formatDelta?: (delta: number) => string;
  /** Whether a rise is good. Set false for latency, churn, cost. Default true. */
  higherIsBetter?: boolean;
  /** Replaces the delta chip in the header's right slot. */
  action?: ReactNode;
  legend?: LegendItem[];
  /** Card width: 320, 440 or 600px, or "fluid" to fill the parent. Default "md". */
  size?: ChartSize;
  /** The data, as a table for screen readers. */
  table?: ChartTable;
}

const WIDTH = { sm: 320, md: 440, lg: 600 };
const SUCCESS = "rgb(126 190 152)";
const DANGER = "rgb(229 115 115)";
const POPOUT_CSS = "linear-gradient(180deg,#f5f5f5 0%,#d9d9d9 100%)";

const defaultDelta = (d: number) => `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d).toFixed(1)}%`;

export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps & { labelId?: string }>(function ChartCard(
  {
    label,
    description,
    value,
    valueCaption,
    delta,
    formatDelta = defaultDelta,
    higherIsBetter = true,
    action,
    legend,
    size = "md",
    table,
    labelId,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  const trend = delta == null || delta === 0 ? "flat" : (delta > 0) === higherIsBetter ? "good" : "bad";

  return (
    <div
      {...rest}
      ref={ref}
      data-trend={delta == null ? undefined : trend}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/[0.08] p-5",
        "bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
        "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]",
        size === "fluid" && "w-full",
        className
      )}
      style={size === "fluid" ? style : { width: WIDTH[size], maxWidth: "100%", ...style }}
    >
      {/* Prismatic top edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.18)_25%,rgba(255,255,255,0.32)_50%,rgba(255,255,255,0.18)_75%,transparent_100%)]"
      />

      {(label || description || action || delta != null) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {label && (
              <div id={labelId} className="truncate text-sm font-medium tracking-tight text-neutral-100">
                {label}
              </div>
            )}
            {description && <div className="mt-0.5 truncate text-xs text-neutral-500">{description}</div>}
          </div>
          {action ??
            (delta != null && (
              <span className="flex h-5 shrink-0 items-center gap-1.5 rounded-md border border-white/[0.06] bg-[#070707] px-1.5 text-[11px] font-medium tabular-nums text-neutral-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]">
                <span
                  aria-hidden
                  className="size-[5px] rounded-full bg-neutral-500"
                  style={trend === "flat" ? undefined : { backgroundColor: trend === "good" ? SUCCESS : DANGER }}
                />
                {formatDelta(delta)}
              </span>
            ))}
        </div>
      )}

      {value != null && (
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-neutral-100 tabular-nums">{value}</span>
          {valueCaption && <span className="truncate text-xs text-neutral-500">{valueCaption}</span>}
        </div>
      )}

      {children}

      {legend && legend.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5" aria-hidden>
          {legend.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Swatch tone={item.tone} mark={item.mark} fill={item.fill} />
              {item.label}
            </span>
          ))}
        </div>
      )}

      {table && (
        <table className="sr-only">
          {typeof label === "string" && <caption>{label}</caption>}
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});

/** The plot area: a recessed tray cut into the card, one tier darker. */
export const ChartTray = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ChartTray(
  { className, ...rest },
  ref
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cn(
        "relative mt-4 rounded-2xl border border-white/[0.05] bg-[#0c0c0d] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)]",
        "outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        className
      )}
    />
  );
});

/** A legend swatch drawn as the series' own mark. */
export function Swatch({ tone: i, mark = "line", fill }: { tone: number; mark?: LegendItem["mark"]; fill?: string }) {
  const t = tone(i);
  if (mark === "line") {
    return (
      <svg width="16" height="6" aria-hidden className="shrink-0">
        <line x1="1.5" y1="3" x2="14.5" y2="3" stroke={t.stroke} strokeWidth="2" strokeDasharray={t.dash} strokeLinecap="round" />
      </svg>
    );
  }
  const popout = i === 0 && !fill;
  if (mark === "dot" && i % 2 === 1) {
    return <span aria-hidden className="size-2 shrink-0 rounded-full border-[1.5px]" style={{ borderColor: t.stroke }} />;
  }
  return (
    <span
      aria-hidden
      className={cn("size-2 shrink-0", mark === "dot" ? "rounded-full" : "rounded-[2.5px]")}
      style={{ background: fill && !fill.startsWith("url(") ? fill : popout || fill ? POPOUT_CSS : t.fill }}
    />
  );
}

/** The popout gradient, for one SVG. */
export function PopoutGradient({ id, horizontal = false }: { id: string; horizontal?: boolean }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={horizontal ? "1" : "0"} y2={horizontal ? "0" : "1"}>
      <stop offset="0%" stopColor={horizontal ? "#d9d9d9" : "#f5f5f5"} />
      <stop offset="100%" stopColor={horizontal ? "#f5f5f5" : "#d9d9d9"} />
    </linearGradient>
  );
}

export default ChartCard;
