"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";

export interface MonolithicShadowGapsProps {
  cellSize?: number;
  gap?: number;
  spotlightSize?: number;
  intensity?: number;
  className?: string;
}

export function MonolithicShadowGaps({
  cellSize = 120,
  gap = 1,
  spotlightSize = 700,
  intensity = 1,
  className,
}: MonolithicShadowGapsProps) {
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handlePointerLeave = () => {
    mouseX.set(-9999);
    mouseY.set(-9999);
  };

  const unit = cellSize + gap;

  const spotlight = useMotionTemplate`
    radial-gradient(
      ${spotlightSize}px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, ${0.035 * intensity}) 0%,
      rgba(255, 255, 255, ${0.005 * intensity}) 50%,
      transparent 100%
    )
  `;

  const containerClass =
    className ?? "fixed inset-0 z-0";

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={containerClass}
      style={{ background: "#040404" }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              to right,
              transparent 0,
              transparent ${cellSize}px,
              rgba(255,255,255,0.04) ${cellSize}px,
              rgba(255,255,255,0.04) ${unit}px
            ),
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent ${cellSize}px,
              rgba(255,255,255,0.04) ${cellSize}px,
              rgba(255,255,255,0.04) ${unit}px
            )
          `,
        }}
      />

      {/* Fine dot texture across the surface */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Raking spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen motion-reduce:hidden"
        style={{ background: spotlight }}
      />

      {/* Reduced motion fallback */}
      <div
        className="absolute inset-0 pointer-events-none hidden motion-reduce:block"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,${0.02 * intensity}) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
