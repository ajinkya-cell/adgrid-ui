"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { registry, type ComponentCategory } from "@/registry";
import { GalleryIframePreview } from "@/components/site/GalleryIframePreview";

// ── Category config ───────────────────────────────────────────────
const CATEGORY_ACCENT: Record<ComponentCategory, string> = {
  animated: "#a78bfa",
  buttons: "#f59e0b",
  backgrounds: "#34d399",
  primitives: "#60a5fa",
  widgets: "#f472b6",
  charts: "#fb923c",
};

// ── Curated slugs list for /gallery ─────────────────────────────────
const CURATED_GALLERY_SLUGS = [
  "coverflow-carousel",
  "laser-vault-password",
  "anisotropic-knob",
  "datepicker",
  "dot-matrix",
  "github-heatmap",
  "spotlight-text",
  "void-button",
  "matrix-rain",
  "globe",
  "brushed-titanium-button",
  "text-shuffle",
  "breathing-scale-card",
  "breathing-grid",
  "meter",
  "now-playing-card",
  "simple-card",
  "liquid-gold-button",
  "guilloche-button",
  "timeline",
  "floating-embers",
  "dashed-marquee",
  "button-alpha",
];

const STATIC_PREVIEWS: Record<string, string> = {
  "laser-vault-password": "/previews/vault.png",
  "datepicker": "/previews/date-picker.png",
};

const curatedRegistry = CURATED_GALLERY_SLUGS
  .map((slug) => registry.find((item) => item.slug === slug))
  .filter((item): item is (typeof registry)[number] => Boolean(item));

// ── Helpers to determine layout role & scattered spans ─────────────
function isAmbientCanvas(slug: string, category: ComponentCategory) {
  return (
    category === "backgrounds" ||
    slug === "breathing-grid" ||
    slug === "floating-embers" ||
    slug === "matrix-rain"
  );
}

function getCardSpan(slug: string, category: ComponentCategory) {
  // Feature Showcase / Biggest Cards (8-col width + 2-row height = 464px)
  if (
    slug === "coverflow-carousel" ||
    slug === "github-heatmap" ||
    slug === "breathing-scale-card" ||
    slug === "now-playing-card"
  ) {
    return "col-span-12 sm:col-span-6 lg:col-span-8 row-span-2";
  }

  // Large Panoramic Canvases & Big Showcases (6-col width + 2-row height = 464px)
  if (
    slug === "meter" ||
    slug === "globe" ||
    slug === "timeline" ||
    slug === "matrix-rain" ||
    slug === "floating-embers" ||
    slug === "breathing-grid"
  ) {
    return "col-span-12 sm:col-span-6 lg:col-span-6 row-span-2";
  }

  // Wide 1-row marquee (8-col width + 1-row height = 220px)
  if (slug === "dashed-marquee") {
    return "col-span-12 sm:col-span-6 lg:col-span-8 row-span-1";
  }

  // Standard 2-row Interactive Cards & Widgets (4-col width + 2-row height = 464px)
  if (
    slug === "laser-vault-password" ||
    slug === "datepicker" ||
    slug === "dot-matrix" ||
    slug === "anisotropic-knob" ||
    slug === "simple-card"
  ) {
    return "col-span-12 sm:col-span-6 lg:col-span-4 row-span-2";
  }

  // Buttons & Standard 1-row items (4-col width + 1-row height = 220px)
  if (category === "buttons") {
    return "col-span-12 sm:col-span-6 lg:col-span-4 row-span-1";
  }

  return "col-span-12 sm:col-span-6 lg:col-span-4 row-span-1";
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
          <div className="relative w-full h-full flex-1 overflow-hidden">
            <GalleryIframePreview slug={item.slug} title={item.name} mode="gallery" className="w-full h-full" />

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
        ) : STATIC_PREVIEWS[item.slug] ? (
          /* ── Static Image Preview (e.g. Vault, Datepicker) ── */
          <div className="relative w-full h-full flex-1 flex flex-col justify-between">
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden bg-[#070707] p-4">
              <img
                src={STATIC_PREVIEWS[item.slug]}
                alt={item.name}
                className="w-full h-full object-contain max-h-[380px] select-none transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
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
        ) : (
          /* ── Interactive Component: Full-div presentation without nested socket ── */
          <div className="relative w-full h-full flex-1 flex flex-col justify-between">
            {/* Component preview occupying the full div */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
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

// ── Main Page ─────────────────────────────────────────────────────
export default function GalleryPage() {
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
          <h1
            className="font-poppins text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Component <span className="text-white/30 font-medium">Registry</span>
          </h1>
        </div>
      </div>

      {/* ── Scattered Formation Grid ── */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 auto-rows-[220px] grid-flow-dense gap-6">
          {curatedRegistry.map((item, i) => (
            <GalleryCard
              key={item.slug}
              item={item}
              index={i}
              accent={CATEGORY_ACCENT[item.category] || "#a78bfa"}
            />
          ))}
        </div>

        {/* ── Footer note ── */}
        <div className="mt-12 flex items-center justify-center gap-2 font-mono text-[8px] text-white/15 uppercase tracking-[0.2em] select-none">
          <span className="material-symbols-outlined text-[10px] animate-pulse">play_arrow</span>
          Select any card to enter PRESENT mode
        </div>
      </div>
    </div>
  );
}
