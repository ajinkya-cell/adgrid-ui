"use client";

import { useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";

export interface ImageRevealProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Stripe angle in degrees */
  stripeAngle?: number;
  /** Stripe width in px */
  stripeWidth?: number;
  /** Primary stripe color */
  stripeColor?: string;
  /** Secondary stripe color */
  stripeBg?: string;
  /** Trigger mode */
  trigger?: "hover" | "click";
  className?: string;
}

export function ImageReveal({
  src,
  alt,
  width = 360,
  height = 480,
  stripeAngle = -55,
  stripeWidth = 20,
  stripeColor = "#0f172a",
  stripeBg = "#1e293b",
  trigger = "hover",
  className = "",
}: ImageRevealProps) {
  const [revealed, setRevealedState] = useState(false);
  const clipProgress = useMotionValue(1); // 1 = fully masked, 0 = revealed

  // clipPath goes from "polygon(100% 0%,100% 0%,100% 100%,100% 100%)"
  // to "polygon(0% 0%,100% 0%,100% 100%,0% 100%)"
  const clipPath = useTransform(
    clipProgress,
    [0, 1],
    [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
    ]
  );

  const reveal = useCallback(() => {
    animate(clipProgress, 0, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    setRevealedState(true);
  }, [clipProgress]);

  const conceal = useCallback(() => {
    animate(clipProgress, 1, { duration: 0.5, ease: [0.4, 0, 0.6, 1] });
    setRevealedState(false);
  }, [clipProgress]);

  const handlers =
    trigger === "hover"
      ? { onMouseEnter: reveal, onMouseLeave: conceal }
      : {
          onClick: () => (revealed ? conceal() : reveal()),
        };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer select-none ${className}`}
      style={{ width, height }}
      {...handlers}
    >
      {/* Base image */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${width}px`}
        priority
      />

      {/* Animated gradient mask overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            ${stripeAngle}deg,
            ${stripeColor} 0px,
            ${stripeColor} ${stripeWidth}px,
            ${stripeBg} ${stripeWidth}px,
            ${stripeBg} ${stripeWidth * 2}px
          )`,
          clipPath,
          willChange: "clip-path",
        }}
      />

      {/* Subtle top-left shine */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Hint label */}
      <motion.span
        className="absolute bottom-4 right-4 font-syncopate text-[8px] font-bold tracking-[0.2em] uppercase"
        style={{ color: "rgba(255,255,255,0.5)" }}
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {trigger === "hover" ? "HOVER" : "TAP"}
      </motion.span>
    </div>
  );
}
