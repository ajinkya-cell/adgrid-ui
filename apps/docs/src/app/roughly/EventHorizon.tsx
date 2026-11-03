"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Event Horizon: a black hole that follows the cursor and gravitationally lenses the image behind it.
 * WebGL1 fragment shader over an image (object-cover), with a photon ring and a thin spinning accretion
 * ring. The plain <img> stays underneath as the fallback (no WebGL, image still loading) and for a11y.
 */

interface EventHorizonProps {
  src: string;
  alt: string;
  className?: string;
  /** Event-horizon radius in CSS px (default: scales with the hero, 26–58) */
  radius?: number;
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas size, device px
uniform vec2 uImg;      // image size, px
uniform vec2 uCenter;   // hole centre, device px, origin top-left
uniform float uR;       // horizon radius, device px
uniform float uSpin;    // accretion rotation (radians)
uniform float uDpr;

vec3 cover(vec2 p) {
  float s = max(uRes.x / uImg.x, uRes.y / uImg.y);
  vec2 uv = ((p - 0.5 * uRes) / s + 0.5 * uImg) / uImg;
  return texture2D(uTex, clamp(uv, 0.0, 1.0)).rgb;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 d = p - uCenter;
  float r = length(d);

  // Point-mass lens: the image seen at d comes from d * (1 - E^2 / r^2).
  float E = uR * 1.5;
  float fall = 1.0 - smoothstep(E * 1.8, E * 4.0, r);
  float k = (E * E) / max(r * r, 1.0) * fall;

  // Slight dispersion near the lens so the bend reads as optics, not a smear.
  vec3 col;
  col.r = cover(uCenter + d * (1.0 - k * 1.015)).r;
  col.g = cover(uCenter + d * (1.0 - k)).g;
  col.b = cover(uCenter + d * (1.0 - k * 0.985)).b;

  // Light falls off toward the horizon.
  float near = exp(-max(r - uR, 0.0) / (uR * 0.55));
  col *= 1.0 - 0.6 * near;

  float ang = atan(d.y, d.x);
  vec3 warm = vec3(1.0, 0.85, 0.64);

  // Photon ring: a hairline hugging the horizon.
  float pw = 1.1 * uDpr;
  float photon = exp(-pow((r - uR * 1.05) / pw, 2.0));

  // Accretion ring: thin, streaked, one side brighter (beaming), spinning.
  float ar = uR * 1.34;
  float aw = 1.5 * uDpr;
  float streak = 0.55 + 0.45 * sin(ang * 5.0 - uSpin + 1.2 * sin(ang * 2.0 + uSpin * 0.35));
  float beam = 0.6 + 0.4 * cos(ang - uSpin * 0.2 + 0.7);
  float ring = exp(-pow((r - ar) / aw, 2.0)) * streak * beam;
  float halo = exp(-pow((r - ar) / (aw * 8.0), 2.0)) * 0.16 * beam;

  col += warm * (photon * 0.85 + ring * 1.15 + halo);

  // The horizon itself: antialiased, perfectly black.
  col *= smoothstep(uR - 0.8 * uDpr, uR + 0.8 * uDpr, r);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function EventHorizon({ src, alt, className = "", radius }: EventHorizonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return undefined; // fallback: the <img> stays visible

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return undefined;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return undefined;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      img: gl.getUniformLocation(prog, "uImg"),
      center: gl.getUniformLocation(prog, "uCenter"),
      r: gl.getUniformLocation(prog, "uR"),
      spin: gl.getUniformLocation(prog, "uSpin"),
      dpr: gl.getUniformLocation(prog, "uDpr"),
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let raf = 0;
    let visible = true;
    let imgW = 1;
    let imgH = 1;
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;

    // Hole state in CSS px, eased toward the target.
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let lastPointer = -Infinity;
    let placed = false;

    const restPoint = () =>
      cssW < 640 ? { x: cssW * 0.74, y: cssH * 0.8 } : { x: cssW * 0.8, y: cssH * 0.3 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (!placed && cssW > 0) {
        const rest = restPoint();
        pos.x = target.x = rest.x;
        pos.y = target.y = rest.y;
        placed = true;
      }
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch" && e.type === "pointermove") return; // touch: tap to move, don't fight scrolling
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      target.x = x;
      target.y = y;
      lastPointer = performance.now();
    };

    const tex = gl.createTexture();
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (disposed) return;
      imgW = image.naturalWidth;
      imgH = image.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      resize();
      setReady(true);
      loop(performance.now());
    };
    image.src = src;

    let last = performance.now();
    let spin = 0;
    const loop = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      if (!visible || !placed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Idle: drift back to rest and orbit it slowly.
      if (now - lastPointer > 2500) {
        const rest = restPoint();
        const t = now / 1000;
        target.x = rest.x + (reduceMotion ? 0 : Math.cos(t * 0.35) * 16);
        target.y = rest.y + (reduceMotion ? 0 : Math.sin(t * 0.5) * 10);
      }
      const ease = reduceMotion ? 1 : 1 - Math.exp(-dt * 7);
      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;
      if (!reduceMotion) spin += dt * 1.6;

      const rCss = radius ?? Math.min(58, Math.max(26, Math.min(cssW, cssH) * 0.055));
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.img, imgW, imgH);
      gl.uniform2f(u.center, pos.x * dpr, pos.y * dpr);
      gl.uniform1f(u.r, rCss * dpr);
      gl.uniform1f(u.spin, spin);
      gl.uniform1f(u.dpr, dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
    });
    io.observe(canvas);
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src, radius]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full select-none object-cover object-center pointer-events-none"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
