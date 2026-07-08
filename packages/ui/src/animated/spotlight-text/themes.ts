import type { SpotlightTextTheme } from "./types";

export interface SpotlightThemeTokens {
  surface: string;
  idleText: string;
  debossHighlight: string;
  debossShadow: string;
  glowCore: string;
  glowMid: string;
  bulb: string;
  bulbBloom: string;
  activeHighlight: string;
  activeShadow: string;
}

export const SPOTLIGHT_THEMES: Record<SpotlightTextTheme, SpotlightThemeTokens> = {
  light: {
    surface: "#eaeaea",
    idleText: "#b8b8b8",
    debossHighlight: "0 1px 0 rgba(255, 255, 255, 0.9)",
    debossShadow: "0 -1px 2px rgba(0, 0, 0, 0.15)",
    glowCore: "#d4c050",
    glowMid: "#c0a830",
    bulb: "#e8e85a",
    bulbBloom: "0 0 20px 10px rgba(232, 232, 90, 0.3), 0 0 40px 20px rgba(232, 232, 90, 0.1)",
    activeHighlight: "0 -1px 0 rgba(255, 255, 255, 0.4)",
    activeShadow: "0 2px 3px rgba(0, 0, 0, 0.2)",
  },
  dark: {
    surface: "#1a1a1a",
    idleText: "#454545",
    debossHighlight: "0 -1px 0 rgba(255, 255, 255, 0.06)",
    debossShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
    glowCore: "#e8c848",
    glowMid: "#c8a030",
    bulb: "#f0e868",
    bulbBloom: "0 0 24px 12px rgba(240, 232, 104, 0.35), 0 0 48px 24px rgba(240, 232, 104, 0.12)",
    activeHighlight: "0 1px 0 rgba(255, 255, 255, 0.15)",
    activeShadow: "0 -2px 3px rgba(0, 0, 0, 0.5)",
  },
};
