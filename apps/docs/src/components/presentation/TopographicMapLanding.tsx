"use client";

import { ArrowRight } from "lucide-react";
import { TopographicMap, type TopographicMapProps, type TopographicTheme } from "@ui/backgrounds/TopographicMap";

const THEMES: Record<TopographicTheme, { text: string; accent: string; onAccent: string }> = {
  dark: { text: "#e8eaed", accent: "#bef264", onAccent: "#0a0b0d" },
  light: { text: "#2a2118", accent: "#c2410c", onAccent: "#f1ede4" },
  terminal: { text: "#dcfce7", accent: "#d9f99d", onAccent: "#050a06" },
};

const DISPLAY = "var(--font-space-grotesk), 'Space Grotesk', ui-sans-serif, system-ui, sans-serif";

/** A landing-page hero over the topographic background, for /present. */
export function TopographicMapLanding(props: TopographicMapProps) {
  const theme: TopographicTheme = props.theme && props.theme in THEMES ? props.theme : "dark";
  const { text, accent, onAccent } = THEMES[theme];
  const accentColor = props.accentColor ?? accent;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden" style={{ color: text }}>
      <TopographicMap {...props} theme={theme} />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1
          className="tm-rise text-[44px] font-medium leading-[1.04] tracking-[-0.035em] sm:text-[80px] sm:leading-[0.98]"
          style={{ fontFamily: DISPLAY, animationDelay: "120ms" }}
        >
          Build on
          <br />
          <span style={{ color: accentColor }}>solid ground.</span>
        </h1>

        <p
          className="tm-rise mt-7 max-w-lg text-[17px] leading-relaxed sm:text-[19px]"
          style={{ animationDelay: "240ms", color: `${text}b3` }}
        >
          A quiet, living contour map for your landing page. The terrain drifts slowly underneath, and a hill rises
          wherever your cursor rests.
        </p>

        <div className="tm-rise mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "360ms" }}>
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[15px] font-medium transition-transform duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: accentColor, color: onAccent, boxShadow: `0 10px 30px -12px ${accentColor}99` }}
          >
            Get started
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-lg border px-5 py-3 text-[15px] font-medium backdrop-blur-sm transition-colors"
            style={{ borderColor: `${text}2e`, backgroundColor: `${text}0a` }}
          >
            Read the docs
          </a>
        </div>
      </main>

      <style>{`
        .tm-rise { animation: tm-rise 900ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        @keyframes tm-rise {
          from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          to { opacity: 1; transform: none; filter: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tm-rise { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default TopographicMapLanding;
