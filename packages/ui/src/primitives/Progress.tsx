"use client";

import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

// A well-cut track with a popout fill rising out of it. Determinate progress slides the fill;
// indeterminate progress sweeps a short popout slab across the well (off under reduced motion).
// On mount the fill grows from empty, so the first value reads as progress, not a jump-cut.

export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current value. Leave undefined (or null) for indeterminate. */
  value?: number | null;
  max?: number;
  /** Shown above the track, and used as the accessible name. */
  label?: ReactNode;
  /** Show the value on the right of the label row. */
  showValue?: boolean;
  /** Formats the shown value and the screen-reader text. Defaults to a percentage. */
  formatValue?: (value: number, max: number) => string;
  /** Track height: 4, 6 or 8px. */
  size?: ProgressSize;
}

const TRACK = { sm: "h-1", md: "h-1.5", lg: "h-2" };
const POPOUT = cn(
  "rounded-full border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6)]"
);

const percent = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, label, showValue = false, formatValue = percent, size = "md", className, ...rest },
  ref
) {
  const indeterminate = value == null;
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const fraction = max > 0 ? clamped / max : 0;
  const text = indeterminate ? undefined : formatValue(clamped, max);
  const labelId = useId();
  const sweepRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // The sweep runs on the Web Animations API, so the primitive ships no keyframes or global CSS.
  // The slab is 40% of the track: -100% parks it just off the left edge, 250% just off the right.
  useEffect(() => {
    const slab = sweepRef.current;
    if (!indeterminate || !slab) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = slab.animate(
      [{ transform: "translateX(-100%)" }, { transform: "translateX(250%)" }],
      { duration: 1400, iterations: Infinity, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }
    );
    return () => animation.cancel();
  }, [indeterminate]);

  const shownFraction = shown ? fraction : 0;

  return (
    <div
      {...rest}
      ref={ref}
      data-state={indeterminate ? "indeterminate" : fraction >= 1 ? "complete" : "loading"}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      {(label || (showValue && text)) && (
        <div className="flex items-baseline justify-between gap-4">
          {label && (
            <span id={labelId} className="min-w-0 truncate text-sm font-medium tracking-tight text-neutral-100">
              {label}
            </span>
          )}
          {showValue && text && <span className="shrink-0 text-xs text-neutral-400 tabular-nums">{text}</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : rest["aria-label"]}
        aria-valuemin={0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={text}
        aria-busy={indeterminate || undefined}
        className={cn(
          "relative w-full overflow-hidden rounded-full border border-white/[0.06] bg-[#070707]",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
          TRACK[size]
        )}
      >
        {indeterminate ? (
          <span
            ref={sweepRef}
            // Parked off-track with an inline transform (not a translate class, which Tailwind v4
            // writes to `translate` and would stack on top of the animated `transform`).
            style={{ transform: "translateX(-100%)" }}
            className={cn(
              "absolute inset-y-0 left-0 w-[40%]",
              "motion-reduce:w-full motion-reduce:!transform-none motion-reduce:opacity-40",
              POPOUT
            )}
          />
        ) : (
          // A full-width fill slid into place, so the rounded leading edge never squashes.
          <span
            className={cn(
              "absolute inset-0 transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              POPOUT,
              shownFraction === 0 && "opacity-0"
            )}
            style={{ transform: `translateX(${(shownFraction - 1) * 100}%)` }}
          />
        )}
      </div>
    </div>
  );
});
