import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-pure-black border-t border-border-hairline py-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1440px] mx-auto gap-6">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <Link href="/" className="font-display text-2xl text-white font-bold uppercase tracking-tighter">
            void<span className="text-white/30">/</span>ui
          </Link>
          <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase text-center md:text-left">
            © 2026 VOID/UI CORE TEAM. BUILT FOR THE VOID.
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {["Privacy Policy", "Terms of Service", "Security", "Status"].map((label) => (
            <a
              key={label}
              className="font-mono text-[10px] text-text-muted hover:text-white underline uppercase tracking-wider transition-colors duration-200"
              href="#"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex gap-4">
          <a
            className="p-2 border border-border-hairline text-text-muted hover:text-white hover:border-white transition-colors duration-200"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined block text-[20px]">code</span>
          </a>
          <a
            className="p-2 border border-border-hairline text-text-muted hover:text-white hover:border-white transition-colors duration-200"
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined block text-[20px]">forum</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
