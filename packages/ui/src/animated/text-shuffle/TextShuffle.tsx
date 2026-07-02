"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import { TextShuffleProps, TextShuffleRef } from "./types";
import { useShuffleCycle } from "./hooks/useShuffleCycle";
import { AnimatedWord } from "./AnimatedWord";
import { DEFAULT_DURATION, DEFAULT_TRANSITION } from "./utils/timing";

/* ── Component ─────────────────────────────────────────────────── */

export const TextShuffle = forwardRef<TextShuffleRef, TextShuffleProps>(
  function TextShuffle(
    {
      words,
      duration = DEFAULT_DURATION,
      transition = DEFAULT_TRANSITION,
      loop = true,
      variant = "scramble",
      fontSize,
      fontWeight,
      align = "center",
      className,
      onWordChange,
      pauseOnHover = false,
      cursorBlink = false,
      gradient,
      outline,
      letterSpacing,
      lineHeight,
      uppercase,
      lowercase,
      style,
    },
    ref
  ) {
    /* cycle control */
    const {
      currentIndex,
      next,
      previous,
      goTo,
      play,
      pause,
    } = useShuffleCycle({
      words,
      duration,
      loop,
      onWordChange,
    });

    /* reduced motion */
    const [reducedMotion, setReducedMotion] = useState(false);
    React.useEffect(() => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mql.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }, []);

    /* imperatives */
    useImperativeHandle(ref, () => ({
      next,
      previous,
      goTo,
      play,
      pause,
    }));

    /* current word */
    const currentWord = words[currentIndex] ?? "";

    /* computed wrapper style */
    const wrapperStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: align,
      fontSize,
      fontWeight,
      textAlign: align,
      ...style,
    };

    const handleMouseEnter = () => {
      if (pauseOnHover) pause();
    };

    const handleMouseLeave = () => {
      if (pauseOnHover) play();
    };

    return (
      <span
        className={className}
        style={wrapperStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`Animated text showing ${currentWord}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: align,
          }}
        >
          <AnimatePresence mode="wait">
            <AnimatedWord
              key={currentIndex}
              word={currentWord}
              variant={variant}
              transitionDuration={reducedMotion ? 150 : transition}
              reducedMotion={reducedMotion}
              gradient={gradient}
              outline={outline}
              letterSpacing={letterSpacing}
              lineHeight={lineHeight}
              uppercase={uppercase}
              lowercase={lowercase}
            />
          </AnimatePresence>
        </span>

        {cursorBlink && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "0.6em",
              height: "1em",
              marginLeft: "0.15em",
              backgroundColor: "currentColor",
              verticalAlign: "middle",
              animation: "text-shuffle-blink 1s step-end infinite",
            }}
          >
            <style>{`
              @keyframes text-shuffle-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
            `}</style>
          </span>
        )}
      </span>
    );
  }
);

export default TextShuffle;
