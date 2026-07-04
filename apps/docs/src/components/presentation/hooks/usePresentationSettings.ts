"use client";

import { usePresentationStore } from "@/lib/presentation/store";

export function usePresentationSettings() {
  const settings = usePresentationStore((state) => state.settings);
  const updateSettings = usePresentationStore((state) => state.updateSettings);
  const resetPresentation = usePresentationStore((state) => state.resetPresentation);

  return { settings, updateSettings, resetPresentation };
}

