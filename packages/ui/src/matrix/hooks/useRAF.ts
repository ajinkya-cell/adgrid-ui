"use client";

import { useEffect, useRef } from 'react';

/**
 * Executes a high-performance requestAnimationFrame loop.
 * Supports capping frame rate to a target FPS (e.g. 30 FPS) and computes delta time.
 */
export function useRAF(
  callback: (timeSeconds: number, deltaTimeSeconds: number) => void,
  active = true,
  fps = 60
) {
  const savedCallback = useRef(callback);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
      return;
    }

    const frameIntervalMs = 1000 / fps;

    const tick = (timestampMs: number) => {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestampMs;
        requestRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsedMs = timestampMs - previousTimeRef.current;

      if (elapsedMs >= frameIntervalMs) {
        // Adjust for clock drift
        previousTimeRef.current = timestampMs - (elapsedMs % frameIntervalMs);
        
        const deltaTimeSeconds = elapsedMs / 1000;
        accumulatedTimeRef.current += deltaTimeSeconds;

        savedCallback.current(accumulatedTimeRef.current, deltaTimeSeconds);
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, fps]);
}
export default useRAF;
