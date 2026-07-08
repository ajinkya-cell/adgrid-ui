"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useTransform } from "framer-motion";
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
  let tappedShadow = "inset 0 4px 8px rgba(0,0,0,0.7), 0 1px 1px rgba(0,0,0,0.2)";

  if (variant === "classic-gold") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#ffe066] via-[#f39c12] to-[#ffffff]";
    activeText = activeTextClass || "text-black";
  } else if (variant === "ambient") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#161619] via-[#2d2d35] to-[#161619]";
    activeText = activeTextClass || "text-white/95";
  } else if (variant === "neon-edge") {
    activeGrad = "bg-transparent";
    activeText = "text-white/95";
  } else if (variant === "metallic-sheen") {
    baseStyleClass = "bg-gradient-to-b from-[#27272a] to-[#18181b] border-white/10 text-white/90";
    activeGrad = "bg-gradient-to-b from-[#3f3f46] to-[#27272a]";
    activeText = "text-white";
    defaultShadow = "inset 0 1.5px 0 rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.4)";
    tappedShadow = "inset 0 4px 8px rgba(0,0,0,0.7), 0 1px 1px rgba(0,0,0,0.2)";
  } else if (variant === "glassmorphic") {
    baseStyleClass = "bg-white/5 border-white/10 backdrop-blur-md text-white/80";
    activeGrad = "bg-white/15";
    activeText = "text-white";
    defaultShadow = "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)";
    tappedShadow = "inset 0 4px 12px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.2)";
  } else if (variant === "cyber-laser") {
    baseStyleClass = "bg-[#060608] border-neutral-900 text-neutral-400";
    activeGrad = "bg-[#0c0c10]";
    activeText = "text-[#ff5500]";
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
        "relative w-full h-12 border font-mono text-xs tracking-wider cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300 flex items-center justify-center rounded-[inherit]",
        baseStyleClass,
        className
      )}
      style={{
        boxShadow: defaultShadow,
      }}
      {...(props as any)}
    >
      {/* Dynamic Conic Specular Sheen (Anisotropic response) */}
      {variant === "metallic-sheen" && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay rounded-[inherit]"
          style={{
            backgroundImage: "conic-gradient(from 0deg at 50% 50%, #000 0%, #52525b 25%, #000 50%, #52525b 75%, #000 100%)",
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {/* Dynamic Neon Edge Border Overlay */}
      {variant === "neon-edge" && (
        <motion.div
          className="absolute inset-0 border border-white/50 pointer-events-none rounded-[inherit]"
          style={{
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {/* Cyber Sweep Laser Cursor Line */}
      {variant === "cyber-laser" && isHovered && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#ff5500] to-transparent shadow-[0_0_8px_#ff4400]"
        />
      )}

      {/* Active Reveal Background Layer (Radial mask overlay) */}
      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none rounded-[inherit]",
          activeGrad
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          WebkitMaskImage: maskTemplate,
          maskImage: maskTemplate,
        }}
      />

      {/* Centered Single Text Label */}
      <span className={cn(
        "relative z-10 transition-colors duration-300 font-medium",
        isHovered ? activeText : "text-white/70"
      )}>
        {children}
      </span>
    </motion.button>
  );
}

export interface MechanicalTimerProps {
  className?: string;
  rimColor?: string;
  defaultDuration?: number;
}

export function MechanicalTimer({
  className = "",
  rimColor = "#a78bfa",
  defaultDuration = 30,
}: MechanicalTimerProps) {
  const [duration, setDuration] = useState(defaultDuration); // Default 30s
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 1000); // in ms
  const [isRunning, setIsRunning] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Precision time monitoring refs
  const lastTime = useRef<number | null>(null);
  const animFrame = useRef<number | null>(null);
  const lastSecondsInt = useRef(defaultDuration);

  // Rotation angles for mechanical feedback
  const dialAngle = useMotionValue((defaultDuration / 60) * 360); // 30s = 180deg (6deg per sec)
  const springDialAngle = useSpring(dialAngle, { stiffness: 100, damping: 18 });

  // Sync duration with defaultDuration changes
  useEffect(() => {
    setDuration(defaultDuration);
    if (!isRunning) {
      setTimeRemaining(defaultDuration * 1000);
      dialAngle.set((defaultDuration / 60) * 360);
      lastSecondsInt.current = defaultDuration;
    }
  }, [defaultDuration, isRunning, dialAngle]);

  // 3D Tilt Card Coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(mouseY, (y) => {
    if (!containerRef.current) return 0;
    const height = containerRef.current.offsetHeight || 450;
    return -((y / height) - 0.5) * 12; // 6 degrees max
  }), { stiffness: 120, damping: 20 });
  const tiltY = useSpring(useTransform(mouseX, (x) => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.offsetWidth || 340;
    return ((x / width) - 0.5) * 12; // 6 degrees max
  }), { stiffness: 120, damping: 20 });

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

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
    <motion.div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className={cn(
        "relative w-full max-w-[340px] p-6 rounded-3xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 flex flex-col items-center gap-6",
        className
      )}
      style={{
        backgroundColor: "#1a1a1e", // Charcoal Space Gray Matte Finish
        boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)",
        rotateX: tiltX,
        rotateY: tiltY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
    >
      
      {/* Decorative Technical Label Header */}
      <div className="w-full flex items-center justify-between px-1" style={{ transform: "translateZ(15px)" }}>
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/45 flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-white/40" /> Winding Timer
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
          Void Engine
        </span>
      </div>

      {/* Main Dial Housing Assembly */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center" style={{ transform: "translateZ(35px)" }}>
        
        {/* Deep bezel housing well shadow */}
        <div className="absolute inset-4 rounded-full shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),_0_2px_4px_rgba(255,255,255,0.03)] bg-[#09090c] pointer-events-none" />

        {/* Circular Progress LED Ring (glowing lavender) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r="126"
            fill="none"
            stroke="#0a0a0c"
            strokeWidth="3.5"
          />
          {timeRemaining > 0 && (
            <circle
              cx="150"
              cy="150"
              r="126"
              fill="none"
              stroke={rimColor} // Dynamic color prop
              strokeWidth="3.5"
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${rimColor})`,
                transition: isDragging.current ? "none" : "stroke-dashoffset 0.1s linear",
              }}
            />
          )}
        </svg>

        {/* Minimal CD-style Rotating Dial */}
        <motion.div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ rotate: isRunning || isDragging.current ? dialAngle : springDialAngle }}
          className="relative w-[78%] h-[78%] rounded-full border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_15px_35px_rgba(0,0,0,0.85),inset_0_1.5px_0_rgba(255,255,255,0.2),inset_0_-1.5px_0_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden z-20"
        >
          {/* Subtle Anisotropic holographic CD Reflection */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              backgroundImage:
                "conic-gradient(from 0deg, rgba(200,200,200,0.18) 0%, rgba(167,139,250,0.2) 15%, rgba(200,200,200,0.18) 30%, rgba(139,92,246,0.2) 45%, rgba(200,200,200,0.18) 60%, rgba(167,139,250,0.2) 75%, rgba(200,200,200,0.18) 90%, rgba(139,92,246,0.2) 100%)",
            }}
          />
          
          {/* Base silver metal backing for CD look */}
          <div className="absolute inset-0 bg-[#16161a]/70 pointer-events-none rounded-full" />

          {/* CD concentric track groove lines (multiple tracks in between) */}
          {[5, 10, 15, 20, 25, 30, 35, 40].map((percentage) => (
            <div
              key={percentage}
              className="absolute rounded-full border border-white/[0.035] pointer-events-none"
              style={{ inset: `${percentage}%` }}
            />
          ))}

          {/* Minimal Single Lavender Track Pointer Dot (with 3D shadow) */}
          <div
            className="absolute top-4.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full pointer-events-none z-35"
            style={{
              backgroundColor: rimColor,
              boxShadow: `0 2px 4px rgba(0,0,0,0.8), 0 0 8px ${rimColor}`
            }}
          />

          {/* Clear CD central spacer ring */}
          <div className="absolute w-14 h-14 rounded-full bg-white/[0.02] border-t border-white/20 border-b border-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none z-30">
            {/* Inner metal center cap */}
            <div className="w-5 h-5 rounded-full bg-[#0a0a0c] border border-white/5 shadow-md" />
          </div>
        </motion.div>
      </div>

      {/* Floating Display Chassis (bezel-inset space-gray) */}
      <div className="w-full bg-[#09090b] border border-white/[0.05] rounded-2xl p-4 flex flex-col items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)]" style={{ transform: "translateZ(20px)" }}>
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/40 mb-1.5">STOPWATCH</span>
        <div
          className="font-mono text-3xl font-semibold tracking-wider text-white select-none transition-all duration-100"
          style={{
            textShadow: "0 0 10px rgba(255,255,255,0.4)",
          }}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Control Buttons Stacked Layout (Metallic Sheen + Full Rounded) */}
      <div className="w-full flex flex-col gap-3" style={{ transform: "translateZ(10px)" }}>
        
        {/* Primary Start / Stop Winding key */}
        <div className="w-full rounded-full overflow-hidden">
          <VoidButton
            variant="metallic-sheen"
            onClick={isRunning ? handlePause : handleStart}
            className="w-full h-12 text-xs"
          >
            {isRunning ? "Stop" : "Start"}
          </VoidButton>
        </div>

        {/* Secondary controls side-by-side */}
        <div className="w-full flex gap-3">
          <div className="flex-1 rounded-full overflow-hidden">
            <VoidButton
              variant="metallic-sheen"
              onClick={handlePause}
              disabled={!isRunning}
              className="w-full h-11 text-xs disabled:opacity-25"
            >
              Pause
            </VoidButton>
          </div>

          <div className="flex-1 rounded-full overflow-hidden">
            <VoidButton
              variant="metallic-sheen"
              onClick={handleReset}
              className="w-full h-11 text-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </VoidButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
