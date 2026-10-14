"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

// A faint ring cut into the surface with a quarter arc running round it. The arc trails a softer
// half-arc behind it, so the turn reads as motion rather than a ticking wedge. It takes its colour
// from `currentColor`, so it sits on a popout button (dark) or a raised surface (light) unchanged.
// Linear 0.8s rotation: the one place linear easing is right. Under reduced motion it slows down
// rather than stopping, since a frozen spinner reads as a hang.

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 12, 16 or 20px. */
  size?: SpinnerSize;
  /** Read to screen readers. Pass `null` when the spinner sits inside something that already says it's busy. */
  label?: string | null;
}

const PX = { sm: 12, md: 16, lg: 20 };
const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, ...rest },
  ref
) {
  const px = PX[size];
  const stroke = size === "sm" ? 2.6 : 2.2;
  return (
    <span
      {...rest}
      ref={ref}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0 text-neutral-100", className)}
    >
      <svg
        viewBox="0 0 24 24"
        width={px}
        height={px}
        fill="none"
        aria-hidden="true"
        className="animate-spin [animation-duration:800ms] motion-reduce:[animation-duration:1600ms]"
      >
        <circle cx="12" cy="12" r={RADIUS} stroke="currentColor" strokeOpacity={0.14} strokeWidth={stroke} />
        {/* Strokes start at 3 o'clock and run clockwise, the way it turns. The trail covers 12 → 6;
            the arc covers 3 → 6, so it rides the trail's leading end. */}
        <circle
          cx="12"
          cy="12"
          r={RADIUS}
          stroke="currentColor"
          strokeOpacity={0.28}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE * 0.5} ${CIRCUMFERENCE}`}
          transform="rotate(-90 12 12)"
        />
        <circle
          cx="12"
          cy="12"
          r={RADIUS}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE * 0.25} ${CIRCUMFERENCE}`}
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
});
