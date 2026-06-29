"use client";

import { AnimationContext, AnimationPlugin } from '../types';
import { noise2D } from '../utils/noise';
import { textToBitmap, fitBitmapToGrid } from '../utils/bitmap';

// Helper to decay existing dot brightness smoothly using high-speed array cache
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

// ─── 1. WAVE PLUGIN ───
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
      
      // Dynamic write gate: only write to DOM if brightness shift is noticeable
      if (Math.abs(b - prevB) > 0.015) {
        cache[i] = b;
        ctx.elements[i].style.setProperty('--dot-brightness', b.toFixed(3));
      }
    }
  }
};

// ─── 2. NOISE PLUGIN ───
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

// ─── 3. SPARKLE PLUGIN ───
export const sparklePlugin: AnimationPlugin = {
  name: "sparkle",
  update: (ctx) => {
    decayBrightness(ctx, 0.88); // Decay past sparkles
    
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

// ─── 4. RIPPLE PLUGIN ───
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
    const elapsed = (ctx.time - (ctx.options.rippleStart || 0));
    
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

// ─── 5. SNAKE PLUGIN ───
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

      const headIdx = body[0];
      let headR = Math.floor(headIdx / ctx.columns);
      let headC = headIdx % ctx.columns;

      if (Math.random() < 0.2) {
        const dirs: [number, number][] = [[1,0], [-1,0], [0,1], [0,-1]];
        const allowedDirs = dirs.filter(([dc, dr]) => !(dc === -dir[0] && dr === -dir[1]));
        const nextDir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
        dir = nextDir;
        ctx.options.snakeDir = dir;
      }

      let nextC = headC + dir[0];
      let nextR = headR + dir[1];

      if (nextC < 0 || nextC >= ctx.columns || nextR < 0 || nextR >= ctx.rows) {
        const dirs: [number, number][] = [[1,0], [-1,0], [0,1], [0,-1]];
        const validDirs = dirs.filter(([dc, dr]) => {
          const tc = headC + dc;
          const tr = headR + dr;
          return tc >= 0 && tc < ctx.columns && tr >= 0 && tr < ctx.rows;
        });
        
        if (validDirs.length > 0) {
          dir = validDirs[Math.floor(Math.random() * validDirs.length)];
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

// ─── 6. RAIN PLUGIN ───
export const rainPlugin: AnimationPlugin = {
  name: "rain",
  init: (ctx) => {
    ctx.options.rainDrops = Array.from({ length: ctx.columns }, () => {
      return -Math.random() * ctx.rows * 2;
    });
  },
  update: (ctx) => {
    decayBrightness(ctx, 0.82);

    const drops = ctx.options.rainDrops as number[];
    const fallSpeed = 16 * ctx.speed;
    const cache = ctx.brightnessCache;

    if (drops) {
      for (let c = 0; c < ctx.columns; c++) {
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

// ─── 7. TEXT PLUGIN ───
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

// ─── 8. SCROLL TEXT PLUGIN ───
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

// ─── 9. CLOCK PLUGIN ───
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

// ─── 10. EQUALIZER PLUGIN ───
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

// ─── 11. AUDIO PLUGIN ───
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

// Plugins Register Dictionary
export const pluginsList = [
  wavePlugin,
  noisePlugin,
  sparklePlugin,
  ripplePlugin,
  snakePlugin,
  rainPlugin,
  textPlugin,
  scrollTextPlugin,
  clockPlugin,
  equalizerPlugin,
  audioPlugin
];
export default pluginsList;
