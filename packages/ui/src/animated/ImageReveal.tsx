"use client";

import React, { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

// Default high-quality sample images
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
];

export interface ImageLayerProps {
  src: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  alt?: string;
}

const ImageLayer: React.FC<ImageLayerProps> = ({
  src,
  index,
  total,
  progress,
  alt,
}) => {
  // Step bounds for each image in the scroll sequence
  const start = index / total;
  const end = (index + 1) / total;
  const peak = start + (end - start) * 0.22; // Point where entry reaches active focus before receding

  // Scale: enters slightly enlarged (1.08) then recedes back into screen depth (0.88)
  const scale = useTransform(
    progress,
    [start, peak, end],
    [1.08, 1.04, 0.88]
  );

  // Y-translation: First image is pinned. Subsequent images glide up smoothly from bottom on entry [start, peak]
  const y = useTransform(
    progress,
    [start, peak],
    [index === 0 ? "0%" : "100%", "0%"]
  );

  // Elegant, subtle brightness & contrast glow (tuned down from harsh blown-out values)
  const brightness = useTransform(
    progress,
    [start, peak, end],
    [1.35, 1.15, 1.0]
  );

  const contrast = useTransform(
    progress,
    [start, peak, end],
    [1.20, 1.08, 1.0]
  );

  // Combine motion values into standard CSS filter string
  const filter = useTransform(
    [brightness, contrast],
    ([b, c]) => `brightness(${b}) contrast(${c})`
  );

  // Smooth entry opacity
  const opacity = useTransform(
    progress,
    [start, start + (index === 0 ? 0 : 0.02)],
    [index === 0 ? 1 : 0, 1]
  );

  // Rich backdrop dimming overlay as image recedes deep into the background stack
  const recedeDarkness = useTransform(
    progress,
    [peak, end],
    [0, 0.55]
  );

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        filter,
        zIndex: index + 1,
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
    >
      {/* Background Image */}
      <img
        src={src}
        alt={alt || `Reveal Image ${index + 1}`}
        className="w-full h-full object-cover select-none"
      />

      {/* Receding Dark Backdrop Vignette */}
      <motion.div
        style={{ opacity: recedeDarkness }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10"
      />

      {/* SVG Grain Overlay - Tactile film noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay z-20">
        <svg className="w-full h-full">
          <filter id={`grain-${index}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.80"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>

          <rect
            width="100%"
            height="100%"
            filter={`url(#grain-${index})`}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export interface ImageRevealProps {
  /** Array of image URLs to reveal in sequence */
  images?: string[];
  /** Fallback single image URL */
  src?: string;
  /** Fallback alt text */
  alt?: string;
  /** Enable mouse wheel scroll locking hook (default: true) */
  wheelHook?: boolean;
  /** Scroll sensitivity factor (higher = slower step per wheel click) */
  sensitivity?: number;
  /** Custom container class names */
  className?: string;
}

export function ImageReveal({
  images,
  src,
  alt,
  wheelHook = true,
  sensitivity = 1400,
  className = "",
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, { stiffness: 65, damping: 26, mass: 1.1 });

  const imageList =
    images && images.length > 0
      ? images
      : src
      ? [src]
      : DEFAULT_IMAGES;

  // Intercept wheel & touch events to advance reveal progress smoothly with velocity clamping
  useEffect(() => {
    if (!wheelHook) return;
    const element = containerRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      const current = rawProgress.get();
      // Clamp delta per event to prevent sudden fast scrolls from skipping steps
      const rawDelta = e.deltaY / sensitivity;
      const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 0.12);
      const next = Math.min(1, Math.max(0, current + clampedDelta));

      // Lock page scroll while inside component range
      if (
        (e.deltaY > 0 && current < 0.999) ||
        (e.deltaY < 0 && current > 0.001)
      ) {
        e.preventDefault();
        e.stopPropagation();
        rawProgress.set(next);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touchCurrentY = e.touches[0].clientY;
        const deltaY = (touchStartY - touchCurrentY) * 1.5;
        const current = rawProgress.get();
        const rawDelta = deltaY / sensitivity;
        const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 0.12);
        const next = Math.min(1, Math.max(0, current + clampedDelta));

        if (
          (deltaY > 0 && current < 0.999) ||
          (deltaY < 0 && current > 0.001)
        ) {
          e.preventDefault();
          rawProgress.set(next);
        }
        touchStartY = touchCurrentY;
      }
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, [rawProgress, wheelHook, sensitivity]);

  const promptOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-neutral-950 text-white flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* Introductory Scroll Prompt */}
      <motion.div
        style={{ opacity: promptOpacity }}
        className="absolute z-0 flex flex-col items-center justify-center text-center space-y-3 pointer-events-none"
      >
        <p className="text-xs uppercase tracking-[0.3em] font-mono text-neutral-400">
          Scroll Down
          <br />
          To Reveal
          <br />
          The Images
        </p>
        <div className="w-[1px] h-12 bg-neutral-600 animate-pulse" />
      </motion.div>

      {/* Framed Display Area with Specular Bevel Border */}
      <div className="relative w-[85%] max-w-4xl aspect-[4/3] sm:aspect-[16/10] overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)] z-10 rounded-2xl bg-black">
        {imageList.map((imgSrc, index) => (
          <ImageLayer
            key={index}
            src={imgSrc}
            index={index}
            total={imageList.length}
            progress={progress}
            alt={alt}
          />
        ))}

        {/* Specular Edge Highlight Overlay */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none z-30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />
      </div>
    </div>
  );
}

export default ImageReveal;

