"use client";

import { useEffect } from "react";
import { usePresentationStore } from "@/lib/presentation/store";

export function MouseActivityProvider({ children }: { children: React.ReactNode }) {
  const setDockVisible = usePresentationStore((state) => state.setDockVisible);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setDockVisible(true);
      return;
    }

    let timer: number;
    const showDock = () => {
      setDockVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setDockVisible(false), 3000);
    };

    showDock();
    window.addEventListener("mousemove", showDock, { passive: true });
    window.addEventListener("pointerdown", showDock, { passive: true });

    return () => {
      window.removeEventListener("mousemove", showDock);
      window.removeEventListener("pointerdown", showDock);
      window.clearTimeout(timer);
    };
  }, [setDockVisible]);

  return <>{children}</>;
}
