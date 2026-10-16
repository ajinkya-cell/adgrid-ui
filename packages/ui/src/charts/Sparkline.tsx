"use client";

import { forwardRef, useId, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { useTween, useWidth } from "./hooks";
import { areaPath, barPath, linear, smoothPath, tone } from "./scale";

// A word-sized chart for stat tiles and table cells: no card, no axes. The line variant ends in a
// pearl on the latest value; the bar variant lights only the latest bar as popout, so "now" is
// the brightest thing in it.

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  data: number[];
  variant?: "line" | "area" | "bar";
  /** Height in px. Default 36. */
  height?: number;
  /** Luminance step for the line. Default 0. */
  tone?: number;
  /** Accessible summary, e.g. "Signups, last 14 days, rising". */
  label?: string;
  animateOnMount?: boolean;
}

export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(function Sparkline(
  { data, variant = "line", height = 36, tone: toneIndex = 0, label, animateOnMount = true, className, style, ...rest },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [boxRef, width] = useWidth<HTMLDivElement>();
  const shown = useTween(data, animateOnMount);
  const n = data.length;
  const lo = Math.min(...data, variant === "bar" ? 0 : Infinity);
  const hi = Math.max(...data);
  const t = tone(toneIndex);

  const setRefs = (node: HTMLDivElement | null) => {
    boxRef(node);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  let body = null;
  if (width > 0 && n > 0) {
    if (variant === "bar") {
      const gap = 2;
      const bw = Math.max(1, (width - gap * (n - 1)) / n);
      const yAt = linear(0, hi || 1, height, 2);
      body = shown.map((v, i) => {
        const y = yAt(Math.max(0, v));
        const last = i === n - 1;
        return (
          <path
            key={i}
            d={barPath(i * (bw + gap), y, bw, Math.max(1.5, height - y), 2, "top")}
            fill={last ? `url(#${uid}-pop)` : "rgba(255,255,255,0.2)"}
          />
        );
      });
    } else {
      const pad = 5;
      const xAt = (i: number) => pad + (n <= 1 ? 0 : (i / (n - 1)) * (width - pad * 2));
      const yAt = linear(lo, hi === lo ? lo + 1 : hi, height - pad, pad);
      const pts = shown.map((v, i) => [xAt(i), yAt(v)] as const);
      const [ex, ey] = pts[n - 1];
      body = (
        <>
          {variant === "area" && <path d={areaPath(pts, height, true)} fill={`url(#${uid}-a)`} />}
          <path d={smoothPath(pts)} fill="none" stroke={t.stroke} strokeWidth="1.75" strokeDasharray={t.dash} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={ex} cy={ey} r="5" fill="#151516" />
          <circle cx={ex} cy={ey} r="2.75" fill={toneIndex === 0 ? "#f5f5f5" : t.stroke} />
        </>
      );
    }
  }

  return (
    <div
      {...rest}
      ref={setRefs}
      role="img"
      aria-label={label}
      className={cn("relative w-full", className)}
      style={{ height, ...style }}
    >
      {width > 0 && (
        <svg width={width} height={height} className="absolute inset-0 block overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity={t.area} />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-pop`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#d9d9d9" />
            </linearGradient>
          </defs>
          {body}
        </svg>
      )}
    </div>
  );
});

export default Sparkline;
