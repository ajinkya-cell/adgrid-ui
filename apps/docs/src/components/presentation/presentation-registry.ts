import { registry, type DisplayStrategy, type RegistryEntry } from "@/registry";

export const presentationEntries = registry;

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
  if (entry.slug === "coverflow-carousel" || entry.slug === "dot-matrix" || entry.slug === "weapon-wheel") return "fit";
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

