"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { RotateCcw, Compass } from "lucide-react";

// Simple local class merger utility to keep the component 100% self-contained
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// Web Audio sound synthesizer with zero external assets dependency
const playSound = (type: "tick" | "tock" | "alarm") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.012);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.015);
    } else if (type === "tock") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.018);
    } else if (type === "alarm") {
      const freqs = [850, 1075, 1320, 1600];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      });
    }
  } catch (err) {
    // Fail silently
  }
};

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
        "relative w-full h-12 rounded-xl border font-syncopate text-[9px] uppercase tracking-[0.2em] font-bold cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300 flex items-center justify-center",
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

export function MechanicalTimer({ className = "" }: { className?: string }) {
  const [duration, setDuration] = useState(30); // Default 30s
  const [timeRemaining, setTimeRemaining] = useState(30000); // in ms
  const [isRunning, setIsRunning] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Precision time monitoring refs
  const lastTime = useRef<number | null>(null);
  const animFrame = useRef<number | null>(null);
  const lastSecondsInt = useRef(30);

  // Rotation angles for mechanical feedback
  const dialAngle = useMotionValue(180); // 30s = 180deg (6deg per sec)
  const springDialAngle = useSpring(dialAngle, { stiffness: 100, damping: 18 });

  // Set stopwatch duration from absolute rotation degree
  const updateDurationFromAngle = (deg: number) => {
    const clampedDeg = Math.min(359, Math.max(0, deg));
    const seconds = Math.round((clampedDeg / 360) * 60);
    const finalSeconds = Math.max(1, seconds); // min 1 sec duration

    setDuration(finalSeconds);
    if (!isRunning) {
      setTimeRemaining(finalSeconds * 1000);
      lastSecondsInt.current = finalSeconds;
    }
    dialAngle.set((finalSeconds / 60) * 360);
  };

  // Dial drag tracking pointer handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isRunning) return;
    isDragging.current = true;
    dialRef.current?.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI + 90; // offset straight up
    if (angleDeg < 0) angleDeg += 360;

    const snapSeconds = Math.round((angleDeg / 360) * 60);

    if (snapSeconds !== lastSecondsInt.current) {
      playSound("tick");
      lastSecondsInt.current = snapSeconds;
    }

    updateDurationFromAngle(angleDeg);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      dialRef.current?.releasePointerCapture(e.pointerId);
      isDragging.current = false;
    }
  };

  // Core countdown frame loop
  const updateFrame = useCallback(
    (now: number) => {
      if (!lastTime.current) {
        lastTime.current = now;
        animFrame.current = requestAnimationFrame(updateFrame);
        return;
      }

      const elapsed = now - lastTime.current;
      lastTime.current = now;

      setTimeRemaining((prev) => {
        const next = prev - elapsed;
        if (next <= 0) {
          setIsRunning(false);
          playSound("alarm");
          setTimeout(() => playSound("alarm"), 180);
          setTimeout(() => playSound("alarm"), 360);
          dialAngle.set(0);
          return 0;
        }

        const prevSecs = Math.ceil(prev / 1000);
        const nextSecs = Math.ceil(next / 1000);
        if (prevSecs !== nextSecs) {
          playSound(nextSecs % 2 === 0 ? "tick" : "tock");
        }

        dialAngle.set((next / 60000) * 360);

        return next;
      });

      animFrame.current = requestAnimationFrame(updateFrame);
    },
    [dialAngle]
  );

  useEffect(() => {
    if (isRunning) {
      lastTime.current = null;
      animFrame.current = requestAnimationFrame(updateFrame);
    } else {
      if (animFrame.current) {
        cancelAnimationFrame(animFrame.current);
      }
    }
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [isRunning, updateFrame]);

  const handleStart = () => {
    if (timeRemaining <= 0) {
      setTimeRemaining(duration * 1000);
      dialAngle.set((duration / 60) * 360);
    }
    setIsRunning(true);
    playSound("tick");
  };

  const handlePause = () => {
    setIsRunning(false);
    playSound("tock");
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration * 1000);
    dialAngle.set((duration / 60) * 360);
    playSound("tock");
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const min = Math.floor(totalSecs / 60);
    const sec = totalSecs % 60;
    const centis = Math.floor((ms % 1000) / 10);

    const pad = (num: number) => String(num).padStart(2, "0");
    return `${pad(min)}:${pad(sec)}.${pad(centis)}`;
  };

  const percentComplete = (timeRemaining / (duration * 1000 || 1)) * 100;

  const strokeCircumference = 816.8;
  const strokeOffset = strokeCircumference - (strokeCircumference * percentComplete) / 100;

  return (
    <div className={`w-full max-w-[340px] p-6 rounded-3xl bg-[#0a0a0d] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9),0_30px_60px_-30px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col items-center gap-6 ${className}`}>
      
      {/* Decorative Technical Label Header */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="font-syncopate text-[7px] uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-1.5 animate-pulse">
          <Compass className="w-3 h-3 text-neutral-400" /> Chronometer Mod 3
        </span>
        <span className="font-syncopate text-[7px] uppercase tracking-[0.2em] text-neutral-500 font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
          VOID ENGINE
        </span>
      </div>

      {/* Main Dial Housing Assembly */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        
        {/* Circular Progress LED Ring (Absolute coordinates, zero gaps) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r="130"
            fill="none"
            stroke="#141419"
            strokeWidth="3.5"
          />
          {timeRemaining > 0 && (
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3.5"
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.7))",
                transition: isDragging.current ? "none" : "stroke-dashoffset 0.1s linear",
              }}
            />
          )}
        </svg>

        {/* Internal Procedural Dial Rotator */}
        <motion.div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ rotate: springDialAngle }}
          className="relative w-[84%] h-[84%] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] cursor-grab active:cursor-grabbing flex flex-col items-center justify-start p-4 overflow-hidden z-20"
        >
          {/* Brushed Dial Anisotropic Reflection Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "conic-gradient(from 0deg, #18181b 0%, #2a2a2e 15%, #18181b 30%, #35353b 45%, #18181b 60%, #2a2a2e 75%, #18181b 90%, #35353b 100%)",
            }}
          />

          {/* Tactile indicator line needle */}
          <div className="relative w-1 h-8 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none z-30" />

          {/* Core center pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-[#1b1b20] border border-neutral-700 shadow-md z-30 pointer-events-none" />

          {/* Fine Mechanical Ticks around Dial edge */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-2 -translate-x-1/2 w-0.5 h-2.5 bg-white origin-[center_101px]"
                style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Display Chassis */}
      <div className="w-full bg-[#050508] border border-neutral-900/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[inset_0_4px_16px_rgba(0,0,0,0.9),0_2px_0_rgba(255,255,255,0.02)]">
        <span className="font-syncopate text-[7px] uppercase tracking-[0.2em] text-neutral-600 mb-1.5">STOPWATCH</span>
        <div
          className="font-share-mono text-3xl font-black tracking-widest text-white select-none transition-all duration-100"
          style={{
            textShadow: "0 0 10px rgba(255,255,255,0.6)",
          }}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Control Buttons Stacked Layout (Using new clicky ambient variants) */}
      <div className="w-full flex flex-col gap-3">
        {/* Row 1: Primary Start / Stop Button (Large, full width, ambient silver) */}
        <VoidButton
          variant="ambient"
          onClick={isRunning ? handlePause : handleStart}
          activeGradientClass="bg-gradient-to-r from-neutral-200 via-white to-neutral-200"
          activeTextClass="text-black font-black"
          className="w-full h-12 border-neutral-800/80 rounded-xl text-[9px] tracking-[0.2em] font-bold"
        >
          {isRunning ? "Stop Engine" : "Start Accumulator"}
        </VoidButton>

        {/* Row 2: Secondary Controls (Pause & Reset side-by-side) */}
        <div className="w-full flex gap-3">
          <VoidButton
            variant="ambient"
            onClick={handlePause}
            disabled={!isRunning}
            activeGradientClass="bg-gradient-to-r from-[#ffd369] via-[#f39c12] to-[#ffffff]"
            activeTextClass="text-black font-black"
            className="flex-1 h-11 border-neutral-800/80 rounded-xl text-[9px] tracking-[0.2em] font-bold disabled:opacity-25 disabled:cursor-not-allowed"
          >
            Pause
          </VoidButton>

          <VoidButton
            variant="ambient"
            onClick={handleReset}
            activeGradientClass="bg-gradient-to-r from-[#ff2e63] via-[#ff2e63] to-[#ffd2d2]"
            activeTextClass="text-white font-black"
            className="flex-1 h-11 border-neutral-800/80 rounded-xl text-[9px] tracking-[0.2em] font-bold flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </VoidButton>
        </div>
      </div>
    </div>
  );
}
