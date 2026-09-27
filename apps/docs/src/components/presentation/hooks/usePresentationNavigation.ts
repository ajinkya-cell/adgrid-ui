import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { getAdjacentEntries } from "../presentation-registry";

export function usePresentationNavigation(entry: RegistryEntry) {
  const router = useRouter();
  const adjacent = useMemo(() => getAdjacentEntries(entry.slug), [entry.slug]);

  const navigateTo = useCallback(
    (target: RegistryEntry | null) => {
      if (!target) return;
      usePresentationStore.getState().navigateToComponent(target.slug, target.category);
      router.push(`/present/${target.category}/${target.slug}`, { scroll: false });
    },
    [router]
  );

  const navigatePrevious = useCallback(() => {
    navigateTo(adjacent.previous);
  }, [navigateTo, adjacent.previous]);

  const navigateNext = useCallback(() => {
    navigateTo(adjacent.next);
  }, [navigateTo, adjacent.next]);

  return {
    ...adjacent,
    navigateTo,
    navigatePrevious,
    navigateNext,
  };
}

