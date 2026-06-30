"use client";

import { useRef, useCallback, useEffect } from "react";
import type { MotionValue, SpringOptions } from "framer-motion";

import type { UseMomentumReturn } from "../types";
import { MOMENTUM_FRICTION, MOMENTUM_THRESHOLD, calculateMomentumTarget } from "../utils/physics";

export function useMomentum(
  position: MotionValue<number>,
  springConfig: SpringOptions = { stiffness: 120, damping: 20, mass: 0.7 }
): UseMomentumReturn {
  const velocityRef = useRef(0);
  const isDeceleratingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastPositionRef = useRef(position.get());
  const lastTimeRef = useRef(Date.now());

  const startMomentum = useCallback(
    (initialVelocity: number) => {
      velocityRef.current = initialVelocity;
      isDeceleratingRef.current = true;

      const animate = () => {
        if (!isDeceleratingRef.current) return;

        const currentPos = position.get();
        velocityRef.current *= MOMENTUM_FRICTION;

        if (Math.abs(velocityRef.current) < MOMENTUM_THRESHOLD) {
          isDeceleratingRef.current = false;
          const target = Math.round(calculateMomentumTarget(currentPos, velocityRef.current));
          position.set(target);
          return;
        }

        position.set(currentPos - velocityRef.current * 0.1);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [position, springConfig]
  );

  const stopMomentum = useCallback(() => {
    isDeceleratingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = position.on("change", (latest: number) => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;

      if (dt > 0 && dt < 0.1) {
        velocityRef.current = (latest - lastPositionRef.current) / dt;
      }

      lastPositionRef.current = latest;
      lastTimeRef.current = now;
    });

    return () => {
      unsubscribe();
      stopMomentum();
    };
  }, [position, stopMomentum]);

  return {
    velocity: velocityRef.current,
    startMomentum,
    stopMomentum,
    isDecelerating: isDeceleratingRef.current,
  };
}

export function useMomentumTracker(position: MotionValue<number>): {
  velocity: number;
  update: (newPosition: number) => void;
} {
  const velocityRef = useRef(0);
  const lastPositionRef = useRef(position.get());
  const lastTimeRef = useRef(Date.now());

  const update = useCallback((newPosition: number) => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000;

    if (dt > 0 && dt < 0.1) {
      velocityRef.current = (newPosition - lastPositionRef.current) / dt;
    }

    lastPositionRef.current = newPosition;
    lastTimeRef.current = now;
  }, []);

  return {
    velocity: velocityRef.current,
    update,
  };
}