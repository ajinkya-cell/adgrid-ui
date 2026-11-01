"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  animate,
  useAnimationFrame,
  motion,
  motionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "../lib/utils";

// A hardcover notebook. Click the cover and it swings open on its spine, the next few leaves riffle
// past in a quick stagger, and the book settles on a spread. Drag a page's outer edge to turn it by
// hand, flick it to throw it, or use the buttons and arrow keys.
//
// Turns move like a hand turning paper, not like a spring-loaded board. Pressing a page grips it:
// the corner under the pointer lifts. While held, the page trails the hand a touch, as paper has
// weight. A turning page bows (a band of light runs across it) and leans toward the corner it is
// held by. Turns lift slowly, sweep, and land on a cushion of air with a small rebound. A released
// drag keeps the speed it was thrown with.
//
// Built to be the dependable kind of book component. The usual ones break in the same few places,
// and each is designed out here:
//
// - Every page is rendered exactly once, as one face of one leaf. Nothing is cloned or drawn twice,
//   so the state inside a page (inputs, video, counters) survives every turn.
// - Each leaf is its own 3D context (`perspective()` in its own transform). There is no shared
//   `preserve-3d` and no `backface-visibility`, which are what flicker and z-fight in Safari and
//   flatten when an ancestor has overflow, filter or opacity. Which face shows is decided from the
//   leaf's angle, and so is its z-index, which also keeps several riffling leaves in the right order.
// - Pure React and framer-motion: no imperative page engine, no canvas, SSR-safe, scales to fit its
//   container.
// - A real reading experience for everyone: buttons, arrow keys, a live region announcing the pages,
//   off-spread pages made inert, and a reduced-motion path that swaps spreads without movement.
//
// Built for a 240px page and scaled by `size`; lengths below are in those base units.

export interface BookHandle {
  /** Go to a spread (0 is the closed cover). Jumps of more than one spread riffle. */
  goTo: (spread: number) => void;
  next: () => void;
  prev: () => void;
}

export interface BookProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "title"> {
  /** The pages. Each child is one page, read left to right. */
  children?: React.ReactNode;
  /** Title on the default cover (default: "Notebook") */
  title?: React.ReactNode;
  /** Line under the title on the default cover */
  subtitle?: React.ReactNode;
  /** Replace the whole front cover */
  cover?: React.ReactNode;
  /** Current spread (controlled). 0 is closed; 1 shows the inside cover and page 1. */
  spread?: number;
  /** Initial spread (uncontrolled) (default: 0) */
  defaultSpread?: number;
  /** Called when the reader asks for another spread */
  onSpreadChange?: (spread: number) => void;
  /** Spread the book riffles to when the cover is opened (default: 3) */
  landOn?: number;
  /** Page width in px; height follows at about 1.36× (default: 240) */
  size?: number;
  /** Page stock (default: "dark") */
  paper?: "dark" | "light";
  /** Delay between leaves in a riffle, in ms (default: 85) */
  riffle?: number;
  /** How much a page lifts again on its cushion of air as it lands, 0 to 1 (default: 0.4) */
  bounce?: number;
  /** How long a single page turn takes, in ms (default: 900) */
  turnDuration?: number;
  /** Rule the paper like a notebook. Line spacing is exposed to pages as `var(--book-rule)`. (default: false) */
  ruled?: boolean;
  /** Show the previous / next buttons and page counter (default: false) */
  controls?: boolean;
  /** Print page numbers in the outer bottom corners (default: true) */
  pageNumbers?: boolean;
  /** Let the book hover: a slow rise and settle over its shadow while it rests. Idle motion, so it is
   *  opt-in; it eases out while a page is held and never runs under reduced motion. (default: false) */
  float?: boolean;
  /** Let the reader drag the outer edge of a page to turn it (default: true) */
  draggable?: boolean;
  /** Accessible name (default: "Book") */
  label?: string;
}

const BASE_W = 240;
const RATIO = 1.36;
const RAD = Math.PI / 180;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const EASE_OUT = [0.32, 0.72, 0, 1] as const;
// A hand turning a page: a slow pick-up, a quick sweep, a long soft landing.
const HAND = [0.6, 0.02, 0.22, 1] as const;
// How far (in degrees of skew) a page leans toward the corner it is held by, at mid-turn.
const LEAN = 4;

// Paper stock. Dark is the tray tier (a content area inside the raised cover); light is the paper of
// FolderReveal's sheets.
const PAPER = {
  dark: {
    background: "#0c0c0d",
    border: "rgba(255,255,255,0.06)",
    inset: "inset 0 1px 0 rgba(255,255,255,0.03)",
    gutter: "rgba(0,0,0,0.6)",
    text: "text-neutral-400",
    meta: "text-neutral-600",
    lines: "rgba(255,255,255,0.07)",
  },
  light: {
    background: "linear-gradient(180deg, #f2f2f3 0%, #e2e2e4 100%)", // void-lint-ignore: paper, as FolderReveal's sheets
    border: "rgba(0,0,0,0.08)",
    inset: "inset 0 1px 0 rgba(255,255,255,0.9)",
    gutter: "rgba(0,0,0,0.2)",
    text: "text-neutral-700",
    meta: "text-neutral-400",
    lines: "rgba(0,0,0,0.12)",
  },
} as const;

interface Geometry {
  W: number;
  H: number;
  s: number;
  inset: number;
  radius: number;
  spineRadius: number;
}

// Spine side in shadow, a lit crest about two-thirds out, the outer edge curling away into shade.
const BOW_GRADIENT =
  "linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 38%, rgba(255,255,255,0.10) 64%, rgba(255,255,255,0.02) 76%, rgba(0,0,0,0.28) 100%)";

// ─── one leaf ────────────────────────────────────────────────────────────────────────────────────

interface LeafProps {
  index: number;
  count: number;
  angle: MotionValue<number>;
  lean: MotionValue<number>;
  geo: Geometry;
  isCover: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  frontShowing: boolean;
  backShowing: boolean;
}

function Leaf({ index, count, angle, lean, geo, isCover, front, back, frontShowing, backShowing }: LeafProps) {
  const { W, H, inset } = geo;
  // Right-hand stack: lower leaves on top. Left-hand stack: higher leaves on top. A leaf mid-turn is
  // always the top of whichever half it is over, so this one rule orders a whole riffle correctly.
  const zIndex = useTransform(angle, (a) => (a > -90 ? 2 + count - index : 2 + count + index));
  // The lean is a skew about the spine: the held corner rises as the page lifts and sinks back as it
  // lands. It is zero at rest, so pages always lie flat. The cover is board, so it barely leans.
  const transform = useTransform([angle, lean], ([a, l]: number[]) => {
    const lift = Math.sin(-a * RAD);
    const skew = -l * LEAN * lift * (isCover ? 0.25 : 1);
    return `perspective(${W * 5}px) rotateY(${a}deg) skewY(${skew}deg)`;
  });
  const frontVisibility = useTransform(angle, (a) => (a > -90 ? "visible" : "hidden"));
  const backVisibility = useTransform(angle, (a) => (a > -90 ? "hidden" : "visible"));
  // Light from above: a turning face darkens as it tips away, most at edge-on.
  const frontShade = useTransform(angle, [0, -90], [0, 0.4]);
  const backShade = useTransform(angle, [-90, -180], [0.4, 0]);
  // The bow: paper held off the spine curves, so a lit band crosses it with shadow either side.
  // Strongest mid-turn, none at rest. Board doesn't bend.
  const bow = useTransform(angle, (a) => (isCover ? 0 : Math.sin(-a * RAD)));

  return (
    <motion.div
      aria-hidden={!frontShowing && !backShowing ? true : undefined}
      className="absolute"
      style={{
        left: W,
        top: isCover ? 0 : inset,
        width: isCover ? W : W - inset,
        height: isCover ? H : H - inset * 2,
        transformOrigin: "0% 50%",
        transform,
        zIndex,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ visibility: frontVisibility }}
        aria-hidden={!frontShowing}
        inert={!frontShowing}
      >
        {front}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: frontShade, borderRadius: isCover ? `${geo.spineRadius}px ${geo.radius}px ${geo.radius}px ${geo.spineRadius}px` : undefined }}
        />
        {!isCover && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: bow, background: BOW_GRADIENT }} />}
      </motion.div>
      {/* Mirrored so that, once the leaf has turned 180°, it reads the right way round. */}
      <motion.div
        className="absolute inset-0"
        style={{ visibility: backVisibility, scaleX: -1 }}
        aria-hidden={!backShowing}
        inert={!backShowing}
      >
        {back}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: backShade, borderRadius: isCover ? `${geo.radius}px ${geo.spineRadius}px ${geo.spineRadius}px ${geo.radius}px` : undefined }}
        />
        {/* the back face's own left is the outer edge, so the bow runs the other way */}
        {!isCover && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: bow, background: BOW_GRADIENT, scaleX: -1 }} />}
      </motion.div>
    </motion.div>
  );
}

// ─── faces ───────────────────────────────────────────────────────────────────────────────────────

function PageFace({
  side,
  paper,
  geo,
  number,
  showNumber,
  ruled,
  children,
}: {
  ruled: boolean;
  side: "right" | "left";
  paper: "dark" | "light";
  geo: Geometry;
  number?: number;
  showNumber: boolean;
  children?: React.ReactNode;
}) {
  const p = PAPER[paper];
  const { s } = geo;
  const r = 6 * s;
  const right = side === "right";
  const rule = Math.round(26 * s);
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden text-[13px] leading-relaxed", p.text)}
      data-side={side}
      data-ruled={ruled ? "" : undefined}
      style={{
        ["--book-rule" as string]: `${rule}px`,
        background: p.background,
        borderStyle: "solid",
        borderColor: p.border,
        borderWidth: right ? "1px 1px 1px 0" : "1px 0 1px 1px", // no edge at the spine
        borderRadius: right ? `0 ${r}px ${r}px 0` : `${r}px 0 0 ${r}px`,
        boxShadow: p.inset,
      }}
    >
      <div
        className="absolute inset-0 overflow-auto"
        style={{
          padding: `${22 * s}px ${right ? 20 * s : 24 * s}px ${30 * s}px ${right ? 24 * s : 20 * s}px`,
          scrollbarWidth: "none",
          // Rules sit under each line box of height --book-rule, inside the margins, and scroll with the text.
          ...(ruled && {
            backgroundImage: `repeating-linear-gradient(180deg, transparent 0px, transparent ${rule - 1}px, ${p.lines} ${rule - 1}px, ${p.lines} ${rule}px)`,
            backgroundClip: "content-box",
            backgroundOrigin: "content-box",
            backgroundAttachment: "local",
          }),
        }}
      >
        {children}
      </div>
      {showNumber && number !== undefined && (
        <span
          aria-hidden="true"
          className={cn("pointer-events-none absolute tabular-nums", p.meta)}
          style={{ bottom: 10 * s, [right ? "right" : "left"]: 14 * s, fontSize: 10 * s }}
        >
          {number}
        </span>
      )}
      {/* the gutter: paper curving down into the spine */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0"
        style={{
          [right ? "left" : "right"]: 0,
          width: "16%",
          background: `linear-gradient(${right ? 90 : 270}deg, ${p.gutter} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

// A cut line: a hairline of shadow over a hairline of light, so it reads as pressed into the board.
const CUT = { borderTop: "1px solid rgba(0,0,0,0.5)", boxShadow: "0 1px 0 rgba(255,255,255,0.05)" } as const;
// Blind deboss: lettering pressed into the board with no ink. Light from above catches the lower lip
// of each stroke, so the highlight sits under the letter.
const DEBOSS = { color: "rgba(0,0,0,0.5)", textShadow: "0 1px 0 rgba(255,255,255,0.075), 0 -1px 0 rgba(0,0,0,0.35)" } as const;
// Fine fractal noise, for a matte board. White at low alpha, so it only ever lightens.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** The cover: an unmarked board with the title large and blind-debossed in the middle. */
function CoverArt({ geo, title, subtitle }: { geo: Geometry; title: React.ReactNode; subtitle?: React.ReactNode }) {
  const { s } = geo;
  return (
    <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center text-center" style={{ left: 14 * s, padding: `0 ${20 * s}px` }}>
      <span className="font-semibold tracking-tight" style={{ ...DEBOSS, fontSize: 26 * s, lineHeight: 1.1 }}>
        {title}
      </span>
      {subtitle && (
        <>
          <span aria-hidden="true" style={{ ...CUT, width: 36 * s, margin: `${12 * s}px 0 ${9 * s}px` }} />
          <span className="tabular-nums" style={{ ...DEBOSS, fontSize: 11 * s }}>
            {subtitle}
          </span>
        </>
      )}
    </div>
  );
}

function CoverFront({ geo, children }: { geo: Geometry; children: React.ReactNode }) {
  const { s, radius, spineRadius } = geo;
  return (
    <div
      className="absolute inset-0 overflow-hidden border border-white/[0.08]"
      style={{
        borderRadius: `${spineRadius}px ${radius}px ${radius}px ${spineRadius}px`,
        background: "linear-gradient(180deg, #1f1f21 0%, #18181a 100%)",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.6), 0 20px 40px -12px rgba(0,0,0,0.7), 0 2px 8px -2px rgba(0,0,0,0.5)",
      }}
    >
      {/* a matte tooth to the board */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.035 }} />
      {/* prismatic top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0"
        style={{
          left: "10%",
          right: "10%",
          height: 1.5,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
        }}
      />
      {/* hinge groove pressed into the board beside the spine */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0"
        style={{ left: 12 * s, width: 2, background: "linear-gradient(90deg, rgba(0,0,0,0.55) 50%, rgba(255,255,255,0.06) 50%)" }}
      />
      {children}
    </div>
  );
}

function CoverInside({ geo, side }: { geo: Geometry; side: "left" | "right" }) {
  const { s, radius, spineRadius } = geo;
  const left = side === "left";
  return (
    <div
      className="absolute inset-0 border border-white/[0.06]"
      style={{
        borderRadius: left
          ? `${radius}px ${spineRadius}px ${spineRadius}px ${radius}px`
          : `${spineRadius}px ${radius}px ${radius}px ${spineRadius}px`,
        background: "#070707",
        boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0"
        style={{
          [left ? "right" : "left"]: 14 * s,
          width: 2,
          background: `linear-gradient(90deg, ${left ? "rgba(255,255,255,0.04) 50%, rgba(0,0,0,0.6) 50%" : "rgba(0,0,0,0.6) 50%, rgba(255,255,255,0.04) 50%"})`,
        }}
      />
    </div>
  );
}

// The block of page edges beside each stack, thicker the more leaves it holds.
function PageBlock({ geo, side, leaves, paper }: { geo: Geometry; side: "left" | "right"; leaves: number; paper: "dark" | "light" }) {
  const { W, H, inset, s } = geo;
  const t = Math.min(leaves * 0.9, 5) * s;
  const lines = PAPER[paper].lines;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        top: inset + 1,
        height: H - inset * 2 - 2,
        width: t,
        left: side === "right" ? W * 2 - inset : inset - t,
        background: `repeating-linear-gradient(90deg, ${lines} 0px, ${lines} 1px, transparent 1px, transparent 2px)`,
        borderRadius: side === "right" ? `0 ${3 * s}px ${3 * s}px 0` : `${3 * s}px 0 0 ${3 * s}px`,
        transition: "width 260ms cubic-bezier(0.32, 0.72, 0, 1), left 260ms cubic-bezier(0.32, 0.72, 0, 1)",
        zIndex: 1,
      }}
    />
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

const socketButton =
  "inline-flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#070707] text-neutral-400 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)] transition-colors duration-150 hover:border-white/[0.13] hover:text-neutral-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.08] disabled:hover:text-neutral-400";

// ─── the book ────────────────────────────────────────────────────────────────────────────────────

interface DragState {
  pointerId: number;
  leaf: number;
  kind: "cover" | "right" | "left";
  startClientX: number;
  offset: number;
  lastPx: number;
  lastT: number;
  vx: number;
  moved: boolean;
  /** The angle the page lies at before it is picked up. */
  rest: number;
}

export const Book = forwardRef<BookHandle, BookProps>(function Book(
  {
    children,
    title = "Notebook",
    subtitle,
    cover,
    spread: spreadProp,
    defaultSpread = 0,
    onSpreadChange,
    landOn = 3,
    size = BASE_W,
    paper = "dark",
    riffle = 85,
    bounce = 0.4,
    turnDuration = 900,
    ruled = false,
    controls = false,
    pageNumbers = true,
    draggable = true,
    float = false,
    label = "Book",
    className,
    style,
    onKeyDown,
    ...rest
  },
  ref
) {
  const reduceMotion = useReducedMotion() ?? false;
  const pages = React.Children.toArray(children);
  const n = pages.length;
  const leafCount = 1 + Math.ceil(n / 2); // the cover, then two pages per leaf
  const maxSpread = 1 + Math.floor(n / 2); // stop before a leaf whose back is blank

  const [innerSpread, setInnerSpread] = useState(() => clamp(Math.round(defaultSpread), 0, maxSpread));
  const spread = clamp(Math.round(spreadProp ?? innerSpread), 0, maxSpread);
  const spreadRef = useRef(spread);
  spreadRef.current = spread;

  const W = size;
  const s = W / BASE_W;
  const H = Math.round(W * RATIO);
  const geo: Geometry = { W, H, s, inset: 7 * s, radius: 14 * s, spineRadius: 3 * s };

  // One angle per leaf: 0 lies on the right, -180 on the left. Created outside hooks so the leaf
  // count can change; existing leaves keep their angle.
  const angles = useRef<MotionValue<number>[]>([]);
  while (angles.current.length < leafCount) {
    const i = angles.current.length;
    angles.current.push(motionValue(i < spread ? -180 : 0));
  }
  if (angles.current.length > leafCount) angles.current.length = leafCount;
  // Which corner each leaf is held by: -1 the top, 1 the bottom. Only shows mid-turn.
  const leans = useRef<MotionValue<number>[]>([]);
  while (leans.current.length < leafCount) leans.current.push(motionValue(0.6));
  if (leans.current.length > leafCount) leans.current.length = leafCount;

  const closed = useMotionValue(spread === 0 ? 1 : 0);
  const shiftX = useTransform(closed, (c) => `${-c * 25}%`);
  const shadowLeft = useTransform(closed, (c) => `${4 + c * 48}%`);
  const fade = useMotionValue(1);

  const rebound = clamp(bounce, 0, 1) * 5; // degrees the page lifts again on landing
  const heavy = { type: "spring", stiffness: 170, damping: 26 } as const;
  // A held page follows the hand with a little weight behind it.
  const follow = { type: "spring", stiffness: 240, damping: 30, mass: 0.9 } as const;
  // A released page: velocity carries over from the drag, then it floats down.
  const released = { type: "spring", stiffness: 70, damping: 13, mass: 1 } as const;
  const grip = { type: "spring", stiffness: 300, damping: 26 } as const;

  /** Turn a leaf like a hand would: pick up, sweep, land, lift on the air a touch, settle. */
  const turn = (mv: MotionValue<number>, target: number, duration: number, delay = 0) => {
    const from = mv.get();
    const dist = Math.abs(target - from) / 180;
    const d = Math.max(duration * (0.45 + 0.55 * dist), 0.2);
    if (rebound < 0.1) return animate(mv, target, { duration: d, delay, ease: HAND });
    const lift = target === 0 ? -rebound : target + rebound;
    return animate(mv, [from, target, lift, target], {
      duration: d * 1.25,
      delay,
      times: [0, 0.8, 0.9, 1],
      ease: [HAND, [0.2, 0.6, 0.4, 1], [0.5, 0, 0.6, 1]],
    });
  };
  // A drag that ends in a turn hands its speed to the landing instead of the timed turn.
  const fromDrag = useRef(false);

  // ── fit the container ──
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(clamp(entry.contentRect.width / (W * 2), 0.2, 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);

  // ── requests ──
  const request = useCallback(
    (next: number) => {
      const target = clamp(Math.round(next), 0, maxSpread);
      if (target === spreadRef.current) return;
      if (spreadProp === undefined) setInnerSpread(target);
      onSpreadChange?.(target);
    },
    [maxSpread, spreadProp, onSpreadChange]
  );
  const openTarget = clamp(landOn, 1, maxSpread);
  const goNext = useCallback(() => request(spreadRef.current === 0 ? openTarget : spreadRef.current + 1), [request, openTarget]);
  const goPrev = useCallback(() => request(spreadRef.current - 1), [request]);
  useImperativeHandle(ref, () => ({ goTo: request, next: goNext, prev: goPrev }), [request, goNext, goPrev]);

  // ── turn the leaves whenever the spread changes ──
  const prevSpread = useRef(spread);
  useEffect(() => {
    const prev = prevSpread.current;
    prevSpread.current = spread;
    const forward = spread > prev;
    const count = Math.abs(spread - prev);

    if (reduceMotion) {
      angles.current.forEach((mv, i) => mv.set(i < spread ? -180 : 0));
      closed.set(spread === 0 ? 1 : 0);
      if (count > 0) {
        fade.set(0.35);
        animate(fade, 1, { duration: 0.2, ease: EASE_OUT });
      }
      return;
    }

    const thrown = fromDrag.current;
    fromDrag.current = false;
    const single = turnDuration / 1000;
    angles.current.forEach((mv, i) => {
      const target = i < spread ? -180 : 0;
      const inRange = forward ? i >= prev && i < spread : i >= spread && i < prev;
      if (inRange) {
        const order = forward ? i - prev : prev - 1 - i;
        const last = order === count - 1;
        if (thrown && count === 1) {
          animate(mv, target, released);
          return;
        }
        // Riffled leaves slip off the thumb: quicker turns, each a beat after the one above, all
        // the same length so none can overtake. The last is turned properly and lands slower.
        if (!last) leans.current[i]?.set(0.3 + (i % 3) * 0.2);
        else leans.current[i]?.set(0.6);
        turn(mv, target, last ? single : single * 0.55, (order * riffle) / 1000);
      } else if (mv.get() !== target && !mv.isAnimating()) {
        turn(mv, target, single);
      }
    });

    // Slide the book so whatever is showing sits centred: the cover alone, or the open spread.
    const closing = spread === 0;
    animate(closed, closing ? 1 : 0, { ...heavy, delay: closing ? ((count - 1) * riffle) / 1000 + 0.12 : 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, leafCount, reduceMotion]);

  // ── drag, click and hover on the page edges ──
  const bookRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  const localX = (clientX: number) => {
    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return (clientX - rect.left) / scale - W; // relative to the spine
  };
  /** -1 at the top of the page, 1 at the bottom. */
  const localLean = (clientY: number) => {
    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return 0.6;
    return clamp(((clientY - rect.top) / scale / H - 0.5) * 2, -1, 1);
  };
  const restAngle = (leaf: number) => (leaf < spreadRef.current ? -180 : 0);

  const zones: { kind: DragState["kind"]; leaf: number; left: number; width: number }[] = [];
  if (spread === 0) zones.push({ kind: "cover", leaf: 0, left: W, width: W });
  else {
    const zw = W * 0.22;
    if (spread < maxSpread) zones.push({ kind: "right", leaf: spread, left: W * 2 - zw, width: zw });
    zones.push({ kind: "left", leaf: spread - 1, left: 0, width: zw });
  }

  // ── float ──
  // A slow breath (about 6.4s) with a little sway a beat behind it. `hold` scales the whole thing:
  // 1 while the book rests, easing to 0 while a page is in the hand, so it steadies when touched.
  const floating = float && !reduceMotion;
  const hold = useMotionValue(floating ? 1 : 0);
  const bob = useMotionValue(0); // -1 (lowest) … 1 (highest)
  const sway = useMotionValue(0);
  useAnimationFrame((t) => {
    if (!floating && hold.get() === 0) return;
    const k = hold.get();
    const phase = (t / 6400) * Math.PI * 2;
    bob.set(Math.sin(phase) * k);
    sway.set(Math.sin(phase * 0.5 + 1.1) * k);
  });
  useEffect(() => {
    animate(hold, floating ? 1 : 0, { duration: 0.8, ease: EASE_OUT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floating]);
  const lift = 5 * s; // how far the book travels each way
  const floatY = useTransform(bob, (b) => -b * lift - (floating ? 4 * s : 0) * hold.get());
  const floatRotate = useTransform(sway, (w) => w * 0.45);
  // The shadow stays on the ground: it gathers and darkens as the book comes down, spreads and
  // fades as it rises. It cancels the book's own travel so it never rides along.
  const shadowY = useTransform(floatY, (y) => -y);
  const shadowScale = useTransform(bob, (b) => 1 + b * 0.07);
  const shadowOpacity = useTransform(bob, (b) => 1 - hold.get() * 0.15 - b * 0.22);
  const shadowRotate = useTransform(floatRotate, (r) => -r); // the ground doesn't tilt
  const steady = (on: boolean) => {
    if (!floating) return;
    animate(hold, on ? 0 : 1, { duration: on ? 0.35 : 1.1, ease: EASE_OUT, delay: on ? 0 : 0.4 });
  };

  const onZoneDown = (zone: (typeof zones)[number]) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const mv = angles.current[zone.leaf];
    if (!mv) return;
    if (e.pointerType === "mouse") e.preventDefault(); // no text selection while dragging
    rootRef.current?.focus({ preventScroll: true }); // so the arrow keys work after a click
    e.currentTarget.setPointerCapture(e.pointerId);
    steady(true);
    const px = localX(e.clientX);
    // Grip: the page leans toward the corner it is held by, and that corner lifts off the stack.
    const leanMv = leans.current[zone.leaf];
    const l = localLean(e.clientY);
    const rest = restAngle(zone.leaf);
    if (reduceMotion) leanMv?.set(l);
    else {
      if (leanMv) animate(leanMv, l, grip);
      if (Math.abs(mv.get() - rest) < 20) animate(mv, zone.kind === "cover" ? -13 : zone.kind === "right" ? -11 : -169, grip);
    }
    drag.current = {
      pointerId: e.pointerId,
      leaf: zone.leaf,
      kind: zone.kind,
      startClientX: e.clientX,
      offset: W * Math.cos(rest * RAD) - px,
      lastPx: px,
      lastT: performance.now(),
      vx: 0,
      moved: false,
      rest,
    };
  };

  const onZoneMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!draggable) return;
    if (!d.moved && Math.abs(e.clientX - d.startClientX) < 4) return;
    const mv = angles.current[d.leaf];
    if (!d.moved) d.moved = true;
    const px = localX(e.clientX);
    const now = performance.now();
    const dt = Math.max(now - d.lastT, 1);
    d.vx = d.vx * 0.6 + ((px - d.lastPx) / dt) * 0.4;
    d.lastPx = px;
    d.lastT = now;
    // The page's outer edge follows the pointer: edge x = W·cos(angle).
    // While held, the page never drops below the grip angle, so it can't fall flat in the hand.
    const raw = -Math.acos(clamp((px + d.offset) / W, -1, 1)) / RAD;
    const a = d.rest === 0 ? Math.min(raw, -6) : Math.max(raw, -174);
    if (reduceMotion) mv.set(a);
    else animate(mv, a, follow);
    // Slide the grip along the page as the hand moves up or down.
    const leanMv = leans.current[d.leaf];
    if (leanMv) leanMv.set(leanMv.get() * 0.85 + localLean(e.clientY) * 0.15);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    steady(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const mv = angles.current[d.leaf];
    const before = spreadRef.current;
    const back = () => (reduceMotion ? mv.set(restAngle(d.leaf)) : animate(mv, restAngle(d.leaf), released));

    if (!d.moved) {
      if (cancelled) return back();
      if (d.kind === "cover") request(openTarget);
      else if (d.kind === "right") request(before + 1);
      else request(before - 1);
    } else {
      const a = mv.get();
      const fling = 0.5; // px per ms
      const forward = d.kind !== "left";
      const commit = cancelled
        ? false
        : forward
          ? a < -90 ? d.vx < fling : d.vx < -fling
          : a > -90 ? d.vx > -fling : d.vx > fling;
      if (!commit) return back();
      fromDrag.current = true;
      request(forward ? before + 1 : before - 1);
    }
    // If a controlled parent ignored the request, put the leaf back where it belongs.
    setTimeout(() => {
      if (spreadRef.current === before) {
        fromDrag.current = false;
        back();
      }
    }, 0);
  };

  const onZoneEnter = (zone: (typeof zones)[number]) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || drag.current || reduceMotion) return;
    const mv = angles.current[zone.leaf];
    const rest = restAngle(zone.leaf);
    if (!mv || Math.abs(mv.get() - rest) > 0.5) return;
    const peek = zone.kind === "cover" ? -16 : zone.kind === "right" ? -9 : -171;
    animate(mv, peek, { type: "spring", stiffness: 260, damping: 24 });
  };
  const onZoneLeave = (zone: (typeof zones)[number]) => () => {
    if (drag.current) return;
    const mv = angles.current[zone.leaf];
    if (!mv) return;
    const rest = restAngle(zone.leaf);
    if (Math.abs(mv.get() - rest) < 25 && mv.get() !== rest) animate(mv, rest, { type: "spring", stiffness: 260, damping: 26 });
  };

  // ── keyboard ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.target !== e.currentTarget) return; // leave keys inside pages alone
    const keys: Record<string, () => void> = {
      ArrowRight: goNext,
      PageDown: goNext,
      ArrowLeft: goPrev,
      PageUp: goPrev,
      Home: () => request(0),
      End: () => request(maxSpread),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  // ── what's on the current spread ──
  const leftPage = spread >= 2 && 2 * spread - 2 <= n ? 2 * spread - 2 : undefined; // 1-based
  const rightPage = spread >= 1 && 2 * spread - 1 <= n ? 2 * spread - 1 : undefined;
  const shown = [leftPage, rightPage].filter((p): p is number => p !== undefined);
  const counter = spread === 0 ? "Cover" : shown.length ? `${shown.join("–")} / ${n}` : `${n} / ${n}`;
  const announcement =
    spread === 0
      ? `${label}, closed`
      : shown.length === 2
        ? `Pages ${shown[0]} and ${shown[1]} of ${n}`
        : shown.length === 1
          ? `Page ${shown[0]} of ${n}`
          : "Inside back cover";

  const leftCount = Math.max(spread - 1, 0);
  const rightCount = Math.max(leafCount - spread - 1, 0);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="book"
      aria-label={label}
      tabIndex={0}
      data-state={spread === 0 ? "closed" : "open"}
      data-spread={spread}
      data-paper={paper}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex flex-col items-center gap-5 rounded-2xl outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/40",
        className
      )}
      style={{ width: W * 2, maxWidth: "100%", ...style }}
      {...rest}
    >
      <div className="relative w-full" style={{ height: (H + 26 * s) * scale }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: W * 2, height: H, transform: `scale(${scale})` }}>
          <motion.div ref={bookRef} className="relative" style={{ width: W * 2, height: H, x: shiftX, y: floatY, rotate: floatRotate, opacity: fade }}>
            {/* ground shadow */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-[50%]"
              style={{
                left: shadowLeft,
                right: "4%",
                bottom: (floating ? -22 : -16) * s,
                height: 30 * s,
                background: "radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)",
                filter: `blur(${(floating ? 8 : 6) * s}px)`,
                y: shadowY,
                scale: shadowScale,
                opacity: shadowOpacity,
                rotate: shadowRotate,
              }}
            />

            {/* ribbon bookmark, tucked between the pages and hanging out at the foot */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{
                left: W * 1.72,
                top: H - 10 * s,
                width: 9 * s,
                height: 34 * s,
                zIndex: 0,
                // a satin ribbon: lit along its middle, with a faint edge so it reads against the page
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.10) 0px, transparent 1px, transparent calc(100% - 1px), rgba(255,255,255,0.06) 100%), linear-gradient(90deg, #18181a 0%, #2a2a2c 50%, #18181a 100%)", // void-lint-ignore: a step lighter than raised so the ribbon reads below the book
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
              }}
            />

            {/* back board, seen from inside */}
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                left: W,
                top: 0,
                width: W,
                height: H,
                zIndex: 0,
                borderRadius: `${geo.spineRadius}px ${geo.radius}px ${geo.radius}px ${geo.spineRadius}px`,
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.7), 0 2px 8px -2px rgba(0,0,0,0.5)",
              }}
            >
              <CoverInside geo={geo} side="right" />
            </div>

            <PageBlock geo={geo} side="left" leaves={leftCount} paper={paper} />
            <PageBlock geo={geo} side="right" leaves={rightCount} paper={paper} />

            {angles.current.map((mv, i) => {
              const isCover = i === 0;
              const frontIdx = 2 * (i - 1);
              const backIdx = frontIdx + 1;
              const front = isCover ? (
                <CoverFront geo={geo}>{cover ?? <CoverArt geo={geo} title={title} subtitle={subtitle} />}</CoverFront>
              ) : (
                <PageFace side="right" paper={paper} geo={geo} number={frontIdx + 1} showNumber={pageNumbers} ruled={ruled}>
                  {pages[frontIdx]}
                </PageFace>
              );
              const back = isCover ? (
                <CoverInside geo={geo} side="left" />
              ) : (
                <PageFace side="left" paper={paper} geo={geo} number={backIdx < n ? backIdx + 1 : undefined} showNumber={pageNumbers} ruled={ruled}>
                  {pages[backIdx]}
                </PageFace>
              );
              return (
                <Leaf
                  key={i}
                  index={i}
                  count={leafCount}
                  angle={mv}
                  lean={leans.current[i]}
                  geo={geo}
                  isCover={isCover}
                  front={front}
                  back={back}
                  frontShowing={i === spread}
                  backShowing={i === spread - 1}
                />
              );
            })}

            {/* grab zones on the outer page edges (and the whole cover when closed) */}
            {zones.map((zone) => (
              <div
                key={`${zone.kind}-${zone.leaf}`}
                aria-hidden="true"
                data-book-zone={zone.kind}
                className="absolute top-0 cursor-pointer select-none active:cursor-grabbing"
                style={{
                  left: zone.left,
                  width: zone.width,
                  height: H,
                  zIndex: leafCount * 2 + 10,
                  touchAction: "pan-y",
                }}
                onPointerDown={onZoneDown(zone)}
                onPointerMove={onZoneMove}
                onPointerUp={(e) => finishDrag(e, false)}
                onPointerCancel={(e) => finishDrag(e, true)}
                onPointerEnter={onZoneEnter(zone)}
                onPointerLeave={onZoneLeave(zone)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {controls && (
        <div className="flex items-center gap-3">
          <button type="button" className={socketButton} onClick={goPrev} disabled={spread === 0} aria-label={spread === 1 ? "Close book" : "Previous pages"}>
            <Chevron dir="left" />
          </button>
          <span className="min-w-16 text-center text-xs tabular-nums text-neutral-500" aria-hidden="true">
            {counter}
          </span>
          <button
            type="button"
            className={socketButton}
            onClick={goNext}
            disabled={spread >= maxSpread}
            aria-label={spread === 0 ? "Open book" : "Next pages"}
          >
            <Chevron dir="right" />
          </button>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
});
