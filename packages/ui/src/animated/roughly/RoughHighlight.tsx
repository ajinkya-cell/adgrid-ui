"use client";

import React, { useEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

export interface RoughHighlightProps {
  children: React.ReactNode;
  /** Highlight marker color (default: "#4338CA" Deep Royal Indigo) */
  color?: string;
  /** Number of marker passes: 2 for authentic double-stroke depth, 1 for clean pass (default: 2) */
  iterations?: number;
  /** Drawing animation duration in milliseconds (default: 800) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Whether multi-line text blocks wrap with continuous per-line highlighter strokes (default: true) */
  multiline?: boolean;
  /** Padding around the text in px: [top, right, bottom, left] or number (default: [2, 6, 2, 6]) */
  padding?: number | [number, number] | [number, number, number, number];
  /** Custom stroke thickness in pixels (optional, defaults to rough-notation proportional text height) */
  strokeWidth?: number;
  /** Custom opacity for the highlighter marker stroke (default: 0.85) */
  opacity?: number;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text */
  textClassName?: string;
}

export function RoughHighlight({
  children,
  color = "#4338CA",
  iterations = 2,
  animationDuration = 800,
  animate = true,
  animationDelay = 0,
  multiline = true,
  padding = [2, 6, 2, 6],
  strokeWidth,
  opacity = 0.85,
  className = "",
  textClassName = "",
}: RoughHighlightProps) {
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

  // rough-notation lifecycle for RoughHighlight
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

      const config: Parameters<typeof annotate>[1] = {
        type: "highlight",
        color,
        padding,
        animate,
        animationDuration,
        iterations,
        multiline,
      };

      if (strokeWidth !== undefined) {
        config.strokeWidth = strokeWidth;
      }

      const annotation = annotate(textRef.current, config);
      annotationRef.current = annotation;

      const applySvgLayering = () => {
        const svg = containerRef.current?.querySelector<SVGSVGElement>(
          "svg.rough-annotation"
        );
        if (svg) {
          svg.style.zIndex = "-1";
          svg.style.pointerEvents = "none";
          if (opacity !== undefined) {
            svg.style.opacity = `${opacity}`;
          }
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
    color,
    iterations,
    strokeWidth,
    padding,
    animationDuration,
    animate,
    animationDelay,
    multiline,
    opacity,
    children,
  ]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block [&>.rough-annotation]:-z-10 [&>.rough-annotation]:pointer-events-none ${className}`}
    >
      <span ref={textRef} className={`relative z-10 inline ${textClassName}`}>
        {children}
      </span>
    </span>
  );
}
