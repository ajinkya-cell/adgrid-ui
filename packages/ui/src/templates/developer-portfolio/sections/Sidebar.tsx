"use client";

import { ArrowUpRight, Moon, Search, Sun } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DASH, FG, FOCUS, LINE, MUTED, SUBTLE, externalProps } from "../parts";
import type { NavLink } from "./Header";

/** The sticky right column on wide screens: search, theme, what's being built, and the index. */
export function Sidebar({
  index,
  activeId,
  building,
  theme,
  onToggleTheme,
  onOpenSearch,
}: {
  index: NavLink[];
  activeId: string;
  building?: { label: string; url?: string };
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <aside aria-label="Page index" className={cn("hidden border-l lg:block", DASH)}>
      <div className="sticky top-14 flex flex-col gap-8 px-5 py-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-keyshortcuts="Control+K Meta+K"
            className={cn(
              "flex h-9 flex-1 items-center gap-2 rounded-full border bg-[var(--pf-panel)] pl-3 pr-1.5 text-sm transition-colors hover:border-[var(--pf-dash)]",
              LINE,
              MUTED,
              FOCUS
            )}
          >
            <Search className="size-3.5" aria-hidden="true" />
            <span className="mr-auto">Search</span>
            <span className="pf-mono flex gap-0.5 text-[10px]">
              <kbd className={cn("rounded border bg-[var(--pf-bg)] px-1", LINE)}>Ctrl</kbd>
              <kbd className={cn("rounded border bg-[var(--pf-bg)] px-1", LINE)}>K</kbd>
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={cn("grid size-9 shrink-0 place-items-center rounded-full border transition-colors hover:border-[var(--pf-dash)] [&_svg]:size-4", LINE, MUTED, FOCUS)}
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </div>

        {building && (
          <div>
            <p className={cn("pf-mono text-[11px]", SUBTLE)}>Currently building</p>
            {building.url ? (
              <a
                href={building.url}
                className={cn("pf-display mt-1 flex items-center gap-1 text-lg font-bold tracking-tight hover:underline", FG, FOCUS)}
                {...externalProps(building.url)}
              >
                @{building.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : (
              <p className={cn("pf-display mt-1 text-lg font-bold tracking-tight", FG)}>@{building.label}</p>
            )}
          </div>
        )}

        <nav aria-label="Index">
          <p className={cn("pf-display mb-2 text-lg font-bold tracking-tight", FG)}>Index</p>
          <ul className="space-y-0.5">
            {index.map((link) => {
              const active = activeId === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md py-1 text-[15px] transition-colors hover:text-[var(--pf-fg)]",
                      active ? FG : MUTED,
                      FOCUS
                    )}
                  >
                    <span aria-hidden="true" className={cn("h-px transition-all duration-200", active ? "w-4 bg-[var(--pf-fg)]" : "w-0")} />
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
