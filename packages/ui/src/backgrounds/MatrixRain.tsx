"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

export interface MatrixRainProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  className?: string;
  speed?: number; // Speed multiplier (default: 1.0)
  density?: number; // Column density factor (default: 1.0)
  fontSize?: number; // Font size of rain symbols (default: 16)
  decayRate?: number; // Rate at which streams fade out (default: 0.05)
  color?: string; // Color of stream tail (default: "#525252" for monochrome)
  glowColor?: string; // Color of the stream head (default: "#ffffff")
  glowStrength?: number; // Blur strength of glow shadow (default: 8)
  opacity?: number; // Canvas transparency (default: 0.35)
  customCharacters?: string; // Characters pool (default: Matrix Katakana + Alphabets)
  fps?: number; // Target frame rate (default: 30)
}

export function MatrixRain({
  className,
  speed = 1.0,
  density = 1.0,
  fontSize = 16,
  decayRate = 0.05,
  color = "#525252",
  glowColor = "#ffffff",
  glowStrength = 8,
  opacity = 0.35,
  customCharacters,
  fps = 30,
  style,
  ...props
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const yPositionsRef = useRef<number[]>([]);
  const lastDrawTimeRef = useRef<number>(0);

  // Default characters pool: Matrix katakana characters mixed with uppercase letters and digits
  const defaultChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charPool = customCharacters || defaultChars;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Base column layout
      const colWidth = fontSize;
      const colCount = Math.floor((canvas.width / colWidth) * density);
      
      // Initialize vertical offsets randomly so they don't fall in a flat line
      yPositionsRef.current = Array.from({ length: colCount }, () => 
        Math.random() * -canvas.height
      );
    };

    const draw = (timestamp: number) => {
      animationFrameId.current = requestAnimationFrame(draw);

      // Frame rate throttling for retro Matrix style
      const elapsed = timestamp - lastDrawTimeRef.current;
      const interval = 1000 / fps;
      if (elapsed < interval) return;
      lastDrawTimeRef.current = timestamp - (elapsed % interval);

      // Draw transparent overlay to create decay fade trail
      ctx.fillStyle = `rgba(0, 0, 0, ${decayRate})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      
      const colCount = yPositionsRef.current.length;
      for (let i = 0; i < colCount; i++) {
        // Calculate horizontal coordinates
        const x = (i * fontSize) / density;
        const y = yPositionsRef.current[i];

        // Only draw if within viewport bounds
        if (y >= 0) {
          const char = charPool[Math.floor(Math.random() * charPool.length)];

          // 1. Draw glowing head character
          ctx.save();
          ctx.fillStyle = glowColor;
          if (glowStrength > 0) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glowStrength;
          }
          ctx.fillText(char, x, y);
          ctx.restore();

          // 2. Draw regular trail characters trailing slightly behind
          ctx.fillStyle = color;
          const trailY = y - fontSize;
          if (trailY >= 0) {
            ctx.fillText(char, x, trailY);
          }
        }

        // Increment stream position
        yPositionsRef.current[i] += fontSize * speed;

        // Reset column to top randomly when it hits bottom
        if (yPositionsRef.current[i] > canvas.height && Math.random() > 0.975) {
          yPositionsRef.current[i] = 0;
        }
      }
    };

    const handleResize = () => {
      init();
    };

    init();
    lastDrawTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(draw);

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [speed, density, fontSize, decayRate, color, glowColor, glowStrength, charPool, fps]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      style={{ background: "#000000", opacity, ...style }}
      {...props}
    />
  );
}
