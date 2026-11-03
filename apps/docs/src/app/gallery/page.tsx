"use client";

import Link from "next/link";
import { HorizonGlow } from "@ui/backgrounds/HorizonGlow";
import { NumberTickerClock } from "@ui/animated/number-ticker";
import { presentationEntries } from "@/components/presentation/presentation-registry";
import { BOTTOM_TILES, SHOWCASE_COUNT, TOP_TILES, type ResolvedTile } from "./showcase";
import { LiveTile } from "./LiveTile";

// Muted embers: the glow should read as warmth at the bottom of the screen, never as colour.
const GLOW_COLORS = ["#3a1a12", "#5a2f18", "#3d3420", "#16303d"]; // void-lint-ignore: dimmed horizon tones

function Grid({ tiles }: { tiles: ResolvedTile[] }) {
  return (
    // Components that contain their own scroll (chat threads, sidebars) chain to the page here, so
    // once a tile's list hits its end the wheel keeps scrolling the gallery.
    <div className="[&_*]:overscroll-auto! grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[260px] grid-flow-dense">
      {tiles.map((tile, i) => (
        <LiveTile key={tile.slug} tile={tile} index={i} />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] font-poppins">
      {/* A barely-there visualizer glow pinned behind everything; it never takes a click. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <HorizonGlow
          fixed
          variant="visualizer"
          colors={GLOW_COLORS}
          intensity={0.35}
          height={0.32}
          speed={0.5}
          grain={0}
          interactive={false}
          className="h-full w-full"
        />
      </div>

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
          <header className="pt-28 sm:pt-32 pb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">Components</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
              {SHOWCASE_COUNT} components, all live: hover, click and drag them right here. Browse all{" "}
              <Link
                href="/present/buttons/void-button"
                className="text-white/80 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                {presentationEntries.length} in the navigator
              </Link>
              .
            </p>
          </header>

          <div className="space-y-5 pb-24">
            <Grid tiles={TOP_TILES} />
            <Grid tiles={BOTTOM_TILES} />
          </div>
        </div>
      </div>

      {/* The number ticker as a bare clock pinned to the bottom-right corner: no well, just the wheels. */}
      <Link
        href="/present/animated/number-ticker"
        aria-label="Number ticker"
        className="fixed bottom-5 right-6 z-20 opacity-70 transition-opacity hover:opacity-100"
      >
        <NumberTickerClock className="rounded-none border-0 bg-transparent p-0 text-2xl text-neutral-200 shadow-none sm:text-3xl" />
      </Link>
    </div>
  );
}
