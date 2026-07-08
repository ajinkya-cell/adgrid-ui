import type { CSSProperties, ElementType } from "react";

export type SpotlightTextTheme = "light" | "dark";

export interface SpotlightGlowColors {
  core?: string;
  mid?: string;
  bulb?: string;
}

export interface SpotlightTextProps {
  /** Text to render */
  text: string;
  /** Surface and deboss palette */
  theme?: SpotlightTextTheme;
  /** Spotlight radius in px */
  spotlightRadius?: number;
  /** Display font size */
  fontSize?: string | number;
  fontWeight?: number;
  letterSpacing?: string;
  /** Glowing ascender-dot bulbs on i/j characters */
  showBulb?: boolean;
  /** Override theme glow colors */
  glowColors?: SpotlightGlowColors;
  /** Semantic HTML element */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}
