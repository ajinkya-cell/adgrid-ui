"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "../lib/utils";

export interface HorizonGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  colors?: string[]; // Any CSS colours, including var(--token). One blob per colour.
  height?: number; // How far up the glow reaches before fully fading, 0–1 of container height (default: 0.6)
  intensity?: number; // Overall glow opacity, 0–1 (default: 0.9)
  speed?: number; // Drift speed multiplier (default: 1)
  grain?: number; // Film grain opacity, 0 disables (default: 0.07)
  interactive?: boolean; // Blobs lean toward the cursor (default: true)
  parallax?: number; // Max cursor lean in px (default: 36)
  fixed?: boolean; // Pin the glow to the viewport instead of the container (default: false)
}

const DEFAULT_COLORS = ["#4f46e5", "#7c3aed", "#db2777", "#0ea5e9"];

const GRAIN_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// Deterministic per-index noise so server and client render identical blobs.
function hash(i: number, salt: number) {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

interface Blob {
  x: number; // centre, % of container width
  y: number; // centre, % of container height
  size: number; // diameter, % of container width
  ampX: number; // drift, % of blob size
  ampY: number;
  freqX: number; // rad/s
  freqY: number;
  freqS: number;
  phase: number;
  depth: number; // parallax multiplier
}

function buildBlobs(count: number): Blob[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (salt: number) => hash(i + 1, salt);
    const period = (min: number, max: number, salt: number) =>
      (Math.PI * 2) / (min + r(salt) * (max - min));
    return {
      x: ((i + 0.5) / count) * 100 + (r(1) - 0.5) * (60 / count),
      y: 94 + r(2) * 16,
      size: 48 + r(3) * 26,
      ampX: 14 + r(4) * 10,
      ampY: 6 + r(5) * 8,
      freqX: period(22, 34, 6),
      freqY: period(16, 26, 7),
      freqS: period(12, 20, 8),
      phase: r(9) * Math.PI * 2,
      depth: 0.5 + r(10),
    };
  });
}

// Soft radial falloff; extra stops approximate a gaussian so there is no visible rim.
function blobGradient(color: string) {
  const stop = (pct: number, at: number) =>
    `color-mix(in srgb, ${color} ${pct}%, transparent) ${at}%`;
  return `radial-gradient(closest-side, ${stop(100, 0)}, ${stop(78, 22)}, ${stop(48, 45)}, ${stop(22, 66)}, ${stop(7, 84)}, transparent 100%)`;
}

// Hold full strength for the first 15%, then a smoothstep fade out to `height`.
function fadeMask(height: number) {
  const h = Math.min(Math.max(height, 0.05), 1) * 100;
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 1].map((u) => {
    const alpha = 1 - u * u * (3 - 2 * u);
    return `rgba(0,0,0,${alpha.toFixed(3)}) ${(h * (0.15 + 0.85 * u)).toFixed(2)}%`;
  });
  return `linear-gradient(to top, rgba(0,0,0,1) 0%, ${stops.join(", ")})`;
}

function blobTransform(b: Blob, t: number, mx: number, my: number) {
  const dx =
    b.ampX * (0.7 * Math.sin(t * b.freqX + b.phase) + 0.3 * Math.sin(t * b.freqX * 1.618 + b.phase * 2));
  const dy =
    b.ampY * (0.7 * Math.sin(t * b.freqY + b.phase * 1.3) + 0.3 * Math.sin(t * b.freqY * 2.414 + b.phase));
  const s = 1 + 0.07 * Math.sin(t * b.freqS + b.phase);
  return `translate3d(${(-50 + dx).toFixed(3)}%, ${(-50 + dy).toFixed(3)}%, 0) translate3d(${(mx * b.depth).toFixed(2)}px, ${(my * b.depth).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
}

export const HorizonGlow = ({
  children,
  className,
  colors = DEFAULT_COLORS,
  height = 0.6,
  intensity = 0.9,
  speed = 1,
  grain = 0.07,
  interactive = true,
  parallax = 36,
  fixed = false,
  ...props
}: HorizonGlowProps) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blobs = useMemo(() => buildBlobs(colors.length), [colors.length]);

  // Live values read by the animation loop without restarting it.
  const live = useRef({ speed, interactive, parallax });
  live.current = { speed, interactive, parallax };

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let onScreen = true;
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };

    const paint = () => {
      blobs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (el) el.style.transform = blobTransform(b, elapsed, pointer.x, pointer.y);
      });
    };

    const frame = (now: number) => {
      // Clamp dt so returning from a paused state never jumps.
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      elapsed += dt * live.current.speed;

      const ease = 1 - Math.exp(-dt * 2.5);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;

      paint();
      raf = requestAnimationFrame(frame);
    };

    const shouldRun = () => onScreen && !document.hidden && !motionQuery.matches;
    const sync = () => {
      if (shouldRun() && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun() && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !live.current.interactive) return;
      const p = live.current.parallax;
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2 * p;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * p;
    };
    const onPointerLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(layer);

    paint();
    sync();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, [blobs]);

  const mask = fadeMask(height);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-neutral-950 text-white",
        !fixed && "h-full min-h-screen",
        className
      )}
      {...props}
    >
      <div
        ref={layerRef}
        aria-hidden
        className={cn("pointer-events-none inset-0 z-0", fixed ? "fixed" : "absolute")}
        style={{ opacity: intensity, WebkitMaskImage: mask, maskImage: mask, containerType: "size" }}
      >
        {blobs.map((b, i) => (
          <div
            key={i}
            ref={(el) => {
              blobRefs.current[i] = el;
            }}
            className="absolute aspect-square will-change-transform"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              // Container units keep the glow full on tall, narrow (mobile) layouts.
              width: `max(${b.size}cqw, ${(b.size * 1.1).toFixed(1)}cqh)`,
              background: blobGradient(colors[i]),
              transform: blobTransform(b, 0, 0, 0),
            }}
          />
        ))}

        {grain > 0 && (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: GRAIN_URI, backgroundSize: "180px 180px", opacity: grain }}
          />
        )}
      </div>

      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
};
