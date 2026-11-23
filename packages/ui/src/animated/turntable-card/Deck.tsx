"use client";

import { useId } from "react";
import type { MotionValue } from "framer-motion";
import { cn } from "../../lib/utils";
import { Record } from "./Record";
import { Tonearm } from "./Tonearm";
import { useRecordSpin } from "./useRecordSpin";

// A machined turntable deck, drawn in a 380 × 290 coordinate space that scales as one piece.
// Back to front: the plinth (SVG), the platter well, the rotating platter + record, a fixed light
// layer over the record, then the tonearm. HTML layers are placed in that same space, in percent.

const W = 380;
const H = 290;
const PLATTER = { cx: 150, cy: 150, r: 128 };
const RECORD_R = 118;

const circleBox = (r: number) => ({
  left: `${((PLATTER.cx - r) / W) * 100}%`,
  top: `${((PLATTER.cy - r) / H) * 100}%`,
  width: `${((2 * r) / W) * 100}%`,
  height: `${((2 * r) / H) * 100}%`,
});

const LABEL_MASK = "radial-gradient(circle closest-side, transparent 42%, #000 45%)";

export interface DeckProps {
  /** Album art for the record label. */
  image?: string;
  alt: string;
  /** Whether the platter should turn; it eases up to speed and coasts to a stop. */
  spinning: boolean;
  /** Tonearm angle in degrees: 0 parked, ~21 on the lead-in grooves. */
  armAngle: MotionValue<number>;
  reducedMotion: boolean;
  className?: string;
}

export function Deck({ image, alt, spinning, armAngle, reducedMotion, className }: DeckProps) {
  const angle = useRecordSpin(spinning, { disabled: reducedMotion });
  const uid = useId();
  const id = (name: string) => `tt-${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <div className={cn("relative select-none", className)} style={{ aspectRatio: `${W} / ${H}` }} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#202020" />
            <stop offset="100%" stopColor="#141414" />
          </linearGradient>
          <linearGradient id={id("bevel")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.11)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.035)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <linearGradient id={id("knob")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#1c1c1c" />
          </linearGradient>
          <filter id={id("drop")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* plinth, its drop shadow and the lit top edge */}
        <rect x="6" y="14" width={W - 12} height={H - 6} rx="18" fill="#000" opacity="0.6" filter={url("drop")} />
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="18" fill={url("body")} stroke={url("bevel")} />

        {/* debossed inner panel: a dark cut with a faintly lit lower lip */}
        <rect x="8.5" y="9.5" width={W - 17} height={H - 18} rx="12" fill="none" stroke="rgba(255,255,255,0.04)" />
        <rect x="8.5" y="8.5" width={W - 17} height={H - 18} rx="12" fill="none" stroke="rgba(0,0,0,0.6)" />

        {/* hinge slots */}
        {[114, 230].map((x) => (
          <g key={x}>
            <rect x={x} y="2" width="36" height="5" rx="2.5" fill="#0a0a0a" />
            <rect x={x + 1} y="6.5" width="34" height="0.8" rx="0.4" fill="rgba(255,255,255,0.06)" />
          </g>
        ))}

        {/* power LED: lit while the platter turns */}
        <circle cx="22" cy="24" r="3.2" fill="#070707" stroke="rgba(255,255,255,0.05)" />
        <circle
          cx="22"
          cy="24"
          r="1.7"
          fill="#fff"
          style={{
            opacity: spinning ? 0.95 : 0.12,
            filter: spinning ? "drop-shadow(0 0 2.5px rgba(255,255,255,0.85))" : "none",
            transition: "opacity 500ms ease, filter 500ms ease",
          }}
        />

        {/* start button and speed selector */}
        <circle cx="26" cy="266" r="10" fill="#0a0a0a" />
        <circle cx="26" cy="265.4" r="8" fill={url("knob")} stroke="rgba(255,255,255,0.08)" />
        <rect x="44" y="261" width="34" height="10" rx="5" fill="#0a0a0a" />
        <rect x="45.5" y="262" width="15" height="7.5" rx="3.75" fill={url("knob")} stroke="rgba(255,255,255,0.08)" />

        {/* pitch fader */}
        <rect x="355" y="150" width="7" height="112" rx="3.5" fill="#080808" stroke="rgba(255,255,255,0.04)" />
        <path d="M346 206 H350 M367 206 H371" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <rect x="349.5" y="198" width="18" height="10" rx="2.5" fill={url("knob")} stroke="rgba(255,255,255,0.1)" />
        <rect x="351" y="202.6" width="15" height="0.8" fill="rgba(255,255,255,0.35)" />
      </svg>

      {/* platter well */}
      <div
        className="absolute rounded-full bg-[#080808]"
        style={{ ...circleBox(PLATTER.r + 3), boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.04)" }}
      />

      <div className="absolute" style={circleBox(PLATTER.r)}>
        <Record image={image} alt={alt} angle={angle} />
      </div>

      {/* fixed light: two soft opposing speculars across the grooves, and the spindle */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          ...circleBox(RECORD_R),
          background:
            "conic-gradient(from 20deg, transparent 0 6%, rgba(255,255,255,0.09) 12%, transparent 20% 56%, rgba(255,255,255,0.055) 62%, transparent 70%)",
          mixBlendMode: "screen",
          maskImage: LABEL_MASK,
          WebkitMaskImage: LABEL_MASK,
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          ...circleBox(4),
          background: "radial-gradient(circle at 38% 32%, #f0f0f0, #8a8a8a 55%, #3d3d3d)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.8)",
        }}
      />

      <Tonearm angle={armAngle} />
    </div>
  );
}
