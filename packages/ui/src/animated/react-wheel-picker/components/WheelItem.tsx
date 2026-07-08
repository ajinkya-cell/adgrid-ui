"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "../../../lib/utils";

import type { WheelItem as WheelItemType } from "../types";
import { getCircularDistance } from "../utils/math";

interface WheelItemProps {
  item: WheelItemType;
  index: number;
  totalItems: number;
  y: MotionValue<number>;
  itemHeight: number;
  loop: boolean;
  cylinderRadius: number;
  isActive: boolean;
  isHovered: boolean;
  disabled?: boolean;
  variant?: "glass" | "minimal" | "void";
  onClick?: () => void;
  renderItem?: (item: WheelItemType, isActive: boolean, index: number) => React.ReactNode;
}

export function WheelItem({
  item,
  index,
  totalItems,
  y,
  itemHeight,
  loop,
  cylinderRadius,
  isActive,
  isHovered,
  disabled = false,
  variant = "glass",
  onClick,
  renderItem,
}: WheelItemProps) {
  const d = useTransform(y, (latestY) => {
    let diff = index - latestY;
    if (loop) {
      diff = getCircularDistance(index, latestY, totalItems, true);
    }
    return diff;
  });

  const rotateX = useTransform(d, (diff) => `${-diff * 18}deg`);
  const translateY = useTransform(d, (diff) => {
    const angleRad = (diff * 18 * Math.PI) / 180;
    return `${cylinderRadius * Math.sin(angleRad)}px`;
  });
  const translateZ = useTransform(d, (diff) => {
    const angleRad = (diff * 18 * Math.PI) / 180;
    return `${cylinderRadius * (Math.cos(angleRad) - 1)}px`;
  });
  const scale = useTransform(d, (diff) => 1 - Math.min(0.2, Math.abs(diff) * 0.055));
  const opacity = useTransform(d, (diff) => Math.max(0.15, 1 - Math.abs(diff) * 0.22));
  const blur = useTransform(d, (diff) => {
    const b = Math.min(2.5, Math.abs(diff) * 0.55);
    return b > 0.1 ? `blur(${b}px)` : "blur(0px)";
  });
  const zIndex = useTransform(d, (diff) => Math.floor(100 - Math.abs(diff) * 2));

  const content = renderItem
    ? renderItem(item, isActive, index)
    : (
        <span
          className={cn(
            "truncate max-w-[85%] px-4 font-mono uppercase tracking-wider text-center transition-all duration-300",
            isActive
              ? "text-white text-xs font-bold"
              : (variant === "void" ? "text-white/30 text-[10px] font-normal" : "text-neutral-400 text-xs font-normal")
          )}
        >
          {item.label || item.value}
        </span>
      );

  return (
    <motion.div
      id={`wheel-item-${index}`}
      role="option"
      aria-selected={isActive}
      aria-disabled={disabled}
      className={cn(
        "absolute inset-x-0 flex items-center justify-center select-none transform-gpu will-change-transform",
        isActive && "cursor-pointer",
        isHovered && !isActive && "brightness-110 scale-[1.02] cursor-grab",
        disabled && "opacity-30 cursor-not-allowed pointer-events-none"
      )}
      style={{
        height: `${itemHeight}px`,
        rotateX,
        y: translateY,
        z: translateZ,
        scale,
        opacity,
        filter: blur,
        zIndex,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      onClick={onClick}
    >
      {item.icon && (
        <span className="mr-2 flex-shrink-0" aria-hidden="true">
          {item.icon}
        </span>
      )}
      {content}
    </motion.div>
  );
}