"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate } from "framer-motion";
import { EASE_OUT } from "./scale";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Tweens a list of numbers toward `target`. On mount it rises from zero (when `fromZero`), and on
 * every change it glides from where it is. Under reduced motion it jumps straight to the target.
 */
export function useTween(target: number[], fromZero = true, duration = 0.8) {
  const [shown, setShown] = useState<number[]>(() => (fromZero ? target.map(() => 0) : target));
  const shownRef = useRef(shown);
  const key = target.join(",");

  useEffect(() => {
    const to = target;
    const from = shownRef.current;
    const set = (v: number[]) => {
      shownRef.current = v;
      setShown(v);
    };
    if (reducedMotion()) {
      set(to);
      return;
    }
    const controls = animate(0, 1, {
      duration,
      ease: EASE_OUT,
      onUpdate: (t) => set(to.map((v, i) => (from[i] ?? 0) + (v - (from[i] ?? 0)) * t)),
    });
    return () => controls.stop();
    // `key` stands in for the array's contents.
  }, [key, duration]);

  return target.map((_, i) => shown[i] ?? 0);
}

/** The content width of an element, kept current with a ResizeObserver. */
export function useWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((node: T | null) => {
    observer.current?.disconnect();
    if (!node) return;
    setWidth(node.clientWidth);
    observer.current = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.current.observe(node);
  }, []);
  useEffect(() => () => observer.current?.disconnect(), []);
  return [ref, width] as const;
}

/** Arrow-key movement through `count` items, for focusable plots. */
export function useActiveIndex(count: number) {
  const [active, setActive] = useState<number | null>(null);
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : count - 1);
    } else if (step) {
      e.preventDefault();
      setActive((a) => (a == null ? (step > 0 ? 0 : count - 1) : Math.min(Math.max(a + step, 0), count - 1)));
    } else if (e.key === "Escape") setActive(null);
  };
  const focusProps = {
    tabIndex: 0,
    onKeyDown,
    onFocus: () => setActive((a) => a ?? count - 1),
    onBlur: () => setActive(null),
  };
  return { active, setActive, focusProps };
}
