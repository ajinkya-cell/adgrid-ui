"use client";

import type { ComponentCategory } from "@/registry";

export function GalleryCardPreview({
  slug,
  category,
  accent = "#a78bfa",
}: {
  slug: string;
  category: ComponentCategory;
  accent?: string;
}) {
  return (
    <div className="relative w-full h-full min-h-[170px] bg-[#070707] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}25 0%, transparent 70%)`,
        }}
      />

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Content wrapper with hover scale */}
      <div className="relative z-10 flex items-center justify-center transform group-hover:scale-[1.06] transition-transform duration-500 ease-out">
        {renderPreviewContent(slug, category, accent)}
      </div>
    </div>
  );
}

function renderPreviewContent(slug: string, category: ComponentCategory, accent: string) {
  switch (slug) {
    /* ── Animated ── */
    case "living-text":
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5 items-end h-8">
            {[24, 14, 28, 10, 20, 26, 16].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full group-hover:animate-pulse"
                style={{
                  height: `${h}px`,
                  backgroundColor: accent,
                  opacity: 0.7 + (i % 3) * 0.1,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-widest text-white/70 font-bold uppercase">
            LIVING_TEXT
          </span>
        </div>
      );

    case "spotlight-text":
      return (
        <div className="relative px-6 py-3 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl flex flex-col items-center gap-1 overflow-hidden">
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity"
            style={{ background: accent }}
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-white z-10">
            SPOTLIGHT
          </span>
          <div className="w-8 h-[2px] rounded-full" style={{ background: accent }} />
        </div>
      );

    case "text-shuffle":
      return (
        <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg font-mono text-xs text-white/90 tracking-wider flex items-center gap-2">
          <span className="text-white/40">{"<"}</span>
          <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
            $HUFFL3
          </span>
          <span className="text-white/40">{"/>"}</span>
        </div>
      );

    case "gravity-card-stack":
      return (
        <div className="relative w-24 h-20">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-lg border border-white/20 bg-neutral-900/90 shadow-xl transition-all duration-500 flex items-center justify-center"
              style={{
                top: `${i * 6}px`,
                left: `${i * 4}px`,
                transform: `rotate(${i * -4}deg)`,
                opacity: 1 - i * 0.25,
              }}
            >
              <span className="font-mono text-[9px] text-white/60">CARD_0{i + 1}</span>
            </div>
          ))}
        </div>
      );

    case "morphing-nav":
      return (
        <div className="px-4 py-2 rounded-full border border-white/20 bg-neutral-900/90 shadow-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
          <div className="flex gap-1.5">
            <div className="w-8 h-1 rounded bg-white/60" />
            <div className="w-5 h-1 rounded bg-white/30" />
            <div className="w-6 h-1 rounded bg-white/30" />
          </div>
        </div>
      );

    case "infinite-scroll":
      return (
        <div className="flex flex-col gap-1.5 w-28 opacity-80 group-hover:opacity-100 transition-opacity">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 rounded bg-white/10 border border-white/15 flex items-center px-2 font-mono text-[8px] text-white/60"
            >
              SLIDE_0{i} // SCROLL
            </div>
          ))}
        </div>
      );

    case "image-reveal":
    case "image-parallax":
      return (
        <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-white/20 bg-gradient-to-br from-neutral-800 to-neutral-950 shadow-2xl flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)",
            }}
          />
          <span className="material-symbols-outlined text-white/50 text-2xl group-hover:text-white transition-colors">
            panorama
          </span>
        </div>
      );

    /* ── Buttons ── */
    case "void-button":
      return (
        <div className="px-5 py-2 rounded-md bg-black border border-white/30 font-mono text-xs text-white tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:border-white group-hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all">
          VOID_BTN
        </div>
      );

    case "brushed-titanium-button":
      return (
        <div className="px-5 py-2 rounded-md bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-900 border border-neutral-600 font-mono text-xs text-neutral-200 tracking-wider uppercase shadow-inner group-hover:border-neutral-400 transition-all">
          TITANIUM
        </div>
      );

    case "liquid-gold-button":
      return (
        <div className="px-5 py-2 rounded-md bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border border-amber-500/50 font-mono text-xs text-amber-300 tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
          GOLD
        </div>
      );

    case "guilloche-button":
      return (
        <div className="px-5 py-2 rounded-md bg-neutral-950 border border-white/40 font-mono text-xs text-white tracking-widest uppercase transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          GUILLOCHE
        </div>
      );

    /* ── Backgrounds ── */
    case "chaos-field-shader":
      return (
        <div className="w-32 h-20 rounded-xl border border-white/15 bg-gradient-to-tr from-purple-950 via-neutral-950 to-blue-950 relative overflow-hidden flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.3)_0%,transparent_70%)] animate-pulse" />
          <span className="font-mono text-[10px] text-white/70 font-bold uppercase tracking-widest z-10">
            SHADER // WEBGL
          </span>
        </div>
      );

    case "dot-matrix":
      return (
        <div className="grid grid-cols-6 gap-2 p-3 bg-neutral-950/80 rounded-xl border border-white/10">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-white transition-colors"
              style={{ opacity: 0.3 + (i % 5) * 0.15 }}
            />
          ))}
        </div>
      );

    case "organic-curves":
      return (
        <div className="w-32 h-20 rounded-xl border border-white/15 bg-neutral-950 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(96,165,250,0.3),transparent_70%)]" />
          <div className="w-40 h-40 border border-white/20 rounded-full scale-150 transform -translate-y-6 opacity-60 group-hover:scale-175 transition-transform duration-700" />
        </div>
      );

    /* ── Primitives ── */
    case "anisotropic-knob":
      return (
        <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-neutral-900 shadow-2xl flex items-center justify-center relative group-hover:border-white transition-colors">
          <div className="w-1.5 h-4 bg-white rounded-full absolute top-2 shadow-[0_0_8px_white]" />
          <div className="w-6 h-6 rounded-full border border-white/10 bg-neutral-950" />
        </div>
      );

    case "spotify-vinyl-player":
      return (
        <div className="w-16 h-16 rounded-full bg-neutral-950 border-4 border-neutral-900 shadow-2xl flex items-center justify-center relative animate-[spin_12s_linear_infinite]">
          <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center" />
        </div>
      );

    case "terminal-window":
      return (
        <div className="w-32 h-20 rounded-lg bg-black border border-white/20 p-2 space-y-1.5 font-mono text-[9px] shadow-2xl">
          <div className="flex gap-1.5 border-b border-white/10 pb-1">
            <div className="w-2 h-2 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 rounded-full bg-green-500/80" />
          </div>
          <div className="text-white/60">$ void --init</div>
          <div className="text-emerald-400 font-bold">✓ Ready</div>
        </div>
      );

    /* ── Default Fallback ── */
    default: {
      const categoryIcons: Record<ComponentCategory, string> = {
        animated: "animation",
        buttons: "smart_button",
        backgrounds: "blur_on",
        primitives: "category",
        widgets: "widgets",
        charts: "bar_chart",
      };

      return (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center shadow-lg group-hover:border-white/40 transition-colors"
            style={{ color: accent }}
          >
            <span className="material-symbols-outlined text-2xl">
              {categoryIcons[category] || "widgets"}
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-white/50 uppercase font-bold">
            {slug.replace(/-/g, "_")}
          </span>
        </div>
      );
    }
  }
}
