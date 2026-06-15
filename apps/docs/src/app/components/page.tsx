import Link from "next/link";
import { registry, type ComponentCategory } from "@/registry";

const categories: ComponentCategory[] = ["animated", "primitives", "charts", "widgets"];

export default function ComponentsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Components</h1>
      <p className="text-white/40 mb-16 font-mono text-sm">
        {registry.length} components. Copy-paste or{" "}
        <code className="text-white/60">npm install @adgrid-ui/ui</code>.
      </p>

      {categories.map((cat) => {
        const items = registry.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-16">
            <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-6">
              // {cat}
            </p>
            <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/components/${item.category}/${item.slug}`}
                  className="bg-black p-6 hover:bg-white/2 transition-colors group"
                >
                  <p className="font-display font-semibold text-white mb-1 group-hover:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-white/30 mb-4">{item.description}</p>
                  {item.dependencies.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="text-xs font-mono px-1.5 py-0.5 bg-white/5 text-white/30 rounded-sm"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
}