"use client";

import React, { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

// Default high-quality floral images matching requested Unsplash flower photography
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1621447578058-6543ad48e6b2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1784239608832-a23eff7a2b4c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1658702716533-2af83477971e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1589002817350-3be549af43b7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1657177458783-77f02f83e129?auto=format&fit=crop&w=1200&q=80",
];

// Unsplash photo page ID to direct image CDN URL mapping
const UNSPLASH_PAGE_MAP: Record<string, string> = {
  "gCWctwbJesc": "https://images.unsplash.com/photo-1784239608832-a23eff7a2b4c?auto=format&fit=crop&w=1200&q=80",
  "HNh9EfacXXM": "https://images.unsplash.com/photo-1658702716533-2af83477971e?auto=format&fit=crop&w=1200&q=80",
  "RKk9yMOONZs": "https://images.unsplash.com/photo-1589002817350-3be549af43b7?auto=format&fit=crop&w=1200&q=80",
  "GHQJhB2ATKM": "https://images.unsplash.com/photo-1621447578058-6543ad48e6b2?auto=format&fit=crop&w=1200&q=80",
  "SByu-FXu0Pw": "https://images.unsplash.com/photo-1657177458783-77f02f83e129?auto=format&fit=crop&w=1200&q=80",
};

/** Normalizes Unsplash photo web page links to direct image CDN links */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes("unsplash.com/photos/")) {
    for (const key of Object.keys(UNSPLASH_PAGE_MAP)) {
      if (url.includes(key)) {
        return UNSPLASH_PAGE_MAP[key];
      }
    }
  }
  return url;
}

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
  const revealEnd = start + (end - start) * 0.45; // Curtain wipe unroll window

  // Stage 1: Clip Path Progressive Reveal (bottom to top for ALL images starting from blank canvas)
  const clipTopPercent = useTransform(
    progress,
    [start, revealEnd],
    [100, 0]
  );

  const clipPath = useTransform(
    clipTopPercent,
    (top) => `inset(${top}% 0% 0% 0%)`
  );

  // Stage 2: 3D Depth Shrink & Recede (starts at 1.12 during unroll -> 1.0 settled -> shrinks to 0.85 receding into depth)
  const scale = useTransform(
    progress,
    [start, revealEnd, end],
    [1.12, 1.0, 0.85]
  );

  // Y translation syncing with the curtain reveal & recession
  const y = useTransform(
    progress,
    [start, revealEnd, end],
    ["8%", "0%", "-3%"]
  );

  // Elegant brightness & contrast exposure glow (peaks during active unroll, normalizes to 1.0)
  const brightness = useTransform(
    progress,
    [start, revealEnd, end],
    [1.45, 1.15, 1.0]
  );

  const contrast = useTransform(
    progress,
    [start, revealEnd, end],
    [1.25, 1.10, 1.0]
  );

  // Dynamic Film Grain Burst (flashes intense analog film noise during unroll, softens to subtle texture)
  const grainOpacity = useTransform(
    progress,
    [start, revealEnd, end],
    [0.65, 0.35, 0.20]
  );

  // Combine motion values into standard CSS filter string
  const filter = useTransform(
    [brightness, contrast],
    ([b, c]) => `brightness(${b}) contrast(${c})`
  );

  // Opacity: smooth entry flag (fades in as unroll begins for all images)
  const opacity = useTransform(
    progress,
    [start, start + 0.015],
    [0, 1]
  );

  // Backdrop darkness vignette fading in as image recedes into depth
  const recedeDarkness = useTransform(
    progress,
    [revealEnd, end],
    [0, 0.65]
  );

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        filter,
        clipPath,
        zIndex: index + 1,
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center rounded-none"
    >
      {/* Background Image */}
      <img
        src={src}
        alt={alt || `Reveal Image ${index + 1}`}
        className="w-full h-full object-cover select-none rounded-none"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
        }}
      />

      {/* Receding Dark Backdrop Vignette */}
      <motion.div
        style={{ opacity: recedeDarkness }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10"
      />

      {/* SVG Dynamic Grain Overlay - Film noise texture */}
      <motion.div
        style={{ opacity: grainOpacity }}
        className="absolute inset-0 pointer-events-none mix-blend-overlay z-20"
      >
        <svg className="w-full h-full">
          <filter id={`grain-${index}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
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
      </motion.div>
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
  /** Custom width for the container */
  width?: string | number;
  /** Custom height for the container */
  height?: string | number;
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
  width = "100%",
  height,
  wheelHook = true,
  sensitivity = 1400,
  className = "",
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, { stiffness: 65, damping: 26, mass: 1.1 });

  const imageList = (
    images && images.length > 0
      ? images
      : src
      ? [src]
      : DEFAULT_IMAGES
  ).map(normalizeImageUrl);

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
      className={`relative w-full h-full min-h-[440px] my-auto py-6 text-white flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
      style={{ perspective: "1200px", width, height }}
    >
      {/* Poppins Font Loader */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');` }} />
      {/* Introductory Scroll Prompt */}
      <motion.div
        style={{ opacity: promptOpacity }}
        className="absolute inset-0 z-0 flex items-center justify-center text-center pointer-events-none"
      >
        <span className="text-5xl sm:text-6xl md:text-7xl font-semibold font-['Poppins',sans-serif] text-neutral-300 tracking-tighter select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.12)]">
          Scroll
        </span>
      </motion.div>

      {/* Pure Floating Image Container — Full Square (No rounded edges, no borders, no cards) */}
      <div className="relative w-full max-w-lg sm:max-w-xl aspect-[16/10] overflow-hidden z-10 rounded-none shadow-none mt-16 sm:mt-24">
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
      </div>
    </div>
  );
}

export default ImageReveal;

