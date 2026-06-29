"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { getCircularDistance } from "./utils";

export interface UseCoverflowProps {
  totalItems: number;
  initialIndex?: number;
  autoPlay?: boolean;
  interval?: number;
  loop?: boolean;
}

export function useCoverflow({
  totalItems,
  initialIndex = 0,
  autoPlay = false,
  interval = 4000,
  loop = true,
}: UseCoverflowProps) {
  // snapIndex tracks the actual integer target page index (0 to totalItems - 1)
  const [activeSnapIndex, setActiveSnapIndex] = useState(initialIndex);
  
  // targetIndex is a virtual index that grows infinitely to support smooth infinite loop scrolling
  const targetIndexRef = useRef(initialIndex);
  
  const xVal = useMotionValue(initialIndex);
  const smoothIndex = useSpring(xVal, {
    stiffness: 180,
    damping: 20,
    mass: 0.8,
  });

  const isDraggingRef = useRef(false);
  const dragStartOffsetRef = useRef(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  // Sync state index when smoothIndex updates to update active item titles/labels
  useEffect(() => {
    const unsubscribe = smoothIndex.on("change", (latest) => {
      // Map floating smooth scroll position to base [0, N-1] index range
      let mapped = Math.round(latest) % totalItems;
      if (mapped < 0) mapped += totalItems;
      setActiveSnapIndex(mapped);
    });
    return () => unsubscribe();
  }, [smoothIndex, totalItems]);

  // Navigate to specific absolute index
  const navigateTo = useCallback(
    (index: number) => {
      let nextTarget = index;
      if (loop) {
        // Calculate shortest path on a circle from current target index
        const currentTarget = targetIndexRef.current;
        const diff = getCircularDistance(index % totalItems, currentTarget % totalItems, totalItems, true);
        nextTarget = currentTarget + diff;
      } else {
        // Clamp to item boundaries
        nextTarget = Math.max(0, Math.min(totalItems - 1, nextTarget));
      }
      
      targetIndexRef.current = nextTarget;
      xVal.set(nextTarget);
    },
    [loop, totalItems, xVal]
  );

  const next = useCallback(() => {
    navigateTo(targetIndexRef.current + 1);
  }, [navigateTo]);

  const prev = useCallback(() => {
    navigateTo(targetIndexRef.current - 1);
  }, [navigateTo]);

  // Autoplay loop setup
  useEffect(() => {
    if (!autoPlay) return;

    const startAutoplay = () => {
      autoplayTimerRef.current = setInterval(() => {
        if (!isHoveredRef.current && !isDraggingRef.current) {
          next();
        }
      }, interval);
    };

    startAutoplay();

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoPlay, interval, next]);

  return {
    smoothIndex,
    activeSnapIndex,
    targetIndex: targetIndexRef,
    xVal,
    isDragging: isDraggingRef,
    dragStartOffset: dragStartOffsetRef,
    isHovered: isHoveredRef,
    next,
    prev,
    navigateTo,
  };
}
