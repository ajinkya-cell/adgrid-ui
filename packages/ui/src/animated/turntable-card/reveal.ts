"use client";

import { useTransform, type MotionValue } from "framer-motion";

// One layer of the hover choreography. Every layer reads the same 0→1 `open` value through its own
// slice of that range, so the sequence is a pure function of one number: a half-finished hover
// reverses from exactly where it is, and closing plays the opening backwards.

export interface RevealOptions {
  /** Slice of `open` over which this layer moves. */
  range: [number, number];
  /** true: visible at open = 0 and leaving; false: arriving as `open` grows. */
  out?: boolean;
  /** Travel in px at the hidden end (negative = above). */
  y?: number;
  /** Blur in px at the hidden end. */
  blur?: number;
  /** Reduced motion: opacity only. */
  still?: boolean;
}

export function useReveal(open: MotionValue<number>, { range, out = false, y = 0, blur = 0, still = false }: RevealOptions) {
  const shown = useTransform(open, range, out ? [1, 0] : [0, 1]);
  const translate = useTransform(shown, (v) => (still ? 0 : (1 - v) * y));
  const filter = useTransform(shown, (v) => {
    const b = still ? 0 : (1 - v) * blur;
    return b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none";
  });
  return { opacity: shown, y: translate, filter };
}
