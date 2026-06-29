"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export interface DesignVariantFeedProps {
  defaultPrompt?: string;
  className?: string;
}

const variantsData = [
  {
    id: 1,
    title: "Variant A - Minimalist Glass",
    bg: "linear-gradient(135deg, #0f0c20 0%, #15102a 50%, #06020f 100%)",
    color: "#a855f7",
    tag: "GLASSMORPHIC",
    features: ["Frosted glass tabs", "Floating action bar", "Vibrant ambient backing glow"],
  },
  {
    id: 2,
    title: "Variant B - Cyberpunk Grid",
    bg: "linear-gradient(135deg, #020205 0%, #080711 50%, #010103 100%)",
    color: "#06b6d4",
    tag: "GRID TELEMETRY",
    features: ["Matrix dot subgrid", "Neon cyan highlights", "Monospace terminal metrics"],
  },
  {
    id: 3,
    title: "Variant C - Liquid Mercury",
    bg: "linear-gradient(135deg, #08080a 0%, #121217 50%, #040405 100%)",
    color: "#f43f5e",
    tag: "ANISOTROPIC SHINE",
    features: ["Smooth chrome highlights", "Curved organic panels", "Reflective light sweeps"],
  },
  {
    id: 4,
    title: "Variant D - Obsidian Dark",
    bg: "linear-gradient(135deg, #050505 0%, #0a0a0c 50%, #020202 100%)",
    color: "#10b981",
    tag: "UTILITY LUXURY",
    features: ["Deep black matte surfaces", "Contrast green status chips", "Razor-thin 1px borders"],
  },
];

export function DesignVariantFeed({
  defaultPrompt = "AI generation dashboard with 3D nodes",
  className,
}: DesignVariantFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  // Monitor scroll progress across the whole feed
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Telemetry simulation
  useEffect(() => {
    if (!isGenerating) return;
    setGenProgress(0);
    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Formats diagonal clip-path values for scroll-linked mockup reveals
  // Mockup 1 is visible initially.
  // Mockup 2 reveals from scroll 0.25 to 0.5
  // Mockup 3 reveals from scroll 0.5 to 0.75
  // Mockup 4 reveals from scroll 0.75 to 1.0
  const clip1 = useTransform(smoothScroll, [0, 0.25], ["polygon(0 0, 100% 0, 100% 100%, 0 100%)", "polygon(0 0, 100% 0, 100% 0%, 0 0%)"]);
  const clip2 = useTransform(smoothScroll, [0.25, 0.5], ["polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"]);
  const clip3 = useTransform(smoothScroll, [0.5, 0.75], ["polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"]);
  const clip4 = useTransform(smoothScroll, [0.75, 1], ["polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[300vh] bg-[#030303] text-white flex flex-col font-sans select-none ${className || ""}`}
    >
      {/* Top sticky prompt input telemetry deck */}
      <div className="sticky top-0 z-40 w-full bg-[#050507]/80 backdrop-blur-md border-b border-neutral-900 p-4 flex flex-col gap-3">
        <div className="max-w-4xl mx-auto w-full flex gap-3">
          <div className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-600 text-[18px]">terminal</span>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-neutral-300"
              placeholder="Describe variant prompt..."
            />
          </div>
          <button
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating}
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs tracking-wide hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? "GENERATING..." : "GENERATE"}
          </button>
        </div>

        {/* Dynamic progress telemetry scanline */}
        {isGenerating && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-1.5">
            <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
              <motion.div
                className="bg-purple-500 h-full"
                style={{ width: `${genProgress}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[9px] text-neutral-500 tracking-wider">
              <span>SCANNING COMPONENT ARRAYS...</span>
              <span>{genProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main scrolling viewport stack */}
      <div className="sticky top-[73px] w-full h-[calc(100vh-73px)] overflow-hidden flex items-center justify-center p-6">
        <div className="relative w-full max-w-5xl h-full max-h-[580px] bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
          
          {/* Variant A mockup screen */}
          <motion.div
            style={{ clipPath: clip1 }}
            className="absolute inset-0 w-full h-full flex flex-col p-8 justify-between"
            style={{
              background: variantsData[0].bg,
              clipPath: clip1,
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase">
                  {variantsData[0].tag}
                </span>
                <h3 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  {variantsData[0].title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono text-purple-400">
                ACTIVE
              </span>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-3 gap-6 flex-1 my-8">
              {variantsData[0].features.map((feat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                  <span className="text-2xs font-mono text-neutral-400">0{i+1}</span>
                  <p className="text-xs text-white leading-relaxed font-mono mt-4">{feat}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between font-mono text-[9px] text-neutral-500">
              <span>RENDER ENGINE: CHROMATIC GLOW</span>
              <span>SCROLL DOWN FOR NEXT VARIANT</span>
            </div>
          </motion.div>

          {/* Variant B mockup screen */}
          <motion.div
            style={{ clipPath: clip2 }}
            className="absolute inset-0 w-full h-full flex flex-col p-8 justify-between"
            style={{
              background: variantsData[1].bg,
              clipPath: clip2,
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  {variantsData[1].tag}
                </span>
                <h3 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  {variantsData[1].title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400">
                ACTIVE
              </span>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-3 gap-6 flex-1 my-8">
              {variantsData[1].features.map((feat, i) => (
                <div key={i} className="bg-neutral-900/50 border border-cyan-500/10 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan-500/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-2xs font-mono text-cyan-500/50">0{i+1}</span>
                  <p className="text-xs text-white leading-relaxed font-mono mt-4">{feat}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-cyan-500/10 pt-4 flex justify-between font-mono text-[9px] text-neutral-500">
              <span>RENDER ENGINE: CYBER NET SCAN</span>
              <span>SCROLL DOWN FOR NEXT VARIANT</span>
            </div>
          </motion.div>

          {/* Variant C mockup screen */}
          <motion.div
            style={{ clipPath: clip3 }}
            className="absolute inset-0 w-full h-full flex flex-col p-8 justify-between"
            style={{
              background: variantsData[2].bg,
              clipPath: clip3,
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-rose-500 uppercase">
                  {variantsData[2].tag}
                </span>
                <h3 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  {variantsData[2].title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono text-rose-500">
                ACTIVE
              </span>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-3 gap-6 flex-1 my-8">
              {variantsData[2].features.map((feat, i) => (
                <div key={i} className="bg-neutral-900/60 border border-white/5 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <span className="text-2xs font-mono text-rose-500/50">0{i+1}</span>
                  <p className="text-xs text-white leading-relaxed font-mono mt-4">{feat}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between font-mono text-[9px] text-neutral-500">
              <span>RENDER ENGINE: LIQUID CHROMATIC</span>
              <span>SCROLL DOWN FOR NEXT VARIANT</span>
            </div>
          </motion.div>

          {/* Variant D mockup screen */}
          <motion.div
            style={{ clipPath: clip4 }}
            className="absolute inset-0 w-full h-full flex flex-col p-8 justify-between"
            style={{
              background: variantsData[3].bg,
              clipPath: clip4,
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  {variantsData[3].tag}
                </span>
                <h3 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  {variantsData[3].title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
                ACTIVE
              </span>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-3 gap-6 flex-1 my-8">
              {variantsData[3].features.map((feat, i) => (
                <div key={i} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                  <span className="text-2xs font-mono text-emerald-500/45">0{i+1}</span>
                  <p className="text-xs text-white leading-relaxed font-mono mt-4">{feat}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-900 pt-4 flex justify-between font-mono text-[9px] text-neutral-500">
              <span>RENDER ENGINE: OBSIDIAN DARK</span>
              <span>END OF FEED SESSIONS</span>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
