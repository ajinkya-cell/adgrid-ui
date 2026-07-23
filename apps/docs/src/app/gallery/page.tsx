"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { registry, type ComponentCategory } from "@/registry";
import { GalleryCardPreview } from "@/components/site/GalleryCardPreview";
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

// ── Static thumbnail previews per component ──────────────────────
export function ComponentThumbnail({ slug, category }: { slug: string; category: ComponentCategory }) {
  const thumbnails: Record<string, React.ReactNode> = {
    /* ── Animated ─────────────────────────────────── */
    "living-text": (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[1, 0.6, 0.9, 0.4, 0.75, 1].map((h, i) => (
            <div key={i} className="w-[3px] rounded-full bg-white/20 group-hover:bg-white/70 transition-all duration-500"
              style={{ height: `${h * 28}px`, transitionDelay: `${i * 40}ms`, alignSelf: "flex-end" }} />
          ))}
        </div>
        <div className="flex gap-1.5">
          {[0.5, 1, 0.7, 0.9, 0.3, 0.8].map((h, i) => (
            <div key={i} className="w-[3px] rounded-full bg-white/10 group-hover:bg-white/40 transition-all duration-500"
              style={{ height: `${h * 20}px`, transitionDelay: `${i * 40 + 200}ms`, alignSelf: "flex-end" }} />
          ))}
        </div>
      </div>
    ),
    "spotlight-text": (
      <div className="relative w-24 h-14 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(232,232,90,0) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity duration-700"
          style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(232,232,90,0.18) 0%, transparent 65%)" }} />
        <div className="w-16 h-[2px] bg-white/10 group-hover:bg-white/50 transition-colors duration-500" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-white/5 group-hover:bg-white/20 transition-colors duration-500" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-[1px] bg-white/5 group-hover:bg-white/20 transition-colors duration-500" />
      </div>
    ),
    "text-shuffle": (
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-[3px] rounded-full transition-all duration-300 group-hover:bg-white/60"
            style={{ background: "rgba(255,255,255,0.12)", width: [16, 10, 14, 8, 16, 12, 10, 16, 8, 14, 10, 16][i], transitionDelay: `${i * 30}ms` }} />
        ))}
      </div>
    ),
    "gravity-card-stack": (
      <div className="relative w-14 h-[72px]">
        {[3, 2, 1, 0].map((i) => (
          <div key={i} className="absolute rounded-sm border border-white/[0.12] group-hover:border-white/30 transition-all duration-500"
            style={{
              background: `rgba(255,255,255,${0.015 + i * 0.01})`,
              width: 44 - i * 4, height: 60 - i * 4,
              top: i * 4, left: i * 2,
              boxShadow: i === 0 ? "0 4px 12px rgba(0,0,0,0.5)" : "none",
              transitionDelay: `${i * 50}ms`,
            }} />
        ))}
      </div>
    ),
    "morphing-nav": (
      <div className="w-[88px] h-8 rounded-full border border-white/15 group-hover:border-white/35 flex items-center justify-between px-3 transition-colors duration-300"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-white/70 group-hover:shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-all duration-300" />
        <div className="flex flex-col gap-[3px]">
          {[12, 8, 10].map((w, i) => (
            <div key={i} className="h-[1.5px] rounded-full bg-white/20 group-hover:bg-white/55 transition-colors duration-300" style={{ width: w, transitionDelay: `${i * 40}ms` }} />
          ))}
        </div>
      </div>
    ),
    "coverflow-carousel": (
      <div className="flex items-center gap-[5px]">
        {[-1, 0, 1].map((i) => (
          <div key={i} className="rounded-sm border border-white/10 group-hover:border-white/30 transition-all duration-400"
            style={{
              width: i === 0 ? 36 : 24, height: i === 0 ? 50 : 36,
              opacity: i === 0 ? 1 : 0.35,
              background: i === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
              transform: `perspective(180px) rotateY(${i * -28}deg)`,
              boxShadow: i === 0 ? "0 4px 16px rgba(0,0,0,0.4)" : "none",
            }} />
        ))}
      </div>
    ),
    "cards-two": (
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[-1, 0, 1].map((i) => (
          <div key={i} className="absolute rounded-sm border border-white/10 group-hover:border-white/30 transition-all duration-500"
            style={{
              width: 22, height: 32,
              opacity: i === 0 ? 1 : 0.3,
              background: i === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
              transform: `perspective(100px) rotateY(${i * 40}deg) translateZ(${i === 0 ? 10 : -6}px) translateX(${i * 16}px)`,
              zIndex: i === 0 ? 10 : 1,
              boxShadow: i === 0 ? "0 6px 20px rgba(0,0,0,0.5)" : "none",
              transitionDelay: `${Math.abs(i) * 60}ms`,
            }} />
        ))}
      </div>
    ),
    "image-reveal": (
      <div className="w-[60px] h-[72px] relative overflow-hidden rounded-sm border border-white/10 group-hover:border-white/25 transition-colors">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)" }} />
        <div className="absolute inset-0 transition-all duration-700 group-hover:opacity-100 opacity-0"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.15) 0%, transparent 55%)", clipPath: "polygon(0 0, 52% 0, 42% 100%, 0 100%)" }} />
        <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.08) 0%, transparent 50%)", clipPath: "polygon(0 0, 52% 0, 42% 100%, 0 100%)" }} />
        <div className="absolute inset-y-0 left-[42%] w-[1.5px] bg-white/15 group-hover:bg-white/50 group-hover:shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-500" />
      </div>
    ),
    "image-parallax": (
      <div className="w-[72px] h-[52px] relative overflow-hidden rounded-sm border border-white/10 group-hover:border-white/25 transition-colors">
        <div className="absolute inset-0 scale-110 group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-700"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border border-white/10 group-hover:border-white/30 transition-all duration-500 rotate-45 group-hover:scale-110" />
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent 60%)" }} />
      </div>
    ),

    /* ── Buttons ──────────────────────────────────── */
    "void-button": (
      <div className="relative w-[88px] h-9 border border-white/8 group-hover:border-white/25 flex items-center justify-center transition-all duration-400 overflow-hidden rounded-[3px]"
        style={{ background: "rgba(0,0,0,0.95)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />
        <div className="w-8 h-[1.5px] bg-white/15 group-hover:bg-white/50 rounded-full transition-colors duration-400" />
      </div>
    ),
    "brushed-titanium-button": (
      <div className="w-[88px] h-9 relative overflow-hidden rounded-[3px] border border-white/8 group-hover:border-white/20 transition-colors duration-300"
        style={{ background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5)" }}>
        <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-400"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-[2px] rounded-full bg-white/15 group-hover:bg-white/40 transition-colors duration-300" />
        </div>
      </div>
    ),
    "liquid-gold-button": (
      <div className="relative w-[88px] h-9 overflow-hidden rounded-[3px] border border-amber-400/15 group-hover:border-amber-400/40 transition-colors duration-400"
        style={{ background: "rgba(10,8,0,0.95)" }}>
        <div className="absolute -inset-1 opacity-20 group-hover:opacity-50 transition-opacity duration-700 animate-spin"
          style={{ background: "conic-gradient(from 0deg, #f59e0b, #fbbf24, #d97706, #f59e0b)", animationDuration: "5s", filter: "blur(6px)" }} />
        <div className="absolute inset-0" style={{ background: "rgba(8,6,0,0.85)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-amber-400/25 group-hover:border-amber-400/60 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.2)] transition-all duration-400" />
        </div>
      </div>
    ),
    "guilloche-button": (
      <div className="w-[88px] h-9 relative overflow-hidden rounded-[3px] border border-slate-700/40 group-hover:border-slate-500/60 transition-colors duration-300"
        style={{ background: "linear-gradient(135deg, #070a14, #0c1020)" }}>
        <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={{ backgroundImage: "repeating-linear-gradient(30deg, rgba(100,130,220,0.15) 0px, rgba(100,130,220,0.15) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-30deg, rgba(100,130,220,0.10) 0px, rgba(100,130,220,0.10) 1px, transparent 1px, transparent 12px)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-slate-600/30 group-hover:border-slate-400/50 transition-colors" style={{ boxShadow: "inset 0 0 8px rgba(100,130,220,0.1)" }} />
        </div>
      </div>
    ),

    /* ── Backgrounds ──────────────────────────────── */
    "pixel-melt": (
      <div className="w-[88px] h-[60px] relative overflow-hidden rounded-sm">
        <div className="absolute inset-0 grid grid-cols-8 gap-[1.5px] p-1.5">
          {Array.from({ length: 40 }).map((_, i) => {
            const row = Math.floor(i / 8); const col = i % 8;
            const heat = Math.max(0, 1 - (Math.abs(row - 2) + Math.abs(col - 4)) / 5);
            return <div key={i} className="rounded-[1px] transition-all duration-500 group-hover:opacity-100"
              style={{ background: `rgba(255,255,255,${heat * 0.35 + 0.02})`, transitionDelay: `${i * 8}ms`, opacity: 0.5 }} />;
          })}
        </div>
      </div>
    ),
    "breathing-grid": (
      <div className="w-[88px] h-[60px] relative overflow-hidden rounded-sm">
        <div className="absolute inset-0 grid grid-cols-6 gap-[1.5px] p-1.5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border border-white/8 group-hover:border-white/22 group-hover:bg-white/[0.02] transition-all duration-400 rounded-[1px]"
              style={{ transitionDelay: `${i * 25}ms` }} />
          ))}
        </div>
      </div>
    ),
    "floating-embers": (
      <div className="w-[88px] h-[60px] rounded-sm overflow-hidden relative" style={{ background: "linear-gradient(180deg, #080806, #0c0a06)" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="absolute rounded-full transition-opacity duration-700 group-hover:opacity-100"
            style={{
              left: `${12 + (i * 21) % 75}%`, bottom: `${8 + (i * 19) % 65}%`,
              width: 2 + (i % 3), height: 2 + (i % 3),
              background: `hsl(${28 + i * 6}, 95%, 62%)`,
              boxShadow: `0 0 ${5 + i}px 1px hsl(${32}, 95%, 58%)`,
              opacity: 0.35 + (i % 3) * 0.1,
              transitionDelay: `${i * 55}ms`,
            }} />
        ))}
      </div>
    ),
    "spotlight-grid": (
      <div className="w-[88px] h-[60px] relative overflow-hidden rounded-sm border border-white/5"
        style={{ background: "#040404", backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, transparent 70%)" }} />
        </div>
      </div>
    ),
    "lumina-wave": (
      <div className="w-[88px] h-[60px] relative overflow-hidden rounded-sm" style={{ background: "linear-gradient(145deg, #0a0814, #14082a, #080f1c)" }}>
        <div className="absolute inset-0 transition-opacity duration-700 opacity-40 group-hover:opacity-90"
          style={{ background: "radial-gradient(ellipse at 28% 55%, rgba(110,70,255,0.5), transparent 55%), radial-gradient(ellipse at 72% 45%, rgba(0,190,255,0.35), transparent 55%)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(180,140,255,0.08), transparent 60%)" }} />
      </div>
    ),

    /* ── Primitives / Widgets ─────────────────────── */
    "chrome-input": (
      <div className="flex flex-col gap-2 w-[100px]">
        <div className="h-7 border border-white/10 group-hover:border-white/30 transition-colors duration-300 rounded-[3px] flex items-center px-2.5 gap-2"
          style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}>
          <div className="w-[1.5px] h-3.5 bg-white/50 animate-pulse rounded-full shrink-0" />
          <div className="h-[1.5px] rounded-full bg-white/10 group-hover:bg-white/25 transition-colors flex-1" />
        </div>
        <div className="h-[1.5px] rounded-full bg-white/5 w-3/4" />
      </div>
    ),
    "anisotropic-knob": (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full flex items-center justify-center border border-white/15 group-hover:border-white/35 transition-colors duration-300"
          style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.01) 60%), linear-gradient(145deg, #1e1e1e, #0a0a0a)", boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <div className="w-[3px] h-4 rounded-full bg-white/40 group-hover:bg-white/70 transition-colors duration-300"
            style={{ transformOrigin: "bottom center", transform: "translateY(-3px)" }} />
        </div>
        <div className="absolute inset-0 rounded-full border border-white/5" style={{ transform: "scale(1.15)" }} />
      </div>
    ),
    "mechanical-timer": (
      <div className="flex items-center gap-1.5">
        {["0", "0", ":", "0", "0"].map((c, i) => (
          <div key={i} className={c === ":" ? "text-white/20 group-hover:text-white/50 transition-colors font-mono text-base font-bold -mx-0.5" :
            "w-7 h-9 border border-white/10 group-hover:border-white/25 flex items-center justify-center font-mono text-sm font-bold text-white/25 group-hover:text-white/60 transition-all duration-300 rounded-[2px]"}
            style={{ background: c !== ":" ? "rgba(255,255,255,0.02)" : undefined, transitionDelay: c !== ":" ? `${i * 30}ms` : undefined, boxShadow: c !== ":" ? "inset 0 1px 2px rgba(0,0,0,0.3)" : undefined }}>
            {c}
          </div>
        ))}
      </div>
    ),
    "laser-vault-password": (
      <div className="grid grid-cols-3 gap-[5px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-[22px] h-[22px] border border-white/8 group-hover:border-white/25 flex items-center justify-center rounded-[3px] transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.02)", transitionDelay: `${i * 25}ms`, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white/12 group-hover:bg-white/40 transition-colors duration-200" style={{ transitionDelay: `${i * 25}ms` }} />
          </div>
        ))}
      </div>
    ),
    "premium-hero": (
      <div className="w-[88px] h-[56px] bg-white rounded-sm relative overflow-hidden border border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-400">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.025) 1px, transparent 1px)", backgroundSize: "5px 5px" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <div className="w-10 h-[2px] bg-black/15 rounded-full" />
          <div className="w-7 h-[1.5px] bg-black/08 rounded-full" />
          <div className="w-9 h-[18px] bg-black/80 mt-0.5 flex items-center justify-center rounded-[2px]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}>
            <div className="w-4 h-[1.5px] bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    ),
    "dot-matrix": (
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(11, 1fr)" }}>
        {Array.from({ length: 44 }).map((_, i) => {
          const opacities = [0.55, 0.1, 0.45, 0.08, 0.6, 0.12, 0.5, 0.08, 0.4, 0.15, 0.55];
          return <div key={i} className="w-[3px] h-[3px] rounded-full transition-all duration-400 group-hover:opacity-100"
            style={{ background: "rgba(255,255,255,1)", opacity: opacities[i % 11], transitionDelay: `${i * 6}ms` }} />;
        })}
      </div>
    ),
    "scroll-progress": (
      <div className="flex items-stretch gap-3">
        <div className="w-[2px] h-14 rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="absolute top-0 left-0 right-0 bg-white/50 group-hover:h-10 transition-all duration-600 rounded-full" style={{ height: "30%" }} />
        </div>
        <div className="flex flex-col justify-center gap-[5px]">
          {[16, 10, 14, 8, 12].map((w, i) => (
            <div key={i} className="h-[1.5px] rounded-full transition-all duration-300 group-hover:bg-white/45"
              style={{ width: w, background: "rgba(255,255,255,0.15)", transitionDelay: `${i * 40}ms` }} />
          ))}
        </div>
      </div>
    ),
    "now-playing-card": (
      <div className="w-[104px] h-[52px] border border-white/10 group-hover:border-white/25 rounded-lg flex items-center gap-2.5 px-2.5 transition-all duration-300"
        style={{ background: "rgba(255,255,255,0.025)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <div className="w-9 h-9 rounded-md border border-white/8 shrink-0 relative overflow-hidden flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}>
          <div className="w-3 h-3 rounded-full border border-white/15 group-hover:border-white/35 transition-colors" />
          <div className="absolute w-[5px] h-[5px] rounded-full border border-white/25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-[2px] rounded-full bg-white/25 group-hover:bg-white/50 transition-colors w-full" />
          <div className="h-[1.5px] rounded-full bg-white/12 w-3/4" />
          <div className="h-[1.5px] rounded-full bg-white/06 w-5/8 mt-0.5" />
        </div>
      </div>
    ),
    "wheel-picker": (
      <div className="w-[60px] h-[56px] border border-white/12 group-hover:border-white/28 relative overflow-hidden rounded-sm transition-colors duration-300"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="absolute inset-x-0 top-0 h-5" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[18px] border-y border-white/12 group-hover:border-white/28 transition-colors" />
        <div className="flex flex-col items-center justify-center h-full gap-[5px]">
          {[0.12, 0.45, 0.12].map((op, i) => (
            <div key={i} className="h-[2px] rounded-full transition-colors duration-300"
              style={{ width: [12, 20, 10][i], background: `rgba(255,255,255,${op})` }} />
          ))}
        </div>
      </div>
    ),
    "expand-on-hover": (
      <div className="flex flex-col gap-[3px] w-[88px]">
        {[10, 32, 10].map((h, i) => (
          <div key={i} className="border border-white/8 group-hover:border-white/22 rounded-[3px] flex items-center justify-center transition-all duration-500"
            style={{ height: h, background: "rgba(255,255,255,0.015)", transitionDelay: `${i * 80}ms` }}>
            <div className="h-[1.5px] rounded-full transition-colors duration-500 group-hover:bg-white/30"
              style={{ width: i === 1 ? 32 : 20, background: "rgba(255,255,255,0.12)", transitionDelay: `${i * 80}ms` }} />
          </div>
        ))}
      </div>
    ),
    "metallic-form": (
      <div className="flex flex-col gap-[5px] w-[88px]">
        {[{ w: "75%", label: true }, { w: "55%", label: false }, { w: "75%", label: true }].map((row, i) => (
          <div key={i} className="h-[18px] border border-white/8 group-hover:border-white/20 rounded-[3px] flex items-center px-2 gap-2 transition-all duration-300"
            style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)", transitionDelay: `${i * 50}ms` }}>
            <div className="h-[2px] rounded-full bg-white/15 group-hover:bg-white/35 transition-colors flex-1" style={{ maxWidth: row.w }} />
            {row.label && <div className="w-[5px] h-[5px] rounded-full bg-white/8 group-hover:bg-white/20 transition-colors shrink-0" />}
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="flex items-center justify-center w-full h-full select-none pointer-events-none">
      {thumbnails[slug] ?? (
        <CategoryFallbackAnimation category={category} />
      )}
    </div>
  );
}

// ── Category Fallback Animations (Zero-Asset Aesthetic Previews) ──
function CategoryFallbackAnimation({ category }: { category: ComponentCategory }) {
  switch (category) {
    case "animated":
      return (
        <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden">
          {/* Glowing core */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa] animate-pulse" />
          {/* Orbital ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute w-12 h-6 border border-[#a78bfa]/35 rounded-full"
            style={{ transform: "rotateX(60deg) rotateY(15deg)" }}
          />
          {/* Orbital ring 2 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            className="absolute w-14 h-7 border border-[#a78bfa]/20 rounded-full"
            style={{ transform: "rotateX(70deg) rotateY(-20deg)" }}
          />
        </div>
      );
    case "buttons":
      return (
        <div className="w-14 h-8 bg-neutral-900 border border-[#f59e0b]/15 rounded flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:translate-y-[1px] group-hover:shadow-[0_1.5px_0_rgba(0,0,0,0.8)] transition-all duration-150">
          <div className="w-10 h-4 bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/60 shadow-[0_0_4px_#f59e0b] group-hover:bg-[#f59e0b]/90 group-hover:scale-110 transition-all duration-300" />
          </div>
        </div>
      );
    case "backgrounds":
      return (
        <div className="absolute inset-0 grid grid-cols-6 gap-[1px] p-2 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full h-4 border border-[#34d399]/5 bg-[#34d399]/[0.005] group-hover:border-[#34d399]/20 group-hover:bg-[#34d399]/[0.02] transition-all duration-500"
              style={{ transitionDelay: `${(i % 6) * 40 + Math.floor(i / 6) * 40}ms` }}
            />
          ))}
        </div>
      );
    case "primitives":
      return (
        <div className="relative w-12 h-12 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-8 h-8 border border-[#60a5fa]/30 rounded flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border border-[#60a5fa]/60 rounded-sm"
            />
          </motion.div>
          {/* Crosshairs */}
          <div className="absolute w-10 h-[1px] bg-[#60a5fa]/10 rotate-45" />
          <div className="absolute w-10 h-[1px] bg-[#60a5fa]/10 -rotate-45" />
        </div>
      );
    case "widgets":
      return (
        <div className="flex items-end gap-1.5 h-8 select-none">
          {[0.4, 0.9, 0.6, 0.3, 0.7].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-[#f472b6]/20 border border-[#f472b6]/40 rounded-t-sm"
              style={{ height: "100%", minWidth: "6px" }}
              animate={{ height: ["20%", "90%", "20%"] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      );
    case "charts":
    default:
      return (
        <div className="relative w-16 h-8 flex items-end">
          {/* Grid lines */}
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#fb923c]/20" />
          <div className="absolute inset-x-0 bottom-4 h-[1px] bg-[#fb923c]/5" />
          <div className="absolute inset-x-0 bottom-8 h-[1px] bg-[#fb923c]/5" />
          
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
            <motion.path
              d="M0,50 Q15,10 30,35 T60,15 T90,45 L100,50"
              fill="none"
              stroke="#fb923c"
              strokeWidth="1.5"
              className="drop-shadow-[0_0_3px_rgba(251,146,60,0.4)]"
              animate={{
                d: [
                  "M0,50 Q15,10 30,35 T60,15 T90,45 L100,50",
                  "M0,50 Q15,40 30,15 T60,35 T90,10 L100,50",
                  "M0,50 Q15,10 30,35 T60,15 T90,45 L100,50",
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
      );
  }
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
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link
        href={`/present/${item.category}/${item.slug}`}
        className="group relative flex flex-col h-full rounded-2xl skeuo-bevel-card transition-all duration-300 overflow-hidden"
        style={{ minHeight: 280 }}
      >
        {/* Category accent glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 40%, ${accent}14 0%, transparent 65%)` }}
        />

        {/* Component preview socket */}
        <div className="mx-3 mt-3 mb-2 flex-1 flex items-center justify-center rounded-xl skeuo-inner-socket relative overflow-hidden min-h-[160px]">
          {/* Dot grid texture */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />

          {/* Subtle category tint on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 80%, ${accent}08 0%, transparent 60%)` }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
          />

          {/* Live Component Iframe Preview for all buttons and test cards, Graphic Preview for others */}
          {item.category === "buttons" || item.slug === "infinite-scroll" || item.slug === "image-parallax" || item.slug === "living-text" || item.slug === "animated-beam" || item.slug === "coverflow-carousel" || item.slug === "metallic-form" || item.slug === "pookie-form" || item.slug === "anisotropic-knob" || item.slug === "dot-matrix" || item.slug === "mechanical-timer" || item.slug === "laser-vault-password" || item.slug === "morphing-nav" || item.slug === "text-shuffle" || item.slug === "hero" || item.slug === "premium-hero" || item.slug === "wheel-picker" || item.slug === "weapon-wheel" || item.slug === "now-playing-card" || item.slug === "dashed-feature-card" || item.slug === "dashed-marquee" || item.slug === "datepicker" || item.slug === "animated-icons-1" || item.slug === "cards" || item.slug === "simple-card" || item.slug === "sticker-card" || item.slug === "bevel-alert-dialog" || item.slug === "flickering-grid-playground" || item.slug === "dot-pattern-playground" || item.slug === "matrix-rain" ? (
            <GalleryIframePreview slug={item.slug} title={item.name} />
          ) : (
            <GalleryCardPreview slug={item.slug} category={item.category} accent={accent} />
          )}
        </div>

        {/* Info strip */}
        <div className="border-t border-white/[0.04] px-4 py-3 transition-colors bg-white/[0.01]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-plus-jakarta text-[12px] font-semibold text-white/80 group-hover:text-white transition-colors tracking-wide leading-tight">
                {item.name}
              </h3>
              <p className="font-body text-[9px] text-white/25 mt-0.5 line-clamp-1 leading-relaxed group-hover:text-white/40 transition-colors">
                {item.description.split(".")[0]}
              </p>
            </div>
            <div className="shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all">arrow_forward</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Completed Stats and Badge components ──
function AnimatingComponentsCount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const increment = Math.ceil(value / (duration / 16)); // ~60fps
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
    <div className="font-plus-jakarta text-[11px] font-semibold text-white/50 bg-[#090909] border border-white/5 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)] px-4 py-2.5 rounded-full flex items-center gap-2.5 select-none">
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

// ── Page ─────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const visible = registry.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090808]">
      {/* ── Hero header ── */}
      <div className="border-b border-white/[0.02] bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="max-w-[1600px] mx-auto px-6 pt-12 pb-8 relative z-10">


          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-plus-jakarta text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-2">
                Component <span className="text-white/30 font-medium">Registry</span>
              </h1>
              <p className="font-body text-sm text-white/30 max-w-lg leading-relaxed">
                Click any dashboard module card to launch real-time sandbox present mode with interactive parameter tweaking.
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
          
          {/* Category Tabs inside recessed slots */}
          <div className="flex items-center gap-1.5 skeuo-inner-socket rounded-xl p-1.5 overflow-x-auto scrollbar-none shrink-0 relative">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              const catCount = cat.id === "all"
                ? registry.length
                : registry.filter((i) => i.category === cat.id).length;
              const accent = cat.id === "all" ? "#f59e0b" : CATEGORY_ACCENT[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="relative z-10 flex items-center gap-2 px-3.5 py-2.5 font-plus-jakarta text-[11px] font-semibold tracking-wide transition-all duration-200 shrink-0 cursor-pointer select-none outline-none rounded-lg"
                  style={{
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

      {/* ── Spaced Grid ── */}
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
              <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="font-mono text-[10px] text-white/30 hover:text-white border border-[#1f1f1f] hover:border-white/30 px-3 py-1.5 transition-colors cursor-pointer rounded-lg">
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
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
          <div className="mt-12 flex items-center justify-center gap-2 font-mono text-[8px] text-white/15 uppercase tracking-[0.2em] select-none">
            <span className="material-symbols-outlined text-[10px] animate-pulse">play_arrow</span>
            Select any console card to enter PRESENT mode
          </div>
        )}
      </div>
    </div>
  );
}

