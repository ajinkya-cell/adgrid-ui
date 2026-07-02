"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TextShuffleVariant } from "./types";
import { splitCharacters } from "./utils/splitCharacters";
import { createCharacterItemVariants, useShuffleVariants } from "./hooks/useShuffleVariants";

/* ── Types ──────────────────────────────────────────────────────── */

interface AnimatedWordProps {
  word: string;
  variant: TextShuffleVariant;
  transitionDuration: number;
  reducedMotion: boolean;
  gradient?: string;
  outline?: boolean;
  letterSpacing?: string;
  lineHeight?: string;
  uppercase?: boolean;
  lowercase?: boolean;
}

/* ── Scramble helper ───────────────────────────────────────────── */

function useScrambleText(target: string, duration: number, reducedMotion: boolean) {
  const [display, setDisplay] = useState(target);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(target);
      return;
    }

    const targetChars = splitCharacters(target);
    let current = targetChars.map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
    setDisplay(current);

    const totalSteps = targetChars.length;
    const lockTimes = targetChars.map((_, i) => {
      const t = (i / Math.max(totalSteps - 1, 1)) * 0.6 + 0.2;
      return t;
    });
    const locks = Array(totalSteps).fill(false);

    let raf: number;
    const start = performance.now();
    const dur = duration;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);

      const out = targetChars.map((c, i) => {
        if (locks[i]) return c;
        if (progress >= lockTimes[i]) {
          locks[i] = true;
          return c;
        }
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");

      setDisplay(out);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reducedMotion]);

  return display;
}

/* ── Component ─────────────────────────────────────────────────── */

export const AnimatedWord = React.memo(function AnimatedWord({
  word,
  variant,
  transitionDuration,
  reducedMotion,
  gradient,
  outline,
  letterSpacing,
  lineHeight,
  uppercase,
  lowercase,
}: AnimatedWordProps) {
  const containerVariants = useShuffleVariants(variant, transitionDuration);
  const itemVariants = createCharacterItemVariants(variant);
  const characters = splitCharacters(word);
  const scrambled = useScrambleText(word, reducedMotion ? 150 : transitionDuration, reducedMotion);

  const textStyle: React.CSSProperties = {
    backgroundImage: gradient,
    WebkitBackgroundClip: gradient ? "text" : undefined,
    WebkitTextFillColor: gradient ? "transparent" : undefined,
    letterSpacing,
    lineHeight,
    textTransform: uppercase ? "uppercase" : lowercase ? "lowercase" : undefined,
  };

  /* outline stroke */
  if (outline) {
    textStyle.WebkitTextStrokeWidth = "1px";
    textStyle.WebkitTextStrokeColor = "currentColor";
    textStyle.WebkitTextFillColor = gradient ? undefined : "transparent";
  }

  /* scramble: matrix-style decode ───────────────────────── */
  if (variant === "scramble") {

    return (
      <motion.span
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={outline ? "text-shuffle-outline" : ""}
        style={textStyle}
      >
        {scrambled.split("").map((char, i) => (
          <span key={i} style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}>
            {char || "\u00A0"}
          </span>
        ))}
      </motion.span>
    );
  }

  /* wave / glitch: per-character motion ─────────────────── */
  if (variant === "wave" || variant === "glitch") {
    return (
      <motion.span
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={outline ? "text-shuffle-outline" : ""}
        style={textStyle}
      >
        {characters.map((char, i) => (
          <motion.span
            key={i}
            variants={itemVariants}
            style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
          >
            {char || "\u00A0"}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  /* elastic / flipIn / blurReveal: whole-word motion ─────── */
  return (
    <motion.span
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={outline ? "text-shuffle-outline" : ""}
      style={{
        ...textStyle,
        display: "inline-block",
        transformStyle: variant === "flipIn" ? "preserve-3d" as React.CSSProperties["transformStyle"] : undefined,
      }}
    >
      {word}
    </motion.span>
  );
});
