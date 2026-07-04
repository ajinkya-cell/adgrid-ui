"use client";

import { useEffect } from "react";
import { usePresentationStore } from "@/lib/presentation/store";

export function useDockVisibility() {
  const dockVisible = usePresentationStore((state) => state.dockVisible);
  const setDockVisible = usePresentationStore((state) => state.setDockVisible);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    setDockVisible(true);
  }, [setDockVisible]);

  return { dockVisible, setDockVisible };
}

