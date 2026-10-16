"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ArrowLabelFont, ArrowPlacement } from "./RoughArrow";

export type StickyPlacement = ArrowPlacement;
export type StickyPin = "tape" | "pin" | "none";
export type StickyFont = ArrowLabelFont;

export interface RoughStickyProps {
  /** Element the note is pinned next to (optional; without it the note renders on its own) */
  children?: React.ReactNode;
  /** Handwritten text on the note */
  note: React.ReactNode;
  /** Where the note sits relative to the target (default: "top-right") */
  placement?: StickyPlacement;
  /** How the note is attached: 'tape' strip, push 'pin', or 'none' (default: "tape") */
  pin?: StickyPin;
  /** Paper color (default: "#FDE68A" sticky yellow) */
  paper?: string;
  /** Ink color for the handwritten text (default: "#3B2A14") */
  color?: string;
  /** Handwriting font: 'caveat' | 'reenie-beanie' | 'kalam' (default: "caveat") */
  font?: StickyFont;
  /** Font size in pixels (default: 20) */
  fontSize?: number;
  /** Tilt in degrees; negative leans left (default: -4, mirrored for left-side placements) */
  rotate?: number;
  /** Note width in pixels (default: 150) */
  width?: number;
  /** Gap between note and target in pixels; negative overlaps the target (default: 6) */
  offset?: number;
  /** Whether the note slaps on when scrolled into view (default: true) */
  animate?: boolean;
  /** Duration of the slap-on animation in milliseconds (default: 550) */
  animationDuration?: number;
  /** Delay before the note appears in milliseconds (default: 0) */
  animationDelay?: number;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the target content */
  textClassName?: string;
  /** Additional CSS class names for the note itself */
  noteClassName?: string;
}

const fontClassMap: Record<StickyFont, string> = {
  caveat: "font-[family-name:var(--font-caveat),cursive]",
  "reenie-beanie": "font-[family-name:'Reenie_Beanie',cursive] tracking-wide",
  kalam: "font-[family-name:'Kalam',cursive]",
};

/** Anchor the note's outer box around the target; the tilt lives on the inner box. */
function placementStyle(placement: StickyPlacement, offset: number): React.CSSProperties {
  const out = `calc(100% + ${offset}px)`;
  switch (placement) {
    case "top":
      return { bottom: out, left: "50%", transform: "translateX(-50%)" };
    case "bottom":
      return { top: out, left: "50%", transform: "translateX(-50%)" };
    case "left":
      return { right: out, top: "50%", transform: "translateY(-50%)" };
    case "right":
      return { left: out, top: "50%", transform: "translateY(-50%)" };
    case "top-left":
      return { bottom: out, right: out };
    case "bottom-left":
      return { top: out, right: out };
    case "bottom-right":
      return { top: out, left: out };
    case "top-right":
    default:
      return { bottom: out, left: out };
  }
}

export function RoughSticky({
  children,
  note,
  placement = "top-right",
  pin = "tape",
  paper = "#FDE68A",
  color = "#3B2A14",
  font = "caveat",
  fontSize = 20,
  rotate,
  width = 150,
  offset = 6,
  animate = true,
  animationDuration = 550,
  animationDelay = 0,
  className = "",
  textClassName = "",
  noteClassName = "",
}: RoughStickyProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(!animate);

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

  // Notes on the left lean the other way so they tilt toward the target
  const leansLeft = placement === "left" || placement === "top-left" || placement === "bottom-left";
  const tilt = rotate ?? (leansLeft ? 4 : -4);

  const noteEl = (
    <motion.span
      className={`relative block select-none leading-tight ${fontClassMap[font] || fontClassMap.caveat} ${noteClassName}`}
      style={{
        width,
        padding: "18px 14px 16px",
        backgroundColor: paper,
        // a soft fold of light across the paper and a curl shadow under the bottom edge
        backgroundImage:
          "linear-gradient(170deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0.05) 100%)",
        boxShadow:
          "0 1px 1px rgba(0,0,0,0.12), 0 10px 14px -8px rgba(0,0,0,0.45), inset 0 -10px 14px -12px rgba(0,0,0,0.25)",
        borderRadius: "2px 2px 6px 3px / 2px 2px 14px 3px",
        color,
        fontSize,
        transformOrigin: pin === "pin" ? "50% 8px" : "50% 0%",
      }}
      initial={animate ? { opacity: 0, scale: 1.18, rotate: tilt * 2.5, y: -10 } : false}
      animate={
        inView
          ? { opacity: 1, scale: 1, rotate: tilt, y: 0 }
          : { opacity: 0, scale: 1.18, rotate: tilt * 2.5, y: -10 }
      }
      transition={{
        type: "spring",
        bounce: 0.45,
        duration: animationDuration / 1000,
        delay: animationDelay / 1000,
        opacity: { duration: 0.12, delay: animationDelay / 1000 },
      }}
    >
      {pin === "tape" && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 -top-2.5 h-5 w-14"
          style={{
            transform: "translateX(-50%) rotate(-3deg)",
            backgroundColor: "rgba(255,255,255,0.5)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
            // torn ends on the tape strip
            clipPath:
              "polygon(3% 0, 97% 4%, 100% 30%, 96% 55%, 100% 82%, 97% 100%, 2% 96%, 0 70%, 4% 45%, 0 18%)",
          }}
        />
      )}
      {pin === "pin" && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #fca5a5 0%, #ef4444 45%, #991b1b 100%)",
            boxShadow: "0 2px 3px rgba(0,0,0,0.4)",
          }}
        />
      )}
      <span className="relative block">{note}</span>
    </motion.span>
  );

  if (!children) {
    return (
      <span ref={containerRef} className={`relative inline-block ${className}`}>
        {noteEl}
      </span>
    );
  }

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      <span className={`relative z-10 ${textClassName}`}>{children}</span>
      <span
        className="absolute z-30 pointer-events-none"
        style={placementStyle(placement, offset)}
      >
        {noteEl}
      </span>
    </span>
  );
}
