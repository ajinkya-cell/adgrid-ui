"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

const CELL = 64;

export const SpotlightGrid = ({ children }: { children?: React.ReactNode }) => {
  const [dims, setDims] = useState({ cols: 30, rows: 18 });
  const cellsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const centersRef = useRef<Map<number, { cx: number; cy: number }>>(new Map());
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const perspectiveRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const prevTimeRef = useRef(0);
  
  const cursorActiveRef = useRef(false);
  const coordsRef = useRef({ x: -9999, y: -9999 });
  const springCoordsRef = useRef({ x: -9999, y: -9999 });
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      setDims({
        cols: Math.ceil(el.offsetWidth / CELL) + 2,
        rows: Math.ceil(el.offsetHeight / CELL) + 2,
      });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const total = dims.cols * dims.rows;

  useEffect(() => {
    const m = new Map<number, { cx: number; cy: number }>();
    for (let i = 0; i < total; i++) {
      m.set(i, {
        cx: (i % dims.cols) * CELL + CELL / 2,
        cy: Math.floor(i / dims.cols) * CELL + CELL / 2,
      });
    }
    centersRef.current = m;
  }, [dims, total]);

  const setCellRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el) cellsRef.current.set(i, el);
    else cellsRef.current.delete(i);
  }, []);

  useEffect(() => {
    prevTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - prevTimeRef.current;
      prevTimeRef.current = now;
      timeRef.current += dt;

      const centers = centersRef.current;
      if (centers.size === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const targetX = coordsRef.current.x;
      const targetY = coordsRef.current.y;

      if (cursorActiveRef.current) {
        if (springCoordsRef.current.x === -9999) {
          springCoordsRef.current.x = targetX;
          springCoordsRef.current.y = targetY;
        } else {
          // Responsive spring tracking for the light hover glow
          const easeSpeed = 0.15;
          springCoordsRef.current.x += (targetX - springCoordsRef.current.x) * easeSpeed;
          springCoordsRef.current.y += (targetY - springCoordsRef.current.y) * easeSpeed;
        }
      } else {
        springCoordsRef.current = { x: -9999, y: -9999 };
      }

      const { x, y } = springCoordsRef.current;

      const perspectiveEl = perspectiveRef.current;
      if (perspectiveEl && cursorActiveRef.current && x !== -9999) {
        perspectiveEl.style.perspectiveOrigin = `${x}px ${y}px`;
      }

      // Update dual spotlight overlay position and opacity
      const spotlightEl = spotlightRef.current;
      if (spotlightEl) {
        if (cursorActiveRef.current && x !== -9999) {
          const offset = 40;
          spotlightEl.style.background = `
            radial-gradient(300px circle at ${x}px ${y}px, rgba(20, 184, 166, 0.08), transparent 100%),
            radial-gradient(500px circle at ${x - offset}px ${y - offset}px, rgba(99, 102, 241, 0.06), transparent 100%)
          `;
          spotlightEl.style.opacity = "1";
        } else {
          spotlightEl.style.opacity = "0";
        }
      }

      const elapsed = timeRef.current * 0.002; // Very slow and gentle ambient flow
      const maxRadius = 400; // Glow influence radius

      for (let i = 0; i < total; i++) {
        const el = cellsRef.current.get(i);
        if (!el) continue;
        const { cx, cy } = centers.get(i)!;

        if (cursorActiveRef.current && x !== -9999) {
          // --- CURSOR INTERACTING: Just show the glow (No 3D tilt/lift) ---
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxRadius) {
            const intensity = Math.pow(1 - dist / maxRadius, 2);
            
            // Slate border: idle (30,41,59, 0.15) to active (148,163,184, 0.35) + teal sheen
            const borderRed = Math.round(30 + (148 - 30) * intensity);
            const borderGreen = Math.round(41 + (163 - 41) * intensity + 48 * intensity);
            const borderBlue = Math.round(59 + (184 - 59) * intensity + 7 * intensity);
            const borderAlpha = 0.15 + (0.35 - 0.15) * intensity;

            el.style.transform = "";
            el.style.borderColor = `rgba(${borderRed}, ${borderGreen}, ${borderBlue}, ${borderAlpha})`;
            el.style.boxShadow = `0 1px 4px rgba(148, 163, 184, ${intensity * 0.04})`;
            el.style.background = `radial-gradient(circle at 50% 50%, rgba(148, 163, 184, ${intensity * 0.035}), transparent 70%)`;
            el.style.zIndex = "1";
            el.setAttribute("data-active", "true");
          } else {
            if (el.getAttribute("data-active") === "true") {
              el.removeAttribute("data-active");
              el.style.transform = "";
              el.style.borderColor = "";
              el.style.boxShadow = "";
              el.style.background = "";
              el.style.zIndex = "";
            }
          }
        } else {
          // --- CURSOR NOT INTERACTING: Simple, gentle ambient wave ---
          const waveX = Math.sin(elapsed + cx * 0.005 + cy * 0.005) * 0.4;
          const waveY = Math.cos(elapsed * 0.7 + cx * 0.005 - cy * 0.005) * 0.4;
          const waveLift = (Math.sin(elapsed * 0.5 + cx * 0.008 + cy * 0.008) * 0.5 + 0.5) * 2;
          
          const pulse = Math.sin(elapsed * 0.8 + cx * 0.006 + cy * 0.006) * 0.5 + 0.5;
          const ambientGlow = pulse * 0.12;

          const borderRed = Math.round(30 + (70 - 30) * ambientGlow);
          const borderGreen = Math.round(41 + (90 - 41) * ambientGlow);
          const borderBlue = Math.round(59 + (110 - 59) * ambientGlow);
          const borderAlpha = 0.12 + 0.08 * ambientGlow;

          el.style.transform = `perspective(500px) rotateX(${waveX}deg) rotateY(${waveY}deg) translateZ(${waveLift}px)`;
          el.style.borderColor = `rgba(${borderRed}, ${borderGreen}, ${borderBlue}, ${borderAlpha})`;
          el.style.boxShadow = `0 ${waveLift * 0.2}px ${waveLift * 0.4}px rgba(148, 163, 184, ${ambientGlow * 0.015})`;
          el.style.background = `radial-gradient(circle at 50% 50%, rgba(148, 163, 184, ${ambientGlow * 0.012}), transparent 80%)`;
          el.style.zIndex = "";
          el.setAttribute("data-active", "true");
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    coordsRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { cursorActiveRef.current = true; }}
      onMouseLeave={() => {
        cursorActiveRef.current = false;
        coordsRef.current = { x: -9999, y: -9999 };
      }}
      className="relative min-h-screen w-full bg-[#030712] overflow-hidden"
    >
      {/* Dual Spotlight Overlay */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none z-[5] mix-blend-screen opacity-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(300px circle at -9999px -9999px, rgba(20, 184, 166, 0.08), transparent 100%),
            radial-gradient(500px circle at -9999px -9999px, rgba(99, 102, 241, 0.06), transparent 100%)
          `
        }}
      />

      <div
        ref={perspectiveRef}
        className="absolute inset-0 flex items-center justify-center z-0"
        style={{ perspective: "500px" }}
      >
        <div
          className="grid shrink-0"
          style={{
            gridTemplateColumns: `repeat(${dims.cols}, ${CELL}px)`,
            gridTemplateRows: `repeat(${dims.rows}, ${CELL}px)`,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              ref={setCellRef(i)}
              className="border border-slate-800/15 will-change-transform"
              style={{
                width: CELL,
                height: CELL,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
