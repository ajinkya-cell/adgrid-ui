"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RoughCircle } from "./roughly/RoughCircle";
import { RoughUnderline } from "./roughly/RoughUnderline";
import { RoughStrike, type StrikeVariant } from "./roughly/RoughStrike";
import { RoughCross, type CrossVariant } from "./roughly/RoughCross";

export type RoughlyType =
  | "underline"
  | "circle"
  | "strike-through"
  | "cross-off"
  | "bracket"
  | "box"
  | "highlight";

export type BracketSide = "left" | "right" | "top" | "bottom";
export type BracketStyle = "curly" | "square";
export type UnderlineVariant = "single" | "double" | "wavy";
export type { StrikeVariant } from "./roughly/RoughStrike";
export type { CrossVariant } from "./roughly/RoughCross";

export interface RoughlyProps {
  children: React.ReactNode;
  /** Type of annotation */
  type?: RoughlyType;
  /** Stroke / highlight color */
  color?: string;
  /** Stroke width for lines, circles, boxes, and brackets (in px) */
  strokeWidth?: number;
  /** Whether to animate the drawing stroke */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Placement side when type is 'bracket' ('left' | 'right' | 'top' | 'bottom') */
  brackets?: BracketSide;
  /** Alias for brackets prop */
  side?: BracketSide;
  /** Bracket style: 'curly' ({) or 'square' ([) */
  bracketStyle?: BracketStyle;
  /** Variant for underline ('single' | 'double' | 'wavy'), strike-through ('single' | 'double' | 'triple'), or cross-off ('single' | 'double') */
  variant?: UnderlineVariant | StrikeVariant | CrossVariant;
  /** Custom wrapper class */
  className?: string;
  /** Custom text class */
  textClassName?: string;
}

// Default colors matching dark-first Void UI palette
const DEFAULT_COLORS: Record<RoughlyType, string> = {
  underline: "#6366F1", // Indigo
  circle: "#EC4899", // Rose / Pink
  "strike-through": "#EF4444", // Red
  "cross-off": "#F43F5E", // Rose Red
  bracket: "#F59E0B", // Cyber Amber
  box: "#10B981", // Emerald
  highlight: "#4338CA", // Deep Royal Indigo
};

// Safe hook for Next.js SSR / client hydration
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Roughly({
  children,
  type = "underline",
  color,
  strokeWidth = 2,
  animate = true,
  animationDuration = 750,
  brackets,
  side,
  bracketStyle = "curly",
  variant = "single",
  className = "",
  textClassName = "",
}: RoughlyProps) {
  if (type === "circle") {
    return (
      <RoughCircle
        color={color || DEFAULT_COLORS.circle}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughCircle>
    );
  }

  if (type === "underline") {
    return (
      <RoughUnderline
        variant={variant as UnderlineVariant}
        color={color || DEFAULT_COLORS.underline}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughUnderline>
    );
  }

  if (type === "strike-through") {
    return (
      <RoughStrike
        variant={(variant as StrikeVariant) || "single"}
        color={color || DEFAULT_COLORS["strike-through"]}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughStrike>
    );
  }

  if (type === "cross-off") {
    return (
      <RoughCross
        variant={(variant as CrossVariant) || "single"}
        color={color || DEFAULT_COLORS["cross-off"]}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughCross>
    );
  }
  const containerRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [totalLength, setTotalLength] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(!animate);
  const strokeColor = color || DEFAULT_COLORS[type];
  const activeBracketSide = side || brackets || "left";

  // Measure container dimensions via ResizeObserver for dynamic geometry
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

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  // Viewport intersection observer & orchestrated paint trigger
  useEffect(() => {
    if (!animate) {
      setIsVisible(true);
      return undefined;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Double-rAF ensures the initial hidden stroke offset is firmly painted before animating
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsVisible(true);
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

  // Calibrate exact path length dynamically to ensure 100% of the stroke is drawn
  useIsomorphicLayoutEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) {
          setTotalLength(len);
        }
      } catch {
        // Fallback handled by estimate
      }
    }
    return undefined;
  }, [dimensions, type, variant, bracketStyle, activeBracketSide]);

  // True path length transition style with continuous fluid hand-drawing velocity
  const strokeTransition = totalLength > 0
    ? {
        strokeDasharray: totalLength,
        strokeDashoffset: isVisible ? 0 : totalLength,
        transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
      }
    : {
        strokeDasharray: 1000,
        strokeDashoffset: isVisible ? 0 : 1000,
        transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
      };

  // Dimensions in pixels (default to sensible SSR baselines if not yet mounted)
  const w = dimensions?.width || 120;
  const h = dimensions?.height || 32;

  // Proportional dynamic clearance & geometry for Box
  const boxPadX = Math.max(8, h * 0.15);
  const boxPadY = Math.max(4, h * 0.1);
  const boxW = Math.round(w + boxPadX * 2);
  const boxH = Math.round(h + boxPadY * 2);

  const boxPath = [
    `M 3 ${(boxPadY * 0.4).toFixed(1)} C ${(boxW * 0.3).toFixed(1)} ${(boxPadY * 0.2).toFixed(1)}, ${(boxW * 0.7).toFixed(1)} ${(boxPadY * 0.3).toFixed(1)}, ${(boxW - 3).toFixed(1)} ${(boxPadY * 0.25).toFixed(1)}`,
    `M ${(boxW - boxPadX * 0.3).toFixed(1)} 3 C ${(boxW - boxPadX * 0.2).toFixed(1)} ${(boxH * 0.3).toFixed(1)}, ${(boxW - boxPadX * 0.3).toFixed(1)} ${(boxH * 0.7).toFixed(1)}, ${(boxW - boxPadX * 0.2).toFixed(1)} ${(boxH - 3).toFixed(1)}`,
    `M ${(boxW - 3).toFixed(1)} ${(boxH - boxPadY * 0.3).toFixed(1)} C ${(boxW * 0.7).toFixed(1)} ${(boxH - boxPadY * 0.2).toFixed(1)}, ${(boxW * 0.3).toFixed(1)} ${(boxH - boxPadY * 0.3).toFixed(1)}, 3 ${(boxH - boxPadY * 0.25).toFixed(1)}`,
    `M ${(boxPadX * 0.3).toFixed(1)} ${(boxH - 3).toFixed(1)} C ${(boxPadX * 0.2).toFixed(1)} ${(boxH * 0.7).toFixed(1)}, ${(boxPadX * 0.3).toFixed(1)} ${(boxH * 0.3).toFixed(1)}, ${(boxPadX * 0.2).toFixed(1)} 3`
  ].join(" ");

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${
        type === "box" ? "px-[0.25em] py-[0.08em]" : ""
      } ${
        type === "bracket" &&
        (activeBracketSide === "left" || activeBracketSide === "right")
          ? activeBracketSide === "left"
            ? "pl-4"
            : "pr-4"
          : ""
      } ${
        type === "bracket" &&
        (activeBracketSide === "top" || activeBracketSide === "bottom")
          ? activeBracketSide === "top"
            ? "pt-4"
            : "pb-4"
          : ""
      } ${className}`}
    >
      {/* ── 5. BRACKET ({ or [) ────────────────────────────────── */}
      {type === "bracket" && (
        <svg
          aria-hidden="true"
          className={`absolute pointer-events-none z-10 overflow-visible ${
            activeBracketSide === "left"
              ? "left-0 top-0 bottom-0 w-3.5 h-full"
              : activeBracketSide === "right"
              ? "right-0 top-0 bottom-0 w-3.5 h-full"
              : activeBracketSide === "top"
              ? "top-0 left-0 right-0 h-3.5 w-full"
              : "bottom-0 left-0 right-0 h-3.5 w-full"
          }`}
          viewBox={
            activeBracketSide === "left" || activeBracketSide === "right"
              ? "0 0 14 50"
              : "0 0 50 14"
          }
          preserveAspectRatio="none"
          fill="none"
        >
          {bracketStyle === "curly" && activeBracketSide === "left" && (
            <path
              ref={type === "bracket" ? pathRef : undefined}
              d="M 12 2 C 7 2, 5 7, 5 15 C 5 21, 1 23, 1 25 C 1 27, 5 29, 5 35 C 5 43, 7 48, 12 48"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={strokeTransition}
            />
          )}

          {bracketStyle === "curly" && activeBracketSide === "right" && (
            <path
              ref={type === "bracket" ? pathRef : undefined}
              d="M 2 2 C 7 2, 9 7, 9 15 C 9 21, 13 23, 13 25 C 13 27, 9 29, 9 35 C 9 43, 7 48, 2 48"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={strokeTransition}
            />
          )}

          {bracketStyle === "curly" && activeBracketSide === "top" && (
            <path
              ref={type === "bracket" ? pathRef : undefined}
              d="M 2 12 C 2 7, 7 5, 15 5 C 21 5, 23 1, 25 1 C 27 1, 29 5, 35 5 C 43 5, 48 7, 48 12"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={strokeTransition}
            />
          )}

          {bracketStyle === "curly" && activeBracketSide === "bottom" && (
            <path
              ref={type === "bracket" ? pathRef : undefined}
              d="M 2 2 C 2 7, 7 9, 15 9 C 21 9, 23 13, 25 13 C 27 13, 29 9, 35 9 C 43 9, 48 7, 48 2"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={strokeTransition}
            />
          )}

          {bracketStyle === "square" &&
            (activeBracketSide === "left" || activeBracketSide === "right") && (
              <path
                ref={type === "bracket" ? pathRef : undefined}
                d={
                  activeBracketSide === "left"
                    ? "M 12 2 L 4 2 L 4 48 L 12 48"
                    : "M 2 2 L 10 2 L 10 48 L 2 48"
                }
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={strokeTransition}
              />
            )}

          {bracketStyle === "square" &&
            (activeBracketSide === "top" || activeBracketSide === "bottom") && (
              <path
                ref={type === "bracket" ? pathRef : undefined}
                d={
                  activeBracketSide === "top"
                    ? "M 2 12 L 2 4 L 48 4 L 48 12"
                    : "M 2 2 L 2 10 L 48 10 L 48 2"
                }
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={strokeTransition}
              />
            )}
        </svg>
      )}

      {/* ── 6. BOX (SKETCH FRAME) ──────────────────────────────── */}
      {type === "box" && (
        <svg
          aria-hidden="true"
          className="absolute pointer-events-none -z-10 overflow-visible"
          style={{
            left: -boxPadX,
            top: -boxPadY,
            width: boxW,
            height: boxH,
          }}
          viewBox={`0 0 ${boxW} ${boxH}`}
          fill="none"
        >
          {/* Organic frame with corner overshoots in 1:1 pixel coordinates */}
          <path
            ref={type === "box" ? pathRef : undefined}
            d={boxPath}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={strokeTransition}
          />
        </svg>
      )}

      {/* ── 7. HIGHLIGHT (CHISEL MARKER) ────────────────────────── */}
      {type === "highlight" && (
        <svg
          aria-hidden="true"
          className="absolute -inset-x-2 -top-[14%] -bottom-[12%] w-[calc(100%+16px)] h-[126%] pointer-events-none -z-10 overflow-visible"
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
        >
          <g
            style={{
              clipPath: isVisible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
              transition: `clip-path ${animationDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            {/* Primary organic chisel stroke */}
            <path
              d="M 1.5 19 C 0.8 14.5, 1.8 10, 3.2 7.5 C 18 5.8, 48 8.2, 97 6 C 98.8 10, 99.2 16, 97.5 22 C 72 24.5, 34 23, 2.5 23.5 C 1.2 22.5, 1.4 20.5, 1.5 19 Z"
              fill={strokeColor}
              opacity="0.95"
            />
            {/* Secondary layered texture stroke */}
            <path
              d="M 2.5 10 C 25 7.5, 65 9.5, 96.5 8 C 97.2 13, 96.8 19, 95.5 21 C 62 23, 28 21.5, 3.5 22 Z"
              fill={strokeColor}
              opacity="0.4"
            />
          </g>
        </svg>
      )}

      {/* ── Content ────────────────────────────────────────────── */}
      <span className={`relative z-10 ${textClassName}`}>{children}</span>
    </span>
  );
}

// ── Subcomponent Semantic Shortcuts ─────────────────────────────
Roughly.Underline = function RoughlyUnderline(
  props: React.ComponentProps<typeof RoughUnderline>
) {
  return <RoughUnderline {...props} />;
};

Roughly.Circle = function RoughlyCircle(
  props: React.ComponentProps<typeof RoughCircle>
) {
  return <RoughCircle {...props} />;
};

Roughly.Strike = function RoughlyStrike(
  props: React.ComponentProps<typeof RoughStrike>
) {
  return <RoughStrike {...props} />;
};

Roughly.Cross = function RoughlyCross(
  props: React.ComponentProps<typeof RoughCross>
) {
  return <RoughCross {...props} />;
};

Roughly.Bracket = function RoughlyBracket(props: Omit<RoughlyProps, "type">) {
  return <Roughly type="bracket" {...props} />;
};

Roughly.Box = function RoughlyBox(props: Omit<RoughlyProps, "type">) {
  return <Roughly type="box" {...props} />;
};

Roughly.Highlight = function RoughlyHighlight(
  props: Omit<RoughlyProps, "type">
) {
  return <Roughly type="highlight" {...props} />;
};
