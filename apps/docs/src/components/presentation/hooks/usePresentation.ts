import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";

export function usePresentation(_entry?: RegistryEntry) {
  const router = useRouter();

  const exit = useCallback(() => {
    usePresentationStore.getState().exitPresentation();
    router.push("/gallery", { scroll: false });
  }, [router]);

  const navigateTo = useCallback(
    (target: RegistryEntry) => {
      usePresentationStore.getState().navigateToComponent(target.slug, target.category);
      router.push(`/present/${target.category}/${target.slug}`, { scroll: false });
    },
    [router]
  );

  return {
    exit,
    navigateTo,
  };
}

