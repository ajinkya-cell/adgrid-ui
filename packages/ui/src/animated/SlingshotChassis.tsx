"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sliders, Shield, ChevronRight } from "lucide-react";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// Web Audio sound synthesizer for the rubber-band slingshot tension & snap twang
class SlingshotSynth {
  private ctx: AudioContext | null = null;
  private tensionOsc: OscillatorNode | null = null;
  private tensionGain: GainNode | null = null;

  constructor() {
    if (typeof window === "undefined") return;
  }

  private initCtx() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  // Plays a low hum whose frequency rises slightly as tension increases
  public startTension(tensionPercent: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!this.tensionOsc || !this.tensionGain) {
        this.tensionOsc = this.ctx.createOscillator();
        this.tensionGain = this.ctx.createGain();
        this.tensionOsc.type = "triangle";
        this.tensionGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.tensionOsc.connect(this.tensionGain);
        this.tensionGain.connect(this.ctx.destination);
        this.tensionOsc.start();
      }

      const freq = 60 + tensionPercent * 80; // 60Hz to 140Hz
      const vol = Math.min(0.04, tensionPercent * 0.04);

      this.tensionOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
      this.tensionGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }

  public stopTension() {
    try {
      if (this.tensionGain && this.ctx) {
        this.tensionGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
      setTimeout(() => {
        if (this.tensionOsc) {
          try {
            this.tensionOsc.stop();
            this.tensionOsc.disconnect();
          } catch (e) {}
          this.tensionOsc = null;
          this.tensionGain = null;
        }
      }, 100);
    } catch (e) {}
  }

  // Plays the satisfying slingshot release snap "TWANG" sound
  public playSnap() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";

      // Sweep frequency down rapidly from 1500Hz to 90Hz in 140ms
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);

      // Add a high-frequency impact click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(3000, this.ctx.currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.015);
      clickGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start();
      clickOsc.stop(this.ctx.currentTime + 0.02);
    } catch (e) {}
  }
}

export function SlingshotChassis({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [clientY, setClientY] = useState(190); // default center vertical height
  const synthRef = useRef<SlingshotSynth | null>(null);

  // Physics animation variables
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentDragX = useRef(0);
  const springAnimFrame = useRef<number | null>(null);

  // System parameters
  const [overclock, setOverclock] = useState(50);
  const [redundancy, setRedundancy] = useState(true);
  const [power, setPower] = useState(true);

  // Initialize Audio Synth
  useEffect(() => {
    synthRef.current = new SlingshotSynth();
    return () => {
      synthRef.current?.stopTension();
    };
  }, []);

  // Custom Spring Wobble physics release loop solver
  const runSpringWobble = (initialX: number) => {
    let x = initialX;
    let velocity = 0;
    const stiffness = 280; // spring strength
    const damping = 10;   // friction dampening
    const mass = 1;
    let lastT = performance.now();

    const solve = (now: number) => {
      const dt = Math.min(0.032, (now - lastT) / 1000); // clamp step times
      lastT = now;

      // Spring formula: F = -k * x - c * v
      const springForce = -stiffness * x;
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;

      velocity += acceleration * dt;
      x += velocity * dt;

      setDragX(x);

      // Break loop if rest thresholds are met
      if (Math.abs(x) < 0.15 && Math.abs(velocity) < 0.15) {
        setDragX(0);
        springAnimFrame.current = null;
        return;
      }

      springAnimFrame.current = requestAnimationFrame(solve);
    };

    springAnimFrame.current = requestAnimationFrame(solve);
  };

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (springAnimFrame.current) {
      cancelAnimationFrame(springAnimFrame.current);
    }
    isDragging.current = true;
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);

    // Track local cursor Y position inside the card coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    setClientY(e.clientY - rect.top);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    
    // Allow dragging only outwards (to the right, positive deltaX)
    let currentX = Math.max(0, deltaX);

    // Logarithmic rubber-band drag dampening (prevents dragging infinite bounds)
    const maxDrag = 180;
    if (currentX > 80) {
      const overflow = currentX - 80;
      currentX = 80 + (maxDrag - 80) * (1 - Math.exp(-overflow / 120));
    }

    currentDragX.current = currentX;
    setDragX(currentX);

    const rect = e.currentTarget.getBoundingClientRect();
    setClientY(Math.max(10, Math.min(370, e.clientY - rect.top)));

    // Play/modulate tension sound
    const tensionPercent = currentX / maxDrag;
    synthRef.current?.startTension(tensionPercent);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    synthRef.current?.stopTension();

    // Trigger check (snaps past 95px drag threshold)
    const snapThreshold = 95;
    if (currentDragX.current >= snapThreshold) {
      synthRef.current?.playSnap();
      setIsOpen((prev) => !prev);
    }

    // Release current deformation back to rest with spring jigglings
    runSpringWobble(currentDragX.current);
    currentDragX.current = 0;
  };

  // Dynamic SVG path calculations for the elastic deformation edge
  // Card base dimensions: 320x380
  const baseW = 300;
  const baseH = 380;
  
  // Warp peaking coordinate
  const peakX = baseW + dragX;
  const peakY = clientY;

  // Render elastic path containing 3 straight lines and 1 warped bezier right edge with rounded corners
  const r = 16; // border radius
  const startCurveY = Math.max(r + 10, peakY - 70);
  const endCurveY = Math.min(baseH - r - 10, peakY + 70);

  const elasticPath = `
    M ${r},0 
    L ${baseW - r},0 
    A ${r},${r} 0 0,1 ${baseW},${r} 
    L ${baseW},${startCurveY} 
    Q ${peakX},${peakY} ${baseW},${endCurveY} 
    L ${baseW},${baseH - r} 
    A ${r},${r} 0 0,1 ${baseW - r},${baseH} 
    L ${r},${baseH} 
    A ${r},${r} 0 0,1 0,${baseH - r} 
    L 0,${r} 
    A ${r},${r} 0 0,1 ${r},0 
    Z
  `.trim();

  return (
    <div className={cn("relative w-[300px] h-[380px]", className)}>
      
      {/* Specular chassis outline backdrop shadow */}
      <div className="absolute inset-0 rounded-2xl bg-black/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.95)] pointer-events-none z-0" />

      {/* Behind Layer: Control Telemetry settings drawer panel */}
      <div className="absolute inset-0 bg-[#08080b] border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <Sliders className="w-4 h-4 text-neutral-400" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-300 font-bold">SYSTEM TELEMETRY</span>
          </div>

          {/* Overclock slider control */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-[8px] tracking-wider text-neutral-500">
              <span>CORE FREQ MULTIPLIER</span>
              <span className="text-white font-bold">{overclock}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={overclock}
              onChange={(e) => setOverclock(Number(e.target.value))}
              className="w-full accent-white bg-neutral-900 h-1 rounded cursor-pointer outline-none"
            />
          </div>

          {/* Redundancy switch */}
          <div className="flex items-center justify-between border-t border-neutral-900/60 pt-3">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] tracking-wider text-neutral-300 font-bold">PARALLEL CORE REDUNDANCY</span>
              <span className="text-[7px] text-neutral-600 font-mono mt-0.5">DUAL CHANNEL NODES</span>
            </div>
            <button
              onClick={() => setRedundancy(!redundancy)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                redundancy ? "bg-white" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${
                  redundancy ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Power toggle */}
          <div className="flex items-center justify-between border-t border-neutral-900/60 pt-3">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] tracking-wider text-neutral-300 font-bold">GRID ACCELERATOR POWER</span>
              <span className="text-[7px] text-neutral-600 font-mono mt-0.5">LASER EMISSION SWITCH</span>
            </div>
            <button
              onClick={() => setPower(!power)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                power ? "bg-white" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${
                  power ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="w-full flex items-center justify-between text-[7px] font-mono text-neutral-600 pt-3 border-t border-neutral-900">
          <span>PORTAL ID: #2094-A</span>
          <span className="flex items-center gap-1 font-bold"><Shield className="w-2.5 h-2.5" /> SECURE LINK</span>
        </div>
      </div>

      {/* Front Layer: Sliding / Warpable Card Cover */}
      <motion.div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        animate={{ x: isOpen ? -300 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing select-none"
      >
        {/* Warping SVG container */}
        <svg
          className="absolute inset-0 w-[480px] h-[380px] pointer-events-none drop-shadow-[4px_0_12px_rgba(0,0,0,0.6)]"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="chassis-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#131317" />
              <stop offset="100%" stopColor="#0a0a0d" />
            </linearGradient>
            <linearGradient id="chassis-bezel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          <path
            d={elasticPath}
            fill="url(#chassis-card-grad)"
            stroke="url(#chassis-bezel-grad)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Card contents layout */}
        <div className="absolute inset-0 w-[300px] h-[380px] p-6 flex flex-col justify-between pointer-events-none z-10">
          {/* Top Label space (minimized) */}
          <div className="h-6" />

          {/* Center visual layout: Slingshot guide vector lines */}
          <div className="w-full flex flex-col items-center gap-2 py-4">
            {dragX > 10 ? (
              <div className="flex flex-col items-center">
                <span className="font-mono text-[8px] text-white/40 tracking-widest animate-pulse uppercase">RELEASE TO SNAP</span>
                <span className="font-mono text-[16px] text-white font-black mt-1">
                  {Math.round((dragX / 95) * 100)}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-neutral-400 animate-bounce" />
                <span className="font-mono text-[8px] text-neutral-500 tracking-widest uppercase">DRAG EDGE TO SLINGSHOT</span>
              </div>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="w-full flex items-center justify-end pt-4 border-t border-neutral-900">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${overclock > 80 ? "bg-white shadow-[0_0_6px_#fff]" : "bg-neutral-800"}`} />
              <span className="font-mono text-[8px] text-neutral-500">ACCEL</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
