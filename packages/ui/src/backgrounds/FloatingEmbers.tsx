"use client";

import { useEffect, useRef } from "react";

const MAX_PARTICLES = 400;
const SPAWN_INTERVAL = 150;
const MOUSE_RADIUS = 200;
const MOUSE_FORCE = 0.02;
const SCROLL_DECAY = 0.98;

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  swayPhase: number;
  swayAmp: number;
  hue: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function FloatingEmbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const scrollVelRef = useRef(0);
  const particlesRef = useRef<Ember[]>([]);
  const lastSpawnRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handleMq = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handleMq);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = () => {
      if (particlesRef.current.length >= MAX_PARTICLES) return;
      particlesRef.current.push({
        x: rand(0, canvas.width),
        y: canvas.height + rand(0, 20),
        vx: rand(-0.08, 0.08),
        vy: rand(-1.8, -0.6),
        size: rand(1.5, 3.5),
        life: 0,
        maxLife: rand(5000, 9000),
        swayPhase: rand(0, Math.PI * 2),
        swayAmp: rand(0.15, 0.5),
        hue: rand(25, 45),
      });
    };

    const gradCache = new Map<number, CanvasGradient>();

    const getGlow = (size: number) => {
      const r = Math.round(size * 10) / 10;
      if (!gradCache.has(r)) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 4);
        g.addColorStop(0, "rgba(255,235,200,1)");
        g.addColorStop(0.1, "rgba(255,200,120,0.7)");
        g.addColorStop(0.4, "rgba(255,150,50,0.25)");
        g.addColorStop(1, "rgba(200,80,20,0)");
        gradCache.set(r, g);
      }
      return gradCache.get(r)!;
    };

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (reducedMotionRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (timestamp - lastSpawnRef.current >= SPAWN_INTERVAL) {
        lastSpawnRef.current = timestamp;
        spawn();
      }

      const { x: mx, y: my } = mouseRef.current;
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 16;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;

        const sway = Math.sin(p.life * 0.003 + p.swayPhase) * p.swayAmp;
        p.x += p.vx + sway + scrollVelRef.current;
        p.y += p.vy;

        scrollVelRef.current *= SCROLL_DECAY;

        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        if (p.y < -20 || p.x < -50 || p.x > canvas.width + 50) {
          particles.splice(i, 1);
          continue;
        }

        let opacity = 0;
        if (lifeRatio < 0.15) {
          opacity = lifeRatio / 0.15;
        } else if (lifeRatio < 0.7) {
          opacity = 1;
        } else {
          opacity = 1 - (lifeRatio - 0.7) / 0.3;
        }

        const alpha = opacity * 0.7;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = getGlow(p.size);
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = `hsl(${p.hue}, 100%, ${55 + lifeRatio * 20}%)`;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dt = now - lastScrollTime;
      if (dt > 0) {
        const dy = window.scrollY - lastScrollY;
        scrollVelRef.current =
          scrollVelRef.current * 0.9 + (dy / dt) * 0.002;
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", resize);
      mq.removeEventListener("change", handleMq);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "#000" }}
    />
  );
}
