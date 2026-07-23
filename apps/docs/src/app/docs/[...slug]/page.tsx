import { redirect } from "next/navigation";
import Link from "next/link";
import { registry } from "@/registry";
import { Sidebar } from "@/components/site/Sidebar";

export default async function DocsSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const pageSlug = slug ? slug[0] : "getting-started";

  // Check if slug matches a component in registry
  const lastSlug = slug ? slug[slug.length - 1] : "";
  const componentEntry = registry.find((c) => c.slug === lastSlug || c.slug === pageSlug);

  if (componentEntry) {
    redirect(`/present/${componentEntry.category}/${componentEntry.slug}`);
  }

  // Render static doc page based on pageSlug
  return (
    <div className="flex min-h-screen bg-pure-black text-white">
      <Sidebar />
      <main className="flex-1 max-w-4xl px-8 py-12 mx-auto space-y-12">
        {pageSlug === "installation" ? (
          <InstallationDoc />
        ) : pageSlug === "theming" ? (
          <ThemingDoc />
        ) : (
          <GettingStartedDoc />
        )}
      </main>
    </div>
  );
}

function GettingStartedDoc() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-widest text-text-muted mb-4 uppercase">
          Documentation // Core
        </div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white mb-4">
          Getting Started
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-2xl">
          Welcome to <span className="text-white font-mono">@adgrid-ui</span> — a dark-first, performance-engineered UI library built for modern WebGL, Framer Motion, and Next.js applications.
        </p>
      </div>

      <hr className="border-border-hairline" />

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">Quick Start</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Install the package or copy individual component source files directly into your project using the shadcn-compatible CLI registry.
        </p>
        <div className="bg-surface-charcoal p-4 rounded-xl border border-border-hairline font-mono text-sm text-white flex items-center justify-between">
          <span>pnpm add @adgrid-ui/ui framer-motion lucide-react</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">Usage</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Import components directly from the package:
        </p>
        <pre className="bg-surface-charcoal p-4 rounded-xl border border-border-hairline font-mono text-xs text-white/90 overflow-x-auto">
{`import { VoidButton, LiquidGoldButton, DotMatrix } from "@adgrid-ui/ui";

export default function App() {
  return (
    <div className="p-8 space-y-4 bg-black">
      <VoidButton>Initialize System</VoidButton>
      <LiquidGoldButton>Upgrade Access</LiquidGoldButton>
    </div>
  );
}`}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">Explore Components</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Browse our complete library of animated elements, buttons, primitives, and background shaders in the Gallery.
        </p>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/90 transition-colors"
        >
          <span>Open Component Gallery</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </section>
    </article>
  );
}

function InstallationDoc() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-widest text-text-muted mb-4 uppercase">
          Documentation // Setup
        </div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white mb-4">
          Installation
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-2xl">
          Learn how to install <span className="text-white font-mono">@adgrid-ui</span> in Next.js, React, or Vite projects.
        </p>
      </div>

      <hr className="border-border-hairline" />

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">1. Install Package</h2>
        <div className="bg-surface-charcoal p-4 rounded-xl border border-border-hairline font-mono text-sm text-white">
          <span>npm install @adgrid-ui/ui framer-motion lucide-react</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">2. Tailwind CSS Setup</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Ensure your <code className="text-white bg-surface-charcoal px-1.5 py-0.5 rounded">tailwind.config.js</code> includes the UI package path:
        </p>
        <pre className="bg-surface-charcoal p-4 rounded-xl border border-border-hairline font-mono text-xs text-white/90 overflow-x-auto">
{`module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@adgrid-ui/ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">3. CLI / Copy-Paste Registry</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          You can also fetch component source code directly via the shadcn CLI registry endpoint:
        </p>
        <div className="bg-surface-charcoal p-4 rounded-xl border border-border-hairline font-mono text-sm text-white">
          <span>npx shadcn@latest add https://adgrid-ui.vercel.app/r/infinite-scroll.json</span>
        </div>
      </section>
    </article>
  );
}

function ThemingDoc() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-widest text-text-muted mb-4 uppercase">
          Documentation // Style System
        </div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white mb-4">
          Theming & Tokens
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-2xl">
          Deep, high-contrast dark theme with hairline borders, brushed metals, and precision micro-animations.
        </p>
      </div>

      <hr className="border-border-hairline" />

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">Color Tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-pure-black border border-border-hairline rounded-xl space-y-1">
            <span className="text-white font-bold">Pure Black</span>
            <p className="text-text-muted">#000000 / Surface Base</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-border-hairline rounded-xl space-y-1">
            <span className="text-white font-bold">Surface Charcoal</span>
            <p className="text-text-muted">#0a0a0a / Card Container</p>
          </div>
          <div className="p-4 bg-[#141414] border border-border-hairline rounded-xl space-y-1">
            <span className="text-white font-bold">Surface Variant</span>
            <p className="text-text-muted">#141414 / Elevated Surface</p>
          </div>
          <div className="p-4 bg-black border border-white/20 rounded-xl space-y-1">
            <span className="text-white font-bold">Hairline Border</span>
            <p className="text-text-muted">rgba(255, 255, 255, 0.08)</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">Typography</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Default display font is sharp uppercase sans-serif with tight letter-spacing, accompanied by technical monospace labels for system metrics.
        </p>
      </section>
    </article>
  );
}
