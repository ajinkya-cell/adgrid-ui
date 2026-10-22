"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { VoidButton } from "../VoidButton";
import { NumberTicker, type NumberTickerProps } from "./NumberTicker";
import { NumberTickerClock } from "./NumberTickerClock";

// A large ticker with a row of buttons that push it through every kind of change: single steps,
// multi-place rolls, gaining and losing places, sign flips and random jumps. Below it, a live
// clock on the same wheels, sharing the roll timing.

export interface NumberTickerPlaygroundProps extends Omit<NumberTickerProps, "value"> {
  /** Starting value. */
  start?: number;
}

const ACTIONS: { label: string; apply: (n: number) => number }[] = [
  { label: "+1", apply: (n) => n + 1 },
  { label: "+97", apply: (n) => n + 97 },
  { label: "−250", apply: (n) => n - 250 },
  { label: "×1000", apply: (n) => n * 1000 },
  { label: "÷1000", apply: (n) => Math.round(n / 1000) },
  { label: "Random", apply: () => Math.floor(Math.random() * 100000) },
  { label: "Negate", apply: (n) => -n },
];

export function NumberTickerPlayground({ start = 1234, prefix = "$", className, ...props }: NumberTickerPlaygroundProps) {
  const { duration, bounce, stagger, blur } = props;
  const [value, setValue] = useState(start);
  return (
    <div className="flex w-full flex-col items-center gap-10 py-6">
      <NumberTicker
        value={value}
        prefix={prefix}
        className={cn("text-6xl font-semibold tracking-tight text-neutral-100 sm:text-7xl", className)}
        {...props}
      />
      <div className="flex flex-wrap justify-center gap-2">
        {ACTIONS.map((a) => (
          <VoidButton key={a.label} style="pill" length={88} onClick={() => setValue(a.apply)}>
            {a.label}
          </VoidButton>
        ))}
      </div>
      <NumberTickerClock duration={duration} bounce={bounce} stagger={stagger} blur={blur} className="mt-4 text-5xl sm:text-6xl" />
    </div>
  );
}
