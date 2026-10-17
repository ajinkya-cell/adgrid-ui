"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, type Transition } from "framer-motion";
import { cn } from "../lib/utils";

// A pile of polaroids fanned out on a table, the middle print on top and the rest tucked behind
// it towards the edges. Hover a print and it steps sideways out of the pile — left-hand prints to
// the left, right-hand ones to the right, the middle one up. Click it and it springs out onto the
// table above the pile; click it again (or pull out one too many) and it bounces back home.
//
// Prints on the table are first in, first out: with `maxOut` already out, pulling another sends
// the oldest back and the new one lands in the gap it leaves.
//
// The "drag" variant swaps clicking for picking up: grab a print, carry it anywhere in the
// component and let go, and it stays where you dropped it, settling at a fresh tilt. Drop it back
// on the pile (or double-click it) to put it home. Keyboard users still pull prints out with
// Enter/Space, which lands them in the click variant's spots.
//
// Every resting position is worked out from the index, not Math.random, so server and client agree.

export interface PolaroidStackPhoto {
  src: string;
  alt?: string;
  /** Handwritten on the bottom of the print */
  caption?: string;
}

export type PolaroidStackVariant = "click" | "drag";

export interface PolaroidStackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** "click" flings prints to fixed spots; "drag" lets you carry them anywhere (default: "click") */
  variant?: PolaroidStackVariant;
  /** The prints; cycled if there are fewer than `count` */
  photos?: PolaroidStackPhoto[];
  /** Number of prints in the pile, 3–16 (default: 12) */
  count?: number;
  /** How many prints can be out on the table at once (default: 5) */
  maxOut?: number;
  /** Print width in px; shrinks to fit narrow containers (default: 220) */
  cardWidth?: number;
  /** How far the fan opens, 0 (tight pile) to 1 (barely overlapping) (default: 0.55) */
  spread?: number;
  /** Largest resting tilt of a print, in degrees (default: 10) */
  maxTilt?: number;
  /** How far a hovered print steps out of the pile, in px (default: 28) */
  hoverShift?: number;
  /** How springy the flight out and back is, 0 (none) to 1 (very) (default: 0.55) */
  bounce?: number;
  /** Pen colour for the captions (default: #2b2b2b) */
  inkColor?: string;
  /** Called with the indices of the prints on the table, oldest first */
  onChange?: (out: number[]) => void;
}

const photo = (id: string, alt: string, caption: string): PolaroidStackPhoto => ({
  src: `https://images.unsplash.com/photo-${id}?w=480&h=480&fit=crop&auto=format&q=80`,
  alt,
  caption,
});

const DEFAULT_PHOTOS: PolaroidStackPhoto[] = [
  photo("1561361513-2d000a50f0dc", "A mint camper van parked by the sea", "the van, day one"),
  photo("1529253355930-ddbe423a2ac7", "The Gateway of India reflected in a puddle", "bombay, after rain"),
  photo("1441974231531-c6227db76b6e", "A path through a sunlit forest", "the long way round"),
  photo("1464822759023-fed622ff2c3b", "Snowy peaks above a blue lake", "we found the lake"),
  photo("1470071459604-3b5ec3a7fe05", "Fog rolling over green cliffs", "fog at noon"),
  photo("1506905925346-21bda4d32df4", "Mountains rising out of a sea of clouds", "5am. worth it."),
  photo("1534447677768-be436bb09401", "A small boat on still water under the stars", "last night out"),
  photo("1599661046289-e31897846e41", "A golden fort on a hillside", "jaipur, all gold"),
  photo("1500530855697-b586d89ba3ee", "A road winding through hills", "no signal here"),
  photo("1469474968028-56623f02e42e", "Sunlight over a misty valley", "golden hour"),
  photo("1501785888041-af3ef285b470", "A still lake below mountains at dusk", "quiet lake"),
  photo("1493246507139-91e8fad9978e", "A turquoise lake ringed by peaks", "too blue to be real"),
  photo("1472214103451-9374bd1c798e", "Rolling green hills in soft light", "somewhere green"),
  photo("1426604966848-d7adac402bff", "Granite cliffs above a river valley", "yosemite!!"),
  photo("1447752875215-b2761acb3c5d", "Light through tall trees in a forest", "the woods"),
  photo("1433086966358-54859d0ed716", "A waterfall pouring over mossy rocks", "cold. so cold."),
];

const FONT_ID = "google-font-reenie-beanie";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap";

// Polaroid proportions, as fractions of the print width: a square photo with a thin border and
// a thick lip at the bottom for the caption.
const BORDER = 0.06;
const LIP = 0.26;
const HEIGHT = BORDER + (1 - 2 * BORDER) + LIP;

const OUT_SCALE = 1.06;
const GUTTER = 16;

const SHADOW = "0 1px 2px rgba(0,0,0,0.25), 0 14px 30px -12px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.05)";
const SHADOW_LIFTED = "0 2px 4px rgba(0,0,0,0.2), 0 36px 60px -18px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.05)";

// Deterministic 0–1 noise per index, rounded so server and client produce identical styles.
function noise(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Pose = { x: number; y: number; rotate: number; scale: number };
// A print on the table: in one of the fixed spots, or wherever it was dropped (`at`).
type Pulled = { i: number; slot: number; at?: { x: number; y: number; rotate: number } };

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PolaroidStack({
  variant = "click",
  photos = DEFAULT_PHOTOS,
  count = 12,
  maxOut = 5,
  cardWidth = 220,
  spread = 0.55,
  maxTilt = 10,
  hoverShift = 28,
  bounce = 0.55,
  inkColor = "#2b2b2b",
  onChange,
  className,
  style,
  ...rest
}: PolaroidStackProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [out, setOut] = useState<Pulled[]>([]);
  const [landing, setLanding] = useState<Set<number>>(() => new Set());
  const [hovered, setHovered] = useState<number | null>(null);

  const draggable = variant === "drag";
  const n = clamp(Math.round(count), 3, 16);
  const limit = clamp(Math.round(maxOut), 1, n);
  const cards = photos.length ? Array.from({ length: n }, (_, i) => photos[i % photos.length]) : [];

  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(FONT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fewer prints or a lower limit: drop what no longer fits, oldest first, and close up the slots.
  useEffect(() => {
    setOut((prev) => {
      const kept = prev.filter((p) => p.i < n).slice(-limit);
      if (kept.length === prev.length && kept.every((p) => p.slot < limit)) return prev;
      return kept.map((p, k) => ({ ...p, slot: k }));
    });
  }, [n, limit]);

  // Geometry, all in px from the container's top centre.
  const W = Math.round(Math.min(cardWidth, Math.max(96, (width - 2 * GUTTER) / 2.6)));
  const H = Math.round(W * HEIGHT);
  // The table overlaps the top of the pile a little; prints on it always lie above the pile anyway.
  // Dragging gets a taller table, so there's somewhere to put things down.
  const tableH = Math.round(draggable ? H * 1.4 + 40 : H * 0.82 + 40);
  const stackTop = tableH + 12;
  const rootH = stackTop + H + 56;

  const step = Math.min(W * (0.12 + 0.6 * clamp(spread, 0, 1)), (width - 2 * GUTTER - W) / (n - 1));
  // Roughly a fan, but tossed: every print is knocked off its spot, turned a little further, and
  // the stacking order only loosely follows "middle on top", so the pile looks dropped, not dealt.
  const depth = cards.map((_, i) => Math.abs(i / (n - 1) - 0.5) + (noise(i, 5) - 0.5) * 0.22);
  const rank = cards.map((_, i) => i).sort((a, b) => depth[b] - depth[a]);
  const fan = cards.map((_, i) => {
    const t = i / (n - 1) - 0.5; // -0.5 (left edge) … 0.5 (right edge)
    return {
      t,
      x: t * (n - 1) * step + (noise(i, 1) - 0.5) * W * 0.18,
      y: stackTop + Math.abs(t) * 40 + (noise(i, 6) - 0.5) * W * 0.14,
      rotate: t * 2 * maxTilt * 0.6 + (noise(i, 2) - 0.5) * maxTilt * 1.4,
      scale: 1 - Math.abs(t) * 0.1,
      z: rank.indexOf(i) + 1,
    };
  });
  // Drops whose centre lands within this of the pile's middle (and low enough) count as "put back".
  const pileHalf = ((n - 1) * step) / 2 + W * 0.3;

  const slotGap = limit > 1 ? Math.min(W * 1.2, (width - 2 * GUTTER - W * OUT_SCALE) / (limit - 1)) : 0;
  const slots = Array.from({ length: limit }, (_, s) => {
    const u = limit > 1 ? (s / (limit - 1)) * 2 - 1 : 0; // -1 … 1 across the table
    return {
      x: (s - (limit - 1) / 2) * slotGap,
      y: 16 + u * u * 28 + (noise(s, 3) - 0.5) * 12,
      rotate: (noise(s, 4) - 0.5) * 20,
    };
  });

  const b = clamp(bounce, 0, 1);
  const fly: Transition = reduce
    ? { duration: 0.2, ease: "easeOut" }
    : { type: "spring", stiffness: 220, damping: 10 + (1 - b) * 16, mass: 0.9 };
  const nudge: Transition = reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 26 };

  function commit(next: Pulled[], back: number[]) {
    setOut(next);
    if (back.length) setLanding((prev) => new Set([...prev, ...back]));
    onChange?.(next.map((p) => p.i));
  }

  /** Make room for `i` on the table: everyone else, minus the oldest while it's full. */
  function makeRoom(i: number) {
    const back: number[] = [];
    let kept = out.filter((p) => p.i !== i);
    while (kept.length >= limit) {
      back.push(kept[0].i);
      kept = kept.slice(1);
    }
    const own = out.find((p) => p.i === i)?.slot;
    const used = new Set(kept.map((p) => p.slot));
    let slot = own !== undefined && !used.has(own) ? own : 0;
    while (used.has(slot)) slot++;
    return { kept, back, slot };
  }

  function toggle(i: number) {
    if (out.some((p) => p.i === i)) return commit(out.filter((p) => p.i !== i), [i]);
    const { kept, back, slot } = makeRoom(i);
    commit([...kept, { i, slot }], back);
  }

  function drop(i: number, x: number, y: number) {
    // Let go over the pile: it goes home.
    if (Math.abs(x) < pileHalf && y > stackTop - H * 0.45) {
      return commit(out.filter((p) => p.i !== i), [i]);
    }
    // Anywhere else it stays put, on top of everything, and settles at a fresh tilt.
    const { kept, back, slot } = makeRoom(i);
    const rotate = Math.round((Math.random() - 0.5) * Math.max(maxTilt, 4) * 16) / 10;
    commit([...kept, { i, slot, at: { x, y, rotate } }], back);
  }

  function landed(i: number) {
    setLanding((prev) => {
      if (!prev.has(i)) return prev;
      const next = new Set(prev);
      next.delete(i);
      return next;
    });
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full select-none", className)}
      style={{ height: rootH, ...style }}
      {...rest}
    >
      {cards.map((card, i) => {
        const order = out.findIndex((p) => p.i === i);
        const isOut = order >= 0;
        const isHovered = hovered === i;
        const home = fan[i];

        let target: Pose;
        if (isOut) {
          const pulled = out[order];
          const s = pulled.at ?? slots[pulled.slot] ?? slots[0];
          target = { x: s.x, y: s.y, rotate: s.rotate, scale: isHovered ? OUT_SCALE + 0.04 : OUT_SCALE };
        } else if (isHovered) {
          const dir = Math.abs(home.t) < 1e-6 ? 0 : Math.sign(home.t);
          target = {
            x: home.x + dir * hoverShift,
            y: home.y - 10 - (dir === 0 ? 14 : 0),
            rotate: home.rotate * 0.5,
            scale: home.scale + 0.02,
          };
        } else {
          target = { x: home.x, y: home.y, rotate: home.rotate, scale: home.scale };
        }

        // On the table, later prints lie on earlier ones; flying home, stay above the pile until landed.
        const z = isOut ? 100 + order : landing.has(i) ? 60 : home.z;

        return (
          <Print
            key={i}
            card={card}
            label={card.caption || card.alt || `Photo ${i + 1}`}
            W={W}
            H={H}
            target={target}
            z={z}
            transition={isOut || landing.has(i) ? fly : nudge}
            liftTransition={nudge}
            inkColor={inkColor}
            isOut={isOut}
            draggable={draggable}
            constraints={rootRef}
            onActivate={() => toggle(i)}
            onHover={(on) => setHovered((h) => (on ? i : h === i ? null : h))}
            onDrop={(x, y) => drop(i, x, y)}
            onSettled={() => !isOut && landed(i)}
          />
        );
      })}
    </div>
  );
}

interface PrintProps {
  card: PolaroidStackPhoto;
  label: string;
  W: number;
  H: number;
  target: Pose;
  z: number;
  transition: Transition;
  liftTransition: Transition;
  inkColor: string;
  isOut: boolean;
  draggable: boolean;
  constraints: React.RefObject<HTMLDivElement | null>;
  onActivate: () => void;
  onHover: (on: boolean) => void;
  onDrop: (x: number, y: number) => void;
  onSettled: () => void;
}

function Print({
  card,
  label,
  W,
  H,
  target,
  z,
  transition,
  liftTransition,
  inkColor,
  isOut,
  draggable,
  constraints,
  onActivate,
  onHover,
  onDrop,
  onSettled,
}: PrintProps) {
  // Own motion values, so a drop can read exactly where the print is and pin it there.
  const x = useMotionValue(target.x);
  const y = useMotionValue(target.y);
  const [dragging, setDragging] = useState(false);

  // While held, only lift and straighten; x/y belong to the pointer.
  const animate = dragging ? { scale: target.scale + 0.08, rotate: target.rotate * 0.3 } : target;

  return (
    <motion.button
      type="button"
      aria-pressed={isOut}
      aria-label={isOut ? `${label} — put back` : `${label} — pull out`}
      // Dragging replaces mouse clicks; Enter/Space (a click with detail 0) still work.
      onClick={(e) => (!draggable || e.detail === 0) && onActivate()}
      onDoubleClick={() => draggable && isOut && onActivate()}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      drag={draggable}
      dragConstraints={constraints}
      dragElastic={0.12}
      dragMomentum={false}
      onDragStart={() => {
        setDragging(true);
        onHover(false);
      }}
      onDragEnd={() => {
        setDragging(false);
        onDrop(x.get(), y.get());
      }}
      initial={false}
      animate={animate}
      transition={dragging ? liftTransition : transition}
      onAnimationComplete={onSettled}
      className="absolute left-1/2 top-0 block rounded-[3px] p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        x,
        y,
        width: W,
        height: H,
        marginLeft: -W / 2,
        zIndex: dragging ? 300 : z,
        cursor: draggable ? (dragging ? "grabbing" : "grab") : "pointer",
        touchAction: draggable ? "none" : undefined,
        background: "linear-gradient(170deg, #fbfaf6 0%, #f3f0e8 60%, #ebe7dd 100%)",
        boxShadow: dragging ? SHADOW_LIFTED : SHADOW,
        transition: "box-shadow 200ms",
      }}
    >
      <span
        className="absolute block overflow-hidden bg-neutral-800"
        style={{ left: W * BORDER, top: W * BORDER, width: W * (1 - 2 * BORDER), height: W * (1 - 2 * BORDER) }}
      >
        <img src={card.src} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" />
        <span
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18), inset 0 2px 6px rgba(0,0,0,0.25)" }}
        />
      </span>
      {card.caption && (
        <span
          className="absolute inset-x-0 bottom-0 flex items-center justify-center truncate px-2 leading-none"
          style={{
            height: W * (LIP + BORDER * 0.5),
            fontFamily: "'Reenie Beanie', cursive",
            fontSize: Math.round(W * 0.15),
            color: inkColor,
          }}
        >
          {card.caption}
        </span>
      )}
    </motion.button>
  );
}
