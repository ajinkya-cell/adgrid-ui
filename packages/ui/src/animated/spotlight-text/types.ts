import type { CSSProperties, ElementType } from "react";

export type SpotlightColorMode = "default" | "yellow";
export type SpotlightTextTheme = SpotlightColorMode | "light" | "dark";

export interface SpotlightGlowColors {
  core?: string;
  mid?: string;
  bulb?: string;
  bloom?: string;
}

export interface SpotlightTextProps {
  /** Text to render */
  text: string;
  /** Color mode: "default" (purple) or "yellow" (warm gold) */
  colorMode?: SpotlightColorMode;
  /** Legacy alias for colorMode */
  theme?: SpotlightTextTheme;
  /** Spotlight radius in px */
  spotlightRadius?: number;
  /** Display font size */
  fontSize?: string | number;
  fontWeight?: number;
  letterSpacing?: string;
  /** Override theme glow colors */
  glowColors?: SpotlightGlowColors;
  /** Semantic HTML element */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}
