"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useMotionValue, useSpring, animate } from "framer-motion";

import type {
  WheelPickerProps,
  UseWheelReturn,
  ScrollToOptions,
} from "../types";
import { playClickSound } from "../utils/audio";

export function useWheel(props: WheelPickerProps): UseWheelReturn {
  const {
    items = [],
    value,
    defaultValue,
    onChange,
    loop = false,
    sound = true,
    disabled = false,
    spring,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const total = items.length;

  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState(() => {
    const initial = isControlled ? value : (defaultValue || items[0]?.value || "");
    return initial;
  });

  const activeValue = isControlled ? value : localValue;

  const initialIndex = items.findIndex((item) => item.value === activeValue);
  const startIndex = initialIndex !== -1 ? initialIndex : 0;

  const y = useMotionValue(startIndex);
  const smoothY = useSpring(y, {
    stiffness: spring?.stiffness ?? 180,
    damping: spring?.damping ?? 24,
    mass: spring?.mass ?? 0.8,
  });

  const lastIndexRef = useRef(startIndex);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const scrollToIndex = useCallback(
    (index: number, options?: ScrollToOptions) => {
      if (disabled) return;

      let target = index;
      if (!loop) {
        target = Math.max(0, Math.min(total - 1, target));
      }

      const springConfig = options?.spring || {
        stiffness: 180,
        damping: 24,
        mass: 0.8,
      };

      isAnimatingRef.current = true;
      animate(y, target, {
        type: "spring",
        ...springConfig,
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    },
    [y, disabled, loop, total]
  );

  const scrollToValue = useCallback(
    (valueToFind: string, options?: ScrollToOptions) => {
      const targetIdx = items.findIndex((item) => item.value === valueToFind);
      if (targetIdx !== -1) {
        scrollToIndex(targetIdx, options);
      }
    },
    [items, scrollToIndex]
  );

  useEffect(() => {
    if (isControlled && value !== undefined) {
      const targetIdx = items.findIndex((item) => item.value === value);
      if (targetIdx !== -1 && targetIdx !== lastIndexRef.current) {
        lastIndexRef.current = targetIdx;
        scrollToIndex(targetIdx);
      }
    }
  }, [value, items, isControlled, scrollToIndex]);

  useEffect(() => {
    const unsubscribe = smoothY.on("change", (latest) => {
      const rounded = Math.round(latest);
      let activeIdx = rounded;

      if (loop) {
        activeIdx = ((rounded % total) + total) % total;
      } else {
        activeIdx = Math.max(0, Math.min(total - 1, rounded));
      }

      if (activeIdx !== lastIndexRef.current) {
        lastIndexRef.current = activeIdx;

        if (sound && !disabled && !isDraggingRef.current) {
          playClickSound();
        }

        if (!isControlled) {
          setLocalValue(items[activeIdx]?.value || "");
        }

        if (onChange) {
          onChange(items[activeIdx]?.value || "");
        }
      }
    });

    return unsubscribe;
  }, [smoothY, total, loop, sound, disabled, items, onChange, isControlled]);

  const navigateTo = useCallback(
    (index: number) => {
      scrollToIndex(index);
    },
    [scrollToIndex]
  );

  const next = useCallback(() => {
    if (disabled) return;
    scrollToIndex(lastIndexRef.current + 1);
  }, [disabled, scrollToIndex]);

  const previous = useCallback(() => {
    if (disabled) return;
    scrollToIndex(lastIndexRef.current - 1);
  }, [disabled, scrollToIndex]);

  const getCurrentIndex = useCallback(() => {
    return lastIndexRef.current;
  }, []);

  const getCurrentValue = useCallback(() => {
    return items[lastIndexRef.current]?.value || "";
  }, [items]);

  const setCurrentIndex = useCallback(
    (index: number) => {
      lastIndexRef.current = index;
      if (!isControlled) {
        setLocalValue(items[index]?.value || "");
      }
      y.set(index);
    },
    [items, isControlled, y]
  );

  const setIsDragging = useCallback((value: boolean) => {
    isDraggingRef.current = value;
  }, []);

  const setDragStartOffset = useCallback((value: number) => {
    y.set(value);
  }, [y]);

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    items,
    currentIndex: lastIndexRef.current,
    targetIndex: Math.round(y.get()),
    smoothIndex: smoothY.get(),
    isDragging: isDraggingRef.current,
    isAnimating: isAnimatingRef.current,
    dragStartOffset: y.get(),
    setIsDragging,
    setDragStartOffset,
    navigateTo,
    next,
    previous,
    scrollToValue,
    scrollToIndex,
    getCurrentIndex,
    getCurrentValue,
    setCurrentIndex,
  };
}