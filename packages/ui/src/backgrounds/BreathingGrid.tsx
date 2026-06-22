"use client";

import { useEffect, useRef } from "react";

const GRID_SIZE = 40;
const BASE_OPACITY = 0.10;
const CYCLE_DURATION = 8000;
const MOUSE_RADIUS = 250;

export function BreathingGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handleMq = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handleMq);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mx, y: my } = mouseRef.current;
      const progress = reducedMotionRef.current
        ? 0.5
        : (timestamp % CYCLE_DURATION) / CYCLE_DURATION;

      const cols = Math.ceil(canvas.width / GRID_SIZE);
      const rows = Math.ceil(canvas.height / GRID_SIZE);

      ctx.lineWidth = 0.5;

      // Horizontal lines — wave sweeps left to right
      for (let row = 0; row <= rows; row++) {
        const y = row * GRID_SIZE;

        const distY = Math.abs(y - my);
        const distX = Math.abs(canvas.width / 2 - mx);
        const dist = Math.sqrt(distX * distX + distY * distY);
        const mouseInfluence = Math.max(0, 1 - dist / MOUSE_RADIUS);
        const warmth = mouseInfluence * 40;
        const r = Math.round(200 + warmth);
        const g = Math.round(215 - warmth * 0.3);
        const b = Math.round(240 - warmth * 0.6);

        const grad = ctx.createLinearGradient(0, y, canvas.width, y);
        const stops = 8;

        for (let s = 0; s <= stops; s++) {
          const x = (s / stops) * canvas.width;
          const phase = ((x / canvas.width) - progress) * Math.PI * 2;
          const breath = reducedMotionRef.current
            ? 0.5
            : (Math.cos(phase) + 1) / 2;

          const boost = mouseInfluence * 0.3;
          const opacity = Math.min(
            BASE_OPACITY + breath * (BASE_OPACITY * 3) + boost * BASE_OPACITY * 3,
            0.45
          );

          grad.addColorStop(s / stops, `rgba(${r},${g},${b},${opacity})`);
        }

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical lines — lit by wave at their x-position
      for (let col = 0; col <= cols; col++) {
        const x = col * GRID_SIZE;

        const distX = Math.abs(x - mx);
        const distY = Math.abs(canvas.height / 2 - my);
        const dist = Math.sqrt(distX * distX + distY * distY);
        const mouseInfluence = Math.max(0, 1 - dist / MOUSE_RADIUS);
        const warmth = mouseInfluence * 40;
        const r = Math.round(200 + warmth);
        const g = Math.round(215 - warmth * 0.3);
        const b = Math.round(240 - warmth * 0.6);

        const phase = ((x / canvas.width) - progress) * Math.PI * 2;
        const breath = reducedMotionRef.current
          ? 0.5
          : (Math.cos(phase) + 1) / 2;

        const boost = mouseInfluence * 0.3;
        const opacity = Math.min(
          BASE_OPACITY + breath * (BASE_OPACITY * 3) + boost * BASE_OPACITY * 3,
          0.45
        );

        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", resize);
      mq.removeEventListener("change", handleMq);
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
