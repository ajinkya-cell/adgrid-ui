"use client";

import { useEffect } from "react";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { getImportStatement } from "../presentation-registry";
import { usePresentation } from "./usePresentation";
import { usePresentationNavigation } from "./usePresentationNavigation";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

export function useKeyboardShortcuts(entry: RegistryEntry) {
  const presentation = usePresentation(entry);
  const navigation = usePresentationNavigation(entry);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const toggleCommandPalette = usePresentationStore((state) => state.toggleCommandPalette);
  const toggleSettings = usePresentationStore((state) => state.toggleSettings);
  const toggleShortcuts = usePresentationStore((state) => state.toggleShortcuts);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && key === "k") {
        event.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (mod && key === "b") {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (mod && event.key === "/") {
        event.preventDefault();
        toggleSidebar();
        requestAnimationFrame(() => document.getElementById("presentation-sidebar-search")?.focus());
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        presentation.exit();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigation.navigatePrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigation.navigateNext();
        return;
      }

      if (key === "f") {
        event.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        return;
      }

      if (key === "c") {
        event.preventDefault();
        navigator.clipboard?.writeText(entry.name);
        return;
      }

      if (key === "i") {
        event.preventDefault();
        navigator.clipboard?.writeText(getImportStatement(entry));
        return;
      }

      if (key === "s") {
        event.preventDefault();
        toggleSettings();
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        toggleShortcuts();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [entry, navigation, presentation, toggleCommandPalette, toggleSettings, toggleShortcuts, toggleSidebar]);
}

