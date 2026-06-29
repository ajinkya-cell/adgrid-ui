"use client";

import { useEffect } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

const DEFAULT_SPRING: SpringConfig = {
  stiffness: 180,
  damping: 18,
  mass: 0.8,
};

/**
 * Tracks the mouse cursor relative to the center of the screen,
 * returning spring-damped normalized values (-1 to 1).
 */
export function useMouseParallax(springConfig: SpringConfig = DEFAULT_SPRING) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    // Check if window is defined (Next.js SSR safety)
    if (typeof window === "undefined") return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      x.set(0);
      y.set(0);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Center of viewport is (0,0)
      // Normalized values range from -1.0 to 1.0
      const normalizedX = (event.clientX - width / 2) / (width / 2);
      const normalizedY = (event.clientY - height / 2) / (height / 2);

      x.set(normalizedX);
      y.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [x, y]);

  return { x: springX, y: springY };
}
