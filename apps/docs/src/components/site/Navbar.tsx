"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { label: "Components", href: "/components" },
    { label: "Gallery", href: "/gallery" },
    { label: "Hooks", href: "#" },
    { label: "Showcase", href: "#" },
    { label: "Templates", href: "#" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/85 backdrop-blur-md border-b border-border-hairline h-16">
      <nav className="flex justify-between items-center h-full px-6 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-2xl uppercase tracking-tighter text-white font-bold select-none">
            void<span className="text-white/30">/</span>ui
          </Link>
          <div className="hidden md:flex gap-6">
            {links.map((link) => {
              const active = pathname.startsWith(link.href) && link.href !== "#";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-body text-sm ${
                    active
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-text-muted hover:text-white transition-colors duration-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container active:bg-surface-variant text-white cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container active:bg-surface-variant text-white cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-[20px]">dark_mode</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
