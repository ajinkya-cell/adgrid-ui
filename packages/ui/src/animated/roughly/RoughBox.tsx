"use client";

import React, { useEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

export type BoxVariant = "single" | "double";

export interface RoughBoxProps {
  children: React.ReactNode;
  /** Box frame style variant: 'single' (1 stroke loop) | 'double' (2 authentic sketch loops) (default: 'double') */
  variant?: BoxVariant;
  /** Frame stroke color (default: "#10B981" Emerald) */
  color?: string;
  /** Frame stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Explicit stroke iterations override (if not set, inferred from variant: single=1, double=2) */
  iterations?: number;
  /** Drawing animation duration in milliseconds (default: 800) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Padding around the content in px: [top, right, bottom, left] or number (default: [4, 8, 4, 8]) */
  padding?: number | [number, number] | [number, number, number, number];
  /** Horizontal padding helper in px (convenience override for padding[1] and padding[3]) */
  paddingX?: number;
  /** Vertical padding helper in px (convenience override for padding[0] and padding[2]) */
  paddingY?: number;
  /** Whether multi-line text blocks wrap with continuous per-line box frames (default: false) */
  multiline?: boolean;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text */
  textClassName?: string;
}

export function RoughBox({
  children,
  variant = "double",
  color = "#10B981",
  strokeWidth = 2,
  iterations,
  animationDuration = 800,
  animate = true,
  animationDelay = 0,
  padding,
  paddingX,
  paddingY,
  multiline = false,
  className = "",
  textClassName = "",
}: RoughBoxProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const [inView, setInView] = useState(!animate);

  // Viewport intersection observer to ensure drawing animation triggers when scrolled into view
  useEffect(() => {
    if (!animate) {
      setInView(true);
      return undefined;
    }
    const el = elementRef.current;
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

  // rough-notation lifecycle for RoughBox
  useEffect(() => {
    const el = elementRef.current;
    if (!el || !inView) return undefined;

    let isMounted = true;

    const createAnnotation = () => {
      if (!isMounted || !elementRef.current) return;

      if (annotationRef.current) {
        try {
          annotationRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        annotationRef.current = null;
      }

      // Resolve final iterations: user override or derived from variant
      const finalIterations =
        iterations ?? (variant === "double" ? 2 : 1);

      // Resolve symmetric or directional padding [top, right, bottom, left]
      let resolvedPadding: [number, number, number, number] = [4, 8, 4, 8];
      if (padding !== undefined) {
        if (typeof padding === "number") {
          resolvedPadding = [padding, padding, padding, padding];
        } else if (Array.isArray(padding)) {
          if (padding.length === 2) {
            resolvedPadding = [padding[0], padding[1], padding[0], padding[1]];
          } else if (padding.length === 4) {
            resolvedPadding = [...padding];
          }
        }
      }

      if (paddingX !== undefined) {
        resolvedPadding[1] = paddingX;
        resolvedPadding[3] = paddingX;
      }
      if (paddingY !== undefined) {
        resolvedPadding[0] = paddingY;
        resolvedPadding[2] = paddingY;
      }

      const annotation = annotate(elementRef.current, {
        type: "box",
        color,
        strokeWidth,
        padding: resolvedPadding,
        animate,
        animationDuration,
        iterations: finalIterations,
        multiline,
      });

      annotationRef.current = annotation;

      if (animationDelay > 0) {
        const timer = setTimeout(() => {
          if (isMounted && annotationRef.current) {
            annotation.show();
          }
        }, animationDelay);
        return () => clearTimeout(timer);
      } else {
        annotation.show();
      }
      return undefined;
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(createAnnotation).catch(createAnnotation);
    } else {
      createAnnotation();
    }

    return () => {
      isMounted = false;
      if (annotationRef.current) {
        try {
          annotationRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        annotationRef.current = null;
      }
    };
  }, [
    inView,
    variant,
    color,
    strokeWidth,
    iterations,
    animationDuration,
    animate,
    animationDelay,
    padding,
    paddingX,
    paddingY,
    multiline,
    children,
  ]);

  return (
    <span
      ref={elementRef}
      className={`relative inline-block [&>.rough-annotation]:pointer-events-none ${className}`}
    >
      <span className={`relative z-10 ${textClassName}`}>{children}</span>
    </span>
  );
}
