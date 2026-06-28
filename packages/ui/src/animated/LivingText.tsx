"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, useId } from "react";
import { cn } from "../lib/utils";

export interface LivingTextProps {
  /** The text content to animate */
  text: string;
  /** Proximity radius of cursor influence in pixels */
  radius?: number;
  /** Movement offset strength in pixels */
  strength?: number;
  /** Proximity interaction mode */
  mode?: "repel" | "magnetize" | "stretch" | "rotate" | "ripple" | "all";
  /** Apply dynamic SVG turbulence/liquification filter */
  liquify?: boolean;
  /** Custom CSS class for the container */
  className?: string;
  /** Custom CSS class for each character */
  charClassName?: string;
}

export function LivingText({
  text,
  radius = 150,
  strength = 40,
  mode = "repel",
  liquify = false,
  className = "",
  charClassName = "",
}: LivingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });
  const [containerForce, setContainerForce] = useState(0);
  const filterId = useId().replace(/:/g, "");

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });

      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = centerX - e.clientX;
      const dy = centerY - e.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const containerRadius = radius * 1.5;
      if (distance < containerRadius) {
        const force = (containerRadius - distance) / containerRadius;
        setContainerForce(force);
      } else {
        setContainerForce(0);
      }
    };

    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, [radius]);

  // Max scale distortion of 35px based on cursor proximity to container
  const filterScale = containerForce * 35;

  return (
    <div className="relative w-full flex justify-center py-8">
      {liquify && (
        <svg className="absolute w-0 h-0" aria-hidden="true" style={{ pointerEvents: "none" }}>
          <defs>
            <filter id={`liquify-filter-${filterId}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015"
                numOctaves="3"
                result="noise"
              />
              <motion.feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={filterScale}
                xChannelSelector="R"
                yChannelSelector="G"
                animate={{ scale: filterScale }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
              />
            </filter>
          </defs>
        </svg>
      )}
      <div
        ref={containerRef}
        className={cn(
          "flex flex-wrap justify-center gap-1 overflow-visible select-none",
          className
        )}
        style={{
          filter: liquify ? `url(#liquify-filter-${filterId})` : "none",
        }}
      >
        {text.split("").map((char, index) => (
          <Character
            key={`${char}-${index}`}
            char={char}
            mouse={mouse}
            radius={radius}
            strength={strength}
            mode={mode}
            charClassName={charClassName}
          />
        ))}
      </div>
    </div>
  );
}

interface CharacterProps {
  char: string;
  mouse: { x: number; y: number };
  radius: number;
  strength: number;
  mode: "repel" | "magnetize" | "stretch" | "rotate" | "ripple" | "all";
  charClassName: string;
}

function Character({
  char,
  mouse,
  radius,
  strength,
  mode,
  charClassName,
}: CharacterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = centerX - mouse.x;
    const dy = centerY - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < radius) {
      const force = (radius - distance) / radius;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      let x = 0;
      let y = 0;
      let scaleX = 1;
      let scaleY = 1;
      let rotate = 0;

      // 1. Repel: Push away from cursor
      if (mode === "repel" || mode === "all") {
        x = (dx / distance) * force * strength;
        y = (dy / distance) * force * strength;
      }

      // 2. Magnetize: Pull toward cursor
      if (mode === "magnetize") {
        x = -(dx / distance) * force * strength;
        y = -(dy / distance) * force * strength;
      }

      // 3. Stretch: Scale X and Y depending on alignment axis
      if (mode === "stretch" || mode === "all") {
        const factor = mode === "all" ? 0.3 : 0.6;
        scaleX = 1 + (absDx / (distance || 1)) * force * factor;
        scaleY = 1 + (absDy / (distance || 1)) * force * factor;
      }

      // 4. Rotate: Shift angle relative to push direction
      if (mode === "rotate" || mode === "all") {
        const factor = mode === "all" ? 15 : 30;
        rotate = force * factor * (dx > 0 ? 1 : -1);
      }

      // 5. Ripple: Sinusoidal wave trigger based on distance and dynamic time
      if (mode === "ripple" || mode === "all") {
        const wave = Math.sin(distance * 0.05 - Date.now() * 0.01) * force * 15;
        y += wave;
      }

      setOffset({ x, y, scaleX, scaleY, rotate });
    } else {
      setOffset({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 });
    }
  }, [mouse, radius, strength, mode]);

  if (char === " ") {
    return <span className="w-4 md:w-6" aria-hidden="true" />;
  }

  return (
    <motion.span
      ref={ref}
      animate={{
        x: offset.x,
        y: offset.y,
        scaleX: offset.scaleX,
        scaleY: offset.scaleY,
        rotate: offset.rotate,
      }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 12,
        mass: 0.8,
      }}
      className={cn(
        "inline-block cursor-default font-syne font-black text-6xl md:text-8xl select-none will-change-transform text-white",
        charClassName
      )}
    >
      {char}
    </motion.span>
  );
}
