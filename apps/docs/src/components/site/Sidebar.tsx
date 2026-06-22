"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry, type ComponentCategory } from "@/registry";

const categories: ComponentCategory[] = ["animated", "primitives", "charts", "widgets", "buttons"];

const categoryIcons: Record<ComponentCategory, string> = {
  animated: "animation",
  primitives: "category",
  charts: "bar_chart",
  widgets: "widgets",
  buttons: "smart_button",
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border-hairline bg-surface-charcoal min-h-[calc(100vh-64px)] flex flex-col py-6 overflow-y-auto font-mono text-xs select-none">
      <div className="px-6 mb-8">
        <h2 className="font-display text-lg font-bold text-white leading-none mb-1">Documentation</h2>
        <span className="text-[10px] text-text-muted uppercase tracking-widest">v1.0.4-beta</span>
      </div>

      <nav className="flex-1 px-3 space-y-6">
        {/* Foundation Section */}
        <div>
          <div className="px-3 py-1 text-text-muted font-bold uppercase tracking-wider text-[10px] mb-1">
            Foundation
          </div>
          <div className="space-y-0.5">
            {[
              { label: "Getting Started", icon: "rocket_launch", href: "#" },
              { label: "Installation", icon: "download", href: "#" },
              { label: "Theming", icon: "palette", href: "#" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-text-muted hover:bg-surface-container-high hover:text-white transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Components Section */}
        <div>
          <div className="px-3 py-1 text-text-muted font-bold uppercase tracking-wider text-[10px] mb-1">
            Components
          </div>
          <div className="space-y-4">
            {categories.map((cat) => {
              const items = registry.filter((c) => c.category === cat);
              if (!items.length) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-white/40 font-bold uppercase tracking-wide text-[10px]">
                    <span className="material-symbols-outlined text-[14px]">{categoryIcons[cat]}</span>
                    {cat}
                  </div>
                  <ul className="space-y-0.5 pl-6 border-l border-border-hairline ml-4">
                    {items.map((item) => {
                      const href = `/components/${item.category}/${item.slug}`;
                      const active = pathname === href;

                      return (
                        <li key={item.slug}>
                          <Link
                            href={href}
                            className={`block px-3 py-1.5 text-xs transition-colors duration-150 ${
                              active
                                ? "text-white bg-surface-container border-l-2 border-white -ml-[25px] pl-[23px]"
                                : "text-text-muted hover:text-white hover:bg-surface-container/50"
                            }`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="px-3 pt-6 border-t border-border-hairline mt-8 space-y-1">
        {[
          { label: "GitHub", icon: "code", href: "https://github.com" },
          { label: "NPM", icon: "package_2", href: "https://npmjs.com" },
          { label: "Discord", icon: "forum", href: "https://discord.com" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-text-muted hover:bg-surface-container-high hover:text-white transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
