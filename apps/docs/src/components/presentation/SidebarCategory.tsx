"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";
import { SidebarItem } from "./SidebarItem";

export function SidebarCategory({
  name,
  entries,
  activeSlug,
  favorites,
  recentSlugs,
  onOpen,
  onFavorite,
}: {
  name: string;
  entries: RegistryEntry[];
  activeSlug: string;
  favorites: string[];
  recentSlugs: string[];
  onOpen: (entry: RegistryEntry) => void;
  onFavorite: (slug: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-2 flex w-full items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42"
      >
        <span>{name}</span>
        <span>{entries.length}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
            className="space-y-1.5"
          >
            {entries.map((entry) => (
              <SidebarItem
                key={entry.slug}
                entry={entry}
                active={entry.slug === activeSlug}
                favorite={favorites.includes(entry.slug)}
                recent={recentSlugs.includes(entry.slug)}
                onOpen={() => onOpen(entry)}
                onFavorite={() => onFavorite(entry.slug)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

