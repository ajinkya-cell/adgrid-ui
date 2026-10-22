"use client";

import { useEffect, useState, type HTMLAttributes } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import { DigitColumn } from "./DigitColumn";

// A live HH:MM:SS clock on the ticker's odometer wheels, set into a recessed well. Each digit is
// its own wheel with as many faces as that digit can show (the tens of minutes has six), and it
// only ever turns forward, so 59 → 00 steps up to the next face instead of spinning back.

export interface NumberTickerClockProps extends HTMLAttributes<HTMLDivElement> {
  /** Show the seconds wheels. */
  showSeconds?: boolean;
  /** Seconds a roll takes to settle. */
  duration?: number;
  /** Overshoot before settling, 0–1. */
  bounce?: number;
  /** Seconds between neighbouring wheels starting to roll, from the right. */
  stagger?: number;
  /** Maximum vertical motion blur, in px. */
  blur?: number;
}

// Faces per wheel: H H : M M : S S.
const BASES = [3, 10, 6, 10, 6, 10];
const ZERO = [0, 0, 0, 0, 0, 0];

function digitsOf(d: Date) {
  const [h, m, s] = [d.getHours(), d.getMinutes(), d.getSeconds()];
  return [Math.floor(h / 10), h % 10, Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10];
}

type Wheels = { digits: number[]; turns: number[] };

/** Advance every wheel forward to its new digit; `turns` is the wheel's running position. */
function advance(prev: Wheels, digits: number[]): Wheels {
  const turns = prev.turns.map((t, i) => t + ((digits[i] - prev.digits[i] + BASES[i]) % BASES[i]));
  return { digits, turns };
}

function Colon() {
  return (
    <span aria-hidden className="mx-[0.14em] flex h-[0.56em] flex-col justify-between self-center">
      <span className="size-[0.1em] rounded-full bg-neutral-500 shadow-[0_1px_0_rgba(0,0,0,0.8)]" />
      <span className="size-[0.1em] rounded-full bg-neutral-500 shadow-[0_1px_0_rgba(0,0,0,0.8)]" />
    </span>
  );
}

export function NumberTickerClock({
  showSeconds = true,
  duration = 0.45,
  bounce = 0.25,
  stagger = 0.04,
  blur = 8,
  className,
  ...rest
}: NumberTickerClockProps) {
  const reduced = useReducedMotion() ?? false;
  // Starts at 00:00:00 so server and client markup match; the first tick rolls up to the time.
  const [wheels, setWheels] = useState<Wheels>({ digits: ZERO, turns: ZERO });

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = new Date();
      setWheels((w) => advance(w, digitsOf(now)));
      // Land just after each second boundary so the wheels turn on the second.
      id = setTimeout(tick, 1000 - now.getMilliseconds() + 5);
    };
    tick();
    return () => clearTimeout(id);
  }, []);

  const count = showSeconds ? 6 : 4;
  const [h1, h2, m1, m2, s1, s2] = wheels.digits;
  const label = `${h1}${h2}:${m1}${m2}${showSeconds ? `:${s1}${s2}` : ""}`;

  const wheel = (i: number) => (
    <DigitColumn
      key={i}
      target={wheels.turns[i]}
      direction={1}
      delay={reduced ? 0 : (count - 1 - i) * stagger}
      duration={duration}
      bounce={bounce}
      blur={blur}
      flash={false}
      upColor=""
      downColor=""
      reduced={reduced}
      initial={0}
      base={BASES[i]}
    />
  );

  return (
    <div
      role="timer"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-2xl border border-white/[0.03] border-t-black/80 border-b-white/10 bg-[#060708] px-[0.4em] py-[0.18em] text-6xl font-semibold tracking-tight text-neutral-100 tabular-nums shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),inset_0_-1px_0_rgba(255,255,255,0.03)] select-none",
        className,
      )}
      {...rest}
    >
      {wheel(0)}
      {wheel(1)}
      <Colon />
      {wheel(2)}
      {wheel(3)}
      {showSeconds && (
        <>
          <Colon />
          {wheel(4)}
          {wheel(5)}
        </>
      )}
    </div>
  );
}
