"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export interface ImageParallaxProps {
  src: string;
  alt: string;
  /** Container width (CSS value) */
  width?: string | number;
  /** Container height (CSS value) */
  height?: string | number;
  /** How many px the image travels on full mouse sweep */
  depth?: number;
  /** Diagonal grid stripe color */
  overlayColor?: string;
  /** Caption shown bottom-left */
  caption?: string;
  /** Sub-caption */
  subcaption?: string;
  /** Drive parallax from scroll instead of mouse (uses IntersectionObserver + scroll) */
  mode?: "mouse" | "scroll";
  className?: string;
}

export function ImageParallax({
  src,
  alt,
  width = "100%",
  height = 420,
  depth = 40,
  overlayColor = "rgba(0,0,0,0.07)",
  caption,
  subcaption,
  mode = "mouse",
  className = "",
}: ImageParallaxProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Raw motion values 0→1 representing cursor/scroll position
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  // Smooth spring followers
  const springX = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.5 });

  // Image translates in one direction
  const imgX = useTransform(springX, [0, 1], [depth / 2, -depth / 2]);
  const imgY = useTransform(springY, [0, 1], [depth / 2, -depth / 2]);

  // Overlay grid drifts the opposite direction (creates depth illusion)
  const overlayX = useTransform(springX, [0, 1], [-depth * 0.6, depth * 0.6]);
  const overlayY = useTransform(springY, [0, 1], [-depth * 0.6, depth * 0.6]);

  // Subtle scale breathes on hover
  const scale = useSpring(1, { stiffness: 100, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      rawX.set((e.clientX - rect.left) / rect.width);
      rawY.set((e.clientY - rect.top) / rect.height);
    },
    [rawX, rawY]
  );

  const handleMouseEnter = useCallback(() => scale.set(1.03), [scale]);
  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
    scale.set(1);
  }, [rawX, rawY, scale]);

  // Scroll mode
  useEffect(() => {
    if (mode !== "scroll" || !wrapRef.current) return;
    const el = wrapRef.current;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      // progress: 0 when bottom enters view, 1 when top exits
      const progress =
        1 - Math.min(1, Math.max(0, rect.bottom / (viewH + rect.height)));
      rawY.set(progress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, rawY]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: "relative",
    overflow: "hidden",
    borderRadius: "1rem",
  };

  return (
    <div
      ref={wrapRef}
      className={`group ${className}`}
      style={containerStyle}
      onMouseMove={mode === "mouse" ? handleMouseMove : undefined}
      onMouseEnter={mode === "mouse" ? handleMouseEnter : undefined}
      onMouseLeave={mode === "mouse" ? handleMouseLeave : undefined}
    >
      {/* Parallax image — oversized so it can travel without gaps */}
      <motion.div
        className="absolute"
        style={{
          inset: `-${depth + 10}px`,
          x: imgX,
          y: imgY,
          scale,
          willChange: "transform",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover pointer-events-none"
          sizes="100vw"
          priority
        />
      </motion.div>

      {/* Repeating diagonal grid overlay — drifts opposite the image */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            ${overlayColor} 0px,
            ${overlayColor} 1px,
            transparent 1px,
            transparent 10px
          )`,
          backgroundSize: "14px 14px",
          x: overlayX,
          y: overlayY,
          willChange: "background-position, transform",
        }}
      />

      {/* Dark vignette bottom gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)",
        }}
      />

      {/* Caption */}
      {(caption || subcaption) && (
        <div className="absolute bottom-5 left-6 right-6">
          {caption && (
            <motion.p
              className="text-white font-semibold text-lg leading-tight"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {caption}
            </motion.p>
          )}
          {subcaption && (
            <p
              className="text-white/60 text-sm mt-1 font-normal"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            >
              {subcaption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
