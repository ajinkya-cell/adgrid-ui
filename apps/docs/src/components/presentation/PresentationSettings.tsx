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
  { value: "moonArc", label: "Moon Arc" },
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
          className="fixed right-4 top-20 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col rounded-3xl border border-white/10 bg-neutral-950/92 shadow-2xl backdrop-blur-2xl"
          style={{ maxHeight: "calc(100dvh - 6rem)" }}
          initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{ type: "spring", duration: 0.24, bounce: 0 }}
        >
          {/* Sticky header */}
          <div className="shrink-0 px-4 pb-3 pt-4">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-tight text-white">Settings</h2>
                <p className="mt-1 text-xs leading-5 text-white/38">Canvas preferences persist locally.</p>
              </div>
              <button type="button" onClick={toggleSettings} className="rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45 hover:bg-white/10 hover:text-white">
                Close
              </button>
            </div>
            {/* Thin separator */}
            <div className="mt-3 h-px w-full bg-white/[0.07]" />
          </div>

          {/* Scrollable content */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
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

            {/* Canvas Color */}
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">Canvas Color</div>
              <div className="space-y-3">
                {[
                  {
                    group: "Blacks & Greys",
                    colors: [
                      { color: "#0a0a0a", label: "Void" },
                      { color: "#111111", label: "Obsidian" },
                      { color: "#161616", label: "Graphite" },
                      { color: "#1c1c1c", label: "Smoke" },
                      { color: "#222222", label: "Iron" },
                      { color: "#2a2a2a", label: "Ash" },
                    ],
                  },
                  {
                    group: "Muted Cherry Red",
                    colors: [
                      { color: "#120808", label: "Blood" },
                      { color: "#1a0a0a", label: "Ember" },
                      { color: "#1f0d0d", label: "Garnet" },
                      { color: "#241010", label: "Crimson" },
                      { color: "#2a1212", label: "Cherry" },
                      { color: "#311515", label: "Rose Iron" },
                    ],
                  },
                  {
                    group: "Muted Blues & Purples",
                    colors: [
                      { color: "#080d18", label: "Abyss" },
                      { color: "#0a0f1e", label: "Navy" },
                      { color: "#0d1128", label: "Deep Blue" },
                      { color: "#10111f", label: "Dusk" },
                      { color: "#13111c", label: "Plum" },
                      { color: "#180f28", label: "Cosmos" },
                    ],
                  },
                  {
                    group: "Muted Greens",
                    colors: [
                      { color: "#080e09", label: "Pine" },
                      { color: "#0d1410", label: "Moss" },
                      { color: "#0e1a0f", label: "Forest" },
                      { color: "#111f12", label: "Fern" },
                      { color: "#132215", label: "Sage" },
                      { color: "#152918", label: "Malachite" },
                    ],
                  },
                  {
                    group: "Muted Ambers & Browns",
                    colors: [
                      { color: "#100d08", label: "Pitch" },
                      { color: "#16110a", label: "Walnut" },
                      { color: "#1a140c", label: "Umber" },
                      { color: "#1e170e", label: "Bourbon" },
                      { color: "#221a10", label: "Tawny" },
                      { color: "#271e12", label: "Sand Dune" },
                    ],
                  },
                ].map(({ group, colors }) => (
                  <div key={group}>
                    <div className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/22">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(({ color, label }) => (
                        <button
                          key={color}
                          type="button"
                          title={label}
                          onClick={() => updateSettings({ canvasColor: color })}
                          className="group relative h-7 w-7 rounded-lg border-2 transition-all"
                          style={{
                            backgroundColor: color,
                            borderColor: settings.canvasColor === color ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.1)",
                            boxShadow: settings.canvasColor === color ? "0 0 0 2px rgba(255,255,255,0.15)" : "none",
                          }}
                        >
                          <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 font-mono text-[9px] text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Toggle label="Safe Area" checked={settings.showSafeArea} onChange={() => updateSettings({ showSafeArea: !settings.showSafeArea })} />
              <Toggle label="Rulers" checked={settings.showRulers} onChange={() => updateSettings({ showRulers: !settings.showRulers })} />
              <Toggle label="Guides" checked={settings.showGuides} onChange={() => updateSettings({ showGuides: !settings.showGuides })} />
              <Toggle label="FPS Monitor" checked={settings.showFPS} onChange={() => updateSettings({ showFPS: !settings.showFPS })} />
              <Toggle label="Reduce Motion" checked={settings.reduceMotion} onChange={() => updateSettings({ reduceMotion: !settings.reduceMotion })} />
              <Toggle label="Click Sounds" checked={settings.playTactileSounds} onChange={() => updateSettings({ playTactileSounds: !settings.playTactileSounds })} />
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

