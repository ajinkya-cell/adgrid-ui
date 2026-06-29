"use client";

import { useEffect } from 'react';

interface FloatingConfig {
  duration?: number;        // Cycle duration in seconds
  amplitudeY?: number;      // Max vertical movement in px
  amplitudeRotate?: number;  // Max rotation in degrees
}

/**
 * Applies a continuous, independent sine-wave float effect to an element.
 * Updates custom CSS variables `--float-y` and `--float-r` on the element ref
 * using requestAnimationFrame for optimal 60 FPS GPU performance.
 */
export function useFloating(
  ref: React.RefObject<HTMLElement | null>,
  { duration = 6.0, amplitudeY = 10, amplitudeRotate = 2 }: FloatingConfig = {}
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === "undefined") return;

    // Accessibility check: disable floating if reduced motion is requested
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      element.style.setProperty("--float-y", "0px");
      element.style.setProperty("--float-r", "0deg");
      return;
    }

    let animationFrameId: number;
    // Add a random offset to prevent cards from starting perfectly in sync
    const randomOffset = Math.random() * 10000;
    const startTime = performance.now() + randomOffset;

    const updatePosition = (timestamp: number) => {
      const elapsedSeconds = (timestamp - startTime) / 1000;
      const frequency = (2 * Math.PI) / duration;

      const yOffset = Math.sin(elapsedSeconds * frequency) * amplitudeY;
      const rotateOffset = Math.cos(elapsedSeconds * frequency) * amplitudeRotate;

      element.style.setProperty("--float-y", `${yOffset.toFixed(3)}px`);
      element.style.setProperty("--float-r", `${rotateOffset.toFixed(3)}deg`);

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ref, duration, amplitudeY, amplitudeRotate]);
}
