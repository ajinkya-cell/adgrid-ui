"use client";

import { useCallback } from "react";

import type { UseInfiniteLoopReturn, WheelItem } from "../types";

export function useInfiniteLoop(
  items: WheelItem[],
  _currentIndex: number,
  _visibleItems: number
): UseInfiniteLoopReturn {
  const totalItems = items.length;

  const adjustIndex = useCallback(
    (index: number): number => {
      if (totalItems === 0) return 0;
      return ((index % totalItems) + totalItems) % totalItems;
    },
    [totalItems]
  );

  const getLoopIndices = useCallback(
    (centerIndex: number, count: number): number[] => {
      if (totalItems === 0) return [];

      const half = Math.floor(count / 2);
      const indices: number[] = [];

      for (let i = -half; i <= half; i++) {
        const idx = adjustIndex(centerIndex + i);
        indices.push(idx);
      }

      return indices;
    },
    [totalItems, adjustIndex]
  );

  return {
    adjustIndex,
    getLoopIndices,
    totalItems,
  };
}

export function createInfiniteItems<T extends WheelItem>(
  items: T[],
  repeatCount: number = 3
): T[] {
  if (items.length === 0) return [];

  const result: T[] = [];
  for (let i = 0; i < repeatCount; i++) {
    items.forEach((item, index) => {
      result.push({
        ...item,
        value: `${item.value}__${i}_${index}`,
      } as T);
    });
  }
  return result;
}

export function getInfiniteIndex(
  index: number,
  originalLength: number,
  repeatCount: number = 3
): number {
  if (originalLength === 0) return 0;
  const totalLength = originalLength * repeatCount;
  const adjusted = ((index % totalLength) + totalLength) % totalLength;
  return adjusted % originalLength;
}

export function findCenterIndex(
  totalLength: number,
  repeatCount: number = 3
): number {
  return Math.floor((totalLength * repeatCount) / 2);
}