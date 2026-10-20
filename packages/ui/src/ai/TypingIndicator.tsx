"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Shows the assistant is working before any words arrive. Two forms:
// - dots: three small dots breathing in turn, lifted straight from the Chat FAQ bubble.
// - shimmer: a label ("Thinking") with a band of light passing across it, left to right.
// Both are live states, so both may move; neither glows. Under reduced motion the dots keep their
// slow fade (it's opacity only) and the shimmer becomes a gentle fade of the whole label.
// It's a status region, so screen readers hear the label once.

export type TypingIndicatorVariant = "dots" | "shimmer";
export type TypingIndicatorSize = "sm" | "md" | "lg";

export interface TypingIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Default "dots". */
  variant?: TypingIndicatorVariant;
  /** Default "md". */
  size?: TypingIndicatorSize;
  /** Shown by the shimmer, read by screen readers for both. Default "Thinking". */
  label?: string;
}

const SIZES = {
  sm: { dot: "size-1", gap: "gap-1", text: "text-[13px]" },
  md: { dot: "size-[5px]", gap: "gap-1.5", text: "text-sm" },
  lg: { dot: "size-1.5", gap: "gap-2", text: "text-[15px]" },
} as const;

// Dim text with a brighter band in the middle of a wide background; sliding the background moves
// the band across the letters.
const SHIMMER =
  "bg-[linear-gradient(90deg,#737373_0%,#737373_40%,#e5e5e5_50%,#737373_60%,#737373_100%)] bg-[length:250%_100%] bg-clip-text text-transparent";

export const TypingIndicator = forwardRef<HTMLSpanElement, TypingIndicatorProps>(function TypingIndicator(
  { variant = "dots", size = "md", label = "Thinking", className, ...rest },
  ref
) {
  const reduce = useReducedMotion() ?? false;
  const s = SIZES[size];

  return (
    <span
      {...rest}
      ref={ref}
      role="status"
      data-variant={variant}
      className={cn("inline-flex items-center", className)}
    >
      {variant === "dots" ? (
        <>
          <span aria-hidden="true" className={cn("inline-flex h-[1.5em] items-center", s.gap)}>
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className={cn("rounded-full bg-neutral-400", s.dot)}
                initial={{ opacity: 0.25 }}
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: reduce ? 1.6 : 1, repeat: Infinity, delay: d * 0.16, ease: "easeInOut" }}
              />
            ))}
          </span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <motion.span
          className={cn("font-medium tracking-tight select-none", s.text, reduce ? "text-neutral-400" : SHIMMER)}
          initial={reduce ? { opacity: 0.5 } : { backgroundPosition: "100% 0%" }}
          animate={reduce ? { opacity: [0.5, 1, 0.5] } : { backgroundPosition: ["100% 0%", "0% 0%"] }}
          transition={{ duration: reduce ? 2 : 1.8, repeat: Infinity, ease: reduce ? "easeInOut" : "linear" }}
        >
          {label}
        </motion.span>
      )}
    </span>
  );
});
