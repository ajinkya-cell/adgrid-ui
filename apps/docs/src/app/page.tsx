import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HandMadeHighlight } from "@/components/site/HandMadeHighlight";

export default function HomePage() {
  const featuredComponents = [
    {
      name: "Bento Grid",
      href: "/present/animated/bento-grid",
      tag: "Skeuomorphic 3D",
    },
    {
      name: "Meter Gauge",
      href: "/present/animated/meter",
      tag: "Precision Motion",
    },
    {
      name: "Coverflow Carousel",
      href: "/present/animated/coverflow-carousel",
      tag: "3D Perspective",
    },
    {
      name: "Spotlight Text",
      href: "/present/animated/spotlight-text",
      tag: "Interactive Shader",
    },
    {
      name: "Void Button",
      href: "/present/buttons/void-button",
      tag: "Micro-haptics",
    },
    {
      name: "Wheel Picker",
      href: "/present/animated/wheel-picker",
      tag: "Web Audio Synthesis",
    },
    {
      name: "Image Reveal",
      href: "/present/animated/image-reveal",
      tag: "Scroll Depth",
    },
    {
      name: "Living Text",
      href: "/present/animated/living-text",
      tag: "Kinetic Typography",
    },
  ];

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-300 selection:bg-white selection:text-black pt-28 sm:pt-36 pb-24 px-6 sm:px-8 flex justify-center">
      <div className="w-full max-w-[640px] space-y-16 sm:space-y-20">
        {/* ── Header ────────────────────────────────────────────── */}
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-sans">
            Void UI
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs  text-neutral-500">
            
           
            <span>Created by </span>
            <span>Ajinkya Dharkar</span> 
          {/*change this font Ajinkya Dharkar to Reenie Beanie*/}
            <span>•</span>
            <time>Updated Sep 2026</time>
          </div>
        </header>

        {/* ── About Void UI ─────────────────────────────────────── */}
        <article className="space-y-4 text-sm leading-relaxed text-neutral-300 font-normal">
          <p>
            <strong className="font-medium text-white">Void UI</strong> (published as{" "}
            <a
              href="https://github.com/ajinkya-cell/adgrid-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors inline-flex items-center gap-0.5"
            >
              adgrid-ui
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 inline" />
            </a>
            ) is an open-source React component ecosystem engineered for tactile friction, dark-first skeuomorphism, and sensory computing.
          </p>
          <p>
            Most modern web applications have flattened into sterile, frictionless planes. Void UI rejects that homogeny by combining physical spring dynamics, custom WebGL shaders, and synthesized Web Audio feedback  creating interfaces with tangible weight, physical resistance, and visceral depth.
          </p>
          <p>
            Every component is built with Next.js 16, framer-motion, and Tailwind CSS , distributed via copy-paste CLI workflows. You can explore the full collection of interactive components in the{" "}
            <Link
              href="/gallery"
              className="text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors"
            >
              component gallery
            </Link>{" "}
            or view the source code on{" "}
            <a
              href="https://github.com/ajinkya-cell/adgrid-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors"
            >
              GitHub
            </a>
            .
          </p>
        </article>

        {/* ── About the Creator ─────────────────────────────────── */}
        <section className="space-y-4">
          <div className="border-b border-white/[0.08] pb-2">
            <h2 className="text-xs  uppercase tracking-widest text-neutral-400">
              About the Creator
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-sm leading-relaxed text-neutral-300 font-normal">
            <p>
              I am Ajinkya, a design engineer crafting high-friction digital interfaces, physical skeuomorphism, and dark-first micro-interactions.
            </p>
            <p>
              My work focuses on bridging the gap between interaction design and deep systems engineering — exploring how mechanical haptics, physics simulations, and micro-animations can make software feel like a finely tuned instrument rather than just pixels on glass.
            </p>
            <p>
              You can{" "}
              <HandMadeHighlight>
                follow my work
              </HandMadeHighlight>{" "}
              and experiments on{" "}
              <a
                href="https://github.com/ajinkya-cell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors inline-flex items-center gap-0.5"
              >
                GitHub
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 inline" />
              </a>
              , or reach out directly via{" "}
              <a
                href="mailto:ajinkyaadharkar@gmail.com"
                className="text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors"
              >
                email
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Featured Components ───────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-2">
            <h2 className="text-xs  uppercase tracking-widest text-neutral-400">
              Featured Components
            </h2>
            <Link
              href="/gallery"
              className="text-xs font-mono text-neutral-500 hover:text-white transition-colors"
            >
              View all 62 →
            </Link>
          </div>

          <ul className="divide-y divide-white/[0.04]">
            {featuredComponents.map((component) => (
              <li key={component.name}>
                <Link
                  href={component.href}
                  className="group flex items-baseline justify-between py-2.5 transition-colors hover:text-white"
                >
                  <span className="text-sm sm:text-sm font-medium text-neutral-200 group-hover:text-white transition-colors group-hover:underline underline-offset-4 decoration-white/30">
                    {component.name}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 group-hover:text-neutral-300 transition-colors">
                    {component.tag}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Minimal Footer ────────────────────────────────────── */}
        <footer className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-baseline justify-between gap-2 text-xs font-mono text-neutral-600">
          <span>Void UI • adgrid-ui</span>
          <span>Open source MIT license</span>
        </footer>
      </div>
    </main>
  );
}
