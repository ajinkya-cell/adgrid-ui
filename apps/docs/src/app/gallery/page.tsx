"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { registry, type ComponentCategory } from "@/registry";

// ── Category config ───────────────────────────────────────────────
const CATEGORIES: { id: ComponentCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "apps" },
  { id: "animated", label: "Animated", icon: "animation" },
  { id: "buttons", label: "Buttons", icon: "smart_button" },
  { id: "backgrounds", label: "Backgrounds", icon: "blur_on" },
  { id: "primitives", label: "Primitives", icon: "category" },
  { id: "widgets", label: "Widgets", icon: "widgets" },
];

const CATEGORY_ACCENT: Record<ComponentCategory, string> = {
  animated: "#a78bfa",
  buttons: "#f59e0b",
  backgrounds: "#34d399",
  primitives: "#60a5fa",
  widgets: "#f472b6",
  charts: "#fb923c",
};

// ── Static thumbnail previews per component ──────────────────────
function ComponentThumbnail({ slug }: { slug: string; category: ComponentCategory }) {
  const thumbnails: Record<string, React.ReactNode> = {
    "living-text": (
      <div className="flex gap-[2px] select-none">
        {"LIVING".split("").map((c, i) => (
          <span
            key={i}
            className="font-display font-black text-xl text-white/30 group-hover:text-white transition-all duration-300 inline-block"
            style={{ transitionDelay: `${i * 30}ms`, transform: "translateY(0)" }}
          >
            {c}
          </span>
        ))}
      </div>
    ),
    "text-shuffle": (
      <div className="font-display font-black text-lg text-white/30 group-hover:text-white tracking-widest transition-colors duration-500 select-none">
        SHUFFLE
      </div>
    ),
    "gravity-card-stack": (
      <div className="relative w-14 h-20">
        {[3, 2, 1, 0].map((i) => (
          <div
            key={i}
            className="absolute border border-white/20 bg-white/5 group-hover:border-white/40 transition-all duration-500"
            style={{
              width: 48 - i * 4,
              height: 64 - i * 4,
              top: i * 3,
              left: i * 2,
              transitionDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
    ),
    "morphing-nav": (
      <div className="w-24 h-8 border border-white/20 rounded-full flex items-center justify-between px-3 group-hover:border-white/50 transition-colors">
        <div className="w-2 h-2 rounded-full bg-white/40 group-hover:scale-125 transition-transform" />
        <div className="flex gap-1">
          {[8, 12, 6].map((w, i) => (
            <div key={i} className="h-0.5 bg-white/25 group-hover:bg-white/60 transition-colors rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>
    ),
    "coverflow-carousel": (
      <div className="flex items-center gap-1 select-none">
        {[-1, 0, 1].map((i) => (
          <div
            key={i}
            className="border border-white/20 bg-white/5 transition-all duration-300 group-hover:border-white/40"
            style={{
              width: i === 0 ? 40 : 28,
              height: i === 0 ? 56 : 40,
              opacity: i === 0 ? 1 : 0.4,
              transform: `perspective(200px) rotateY(${i * -30}deg)`,
            }}
          />
        ))}
      </div>
    ),
    "image-reveal": (
      <div className="w-16 h-20 border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
          style={{ clipPath: "polygon(0 0, 50% 0, 40% 100%, 0 100%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px] text-white/30 group-hover:text-white/60 transition-colors">image</span>
        </div>
      </div>
    ),
    "image-parallax": (
      <div className="w-20 h-14 border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-500 scale-110" />
        <span className="material-symbols-outlined absolute inset-0 m-auto text-[20px] text-white/30 group-hover:text-white/60 transition-colors" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          unfold_more
        </span>
      </div>
    ),
    "void-button": (
      <div className="relative w-24 h-9 bg-black border border-white/10 group-hover:border-white/30 flex items-center justify-center transition-colors overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/0 via-neutral-700/0 to-neutral-800/0 group-hover:via-neutral-700/60 transition-all duration-500" />
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white relative z-10 transition-colors">THE VOID</span>
      </div>
    ),
    "brushed-titanium-button": (
      <div className="w-24 h-9 bg-neutral-900 border border-neutral-700/60 group-hover:border-neutral-500 flex items-center justify-center font-mono text-[8px] uppercase tracking-wider text-neutral-400 group-hover:text-neutral-200 transition-colors select-none">
        TITANIUM
      </div>
    ),
    "liquid-gold-button": (
      <div className="relative w-24 h-9 overflow-hidden border border-[#ffe066]/20 group-hover:border-[#ffe066]/50 transition-colors">
        <div className="absolute inset-0 bg-gradient-conic from-amber-500 via-yellow-300 to-amber-500 opacity-20 group-hover:opacity-40 transition-opacity animate-spin" style={{ animationDuration: "4s" }} />
        <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm" />
        <span className="relative z-10 font-mono text-[8px] uppercase tracking-wider text-amber-300 flex items-center justify-center h-full">LIQUID GOLD</span>
      </div>
    ),
    "guilloche-button": (
      <div className="w-24 h-9 bg-slate-950 border border-blue-900/40 group-hover:border-blue-700/60 flex items-center justify-center font-mono text-[8px] uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors select-none overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(100,120,180,0.3) 2px, rgba(100,120,180,0.3) 4px)" }} />
        <span className="relative z-10">GUILLOCHÉ</span>
      </div>
    ),
    "pixel-melt": (
      <div className="w-24 h-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-8 gap-[1px] p-1">
          {Array.from({ length: 48 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const heat = Math.max(0, 1 - (Math.abs(row - 3) + Math.abs(col - 4)) / 6);
            return (
              <div key={i} className="group-hover:opacity-100 transition-opacity duration-500" style={{ background: `rgba(255,255,255,${heat * 0.4 + 0.02})`, transitionDelay: `${i * 5}ms` }} />
            );
          })}
        </div>
      </div>
    ),
    "breathing-grid": (
      <div className="w-24 h-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-6 gap-[1px] p-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="border border-white/10 group-hover:border-white/25 transition-colors duration-300" style={{ transitionDelay: `${i * 20}ms` }} />
          ))}
        </div>
      </div>
    ),
    "floating-embers": (
      <div className="w-24 h-16 bg-black relative overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full group-hover:opacity-100 transition-opacity duration-700"
            style={{
              left: `${10 + (i * 23) % 80}%`,
              bottom: `${10 + (i * 17) % 70}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              background: `hsl(${30 + i * 5}, 100%, 65%)`,
              boxShadow: `0 0 ${4 + i}px hsl(${35}, 100%, 60%)`,
              opacity: 0.4,
              transitionDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
    ),
    "spotlight-grid": (
      <div className="w-24 h-16 bg-black relative overflow-hidden border border-white/5">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/15 transition-colors duration-500 blur-sm" />
        </div>
      </div>
    ),
    "lumina-wave": (
      <div className="w-24 h-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0f1a, #1a0a2e, #0a1a2e)" }} />
        <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(120, 80, 255, 0.4), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(0, 200, 255, 0.3), transparent 60%)" }} />
      </div>
    ),
    "chrome-input": (
      <div className="w-28 h-8 border border-white/15 bg-black/60 flex items-center px-2 gap-2 group-hover:border-white/40 transition-colors">
        <div className="w-1.5 h-4 bg-white/60 animate-pulse" />
        <span className="font-mono text-[8px] text-white/20 group-hover:text-white/40 transition-colors">Transmission ID</span>
      </div>
    ),
    "anisotropic-knob": (
      <div className="relative w-12 h-12">
        <div className="w-full h-full rounded-full border-2 border-white/20 bg-gradient-to-br from-neutral-700 to-neutral-900 group-hover:border-white/40 transition-colors flex items-center justify-center">
          <div className="w-1 h-4 bg-white/40 rounded-full" style={{ transform: "translateY(-4px)" }} />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono text-[7px] text-white/25 tracking-widest">DECIBELS</div>
      </div>
    ),
    "mechanical-timer": (
      <div className="font-mono text-xl font-bold text-white/30 group-hover:text-white/70 transition-colors tracking-wider tabular-nums select-none">
        00:00
      </div>
    ),
    "slingshot-chassis": (
      <div className="relative w-20 h-12 border border-white/20 group-hover:border-white/40 transition-colors flex items-center justify-center overflow-hidden">
        <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="absolute right-0 inset-y-0 w-3 bg-gradient-to-l from-white/10 to-transparent" />
        <span className="font-mono text-[8px] text-white/30 uppercase tracking-wider">drag</span>
      </div>
    ),
    "laser-vault-password": (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-6 h-6 border border-white/10 group-hover:border-white/30 flex items-center justify-center font-mono text-[8px] text-white/20 group-hover:text-white/50 transition-all duration-200" style={{ transitionDelay: `${i * 30}ms` }}>
            {i + 1}
          </div>
        ))}
      </div>
    ),
    "premium-hero": (
      <div className="w-24 h-14 bg-white relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:6px_6px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-1 bg-black/20 rounded-full" />
          <div className="w-8 h-1 bg-black/10 rounded-full" />
          <div className="w-10 h-3 bg-black/80 mt-1 flex items-center justify-center">
            <span className="text-white text-[5px] font-bold">EXPLORE</span>
          </div>
        </div>
      </div>
    ),
    "dot-matrix": (
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full group-hover:opacity-100 transition-opacity duration-300 bg-white/25" style={{ opacity: Math.random() > 0.5 ? 0.6 : 0.1, transitionDelay: `${i * 8}ms` }} />
        ))}
      </div>
    ),
    "scroll-progress": (
      <div className="flex items-center gap-3">
        <div className="h-16 w-0.5 bg-white/10 relative flex items-start justify-center pt-1">
          <div className="w-full h-6 bg-white/50 group-hover:h-10 transition-all duration-500" />
        </div>
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[1px] bg-white/20 group-hover:bg-white/50 transition-colors" style={{ width: i % 2 === 0 ? 12 : 6, transitionDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
    ),
    "now-playing-card": (
      <div className="w-28 h-14 border border-white/15 bg-black/80 rounded flex items-center gap-2 px-2 group-hover:border-white/35 transition-colors">
        <div className="w-10 h-10 bg-white/10 rounded relative overflow-hidden shrink-0">
          <div className="absolute inset-0 rounded-full border border-white/10 w-4 h-4 m-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <div className="h-1.5 bg-white/30 rounded-full w-full" />
          <div className="h-1 bg-white/15 rounded-full w-3/4" />
          <div className="h-1 bg-white/10 rounded-full w-1/2 mt-1" />
        </div>
      </div>
    ),
    "wheel-picker": (
      <div className="flex flex-col items-center gap-1">
        <div className="w-16 h-14 border border-white/20 relative overflow-hidden group-hover:border-white/40 transition-colors">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-white/15 h-5" />
          <div className="flex flex-col items-center font-mono text-[7px] text-white/30 gap-1 pt-1">
            <span className="text-white/10">Vue</span>
            <span className="text-white group-hover:text-white/80">React</span>
            <span className="text-white/10">Next.js</span>
          </div>
        </div>
      </div>
    ),
    "expand-on-hover": (
      <div className="flex flex-col gap-0.5 w-24">
        {[0.4, 1, 0.4].map((_h, i) => (
          <div key={i} className="border border-white/15 group-hover:border-white/40 bg-white/3 overflow-hidden transition-all duration-500 flex items-center justify-center" style={{ height: i === 1 ? (16 + 16) : 12, transitionDelay: `${i * 80}ms` }}>
            <div className="w-8 h-0.5 bg-white/20 rounded-full" />
          </div>
        ))}
      </div>
    ),
    "metallic-form": (
      <div className="flex flex-col gap-1.5 w-24">
        {[14, 10, 14].map((w, i) => (
          <div key={i} className="h-4 border border-white/10 group-hover:border-white/25 bg-black/40 transition-colors px-2 flex items-center" style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="bg-white/15 rounded-full group-hover:bg-white/30 transition-colors" style={{ width: w, height: 4 }} />
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {thumbnails[slug] ?? (
        <div className="flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px] text-white/15 group-hover:text-white/35 transition-colors">widgets</span>
        </div>
      )}
    </div>
  );
}

// ── Animated card ────────────────────────────────────────────────
function GalleryCard({
  item,
  index,
  accent,
}: {
  item: (typeof registry)[number];
  index: number;
  accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05, ease: [0.25, 1, 0.5, 1] }}
    >
      <Link
        href={`/present/${item.category}/${item.slug}`}
        className="group relative flex flex-col bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white/20 transition-all duration-300 overflow-hidden"
        style={{ minHeight: 260 }}
      >
        {/* Sweep glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}0d 0%, transparent 70%)` }}
        />

        {/* Top accent line */}
        <div
          className="absolute top-0 inset-x-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
        />

        {/* Category pill */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="font-mono text-[8px] uppercase tracking-[0.2em] px-1.5 py-0.5 border"
            style={{
              color: accent,
              borderColor: `${accent}30`,
              background: `${accent}10`,
            }}
          >
            {item.category}
          </span>
        </div>

        {/* Present mode link */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="font-mono text-[8px] uppercase tracking-wider text-white/40 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">play_arrow</span>
            present
          </span>
        </div>

        {/* Component preview */}
        <div className="flex-1 flex items-center justify-center p-6 pt-10 min-h-[160px] relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
          <ComponentThumbnail slug={item.slug} category={item.category} />
        </div>

        {/* Info strip */}
        <div className="border-t border-[#1f1f1f] group-hover:border-white/10 px-4 py-3 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-bold text-white/80 group-hover:text-white transition-colors uppercase tracking-tight leading-tight">
                {item.name}
              </h3>
              <p className="font-body text-[10px] text-white/25 mt-0.5 line-clamp-1 leading-relaxed group-hover:text-white/40 transition-colors">
                {item.description.split(".")[0]}
              </p>
            </div>
            <div className="shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-white/15 group-hover:text-white/50 transition-colors">arrow_forward</span>
            </div>
          </div>
          {item.propDefs && item.propDefs.length > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]" style={{ color: accent, opacity: 0.7 }}>tune</span>
              <span className="font-mono text-[8px] tracking-wider" style={{ color: accent, opacity: 0.6 }}>
                {item.propDefs.length} tweakable props
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);

  const visible = registry.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.includes(q);
    return matchesCat && matchesSearch;
  });

  useEffect(() => {
    setCount(visible.length);
  }, [visible.length]);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* ── Hero header ── */}
      <div className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="max-w-[1600px] mx-auto px-6 pt-12 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 font-mono text-[10px] text-white/25 uppercase tracking-widest select-none">
            <Link href="/components" className="hover:text-white/60 transition-colors">docs</Link>
            <span>/</span>
            <span className="text-white/50">gallery</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white leading-none mb-3">
                Component<br />
                <span className="text-white/25">Gallery</span>
              </h1>
              <p className="font-body text-sm text-white/35 max-w-lg leading-relaxed">
                Every component in one place. Click any card to open present mode — full-screen, no chrome, interactive.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="font-mono text-[10px] text-white/25 uppercase tracking-widest border border-[#1f1f1f] px-3 py-1.5 tabular-nums">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="inline-block"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
                {" "}components
              </div>
              <Link
                href="/components"
                className="font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white border border-[#1f1f1f] hover:border-white/30 px-3 py-1.5 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[12px]">description</span>
                docs
              </Link>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="max-w-[1600px] mx-auto px-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin shrink-0">
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                const catCount = cat.id === "all"
                  ? registry.length
                  : registry.filter((i) => i.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all duration-200 shrink-0 cursor-pointer ${
                      active
                        ? "border-white text-white"
                        : "border-transparent text-white/30 hover:text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{cat.icon}</span>
                    {cat.label}
                    <span className={`text-[8px] tabular-nums ${active ? "text-white/50" : "text-white/20"}`}>
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="flex-1 flex justify-end">
              <div className="relative w-full max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-[16px]">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent border border-[#1f1f1f] focus:border-white/30 py-2.5 pl-9 pr-3 font-mono text-[11px] text-white placeholder-white/20 outline-none transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {visible.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <span className="material-symbols-outlined text-[48px] text-white/10">search_off</span>
              <p className="font-mono text-sm text-white/25 uppercase tracking-widest">No components found</p>
              <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="font-mono text-[10px] text-white/30 hover:text-white border border-[#1f1f1f] hover:border-white/30 px-3 py-1.5 transition-colors">
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-px border border-[#1f1f1f]"
            >
              {visible.map((item, i) => (
                <GalleryCard
                  key={item.slug}
                  item={item}
                  index={i}
                  accent={CATEGORY_ACCENT[item.category]}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer note ── */}
        {visible.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 font-mono text-[9px] text-white/15 uppercase tracking-widest select-none">
            <span className="material-symbols-outlined text-[12px]">play_arrow</span>
            click any card to enter present mode
          </div>
        )}
      </div>
    </div>
  );
}
