"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { registry, type ComponentCategory } from "@/registry";
import { GalleryIframePreview } from "@/components/site/GalleryIframePreview";

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

// ── Helpers to determine layout role & scattered spans ─────────────
function isAmbientCanvas(slug: string, category: ComponentCategory) {
  return (
    category === "backgrounds" ||
    slug === "pixel-melt" ||
    slug === "breathing-grid" ||
    slug === "breathing-background" ||
    slug === "floating-embers" ||
    slug === "spotlight-grid" ||
    slug === "lumina-wave" ||
    slug === "matrix-rain" ||
    slug === "flickering-grid-playground" ||
    slug === "dot-pattern-playground"
  );
}

function getCardSpan(slug: string, category: ComponentCategory) {
  // Wide: Big atmospheric canvases & wide horizontal showcases
  if (
    slug === "pixel-melt" ||
    slug === "spotlight-grid" ||
    slug === "floating-embers" ||
    slug === "lumina-wave" ||
    slug === "matrix-rain" ||
    slug === "breathing-grid" ||
    slug === "coverflow-carousel" ||
    slug === "infinite-scroll" ||
    slug === "image-parallax" ||
    slug === "living-text" ||
    slug === "bento-grid" ||
    slug === "globe" ||
    slug === "hero" ||
    slug === "premium-hero"
  ) {
    return "col-span-12 sm:col-span-6 lg:col-span-6 min-h-[300px]";
  }

  // Compact: Buttons & modular micro-controls
  if (
    category === "buttons" ||
    slug === "anisotropic-knob" ||
    slug === "switch" ||
    slug === "stepper" ||
    slug === "otp-input" ||
    slug === "tooltip" ||
    slug === "animated-icons-1" ||
    slug === "scroll-progress"
  ) {
    return "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[220px]";
  }

  // Medium: Standard interactive cards & widgets
  return "col-span-12 sm:col-span-6 lg:col-span-4 min-h-[260px]";
}

// ── Card Component ────────────────────────────────────────────────
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
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const ambient = isAmbientCanvas(item.slug, item.category);
  const spanClass = getCardSpan(item.slug, item.category);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.04, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -5 }}
      className={`h-full ${spanClass}`}
    >
      <Link
        href={`/present/${item.category}/${item.slug}`}
        className="group relative flex flex-col h-full rounded-2xl skeuo-bevel-card transition-all duration-300 overflow-hidden"
      >
        {/* Category accent glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{ background: `radial-gradient(circle at 50% 50%, ${accent}16 0%, transparent 70%)` }}
        />

        {ambient ? (
          /* ── Ambient Background Canvas: Edge-to-edge, zero intro, just name ── */
          <div className="relative w-full h-full min-h-[260px] flex-1 overflow-hidden">
            <GalleryIframePreview slug={item.slug} title={item.name} mode="gallery" className="min-h-[260px]" />

            {/* Minimalist floating title badge */}
            <div className="absolute bottom-3.5 left-3.5 z-20 pointer-events-none flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-2 group-hover:border-white/25 group-hover:bg-black/85 transition-all">
                <span
                  className="font-poppins text-[13px] font-medium text-white/95 group-hover:text-white transition-colors tracking-wide"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {item.name}
                </span>
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest pl-1 border-l border-white/10">
                  CANVAS
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Interactive Component: Full-div presentation without nested socket ── */
          <div className="relative w-full h-full flex-1 flex flex-col justify-between">
            {/* Component preview occupying the full div */}
            <div className="relative w-full flex-1 min-h-[170px] flex items-center justify-center overflow-hidden">
              <GalleryIframePreview slug={item.slug} title={item.name} mode="gallery" />
            </div>

            {/* Clean bottom bar with name & category indicator */}
            <div className="border-t border-white/[0.05] px-4 py-2.5 bg-black/40 backdrop-blur-xs flex items-center justify-between z-20">
              <h3
                className="font-poppins text-[13px] font-medium text-white/90 group-hover:text-white transition-colors tracking-wide"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {item.name}
              </h3>
              <span className="material-symbols-outlined text-[13px] text-white/25 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all">
                arrow_forward
              </span>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// ── Stats Badge ───────────────────────────────────────────────────
function AnimatingComponentsCount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span className="font-mono text-emerald-400 font-bold drop-shadow-[0_0_4px_rgba(74,222,128,0.3)]">{displayValue}</span>;
}

function CompletedComponentsBadge() {
  return (
    <div className="font-poppins text-[11px] font-medium text-white/50 bg-[#090909] border border-white/5 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)] px-4 py-2.5 rounded-full flex items-center gap-2.5 select-none">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="tracking-wide">
        <AnimatingComponentsCount value={registry.length} /> components completed,{" "}
        <span className="text-emerald-400 font-medium">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            more to come
          </motion.span>
        </span>
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const visible = registry.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090808] font-poppins" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Explicit Poppins Font Injection for absolute browser reliability */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap');
        .font-poppins,
        .font-sans,
        .font-body {
          font-family: 'Poppins', sans-serif !important;
        }
      ` }} />

      {/* ── Hero header ── */}
      <div className="border-b border-white/[0.02] bg-[#050505] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="max-w-[1600px] mx-auto px-6 pt-12 pb-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1
                className="font-poppins text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Component <span className="text-white/30 font-medium">Registry</span>
              </h1>
              <p
                className="font-poppins text-sm text-white/30 max-w-lg leading-relaxed"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Click any module to launch interactive sandbox mode with real-time parameter tweaking.
              </p>
            </div>

            <div className="shrink-0 lg:mb-1">
              <CompletedComponentsBadge />
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls / Recessed Dashboard Deck ── */}
      <div className="max-w-[1600px] mx-auto px-6 mt-8 mb-6">
        <div className="skeuo-dashboard-deck rounded-2xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 skeuo-inner-socket rounded-xl p-1.5 overflow-x-auto scrollbar-none shrink-0 relative">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              const catCount =
                cat.id === "all"
                  ? registry.length
                  : registry.filter((i) => i.category === cat.id).length;
              const accent = cat.id === "all" ? "#f59e0b" : CATEGORY_ACCENT[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="relative z-10 flex items-center gap-2 px-3.5 py-2.5 font-poppins text-[11px] font-medium tracking-wide transition-all duration-200 shrink-0 cursor-pointer select-none outline-none rounded-lg"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: active ? "#000000" : "rgba(255, 255, 255, 0.45)",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-white rounded-lg border border-white/35 -z-10"
                      style={{
                        boxShadow: `0 0 12px ${accent}65, 0 2px 4px rgba(0, 0, 0, 0.25)`,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  {/* Category Indicator LED */}
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: active ? accent : "rgba(255, 255, 255, 0.1)",
                      boxShadow: active ? `0 0 6px ${accent}` : "none",
                    }}
                  />
                  <span className="material-symbols-outlined text-[12px]">{cat.icon}</span>
                  {cat.label}
                  <span className="text-[8px] tabular-nums opacity-60">
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recessed Search Box */}
          <div className="relative w-full lg:max-w-xs skeuo-input-well rounded-xl flex items-center px-3 gap-2 border border-white/5 focus-within:border-white/20 transition-all duration-300">
            <span className="material-symbols-outlined text-white/25 text-[16px] shrink-0">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH REGISTRY..."
              className="w-full bg-transparent py-2.5 font-mono text-[10px] text-white placeholder-white/20 outline-none uppercase tracking-wider"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors cursor-pointer shrink-0">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Scattered Formation Grid ── */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {visible.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4 bg-[#070707] border border-white/[0.02] rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]"
            >
              <span className="material-symbols-outlined text-[48px] text-white/10">search_off</span>
              <p className="font-mono text-sm text-white/25 uppercase tracking-widest">No modules found</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="font-mono text-[10px] text-white/30 hover:text-white border border-[#1f1f1f] hover:border-white/30 px-3 py-1.5 transition-colors cursor-pointer rounded-lg"
              >
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
              className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-6"
            >
              {visible.map((item, i) => (
                <GalleryCard
                  key={item.slug}
                  item={item}
                  index={i}
                  accent={CATEGORY_ACCENT[item.category] || "#a78bfa"}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer note ── */}
        {visible.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-2 font-mono text-[8px] text-white/15 uppercase tracking-[0.2em] select-none">
            <span className="material-symbols-outlined text-[10px] animate-pulse">play_arrow</span>
            Select any card to enter PRESENT mode
          </div>
        )}
      </div>
    </div>
  );
}
