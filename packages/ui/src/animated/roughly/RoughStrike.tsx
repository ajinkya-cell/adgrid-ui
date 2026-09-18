"use client";

import React, { useEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

export type StrikeVariant = "single" | "double" | "triple";

export interface RoughStrikeProps {
  children: React.ReactNode;
  /** Strike line mode: 'single' | 'double' | 'triple' (default: 'single') */
  variant?: StrikeVariant;
  /** Stroke color (default: "#EF4444") */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Drawing animation duration in milliseconds (default: 650) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Support wrapping multi-line text blocks with continuous strikes (default: true) */
  multiline?: boolean;
  /** Explicit iteration count override (if not set, inferred from variant: single=1, double=2, triple=3) */
  iterations?: number;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text */
  textClassName?: string;
}

export function RoughStrike({
  children,
  variant = "single",
  color = "#EF4444",
  strokeWidth = 2,
  animationDuration = 650,
  animate = true,
  animationDelay = 0,
  multiline = true,
  iterations,
  className = "",
  textClassName = "",
}: RoughStrikeProps) {
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

  // rough-notation lifecycle for RoughStrike
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

      const finalIterations =
        iterations ?? (variant === "triple" ? 3 : variant === "double" ? 2 : 1);

      const annotation = annotate(textRef.current, {
        type: "strike-through",
        color,
        strokeWidth,
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
