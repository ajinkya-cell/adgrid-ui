import type { SpotlightTextTheme } from "./types";

export interface SpotlightThemeTokens {
  surface?: string;
  idleText: string;
  debossHighlight: string;
  debossShadow: string;
  glowCore: string;
  glowMid: string;
  bulb: string;
  bulbBloom: string;
  activeHighlight?: string;
  activeShadow?: string;
}

export const SPOTLIGHT_THEMES: Record<SpotlightTextTheme, SpotlightThemeTokens> = {
  default: {
    idleText: "#52525b",
    debossHighlight: "0 -1px 0 rgba(255, 255, 255, 0.06)",
    debossShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
    glowCore: "#f3e8ff",
    glowMid: "#c084fc",
    bulb: "#d8b4fe",
    bulbBloom: "0 0 10px 3px rgba(192, 132, 252, 0.5), 0 0 22px 6px rgba(168, 85, 247, 0.25)",
    activeHighlight: "0 1px 0 rgba(255, 255, 255, 0.15)",
    activeShadow: "0 -2px 3px rgba(0, 0, 0, 0.5)",
  },
  yellow: {
    idleText: "#52525b",
    debossHighlight: "0 -1px 0 rgba(255, 255, 255, 0.06)",
    debossShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
    glowCore: "#fef08a",
    glowMid: "#eab308",
    bulb: "#facc15",
    bulbBloom: "0 0 10px 3px rgba(250, 204, 21, 0.5), 0 0 22px 6px rgba(234, 179, 8, 0.25)",
    activeHighlight: "0 1px 0 rgba(255, 255, 255, 0.15)",
    activeShadow: "0 -2px 3px rgba(0, 0, 0, 0.5)",
  },
  // Legacy aliases
  dark: {
    idleText: "#52525b",
    debossHighlight: "0 -1px 0 rgba(255, 255, 255, 0.06)",
    debossShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
    glowCore: "#f3e8ff",
    glowMid: "#c084fc",
    bulb: "#d8b4fe",
    bulbBloom: "0 0 10px 3px rgba(192, 132, 252, 0.5), 0 0 22px 6px rgba(168, 85, 247, 0.25)",
    activeHighlight: "0 1px 0 rgba(255, 255, 255, 0.15)",
    activeShadow: "0 -2px 3px rgba(0, 0, 0, 0.5)",
  },
  light: {
    idleText: "#52525b",
    debossHighlight: "0 -1px 0 rgba(255, 255, 255, 0.06)",
    debossShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
    glowCore: "#f3e8ff",
    glowMid: "#c084fc",
    bulb: "#d8b4fe",
    bulbBloom: "0 0 10px 3px rgba(192, 132, 252, 0.5), 0 0 22px 6px rgba(168, 85, 247, 0.25)",
    activeHighlight: "0 1px 0 rgba(255, 255, 255, 0.15)",
    activeShadow: "0 -2px 3px rgba(0, 0, 0, 0.5)",
  },
};
