"use client";

import Link from "next/link";
import { registry, type ComponentCategory } from "@/registry";
import { ShowcaseCard } from "@/components/site/ShowcaseCard";
import { Footer } from "@/components/site/Footer";
import { FadeIn, TextReveal, MagneticButton, GlitchText, CountUp } from "@adgrid-ui/ui";

const categoryIcons: Record<ComponentCategory, string> = {
  animated: "▶",
  primitives: "◆",
  charts: "◈",
  widgets: "☐",
};

const wideIndices = new Set([0, 3, 6]);

const showcaseItems = [
  {
    label: "MagneticButton",
    icon: "▶",
    span: "md:col-span-2",
    demo: (
      <MagneticButton strength={0.5}>
        <span className="text-xs tracking-wider">HOVER ME</span>
      </MagneticButton>
    ),
  },
  {
    label: "GlitchText",
    icon: "▶",
    span: "md:col-span-1",
    demo: <GlitchText text="GLITCH" />,
  },
  {
    label: "CountUp",
    icon: "▶",
    span: "md:col-span-1",
    demo: (
      <div className="text-center">
        <CountUp to={100} suffix="%" duration={3} className="font-display font-bold text-5xl text-white tracking-tight" />
        <p className="font-mono text-[11px] text-white/30 mt-2">engagement</p>
      </div>
    ),
  },
  {
    label: "FadeIn",
    icon: "▶",
    span: "md:col-span-2",
    demo: (
      <FadeIn direction="up">
        <p className="text-white/60 text-sm font-mono text-center">
          This content fades in when you scroll into view
        </p>
      </FadeIn>
    ),
  },
  {
    label: "TextReveal",
    icon: "▶",
    span: "md:col-span-3",
    demo: (
      <div className="w-full overflow-hidden">
        <TextReveal text="Components built for the void" />
      </div>
    ),
  },
];

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6">
      <FadeIn direction="up" duration={0.6}>
        <section className="py-20 md:py-32">
          <p className="font-mono text-xs text-white/25 tracking-widest uppercase mb-8">
            // open source · next.js · tailwind
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white mb-8">
            components<br />
            <span className="text-white/[0.18]">built for</span><br />
            the void
          </h1>
          <p className="text-white/40 text-base md:text-lg max-w-md mb-10 md:mb-12 leading-relaxed">
            Dark-first. Zero bloat. Copy-paste or install as a package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/components"
              className="inline-block px-6 py-3 bg-white text-black font-mono text-sm font-medium rounded-lg hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 ease-out"
            >
              Browse components
            </Link>
            <Link
              href="/docs/getting-started"
              className="inline-block px-6 py-3 border border-white/20 text-white font-mono text-sm rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              Read the docs
            </Link>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.15} duration={0.6}>
        <section className="pb-20 md:pb-32">
          <p className="font-mono text-xs text-white/25 tracking-widest uppercase mb-8">
            // live preview
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {showcaseItems.map((item) => (
              <ShowcaseCard key={item.label} label={item.label} icon={item.icon} className={item.span}>
                {item.demo}
              </ShowcaseCard>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.1} duration={0.6}>
        <section className="pb-20 md:pb-32">
          <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-8">
            // {registry.length} components across {new Set(registry.map((c) => c.category)).size} categories
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {registry.map((item, index) => {
              const isWide = wideIndices.has(index);
              const isAccent = index === 5;
              return (
                <Link
                  key={item.slug}
                  href={`/components/${item.category}/${item.slug}`}
                  className={`${isWide ? "md:col-span-2" : "md:col-span-1"} ${isAccent ? "bg-[#1a1a1a]" : "bg-[#0d0d0d]"} border border-white/[0.06] rounded-[20px] p-6 pt-14 hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-150 ease-out shadow-[0_4px_20px_rgba(0,0,0,0.4)] group`}
                >
                  <span className="absolute top-4 left-5 font-mono text-[11px] text-white/40 tracking-wider group-hover:text-white/70 transition-colors duration-150">
                    // {item.category}
                  </span>
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                    <span className="text-[10px] text-white/40">{categoryIcons[item.category]}</span>
                  </div>
                  <div className="bg-black/40 border border-white/[0.04] rounded-xl p-4 md:p-5 mb-4 min-h-[100px] flex items-center justify-center">
                    <p className="font-display font-semibold text-white text-lg md:text-xl tracking-tight group-hover:text-white transition-colors">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-sm text-white/30 leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </FadeIn>

      <Footer />
    </main>
  );
}
