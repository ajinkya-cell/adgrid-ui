"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface AnisotropicKnobProps {
  variant?: "slider" | "infinite";
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  defaultValue?: number;
  step?: number;
  size?: number;
  label?: string;
  className?: string;
}

let audioCtx: AudioContext | null = null;

function playClickSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.012);
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.012);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.012);
  } catch (e) {
    // Fail silently if context is blocked
  }
}

export const AnisotropicKnob = React.forwardRef<HTMLDivElement, AnisotropicKnobProps>(
  (
    {
      variant = "slider",
      min = 0,
      max = 100,
      value: controlledValue,
      onChange,
      defaultValue,
      step = 1,
      size = 112,
      label,
      className,
    },
    ref
  ) => {
    // Uncontrolled state fallback
    const [localValue, setLocalValue] = useState(defaultValue ?? (variant === "slider" ? min : 0));
    const activeValue = controlledValue !== undefined ? controlledValue : localValue;

    // Track active rotation angle in degrees (centered at 12 o'clock = 0 deg)
    const [angle, setAngle] = useState(0);
    const isDragging = useRef(false);
    const prevAngleRef = useRef(0);
    const accumulatedAngleRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const lastValueRef = useRef(activeValue);

    // Play click sound on snap changes
    useEffect(() => {
      if (activeValue !== lastValueRef.current) {
        playClickSound();
        lastValueRef.current = activeValue;
      }
    }, [activeValue]);

    // Sync angle with activeValue for bounded slider mode on external changes
    useEffect(() => {
      if (variant === "slider") {
        const progress = (activeValue - min) / (max - min);
        // Map [0, 1] progress to [-135, 135] degrees
        const newAngle = -135 + progress * 270;
        setAngle(newAngle);
        accumulatedAngleRef.current = newAngle;
      }
    }, [activeValue, min, max, variant]);

    // Handle computing angle from pointer coordinates relative to center
    const calculateAngle = (clientX: number, clientY: number) => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;

      // Radian where 3 o'clock is 0, 6 o'clock is PI/2, 12 o'clock is -PI/2
      const angleRad = Math.atan2(dy, dx);
      // Normalize so 12 o'clock is 0 degrees, clockwise increases
      let angleDeg = angleRad * (180 / Math.PI) + 90;

      // Restrict range to [-180, 180]
      if (angleDeg > 180) angleDeg -= 360;
      if (angleDeg < -180) angleDeg += 360;

      return angleDeg;
    };

    const handlePanStart = (_: any, info: any) => {
      isDragging.current = true;
      const clientX = info.point.x;
      const clientY = info.point.y;
      const startAngle = calculateAngle(clientX, clientY);
      prevAngleRef.current = startAngle;
      
      if (variant === "infinite") {
        // Initialize or preserve current accumulated angle
        accumulatedAngleRef.current = angle;
      }
    };

    const handlePan = (_: any, info: any) => {
      if (!isDragging.current) return;
      const clientX = info.point.x;
      const clientY = info.point.y;
      const currentAngle = calculateAngle(clientX, clientY);

      if (variant === "slider") {
        let targetAngle = currentAngle;
        
        // Handle snapping boundaries near the 90-degree gap at 6 o'clock (135 to 225 deg from start)
        // Angle range in slider is [-135, 135]
        if (targetAngle > 135 || targetAngle < -135) {
          // If cursor is in the bottom gap, snap to closest extreme
          if (targetAngle > 0) {
            targetAngle = 135;
          } else {
            targetAngle = -135;
          }
        }

        // Map angle [-135, 135] to progress [0, 1]
        const progress = (targetAngle - -135) / 270;
        let targetVal = min + progress * (max - min);

        // Snap to step resolution
        targetVal = Math.round(targetVal / step) * step;
        targetVal = Math.max(min, Math.min(max, targetVal));

        if (onChange) {
          onChange(targetVal);
        } else {
          setLocalValue(targetVal);
        }
      } else {
        // Infinite Mode: Track angle delta to accumulate unbounded rotations
        let delta = currentAngle - prevAngleRef.current;

        // Wrap around adjustments
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        accumulatedAngleRef.current += delta;
        prevAngleRef.current = currentAngle;
        setAngle(accumulatedAngleRef.current);

        // Value updates: 3.6 degrees = 1 unit change
        const targetVal = Math.round(accumulatedAngleRef.current / (360 / 100) / step) * step;
        if (onChange) {
          onChange(targetVal);
        } else {
          setLocalValue(targetVal);
        }
      }
    };

    const handlePanEnd = () => {
      isDragging.current = false;
    };

    // Keyboard accessibility support
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const incrementKeys = ["ArrowUp", "ArrowRight"];
      const decrementKeys = ["ArrowDown", "ArrowLeft"];
      
      let nextValue = activeValue;
      if (incrementKeys.includes(e.key)) {
        e.preventDefault();
        nextValue = activeValue + step;
      } else if (decrementKeys.includes(e.key)) {
        e.preventDefault();
        nextValue = activeValue - step;
      }

      if (variant === "slider") {
        nextValue = Math.max(min, Math.min(max, nextValue));
      }

      if (nextValue !== activeValue) {
        if (onChange) {
          onChange(nextValue);
        } else {
          setLocalValue(nextValue);
        }
      }
    };

    // Ticks calculation
    const totalTicks = 24;
    const ticks = Array.from({ length: totalTicks });

    // Helper to check if a specific tick is active
    const isTickActive = (index: number) => {
      if (variant === "infinite") return false;
      
      // Map tick index to angle (spread over 270 degrees)
      const tickAngle = -135 + (index / (totalTicks - 1)) * 270;
      return tickAngle <= angle + 0.5; // active if less than current angle
    };

    return (
      <div className={cn("flex flex-col items-center justify-center select-none", className)}>
        {/* Label */}
        {label && (
          <span className="font-syncopate text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-3">
            {label}
          </span>
        )}

        {/* Dial wrapper */}
        <div
          ref={containerRef}
          style={{ width: size + 32, height: size + 32 }}
          className="relative flex items-center justify-center"
        >
          {/* Bezel Tick Rings */}
          <div className="absolute inset-0 pointer-events-none">
            {ticks.map((_, i) => {
              // Radial spread for ticks
              // Slider spans -135 to +135 deg, Infinite spans a full 360 deg
              const tickAngle =
                variant === "slider"
                  ? -135 + (i / (totalTicks - 1)) * 270
                  : (i / totalTicks) * 360;

              const active = isTickActive(i);

              return (
                <div
                  key={i}
                  className="absolute inset-0 flex items-start justify-center"
                  style={{ transform: `rotate(${tickAngle}deg)` }}
                >
                  <div
                    className={cn(
                      "w-[2px] h-[6px] rounded-full transition-all duration-300",
                      variant === "infinite"
                        ? "bg-neutral-800"
                        : active
                        ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                        : "bg-neutral-800"
                    )}
                    style={{ marginTop: "2px" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Draggable Knob Dial */}
          <motion.div
            ref={ref as any}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            role="slider"
            aria-valuemin={variant === "slider" ? min : undefined}
            aria-valuemax={variant === "slider" ? max : undefined}
            aria-valuenow={activeValue}
            style={{
              width: size,
              height: size,
              cursor: isDragging.current ? "grabbing" : "grab",
            }}
            className="relative rounded-full border border-neutral-800 flex items-center justify-center outline-none focus-visible:ring-1 focus-visible:ring-neutral-500"
          >
            {/* Outer Beveled Highlight Ring */}
            <div className="absolute inset-0 rounded-full border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.6)] pointer-events-none" />

            {/* Anisotropic sweep cylinder (rotating conic reflection) */}
            <div
              className="absolute inset-[1px] rounded-full"
              style={{
                background: `conic-gradient(from ${angle}deg, #09090b 0%, #d8d8d8 25%, #09090b 50%, #d8d8d8 75%, #09090b 100%)`,
              }}
            />

            {/* Micro-lines Texture Overlay */}
            <div
              className="absolute inset-[1px] opacity-15 mix-blend-overlay rounded-full pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle at center, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 2px)",
              }}
            />

            {/* Rotating Marker LED Dot */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div
                className="absolute w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                style={{ top: "8%", left: "50%", transform: "translateX(-50%)" }}
              />
            </div>

            {/* Raised center cap */}
            <div
              className="absolute inset-[18%] rounded-full border border-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.5)]"
              style={{
                backgroundImage: "radial-gradient(circle at 35% 35%, #252529 0%, #0e0e11 100%)",
              }}
            />

            {/* Bezel inner highlights */}
            <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
          </motion.div>
        </div>

        {/* Value Readout */}
        <div className="mt-2 font-share-mono text-[11px] tabular-nums text-neutral-400">
          {variant === "slider" ? `${activeValue}` : `${activeValue > 0 ? "+" : ""}${activeValue}`}
        </div>
      </div>
    );
  }
);

AnisotropicKnob.displayName = "AnisotropicKnob";
