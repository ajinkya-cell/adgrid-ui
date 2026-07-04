"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { presentationEntries } from "./presentation-registry";
import { usePresentation } from "./hooks/usePresentation";
import { usePresentationSettings } from "./hooks/usePresentationSettings";

export function CommandPalette({ entry }: { entry: RegistryEntry }) {
  const [query, setQuery] = useState("");
  const open = usePresentationStore((state) => state.commandPaletteOpen);
  const toggleCommandPalette = usePresentationStore((state) => state.toggleCommandPalette);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const toggleSettings = usePresentationStore((state) => state.toggleSettings);
  const presentation = usePresentation(entry);
  const { updateSettings } = usePresentationSettings();

  const componentResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return presentationEntries
      .filter((item) => !q || [item.name, item.slug, item.category, item.description].some((value) => value.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query]);

  const actions = [
    { label: "Exit Presentation", hint: "Esc", run: presentation.exit },
    { label: "Toggle Navigator", hint: "Cmd B", run: toggleSidebar },
    { label: "Open Settings", hint: "S", run: toggleSettings },
    { label: "Background: Solid", hint: "", run: () => updateSettings({ backgroundMode: "solid" }) },
    { label: "Background: Grid", hint: "", run: () => updateSettings({ backgroundMode: "grid" }) },
    { label: "Background: Aurora", hint: "", run: () => updateSettings({ backgroundMode: "aurora" }) },
  ].filter((action) => action.label.toLowerCase().includes(query.toLowerCase()) || query.trim() === "");

  function closeThen(run: () => void) {
    run();
    toggleCommandPalette();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[14vh]">
          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-black/62 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCommandPalette}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/96 shadow-[0_28px_100px_rgba(0,0,0,0.62)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: -10, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.985, filter: "blur(8px)" }}
            transition={{ type: "spring", duration: 0.24, bounce: 0 }}
          >
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") toggleCommandPalette();
                if (event.key === "Enter" && componentResults[0]) closeThen(() => presentation.navigateTo(componentResults[0]));
              }}
              placeholder="Search components, actions, settings..."
              className="h-14 w-full border-b border-white/10 bg-transparent px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-white outline-none placeholder:text-white/25"
            />
            <div className="max-h-[420px] overflow-y-auto p-2">
              <div className="px-2 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">Components</div>
              {componentResults.map((item) => (
                <button key={item.slug} type="button" onClick={() => closeThen(() => presentation.navigateTo(item))} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.065]">
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-white/78">{item.name}</span>
                    <span className="mt-1 block text-xs text-white/32">{item.category}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/28">Open</span>
                </button>
              ))}

              <div className="px-2 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">Actions</div>
              {actions.map((action) => (
                <button key={action.label} type="button" onClick={() => closeThen(action.run)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.065]">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">{action.label}</span>
                  {action.hint && <span className="font-mono text-[10px] uppercase tracking-widest text-white/28">{action.hint}</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

