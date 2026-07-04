"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import { groupEntriesByCategory, presentationEntries } from "./presentation-registry";
import { SidebarCategory } from "./SidebarCategory";
import { SidebarSearch } from "./SidebarSearch";
import { usePresentation } from "./hooks/usePresentation";

function matches(entry: RegistryEntry, query: string, favorite: boolean, recent: boolean) {
  const q = query.trim().toLowerCase();
  if (q === "favorite" || q === "favorites") return favorite;
  if (q === "recent") return recent;
  if (!q) return true;
  return [entry.name, entry.slug, entry.category, entry.description].some((value) => value.toLowerCase().includes(q));
}

export function PresentationSidebar({ entry }: { entry: RegistryEntry }) {
  const [query, setQuery] = useState("");
  const open = usePresentationStore((state) => state.sidebarOpen);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const favorites = usePresentationStore((state) => state.favorites);
  const recent = usePresentationStore((state) => state.recent);
  const toggleFavorite = usePresentationStore((state) => state.toggleFavorite);
  const presentation = usePresentation(entry);
  const recentSlugs = recent.map((item) => item.slug);

  const grouped = useMemo(() => {
    const filtered = presentationEntries.filter((item) =>
      matches(item, query, favorites.includes(item.slug), recentSlugs.includes(item.slug))
    );
    return groupEntriesByCategory(filtered);
  }, [favorites, query, recentSlugs]);

  const flatResults = useMemo(() => Object.values(grouped).flat(), [grouped]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close component navigator"
            className="fixed inset-0 z-30 bg-black/24 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
          <motion.aside
            className="fixed bottom-0 right-0 z-40 flex max-h-[86dvh] w-full flex-col rounded-t-3xl border border-white/10 bg-neutral-950/94 p-4 shadow-2xl backdrop-blur-2xl md:top-0 md:h-dvh md:max-h-none md:w-[360px] md:rounded-l-3xl md:rounded-tr-none md:border-y-0 md:border-r-0"
            initial={{ opacity: 0, x: 24, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 24, y: 12, filter: "blur(6px)" }}
            transition={{ type: "spring", duration: 0.32, bounce: 0 }}
          >
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Navigator</div>
                  <div className="mt-1 text-sm text-white/70">{flatResults.length} components</div>
                </div>
                <button type="button" onClick={toggleSidebar} className="rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45 hover:bg-white/10 hover:text-white">
                  Close
                </button>
              </div>
              <SidebarSearch
                value={query}
                onChange={setQuery}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && flatResults[0]) presentation.navigateTo(flatResults[0]);
                }}
              />
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([category, entries]) => (
                <SidebarCategory
                  key={category}
                  name={category}
                  entries={entries}
                  activeSlug={entry.slug}
                  favorites={favorites}
                  recentSlugs={recentSlugs}
                  onOpen={presentation.navigateTo}
                  onFavorite={toggleFavorite}
                />
              ))}
              {flatResults.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/40">No matching components.</div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

