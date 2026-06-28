"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export interface ImageParallaxProps {
  /** Image source URL */
  src: string;
  /** Alt text */
  alt: string;
  /** Container width — any CSS value (default: "100%") */
  width?: string | number;
  /** Container height — any CSS value (default: 420) */
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
  /** Container class name */
  className?: string;
}

export function ImageParallax({
  src,
  alt,
  width = "100%",
  height = 420,
  depth = 40,
  overlayColor = "rgba(255,255,255,0.04)",
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

  // 3D Tilting transforms for container card (Yaw and Pitch rotation)
  const rotateX = useTransform(springY, [0, 1], [5, -5]);
  const rotateY = useTransform(springX, [0, 1], [-5, 5]);

  // Image translates in one direction
  const imgX = useTransform(springX, [0, 1], [depth / 2, -depth / 2]);
  const imgY = useTransform(springY, [0, 1], [depth / 2, -depth / 2]);

  // Overlay grid drifts the opposite direction (creates depth illusion)
  const overlayX = useTransform(springX, [0, 1], [-depth * 0.5, depth * 0.5]);
  const overlayY = useTransform(springY, [0, 1], [-depth * 0.5, depth * 0.5]);

  // Floating caption box drifts slightly for multi-layered depth
  const captionX = useTransform(springX, [0, 1], [-depth * 0.15, depth * 0.15]);
  const captionY = useTransform(springY, [0, 1], [-depth * 0.15, depth * 0.15]);

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

  const handleMouseEnter = useCallback(() => scale.set(1.02), [scale]);
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
    borderRadius: "1.25rem",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  };

  return (
    <div style={{ perspective: "1200px", width }}>
      <motion.div
        ref={wrapRef}
        className={`group relative overflow-hidden ${className}`}
        style={{
          ...containerStyle,
          rotateX: mode === "mouse" ? rotateX : 0,
          rotateY: mode === "mouse" ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        onMouseMove={mode === "mouse" ? handleMouseMove : undefined}
        onMouseEnter={mode === "mouse" ? handleMouseEnter : undefined}
        onMouseLeave={mode === "mouse" ? handleMouseLeave : undefined}
      >
        {/* Specular Inner Highlight Overlay Bevel */}
        <div className="absolute inset-0 rounded-[1.25rem] border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.6)] pointer-events-none z-20" />

        {/* Parallax image — oversized so it can travel without gaps */}
        <motion.div
          className="absolute"
          style={{
            inset: `-${depth + 10}px`,
            x: imgX,
            y: imgY,
            scale,
            transformStyle: "preserve-3d",
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
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-15"
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
            willChange: "transform",
          }}
        />

        {/* Very subtle ambient bottom shadow gradient */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.02) 40%, transparent 100%)",
          }}
        />

        {/* Premium Frosted Glass Caption Panel */}
        {(caption || subcaption) && (
          <motion.div
            className="absolute bottom-6 left-6 right-6 p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] z-25 pointer-events-none"
            style={{
              x: mode === "mouse" ? captionX : 0,
              y: mode === "mouse" ? captionY : 0,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {caption && (
              <h4 className="text-white font-syncopate text-[8px] uppercase tracking-[0.2em] font-bold opacity-60 mb-1.5">
                {caption}
              </h4>
            )}
            {subcaption && (
              <p className="text-neutral-100 font-plus-jakarta text-xs font-semibold leading-relaxed">
                {subcaption}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
