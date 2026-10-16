"use client";

import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { animate } from "framer-motion";
import { cn } from "../lib/utils";

// An instrument: a raised card holding a dial of machined segments around a recessed face.
// Segments between the origin and the value rise to popout (light); the rest stay cut into the
// card. The leading segment runs longer, so it reads as the needle. The value sits in the face.
// Underneath is a real <meter> (visually hidden) for screen readers.
//
// The fill starts at `origin` — the minimum, or zero when the range spans it — so a -100…+100
// score lights left or right from the top. `low`, `high` and `optimum` work like the native
// element: they put marks on the scale, and the region the value lands in shows as a status dot
// and a word in the header (never colour alone). No glow, no idle motion: the segments light up
// from the origin on mount and glide between values, both off under reduced motion.

export type GaugeSize = "sm" | "md" | "lg";
export type GaugeStatus = "success" | "warning" | "danger";

export interface GaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  /** Default 0. */
  min?: number;
  /** Default 100. */
  max?: number;
  /** Where the fill starts. Defaults to 0 when the range spans it, otherwise `min`. */
  origin?: number;
  /** Upper bound of the low region, as on the native <meter>. */
  low?: number;
  /** Lower bound of the high region, as on the native <meter>. */
  high?: number;
  /** The best value. Decides which region reads as good, fair or poor. */
  optimum?: number;
  /** Card title, and the accessible name. */
  label?: ReactNode;
  /** A line under the title. */
  description?: ReactNode;
  /** Small text under the value in the face (a unit, "of 100", "avg"). */
  caption?: ReactNode;
  /** Formats the value in the face and for screen readers. */
  formatValue?: (value: number) => string;
  /** Words for each status, shown beside the dot. */
  statusLabels?: Partial<Record<GaugeStatus, string>>;
  /** Number of segments. Default 41. */
  segments?: number;
  /** Light the segments from the origin on mount. Default true. */
  animateOnMount?: boolean;
  /** Card width: 240, 296 or 352px. Default "md". */
  size?: GaugeSize;
}

// Dial geometry in viewBox units: a 240° sweep from the lower left round to the lower right.
const W = 240;
const H = 184;
const CX = 120;
const CY = 118;
const R_IN = 86;
const R_OUT = 104;
const START = 150;
const SWEEP = 240;
const FACE = 58;

const WIDTH = { sm: 240, md: 296, lg: 352 };
const VALUE_TEXT = { sm: "text-[26px]", md: "text-[34px]", lg: "text-[42px]" };
const STATUS_COLOR: Record<GaugeStatus, string> = {
  success: "rgb(126 190 152)",
  warning: "rgb(214 178 106)",
  danger: "rgb(229 115 115)",
};
const STATUS_WORD: Record<GaugeStatus, string> = { success: "Good", warning: "Fair", danger: "Poor" };
const EASE_OUT = [0.32, 0.72, 0, 1] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const round = (n: number) => Math.round(n * 100) / 100;

function point(frac: number, r: number) {
  const a = ((START + frac * SWEEP) * Math.PI) / 180;
  return [round(CX + r * Math.cos(a)), round(CY + r * Math.sin(a))] as const;
}

// The native <meter> regions: optimum, suboptimal, even less good.
function regionStatus(
  value: number,
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number
): GaugeStatus | undefined {
  if (low == null && high == null) return undefined;
  const lo = clamp(low ?? min, min, max);
  const hi = clamp(high ?? max, lo, max);
  const opt = clamp(optimum ?? (min + max) / 2, min, max);
  if (opt < lo) return value <= lo ? "success" : value <= hi ? "warning" : "danger";
  if (opt > hi) return value >= hi ? "success" : value >= lo ? "warning" : "danger";
  return value >= lo && value <= hi ? "success" : "warning";
}

export const Gauge = forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  {
    value,
    min = 0,
    max = 100,
    origin,
    low,
    high,
    optimum,
    label,
    description,
    caption,
    formatValue,
    statusLabels,
    segments = 41,
    animateOnMount = true,
    size = "md",
    className,
    style,
    ...rest
  },
  ref
) {
  const span = max - min || 1;
  const bipolar = min < 0 && max > 0;
  const start = clamp(origin ?? (bipolar ? 0 : min), min, max);
  const target = clamp(value, min, max);
  const sign = (v: number) => (bipolar && Math.round(v) > 0 ? "+" : "");
  const format = formatValue ?? ((v: number) => `${sign(v)}${Math.round(v)}`);
  const status = regionStatus(target, min, max, low, high, optimum);
  const statusWord = status ? statusLabels?.[status] ?? STATUS_WORD[status] : undefined;

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `${uid}-label`;

  // The shown value tweens toward the target; the segments and the number both read from it.
  const [shown, setShown] = useState(animateOnMount ? start : target);
  const shownRef = useRef(shown);
  useEffect(() => {
    const set = (v: number) => {
      shownRef.current = v;
      setShown(v);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set(target);
      return;
    }
    const controls = animate(shownRef.current, target, { duration: 0.7, ease: EASE_OUT, onUpdate: set });
    return () => controls.stop();
  }, [target]);

  const frac = (v: number) => (clamp(v, min, max) - min) / span;
  const startFrac = frac(start);
  const shownFrac = frac(shown);
  const n = Math.max(2, Math.round(segments));
  const step = 1 / (n - 1);
  // The segment nearest the shown value is the needle; it lights only once the fill has moved.
  const lead = Math.round(shownFrac / step);
  const from = Math.round(startFrac / step);
  const moved = Math.abs(shownFrac - startFrac) > step / 2;
  const thresholds = [low, high].filter((t): t is number => t != null && t > min && t < max);
  const width = WIDTH[size];

  return (
    <div
      {...rest}
      ref={ref}
      data-status={status ?? "neutral"}
      className={cn(
        "relative flex select-none flex-col overflow-hidden rounded-3xl border border-white/[0.08] p-5",
        "bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
        "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]",
        className
      )}
      style={{ width, maxWidth: "100%", ...style }}
    >
      {/* Prismatic top edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.18)_25%,rgba(255,255,255,0.32)_50%,rgba(255,255,255,0.18)_75%,transparent_100%)]"
      />

      <meter
        className="sr-only"
        min={min}
        max={max}
        low={low}
        high={high}
        optimum={optimum}
        value={target}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : rest["aria-label"]}
        aria-valuetext={statusWord ? `${format(target)}, ${statusWord}` : format(target)}
      />

      {(label || description || statusWord) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {label && (
              <div id={labelId} className="truncate text-sm font-medium tracking-tight text-neutral-100">
                {label}
              </div>
            )}
            {description && <div className="mt-0.5 truncate text-xs text-neutral-500">{description}</div>}
          </div>
          {statusWord && status && (
            <span className="flex h-5 shrink-0 items-center gap-1.5 rounded-md border border-white/[0.06] bg-[#070707] px-1.5 text-[11px] font-medium text-neutral-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]">
              <span
                className="size-[5px] rounded-full transition-colors duration-150"
                style={{ backgroundColor: STATUS_COLOR[status] }}
              />
              {statusWord}
            </span>
          )}
        </div>
      )}

      <div className="relative -mx-1 mt-3" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-popout`} gradientUnits="userSpaceOnUse" x1="0" y1={CY - R_OUT} x2="0" y2={CY + R_OUT}>
              <stop offset="0%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#d9d9d9" />
            </linearGradient>
          </defs>

          {Array.from({ length: n }, (_, i) => {
            const f = i * step;
            const lit = moved && i >= Math.min(from, lead) && i <= Math.max(from, lead);
            const isLead = moved && i === lead;
            const [x1, y1] = point(f, isLead ? R_IN - 7 : R_IN);
            const [x2, y2] = point(f, isLead ? R_OUT + 3 : R_OUT);
            return (
              <g key={i}>
                {/* Each segment is a slot: a dark cut with a lit lower lip, or a popout bar. */}
                {!lit && (
                  <line
                    x1={x1}
                    y1={y1 + 0.75}
                    x2={x2}
                    y2={y2 + 0.75}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={lit ? `url(#${uid}-popout)` : "#070707"}
                  strokeOpacity={lit && !isLead ? 0.82 : 1}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Threshold marks just outside the dial. */}
          {thresholds.map((t) => {
            const [x, y] = point(frac(t), R_OUT + 9);
            return <circle key={t} cx={x} cy={y} r="1.75" fill="rgba(255,255,255,0.35)" />;
          })}
        </svg>

        {/* The recessed face holding the value. */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/[0.05] bg-[#0c0c0d] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)]"
          style={{
            left: `${(CX / W) * 100}%`,
            top: `${(CY / H) * 100}%`,
            width: `${((FACE * 2) / W) * 100}%`,
            aspectRatio: "1",
          }}
          aria-hidden
        >
          <span className={cn("font-semibold leading-none tracking-[-0.04em] text-neutral-100 tabular-nums", VALUE_TEXT[size])}>
            {format(shown)}
          </span>
          {caption && <span className="mt-1.5 text-[11px] text-neutral-500">{caption}</span>}
        </div>

        {/* Scale ends, under the first and last segments. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 text-[11px] text-neutral-500 tabular-nums">
          <span className="absolute -translate-x-1/2" style={{ left: `${(point(0, (R_IN + R_OUT) / 2)[0] / W) * 100}%`, bottom: 0 }}>
            {sign(min)}
            {min}
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: `${(point(1, (R_IN + R_OUT) / 2)[0] / W) * 100}%`, bottom: 0 }}>
            {sign(max)}
            {max}
          </span>
        </div>
      </div>
    </div>
  );
});

export default Gauge;
