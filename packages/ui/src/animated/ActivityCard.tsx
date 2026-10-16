"use client";

import React, { forwardRef, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// A daily activity summary: a raised card with a heading, metric rows on the left and, tucked into
// the bottom-right corner, concentric rings that wrap a score disc. The card clips the rings so
// they read as arcs sweeping in from the edge.
//
// Material: each ring runs in a sunken well track; its fill steps from dim (outer) to popout
// (inner), so the eye travels in toward the score disc, which sits sunk into the card's corner as the
// lightest object on the card. Pearls at the ring ends carry the values. Colour appears only on
// the change figure (status text with an arrow) and in the two metric glyphs.
// Underneath each ring is a real <meter> (visually hidden) for screen readers.

export interface ActivityCardMetric {
  /** "moon" and "heart" draw the built-in glyphs; any node renders as-is */
  icon: "moon" | "heart" | React.ReactNode;
  value: React.ReactNode;
  label: string;
  /** A change figure shown beside the value, e.g. { value: "12%", direction: "up" } */
  change?: { value: string; direction: "up" | "down" };
}

export interface ActivityCardRing {
  value: number;
  /** Upper bound of the ring (default: 100) */
  max?: number;
  /** Read out by screen readers */
  label: string;
}

export interface ActivityCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Heading before the dot (default: "Today") */
  title?: string;
  /** Heading after the dot (default: "21 Feb") */
  date?: string;
  /** Up to three rows on the left */
  metrics?: ActivityCardMetric[];
  /** Up to three rings, outermost first */
  rings?: ActivityCardRing[];
  /** Number in the centre disc (default: 16) */
  score?: React.ReactNode;
  /** Unit under the score (default: "PAI") */
  scoreLabel?: string;
  /** Draw the rings in on mount (default: true) */
  animate?: boolean;
}

const DEFAULT_METRICS: ActivityCardMetric[] = [
  { icon: "moon", value: "7h 2m", label: "Sleep time", change: { value: "12%", direction: "up" } },
  { icon: "heart", value: "56 bpm", label: "Avg. heart rate" },
];

const DEFAULT_RINGS: ActivityCardRing[] = [
  { value: 31, label: "Light activity" },
  { value: 84, label: "Moderate activity" },
  { value: 53, label: "Vigorous activity" },
];

// Ring geometry, in px. The rings share a centre near the card's bottom-right corner.
const ART_W = 180;
const CARD_H = 176;
// The disc sits in the bottom-right corner, its edge sunk under the card's right and bottom edges.
const CX = ART_W - 44;
const CY = CARD_H - 36;
const DISC = 92;
// Thick bands hugging the disc, 4px apart.
const RADII = [104, 82, 60];
const STROKE = 18;
// Rings rise out of the card's bottom edge and sweep clockwise up over the disc; a full ring
// would end just past twelve o'clock.
const START = 150;
const SWEEP = 150;
// Tracks and fills are drawn from straight down (hidden under the bottom edge) so no cap shows
// where they enter; tracks run on to three o'clock, past the right edge, so they leave the card whole.
const ENTRY = 90;
const TRACK_END = 360;

// Fill per ring, outermost first: dim → popout, leading the eye in to the disc.
const FILLS = ["rgba(255,255,255,0.32)", "rgba(255,255,255,0.6)", "popout"];

const EASE_OUT = [0.32, 0.72, 0, 1] as const;
const SUCCESS = "rgb(126 190 152)";
const DANGER = "rgb(229 115 115)";

function point(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arc(r: number, from: number, to: number) {
  const a = point(r, from);
  const b = point(r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

// The two metric glyphs keep their own colours: a periwinkle moon and a glossy red heart.
const MOON = {
  top: "#a9b6ff", // void-lint-ignore: moon glyph colour
  bottom: "#7d8ff2", // void-lint-ignore: moon glyph colour
  outline: "#3346d3", // void-lint-ignore: moon glyph colour
};
const HEART = {
  top: "#ff4a4f", // void-lint-ignore: heart glyph colour
  bottom: "#d1132a", // void-lint-ignore: heart glyph colour
  outline: "#8c0718", // void-lint-ignore: heart glyph colour
};

function MoonGlyph() {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MOON.top} />
          <stop offset="100%" stopColor={MOON.bottom} />
        </linearGradient>
      </defs>
      <path
        d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
        fill={`url(#${id}-fill)`}
        stroke={MOON.outline}
        strokeWidth="1.7"
        strokeLinejoin="round"
        transform="rotate(-8 12 12)"
      />
    </svg>
  );
}

function HeartGlyph() {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={HEART.top} />
          <stop offset="100%" stopColor={HEART.bottom} />
        </linearGradient>
      </defs>
      <path
        d="M12 20.6s-7.4-4.5-9.4-9C1.1 8.2 3.1 4.4 6.7 4.1c2.2-.2 4 .9 5.3 2.8 1.3-1.9 3.1-3 5.3-2.8 3.6.3 5.6 4.1 4.1 7.5-2 4.5-9.4 9-9.4 9Z"
        fill={`url(#${id}-fill)`}
        stroke={HEART.outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* the gloss on the left lobe */}
      <ellipse cx="7.4" cy="8.3" rx="2" ry="1.2" transform="rotate(-38 7.4 8.3)" fill="#fff" opacity="0.75" />
    </svg>
  );
}

function MetricIcon({ icon }: { icon: ActivityCardMetric["icon"] }) {
  if (icon === "moon") return <MoonGlyph />;
  if (icon === "heart") return <HeartGlyph />;
  return <>{icon}</>;
}

export const ActivityCard = forwardRef<HTMLElement, ActivityCardProps>(function ActivityCard(
  {
    title = "Today",
    date = "21 Feb",
    metrics = DEFAULT_METRICS,
    rings = DEFAULT_RINGS,
    score = 16,
    scoreLabel = "PAI",
    animate = true,
    className,
    style,
    ...rest
  },
  ref
) {
  const reduceMotion = useReducedMotion() ?? false;
  const popoutId = `${useId()}-popout`;
  const moving = animate && !reduceMotion;
  const shown = rings.slice(0, RADII.length);
  // The fills are matched from the inside out, so two rings still end on the popout one.
  const offset = RADII.length - shown.length;

  return (
    <article
      ref={ref}
      className={cn(
        "relative isolate flex w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/[0.08]",
        className
      )}
      style={{
        height: CARD_H,
        background: "linear-gradient(180deg, #1b1b1d 0%, #151516 100%)",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)",
        ...style,
      }}
      {...rest}
    >
      {/* prismatic top edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[1.5px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col px-6 pt-6 pb-5">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-neutral-100">
          {title}
          {date && <span className="text-neutral-100"> · {date}</span>}
        </h3>

        <ul className="mt-auto flex flex-col gap-3.5">
          {metrics.slice(0, 3).map((metric) => (
            <li key={metric.label} className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center">
                <MetricIcon icon={metric.icon} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[17px] font-medium leading-tight tracking-tight text-neutral-100 tabular-nums">
                    {metric.value}
                  </span>
                  {metric.change && (
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{ color: metric.change.direction === "up" ? SUCCESS : DANGER }}
                    >
                      {metric.change.value}
                      <span aria-hidden="true">{metric.change.direction === "up" ? "↑" : "↓"}</span>
                      <span className="sr-only">{metric.change.direction === "up" ? " up" : " down"}</span>
                    </span>
                  )}
                </span>
                <span className="truncate text-[13px] text-neutral-500">{metric.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rings, clipped by the card's right and bottom edges */}
      <div className="relative shrink-0" style={{ width: ART_W }} aria-hidden="true">
        <svg
          width={ART_W}
          height={CARD_H}
          shapeRendering="geometricPrecision"
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            <linearGradient id={popoutId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#d9d9d9" />
            </linearGradient>
          </defs>

          {shown.map((ring, i) => {
            const slot = i + offset;
            const r = RADII[slot];
            const fraction = Math.min(Math.max(ring.value / (ring.max ?? 100), 0), 1);
            const sweep = Math.max(fraction * SWEEP, 0.01);
            const end = point(r, START + sweep);
            const delay = 0.08 * i;
            return (
              <g key={ring.label}>
                {/* well track */}
                <path d={arc(r, ENTRY, TRACK_END)} fill="none" stroke="#070707" strokeWidth={STROKE} strokeLinecap="butt" />
                <motion.path
                  d={arc(r, ENTRY, START + sweep)}
                  fill="none"
                  stroke={FILLS[slot] === "popout" ? `url(#${popoutId})` : FILLS[slot]}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  initial={moving ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay, ease: EASE_OUT }}
                />
                {/* value pearl at the ring's end */}
                <motion.g
                  initial={moving ? { opacity: 0, scale: 0.6 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.26, delay: delay + 0.55, ease: EASE_OUT }}
                  style={{ transformOrigin: `${end.x}px ${end.y}px`, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
                >
                  <circle cx={end.x} cy={end.y} r={10} fill={`url(#${popoutId})`} stroke="rgba(255,255,255,0.4)" strokeWidth={0.75} />
                  <text
                    x={end.x}
                    y={end.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-neutral-950 text-[9.5px] font-semibold tabular-nums"
                  >
                    {Math.round(ring.value)}
                  </text>
                </motion.g>
              </g>
            );
          })}
        </svg>

        {/* score disc: popout, the lightest object on the card */}
        <div
          className="absolute grid place-items-center rounded-full"
          style={{
            width: DISC,
            height: DISC,
            left: CX - DISC / 2,
            top: CY - DISC / 2,
            background: "linear-gradient(180deg, #f5f5f5 0%, #d9d9d9 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.6), 0 4px 10px -2px rgba(0,0,0,0.5)",
          }}
        >
          <span className="flex flex-col items-center text-neutral-950">
            <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{score}</span>
            <span className="mt-1 text-[13px] font-semibold leading-none">{scoreLabel}</span>
          </span>
        </div>
      </div>

      {/* what the rings say, for screen readers */}
      <span className="sr-only">
        {score} {scoreLabel}.{" "}
        {shown.map((ring) => (
          <meter key={ring.label} min={0} max={ring.max ?? 100} value={ring.value} aria-label={ring.label}>
            {ring.label}: {ring.value}
          </meter>
        ))}
      </span>
    </article>
  );
});
