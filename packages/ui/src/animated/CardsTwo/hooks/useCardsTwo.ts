import { Ref, useImperativeHandle } from "react";
import { MotionValue } from "framer-motion";
import { CardsTwoRef } from "../types";

interface UseCardsTwoRefParams {
  ref: Ref<CardsTwoRef> | undefined;
  targetAngle: MotionValue<number>;
  angularSpacing: number;
  cardCount: number;
  setIsPlaying: (playing: boolean) => void;
  getSnappedAngle: (angle: number) => number;
}

export function useCardsTwoRef({
  ref,
  targetAngle,
  angularSpacing,
  cardCount,
  setIsPlaying,
  getSnappedAngle,
}: UseCardsTwoRefParams) {
  useImperativeHandle(ref, () => ({
    next: () => {
      const current = targetAngle.get();
      // Snap to nearest index first before decrementing to avoid cumulative offset errors
      const snapped = getSnappedAngle(current);
      targetAngle.set(snapped - angularSpacing);
    },
    previous: () => {
      const current = targetAngle.get();
      // Snap to nearest index first before incrementing to avoid cumulative offset errors
      const snapped = getSnappedAngle(current);
      targetAngle.set(snapped + angularSpacing);
    },
    rotateTo: (index: number) => {
      const boundedIndex = Math.max(0, Math.min(cardCount - 1, index));
      targetAngle.set(-boundedIndex * angularSpacing);
    },
    rotateBy: (angleDegrees: number) => {
      const angleRad = (angleDegrees * Math.PI) / 180;
      targetAngle.set(targetAngle.get() + angleRad);
    },
    reset: () => {
      targetAngle.set(0);
    },
    pause: () => {
      setIsPlaying(false);
    },
    play: () => {
      setIsPlaying(true);
    },
    getActiveIndex: () => {
      const current = targetAngle.get();
      if (angularSpacing === 0) return 0;
      const rawIndex = -current / angularSpacing;
      return Math.max(0, Math.min(cardCount - 1, Math.round(rawIndex)));
    },
  }));
}
