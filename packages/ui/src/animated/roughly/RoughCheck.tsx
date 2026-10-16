"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export type CheckMark = "check" | "cross";
export type CheckSide = "left" | "right";

export interface RoughCheckProps {
  children: React.ReactNode;
  /** Mark drawn in the margin: 'check' (✓) or 'cross' (✗) (default: 'check') */
  mark?: CheckMark;
  /** Which margin the mark sits in (default: 'left') */
  side?: CheckSide;
  /** Whether the mark is drawn. Flip it to draw / erase the mark, e.g. for a checklist (default: true) */
  checked?: boolean;
  /** Stroke color (default: emerald for 'check', rose for 'cross') */
  color?: string;
  /** Stroke thickness in pixels (default: 2.5) */
  strokeWidth?: number;
  /** Mark size in pixels (default: ~90% of the first line's height) */
  size?: number;
  /** Space between the mark and the content in pixels (default: 10) */
  gap?: number;
  /** Total drawing animation duration in milliseconds (default: 500) */
  animationDuration?: number;
  /** Whether the mark animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Container HTML element tag (default: 'div', so each line is its own row) */
  as?: "div" | "span" | "li";
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the content */
  textClassName?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Strokes for each mark in a 0–100 box, in drawing order.
 * The tick's long stroke bows a little, the way a wrist flicks it;
 * the cross arms overshoot and lean, like a quick margin mark.
 */
const MARK_STROKES: Record<CheckMark, string[]> = {
  check: ["M 8 54 Q 22 66 37 86 Q 58 44 96 10"],
  cross: ["M 14 12 Q 46 44 88 90", "M 86 10 Q 52 50 12 88"],
};

export function RoughCheck({
  children,
  mark = "check",
  side = "left",
  checked = true,
  color,
  strokeWidth = 2.5,
  size,
  gap = 10,
  animationDuration = 500,
  animate = true,
  animationDelay = 0,
  as: Component = "div",
  className = "",
  textClassName = "",
}: RoughCheckProps) {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [lineHeight, setLineHeight] = useState(24);
  const [inView, setInView] = useState(!animate);

  // Size the mark from the first line so it sits beside it in any font size
  useIsomorphicLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;

    const measure = () => {
      const style = window.getComputedStyle(el);
      const lh = parseFloat(style.lineHeight);
      const fs = parseFloat(style.fontSize) || 16;
      setLineHeight(Number.isFinite(lh) ? lh : fs * 1.2);
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return undefined;
  }, [children]);

  useEffect(() => {
    if (!animate) {
      setInView(true);
      return undefined;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  const markSize = size ?? Math.round(lineHeight * 0.9);
  const strokeColor = color ?? (mark === "check" ? "#10B981" : "#F43F5E");
  const strokes = MARK_STROKES[mark];
  const visible = inView && checked;
  const strokeDuration = animationDuration / 1000 / strokes.length;
  // viewBox is 0–100, so scale the stroke back to real pixels
  const scaledStroke = (strokeWidth * 100) / markSize;

  return (
    <Component
      ref={containerRef as React.Ref<never>}
      className={`relative ${Component === "span" ? "inline-block" : "block"} ${className}`}
      style={side === "left" ? { paddingLeft: markSize + gap } : { paddingRight: markSize + gap }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        fill="none"
        className="absolute pointer-events-none overflow-visible z-20"
        style={{
          width: markSize,
          height: markSize,
          top: (lineHeight - markSize) / 2,
          [side === "left" ? "left" : "right"]: 0,
        }}
      >
        {strokes.map((d, i) => (
          <motion.path
            key={`${mark}-${i}`}
            d={d}
            stroke={strokeColor}
            strokeWidth={scaledStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{
              pathLength: {
                duration: strokeDuration,
                // erase in reverse order, draw in forward order
                delay: visible
                  ? animationDelay / 1000 + i * strokeDuration
                  : (strokes.length - 1 - i) * strokeDuration * 0.5,
                ease: [0.3, 0.1, 0.2, 1],
              },
              opacity: {
                duration: 0.01,
                delay: visible
                  ? animationDelay / 1000 + i * strokeDuration
                  : strokeDuration * strokes.length,
              },
            }}
          />
        ))}
      </svg>
      <span ref={textRef} className={`relative z-10 ${textClassName}`}>
        {children}
      </span>
    </Component>
  );
}
