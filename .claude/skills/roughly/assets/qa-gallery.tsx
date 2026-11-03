"use client";

/**
 * Roughly QA gallery: every recipe from references/recipes.md, on a dark and a light surface.
 * Mount it as a temporary page (e.g. app/roughly-qa/page.tsx), fix the import below if your components
 * live elsewhere, screenshot it with scripts/screenshot.mjs, read the images, then delete the page.
 */
import React, { useEffect, useState } from "react";
import { Roughly } from "@/components/ui/roughly/Roughly";

type Theme = {
  name: "dark" | "light";
  ink: string;
  marker: string;
  good: string;
  bad: string;
  page: string;
  fg: string;
  muted: string;
  card: string;
  border: string;
  button: string;
};

const DARK: Theme = {
  name: "dark",
  ink: "#FCD34D",
  marker: "#4338CA",
  good: "#4ADE80",
  bad: "#F87171",
  page: "bg-[#0B0B0C]",
  fg: "text-neutral-100",
  muted: "text-neutral-400",
  card: "bg-white/[0.04]",
  border: "border-white/10",
  button: "bg-white text-black",
};

const LIGHT: Theme = {
  name: "light",
  ink: "#2563EB",
  marker: "#FDE68A",
  good: "#15803D",
  bad: "#DC2626",
  page: "bg-[#FAFAF7]",
  fg: "text-neutral-900",
  muted: "text-neutral-500",
  card: "bg-black/[0.03]",
  border: "border-black/10",
  button: "bg-neutral-900 text-white",
};

/** Hydration-safe media query: false on the server and first render, real value after mount. */
function useIsNarrow(query = "(max-width: 639px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return narrow;
}

function Tag({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 font-mono text-[11px] opacity-40">{children}</div>;
}

/* R1 — Hero: underline the claim, arrow + label at the CTA */
export function HeroRecipe({ t }: { t: Theme }) {
  return (
    <section>
      <h1 className="max-w-3xl text-[40px] font-semibold leading-[1.1] tracking-tight sm:text-[64px] sm:leading-[1.05]">
        Ship your landing page{" "}
        {/* nowrap: an underline split across two lines reads as two marks */}
        <Roughly.Underline color={t.ink} strokeWidth={4} animationDelay={400} className="whitespace-nowrap">
          this weekend
        </Roughly.Underline>
      </h1>
      <p className={`mt-6 max-w-xl text-lg ${t.muted}`}>Components, sections and copy that work together.</p>
      {/* bottom-right arrow, size 1.2, 24px label: needs ~120px below and ~140px to the right */}
      <div className="mt-10 inline-block pb-[120px] pr-[140px]">
        <Roughly.Arrow
          color={t.ink}
          strokeWidth={2.5}
          size={1.2}
          placement="bottom-right"
          label="free, no card"
          labelFontSize={24}
          animationDelay={900}
        >
          <a href="#" className={`inline-block rounded-full px-6 py-3 font-medium ${t.button}`}>
            Start building
          </a>
        </Roughly.Arrow>
      </div>
    </section>
  );
}

/* R2 — Price change: strike the old price, circle the new one (one idea = one mark budget) */
export function PricingRecipe({ t }: { t: Theme }) {
  return (
    <div className={`inline-block w-72 rounded-2xl border p-8 ${t.border} ${t.card}`}>
      <div className="text-sm opacity-70">Pro</div>
      <div className="mt-3 flex items-baseline gap-3 text-[40px] font-semibold">
        <del className={`text-2xl no-underline ${t.muted}`}>
          <Roughly.Strike color={t.bad} strokeWidth={2}>$29</Roughly.Strike>
        </del>
        {/* circle padding 14/6 at 40px; mx reserves paddingX + stroke */}
        <ins className="mx-[17px] no-underline">
          <Roughly.Circle color={t.ink} strokeWidth={3} paddingX={14} paddingY={6} animationDelay={500}>
            $9
          </Roughly.Circle>
        </ins>
        <span className="text-sm font-normal opacity-60">/mo</span>
      </div>
    </div>
  );
}

/* R3 — Feature checklist: a mark on every row, crosses only for real negatives */
export function ChecklistRecipe({ t }: { t: Theme }) {
  const rows: Array<[string, boolean]> = [
    ["Unlimited projects", true],
    ["Custom domains", true],
    ["Priority support", true],
    ["Per-seat pricing", false],
  ];
  return (
    <ul className="grid gap-4 text-base">
      {rows.map(([label, ok], i) => (
        <Roughly.Check
          key={label}
          as="li"
          mark={ok ? "check" : "cross"}
          color={ok ? t.good : t.bad}
          animationDelay={i * 150}
        >
          {label}
          {!ok && <span className="sr-only"> (not included)</span>}
        </Roughly.Check>
      ))}
    </ul>
  );
}

/* R4 — Comparison: cross off the rejected option, check the chosen one */
export function ComparisonRecipe({ t }: { t: Theme }) {
  return (
    <div className="grid max-w-xl grid-cols-1 gap-6 text-base sm:grid-cols-2">
      <div className={`rounded-xl border p-5 ${t.border}`}>
        <div className={`mb-3 text-sm ${t.muted}`}>The old way</div>
        <div className="grid gap-3">
          {["Hand-written CSS", "Weeks of QA"].map((item, i) => (
            <span key={item} className="inline-block whitespace-nowrap">
              <del className="no-underline">
                <Roughly.Cross color={t.bad} strokeWidth={1.5} padding={4} animationDelay={i * 200}>
                  {item}
                </Roughly.Cross>
              </del>
            </span>
          ))}
        </div>
      </div>
      <div className={`rounded-xl border p-5 ${t.border}`}>
        <div className={`mb-3 text-sm ${t.muted}`}>With us</div>
        <ul className="grid gap-3">
          {["Drop-in sections", "Ships today"].map((item, i) => (
            <Roughly.Check key={item} as="li" color={t.good} animationDelay={400 + i * 150}>
              {item}
            </Roughly.Check>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* R5 — Testimonial: highlight the one sentence that matters */
export function TestimonialRecipe({ t }: { t: Theme }) {
  return (
    // isolate: the marker is drawn behind the text (z-index -1) and must not fall behind the page
    <blockquote className="isolate max-w-2xl text-xl leading-relaxed">
      “We tried three builders before this one.{" "}
      <mark className="bg-transparent text-inherit">
        <Roughly.Highlight color={t.marker} padding={[2, 4]}>
          We shipped our new site in two days.
        </Roughly.Highlight>
      </mark>{" "}
      The team still talks about it.”
    </blockquote>
  );
}

/* R6 — Docs: bracket a group of lines that share one point */
export function DocsBracketRecipe({ t }: { t: Theme }) {
  return (
    <Roughly.Bracket color={t.bad} strokeWidth={2} side="left" bracketPadding={14} className="max-w-md">
      <p className="font-medium">Before you migrate</p>
      <p className={t.muted}>Back up the database.</p>
      <p className={t.muted}>Pause scheduled jobs.</p>
      <p className={t.muted}>Expect ~2 minutes of downtime.</p>
    </Roughly.Bracket>
  );
}

/* R7 — Sticky note on a screenshot; moves below the target on narrow screens */
export function StickyRecipe({ t }: { t: Theme }) {
  const narrow = useIsNarrow();
  return (
    <div className={`inline-block max-w-full ${narrow ? "pb-[96px]" : "pr-[170px]"}`}>
      <Roughly.Sticky
        note="drag cards to reorder"
        placement={narrow ? "bottom" : "right"}
        offset={narrow ? -28 : 6}
        pin="tape"
        width={150}
        fontSize={20}
      >
        <div className={`grid h-40 w-72 max-w-full place-items-center rounded-xl border text-sm ${t.border} ${t.card} ${t.muted}`}>
          app screenshot
        </div>
      </Roughly.Sticky>
    </div>
  );
}

/* R8 — Stat row: circle the one number that matters */
export function StatRecipe({ t }: { t: Theme }) {
  return (
    <div className="flex flex-wrap gap-x-14 gap-y-8 text-center">
      <div>
        <div className="text-5xl font-semibold">12k</div>
        <div className={`text-sm ${t.muted}`}>teams</div>
      </div>
      <div>
        {/* 48px: padding 17/7, stroke 3 -> reserve mx = 17+3 = 20, mb = 7 + 0.2em(10) + 3 = 20 (only sides with a neighbour) */}
        <div className="mx-[20px] mb-[20px] whitespace-nowrap text-5xl font-semibold leading-none">
          <Roughly.Circle color={t.ink} strokeWidth={3} paddingX={17} paddingY={7}>
            4.2×
          </Roughly.Circle>
        </div>
        <div className={`text-sm ${t.muted}`}>faster launches</div>
      </div>
      <div>
        <div className="text-5xl font-semibold">99.9%</div>
        <div className={`text-sm ${t.muted}`}>uptime</div>
      </div>
    </div>
  );
}

/* R9 — Changelog: strike the old name, the new one right after */
export function ChangelogRecipe({ t }: { t: Theme }) {
  return (
    <p className="text-base">
      <del className="font-mono no-underline">
        <Roughly.Strike color={t.bad} strokeWidth={1.5}>useFetcher()</Roughly.Strike>
      </del>{" "}
      → <ins className="font-mono no-underline">useQuery()</ins> in v4.
    </p>
  );
}

/* R10 — Box a UI element (badge, input, toggle) */
export function BadgeBoxRecipe({ t }: { t: Theme }) {
  return (
    <div className="flex items-center gap-2 text-base">
      <span>Plan</span>
      {/* padding [6,10] + stroke 2 -> margin 12 */}
      <span className="m-[12px] inline-block">
        <Roughly.Box color={t.ink} strokeWidth={2} padding={[6, 10]} variant="single">
          <span className={`inline-block rounded-full border px-3 py-1 text-sm ${t.border}`}>Most popular</span>
        </Roughly.Box>
      </span>
    </div>
  );
}

/* R11 — Signature: drawn handwriting, real text kept for screen readers */
export function SignatureRecipe({ t }: { t: Theme }) {
  return (
    <div>
      <p className={`text-base ${t.muted}`}>Thanks for reading,</p>
      <span className="sr-only">Ajinkya</span>
      <span aria-hidden="true">
        <Roughly.Handwriting color={t.ink} font="caveat" fontSize={44} strokeWidth={1.2} animationDelay={200}>
          Ajinkya
        </Roughly.Handwriting>
      </span>
    </div>
  );
}

/* R12 — Inline emphasis in prose: underline 2–4 words, body stroke */
export function ProseRecipe({ t }: { t: Theme }) {
  return (
    <p className="max-w-xl text-base leading-relaxed">
      Most teams rebuild the same pricing table every quarter. With shared sections you write it{" "}
      <Roughly.Underline color={t.ink} strokeWidth={1.5}>once</Roughly.Underline> and every page stays in sync.
    </p>
  );
}

const RECIPES: Array<[string, React.ComponentType<{ t: Theme }>]> = [
  ["R1 hero · underline + CTA arrow", HeroRecipe],
  ["R2 pricing · strike + circle", PricingRecipe],
  ["R3 checklist", ChecklistRecipe],
  ["R4 comparison · cross-off + checks", ComparisonRecipe],
  ["R5 testimonial · highlight", TestimonialRecipe],
  ["R6 docs · bracket", DocsBracketRecipe],
  ["R7 sticky on screenshot (responsive)", StickyRecipe],
  ["R8 stat · circle", StatRecipe],
  ["R9 changelog · strike + new", ChangelogRecipe],
  ["R10 box a badge", BadgeBoxRecipe],
  ["R11 signature · handwriting", SignatureRecipe],
  ["R12 prose · body underline", ProseRecipe],
];

function Surface({ t }: { t: Theme }) {
  return (
    <section className={`px-6 py-24 sm:px-16 ${t.page} ${t.fg}`}>
      <div className="grid gap-20">
        {RECIPES.map(([label, Recipe], i) => (
          <div key={label} id={`${t.name}-r${i + 1}`}>
            <Tag>{label}</Tag>
            <Recipe t={t} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RoughlyQAGallery() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <Surface t={DARK} />
      <Surface t={LIGHT} />
    </main>
  );
}
