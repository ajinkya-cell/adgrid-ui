"use client";

import { ArrowRight } from "lucide-react";
import { HandDrawnHatching, type HandDrawnHatchingProps, type HatchingPaper } from "@ui/backgrounds/HandDrawnHatching";
import { Roughly } from "@ui/animated/Roughly";

// One pen per paper: the text ink, and the single annotation ink (passes 3:1 on its paper).
const THEMES: Record<HatchingPaper, { text: string; mark: string; paper: string }> = {
  light: { text: "#1c1b19", mark: "#c2410c", paper: "#f3eee3" },
  dark: { text: "#ece8df", mark: "#fdba74", paper: "#0b0b0c" },
  blueprint: { text: "#e6f1ff", mark: "#fcd34d", paper: "#0d2340" },
};

const SERIF = "var(--font-eb-garamond), 'EB Garamond', Georgia, serif";

/** A landing-page hero over the hatching background, for /present. */
export function HandDrawnHatchingLanding(props: HandDrawnHatchingProps) {
  const paper: HatchingPaper = props.paper && props.paper in THEMES ? props.paper : "light";
  const { text, mark, paper: buttonText } = THEMES[paper];
  return (
    <div className="relative min-h-dvh w-full overflow-hidden" style={{ color: text }}>
      <HandDrawnHatching {...props} paper={paper} />

      <div className="hh-land relative z-10 flex min-h-dvh flex-col">
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h1
            className="hh-rise text-[46px] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[76px] sm:leading-[1.02]"
            style={{ fontFamily: SERIF, animationDelay: "160ms" }}
          >
            Every pixel,
            <br />
            {/* 46–76px → stroke 4. nowrap keeps the phrase one mark. */}
            <Roughly.Underline color={mark} strokeWidth={4} animationDelay={900} className="whitespace-nowrap">
              drawn by hand.
            </Roughly.Underline>
          </h1>

          <p
            className="hh-rise mt-8 max-w-xl text-[17px] leading-relaxed opacity-75 sm:text-[19px]"
            style={{ animationDelay: "260ms" }}
          >
            A living cross-hatch background for your landing page. Four layers of ink, strokes that wobble and lift
            off the paper, and a lamp that follows your cursor.
          </p>

          {/* Arrow at bottom-right of the primary button (empty space under the pair on every width), size 1.1, 24px label: ~110px reserved below. */}
          <div className="hh-rise mt-10 flex flex-wrap items-center justify-center gap-3 pb-[110px]" style={{ animationDelay: "360ms" }}>
            <Roughly.Arrow
              color={mark}
              strokeWidth={2.5}
              size={1.1}
              placement="bottom-right"
              label="start here"
              labelFontSize={24}
              animationDelay={1400}
            >
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_24px_-10px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: text, color: buttonText }}
              >
                Get started
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </Roughly.Arrow>
            <a
              href="#"
              className="inline-flex items-center rounded-full border px-6 py-3 text-[15px] font-medium transition-colors"
              style={{ borderColor: `${text}40` }}
            >
              View source
            </a>
          </div>
        </main>

      </div>

      <style>{`
        .hh-rise { animation: hh-rise 900ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        @keyframes hh-rise {
          from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          to { opacity: 1; transform: none; filter: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hh-rise { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default HandDrawnHatchingLanding;
