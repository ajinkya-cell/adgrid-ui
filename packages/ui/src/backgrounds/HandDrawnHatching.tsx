"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * HandDrawnHatching
 *
 * A slowly drifting tone field drawn the way an illustrator shades with a pen:
 * up to four layers of cross-hatching, each laid down once the shadow is dark
 * enough. Every stroke is its own pen movement: it wobbles, swells and tapers,
 * lifts off the paper, and is tilted a hair differently from its neighbour.
 * The strokes "boil" a few times a second like a hand-drawn animation while the
 * shadows underneath flow smoothly. A lamp clears the shading around it: it
 * follows the pointer, and when nobody is pointing it drifts slowly around the
 * page on its own. An optional clearing keeps the middle bare for content.
 */

export type HatchingPaper = "light" | "dark" | "blueprint";

export interface HandDrawnHatchingProps {
  /** Paper and ink preset. */
  paper?: HatchingPaper;
  /** Override the preset's paper colour (hex). */
  paperColor?: string;
  /** Override the preset's ink colour (hex). */
  inkColor?: string;
  /** Colour of the densest, last hatch layer (hex). */
  accentColor?: string;
  /** How much of the accent colour the densest layer takes, 0 to 1. */
  accentAmount?: number;
  /** Spacing between hatch lines in CSS pixels. */
  density?: number;
  /** Stroke thickness multiplier. */
  lineWeight?: number;
  /** How much each stroke wanders off a ruled line. 0 is ruler-straight. */
  wobble?: number;
  /** Line boil, in drawings per second. 0 keeps the strokes still. */
  boil?: number;
  /** Speed of the drifting shadows. */
  speed?: number;
  /** Tone contrast. Higher gives bigger bare areas and deeper shadows. */
  contrast?: number;
  /** Number of hatch layers, 1 to 4. */
  layers?: number;
  /** How strongly the pointer clears shading around it. 0 turns it off. */
  mouseReactivity?: number;
  /** Strength of the lamp that drifts around on its own when nobody is pointing, 0 to 1. 0 turns it off. */
  idle?: number;
  /** Size of the bare, hand-erased area in the middle for hero content, 0 to 1. 0 shades everywhere. */
  clearing?: number;
  className?: string;
  style?: CSSProperties;
  /** Content drawn above the background. */
  children?: ReactNode;
}

const PAPER_PRESETS: Record<HatchingPaper, { paper: string; ink: string }> = {
  light: { paper: "#f3eee3", ink: "#1c1b19" },
  dark: { paper: "#0b0b0c", ink: "#ece8df" },
  blueprint: { paper: "#0d2340", ink: "#cfe6ff" },
};

const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uRes;      // drawing buffer, device px
uniform float uDpr;     // device px per CSS px
uniform float uTime;    // flow time
uniform float uBoil;    // current boil drawing, 0 when boil is off
uniform vec3 uMouse;    // xy: pointer in CSS px (y up), z: lamp strength
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uDensity;
uniform float uWeight;
uniform float uWobble;
uniform float uContrast;
uniform float uLayers;
uniform float uClearing;

out vec4 fragColor;

// One pen direction per layer, each laid down once the shadow passes its threshold.
const vec4 ANGLE = vec4(0.7854, -0.7854, 1.7453, 0.1745);
const vec4 WEIGHT = vec4(1.0, 0.95, 0.9, 1.15);
const vec4 THRESHOLD = vec4(0.24, 0.46, 0.66, 0.84);
const vec4 SPACING = vec4(1.0, 1.07, 0.93, 0.86);
const float FIELD_SCALE = 1.0 / 625.0;
const float LAMP_RADIUS = 170.0;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise1(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), u);
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
  for (int i = 0; i < 3; i++) {
    s += a * noise2(p);
    p = m * p + 17.0;
    a *= 0.5;
  }
  return s / 0.875;
}

// Large, soft shadow masses: fbm warped by fbm, drifting slowly.
float toneField(vec2 p, float t) {
  vec2 q = p * FIELD_SCALE;
  vec2 w = vec2(
    fbm(q + vec2(0.0, 0.10 * t)),
    fbm(q + vec2(5.2, 1.3) - vec2(0.08 * t, 0.0))
  );
  float n = fbm(q * 1.15 + 1.6 * w + vec2(0.04 * t, -0.03 * t));
  // n sits around 0.6 with most values in 0.35-0.8. This remap leaves ~40% of
  // the paper bare and saves the last layer for the darkest ~5%.
  return clamp((n - 0.49) / 0.35, 0.0, 1.0);
}

// Ink coverage of one hatch layer at p. Each line is split into strokes, and
// every stroke gets its own wobble, tilt, pressure and pen lift.
float hatchLayer(vec2 p, float angle, float spacing, float weight, float tone, float threshold, float seed) {
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 nrm = vec2(-dir.y, dir.x);
  float along = dot(p, dir);
  float across = dot(p, nrm) / spacing;
  float base = floor(across);
  float aa = 0.75 / uDpr;
  float ink = 0.0;

  for (int j = -1; j <= 1; j++) {
    float id = base + float(j);
    float r1 = hash11(id * 1.731 + seed * 17.13);
    float r2 = hash11(id * 3.917 + seed * 5.71 + 11.0);
    float r3 = hash11(id * 7.123 + seed * 2.33 + 23.0);
    float bj = uBoil > 0.0 ? hash11(id * 2.71 + uBoil * 13.7 + seed) - 0.5 : 0.0;

    // Strokes along the line, with a pen lift between them.
    float segLen = mix(60.0, 180.0, r2);
    float sPos = (along + r1 * 997.0 + bj * 6.0) / segLen;
    float seg = floor(sPos);
    float u = fract(sPos);
    float rs = hash21(vec2(id * 0.37 + seed, seg * 1.13));
    float rg = hash21(vec2(seg * 0.71 - seed, id * 1.91));
    float gap = mix(0.04, 0.26, rs);
    float st = (u - gap * rg) / (1.0 - gap);
    if (st < 0.0 || st > 1.0) continue;

    // Where this stroke starts: shadows end on ragged, per-stroke edges.
    float localThreshold = threshold + (r3 - 0.5) * 0.08 + (rs - 0.5) * 0.06;
    float grow = smoothstep(localThreshold - 0.02, localThreshold + 0.2, tone);
    if (grow <= 0.0) continue;

    // The hand: a slow drift, a little tremor, and a slight tilt per stroke.
    float wob = (noise1(along / mix(50.0, 120.0, r3) + r1 * 37.0 + uBoil * 0.31) - 0.5) * 0.55
              + (noise1(along / 9.0 + r2 * 91.0 + uBoil * 0.53) - 0.5) * 0.12;
    float tilt = (rs - 0.5) * 0.06;
    float off = (r1 - 0.5) * 0.24 + bj * 0.07 + wob * uWobble + (u - 0.5) * segLen * tilt / spacing;
    off = clamp(off, -0.95, 0.95);
    float d = abs(across - (id + 0.5 + off)) * spacing;

    // Pressure: a firm start, a long flick out, and some unevenness on the way.
    float press = smoothstep(0.0, 0.08, st) * mix(1.0, 0.2, smoothstep(0.5, 1.0, st));
    press *= 0.75 + 0.5 * noise1(along / 21.0 + r3 * 53.0);
    float halfWidth = 0.6 * uWeight * weight * press * sqrt(grow) * mix(0.75, 1.2, grow);

    float coverage = 1.0 - smoothstep(halfWidth - aa, halfWidth + aa, d);
    // Strokes only just starting fade in, so layer edges feather instead of hazing.
    ink = max(ink, coverage * smoothstep(0.0, 0.3, grow) * mix(0.75, 1.0, rg) * mix(1.0, 0.78, st));
  }
  return ink;
}

void main() {
  vec2 p = gl_FragCoord.xy / uDpr;
  vec2 size = uRes / uDpr;

  float tone = toneField(p, uTime);
  tone = clamp((tone - 0.5) * uContrast + 0.5, 0.0, 1.0);

  // Shade toward the edges, like a sketch darkened around its border.
  vec2 vc = (p / size - 0.5) * 2.0;
  tone += smoothstep(0.7, 1.5, length(vc)) * 0.22;

  // A soft clearing in the middle, its edge wavering like it was erased by hand.
  // Never narrower than ~420px a side, so phones still get room for a paragraph.
  vec2 cv = (p - 0.5 * size) / max(0.5 * size, vec2(420.0)) * vec2(1.0, 1.2);
  float clearEdge = length(cv) + (noise2(p * 0.006 + 11.0) - 0.5) * 0.24;
  float clearing = (1.0 - smoothstep(0.42, 1.02, clearEdge)) * uClearing;
  tone = mix(tone, tone * 0.2 - 0.06, clearing);

  // The lamp.
  float md = length(p - uMouse.xy);
  tone -= uMouse.z * 0.65 * exp(-md * md / (2.0 * LAMP_RADIUS * LAMP_RADIUS));
  tone = clamp(tone, 0.0, 1.0);

  // Paper: grain, tooth and faint fibres.
  float grain = noise2(p * 0.85) * 0.6 + noise2(p * 2.4 + 31.0) * 0.4;
  // Fibres: short, sparse streaks at a slight angle, not continuous rows.
  vec2 fp = mat2(0.98, 0.2, -0.2, 0.98) * p;
  float fibre = noise2(vec2(fp.x * 0.03, fp.y * 0.45)) * noise2(fp * 0.02 + 3.0);
  float tooth = noise2(p * 0.12 + 7.0);
  vec3 col = mix(uPaper, uInk, (grain - 0.5) * 0.06 + max(fibre - 0.45, 0.0) * 0.09 + (tooth - 0.5) * 0.03);

  // A faint graphite wash under the strokes gives the shadows some body.
  col = mix(col, uInk, tone * 0.045);

  // Ink catches less on the grain's peaks.
  float inkTexture = 0.86 + 0.14 * grain;
  for (int k = 0; k < 4; k++) {
    if (float(k) >= uLayers) break;
    float a = hatchLayer(p, ANGLE[k], uDensity * SPACING[k], WEIGHT[k], tone, THRESHOLD[k], float(k) + 1.0);
    vec3 layerInk = k == 3 ? uAccent : uInk;
    col = mix(col, layerInk, a * 0.92 * inkTexture);
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
  paper: [number, number, number];
  ink: [number, number, number];
  accent: [number, number, number];
  density: number;
  lineWeight: number;
  wobble: number;
  boil: number;
  speed: number;
  contrast: number;
  layers: number;
  mouseReactivity: number;
  idle: number;
  clearing: number;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("HandDrawnHatching: could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`HandDrawnHatching: shader failed to compile: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("HandDrawnHatching: could not create a program.");
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
    throw new Error(`HandDrawnHatching: program failed to link: ${log}`);
  }
  return program;
}

export function HandDrawnHatching({
  paper = "light",
  paperColor,
  inkColor,
  accentColor = "#D97757",
  accentAmount = 0.6,
  density = 7,
  lineWeight = 1,
  wobble = 1,
  boil = 8,
  speed = 1,
  contrast = 1,
  layers = 4,
  mouseReactivity = 1,
  idle = 0.6,
  clearing = 0.7,
  className,
  style,
  children,
}: HandDrawnHatchingProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  const preset = PAPER_PRESETS[paper] ?? PAPER_PRESETS.light;
  const paperHex = toHex6(paperColor, preset.paper);
  const inkHex = toHex6(inkColor, preset.ink);
  const accentHex = toHex6(accentColor, "#d97757");

  const settings = useMemo<ResolvedSettings>(() => {
    const ink = hexToRgb(inkHex);
    const accent = hexToRgb(accentHex);
    const amount = num(accentAmount, 0.6, 0, 1);
    return {
      paper: hexToRgb(paperHex),
      ink,
      accent: [0, 1, 2].map((i) => ink[i] + (accent[i] - ink[i]) * amount) as [number, number, number],
      density: num(density, 7, 3, 24),
      lineWeight: num(lineWeight, 1, 0.2, 4),
      wobble: num(wobble, 1, 0, 3),
      boil: num(boil, 8, 0, 30),
      speed: num(speed, 1, 0, 5),
      contrast: num(contrast, 1, 0.3, 3),
      layers: Math.round(num(layers, 4, 1, 4)),
      mouseReactivity: num(mouseReactivity, 1, 0, 3),
      idle: num(idle, 0.6, 0, 1),
      clearing: num(clearing, 0.7, 0, 1),
    };
  }, [paperHex, inkHex, accentHex, accentAmount, density, lineWeight, wobble, boil, speed, contrast, layers, mouseReactivity, idle, clearing]);

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
      boil: uniform("uBoil"),
      mouse: uniform("uMouse"),
      paper: uniform("uPaper"),
      ink: uniform("uInk"),
      accent: uniform("uAccent"),
      density: uniform("uDensity"),
      weight: uniform("uWeight"),
      wobble: uniform("uWobble"),
      contrast: uniform("uContrast"),
      layers: uniform("uLayers"),
      clearing: uniform("uClearing"),
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cssW = 0;
    let cssH = 0;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let last = -1;
    let clock = 0;
    let flow = 14; // start with the shadows already formed
    // The lamp: follows the pointer while it moves, otherwise glides back to a
    // slow orbit around the middle of the page.
    const lamp = { x: 0, y: 0, strength: 0, px: 0, py: 0, lastPointer: -Infinity };
    const POINTER_IDLE_MS = 3500;
    const pointerActive = () => performance.now() - lamp.lastPointer < POINTER_IDLE_MS;
    const idlePosition = (): [number, number] => {
      const a = flow * 0.11;
      return [
        cssW * (0.5 + 0.36 * Math.cos(a) + 0.05 * Math.sin(a * 2.3)),
        cssH * (0.5 + 0.33 * Math.sin(a) + 0.05 * Math.cos(a * 1.7)),
      ];
    };

    const draw = () => {
      if (disposed || gl.isContextLost() || cssW === 0 || cssH === 0) return;
      const s = settingsRef.current;
      const boilFrame = s.boil > 0 && !reducedMotion.matches ? (Math.floor(clock * s.boil) % 3) + 1 : 0;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.dpr, canvas.width / cssW);
      gl.uniform1f(u.time, flow);
      gl.uniform1f(u.boil, boilFrame);
      gl.uniform3f(u.mouse, lamp.x, lamp.y, lamp.strength);
      gl.uniform1f(u.clearing, s.clearing);
      gl.uniform3fv(u.paper, s.paper);
      gl.uniform3fv(u.ink, s.ink);
      gl.uniform3fv(u.accent, s.accent);
      gl.uniform1f(u.density, s.density);
      gl.uniform1f(u.weight, s.lineWeight);
      gl.uniform1f(u.wobble, s.wobble);
      gl.uniform1f(u.contrast, s.contrast);
      gl.uniform1f(u.layers, s.layers);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const shouldAnimate = () =>
      !disposed && visible && !document.hidden && !reducedMotion.matches && cssW > 0 && cssH > 0;

    const frame = (now: number) => {
      raf = 0;
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      const s = settingsRef.current;
      clock += dt;
      flow += dt * s.speed;
      const active = pointerActive() && s.mouseReactivity > 0;
      const [tx, ty] = active ? [lamp.px, lamp.py] : idlePosition();
      const follow = 1 - Math.exp(-dt * (active ? 7 : 1.2));
      lamp.x += (tx - lamp.x) * follow;
      lamp.y += (ty - lamp.y) * follow;
      const strength = active ? s.mouseReactivity : s.idle;
      lamp.strength += (strength - lamp.strength) * (1 - Math.exp(-dt * 2.5));
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
      else draw();
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
      if (!pointerActive()) {
        [lamp.x, lamp.y] = idlePosition();
        lamp.strength = settingsRef.current.idle;
      }
      redraw();
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      lamp.px = e.clientX - rect.left;
      lamp.py = rect.height - (e.clientY - rect.top);
      lamp.lastPointer = performance.now();
      schedule();
    };
    const onPointerLeave = () => {
      lamp.lastPointer = -Infinity;
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
        backgroundColor: paperHex,
        backgroundImage: `repeating-linear-gradient(45deg, ${inkHex}2e 0 1px, transparent 1px 7px), repeating-linear-gradient(-45deg, ${inkHex}1f 0 1px, transparent 1px 9px)`,
      }
    : { backgroundColor: paperHex };

  return (
    <div ref={wrapRef} className={className ?? "absolute inset-0 overflow-hidden"} style={{ ...background, ...style }}>
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}

export default HandDrawnHatching;
