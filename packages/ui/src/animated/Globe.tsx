"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe, { COBEOptions } from "cobe";
import { cn } from "../lib/utils";

export interface GlobeProps {
  className?: string;
}

const BASE_CONFIG: Omit<COBEOptions, "width" | "height" | "phi" | "theta"> = {
  devicePixelRatio: 2,
  mapSamples: 20000,
  mapBrightness: 8,
  mapBaseBrightness: 0.01,
  diffuse: 0.85,
  dark: 1,
  baseColor: [0.07, 0.07, 0.07],
  markerColor: [1, 1, 1],
  glowColor: [0.6, 0.6, 0.6],
  markers: [],
  scale: 1,
  opacity: 1,
};

export function Globe({ className }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const dragDelta = useRef(0);

  const startPointer = useCallback((clientX: number) => {
    isDragging.current = true;
    lastX.current = clientX;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);

  const movePointer = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    dragDelta.current += (clientX - lastX.current) / 200;
    lastX.current = clientX;
  }, []);

  const endPointer = useCallback(() => {
    isDragging.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const init = () => {
      const w = widthRef.current || canvas.offsetWidth;
      if (w < 2) {
        rafRef.current = requestAnimationFrame(init);
        return;
      }

      globeRef.current = createGlobe(canvas, {
        ...BASE_CONFIG,
        phi: 0,
        theta: 0.25,
        width: w * 2,
        height: w * 2,
      });

      const animate = () => {
        if (!isDragging.current) {
          phiRef.current += 0.003;
        }
        phiRef.current += dragDelta.current;
        dragDelta.current *= 0.9;

        const w2 = widthRef.current || canvas.offsetWidth;
        globeRef.current?.update({
          phi: phiRef.current,
          theta: 0.25,
          width: w2 * 2,
          height: w2 * 2,
        });
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
      canvas.style.opacity = "1";
    };

    rafRef.current = requestAnimationFrame(init);

    return () => {
      cancelAnimationFrame(rafRef.current);
      globeRef.current?.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        className
      )}
      style={{ width: 420, height: 420 }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1s ease",
        }}
        onPointerDown={(e) => {
          startPointer(e.clientX);
          (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => movePointer(e.clientX)}
        onPointerUp={endPointer}
        onPointerLeave={endPointer}
        onTouchStart={(e) => e.touches[0] && startPointer(e.touches[0].clientX)}
        onTouchMove={(e) => e.touches[0] && movePointer(e.touches[0].clientX)}
        onTouchEnd={endPointer}
      />
    </div>
  );
}
