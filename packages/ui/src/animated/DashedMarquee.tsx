"use client";

import React, { useId } from "react";
import { cn } from "../lib/utils";
import { DashedFeatureCard, DashedFeatureCardProps } from "./DashedFeatureCard";

export interface MarqueeItem {
  id: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
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
  cardProps?: Partial<DashedFeatureCardProps>;
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

  // Repeat the items array dynamically to ensure track width/height exceeds any screen viewport size
  const minRequiredCount = variant === "icon" ? 30 : 12;
  let repeatedItems = [...items];
  while (repeatedItems.length < minRequiredCount && items.length > 0) {
    repeatedItems = [...repeatedItems, ...items];
  }

  // Double the repeated dataset to ensure the seamless translation snapping works mathematically
  const doubledItems = [...repeatedItems, ...repeatedItems];

  // Resolve CSS Transforms for Marquee Tracks
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
        "relative overflow-hidden w-full h-full flex items-center bg-transparent p-4",
        isVertical ? "flex-col justify-start min-h-[500px]" : "flex-row justify-start min-w-[320px]",
        className
      )}
    >
      {/* Inject Keyframe Styles Dynamically */}
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {/* Edge Blur Fades (Apple-inspired gradient backdrop filter) */}
      {blurCorners && (
        <>
          {/* Edge 1 (Left / Top) */}
          <div
            className={cn(
              "absolute z-10 pointer-events-none transition-all duration-300",
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
          {/* Edge 2 (Right / Bottom) */}
          <div
            className={cn(
              "absolute z-10 pointer-events-none transition-all duration-300",
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

      {/* Marquee Track container */}
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
            <DashedFeatureCard
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
