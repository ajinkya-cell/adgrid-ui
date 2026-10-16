"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import rough from "roughjs";
import type { Font } from "opentype.js";
import { loadHandwritingFont, type HandwritingFont } from "./roughly/handwriting-fonts";
import { layoutGlyphs, type GlyphBox } from "./roughly/glyph-paths";

export interface ChalkboardNotFoundProps {
  /** First chalk line under the 404 */
  title?: string;
  /** Second, smaller chalk line */
  subtitle?: string;
  /** Note next to the arrow pointing at the loose digits */
  hint?: string;
  /** Quiet link under the board for anyone who'd rather not play */
  homeLabel?: string;
  /** Where the link (and the default redirect) goes */
  homeHref?: string;
  /** Called once the board has been wiped white. Defaults to navigating to `homeHref`. */
  onSolved?: () => void;
  /** Chalk handwriting */
  font?: HandwritingFont;
  /** Chalk colour */
  chalkColor?: string;
  /** Slate colour */
  boardColor?: string;
  /** Optional container class name override */
  className?: string;
}

// Everything on the board is laid out in one unit space, 1000 wide × 700 tall, and scaled to fit.
// The slate is the top 560; the chalk ledge sits below it.
const W = 1000;
const H = 700;
const SLATE_H = 560;
const DIGIT_SIZE = 330;
const SLOT_Y = 215;
const SLOTS = [
  { char: "4", x: 322 },
  { char: "0", x: 500 },
  { char: "4", x: 678 },
];
// Loose on the ledge, out of order.
const PIECES = [
  { char: "0", x: 262, tilt: -8 },
  { char: "4", x: 382, tilt: 6 },
  { char: "4", x: 492, tilt: -4 },
];
const REST_Y = 646;
const REST_SCALE = 0.32;
const SNAP_DISTANCE = 150;
const ERASER = { x: 836, y: 646, w: 170, h: 58 };
// The eraser's sweep across the slate, in board units.
const SWEEP = [
  [70, 70],
  [930, 120],
  [90, 215],
  [930, 300],
  [80, 395],
  [935, 470],
  [120, 530],
  [560, 520],
] as const;
const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

// Chalk grit: a noise texture used as a mask, so strokes come out dry and broken. As a mask image
// it's rasterised once and cached; a live SVG filter here re-renders on every animation frame.
const CHALK_MASK = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2.4 0 0 0 1.85'/></filter><rect width='100%' height='100%' filter='url(%23c)'/></svg>")`;
const chalkMaskStyle = {
  maskImage: CHALK_MASK,
  WebkitMaskImage: CHALK_MASK,
  maskSize: "240px 240px",
  WebkitMaskSize: "240px 240px",
} as const;

type Phase = "loading" | "ready" | "erasing" | "done" | "fallback";

interface Glyph {
  d: string;
  box: GlyphBox;
}

/**
 * ChalkboardNotFound
 * A 404 on a chalkboard: the digits have fallen onto the ledge, and their dashed chalk outlines
 * show where they go. Put the 4, 0 and 4 back and an eraser wipes the board white, then you're
 * sent home. Every digit is also a button (Enter places it), and a plain link is always there.
 */
export function ChalkboardNotFound({
  title = "this page doesn't exist yet.",
  subtitle = "maybe one day.",
  hint = "put them back",
  homeLabel = "or just take me home",
  homeHref = "/",
  onSolved,
  font = "caveat",
  chalkColor = "#ecebe4",
  boardColor = "#1b201d",
  className = "",
}: ChalkboardNotFoundProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const wipeMask = `wipe-${uid}`;

  const [loadedFont, setLoadedFont] = useState<Font | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  useEffect(() => {
    let active = true;
    loadHandwritingFont(font)
      .then((f) => {
        if (!active) return;
        setLoadedFont(f);
        setPhase("ready");
      })
      .catch(() => active && setPhase("fallback"));
    return () => {
      active = false;
    };
  }, [font]);

  // Board units → pixels.
  const innerRef = useRef<HTMLDivElement>(null);
  const [ppu, setPpu] = useState(0);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setPpu(el.clientWidth / W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Glyphs ────────────────────────────────────────────────────────
  const digits = useMemo(() => {
    if (!loadedFont) return null;
    const map: Record<string, Glyph> = {};
    for (const char of ["4", "0"]) {
      const layout = layoutGlyphs(loadedFont, char, DIGIT_SIZE, 0);
      if (!layout || !layout.paths[0]) return null;
      map[char] = { d: layout.paths.join(""), box: layout.box };
    }
    return map;
  }, [loadedFont]);

  const lines = useMemo(() => {
    if (!loadedFont) return null;
    const place = (text: string, size: number, cx: number, cy: number) => {
      const layout = layoutGlyphs(loadedFont, text, size, 0);
      if (!layout) return null;
      const { box } = layout;
      return { paths: layout.paths, dx: cx - (box.x1 + box.x2) / 2, dy: cy - (box.y1 + box.y2) / 2 };
    };
    return {
      title: place(title, 58, W / 2, 405),
      subtitle: place(subtitle, 40, W / 2, 468),
      hint: place(hint, 32, 150, 508),
    };
  }, [loadedFont, title, subtitle, hint]);

  // Dashed, slightly wobbly chalk outlines of each slot's digit, and the hint arrow.
  const sketches = useMemo(() => {
    if (!digits) return null;
    const gen = rough.generator();
    const outline = (d: string, seed: number) =>
      gen
        .toPaths(gen.path(d, { roughness: 0.9, bowing: 0.6, stroke: chalkColor, strokeWidth: 2.4, seed }))
        .map((p) => p.d);
    return {
      slots: SLOTS.map((slot, i) => outline(digits[slot.char].d, i + 3)),
      arrow: gen
        .toPaths(
          gen.curve(
            [
              [176, 530],
              [168, 560],
              [196, 590],
              [228, 604],
            ],
            { roughness: 1.1, bowing: 1, stroke: chalkColor, strokeWidth: 2.6, seed: 11 }
          )
        )
        .map((p) => p.d),
      head: [
        ...gen.toPaths(gen.line(228, 604, 210, 607, { roughness: 0.7, stroke: chalkColor, strokeWidth: 2.6, seed: 12 })),
        ...gen.toPaths(gen.line(228, 604, 218, 588, { roughness: 0.7, stroke: chalkColor, strokeWidth: 2.6, seed: 13 })),
      ].map((p) => p.d),
    };
  }, [digits, chalkColor]);

  // ── Puzzle state ──────────────────────────────────────────────────
  const [placed, setPlaced] = useState<(number | null)[]>(() => PIECES.map(() => null)); // piece → slot
  const [puffs, setPuffs] = useState<{ id: number; x: number; y: number }[]>([]);
  const placedCount = placed.filter((s) => s !== null).length;
  const solved = placedCount === SLOTS.length;

  const freeSlotFor = useCallback(
    (char: string, near?: { x: number; y: number }) => {
      const taken = new Set(placed.filter((s): s is number => s !== null));
      const options = SLOTS.map((slot, i) => ({ slot, i })).filter(({ slot, i }) => slot.char === char && !taken.has(i));
      if (!near) return options[0]?.i ?? null;
      let best: number | null = null;
      let bestDist = SNAP_DISTANCE;
      for (const { slot, i } of options) {
        const dist = Math.hypot(slot.x - near.x, SLOT_Y - near.y);
        if (dist < bestDist) {
          best = i;
          bestDist = dist;
        }
      }
      return best;
    },
    [placed]
  );

  const place = useCallback(
    (piece: number, slot: number | null) => {
      if (slot === null) return;
      setPlaced((prev) => prev.map((s, i) => (i === piece ? slot : s)));
      const id = Date.now() + piece;
      setPuffs((prev) => [...prev, { id, x: SLOTS[slot].x, y: SLOT_Y }]);
      window.setTimeout(() => setPuffs((prev) => prev.filter((p) => p.id !== id)), 700);
    },
    []
  );

  // ── Finale: the eraser wipes the slate white, then home ──────────
  const wipe = useMotionValue(0);
  const eraserX = useMotionValue(0);
  const eraserY = useMotionValue(0);
  const eraserRotate = useMotionValue(0);
  const wipeOpacity = useTransform(wipe, (v) => (v > 0 ? 1 : 0));
  const [whiteout, setWhiteout] = useState(false);

  useEffect(() => {
    if (ppu === 0 || phase === "erasing" || phase === "done") return;
    eraserX.set((ERASER.x - ERASER.w / 2) * ppu);
    eraserY.set((ERASER.y - ERASER.h / 2) * ppu);
  }, [ppu, phase, eraserX, eraserY]);

  const sweepPath = useMemo(() => `M${SWEEP.map(([x, y]) => `${x} ${y}`).join(" L")}`, []);

  // Runs once, when the last digit lands. It sets `phase` itself, so `phase` must not be a
  // dependency: a re-run would clean up (and cancel) the sweep that just started.
  const finaleStarted = useRef(false);
  useEffect(() => {
    if (!solved || finaleStarted.current) return;
    finaleStarted.current = true;
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      setWhiteout(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("done");
        if (onSolved) onSolved();
        else window.location.assign(homeHref);
      }, reduceMotion ? 350 : 650);
    };

    const start = window.setTimeout(async () => {
      if (cancelled) return;
      setPhase("erasing");
      if (reduceMotion) {
        finish();
        return;
      }
      // Lift the eraser to the start of the sweep, then follow it at an even speed.
      const lengths = SWEEP.slice(1).map(([x, y], i) => Math.hypot(x - SWEEP[i][0], y - SWEEP[i][1]));
      const total = lengths.reduce((a, b) => a + b, 0);
      const times = [0];
      lengths.reduce((acc, l) => {
        times.push((acc + l) / total);
        return acc + l;
      }, 0);
      const toX = (x: number) => (x - ERASER.w / 2) * ppu;
      const toY = (y: number) => (y - ERASER.h / 2) * ppu;

      await Promise.all([
        animate(eraserX, toX(SWEEP[0][0]), { duration: 0.4, ease: [0.32, 0.72, 0, 1] }),
        animate(eraserY, toY(SWEEP[0][1]), { duration: 0.4, ease: [0.32, 0.72, 0, 1] }),
        animate(eraserRotate, -8, { duration: 0.4 }),
      ]);
      if (cancelled) return;
      const sweep = { duration: 1.7, ease: "linear" as const, times };
      await Promise.all([
        animate(eraserX, SWEEP.map(([x]) => toX(x)), sweep),
        animate(eraserY, SWEEP.map(([, y]) => toY(y)), sweep),
        animate(wipe, 1, { duration: 1.7, ease: "linear" }),
        animate(eraserRotate, [-8, 6, -6, 6, -6, 6, -4, 0], sweep),
      ]);
      finish();
    }, 380);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
    // ppu is read once when the sweep starts; a resize mid-sweep isn't worth restarting for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  // ── Timing for the chalk writing ──────────────────────────────────
  const titleCount = lines?.title?.paths.length ?? 0;
  const subtitleCount = lines?.subtitle?.paths.length ?? 0;
  const perGlyph = 0.055;
  const titleStart = 0.45;
  const subtitleStart = titleStart + titleCount * perGlyph + 0.2;
  const hintStart = subtitleStart + subtitleCount * perGlyph + 0.35;

  const status = solved
    ? "All three in place. Taking you home."
    : `${placedCount} of ${SLOTS.length} digits in place.`;

  return (
    <section
      className={`relative flex min-h-svh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-[#0a0a0a] px-4 py-10 sm:px-8 ${className}`}
    >
      <h1 className="sr-only">404: page not found</h1>
      <p className="sr-only" aria-live="polite">
        {phase === "ready" || phase === "erasing" ? status : ""}
      </p>

      {/* The frame: a raised surface from the system, with the prismatic top edge. */}
      <div
        className="relative w-full max-w-[1000px] rounded-[28px] p-[1.6%]"
        style={{
          background: "linear-gradient(180deg, #1b1b1d 0%, #151516 100%)",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 40px 100px -20px rgba(0,0,0,0.9), 0 8px 24px -6px rgba(0,0,0,0.7)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] top-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
          }}
        />

        <div ref={innerRef} className="relative w-full select-none" style={{ aspectRatio: `${W} / ${H}` }}>
          {/* Slate: a well cut into the frame, dusty from years of erasing. */}
          <div
            className="absolute inset-x-0 top-0 overflow-hidden rounded-[18px]"
            style={{
              height: `${(SLATE_H / H) * 100}%`,
              background: boardColor,
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 38% 22% at 28% 30%, rgba(236,235,228,0.06), transparent 70%), radial-gradient(ellipse 30% 18% at 74% 62%, rgba(236,235,228,0.05), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(236,235,228,0.04), transparent 70%)",
              }}
            />
            <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: GRAIN }} />
          </div>

          {/* Chalk ledge: a raised tray along the bottom of the frame. */}
          <div
            aria-hidden
            className="absolute inset-x-[1%] bottom-0 rounded-xl"
            style={{
              top: `${(588 / H) * 100}%`,
              background: "linear-gradient(180deg, #1f1f21 0%, #161617 100%)",
              boxShadow:
                "inset 0 1.5px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 10px 20px -10px rgba(0,0,0,0.6)",
            }}
          >
            {/* A stub of chalk */}
            <span
              className="absolute rounded-full"
              style={{
                left: `${(580 / W) * 100}%`,
                top: "46%",
                width: `${(74 / W) * 100}%`,
                height: "13%",
                background: "linear-gradient(180deg, #f4f3ee, #cfcdc4)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                transform: "rotate(-4deg)",
              }}
            />
          </div>

          {phase === "fallback" ? (
            <div className="absolute inset-x-0 top-0 grid place-items-center text-center" style={{ height: `${(SLATE_H / H) * 100}%`, color: chalkColor }}>
              <div>
                <p className="m-0 text-[clamp(4rem,14vw,9rem)] leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
                  404
                </p>
                <p className="m-0 mt-2 text-[clamp(1.1rem,3vw,1.8rem)]" style={{ fontFamily: "'Caveat', cursive" }}>
                  {title} {subtitle}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Everything drawn in chalk: slot outlines, the message, the hint. */}
              <svg
                aria-hidden
                viewBox={`0 0 ${W} ${H}`}
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                style={chalkMaskStyle}
              >
                <g>
                  {digits &&
                    sketches &&
                    SLOTS.map((slot, i) => {
                      const g = digits[slot.char];
                      const filled = placed.includes(i);
                      return (
                        <motion.g
                          key={i}
                          transform={`translate(${slot.x - (g.box.x1 + g.box.x2) / 2} ${SLOT_Y - (g.box.y1 + g.box.y2) / 2})`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: filled ? 0 : 0.55 }}
                          transition={{ duration: filled ? 0.2 : 0.6, delay: filled ? 0 : 0.1 + i * 0.12 }}
                        >
                          {sketches.slots[i].map((d, k) => (
                            <path key={k} d={d} fill="none" stroke={chalkColor} strokeWidth={2.4} strokeDasharray="10 12" strokeLinecap="round" />
                          ))}
                        </motion.g>
                      );
                    })}

                  {lines?.title && <ChalkLine line={lines.title} color={chalkColor} start={titleStart} per={perGlyph} instant={reduceMotion} />}
                  {lines?.subtitle && (
                    <ChalkLine line={lines.subtitle} color={chalkColor} start={subtitleStart} per={perGlyph} instant={reduceMotion} opacity={0.8} />
                  )}

                  {lines?.hint && sketches && (
                    <motion.g animate={{ opacity: placedCount > 0 ? 0 : 0.85 }} transition={{ duration: 0.3 }}>
                      <ChalkLine line={lines.hint} color={chalkColor} start={hintStart} per={0.04} instant={reduceMotion} />
                      {[...sketches.arrow, ...sketches.head].map((d, k) => (
                        <motion.path
                          key={k}
                          d={d}
                          fill="none"
                          stroke={chalkColor}
                          strokeWidth={2.6}
                          strokeLinecap="round"
                          initial={reduceMotion ? false : { pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: hintStart + 0.5 + (k < sketches.arrow.length ? 0 : 0.35), duration: 0.4 }}
                        />
                      ))}
                    </motion.g>
                  )}

                  {/* Chalk dust kicked up when a digit lands */}
                  {puffs.map((puff) => (
                    <g key={puff.id}>
                      {Array.from({ length: 8 }).map((_, k) => {
                        const angle = (Math.PI * 2 * k) / 8 + (puff.id % 7) * 0.3;
                        const dist = 70 + ((k * 37) % 40);
                        return (
                          <motion.circle
                            key={k}
                            cx={puff.x}
                            cy={puff.y + 60}
                            r={3 + (k % 3)}
                            fill={chalkColor}
                            initial={{ opacity: 0.8, x: 0, y: 0 }}
                            animate={{ opacity: 0, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.6 }}
                            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                          />
                        );
                      })}
                    </g>
                  ))}
                </g>
              </svg>

              {/* The loose digits */}
              {digits &&
                ppu > 0 &&
                PIECES.map((piece, i) => (
                  <Piece
                    key={i}
                    glyph={digits[piece.char]}
                    char={piece.char}
                    rest={{ x: piece.x, y: REST_Y, tilt: piece.tilt }}
                    target={placed[i] !== null ? { x: SLOTS[placed[i] as number].x, y: SLOT_Y } : null}
                    ppu={ppu}
                    color={chalkColor}
                    disabled={phase !== "ready"}
                    reduceMotion={reduceMotion}
                    boundsRef={innerRef}
                    onDrop={(center) => {
                      const slot = freeSlotFor(piece.char, center);
                      place(i, slot);
                      return slot !== null;
                    }}
                    onActivate={() => place(i, freeSlotFor(piece.char))}
                  />
                ))}

              {/* The wipe: white shows through wherever the eraser has passed. */}
              <svg
                aria-hidden
                viewBox={`0 0 ${W} ${SLATE_H}`}
                className="pointer-events-none absolute inset-x-0 top-0 z-[15] overflow-hidden rounded-[18px]"
                style={{ height: `${(SLATE_H / H) * 100}%`, width: "100%" }}
                preserveAspectRatio="none"
              >
                <defs>
                  <mask id={wipeMask}>
                    <rect width={W} height={SLATE_H} fill="black" />
                    <motion.path
                      d={sweepPath}
                      fill="none"
                      stroke="white"
                      strokeWidth={190}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ pathLength: wipe, opacity: wipeOpacity }}
                    />
                  </mask>
                </defs>
                <rect width={W} height={SLATE_H} fill="#f7f6f2" mask={`url(#${wipeMask})`} />
              </svg>

              {/* The eraser: rests on the ledge, then does the sweep. */}
              {ppu > 0 && (
                <motion.div
                  aria-hidden
                  className="absolute left-0 top-0 z-20"
                  style={{ x: eraserX, y: eraserY, rotate: eraserRotate, width: ERASER.w * ppu, height: ERASER.h * ppu }}
                >
                  <div
                    className="absolute inset-0 overflow-hidden rounded-[8px]"
                    style={{
                      background: "linear-gradient(180deg, #2a2a2d 0%, #1d1d1f 100%)",
                      boxShadow:
                        "inset 0 1.5px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.5), 0 6px 14px -4px rgba(0,0,0,0.7)",
                    }}
                  >
                    <span className="absolute inset-x-0 bottom-0 h-[34%] bg-[#8d8a80]" style={{ backgroundImage: GRAIN }} />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      <a
        href={homeHref}
        className="rounded-md text-[13px] text-neutral-500 no-underline transition-colors duration-150 hover:text-neutral-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40"
      >
        {homeLabel}
      </a>

      {/* Once the slate is white, the white takes over the whole screen on the way home. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-[#f7f6f2]"
        initial={false}
        animate={{ opacity: whiteout ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.3 : 0.45, ease: "easeOut" }}
      />
    </section>
  );
}

interface LinePlacement {
  paths: string[];
  dx: number;
  dy: number;
}

/** A line of chalk handwriting, written one letter at a time. */
function ChalkLine({
  line,
  color,
  start,
  per,
  instant,
  opacity = 1,
}: {
  line: LinePlacement;
  color: string;
  start: number;
  per: number;
  instant: boolean;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${line.dx} ${line.dy})`} opacity={opacity}>
      {line.paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill={color}
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
          initial={instant ? false : { pathLength: 0, fillOpacity: 0, opacity: 0 }}
          animate={{ pathLength: 1, fillOpacity: 1, opacity: 1 }}
          transition={{
            delay: start + i * per,
            pathLength: { duration: per * 2.4, ease: "easeOut", delay: start + i * per },
            fillOpacity: { duration: 0.2, delay: start + i * per + per * 1.6 },
            opacity: { duration: 0.01, delay: start + i * per },
          }}
        />
      ))}
    </g>
  );
}

interface PieceProps {
  char: string;
  glyph: Glyph;
  rest: { x: number; y: number; tilt: number };
  /** The slot centre it's been placed in, or null while it's loose. */
  target: { x: number; y: number } | null;
  ppu: number;
  color: string;
  disabled: boolean;
  reduceMotion: boolean;
  boundsRef: RefObject<HTMLDivElement | null>;
  /** Returns true if the digit landed in a slot. */
  onDrop: (center: { x: number; y: number }) => boolean;
  onActivate: () => void;
}

/** One loose chalk digit: drag it into its outline, or press Enter to place it. */
function Piece({
  char,
  glyph,
  rest,
  target,
  ppu,
  color,
  disabled,
  reduceMotion,
  boundsRef,
  onDrop,
  onActivate,
}: PieceProps) {
  const pad = 16;
  const boxW = glyph.box.x2 - glyph.box.x1 + pad * 2;
  const boxH = glyph.box.y2 - glyph.box.y1 + pad * 2;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragging = useRef(false);
  const justDragged = useRef(false);
  const ppuRef = useRef(ppu);
  ppuRef.current = ppu;
  // Small on the ledge, but never smaller than a comfortable 44px touch target. On a phone-sized
  // board that means the digits stand a little taller than the ledge.
  const restScale = Math.min(0.6, Math.max(REST_SCALE, 44 / (boxH * ppu || 1)));
  const restScaleRef = useRef(restScale);
  restScaleRef.current = restScale;

  // Small on the ledge, full size up on the slate.
  const scale = useTransform(y, (v) => {
    const cy = (v + (boxH * ppuRef.current) / 2) / (ppuRef.current || 1);
    const t = Math.min(1, Math.max(0, (rest.y - cy) / (rest.y - 470)));
    return restScaleRef.current + (1 - restScaleRef.current) * t;
  });
  const rotate = useTransform(scale, (s) => rest.tilt * (1 - (s - restScaleRef.current) / (1 - restScaleRef.current)));

  const home = target ?? rest;
  const topLeft = (p: { x: number; y: number }) => ({ x: (p.x - boxW / 2) * ppu, y: (p.y - boxH / 2) * ppu });

  // Go to the slot (or back to the ledge) whenever the target or the board size changes.
  const first = useRef(true);
  useEffect(() => {
    if (dragging.current) return;
    const to = topLeft(home);
    if (first.current) {
      first.current = false;
      x.set(to.x);
      y.set(to.y);
      return;
    }
    const opts = reduceMotion ? { duration: 0.15 } : SPRING;
    animate(x, to.x, opts);
    animate(y, to.y, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home.x, home.y, ppu]);

  const placed = target !== null;

  return (
    <motion.button
      type="button"
      aria-label={placed ? `${char}, in place` : `Digit ${char}. Press Enter to put it back.`}
      disabled={disabled || placed}
      drag={!disabled && !placed}
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={boundsRef}
      onDragStart={() => {
        dragging.current = true;
        justDragged.current = true;
      }}
      onDragEnd={() => {
        dragging.current = false;
        const center = { x: x.get() / ppu + boxW / 2, y: y.get() / ppu + boxH / 2 };
        // A hit changes the target, and the effect above carries it into the slot. A miss leaves
        // the target as it was, so send it back to the ledge here. Wait a frame first: right after
        // this callback framer-motion starts its own settle animation on x/y, which would cancel
        // a spring started now.
        if (!onDrop(center)) {
          requestAnimationFrame(() => {
            if (dragging.current) return;
            const to = topLeft(rest);
            const opts = reduceMotion ? { duration: 0.15 } : SPRING;
            animate(x, to.x, opts);
            animate(y, to.y, opts);
          });
        }
        window.setTimeout(() => (justDragged.current = false), 50);
      }}
      onClick={() => {
        if (justDragged.current) return;
        onActivate();
      }}
      whileDrag={{ zIndex: 30 }}
      className={`absolute left-0 top-0 z-10 cursor-grab touch-none rounded-xl border-0 bg-transparent p-0 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40 active:cursor-grabbing disabled:cursor-default ${placed ? "pointer-events-none" : ""}`}
      style={{ x, y, scale, rotate, width: boxW * ppu, height: boxH * ppu }}
    >
      <svg
        viewBox={`${glyph.box.x1 - pad} ${glyph.box.y1 - pad} ${boxW} ${boxH}`}
        className="pointer-events-none block h-full w-full overflow-visible"
        style={chalkMaskStyle}
      >
        <path d={glyph.d} fill={color} />
      </svg>
    </motion.button>
  );
}

export default ChalkboardNotFound;
