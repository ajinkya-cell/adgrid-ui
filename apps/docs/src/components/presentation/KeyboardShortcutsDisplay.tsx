"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePresentationStore } from "@/lib/presentation/store";

const shortcuts = [
  ["Esc", "Exit presentation"],
  ["Cmd B", "Toggle navigator"],
  ["Cmd /", "Focus search"],
  ["Cmd K", "Command palette"],
  ["Left / Right", "Previous / next component"],
  ["F", "Fullscreen"],
  ["C", "Copy component name"],
  ["I", "Copy import statement"],
  ["S", "Settings"],
  ["?", "Shortcuts"],
];

export function KeyboardShortcutsDisplay() {
  const open = usePresentationStore((state) => state.shortcutsOpen);
  const toggleShortcuts = usePresentationStore((state) => state.toggleShortcuts);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center px-4">
          <motion.button type="button" aria-label="Close shortcuts" className="absolute inset-0 bg-black/62 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleShortcuts} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950/96 p-5 shadow-2xl"
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            transition={{ type: "spring", duration: 0.22, bounce: 0 }}
          >
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white">Shortcuts</h2>
            <div className="mt-5 space-y-2">
              {shortcuts.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-white/[0.035] px-3 py-2">
                  <kbd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">{key}</kbd>
                  <span className="text-sm text-white/42">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

