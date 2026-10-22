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
// rolls down, straight through 9 → 0. The spring's velocity drives a vertical-only SVG blur, which
// reads as motion blur rather than the soft focus a CSS `blur()` gives.

export interface DigitColumnProps {
  /** floor(|value| / 10^place) — the column's continuous target. */
  target: number;
  /** Direction of the last value change, for the flash color. */
  direction: -1 | 0 | 1;
  /** Seconds before this column starts moving (place × stagger). */
  delay: number;
  spring: { stiffness: number; damping: number; mass: number };
  /** Maximum motion blur, in px. */
  blur: number;
  flash: boolean;
  upColor: string;
  downColor: string;
  /** Swap digits instantly, with no roll, blur or flash. */
  reduced: boolean;
  /** Position on mount: 0 to roll in, `target` to start settled. */
  initial: number;
}

// A column never spins more than one full turn, however far the value jumps.
const MAX_SPIN = 10;
// Velocity (cells/s) → blur (px).
const BLUR_PER_SPEED = 0.35;
// The window extends this far above and below the glyph, so the edge fade never touches a
// settled digit.
const PAD = "0.15em";
const MASK = `linear-gradient(to bottom, transparent 0, #000 ${PAD}, #000 calc(100% - ${PAD}), transparent 100%)`;

/** Offset of digit `i` from the window, in cells, wrapped to [-5, 5). */
function cellOffset(i: number, position: number) {
  const m = (((i - position) % 10) + 10) % 10;
  return ((m + 5) % 10) - 5;
}

function Cell({ digit, position }: { digit: number; position: MotionValue<number> }) {
  const y = useTransform(position, (p) => `${cellOffset(digit, p) * 100}%`);
  return (
    <motion.span className="absolute inset-x-0 text-center" style={{ top: PAD, bottom: PAD, y }}>
      {digit}
    </motion.span>
  );
}

export function DigitColumn({
  target,
  direction,
  delay,
  spring,
  blur,
  flash,
  upColor,
  downColor,
  reduced,
  initial,
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

  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;

    if (reduced) {
      position.jump(target);
      return;
    }

    const gap = target - position.get();
    if (Math.abs(gap) > MAX_SPIN) position.jump(target - Math.sign(gap) * MAX_SPIN);
    // `animate` picks up from the live value and velocity, so a change mid-roll retargets
    // smoothly instead of restarting.
    const roll = animate(position, target, { type: "spring", ...spring, delay });

    if (!first && flash && direction !== 0) {
      flashColor.set(direction > 0 ? upColor : downColor);
      glowControls.current?.stop();
      glowControls.current = animate(glow, 1, { duration: 0.12, delay });
      glowControls.current.then(() => {
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
      style={{ paddingBlock: PAD, marginBlock: `-${PAD}`, maskImage: MASK, WebkitMaskImage: MASK }}
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
        style={reduced ? undefined : { color, textShadow }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <Cell key={d} digit={d} position={position} />
        ))}
      </motion.span>
    </span>
  );
}
