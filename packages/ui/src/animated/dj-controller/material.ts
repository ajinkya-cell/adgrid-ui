import type { CSSProperties } from "react";

// The system's canonical surfaces (packages/ui/src/primitives/context.md §2), written as inline
// styles so the chassis renders the same wherever it is installed, with or without the tokens CSS.

export const SHADOW_RAISED =
  "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)";
export const SHADOW_PRESSED = "inset 0 3px 8px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.02)";
export const SHADOW_WELL = "inset 0 1.5px 3px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.05)";
export const BORDER = "1px solid rgba(255,255,255,0.08)";
export const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)";

export const raised: CSSProperties = {
  background: "linear-gradient(180deg, #1b1b1d 0%, #151516 100%)",
  boxShadow: SHADOW_RAISED,
  border: BORDER,
};

export const tray: CSSProperties = {
  background: "#0c0c0d",
  boxShadow: SHADOW_WELL,
  border: "1px solid rgba(255,255,255,0.04)",
};

export const well: CSSProperties = {
  background: "#070707",
  boxShadow: SHADOW_WELL,
};

export const EASE_OUT = [0.32, 0.72, 0, 1] as const;
export const SPRING_CONTROL = { type: "spring", stiffness: 500, damping: 32 } as const;

/** `#rrggbb` → `rgba(r,g,b,a)`. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Silkscreened panel label. */
export const LABEL = "select-none text-[9px] font-medium uppercase leading-none tracking-[0.08em] text-neutral-500";
