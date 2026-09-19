"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export type BracketSide = "left" | "right" | "top" | "bottom" | "both";
export type BracketStyle = "curly" | "square";

export interface RoughBracketProps {
  children: React.ReactNode;
  /** Bracket placement side: 'left' | 'right' | 'top' | 'bottom' | 'both' (default: 'left') */
  side?: BracketSide;
  /** Alias for side prop to maintain backward compatibility */
  brackets?: BracketSide;
  /** Bracket style: 'curly' ({ }) or 'square' ([ ]) (default: 'curly') */
  bracketStyle?: BracketStyle;
  /** Stroke color (default: "#F59E0B" Cyber Amber) */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Drawing animation duration in milliseconds (default: 750) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Gap / clearance between bracket and multiline text in px (default: 10) */
  bracketPadding?: number;
  /** Container HTML element tag: 'div' or 'span' (default: 'div' for multiline blocks) */
  as?: "div" | "span";
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text / content */
  textClassName?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Builds an authentic, single-stroke continuous path for a vertical bracket (left or right side).
 * Dynamically scales the straight stems to any multiline height while preserving exact curve radii.
 */
function buildVerticalPath(
  side: "left" | "right",
  style: BracketStyle,
  height: number
): string {
  const H = Math.max(height, 24);
  const padY = Math.min(4, H * 0.04);
  const yStart = padY;
  const yEnd = H - padY;
  const yMid = (yStart + yEnd) / 2;
  const span = yEnd - yStart;

  if (style === "curly") {
    // Radius of top/bottom hooks and center cusp
    const r = Math.max(3.5, Math.min(7, (yMid - yStart) * 0.28));

    if (side === "left") {
      const hookX = 14; // near text
      const spineX = 8; // vertical spine
      const tipX = 2; // outward pointing cusp
      const dx1 = (hookX - spineX) * 0.3;
      const dx2 = (spineX - tipX) * 0.3;

      return [
        `M ${hookX} ${yStart.toFixed(1)}`,
        `C ${(hookX - dx1).toFixed(1)} ${yStart.toFixed(1)}, ${spineX} ${(yStart + r * 0.45).toFixed(1)}, ${spineX} ${(yStart + r).toFixed(1)}`,
        `L ${spineX} ${(yMid - r).toFixed(1)}`,
        `C ${spineX} ${(yMid - r * 0.45).toFixed(1)}, ${(tipX + dx2).toFixed(1)} ${yMid.toFixed(1)}, ${tipX} ${yMid.toFixed(1)}`,
        `C ${(tipX + dx2).toFixed(1)} ${yMid.toFixed(1)}, ${spineX} ${(yMid + r * 0.45).toFixed(1)}, ${spineX} ${(yMid + r).toFixed(1)}`,
        `L ${spineX} ${(yEnd - r).toFixed(1)}`,
        `C ${spineX} ${(yEnd - r * 0.45).toFixed(1)}, ${(hookX - dx1).toFixed(1)} ${yEnd.toFixed(1)}, ${hookX} ${yEnd.toFixed(1)}`,
      ].join(" ");
    } else {
      // Right side curly
      const hookX = 2; // near text
      const spineX = 8; // vertical spine
      const tipX = 14; // outward pointing cusp
      const dx1 = (spineX - hookX) * 0.3;
      const dx2 = (tipX - spineX) * 0.3;

      return [
        `M ${hookX} ${yStart.toFixed(1)}`,
        `C ${(hookX + dx1).toFixed(1)} ${yStart.toFixed(1)}, ${spineX} ${(yStart + r * 0.45).toFixed(1)}, ${spineX} ${(yStart + r).toFixed(1)}`,
        `L ${spineX} ${(yMid - r).toFixed(1)}`,
        `C ${spineX} ${(yMid - r * 0.45).toFixed(1)}, ${(tipX - dx2).toFixed(1)} ${yMid.toFixed(1)}, ${tipX} ${yMid.toFixed(1)}`,
        `C ${(tipX - dx2).toFixed(1)} ${yMid.toFixed(1)}, ${spineX} ${(yMid + r * 0.45).toFixed(1)}, ${spineX} ${(yMid + r).toFixed(1)}`,
        `L ${spineX} ${(yEnd - r).toFixed(1)}`,
        `C ${spineX} ${(yEnd - r * 0.45).toFixed(1)}, ${(hookX + dx1).toFixed(1)} ${yEnd.toFixed(1)}, ${hookX} ${yEnd.toFixed(1)}`,
      ].join(" ");
    }
  }

  // Square style
  const rCorner = Math.min(3, span * 0.05);
  if (side === "left") {
    const armX = 14;
    const spineX = 3;
    return [
      `M ${armX} ${yStart.toFixed(1)}`,
      `L ${(spineX + rCorner).toFixed(1)} ${yStart.toFixed(1)}`,
      `Q ${spineX} ${yStart.toFixed(1)}, ${spineX} ${(yStart + rCorner).toFixed(1)}`,
      `L ${spineX} ${(yEnd - rCorner).toFixed(1)}`,
      `Q ${spineX} ${yEnd.toFixed(1)}, ${(spineX + rCorner).toFixed(1)} ${yEnd.toFixed(1)}`,
      `L ${armX} ${yEnd.toFixed(1)}`,
    ].join(" ");
  } else {
    // Right side square
    const armX = 2;
    const spineX = 13;
    return [
      `M ${armX} ${yStart.toFixed(1)}`,
      `L ${(spineX - rCorner).toFixed(1)} ${yStart.toFixed(1)}`,
      `Q ${spineX} ${yStart.toFixed(1)}, ${spineX} ${(yStart + rCorner).toFixed(1)}`,
      `L ${spineX} ${(yEnd - rCorner).toFixed(1)}`,
      `Q ${spineX} ${yEnd.toFixed(1)}, ${(spineX - rCorner).toFixed(1)} ${yEnd.toFixed(1)}`,
      `L ${armX} ${yEnd.toFixed(1)}`,
    ].join(" ");
  }
}

/**
 * Builds an authentic, single-stroke continuous path for a horizontal bracket (top or bottom side).
 */
function buildHorizontalPath(
  side: "top" | "bottom",
  style: BracketStyle,
  width: number
): string {
  const W = Math.max(width, 24);
  const padX = Math.min(4, W * 0.04);
  const xStart = padX;
  const xEnd = W - padX;
  const xMid = (xStart + xEnd) / 2;
  const span = xEnd - xStart;

  if (style === "curly") {
    const r = Math.max(3.5, Math.min(7, (xMid - xStart) * 0.28));

    if (side === "top") {
      const hookY = 14; // near text
      const spineY = 8; // horizontal spine
      const tipY = 2; // outward pointing cusp
      const dy1 = (hookY - spineY) * 0.3;
      const dy2 = (spineY - tipY) * 0.3;

      return [
        `M ${xStart.toFixed(1)} ${hookY}`,
        `C ${xStart.toFixed(1)} ${(hookY - dy1).toFixed(1)}, ${(xStart + r * 0.45).toFixed(1)} ${spineY}, ${(xStart + r).toFixed(1)} ${spineY}`,
        `L ${(xMid - r).toFixed(1)} ${spineY}`,
        `C ${(xMid - r * 0.45).toFixed(1)} ${spineY}, ${xMid.toFixed(1)} ${(tipY + dy2).toFixed(1)}, ${xMid.toFixed(1)} ${tipY}`,
        `C ${xMid.toFixed(1)} ${(tipY + dy2).toFixed(1)}, ${(xMid + r * 0.45).toFixed(1)} ${spineY}, ${(xMid + r).toFixed(1)} ${spineY}`,
        `L ${(xEnd - r).toFixed(1)} ${spineY}`,
        `C ${(xEnd - r * 0.45).toFixed(1)} ${spineY}, ${xEnd.toFixed(1)} ${(hookY - dy1).toFixed(1)}, ${xEnd.toFixed(1)} ${hookY}`,
      ].join(" ");
    } else {
      // Bottom side curly
      const hookY = 2; // near text
      const spineY = 8; // horizontal spine
      const tipY = 14; // outward pointing cusp
      const dy1 = (spineY - hookY) * 0.3;
      const dy2 = (tipY - spineY) * 0.3;

      return [
        `M ${xStart.toFixed(1)} ${hookY}`,
        `C ${xStart.toFixed(1)} ${(hookY + dy1).toFixed(1)}, ${(xStart + r * 0.45).toFixed(1)} ${spineY}, ${(xStart + r).toFixed(1)} ${spineY}`,
        `L ${(xMid - r).toFixed(1)} ${spineY}`,
        `C ${(xMid - r * 0.45).toFixed(1)} ${spineY}, ${xMid.toFixed(1)} ${(tipY - dy2).toFixed(1)}, ${xMid.toFixed(1)} ${tipY}`,
        `C ${xMid.toFixed(1)} ${(tipY - dy2).toFixed(1)}, ${(xMid + r * 0.45).toFixed(1)} ${spineY}, ${(xMid + r).toFixed(1)} ${spineY}`,
        `L ${(xEnd - r).toFixed(1)} ${spineY}`,
        `C ${(xEnd - r * 0.45).toFixed(1)} ${spineY}, ${xEnd.toFixed(1)} ${(hookY + dy1).toFixed(1)}, ${xEnd.toFixed(1)} ${hookY}`,
      ].join(" ");
    }
  }

  // Square style
  const rCorner = Math.min(3, span * 0.05);
  if (side === "top") {
    const armY = 14;
    const spineY = 3;
    return [
      `M ${xStart.toFixed(1)} ${armY}`,
      `L ${xStart.toFixed(1)} ${(spineY + rCorner).toFixed(1)}`,
      `Q ${xStart.toFixed(1)} ${spineY}, ${(xStart + rCorner).toFixed(1)} ${spineY}`,
      `L ${(xEnd - rCorner).toFixed(1)} ${spineY}`,
      `Q ${xEnd.toFixed(1)} ${spineY}, ${xEnd.toFixed(1)} ${(spineY + rCorner).toFixed(1)}`,
      `L ${xEnd.toFixed(1)} ${armY}`,
    ].join(" ");
  } else {
    // Bottom side square
    const armY = 2;
    const spineY = 13;
    return [
      `M ${xStart.toFixed(1)} ${armY}`,
      `L ${xStart.toFixed(1)} ${(spineY - rCorner).toFixed(1)}`,
      `Q ${xStart.toFixed(1)} ${spineY}, ${(xStart + rCorner).toFixed(1)} ${spineY}`,
      `L ${(xEnd - rCorner).toFixed(1)} ${spineY}`,
      `Q ${xEnd.toFixed(1)} ${spineY}, ${xEnd.toFixed(1)} ${(spineY - rCorner).toFixed(1)}`,
      `L ${xEnd.toFixed(1)} ${armY}`,
    ].join(" ");
  }
}

export function RoughBracket({
  children,
  side = "left",
  brackets,
  bracketStyle = "curly",
  color = "#F59E0B",
  strokeWidth = 2,
  animationDuration = 750,
  animate = true,
  animationDelay = 0,
  bracketPadding = 10,
  as: Component = "div",
  className = "",
  textClassName = "",
}: RoughBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!animate);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const activeSide: BracketSide = side || brackets || "left";

  // Measure container dimensions for dynamic multiline path calculation
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    measure();

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(measure);
    }

    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, activeSide, bracketStyle]);

  // Viewport intersection observer to trigger drawing smoothly on scroll entry
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

  const h = dimensions.height || 48;
  const w = dimensions.width || 120;
  const bracketThickness = 16; // width of vertical SVG or height of horizontal SVG

  // Calculate clean directional padding to prevent multiline text collision
  const stylePadding: React.CSSProperties = {};
  if (activeSide === "left") {
    stylePadding.paddingLeft = bracketThickness + bracketPadding;
  } else if (activeSide === "right") {
    stylePadding.paddingRight = bracketThickness + bracketPadding;
  } else if (activeSide === "both") {
    stylePadding.paddingLeft = bracketThickness + bracketPadding;
    stylePadding.paddingRight = bracketThickness + bracketPadding;
  } else if (activeSide === "top") {
    stylePadding.paddingTop = bracketThickness + bracketPadding;
  } else if (activeSide === "bottom") {
    stylePadding.paddingBottom = bracketThickness + bracketPadding;
  }

  // Animation settings for fluid, hardware-accelerated single-stroke draw
  const pathTransition = {
    pathLength: {
      duration: animationDuration / 1000,
      delay: animationDelay / 1000,
      ease: [0.25, 0.1, 0.25, 1],
    },
    opacity: { duration: 0.05 },
  };

  const renderSingleBracket = (
    placement: "left" | "right" | "top" | "bottom",
    keySuffix = ""
  ) => {
    const isVertical = placement === "left" || placement === "right";
    const pathD = isVertical
      ? buildVerticalPath(placement, bracketStyle, h)
      : buildHorizontalPath(placement, bracketStyle, w);

    const svgWidth = isVertical ? bracketThickness : w;
    const svgHeight = isVertical ? h : bracketThickness;

    const positioningClass =
      placement === "left"
        ? "left-0 top-0 bottom-0"
        : placement === "right"
        ? "right-0 top-0 bottom-0"
        : placement === "top"
        ? "top-0 left-0 right-0"
        : "bottom-0 left-0 right-0";

    return (
      <svg
        key={`bracket-${placement}${keySuffix}`}
        aria-hidden="true"
        className={`absolute pointer-events-none z-10 overflow-visible ${positioningClass}`}
        style={{
          width: svgWidth,
          height: svgHeight,
        }}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
      >
        <motion.path
          d={pathD}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={pathTransition}
        />
      </svg>
    );
  };

  return (
    <Component
      ref={containerRef}
      className={`relative inline-block w-fit max-w-full ${className}`}
      style={stylePadding}
    >
      {/* ── Single continuous vector bracket stroke(s) ── */}
      {activeSide === "both" ? (
        <>
          {renderSingleBracket("left", "-l")}
          {renderSingleBracket("right", "-r")}
        </>
      ) : (
        renderSingleBracket(activeSide)
      )}

      {/* ── Multiline Content ── */}
      <div className={`relative z-10 ${textClassName}`}>{children}</div>
    </Component>
  );
}
