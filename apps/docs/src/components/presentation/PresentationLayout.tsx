"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PresentationPayload } from "./types";
import { usePresentationStore } from "@/lib/presentation/store";
import { resolveDisplayStrategy } from "./presentation-registry";
import { PresentationProvider } from "./PresentationProvider";
import { PresentationBackground } from "./PresentationBackground";
import { PresentationCanvas } from "./PresentationCanvas";
import { PresentationRenderer } from "./PresentationRenderer";
import { FloatingDock } from "./FloatingDock";
import { PresentationSidebar } from "./PresentationSidebar";
import { PresentationSettings } from "./PresentationSettings";
import { CommandPalette } from "./CommandPalette";
import { KeyboardShortcutsDisplay } from "./KeyboardShortcutsDisplay";
import { FPSMonitor } from "./FPSMonitor";
import { PresentationOverlays } from "./PresentationOverlays";
import { PropsTweaker } from "./PropsTweaker";
import { SidebarTrigger } from "./SidebarTrigger";

export function PresentationLayout({ payload }: { payload: PresentationPayload }) {
  const { entry } = payload;
  const settings = usePresentationStore((state) => state.settings);
  const reduceMotion = settings.reduceMotion;
  const systemReducedMotion = useReducedMotion();
  const strategy = resolveDisplayStrategy(entry);

  const componentProps = usePresentationStore((state) => state.componentProps);
  const liveProps = componentProps[entry.slug] ?? {};

  return (
    <PresentationProvider entry={entry}>
      <motion.div
        className="relative w-full min-h-screen bg-[#111111] text-white"
        initial={reduceMotion || systemReducedMotion ? false : { backgroundColor: "#050505" }}
        animate={{ backgroundColor: "#111111" }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          /* High-specificity overrides to beat global styles */
          html body .present-scroll::-webkit-scrollbar,
          html body .present-scroll *::-webkit-scrollbar {
            width: 6px !important;
            height: 6px !important;
            display: block !important;
          }
          html body .present-scroll::-webkit-scrollbar-track,
          html body .present-scroll *::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.15) !important;
            border-radius: 9999px !important;
          }
          html body .present-scroll::-webkit-scrollbar-thumb,
          html body .present-scroll *::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.22) !important;
            border-radius: 9999px !important;
            border: none !important;
          }
          html body .present-scroll::-webkit-scrollbar-thumb:hover,
          html body .present-scroll *::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.38) !important;
          }
          html body .present-scroll,
          html body .present-scroll * {
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255, 255, 255, 0.22) rgba(0, 0, 0, 0.15) !important;
          }
        `}} />
        <AnimatePresence mode="wait">
          <PresentationBackground mode={settings.backgroundMode} />
        </AnimatePresence>
        
        {/* Edge-docked Sidebar Trigger Button */}
        <SidebarTrigger />

        <PresentationCanvas strategy={strategy}>
          <PresentationRenderer entry={entry} liveProps={liveProps} />
        </PresentationCanvas>
        <FloatingDock entry={entry} />
        <PresentationSidebar entry={entry} sourceFiles={payload.sourceFiles} />
        <PresentationSettings />
        <CommandPalette entry={entry} />
        <KeyboardShortcutsDisplay />
        <PresentationOverlays />
        {/* Sticky Props Tweaker — bottom-left, only when entry has propDefs */}
        <PropsTweaker entry={entry} />
        {settings.showFPS && <FPSMonitor />}
      </motion.div>
    </PresentationProvider>
  );
}
