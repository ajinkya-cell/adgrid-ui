"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import rough from "roughjs";

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
  /** Curve trajectory variation: 'curved' | 'straight' | 's-curve' (default: "curved") */
  variant?: ArrowVariant;
  /** Arrowhead style: 'open' (>) or 'filled' (solid triangle) (default: "open") */
  arrowhead?: ArrowheadStyle;
  /** Stroke color (default: "#F59E0B" Cyber Amber) */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Number of sketch passes (1 = single line, 2 = authentic double sketch loops) (default: 2) */
  iterations?: number;
  /** Hand-drawn sketch roughness (default: 1.2) */
  roughness?: number;
  /** Hand-drawn line bowing curvature (default: 1.5) */
  bowing?: number;
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
  /** Distance in pixels between arrow tail origin and target (default: 60) */
  distance?: number;
  /** Gap in pixels between arrow tip and target edge (default: 8) */
  offset?: number;
  /** Arc curvature intensity factor for curved arrows (default: 0.38) */
  curvature?: number;
  /** Invert the curvature direction of the arc (default: false) */
  flipCurve?: boolean;
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

export function RoughArrow({
  children,
  placement = "top-right",
  variant = "curved",
  arrowhead = "open",
  color = "#F59E0B",
  strokeWidth = 2,
  iterations = 2,
  roughness = 1.2,
  bowing = 1.5,
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
  distance = 60,
  offset = 8,
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
  const D = distance;
  const gap = offset;

  const { tip, ctrlPoints, tipTangent, labelPos, labelTransform } = useMemo(() => {
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

    const rotStr = labelRotate ? ` rotate(${labelRotate}deg)` : "";

    switch (effectivePlacement) {
      case "top": {
        const topYOffset = labelPlacement === "auto" ? (flipCurve ? -15 : -labelDistance) : -labelDistance;
        lblPos = { x: P_tail.x + labelOffsetX, y: P_tail.y + topYOffset + labelOffsetY };
        lblTransform = `translate(-50%, -100%)${rotStr}`;
        break;
      }
      case "bottom": {
        const bottomYOffset = labelPlacement === "auto" ? (flipCurve ? -2 : labelDistance) : labelDistance;
        lblPos = { x: P_tail.x + labelOffsetX, y: P_tail.y + bottomYOffset + labelOffsetY };
        lblTransform = `translate(-50%, 0)${rotStr}`;
        break;
      }
      case "left": {
        const leftYOffset = labelPlacement === "auto" ? (flipCurve ? -6 : 0) : 0;
        lblPos = { x: P_tail.x - labelDistance + labelOffsetX, y: P_tail.y + leftYOffset + labelOffsetY };
        lblTransform = `translate(-100%, -50%)${rotStr}`;
        break;
      }
      case "right": {
        const rightYOffset = labelPlacement === "auto" ? (flipCurve ? -6 : 0) : 0;
        lblPos = { x: P_tail.x + labelDistance + labelOffsetX, y: P_tail.y + rightYOffset + labelOffsetY };
        lblTransform = `translate(0, -50%)${rotStr}`;
        break;
      }
    }

    // 2. Vector math for curve generation
    const dx = P_tip.x - P_tail.x;
    const dy = P_tip.y - P_tail.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    // Perpendicular normal vector
    const normalSign = flipCurve ? -1 : 1;
    const nx = -uy * normalSign;
    const ny = ux * normalSign;
    const bowDepth = dist * curvature;

    let points: [number, number][];
    let tipTangent: { x: number; y: number };

    switch (variant) {
      case "straight":
        points = [
          [P_tail.x, P_tail.y],
          [P_tip.x, P_tip.y],
        ];
        tipTangent = { x: dx, y: dy };
        break;

      case "curved": {
        // Cubic Bézier curve with organic hand-drawn sweep matching Layer 3.png
        // C1 departs gracefully with outward deflection, C2 curls inward toward target
        const c1X = P_tail.x + dx * 0.35 + nx * (bowDepth * 1.05);
        const c1Y = P_tail.y + dy * 0.35 + ny * (bowDepth * 1.05);
        const c2X = P_tail.x + dx * 0.75 + nx * (bowDepth * 0.88);
        const c2Y = P_tail.y + dy * 0.75 + ny * (bowDepth * 0.88);

        // Sample 6 points along the cubic Bézier curve for seamless rough.js spline
        const sampled: [number, number][] = [];
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const mt = 1 - t;
          const b0 = mt * mt * mt;
          const b1 = 3 * mt * mt * t;
          const b2 = 3 * mt * t * t;
          const b3 = t * t * t;
          sampled.push([
            b0 * P_tail.x + b1 * c1X + b2 * c2X + b3 * P_tip.x,
            b0 * P_tail.y + b1 * c1Y + b2 * c2Y + b3 * P_tip.y,
          ]);
        }
        points = sampled;
        // Exact analytical arrival tangent: B'(1) = 3 * (P_tip - C2)
        tipTangent = {
          x: P_tip.x - c2X,
          y: P_tip.y - c2Y,
        };
        break;
      }

      case "s-curve": {
        // S-curve with smooth inflection
        const c1X = P_tail.x + dx * 0.3 + nx * (bowDepth * 0.85);
        const c1Y = P_tail.y + dy * 0.3 + ny * (bowDepth * 0.85);
        const c2X = P_tail.x + dx * 0.7 - nx * (bowDepth * 0.85);
        const c2Y = P_tail.y + dy * 0.7 - ny * (bowDepth * 0.85);

        const sampled: [number, number][] = [];
        const steps = 6;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const mt = 1 - t;
          const b0 = mt * mt * mt;
          const b1 = 3 * mt * mt * t;
          const b2 = 3 * mt * t * t;
          const b3 = t * t * t;
          sampled.push([
            b0 * P_tail.x + b1 * c1X + b2 * c2X + b3 * P_tip.x,
            b0 * P_tail.y + b1 * c1Y + b2 * c2Y + b3 * P_tip.y,
          ]);
        }
        points = sampled;
        tipTangent = {
          x: P_tip.x - c2X,
          y: P_tip.y - c2Y,
        };
        break;
      }

      default:
        points = [
          [P_tail.x, P_tail.y],
          [P_tip.x, P_tip.y],
        ];
        tipTangent = { x: dx, y: dy };
        break;
    }

    return {
      tail: P_tail,
      tip: P_tip,
      ctrlPoints: points,
      tipTangent,
      labelPos: lblPos,
      labelTransform: lblTransform,
    };
  }, [
    w,
    h,
    D,
    gap,
    placement,
    variant,
    flipCurve,
    curvature,
    labelOffsetX,
    labelOffsetY,
    labelPlacement,
    labelDistance,
    labelRotate,
  ]);

  // Generate rough.js SVG paths for shaft and arrowhead
  const { shaftPaths, headPaths } = useMemo(() => {
    const gen = rough.generator();

    const disableMultiStroke = iterations === 1;

    // 1. Shaft Path
    let shaftDrawable;
    if (variant === "straight") {
      shaftDrawable = gen.line(
        ctrlPoints[0][0],
        ctrlPoints[0][1],
        ctrlPoints[ctrlPoints.length - 1][0],
        ctrlPoints[ctrlPoints.length - 1][1],
        {
          roughness,
          bowing,
          stroke: color,
          strokeWidth,
          disableMultiStroke,
        }
      );
    } else {
      shaftDrawable = gen.curve(ctrlPoints, {
        roughness,
        bowing,
        stroke: color,
        strokeWidth,
        disableMultiStroke,
      });
    }
    const sPaths = gen.toPaths(shaftDrawable);

    // 2. Arrowhead Tangent and Barb Generation
    const endX = tip.x;
    const endY = tip.y;
    const theta = Math.atan2(tipTangent.y, tipTangent.x);

    // Proportional barb length and angle matching authentic hand-drawn markers
    const barbLen = Math.max(13, strokeWidth * 5.2);
    const alpha = 28 * (Math.PI / 180);

    const b1 = {
      x: endX - barbLen * Math.cos(theta - alpha),
      y: endY - barbLen * Math.sin(theta - alpha),
    };
    const b2 = {
      x: endX - barbLen * Math.cos(theta + alpha),
      y: endY - barbLen * Math.sin(theta + alpha),
    };

    let hPaths: ReturnType<typeof gen.toPaths> = [];

    if (arrowhead === "filled") {
      const poly = gen.polygon(
        [
          [endX, endY],
          [b1.x, b1.y],
          [b2.x, b2.y],
        ],
        {
          fill: color,
          fillStyle: "solid",
          roughness: Math.max(0.6, roughness * 0.7),
          stroke: color,
          strokeWidth,
          disableMultiStroke,
        }
      );
      hPaths = gen.toPaths(poly);
    } else {
      // Open barbs
      const l1 = gen.line(endX, endY, b1.x, b1.y, {
        roughness: Math.max(0.5, roughness * 0.6),
        stroke: color,
        strokeWidth,
        disableMultiStroke,
      });
      const l2 = gen.line(endX, endY, b2.x, b2.y, {
        roughness: Math.max(0.5, roughness * 0.6),
        stroke: color,
        strokeWidth,
        disableMultiStroke,
      });
      hPaths = [...gen.toPaths(l1), ...gen.toPaths(l2)];
    }

    return { shaftPaths: sPaths, headPaths: hPaths };
  }, [ctrlPoints, tip, tipTangent, variant, arrowhead, color, strokeWidth, iterations, roughness, bowing]);

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
        {shaftPaths.map((p, idx) => (
          <motion.path
            key={`shaft-${idx}`}
            d={p.d}
            stroke={p.stroke || color}
            strokeWidth={p.strokeWidth || strokeWidth}
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
        {headPaths.map((p, idx) => (
          <motion.path
            key={`head-${idx}`}
            d={p.d}
            stroke={p.stroke || color}
            strokeWidth={p.strokeWidth || strokeWidth}
            fill={
              p.fill && p.fill !== "none"
                ? p.fill
                : arrowhead === "filled"
                ? color
                : "none"
            }
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
