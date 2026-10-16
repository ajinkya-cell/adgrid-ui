"use client";

import React, { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// A folder that opens when you hover it: a dark back panel, a few sheets of paper standing in it,
// and a frosted-glass front flap the papers show through, blurred. On hover (or keyboard focus)
// the flap tips forward on its bottom hinge and the sheets spring up out of the folder one after
// another, overshooting a touch and fanning out like a hand of cards.
//
// The front is deliberately glass — this is a showpiece, so it takes the frosted look the core
// primitives avoid. Everything else is the dark material: a raised back panel lit from above and
// pale sheets with grey bars for text.
//
// Built for a 320×290 box and scaled by `size`; every length below is in those base units.

export interface FolderRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Number of sheets in the folder, 3–5 (default: 3) */
  files?: number;
  /** Rendered width in px; height follows (default: 320) */
  size?: number;
  /** Open state (controlled) */
  open?: boolean;
  /** Initial open state (uncontrolled) (default: false) */
  defaultOpen?: boolean;
  /** Called when hover or focus opens or closes the folder */
  onOpenChange?: (open: boolean) => void;
  /** How springy the sheets are, 0 (none) to 1 (very) (default: 0.6) */
  bounce?: number;
  /** How far the flap tips forward when open, in degrees (default: 32) */
  openAngle?: number;
  /** Accessible name (default: "Folder") */
  label?: string;
}

const W = 320;
const H = 290;

// Back panel
const BACK = { left: 18, top: 18, width: 290, height: 254, radius: 20 };
// Front flap: taller on the left, stepping down to a lower right section, like a folder's front.
const FLAP = { left: 4, top: 84, width: 312, height: 206, radius: 20 };
const STEP = { x: 132, run: 50, drop: 40 };

// Sheets
const SHEET = { width: 136, height: 206, radius: 10 };

/** The flap outline in its own box: stepped top edge, rounded corners all round. */
function flapPath(s: number) {
  const r = FLAP.radius * s;
  const w = FLAP.width * s;
  const h = FLAP.height * s;
  const x1 = STEP.x * s;
  const x2 = (STEP.x + STEP.run) * s;
  const d = STEP.drop * s;
  const cx = STEP.run * 0.5 * s;
  return [
    `M 0 ${r}`,
    `Q 0 0 ${r} 0`,
    `L ${x1} 0`,
    `C ${x1 + cx} 0 ${x2 - cx} ${d} ${x2} ${d}`,
    `L ${w - r} ${d}`,
    `Q ${w} ${d} ${w} ${d + r}`,
    `L ${w} ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `L ${r} ${h}`,
    `Q 0 ${h} 0 ${h - r}`,
    "Z",
  ].join(" ");
}

/** Just the stepped top edge, for the light catching it. */
function flapEdge(s: number) {
  const r = FLAP.radius * s;
  const w = FLAP.width * s;
  const x1 = STEP.x * s;
  const x2 = (STEP.x + STEP.run) * s;
  const d = STEP.drop * s;
  const cx = STEP.run * 0.5 * s;
  return `M ${r * 0.6} ${r * 0.15} Q ${r * 0.9} 0 ${r} 0 L ${x1} 0 C ${x1 + cx} 0 ${x2 - cx} ${d} ${x2} ${d} L ${w - r} ${d}`;
}

// Grey bars on each sheet: a darker title bar, then text lines of varying length.
const BAR_SETS = [
  [62, 88, 74, 92, 56, 80, 68, 86, 60],
  [48, 82, 90, 64, 86, 72, 92, 58],
  [70, 58, 92, 78, 60, 84, 50, 88, 66],
  [54, 86, 70, 90, 66, 80, 62, 84],
  [66, 76, 88, 58, 82, 70, 90, 56],
];

interface SheetLayout {
  x: number;
  y: number;
  rotate: number;
  openX: number;
  openY: number;
  openRotate: number;
}

/** Where each sheet stands, closed and open. The first sheet is frontmost, the rest step back and right. */
function layoutSheets(count: number): SheetLayout[] {
  const n = Math.min(Math.max(Math.round(count), 3), 5);
  const span = 120; // horizontal spread of the sheets' left edges
  const step = span / (n - 1);
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => {
    const x = 40 + i * step;
    const y = 30 + i * 7;
    const rotate = -5 + (i * 14) / (n - 1);
    return {
      x,
      y,
      rotate,
      // open: rise out of the folder, fanning wider from the middle
      openX: x + (i - mid) * 14,
      openY: y - 72 - (n - 1 - i) * 6,
      openRotate: rotate * 1.9,
    };
  });
}

export function FolderReveal({
  files = 3,
  size = 320,
  open,
  defaultOpen = false,
  onOpenChange,
  bounce = 0.6,
  openAngle = 32,
  label = "Folder",
  className,
  style,
  ...rest
}: FolderRevealProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const edgeId = `${useId()}-edge`;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = open ?? innerOpen;
  const s = size / W;
  const sheets = layoutSheets(files);
  const springiness = Math.min(Math.max(bounce, 0), 1);

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  // Lower damping = more overshoot. Sheets go up on a lively spring and settle back calmly.
  const rise = { type: "spring", stiffness: 340, damping: 26 - springiness * 16, mass: 0.8 } as const;
  const sink = { type: "spring", stiffness: 320, damping: 30, mass: 0.8 } as const;
  const flapSpring = { type: "spring", stiffness: 260, damping: 24 - springiness * 8 } as const;

  return (
    <div
      role="img"
      aria-label={label}
      tabIndex={0}
      data-state={isOpen ? "open" : "closed"}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={cn(
        "relative select-none rounded-3xl outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        className
      )}
      style={{ width: W * s, height: H * s, ...style }}
      {...rest}
    >
      {/* ground shadow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[50%]"
        style={{
          left: 30 * s,
          right: 30 * s,
          bottom: -14 * s,
          height: 28 * s,
          background: "radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)",
          filter: `blur(${6 * s}px)`,
        }}
        initial={false}
        animate={{ scaleX: isOpen && !reduceMotion ? 1.06 : 1, opacity: isOpen ? 0.9 : 1 }}
        transition={flapSpring}
      />

      {/* back panel */}
      <div
        aria-hidden="true"
        className="absolute border border-white/[0.08]"
        style={{
          left: BACK.left * s,
          top: BACK.top * s,
          width: BACK.width * s,
          height: BACK.height * s,
          borderRadius: BACK.radius * s,
          background: "linear-gradient(180deg, #2a2a2c 0%, #18181a 55%, #111112 100%)", // void-lint-ignore: a step lighter than surface-raised so the folder reads on the dark page
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255,255,255,0.10), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 20px 40px -12px rgba(0,0,0,0.7), 0 2px 8px -2px rgba(0,0,0,0.5)",
        }}
      />

      {/* sheets: drawn back to front, so the first one sits in front */}
      {sheets
        .map((sheet, i) => ({ sheet, i }))
        .reverse()
        .map(({ sheet, i }) => {
          const bars = BAR_SETS[i % BAR_SETS.length];
          const moving = !reduceMotion;
          return (
            <motion.div
              key={i}
              aria-hidden="true"
              className="absolute overflow-hidden"
              style={{
                left: 0,
                top: 0,
                width: SHEET.width * s,
                height: SHEET.height * s,
                borderRadius: SHEET.radius * s,
                transformOrigin: "50% 100%",
                background: "linear-gradient(180deg, #f2f2f3 0%, #e2e2e4 100%)", // void-lint-ignore: paper sheets, as in the reference
                boxShadow: `0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.28), ${-6 * s}px 0 ${14 * s}px -${6 * s}px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)`,
                padding: `${18 * s}px ${16 * s}px`,
              }}
              initial={false}
              animate={
                isOpen && moving
                  ? { x: sheet.openX * s, y: sheet.openY * s, rotate: sheet.openRotate }
                  : { x: sheet.x * s, y: sheet.y * s, rotate: sheet.rotate }
              }
              transition={{
                ...(isOpen ? rise : sink),
                // rise front sheet last so the fan opens from the back; sink all together
                delay: isOpen ? (sheets.length - 1 - i) * 0.06 : 0,
              }}
            >
              {bars.map((width, b) => (
                <div
                  key={b}
                  className="rounded-full"
                  style={{
                    width: `${width}%`,
                    height: (b === 0 ? 9 : 6) * s,
                    marginBottom: (b === 0 ? 14 : 9) * s,
                    background: b === 0 ? "#c4c4c8" : "#d3d3d6", // void-lint-ignore: grey text bars on paper
                  }}
                />
              ))}
            </motion.div>
          );
        })}

      {/* front flap: frosted glass, hinged on its bottom edge */}
      <motion.div
        aria-hidden="true"
        className="absolute"
        style={{
          left: FLAP.left * s,
          top: FLAP.top * s,
          width: FLAP.width * s,
          height: FLAP.height * s,
          transformOrigin: "50% 100%",
        }}
        initial={false}
        animate={{
          transform:
            isOpen && !reduceMotion
              ? `perspective(${700 * s}px) rotateX(${-openAngle}deg)`
              : `perspective(${700 * s}px) rotateX(0deg)`,
        }}
        transition={flapSpring}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: `path("${flapPath(s)}")`,
            background:
              "linear-gradient(180deg, rgba(130,130,134,0.30) 0%, rgba(70,70,74,0.42) 45%, rgba(12,12,13,0.85) 100%)",
            backdropFilter: `blur(${8 * s}px)`,
            WebkitBackdropFilter: `blur(${8 * s}px)`,
            boxShadow: `inset 0 ${-24 * s}px ${36 * s}px rgba(0,0,0,0.45)`,
          }}
        />
        {/* light catching the stepped top edge, and a faint rim all round */}
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={FLAP.width * s}
          height={FLAP.height * s}
          fill="none"
        >
          <defs>
            <linearGradient id={edgeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="75%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          <path d={flapPath(s)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          <path d={flapEdge(s)} stroke={`url(#${edgeId})`} strokeWidth={1.25} strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}
