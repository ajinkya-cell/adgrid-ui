import { useScroll, useSpring, useVelocity, useTransform } from 'framer-motion';

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();

  // Smooth the scroll progress to avoid jittery movements
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 20,
    stiffness: 80,
    restDelta: 0.001,
  });

  // Track the raw velocity of the scrolling progress
  const velocity = useVelocity(scrollYProgress);

  // Map velocity to subtle vertical stretch (stretching height/thickness)
  const stretchY = useTransform(velocity, (v) => {
    const absV = Math.abs(v);
    return 1 + Math.min(absV * 4, 0.3); // Cap vertical stretch at 1.3
  });

  // Map velocity to subtle horizontal stretch (stretching width)
  const stretchX = useTransform(velocity, (v) => {
    const absV = Math.abs(v);
    return 1 + Math.min(absV * 3, 0.2); // Cap horizontal stretch at 1.2
  });

  // Map velocity to additional glow opacity boost
  const glowIntensity = useTransform(velocity, (v) => {
    const absV = Math.abs(v);
    return Math.min(absV * 5, 0.4); // Cap the glow boost
  });

  return {
    smoothProgress,
    stretchY,
    stretchX,
    glowIntensity,
  };
}
