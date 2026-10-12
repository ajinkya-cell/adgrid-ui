"use client";

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export interface ScrollWaterProps {
  /** Corner the button sits in. */
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  /** Diameter in px. */
  size?: number;
  /** Distance from the two nearest viewport edges in px. */
  offset?: number;
  /** Water colour. */
  color?: string;
  /** Shell colour; the arrow is cut out of the water in this colour too. */
  surfaceColor?: string;
  /** Front wave amplitude in SVG units (the back wave is a little taller). 0 is a flat surface. */
  waveHeight?: number;
  /** Drift speed multiplier for both waves. */
  waveSpeed?: number;
  /** Reading progress (0 to 1) at which the circle counts as full and the arrow appears. */
  fullAt?: number;
  /** Glide back to the top. Always instant under prefers-reduced-motion. */
  smooth?: boolean;
  /** Track this scrolling element instead of the page. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
}

// A wave twice the circle's width (200 SVG units) in 50-unit periods, closed
// down past the circle's bottom so the water body is solid under the crest.
// The drift keyframe shifts it by 100, a whole number of periods, so the
// loop is seamless.
const WAVE_PERIOD = 50;
const FRONT_DROP = 3;
const BACK_DRIFT_S = 7;
const FRONT_DRIFT_S = 4.5;

function wavePath(amplitude: number) {
  const half = WAVE_PERIOD / 2;
  let d = `M0 0 Q${half / 2} ${-amplitude * 2} ${half} 0`;
  for (let x = WAVE_PERIOD; x <= 200; x += half) {
    d += ` T${x} 0`;
  }
  return `${d} V140 H0 Z`;
}

// At 0 the crests sit just above the bottom, so the circle reads as a vessel
// holding a little water; at 1 the troughs clear the top and it's covered.
function waterOffset(level: number, full: number) {
  return 96 - level * (96 - full);
}

const CORNERS = {
  "bottom-left": ["bottom", "left"],
  "bottom-right": ["bottom", "right"],
  "top-left": ["top", "left"],
  "top-right": ["top", "right"],
} as const;

const STYLES = `
@keyframes vui-scroll-water-drift { from { transform: translateX(0) } to { transform: translateX(-100px) } }
.vui-scroll-water { transition: opacity 300ms ease-out, transform 300ms ease-out; }
.vui-scroll-water:hover { transform: scale(1.05); }
.vui-scroll-water:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.vui-scroll-water__level { transition: transform 200ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .vui-scroll-water, .vui-scroll-water__level, .vui-scroll-water__arrow { transition: none !important; }
  .vui-scroll-water__wave { animation: none !important; }
}
`;

export function ScrollWater({
  position = "bottom-left",
  size = 44,
  offset = 24,
  color = "#e7e5df",
  surfaceColor = "#151515",
  waveHeight = 3.5,
  waveSpeed = 1,
  fullAt = 0.995,
  smooth = true,
  container,
  className,
}: Readonly<ScrollWaterProps>) {
  const waterRef = useRef<SVGGElement | null>(null);
  const readRef = useRef<HTMLSpanElement | null>(null);
  const levelRef = useRef(0);
  const [scrollable, setScrollable] = useState(false);
  const [full, setFull] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const frontAmp = Math.max(0, waveHeight);
  const speed = Math.max(0.05, waveSpeed);
  const backAmp = frontAmp * (9 / 7); // 3.5 → 4.5
  const backWave = useMemo(() => wavePath(backAmp), [backAmp]);
  const frontWave = useMemo(() => wavePath(frontAmp), [frontAmp]);
  // Raise the "full" line with the waves so the troughs still clear the top.
  const fullOffset = -Math.max(12, frontAmp + FRONT_DROP + 5, backAmp + 5);
  const fullOffsetRef = useRef(fullOffset);
  fullOffsetRef.current = fullOffset;

  // Set once, so a re-render never overwrites the level written to the DOM.
  const initialTransform = useRef(`translateY(${waterOffset(0, fullOffset)}px)`).current;

  useEffect(() => {
    if (waterRef.current) {
      waterRef.current.style.transform = `translateY(${waterOffset(levelRef.current, fullOffset)}px)`;
    }
  }, [fullOffset, mounted]);

  useEffect(() => {
    if (!mounted) return;
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = container?.current ?? document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const level = total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0;
      levelRef.current = level;

      // Written straight to the DOM: no React render per scroll frame.
      if (waterRef.current) {
        waterRef.current.style.transform = `translateY(${waterOffset(level, fullOffsetRef.current)}px)`;
      }
      if (readRef.current) {
        readRef.current.textContent = `${Math.round(level * 100)}% read`;
      }
      setScrollable(total > 4);
      setFull(level >= fullAt);
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const target: HTMLElement | Window = container?.current ?? window;
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    // Images and late content change the scroll height without a scroll.
    const observer = new ResizeObserver(schedule);
    const box = container?.current;
    if (box) {
      observer.observe(box);
      if (box.firstElementChild) observer.observe(box.firstElementChild);
    } else {
      observer.observe(document.body);
    }
    update();

    return () => {
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [container, fullAt, mounted]);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = container?.current ?? window;
    target.scrollTo({ top: 0, behavior: smooth && !reduceMotion ? "smooth" : "instant" });
  }

  const [vertical, horizontal] = CORNERS[position];
  const arrowSize = Math.round(size * 0.4);

  if (!mounted) return null;

  // Portalled to <body>: an ancestor with a transform or filter (page
  // transitions, animated wrappers) would otherwise turn position: fixed into
  // "fixed to that ancestor", and the button would scroll away with the page.
  return createPortal(
    <>
      <style>{STYLES}</style>
      <button
        aria-hidden={scrollable ? undefined : true}
        aria-label="Back to top"
        className={cn("vui-scroll-water", className)}
        onClick={scrollToTop}
        tabIndex={scrollable ? 0 : -1}
        type="button"
        style={{
          position: "fixed",
          [vertical]: offset,
          [horizontal]: offset,
          zIndex: 40,
          width: size,
          height: size,
          padding: 0,
          overflow: "hidden",
          borderRadius: "9999px",
          cursor: "pointer",
          color,
          backgroundColor: surfaceColor,
          border: "1px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(255,255,255,0.16)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.35), 0 16px 40px rgba(0,0,0,0.32)",
          opacity: scrollable ? 1 : 0,
          pointerEvents: scrollable ? undefined : "none",
        }}
      >
        <svg
          aria-hidden="true"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <g className="vui-scroll-water__level" ref={waterRef} style={{ transform: initialTransform }}>
            <g
              className="vui-scroll-water__wave"
              style={{ animation: `vui-scroll-water-drift ${BACK_DRIFT_S / speed}s linear infinite` }}
            >
              <path d={backWave} fill="currentColor" opacity={0.3} />
            </g>
            <g
              className="vui-scroll-water__wave"
              style={{ animation: `vui-scroll-water-drift ${FRONT_DRIFT_S / speed}s linear infinite reverse` }}
            >
              <path d={frontWave} fill="currentColor" opacity={0.85} transform={`translate(0 ${FRONT_DROP})`} />
            </g>
          </g>
        </svg>

        <svg
          aria-hidden="true"
          className="vui-scroll-water__arrow"
          fill="none"
          stroke={surfaceColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.25}
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: arrowSize,
            height: arrowSize,
            opacity: full ? 1 : 0,
            transform: full ? "translateY(0)" : "translateY(6px)",
            transition: full
              ? "opacity 350ms cubic-bezier(0.22,1,0.36,1) 150ms, transform 350ms cubic-bezier(0.22,1,0.36,1) 150ms"
              : "opacity 200ms cubic-bezier(0.22,1,0.36,1), transform 200ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <path d="m5 12 7-7 7 7" />
          <path d="M12 19V5" />
        </svg>

        <span
          ref={readRef}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          0% read
        </span>
      </button>
    </>,
    document.body
  );
}

export default ScrollWater;
