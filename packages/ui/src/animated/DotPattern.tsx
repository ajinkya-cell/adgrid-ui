"use client";

import React, { useId } from "react";
import { cn } from "../lib/utils";

export type DotPatternPreset = "subtle" | "dense" | "constellation" | "slanted";

const PRESETS: Record<DotPatternPreset, { width: number; height: number; x: number; y: number; cr: number }> = {
  subtle: { width: 16, height: 16, x: 0, y: 0, cr: 1.2 },
  dense: { width: 8, height: 8, x: 0, y: 0, cr: 0.8 },
  constellation: { width: 32, height: 32, x: 0, y: 0, cr: 1.6 },
  slanted: { width: 20, height: 20, x: 10, y: 10, cr: 1.2 },
};

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  preset?: DotPatternPreset;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
}

export function DotPattern({
  preset,
  className,
  width: customWidth,
  height: customHeight,
  x: customX,
  y: customY,
  cx,
  cy,
  cr: customCr,
  ...props
}: DotPatternProps) {
  const p = preset ? PRESETS[preset] : null;

  const width = customWidth ?? p?.width ?? 16;
  const height = customHeight ?? p?.height ?? 16;
  const x = customX ?? p?.x ?? 0;
  const y = customY ?? p?.y ?? 0;
  const cr = customCr ?? p?.cr ?? 1;
  const id = useId();
  const circleCx = cx ?? width / 2;
  const circleCy = cy ?? height / 2;

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={circleCx} cy={circleCy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

DotPattern.displayName = "DotPattern";
