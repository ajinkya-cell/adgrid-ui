"use client";

import { useState } from "react";
import Link from "next/link";
import { ChaosFieldShader } from "@/components/site/ChaosFieldShader";
import { Footer } from "@/components/site/Footer";
import {
  FadeIn,
  TextReveal,
  MagneticButton,
  GlitchText,
} from "@adgrid-ui/ui";

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm install @void/ui");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="w-full">
      {/* ─── 1. Hero Section ─── */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-border-hairline bg-pure-black">
        {/* WebGL Canvas Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <ChaosFieldShader />
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,4px_100%]" />

        {/* Content Overlay */}
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <FadeIn direction="up" duration={0.6}>
            <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-[0.25em] text-text-muted mb-8 uppercase select-none">
              SYSTEM_STATUS: STABLE // V1.0.4
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.1} duration={0.6}>
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.9] uppercase tracking-tighter text-white mb-10 select-none">
              ENGINEERED FOR <br />
              <span className="opacity-90">THE VOID.</span>
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.2} duration={0.6}>
            <p className="text-text-muted text-sm md:text-base max-w-md mx-auto mb-10 select-none leading-relaxed">
              Dark-first. Zero bloat. Copy-paste or install as a package. Engineered for high performance and technical density.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.3} duration={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/components"
                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-mono font-bold text-xs tracking-widest border border-white hover:bg-transparent hover:text-white transition-all duration-200 text-center uppercase"
              >
                GET STARTED
              </Link>
              <Link
                href="/components"
                className="w-full sm:w-auto px-10 py-4 bg-transparent text-white font-mono font-bold text-xs tracking-widest border border-border-hairline hover:border-white transition-all duration-200 text-center uppercase"
              >
                EXPLORE REGISTRY
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Diagonal Stats/Decorations */}
        <div className="absolute bottom-10 left-10 hidden lg:block select-none z-20">
          <div className="font-mono text-[10px] text-text-muted leading-relaxed uppercase tracking-wider">
            [00] INITIALIZING_CORE<br />
            [01] LOADING_SHADERS...<br />
            [02] READY.
          </div>
        </div>
        <div className="absolute bottom-10 right-10 hidden lg:block text-right select-none z-20">
          <div className="font-mono text-[10px] text-text-muted leading-relaxed uppercase tracking-wider">
            COORD_X: 144.02<br />
            COORD_Y: 28.00<br />
            LATENCY: 4MS
          </div>
        </div>
      </section>

      {/* ─── 2. Bento Grid Showcase ─── */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto border-b border-border-hairline">
        <FadeIn direction="up" duration={0.6}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 select-none">
            <div>
              <h2 className="font-display text-3xl md:text-4xl uppercase mb-2 text-white font-bold tracking-tight">Component Protocol</h2>
              <p className="font-body text-text-muted max-w-md text-sm">
                Precision-machined primitives designed for maximum performance and technical clarity.
              </p>
            </div>
            <div className="font-mono text-xs text-text-muted uppercase tracking-wider">
              DISPLAYING 04 / 128 ASSETS
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: MagneticButton */}
          <div className="md:col-span-7 h-80 border border-border-hairline bg-surface-charcoal p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300">
            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_01</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">PHYSICS_ENGINE_V2</span>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-28">
              <MagneticButton strength={0.4}>
                <button className="px-6 py-3 border border-white text-white font-mono text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-0 select-none cursor-pointer">
                  HOVER ATTRACT
                </button>
              </MagneticButton>
            </div>
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">MagneticButton</h3>
              <p className="font-body text-text-muted text-xs max-w-sm">Force-field interactions based on cursor proximity and velocity.</p>
            </div>
            <div className="mt-4 border-t border-border-hairline pt-4 flex gap-6 select-none">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted">WEIGHT</span>
                <span className="font-mono text-[11px] text-white">1.2KB</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted">DAMPING</span>
                <span className="font-mono text-[11px] text-white">0.45</span>
              </div>
            </div>
          </div>

          {/* Card 2: GlitchText */}
          <div className="md:col-span-5 h-80 border border-border-hairline bg-pure-black p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300">
            <div className="flex justify-between items-start select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_02</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">RGB_SPLIT_V1</span>
            </div>
            <div className="text-center py-8 z-10">
              <GlitchText text="GLITCH" className="font-display text-4xl font-bold uppercase tracking-widest text-white cursor-default" />
            </div>
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">GlitchText</h3>
              <p className="font-body text-text-muted text-xs">RGB chromatic aberration shifting effect on hover state.</p>
            </div>
            <div className="mt-4 border-t border-border-hairline pt-4 select-none">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Freq: 0.12Hz</span>
                <span>Split: 4px</span>
              </div>
            </div>
          </div>

          {/* Card 3: TextReveal */}
          <div className="md:col-span-5 h-80 border border-border-hairline bg-surface-charcoal p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300">
            <div className="flex justify-between items-start select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_03</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">SCROLL_INTERSECT</span>
            </div>
            <div className="w-full overflow-hidden py-4 text-center">
              <TextReveal text="Reveal Void" className="font-display text-3xl font-bold text-white uppercase tracking-wider" />
            </div>
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">TextReveal</h3>
              <p className="font-body text-text-muted text-xs">Staggered character fade animations triggered on viewport visibility.</p>
            </div>
            <div className="mt-4 border-t border-border-hairline pt-4 grid grid-cols-2 gap-4 select-none">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">Stagger</span>
                <span className="font-mono text-[11px] text-white">0.05s</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">Easing</span>
                <span className="font-mono text-[11px] text-white">Expo.out</span>
              </div>
            </div>
          </div>

          {/* Card 4: FadeIn */}
          <div className="md:col-span-7 h-80 border border-border-hairline bg-pure-black p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300">
            <div className="flex justify-between items-start select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_04</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">TRANSITION_OPACITY</span>
            </div>
            <div className="h-24 flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-text-muted group-hover:text-white transition-colors duration-300 select-none">
                visibility
              </span>
            </div>
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">FadeIn</h3>
              <p className="font-body text-text-muted text-xs">GPU-accelerated intersection observer transitions for clean entrance animation.</p>
            </div>
            <div className="mt-4 border-t border-border-hairline pt-4 flex gap-8 select-none">
              <span className="font-mono text-[10px] text-text-muted uppercase">Observer: Active</span>
              <span className="font-mono text-[10px] text-text-muted uppercase">Threshold: 0.1</span>
              <span className="font-mono text-[10px] text-text-muted uppercase">Duration: 400ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Tech Stack Section ─── */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-6 font-bold text-white tracking-tight">Built for Performance</h2>
            <p className="font-body text-text-muted text-sm md:text-base mb-8 max-w-lg leading-relaxed">
              VOID/UI is not a library; it's a technical standard. Optimized for core web vitals and developer ergonomics.
            </p>
            <ul className="flex flex-col gap-0 select-none font-mono">
              {[
                { name: "Next.js 16+", detail: "SSR_READY" },
                { name: "TypeScript", detail: "STRICT_TYPES" },
                { name: "Tailwind 4", detail: "JIT_COMPILER" },
                { name: "Framer Motion", detail: "60_FPS" },
              ].map((tech, index) => (
                <li
                  key={tech.name}
                  className={`py-5 flex justify-between items-center group cursor-default border-t border-border-hairline ${
                    index === 3 ? "border-b" : ""
                  }`}
                >
                  <span className="font-display text-xl font-bold uppercase group-hover:pl-4 transition-all duration-300 text-white">
                    {tech.name}
                  </span>
                  <span className="text-xs text-text-muted group-hover:text-white transition-colors duration-150">
                    {tech.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square border border-border-hairline bg-pure-black flex items-center justify-center p-12 overflow-hidden select-none">
            {/* Tech Visualization Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#262626_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 border border-white mb-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white">package_2</span>
              </div>
              <div className="font-mono text-[10px] text-text-muted tracking-[0.4em] uppercase mb-2">Core Bundle Size</div>
              <div className="font-display text-4xl md:text-5xl text-white uppercase font-bold tracking-tight">
                4.2kb <span className="text-xs font-mono font-normal">Gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Final CTA Section ─── */}
      <section className="py-32 px-6 max-w-[1440px] mx-auto text-center border-t border-border-hairline">
        <h2 className="font-display text-4xl md:text-6xl uppercase mb-12 font-bold tracking-tighter text-white">Enter the Void</h2>
        <div className="inline-flex flex-col sm:flex-row border border-border-hairline p-1 bg-surface-charcoal w-full max-w-lg">
          <input
            className="bg-transparent border-none outline-none focus:ring-0 font-mono text-xs px-6 py-4 flex-1 text-white select-all text-center sm:text-left"
            id="npm-install"
            value="npm install @void/ui"
            readOnly
          />
          <button
            onClick={copyToClipboard}
            className="bg-white text-black font-mono font-bold text-xs px-8 py-4 hover:bg-white/90 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
