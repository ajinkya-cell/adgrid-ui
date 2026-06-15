"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry, type ComponentCategory } from "@/registry";
import { cn } from "@adgrid-ui/ui";

const categories: ComponentCategory[] = ["animated", "primitives", "charts", "widgets"];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-white/5 min-h-screen py-8 px-4">
      {categories.map((cat) => {
        const items = registry.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-8">
            <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3 px-2">
              {cat}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const href = `/components/${item.category}/${item.slug}`;
                const active = pathname === href;
                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "block px-2 py-1.5 text-sm font-mono rounded-sm transition-colors",
                        active
                          ? "text-white bg-white/5"
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
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
    </aside>
  );
}