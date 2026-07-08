"use client";

import React, { useId } from "react";
import { cn } from "../lib/utils";

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
}

export function DotPattern({
  className,
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx,
  cy,
  cr = 1,
  ...props
}: DotPatternProps) {
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
