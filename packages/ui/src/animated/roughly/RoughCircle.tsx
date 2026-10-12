"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

export interface RoughCircleProps {
  children: React.ReactNode;
  /** Circle stroke color (default: "#6366F1") */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Horizontal padding around the content in px (default: 22 for generous, symmetric breathing room) */
  paddingX?: number;
  /** Vertical padding around the content in px (default: 10) */
  paddingY?: number;
  /** Drawing animation duration in milliseconds (default: 800) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Number of sketchy stroke loops (default: 2 for authentic hand-drawn look) */
  iterations?: number;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Additional CSS class names for the wrapping span */
  className?: string;
  /** Additional CSS class names for the inner text content */
  textClassName?: string;
  /**
   * Draw the circle to this fraction (0–1) instead of playing the timed
   * animation, e.g. to drive it from a video timeline.
   */
  progress?: number;
  /** Fixes the hand-drawn shape when `progress` is used, so every render matches (default: 1) */
  seed?: number;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function RoughCircle({
  children,
  color = "#6366F1",
  strokeWidth = 2,
  paddingX = 22,
  paddingY = 10,
  animationDuration = 800,
  animate = true,
  iterations = 2,
  animationDelay = 0,
  className = "",
  textClassName = "",
  progress,
  seed = 1,
}: RoughCircleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const driven = progress !== undefined;
  const [inView, setInView] = useState(!animate || driven);

  // Viewport intersection observer to ensure animation plays when scrolled into view
  useEffect(() => {
    if (!animate || driven) {
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
  }, [animate, driven]);

  // Rough-notation annotation lifecycle
  useEffect(() => {
    const el = textRef.current;
    if (driven || !el || !inView) return undefined;

    let isMounted = true;

    const createAnnotation = () => {
      if (!isMounted || !textRef.current) return;

      // Clean up previous instance if already present
      if (annotationRef.current) {
        try {
          annotationRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        annotationRef.current = null;
      }

      // Symmetric padding [top, right, bottom, left]
      // Equal left and right padding guarantees identical space and curvature on both sides
      const padding: [number, number, number, number] = [
        paddingY,
        paddingX,
        paddingY,
        paddingX,
      ];

      const annotation = annotate(textRef.current, {
        type: "circle",
        color,
        strokeWidth,
        padding,
        animate,
        animationDuration,
        iterations,
      });

      annotationRef.current = annotation;

      const applySvgLayering = () => {
        const svg = containerRef.current?.querySelector<SVGSVGElement>("svg.rough-annotation");
        if (svg) {
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

    // Synchronize with font-ready to guarantee precise text bounding box
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
    strokeWidth,
    paddingX,
    paddingY,
    animationDuration,
    animate,
    iterations,
    animationDelay,
    children,
    driven,
  ]);

  // Driven drawing: build the annotation once without its timed animation,
  // then reveal the stroke by `progress` on every render, before paint.
  useIsomorphicLayoutEffect(() => {
    if (!driven || !textRef.current) return;

    if (!annotationRef.current) {
      const annotation = annotate(textRef.current, {
        type: "circle",
        color,
        strokeWidth,
        padding: [paddingY, paddingX, paddingY, paddingX],
        animate: false,
        iterations,
      });
      // rough-notation picks a random seed per annotation; pin it so every render draws the same shape
      (annotation as unknown as { _seed: number })._seed = seed;
      annotation.show();
      annotationRef.current = annotation;
      const svg = containerRef.current?.querySelector<SVGSVGElement>("svg.rough-annotation");
      if (svg) svg.style.pointerEvents = "none";
    }

    const paths = Array.from(
      containerRef.current?.querySelectorAll<SVGPathElement>("svg.rough-annotation path") ?? []
    );
    const lengths = paths.map((p) => p.getTotalLength());
    let remaining = Math.min(1, Math.max(0, progress ?? 0)) * lengths.reduce((a, b) => a + b, 0);
    paths.forEach((path, i) => {
      const shown = Math.min(lengths[i], Math.max(0, remaining));
      remaining -= lengths[i];
      path.style.strokeDasharray = `${lengths[i]}`;
      path.style.strokeDashoffset = `${lengths[i] - shown}`;
    });
  });

  useEffect(() => {
    if (!driven) return undefined;
    return () => {
      annotationRef.current?.remove();
      annotationRef.current = null;
    };
  }, [driven]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block [&>.rough-annotation]:pointer-events-none ${className}`}
    >
      <span ref={textRef} className={`relative z-10 inline ${textClassName}`}>{children}</span>
    </span>
  );
}
