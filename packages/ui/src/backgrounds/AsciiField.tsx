"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * AsciiField
 *
 * Glowing ribbons of light, rendered as a terminal: the screen is a grid of
 * monospace cells, and each cell shows a character from a brightness ramp
 * ( .:-=+*#%@ by default), coloured in OKLCH by the hue of the light under it.
 * Faint scanlines, a soft per-cell glow and the odd glitching character finish
 * the look. The cursor brightens the field around it. An optional clearing
 * dims the middle for hero content.
 */

export type AsciiPalette = "spectrum" | "phosphor" | "amber" | "mono";

export interface AsciiFieldProps {
  /** Colour scheme: an OKLCH hue arc, green phosphor, amber, or plain white. */
  palette?: AsciiPalette;
  /** Base hue in degrees (spectrum palette). */
  hue?: number;
  /** How far the hue travels across the ribbons, in degrees (spectrum palette). */
  hueSpread?: number;
  /** Background colour (hex). */
  backgroundColor?: string;
  /** Character ramp from darkest to brightest. The first character is usually a space. */
  characters?: string;
  /** Font size of a cell in CSS pixels. */
  cellSize?: number;
  /** Monospace font family. CSS variables like var(--font-mono) are resolved. */
  fontFamily?: string;
  /** Brightness of the light. */
  intensity?: number;
  /** Animation speed. */
  speed?: number;
  /** How strongly the cursor lights up the field around it. 0 turns it off. */
  mouseReactivity?: number;
  /** How often characters glitch, 0 to 3. 0 turns it off. */
  glitch?: number;
  /** Faint CRT scanlines. */
  scanlines?: boolean;
  /** How much the field dims in the middle for hero content, 0 to 1. */
  clearing?: number;
  className?: string;
  style?: CSSProperties;
  /** Content drawn above the background. */
  children?: ReactNode;
}

const PALETTES: Record<AsciiPalette, { hue: number; spread: number; chroma: number }> = {
  spectrum: { hue: 230, spread: 150, chroma: 0.16 },
  phosphor: { hue: 145, spread: 12, chroma: 0.17 },
  amber: { hue: 70, spread: 14, chroma: 0.15 },
  mono: { hue: 250, spread: 0, chroma: 0.0 },
};

const DEFAULT_CHARACTERS = " .:-=+*#%@";
const DEFAULT_FONT = 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, Consolas, monospace';

const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uRes;        // drawing buffer, device px
uniform float uDpr;       // device px per CSS px
uniform float uTime;
uniform vec2 uCell;       // cell size, device px
uniform sampler2D uAtlas; // glyphs left to right, darkest to brightest
uniform float uCount;     // glyphs in the atlas
uniform vec3 uMouse;      // xy: pointer in CSS px (y up), z: strength
uniform vec3 uBg;
uniform float uHue;       // radians
uniform float uSpread;    // radians
uniform float uChroma;
uniform float uIntensity;
uniform float uGlitch;
uniform float uScanlines;
uniform float uClearing;

out vec4 fragColor;

const float TAU = 6.28318530718;
const int RIBBONS = 7;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 oklchToSrgb(float L, float C, float h) {
  float a = C * cos(h);
  float b = C * sin(h);
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  vec3 lms = vec3(l_ * l_ * l_, m_ * m_ * m_, s_ * s_ * s_);
  vec3 lin = vec3(
    4.0767416621 * lms.x - 3.3077115913 * lms.y + 0.2309699292 * lms.z,
    -1.2684380046 * lms.x + 2.6097574011 * lms.y - 0.3413193965 * lms.z,
    -0.0041960863 * lms.x - 0.7034186147 * lms.y + 1.7076147010 * lms.z
  );
  lin = clamp(lin, 0.0, 1.0);
  return mix(12.92 * lin, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));
}

// Light at a point: a handful of sine ribbons drifting across a gently warped,
// tilted plane. Returns brightness and the light's average hue.
vec2 field(vec2 c, vec2 size, out float hue) {
  vec2 u = (c - 0.5 * size) / max(size.x, size.y) * 1.6;
  float ct = cos(-0.42), st = sin(-0.42);
  u = mat2(ct, st, -st, ct) * u;
  u += 0.07 * vec2(sin(u.y * 4.0 + uTime * 0.55), cos(u.x * 3.0 - uTime * 0.45));

  float density = 0.0;
  vec2 hueSum = vec2(0.0);
  for (int i = 0; i < RIBBONS; i++) {
    float fi = float(i);
    float k = fi / float(RIBBONS - 1);
    float y = 0.2 * sin(u.x * (1.2 + 0.33 * fi) + uTime * (0.3 + 0.06 * fi) + fi * 1.9)
            + 0.07 * sin(u.x * 3.3 - uTime * 0.5 + fi * 2.7)
            + (k - 0.5) * 0.55;
    float d = abs(u.y - y);
    float w = 0.022 + 0.012 * sin(uTime * 0.4 + fi * 1.3);
    float g = exp(-d * d / (2.0 * w * w)) + 0.16 * w / (d + 0.5 * w);
    float h = uHue + uSpread * (k - 0.5) + 0.3 * uSpread * sin(uTime * 0.17 + u.x * 1.4 + fi);
    density += g;
    hueSum += g * vec2(cos(h), sin(h));
  }

  // The cursor lights the field around it, in the warm end of the palette.
  vec2 md = c - uMouse.xy;
  float m = uMouse.z * 1.6 * exp(-dot(md, md) / (2.0 * 120.0 * 120.0));
  density += m;
  float mh = uHue + uSpread * 0.55;
  hueSum += m * vec2(cos(mh), sin(mh));

  hue = atan(hueSum.y, hueSum.x);
  float b = 1.0 - exp(-density * 0.95 * uIntensity);
  return vec2(b, length(hueSum) / max(density, 1e-4));
}

void main() {
  vec2 size = uRes / uDpr;
  vec2 cellId = floor(gl_FragCoord.xy / uCell);
  vec2 local = fract(gl_FragCoord.xy / uCell);
  vec2 centre = (cellId + 0.5) * uCell / uDpr;

  float hue;
  vec2 fb = field(centre, size, hue);
  float b = fb.x;

  // Dim the middle where hero content sits.
  vec2 cv = (centre - 0.5 * size) / max(0.5 * size, vec2(420.0)) * vec2(1.0, 1.25);
  b *= 1.0 - uClearing * 0.8 * (1.0 - smoothstep(0.3, 1.0, length(cv)));
  // A soft vignette.
  vec2 vc = (centre / size - 0.5) * 2.0;
  b *= 1.0 - 0.35 * smoothstep(0.7, 1.5, length(vc));

  // Pick the glyph, with a little per-cell dither so gradients don't band.
  float dither = (hash21(cellId) - 0.5) * 0.9;
  float idx = clamp(floor(b * (uCount - 1.0) + 0.5 + dither * 0.6), 0.0, uCount - 1.0);

  // Now and then a cell glitches to a random bright character for a moment.
  float frame = floor(uTime * 7.0);
  float gr = hash21(cellId * 1.37 + vec2(frame * 17.0, frame * 31.0));
  float glitched = step(1.0 - 0.0016 * uGlitch, gr) * step(0.04, b);
  if (glitched > 0.0) {
    idx = floor(hash21(cellId + frame) * (uCount - 1.0)) + 1.0;
    b = max(b, 0.75);
  }

  vec2 auv = vec2((idx + local.x) / uCount, 1.0 - local.y);
  float glyph = texture(uAtlas, auv).a;

  float L = mix(0.36, 0.95, pow(b, 0.75));
  float C = uChroma * smoothstep(0.0, 0.5, b) * (0.7 + 0.3 * fb.y);
  vec3 ink = oklchToSrgb(L, C, hue);

  vec3 col = uBg;
  col += ink * b * 0.07;                       // soft glow behind bright cells
  col = mix(col, ink, glyph * smoothstep(0.0, 0.08, b + glitched));

  // CRT scanlines.
  float line = step(0.5, fract(gl_FragCoord.y / (3.0 * uDpr)));
  col *= 1.0 - uScanlines * 0.07 * line;

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
  hue: number;
  spread: number;
  chroma: number;
  characters: string[];
  cellSize: number;
  fontFamily: string;
  intensity: number;
  speed: number;
  mouseReactivity: number;
  glitch: number;
  scanlines: boolean;
  clearing: number;
}

interface Atlas {
  canvas: HTMLCanvasElement;
  cellW: number;
  cellH: number;
}

/** Draws the ramp into one row of equal cells, sized in device pixels. */
function buildAtlas(characters: string[], fontPx: number, family: string): Atlas {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("AsciiField: 2D canvas is not available.");
  const font = `500 ${fontPx}px ${family}`;
  ctx.font = font;
  const cellW = Math.max(2, Math.round(ctx.measureText("M").width));
  const cellH = Math.max(2, Math.round(fontPx * 1.2));
  canvas.width = cellW * characters.length;
  canvas.height = cellH;
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  characters.forEach((ch, i) => ctx.fillText(ch, i * cellW + cellW / 2, cellH / 2 + fontPx * 0.04));
  return { canvas, cellW, cellH };
}

function resolveFontFamily(family: string, el: Element): string {
  const style = getComputedStyle(el);
  return family.replace(/var\((--[\w-]+)\)/g, (_, name: string) => style.getPropertyValue(name).trim() || "monospace");
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("AsciiField: could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`AsciiField: shader failed to compile: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("AsciiField: could not create a program.");
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
    throw new Error(`AsciiField: program failed to link: ${log}`);
  }
  return program;
}

export function AsciiField({
  palette = "spectrum",
  hue,
  hueSpread,
  backgroundColor = "#060708",
  characters = DEFAULT_CHARACTERS,
  cellSize = 14,
  fontFamily = DEFAULT_FONT,
  intensity = 1,
  speed = 1,
  mouseReactivity = 1,
  glitch = 1,
  scanlines = true,
  clearing = 0.65,
  className,
  style,
  children,
}: AsciiFieldProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  const bgHex = toHex6(backgroundColor, "#060708");
  const preset = PALETTES[palette] ?? PALETTES.spectrum;
  const ramp = typeof characters === "string" && characters.length >= 2 ? characters : DEFAULT_CHARACTERS;

  const settings = useMemo<ResolvedSettings>(
    () => ({
      background: hexToRgb(bgHex),
      hue: (num(palette === "spectrum" ? hue : undefined, preset.hue, -720, 720) * Math.PI) / 180,
      spread: (num(palette === "spectrum" ? hueSpread : undefined, preset.spread, 0, 360) * Math.PI) / 180,
      chroma: preset.chroma,
      characters: Array.from(ramp).slice(0, 32),
      cellSize: num(cellSize, 14, 6, 48),
      fontFamily: typeof fontFamily === "string" && fontFamily.trim() ? fontFamily : DEFAULT_FONT,
      intensity: num(intensity, 1, 0.1, 4),
      speed: num(speed, 1, 0, 5),
      mouseReactivity: num(mouseReactivity, 1, 0, 3),
      glitch: num(glitch, 1, 0, 3),
      scanlines: scanlines !== false && (scanlines as unknown) !== "false",
      clearing: num(clearing, 0.65, 0, 1),
    }),
    [bgHex, palette, preset, hue, hueSpread, ramp, cellSize, fontFamily, intensity, speed, mouseReactivity, glitch, scanlines, clearing]
  );

  // Settings live in a ref so prop changes update uniforms without rebuilding GL.
  const settingsRef = useRef(settings);
  const updateRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    settingsRef.current = settings;
    updateRef.current?.();
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

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      res: uniform("uRes"),
      dpr: uniform("uDpr"),
      time: uniform("uTime"),
      cell: uniform("uCell"),
      atlas: uniform("uAtlas"),
      count: uniform("uCount"),
      mouse: uniform("uMouse"),
      bg: uniform("uBg"),
      hue: uniform("uHue"),
      spread: uniform("uSpread"),
      chroma: uniform("uChroma"),
      intensity: uniform("uIntensity"),
      glitch: uniform("uGlitch"),
      scanlines: uniform("uScanlines"),
      clearing: uniform("uClearing"),
    };
    gl.uniform1i(u.atlas, 0);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cssW = 0;
    let cssH = 0;
    let disposed = false;
    let visible = true;
    let raf = 0;
    let last = -1;
    let time = 20;
    let atlas: Atlas | null = null;
    let atlasKey = "";
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, active: false };

    // The glyph atlas is drawn at the canvas's real pixel scale, so cells map 1:1 onto it.
    const ensureAtlas = () => {
      if (cssW === 0) return;
      const s = settingsRef.current;
      const scale = canvas.width / cssW;
      const family = resolveFontFamily(s.fontFamily, wrap);
      const key = `${s.characters.join("")}|${s.cellSize}|${scale.toFixed(4)}|${family}`;
      if (key === atlasKey) return;
      atlasKey = key;
      atlas = buildAtlas(s.characters, s.cellSize * scale, family);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    };

    const draw = () => {
      if (disposed || gl.isContextLost() || cssW === 0 || cssH === 0 || !atlas) return;
      const s = settingsRef.current;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.dpr, canvas.width / cssW);
      gl.uniform1f(u.time, time);
      gl.uniform2f(u.cell, atlas.cellW, atlas.cellH);
      gl.uniform1f(u.count, s.characters.length);
      gl.uniform3f(u.mouse, mouse.x, mouse.y, mouse.strength);
      gl.uniform3fv(u.bg, s.background);
      gl.uniform1f(u.hue, s.hue);
      gl.uniform1f(u.spread, s.spread);
      gl.uniform1f(u.chroma, s.chroma);
      gl.uniform1f(u.intensity, s.intensity);
      gl.uniform1f(u.glitch, reducedMotion.matches ? 0 : s.glitch);
      gl.uniform1f(u.scanlines, s.scanlines ? 1 : 0);
      gl.uniform1f(u.clearing, s.clearing);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const shouldAnimate = () =>
      !disposed && visible && !document.hidden && !reducedMotion.matches && cssW > 0 && cssH > 0;

    const frame = (now: number) => {
      raf = 0;
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      const s = settingsRef.current;
      time += dt * s.speed;
      const follow = 1 - Math.exp(-dt * 8);
      mouse.x += (mouse.tx - mouse.x) * follow;
      mouse.y += (mouse.ty - mouse.y) * follow;
      mouse.strength += ((mouse.active ? s.mouseReactivity : 0) - mouse.strength) * (1 - Math.exp(-dt * 3));
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

    // Called when settings change: rebuild the atlas if needed, then draw.
    const update = () => {
      ensureAtlas();
      if (shouldAnimate()) schedule();
      else draw();
    };
    updateRef.current = update;

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
      update();
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = rect.height - (e.clientY - rect.top);
      if (!mouse.active && mouse.strength < 0.01) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.active = true;
      schedule();
    };
    const onPointerLeave = () => {
      mouse.active = false;
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (!disposed) setFailed(true);
    };
    // Web fonts may arrive after the first atlas: redraw it with the real glyphs.
    const onFontsLoaded = () => {
      if (disposed) return;
      atlasKey = "";
      update();
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
    reducedMotion.addEventListener("change", update);
    canvas.addEventListener("webglcontextlost", onContextLost);
    document.fonts?.ready.then(onFontsLoaded);
    document.fonts?.addEventListener?.("loadingdone", onFontsLoaded);

    resize();

    return () => {
      disposed = true;
      updateRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", update);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.fonts?.removeEventListener?.("loadingdone", onFontsLoaded);
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [failed]);

  return (
    <div ref={wrapRef} className={className ?? "absolute inset-0 overflow-hidden"} style={{ backgroundColor: bgHex, ...style }}>
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}

export default AsciiField;
