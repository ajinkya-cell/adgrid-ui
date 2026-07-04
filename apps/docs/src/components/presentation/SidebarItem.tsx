"use client";

import { Star } from "lucide-react";
import type { RegistryEntry } from "@/registry";

export function SidebarItem({
  entry,
  active,
  favorite,
  recent,
  onOpen,
  onFavorite,
}: {
  entry: RegistryEntry;
  active: boolean;
  favorite: boolean;
  recent: boolean;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border p-2 transition-colors ${
        active ? "border-white/18 bg-white/[0.075]" : "border-transparent hover:border-white/10 hover:bg-white/[0.045]"
      }`}
    >
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="grid h-10 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/35 font-display text-sm font-bold uppercase text-white/55">
          {entry.name.slice(0, 2)}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">
            {entry.name}
            {recent && <span className="h-1.5 w-1.5 rounded-full bg-white/45" aria-label="recent" />}
          </span>
          <span className="mt-1 line-clamp-1 block text-xs leading-5 text-white/34">{entry.description}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onFavorite}
        aria-label={favorite ? `Remove ${entry.name} from favorites` : `Favorite ${entry.name}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Star className={`h-3.5 w-3.5 ${favorite ? "fill-white text-white" : ""}`} />
      </button>
    </div>
  );
}

