import React, { useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { PositionedName } from "./layoutEngine";

interface NameItemProps {
  item: PositionedName;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  hoverScale: number;
  hoverBrightness: number;
  isMatched: boolean;
  searchActive: boolean;
  colorMode: "light" | "dark";
  fontFamily: "sans" | "mono" | "grotesk" | "serif" | "suisse";
  fontWeight?: number;
  mouseParallax: boolean;
  renderName?: (
    name: string,
    index: number,
    state: { isHovered: boolean; isHighlighted: boolean; isMatched: boolean }
  ) => React.ReactNode;
}

export function NameItem({
  item,
  mouseX,
  mouseY,
  hoverScale = 1.08,
  hoverBrightness = 1.15,
  isMatched,
  searchActive,
  colorMode,
  fontFamily,
  fontWeight,
  mouseParallax,
  renderName
}: NameItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDark = colorMode === "dark";

  // 1. Set font stack classes
  let fontClass = "font-sans";
  const inlineStyles: React.CSSProperties = {};

  if (fontFamily === "mono") {
    fontClass = "font-mono";
  } else if (fontFamily === "serif") {
    fontClass = "font-serif";
  } else if (fontFamily === "grotesk") {
    inlineStyles.fontFamily = "'Space Grotesk', sans-serif";
  } else if (fontFamily === "suisse") {
    inlineStyles.fontFamily = "'Suisse Int\\'l', 'Suisse', 'Inter', sans-serif";
  }

  // 2. Compute text colors based on colorMode, highlighting, and search query match state
  const getColors = () => {
    if (searchActive) {
      if (isMatched) {
        return isDark ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "text-neutral-900 font-bold";
      }
      return isDark ? "text-neutral-800 opacity-15" : "text-neutral-300 opacity-15";
    }

    if (item.isHighlighted) {
      return isDark ? "text-white" : "text-neutral-900";
    }

    // Default layered opacity colors
    if (item.z === 0) return isDark ? "text-neutral-100" : "text-neutral-800";
    if (item.z === 1) return isDark ? "text-neutral-400" : "text-neutral-600";
    return isDark ? "text-neutral-600" : "text-neutral-400";
  };

  const rawDistance = useTransform([mouseX, mouseY], (latest: unknown) => {
    const [mx, my] = latest as [number, number];
    if (searchActive) return 9999; // bypass cursor lighting during active searches
    const dx = mx - item.x;
    const dy = my - item.y;
    return Math.sqrt(dx * dx + dy * dy);
  });

  // Interpolate opacity/brightness relative to distance
  // Foreground layers get full dynamic brightness, background layers are slightly illuminated
  const brightnessMap = item.z === 0 ? [hoverBrightness, 1.0] : item.z === 1 ? [1.12, 1.0] : [1.05, 1.0];
  const opacityMap = item.z === 0 ? [1.0, 0.85] : item.z === 1 ? [0.75, 0.5] : [0.45, 0.28];

  const derivedBrightness = useTransform(rawDistance, [0, 240], brightnessMap);
  const derivedOpacity = useTransform(rawDistance, [0, 240], opacityMap);

  // Transform brightness motion value into a valid CSS filter string
  const filterString = useTransform(derivedBrightness, (val) => `brightness(${val})`);

  // Fallback constant motion value if mouseParallax or cursorLighting is not running
  const staticOpacity = item.z === 0 ? 0.9 : item.z === 1 ? 0.55 : 0.32;

  // Stagger delay based on index hash
  const initialDelay = (item.name.charCodeAt(0) % 10) * 0.08;

  const itemState = {
    isHovered,
    isHighlighted: item.isHighlighted,
    isMatched
  };

  return (
    <motion.div
      className="absolute pointer-events-auto origin-center select-none"
      style={{
        left: item.x,
        top: item.y,
        zIndex: 50 - item.z * 15 + (isHovered ? 100 : 0)
      }}
      initial={{ opacity: 0, y: item.y + 16, scale: 0.92 }}
      animate={{ 
        opacity: 1, 
        y: item.y, 
        scale: searchActive && isMatched ? 1.15 : 1.0 
      }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 14,
        delay: initialDelay
      }}
    >
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          opacity: searchActive ? undefined : (mouseParallax ? derivedOpacity : staticOpacity),
          filter: searchActive ? undefined : (mouseParallax ? filterString : undefined),
          fontSize: `${item.fontSize}px`,
          rotate: `${item.rotation}deg`,
          fontWeight: fontWeight ?? (item.isHighlighted ? 800 : 400),
          cursor: "pointer",
          willChange: "transform, opacity",
          ...inlineStyles
        }}
        animate={{
          scale: isHovered ? hoverScale : 1.0,
          filter: isHovered ? `brightness(${hoverBrightness})` : `brightness(1.0)`,
          textDecoration: isHovered ? "underline" : "none",
        }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 12
        }}
        className={`tracking-tight whitespace-nowrap transition-colors duration-200 ${fontClass} ${getColors()}`}
      >
        {renderName ? renderName(item.name, 0, itemState) : item.name}
      </motion.div>
    </motion.div>
  );
}
