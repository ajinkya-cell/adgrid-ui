"use client";

import { useEffect } from "react";
import { LayoutGroup } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { MouseActivityProvider } from "./MouseActivityProvider";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

export function PresentationProvider({
  entry,
  children,
}: {
  entry: RegistryEntry;
  children: React.ReactNode;
}) {
  useKeyboardShortcuts(entry);
  const enterPresentation = usePresentationStore((state) => state.enterPresentation);

  useEffect(() => {
    enterPresentation(entry.slug, entry.category);
  }, [entry.category, entry.slug, enterPresentation]);

  return (
    <LayoutGroup id="presentation-mode">
      <MouseActivityProvider>{children}</MouseActivityProvider>
    </LayoutGroup>
  );
}
