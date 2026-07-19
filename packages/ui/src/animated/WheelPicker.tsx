"use client";

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, useMotionValue, useTransform, animate, SpringOptions, MotionValue } from "framer-motion";
import { cn } from "../lib/utils";

// Web Audio API mechanical tick sound synthesizer
let lastPlayTime = 0;
let audioCtx: AudioContext | null = null;

function playClickSound(volume = 0.03) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastPlayTime < 35) return; // Prevent sound overlapping
  lastPlayTime = now;

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

    // Mechanical crown tick sweep - higher start frequency and shorter decay for clean crisp click
    osc.type = "sine";
    osc.frequency.setValueAtTime(2200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.006);

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.006);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.007);
  } catch (e) {}
}

export type WheelPickerProps = {
  items: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: "glass" | "minimal";
  loop?: boolean;
  sound?: boolean;
  disabled?: boolean;
  itemHeight?: number;
  visibleItems?: number;
  perspective?: number;
  duration?: number;
  spring?: SpringOptions;
  className?: string;
};

export interface WheelPickerRef {
  next: () => void;
  previous: () => void;
  scrollTo: (value: string) => void;
}

export const WheelPicker = forwardRef<WheelPickerRef, WheelPickerProps>(
  (
    {
      items = [],
      value,
      defaultValue,
      onChange,
      variant = "glass",
      loop = false,
      sound = true,
      disabled = false,
      itemHeight = 40,
      visibleItems = 3,
      perspective = 1000,
      spring,
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const total = items.length;

    // Controlled vs Uncontrolled state
    const isControlled = value !== undefined;
    const [localValue, setLocalValue] = useState(isControlled ? value : (defaultValue || items[0] || ""));
    const activeValue = isControlled ? value : localValue;

    // Initial offset position
    const initialIndex = items.indexOf(activeValue);
    const startIndex = initialIndex !== -1 ? initialIndex : 0;

    // Motion value tracking scroll offsets
    const y = useMotionValue(startIndex);
    const lastIndexRef = useRef(startIndex);

    // Dynamic spring physics config
    const springConfig: SpringOptions = spring || {
      stiffness: 180,
      damping: 24,
      mass: 0.8,
    };

    // Ref API hooks
    useImperativeHandle(ref, () => ({
      next: () => {
        if (disabled) return;
        scrollToIndex(lastIndexRef.current + 1);
      },
      previous: () => {
        if (disabled) return;
        scrollToIndex(lastIndexRef.current - 1);
      },
      scrollTo: (val: string) => {
        if (disabled) return;
        const targetIdx = items.indexOf(val);
        if (targetIdx !== -1) {
          scrollToIndex(targetIdx);
        }
      },
    }));

    const scrollToIndex = (idx: number) => {
      let target = idx;
      if (loop && total > 0) {
        const currentY = y.get();
        const baseTarget = ((idx % total) + total) % total;
        const closestCycle = Math.round(currentY / total) * total;
        const candidateTarget = closestCycle + baseTarget;
        const candidates = [candidateTarget - total, candidateTarget, candidateTarget + total];
        candidates.sort((a, b) => Math.abs(a - currentY) - Math.abs(b - currentY));
        target = candidates[0];
      } else {
        target = Math.max(0, Math.min(total - 1, target));
      }
      animate(y, target, {
        type: "spring",
        ...springConfig,
        onComplete: () => {
          if (loop && total > 0) {
            const wrapped = ((Math.round(target) % total) + total) % total;
            y.set(wrapped);
          }
        }
      });
    };

    // Update position if value prop updates externally
    useEffect(() => {
      if (isControlled) {
        const targetIdx = items.indexOf(value);
        if (targetIdx !== -1 && targetIdx !== lastIndexRef.current) {
          lastIndexRef.current = targetIdx;
          scrollToIndex(targetIdx);
        }
      }
    }, [value, items, isControlled]);

    // Handle index updates and tick triggers
    useEffect(() => {
      const unsubscribe = y.on("change", (latest) => {
        const rounded = Math.round(latest);
        let activeIdx = rounded;
        if (loop) {
          activeIdx = ((rounded % total) + total) % total;
        } else {
          activeIdx = Math.max(0, Math.min(total - 1, rounded));
        }

        if (activeIdx !== lastIndexRef.current) {
          lastIndexRef.current = activeIdx;
          if (sound && !disabled) {
            playClickSound(0.04);
          }
          if (!isControlled) {
            setLocalValue(items[activeIdx]);
          }
          if (onChange) {
            onChange(items[activeIdx]);
          }
        }
      });
      return unsubscribe;
    }, [y, total, loop, sound, items, onChange, isControlled, disabled]);

    // Drag gestures tracking
    const isDragging = useRef(false);
    const startClientY = useRef(0);
    const startYOffset = useRef(0);
    const lastDragTime = useRef(0);
    const lastDragY = useRef(0);
    const dragVelocity = useRef(0);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      isDragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      startClientY.current = e.clientY;
      startYOffset.current = y.get();
      lastDragTime.current = Date.now();
      lastDragY.current = e.clientY;
      dragVelocity.current = 0;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      const deltaY = e.clientY - startClientY.current;
      const now = Date.now();
      const dt = now - lastDragTime.current;

      if (dt > 0) {
        const dy = e.clientY - lastDragY.current;
        dragVelocity.current = dy / dt;
      }

      lastDragTime.current = now;
      lastDragY.current = e.clientY;

      let nextOffset = startYOffset.current - deltaY / itemHeight;

      if (!loop) {
        if (nextOffset < 0) {
          nextOffset = nextOffset * 0.35;
        } else if (nextOffset > total - 1) {
          nextOffset = total - 1 + (nextOffset - (total - 1)) * 0.35;
        }
      }

      y.set(nextOffset);
    };

    const handlePointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const currentVal = y.get();
      const momentumTarget = currentVal - dragVelocity.current * 8.5;
      let snapTarget = Math.round(momentumTarget);

      if (!loop) {
        snapTarget = Math.max(0, Math.min(total - 1, snapTarget));
      }

      animate(y, snapTarget, {
        type: "spring",
        ...springConfig,
        onComplete: () => {
          if (loop && total > 0) {
            const wrapped = ((snapTarget % total) + total) % total;
            y.set(wrapped);
          }
        }
      });
    };

    // Keyboard navigation handlers
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      let nextIdx = lastIndexRef.current;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          nextIdx -= 1;
          break;
        case "ArrowDown":
          e.preventDefault();
          nextIdx += 1;
          break;
        case "PageUp":
          e.preventDefault();
          nextIdx -= visibleItems;
          break;
        case "PageDown":
          e.preventDefault();
          nextIdx += visibleItems;
          break;
        case "Home":
          e.preventDefault();
          nextIdx = 0;
          break;
        case "End":
          e.preventDefault();
          nextIdx = total - 1;
          break;
        default:
          return;
      }

      scrollToIndex(nextIdx);
    };

    // Mouse wheel / trackpad scroll mapping (non-passive to prevent background document scrolling)
    const lastWheelTime = useRef(0);
    useEffect(() => {
      const container = containerRef.current;
      if (!container || disabled) return;

      const handleNativeWheel = (e: WheelEvent) => {
        // Prevent background page from scrolling
        e.preventDefault();

        const now = Date.now();
        if (now - lastWheelTime.current < 120) return;
        lastWheelTime.current = now;

        const direction = Math.sign(e.deltaY);
        scrollToIndex(lastIndexRef.current + direction);
      };

      container.addEventListener("wheel", handleNativeWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleNativeWheel);
      };
    }, [disabled, items, loop]);

    const cylinderRadius = itemHeight / 0.342; // R calculation based on 20deg step
    const wheelHeight = itemHeight * visibleItems;

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full flex flex-col items-center justify-center overflow-hidden outline-none select-none shadow-md shadow-black/50",
          variant === "glass" && "bg-neutral-950/70 border border-neutral-900/60 rounded-3xl backdrop-blur-xl shadow-2xl",
          variant === "minimal" && "bg-transparent",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          className
        )}
        style={{
          height: `${wheelHeight}px`,
        }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="listbox"
        aria-label="Wheel Picker Selection"
        aria-activedescendant={`item-${lastIndexRef.current}`}
      >
        {/* Viewport wrapper holding 3D context to prevent overflow-hidden flattening */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-visible"
          style={{
            perspective: `${perspective}px`,
            transformStyle: "preserve-3d",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        >
          {/* Selection Highlight Overlay */}
          <div
            className={cn(
              "absolute left-0 right-0 pointer-events-none rounded-xl z-10 border",
              variant === "glass" && "bg-white/5 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]",
              variant === "minimal" && "bg-white/5 border-white/5"
            )}
            style={{
              height: `${itemHeight}px`,
              top: `${(visibleItems - 1) * itemHeight / 2}px`,
            }}
          />

          {/* 3D cylinder layout track */}
          <div
            className="relative w-full flex items-center justify-center"
            style={{
              height: `${itemHeight}px`,
              transformStyle: "preserve-3d",
            }}
          >
            {items.map((item, idx) => (
              <WheelItem
                key={`${item}-${idx}`}
                item={item}
                index={idx}
                total={total}
                y={y}
                itemHeight={itemHeight}
                loop={loop}
                cylinderRadius={cylinderRadius}
                activeIdx={lastIndexRef.current}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

WheelPicker.displayName = "WheelPicker";

type WheelItemProps = {
  item: string;
  index: number;
  total: number;
  y: MotionValue<number>;
  itemHeight: number;
  loop: boolean;
  cylinderRadius: number;
  activeIdx: number;
};

function WheelItem({
  item,
  index,
  total,
  y,
  itemHeight,
  loop,
  cylinderRadius,
  activeIdx,
}: WheelItemProps) {
  const d = useTransform(y, (latestY) => {
    if (total === 0) return 0;
    let diff = index - latestY;
    if (loop) {
      const half = total / 2;
      diff = ((diff + half) % total + total) % total - half;
    }
    return diff;
  });

  // Math projection formulas for 3D cylinder vertical compression
  const rotateX = useTransform(d, (diff) => -diff * 20);
  const translateY = useTransform(d, (diff) => {
    const angleRad = (diff * 20 * Math.PI) / 180;
    return cylinderRadius * Math.sin(angleRad);
  });
  const translateZ = useTransform(d, (diff) => {
    const angleRad = (diff * 20 * Math.PI) / 180;
    return cylinderRadius * (Math.cos(angleRad) - 1);
  });
  const scale = useTransform(d, (diff) => 1 - Math.min(0.25, Math.abs(diff) * 0.06));
  const opacity = useTransform(d, (diff) => Math.max(0, 1 - Math.abs(diff) * 0.28));
  
  const blur = useTransform(d, (diff) => {
    const b = Math.min(3, Math.abs(diff) * 0.65);
    return b > 0.1 ? `blur(${b}px)` : "blur(0px)";
  });

  const isActive = activeIdx === index;

  return (
    <motion.div
      id={`item-${index}`}
      role="option"
      aria-selected={isActive}
      className={cn(
        "absolute inset-x-0 flex items-center justify-center font-body select-none text-center cursor-grab active:cursor-grabbing transform-gpu will-change-transform font-medium transition-colors duration-300",
        isActive ? "text-white text-sm" : "text-neutral-400 text-xs"
      )}
      style={{
        height: `${itemHeight}px`,
        rotateX,
        y: translateY,
        z: translateZ,
        scale,
        opacity,
        filter: blur,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <span className="truncate max-w-[85%] px-4">{item}</span>
    </motion.div>
  );
}
