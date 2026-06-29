"use client";

import { useEffect, useRef } from 'react';

interface MouseState {
  x: number;       // Pixel X coordinate relative to container top-left
  y: number;       // Pixel Y coordinate relative to container top-left
  active: boolean; // True if cursor is hovering over the container
}

/**
 * High-performance hook to track mouse coordinates inside a container element ref.
 * Persists data inside a mutable React ref instead of state to prevent triggering
 * component re-renders during mouse movements.
 */
export function useMouseInfluence(containerRef: React.RefObject<HTMLElement | null>) {
  const mouseStateRef = useRef<MouseState>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (typeof window === "undefined") return;

    // Skip tracking if prefers-reduced-motion is enabled
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      mouseStateRef.current.active = false;
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      
      // Calculate coordinates relative to the top-left boundary of the grid container
      mouseStateRef.current.x = event.clientX - rect.left;
      mouseStateRef.current.y = event.clientY - rect.top;
      mouseStateRef.current.active = true;
    };

    const handleMouseEnter = () => {
      mouseStateRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseStateRef.current.active = false;
    };

    element.addEventListener("mousemove", handleMouseMove, { passive: true });
    element.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    element.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);

  return mouseStateRef;
}

export default useMouseInfluence;
