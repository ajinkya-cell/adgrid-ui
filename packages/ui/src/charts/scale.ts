// Pure geometry for the charts: scales, nice ticks, path builders and the series tones.
// No React here, so every chart draws from the same arithmetic.

export const EASE_OUT = [0.32, 0.72, 0, 1] as const;

export type Pt = readonly [number, number];

// Series are told apart by luminance and line style, never hue. Tone 0 is the popout series,
// the lightest thing in the plot; the rest step down and change dash so they read in greyscale,
// in print and for colour-blind readers alike.
export interface SeriesTone {
  stroke: string;
  fill: string;
  dash?: string;
  /** Opacity at the top of an area fill. */
  area: number;
}

export const TONES: SeriesTone[] = [
  { stroke: "#f5f5f5", fill: "#f5f5f5", area: 0.16 },
  { stroke: "rgba(255,255,255,0.5)", fill: "rgba(255,255,255,0.46)", dash: "5 4", area: 0.06 },
  { stroke: "rgba(255,255,255,0.3)", fill: "rgba(255,255,255,0.27)", dash: "1.5 4", area: 0.045 },
  { stroke: "rgba(255,255,255,0.2)", fill: "rgba(255,255,255,0.16)", dash: "7 3 1.5 3", area: 0.035 },
];

export const tone = (i: number) => TONES[((i % TONES.length) + TONES.length) % TONES.length];

// Parts of a whole (donut, radial rings) need more steps than lines do.
export const SLICE_FILLS = [
  "",
  "rgba(255,255,255,0.58)",
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.27)",
  "rgba(255,255,255,0.18)",
  "rgba(255,255,255,0.11)",
];

/** A slice fill: the popout gradient for the first, then stepped greys. */
export const sliceFill = (i: number, popId: string) =>
  i === 0 ? `url(#${popId})` : SLICE_FILLS[Math.min(i, SLICE_FILLS.length - 1)];

export const r2 = (n: number) => Math.round(n * 100) / 100;
export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
export const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);

/** Maps a domain onto a range, linearly. */
export const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count);
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  const e = raw / p;
  return (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * p;
}

/** Rounds a domain out to tidy numbers and lists the ticks inside it. */
export function niceDomain(lo: number, hi: number, count = 4) {
  if (lo === hi) hi = lo + 1;
  const step = niceStep(hi - lo, count);
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return { min, max, ticks };
}

/** 1.2k, 3.4M — short numbers for axes. */
export function compact(n: number) {
  const a = Math.abs(n);
  const trim = (v: number) => v.toFixed(1).replace(/\.0$/, "");
  if (a >= 1e9) return `${trim(n / 1e9)}B`;
  if (a >= 1e6) return `${trim(n / 1e6)}M`;
  if (a >= 1e3) return `${trim(n / 1e3)}k`;
  return Number.isInteger(n) ? String(n) : trim(n);
}

export const linePath = (pts: Pt[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${r2(p[0])},${r2(p[1])}`).join("");

/** A monotone cubic through the points: smooth, but never overshoots the data. */
export function smoothPath(pts: Pt[]) {
  const n = pts.length;
  if (n < 3) return linePath(pts);
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) m.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0] || 1));
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      t[i] = tau * a * m[i];
      t[i + 1] = tau * b * m[i];
    }
  }
  let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = (x1 - x0) / 3;
    d += `C${r2(x0 + h)},${r2(y0 + t[i] * h)},${r2(x1 - h)},${r2(y1 - t[i + 1] * h)},${r2(x1)},${r2(y1)}`;
  }
  return d;
}

export function areaPath(pts: Pt[], baseY: number, smooth: boolean) {
  if (!pts.length) return "";
  const top = smooth ? smoothPath(pts) : linePath(pts);
  return `${top}L${r2(pts[pts.length - 1][0])},${r2(baseY)}L${r2(pts[0][0])},${r2(baseY)}Z`;
}

/** A point on a circle; 0° is twelve o'clock, angles run clockwise. */
export function polar(cx: number, cy: number, r: number, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  return [r2(cx + r * Math.sin(a)), r2(cy - r * Math.cos(a))];
}

/** An open arc, for stroking. */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const span = Math.min(a1 - a0, 359.99);
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a0 + span);
  return `M${x0},${y0}A${r},${r} 0 ${span > 180 ? 1 : 0} 1 ${x1},${y1}`;
}

/** A filled ring segment between two radii; a wedge when the inner radius is 0. */
export function ringSegment(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const span = Math.min(a1 - a0, 359.99);
  const large = span > 180 ? 1 : 0;
  const [ox0, oy0] = polar(cx, cy, r1, a0);
  const [ox1, oy1] = polar(cx, cy, r1, a0 + span);
  if (r0 <= 0) return `M${cx},${cy}L${ox0},${oy0}A${r1},${r1} 0 ${large} 1 ${ox1},${oy1}Z`;
  const [ix0, iy0] = polar(cx, cy, r0, a0);
  const [ix1, iy1] = polar(cx, cy, r0, a0 + span);
  return `M${ox0},${oy0}A${r1},${r1} 0 ${large} 1 ${ox1},${oy1}L${ix1},${iy1}A${r0},${r0} 0 ${large} 0 ${ix0},${iy0}Z`;
}

/** A bar whose data end (the side away from the baseline) is rounded. */
export function barPath(x: number, y: number, w: number, h: number, radius: number, end: "top" | "bottom" | "right" | "left" | "none") {
  if (w <= 0 || h <= 0) return "";
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const [X, Y, W, H, R] = [x, y, w, h, r].map(r2);
  const arc = (tx: number, ty: number) => `A${R},${R} 0 0 1 ${r2(tx)},${r2(ty)}`;
  switch (end) {
    case "top":
      return `M${X},${Y + H}L${X},${Y + R}${arc(X + R, Y)}L${X + W - R},${Y}${arc(X + W, Y + R)}L${X + W},${Y + H}Z`;
    case "bottom":
      return `M${X},${Y}L${X + W},${Y}L${X + W},${Y + H - R}${arc(X + W - R, Y + H)}L${X + R},${Y + H}${arc(X, Y + H - R)}Z`;
    case "right":
      return `M${X},${Y}L${X + W - R},${Y}${arc(X + W, Y + R)}L${X + W},${Y + H - R}${arc(X + W - R, Y + H)}L${X},${Y + H}Z`;
    case "left":
      return `M${X + W},${Y + H}L${X + R},${Y + H}${arc(X, Y + H - R)}L${X},${Y + R}${arc(X + R, Y)}L${X + W},${Y}Z`;
    default:
      return `M${X},${Y}H${X + W}V${Y + H}H${X}Z`;
  }
}
