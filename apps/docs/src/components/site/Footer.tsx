import Link from "next/link";

const links = [
  { label: "Docs", href: "/docs/getting-started" },
  { label: "Components", href: "/components" },
  { label: "Playground", href: "/playground" },
];

const external = [
  { label: "GitHub ↗", href: "https://github.com/yourusername/adgrid-ui" },
  { label: "MIT License", href: "#" },
];

export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 md:px-6 pb-6 md:pb-8">
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] px-6 md:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <Link href="/" className="font-display font-bold text-white tracking-tight">
              void<span className="text-white/30">/</span>ui
            </Link>
            <p className="text-xs font-mono text-white/25 mt-1">
              dark-first · open source · mit
            </p>
          </div>
          <div className="flex gap-10">
            <div>
              <p className="font-mono text-[10px] text-white/20 mb-3 tracking-widest uppercase">
                Links
              </p>
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-150 font-mono"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-white/20 mb-3 tracking-widest uppercase">
                Connect
              </p>
              <div className="flex flex-col gap-2">
                {external.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/40 hover:text-white transition-colors duration-150 font-mono"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/[0.04]">
          <p className="text-xs font-mono text-white/15 text-center">
            built for the void
          </p>
        </div>
      </div>
    </footer>
  );
}
