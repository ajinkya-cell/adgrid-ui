"use client";

import { Copy, ExternalLink, FileCode2, Maximize2, PanelRightOpen, Settings, SlidersHorizontal, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { getImportStatement, getSourceUrl } from "./presentation-registry";
import { useDockVisibility } from "./hooks/useDockVisibility";
import { usePresentation } from "./hooks/usePresentation";
import { DockButton } from "./DockButton";

export function FloatingDock({ entry }: { entry: RegistryEntry }) {
  const { dockVisible } = useDockVisibility();
  const reducedMotion = useReducedMotion();
  const presentation = usePresentation(entry);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const toggleSettings = usePresentationStore((state) => state.toggleSettings);
  const togglePropsTweaker = usePresentationStore((state) => state.togglePropsTweaker);

  const iconClass = "h-4 w-4";

  return (
    <motion.div
      className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-2xl border border-white/10 bg-neutral-950/72 p-1.5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:right-6 md:top-6"
      animate={{
        opacity: dockVisible ? 1 : 0,
        y: dockVisible ? 0 : -8,
        filter: dockVisible ? "blur(0px)" : "blur(4px)",
      }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
    >
      <DockButton
        icon={<Maximize2 className={iconClass} />}
        label="Fullscreen"
        shortcut="F"
        onClick={() => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
          else document.exitFullscreen().catch(() => {});
        }}
      />
      <DockButton icon={<ExternalLink className={iconClass} />} label="Open" onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")} />
      <DockButton icon={<FileCode2 className={iconClass} />} label="Source" onClick={() => window.open(getSourceUrl(entry), "_blank", "noopener,noreferrer")} />
      <DockButton icon={<Copy className={iconClass} />} label="Copy Name" shortcut="C" onClick={() => navigator.clipboard?.writeText(entry.name)} />
      <DockButton icon={<Copy className={iconClass} />} label="Copy Import" shortcut="I" onClick={() => navigator.clipboard?.writeText(getImportStatement(entry))} />
      <DockButton icon={<Settings className={iconClass} />} label="Settings" shortcut="S" onClick={toggleSettings} />
      <DockButton icon={<PanelRightOpen className={iconClass} />} label="Navigator" shortcut="Cmd B" onClick={toggleSidebar} />
      {entry.propDefs && entry.propDefs.length > 0 && (
        <DockButton icon={<SlidersHorizontal className={iconClass} />} label="Props" shortcut="P" onClick={togglePropsTweaker} />
      )}
      <DockButton icon={<X className={iconClass} />} label="Exit" shortcut="Esc" variant="danger" onClick={presentation.exit} />
    </motion.div>
  );
}

