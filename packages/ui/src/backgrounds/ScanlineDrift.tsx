"use client";

import { useEffect, useRef } from "react";

export type ScanlineVariant = "afterglow" | "aurora" | "shimmer";

const CFG = {
  afterglow: {
    count: [5, 7], height: [40, 70], speed: [0.15, 0.25],
    widthPct: [0.85, 1.1], waveAmp: 4, waveFreq: 0.007,
    hue: [25, 42], sat: [85, 100], light: [55, 75],
    peak: 0.35, colorSpeed: 0,
  },
  aurora: {
    count: [3, 5], height: [90, 200], speed: [0.08, 0.15],
    widthPct: [0.7, 1.0], waveAmp: 10, waveFreq: 0.0035,
    hue: [170, 340], sat: [65, 80], light: [50, 65],
    peak: 0.18, colorSpeed: 0.003,
  },
  shimmer: {
    count: [2, 4], height: [10, 18], speed: [0.06, 0.12],
    widthPct: [0.9, 1.1], waveAmp: 3, waveFreq: 0.012,
    hue: [200, 220], sat: [5, 12], light: [60, 80],
    peak: 0.22, colorSpeed: 0.001,
  },
};

type Cfg = (typeof CFG)[ScanlineVariant];

interface Band {
  y: number;
  xOff: number;
  wPct: number;
  h: number;
  spd: number;
  phase: number;
  hue: number;
  sat: number;
  light: number;
}

function r(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeBand(ch: number, c: Cfg): Band {
  return {
    y: r(ch * 0.1, ch * 0.9),
    xOff: r(-8, 8),
    wPct: r(c.widthPct[0], c.widthPct[1]),
    h: r(c.height[0], c.height[1]),
    spd: r(c.speed[0], c.speed[1]),
    phase: r(0, Math.PI * 2),
    hue: r(c.hue[0], c.hue[1]),
    sat: r(c.sat[0], c.sat[1]),
    light: r(c.light[0], c.light[1]),
  };
}

export function ScanlineDrift({
  variant = "afterglow",
}: {
  variant?: ScanlineVariant;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const bandsRef = useRef<Band[]>([]);
  const timeRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    const c = CFG[variant];
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
    };
    mq.addEventListener("change", onMq);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      const n = Math.round(r(c.count[0], c.count[1]));
      bandsRef.current = Array.from({ length: n }, () =>
        makeBand(canvas.height, c)
      );
    };

    const yAlpha = (y: number, ch: number) => {
      const t = y / ch;
      return Math.max(0, 1 - Math.abs(t - 0.5) * 2.5);
    };

    const drawAfterglow = (
      b: Band,
      t: number,
      mx: number,
      my: number,
      cw: number,
      ch: number
    ) => {
      const wy = b.y + Math.sin(t * c.waveFreq + b.phase) * c.waveAmp;
      const cx = cw * 0.5 + b.xOff;

      const dx = mx - cx;
      const dy = my - wy;
      const md = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 350);
      const warm = md * 0.45;

      const posA = yAlpha(wy, ch);
      const a = Math.min(posA * c.peak + warm * 0.1, 0.45);
      if (a < 0.003) return;

      ctx.save();
      ctx.translate(cx, wy);
      ctx.scale((cw * b.wPct) / (b.h * 3), 1);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.h * 1.5);
      const h = Math.min(b.hue + warm * 10, 48);
      const s = b.sat + warm * 10;
      const l = b.light + warm * 10;
      g.addColorStop(0, `hsla(${h},${s}%,${Math.min(l + 12, 88)}%,${a})`);
      g.addColorStop(
        0.25,
        `hsla(${h - 3},${s}%,${l - 6}%,${a * 0.6})`
      );
      g.addColorStop(
        0.55,
        `hsla(${h - 7},${Math.max(s - 12, 55)}%,${l - 16}%,${a * 0.2})`
      );
      g.addColorStop(1, `hsla(${h - 10},55%,${l - 22}%,0)`);

      ctx.fillStyle = g;
      ctx.fillRect(-b.h * 1.5, -b.h * 1.5, b.h * 3, b.h * 3);
      ctx.restore();
    };

    const drawAurora = (
      b: Band,
      t: number,
      mx: number,
      my: number,
      cw: number,
      ch: number
    ) => {
      const wave = Math.sin(t * c.waveFreq + b.phase) * c.waveAmp;
      const sway = Math.sin(t * 0.0018 + b.phase * 1.3) * 40;
      const wy = b.y + wave;
      const cx = cw * 0.5 + b.xOff + sway;

      const dx = mx - cx;
      const dy = my - wy;
      const md = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 400);
      const warpX = dx * md * 0.2;
      const warpY = dy * md * 0.1;

      const hueShift = (t * c.colorSpeed + b.phase * 0.5) % (Math.PI * 2);
      const hue = ((b.hue + Math.sin(hueShift) * 60) % 360 + 360) % 360;

      const posA = yAlpha(wy + warpY, ch);
      const a = Math.min(posA * c.peak + md * 0.05, 0.22);
      if (a < 0.003) return;

      ctx.save();
      ctx.translate(cx + warpX, wy + warpY);
      ctx.scale((cw * b.wPct * 0.5) / (b.h * 0.6), 1);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.h * 0.6);
      g.addColorStop(0, `hsla(${hue},${b.sat}%,${b.light + 6}%,${a})`);
      g.addColorStop(
        0.3,
        `hsla(${(hue + 30) % 360},${b.sat - 5}%,${b.light}%,${a * 0.4})`
      );
      g.addColorStop(
        0.6,
        `hsla(${(hue + 60) % 360},${b.sat - 10}%,${b.light - 6}%,${a * 0.12})`
      );
      g.addColorStop(1, `hsla(${(hue + 90) % 360},${b.sat - 15}%,${b.light - 12}%,0)`);

      ctx.fillStyle = g;
      ctx.fillRect(-b.h * 0.6, -b.h * 0.3, b.h * 1.2, b.h * 0.6);
      ctx.restore();
    };

    const drawShimmer = (
      b: Band,
      t: number,
      mx: number,
      my: number,
      cw: number,
      ch: number
    ) => {
      const wave =
        ((Math.sin(t * c.waveFreq * 1 + b.phase) +
          Math.sin(t * c.waveFreq * 2.3 + b.phase * 1.4) +
          Math.sin(t * c.waveFreq * 0.7 + b.phase * 0.8)) /
          3) *
        c.waveAmp;

      const wy = b.y + wave;
      const cx = cw * 0.5 + b.xOff;

      const dx = mx - cx;
      const dy = my - wy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const md = Math.max(0, 1 - dist / 280);
      const ripple = Math.sin(dist * 0.035 - t * 0.004) * md * 3;
      const rippleA = md * 0.1;

      const posA = yAlpha(wy + ripple, ch);
      const a = Math.min(posA * c.peak + rippleA, 0.3);
      if (a < 0.003) return;

      ctx.save();
      ctx.translate(cx, wy + ripple);
      ctx.scale((cw * b.wPct) / (b.h * 5), 1);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.h * 2.5);
      const hueShift = Math.sin(t * 0.001) * 4;
      const h = b.hue + hueShift;
      g.addColorStop(0, `hsla(${h},${b.sat}%,${b.light + 4}%,${a})`);
      g.addColorStop(
        0.35,
        `hsla(${h + 2},${b.sat}%,${b.light - 4}%,${a * 0.35})`
      );
      g.addColorStop(
        0.65,
        `hsla(${h + 4},${b.sat}%,${b.light - 10}%,${a * 0.1})`
      );
      g.addColorStop(1, `hsla(${h + 6},${b.sat}%,${b.light - 16}%,0)`);

      ctx.fillStyle = g;
      ctx.fillRect(-b.h * 2.5, -b.h * 2.5, b.h * 5, b.h * 5);
      ctx.restore();
    };

    const drawMap: Record<ScanlineVariant, typeof drawAfterglow> = {
      afterglow: drawAfterglow,
      aurora: drawAurora,
      shimmer: drawShimmer,
    };
    const drawBand = drawMap[variant];

    const draw = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp;
      const t = timestamp - timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (reducedRef.current) {
        ctx.fillStyle = "rgba(200,160,100,0.04)";
        ctx.fillRect(0, canvas.height * 0.44, canvas.width, canvas.height * 0.03);
        ctx.fillRect(0, canvas.height * 0.52, canvas.width, canvas.height * 0.015);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const bands = bandsRef.current;
      if (bands.length < Math.round(r(c.count[0], c.count[1])) && Math.random() < 0.03) {
        bands.push(makeBand(canvas.height, c));
      }

      const { x: mx, y: my } = mouseRef.current;
      const cw = canvas.width;
      const ch = canvas.height;

      for (let i = bands.length - 1; i >= 0; i--) {
        const b = bands[i];
        b.y -= b.spd;
        if (b.y < -b.h * 2) {
          bands.splice(i, 1);
          continue;
        }
        drawBand(b, t, mx, my, cw, ch);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    init();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      mq.removeEventListener("change", onMq);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "#000" }}
    />
  );
}
