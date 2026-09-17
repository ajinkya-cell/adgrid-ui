"use client";

import * as React from "react";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  buildBulbGlowGradient,
  useBulbPositions,
  useSpotlightHover,
} from "./hooks/useSpotlightHover";
import { SPOTLIGHT_THEMES } from "./themes";
import type { SpotlightColorMode, SpotlightTextProps } from "./types";

const DEFAULT_FONT_SIZE = "clamp(3.5rem, 12vw, 9rem)";
const BULB_CHARS = new Set(["i", "j"]);
/** Center of the glyph tittle / ascender dot */
const BULB_TOP = "0.145em";

function resolveFontSize(fontSize: string | number | undefined): string {
  if (fontSize === undefined) return DEFAULT_FONT_SIZE;
  return typeof fontSize === "number" ? `${fontSize}px` : fontSize;
}

function renderCharacters(
  text: string,
  options: {
    bulbColor: string;
    bulbBloom: string;
    isActive: boolean;
    glowOnly?: boolean;
  }
): ReactNode[] {
  const { bulbColor, bulbBloom, isActive, glowOnly = false } = options;
  const chars: ReactNode[] = [];

  for (let index = 0; index < text.length; index++) {
    const char = text[index]!;

    if (BULB_CHARS.has(char)) {
      chars.push(
        <span key={`${char}-${index}`} className="relative inline-block">
          {!glowOnly && char}
          {glowOnly && char}
          {!glowOnly && (
            <span
              aria-hidden
              data-bulb=""
              className="pointer-events-none absolute left-1/2 rounded-full transition-all duration-300 ease-out"
              style={{
                top: BULB_TOP,
                width: "0.065em",
                height: "0.065em",
                minWidth: 4,
                minHeight: 4,
                transform: "translate(-50%, -50%)",
                background: isActive ? bulbColor : "rgba(255, 255, 255, 0.25)",
                boxShadow: isActive ? bulbBloom : "none",
                opacity: isActive ? 1 : 0.45,
              }}
            />
          )}
        </span>
      );
    } else {
      chars.push(
        <span key={`${char}-${index}`} className="inline-block">
          {char}
        </span>
      );
    }
  }

  return chars;
}

export function SpotlightText({
  text,
  colorMode = "default",
  theme,
  spotlightRadius = 140,
  fontSize,
  fontWeight = 800,
  letterSpacing = "-0.02em",
  glowColors,
  as: Component = "span",
  className,
  style,
}: SpotlightTextProps) {
  const activeColorMode: SpotlightColorMode =
    colorMode || (theme === "yellow" ? "yellow" : "default");
  const tokens = SPOTLIGHT_THEMES[activeColorMode] || SPOTLIGHT_THEMES.default;
  const resolvedFontSize = resolveFontSize(fontSize);

  const glowCore = glowColors?.core ?? tokens.glowCore;
  const glowMid = glowColors?.mid ?? tokens.glowMid;
  const bulbColor = glowColors?.bulb ?? tokens.bulb;
  const bulbBloom = glowColors?.bloom ?? tokens.bulbBloom;

  const hasBulbChars = [...text].some((c) => BULB_CHARS.has(c));

  const { containerRef, textLayerRef, isHovered, reducedMotion, handlers } =
    useSpotlightHover();

  const isActive = isHovered && hasBulbChars;

  const bulbCenters = useBulbPositions(textLayerRef, [
    text,
    resolvedFontSize,
    fontWeight,
    letterSpacing,
    activeColorMode,
  ]);

  const sharedTextStyle: CSSProperties = {
    fontSize: resolvedFontSize,
    fontWeight,
    letterSpacing,
    lineHeight: 1,
    fontFamily: "inherit",
    whiteSpace: "pre",
  };

  const charOptions = useMemo(
    () => ({ bulbColor, bulbBloom, isActive }),
    [bulbColor, bulbBloom, isActive]
  );

  const baseCharacters = useMemo(
    () => renderCharacters(text, charOptions),
    [text, charOptions]
  );

  const glowCharacters = useMemo(
    () => renderCharacters(text, { ...charOptions, glowOnly: true }),
    [text, charOptions]
  );

  const bulbGlowGradient = useMemo(() => {
    if (!isActive || bulbCenters.length === 0) return "none";
    return buildBulbGlowGradient(bulbCenters, spotlightRadius, glowCore, glowMid);
  }, [isActive, bulbCenters, spotlightRadius, glowCore, glowMid]);

  const baseShadow = `${tokens.debossHighlight}, ${tokens.debossShadow}`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center justify-center select-none",
        className
      )}
      style={style}
      {...handlers}
    >
      {React.createElement(
        Component as any,
        {
          ref: textLayerRef,
          className: "relative inline-block",
          style: sharedTextStyle,
        },
        <>
          {/* Base: debossed idle text + subtle bulb marker for measurement and resting state */}
        <span
          className="relative z-[1] block"
          style={{
            ...sharedTextStyle,
            color: tokens.idleText,
            textShadow: baseShadow,
          }}
        >
          {baseCharacters}
        </span>

        {/* Glow: radiates from i/j bulbs, clipped strictly to glyph shapes */}
        {!reducedMotion && hasBulbChars && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-[2] block overflow-hidden"
            style={{
              ...sharedTextStyle,
              color: "transparent",
              backgroundImage: bulbGlowGradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: isActive ? 1 : 0,
              transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {glowCharacters}
          </span>
        )}

        {/* Reduced motion: static glow on glyphs */}
        {reducedMotion && hasBulbChars && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-[2] block"
            style={{
              ...sharedTextStyle,
              color: "transparent",
              backgroundImage: buildBulbGlowGradient(
                bulbCenters.length > 0
                  ? bulbCenters
                  : [{ x: 0, y: 0 }],
                spotlightRadius,
                glowCore,
                glowMid
              ),
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 0.85,
            }}
          >
            {glowCharacters}
          </span>
        )}
      </>
    )}
  </div>
  );
}
