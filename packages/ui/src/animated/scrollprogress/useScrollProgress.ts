"use client";

import { useScroll, useSpring, useVelocity, useTransform } from 'framer-motion';

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();

  // Custom buttery smooth spring behavior: stiffness: 120, damping: 25, mass: 0.6
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.6,
  });

  // Calculate current scrolling velocity
  const scrollVelocity = useVelocity(smoothProgress);

  // Map velocity to horizontal stretch factor (scaleX)
  const scaleX = useTransform(scrollVelocity, (velocity) => {
    const absVelocity = Math.abs(velocity);
    // 1 is normal scale. Stretch increases with velocity, clamp max stretch to 2.5
    return 1 + Math.min(absVelocity * 12, 1.5);
  });

  // Map velocity to indicator glow intensity factor
  const glowIntensity = useTransform(scrollVelocity, (velocity) => {
    const absVelocity = Math.abs(velocity);
    return Math.min(absVelocity * 5, 0.9);
  });

  return {
    scrollYProgress,
    smoothProgress,
    scaleX,
    glowIntensity,
  };
}
