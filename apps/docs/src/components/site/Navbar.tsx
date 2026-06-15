import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 md:px-6 pt-4">
      <nav className="max-w-7xl mx-auto bg-[#0a0a0a] border border-white/[0.06] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] h-14 flex items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display font-bold text-white tracking-tight">
          void<span className="text-white/30">/</span>ui
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[
            ["Components", "/components"],
            ["Docs", "/docs/getting-started"],
            ["Playground", "/playground"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-white/50 hover:text-white transition-all duration-150 font-mono"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/30 border border-white/10 px-2 py-1 rounded-lg bg-gradient-to-b from-white/[0.04] to-white/[0.02] shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            v0.1.0
          </span>
          <a
            href="https://github.com/yourusername/adgrid-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 hover:text-white transition-all duration-150 font-mono"
          >
            GitHub ↗
          </a>
        </div>
      </nav>
    </header>
  );
}