"use client";

import { ArrowRight } from "lucide-react";
import { AsciiField, type AsciiFieldProps, type AsciiPalette } from "@ui/backgrounds/AsciiField";

const ACCENTS: Record<AsciiPalette, string> = {
  spectrum: "#c4b5fd",
  phosphor: "#86efac",
  amber: "#fcd34d",
  mono: "#e5e7eb",
};

const MONO = "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const TEXT = "#e8eaed";

/** A developer-portfolio hero over the ASCII field, for /present. */
export function AsciiFieldLanding(props: AsciiFieldProps) {
  const palette: AsciiPalette = props.palette && props.palette in ACCENTS ? props.palette : "spectrum";
  const accent = ACCENTS[palette];

  return (
    <div className="relative min-h-dvh w-full overflow-hidden" style={{ color: TEXT, fontFamily: MONO }}>
      <AsciiField fontFamily="var(--font-jetbrains-mono)" {...props} palette={palette} />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1
          className="af-rise text-[34px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[62px] sm:leading-[1.08]"
          style={{ animationDelay: "120ms" }}
        >
          I write software
          <br />
          that feels <span style={{ color: accent }}>alive</span>
          <span
            aria-hidden="true"
            className="af-caret ml-[0.12em] inline-block h-[0.82em] w-[0.5em] translate-y-[0.1em] align-baseline"
            style={{ backgroundColor: accent }}
          />
        </h1>

        <p
          className="af-rise mt-7 max-w-xl text-[15px] leading-relaxed sm:text-[17px]"
          style={{ animationDelay: "240ms", color: `${TEXT}a6` }}
        >
          Full-stack developer working on interfaces, tools and the systems underneath them.
        </p>

        <div className="af-rise mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "360ms" }}>
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-md px-5 py-3 text-[14px] font-semibold transition-transform duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: accent, color: "#060708", boxShadow: `0 10px 30px -12px ${accent}aa` }}
          >
            View my work
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-md border px-5 py-3 text-[14px] font-semibold backdrop-blur-sm transition-colors"
            style={{ borderColor: `${TEXT}2e`, backgroundColor: "#06070899" }}
          >
            Get in touch
          </a>
        </div>
      </main>

      <style>{`
        .af-rise { animation: af-rise 900ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        @keyframes af-rise {
          from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          to { opacity: 1; transform: none; filter: none; }
        }
        .af-caret { animation: af-blink 1.06s steps(1) infinite; }
        @keyframes af-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .af-rise, .af-caret { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default AsciiFieldLanding;
