"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Swatch, type LegendItem } from "./ChartCard";

// A small raised pill that follows the active point. It sits above the anchor and slides along
// the plot, clamped inside it; it fades in and out without scaling.

export interface TooltipRow {
  label: ReactNode;
  value: ReactNode;
  tone: number;
  mark?: LegendItem["mark"];
  fill?: string;
}

export interface ChartTooltipProps {
  open: boolean;
  /** Anchor in the plot's pixel space. */
  x: number;
  y: number;
  /** Plot width, to keep the pill inside. */
  bound: number;
  title?: ReactNode;
  rows: TooltipRow[];
}

export function ChartTooltip({ open, x, y, bound, title, rows }: ChartTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(140);
  useLayoutEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth);
  });
  const left = Math.min(Math.max(x - w / 2, 4), Math.max(4, bound - w - 4));

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute z-10 min-w-[128px] rounded-lg border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)] px-2.5 py-2 text-xs shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)] transition-[left,top,opacity] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity"
      style={{ left, top: y, opacity: open ? 1 : 0, transform: "translateY(calc(-100% - 10px))" }}
    >
      {title != null && <div className="mb-1.5 whitespace-nowrap text-[11px] text-neutral-500">{title}</div>}
      <div className="flex flex-col gap-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <Swatch tone={row.tone} mark={row.mark} fill={row.fill} />
            <span className="text-neutral-400">{row.label}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums text-neutral-100">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartTooltip;
