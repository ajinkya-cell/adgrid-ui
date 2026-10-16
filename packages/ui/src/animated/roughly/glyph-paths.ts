import type { Font, Path } from "opentype.js";

/**
 * SVG path data for one glyph. Some fonts come out of opentype.js with a NaN coordinate here
 * and there, and the browser stops drawing a path at the first bad number, so a missing value is
 * filled in from the points around it rather than ending the letter early.
 */
export function glyphToPathData(glyph: Path): string {
  const r = (v: number) => Math.round(v * 100) / 100;
  let cx = 0;
  let cy = 0;
  let out = "";
  for (const c of glyph.commands) {
    if (c.type === "Z") {
      out += "Z";
      continue;
    }
    const x = Number.isFinite(c.x) ? c.x : cx;
    const y = Number.isFinite(c.y) ? c.y : cy;
    if (c.type === "M" || c.type === "L") {
      out += `${c.type}${r(x)} ${r(y)}`;
    } else if (c.type === "Q") {
      const x1 = Number.isFinite(c.x1) ? c.x1 : (cx + x) / 2;
      const y1 = Number.isFinite(c.y1) ? c.y1 : (cy + y) / 2;
      out += `Q${r(x1)} ${r(y1)} ${r(x)} ${r(y)}`;
    } else if (c.type === "C") {
      const x1 = Number.isFinite(c.x1) ? c.x1 : cx;
      const y1 = Number.isFinite(c.y1) ? c.y1 : cy;
      const x2 = Number.isFinite(c.x2) ? c.x2 : x;
      const y2 = Number.isFinite(c.y2) ? c.y2 : y;
      out += `C${r(x1)} ${r(y1)} ${r(x2)} ${r(y2)} ${r(x)} ${r(y)}`;
    }
    cx = x;
    cy = y;
  }
  return out;
}

export interface GlyphBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GlyphLayout {
  /** One path per visible glyph, in reading order (spaces are dropped). */
  paths: string[];
  /** Bounds of the whole run of text. */
  box: GlyphBox;
}

/** Lays `text` out on one line at `size`, starting at x = 0 with the baseline at `baseline`. */
export function layoutGlyphs(font: Font, text: string, size: number, baseline = size * 0.85): GlyphLayout | null {
  try {
    const paths = font
      .getPaths(text, 0, baseline, size)
      .map(glyphToPathData)
      .filter((d) => d.length > 0);
    const b = font.getPath(text, 0, baseline, size).getBoundingBox();
    if (![b.x1, b.y1, b.x2, b.y2].every(Number.isFinite)) return null;
    return { paths, box: { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2 } };
  } catch {
    return null;
  }
}
