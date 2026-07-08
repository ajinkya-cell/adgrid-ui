"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  buildBulbGlowGradient,
  useBulbPositions,
  useSpotlightHover,
} from "./hooks/useSpotlightHover";
import { SPOTLIGHT_THEMES } from "./themes";
import type { SpotlightTextProps } from "./types";

const DEFAULT_FONT_SIZE = "clamp(4rem, 15vw, 11.25rem)";
const BULB_CHARS = new Set(["i", "j"]);
/** Sits on the ascender dot — tuned slightly above center of the glyph cap */
const BULB_TOP = "0.16em";

function resolveFontSize(fontSize: string | number | undefined): string {
  if (fontSize === undefined) return DEFAULT_FONT_SIZE;
  return typeof fontSize === "number" ? `${fontSize}px` : fontSize;
}

function renderCharacters(
  text: string,
  options: {
    showBulb: boolean;
    bulbColor: string;
    isActive: boolean;
    glowOnly?: boolean;
  }
): ReactNode[] {
  const { showBulb, bulbColor, isActive, glowOnly = false } = options;
  const chars: ReactNode[] = [];

  for (let index = 0; index < text.length; index++) {
    const char = text[index]!;

    if (showBulb && BULB_CHARS.has(char)) {
      chars.push(
        <span key={`${char}-${index}`} className="relative inline-block">
          {!glowOnly && char}
          {glowOnly && char}
          {!glowOnly && (
            <span
              aria-hidden
              data-bulb=""
              className="pointer-events-none absolute left-1/2 rounded-full transition-opacity duration-200 ease-out"
              style={{
                top: BULB_TOP,
                width: "0.09em",
                height: "0.09em",
                minWidth: 12,
                minHeight: 12,
                transform: "translate(-50%, -50%)",
                background: bulbColor,
              opacity: 0,
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
  theme = "light",
  spotlightRadius = 120,
  fontSize,
  fontWeight = 800,
  letterSpacing = "-0.02em",
  showBulb = true,
  glowColors,
  as: Component = "span",
  className,
  style,
}: SpotlightTextProps) {
  const tokens = SPOTLIGHT_THEMES[theme];
  const resolvedFontSize = resolveFontSize(fontSize);

  const glowCore = glowColors?.core ?? tokens.glowCore;
  const glowMid = glowColors?.mid ?? tokens.glowMid;
  const bulbColor = glowColors?.bulb ?? tokens.bulb;

  const hasBulbChars = showBulb && [...text].some((c) => BULB_CHARS.has(c));

  const { containerRef, textLayerRef, isHovered, reducedMotion, handlers } =
    useSpotlightHover();

  const isActive = isHovered && hasBulbChars;

  const bulbCenters = useBulbPositions(textLayerRef, [
    text,
    resolvedFontSize,
    fontWeight,
    letterSpacing,
    showBulb,
  ]);

  const sharedTextStyle: CSSProperties = {
    fontSize: resolvedFontSize,
    fontWeight,
    letterSpacing,
    lineHeight: 1,
    fontFamily: "inherit",
    whiteSpace: "pre",
  };

  const containerStyle: CSSProperties = {
    background: tokens.surface,
    ...style,
  };

  const charOptions = useMemo(
    () => ({ showBulb, bulbColor, isActive }),
    [showBulb, bulbColor, isActive]
  );

  const baseCharacters = useMemo(
    () => renderCharacters(text, charOptions),
    [text, charOptions]
  );

  const glowCharacters = useMemo(
    () => renderCharacters(text, { ...charOptions, glowOnly: true, showBulb: false }),
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
        "relative inline-flex items-center justify-center select-none px-8 py-10",
        className
      )}
      style={containerStyle}
      {...handlers}
    >
      <Component
        ref={textLayerRef}
        className="relative inline-block"
        style={sharedTextStyle}
      >
        {/* Base: debossed idle text + bulb markers for measurement */}
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
              transition: "opacity 200ms ease",
            }}
          >
            {glowCharacters}
          </span>
        )}

        {/* Reduced motion: static warm tint on glyphs only */}
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
      </Component>
    </div>
  );
}
