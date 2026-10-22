"use client";

import { useEffect, useId, useRef } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

// One digit place of the ticker, drawn as an odometer wheel. The column springs a continuous
// position (the whole value at this place and above, e.g. 123 for the tens of 1,234) and draws the
// ten digits around `position mod 10`, so a rising value always rolls up and a falling one always
// rolls down, straight through 9 → 0. A column only ever turns as far as its digit changes (at most
// nine faces), and longer turns get a little more time and almost no bounce, so big jumps glide in
// rather than whipping round and overshooting. The spring's velocity drives a vertical-only SVG
// blur, which reads as motion blur rather than the soft focus a CSS `blur()` gives.

export interface DigitColumnProps {
  /** floor(|value| / 10^place) — the column's continuous target. */
  target: number;
  /** Direction of the last value change, for the flash color. */
  direction: -1 | 0 | 1;
  /** Seconds before this column starts moving (place × stagger). */
  delay: number;
  /** Seconds a one-face turn takes to settle; longer turns stretch from this. */
  duration: number;
  /** Overshoot on a one-face turn, 0–1; longer turns overshoot less. */
  bounce: number;
  /** Raw spring for every turn, overriding the distance-aware `duration` and `bounce`. */
  spring?: { stiffness: number; damping: number; mass: number };
  /** Maximum motion blur, in px. */
  blur: number;
  flash: boolean;
  upColor: string;
  downColor: string;
  /** Swap digits instantly, with no roll, blur or flash. */
  reduced: boolean;
  /** Position on mount: 0 to roll in, `target` to start settled. */
  initial: number;
  /** Faces on the wheel. 10 for an odometer; a clock's tens of seconds uses 6. */
  base?: number;
}

/**
 * A spring that takes about `duration` seconds to settle, overshooting by `bounce` (0–1), with the
 * same mapping framer-motion uses for its own `visualDuration`.
 */
export function springFromDuration(duration: number, bounce: number) {
  const root = (2 * Math.PI) / (Math.max(0.05, duration) * 1.2);
  const stiffness = root * root;
  const damping = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness);
  return { stiffness, damping, mass: 1 };
}

// Velocity (cells/s) → blur (px).
const BLUR_PER_SPEED = 0.35;
// The window extends this far above and below the glyph, so the edge fade never touches a
// settled digit.
const PAD = "0.15em";
// Side room so the flash glow isn't cut off by the mask; cancelled by a negative margin.
const GLOW_ROOM = "0.3em";
const MASK =`linear-gradient(to bottom, transparent 0, #000 ${PAD}, #000 calc(100% - ${PAD}), transparent 100%)`;

/** Offset of digit `i` from the window, in cells, wrapped to [-base/2, base/2). */
function cellOffset(i: number, position: number, base: number) {
  const m = (((i - position) % base) + base) % base;
  return m >= base / 2 ? m - base : m;
}

function Cell({ digit, position, base }: { digit: number; position: MotionValue<number>; base: number }) {
  const y = useTransform(position, (p) => `${cellOffset(digit, p, base) * 100}%`);
  // Neighbours fade out with distance, so nothing peeks into the window's padding at rest.
  const opacity = useTransform(position, (p) => Math.max(0, 1 - Math.abs(cellOffset(digit, p, base))));
  return (
    <motion.span className="absolute inset-x-0 text-center" style={{ top: PAD, bottom: PAD, y, opacity }}>
      {digit}
    </motion.span>
  );
}

export function DigitColumn({
  target,
  direction,
  delay,
  duration,
  bounce,
  spring,
  blur,
  flash,
  upColor,
  downColor,
  reduced,
  initial,
  base = 10,
}: DigitColumnProps) {
  const filterId = `nt-blur-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const position = useMotionValue(initial);
  const velocity = useVelocity(position);
  const stripRef = useRef<HTMLSpanElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);

  // Flash: `glow` runs 0–1 and mixes the up/down color into the inherited text color.
  const glow = useMotionValue(0);
  const flashColor = useMotionValue(upColor);
  const glowPct = useTransform(glow, (g) => g * 100);
  const glowRadius = useTransform(glow, (g) => g * 14);
  const color = useMotionTemplate`color-mix(in oklab, ${flashColor} ${glowPct}%, currentColor)`;
  const textShadow = useMotionTemplate`0 0 ${glowRadius}px color-mix(in oklab, ${flashColor} ${glowPct}%, transparent)`;

  const mounted = useRef(false);
  const glowControls = useRef<AnimationPlaybackControls | null>(null);
  const flashToken = useRef(0);

  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;

    if (reduced) {
      position.jump(target);
      return;
    }

    // Turn only as far as the digit changes: drop whole turns by jumping a multiple of `base`,
    // which draws the same face, so there's no visible snap.
    const gap = target - position.get();
    const travel = Math.abs(gap) % base;
    const velocity = position.getVelocity();
    if (Math.abs(gap) >= base) position.jump(target - Math.sign(gap) * travel);
    // A spring's overshoot scales with distance, so spread the bounce over the turn and give long
    // turns a bit more time: a nine-face roll takes ~1.6× a single step and barely overshoots.
    const timing =
      spring ??
      springFromDuration(duration * (1 + 0.2 * Math.sqrt(Math.max(0, travel - 1))), bounce / Math.sqrt(Math.max(1, travel)));
    // Carry the live velocity, so a change mid-roll retargets smoothly instead of restarting.
    const roll = animate(position, target, { type: "spring", ...timing, velocity, delay });

    if (!first && flash && direction !== 0) {
      flashColor.set(direction > 0 ? upColor : downColor);
      // Only the latest flash may fade out; a superseded one resolving late must not cut it short.
      const token = ++flashToken.current;
      glowControls.current?.stop();
      glowControls.current = animate(glow, 1, { duration: 0.12, delay });
      glowControls.current.then(() => {
        if (token !== flashToken.current) return;
        glowControls.current = animate(glow, 0, { duration: 0.6, delay: 0.25 });
      });
    }

    return () => roll.stop();
    // Only a new target starts a roll; prop tweaks apply to the next one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced]);

  useEffect(() => () => glowControls.current?.stop(), []);

  useMotionValueEvent(velocity, "change", (v) => {
    const y = Math.min(blur, Math.abs(v) * BLUR_PER_SPEED);
    blurRef.current?.setAttribute("stdDeviation", `0 ${y}`);
    // Drop the filter when settled so idle digits stay pixel-crisp.
    if (stripRef.current) stripRef.current.style.filter = y > 0.05 ? `url(#${filterId})` : "";
  });

  return (
    <span
      aria-hidden
      className="relative inline-block overflow-clip"
      style={{
        padding: `${PAD} ${GLOW_ROOM}`,
        margin: `-${PAD} -${GLOW_ROOM}`,
        maskImage: MASK,
        WebkitMaskImage: MASK,
      }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <filter id={filterId} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur ref={blurRef} stdDeviation="0 0" />
        </filter>
      </svg>
      {/* Sizes the window: tabular digits all share this width. */}
      <span className="invisible">0</span>
      <motion.span
        ref={stripRef}
        className="absolute inset-0"
        style={{ color, textShadow }}
      >
        {Array.from({ length: base }, (_, d) => (
          <Cell key={d} digit={d} position={position} base={base} />
        ))}
      </motion.span>
    </span>
  );
}
