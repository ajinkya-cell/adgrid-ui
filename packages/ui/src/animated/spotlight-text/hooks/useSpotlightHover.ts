"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSpotlightHover() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleTouchStart = useCallback(() => setIsHovered(true), []);
  const handleTouchEnd = useCallback(() => setIsHovered(false), []);

  return {
    containerRef,
    textLayerRef,
    isHovered,
    reducedMotion,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
}

interface BulbCenter {
  x: number;
  y: number;
}

export function useBulbPositions(
  textLayerRef: React.RefObject<HTMLSpanElement | null>,
  deps: unknown[]
) {
  const [bulbCenters, setBulbCenters] = useState<BulbCenter[]>([]);

  useEffect(() => {
    const layer = textLayerRef.current;
    if (!layer) return;

    const measure = () => {
      const layerRect = layer.getBoundingClientRect();
      const bulbs = layer.querySelectorAll<HTMLElement>("[data-bulb]");

      setBulbCenters(
        Array.from(bulbs).map((bulb) => {
          const rect = bulb.getBoundingClientRect();
          return {
            x: rect.left - layerRect.left + rect.width / 2,
            y: rect.top - layerRect.top + rect.height / 2,
          };
        })
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(layer);

    document.fonts?.ready.then(measure).catch(() => measure());

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return bulbCenters;
}

function buildBulbGlowGradient(
  centers: BulbCenter[],
  radius: number,
  core: string,
  mid: string
): string {
  return centers
    .map(
      (center) =>
        `radial-gradient(circle ${radius}px at ${center.x}px ${center.y}px, ${core} 0%, ${mid} 38%, transparent 72%)`
    )
    .join(", ");
}

export { buildBulbGlowGradient };
export type { BulbCenter };
