"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { RefreshCw, CheckCircle } from "lucide-react";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// Inlined VoidButton component with 3D tactile clicks and layout variants
export interface VoidButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "ambient" | "neon-edge" | "metallic-sheen" | "glassmorphic" | "cyber-laser" | "classic-gold";
  activeGradientClass?: string;
  activeTextClass?: string;
}

export function VoidButton({
  className,
  children,
  variant = "ambient",
  activeGradientClass,
  activeTextClass,
  ...props
}: VoidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const maskTemplate = useMotionTemplate`radial-gradient(circle 80px at ${springX}px ${springY}px, black 30%, transparent 100%)`;

  let baseStyleClass = "bg-[#07070a] border-neutral-900 text-white/70";
  let activeGrad = activeGradientClass || "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800";
  let activeText = activeTextClass || "text-white font-bold";
  let defaultShadow = "inset 0 3px 8px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(255,255,255,0.03), 0 2px 4px rgba(0,0,0,0.4)";
  let tappedShadow = "inset 0 8px 24px rgba(0,0,0,0.95), 0 1px 1px rgba(0,0,0,0.8)";

  if (variant === "classic-gold") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#ffe066] via-[#f39c12] to-[#ffffff]";
    activeText = activeTextClass || "text-black font-black";
  } else if (variant === "ambient") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#161619] via-[#2d2d35] to-[#161619]";
    activeText = activeTextClass || "text-white/95 font-semibold";
  } else if (variant === "neon-edge") {
    activeGrad = "bg-transparent";
    activeText = "text-white/95 font-bold";
  } else if (variant === "metallic-sheen") {
    activeGrad = "bg-transparent";
    activeText = "text-white font-bold";
  } else if (variant === "glassmorphic") {
    baseStyleClass = "bg-white/5 border-white/10 backdrop-blur-md text-white/80";
    activeGrad = "bg-white/15";
    activeText = "text-white font-black";
    defaultShadow = "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)";
    tappedShadow = "inset 0 4px 12px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.2)";
  } else if (variant === "cyber-laser") {
    baseStyleClass = "bg-[#060608] border-neutral-900 text-neutral-400";
    activeGrad = "bg-[#0c0c10]";
    activeText = "text-[#ff5500] font-black";
  }

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{
        scale: 0.95,
        y: 2,
        boxShadow: tappedShadow,
      }}
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
      className={cn(
        "relative w-full h-12 rounded-xl border font-mono text-xs uppercase tracking-widest cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300 flex items-center justify-center",
        baseStyleClass,
        className
      )}
      style={{
        boxShadow: defaultShadow,
      }}
      {...(props as any)}
    >
      <span className="absolute inset-0 flex items-center justify-center font-medium transition-opacity duration-300">
        {children || "THE VOID"}
      </span>

      {variant === "metallic-sheen" && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: "conic-gradient(from 0deg at 50% 50%, #000 0%, #52525b 25%, #000 50%, #52525b 75%, #000 100%)",
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {variant === "neon-edge" && (
        <motion.div
          className="absolute inset-0 border border-white/50 rounded-xl pointer-events-none"
          style={{
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {variant === "cyber-laser" && isHovered && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#ff5500] to-transparent shadow-[0_0_8px_#ff4400]"
        />
      )}

      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none flex items-center justify-center",
          activeGrad
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          WebkitMaskImage: maskTemplate,
          maskImage: maskTemplate,
        }}
      >
        <span className={cn(activeText)}>
          {children || "THE VOID"}
        </span>
      </motion.div>
    </motion.button>
  );
}

interface Point {
  x: number;
  y: number;
  size: number;
}

interface Stroke {
  id: string;
  points: Point[];
  type: "free" | "circle" | "line";
  circleData?: { cx: number; cy: number; r: number };
  lineData?: { x1: number; y1: number; x2: number; y2: number };
}

export function LiquidMercuryPad({ className = "" }: { className?: string }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; active: boolean } | null>(null);
  
  const padRef = useRef<HTMLDivElement>(null);
  const lastPointRef = useRef<Point | null>(null);

  // Clear all strokes
  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    playSound("tock");
  };

  // Sound feedback
  const playSound = (type: "tick" | "tock" | "ripple") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.01);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
      } else if (type === "tock") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      } else if (type === "ripple") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    setIsDrawing(true);
    playSound("tick");

    const rect = padRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const startPoint = { x, y, size: 22 };
    setCurrentStroke([startPoint]);
    lastPointRef.current = startPoint;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !padRef.current || !lastPointRef.current) return;

    const rect = padRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - lastPointRef.current.x;
    const dy = y - lastPointRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate dynamic stroke thickness based on pointer velocity
    const targetSize = Math.max(10, Math.min(30, 240 / (dist + 6)));

    const newPoint = { x, y, size: targetSize };
    setCurrentStroke((prev) => [...prev, newPoint]);
    lastPointRef.current = newPoint;
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 3) {
      const strokeId = `stroke-${Date.now()}`;
      const newStroke: Stroke = {
        id: strokeId,
        points: currentStroke,
        type: "free",
      };

      setStrokes((prev) => [...prev, newStroke]);
    }

    setCurrentStroke([]);
    lastPointRef.current = null;
    playSound("tock");
  };

  // Shape Analysis Engine
  const handleAnalyze = () => {
    if (strokes.length === 0) return;
    playSound("tick");

    setStrokes((prevStrokes) =>
      prevStrokes.map((stroke) => {
        if (stroke.type !== "free" || stroke.points.length < 10) return stroke;

        const pts = stroke.points;
        const start = pts[0];
        const end = pts[pts.length - 1];
        
        const startEndDist = Math.sqrt(
          Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)
        );

        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const width = maxX - minX;
        const height = maxY - minY;

        // 1. Circle Snapping Check
        if (startEndDist < 48 && width > 40 && height > 40) {
          const cx = minX + width / 2;
          const cy = minY + height / 2;
          const r = (width + height) / 4;

          let totalDev = 0;
          pts.forEach((p) => {
            const d = Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
            totalDev += Math.abs(d - r);
          });
          const avgDev = totalDev / pts.length;

          if (avgDev < r * 0.22) {
            playSound("ripple");
            return {
              ...stroke,
              type: "circle",
              circleData: { cx, cy, r },
            };
          }
        }

        // 2. Line Snapping Check
        const xMean = xs.reduce((a, b) => a + b, 0) / pts.length;
        const yMean = ys.reduce((a, b) => a + b, 0) / pts.length;
        let num = 0;
        let den = 0;
        for (let i = 0; i < pts.length; i++) {
          num += (pts[i].x - xMean) * (pts[i].y - yMean);
          den += Math.pow(pts[i].x - xMean, 2);
        }
        const slope = den === 0 ? 0 : num / den;
        const intercept = yMean - slope * xMean;

        let error = 0;
        pts.forEach((p) => {
          const expectedY = slope * p.x + intercept;
          error += Math.abs(p.y - expectedY);
        });
        const avgError = error / pts.length;

        if (avgError < 8) {
          playSound("ripple");
          return {
            ...stroke,
            type: "line",
            lineData: {
              x1: start.x,
              y1: start.y,
              x2: end.x,
              y2: end.y,
            },
          };
        }

        return stroke;
      })
    );
  };

  const handleExport = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipple({ x, y, active: true });
    playSound("ripple");

    setTimeout(() => {
      setRipple(null);
    }, 1000);
  };

  return (
    <div className={cn("w-full max-w-xl p-6 rounded-3xl bg-[#0a0a0d] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col gap-5", className)}>
      
      {/* Decorative SVG Filters */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="mercury-chrome-liquid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 24 -11"
              result="gooey"
            />
            <feSpecularLighting
              in="gooey"
              specularExponent="45"
              lightingColor="#ffffff"
              surfaceScale="4.5"
              result="specular"
            >
              <feDistantLight azimuth="220" elevation="55" />
            </feSpecularLighting>
            <feComposite in="specular" in2="gooey" operator="in" result="specular-composite" />
            <feComposite
              in="gooey"
              in2="specular-composite"
              operator="arithmetic"
              k2="0.65"
              k3="0.55"
              result="chrome-result"
            />
          </filter>
        </defs>
      </svg>

      {/* Main Drawing Array Board */}
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleExport}
        className="w-full h-[320px] rounded-2xl bg-[#050508] border border-neutral-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] relative overflow-hidden cursor-crosshair touch-none select-none"
      >
        {/* Under-grid grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        {/* Specular Liquid Canvas layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: "url(#mercury-chrome-liquid)" }}
        >
          <svg className="w-full h-full">
            {strokes.map((stroke) => {
              if (stroke.type === "circle" && stroke.circleData) {
                const { cx, cy, r } = stroke.circleData;
                return (
                  <motion.circle
                    key={stroke.id}
                    cx={cx}
                    cy={cy}
                    initial={{ r: 0 }}
                    animate={{ r }}
                    transition={{ type: "spring", stiffness: 80, damping: 12 }}
                    fill="none"
                    stroke="#cccccc"
                    strokeWidth="18"
                  />
                );
              }
              if (stroke.type === "line" && stroke.lineData) {
                const { x1, y1, x2, y2 } = stroke.lineData;
                return (
                  <motion.line
                    key={stroke.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4 }}
                    stroke="#cccccc"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                );
              }

              return (
                <g key={stroke.id}>
                  {stroke.points.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.size}
                      fill="#cccccc"
                    />
                  ))}
                  {stroke.points.map((pt, i) => {
                    if (i === 0) return null;
                    const prev = stroke.points[i - 1];
                    return (
                      <line
                        key={`l-${i}`}
                        x1={prev.x}
                        y1={prev.y}
                        x2={pt.x}
                        y2={pt.y}
                        stroke="#cccccc"
                        strokeWidth={(prev.size + pt.size) / 1.1}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>
              );
            })}

            {currentStroke.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={pt.size} fill="#cccccc" />
            ))}
            {currentStroke.map((pt, i) => {
              if (i === 0) return null;
              const prev = currentStroke[i - 1];
              return (
                <line
                  key={`cl-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={pt.x}
                  y2={pt.y}
                  stroke="#cccccc"
                  strokeWidth={(prev.size + pt.size) / 1.1}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>

        {/* Specular Click Ripple wave effect */}
        <AnimatePresence>
          {ripple && ripple.active && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 3.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-20 h-20 rounded-full border-2 border-white pointer-events-none"
              style={{
                left: ripple.x - 40,
                top: ripple.y - 40,
                boxShadow: "0 0 20px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.2)",
              }}
            />
          )}
        </AnimatePresence>

        {strokes.length === 0 && currentStroke.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 animate-pulse">
              DRAW SIGNATURE / GESTURE OR SHAPES
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons Footer (Using refined ambient clicky buttons) */}
      <div className="w-full flex gap-3">
        <VoidButton
          variant="ambient"
          onClick={handleAnalyze}
          disabled={strokes.length === 0}
          activeGradientClass="bg-gradient-to-r from-neutral-200 via-white to-neutral-200"
          activeTextClass="text-black font-black"
          className="flex-1 h-11 border-neutral-800/80 rounded-xl text-xs tracking-widest font-bold disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" /> Analyze & Snap
          </div>
        </VoidButton>

        <VoidButton
          variant="ambient"
          onClick={handleClear}
          disabled={strokes.length === 0}
          activeGradientClass="bg-gradient-to-r from-[#ffd369] via-[#f39c12] to-[#ffffff]"
          activeTextClass="text-black font-black"
          className="flex-1 h-11 border-neutral-800/80 rounded-xl text-[10px] tracking-wider disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Clear Pad
          </div>
        </VoidButton>
      </div>
    </div>
  );
}
