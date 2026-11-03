"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import createGlobe, { type Arc, type COBEOptions, type Marker } from "cobe";
import { cn } from "../lib/utils";

// A monochrome dotted globe on cobe (WebGL), in three moods:
//   minimal — just the dotted landmass, turning slowly
//   cities  — the world's big cities as raised dots sized by population, each breathing on its own
//   network — a handful of hubs joined by arcs, like routes on a status page
// Drag to spin it; it keeps the throw and settles back to its idle turn.

export type GlobeVariant = "minimal" | "cities" | "network";
export type GlobeDots = "fine" | "regular" | "coarse";

export interface GlobeProps {
  /** Which globe to draw (default: "minimal") */
  variant?: GlobeVariant;
  /** Diameter in px (default: 400) */
  size?: number;
  /** Landmass dot density: fine = many small dots, coarse = fewer, bigger ones (default: "regular") */
  dots?: GlobeDots;
  /** Idle spin multiplier, 0 stops it (default: 1) */
  speed?: number;
  /** Tilt toward the viewer in radians (default: 0.28) */
  tilt?: number;
  /** Scales every city / hub dot (default: 1) */
  markerScale?: number;
  /** Cities breathe and network hubs pulse (default: true) */
  pulse?: boolean;
  /** Show city names next to the biggest markers, where supported (default: true) */
  labels?: boolean;
  /** Atmospheric rim glow, 0–1 (default: 0.55) */
  glow?: number;
  /** Drag to spin (default: true) */
  draggable?: boolean;
  className?: string;
}

const DOT_SAMPLES: Record<GlobeDots, number> = { fine: 36000, regular: 20000, coarse: 9000 };

type City = { name: string; at: [number, number]; pop: number };

// Metro populations in millions, rounded.
const CITIES: City[] = [
  { name: "Tokyo", at: [35.68, 139.69], pop: 37 },
  { name: "Delhi", at: [28.61, 77.21], pop: 33 },
  { name: "Shanghai", at: [31.23, 121.47], pop: 29 },
  { name: "Dhaka", at: [23.81, 90.41], pop: 23 },
  { name: "São Paulo", at: [-23.55, -46.63], pop: 22 },
  { name: "Mexico City", at: [19.43, -99.13], pop: 22 },
  { name: "Cairo", at: [30.04, 31.24], pop: 22 },
  { name: "Mumbai", at: [19.08, 72.88], pop: 21 },
  { name: "Beijing", at: [39.9, 116.4], pop: 21 },
  { name: "Osaka", at: [34.69, 135.5], pop: 19 },
  { name: "New York", at: [40.71, -74.0], pop: 19 },
  { name: "Karachi", at: [24.86, 67.0], pop: 17 },
  { name: "Lagos", at: [6.52, 3.38], pop: 16 },
  { name: "Istanbul", at: [41.01, 28.98], pop: 16 },
  { name: "Buenos Aires", at: [-34.6, -58.38], pop: 15 },
  { name: "Manila", at: [14.6, 120.98], pop: 15 },
  { name: "Kinshasa", at: [-4.44, 15.27], pop: 15 },
  { name: "Los Angeles", at: [34.05, -118.24], pop: 13 },
  { name: "Moscow", at: [55.76, 37.62], pop: 12 },
  { name: "Jakarta", at: [-6.2, 106.85], pop: 11 },
  { name: "Lima", at: [-12.05, -77.04], pop: 11 },
  { name: "Bangkok", at: [13.76, 100.5], pop: 11 },
  { name: "Paris", at: [48.86, 2.35], pop: 11 },
  { name: "London", at: [51.51, -0.13], pop: 9 },
  { name: "Tehran", at: [35.69, 51.39], pop: 9 },
  { name: "Bogotá", at: [4.71, -74.07], pop: 8 },
  { name: "Chicago", at: [41.88, -87.63], pop: 8 },
  { name: "Singapore", at: [1.35, 103.82], pop: 6 },
  { name: "Johannesburg", at: [-26.2, 28.05], pop: 6 },
  { name: "Sydney", at: [-33.87, 151.21], pop: 5 },
  { name: "Nairobi", at: [-1.29, 36.82], pop: 5 },
  { name: "Toronto", at: [43.65, -79.38], pop: 6 },
];

// Network hubs and the routes between them.
const HUBS: Record<string, [number, number]> = {
  sfo: [37.77, -122.42],
  nyc: [40.71, -74.0],
  gru: [-23.55, -46.63],
  lhr: [51.51, -0.13],
  fra: [50.11, 8.68],
  dxb: [25.2, 55.27],
  bom: [19.08, 72.88],
  sin: [1.35, 103.82],
  hnd: [35.68, 139.69],
  syd: [-33.87, 151.21],
  jnb: [-26.2, 28.05],
};
const ROUTES: [string, string][] = [
  ["sfo", "nyc"],
  ["nyc", "lhr"],
  ["fra", "dxb"],
  ["dxb", "bom"],
  ["bom", "sin"],
  ["sin", "hnd"],
  ["sin", "syd"],
  ["sfo", "hnd"],
  ["nyc", "gru"],
  ["lhr", "jnb"],
  ["dxb", "jnb"],
];

const MAX_POP = Math.max(...CITIES.map((c) => c.pop));
const LABELLED = new Set(["Tokyo", "Delhi", "Mumbai", "New York", "São Paulo", "Lagos", "London", "Sydney"]);
const slug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");

/** Marker size and brightness by population: area tracks population, so the big ones read at a glance. */
function cityMarker(city: City, scale: number) {
  const w = Math.sqrt(city.pop / MAX_POP); // 0.37–1
  const shade = 0.45 + 0.55 * w;
  return { size: (0.012 + 0.05 * w) * scale, color: [shade, shade, shade] as [number, number, number] };
}

// Bring a longitude to the front: cobe's phi for that meridian facing the viewer.
const phiFor = (lng: number) => Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2);

const LABEL_CSS = (scope: string) => `
.${scope} .globe-label { display: none; }
@supports (anchor-name: --a) {
  .${scope} .globe-label {
    display: block;
    position: absolute;
    bottom: anchor(top);
    left: anchor(right);
    translate: 7px 3px;
    font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.72);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 0.35s ease, filter 0.35s ease;
  }
}`;

export function Globe({
  variant = "minimal",
  size = 400,
  dots = "regular",
  speed = 1,
  tilt = 0.28,
  markerScale = 1,
  pulse = true,
  labels = true,
  glow = 0.55,
  draggable = true,
  className,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scope = `globe-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // Live values the render loop reads without restarting the globe.
  const live = useRef({ speed, tilt, markerScale, pulse, variant });
  live.current = { speed, tilt, markerScale, pulse, variant };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth;

    // Open on the Indian Ocean side so Asia, Africa and Europe all show.
    let phi = phiFor(70);
    let theta = tilt;
    let velocity = 0; // rad/frame from a throw
    let thetaPull = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let visible = true;
    let raf = 0;
    const start = performance.now();

    const markersAt = (t: number): Marker[] => {
      const { variant: v, markerScale: s, pulse: p } = live.current;
      if (v === "cities") {
        return CITIES.map((city, i) => {
          const m = cityMarker(city, s);
          // Each city breathes on its own period so the map never pulses in unison.
          const breath = p && !reduced ? 1 + 0.16 * Math.sin(t * (0.9 + (i % 5) * 0.17) + i * 1.9) : 1;
          return { location: city.at, size: m.size * breath, color: m.color, id: LABELLED.has(city.name) ? slug(city.name) : undefined };
        });
      }
      if (v === "network") {
        return Object.entries(HUBS).map(([id, at], i) => {
          // A slow ping that travels around the hubs one after another.
          const ping = p && !reduced ? Math.max(0, Math.sin(t * 1.4 - i * 0.8)) ** 6 : 0;
          return { location: at, size: (0.028 + 0.03 * ping) * s, color: [0.95, 0.95, 0.95], id };
        });
      }
      return [];
    };

    const arcs: Arc[] =
      variant === "network" ? ROUTES.map(([a, b]) => ({ from: HUBS[a], to: HUBS[b], id: `${a}-${b}` })) : [];

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: width * dpr,
      phi,
      theta,
      dark: 1,
      diffuse: 1.15,
      mapSamples: DOT_SAMPLES[dots],
      mapBrightness: dots === "coarse" ? 9 : 7,
      mapBaseBrightness: 0.02,
      baseColor: [0.11, 0.11, 0.12],
      markerColor: [1, 1, 1],
      glowColor: [glow * 0.6, glow * 0.6, glow * 0.62],
      markers: markersAt(0),
      markerElevation: variant === "cities" ? 0.035 : 0.02,
      arcs,
      arcColor: [0.62, 0.62, 0.64],
      arcWidth: 0.5,
      arcHeight: 0.22,
      opacity: 0.92,
      scale: 1,
    } satisfies COBEOptions);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const { speed: sp, tilt: tl } = live.current;
      if (!dragging) {
        phi += velocity + (reduced ? 0 : 0.0022 * sp);
        velocity *= 0.94;
        // Ease the tilt back to rest after a vertical drag.
        thetaPull *= 0.92;
      }
      theta = tl + thetaPull;
      const t = (performance.now() - start) / 1000;
      globe.update({ phi, theta, width: width * dpr, height: width * dpr, markers: markersAt(t) });
    };
    raf = requestAnimationFrame(frame);
    canvas.style.opacity = "1";

    // Pointer events cover mouse, pen and touch; capture keeps the drag alive outside the canvas.
    const onDown = (e: PointerEvent) => {
      if (!draggable) return;
      dragging = true;
      velocity = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = (e.clientX - lastX) / width;
      const dy = (e.clientY - lastY) / width;
      lastX = e.clientX;
      lastY = e.clientY;
      const step = dx * Math.PI; // a full-width drag turns it half a revolution
      phi += step;
      velocity = velocity * 0.6 + step * 0.4;
      thetaPull = Math.max(-0.45, Math.min(0.45, thetaPull + dy * 1.6));
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = draggable ? "grab" : "default";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const resize = new ResizeObserver(() => {
      width = canvas.offsetWidth;
    });
    resize.observe(canvas);

    // Stop drawing while scrolled away.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      globe.destroy();
    };
    // Rebuild only for what cobe can't change live: the map, arcs, glow and elevation.
  }, [variant, dots, glow, draggable]);

  const labelled = labels && variant !== "minimal";
  const labelNames =
    variant === "cities"
      ? CITIES.filter((c) => LABELLED.has(c.name)).map((c) => ({ id: slug(c.name), text: c.name }))
      : Object.keys(HUBS).map((id) => ({ id, text: id }));

  return (
    <div
      className={cn("relative select-none", scope, className)}
      style={{ width: size, height: size, maxWidth: "100%", aspectRatio: "1" }}
    >
      {labelled && <style>{LABEL_CSS(scope)}</style>}
      <canvas
        ref={canvasRef}
        aria-label={`Globe${variant === "cities" ? " showing the world's largest cities" : variant === "network" ? " showing a network of routes" : ""}`}
        role="img"
        style={{
          width: "100%",
          height: "100%",
          cursor: draggable ? "grab" : "default",
          touchAction: draggable ? "pan-y" : "auto",
          opacity: 0,
          transition: "opacity 1.2s ease",
        }}
      />
      {labelled &&
        labelNames.map(({ id, text }) => (
          <span
            key={id}
            aria-hidden
            className="globe-label"
            style={
              {
                positionAnchor: `--cobe-${id}`,
                opacity: `var(--cobe-visible-${id}, 0)`,
                filter: `blur(calc((1 - var(--cobe-visible-${id}, 0)) * 6px))`,
              } as CSSProperties
            }
          >
            {text}
          </span>
        ))}
    </div>
  );
}
