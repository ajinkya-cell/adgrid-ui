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

export function PresentationLayout({ payload }: { payload: PresentationPayload }) {
  const { entry } = payload;
  const settings = usePresentationStore((state) => state.settings);
  const reduceMotion = settings.reduceMotion;
  const systemReducedMotion = useReducedMotion();
  const strategy = resolveDisplayStrategy(entry);

  // Live prop values from the tweaker, merged on top of the renderer's static defaults
  const componentProps = usePresentationStore((state) => state.componentProps);
  const liveProps = componentProps[entry.slug] ?? {};

  return (
    <PresentationProvider entry={entry}>
      <motion.div
        className="fixed inset-0 isolate overflow-auto bg-[#111111] text-white"
        initial={reduceMotion || systemReducedMotion ? false : { backgroundColor: "#050505" }}
        animate={{ backgroundColor: "#111111" }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <AnimatePresence mode="wait">
          <PresentationBackground mode={settings.backgroundMode} />
        </AnimatePresence>
        <PresentationCanvas strategy={strategy}>
          <PresentationRenderer entry={entry} liveProps={liveProps} />
        </PresentationCanvas>
        <FloatingDock entry={entry} />
        <PresentationSidebar entry={entry} />
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
