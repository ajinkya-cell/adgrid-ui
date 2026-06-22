"use client";

import { useEffect, useRef } from "react";

interface Pixel {
  x: number;
  y: number;
  heat: number;
  decay: number;
}

const PIXEL_SIZE = 6;
const MAX_HEAT = 0.35;
const HEAT_RADIUS = 80;
const DECAY_SPEED = 0.012;

export function PixelMeltBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const cols = Math.ceil(canvas.width / PIXEL_SIZE);
      const rows = Math.ceil(canvas.height / PIXEL_SIZE);

      pixelsRef.current = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          pixelsRef.current.push({
            x: col * PIXEL_SIZE,
            y: row * PIXEL_SIZE,
            heat: 0,
            decay: DECAY_SPEED + Math.random() * 0.008,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mx, y: my } = mouseRef.current;

      for (const px of pixelsRef.current) {
        const dist = Math.sqrt((px.x - mx) ** 2 + (px.y - my) ** 2);
        if (dist < HEAT_RADIUS) {
          const influence = 1 - dist / HEAT_RADIUS;
          px.heat = Math.min(MAX_HEAT, px.heat + influence * 0.08);
        }

        if (px.heat > 0) {
          px.heat = Math.max(0, px.heat - px.decay);
        }

        if (px.heat > 0.005) {
          const brightness = Math.round(px.heat * 255);
          ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
          ctx.fillRect(px.x + 1, px.y + 1, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      init();
    };

    init();
    draw();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "#000" }}
    />
  );
}
