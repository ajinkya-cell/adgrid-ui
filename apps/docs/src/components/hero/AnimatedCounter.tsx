"use client";

import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2.0,
  prefix = "",
  suffix = ""
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === "undefined") return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    let activeAnimation: { stop: () => void } | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          activeAnimation = animate(0, value, {
            duration,
            ease: "easeOut",
            onUpdate: (latest) => {
              setDisplayValue(Math.round(latest));
            }
          });
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
      if (activeAnimation) {
        activeAnimation.stop();
      }
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
