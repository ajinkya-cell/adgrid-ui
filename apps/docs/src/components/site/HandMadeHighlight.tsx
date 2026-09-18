"use client";

import React, { useEffect, useRef, useState } from "react";

export interface HandMadeHighlightProps {
  children: React.ReactNode;
  /** Highlighter color. Defaults to Deep Royal Indigo (#4338CA) for dark-mode high contrast */
  color?: string;
  /** Whether to animate the marker stroke from left to right */
  animate?: boolean;
  /** Duration of the stroke drawing animation in ms */
  animationDuration?: number;
  /** Additional CSS classes */
  className?: string;
}

export function HandMadeHighlight({
  children,
  color = "#4338CA", // Deep Royal Indigo (passes 6.8:1 contrast with pure white text)
  animate = true,
  animationDuration = 700,
  className = "",
}: HandMadeHighlightProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block text-white  ${className}`}
    >
      {/* Handcrafted deterministic chisel-marker SVG background */}
      <svg
        aria-hidden="true"
        className="absolute -inset-x-2 -top-[14%] -bottom-[12%] w-[calc(100%+16px)] h-[126%] pointer-events-none -z-10 overflow-visible"
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        style={{
          clipPath: isVisible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path ${animationDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        {/* Primary organic chisel stroke with natural hand wobble */}
        <path
          d="M 1.5 19 C 0.8 14.5, 1.8 10, 3.2 7.5 C 18 5.8, 48 8.2, 97 6 C 98.8 10, 99.2 16, 97.5 22 C 72 24.5, 34 23, 2.5 23.5 C 1.2 22.5, 1.4 20.5, 1.5 19 Z"
          fill={color}
          opacity="0.95"
        />
        {/* Secondary subtle layered stroke for tactile ink depth */}
        <path
          d="M 2.5 10 C 25 7.5, 65 9.5, 96.5 8 C 97.2 13, 96.8 19, 95.5 21 C 62 23, 28 21.5, 3.5 22 Z"
          fill={color}
          opacity="0.4"
        />
      </svg>

      {/* Crisp Pure White Text */}
      <span className="relative z-10 text-white  selection:bg-white selection:text-black">
        {children}
      </span>
    </span>
  );
}
