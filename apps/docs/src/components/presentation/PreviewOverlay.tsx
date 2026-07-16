"use client";

import React, { useEffect, useState, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import {
  IconDatabase,
  IconBrandNodejs,
  IconBrandNextjs,
  IconBrandDocker,
  IconBrandReact,
} from "@tabler/icons-react";

// Lazy-load UI components from package
const UI = {
  VoidButton: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.VoidButton }))),
  BrushedTitaniumButton: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.BrushedTitaniumButton }))),
  LiquidGoldButton: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.LiquidGoldButton }))),
  GuillocheButton: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.GuillocheButton }))),
  ButtonAlpha: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.ButtonAlpha }))),
  BeveledBeamShowcase: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.BeveledBeamShowcase }))),
  ChromeInput: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.ChromeInput }))),
  ChromeSelect: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.ChromeSelect }))),
  AnisotropicKnob: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.AnisotropicKnob }))),
  MechanicalTimer: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.MechanicalTimer }))),
  LaserVaultPassword: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.LaserVaultPassword }))),
  PookieForm: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.PookieForm }))),
  LivingText: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.LivingText }))),
  SpotlightText: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.SpotlightText }))),
  TextShuffle: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.TextShuffle }))),
  NowPlayingCard: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.NowPlayingCard }))),
  SimpleCard: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.SimpleCard }))),
  DashedFeatureCard: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.DashedFeatureCard }))),
  DashedMarquee: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.DashedMarquee }))),
  BevelAccordion: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.BevelAccordion }))),
  StickerCard: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.StickerCard }))),
  Datepicker: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.Datepicker }))),
  NavBar1: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.NavBar1 }))),
  BevelAlertDialog: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.BevelAlertDialog }))),
  CoverflowCarousel: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.CoverflowCarousel }))),
  PixelMeltBackground: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.PixelMeltBackground }))),
  BreathingGrid: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.BreathingGrid }))),
  FloatingEmbers: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.FloatingEmbers }))),
  SpotlightGrid: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.SpotlightGrid }))),
  LuminaWave: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.LuminaWave }))),
  MatrixRain: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.MatrixRain }))),
  FlickeringGrid: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.FlickeringGrid }))),
  FlickeringGridPlayground: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.FlickeringGridPlayground }))),
  ScrollProgress: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.ScrollProgress }))),
  DotPattern: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.DotPattern }))),
  DotPatternPlayground: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.DotPatternPlayground }))),
};

const imageOne = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80";

function MiniPreviewRenderer({ slug }: { slug: string }) {
  switch (slug) {
    // ── Buttons ──────────────────────────────────────────────────────────
    case "void-button":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Suspense fallback={null}>
            <UI.VoidButton variant="ambient">Void</UI.VoidButton>
          </Suspense>
        </div>
      );
    case "brushed-titanium-button":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Suspense fallback={null}>
            <UI.BrushedTitaniumButton>Titanium</UI.BrushedTitaniumButton>
          </Suspense>
        </div>
      );
    case "liquid-gold-button":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Suspense fallback={null}>
            <UI.LiquidGoldButton>Gold</UI.LiquidGoldButton>
          </Suspense>
        </div>
      );
    case "guilloche-button":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Suspense fallback={null}>
            <UI.GuillocheButton>Dial</UI.GuillocheButton>
          </Suspense>
        </div>
      );
    case "button-alpha":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Suspense fallback={null}>
            <UI.ButtonAlpha>Activate</UI.ButtonAlpha>
          </Suspense>
        </div>
      );
    case "animated-beam": {
      const leftItems = [
        { id: "db", icon: <IconDatabase size={12} className="text-red-500" />, beamStartColor: "#ef4444", beamStopColor: "#ea580c" },
        { id: "node", icon: <IconBrandNodejs size={12} className="text-emerald-500" />, beamStartColor: "#22c55e", beamStopColor: "#16a34a" },
      ];
      const rightItems = [
        { id: "next", icon: <IconBrandNextjs size={12} className="text-white" />, beamStartColor: "#ffffff", beamStopColor: "#d4d4d8" },
        { id: "docker", icon: <IconBrandDocker size={12} className="text-cyan-400" />, beamStartColor: "#06b6d4", beamStopColor: "#0284c7" },
      ];
      return (
        <div className="flex h-full w-full items-center justify-center scale-[0.6] origin-center p-2">
          <Suspense fallback={null}>
            <UI.BeveledBeamShowcase
              centerIcon={<IconBrandReact size={18} className="text-cyan-400" />}
              leftItems={leftItems}
              rightItems={rightItems}
              pathWidth={1}
            />
          </Suspense>
        </div>
      );
    }

    // ── Primitives & Forms ───────────────────────────────────────────────
    case "chrome-input":
      return (
        <div className="flex h-full w-full flex-col justify-center p-6 gap-2">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Obsidian Field</span>
          <Suspense fallback={null}>
            <UI.ChromeInput placeholder="Enter passcode..." />
          </Suspense>
        </div>
      );
    case "chrome-select":
      return (
        <div className="flex h-full w-full flex-col justify-center p-6 gap-2">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Select Mode</span>
          <Suspense fallback={null}>
            <UI.ChromeSelect defaultValue="production" options={[{ value: "production", label: "Production" }, { value: "development", label: "Development" }]} />
          </Suspense>
        </div>
      );
    case "pookie-form":
      return (
        <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
          <Suspense fallback={null}>
            <UI.PookieForm
              className="scale-65 origin-center w-full max-w-[320px] p-6"
              title="Plate"
              serialNumber="04-2024"
              fields={[
                { name: "name", label: "Identifier", placeholder: "Name..." }
              ]}
              showScrews={false}
            />
          </Suspense>
        </div>
      );
    case "anisotropic-knob":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Suspense fallback={null}>
            <UI.AnisotropicKnob size={100} label="Gain" />
          </Suspense>
        </div>
      );

    // ── Widgets ──────────────────────────────────────────────────────────
    case "mechanical-timer":
      return (
        <div className="flex h-full w-full items-center justify-center p-2 scale-80">
          <Suspense fallback={null}>
            <UI.MechanicalTimer />
          </Suspense>
        </div>
      );
    case "laser-vault-password":
      return (
        <div className="flex h-full w-full items-center justify-center p-2 scale-70 origin-center">
          <Suspense fallback={null}>
            <UI.LaserVaultPassword />
          </Suspense>
        </div>
      );
    case "now-playing-card":
      return (
        <div className="flex h-full w-full items-center justify-center p-2 scale-85">
          <Suspense fallback={null}>
            <UI.NowPlayingCard song={{ isPlaying: true, title: "Main Chala Jaunga", artist: "Fiddlecraft", album: "Hawai Jahaaz", image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/c7/65/41c765a0-5a1e-3e35-9c22-5d664da2b95e/cover.jpg/600x600bb.jpg", songUrl: "https://open.spotify.com", playedAt: null }} />
          </Suspense>
        </div>
      );
    case "simple-card":
      return (
        <div className="flex h-full w-full items-center justify-center p-2 scale-80">
          <Suspense fallback={null}>
            <UI.SimpleCard imageUrl={imageOne} title="NIGHTPASS" description="St. Moritz / Alps" />
          </Suspense>
        </div>
      );
    case "dashed-feature-card":
      return (
        <div className="flex h-full w-full items-center justify-center p-2 scale-90">
          <Suspense fallback={null}>
            <UI.DashedFeatureCard
              title="My Issues"
              description="Issue tracker"
              showCorners={true}
            />
          </Suspense>
        </div>
      );
    case "dashed-marquee": {
      const dummyMiniItems = [
        { id: 1, title: "Database Sync", description: "Cloud sync", icon: null },
        { id: 2, title: "Auth Gate", description: "OAuth security", icon: null },
        { id: 3, title: "Payment Loop", description: "Stripe route", icon: null },
      ];
      return (
        <div className="flex h-full w-full items-center justify-center p-2 scale-75 overflow-hidden">
          <Suspense fallback={null}>
            <UI.DashedMarquee
              items={dummyMiniItems}
              speed={15}
              blurCorners={false}
            />
          </Suspense>
        </div>
      );
    }
    case "bevel-accordion": {
      const dummyMiniAccordionItems = [
        { id: "1", title: "General", description: "Settings defaults", content: "Short settings configuration content example." },
        { id: "2", title: "Database", description: "Replication engine", content: "Short database sync content example." }
      ];
      return (
        <div className="flex h-full w-full items-center justify-center p-4 scale-65 overflow-hidden">
          <Suspense fallback={null}>
            <UI.BevelAccordion
              items={dummyMiniAccordionItems}
              glowColor="blue"
            />
          </Suspense>
        </div>
      );
    }
    case "sticker-card": {
      return (
        <div className="flex h-full w-full items-center justify-center p-4 scale-40 origin-center overflow-hidden">
          <Suspense fallback={null}>
            <UI.StickerCard />
          </Suspense>
        </div>
      );
    }
    case "datepicker": {
      return (
        <div className="flex h-full w-full items-center justify-center p-4 scale-45 origin-center overflow-hidden">
          <Suspense fallback={null}>
            <UI.Datepicker />
          </Suspense>
        </div>
      );
    }
    case "navbar-1": {
      return (
        <div className="flex h-full w-full items-center justify-center p-4 scale-30 origin-center overflow-hidden">
          <Suspense fallback={null}>
            <UI.NavBar1 />
          </Suspense>
        </div>
      );
    }
    case "bevel-alert-dialog": {
      return (
        <div className="flex h-full w-full items-center justify-center p-4 scale-55 origin-center overflow-hidden">
          <Suspense fallback={null}>
            <UI.BevelAlertDialog
              inline
              isOpen={true}
              variant="danger"
              title="SYSTEM OVERHEAD ALARM"
              description="Core coolant integrity is decreasing. Deploy liquid hydrogen injectors immediately?"
              onClose={() => {}}
              onConfirm={() => {}}
            />
          </Suspense>
        </div>
      );
    }


    // ── Animated ─────────────────────────────────────────────────────────
    case "living-text":
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Suspense fallback={null}>
            <UI.LivingText text="LIVING" radius={100} strength={25} mode="all" liquify={true} />
          </Suspense>
        </div>
      );
    case "spotlight-text":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <div className="relative w-full max-w-[280px] bg-surface-charcoal border-y border-border-hairline rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 p-5">
            <Suspense fallback={null}>
              <UI.SpotlightText text="Antimetal" theme="light" fontSize="2.5rem" />
            </Suspense>
          </div>
        </div>
      );
    case "text-shuffle":
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Suspense fallback={null}>
            <UI.TextShuffle words={["VOID", "UI"]} fontSize="2.5rem" uppercase loop />
          </Suspense>
        </div>
      );

    // ── Backgrounds (render inside the card absolute) ────────────────────
    case "pixel-melt":
      return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          <Suspense fallback={null}>
            <UI.PixelMeltBackground />
          </Suspense>
        </div>
      );
    case "breathing-grid":
      return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          <Suspense fallback={null}>
            <UI.BreathingGrid />
          </Suspense>
        </div>
      );
    case "floating-embers":
      return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          <Suspense fallback={null}>
            <UI.FloatingEmbers />
          </Suspense>
        </div>
      );
    case "spotlight-grid":
      return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          <Suspense fallback={null}>
            <UI.SpotlightGrid />
          </Suspense>
        </div>
      );
    case "lumina-wave":
      return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          <Suspense fallback={null}>
            <UI.LuminaWave />
          </Suspense>
        </div>
      );
    case "matrix-rain":
      return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          <Suspense fallback={null}>
            <UI.MatrixRain fontSize={10} density={1.2} />
          </Suspense>
        </div>
      );

    case "flickering-grid":
      return (
        <div className="relative h-full w-full overflow-hidden flex items-center justify-center p-2">
          <Suspense fallback={null}>
            <UI.FlickeringGrid className="absolute inset-0 z-0" squareSize={3} gridGap={4} color="#a78bfa" maxOpacity={0.25} />
          </Suspense>
          <span className="relative z-10 font-mono text-[9px] text-[#a78bfa] uppercase tracking-[0.2em] font-bold">GRID</span>
        </div>
      );
    case "flickering-grid-playground":
      return (
        <div className="relative h-full w-full overflow-hidden flex flex-col justify-between p-3 bg-[#0a0a0c]">
          <Suspense fallback={null}>
            <UI.FlickeringGrid className="absolute inset-0 z-0 opacity-70" squareSize={2} gridGap={3} color="#06b6d4" maxOpacity={0.2} />
          </Suspense>
          <div className="relative z-10 w-full p-2 border border-white/5 bg-black/80 rounded-lg flex flex-col gap-1 mt-auto">
            <div className="w-full h-1 bg-white/20 rounded-full" />
            <div className="w-2/3 h-1 bg-white/10 rounded-full" />
            <div className="w-1/2 h-1 bg-white/5 rounded-full" />
          </div>
        </div>
      );
    case "dot-pattern":
      return (
        <div className="relative h-full w-full overflow-hidden flex items-center justify-center p-2 bg-[#050505]">
          <Suspense fallback={null}>
            <UI.DotPattern className="absolute inset-0 opacity-25" width={10} height={10} cr={1} color="#a78bfa" />
          </Suspense>
          <span className="relative z-10 font-mono text-[9px] text-[#a78bfa] uppercase tracking-[0.2em] font-bold">DOTS</span>
        </div>
      );
    case "dot-pattern-playground":
      return (
        <div className="relative h-full w-full overflow-hidden flex flex-col justify-between p-3 bg-[#0a0a0c]">
          <Suspense fallback={null}>
            <UI.DotPattern className="absolute inset-0 opacity-20" width={8} height={8} cr={1} color="#06b6d4" />
          </Suspense>
          <div className="relative z-10 w-full p-2 border border-white/5 bg-black/80 rounded-lg flex flex-col gap-1 mt-auto">
            <div className="w-full h-1 bg-white/20 rounded-full" />
            <div className="w-2/3 h-1 bg-white/10 rounded-full" />
          </div>
        </div>
      );

    // ── Fallback placeholder with nice tech details ──────────────────────
    default:
      return (
        <div className="flex h-full w-full flex-col justify-center p-6 text-left border border-white/5 bg-[#0f0f0f]/40 backdrop-blur-md rounded-2xl">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa]/70 mb-2">Interactive Preview</div>
          <div className="font-sans text-sm font-semibold text-white/90 mb-1">{slug.replace(/-/g, " ").toUpperCase()}</div>
          <p className="font-sans text-xs text-white/40 leading-normal line-clamp-3">
            Click to enter presentation mode and inspect the full-screen implementation of this custom reactive UI component.
          </p>
        </div>
      );
  }
}

interface PreviewOverlayProps {
  isVisible: boolean;
  entry: RegistryEntry | null;
  anchorRect: DOMRect | null;
}

export function PreviewOverlay({ isVisible, entry, anchorRect }: PreviewOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!anchorRect) return;

    const overlayHeight = 220;
    const topOffset = anchorRect.top + anchorRect.height / 2 - overlayHeight / 2;
    // Prevent clipping above or below screen boundaries
    const top = Math.max(16, Math.min(window.innerHeight - overlayHeight - 16, topOffset));
    const left = anchorRect.right + 16;

    setCoords({ top, left });
  }, [anchorRect]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && entry && (
        <motion.div
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: 340,
            height: 220,
            zIndex: 99999,
          }}
          initial={{ opacity: 0, scale: 0.95, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: 10 }}
          transition={{
            duration: 0.22,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.65),inset_0_1.5px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
        >
          {/* Subtle tech border overlay */}
          <div className="absolute inset-0 border border-violet-500/5 rounded-2xl pointer-events-none z-30" />
          
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/40">
            <MiniPreviewRenderer slug={entry.slug} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
