"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { RPM, stepSpin, type SpinState } from "./motion";

/**
 * The platter's rotation in degrees, as a motion value. While `active`, the record spins up to
 * `rpm`; when it goes false the record coasts down and stays at whatever angle it stopped on.
 * The frame loop runs only while the record is moving, and toggling `active` mid-spin never
 * restarts it or resets the angle; it only changes the speed the physics eases toward.
 * `disabled` (reduced motion) stops the record where it is.
 */
export function useRecordSpin(active: boolean, opts: { rpm?: number; disabled?: boolean } = {}): MotionValue<number> {
  const { rpm = RPM, disabled = false } = opts;
  const angle = useMotionValue(0);
  const state = useRef<SpinState>({ angle: 0, velocity: 0 });
  const live = useRef({ active, rpm });
  const frame = useRef<number | null>(null);

  // Read by the running loop, so a prop change steers it without restarting it.
  useLayoutEffect(() => {
    live.current = { active, rpm };
  }, [active, rpm]);

  useEffect(() => {
    const stop = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
    if (disabled) {
      stop();
      state.current.velocity = 0;
      return;
    }
    if (!active || frame.current !== null) return;

    let last = performance.now();
    const tick = (now: number) => {
      const next = stepSpin(state.current, (now - last) / 1000, live.current.active, live.current.rpm);
      last = now;
      state.current = next;
      angle.set(next.angle);
      frame.current = next.velocity === 0 && !live.current.active ? null : requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [active, disabled, angle]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    []
  );

  return angle;
}
