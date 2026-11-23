"use client";

import { useEffect, useRef } from "react";

// A daytime sky drawn as a mosaic of tiny text cells, after unvalley.me. Every cell is a small
// sky-blue tile with a denser blue letter on it, split from its neighbours by a hairline of white.
// Puffy clouds drift across in two layers (small and slow far away, big and quicker up close):
// inside a cloud the tiles wash out to white, and its underside picks up grey letters for shade.
// The edges wobble so the clouds change shape as they go. The pointer stirs a little wind that
// turns cells into white direction marks; a click sends out a ring of it. Just for show.

const CELL_W = 6;
const CELL_H = 10;
const SKY_CHARS = "xzoaxsvcxz";
const CLOUD_CHARS = " .:;o8%";

// void-lint-ignore: daytime sky palette, painted over white like the reference
const BLUE: [number, number, number] = [14, 138, 218];
const DEEP: [number, number, number] = [6, 112, 196];
const SHADE: [number, number, number] = [150, 168, 186];
const GAP = "#eef6fc";

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// A colour laid over white at some strength, quantised so cells can be compared and cached.
const cache = new Map<number, string>();
function over(c: [number, number, number], a: number) {
  const q = Math.round(Math.min(1, Math.max(0, a)) * 40);
  const key = (c[0] << 16) + (c[1] << 8) + c[2] + q * 16777216;
  let s = cache.get(key);
  if (!s) {
    const t = q / 40;
    s = `rgb(${Math.round(255 + (c[0] - 255) * t)},${Math.round(255 + (c[1] - 255) * t)},${Math.round(255 + (c[2] - 255) * t)})`;
    cache.set(key, s);
  }
  return { s, q };
}

type Puff = { dx: number; dy: number; r: number };
type Cloud = { x: number; y: number; speed: number; puffs: Puff[]; w: number; h: number; base: number };

// A cumulus: a row of overlapping puffs, biggest in the middle, with a flat-ish base.
function makeCloud(seed: number, scale: number, speed: number, width: number, height: number): Cloud {
  const n = 5 + Math.floor(hash(seed, 1) * 4);
  const puffs: Puff[] = [];
  const span = (45 + hash(seed, 2) * 55) * scale;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const mid = 1 - Math.abs(t - 0.5) * 1.4;
    const r = (16 + mid * 26 + hash(seed, 10 + i) * 10) * scale;
    puffs.push({ dx: (t - 0.5) * span * 2, dy: -mid * 14 * scale - hash(seed, 20 + i) * 6 * scale, r });
  }
  // A few small puffs on top for a lumpy crown.
  for (let i = 0; i < 2; i++) {
    puffs.push({ dx: (hash(seed, 30 + i) - 0.5) * span, dy: -28 * scale - hash(seed, 40 + i) * 10 * scale, r: (14 + hash(seed, 50 + i) * 10) * scale });
  }
  const w = span * 2 + 120 * scale;
  return {
    x: hash(seed, 3) * (width + w) - w / 2,
    y: 70 + hash(seed, 4) * height * 0.45,
    speed,
    puffs,
    w,
    h: 120 * scale,
    base: 14 * scale,
  };
}

export function AsciiSky({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let prev = new Int32Array(0);
    let dens = new Float32Array(0);
    let shade = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let clouds: Cloud[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `bold ${CELL_H - 2}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = GAP;
      ctx.fillRect(0, 0, width, height);
      cols = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      prev = new Int32Array(cols * rows).fill(-1);
      dens = new Float32Array(cols * rows);
      shade = new Float32Array(cols * rows);
      vx = new Float32Array(cols * rows);
      vy = new Float32Array(cols * rows);
      const many = Math.max(2, Math.round(width / 560));
      clouds = [
        ...Array.from({ length: many + 1 }, (_, i) => makeCloud(100 + i, 0.95, 6, width, height)),
        ...Array.from({ length: many }, (_, i) => makeCloud(200 + i, 1.55, 13, width, height)),
      ];
    };

    // The pointer's wind: velocity pushed into the cells around it, which then fades.
    let px = -1;
    let py = -1;
    const rings: { x: number; y: number; r: number }[] = [];
    const push = (cx: number, cy: number, dx: number, dy: number, radius: number) => {
      for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(rows - 1, Math.ceil(cy + radius)); y++) {
        for (let x = Math.max(0, Math.floor(cx - radius / 0.6)); x <= Math.min(cols - 1, Math.ceil(cx + radius / 0.6)); x++) {
          const d = Math.hypot((x - cx) * 0.6, y - cy);
          if (d > radius) continue;
          const k = 1 - d / radius;
          vx[y * cols + x] += dx * k;
          vy[y * cols + x] += dy * k;
        }
      }
    };
    const toCell = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) / CELL_W, y: (e.clientY - rect.top) / CELL_H, inside: e.clientY > rect.top && e.clientY < rect.bottom };
    };
    const onMove = (e: PointerEvent) => {
      const c = toCell(e);
      if (c.inside && px >= 0) push(c.x, c.y, (c.x - px) * 0.25, (c.y - py) * 0.6, 3.5);
      px = c.x;
      py = c.y;
    };
    const onDown = (e: PointerEvent) => {
      const c = toCell(e);
      if (c.inside) rings.push({ x: c.x, y: c.y, r: 1 });
    };

    let lastT = 0;
    const frame = (t: number) => {
      const time = t / 1000;
      const dt = lastT ? Math.min(0.1, time - lastT) : 0;
      lastT = time;

      // Wind rings push outward, then all wind fades.
      for (let n = rings.length - 1; n >= 0; n--) {
        const ring = rings[n];
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const x = Math.round(ring.x + (Math.cos(a) * ring.r) / 0.6);
          const y = Math.round(ring.y + Math.sin(a) * ring.r);
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          vx[y * cols + x] += Math.cos(a) * 0.9;
          vy[y * cols + x] += Math.sin(a) * 0.9;
        }
        ring.r += 0.9;
        if (ring.r > 20) rings.splice(n, 1);
      }
      for (let i = 0; i < vx.length; i++) {
        vx[i] *= 0.9;
        vy[i] *= 0.9;
      }

      // Cloud density, filled only inside each cloud's box.
      dens.fill(0);
      shade.fill(0);
      const gust = 1 + Math.sin(time * 0.12) * 0.3;
      for (const cl of clouds) {
        cl.x += cl.speed * gust * dt;
        if (cl.x - cl.w / 2 > width) cl.x = -cl.w / 2;
        const x0 = Math.max(0, Math.floor((cl.x - cl.w / 2) / CELL_W));
        const x1 = Math.min(cols - 1, Math.ceil((cl.x + cl.w / 2) / CELL_W));
        const y0 = Math.max(0, Math.floor((cl.y - cl.h) / CELL_H));
        const y1 = Math.min(rows - 1, Math.ceil((cl.y + cl.base + 20) / CELL_H));
        for (let y = y0; y <= y1; y++) {
          const cy = y * CELL_H + CELL_H / 2;
          for (let x = x0; x <= x1; x++) {
            const cx = x * CELL_W + CELL_W / 2;
            // The edge wobbles: noise nudges each cell's distance to the puffs.
            const wob = (noise(cx * 0.03 + time * 0.2, cy * 0.045 - time * 0.08) - 0.5) * 16;
            // Metaballs: the puffs add up, so neighbours melt into one cloud instead of beads.
            let d = 0;
            for (const p of cl.puffs) {
              const dist = Math.max(0, Math.hypot(cx - (cl.x + p.dx), cy - (cl.y + p.dy)) + wob);
              const q = 1 - (dist * dist) / (p.r * p.r * 1.6);
              if (q > 0) d += q * q;
            }
            d -= 0.18;
            // Flatten the base: fade out quickly below it.
            const below = cy - (cl.y + cl.base);
            if (below > 0) d -= below / 14;
            if (d <= 0) continue;
            const i = y * cols + x;
            // Soft edge: ramps from nothing at the rim to solid about halfway in.
            const e = Math.min(1, d / 0.45);
            const v = e * e * (3 - 2 * e);
            if (v > dens[i]) {
              dens[i] = v;
              // Shade: how far down the cloud this cell sits, strongest along the underside.
              shade[i] = Math.max(0, Math.min(1, (cy - (cl.y - cl.h * 0.25)) / (cl.h * 0.45 + cl.base)));
            }
          }
        }
      }

      for (let y = 0; y < rows; y++) {
        const depth = y / Math.max(1, rows - 1);
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const h = hash(x, y);
          const cloud = dens[i];
          // Sky tile: stronger blue up top, gently breathing per cell.
          const skyA = (0.8 - depth * 0.28 + Math.sin(time * 0.9 + h * 6.28) * 0.03) * (1 - cloud);
          const tile = over(BLUE, skyA);
          const speed = Math.hypot(vx[i], vy[i]);
          const windy = speed > 0.35;
          let ch: string;
          let ink: { s: string; q: number };
          if (windy) {
            ch = Math.abs(vx[i]) > Math.abs(vy[i]) * 2 ? "-" : Math.abs(vy[i]) > Math.abs(vx[i]) * 2 ? "|" : vx[i] * vy[i] > 0 ? "\\" : "/";
            ink = { s: "#ffffff", q: 41 };
          } else if (cloud > 0.35) {
            // Inside a cloud: grey letters only where it's shaded underneath.
            const s = shade[i] * cloud;
            ch = CLOUD_CHARS[Math.min(CLOUD_CHARS.length - 1, Math.floor(s * CLOUD_CHARS.length + h * 0.7))];
            ink = over(SHADE, 0.2 + s * 0.7);
          } else {
            ch = SKY_CHARS[Math.floor(h * SKY_CHARS.length)];
            ink = over(DEEP, Math.min(1, skyA + 0.22));
          }
          const key = tile.q * 4096 + ink.q * 64 + ch.charCodeAt(0) % 64;
          if (prev[i] === key) continue;
          prev[i] = key;
          const px0 = x * CELL_W;
          const py0 = y * CELL_H;
          ctx.fillStyle = GAP;
          ctx.fillRect(px0, py0, CELL_W, CELL_H);
          ctx.fillStyle = tile.s;
          ctx.fillRect(px0, py0, CELL_W - 1, CELL_H - 1);
          if (ch !== " ") {
            ctx.fillStyle = ink.s;
            ctx.fillText(ch, px0 + (CELL_W - 1) / 2, py0 + (CELL_H - 1) / 2);
          }
        }
      }
    };

    resize();
    frame(performance.now());
    canvas.style.opacity = "1";
    if (reduce) {
      const onResize = () => {
        resize();
        frame(performance.now());
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) {
        lastT = 0;
        return;
      }
      if (t - last < 1000 / 30) return;
      last = t;
      frame(t);
    };
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) return void (first = false);
      resize();
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        opacity: 0,
        transition: "opacity 1.2s ease",
        maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
      }}
    />
  );
}
