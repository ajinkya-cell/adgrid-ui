"use client";

import React, { useEffect, useRef, useState } from "react";
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
}

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
}: RoughCircleProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const [inView, setInView] = useState(!animate);

  // Viewport intersection observer to ensure animation plays when scrolled into view
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

  // Rough-notation annotation lifecycle
  useEffect(() => {
    const el = elementRef.current;
    if (!el || !inView) return undefined;

    let isMounted = true;

    const createAnnotation = () => {
      if (!isMounted || !elementRef.current) return;

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

      const annotation = annotate(elementRef.current, {
        type: "circle",
        color,
        strokeWidth,
        padding,
        animate,
        animationDuration,
        iterations,
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
  ]);

  return (
    <span
      ref={elementRef}
      className={`relative inline-block ${className}`}
    >
      <span className={`relative z-10 ${textClassName}`}>{children}</span>
    </span>
  );
}
