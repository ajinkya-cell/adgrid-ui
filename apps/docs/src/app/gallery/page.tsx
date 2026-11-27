"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { NumberTickerClock } from "@ui/animated/number-ticker";
import { presentationEntries } from "@/components/presentation/presentation-registry";
import { BOTTOM_TILES, NEW_TILES, SHOWCASE_COUNT, TOP_TILES, type ResolvedTile } from "./showcase";
import { LiveTile } from "./LiveTile";
import { PixelKnight } from "./PixelKnight";
import { AsciiSky } from "./AsciiSky";

const AsciiField = dynamic(() => import("@ui/backgrounds/AsciiField").then((m) => m.AsciiField), { ssr: false });
const TopographicMap = dynamic(() => import("@ui/backgrounds/TopographicMap").then((m) => m.TopographicMap), { ssr: false });
const TicketPrinterLive = dynamic(() => import("@ui/animated/ticket-printer").then((m) => m.TicketPrinterLive), { ssr: false });
const HandDrawnHatching = dynamic(() => import("@ui/backgrounds/HandDrawnHatching").then((m) => m.HandDrawnHatching), { ssr: false });

// Backgrounds drawn bare in their wells: their /present landings put full-page hero copy on top.
const BARE: Record<string, () => ReactNode> = {
  "ascii-field": () => <AsciiField />,
  "topographic-map": () => <TopographicMap />,
  // No hero to make room for in a small well, so drop the bare clearing in the middle.
  "hand-drawn-hatching": () => <HandDrawnHatching clearing={0} />,
  // Hung from the top of the well at full size, with the rest of the well for the strip it feeds out on hover.
  "ticket-printer": () => (
    <div className="flex h-full justify-center overflow-hidden pt-8">
      <div className="w-[300px]">
        <TicketPrinterLive simulate />
      </div>
    </div>
  ),
};

function Grid({ tiles }: { tiles: ResolvedTile[] }) {
  return (
    // Components that contain their own scroll (chat threads, sidebars) chain to the page here, so
    // once a tile's list hits its end the wheel keeps scrolling the gallery.
    <div className="[&_*]:overscroll-auto! grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[260px] grid-flow-dense">
      {tiles.map((tile, i) => (
        <LiveTile key={tile.slug} tile={tile} index={i}>
          {BARE[tile.slug] ? <div className="absolute inset-0 overflow-hidden">{BARE[tile.slug]()}</div> : undefined}
        </LiveTile>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] font-poppins">
      {/* A daytime sky of tiny text cells across the top, after unvalley.me. It scrolls away with the
          page and fades into it; the pointer stirs it from above the cards, so it never takes a click. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[78vh] min-h-[520px]">
        <AsciiSky className="h-full w-full" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
          <header className="pt-28 sm:pt-32 pb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07182b] leading-tight">Components</h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-[#07182b]/85">
              {SHOWCASE_COUNT} components, all live: hover, click and drag them right here. Browse all{" "}
              <Link
                href="/present/buttons/void-button"
                className="text-[#07182b] underline decoration-[#07182b]/35 underline-offset-4 transition-colors hover:decoration-[#07182b]"
              >
                {presentationEntries.length} in the navigator
              </Link>
              .
            </p>
          </header>

          <div className="space-y-5 pb-24">
            <section aria-labelledby="gallery-new" className="pb-10">
              <h2 id="gallery-new" className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#07182b]">
                <span className="rounded-full bg-[#07182b] px-2.5 py-1 text-[11px] tracking-[0.14em] text-white">New</span>
                Just added
              </h2>
              <Grid tiles={NEW_TILES} />
            </section>
            <div className="relative">
              {/* Just for show: a pixel cat knight patrols the top edge of the first card. Click it to attack. */}
              <PixelKnight scale={3} className="absolute! bottom-full left-0 z-20 -mb-1.5" />
              <Grid tiles={TOP_TILES} />
            </div>
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
