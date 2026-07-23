"use client";

import React, { useRef } from "react";
import { BeveledNode } from "./BeveledNode";
import { AnimatedBeam } from "./AnimatedBeam";
import { cn } from "../../lib/utils";

export interface ShowcaseItem {
  id: string;
  icon: React.ReactNode;
  shape?: "circle" | "square" | "rounded";
  beamStartColor?: string;
  beamStopColor?: string;
  curvature?: number;
  reverse?: boolean;
}

export interface BeveledBeamShowcaseProps {
  className?: string;
  variant?: "default" | "monochrome" | "neon";
  centerIcon?: React.ReactNode;
  centerShape?: "circle" | "square" | "rounded";
  leftItems?: ShowcaseItem[];
  rightItems?: ShowcaseItem[];
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  duration?: number;
}

export function BeveledBeamShowcase({
  className,
  variant = "default",
  centerIcon,
  centerShape = "circle",
  leftItems = [],
  rightItems = [],
  pathColor,
  pathWidth = 3,
  pathOpacity,
  duration = 3.5,
}: BeveledBeamShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  // Allocate arrays of refs for left/right nodes dynamically
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Resolve theme overrides
  const isMonochrome = variant === "monochrome";
  const isNeon = variant === "neon";

  const resolvedPathColor = pathColor 
    ? pathColor 
    : isMonochrome 
      ? "rgba(255, 255, 255, 0.2)" 
      : isNeon 
        ? "rgba(0, 240, 255, 0.25)" 
        : "rgba(255, 255, 255, 0.2)";

  const resolvedPathOpacity = pathOpacity !== undefined
    ? pathOpacity 
    : 0.85;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full max-w-2xl items-center justify-between p-10 bg-transparent overflow-hidden",
        className
      )}
    >
      {/* Left Column Items */}
      <div className="flex flex-col justify-between gap-10 z-10">
        {leftItems.map((item) => {
          let glowColor = item.beamStartColor;
          if (isMonochrome) glowColor = undefined;
          if (isNeon) glowColor = "#ff007f"; // Neon Hot Pink
          return (
            <BeveledNode
              key={item.id}
              shape={item.shape || "circle"}
              ref={(el) => {
                leftRefs.current[item.id] = el;
              }}
              glowColor={glowColor}
              glowOpacity={isMonochrome ? 0 : 0.2}
              monochrome={isMonochrome}
            >
              {item.icon}
            </BeveledNode>
          );
        })}
      </div>

      {/* Central Hub Node */}
      <div className="flex items-center justify-center z-10">
        <BeveledNode
          shape={centerShape}
          ref={centerRef}
          size={72}
          glowColor={isMonochrome ? undefined : isNeon ? "#00f0ff" : "#ffffff"}
          glowOpacity={isMonochrome ? 0 : isNeon ? 0.25 : 0.05}
          monochrome={isMonochrome}
        >
          {centerIcon}
        </BeveledNode>
      </div>

      {/* Right Column Items */}
      <div className="flex flex-col justify-between gap-10 z-10">
        {rightItems.map((item) => {
          let glowColor = item.beamStopColor;
          if (isMonochrome) glowColor = undefined;
          if (isNeon) glowColor = "#00f0ff"; // Neon Cyan
          return (
            <BeveledNode
              key={item.id}
              shape={item.shape || "circle"}
              ref={(el) => {
                rightRefs.current[item.id] = el;
              }}
              glowColor={glowColor}
              glowOpacity={isMonochrome ? 0 : 0.2}
              monochrome={isMonochrome}
            >
              {item.icon}
            </BeveledNode>
          );
        })}
      </div>

      {/* Render Beams dynamically */}
      {leftItems.map((item) => {
        const itemRef = { current: leftRefs.current[item.id] };
        
        let startColor = item.beamStartColor ?? "#3b82f6";
        let stopColor = item.beamStopColor ?? "#8b5cf6";
        if (isMonochrome) {
          startColor = "#ffffff";
          stopColor = "#a1a1aa";
        } else if (isNeon) {
          startColor = "#ff007f";
          stopColor = "#00f0ff";
        }

        return (
          <AnimatedBeam
            key={`beam-left-${item.id}`}
            containerRef={containerRef}
            fromRef={itemRef}
            toRef={centerRef}
            curvature={item.curvature ?? 20}
            reverse={item.reverse ?? false}
            pathColor={resolvedPathColor}
            pathWidth={pathWidth}
            pathOpacity={resolvedPathOpacity}
            gradientStartColor={startColor}
            gradientStopColor={stopColor}
            duration={duration}
          />
        );
      })}

      {rightItems.map((item) => {
        const itemRef = { current: rightRefs.current[item.id] };

        let startColor = item.beamStartColor ?? "#8b5cf6";
        let stopColor = item.beamStopColor ?? "#3b82f6";
        if (isMonochrome) {
          startColor = "#a1a1aa";
          stopColor = "#ffffff";
        } else if (isNeon) {
          startColor = "#ff007f";
          stopColor = "#00f0ff";
        }

        return (
          <AnimatedBeam
            key={`beam-right-${item.id}`}
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={itemRef}
            curvature={item.curvature ?? -20}
            reverse={item.reverse ?? false}
            pathColor={resolvedPathColor}
            pathWidth={pathWidth}
            pathOpacity={resolvedPathOpacity}
            gradientStartColor={startColor}
            gradientStopColor={stopColor}
            duration={duration}
          />
        );
      })}
    </div>
  );
}
