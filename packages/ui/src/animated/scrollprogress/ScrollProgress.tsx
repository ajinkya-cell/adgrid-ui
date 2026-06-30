"use client";

import React, { useState, useRef } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { ScrollProgressProps } from './types';
import { useScrollProgress } from './useScrollProgress';
import Tick from './Tick';
import { range } from './utils';

let audioCtx: AudioContext | null = null;

const playClickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.015);
    
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.015);
  } catch (error) {
    // Silent fail if blocked by browser autoplay policy
  }
};

export default function ScrollProgress({
  ticks = 42,
  color = "#a855f7",
  glow = true,
  height = 44,
  width = 320,
  variant = "default",
}: ScrollProgressProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { smoothProgress, stretchY, stretchX, glowIntensity } = useScrollProgress();

  const lastTickRef = useRef<number>(-1);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const currentTick = Math.round(latest * (ticks - 1));
    if (currentTick !== lastTickRef.current) {
      lastTickRef.current = currentTick;
      if (currentTick >= 0 && currentTick < ticks) {
        playClickSound();
      }
    }
  });

  const isInverted = variant === "inverted";
  const activeColor = isInverted
    ? (color === "#a855f7" ? "#111111" : color)
    : color;

  // Padding inside the vertical pill is py-5 (1.25rem / 20px) at top and bottom.
  // The first tick sits at 1.25rem and the last tick sits at 100% - 1.25rem.
  const indicatorTop = useTransform(smoothProgress, (p) => `calc(1.25rem + ${p} * (100% - 2.5rem))`);

  // Map glow intensity based on hover state combined with velocity:
  const overlayOpacity = useTransform(glowIntensity, (vIntensity) => {
    const baseGlow = isHovered || isDragging ? 0.75 : 0.45;
    return Math.min(baseGlow + vIntensity, 0.95);
  });

  const overlayScale = useTransform(glowIntensity, (vIntensity) => {
    const baseScale = isHovered || isDragging ? 1.25 : 1.0;
    return baseScale + vIntensity * 0.5;
  });

  const responsiveStyles = {
    maxHeight: `${width}px`, // 320px vertical length
  };

  // Drag interaction handler
  const handleDrag = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 20; // 1.25rem top/bottom padding
    const usableHeight = rect.height - padding * 2;
    const relativeY = clientY - rect.top - padding;
    const progress = Math.max(0, Math.min(1, relativeY / usableHeight));
    
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      window.scrollTo(0, progress * maxScroll);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleDrag(e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleDrag(moveEvent.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <motion.div
      ref={containerRef}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      style={{
        ...responsiveStyles,
        width: `${height}px`, // Thickness (e.g. 44px)
        height: `${width}px`, // Length (e.g. 320px)
        position: 'fixed',
        right: '24px',
        top: '50%',
        y: '-50%',
        zIndex: 9999,
      }}
      className={
        isInverted
          ? `rounded-full bg-white/80 backdrop-blur-md
             border border-black/10 shadow-[inset_1px_0_1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.12)]
             flex flex-col items-center py-5 relative overflow-hidden select-none cursor-pointer
             transition-colors duration-300
             ${isHovered || isDragging ? "border-black/20" : "border-black/10"}`
          : `rounded-full bg-[#111111]/90 backdrop-blur-md
             border border-white/10 shadow-[inset_1px_0_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]
             flex flex-col items-center py-5 relative overflow-hidden select-none cursor-pointer
             transition-colors duration-300
             ${isHovered || isDragging ? "border-white/20" : "border-white/10"}`
      }
    >
      {/* Background Track Ticks Container (Vertical) */}
      <div className="flex flex-col justify-between items-center w-full h-full relative z-10">
        {range(ticks).map((i) => (
          <Tick
            key={i}
            index={i}
            totalTicks={ticks}
            smoothProgress={smoothProgress}
            color={activeColor}
            isProminent={variant === "prominent" && i % 5 === 0}
            isInverted={isInverted}
            scrollbarVariant={variant}
          />
        ))}
      </div>

      {/* Scroll Indicator (Vertical Placement) */}
      <motion.div
        style={{
          top: indicatorTop,
          x: '-50%',
          y: '-50%',
          scaleY: stretchY, // Subtle vertical stretch
          scaleX: stretchX, // Subtle horizontal stretch (width increase)
        }}
        className="absolute left-1/2 w-[16px] h-[6px] rounded-full z-20 pointer-events-none origin-center"
      >
        {/* Solid Core Indicator */}
        <div 
          style={{ backgroundColor: activeColor }}
          className="absolute inset-0 rounded-full" 
        />

        {/* Ambient Neon Glow Overlay */}
        {glow && (
          <motion.div
            style={{
              backgroundColor: activeColor,
              opacity: overlayOpacity,
              scale: overlayScale,
            }}
            className="absolute inset-0 rounded-full blur-[4px] -z-10"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
