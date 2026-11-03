"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether an annotation should animate: the caller's `animate` prop, turned off when the
 * visitor asks for reduced motion. The mark is then drawn in its final state straight away.
 *
 * The media query is read after mount, so server and client render the same markup
 * (no hydration mismatch); the switch happens before any mark starts drawing.
 */
export function useRoughMotion(animate: boolean): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia(QUERY);
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return animate && !reduce;
}

/** Transition used when an annotation must not animate: jump straight to the final state. */
export const INSTANT = { duration: 0 } as const;
