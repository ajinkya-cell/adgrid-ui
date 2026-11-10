"use client";

import { Moon, Search, Star, Sun } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DASH, FG, FOCUS, MUTED, externalProps } from "../parts";

export interface NavLink {
  id: string;
  label: string;
}

/** Plain text nav with the current section in full colour, and an "Open-source" pill on the right. */
export function Header({
  nav,
  activeId,
  openSourceUrl,
  theme,
  onToggleTheme,
  onOpenSearch,
}: {
  nav: NavLink[];
  activeId: string;
  openSourceUrl?: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <header className={cn("sticky top-0 z-30 border-b bg-[var(--pf-bg)]/85 backdrop-blur-md", DASH)}>
      <div className={cn("mx-auto flex h-14 max-w-[1200px] items-center gap-1 px-3 sm:px-5 xl:border-x", DASH)}>
        <nav aria-label="Sections" className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center">
            {nav.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={activeId === link.id ? "true" : undefined}
                  className={cn(
                    "block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 hover:text-[var(--pf-fg)]",
                    activeId === link.id ? FG : MUTED,
                    FOCUS
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* On wide screens search and theme live in the sidebar; here they cover phones and tablets. */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className={cn("grid size-8 place-items-center rounded-md transition-colors hover:text-[var(--pf-fg)] lg:hidden [&_svg]:size-4", MUTED, FOCUS)}
          >
            <Search aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={cn("grid size-8 place-items-center rounded-md transition-colors hover:text-[var(--pf-fg)] lg:hidden [&_svg]:size-4", MUTED, FOCUS)}
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          {openSourceUrl && (
            <a
              href={openSourceUrl}
              className={cn(
                "hidden h-8 items-center gap-1.5 rounded-full border border-[var(--pf-line)] bg-[var(--pf-panel)] px-3 text-sm font-medium transition-colors hover:border-[var(--pf-dash)] sm:flex",
                FG,
                FOCUS
              )}
              {...externalProps(openSourceUrl)}
            >
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              Open-source
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
