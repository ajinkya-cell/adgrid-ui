"use client";

import { useId, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../../../lib/utils";
import { LABEL } from "../material";

export interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Double-click, Delete or Backspace returns here. */
  defaultValue?: number;
  /** The value arc grows from 12 o'clock and the knob catches at the centre. */
  bipolar?: boolean;
  size?: number;
  label: string;
  /** Accessible name when the printed label is too terse ("Deck 1 high EQ"). */
  ariaLabel?: string;
  /** Text read by screen readers for the current value. */
  format?: (value: number) => string;
  /** Called when a bipolar knob catches at the centre. */
  onDetent?: () => void;
  className?: string;
}

const SWEEP = 135; // degrees either side of 12 o'clock
const DRAG_PX = 160; // pointer travel for the full range

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  if (Math.abs(to - from) < 0.01) return "";
  const [x1, y1] = polar(cx, cy, r, Math.min(from, to));
  const [x2, y2] = polar(cx, cy, r, Math.max(from, to));
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/** A rotary pot: drag up or down, arrow keys, double-click to reset. */
export function Knob({
  value,
  onChange,
  min = 0,
  max = 1,
  defaultValue = min,
  bipolar = false,
  size = 38,
  label,
  ariaLabel,
  format,
  onDetent,
  className,
}: KnobProps) {
  const drag = useRef<{ y: number; v: number } | null>(null);
  const gradId = `knob-${useId()}`;
  const range = max - min;
  const norm = (value - min) / range;
  const angle = -SWEEP + norm * SWEEP * 2;
  const zeroAngle = bipolar ? 0 : -SWEEP;
  const c = size / 2;
  const ringR = c - 1.5;
  const capR = c - 5.5;

  const commit = (raw: number) => {
    let v = Math.min(max, Math.max(min, raw));
    if (bipolar) {
      const centre = (min + max) / 2;
      if (Math.abs(v - centre) < range * 0.03) {
        if (value !== centre) onDetent?.();
        v = centre;
      }
    }
    if (v !== value) onChange(v);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, v: value };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const fine = e.shiftKey ? 0.25 : 1;
    commit(drag.current.v + ((drag.current.y - e.clientY) / DRAG_PX) * range * fine);
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = range / (e.shiftKey ? 100 : 25);
    const next: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + range / 5,
      PageDown: value - range / 5,
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

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel ?? label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(3))}
        aria-valuetext={format?.(value)}
        className="relative cursor-ns-resize touch-none rounded-full outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40"
        style={{ width: size, height: size }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => commit(defaultValue)}
        onKeyDown={onKeyDown}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c2c2f" />
              <stop offset="100%" stopColor="#141415" />
            </linearGradient>
          </defs>
          {/* scale ring and the value arc on it */}
          <path d={arc(c, c, ringR, -SWEEP, SWEEP)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
          <path d={arc(c, c, ringR, zeroAngle, angle)} fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="1.5" strokeLinecap="round" />
          {bipolar && <circle cx={c} cy={1.5 - 3} r="0.9" fill="rgba(255,255,255,0.35)" />}
          {/* cap: drop shadow, body, top-lit lip */}
          <circle cx={c} cy={c + 1.5} r={capR} fill="rgba(0,0,0,0.6)" />
          <circle cx={c} cy={c} r={capR} fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.07)" />
          <path d={arc(c, c, capR - 0.75, -70, 70)} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
          <g transform={`rotate(${angle} ${c} ${c})`}>
            <line x1={c} y1={c - capR + 2.5} x2={c} y2={c - capR * 0.35} stroke="#ededed" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <span className={LABEL}>{label}</span>
    </div>
  );
}
