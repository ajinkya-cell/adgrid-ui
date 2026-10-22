"use client";

import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import { DigitColumn } from "./DigitColumn";
import { sanitize, toParts } from "./format";

// An integer that rolls like an odometer whenever `value` changes. Every place is its own
// spring-driven wheel (see DigitColumn), started right to left with a small stagger so the change
// ripples across the number. When the number gains or loses places, the new digit and its
// separator grow in from zero width and the rest of the number slides over to make room.

export interface NumberTickerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "prefix"> {
  /** The number to show. Rounded to an integer; non-finite values keep the last good one. */
  value: number;
  /** Locale for digit grouping, e.g. `de-DE` gives 1.234. */
  locale?: string;
  /** Static text before the number, e.g. `$`. */
  prefix?: string;
  /** Static text after the number, e.g. `%`. */
  suffix?: string;
  /** Spring for the roll. The default overshoots a little before settling. */
  spring?: { stiffness?: number; damping?: number; mass?: number };
  /** Seconds between places starting to roll, from the units leftward. */
  stagger?: number;
  /** Maximum vertical motion blur, in px. 0 turns it off. */
  blur?: number;
  /** Briefly tint changed digits: `upColor` when the value rises, `downColor` when it falls. */
  flash?: boolean;
  upColor?: string;
  downColor?: string;
  /** Roll up from 0 on first render. */
  animateOnMount?: boolean;
}

const DEFAULT_SPRING = { stiffness: 140, damping: 18, mass: 1 };

export const NumberTicker = forwardRef<HTMLSpanElement, NumberTickerProps>(function NumberTicker(
  {
    value,
    locale = "en-US",
    prefix,
    suffix,
    spring,
    stagger = 0.035,
    blur = 8,
    flash = true,
    upColor = "#4ade80",
    downColor = "#f87171",
    animateOnMount = true,
    className,
    style,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion() ?? false;
  const springConfig = { ...DEFAULT_SPRING, ...spring };

  const lastFinite = useRef(0);
  const v = sanitize(value, lastFinite.current);
  lastFinite.current = v;

  // Direction of the most recent change. Refs keep it stable across StrictMode's double render.
  const prev = useRef(v);
  const direction = useRef<-1 | 0 | 1>(0);
  if (v !== prev.current) {
    direction.current = v > prev.current ? 1 : -1;
    prev.current = v;
  }

  // The sign leads the prefix, so negatives read -$1,234 rather than $-1,234.
  const all = toParts(v, locale);
  const sign = all.filter((p) => p.kind === "sign");
  const parts = all.filter((p) => p.kind !== "sign");
  const magnitude = Math.abs(v);
  const text = (ps: typeof all) => ps.map((p) => (p.kind === "digit" ? p.digit : p.char)).join("");
  const label = `${text(sign)}${prefix ?? ""}${text(parts)}${suffix ?? ""}`;

  // Places that mount after the first render grow in; on first render only if animating in.
  const enter = { width: 0, opacity: 0, filter: "blur(6px)", overflowX: "clip" as const };
  const settled = {
    width: "auto",
    opacity: 1,
    filter: "blur(0px)",
    transitionEnd: { overflowX: "visible" as const, filter: "none" },
  };
  const morph = reduced ? { duration: 0 } : { type: "spring" as const, ...springConfig };
  // Not gated on `reduced`: the server can't know it, so markup must not depend on it. Reduced
  // motion instead zeroes the transitions and makes the columns jump.
  const playIn = animateOnMount;

  const morphing = (key: string, child: ReactNode) => (
    <motion.span
      key={key}
      layout="position"
      className="inline-block"
      initial={enter}
      animate={settled}
      exit={{ ...enter, transition: morph }}
      transition={morph}
    >
      {child}
    </motion.span>
  );

  return (
    <span
      ref={ref}
      className={cn("relative inline-flex items-baseline whitespace-nowrap tabular-nums", className)}
      style={style}
      {...rest}
    >
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
      <LayoutGroup>
        <span aria-hidden className="inline-flex items-baseline">
          <AnimatePresence initial={playIn}>
            {sign.map((part) => morphing(part.key, part.kind === "sign" && part.char))}
          </AnimatePresence>
          {prefix && <motion.span layout="position">{prefix}</motion.span>}
          <AnimatePresence initial={playIn}>
            {parts.map((part) => {
              if (part.kind !== "digit") return morphing(part.key, part.char);
              const target = Math.floor(magnitude / 10 ** part.place);
              return morphing(
                part.key,
                <DigitColumn
                  target={target}
                  direction={direction.current}
                  delay={reduced ? 0 : part.place * stagger}
                  spring={springConfig}
                  blur={blur}
                  flash={flash}
                  upColor={upColor}
                  downColor={downColor}
                  reduced={reduced}
                  initial={playIn ? 0 : target}
                />,
              );
            })}
          </AnimatePresence>
          {suffix && <motion.span layout="position">{suffix}</motion.span>}
        </span>
      </LayoutGroup>
    </span>
  );
});
