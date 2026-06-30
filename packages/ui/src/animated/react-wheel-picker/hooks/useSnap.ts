"use client";

import { useCallback } from "react";

import type { UseSnapReturn } from "../types";
import { calculateMomentumTarget, clamp } from "../utils/physics";

export function useSnap(
  totalItems: number,
  loop: boolean,
  getCurrentPosition: () => number,
  animateFn: (target: number, springConfig?: { stiffness: number; damping: number; mass: number }) => void,
  springConfig: { stiffness: number; damping: number; mass: number }
): UseSnapReturn {
  const isSnappingRef = { current: false };

  const snapToNearest = useCallback(
    (currentIndex: number, velocity?: number): number => {
      let target: number;

      if (velocity !== undefined && Math.abs(velocity) > 0.01) {
        const currentPos = getCurrentPosition();
        const momentumTarget = calculateMomentumTarget(currentPos, velocity);
        target = Math.round(momentumTarget);
      } else {
        target = Math.round(currentIndex);
      }

      if (!loop) {
        target = clamp(target, 0, totalItems - 1);
      } else {
        target = ((target % totalItems) + totalItems) % totalItems;
      }

      if (target !== currentIndex) {
        isSnappingRef.current = true;
        animateFn(target, springConfig);

        setTimeout(() => {
          isSnappingRef.current = false;
        }, 300);
      }

      return target;
    },
    [totalItems, loop, getCurrentPosition, animateFn, springConfig]
  );

  return {
    snapToNearest,
    isSnapping: isSnappingRef.current,
  };
}

export function calculateSnapTarget(
  currentPosition: number,
  totalItems: number,
  loop: boolean,
  velocity?: number
): number {
  let target: number;

  if (velocity !== undefined && Math.abs(velocity) > 0.01) {
    target = Math.round(calculateMomentumTarget(currentPosition, velocity));
  } else {
    target = Math.round(currentPosition);
  }

  if (!loop) {
    target = clamp(target, 0, totalItems - 1);
  } else {
    target = ((target % totalItems) + totalItems) % totalItems;
  }

  return target;
}