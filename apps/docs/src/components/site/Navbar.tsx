"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const links = [
    { label: "Gallery", href: "/gallery" },
    { label: "Docs", href: "/docs/getting-started" },
    { label: "Lab", href: "/lab" },
    { label: "Hero Demo", href: "/hero-demo" },
    { label: "Matrix Demo", href: "/matrix-demo" },
  ];

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("pnpm add @adgrid-ui/ui");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 pt-3 pb-2 select-none pointer-events-none">
      <nav className="max-w-[1280px] mx-auto h-14 rounded-2xl bg-[#09090b]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-between px-5 pointer-events-auto transition-all duration-300">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 font-display text-xl uppercase tracking-tighter text-white font-extrabold"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors shadow-inner">
              <span className="material-symbols-outlined text-[16px] text-white">terminal</span>
            </div>
            <span>
              void<span className="text-white/40 font-light">/</span>ui
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full border border-white/10 bg-white/5 font-mono text-[9px] text-white/50 tracking-widest uppercase">
            V1.0.4
          </span>
        </div>

        {/* Navigation Pill Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/gallery" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 ${
                  active
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* CLI Copy Command Button */}
          <button
            onClick={handleCopyInstall}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            title="Copy install command"
          >
            <span className="text-white/40">$</span>
            <span>{copied ? "COPIED!" : "pnpm add @adgrid-ui/ui"}</span>
            <span className="material-symbols-outlined text-[14px]">
              {copied ? "check" : "content_copy"}
            </span>
          </button>

          {/* Docs CTA */}
          <Link
            href="/docs/getting-started"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-md"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
