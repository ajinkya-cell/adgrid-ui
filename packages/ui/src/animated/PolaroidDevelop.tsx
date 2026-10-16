"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import type { Font } from "opentype.js";
import { loadHandwritingFont, type HandwritingFont } from "./roughly/handwriting-fonts";
import { layoutGlyphs } from "./roughly/glyph-paths";

export interface PolaroidPhoto {
  src: string;
  alt?: string;
  /** Handwritten on the bottom of the print */
  caption?: string;
}

export interface PolaroidDevelopProps {
  /** The prints, top to bottom */
  photos?: PolaroidPhoto[];
  /** Small line above the title */
  eyebrow?: string;
  /** Title above the prints (empty hides the intro) */
  title?: string;
  /** One line under the title */
  subtitle?: string;
  /** Handwriting used for the captions */
  font?: HandwritingFont;
  /** Pen colour for the captions */
  inkColor?: string;
  /** Colour of the table the prints lie on */
  tableColor?: string;
  /** Largest resting tilt of a print, in degrees */
  maxTilt?: number;
  /** How much the prints swing and lag with scroll speed (0 turns it off) */
  drift?: number;
  /** Let prints fade back to blank when scrolled back past them, instead of staying developed */
  redevelop?: boolean;
  /** Optional container class name override */
  className?: string;
}

const photo = (id: string, alt: string, caption: string): PolaroidPhoto => ({
  src: `https://images.unsplash.com/photo-${id}?w=720&h=720&fit=crop&auto=format&q=80`,
  alt,
  caption,
});

const DEFAULT_PHOTOS: PolaroidPhoto[] = [
  photo("1561361513-2d000a50f0dc", "A mint camper van parked by the sea", "the van, day one"),
  photo("1529253355930-ddbe423a2ac7", "The Gateway of India reflected in a puddle", "bombay, after the rain"),
  photo("1441974231531-c6227db76b6e", "A path through a sunlit forest", "the long way round"),
  photo("1464822759023-fed622ff2c3b", "Snowy peaks above a blue lake", "we found the lake"),
  photo("1470071459604-3b5ec3a7fe05", "Fog rolling over green cliffs", "fog rolled in at noon"),
  photo("1506905925346-21bda4d32df4", "Mountains rising out of a sea of clouds", "5am. worth it."),
  photo("1534447677768-be436bb09401", "A small boat on still water under the stars", "last night by the water"),
  photo("1599661046289-e31897846e41", "A golden fort on a hillside", "jaipur, all gold"),
];

// Fixed, not random, so server and client agree and the layout is the same on every visit.
const TILTS = [-0.75, 0.55, -0.35, 0.9, -0.6, 0.3, -0.95, 0.5];
const POSITIONS = [32, 68, 40, 72, 28, 62, 36, 70]; // card centre, % across the table
const DEPTHS = [1, 0.6, 0.85, 0.5, 1, 0.7, 0.9, 0.55]; // how much each print lags behind the scroll
const CARD_W = "clamp(200px, 27vw, 320px)";

// Film grain, tiled. An inline SVG so the component ships with no image assets of its own.
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 → 1 as `v` moves from `start` to `end`. */
const phase = (v: number, start: number, end: number) => clamp01((v - start) / (end - start));

/**
 * PolaroidDevelop
 * Polaroid prints scattered down a table. As each one scrolls into the middle of the screen it
 * develops: murky chemistry clears from the centre out, a cool cast warms into full colour, a
 * sheen slides across, and the caption is written in ink, stroke by stroke. Prints swing and lag
 * a little with scroll speed and straighten when hovered.
 */
export function PolaroidDevelop({
  photos = DEFAULT_PHOTOS,
  eyebrow = "Roll 07 · Summer",
  title = "Let them develop.",
  subtitle = "Scroll slowly. Every photo takes a moment to come back.",
  font = "caveat",
  inkColor = "#22304f",
  tableColor = "#17140f",
  maxTilt = 6,
  drift = 1,
  redevelop = false,
  className = "",
}: PolaroidDevelopProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [loadedFont, setLoadedFont] = useState<Font | null>(null);

  useEffect(() => {
    let active = true;
    loadHandwritingFont(font)
      .then((f) => active && setLoadedFont(f))
      .catch(() => {
        // Captions fall back to the CSS font, fading in instead of being written.
      });
    return () => {
      active = false;
    };
  }, [font]);

  // One spring-smoothed scroll velocity shared by every print.
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 40, stiffness: 260 });

  return (
    <section
      className={`relative isolate w-full overflow-hidden ${className}`}
      style={{ backgroundColor: tableColor, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Caveat:wght@500&family=Kalam&family=Reenie+Beanie&family=Inter:wght@400;500&display=swap');`}</style>

      {/* The table: a warm pool of light, darker towards the edges, with a little grain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 30%, rgba(255,214,160,0.10), transparent 70%), radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      {title && (
        <header className="relative mx-auto max-w-xl px-6 pb-[14vh] pt-[22vh] text-center">
          {eyebrow && (
            <p className="m-0 text-[11px] font-medium uppercase tracking-[0.22em] text-[#c9b89c]/70">{eyebrow}</p>
          )}
          <h2
            className="m-0 mt-4 text-[clamp(2.6rem,6vw,4.5rem)] font-normal italic leading-none tracking-[-0.02em] text-[#f3ece0]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {title}
          </h2>
          {subtitle && <p className="mx-auto mt-5 max-w-sm text-[15px] leading-relaxed text-[#f3ece0]/55">{subtitle}</p>}
        </header>
      )}

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-[45vh] sm:px-8">
        {photos.map((p, i) => (
          <Print
            key={`${p.src}-${i}`}
            photo={p}
            index={i}
            font={loadedFont}
            fontName={font}
            inkColor={inkColor}
            tilt={TILTS[i % TILTS.length] * maxTilt}
            position={POSITIONS[i % POSITIONS.length]}
            depth={DEPTHS[i % DEPTHS.length]}
            drift={reduceMotion ? 0 : drift}
            velocity={velocity}
            redevelop={redevelop}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}

interface PrintProps {
  photo: PolaroidPhoto;
  index: number;
  font: Font | null;
  fontName: HandwritingFont;
  inkColor: string;
  tilt: number;
  position: number;
  depth: number;
  drift: number;
  velocity: MotionValue<number>;
  redevelop: boolean;
  reduceMotion: boolean;
}

const CSS_FONT: Record<HandwritingFont, string> = {
  caveat: "'Caveat', cursive",
  kalam: "'Kalam', cursive",
  "reenie-beanie": "'Reenie Beanie', cursive",
};

function Print({
  photo,
  index,
  font,
  fontName,
  inkColor,
  tilt,
  position,
  depth,
  drift,
  velocity,
  redevelop,
  reduceMotion,
}: PrintProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 0 when the print's top enters near the bottom of the screen, 1 just above the middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.42"] });

  // A real print doesn't un-develop, so by default progress only ever moves forward.
  const develop = useMotionValue(reduceMotion ? 1 : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduceMotion) return;
    develop.set(redevelop ? v : Math.max(develop.get(), v));
  });
  useEffect(() => {
    if (reduceMotion) develop.set(1);
    else develop.set(redevelop ? scrollYProgress.get() : Math.max(develop.get(), scrollYProgress.get()));
  }, [reduceMotion, redevelop, develop, scrollYProgress]);

  // The image: dark and flat, then cool and faint, then warm full colour.
  const filter = useTransform(develop, (d) => {
    const t = phase(d, 0.08, 0.85);
    return `brightness(${lerp(0.3, 1.02, t)}) contrast(${lerp(0.55, 1.04, t)}) saturate(${lerp(0, 1.08, phase(d, 0.3, 0.95))}) sepia(${lerp(0.35, 0.08, t)})`;
  });
  const chemistry = useTransform(develop, (d) => 1 - phase(d, 0.02, 0.5)); // clears from the centre…
  const edges = useTransform(develop, (d) => 1 - phase(d, 0.25, 0.85)); // …edges go last
  const coolCast = useTransform(develop, (d) => 0.6 * (1 - phase(d, 0.35, 0.9)));
  const grain = useTransform(develop, (d) => lerp(0.55, 0.14, phase(d, 0, 0.9)));
  const sheenX = useTransform(develop, (d) => `${lerp(-120, 220, phase(d, 0.45, 1))}%`);
  const captionFade = useTransform(develop, (d) => phase(d, 0.62, 0.95));

  // Swing and lag with scroll speed; each print by its own amount so they never move as one.
  const swingDir = index % 2 === 0 ? 1 : -1;
  const swing = useTransform(velocity, [-2600, 2600], [-3 * drift * swingDir, 3 * drift * swingDir], { clamp: true });
  const lag = useTransform(velocity, [-2600, 2600], [-22 * drift * depth, 22 * drift * depth], { clamp: true });

  // Glyph outlines for the caption, laid out once per font.
  const glyphs = useMemo(() => {
    if (!font || !photo.caption) return null;
    const layout = layoutGlyphs(font, photo.caption, 40);
    if (!layout) return null;
    const { box } = layout;
    const pad = 4;
    return {
      viewBox: `${box.x1 - pad} ${box.y1 - pad} ${box.x2 - box.x1 + pad * 2} ${box.y2 - box.y1 + pad * 2}`,
      paths: layout.paths,
    };
  }, [font, photo.caption]);

  const marginLeft = `clamp(0px, calc(${position}% - ${CARD_W} / 2), calc(100% - ${CARD_W}))`;

  return (
    <div
      ref={ref}
      className="relative hover:!z-50"
      style={{ zIndex: index + 1, marginTop: index === 0 ? 0 : "clamp(-120px, -9vw, -40px)" }}
    >
      <motion.div style={{ width: CARD_W, marginLeft, rotate: swing, y: lag }}>
        <motion.figure
          className="m-0 cursor-default"
          initial={false}
          animate={{ rotate: tilt }}
          whileHover={reduceMotion ? undefined : { rotate: 0, scale: 1.045, y: -8 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          style={{
            padding: "6% 6% 0",
            background: "linear-gradient(170deg, #fdfcf8 0%, #f3f0e8 60%, #ebe7dc 100%)",
            borderRadius: 3,
            boxShadow:
              "0 1px 1px rgba(0,0,0,0.3), 0 14px 30px -10px rgba(0,0,0,0.65), 0 40px 70px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          {/* The image well */}
          <div
            className="relative aspect-square overflow-hidden"
            style={{ background: "#1d2420", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
          >
            <motion.img
              src={photo.src}
              alt={photo.alt ?? photo.caption ?? ""}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover"
              style={{ filter }}
            />
            {/* Undeveloped chemistry: a murky green-grey that clears from the middle outwards */}
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{ opacity: chemistry, background: "radial-gradient(circle at 50% 45%, #46524c, #2b3430 75%)" }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{
                opacity: edges,
                background: "radial-gradient(circle at 50% 50%, transparent 35%, rgba(36,44,40,0.85) 85%)",
              }}
            />
            {/* The cool cast every Polaroid passes through before the colour comes in */}
            <motion.div
              aria-hidden
              className="absolute inset-0 mix-blend-color"
              style={{ opacity: coolCast, background: "#5f86a6" }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-0 mix-blend-overlay"
              style={{ opacity: grain, backgroundImage: GRAIN }}
            />
            {/* A sheen that slides across once as the image settles */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-[60%] mix-blend-soft-light"
              style={{
                left: sheenX,
                background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.55) 50%, transparent)",
              }}
            />
            <div aria-hidden className="absolute inset-0" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35)" }} />
          </div>

          {/* The caption strip: the thick white bottom of the print */}
          <figcaption className="flex items-center justify-center px-[4%]" style={{ height: `calc(${CARD_W} * 0.24)` }}>
            {photo.caption &&
              (glyphs ? (
                // Fits inside the strip both ways, so a long caption shrinks instead of spilling off the print.
                <svg
                  viewBox={glyphs.viewBox}
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label={photo.caption}
                  className="block h-[56%] w-full overflow-visible"
                  style={{ transform: `rotate(${-tilt * 0.25}deg)` }}
                >
                  {glyphs.paths.map((d, gi) => (
                    <Glyph
                      key={gi}
                      d={d}
                      progress={develop}
                      start={0.62 + (0.32 * gi) / glyphs.paths.length}
                      span={(0.32 / glyphs.paths.length) * 1.4}
                      ink={inkColor}
                    />
                  ))}
                </svg>
              ) : (
                <motion.span
                  className="truncate text-[clamp(16px,1.8vw,22px)] leading-none"
                  style={{ color: inkColor, fontFamily: CSS_FONT[fontName], opacity: captionFade }}
                >
                  {photo.caption}
                </motion.span>
              ))}
          </figcaption>
        </motion.figure>
      </motion.div>
    </div>
  );
}

/** One letter of the caption: the pen traces its outline, then the ink fills in. */
function Glyph({
  d,
  progress,
  start,
  span,
  ink,
}: {
  d: string;
  progress: MotionValue<number>;
  start: number;
  span: number;
  ink: string;
}) {
  const pathLength = useTransform(progress, [start, start + span], [0, 1], { clamp: true });
  const fillOpacity = useTransform(progress, [start + span * 0.6, start + span * 1.3], [0, 0.92], { clamp: true });
  // Hide the zero-length dot a path draws before it has started.
  const opacity = useTransform(pathLength, (v) => (v > 0.002 ? 1 : 0));
  return (
    <motion.path
      d={d}
      fill={ink}
      stroke={ink}
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pathLength, fillOpacity, opacity }}
    />
  );
}

export default PolaroidDevelop;
