"use client";

import { useState } from "react";
import Link from "next/link";
import { registry, type ComponentCategory } from "@/registry";
import { Sidebar } from "@/components/site/Sidebar";
import { Footer } from "@/components/site/Footer";

const categoryIcons: Record<ComponentCategory, string> = {
  animated: "animation",
  primitives: "category",
  charts: "bar_chart",
  widgets: "widgets",
  buttons: "smart_button",
  backgrounds: "blur_on",
};

const categoryTags: Record<string, string[]> = {
  "magnetic-button": ["PHYSICS", "INTERACTIVE"],
  "text-reveal": ["SCROLL", "FADE"],
  "fade-in": ["VIEWPORT", "GPU"],
  "glitch-text": ["RGB-SPLIT", "HOVER"],
  "count-up": ["TELEMETRY", "SCROLL"],
  "button": ["BRUTALIST", "HIGH-CONTRAST"],
  "card": ["SURFACE", "HAIRLINE"],
  "image-reveal": ["IMAGE", "MASK"],
  "image-stack": ["CARDS", "SWIPE"],
  "image-parallax": ["PERSPECTIVE", "MOUSE"],
  "living-text": ["PROXIMITY", "SPRING"],
  "gravity-card-stack": ["PHYSICS", "SCROLL-TRIGGER"],
  "morphing-nav": ["SVG-MORPH", "NAVBAR"],
  "story-timeline": ["TIMELINE", "GSAP"],
  "void-button": ["THE-VOID", "MASK-REVEAL"],
  "brushed-titanium-button": ["METALWORK", "ANISOTROPIC"],
  "liquid-gold-button": ["LIQUID-METAL", "CONIC-GRAD"],
  "guilloche-button": ["WATCH-DIAL", "MOIRE"],
  "pixel-melt": ["CANVAS", "HEAT-MAP", "MOUSE"],
  "breathing-grid": ["CANVAS", "PULSE", "DUAL-LAYER"],
  "floating-embers": ["CANVAS", "PARTICLE", "AMBIENT"],
  "scanline-drift": ["CANVAS", "AMBIENT", "VARIANT"],
};

export default function ComponentsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories: ComponentCategory[] = ["animated", "primitives", "charts", "widgets", "buttons", "backgrounds"];

  // Filter registry entries
  const filteredRegistry = registry.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const displayCategories = selectedCategory === "all"
    ? categories
    : [selectedCategory as ComponentCategory];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <main className="max-w-[1440px] px-8 py-12 mx-auto w-full">
          {/* Header */}
          <header className="mb-12 border-b border-border-hairline pb-8">
            <div className="flex items-center gap-3 mb-4 select-none">
              <span className="font-mono text-[10px] text-white border border-white px-2 py-0.5 tracking-wider font-bold">
                COMPONENTS
              </span>
              <span className="font-mono text-xs text-text-muted">
                v1.0.4-beta RELEASE
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4 leading-tight font-bold uppercase tracking-tighter">
              THE COMPONENT VOID.
            </h1>
            <p className="font-body text-text-muted max-w-2xl text-sm leading-relaxed">
              High-performance, technical primitives for the modern web. Built for density, speed, and precision. Optimized for zero-bloat environments.
            </p>
          </header>

          {/* Search & Filter Controls */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12 select-none">
            {/* Search bar */}
            <div className="w-full max-w-md relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search components..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface-charcoal border border-border-hairline text-xs font-mono py-3.5 pl-10 pr-4 w-full focus:outline-none focus:border-white focus:ring-0 text-white placeholder-text-muted transition-colors duration-200"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 font-mono text-[10px] scrollbar-thin">
              {["all", ...categories].map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 border transition-all duration-200 uppercase tracking-wider cursor-pointer font-bold shrink-0 ${
                      active
                        ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                        : "border-border-hairline text-text-muted bg-surface-charcoal/30 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categorized Grid Section */}
          <div className="space-y-16">
            {displayCategories.map((cat) => {
              const items = filteredRegistry.filter((c) => c.category === cat);
              if (!items.length) return null;

              return (
                <section key={cat}>
                  <div className="flex items-center gap-4 mb-6 select-none">
                    <span className="material-symbols-outlined text-white text-[20px]">
                      {categoryIcons[cat]}
                    </span>
                    <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white">{cat}</h2>
                    <div className="flex-1 h-px bg-border-hairline"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-t border-l border-border-hairline">
                    {items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/components/${item.category}/${item.slug}`}
                        className="border-r border-b border-border-hairline p-6 hover:bg-surface-charcoal transition-colors duration-200 group cursor-pointer relative overflow-hidden flex flex-col justify-between h-80"
                      >
                        {/* Visual Miniature Box */}
                        <div className="mb-6 h-36 bg-pure-black border border-border-hairline flex items-center justify-center relative overflow-hidden select-none">
                          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#262626_1px,transparent_1px)] bg-[size:10px_10px]" />
                          
                          {item.slug === "magnetic-button" && (
                            <div className="px-4 py-2 border border-white/40 text-white/40 font-mono text-[9px] uppercase tracking-wider group-hover:border-white group-hover:text-white transition-colors duration-300">
                              Attract Grid
                            </div>
                          )}
                          {item.slug === "text-reveal" && (
                            <div className="flex flex-col gap-1 items-center">
                              <span className="font-mono text-[10px] text-white/20 line-through">invisible_state</span>
                              <span className="font-mono text-[10px] text-white/80 uppercase tracking-widest font-bold group-hover:scale-105 transition-transform duration-300">Reveal State</span>
                            </div>
                          )}
                          {item.slug === "fade-in" && (
                            <div className="w-8 h-8 rounded-full border border-dashed border-white/30 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                              <span className="material-symbols-outlined text-[16px] text-white/40 group-hover:text-white transition-colors">arrow_upward</span>
                            </div>
                          )}
                          {item.slug === "glitch-text" && (
                            <span className="font-display text-lg font-bold tracking-widest text-white/40 group-hover:text-white transition-all duration-150 select-none">
                              GLITCH
                            </span>
                          )}
                          {item.slug === "count-up" && (
                            <span className="font-mono text-xl font-bold text-white/50 group-hover:text-white transition-colors select-none">
                              74.2%
                            </span>
                          )}
                          {item.slug === "button" && (
                            <div className="px-4 py-1.5 bg-white text-black font-mono text-[9px] uppercase tracking-wider font-bold">
                              ACTION
                            </div>
                          )}
                          {item.slug === "card" && (
                            <div className="w-24 h-12 border border-white/20 group-hover:border-white/50 transition-colors bg-surface-charcoal" />
                          )}
                          {item.slug === "image-reveal" && (
                            <div className="w-16 h-20 border border-white/20 relative overflow-hidden flex items-center justify-center">
                              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 group-hover:skew-x-12 transition-all duration-500" />
                              <span className="material-symbols-outlined text-[20px] text-white/40 group-hover:scale-110 transition-transform">image</span>
                            </div>
                          )}
                          {item.slug === "image-stack" && (
                            <div className="relative w-12 h-16">
                              <div className="absolute inset-0 border border-white/10 bg-surface-charcoal translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
                              <div className="absolute inset-0 border border-white/20 bg-surface-charcoal translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" />
                              <div className="absolute inset-0 border border-white/40 bg-pure-black flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px] text-white/40">filter_none</span>
                              </div>
                            </div>
                          )}
                          {item.slug === "image-parallax" && (
                            <div className="w-20 h-14 border border-white/20 relative overflow-hidden flex items-center justify-center">
                              <div className="absolute w-28 h-20 bg-gradient-to-tr from-white/5 to-white/10 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
                              <span className="material-symbols-outlined text-[20px] text-white/40 group-hover:rotate-6 transition-transform">unfold_more</span>
                            </div>
                          )}
                          {item.slug === "living-text" && (
                            <div className="font-display text-sm font-black tracking-widest text-white/30 group-hover:text-white transition-all duration-300 flex gap-0.5 select-none">
                              {"LIVING".split("").map((c, i) => (
                                <span key={i} className="group-hover:scale-y-130 group-hover:-translate-y-1 transition-all duration-300 inline-block">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.slug === "gravity-card-stack" && (
                            <div className="relative w-16 h-24 border border-dashed border-white/20 flex flex-col items-center justify-start py-2 gap-1.5 overflow-hidden">
                              <div className="w-10 h-4 bg-white/10 border border-white/20 group-hover:translate-y-12 group-hover:rotate-6 transition-transform duration-500" />
                              <div className="w-10 h-4 bg-white/20 border border-white/30 group-hover:translate-y-10 group-hover:-rotate-3 transition-transform duration-500 delay-75" />
                              <div className="w-10 h-4 bg-white/30 border border-white/40 group-hover:translate-y-8 group-hover:rotate-12 transition-transform duration-500 delay-150" />
                            </div>
                          )}
                          {item.slug === "morphing-nav" && (
                            <div className="w-20 h-10 border border-white/20 relative flex items-center justify-between px-3 overflow-hidden rounded-md group-hover:border-white/40 transition-colors">
                              <div className="w-3 h-3 bg-white/40 rounded-full group-hover:scale-125 transition-transform" />
                              <div className="w-8 h-1.5 bg-white/20 rounded-full group-hover:w-12 transition-all" />
                              <div className="w-3 h-3 bg-white/10 rounded-full group-hover:bg-white/30 transition-colors" />
                            </div>
                          )}
                          {item.slug === "story-timeline" && (
                            <div className="relative w-10 h-24 flex items-center justify-center">
                              <div className="absolute inset-y-0 w-0.5 border-l border-dashed border-white/20 group-hover:border-white/40 transition-colors" />
                              <div className="w-3 h-3 rounded-full border-2 border-white/80 bg-pure-black relative z-10 group-hover:translate-y-6 transition-transform duration-700" />
                              <div className="absolute top-2 left-6 w-3 h-3 rounded bg-white/10 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-2 right-6 w-3 h-3 rounded bg-white/15 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          {item.slug === "void-button" && (
                            <div className="w-20 h-8 bg-pure-black border border-white/10 flex items-center justify-center font-mono text-[8px] uppercase tracking-wider text-white select-none">
                              THE VOID
                            </div>
                          )}
                          {item.slug === "brushed-titanium-button" && (
                            <div className="w-20 h-8 bg-neutral-900 border border-neutral-700/60 flex items-center justify-center font-mono text-[8px] uppercase tracking-wider text-neutral-300 select-none">
                              TITANIUM
                            </div>
                          )}
                          {item.slug === "liquid-gold-button" && (
                            <div className="w-20 h-8 bg-amber-500/10 border border-[#ffe066]/30 flex items-center justify-center font-mono text-[8px] uppercase tracking-wider text-amber-300 select-none">
                              LIQUID GOLD
                            </div>
                          )}
                          {item.slug === "guilloche-button" && (
                            <div className="w-20 h-8 bg-slate-950 border border-blue-900/40 flex items-center justify-center font-mono text-[8px] uppercase tracking-wider text-slate-300 select-none">
                              GUILLOCHÉ
                            </div>
                          )}
                          {item.slug === "pixel-melt" && (
                            <div className="w-28 h-28 bg-pure-black border border-white/10 relative overflow-hidden select-none">
                              <div className="absolute inset-0 flex flex-wrap gap-[1px] p-2">
                                {Array.from({ length: 64 }).map((_, i) => {
                                  const row = Math.floor(i / 8);
                                  const col = i % 8;
                                  const heat = Math.max(0, 1 - (Math.abs(row - 4) + Math.abs(col - 4)) / 8);
                                  return (
                                    <div
                                      key={i}
                                      className="w-[6px] h-[6px] transition-all duration-200"
                                      style={{
                                        background: `rgb(${Math.round(heat * 255)},${Math.round(heat * 255)},${Math.round(heat * 255)})`,
                                        opacity: Math.max(0.03, heat),
                                      }}
                                    />
                                  );
                                })}
                              </div>
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/5 rounded-full blur-sm group-hover:bg-white/20 group-hover:scale-150 transition-all duration-500" />
                            </div>
                          )}
                          {item.slug === "breathing-grid" && (
                            <div className="w-28 h-28 bg-pure-black border border-white/10 relative overflow-hidden select-none">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 grid grid-cols-5 gap-[1px]">
                                  {Array.from({ length: 25 }).map((_, i) => {
                                    const row = Math.floor(i / 5);
                                    const col = i % 5;
                                    const dist = Math.abs(row - 2) + Math.abs(col - 2);
                                    const breath = Math.sin((dist * 0.5 + Date.now() * 0.001) * Math.PI) * 0.5 + 0.5;
                                    const opacity = 0.03 + breath * 0.1;
                                    return (
                                      <div
                                        key={i}
                                        className="border border-white/10 transition-all duration-300"
                                        style={{ opacity }}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.03)_50%,transparent_52%)]" />
                            </div>
                          )}
                          {item.slug === "floating-embers" && (
                            <div className="w-28 h-28 bg-pure-black border border-white/10 relative overflow-hidden select-none">
                              <div className="absolute inset-0">
                                {Array.from({ length: 12 }).map((_, i) => {
                                  const left = 10 + (i * 23 + i * i * 7) % 80;
                                  const delay = i * 0.4;
                                  const size = 1 + (i % 3) * 0.8;
                                  return (
                                    <div
                                      key={i}
                                      className="absolute rounded-full"
                                      style={{
                                        left: `${left}%`,
                                        bottom: `${10 + (i * 13) % 60}%`,
                                        width: `${size * 2}px`,
                                        height: `${size * 2}px`,
                                        background: `hsl(${30 + i * 3}, 100%, ${55 + i * 3}%)`,
                                        boxShadow: `0 0 ${4 + size * 2}px hsl(${35 + i * 2}, 100%, 60%)`,
                                        opacity: 0.7 - i * 0.04,
                                        animation: `none`,
                                      }}
                                    />
                                  );
                                })}
                              </div>
                              <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-amber-200/5 blur-[3px]" />
                            </div>
                          )}
                          {item.slug === "scanline-drift" && (
                            <div className="w-28 h-28 bg-pure-black border border-white/10 relative overflow-hidden select-none">
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-amber-300/30 to-transparent blur-sm" />
                                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-[2px] mt-[1px]" />
                                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-300/10 to-transparent blur-[1px] mt-[2px]" />
                              </div>
                              <div className="absolute bottom-2 right-2 text-[7px] font-mono text-white/10">
                                3× mood
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-display text-lg font-bold text-white mb-2 uppercase tracking-tight">
                            {item.name}
                          </h3>
                          <p className="font-body text-xs text-text-muted mb-4 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {(categoryTags[item.slug] || ["UTILITY"]).map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[9px] px-2 py-0.5 border border-border-hairline text-text-muted group-hover:text-white group-hover:border-white/30 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
