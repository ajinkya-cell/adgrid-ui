import { registry, type RegistryEntry } from "@/registry";
import { PRESENTATION_GROUPS } from "@/components/presentation/presentation-registry";

// Bento footprint on the 3-column gallery grid.
export type ShowcaseSize = "sm" | "wide" | "tall" | "lg";

// The curated gallery: only components that read well at card size, keyed by navigator group.
// Order within a group is the order on the page. Each group adds up to whole rows of 3 cells
// (sm = 1, wide/tall = 2, lg = 4) so the bento has no holes.
export const GALLERY_SHOWCASE: Record<string, { slug: string; size: ShowcaseSize }[]> = {
  inputs: [
    { slug: "datepicker", size: "tall" },
    { slug: "anisotropic-knob", size: "sm" },
    { slug: "laser-vault-password", size: "tall" },
    { slug: "wheel-picker", size: "sm" },
    { slug: "color-picker", size: "sm" },
    { slug: "otp-input", size: "wide" },
  ],
  buttons: [
    { slug: "void-button", size: "wide" },
    { slug: "brushed-titanium-button", size: "sm" },
    { slug: "liquid-gold-button", size: "sm" },
    { slug: "guilloche-button", size: "sm" },
    { slug: "button-alpha", size: "sm" },
  ],
  feedback: [
    { slug: "progress", size: "wide" },
    { slug: "meter", size: "sm" },
    { slug: "gauge", size: "sm" },
    { slug: "toast", size: "wide" },
  ],
  navigation: [
    { slug: "weapon-wheel", size: "tall" },
    { slug: "menubar", size: "wide" },
    { slug: "tabs", size: "sm" },
    { slug: "pagination", size: "sm" },
  ],
  ai: [
    { slug: "chat-sidebar", size: "lg" },
    { slug: "prompt-input", size: "sm" },
    { slug: "streaming-text", size: "sm" },
  ],
  data: [
    { slug: "globe", size: "tall" },
    { slug: "github-heatmap", size: "wide" },
    { slug: "table", size: "wide" },
    { slug: "dot-matrix", size: "sm" },
    { slug: "timeline", size: "sm" },
    { slug: "accordion", size: "sm" },
  ],
  cards: [
    { slug: "breathing-scale-card", size: "tall" },
    { slug: "now-playing-card", size: "tall" },
    { slug: "developer-id-card", size: "tall" },
    { slug: "activity-card", size: "wide" },
    { slug: "simple-card", size: "sm" },
    { slug: "sticker-card", size: "sm" },
    { slug: "polaroid-stack", size: "sm" },
    { slug: "folder-reveal", size: "sm" },
  ],
  text: [
    { slug: "spotlight-text", size: "lg" },
    { slug: "number-ticker", size: "sm" },
    { slug: "hatched-text", size: "sm" },
    { slug: "text-shuffle", size: "sm" },
    { slug: "living-text", size: "wide" },
  ],
  media: [
    { slug: "coverflow-carousel", size: "wide" },
    { slug: "infinite-scroll", size: "tall" },
    { slug: "taped-marquee", size: "wide" },
  ],
  backgrounds: [
    { slug: "matrix-rain", size: "wide" },
    { slug: "floating-embers", size: "sm" },
    { slug: "breathing-grid", size: "sm" },
    { slug: "lumina-wave", size: "wide" },
    { slug: "breathing-background", size: "sm" },
    { slug: "horizon-glow", size: "wide" },
  ],
};

export type ShowcaseItem = { entry: RegistryEntry; size: ShowcaseSize };

/** Curated sections in navigator order, dropping slugs missing from the registry and empty groups. */
export const SHOWCASE_SECTIONS = PRESENTATION_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  items: (GALLERY_SHOWCASE[group.id] ?? [])
    .map(({ slug, size }) => ({ entry: registry.find((item) => item.slug === slug), size }))
    .filter((item): item is ShowcaseItem => Boolean(item.entry)),
})).filter((section) => section.items.length > 0);

export const SHOWCASE_COUNT = SHOWCASE_SECTIONS.reduce((total, section) => total + section.items.length, 0);
