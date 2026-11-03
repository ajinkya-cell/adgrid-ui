import { registry, type RegistryEntry } from "@/registry";

// Footprint on the 3-column gallery grid (rows are 260px).
//   sm = 1×1 · wide = 2×1 · tall = 1×2 · lg = 2×2 · full = 3 columns × `rows`
export type ShowcaseSize = "sm" | "wide" | "tall" | "lg" | "full";

// How the component sits in its well:
//   scale  — laid out at natural size, then scaled down to fit (small showpieces)
//   native — 1:1, centred; the tile is sized to hold it (big interactive pieces)
//   scroll — 1:1 from the top, scrolling inside the well (content that grows as you use it)
//   fill   — stretched edge to edge (canvases)
export type ShowcaseFit = "scale" | "native" | "scroll" | "fill";

export type ArrowPlacement = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right";

export interface ShowcaseHint {
  label: string;
  /** Where the arrow comes from, relative to the anchor point. */
  placement: ArrowPlacement;
  /** Anchor point the arrow points at, as % of the well. */
  at: { x: number; y: number };
  bend?: number;
}

export interface ShowcaseTile {
  slug: string;
  size: ShowcaseSize;
  rows?: number;
  fit?: ShowcaseFit;
  hint?: ShowcaseHint;
  /** A handwritten note in the page margin to the right of the card, behind a rough bracket. */
  note?: string;
  /** Props passed through to the presentation demo. */
  props?: Record<string, unknown>;
}

// Each block closes whole rows of 3 cells so the bento has no holes.
export const GALLERY_TOP: ShowcaseTile[] = [
  // The AI section: sidebar, thread list and a live chat panel in one piece.
  { slug: "chat-sidebar", size: "full", rows: 3, fit: "native", note: "check out all the AI components" },
  { slug: "github-heatmap", size: "full", rows: 2, fit: "native", props: { variant: "machined", showStats: true } },

  {
    slug: "now-playing-card",
    size: "tall",
    hint: { label: "hover me", placement: "bottom-right", at: { x: 56, y: 81 }, bend: -0.45 },
  },
  { slug: "activity-card", size: "wide" },
  {
    slug: "inspect-text",
    size: "wide",
    fit: "native",
    hint: { label: "hover a word", placement: "top-right", at: { x: 74, y: 36 }, bend: 0.4 },
  },

  {
    slug: "polaroid-stack",
    size: "full",
    rows: 3,
    fit: "native",
    props: { bare: true },
    hint: { label: "click a print", placement: "top-right", at: { x: 60, y: 42 }, bend: 0.4 },
  },

  {
    slug: "folder-reveal",
    size: "tall",
    fit: "native",
    props: { bare: true, size: 220 },
    hint: { label: "hover", placement: "top-right", at: { x: 72, y: 30 }, bend: 0.45 },
  },
  {
    slug: "book",
    size: "lg",
    fit: "native",
    props: { bare: true },
    hint: { label: "open the cover", placement: "bottom-right", at: { x: 62, y: 74 }, bend: -0.4 },
  },
];

export const GALLERY_BOTTOM: ShowcaseTile[] = [
  { slug: "chat-faq", size: "lg", fit: "scroll" },
  { slug: "text-shuffle", size: "sm" },
  { slug: "hatched-text", size: "sm" },
  { slug: "living-text", size: "wide", props: { className: "flex-nowrap", liquify: false } },
  { slug: "dot-matrix", size: "sm", note: "check out all the variants" },

  { slug: "globe", size: "tall" },
  { slug: "anisotropic-knob", size: "sm" },
  { slug: "wheel-picker", size: "sm" },
  { slug: "matrix-rain", size: "wide", fit: "fill" },

  // Prompt input and streaming text live inside the chat sidebar tile above.
  { slug: "coverflow-carousel", size: "full", rows: 2 },
];

export type ResolvedTile = ShowcaseTile & { entry: RegistryEntry };

const resolve = (tiles: ShowcaseTile[]) =>
  tiles
    .map((tile) => ({ ...tile, entry: registry.find((item) => item.slug === tile.slug) }))
    .filter((tile): tile is ResolvedTile => Boolean(tile.entry));

export const TOP_TILES = resolve(GALLERY_TOP);
export const BOTTOM_TILES = resolve(GALLERY_BOTTOM);

// + the clock.
export const SHOWCASE_COUNT = TOP_TILES.length + BOTTOM_TILES.length + 1;
