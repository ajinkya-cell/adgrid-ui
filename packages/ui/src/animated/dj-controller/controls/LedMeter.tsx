"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { well } from "../material";

export interface LedMeterProps {
  /** 0 to about 1.2; 1 lights every segment, red included. */
  level: MotionValue<number>;
  segments?: number;
  height: number;
  width?: number;
}

const GREEN = "#3fd07a";
const AMBER = "#e9b33f";
const RED = "#e5484d";

/**
 * A column of LEDs that follows a motion value without re-rendering: each frame only flips the
 * opacity of the segments that changed. The top segment is the clip light; the next two are amber.
 */
export function LedMeter({ level, segments = 12, height, width = 8 }: LedMeterProps) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const shown = useRef(-1);

  useEffect(() => {
    const paint = (v: number) => {
      const n = Math.max(0, Math.min(segments, Math.round(v * segments)));
      if (n === shown.current) return;
      shown.current = n;
      refs.current.forEach((el, i) => {
        if (el) el.style.opacity = i < n ? "1" : "0.13";
      });
    };
    paint(level.get());
    return level.on("change", paint);
  }, [level, segments]);

  const colorOf = (i: number) => (i >= segments - 1 ? RED : i >= segments - 3 ? AMBER : GREEN);

  return (
    <div
      aria-hidden
      className="flex flex-col-reverse gap-[2px] rounded-[3px] p-[2px]"
      style={{ ...well, height, width }}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="flex-1 rounded-[1px]"
          style={{ background: colorOf(i), opacity: 0.13 }}
        />
      ))}
    </div>
  );
}
