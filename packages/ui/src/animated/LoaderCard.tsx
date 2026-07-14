"use client";

import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";
import type { Icon } from "@tabler/icons-react";

// All animatable CSS properties reset to their neutral state after each fire
const IDLE = {
  rotate: 0,
  scale: 1,
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  opacity: 1,
  rotateY: 0,
  rotateX: 0,
} as const;

export interface AnimatedIconCardProps {
  icon: Icon;
  /**
   * A TargetAndTransition object passed directly to `useAnimation().start()`.
   * Must include a `transition` key. Fires on click and auto-resets to idle.
   */
  animation: TargetAndTransition;
  /** Icon size in px — default 36 */
  iconSize?: number;
  /** Card size in px — default 88 */
  cardSize?: number;
}

/**
 * AnimatedIconCard
 *
 * A small black card hosting a single white Tabler icon.
 * Click the card to fire the animation sequence once; it auto-resets.
 * No hover state, no shadows, no color — pure monochrome.
 */
export const AnimatedIconCard: React.FC<AnimatedIconCardProps> = ({
  icon: Icon,
  animation,
  iconSize = 28,
  cardSize = 88,
}) => {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start(animation);
    // Snap back to neutral — no visible transition, just immediate reset
    controls.set(IDLE);
    setFiring(false);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-center bg-[#0a0a0a] border border-white/[0.07] rounded-xl cursor-pointer"
      style={{ width: cardSize, height: cardSize }}
    >
      <motion.div animate={controls} initial={IDLE}>
        <Icon size={iconSize} stroke={2} color="white" />
      </motion.div>
    </div>
  );
};
