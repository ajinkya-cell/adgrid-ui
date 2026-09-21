"use client";

import React, { useId, useState } from "react";
import { motion } from "framer-motion";
import { IconAlertCircle } from "@tabler/icons-react";
import { cn } from "../lib/utils";

export interface MarqueeItem {
  id: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface MarqueeCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  cardVariant?: "dashed" | "bevel";
  className?: string;
  onClick?: () => void;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  iconRounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  borderStyle?: "dashed" | "dotted" | "solid";
  dashLength?: number;
  dashGap?: number;
  dashWidth?: number;
  dashColor?: string;
  dashHoverColor?: string;
  dashOpacity?: number;
  dashHoverOpacity?: number;
  dashShift?: number;
  bgColor?: string;
  hoverBgColor?: string;
  showShadow?: boolean;
  shadowStyle?: string;
  hoverScale?: number;
  hoverY?: number;
  springStiffness?: number;
  springDamping?: number;
  showCorners?: boolean;
  cornerColor?: string;
  cornerHoverColor?: string;
  cornerLength?: number;
  cornerWidth?: number;
  cornerOffset?: number;
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

function MarqueeCard({
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
  ...props
}: MarqueeCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const [isHovered, setIsHovered] = useState(false);

  const springTransition = {
    type: "spring" as const,
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
        "relative flex items-center text-left cursor-pointer select-none overflow-visible shrink-0",
        iconOnly ? "w-14 h-14 p-0 justify-center" : "w-80 min-h-[96px] gap-4 p-5",
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
      {...(props as any)}
    >
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

      {!isBevel && showCorners && (
        <>
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

export interface DashedMarqueeProps {
  items: MarqueeItem[];
  className?: string;
  variant?: "default" | "icon";
  cardVariant?: "dashed" | "bevel";
  direction?: "left-to-right" | "right-to-left" | "up-to-down" | "down-to-up";
  speed?: number; // loop duration in seconds
  pauseOnHover?: boolean;
  blurCorners?: boolean;
  fadeColor?: string; // bg color matching for edge fade (default: "#0d0d0d")
  cardProps?: Partial<MarqueeCardProps>;
}

export function DashedMarquee({
  items,
  className,
  variant = "default",
  cardVariant = "dashed",
  direction = "right-to-left",
  speed = 25,
  pauseOnHover = true,
  blurCorners = true,
  fadeColor = "#111111",
  cardProps,
}: DashedMarqueeProps) {
  const uniqId = useId().replace(/:/g, "");
  const animName = `marquee-anim-${uniqId}`;

  const isVertical = direction === "up-to-down" || direction === "down-to-up";

  const minRequiredCount = variant === "icon" ? 30 : 12;
  let repeatedItems = [...items];
  while (repeatedItems.length < minRequiredCount && items.length > 0) {
    repeatedItems = [...repeatedItems, ...items];
  }

  const doubledItems = [...repeatedItems, ...repeatedItems];

  let keyframes = "";
  if (direction === "right-to-left") {
    keyframes = `@keyframes ${animName} { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`;
  } else if (direction === "left-to-right") {
    keyframes = `@keyframes ${animName} { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }`;
  } else if (direction === "down-to-up") {
    keyframes = `@keyframes ${animName} { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }`;
  } else if (direction === "up-to-down") {
    keyframes = `@keyframes ${animName} { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }`;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full flex items-center select-none py-6",
        isVertical ? "h-[600px] flex-col justify-center" : "h-auto flex-row justify-start",
        className
      )}
    >
      <style>{keyframes}</style>

      {blurCorners && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute z-10",
              isVertical
                ? "top-0 left-0 right-0 h-24 bg-gradient-to-b"
                : "left-0 top-0 bottom-0 w-24 bg-gradient-to-r"
            )}
            style={{
              backgroundImage: isVertical
                ? `linear-gradient(to bottom, ${fadeColor} 20%, transparent)`
                : `linear-gradient(to right, ${fadeColor} 20%, transparent)`,
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
          />
          <div
            className={cn(
              "pointer-events-none absolute z-10",
              isVertical
                ? "bottom-0 left-0 right-0 h-24 bg-gradient-to-t"
                : "right-0 top-0 bottom-0 w-24 bg-gradient-to-l"
            )}
            style={{
              backgroundImage: isVertical
                ? `linear-gradient(to top, ${fadeColor} 20%, transparent)`
                : `linear-gradient(to left, ${fadeColor} 20%, transparent)`,
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
          />
        </>
      )}

      <div
        className={cn(
          "flex shrink-0 gap-4",
          isVertical ? "flex-col h-max" : "flex-row w-max",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `${animName} ${speed}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubledItems.map((item, idx) => {
          const isDuplicate = idx >= items.length;
          return (
            <MarqueeCard
              key={`${item.id}-${idx}`}
              title={item.title}
              description={item.description}
              icon={item.icon}
              iconOnly={variant === "icon"}
              cardVariant={cardVariant}
              aria-hidden={isDuplicate ? "true" : undefined}
              {...cardProps}
            />
          );
        })}
      </div>
    </div>
  );
}
