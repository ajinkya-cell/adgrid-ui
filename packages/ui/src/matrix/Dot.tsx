"use client";

import React from 'react';

interface DotProps {
  size: number;
  borderRadius: string;
  color: string;
  inactiveColor: string;
  glow: boolean;
  blur: number;
}

/**
 * Highly optimized individual LED dot component.
 * Memoized to prevent React reconciliation and re-rendering when the parent loop ticks.
 * Brightness transitions and glows are driven entirely by GPU-composited opacity shifts.
 */
export const Dot: React.FC<DotProps> = React.memo(({
  size,
  borderRadius,
  color,
  inactiveColor,
  glow,
  blur
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: inactiveColor,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* 
        Opaque active glowing LED layer.
        Applying static boxShadow so the browser rasterizes it once.
        Opacity changes are handled by the GPU compositor layer, resulting in 0% CPU rendering overhead.
      */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: color,
          opacity: 'var(--dot-brightness, 0)',
          boxShadow: glow 
            ? `0 0 ${blur}px ${color}` 
            : 'none',
          willChange: 'opacity',
        }}
      />
    </div>
  );
}, (prev, next) => {
  // Prevent reconciliation if layout specifications did not change
  return (
    prev.size === next.size &&
    prev.borderRadius === next.borderRadius &&
    prev.color === next.color &&
    prev.inactiveColor === next.inactiveColor &&
    prev.glow === next.glow &&
    prev.blur === next.blur
  );
});

Dot.displayName = 'Dot';
export default Dot;
