"use client";

import React, { useRef, useEffect, useState } from 'react';
import { DotMatrixProps, AnimationContext } from './types';
import { ANIMATION_PLUGINS } from './animations';
import { useRAF } from './hooks/useRAF';
import Dot from './Dot';

/**
 * Production-ready programmable LED Dot Matrix component.
 * Renders a CSS Grid of circles that animate at 45 FPS using direct DOM updates
 * inside a requestAnimationFrame loop, completely bypassing React render loops.
 * Pauses rendering automatically when scrolled out of viewport bounds.
 */
export const DotMatrix: React.FC<DotMatrixProps> = ({
  rows = 12,
  columns = 40,
  dotSize = 16,
  gap = 6,
  borderRadius = '50%',
  color = '#c9dbe3',
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

  // Dynamic overrides for grid layout sizing
  const displayRows = animation === 'clock' ? Math.max(rows, 9) : rows;
  const displayCols = animation === 'clock' ? Math.max(columns, 48) : columns;

  // Persistent plugin state option registers
  const pluginStateRef = useRef<Record<string, any>>({});

  // Web Audio Context state references
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
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia not supported in this browser.');
        }

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

  // Global requestAnimationFrame Animation Loop
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
        elements: elements.slice(0, totalDots),
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

      // ─── 1. Plugin Lifecycle Transition ───
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

        // Reset element registers
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

      // ─── 2. Execute Animation Engine ───
      if (activePlugin) {
        activePlugin.update(ctx);
      }

      // ─── 3. Apply Custom Pattern Morph Overrides ───
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
            
            // Linear morph interpolator
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
