"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { CarouselItem } from "./types";
import { getCircularDistance, getCardTransforms } from "./utils";

interface CoverflowCardProps {
  item: CarouselItem;
  index: number;
  totalItems: number;
  smoothIndex: MotionValue<number>;
  loop: boolean;
  onClick: () => void;
}

function getImageUrl(image: any): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object") {
    if ("src" in image) return image.src;
    if ("default" in image) return image.default;
  }
  return "";
}

export function CoverflowCard({
  item,
  index,
  totalItems,
  smoothIndex,
  loop,
  onClick,
}: CoverflowCardProps) {
  // Track circular modular distance d relative to scroll position
  const d = useTransform(smoothIndex, (cVal) => {
    return getCircularDistance(index, cVal, totalItems, loop);
  });

  // Dynamically map positions from modular distance
  const rotateY = useTransform(d, (val) => getCardTransforms(val).rotateY);
  const x = useTransform(d, (val) => getCardTransforms(val).translateX);
  const z = useTransform(d, (val) => getCardTransforms(val).translateZ);
  const scale = useTransform(d, (val) => getCardTransforms(val).scale);
  const opacity = useTransform(d, (val) => getCardTransforms(val).opacity);
  const zIndex = useTransform(d, (val) => getCardTransforms(val).zIndex);
  const overlayOpacity = useTransform(d, (val) => getCardTransforms(val).overlayOpacity);

  return (
    <motion.div
      style={{
        rotateY,
        x,
        z,
        scale,
        opacity,
        zIndex,
        transformStyle: "preserve-3d",
      }}
      onClick={onClick}
      className="absolute top-0 left-1/2 -ml-[130px] w-[260px] h-[340px] rounded-2xl cursor-pointer select-none transform-gpu will-change-transform shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/5 bg-neutral-900 overflow-visible group"
      aria-label={`Slide ${index + 1}: ${item.title || "Image"}`}
      role="group"
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden pointer-events-none transform-gpu transition-transform duration-500 group-hover:scale-[1.02]">
        {/* Darkening overlay for background cards */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-black pointer-events-none z-10"
        />

        {/* Core Card Image */}
        <img
          src={getImageUrl(item.image)}
          alt={item.title || ""}
          className="w-full h-full object-cover select-none pointer-events-none grayscale"
          draggable={false}
        />

        {/* Text details overlay: centered flex badge with zero fractional transforms */}
       
      </div>

      {/* Cinematic Mirror Reflection - using mask-image with linear gradients */}
      <div 
        className="absolute top-[102%] left-0 right-0 h-[30%] overflow-hidden pointer-events-none select-none opacity-30 transform scaleY(-1) origin-top rounded-b-2xl border-t border-white/10"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 80%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 80%)",
        }}
      >
        <img
          src={getImageUrl(item.image)}
          alt=""
          className="w-full h-full object-cover grayscale"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
