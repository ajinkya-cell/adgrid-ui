"use client";

import React, { useRef, useEffect, useState } from 'react';

// ─── 1. TYPES & INTERFACES ───
export interface AnimationContext {
  elements: HTMLDivElement[];
  rows: number;
  columns: number;
  time: number;
  deltaTime: number;
  color: string;
  inactiveColor: string;
  speed: number;
  text?: string;
  audioAnalyser: AnalyserNode | null;
  options: Record<string, any>;
  brightnessCache: Float32Array;
}

export interface AnimationPlugin {
  name: string;
  init?: (context: AnimationContext) => void;
  update: (context: AnimationContext) => void;
  cleanup?: (context: AnimationContext) => void;
}

export interface DotMatrixProps {
  rows?: number;
  columns?: number;
  dotSize?: number;
  gap?: number;
  borderRadius?: string;
  color?: string;
  inactiveColor?: string;
  animation?: 
    | "wave" 
    | "text" 
    | "scroll-text" 
    | "clock" 
    | "equalizer" 
    | "audio" 
    | "noise" 
    | "sparkle" 
    | "ripple"
    | "snake"
    | "rain";
  text?: string;
  speed?: number;
  fps?: number;
  loop?: boolean;
  delay?: number;
  glow?: boolean;
  blur?: number;
  noiseScale?: number;
  seed?: number;
  pattern?: number[][];
  patternB?: number[][];
  morphProgress?: number;
}

// ─── 2. UTILITIES ───

// 5x7 Retro Font Matrix
export const GLYPH_HEIGHT = 7;
export const GLYPH_WIDTH = 5;

export const GLYPHS: Record<string, number[][]> = {
  ' ': Array.from({ length: 7 }, () => Array(5).fill(0)),
  'A': [[0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1]],
  'B': [[1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0]],
  'C': [[0,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [0,1,1,1,1]],
  'D': [[1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0]],
  'E': [[1,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,1]],
  'F': [[1,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0]],
  'G': [[0,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [1,0,1,1,1], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,1]],
  'H': [[1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1]],
  'I': [[1,1,1,1,1], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [1,1,1,1,1]],
  'J': [[0,0,1,1,1], [0,0,0,1,0], [0,0,0,1,0], [0,0,0,1,0], [1,0,0,1,0], [1,0,0,1,0], [0,1,1,0,0]],
  'K': [[1,0,0,0,1], [1,0,0,1,0], [1,0,1,0,0], [1,1,0,0,0], [1,0,1,0,0], [1,0,0,1,0], [1,0,0,0,1]],
  'L': [[1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,1]],
  'M': [[1,0,0,0,1], [1,1,0,1,1], [1,0,1,0,1], [1,0,1,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1]],
  'N': [[1,0,0,0,1], [1,1,0,0,1], [1,0,1,0,1], [1,0,1,0,1], [1,0,0,1,1], [1,0,0,0,1], [1,0,0,0,1]],
  'O': [[0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  'P': [[1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0]],
  'Q': [[0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,1,0,1], [1,0,0,1,0], [0,1,1,0,1]],
  'R': [[1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [1,1,1,1,0], [1,0,1,0,0], [1,0,0,1,0], [1,0,0,0,1]],
  'S': [[0,1,1,1,1], [1,0,0,0,0], [1,0,0,0,0], [0,1,1,1,0], [0,0,0,0,1], [0,0,0,0,1], [1,1,1,1,0]],
  'T': [[1,1,1,1,1], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0]],
  'U': [[1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  'V': [[1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [0,1,0,1,0], [0,1,0,1,0], [0,0,1,0,0]],
  'W': [[1,0,0,0,1], [1,0,0,0,1], [1,0,0,0,1], [1,0,1,0,1], [1,0,1,0,1], [1,1,0,1,1], [1,0,0,0,1]],
  'X': [[1,0,0,0,1], [0,1,0,1,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,1,0,1,0], [1,0,0,0,1]],
  'Y': [[1,0,0,0,1], [0,1,0,1,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0]],
  'Z': [[1,1,1,1,1], [0,0,0,0,1], [0,0,0,1,0], [0,0,1,0,0], [0,1,0,0,0], [1,0,0,0,0], [1,1,1,1,1]],
  '0': [[0,1,1,1,0], [1,0,0,0,1], [1,0,0,1,1], [1,0,1,0,1], [1,1,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  '1': [[0,0,1,0,0], [0,1,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,1,1,1,0]],
  '2': [[0,1,1,1,0], [1,0,0,0,1], [0,0,0,0,1], [0,0,1,1,0], [0,1,0,0,0], [1,0,0,0,0], [1,1,1,1,1]],
  '3': [[1,1,1,1,1], [0,0,0,1,0], [0,0,1,0,0], [0,0,0,1,0], [0,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  '4': [[0,0,0,1,0], [0,0,1,1,0], [0,1,0,1,0], [1,0,0,1,0], [1,1,1,1,1], [0,0,0,1,0], [0,0,0,1,0]],
  '5': [[1,1,1,1,1], [1,0,0,0,0], [1,1,1,1,0], [0,0,0,0,1], [0,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  '6': [[0,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  '7': [[1,1,1,1,1], [0,0,0,0,1], [0,0,0,1,0], [0,0,1,0,0], [0,1,0,0,0], [0,1,0,0,0], [0,1,0,0,0]],
  '8': [[0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,0]],
  '9': [[0,1,1,1,0], [1,0,0,0,1], [1,0,0,0,1], [0,1,1,1,1], [0,0,0,0,1], [0,0,0,0,1], [0,1,1,1,0]],
  ':': [[0,0,0,0,0], [0,0,1,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,1,0,0], [0,0,0,0,0]],
  '-': [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,1,1,1,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
  '.': [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,1,0,0], [0,0,0,0,0]],
  '!': [[0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,0,0,0], [0,0,1,0,0], [0,0,0,0,0]]
};

export function textToBitmap(text: string, letterSpacing = 1): number[][] {
  const normalized = text.toUpperCase();
  const glyphs: number[][][] = [];
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const glyph = GLYPHS[char] || GLYPHS[' '];
    glyphs.push(glyph);
  }

  const result: number[][] = Array.from({ length: GLYPH_HEIGHT }, () => []);

  for (let r = 0; r < GLYPH_HEIGHT; r++) {
    for (let g = 0; g < glyphs.length; g++) {
      const glyph = glyphs[g];
      for (let c = 0; c < GLYPH_WIDTH; c++) {
        result[r].push(glyph[r][c]);
      }
      if (g < glyphs.length - 1) {
        for (let s = 0; s < letterSpacing; s++) {
          result[r].push(0);
        }
      }
    }
  }
  return result;
}

export function fitBitmapToGrid(
  bitmap: number[][],
  gridRows: number,
  gridCols: number,
  hOffset = 0,
  vAlign: 'top' | 'center' | 'bottom' = 'center',
  hAlign: 'left' | 'center' | 'right' = 'center'
): number[][] {
  const grid: number[][] = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
  const bitmapHeight = bitmap.length;
  if (bitmapHeight === 0) return grid;
  const bitmapWidth = bitmap[0].length;

  let vStart = 0;
  if (vAlign === 'center') {
    vStart = Math.max(0, Math.floor((gridRows - bitmapHeight) / 2));
  } else if (vAlign === 'bottom') {
    vStart = Math.max(0, gridRows - bitmapHeight);
  }

  let hStart = hOffset;
  if (hOffset === 0 && hAlign !== 'left') {
    if (hAlign === 'center') {
      hStart = Math.max(0, Math.floor((gridCols - bitmapWidth) / 2));
    } else if (hAlign === 'right') {
      hStart = Math.max(0, gridCols - bitmapWidth);
    }
  }

  for (let r = 0; r < gridRows; r++) {
    const bitmapRowIndex = r - vStart;
    if (bitmapRowIndex >= 0 && bitmapRowIndex < bitmapHeight) {
      for (let c = 0; c < gridCols; c++) {
        const bitmapColIndex = c - hStart;
        if (bitmapColIndex >= 0 && bitmapColIndex < bitmapWidth) {
          grid[r][c] = bitmap[bitmapRowIndex][bitmapColIndex];
        }
      }
    }
  }
  return grid;
}

// 2D Perlin Simplex solver
class PerlinNoise {
  private p: number[] = new Array(512);

  constructor(seed = 42) {
    const permutation = Array.from({ length: 256 }, (_, i) => i);
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    let currentSeed = seed;
    for (let i = 255; i > 0; i--) {
      const r = Math.floor(random(currentSeed++) * (i + 1));
      const temp = permutation[i];
      permutation[i] = permutation[r];
      permutation[r] = temp;
    }
    for (let i = 0; i < 256; i++) {
      this.p[i] = permutation[i];
      this.p[256 + i] = permutation[i];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  public noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;
    const val = this.lerp(v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
    );
    return val * 0.5;
  }
}

let globalNoise: PerlinNoise | null = null;
export function noise2D(x: number, y: number, seed = 42): number {
  if (!globalNoise) globalNoise = new PerlinNoise(seed);
  return globalNoise.noise(x, y);
}

// ─── 3. HOOKS ───

export function useRAF(
  callback: (time: number, deltaTime: number) => void,
  active = true,
  fps = 60
) {
  const savedCallback = useRef(callback);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
      return;
    }

    const frameIntervalMs = 1000 / fps;

    const tick = (timestampMs: number) => {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestampMs;
        requestRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsedMs = timestampMs - previousTimeRef.current;

      if (elapsedMs >= frameIntervalMs) {
        previousTimeRef.current = timestampMs - (elapsedMs % frameIntervalMs);
        const deltaTimeSeconds = elapsedMs / 1000;
        accumulatedTimeRef.current += deltaTimeSeconds;
        savedCallback.current(accumulatedTimeRef.current, deltaTimeSeconds);
      }
      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, fps]);
}

// ─── 4. ANIMATION ENGINES (PLUGINS) ───

function decayBrightness(ctx: AnimationContext, decayRate = 0.9) {
  const cache = ctx.brightnessCache;
  const elements = ctx.elements;
  for (let i = 0; i < elements.length; i++) {
    let b = cache[i];
    if (b > 0.01) {
      b *= decayRate;
      cache[i] = b;
      elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
    } else if (b !== 0) {
      cache[i] = 0;
      elements[i].style.setProperty('--dot-brightness', '0');
    }
  }
}

export const wavePlugin: AnimationPlugin = {
  name: "wave",
  update: (ctx) => {
    const scale = 0.25;
    const cache = ctx.brightnessCache;
    for (let i = 0; i < ctx.elements.length; i++) {
      const r = Math.floor(i / ctx.columns);
      const c = i % ctx.columns;
      const val = Math.sin((r + c) * scale - ctx.time * 5 * ctx.speed);
      const b = 0.5 + 0.5 * val;
      const prevB = cache[i];
      if (Math.abs(b - prevB) > 0.015) {
        cache[i] = b;
        ctx.elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
      }
    }
  }
};

export const noisePlugin: AnimationPlugin = {
  name: "noise",
  update: (ctx) => {
    const noiseScale = ctx.options.noiseScale ?? 0.15;
    const seed = ctx.options.seed ?? 42;
    const cache = ctx.brightnessCache;
    for (let i = 0; i < ctx.elements.length; i++) {
      const r = Math.floor(i / ctx.columns);
      const c = i % ctx.columns;
      const n = noise2D(c * noiseScale, r * noiseScale + ctx.time * ctx.speed, seed);
      const b = 0.5 + 0.5 * n;
      const prevB = cache[i];
      if (Math.abs(b - prevB) > 0.015) {
        cache[i] = b;
        ctx.elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
      }
    }
  }
};

export const sparklePlugin: AnimationPlugin = {
  name: "sparkle",
  update: (ctx) => {
    decayBrightness(ctx, 0.88);
    const sparkleChance = 0.0006 * ctx.elements.length * ctx.speed;
    const count = Math.ceil(sparkleChance);
    const cache = ctx.brightnessCache;
    for (let k = 0; k < count; k++) {
      if (Math.random() < sparkleChance) {
        const idx = Math.floor(Math.random() * ctx.elements.length);
        const el = ctx.elements[idx];
        if (el) {
          cache[idx] = 1.0;
          el.style.setProperty('--dot-brightness', '1.0');
        }
      }
    }
  }
};

export const ripplePlugin: AnimationPlugin = {
  name: "ripple",
  init: (ctx) => {
    ctx.options.rippleStart = ctx.time;
  },
  update: (ctx) => {
    decayBrightness(ctx, 0.9);
    const centerX = ctx.columns / 2;
    const centerY = ctx.rows / 2;
    const maxRadius = Math.max(ctx.columns, ctx.rows);
    const speed = 12 * ctx.speed;
    const duration = maxRadius / speed + 1.0;
    const elapsed = ctx.time - (ctx.options.rippleStart || 0);

    if (elapsed > duration) {
      ctx.options.rippleStart = ctx.time;
    }
    const waveRadius = elapsed * speed;
    const cache = ctx.brightnessCache;

    for (let i = 0; i < ctx.elements.length; i++) {
      const r = Math.floor(i / ctx.columns);
      const c = i % ctx.columns;
      const dx = c - centerX;
      const dy = r - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = Math.abs(dist - waveRadius);
      if (diff < 2.0) {
        const b = 1.0 - diff / 2.0;
        const currentB = cache[i];
        const nextB = Math.max(currentB, b);
        if (Math.abs(nextB - currentB) > 0.015) {
          cache[i] = nextB;
          ctx.elements[i].style.setProperty('--dot-brightness', nextB.toFixed(3));
        }
      }
    }
  }
};

export const snakePlugin: AnimationPlugin = {
  name: "snake",
  init: (ctx) => {
    ctx.options.snakeBody = [0];
    ctx.options.snakeDir = [1, 0];
    ctx.options.lastSnakeMove = ctx.time;
  },
  update: (ctx) => {
    decayBrightness(ctx, 0.85);
    const body = ctx.options.snakeBody as number[];
    let dir = ctx.options.snakeDir as [number, number];
    const lastMove = ctx.options.lastSnakeMove || 0;
    const moveInterval = 0.08 / ctx.speed;
    const cache = ctx.brightnessCache;

    if (body && dir && (ctx.time - lastMove > moveInterval)) {
      ctx.options.lastSnakeMove = ctx.time;
      const headIdx = body[0] ?? 0;
      const headR = Math.floor(headIdx / ctx.columns);
      const headC = headIdx % ctx.columns;

      if (Math.random() < 0.2) {
        const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const allowedDirs = dirs.filter(([dc, dr]) => !(dc === -dir[0] && dr === -dir[1]));
        dir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)] || dir;
        ctx.options.snakeDir = dir;
      }

      let nextC = headC + dir[0];
      let nextR = headR + dir[1];

      if (nextC < 0 || nextC >= ctx.columns || nextR < 0 || nextR >= ctx.rows) {
        const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const validDirs = dirs.filter(([dc, dr]) => {
          const tc = headC + dc;
          const tr = headR + dr;
          return tc >= 0 && tc < ctx.columns && tr >= 0 && tr < ctx.rows;
        });
        if (validDirs.length > 0) {
          dir = validDirs[Math.floor(Math.random() * validDirs.length)] || dir;
          ctx.options.snakeDir = dir;
          nextC = headC + dir[0];
          nextR = headR + dir[1];
        } else {
          body.length = 0;
          body.push(0);
          dir = [1, 0];
          ctx.options.snakeDir = dir;
          nextC = 1;
          nextR = 0;
        }
      }

      const nextHeadIdx = nextR * ctx.columns + nextC;
      body.unshift(nextHeadIdx);
      if (body.length > 12) {
        body.pop();
      }
    }

    if (body) {
      for (let idx = 0; idx < body.length; idx++) {
        const dotIdx = body[idx];
        if (dotIdx >= 0 && dotIdx < ctx.elements.length) {
          const b = 1.0 - idx / body.length;
          cache[dotIdx] = b;
          ctx.elements[dotIdx].style.setProperty('--dot-brightness', b.toFixed(3));
        }
      }
    }
  }
};

export const rainPlugin: AnimationPlugin = {
  name: "rain",
  init: (ctx) => {
    ctx.options.rainDrops = Array.from({ length: ctx.columns }, () => -Math.random() * ctx.rows * 2);
  },
  update: (ctx) => {
    decayBrightness(ctx, 0.82);
    const drops = ctx.options.rainDrops as number[];
    const fallSpeed = 16 * ctx.speed;
    const cache = ctx.brightnessCache;

    if (drops) {
      for (let c = 0; c < ctx.columns; c++) {
        if (drops[c] === undefined) drops[c] = -Math.random() * ctx.rows * 2;
        drops[c] += ctx.deltaTime * fallSpeed;
        if (drops[c] > ctx.rows + 6) {
          drops[c] = -Math.random() * ctx.rows;
        }
        const headRow = Math.floor(drops[c]);
        for (let r = 0; r < ctx.rows; r++) {
          if (r <= headRow && r > headRow - 5) {
            const b = 1.0 - (headRow - r) / 5;
            const idx = r * ctx.columns + c;
            const el = ctx.elements[idx];
            if (el) {
              const currentB = cache[idx];
              const nextB = Math.max(currentB, b);
              if (Math.abs(nextB - currentB) > 0.015) {
                cache[idx] = nextB;
                el.style.setProperty('--dot-brightness', nextB.toFixed(3));
              }
            }
          }
        }
      }
    }
  }
};

export const textPlugin: AnimationPlugin = {
  name: "text",
  update: (ctx) => {
    const textStr = ctx.text || "KINETIC";
    const bitmap = textToBitmap(textStr);
    const grid = fitBitmapToGrid(bitmap, ctx.rows, ctx.columns);
    const cache = ctx.brightnessCache;

    for (let i = 0; i < ctx.elements.length; i++) {
      const r = Math.floor(i / ctx.columns);
      const c = i % ctx.columns;
      const b = grid[r][c] ? 1.0 : 0.0;
      const prevB = cache[i];
      if (Math.abs(b - prevB) > 0.015) {
        cache[i] = b;
        ctx.elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
      }
    }
  }
};

export const scrollTextPlugin: AnimationPlugin = {
  name: "scroll-text",
  init: (ctx) => {
    ctx.options.scrollOffset = ctx.columns;
    ctx.options.lastScrollUpdate = ctx.time;
  },
  update: (ctx) => {
    const textStr = ctx.text || "KINETIC MATRIX";
    const bitmap = textToBitmap(textStr);
    const bitmapWidth = bitmap[0]?.length || 0;
    const cache = ctx.brightnessCache;

    let offset = ctx.options.scrollOffset ?? ctx.columns;
    const lastUpdate = ctx.options.lastScrollUpdate || 0;
    const scrollSpeed = 0.06 / ctx.speed;

    if (ctx.time - lastUpdate > scrollSpeed) {
      ctx.options.lastScrollUpdate = ctx.time;
      offset--;
      if (offset < -bitmapWidth) {
        offset = ctx.columns;
      }
      ctx.options.scrollOffset = offset;
    }

    const grid = fitBitmapToGrid(bitmap, ctx.rows, ctx.columns, offset, 'center', 'left');
    for (let i = 0; i < ctx.elements.length; i++) {
      const r = Math.floor(i / ctx.columns);
      const c = i % ctx.columns;
      const b = grid[r][c] ? 1.0 : 0.0;
      const prevB = cache[i];
      if (Math.abs(b - prevB) > 0.015) {
        cache[i] = b;
        ctx.elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
      }
    }
  }
};

export const clockPlugin: AnimationPlugin = {
  name: "clock",
  update: (ctx) => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    const clockStr = `${hh}:${mm}:${ss}`;
    const bitmap = textToBitmap(clockStr);
    const grid = fitBitmapToGrid(bitmap, ctx.rows, ctx.columns);
    const cache = ctx.brightnessCache;

    for (let i = 0; i < ctx.elements.length; i++) {
      const r = Math.floor(i / ctx.columns);
      const c = i % ctx.columns;
      const b = grid[r][c] ? 1.0 : 0.0;
      const prevB = cache[i];
      if (Math.abs(b - prevB) > 0.015) {
        cache[i] = b;
        ctx.elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
      }
    }
  }
};

export const equalizerPlugin: AnimationPlugin = {
  name: "equalizer",
  update: (ctx) => {
    const cache = ctx.brightnessCache;
    for (let c = 0; c < ctx.columns; c++) {
      const waveVal = Math.sin(c * 0.35 + ctx.time * 5 * ctx.speed) * Math.cos(c * 0.15 - ctx.time * 3 * ctx.speed);
      const normalizedHeight = 0.2 + 0.8 * (0.5 + 0.5 * waveVal);
      const targetRows = Math.round(normalizedHeight * ctx.rows);
      for (let r = 0; r < ctx.rows; r++) {
        const rowFromBottom = ctx.rows - 1 - r;
        const b = rowFromBottom < targetRows ? 1.0 : 0.0;
        const idx = r * ctx.columns + c;
        const prevB = cache[idx];
        if (Math.abs(b - prevB) > 0.015) {
          cache[idx] = b;
          ctx.elements[idx].style.setProperty('--dot-brightness', b.toFixed(3));
        }
      }
    }
  }
};

export const audioPlugin: AnimationPlugin = {
  name: "audio",
  update: (ctx) => {
    if (!ctx.audioAnalyser) {
      equalizerPlugin.update(ctx);
      return;
    }
    const bufferLength = ctx.audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    ctx.audioAnalyser.getByteFrequencyData(dataArray);
    const binsPerColumn = Math.max(1, Math.floor(bufferLength / ctx.columns));
    const cache = ctx.brightnessCache;

    for (let c = 0; c < ctx.columns; c++) {
      let sum = 0;
      const startBin = c * binsPerColumn;
      for (let b = 0; b < binsPerColumn; b++) {
        sum += dataArray[startBin + b] || 0;
      }
      const averageFrequency = sum / binsPerColumn;
      const normalizedHeight = averageFrequency / 255;
      const activeRows = Math.round(normalizedHeight * ctx.rows);
      for (let r = 0; r < ctx.rows; r++) {
        const rowFromBottom = ctx.rows - 1 - r;
        const b = rowFromBottom < activeRows ? 1.0 : 0.0;
        const idx = r * ctx.columns + c;
        const prevB = cache[idx];
        if (Math.abs(b - prevB) > 0.015) {
          cache[idx] = b;
          ctx.elements[idx].style.setProperty('--dot-brightness', b.toFixed(3));
        }
      }
    }
  }
};

export const ANIMATION_PLUGINS: Record<string, AnimationPlugin> = {
  wave: wavePlugin,
  noise: noisePlugin,
  sparkle: sparklePlugin,
  ripple: ripplePlugin,
  snake: snakePlugin,
  rain: rainPlugin,
  text: textPlugin,
  "scroll-text": scrollTextPlugin,
  clock: clockPlugin,
  equalizer: equalizerPlugin,
  audio: audioPlugin,
};

// ─── 5. INDIVIDUAL LED DOT COMPONENT ───

interface DotProps {
  size: number;
  borderRadius: string;
  color: string;
  inactiveColor: string;
  glow: boolean;
  blur: number;
}

export const Dot: React.FC<DotProps> = React.memo(({
  size,
  borderRadius,
  color,
  inactiveColor,
  glow,
  blur
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: inactiveColor,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: color,
          opacity: 'var(--dot-brightness, 0)',
          boxShadow: glow 
            ? `0 0 ${blur}px ${color}` 
            : 'none',
          willChange: 'opacity',
        }}
      />
    </div>
  );
}, (prev, next) => {
  return (
    prev.size === next.size &&
    prev.borderRadius === next.borderRadius &&
    prev.color === next.color &&
    prev.inactiveColor === next.inactiveColor &&
    prev.glow === next.glow &&
    prev.blur === next.blur
  );
});

Dot.displayName = 'Dot';

// ─── 6. MASTER DOT MATRIX COMPONENT ───

export const DotMatrix: React.FC<DotMatrixProps> = ({
  rows = 12,
  columns = 40,
  dotSize = 16,
  gap = 6,
  borderRadius = '50%',
  color = '#d2eaf4',
  inactiveColor = '#1e1e24',
  animation = 'wave',
  text = 'KINETIC',
  speed = 1,
  fps = 45,
  loop = true,
  delay = 0,
  glow = true,
  blur = 12,
  noiseScale = 0.15,
  seed = 42,
  pattern,
  patternB,
  morphProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  const lastAnimationRef = useRef<string | null>(null);

  // Active state checking via Intersection Observer (pauses animations when off-screen)
  const [isVisible, setIsVisible] = useState(true);

  // High-performance Float32Array cache to completely bypass slow DOM read/get-attribute operations
  const brightnessCacheRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const displayRows = animation === 'clock' ? Math.max(rows, 9) : rows;
  const displayCols = animation === 'clock' ? Math.max(columns, 48) : columns;

  const pluginStateRef = useRef<Record<string, any>>({});

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }
    audioAnalyserRef.current = null;
  };

  useEffect(() => {
    if (animation !== 'audio') {
      cleanupAudio();
      return;
    }
    let active = true;

    async function initAudioDevice() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        audioStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        audioContextRef.current = ctx;
        audioAnalyserRef.current = analyser;
      } catch (err) {
        console.warn('Audio input blocked or unavailable. Equalizer fallback activated.', err);
      }
    }

    initAudioDevice();

    return () => {
      active = false;
      cleanupAudio();
    };
  }, [animation]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  useRAF(
    (time, deltaTime) => {
      const elements = elementsRef.current;
      const totalDots = displayRows * displayCols;
      if (!elements || elements.length < totalDots) return;

      const activePlugin = ANIMATION_PLUGINS[animation];

      // Initialize or scale cache to match grid size
      if (!brightnessCacheRef.current || brightnessCacheRef.current.length !== totalDots) {
        brightnessCacheRef.current = new Float32Array(totalDots);
      }

      pluginStateRef.current.noiseScale = noiseScale;
      pluginStateRef.current.seed = seed;
      pluginStateRef.current.glow = glow;
      pluginStateRef.current.blur = blur;
      pluginStateRef.current.delay = delay;
      pluginStateRef.current.loop = loop;

      const ctx: AnimationContext = {
        elements,
        rows: displayRows,
        columns: displayCols,
        time,
        deltaTime,
        color,
        inactiveColor,
        speed,
        text,
        audioAnalyser: audioAnalyserRef.current,
        options: pluginStateRef.current,
        brightnessCache: brightnessCacheRef.current,
      };

      if (lastAnimationRef.current !== animation) {
        const prevPlugin = lastAnimationRef.current ? ANIMATION_PLUGINS[lastAnimationRef.current] : null;
        if (prevPlugin?.cleanup) {
          prevPlugin.cleanup(ctx);
        }
        
        const keysToKeep = ['noiseScale', 'seed', 'glow', 'blur', 'delay', 'loop'];
        Object.keys(pluginStateRef.current).forEach((key) => {
          if (!keysToKeep.includes(key)) {
            delete pluginStateRef.current[key];
          }
        });

        // Clear local memory cache
        if (brightnessCacheRef.current) {
          brightnessCacheRef.current.fill(0);
        }

        for (let i = 0; i < elements.length; i++) {
          if (elements[i]) {
            elements[i].style.setProperty('--dot-brightness', '0');
          }
        }
        lastAnimationRef.current = animation;
        if (activePlugin?.init) {
          activePlugin.init(ctx);
        }
      }

      if (activePlugin) {
        activePlugin.update(ctx);
      }

      if (pattern) {
        const pRows = pattern.length;
        const pCols = pattern[0]?.length || 0;
        const cache = brightnessCacheRef.current;

        for (let i = 0; i < elements.length; i++) {
          const r = Math.floor(i / displayCols);
          const c = i % displayCols;
          if (r < pRows && c < pCols) {
            const valA = pattern[r][c];
            const valB = patternB && r < patternB.length && c < patternB[r].length ? patternB[r][c] : valA;
            const b = valA + (valB - valA) * morphProgress;
            if (cache) {
              cache[i] = b;
            }
            elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
          }
        }
      }
    },
    isVisible,
    fps
  );

  const dotsArray = Array.from({ length: displayRows * displayCols });

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`LED Dot Matrix display running the ${animation} animation`}
      className="inline-grid select-none outline-none p-4 rounded-3xl bg-neutral-950/40 border border-neutral-900 shadow-inner"
      style={{
        gridTemplateColumns: `repeat(${displayCols}, ${dotSize}px)`,
        gap: `${gap}px`,
      }}
      tabIndex={0}
    >
      {dotsArray.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) elementsRef.current[i] = el;
          }}
        >
          <Dot
            size={dotSize}
            borderRadius={borderRadius}
            color={color}
            inactiveColor={inactiveColor}
            glow={glow}
            blur={blur}
          />
        </div>
      ))}
    </div>
  );
};

export default DotMatrix;
