"use client";

import { useState } from "react";
import Link from "next/link";
import { ChaosFieldShader } from "@/components/site/ChaosFieldShader";
import { Footer } from "@/components/site/Footer";
import {
  FadeIn,
  MagneticButton,
  GlitchText,
  VoidButton,
  BrushedTitaniumButton,
  LiquidGoldButton,
  GuillocheButton,
  MorphingNav,
  ImageStack,
} from "@adgrid-ui/ui";

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm install @void/ui");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <main className="w-full">
      {/* ─── 1. Hero Section ─── */}
      <section className="relative min-h-[90vh] py-20 lg:py-0 flex items-center justify-center overflow-hidden border-b border-border-hairline bg-pure-black">
        {/* WebGL Canvas Background */}
        <div className="absolute inset-0 z-0 opacity-25">
          <ChaosFieldShader />
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,4px_100%]" />

        {/* Content Overlay - Split Grid */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <FadeIn direction="up" duration={0.6}>
              <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-[0.25em] text-text-muted mb-8 uppercase select-none">
                SYSTEM_STATUS: STABLE // V1.0.4
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.1} duration={0.6}>
              <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.8rem)] font-bold leading-[0.95] uppercase tracking-tighter text-white mb-8 select-none">
                ENGINEERED FOR <br />
                <span className="text-white/40">THE VOID.</span>
              </h1>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.2} duration={0.6}>
              <p className="text-text-muted text-sm md:text-base max-w-lg mb-8 select-none leading-relaxed">
                Dark-first. Zero bloat. Copy-paste or install as a package. Engineered for high performance, structural density, and micro-animated details.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.3} duration={0.6}>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
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

            {/* Copyable npm install block inline */}
            <FadeIn direction="up" delay={0.4} duration={0.6} className="w-full max-w-md">
              <div className="flex border border-border-hairline p-1 bg-surface-charcoal w-full">
                <input
                  className="bg-transparent border-none outline-none focus:ring-0 font-mono text-[11px] px-4 py-2.5 flex-1 text-white select-all text-left"
                  id="hero-npm-install"
                  value="npm install @void/ui"
                  readOnly
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-white text-black font-mono font-bold text-[10px] px-6 py-2.5 hover:bg-white/90 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: HUD Control Deck showcasing Luxury Buttons */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
            <FadeIn direction="up" delay={0.2} duration={0.8} className="w-full max-w-md">
              <div className="relative border border-border-hairline bg-surface-charcoal/40 backdrop-blur-md p-6 rounded-lg shadow-2xl flex flex-col gap-6 select-none w-full">
                
                {/* Tech styling decoration */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white/60" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white/60" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white/60" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white/60" />
                
                {/* HUD Header */}
                <div className="flex justify-between items-center border-b border-border-hairline pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold text-white tracking-widest uppercase">LUXURY_DECK_V1</span>
                  </div>
                  <span className="font-mono text-[8px] text-text-muted tracking-wider">TEMP: 34.2C // VOLT: 1.22V</span>
                </div>

                {/* Luxury Buttons Grid */}
                <div className="grid grid-cols-2 gap-4 justify-items-center">
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="font-mono text-[8px] text-text-muted self-start">01 / VOID_REVEAL</span>
                    <VoidButton className="w-full h-11 text-[10px]" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="font-mono text-[8px] text-text-muted self-start">02 / METAL_BRUSH</span>
                    <BrushedTitaniumButton className="w-full h-11 text-[10px]" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="font-mono text-[8px] text-text-muted self-start">03 / LIQUID_GOLD</span>
                    <LiquidGoldButton className="w-full h-11 text-[10px]" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="font-mono text-[8px] text-text-muted self-start">04 / GUILLOCHÉ</span>
                    <GuillocheButton className="w-full h-11 text-[10px]" />
                  </div>
                </div>

                {/* HUD Footer status stream */}
                <div className="font-mono text-[8px] text-text-muted border-t border-border-hairline pt-3 flex justify-between uppercase">
                  <span>TELEMETRY: STABLE</span>
                  <span>SYSTEM_LOAD: 4.2%</span>
                </div>

              </div>
            </FadeIn>
          </div>

        </div>

        {/* Diagonal Stats/Decorations */}
        <div className="absolute bottom-10 left-10 hidden xl:block select-none z-20">
          <div className="font-mono text-[10px] text-text-muted leading-relaxed uppercase tracking-wider">
            [00] INITIALIZING_CORE<br />
            [01] SYSTEM_STATUS: READY.
          </div>
        </div>
        <div className="absolute bottom-10 right-10 hidden xl:block text-right select-none z-20">
          <div className="font-mono text-[10px] text-text-muted leading-relaxed uppercase tracking-wider">
            COORD_X: 144.02 // COORD_Y: 28.00<br />
            LATENCY: 4MS // GZIP: 4.2KB
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
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-7 h-[380px] border border-border-hairline bg-surface-charcoal p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />
            
            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_01</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">PHYSICS_ENGINE_V2</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-40">
              <MagneticButton strength={0.4}>
                <button className="px-6 py-3 border border-white text-white font-mono text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-200 select-none cursor-pointer">
                  HOVER ATTRACT
                </button>
              </MagneticButton>
            </div>
            
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">MagneticButton</h3>
              <p className="font-body text-text-muted text-xs max-w-sm">Force-field interactions based on cursor proximity and velocity.</p>
            </div>
            
            <div className="mt-4 border-t border-border-hairline pt-4 flex gap-6 select-none z-10">
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
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-5 h-[380px] border border-border-hairline bg-pure-black p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_02</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">RGB_SPLIT_V1</span>
            </div>
            
            <div className="text-center py-12 z-10">
              <GlitchText text="GLITCH" className="font-display text-5xl font-bold uppercase tracking-widest text-white cursor-default" />
            </div>
            
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">GlitchText</h3>
              <p className="font-body text-text-muted text-xs">RGB chromatic aberration shifting effect on hover state.</p>
            </div>
            
            <div className="mt-4 border-t border-border-hairline pt-4 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Freq: 0.12Hz</span>
                <span>Split: 4px</span>
              </div>
            </div>
          </div>

          {/* Card 3: MorphingNav */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-5 h-[380px] border border-border-hairline bg-pure-black p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_03</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">SVG_MORPH_FLOW</span>
            </div>
            
            <div className="relative z-10 w-full overflow-hidden flex items-center justify-center -my-8 scale-90">
              <MorphingNav />
            </div>
            
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">MorphingNav</h3>
              <p className="font-body text-text-muted text-xs">An interactive navigation bar with liquid morphing SVG shapes.</p>
            </div>
            
            <div className="mt-4 border-t border-border-hairline pt-4 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Morph Time: 0.6s</span>
                <span>Borders: Hairline</span>
              </div>
            </div>
          </div>

          {/* Card 4: ImageStack */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-7 h-[380px] border border-border-hairline bg-surface-charcoal p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_04</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">SWIPE_DISMISS_PHYSICS</span>
            </div>
            
            <div className="relative z-10 flex items-center justify-center scale-75 -my-10">
              <ImageStack 
                cards={[
                  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", alt: "Mountain", label: "SUMMIT_ARRAY" },
                  { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80", alt: "Stars", label: "VOID_OBSERVATION" },
                  { src: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&q=80", alt: "Forest", label: "TERRESTRIAL_MATRIX" }
                ]}
                width={200}
                height={260}
              />
            </div>
            
            <div className="flex flex-col gap-2 z-10 select-none">
              <h3 className="font-display text-xl uppercase font-bold text-white tracking-tight">ImageStack</h3>
              <p className="font-body text-text-muted text-xs">Swipeable card stacks with spring physics and inertia dismiss handlers.</p>
            </div>
            
            <div className="mt-4 border-t border-border-hairline pt-4 flex gap-8 select-none z-10">
              <span className="font-mono text-[10px] text-text-muted uppercase">Spring: Elastic</span>
              <span className="font-mono text-[10px] text-text-muted uppercase">Dismiss: 100px</span>
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
