"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

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
    <header className="fixed top-3 sm:top-4 left-0 w-full z-50 px-4 flex justify-center pointer-events-none select-none">
      <nav className="w-full max-w-[480px] h-11 rounded-full bg-[#09090b]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-between px-5 pointer-events-auto transition-all duration-300">
        {/* Left: Brand / Logo */}
        <Link
          href="/"
          className="font-display text-sm font-bold tracking-tight text-white hover:text-white/80 transition-colors select-none"
        >
          void UI
        </Link>

        {/* Middle: Gallery, Components & Roughly in EB Garamond Italics */}
        <div className="flex items-center gap-5 sm:gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm md:text-base italic tracking-wide transition-colors ${
                link.isActive
                  ? "text-white font-medium"
                  : "text-white/45 hover:text-white"
              }`}
              style={{ fontFamily: 'var(--font-eb-garamond), "EB Garamond", serif' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Modern GitHub Icon without any wrapper div or box */}
        <a
          href="https://github.com/ajinkya-cell/adgrid-ui"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/75 hover:text-white transition-all hover:scale-105 p-0.5"
          title="GitHub"
          aria-label="GitHub Repository"
        >
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
      </nav>
    </header>
  );
}
