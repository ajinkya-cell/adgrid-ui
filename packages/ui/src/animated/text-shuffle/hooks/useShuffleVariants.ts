import { useMemo } from "react";
import { Variants } from "framer-motion";
import { TextShuffleVariant } from "../types";
import {
  SPRING_CONFIG,
  ELASTIC_SPRING,
  FLIP_TRANSITION,
  SNAPPY_SPRING,
} from "../utils/timing";

/* ── Container-level variant factories ────────────────────────────── */

function createScrambleContainerVariants(transitionDuration: number): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.05 },
    },
    exit: {
      opacity: 0,
      transition: { duration: Math.max(0.15, transitionDuration / 1000 / 3) },
    },
  };
}

function createWaveAndGlitchContainerVariants(transitionDuration: number): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: Math.min(0.05, transitionDuration / 1000 / 20),
        delayChildren: 0.03,
      },
    },
    exit: {
      transition: {
        staggerChildren: Math.min(0.03, transitionDuration / 1000 / 15),
        staggerDirection: -1,
        delayChildren: 0,
      },
    },
  };
}

function createElasticVariants(transitionDuration: number): Variants {
  return {
    initial: { opacity: 0, scale: 0.5, y: 30 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { ...ELASTIC_SPRING, duration: transitionDuration / 1000 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: { duration: (transitionDuration / 1000) * 0.5 },
    },
  };
}

function createFlipInVariants(transitionDuration: number): Variants {
  return {
    initial: { opacity: 0, rotateX: -90, transformPerspective: 800 },
    animate: {
      opacity: 1,
      rotateX: 0,
      transition: { ...FLIP_TRANSITION, duration: transitionDuration / 1000 },
    },
    exit: {
      opacity: 0,
      rotateX: 90,
      transition: { duration: (transitionDuration / 1000) * 0.5 },
    },
  };
}

function createBlurRevealVariants(transitionDuration: number): Variants {
  return {
    initial: { opacity: 0, scale: 1.1, filter: "blur(12px)" },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { ...SPRING_CONFIG, duration: transitionDuration / 1000 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(8px)",
      transition: { duration: (transitionDuration / 1000) * 0.5 },
    },
  };
}

/* ── Character-item variant factories ───────────────────────────── */

export function createCharacterItemVariants(variant: TextShuffleVariant): Variants {
  switch (variant) {
    case "wave":
      return {
        initial: { opacity: 0, y: 20, scale: 0.8 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { ...SPRING_CONFIG, duration: 0.4 },
        },
        exit: {
          opacity: 0,
          y: -15,
          scale: 0.9,
          transition: { ...SNAPPY_SPRING, duration: 0.25 },
        },
      };
    case "glitch":
      return {
        initial: { opacity: 0, x: -4, skewX: "12deg" },
        animate: {
          opacity: 1,
          x: 0,
          skewX: "0deg",
          transition: { duration: 0.15, type: "spring", stiffness: 400, damping: 25 },
        },
        exit: {
          opacity: 0,
          x: 4,
          skewX: "-12deg",
          transition: { duration: 0.1 },
        },
      };
    default:
      return {
        initial: { opacity: 0, y: 10 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { ...SPRING_CONFIG, duration: 0.3 },
        },
        exit: {
          opacity: 0,
          y: -10,
          transition: { duration: 0.2 },
        },
      };
  }
}

/* ── Hook ────────────────────────────────────────────────────────── */

export function useShuffleVariants(
  variant: TextShuffleVariant,
  transitionDuration: number
): Variants {
  return useMemo(() => {
    switch (variant) {
      case "wave":
      case "glitch":
        return createWaveAndGlitchContainerVariants(transitionDuration);
      case "scramble":
        return createScrambleContainerVariants(transitionDuration);
      case "elastic":
        return createElasticVariants(transitionDuration);
      case "flipIn":
        return createFlipInVariants(transitionDuration);
      case "blurReveal":
      default:
        return createBlurRevealVariants(transitionDuration);
    }
  }, [variant, transitionDuration]);
}
