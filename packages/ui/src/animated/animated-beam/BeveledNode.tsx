"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface BeveledNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "circle" | "square" | "rounded";
  size?: number;
  glowColor?: string;
  glowOpacity?: number;
  monochrome?: boolean;
}

export const BeveledNode = forwardRef<HTMLDivElement, BeveledNodeProps>(
  ({ className, shape = "circle", size = 52, glowColor, glowOpacity = 0.15, monochrome = false, children, ...props }, ref) => {
    const shapeClasses = {
      circle: "rounded-full",
      square: "rounded-none",
      rounded: "rounded-xl",
    };

    const hasGlow = !!glowColor && !monochrome;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center shrink-0 border border-white/5 bg-[#070707] transition-all duration-300",
          shapeClasses[shape],
          className
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: hasGlow
            ? `inset 0 1.5px 3.5px rgba(0,0,0,0.8), 0 0 12px ${glowColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}`
            : monochrome
              ? "inset 0 1.5px 3.5px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.02)"
              : "inset 0 1.5px 3.5px rgba(0,0,0,0.8)",
        }}
        {...props}
      >
        <div className={cn("flex items-center justify-center transition-all duration-300", monochrome && "filter grayscale opacity-90 contrast-200 text-white [&_svg]:!text-white [&_svg]:!stroke-white")}>
          {children}
        </div>
      </div>
    );
  }
);

BeveledNode.displayName = "BeveledNode";
