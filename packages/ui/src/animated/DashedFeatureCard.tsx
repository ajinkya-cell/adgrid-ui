"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { IconAlertCircle } from "@tabler/icons-react";
import { cn } from "../lib/utils";

export interface DashedFeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;

  // Variant Setting
  cardVariant?: "dashed" | "bevel";

  // Edges / Roundness Customization
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  iconRounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";

  // Border Style & Dash/Dot Customization
  borderStyle?: "dashed" | "dotted" | "solid";
  dashLength?: number;
  dashGap?: number;
  dashWidth?: number;
  dashColor?: string;
  dashHoverColor?: string;
  dashOpacity?: number;
  dashHoverOpacity?: number;
  dashShift?: number;

  // Layout / Backgrounds / Shadows
  bgColor?: string;
  hoverBgColor?: string;
  showShadow?: boolean;
  shadowStyle?: string;

  // Motion physics
  hoverScale?: number;
  hoverY?: number;
  springStiffness?: number;
  springDamping?: number;

  // Corner Frame Crop Marks Customization
  showCorners?: boolean;
  cornerColor?: string;
  cornerHoverColor?: string;
  cornerLength?: number;
  cornerWidth?: number;
  cornerOffset?: number;
  iconOnly?: boolean;
}

const tailwindRoundedMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const svgRadiusMap = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
};

export function DashedFeatureCard({
  title,
  description,
  icon,
  onClick,
  className,
  cardVariant = "dashed",
  rounded = "none",
  iconRounded = "none",
  borderStyle = "dashed",
  dashLength = 8,
  dashGap = 4,
  dashWidth = 1,
  dashColor = "rgba(255, 255, 255, 0.22)",
  dashHoverColor = "rgba(255, 255, 255, 0.55)",
  dashOpacity = 1,
  dashHoverOpacity = 1,
  dashShift = 8,
  bgColor = "bg-neutral-950/90",
  hoverBgColor = "bg-neutral-950/90",
  showShadow = true,
  shadowStyle = "0 20px 40px -15px rgba(0, 0, 0, 0.8)",
  hoverScale = 1.015,
  hoverY = -4,
  springStiffness = 300,
  springDamping = 20,
  showCorners = true,
  cornerColor = "#525252",
  cornerHoverColor = "#f5f5f5",
  cornerLength = 14,
  cornerWidth = 2,
  cornerOffset = 3,
  iconOnly = false,
}: DashedFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Spring transition presets
  const springTransition = {
    type: "spring",
    stiffness: springStiffness,
    damping: springDamping,
  };

  const isBevel = cardVariant === "bevel";
  const activeRounded = isBevel && rounded === "none" ? "2xl" : rounded;
  const activeIconRounded = isBevel && iconRounded === "none" ? "lg" : iconRounded;

  const containerRoundedClass = tailwindRoundedMap[activeRounded] || "rounded-none";
  const iconRoundedClass = tailwindRoundedMap[activeIconRounded] || "rounded-none";
  
  const containerSvgRx = svgRadiusMap[activeRounded] !== undefined ? svgRadiusMap[activeRounded] : 0;
  const iconSvgRx = svgRadiusMap[activeIconRounded] !== undefined ? svgRadiusMap[activeIconRounded] : 0;

  // Resolve SVG dasharray pattern based on borderStyle and user configs
  let strokeDasharray = "none";
  if (borderStyle === "dashed") {
    strokeDasharray = `${dashLength} ${dashGap}`;
  } else if (borderStyle === "dotted") {
    strokeDasharray = `${dashWidth} ${dashGap}`;
  }

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: hoverY, scale: hoverScale }}
      transition={springTransition}
      className={cn(
        "relative flex items-center text-left cursor-pointer select-none overflow-visible",
        iconOnly ? "w-14 h-14 p-0 justify-center shrink-0" : "w-80 min-h-[96px] gap-4 p-5",
        containerRoundedClass,
        isBevel
          ? "border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl"
          : (isHovered ? hoverBgColor : bgColor),
        onClick && "active:scale-95",
        className
      )}
      style={{
        backgroundColor: isBevel ? (isHovered ? "#222222" : "#171717") : undefined,
        boxShadow: isBevel
          ? "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
          : (showShadow ? shadowStyle : "none"),
      }}
    >
      {/* Absolute SVG Overlay for Outer Dashed Border */}
      {!isBevel && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          <motion.rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={containerSvgRx}
            ry={containerSvgRx}
            fill="none"
            stroke={isHovered ? dashHoverColor : dashColor}
            strokeWidth={dashWidth}
            strokeDasharray={strokeDasharray}
            animate={{
              strokeDashoffset: isHovered ? -dashShift : 0,
              strokeOpacity: isHovered ? dashHoverOpacity : dashOpacity,
            }}
            transition={springTransition}
          />
        </svg>
      )}

      {/* Corner Crop Marks (L-shapes) */}
      {!isBevel && showCorners && (
        <>
          {/* Top-Left */}
          <motion.div
            animate={{
              x: isHovered ? -cornerOffset : 0,
              y: isHovered ? -cornerOffset : 0,
              borderColor: isHovered ? cornerHoverColor : cornerColor,
            }}
            transition={springTransition}
            className="absolute pointer-events-none"
            style={{
              top: `-${cornerWidth / 2}px`,
              left: `-${cornerWidth / 2}px`,
              width: `${cornerLength}px`,
              height: `${cornerLength}px`,
              borderTopWidth: `${cornerWidth}px`,
              borderLeftWidth: `${cornerWidth}px`,
              borderStyle: "solid",
            }}
          />
          {/* Top-Right */}
          <motion.div
            animate={{
              x: isHovered ? cornerOffset : 0,
              y: isHovered ? -cornerOffset : 0,
              borderColor: isHovered ? cornerHoverColor : cornerColor,
            }}
            transition={springTransition}
            className="absolute pointer-events-none"
            style={{
              top: `-${cornerWidth / 2}px`,
              right: `-${cornerWidth / 2}px`,
              width: `${cornerLength}px`,
              height: `${cornerLength}px`,
              borderTopWidth: `${cornerWidth}px`,
              borderRightWidth: `${cornerWidth}px`,
              borderStyle: "solid",
            }}
          />
          {/* Bottom-Left */}
          <motion.div
            animate={{
              x: isHovered ? -cornerOffset : 0,
              y: isHovered ? cornerOffset : 0,
              borderColor: isHovered ? cornerHoverColor : cornerColor,
            }}
            transition={springTransition}
            className="absolute pointer-events-none"
            style={{
              bottom: `-${cornerWidth / 2}px`,
              left: `-${cornerWidth / 2}px`,
              width: `${cornerLength}px`,
              height: `${cornerLength}px`,
              borderBottomWidth: `${cornerWidth}px`,
              borderLeftWidth: `${cornerWidth}px`,
              borderStyle: "solid",
            }}
          />
          {/* Bottom-Right */}
          <motion.div
            animate={{
              x: isHovered ? cornerOffset : 0,
              y: isHovered ? cornerOffset : 0,
              borderColor: isHovered ? cornerHoverColor : cornerColor,
            }}
            transition={springTransition}
            className="absolute pointer-events-none"
            style={{
              bottom: `-${cornerWidth / 2}px`,
              right: `-${cornerWidth / 2}px`,
              width: `${cornerLength}px`,
              height: `${cornerLength}px`,
              borderBottomWidth: `${cornerWidth}px`,
              borderRightWidth: `${cornerWidth}px`,
              borderStyle: "solid",
            }}
          />
        </>
      )}

      {/* Left/Middle Icon Wrapper */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden transition-all duration-250",
          iconOnly ? "w-10 h-10" : "w-12 h-12",
          iconRoundedClass,
          isBevel
            ? "border border-white/5 bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)]"
            : (isHovered ? "bg-neutral-900/50" : "bg-neutral-900/20")
        )}
      >
        {/* SVG Dashed border matching the outer design */}
        {!isBevel && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx={iconSvgRx}
              ry={iconSvgRx}
              fill="none"
              stroke={isHovered ? dashHoverColor : dashColor}
              strokeWidth={dashWidth}
              strokeDasharray={strokeDasharray}
              animate={{
                strokeDashoffset: isHovered ? dashShift : 0,
                strokeOpacity: isHovered ? dashHoverOpacity : dashOpacity,
              }}
              transition={springTransition}
            />
          </svg>
        )}
        {icon ? (
          <div className={isHovered ? "text-neutral-200" : "text-neutral-400"}>
            {icon}
          </div>
        ) : (
          <IconAlertCircle
            size={20}
            stroke={2}
            className={cn(
              "transition-colors duration-250",
              isHovered ? "text-neutral-200" : "text-neutral-400"
            )}
          />
        )}
      </div>

      {/* Right Title + Description */}
      {!iconOnly && (
        <div className="flex flex-col gap-0.5 min-w-0">
          <h4 className="text-sm font-semibold tracking-wide text-neutral-100 truncate">
            {title}
          </h4>
          <span className="text-xs font-medium text-neutral-500 truncate">
            {description}
          </span>
        </div>
      )}
    </motion.div>
  );
}
