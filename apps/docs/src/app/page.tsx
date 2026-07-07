"use client";

import { useState } from "react";
import Link from "next/link";
import { ChaosFieldShader } from "@/components/site/ChaosFieldShader";
import { Footer } from "@/components/site/Footer";
import {
  VoidButton,
  BrushedTitaniumButton,
  LiquidGoldButton,
  GuillocheButton,
  MorphingNav,
  DotMatrix,
  AnisotropicKnob,
  ScrollPathContainer,
  ScrollPathProcess,
  ExpandOnHover,
  TextShuffle,
} from "@adgrid-ui/ui";

const expandItems = [
  {
    id: "taj",
    title: "The Eternal Taj",
    subtitle: "Agra",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80",
    description: "White marble, morning mist.",
    badge: "Heritage",
    accent: "#E2E8F0",
  },
  {
    id: "varanasi",
    title: "Varanasi Riverfront",
    subtitle: "Kashi",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&q=80",
    description: "Stone steps, ritual light.",
    badge: "Spiritual",
    accent: "#A3A3A3",
  },
  {
    id: "jaipur",
    title: "Jaipur Palace",
    subtitle: "Jaipur",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80",
    description: "Wind, privacy, royal theatre.",
    badge: "Architecture",
    accent: "#D4D4D4",
  },
];

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [matrixText, setMatrixText] = useState("VOID");

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
            <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-[0.25em] text-text-muted mb-8 uppercase select-none">
              SYSTEM_STATUS: STABLE // V1.0.4
            </div>
            
            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.8rem)] font-bold leading-[0.95] uppercase tracking-tighter text-white mb-8 select-none">
              ENGINEERED FOR <br />
              <span className="text-white/40">THE VOID.</span>
            </h1>
            
            <p className="text-text-muted text-sm md:text-base max-w-lg mb-8 select-none leading-relaxed">
              Dark-first. Zero bloat. Copy-paste or install as a package. Engineered for high performance, structural density, and micro-animated details.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
              <Link
                href="/gallery"
                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-mono font-bold text-xs tracking-widest border border-white hover:bg-transparent hover:text-white transition-all duration-200 text-center uppercase"
              >
                GET STARTED
              </Link>
              <Link
                href="/gallery"
                className="w-full sm:w-auto px-10 py-4 bg-transparent text-white font-mono font-bold text-xs tracking-widest border border-border-hairline hover:border-white transition-all duration-200 text-center uppercase"
              >
                EXPLORE REGISTRY
              </Link>
            </div>

            {/* Copyable shadcn registry install block */}
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="flex border border-border-hairline p-1 bg-surface-charcoal w-full">
                <input
                  className="bg-transparent border-none outline-none focus:ring-0 font-mono text-[10px] px-4 py-2.5 flex-1 text-white/50 select-all text-left truncate"
                  value="pnpm dlx shadcn@latest registry add @voidui=https://void-ui.vercel.app/r/{name}.json"
                  readOnly
                />
                <button
                  onClick={() => { navigator.clipboard.writeText("pnpm dlx shadcn@latest registry add @voidui=https://void-ui.vercel.app/r/{name}.json"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="bg-surface-variant text-text-muted font-mono font-bold text-[9px] px-3 py-2.5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase tracking-widest shrink-0"
                >
                  <span className="material-symbols-outlined text-[12px]">content_copy</span>
                  SETUP
                </button>
              </div>
              <div className="flex border border-border-hairline p-1 bg-surface-charcoal w-full">
                <input
                  className="bg-transparent border-none outline-none focus:ring-0 font-mono text-[11px] px-4 py-2.5 flex-1 text-white select-all text-left"
                  id="hero-npm-install"
                  value="pnpm dlx shadcn@latest add @voidui/void-button"
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
            </div>
          </div>

          {/* Right Column: HUD Control Deck showcasing Luxury Buttons */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
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
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 select-none">
          <div>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-2 text-white font-bold tracking-tight">Component Protocol</h2>
            <p className="font-body text-text-muted max-w-md text-sm">
              Precision-machined primitives designed for maximum performance and technical clarity.
            </p>
          </div>
          <div className="font-mono text-xs text-text-muted uppercase tracking-wider">
            DISPLAYING 06 / 128 ASSETS
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: DotMatrix (Span 7) */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-7 h-[395px] border border-border-hairline bg-pure-black p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_01</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">DOT_MATRIX_ACTIVE</span>
            </div>
            
            <div className="relative z-10 w-full overflow-hidden flex flex-col items-center justify-center -my-2">
              <div className="scale-75 -my-4 max-w-full">
                <DotMatrix animation="text" text={matrixText} columns={32} rows={8} speed={1.5} color="#e7e5df" glow={true} />
              </div>
              <div className="mt-3 w-full max-w-xs flex gap-2">
                <input
                  type="text"
                  value={matrixText}
                  maxLength={10}
                  onChange={(e) => setMatrixText(e.target.value.toUpperCase())}
                  placeholder="TYPE TO RENDER..."
                  className="w-full bg-[#111111] border border-white/5 focus:border-white/20 rounded-md px-3 py-1 font-mono text-[10px] text-white outline-none placeholder-white/20"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1 z-10 select-none">
              <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">DotMatrix</h3>
              <p className="font-body text-text-muted text-[11px]">LED programmable grid displaying live dynamic text with glowing animations.</p>
            </div>
            
            <div className="mt-2 border-t border-border-hairline pt-3 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Columns: 32</span>
                <span>Interactions: Writeable</span>
              </div>
            </div>
          </div>

          {/* Card 2: AnisotropicKnob (Span 5) */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-5 h-[395px] border border-border-hairline bg-surface-charcoal p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_02</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">SKEUO_ANISOTROPIC</span>
            </div>
            
            <div className="relative z-10 flex items-center justify-center scale-90 -my-4">
              <AnisotropicKnob size={110} label="VOLUME" />
            </div>
            
            <div className="flex flex-col gap-1 z-10 select-none">
              <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">AnisotropicKnob</h3>
              <p className="font-body text-text-muted text-[11px]">A highly detailed skeuomorphic dial with anisotropic metal textures.</p>
            </div>
            
            <div className="mt-2 border-t border-border-hairline pt-3 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Decibels: Tweakable</span>
                <span>Type: Skeuomorphic</span>
              </div>
            </div>
          </div>

          {/* Card 3: MorphingNav (Span 4) */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-4 h-[395px] border border-border-hairline bg-pure-black p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_03</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">SVG_MORPH_FLOW</span>
            </div>
            
            <div className="relative z-10 w-full overflow-hidden flex items-center justify-center scale-90 -my-2">
              <MorphingNav />
            </div>
            
            <div className="flex flex-col gap-1 z-10 select-none">
              <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">MorphingNav</h3>
              <p className="font-body text-text-muted text-[11px]">Dynamic menu containing custom items connected by morphing SVG paths.</p>
            </div>
            
            <div className="mt-2 border-t border-border-hairline pt-3 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Morph Time: 0.6s</span>
                <span>Borders: Hairline</span>
              </div>
            </div>
          </div>

          {/* Card 4: ScrollPathProcess (Span 8) */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-8 h-[395px] border border-border-hairline bg-surface-charcoal p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_04</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">SCROLL_TIMELINE</span>
            </div>
            
            <div className="relative z-10 w-full h-[220px] overflow-hidden flex items-center justify-center -my-10 scale-[0.45] origin-center">
              <ScrollPathContainer mode="passive" className="h-full">
                <ScrollPathProcess glow={true} strokeWidth={4} />
              </ScrollPathContainer>
            </div>
            
            <div className="flex flex-col gap-1 z-10 select-none">
              <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">ScrollPathProcess</h3>
              <p className="font-body text-text-muted text-[11px]">Timelines and roadmaps drawn on-scroll to guide the user's focus.</p>
            </div>
            
            <div className="mt-2 border-t border-border-hairline pt-3 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Steps: 3 connected</span>
                <span>Aesthetic: Neon Glow</span>
              </div>
            </div>
          </div>

          {/* Card 5: ExpandOnHover (Span 6) */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-6 h-[360px] border border-border-hairline bg-pure-black p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_05</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">GALLERY_STRETCH</span>
            </div>
            
            <div className="relative z-10 w-full overflow-hidden flex items-center justify-center scale-90 -my-6">
              <ExpandOnHover items={expandItems} variant="modern" animation="spring" />
            </div>
            
            <div className="flex flex-col gap-1 z-10 select-none">
              <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">ExpandOnHover</h3>
              <p className="font-body text-text-muted text-[11px]">Interactive slide system displaying high-contrast imagery with spring expansions.</p>
            </div>
            
            <div className="mt-2 border-t border-border-hairline pt-3 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Stretches: 3 images</span>
                <span>Easing: Spring</span>
              </div>
            </div>
          </div>

          {/* Card 6: TextShuffle (Span 6) */}
          <div 
            onMouseMove={handleMouseMove}
            className="md:col-span-6 h-[360px] border border-border-hairline bg-surface-charcoal p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card"
          >
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            <div className="flex justify-between items-start z-10 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold">VOID_06</span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest">TYPO_BLUR_SHUFFLE</span>
            </div>
            
            <div className="relative z-10 w-full overflow-hidden flex items-center justify-center py-6 min-h-[140px]">
              <TextShuffle words={["OBSIDIAN", "TACTILE", "PREMIUM", "ENGINEERED"]} variant="blurReveal" fontSize="clamp(1.5rem, 5vw, 2.5rem)" fontWeight={800} />
            </div>
            
            <div className="flex flex-col gap-1 z-10 select-none">
              <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">TextShuffle</h3>
              <p className="font-body text-text-muted text-[11px]">Decrypting text visualizer revealing characters dynamically on hovering.</p>
            </div>
            
            <div className="mt-2 border-t border-border-hairline pt-3 select-none z-10">
              <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                <span>Fonts: Inter / Monospace</span>
                <span>Effect: Letter Scramble</span>
              </div>
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
        <h2 className="font-display text-4xl md:text-6xl uppercase mb-6 font-bold tracking-tighter text-white">Enter the Void</h2>
        <p className="font-body text-text-muted text-sm mb-12 max-w-md mx-auto">
          Add the registry once, install any component forever.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xl mx-auto">
          <div className="inline-flex border border-border-hairline p-1 bg-surface-charcoal w-full">
            <input
              className="bg-transparent border-none outline-none focus:ring-0 font-mono text-[10px] px-6 py-4 flex-1 text-white/50 select-all text-left truncate"
              value="pnpm dlx shadcn@latest registry add @voidui=https://void-ui.vercel.app/r/{name}.json"
              readOnly
            />
            <button
              onClick={() => { navigator.clipboard.writeText("pnpm dlx shadcn@latest registry add @voidui=https://void-ui.vercel.app/r/{name}.json"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="bg-surface-variant text-text-muted font-mono font-bold text-xs px-6 py-4 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              SETUP
            </button>
          </div>
          <div className="inline-flex border border-border-hairline p-1 bg-surface-charcoal w-full">
            <input
              className="bg-transparent border-none outline-none focus:ring-0 font-mono text-xs px-6 py-4 flex-1 text-white select-all text-center sm:text-left"
              value="pnpm dlx shadcn@latest add @voidui/dot-matrix"
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
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
