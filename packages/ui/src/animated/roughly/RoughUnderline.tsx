"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";
import { motion } from "framer-motion";

export type UnderlineVariant = "single" | "double" | "wavy";

export interface RoughUnderlineProps {
  children: React.ReactNode;
  /** Underline mode: 'single' | 'double' | 'wavy' (default: 'single') */
  variant?: UnderlineVariant;
  /** Underline stroke color (default: "#6366F1") */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Drawing animation duration in milliseconds (default: 650) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text */
  textClassName?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function RoughUnderline({
  children,
  variant = "single",
  color = "#6366F1",
  strokeWidth = 2,
  animationDuration = 650,
  animate = true,
  animationDelay = 0,
  className = "",
  textClassName = "",
}: RoughUnderlineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const [inView, setInView] = useState(!animate);
  const [width, setWidth] = useState<number>(0);

  // Viewport intersection observer to trigger drawing when scrolled into view
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

  // Measure container width for dynamic continuous wavy underline
  useIsomorphicLayoutEffect(() => {
    if (variant !== "wavy") return undefined;
    const el = containerRef.current;
    if (!el) return undefined;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setWidth(rect.width);
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, variant]);

  // rough-notation lifecycle for 'single' and 'double' variants
  useEffect(() => {
    if (variant === "wavy") {
      if (annotationRef.current) {
        annotationRef.current.remove();
        annotationRef.current = null;
      }
      return undefined;
    }

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

      const iterations = variant === "single" ? 1 : 2;

      const annotation = annotate(textRef.current, {
        type: "underline",
        color,
        strokeWidth,
        padding: [0, 2, 4, 2],
        animate,
        animationDuration,
        iterations,
        multiline: true,
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
    animationDuration,
    animate,
    animationDelay,
    children,
  ]);

  // Generate dynamic, seamless wavy underline across the exact measured text width
  const w = Math.max(width || 120, 24);
  const wavelength = 16;
  const waveCycles = Math.max(2, Math.round((w - 4) / wavelength));
  const waveStep = (w - 4) / waveCycles;

  let wavyPath = `M 2 7`;
  for (let i = 0; i < waveCycles; i++) {
    const xStart = 2 + i * waveStep;
    const xMid = xStart + waveStep / 2;
    const xEnd = xStart + waveStep;
    const yPeak = i % 2 === 0 ? 3 : 11;
    wavyPath += ` Q ${xMid.toFixed(1)} ${yPeak}, ${xEnd.toFixed(1)} 7`;
  }

  return (
    <span
      ref={containerRef}
      className={`relative inline ${className}`}
    >
      <span ref={textRef} className={`relative z-10 ${textClassName}`}>
        {children}
      </span>

      {/* Wavy Underline: Handcrafted fluid wave with buttery smooth 60fps Framer Motion stroke */}
      {variant === "wavy" && (
        <svg
          aria-hidden="true"
          className="absolute left-0 right-0 -bottom-2 w-full h-3.5 pointer-events-none -z-10 overflow-visible"
          viewBox={`0 0 ${w} 14`}
          fill="none"
        >
          <motion.path
            d={wavyPath}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{
              pathLength: {
                duration: animationDuration / 1000,
                delay: animationDelay / 1000,
                ease: [0.25, 0.1, 0.25, 1],
              },
              opacity: { duration: 0.05 },
            }}
          />
        </svg>
      )}
    </span>
  );
}
