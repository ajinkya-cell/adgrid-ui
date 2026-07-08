"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2, Settings, SlidersHorizontal, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { useDockVisibility } from "./hooks/useDockVisibility";
import { usePresentation } from "./hooks/usePresentation";
import { DockButton } from "./DockButton";

export function FloatingDock({ entry }: { entry: RegistryEntry }) {
  const { dockVisible } = useDockVisibility();
  const reducedMotion = useReducedMotion();
  const presentation = usePresentation(entry);
  const toggleSettings = usePresentationStore((state) => state.toggleSettings);
  const togglePropsTweaker = usePresentationStore((state) => state.togglePropsTweaker);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const iconClass = "h-4 w-4";

  return (
    <motion.div
      className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 p-1.5 backdrop-blur-2xl md:right-6 md:top-6 select-none"
      style={{
        backgroundColor: "#171717",
        boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
      }}
      animate={{
        opacity: dockVisible ? 1 : 0,
        y: dockVisible ? 0 : -8,
        filter: dockVisible ? "blur(0px)" : "blur(4px)",
      }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
    >
      <DockButton
        icon={isFullscreen ? <Minimize2 className={iconClass} /> : <Maximize2 className={iconClass} />}
        label={isFullscreen ? "Minimize" : "Fullscreen"}
        shortcut="F"
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
      />
      <DockButton icon={<Settings className={iconClass} />} label="Settings" shortcut="S" onClick={toggleSettings} />
      {entry.propDefs && entry.propDefs.length > 0 && (
        <DockButton icon={<SlidersHorizontal className={iconClass} />} label="Props" shortcut="P" onClick={togglePropsTweaker} />
      )}
      <DockButton icon={<X className={iconClass} />} label="Exit" shortcut="Esc" variant="danger" onClick={presentation.exit} />
    </motion.div>
  );
}
