"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RoughHighlight,
  RoughUnderline,
  RoughHandwriting,
  RoughArrow,
  RoughBox,
  RoughBracket,
} from "@adgrid-ui/ui";
import { registry } from "@/registry";
import { LinkedinOriginal } from "devicons-react";

const ROUGH_COLOR = "#7577e6";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.013 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FooterTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-geist-pixel text-xs tracking-wider text-neutral-400">
      {time}
    </span>
  );
}

export default function HomePage() {
  const featuredComponents = [
    {
      name: "Dot Matrix",
      href: "/present/animated/dot-matrix",
      tag: "LED Simulation",
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
    <main className="font-inter min-h-screen bg-[#09090b] text-neutral-300 selection:bg-white selection:text-black pt-28 sm:pt-36 pb-5 px-6 sm:px-8 flex justify-center">
      <div className="w-full max-w-[640px] space-y-16 sm:space-y-20">
        {/* ── Header & Intro ────────────────────────────────────── */}
        <div className="space-y-6 sm:space-y-7">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white inline-block">
              Void UI 
            </h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-xs text-neutral-400">
              <span>Created by</span>
              <RoughHandwriting
                font="reenie-beanie"
                color="#ffffff"
                fontSize={28}
                strokeWidth={1}
                className="inline-flex items-center text-white"
              >
                Ajinkya Dharkar
              </RoughHandwriting>
            </div>
          </header>

          {/* ── About Void UI ─────────────────────────────────────── */}
          <article className="space-y-4 text-sm leading-relaxed text-neutral-300 font-normal">
            <p>
              <strong className="font-medium text-white">Void UI </strong>
              is an <span/>
              <RoughBox paddingX={1} paddingY={2} color={ROUGH_COLOR}>
                open source
              </RoughBox>
              <span/> React component ecosystem engineered for tactile friction, dark-first skeuomorphism, and sensory computing
              
              .
            </p>
            <p>
              Most modern web applications have flattened into sterile, frictionless planes. Void UI rejects that homogeny by combining physical spring dynamics, custom WebGL shaders, and synthesized Web Audio feedback — creating interfaces with tangible weight, physical resistance, and visceral depth
              .
            </p>
            <p>
              Every component is built with Next.js 16, framer-motion, and Tailwind CSS, distributed via copy-paste CLI workflows. You can explore the full collection of interactive components in the{" "}
              <Link
                href="/gallery"
                className="text-white hover:text-white transition-colors"
              >
                <RoughUnderline color={ROUGH_COLOR} strokeWidth={2.5} variant="double">
                  component gallery
                </RoughUnderline>
              </Link>{" "}
              or view the source code on{" "}
              <RoughArrow 
                color="#ffffff"
                placement="bottom-right" offset={9} strokeWidth={2.1} curvature={0.5} iterations={1} flipCurve={true} label="Leave a star " labelFont="reenie-beanie" labelFontSize={30} labelFontWeight={600}
              >
                <a
                  href="https://github.com/ajinkya-cell/adgrid-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors"
                >
                  GitHub
                </a>
              </RoughArrow>
              .
            </p>
          </article>
        </div>

        {/* ── About the Creator ─────────────────────────────────── */}
        <section className="space-y-4">
          <div className="border-b border-white/[0.08] pb-2">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400">
             
                About the Creator
             
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-neutral-300 font-normal">
            <p>
              I am Ajinkya, a design engineer crafting  high-friction digital interfaces
              , physical skeuomorphism, and dark-first micro-interactions.
            </p>
            <p>
              My work focuses on bridging the gap between interaction design and deep systems engineering — exploring how mechanical haptics, physics simulations, and micro-animations can make software feel like a{" "}
              finely tuned instrument
              rather than just pixels on glass.
            </p>
            <p>
              <span>
                I { " "}
              </span>
              <RoughHighlight color="#F59E0B">
                   actually don't know what my coding agent just wrote above
              </RoughHighlight>
              , but I have made this UI library which provides a bunch of cool components  , you can {" "}

              connect with me for any further queries.
              
            </p>

            {/* ── Socials & Projects Bracket Section ──────────────── */}
            <div className="pt-2 space-y-2.5">
              <div className="flex  -translate-x-72  translate-y-12 items-center pl-1">
                <RoughHandwriting
                  font="reenie-beanie"
                  color="#ffffff"
                  fontSize={33}
                  strokeWidth={1}
                  className="inline-flex items-center text-white -rotate-1"
                >
                  my socials <br/>
                  <span>
                    and projects
                  </span>
                </RoughHandwriting>
              </div>

              <RoughBracket
                side="left"
                bracketStyle="square"
                color="#ffffff"
                strokeWidth={2}
                bracketPadding={12}
                className="w-full"
              >
                <div className="space-y-4">
                  {/* Social Links (Pure icons, no bounding divs) */}
                  <div className="flex items-center gap-3.5">
                    {/* Portfolio Circular Badge */}
                    <a
                      href="https://www.ajinkya.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Portfolio (ajinkya.org)"
                      aria-label="Portfolio"
                      className="transition-transform duration-150 hover:scale-110 active:scale-95 shrink-0"
                    >
                      <img
                        src="/previews/cartoon.jpeg"
                        alt="Portfolio"
                        className="w-8.5 h-8.5 rounded-full object-cover object-top border border-white/25 hover:border-white/60 transition-colors shadow-sm"
                      />
                    </a>

                    {/* GitHub */}
                    <a
                      href="https://github.com/ajinkya-cell/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      aria-label="GitHub"
                      className="text-neutral-400 hover:text-white transition-all hover:scale-110 active:scale-95 shrink-0"
                    >
                      <GithubIcon className="w-8 h-8" />
                    </a>

                    {/* LinkedIn */}
                    <a
                      href="https://www.linkedin.com/in/ajinkya-dharkar-a844b1258/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      aria-label="LinkedIn"
                      className="transition-all hover:scale-110 active:scale-95 shrink-0"
                    >
                      <LinkedinOriginal size={32} className="rounded-sm" />
                    </a>

                    {/* X */}
                    <a
                      href="https://x.com/ajinkyacell"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="X (formerly Twitter)"
                      aria-label="X"
                      className="text-neutral-400 hover:text-white transition-all hover:scale-110 active:scale-95 shrink-0"
                    >
                      <XIcon className="w-7.5 h-7.5" />
                    </a>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-300">
                      These are the projects , I am really proud of 
                    </p>
                    <div className="pt-2 flex items-center gap-3.5">
                      {/* Rusper */}
                      <a
                        href="https://rusper-website.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Rusper"
                        aria-label="Rusper Website"
                      >
                        <img
                          src="/previews/rusper.png"
                          alt="Rusper"
                          className="w-9 h-9 rounded-full object-cover bg-white"
                        />
                      </a>

                      {/* Moody */}
                      <a
                        href="https://mood-metrics-gilt.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Moody"
                        aria-label="Moody"
                      >
                        <img
                          src="/previews/moody.png"
                          alt="Moody"
                          className="h-9 object-contain"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </RoughBracket>
            </div>
          </div>
        </section>


        {/* ── Featured Components ───────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-2">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400">
              Featured Components
            </h2>
            <Link
              href="/gallery"
              className="text-xs font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <span className="text-white font-semibold">{registry.length}</span>
              <span>→</span>
            </Link>
          </div>

          <ul className="divide-y divide-white/[0.04]">
            {featuredComponents.map((component) => (
              <li key={component.name}>
                <Link
                  href={component.href}
                  className="group flex items-baseline justify-between py-2.5 transition-colors hover:text-white"
                >
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors group-hover:underline underline-offset-4 decoration-white/30">
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
          <span>Void UI </span>
          <FooterTime />
        </footer>
      </div>
    </main>
  );
}
