"use client";

import Link from "next/link";
import { registry, type ComponentCategory } from "@/registry";
import { ShowcaseCard } from "@/components/site/ShowcaseCard";
import { BentoCard } from "@/components/site/BentoCard";
import { Footer } from "@/components/site/Footer";
import {
  FadeIn,
  TextReveal,
  MagneticButton,
  GlitchText,
  CountUp,
} from "@adgrid-ui/ui";

/* ─── category badge icons ─── */
const categoryIcons: Record<ComponentCategory, string> = {
  animated: "▶",
  primitives: "◆",
  charts: "◈",
  widgets: "☐",
};

/* ─── bento width map (index → span) ─── */
const bentoSpans: Record<number, string> = {
  0: "md:col-span-2",  // MagneticButton (wide)
  1: "md:col-span-1",
  2: "md:col-span-1",
  3: "md:col-span-1",  // Button
  4: "md:col-span-2",  // Card (wide)
  5: "md:col-span-1",  // accent card
  6: "md:col-span-2",
  7: "md:col-span-1",
};

const accentIndices = new Set([5]);

/* ─── showcase items ─── */
const showcaseItems = [
  {
    label: "MagneticButton",
    icon: "▶",
    span: "md:col-span-2",
    demo: (
      <MagneticButton strength={0.5}>
        <span className="font-mono text-xs tracking-widest text-white/80">
          HOVER ME
        </span>
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
        <CountUp
          to={100}
          suffix="%"
          duration={3}
          className="font-display font-bold text-5xl text-white tracking-tight"
        />
        <p className="font-mono text-[11px] text-white/30 mt-2">
          engagement
        </p>
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

/* ──────────────────────────────────────── */

export default function HomePage() {
  const categoryCount = new Set(registry.map((c) => c.category)).size;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6">
      {/* ─── 1. Hero ─── */}
      <FadeIn direction="up" duration={0.6}>
        <section className="pt-24 pb-16 md:pt-36 md:pb-24">
          <p className="font-mono text-[11px] text-white/20 tracking-[0.25em] uppercase mb-10">
            // open source · next.js · tailwind
          </p>

          <h1 className="font-display text-[3.25rem] sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold tracking-[-0.04em] leading-[0.88] text-white mb-10">
            components
            <br />
            <span className="text-white/[0.18]">built for</span>
            <br />
            the void
          </h1>

          <p className="text-white/40 text-base md:text-lg max-w-md mb-12 leading-relaxed">
            Dark-first. Zero bloat. Copy-paste or install as a package.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/components"
              className="inline-flex items-center justify-center px-7 py-3 bg-white text-black font-mono text-sm font-medium rounded-[10px]
                         hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]
                         shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)]
                         hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.25)]
                         transition-all duration-200 ease-out"
            >
              Browse components
            </Link>
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center px-7 py-3
                         bg-gradient-to-b from-white/[0.07] to-white/[0.03]
                         border border-white/[0.08] text-white font-mono text-sm rounded-[10px]
                         shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                         hover:border-white/[0.2] hover:from-white/[0.1] hover:to-white/[0.05]
                         hover:scale-[1.02]
                         active:scale-[0.98]
                         transition-all duration-200 ease-out"
            >
              Read the docs
            </Link>
          </div>
        </section>
      </FadeIn>

      {/* ─── 2. Live Component Showcase ─── */}
      <FadeIn direction="up" delay={0.12} duration={0.6}>
        <section className="pb-16 md:pb-24">
          <p className="font-mono text-[11px] text-white/20 tracking-[0.25em] uppercase mb-8">
            // live preview
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {showcaseItems.map((item) => (
              <ShowcaseCard
                key={item.label}
                label={item.label}
                icon={item.icon}
                className={item.span}
              >
                {item.demo}
              </ShowcaseCard>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── 3. Components Bento Grid ─── */}
      <FadeIn direction="up" delay={0.1} duration={0.6}>
        <section className="pb-20 md:pb-32">
          <p className="font-mono text-[11px] text-white/20 tracking-[0.25em] uppercase mb-8">
            // {registry.length} components across {categoryCount} categories
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {registry.map((item, index) => {
              const isAccent = accentIndices.has(index);
              const span = bentoSpans[index] ?? "md:col-span-1";

              return (
                <BentoCard
                  key={item.slug}
                  href={`/components/${item.category}/${item.slug}`}
                  label={item.name}
                  category={item.category}
                  categoryIcon={categoryIcons[item.category]}
                  description={item.description}
                  accent={isAccent}
                  className={span}
                />
              );
            })}
          </div>
        </section>
      </FadeIn>

      {/* ─── 5. Footer ─── */}
      <Footer />
    </main>
  );
}
