"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../../../lib/utils";
import { SHADOW_RAISED, well } from "../material";

export interface FaderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
  orientation?: "vertical" | "horizontal";
  /** Length of the whole control along its travel, in px. */
  length: number;
  /** Catch at the centre (tempo, crossfader). */
  detent?: boolean;
  /** Tick marks along the slot. */
  ticks?: number;
  ariaLabel: string;
  format?: (value: number) => string;
  onDetent?: () => void;
  className?: string;
}

const CAP_LONG = 22; // along the travel
const CAP_WIDE = 40; // across it

/** A slide pot: drag the cap (it moves with the pointer, never jumps), arrow keys, double-click to reset. */
export function Fader({
  value,
  onChange,
  min = 0,
  max = 1,
  defaultValue = min,
  orientation = "vertical",
  length,
  detent = false,
  ticks = 9,
  ariaLabel,
  format,
  onDetent,
  className,
}: FaderProps) {
  const vertical = orientation === "vertical";
  const drag = useRef<{ p: number; v: number; travel: number } | null>(null);
  const range = max - min;
  const norm = (value - min) / range;
  const travel = length - CAP_LONG;
  // Vertical: max at the top. Horizontal: max on the right.
  const offset = vertical ? (1 - norm) * travel : norm * travel;

  const commit = (raw: number) => {
    let v = Math.min(max, Math.max(min, raw));
    if (detent) {
      const centre = (min + max) / 2;
      if (Math.abs(v - centre) < range * 0.025) {
        if (value !== centre) onDetent?.();
        v = centre;
      }
    }
    if (v !== value) onChange(v);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    // The rect is in screen px (the chassis may be scaled), so measure travel in the same units.
    const screenLen = vertical ? rect.height : rect.width;
    drag.current = { p: vertical ? e.clientY : e.clientX, v: value, travel: screenLen * (travel / length) };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const delta = (vertical ? d.p - e.clientY : e.clientX - d.p) / d.travel;
    commit(d.v + delta * range * (e.shiftKey ? 0.25 : 1));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = range / (e.shiftKey ? 200 : 40);
    const next: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + range / 8,
      PageDown: value - range / 8,
      Home: min,
      End: max,
      Delete: defaultValue,
      Backspace: defaultValue,
    };
    if (e.key in next) {
      e.preventDefault();
      commit(next[e.key]!);
    }
  };

  const tickMarks = Array.from({ length: ticks }, (_, i) => (CAP_LONG / 2 + (i / (ticks - 1)) * travel));

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Number(value.toFixed(3))}
      aria-valuetext={format?.(value)}
      className={cn(
        "relative shrink-0 touch-none select-none rounded-md outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        vertical ? "cursor-ns-resize" : "cursor-ew-resize",
        className
      )}
      style={vertical ? { width: CAP_WIDE, height: length } : { width: length, height: CAP_WIDE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => commit(defaultValue)}
      onKeyDown={onKeyDown}
    >
      {/* scale ticks either side of the slot; the centre one is longer on a detented fader */}
      {tickMarks.map((t, i) => {
        const centre = detent && i === (ticks - 1) / 2;
        const len = centre ? 7 : 4;
        return vertical ? (
          <span key={i} aria-hidden className="absolute flex justify-between" style={{ top: t - 0.5, left: 3, right: 3, height: 1 }}>
            <span className="h-px bg-white/15" style={{ width: len }} />
            <span className="h-px bg-white/15" style={{ width: len }} />
          </span>
        ) : (
          <span key={i} aria-hidden className="absolute flex flex-col justify-between" style={{ left: t - 0.5, top: 3, bottom: 3, width: 1 }}>
            <span className="w-px bg-white/15" style={{ height: len }} />
            <span className="w-px bg-white/15" style={{ height: len }} />
          </span>
        );
      })}

      {/* the slot */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          ...well,
          ...(vertical
            ? { left: CAP_WIDE / 2 - 2.5, width: 5, top: CAP_LONG / 2 - 3, bottom: CAP_LONG / 2 - 3 }
            : { top: CAP_WIDE / 2 - 2.5, height: 5, left: CAP_LONG / 2 - 3, right: CAP_LONG / 2 - 3 }),
        }}
      />

      {/* the cap, with a white index line across it */}
      <span
        aria-hidden
        className="absolute flex items-center justify-center rounded-[5px]"
        style={{
          background: "linear-gradient(180deg, #2a2a2d 0%, #151516 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: SHADOW_RAISED,
          ...(vertical
            ? { left: 4, width: CAP_WIDE - 8, height: CAP_LONG, top: offset }
            : { top: 4, height: CAP_WIDE - 8, width: CAP_LONG, left: offset }),
        }}
      >
        <span className="rounded-full bg-neutral-100" style={vertical ? { width: "70%", height: 1.5 } : { height: "70%", width: 1.5 }} />
      </span>
    </div>
  );
}
