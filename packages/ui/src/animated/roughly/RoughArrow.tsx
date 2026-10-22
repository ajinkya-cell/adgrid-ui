"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export type ArrowPlacement =
  | "top"
  | "top-right"
  | "top-left"
  | "bottom"
  | "bottom-right"
  | "bottom-left"
  | "left"
  | "right";

export type ArrowVariant = "curved" | "straight" | "s-curve";

export type ArrowheadStyle = "open" | "filled";

export type ArrowLabelFont = "caveat" | "reenie-beanie" | "kalam";

export type ArrowLabelPlacement = "auto" | "top" | "bottom" | "left" | "right";

export interface RoughArrowProps {
  /** Target element or text to point to (optional; if omitted, renders standalone) */
  children?: React.ReactNode;
  /** Direction from which the arrow points toward the target (default: "top-right") */
  placement?: ArrowPlacement;
  /** Overall scale of the arrow: length, arrowhead and target gap grow together (default: 1) */
  size?: number;
  /** Signed arc bend from -1 to 1. 0 is a straight line, negative bends the other way (default: 0.38) */
  bend?: number;
  /** Curve shape: 'curved' (single arc) | 'straight' | 's-curve' (default: "curved") */
  variant?: ArrowVariant;
  /** Arrowhead style: 'open' (>) or 'filled' (solid triangle) (default: "open") */
  arrowhead?: ArrowheadStyle;
  /** Stroke color (default: "#F59E0B" Cyber Amber) */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Number of pen passes (1 = clean single line, 2 = sketchy double line) (default: 1) */
  iterations?: number;
  /** How much the pen passes drift from the ideal arc. The arc itself never kinks (default: 1) */
  roughness?: number;
  /** Seed for the hand-drawn variation, so several arrows on a page differ (default: derived from placement) */
  seed?: number;
  /** Callout label text placed near the tail of the arrow */
  label?: React.ReactNode;
  /** Callout label font family: 'caveat' | 'reenie-beanie' | 'kalam' (default: "caveat") */
  labelFont?: ArrowLabelFont;
  /** Callout label font size in pixels (default: resolved per font family) */
  labelFontSize?: number;
  /** Callout label font thickness (weight, e.g. 300 to 650) (default: 400) */
  labelFontWeight?: number;
  /** Relative placement of label around arrow tail: 'auto' | 'top' | 'bottom' | 'left' | 'right' (default: "auto") */
  labelPlacement?: ArrowLabelPlacement;
  /** Gap distance in pixels between arrow tail and callout label (default: 8) */
  labelDistance?: number;
  /** Rotation angle in degrees for playful hand-drawn tilt (default: 0) */
  labelRotate?: number;
  /** Optional custom text color for the callout label (defaults to arrow color) */
  labelColor?: string;
  /** Optional custom horizontal offset in pixels for callout label */
  labelOffsetX?: number;
  /** Optional custom vertical offset in pixels for callout label */
  labelOffsetY?: number;
  /** Exact distance in pixels between tail and target; overrides `size` for length (default: 65 × size) */
  distance?: number;
  /** Exact gap in pixels between tip and target edge; overrides `size` for the gap (default: 8 × size) */
  offset?: number;
  /** @deprecated Use `bend`. Arc intensity for curved arrows */
  curvature?: number;
  /** @deprecated Use a negative `bend`. Inverts the arc direction */
  flipCurve?: boolean;
  /** @deprecated No longer used; the arc is always a single smooth curve */
  bowing?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Total drawing animation duration in milliseconds (default: 800) */
  animationDuration?: number;
  /** Delay before drawing animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Additional CSS class names for the wrapping container */
  className?: string;
  /** Additional CSS class names for the inner text / content */
  textClassName?: string;
  /** Additional CSS class names for the callout label */
  labelClassName?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Point {
  x: number;
  y: number;
}

const labelFontClassMap: Record<ArrowLabelFont, string> = {
  caveat: "font-[family-name:var(--font-caveat),cursive] text-lg",
  "reenie-beanie": "font-[family-name:'Reenie_Beanie',cursive] text-2xl tracking-wide",
  kalam: "font-[family-name:'Kalam',cursive] text-lg",
};

const BASE_LENGTH = 65;
const BASE_GAP = 8;
const BARB_ANGLE = 28 * (Math.PI / 180);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Deterministic PRNG so server and client draw the same arrow (no hydration mismatch)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

const fmt = (n: number) => Math.round(n * 100) / 100;

export function RoughArrow({
  children,
  placement = "top-right",
  size = 1,
  bend,
  variant = "curved",
  arrowhead = "open",
  color = "#F59E0B",
  strokeWidth = 2,
  iterations = 1,
  roughness = 1,
  seed,
  label,
  labelFont = "caveat",
  labelFontSize,
  labelFontWeight,
  labelPlacement = "auto",
  labelDistance = 8,
  labelRotate = 0,
  labelColor,
  labelOffsetX = 0,
  labelOffsetY = 0,
  distance,
  offset,
  curvature = 0.38,
  flipCurve = false,
  animate = true,
  animationDuration = 800,
  animationDelay = 0,
  className = "",
  textClassName = "",
  labelClassName = "",
}: RoughArrowProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [inView, setInView] = useState(!animate);

  // Measure container dimensions via ResizeObserver and font loading synchronization
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    measure();

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  // Scroll intersection observer
  useEffect(() => {
    if (!animate) {
      setInView(true);
      return undefined;
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInView(true);
        });
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setInView(true);
            });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  // Resolved geometry coordinates relative to the target container
  const w = dimensions?.width || (children ? 80 : 0);
  const h = dimensions?.height || (children ? 24 : 0);
  const scale = clamp(size, 0.25, 4);
  const D = distance ?? BASE_LENGTH * scale;
  const gap = offset ?? BASE_GAP * scale;

  // One signed bend value; legacy curvature/flipCurve map onto it
  const resolvedBend =
    variant === "straight" ? 0 : clamp(bend ?? (flipCurve ? -curvature : curvature), -1, 1);
  const resolvedSeed = seed ?? hashString(`${placement}|${variant}`);

  const { tail, tip, labelPos, labelTransform } = useMemo(() => {
    let P_tip: Point;
    let P_tail: Point;
    let lblPos: Point;
    let lblTransform = "";

    // 1. Calculate Tip and Tail Coordinates based on Placement
    switch (placement) {
      case "top-right":
      case "top-left":
      case "top": {
        P_tip = {
          x: placement === "top-right" ? w * 0.85 : placement === "top-left" ? w * 0.15 : w * 0.5,
          y: -gap,
        };
        P_tail = {
          x: placement === "top-right" ? w + D * 0.75 : placement === "top-left" ? -D * 0.75 : w * 0.5 + D * 0.35,
          y: -gap - D,
        };
        break;
      }

      case "bottom-right":
      case "bottom-left":
      case "bottom": {
        P_tip = {
          x: placement === "bottom-right" ? w * 0.85 : placement === "bottom-left" ? w * 0.15 : w * 0.5,
          y: h + gap,
        };
        P_tail = {
          x: placement === "bottom-right" ? w + D * 0.75 : placement === "bottom-left" ? -D * 0.75 : w * 0.5 + D * 0.35,
          y: h + gap + D,
        };
        break;
      }

      case "left": {
        P_tip = { x: -gap, y: h * 0.5 };
        P_tail = { x: -gap - D, y: h * 0.5 - D * 0.3 };
        break;
      }

      case "right": {
        P_tip = { x: w + gap, y: h * 0.5 };
        P_tail = { x: w + gap + D, y: h * 0.5 - D * 0.3 };
        break;
      }

      default: {
        P_tip = { x: w * 0.85, y: -gap };
        P_tail = { x: w + D * 0.75, y: -gap - D };
        break;
      }
    }

    // 2. Resolve Directional Placement around Tail
    const effectivePlacement: "top" | "bottom" | "left" | "right" =
      labelPlacement === "auto"
        ? (placement.startsWith("bottom")
            ? "bottom"
            : placement === "left"
            ? "left"
            : placement === "right"
            ? "right"
            : "top")
        : labelPlacement;

    const flipped = resolvedBend < 0;
    const rotStr = labelRotate ? ` rotate(${labelRotate}deg)` : "";

    switch (effectivePlacement) {
      case "top": {
        const topYOffset = labelPlacement === "auto" ? (flipped ? -15 : -labelDistance) : -labelDistance;
        lblPos = { x: P_tail.x + labelOffsetX, y: P_tail.y + topYOffset + labelOffsetY };
        lblTransform = `translate(-50%, -100%)${rotStr}`;
        break;
      }
      case "bottom": {
        const bottomYOffset = labelPlacement === "auto" ? (flipped ? -2 : labelDistance) : labelDistance;
        lblPos = { x: P_tail.x + labelOffsetX, y: P_tail.y + bottomYOffset + labelOffsetY };
        lblTransform = `translate(-50%, 0)${rotStr}`;
        break;
      }
      case "left": {
        const leftYOffset = labelPlacement === "auto" ? (flipped ? -6 : 0) : 0;
        lblPos = { x: P_tail.x - labelDistance + labelOffsetX, y: P_tail.y + leftYOffset + labelOffsetY };
        lblTransform = `translate(-100%, -50%)${rotStr}`;
        break;
      }
      case "right": {
        const rightYOffset = labelPlacement === "auto" ? (flipped ? -6 : 0) : 0;
        lblPos = { x: P_tail.x + labelDistance + labelOffsetX, y: P_tail.y + rightYOffset + labelOffsetY };
        lblTransform = `translate(0, -50%)${rotStr}`;
        break;
      }
    }

    return { tail: P_tail, tip: P_tip, labelPos: lblPos, labelTransform: lblTransform };
  }, [w, h, D, gap, placement, resolvedBend, labelOffsetX, labelOffsetY, labelPlacement, labelDistance, labelRotate]);

  // Build the shaft as true cubic Béziers (never resampled), so the line is always one smooth arc
  const { shaftPaths, headPaths } = useMemo(() => {
    const rand = mulberry32(resolvedSeed);
    const jitter = () => rand() * 2 - 1;

    const isS = variant === "s-curve";

    // Symmetric control points at 1/3 and 2/3 of the chord, pushed out by the same depth, give an
    // even, near-circular arc with no hook. Such a curve can never inflect, so it never kinks.
    const arc = (from: Point, bendRatio: number) => {
      const dx = tip.x - from.x;
      const dy = tip.y - from.y;
      const chord = Math.hypot(dx, dy) || 1;
      // Perpendicular normal; positive bend bows to this side
      const nx = -dy / chord;
      const ny = dx / chord;
      const depth = bendRatio * chord;
      return {
        chord,
        nx,
        ny,
        c1: { x: from.x + dx / 3 + nx * depth, y: from.y + dy / 3 + ny * depth },
        c2: {
          x: from.x + (dx * 2) / 3 + nx * depth * (isS ? -1 : 1),
          y: from.y + (dy * 2) / 3 + ny * depth * (isS ? -1 : 1),
        },
      };
    };
    const toPath = (from: Point, c1: Point, c2: Point) =>
      `M ${fmt(from.x)} ${fmt(from.y)} C ${fmt(c1.x)} ${fmt(c1.y)}, ${fmt(c2.x)} ${fmt(c2.y)}, ${fmt(tip.x)} ${fmt(tip.y)}`;

    // Pass 0 is the clean arc; a tiny per-arrow depth variation keeps it feeling hand-drawn
    const mainBend = resolvedBend * (1 + jitter() * 0.05 * roughness);
    const main = arc(tail, mainBend);
    const chord = main.chord;

    // Exact arrival direction of the curve at the tip: B'(1) ∝ tip − c2
    let tx = tip.x - main.c2.x;
    let ty = tip.y - main.c2.y;
    const tLen = Math.hypot(tx, ty) || 1;
    tx /= tLen;
    ty /= tLen;

    const passes = clamp(Math.round(iterations), 1, 3);
    const amp = roughness * clamp(chord * 0.025, 0.8, 3);
    const shaft: string[] = [toPath(tail, main.c1, main.c2)];

    // Extra passes start from a slightly shifted tail and are rebuilt as their own symmetric arc to
    // the same tip, always bowing to the main arc's side, so they stay single smooth curves.
    const side = mainBend !== 0 ? Math.sign(mainBend) : jitter() < 0 ? -1 : 1;
    for (let i = 1; i < passes; i++) {
      const from = {
        x: tail.x + main.nx * jitter() * amp - main.ny * jitter() * amp * 0.6,
        y: tail.y + main.ny * jitter() * amp + main.nx * jitter() * amp * 0.6,
      };
      const drift = (Math.abs(mainBend) * (1 + jitter() * 0.08) + (Math.abs(jitter()) * amp * 0.5) / chord) * side;
      const pass = arc(from, isS ? mainBend : drift);
      shaft.push(toPath(from, pass.c1, pass.c2));
    }

    // Arrowhead scales with the arrow, never smaller than the stroke can carry
    const headLen = Math.max(clamp(chord * 0.16, 7, 24), strokeWidth * 3.5);
    const theta = Math.atan2(ty, tx);
    const barb = (sign: 1 | -1) => {
      const len = headLen * (1 + jitter() * 0.06 * roughness);
      const ang = BARB_ANGLE + jitter() * 0.03 * roughness;
      return {
        x: tip.x - len * Math.cos(theta + sign * ang),
        y: tip.y - len * Math.sin(theta + sign * ang),
      };
    };

    const head: string[] = [];
    const headPasses = arrowhead === "filled" ? 1 : passes;
    for (let i = 0; i < headPasses; i++) {
      const b1 = barb(-1);
      const b2 = barb(1);
      head.push(
        arrowhead === "filled"
          ? `M ${fmt(tip.x)} ${fmt(tip.y)} L ${fmt(b1.x)} ${fmt(b1.y)} L ${fmt(b2.x)} ${fmt(b2.y)} Z`
          : `M ${fmt(b1.x)} ${fmt(b1.y)} L ${fmt(tip.x)} ${fmt(tip.y)} L ${fmt(b2.x)} ${fmt(b2.y)}`
      );
    }

    return { shaftPaths: shaft, headPaths: head };
  }, [tail, tip, resolvedBend, resolvedSeed, variant, arrowhead, strokeWidth, iterations, roughness]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block overflow-visible ${className}`}
    >
      {/* ── RoughArrow SVG Layer ────────────────────────────────────── */}
      <svg
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-20"
      >
        {/* Shaft / Stem */}
        {shaftPaths.map((d, idx) => (
          <motion.path
            key={`shaft-${idx}`}
            d={d}
            stroke={color}
            strokeWidth={idx === 0 ? strokeWidth : strokeWidth * 0.85}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{
              duration: (animationDuration * 0.65) / 1000,
              delay: animationDelay / 1000,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        ))}

        {/* Arrowhead */}
        {headPaths.map((d, idx) => (
          <motion.path
            key={`head-${idx}`}
            d={d}
            stroke={color}
            strokeWidth={idx === 0 ? strokeWidth : strokeWidth * 0.85}
            fill={arrowhead === "filled" ? color : "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: inView ? 1 : 0,
              opacity: inView ? 1 : 0,
            }}
            transition={{
              duration: (animationDuration * 0.35) / 1000,
              delay: (animationDelay + animationDuration * 0.55) / 1000,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        ))}
      </svg>

      {/* ── Handwritten Callout Label (Straight at Tail) ───────────── */}
      {label && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{
            opacity: inView ? 1 : 0,
            scale: inView ? 1 : 0.9,
            y: inView ? 0 : 4,
          }}
          transition={{
            duration: 0.35,
            delay: (animationDelay + animationDuration * 0.7) / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`absolute pointer-events-none whitespace-nowrap select-none ${labelFontClassMap[labelFont] || labelFontClassMap.caveat} leading-none z-30 ${labelClassName}`}
          style={{
            left: labelPos.x,
            top: labelPos.y,
            transform: labelTransform,
            transformOrigin: "center center",
            color: labelColor || color,
            fontSize: labelFontSize ? `${labelFontSize}px` : undefined,
            fontWeight: labelFontWeight || undefined,
          }}
        >
          {label}
        </motion.span>
      )}

      {/* ── Target Content ───────────────────────────────────────────── */}
      {children && (
        <span className={`relative z-10 ${textClassName}`}>{children}</span>
      )}
    </span>
  );
}
