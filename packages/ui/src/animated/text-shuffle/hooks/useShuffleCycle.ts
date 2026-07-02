/* Manages cycling through an array of words with play/pause/goTo control. */

import { useState, useRef, useEffect, useCallback } from "react";

export interface UseShuffleCycleOptions {
  words: string[];
  duration: number;
  loop: boolean;
  onWordChange?: (index: number) => void;
}

export interface UseShuffleCycleReturn {
  currentIndex: number;
  isPaused: boolean;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
}

export function useShuffleCycle({
  words,
  duration,
  loop,
  onWordChange,
}: UseShuffleCycleOptions): UseShuffleCycleReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    if (!loop && indexRef.current >= words.length - 1) {
      return;
    }
    const nextIndex = loop
      ? (indexRef.current + 1) % words.length
      : Math.min(indexRef.current + 1, words.length - 1);

    setCurrentIndex(nextIndex);
    indexRef.current = nextIndex;
    onWordChange?.(nextIndex);
  }, [loop, words.length, onWordChange]);

  const scheduleNext = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      advance();
    }, duration);
  }, [duration, advance, clearTimer]);

  useEffect(() => {
    if (isPaused || words.length <= 1) {
      clearTimer();
      return;
    }
    scheduleNext();
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPaused, scheduleNext, clearTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pausedRef.current = isPaused;
        setIsPaused(true);
      } else {
        setIsPaused(pausedRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = useCallback(() => {
    clearTimer();
    if (!loop && indexRef.current >= words.length - 1) return;
    const nextIndex = loop
      ? (indexRef.current + 1) % words.length
      : Math.min(indexRef.current + 1, words.length - 1);
    setCurrentIndex(nextIndex);
    indexRef.current = nextIndex;
    onWordChange?.(nextIndex);
  }, [loop, words.length, onWordChange, clearTimer]);

  const previous = useCallback(() => {
    clearTimer();
    const prevIndex =
      indexRef.current === 0
        ? loop
          ? words.length - 1
          : 0
        : indexRef.current - 1;
    setCurrentIndex(prevIndex);
    indexRef.current = prevIndex;
    onWordChange?.(prevIndex);
  }, [loop, words.length, onWordChange, clearTimer]);

  const goTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= words.length) return;
      clearTimer();
      setCurrentIndex(target);
      indexRef.current = target;
      onWordChange?.(target);
    },
    [words.length, onWordChange, clearTimer],
  );

  const play = useCallback(() => {
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  return { currentIndex, isPaused, next, previous, goTo, play, pause };
}
