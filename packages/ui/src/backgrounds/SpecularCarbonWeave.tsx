"use client";

import { useEffect, useRef } from "react";

export interface SpecularCarbonWeaveProps {
  patternSize?: number;
  intensity?: number;
  quality?: "high" | "medium" | "low";
  className?: string;
}

export function SpecularCarbonWeave({
  patternSize = 24,
  intensity = 1,
  quality = "medium",
  className,
}: SpecularCarbonWeaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mq.matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale =
      quality === "high" ? 1
      : quality === "medium" ? 0.75
      : 0.5;

    const updateMouse = (clientX: number, clientY: number) => {
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;
    };

    const onMove = (e: MouseEvent) =>
      updateMouse(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    const resize = () => {
      const w = Math.round(window.innerWidth * devicePixelRatio * scale);
      const h = Math.round(window.innerHeight * devicePixelRatio * scale);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener("resize", resize);
    resize();

    const drawWeave = () => {
      const mx = mouseRef.current.x * devicePixelRatio * scale;
      const my = mouseRef.current.y * devicePixelRatio * scale;
      const cw = canvas.width;
      const ch = canvas.height;
      const ps = Math.round(patternSize * scale);

      ctx.fillStyle = "#040405";
      ctx.fillRect(0, 0, cw, ch);

      for (let x = 0; x < cw; x += ps) {
        for (let y = 0; y < ch; y += ps) {
          const cx = x + ps / 2;
          const cy = y + ps / 2;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const falloff = Math.max(0, 1 - dist / (500 * scale));

          ctx.save();
          ctx.translate(x, y);

          const hOpacity = 0.02 + falloff * 0.08 * intensity;
          ctx.fillStyle = `rgba(255,255,255,${hOpacity})`;
          ctx.fillRect(2, 2, ps - 4, ps / 2 - 4);

          const vOpacity = 0.015 + (1 - falloff) * 0.02 + falloff * 0.11 * intensity;
          ctx.fillStyle = `rgba(255,255,255,${vOpacity})`;
          ctx.fillRect(ps / 2 + 2, 2, ps / 2 - 4, ps - 4);

          ctx.restore();
        }
      }
    };

    drawWeave();

    if (reducedMotion) {
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("resize", resize);
      };
    }

    let anim: number;
    const render = () => {
      drawWeave();
      anim = requestAnimationFrame(render);
    };
    anim = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", resize);
    };
  }, [patternSize, intensity, quality]);

  const containerClass =
    className ?? "fixed inset-0 z-0";

  return (
    <div className={containerClass}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .scw-canvas { image-rendering: auto; }
        }
      `}</style>
    </div>
  );
}
