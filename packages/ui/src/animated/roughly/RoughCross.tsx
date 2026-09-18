"use client";

import React, { useEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

export type CrossVariant = "single" | "double";

export interface RoughCrossProps {
  children: React.ReactNode;
  /** Cross cut style: 'single' (clean 2 strokes) | 'double' (sketchy 4 strokes) (default: 'single') */
  variant?: CrossVariant;
  /** Stroke color (default: "#F43F5E") */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Total drawing animation duration in milliseconds (default: 700) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Padding around the text bounds in pixels (default: 6) */
  padding?: number | [number, number] | [number, number, number, number];
  /** Support wrapping multi-line text blocks with continuous crosses (default: true) */
  multiline?: boolean;
  /** Explicit iteration count override (if not set, inferred from variant: single=1, double=2) */
  iterations?: number;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text */
  textClassName?: string;
}

export function RoughCross({
  children,
  variant = "single",
  color = "#F43F5E",
  strokeWidth = 2,
  animationDuration = 700,
  animate = true,
  animationDelay = 0,
  padding = 6,
  multiline = true,
  iterations,
  className = "",
  textClassName = "",
}: RoughCrossProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const [inView, setInView] = useState(!animate);

  // Viewport intersection observer to trigger drawing when scrolled into view
  useEffect(() => {
    if (!animate) {
      setInView(true);
      return undefined;
    }
    const el = textRef.current;
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

  // rough-notation lifecycle for RoughCross
  useEffect(() => {
    const el = textRef.current;
    if (!el || !inView) return undefined;

    let isMounted = true;

    const createAnnotation = () => {
      if (!isMounted || !textRef.current) return;

      if (annotationRef.current) {
        try {
          annotationRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        annotationRef.current = null;
      }

      const finalIterations = iterations ?? (variant === "double" ? 2 : 1);

      const annotation = annotate(textRef.current, {
        type: "crossed-off",
        color,
        strokeWidth,
        padding,
        animate,
        animationDuration,
        iterations: finalIterations,
        multiline,
      });

      annotationRef.current = annotation;

      const applySvgLayering = () => {
        const svg = containerRef.current?.querySelector<SVGSVGElement>("svg.rough-annotation");
        if (svg) {
          svg.style.zIndex = "20";
          svg.style.pointerEvents = "none";
        }
      };

      if (animationDelay > 0) {
        const timer = setTimeout(() => {
          if (isMounted && annotationRef.current) {
            annotation.show();
            applySvgLayering();
          }
        }, animationDelay);
        return () => clearTimeout(timer);
      } else {
        annotation.show();
        applySvgLayering();
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
    animationDuration,
    animate,
    animationDelay,
    padding,
    multiline,
    iterations,
    children,
  ]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block [&>.rough-annotation]:z-20 [&>.rough-annotation]:pointer-events-none ${className}`}
    >
      <span ref={textRef} className={`relative z-10 inline ${textClassName}`}>
        {children}
      </span>
    </span>
  );
}
