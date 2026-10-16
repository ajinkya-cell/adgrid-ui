"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface MeadowHeroProps {
  /** The giant word that rises from behind the grass, letter by letter */
  word?: string;
  /** Small line above the word, set in italic serif */
  headline?: string;
  /** One quiet sentence under the headline (empty hides it) */
  description?: string;
  /** Pill button in the top-right corner (empty hides it) */
  ctaLabel?: string;
  /** Wordmark in the top-left corner */
  brand?: string;
  /** Background layer: sky and distant hills, sits behind the word */
  skySrc?: string;
  /** Foreground layer: transparent PNG/WebP of the grass, sits in front of the word */
  grassSrc?: string;
  /** How much of each letter hides behind the grass, from 0 (sitting on top) to 1 (fully hidden) */
  tuck?: number;
  /** Shift the word sideways, as a % of the width (positive moves it right) */
  offsetX?: number;
  /** Colour of the giant word */
  wordColor?: string;
  /** Seconds between letters as they rise */
  letterStagger?: number;
  /** Strongest blur at the top of the sky, in px (0 turns it off) */
  topBlur?: number;
  /** Optional container class name override */
  className?: string;
}

const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { y: 10, opacity: 0, filter: "blur(6px)" },
  visible: (delay: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { delay, duration: 0.9, ease: EASE_OUT },
  }),
};

/**
 * MeadowHero
 * Sky, a giant word, then grass in front of it: the word rises letter by letter from just
 * behind the meadow. The top of the sky gets a soft progressive blur.
 */
export function MeadowHero({
  word = "meadow",
  headline = "A quiet place for a loud internet.",
  description = "Save what's worth reading. Come back when the day slows down.",
  ctaLabel = "Join the waitlist",
  brand = "Meadow",
  skySrc = "/meadow/sky.webp",
  grassSrc = "/meadow/grass.webp",
  tuck = 0.7,
  offsetX = 5,
  wordColor = "#ffffff",
  letterStagger = 0.16,
  topBlur = 18,
  className = "",
}: MeadowHeroProps) {
  const reduceMotion = useReducedMotion();
  const [skyReady, setSkyReady] = useState(false);
  const [grassReady, setGrassReady] = useState(false);
  const ready = skyReady && grassReady;
  const skyRef = useRef<HTMLImageElement>(null);
  const grassRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Cached images can finish before hydration, so onLoad never fires.
    // Catch that here, and never leave the hero blank on a slow network.
    if (skyRef.current?.complete) setSkyReady(true);
    if (grassRef.current?.complete) setGrassReady(true);
    const fallback = window.setTimeout(() => {
      setSkyReady(true);
      setGrassReady(true);
    }, 2500);
    return () => window.clearTimeout(fallback);
  }, []);

  const letters = Array.from(word);
  const wordStart = 0.5;
  const copyStart = wordStart + letters.length * letterStagger + 0.2;
  const state = ready ? "visible" : "hidden";

  // Each letter starts fully hidden below the grass line and grows up out of it,
  // one after another. The grass in front does the hiding, so no fade is needed.
  const letterVariants: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: (i: number) => ({ opacity: 1, transition: { delay: 0.2 + i * 0.05, duration: 0.5 } }),
      }
    : {
        hidden: { y: "105%" },
        visible: (i: number) => ({
          y: "0%",
          transition: { delay: wordStart + i * letterStagger, duration: 1.2, ease: EASE_OUT },
        }),
      };

  // Stacked backdrop blurs, each masked a little further down, make a smooth
  // progressive blur that is strongest at the very top of the sky.
  const blurSteps =
    topBlur > 0
      ? [
          { blur: topBlur * 0.15, stop: 75 },
          { blur: topBlur * 0.4, stop: 55 },
          { blur: topBlur, stop: 32 },
        ]
      : [];

  return (
    <div
      className={`relative isolate h-svh min-h-[560px] w-full overflow-hidden bg-[#cfe6fb] ${className}`}
      style={{ fontFamily: SANS }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,0..100;1,9..144,300..700,0..100&family=Inter:wght@400;500&display=swap');`}</style>

      {/* Sky */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06, opacity: 0 }}
        animate={skyReady ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 2.4, ease: EASE_OUT }}
      >
        <img
          ref={skyRef}
          src={skySrc}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          onLoad={() => setSkyReady(true)}
          onError={() => setSkyReady(true)}
        />
      </motion.div>

      {/* Soft blur and haze across the top of the sky */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2">
        {blurSteps.map(({ blur, stop }) => {
          const mask = `linear-gradient(to bottom, black 0%, black ${stop - 25}%, transparent ${stop}%)`;
          return (
            <div
              key={stop}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/15 to-transparent" />
      </div>

      {/* Word, then grass in front of it. Both live in one box so the word's
          baseline is measured against the grass edge at every screen size. On narrow
          screens the height is capped so the grass isn't blown up past the word. */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "max(19.5vw, min(56svh, 66vw))" }}>
        {/* Hidden until the grass is fully in front of it, so nothing shows before it can tuck behind. */}
        <motion.h1
          key={word}
          aria-label={word}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: ready ? 0.45 : 0, duration: 0 }}
          className="absolute m-0 flex select-none justify-center whitespace-nowrap leading-[0.8]"
          style={{
            // Capped by the free space beside the word (~3.6em wide) so it never runs off screen.
            left: `clamp((3.6em - 100%) / 2, ${offsetX}%, (100% - 3.6em) / 2)`,
            right: `calc(-1 * clamp((3.6em - 100%) / 2, ${offsetX}%, (100% - 3.6em) / 2))`,
            // The grass edge sits ~85% up its layer; drop the baseline below it by
            // a share of the x-height (~0.5em) so the tuck looks the same at any size.
            bottom: `calc(85% - ${tuck * 0.5}em)`,
            color: wordColor,
            fontFamily: SERIF,
            fontWeight: 600,
            fontVariationSettings: "'SOFT' 100, 'opsz' 144",
            fontSize: "clamp(4.5rem, min(22vw + 1.5rem, 44svh), 26rem)",
            letterSpacing: "-0.045em",
            textShadow: "0 12px 50px rgba(60, 110, 170, 0.16)",
          }}
        >
          {letters.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              aria-hidden
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate={state}
              className="inline-block will-change-transform"
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.img
          ref={grassRef}
          src={grassSrc}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
          initial={{ opacity: 0 }}
          animate={grassReady ? { opacity: 1 } : undefined}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onLoad={() => setGrassReady(true)}
          onError={() => setGrassReady(true)}
        />
      </div>

      {/* Top bar */}
      <motion.header
        custom={copyStart + 0.4}
        variants={fadeUp}
        initial="hidden"
        animate={state}
        className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8"
      >
        <span
          className="text-[1.35rem] text-slate-900"
          style={{ fontFamily: SERIF, fontWeight: 500, fontVariationSettings: "'SOFT' 100, 'opsz' 48", letterSpacing: "-0.02em" }}
        >
          {brand}
        </span>
        {ctaLabel && (
          <a
            href="#"
            className="rounded-full bg-slate-900/85 px-4 py-2 text-[13px] font-medium text-white no-underline backdrop-blur-md transition-colors hover:bg-slate-900"
          >
            {ctaLabel}
          </a>
        )}
      </motion.header>

      {/* Headline */}
      <div className="relative z-10 mx-auto mt-[9svh] max-w-2xl px-6 text-center">
        {headline && (
          <motion.h2
            custom={copyStart}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="m-0 text-balance text-[1.9rem] leading-[1.1] text-slate-900 sm:text-[2.6rem]"
            style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontVariationSettings: "'SOFT' 100, 'opsz' 72", letterSpacing: "-0.02em" }}
          >
            {headline}
          </motion.h2>
        )}
        {description && (
          <motion.p
            custom={copyStart + 0.15}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="mx-auto mt-4 max-w-md text-balance text-[15px] leading-relaxed text-slate-600"
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default MeadowHero;
