import { registry, type DisplayStrategy, type RegistryEntry } from "@/registry";

// The navigator groups components by what they're for, not by how they're built. Order here is the
// order of the list, and of previous/next in presentation mode. Anything not listed lands in "More".
export const PRESENTATION_GROUPS: { id: string; label: string; slugs: string[] }[] = [
  {
    id: "inputs",
    label: "Inputs",
    slugs: ["text-field", "select", "color-picker", "choice", "switch", "segmented-control", "combobox", "otp-input", "datepicker", "wheel-picker", "anisotropic-knob", "file-upload", "laser-vault-password"],
  },
  {
    id: "buttons",
    label: "Buttons",
    slugs: ["button", "button-alpha", "void-button", "brushed-titanium-button", "liquid-gold-button", "guilloche-button"],
  },
  {
    id: "feedback",
    label: "Feedback & Overlays",
    slugs: ["toast", "progress", "spinner", "meter", "tooltip", "popover", "modal", "dialog", "drawer", "command-palette"],
  },
  {
    id: "navigation",
    label: "Navigation",
    slugs: ["nav", "sidebar", "navbar-1", "menubar", "tabs", "breadcrumbs", "pagination", "weapon-wheel", "scroll-progress", "ruler-scrollbar", "scroll-water"],
  },
  {
    id: "data",
    label: "Data Display",
    slugs: ["table", "accordion", "timeline", "github-heatmap", "globe", "bento-grid", "dot-matrix"],
  },
  {
    id: "cards",
    label: "Cards",
    slugs: ["simple-card", "cards", "sticker-card", "developer-id-card", "now-playing-card", "breathing-scale-card", "expand-on-hover", "gravity-card-stack", "stacked-cards", "stacked-card-fan"],
  },
  {
    id: "text",
    label: "Text & Icons",
    slugs: ["living-text", "spotlight-text", "text-shuffle", "animated-icons-1"],
  },
  {
    id: "media",
    label: "Media & Motion",
    slugs: ["image-reveal", "image-parallax", "coverflow-carousel", "tilted-collage", "taped-marquee", "marquee", "marquee-2", "infinite-scroll", "moon-pull"],
  },
  {
    id: "backgrounds",
    label: "Backgrounds",
    slugs: ["lumina-wave", "breathing-background", "breathing-grid", "spotlight-grid", "floating-embers", "pixel-melt", "matrix-rain", "matrix-ripple-background", "flickering-grid-playground", "dot-pattern-playground"],
  },
  {
    id: "pages",
    label: "Pages",
    slugs: ["premium-hero", "hero", "forgeui-landing", "rays-landing"],
  },
];

const groupRank = new Map(
  PRESENTATION_GROUPS.flatMap((group, groupIndex) => group.slugs.map((slug, i) => [slug, groupIndex * 1000 + i] as const))
);
const rankOf = (entry: RegistryEntry) => groupRank.get(entry.slug) ?? Number.MAX_SAFE_INTEGER;

export const presentationEntries = registry
  .filter((entry) => entry.slug !== "roughly")
  .map((entry, index) => ({ entry, index }))
  .sort((a, b) => rankOf(a.entry) - rankOf(b.entry) || a.index - b.index)
  .map(({ entry }) => entry);

export function groupForEntry(entry: RegistryEntry) {
  return PRESENTATION_GROUPS.find((group) => group.slugs.includes(entry.slug)) ?? { id: "more", label: "More", slugs: [] };
}

/** Entries split into navigator groups, in list order, dropping empty groups. */
export function groupPresentationEntries(entries: RegistryEntry[]) {
  const groups: { id: string; label: string; entries: RegistryEntry[] }[] = [];
  for (const entry of entries) {
    const { id, label } = groupForEntry(entry);
    const last = groups[groups.length - 1];
    if (last?.id === id) last.entries.push(entry);
    else groups.push({ id, label, entries: [entry] });
  }
  return groups;
}

export function getComponentName(entry: RegistryEntry) {
  return entry.name.replace(/\s/g, "");
}

export function getImportStatement(entry: RegistryEntry) {
  return `import { ${getComponentName(entry)} } from "@adgrid-ui/ui";`;
}

export function getSourceUrl(entry: RegistryEntry) {
  return `/api/registry/${entry.slug}`;
}

export function resolveDisplayStrategy(entry: RegistryEntry): Exclude<DisplayStrategy, "auto"> {
  if (entry.presentationStrategy && entry.presentationStrategy !== "auto") {
    return entry.presentationStrategy;
  }

  if (entry.category === "backgrounds") return "fullscreen";
  if (entry.slug === "premium-hero") return "cover";
  if (entry.slug === "infinite-scroll") return "fullscreen";
  if (entry.slug === "dot-matrix" || entry.slug === "weapon-wheel") return "fit";
  return "center";
}

export function getAdjacentEntries(slug: string) {
  const index = presentationEntries.findIndex((entry) => entry.slug === slug);
  return {
    previous: index > 0 ? presentationEntries[index - 1] : null,
    next: index >= 0 && index < presentationEntries.length - 1 ? presentationEntries[index + 1] : null,
    index,
    total: presentationEntries.length,
  };
}

export function groupEntriesByCategory(entries: RegistryEntry[]) {
  return entries.reduce<Record<string, RegistryEntry[]>>((groups, entry) => {
    groups[entry.category] ??= [];
    groups[entry.category].push(entry);
    return groups;
  }, {});
}

