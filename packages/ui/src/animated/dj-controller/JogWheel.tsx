"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { alpha, raised, SHADOW_WELL } from "./material";

export interface JogWheelProps {
  deck: 0 | 1;
  /** Platter rotation in degrees, written by the deck clock every frame. */
  angle: MotionValue<number>;
  accent: string;
  playing: boolean;
  size?: number;
  onGrab: () => void;
  /** Degrees the hand turned the platter since the last call, clockwise positive. */
  onTurn: (degrees: number) => void;
  onRelease: () => void;
  /** Keyboard nudge, in beats. */
  onNudge: (beats: number) => void;
}

/**
 * The platter: a raised ring holding a knurled, rotating top plate and a round centre display.
 * The light (a fixed anisotropic sheen) sits on a layer above the plate, so the metal turns under
 * it instead of the highlight spinning with it. Grab it to scratch; it follows the pointer's angle
 * around the centre, and a flick carries on spinning when let go.
 */
export function JogWheel({ deck, angle, accent, playing, size = 330, onGrab, onTurn, onRelease, onNudge }: JogWheelProps) {
  const last = useRef<number | null>(null);
  const markerRotate = useTransform(angle, (a) => a % 360);

  const pointerAngle = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = pointerAngle(e);
    onGrab();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (last.current === null) return;
    const a = pointerAngle(e);
    let d = a - last.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    last.current = a;
    onTurn(d);
  };
  const onPointerUp = () => {
    if (last.current === null) return;
    last.current = null;
    onRelease();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 0.25;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onNudge(step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onNudge(-step);
    else return;
    e.preventDefault();
  };

  const ring = 14; // raised rim width
  const plate = size - ring * 2;
  const display = Math.round(size * 0.34);

  return (
    <div className="relative shrink-0 rounded-full" style={{ ...raised, width: size, height: size }}>
      {/* the light ring in the rim, lit while the deck plays */}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: 5,
          border: `2px solid ${alpha(accent, playing ? 0.85 : 0.3)}`,
          boxShadow: playing ? `0 0 10px -2px ${alpha(accent, 0.7)}, inset 0 0 8px -3px ${alpha(accent, 0.6)}` : "none",
          transition: "border-color 200ms, box-shadow 200ms",
        }}
      />

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Deck ${deck + 1} jog wheel`}
        aria-valuetext="Drag around the centre to scratch; arrow keys nudge"
        aria-valuemin={0}
        aria-valuemax={0}
        aria-valuenow={0}
        className="absolute cursor-grab touch-none rounded-full outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40 active:cursor-grabbing"
        style={{ inset: ring, boxShadow: SHADOW_WELL, background: "#0b0b0c" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {/* the turning plate: knurled outer band, strobe dots, brushed top */}
        <motion.div aria-hidden className="absolute inset-0 rounded-full will-change-transform" style={{ rotate: angle }}>
          <span
            className="absolute inset-[3px] rounded-full"
            style={{
              background: "repeating-conic-gradient(from 0deg, #1c1c1e 0deg 1.2deg, #0f0f10 1.2deg 2.4deg)",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              inset: 16,
              background: "radial-gradient(circle, #19191b 0%, #151517 70%, #121213 100%)",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.05)",
            }}
          />
          <svg viewBox={`0 0 ${plate} ${plate}`} className="absolute inset-0 h-full w-full">
            <circle
              cx={plate / 2}
              cy={plate / 2}
              r={plate / 2 - 22}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray={`0.01 ${((2 * Math.PI * (plate / 2 - 22)) / 72).toFixed(3)}`}
            />
          </svg>
        </motion.div>

        {/* fixed light over the plate */}
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: 16,
            background:
              "conic-gradient(from 200deg, transparent 0deg, rgba(255,255,255,0.05) 30deg, transparent 70deg, transparent 180deg, rgba(255,255,255,0.035) 210deg, transparent 250deg)",
          }}
        />

        {/* centre display: a dark lens with the position marker turning with the platter */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
          style={{
            width: display,
            height: display,
            background: "radial-gradient(circle at 50% 35%, #111113 0%, #050505 75%)",
            boxShadow: `${SHADOW_WELL}, 0 0 0 1px rgba(255,255,255,0.06)`,
          }}
        >
          <motion.span className="absolute inset-[5px] rounded-full" style={{ rotate: markerRotate }}>
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
              style={{ width: 3, height: 12, background: playing ? accent : alpha(accent, 0.55) }}
            />
          </motion.span>
          <span className="font-mono text-[26px] font-semibold leading-none text-neutral-100">{deck + 1}</span>
          <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-neutral-500">Vinyl</span>
        </div>
      </div>
    </div>
  );
}
