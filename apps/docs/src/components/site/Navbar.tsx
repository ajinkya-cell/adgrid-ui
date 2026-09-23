"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { usePresentationStore } from "@/lib/presentation/store";

export function Navbar() {
  const pathname = usePathname();
  const toggleCommandPalette = usePresentationStore((state) => state.toggleCommandPalette);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommandPalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);

  const links = [
    {
      label: "Gallery",
      href: "/gallery",
      isActive: pathname === "/gallery",
    },
    {
      label: "Components",
      href: "/present/buttons/void-button",
      isActive:
        pathname.startsWith("/present") ||
        pathname.startsWith("/components") ||
        pathname.startsWith("/docs"),
    },
    {
      label: "Roughly",
      href: "/roughly",
      isActive: pathname.startsWith("/roughly"),
    },
  ];

  return (
    <header className="fixed left-0 top-3 z-50 flex w-full justify-center px-2 sm:top-4 sm:px-4 pointer-events-none select-none">
      <nav className="site-bevel-panel flex h-12 w-full max-w-[40rem] items-center justify-between gap-2 rounded-full px-2 sm:px-3 pointer-events-auto font-inter">
        <Link
          href="/"
          aria-label="Void UI home"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Image
            src="/previews/void.png"
            alt="Void UI"
            width={48}
            height={48}
            preload
            className="h-10 w-10 object-contain mix-blend-screen"
          />
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={link.isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-1.5 py-2 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-xs ${
                link.isActive
                  ? "text-white font-semibold"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleCommandPalette}
            className="flex h-9 items-center justify-center gap-2 rounded-xl px-2.5 text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            title="Open command palette"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden text-xs md:inline">Search</span>
          </button>
          <a
            href="https://github.com/ajinkya-cell/adgrid-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            title="GitHub repository"
            aria-label="GitHub repository"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.013 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}
