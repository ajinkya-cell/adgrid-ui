"use client";

import { useRouter } from "next/navigation";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";

export function usePresentation(_entry: RegistryEntry) {
  const router = useRouter();
  const store = usePresentationStore();

  return {
    ...store,
    exit: () => {
      store.exitPresentation();
      router.push("/gallery", { scroll: false });
    },
    navigateTo: (target: RegistryEntry) => {
      store.navigateToComponent(target.slug, target.category);
      router.push(`/present/${target.category}/${target.slug}`, { scroll: false });
    },
  };
}

