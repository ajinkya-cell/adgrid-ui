"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * TopographicMap
 *
 * A slowly drifting height field drawn as contour lines, like a survey map:
 * thin lines at every interval, a heavier index contour every fifth, a faint
 * survey grid with crosshair ticks, and a hint of elevation tint. The cursor
 * raises a hill under it, tinted in the accent colour and marked with a survey
 * point; when the pointer leaves, the hill wanders slowly on its own. An
 * optional clearing quietens the lines in the middle for hero content.
 */

export type TopographicTheme = "dark" | "light" | "terminal";

export interface TopographicMapProps {
  /** Colour preset. */
  theme?: TopographicTheme;
  /** Override the preset background colour (hex). */
  backgroundColor?: string;
  /** Override the preset contour colour (hex). */
  lineColor?: string;
  /** Colour of the hill raised by the cursor (hex). Defaults to the preset's accent. */
  accentColor?: string;
  /** Contour lines per unit of height. Higher packs the lines tighter. */
  levels?: number;
  /** Contour thickness in CSS pixels. */
  lineWidth?: number;
  /** Opacity of the contour lines, 0 to 1. */
  lineOpacity?: number;
  /** Size of the terrain features. Higher zooms out to more, smaller hills. */
  scale?: number;
  /** Drift speed of the terrain. */
  speed?: number;
  /** Height of the hill raised by the cursor. 0 turns it off. */
  hillHeight?: number;
  /** Radius of the cursor hill in CSS pixels. */
  hillRadius?: number;
  /** Strength of the hill that wanders on its own when the pointer is away, 0 to 1. */
  idle?: number;
  /** Show the faint survey grid and crosshair ticks. */
  grid?: boolean;
  /** How much the contours quieten in the middle for hero content, 0 to 1. */
  clearing?: number;
  className?: string;
  style?: CSSProperties;
  /** Content drawn above the background. */
  children?: ReactNode;
}

const THEME_PRESETS: Record<TopographicTheme, { background: string; line: string; accent: string }> = {
  dark: { background: "#0a0b0d", line: "#a3abb6", accent: "#bef264" },
  light: { background: "#f1ede4", line: "#7a5c43", accent: "#c2410c" },
  terminal: { background: "#050a06", line: "#3fa365", accent: "#d9f99d" },
};

const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uRes;       // drawing buffer, device px
uniform float uDpr;      // device px per CSS px
uniform float uTime;     // drift time
uniform vec4 uHill;      // xy: hill centre in CSS px (y up), z: height, w: radius in CSS px
uniform vec3 uBg;
uniform vec3 uLine;
uniform vec3 uAccent;
uniform float uLevels;
uniform float uLineWidth;
uniform float uLineOpacity;
uniform float uScale;
uniform float uGrid;
uniform float uClearing;
uniform float uMarker;   // 0..1, shown only while a real pointer holds the hill

out vec4 fragColor;

const float GRID = 96.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * noise2(p);
    p = m * p + 17.0;
    a *= 0.5;
  }
  return s / 0.96875;
}

// Terrain: gently warped fbm that drifts and slowly reshapes.
float terrain(vec2 p, float t) {
  vec2 q = p * uScale / 700.0;
  vec2 w = vec2(fbm(q + vec2(0.0, 0.03 * t)), fbm(q + vec2(4.7, 2.1) - vec2(0.025 * t, 0.0)));
  return fbm(q + 0.55 * w + vec2(0.012 * t, 0.008 * t));
}

// Coverage of a line at distance d (device px) with half-width hw (device px).
float lineAA(float d, float hw) {
  return 1.0 - smoothstep(hw - 0.5, hw + 0.5, d);
}

void main() {
  vec2 p = gl_FragCoord.xy / uDpr;
  vec2 size = uRes / uDpr;

  // Height: terrain plus the cursor's hill.
  float base = terrain(p, uTime);
  vec2 hd = p - uHill.xy;
  // A peaked profile (part gaussian, part exponential) so rings tighten toward the top.
  float hdist = length(hd);
  float hill = 0.5 * exp(-hdist * hdist / (2.0 * uHill.w * uHill.w)) + 0.5 * exp(-hdist / (0.75 * uHill.w));
  float h = base + uHill.z * hill;

  // Contours: distance to the nearest level, in device px.
  float level = h * uLevels;
  float fw = max(fwidth(level), 1e-4);
  float f = fract(level);
  float d = min(f, 1.0 - f) / fw;
  float isIndex = 1.0 - step(0.5, abs(mod(floor(level + 0.5), 5.0)));

  float hw = 0.5 * uLineWidth * uDpr * mix(1.0, 1.7, isIndex);
  float contour = lineAA(d, hw);
  // Where the lines crowd closer than a few pixels they fade, instead of turning to noise.
  float spacing = 1.0 / (fw * uDpr); // CSS px between neighbouring lines
  contour *= smoothstep(2.0, 4.5, spacing);
  float alpha = contour * uLineOpacity * mix(0.45, 1.0, isIndex);

  // Quieter lines in the middle, where hero content sits.
  vec2 cv = (p - 0.5 * size) / max(0.5 * size, vec2(420.0)) * vec2(1.0, 1.25);
  float clearing = (1.0 - smoothstep(0.3, 1.0, length(cv))) * uClearing;
  alpha *= 1.0 - 0.72 * clearing;

  // A hint of elevation tint, and a soft vignette.
  vec3 col = mix(uBg, uLine, clamp((base - 0.35) * 0.09, 0.0, 0.05));
  vec2 vc = (p / size - 0.5) * 2.0;
  col = mix(col, uBg * 0.82, smoothstep(0.8, 1.6, length(vc)) * 0.6);

  // Survey grid with crosshair ticks at the intersections.
  if (uGrid > 0.5) {
    vec2 g = abs(fract(p / GRID + 0.5) - 0.5) * GRID * uDpr;
    float gridLine = max(lineAA(g.x, 0.5 * uDpr), lineAA(g.y, 0.5 * uDpr));
    float tick = max(
      lineAA(g.x, 0.5 * uDpr) * step(g.y, 6.0 * uDpr),
      lineAA(g.y, 0.5 * uDpr) * step(g.x, 6.0 * uDpr)
    );
    col = mix(col, uLine, gridLine * 0.035 + tick * 0.22 * (1.0 - 0.6 * clearing));
  }

  // Lines on the cursor's hill take the accent colour.
  float hillTint = smoothstep(0.08, 0.6, hill) * step(0.001, uHill.z);
  vec3 lineCol = mix(uLine, uAccent, hillTint);
  alpha = mix(alpha, min(1.0, contour * 0.9 * mix(0.6, 1.0, isIndex)), hillTint * min(uHill.z * 5.0, 1.0));
  col = mix(col, lineCol, alpha);

  // Survey marker at the top of the hill: a small ring with a cross.
  float marker = uMarker * clamp(uHill.z * 6.0, 0.0, 1.0);
  if (marker > 0.0) {
    float r = hdist * uDpr;
    float ring = lineAA(abs(r - 4.5 * uDpr), 0.6 * uDpr);
    vec2 a = abs(hd) * uDpr;
    float cross = max(
      lineAA(a.x, 0.5 * uDpr) * step(a.y, 11.0 * uDpr) * step(7.0 * uDpr, a.y),
      lineAA(a.y, 0.5 * uDpr) * step(a.x, 11.0 * uDpr) * step(7.0 * uDpr, a.x)
    );
    col = mix(col, uAccent, max(ring, cross) * marker * 0.9);
  }

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const MAX_PIXELS = 2_200_000;

function toHex6(color: string | undefined, fallback: string): string {
  if (typeof color !== "string") return fallback;
  let clean = color.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(clean)) clean = clean.split("").map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/i.test(clean) ? `#${clean.toLowerCase()}` : fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

interface ResolvedSettings {
  background: [number, number, number];
  line: [number, number, number];
  accent: [number, number, number];
  levels: number;
  lineWidth: number;
  lineOpacity: number;
  scale: number;
  speed: number;
  hillHeight: number;
  hillRadius: number;
  idle: number;
  grid: boolean;
  clearing: number;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("TopographicMap: could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`TopographicMap: shader failed to compile: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("TopographicMap: could not create a program.");
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`TopographicMap: program failed to link: ${log}`);
  }
  return program;
}

export function TopographicMap({
  theme = "dark",
  backgroundColor,
  lineColor,
  accentColor,
  levels = 30,
  lineWidth = 1,
  lineOpacity = 0.55,
  scale = 1,
  speed = 1,
  hillHeight = 0.28,
  hillRadius = 150,
  idle = 0.5,
  grid = true,
  clearing = 0.6,
  className,
  style,
  children,
}: TopographicMapProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  const preset = THEME_PRESETS[theme] ?? THEME_PRESETS.dark;
  const bgHex = toHex6(backgroundColor, preset.background);
  const lineHex = toHex6(lineColor, preset.line);
  const accentHex = toHex6(accentColor, preset.accent);

  const settings = useMemo<ResolvedSettings>(
    () => ({
      background: hexToRgb(bgHex),
      line: hexToRgb(lineHex),
      accent: hexToRgb(accentHex),
      levels: num(levels, 30, 6, 80),
      lineWidth: num(lineWidth, 1, 0.3, 4),
      lineOpacity: num(lineOpacity, 0.55, 0, 1),
      scale: num(scale, 1, 0.2, 5),
      speed: num(speed, 1, 0, 5),
      hillHeight: num(hillHeight, 0.28, 0, 1),
      hillRadius: num(hillRadius, 150, 30, 600),
      idle: num(idle, 0.5, 0, 1),
      grid: grid !== false && (grid as unknown) !== "false",
      clearing: num(clearing, 0.6, 0, 1),
    }),
    [bgHex, lineHex, accentHex, levels, lineWidth, lineOpacity, scale, speed, hillHeight, hillRadius, idle, grid, clearing]
  );

  // Settings live in a ref so prop changes update uniforms without rebuilding GL.
  const settingsRef = useRef(settings);
  const redrawRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    settingsRef.current = settings;
    redrawRef.current?.();
  }, [settings]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || failed) return;

    // A fresh canvas per mount: a context lost on cleanup can't be reused.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      pointerEvents: "none",
    });
    wrap.prepend(canvas);

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.remove();
      setFailed(true);
      return;
    }

    let program: WebGLProgram;
    try {
      program = createProgram(gl);
    } catch (error) {
      console.error(error);
      canvas.remove();
      setFailed(true);
      return;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.useProgram(program);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      res: uniform("uRes"),
      dpr: uniform("uDpr"),
      time: uniform("uTime"),
      hill: uniform("uHill"),
      bg: uniform("uBg"),
      line: uniform("uLine"),
      accent: uniform("uAccent"),
      levels: uniform("uLevels"),
      lineWidth: uniform("uLineWidth"),
      lineOpacity: uniform("uLineOpacity"),
      scale: uniform("uScale"),
      grid: uniform("uGrid"),
      clearing: uniform("uClearing"),
      marker: uniform("uMarker"),
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cssW = 0;
    let cssH = 0;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let last = -1;
    let drift = 30; // start somewhere with character

    // The hill sits under the pointer while it is on the page; once the pointer
    // leaves it wanders slowly in an orbit around the middle.
    const hill = { x: 0, y: 0, height: 0, marker: 0, px: 0, py: 0, pointer: false };
    const idlePosition = (): [number, number] => {
      const a = drift * 0.09;
      return [
        cssW * (0.5 + 0.34 * Math.cos(a) + 0.05 * Math.sin(a * 2.1)),
        cssH * (0.5 + 0.3 * Math.sin(a) + 0.05 * Math.cos(a * 1.6)),
      ];
    };

    const draw = () => {
      if (disposed || gl.isContextLost() || cssW === 0 || cssH === 0) return;
      const s = settingsRef.current;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.dpr, canvas.width / cssW);
      gl.uniform1f(u.time, drift);
      gl.uniform4f(u.hill, hill.x, hill.y, hill.height, s.hillRadius);
      gl.uniform3fv(u.bg, s.background);
      gl.uniform3fv(u.line, s.line);
      gl.uniform3fv(u.accent, s.accent);
      gl.uniform1f(u.levels, s.levels);
      gl.uniform1f(u.lineWidth, s.lineWidth);
      gl.uniform1f(u.lineOpacity, s.lineOpacity);
      gl.uniform1f(u.scale, s.scale);
      gl.uniform1f(u.grid, s.grid ? 1 : 0);
      gl.uniform1f(u.clearing, s.clearing);
      gl.uniform1f(u.marker, hill.marker);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const shouldAnimate = () =>
      !disposed && visible && !document.hidden && !reducedMotion.matches && cssW > 0 && cssH > 0;

    const frame = (now: number) => {
      raf = 0;
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      const s = settingsRef.current;
      drift += dt * s.speed;
      const [tx, ty] = hill.pointer ? [hill.px, hill.py] : idlePosition();
      const follow = 1 - Math.exp(-dt * (hill.pointer ? 5 : 1));
      hill.x += (tx - hill.x) * follow;
      hill.y += (ty - hill.y) * follow;
      const target = s.hillHeight * (hill.pointer ? 1 : s.idle);
      hill.height += (target - hill.height) * (1 - Math.exp(-dt * 2.2));
      hill.marker += ((hill.pointer ? 1 : 0) - hill.marker) * (1 - Math.exp(-dt * 4));
      draw();
      schedule();
    };

    const schedule = () => {
      if (shouldAnimate()) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = -1;
      }
    };

    // Draw now when not animating (reduced motion, paused), otherwise let the loop pick it up.
    const redraw = () => {
      if (shouldAnimate()) schedule();
      else {
        if (!hill.pointer) {
          [hill.x, hill.y] = idlePosition();
          hill.height = settingsRef.current.hillHeight * settingsRef.current.idle;
        }
        draw();
      }
    };
    redrawRef.current = redraw;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      if (cssW === 0 || cssH === 0) return schedule();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(dpr, Math.sqrt(MAX_PIXELS / (cssW * cssH)));
      const w = Math.max(1, Math.round(cssW * scale));
      const h = Math.max(1, Math.round(cssH * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (!hill.pointer) {
        [hill.x, hill.y] = idlePosition();
        hill.height = settingsRef.current.hillHeight * settingsRef.current.idle;
      }
      redraw();
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      hill.px = e.clientX - rect.left;
      hill.py = rect.height - (e.clientY - rect.top);
      hill.pointer = true;
      if (reducedMotion.matches) {
        hill.x = hill.px;
        hill.y = hill.py;
        hill.height = settingsRef.current.hillHeight;
        hill.marker = 1;
        draw();
      }
      schedule();
    };
    const onPointerLeave = () => {
      hill.pointer = false;
      if (reducedMotion.matches) {
        hill.marker = 0;
        redraw();
      }
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (!disposed) setFailed(true);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      visible = entry.isIntersecting;
      schedule();
    });
    intersectionObserver.observe(wrap);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", redraw);
    canvas.addEventListener("webglcontextlost", onContextLost);

    resize();

    return () => {
      disposed = true;
      redrawRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", redraw);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [failed]);

  const background: CSSProperties = failed
    ? {
        backgroundColor: bgHex,
        backgroundImage: `repeating-radial-gradient(circle at 35% 40%, transparent 0 22px, ${lineHex}33 22px 23px), repeating-radial-gradient(circle at 70% 65%, transparent 0 28px, ${lineHex}22 28px 29px)`,
      }
    : { backgroundColor: bgHex };

  return (
    <div ref={wrapRef} className={className ?? "absolute inset-0 overflow-hidden"} style={{ ...background, ...style }}>
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}

export default TopographicMap;
