"use client";

import { useId } from "react";
import { motion, type MotionValue } from "framer-motion";

// The tonearm, drawn in the deck's 380 × 290 coordinate space in its parked pose. Only the arm,
// counterweight and headshell rotate (about the pivot at 318, 65); the base below and the bearing
// cap above stay put, so the light on them never turns. The arm carries its own soft shadow,
// offset down and right, which is what lifts it off the record.

const PIVOT = { x: 318, y: 65 };
const ORIGIN = `${(PIVOT.x / 380) * 100}% ${(PIVOT.y / 290) * 100}%`;
const ARM = "M318 66 L315 176 L299 224";
const SHELL = "rotate(20 296 233)";

export function Tonearm({ angle }: { angle: MotionValue<number> }) {
  const uid = useId();
  const id = (name: string) => `tt-${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <>
      {/* Base: a raised disc with a machined ring, plus the rest the arm parks on. */}
      <svg viewBox="0 0 380 290" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={id("base")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c2c2c" />
            <stop offset="100%" stopColor="#151515" />
          </linearGradient>
        </defs>
        <circle cx={PIVOT.x} cy={PIVOT.y + 2} r="24" fill="#000" opacity="0.5" />
        <circle cx={PIVOT.x} cy={PIVOT.y} r="23" fill={url("base")} stroke="rgba(255,255,255,0.08)" />
        <circle cx={PIVOT.x} cy={PIVOT.y} r="15.5" fill="#0d0d0d" stroke="rgba(255,255,255,0.06)" />
        <circle cx={PIVOT.x} cy={PIVOT.y - 0.6} r="15" fill="none" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
        <rect x="294" y="194" width="14" height="14" rx="4" fill="#111" stroke="rgba(255,255,255,0.07)" />
        <rect x="297.5" y="197.5" width="7" height="7" rx="2" fill="#070707" />
      </svg>

      <motion.div className="pointer-events-none absolute inset-0" style={{ rotate: angle, transformOrigin: ORIGIN }}>
        <svg viewBox="0 0 380 290" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <filter id={id("shadow")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.6" />
            </filter>
            <linearGradient id={id("weight")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7d7d7d" />
              <stop offset="45%" stopColor="#e6e6e6" />
              <stop offset="100%" stopColor="#868686" />
            </linearGradient>
            <linearGradient id={id("shell")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9b9b9b" />
              <stop offset="50%" stopColor="#d9d9d9" />
              <stop offset="100%" stopColor="#7a7a7a" />
            </linearGradient>
          </defs>

          {/* shadow */}
          <g filter={url("shadow")} opacity="0.45" transform="translate(5 7)">
            <path d={ARM} fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="289" y="221" width="15" height="25" rx="3" fill="#000" transform={SHELL} />
          </g>

          {/* counterweight on its stub */}
          <rect x="315.5" y="40" width="5" height="22" rx="1.5" fill="#8c8c8c" />
          <rect x="308" y="21" width="20" height="21" rx="3" fill={url("weight")} stroke="rgba(0,0,0,0.5)" />
          <rect x="309" y="21.5" width="18" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)" />
          <path d="M309 28 H327 M309 32 H327 M309 36 H327" stroke="rgba(0,0,0,0.16)" strokeWidth="0.6" />

          {/* arm: dark underside, the tube, a fine specular line along its top */}
          <path d={ARM} fill="none" stroke="#565656" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.7 0.5)" />
          <path d={ARM} fill="none" stroke="#c9c9c9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ARM} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(-0.6 0)" />

          {/* headshell, finger lift, cartridge with its blue fleck */}
          <g transform={SHELL}>
            <path d="M303 226 l7 -3" stroke="#bdbdbd" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="289" y="221" width="14" height="24" rx="3" fill={url("shell")} stroke="rgba(0,0,0,0.55)" strokeWidth="0.6" />
            <rect x="290.5" y="233" width="11" height="10" rx="1.5" fill="#161616" />
            <rect x="292" y="240" width="8" height="1.8" rx="0.9" fill="#6ea8ff" />
          </g>
        </svg>
      </motion.div>

      {/* Bearing cap over the pivot: static, so its highlight stays where the light is. */}
      <svg viewBox="0 0 380 290" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={id("cap")} cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#f2f2f2" />
            <stop offset="55%" stopColor="#9a9a9a" />
            <stop offset="100%" stopColor="#4a4a4a" />
          </radialGradient>
        </defs>
        <circle cx={PIVOT.x} cy={PIVOT.y} r="8" fill={url("cap")} stroke="rgba(0,0,0,0.6)" strokeWidth="0.8" />
      </svg>
    </>
  );
}
