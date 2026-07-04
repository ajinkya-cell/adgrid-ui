"use client";

import { useRouter } from "next/navigation";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";

export function usePresentation(entry: RegistryEntry) {
  const router = useRouter();
  const store = usePresentationStore();

  return {
    ...store,
    exit: () => {
      store.exitPresentation();
      router.push(`/components/${entry.category}/${entry.slug}`, { scroll: false });
    },
    navigateTo: (target: RegistryEntry) => {
      store.navigateToComponent(target.slug, target.category);
      router.push(`/present/${target.category}/${target.slug}`, { scroll: false });
    },
  };
}

