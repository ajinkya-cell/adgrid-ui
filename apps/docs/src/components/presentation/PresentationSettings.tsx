"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePresentationStore, type BackgroundMode } from "@/lib/presentation/store";
import { usePresentationSettings } from "./hooks/usePresentationSettings";

const backgrounds: Array<{ value: BackgroundMode; label: string }> = [
  { value: "solid", label: "Solid" },
  { value: "noise", label: "Noise" },
  { value: "grid", label: "Grid" },
  { value: "dotGrid", label: "Dot Grid" },
  { value: "gradient", label: "Gradient" },
  { value: "aurora", label: "Aurora" },
];

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/58">{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${checked ? "bg-white" : "bg-white/12"}`}>
        <span className={`block h-4 w-4 rounded-full bg-black transition-transform ${checked ? "translate-x-4" : "translate-x-0 bg-white/45"}`} />
      </span>
    </button>
  );
}

export function PresentationSettings() {
  const open = usePresentationStore((state) => state.settingsOpen);
  const toggleSettings = usePresentationStore((state) => state.toggleSettings);
  const { settings, updateSettings, resetPresentation } = usePresentationSettings();

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-label="Presentation settings"
          className="fixed right-4 top-20 z-50 w-[min(360px,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-neutral-950/92 p-4 shadow-2xl backdrop-blur-2xl"
          initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{ type: "spring", duration: 0.24, bounce: 0 }}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-tight text-white">Settings</h2>
              <p className="mt-1 text-xs leading-5 text-white/38">Canvas preferences persist locally.</p>
            </div>
            <button type="button" onClick={toggleSettings} className="rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45 hover:bg-white/10 hover:text-white">
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">Background</div>
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((background) => (
                  <button
                    key={background.value}
                    type="button"
                    onClick={() => updateSettings({ backgroundMode: background.value })}
                    className={`rounded-xl border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                      settings.backgroundMode === background.value
                        ? "border-white/35 bg-white text-black"
                        : "border-white/10 bg-white/[0.035] text-white/58 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {background.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Toggle label="Safe Area" checked={settings.showSafeArea} onChange={() => updateSettings({ showSafeArea: !settings.showSafeArea })} />
              <Toggle label="Rulers" checked={settings.showRulers} onChange={() => updateSettings({ showRulers: !settings.showRulers })} />
              <Toggle label="Guides" checked={settings.showGuides} onChange={() => updateSettings({ showGuides: !settings.showGuides })} />
              <Toggle label="FPS Monitor" checked={settings.showFPS} onChange={() => updateSettings({ showFPS: !settings.showFPS })} />
              <Toggle label="Reduce Motion" checked={settings.reduceMotion} onChange={() => updateSettings({ reduceMotion: !settings.reduceMotion })} />
            </div>

            <button type="button" onClick={resetPresentation} className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/58 hover:border-white/25 hover:text-white">
              Reset Presentation
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

