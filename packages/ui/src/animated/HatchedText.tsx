"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

// Oversized display type engraved into the surface: the glyphs carry no solid fill, only fine
// diagonal hatching over a faint body. The line is sized to fill its container's width. The hatch
// is a small SVG tile on a whole-pixel grid rather than a CSS gradient, so every line rasterises
// the same way instead of drifting between thick and thin across the word.

export type HatchedTextDirection = "left" | "right";

export interface HatchedTextProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The line to render. Fitted to the container's width. */
  text?: string;
  /** Hatch tile size in px; lines repeat every `pitch` px along each axis. Rounded to whole pixels. */
  pitch?: number;
  /** Hatch line thickness, in px. */
  lineWidth?: number;
  /** Which way the lines lean: `right` is `/`, `left` is `\`. */
  direction?: HatchedTextDirection;
  /** Hatch line opacity (0–1). */
  intensity?: number;
  /** Fade the glyphs out toward the bottom. */
  fade?: boolean;
}

// Measured at this size, then scaled to fit.
const REF_SIZE = 100;

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap');";
const FONT_FAMILY = '"Instrument Serif", serif';

const FADE = "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.08) 100%)";

/** A whole-pixel SVG tile of one diagonal hatch line, as a CSS `url()`. Shared with InspectText. */
export function hatchTile(pitch: number, lineWidth: number, direction: HatchedTextDirection, intensity: number) {
  const p = pitch;
  // One diagonal corner to corner, plus the two corner stubs that join it to the neighbouring tiles.
  const d =
    direction === "right"
      ? `M0 ${p}L${p} 0M-1 1L1 -1M${p - 1} ${p + 1}L${p + 1} ${p - 1}`
      : `M0 0L${p} ${p}M-1 ${p - 1}L1 ${p + 1}M${p - 1} -1L${p + 1} 1`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${p}" height="${p}"><path d="${d}" stroke="rgba(255,255,255,${intensity})" stroke-width="${lineWidth}" stroke-linecap="square"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const HatchedText = forwardRef<HTMLDivElement, HatchedTextProps>(function HatchedText(
  {
    text = "Ajinkya",
    pitch = 5,
    lineWidth = 1,
    direction = "left",
    intensity = 0.45,
    fade = false,
    className,
    ...rest
  },
  ref
) {
  const boxRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(0);

  // Fit the line to the box: measure it at REF_SIZE and scale linearly, since glyph advance does.
  const fit = () => {
    const box = boxRef.current;
    const probe = probeRef.current;
    if (!box || !probe) return;
    const w = probe.getBoundingClientRect().width;
    if (w > 0) setFontSize((box.clientWidth / w) * REF_SIZE);
  };

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text]);

  // Web fonts change the advance after first paint.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && fit());
    return () => {
      live = false;
    };
  }, [text]);

  const tile = Math.max(2, Math.round(pitch));

  return (
    <div
      ref={ref}
      role="heading"
      aria-level={1}
      aria-label={text}
      className={cn("relative w-full select-none", className)}
      {...rest}
    >
      <style>{FONT_IMPORT}</style>
      <div ref={boxRef} className="relative w-full">
        {/* Invisible probe at a fixed size, used only to measure the line's natural width. */}
        <span
          ref={probeRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre leading-none"
          style={{ fontFamily: FONT_FAMILY, fontSize: REF_SIZE }}
        >
          {text}
        </span>

        <span
          aria-hidden
          className="block whitespace-pre bg-clip-text text-center leading-[1.1] text-transparent [-webkit-background-clip:text]" // void-lint-ignore: clips a monochrome hatch texture, not a hue gradient
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize || REF_SIZE,
            visibility: fontSize ? "visible" : "hidden",
            backgroundImage: `${hatchTile(tile, lineWidth, direction, intensity)}, linear-gradient(rgba(255,255,255,0.035), rgba(255,255,255,0.035))`,
            backgroundSize: `${tile}px ${tile}px, 100% 100%`,
            WebkitMaskImage: fade ? FADE : undefined,
            maskImage: fade ? FADE : undefined,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
});
