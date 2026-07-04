"use client";

import { useRouter } from "next/navigation";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { getAdjacentEntries } from "../presentation-registry";

export function usePresentationNavigation(entry: RegistryEntry) {
  const router = useRouter();
  const navigateToComponent = usePresentationStore((state) => state.navigateToComponent);
  const adjacent = getAdjacentEntries(entry.slug);

  function navigateTo(target: RegistryEntry | null) {
    if (!target) return;
    navigateToComponent(target.slug, target.category);
    router.push(`/present/${target.category}/${target.slug}`, { scroll: false });
  }

  return {
    ...adjacent,
    navigateTo,
    navigatePrevious: () => navigateTo(adjacent.previous),
    navigateNext: () => navigateTo(adjacent.next),
  };
}

