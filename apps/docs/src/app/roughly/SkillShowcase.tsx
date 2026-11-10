"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Bot, Check, Copy, Download, RotateCcw, Terminal } from "lucide-react";
import { Roughly } from "@ui/animated/Roughly";
import { arrowAutoBend, type ArrowPlacement, type RoughArrowProps } from "@ui/animated/roughly/RoughArrow";
import { renderPackageManagerIcon, type PackageManager } from "@/components/presentation/CodeStudioGuide";

/**
 * Roughly page section: showcases the `roughly` agent skill. Pick a kind of page from the list and
 * watch it get annotated the way the skill directs, with the agent's log alongside. Then the arrow guide:
 * every placement with the bend that lands its head, against a fixed bend that doesn't. Install options
 * match the /present sidebar installer: shadcn CLI via pnpm / yarn / npm / bun, curl (global), or the zip.
 */

const SKILL_ITEM = "https://www.voidui.in/r/roughly-skill.json";
const SKILL_ZIP = "/skills/roughly.zip";

type InstallId = PackageManager | "curl";

const INSTALL: Array<{ id: InstallId; cmd: string; note: string }> = [
  { id: "pnpm", cmd: `pnpm dlx shadcn@latest add ${SKILL_ITEM}`, note: "Adds it to this project's .claude/skills/roughly/" },
  { id: "yarn", cmd: `yarn dlx shadcn@latest add ${SKILL_ITEM}`, note: "Adds it to this project's .claude/skills/roughly/" },
  { id: "npm", cmd: `npx shadcn@latest add ${SKILL_ITEM}`, note: "Adds it to this project's .claude/skills/roughly/" },
  { id: "bun", cmd: `bunx --bun shadcn@latest add ${SKILL_ITEM}`, note: "Adds it to this project's .claude/skills/roughly/" },
  {
    id: "curl",
    cmd: "curl -L https://www.voidui.in/skills/roughly.zip -o roughly.zip && unzip -o roughly.zip -d ~/.claude/skills/",
    note: "Installs it once for every project, in ~/.claude/skills/",
  },
];

const PANEL =
  "bg-[#151515] border-t border-t-white/15 border-x border-x-white/[0.03] border-b border-b-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_-1px_0_rgba(0,0,0,0.3),0_14px_32px_rgba(0,0,0,0.24)]";
const WELL =
  "bg-[#090909] border border-white/[0.05] shadow-[inset_0_2px_4px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.035)]";
/** Same chassis as the CLI block in the /present sidebar (CodeStudioGuide) */
const CHASSIS = "overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10";
const CHASSIS_STYLE = {
  backgroundColor: "#171717",
  boxShadow:
    "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
};

// Demo pages are light paper → the skill's light-surface colours (color.md)
const INK = "#2563EB";
const BAD = "#DC2626";
const GOOD = "#15803D";
const MARKER = "#FDE68A";

type Kind =
  | "landing"
  | "pricing"
  | "signup"
  | "chart"
  | "blog"
  | "docs"
  | "changelog"
  | "compare"
  | "stats"
  | "about";

interface PageSpec {
  id: Kind;
  title: string;
  marks: string;
  prompt: string;
  log: Array<[string, string]>;
  /** tiny doodle on the card thumbnail hinting at the main mark */
  doodle: ReactNode;
}

const doodleProps = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const PAGES: PageSpec[] = [
  {
    id: "landing",
    title: "Landing page",
    marks: "Underline · arrow",
    prompt: "annotate the landing page",
    log: [
      ["edit", "kept 2 marks · cut 3 (hero budget ≤ 3)"],
      ["pick", "underline the claim · arrow + label at the CTA"],
      ["bend", "bottom-right → auto −0.32: head lands up into the button"],
      ["shot", "1440 + 390: arrow clear of the button"],
    ],
    doodle: <path d="M10 33 C 22 30, 38 31, 52 30" stroke={INK} strokeWidth={2} {...doodleProps} />,
  },
  {
    id: "pricing",
    title: "Pricing card",
    marks: "Strike · circle · arrow",
    prompt: "annotate the pricing card",
    log: [
      ["edit", "price change = one idea · + arrow at the upgrade"],
      ["pick", "strike $29 · circle $19 · label from the page: ends dec 1"],
      ["bend", "right → auto −0.2: head points left, into the button"],
      ["a11y", "<del>/<ins> + sr-only “was / now”"],
    ],
    doodle: (
      <>
        <path d="M10 27 L 24 25" stroke={BAD} strokeWidth={2} {...doodleProps} />
        <ellipse cx={39} cy={26} rx={10} ry={7} stroke={INK} strokeWidth={2} {...doodleProps} />
      </>
    ),
  },
  {
    id: "signup",
    title: "Sign-up form",
    marks: "Arrow · checks",
    prompt: "annotate the sign-up form",
    log: [
      ["edit", "kept 2 marks · cut 2 (form stays calm)"],
      ["pick", "arrow at the email field · check the trial terms"],
      ["bend", "right on desktop, bottom at 390: no bend set"],
      ["shot", "1440 + 390: label in the margin, field clear"],
    ],
    doodle: (
      <>
        <rect x={9} y={22} width={28} height={8} rx={2} fill="none" stroke="#9ca3af" strokeWidth={1.2} />
        <path d="M56 20 C 50 22, 46 25, 41 26 M 41 26 L 45 22 M 41 26 L 46 28" stroke={INK} strokeWidth={1.8} {...doodleProps} />
      </>
    ),
  },
  {
    id: "chart",
    title: "Product shot",
    marks: "Arrow at a spot · underline",
    prompt: "annotate the chart screenshot",
    log: [
      ["edit", "kept 2 marks · cut 1"],
      ["pick", "underline the claim · arrow at the spike"],
      ["spot", "zero-size target on the bar's top · tail over empty sky"],
      ["shot", "1440 + 390: label clear of the bars"],
    ],
    doodle: (
      <>
        <path d="M12 38 V 32 M 20 38 V 30 M 28 38 V 33 M 36 38 V 18 M 44 38 V 28" stroke="#9ca3af" strokeWidth={3} strokeLinecap="round" />
        <path d="M18 14 C 24 13, 29 14, 33 17 M 33 17 L 28 16 M 33 17 L 31 12" stroke={INK} strokeWidth={1.8} {...doodleProps} />
      </>
    ),
  },
  {
    id: "blog",
    title: "Blog post",
    marks: "Highlight · signature",
    prompt: "annotate the blog post",
    log: [
      ["edit", "kept 1 mark (~1 per 400 words) · cut 4"],
      ["pick", "highlight the takeaway · drawn sign-off"],
      ["a11y", "<mark> under the marker · name kept as text"],
      ["shot", "1440 + 390: wraps cleanly, text still legible"],
    ],
    doodle: <rect x={9} y={22} width={40} height={7} rx={2} fill={MARKER} />,
  },
  {
    id: "docs",
    title: "Docs page",
    marks: "Bracket · strike",
    prompt: "annotate the docs page",
    log: [
      ["edit", "kept 2 marks · cut 2"],
      ["pick", "bracket the warning group · strike the old API"],
      ["ink", "red for the warning and the removal only"],
      ["lint", "check.mjs: 0 errors, 0 warnings"],
    ],
    doodle: <path d="M14 14 C 9 14, 12 25, 8 25 C 12 25, 9 36, 14 36" stroke={BAD} strokeWidth={2} {...doodleProps} />,
  },
  {
    id: "changelog",
    title: "Changelog",
    marks: "Checks · cross-off",
    prompt: "annotate the changelog",
    log: [
      ["edit", "a checklist counts as one mark · kept 2"],
      ["pick", "check every shipped item · cross off the removed flag"],
      ["a11y", "<del> on the removed flag"],
      ["shot", "1440 + 390: rows aligned, nothing clipped"],
    ],
    doodle: <path d="M12 26 L 18 32 L 30 18" stroke={GOOD} strokeWidth={2.2} {...doodleProps} />,
  },
  {
    id: "compare",
    title: "Comparison",
    marks: "Cross-off · checks",
    prompt: "annotate the comparison",
    log: [
      ["edit", "one idea: rejected vs chosen · 1 mark"],
      ["pick", "cross off the old way · check the new way"],
      ["ink", "red + green pair only, no extra emphasis"],
      ["shot", "1440 + 390: columns stack, X stays on one line"],
    ],
    doodle: <path d="M14 18 L 34 32 M 34 18 L 14 32" stroke={BAD} strokeWidth={2} {...doodleProps} />,
  },
  {
    id: "stats",
    title: "Stats row",
    marks: "Circle · underline",
    prompt: "annotate the results",
    log: [
      ["edit", "3 numbers, 1 matters · kept 2 marks"],
      ["pick", "circle 3.1× · underline the reason"],
      ["size", "34px number → stroke 2.5 · padding 12/5"],
      ["shot", "1440 + 390: circle clear of the captions"],
    ],
    doodle: (
      <>
        <rect x={9} y={22} width={10} height={6} rx={1.5} fill="#1f1f1f" opacity={0.5} />
        <rect x={45} y={22} width={10} height={6} rx={1.5} fill="#1f1f1f" opacity={0.5} />
        <ellipse cx={32} cy={25} rx={10} ry={7} stroke={INK} strokeWidth={2} {...doodleProps} />
      </>
    ),
  },
  {
    id: "about",
    title: "About page",
    marks: "Circle · sticky note",
    prompt: "annotate the about page",
    log: [
      ["edit", "kept 2 marks · cut 2"],
      ["pick", "circle the one word · sticky note for the aside"],
      ["size", "circle padding 0.35em · sticky width 118"],
      ["shot", "1440 + 390: note tucked under the photo, text clear"],
    ],
    doodle: <ellipse cx={30} cy={25} rx={17} ry={9} stroke={INK} strokeWidth={2} {...doodleProps} />,
  },
];

/** Hydration-safe media query: false on the server and first render, the real value after mount. */
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

/* ─────────────────────────── demo pages ─────────────────────────── */

const FIELD = "rounded-md border border-black/15 bg-white px-3 py-2 text-[13px] text-neutral-400";

function DemoPage({ kind, on, narrow }: { kind: Kind; on: boolean; narrow: boolean }) {
  const t = (mark: ReactNode, plain: ReactNode) => (on ? mark : plain);

  switch (kind) {
    case "landing":
      return (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Docs, without the yak-shaving</div>
          <h4 className="mt-2 max-w-md text-[26px] font-semibold leading-tight tracking-tight">
            Ship your docs site in{" "}
            {t(
              <Roughly.Underline color={INK} strokeWidth={2} animationDelay={200} className="whitespace-nowrap">
                an afternoon
              </Roughly.Underline>,
              <span className="whitespace-nowrap">an afternoon</span>
            )}
            .
          </h4>
          <p className="mt-3 max-w-sm text-sm text-neutral-500">Write in Markdown, get search, versions and dark mode out of the box.</p>
          {/* arrow size 0.9 + 20px label at bottom-right → ~96px below, ~90px right. No bend: auto lands the head */}
          <div className="mt-6 inline-block pb-[96px] pr-[90px]">
            {t(
              <Roughly.Arrow color={INK} strokeWidth={2} size={0.9} placement="bottom-right" label="start here" labelFontSize={20} animationDelay={700}>
                <span className="inline-block rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white">Get started</span>
              </Roughly.Arrow>,
              <span className="inline-block rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white">Get started</span>
            )}
          </div>
        </div>
      );

    case "pricing": {
      const button = <span className="block rounded-lg bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white">Upgrade to Pro</span>;
      return (
        // right arrow size 0.85, 20px label "ends dec 1" (~90px) → ~160px right; bottom-right at 390 → ~96px below
        <div className={`inline-block ${narrow ? "pb-[96px]" : "pr-[160px]"}`}>
          <div className="w-[236px] rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-medium text-neutral-500">Pro</div>
            <div className="mt-2 flex items-baseline gap-2 text-[34px] font-semibold tracking-tight">
              <del className="text-xl text-neutral-400 no-underline">
                <span className="sr-only">Was </span>
                {t(
                  <Roughly.Strike color={BAD} strokeWidth={2} animationDelay={200}>
                    $29
                  </Roughly.Strike>,
                  "$29"
                )}
              </del>
              {/* 34px → circle padding 12/5, stroke 2.5 → mx 14 */}
              <ins className="mx-[14px] no-underline">
                <span className="sr-only">now </span>
                {t(
                  <Roughly.Circle color={INK} strokeWidth={2.5} paddingX={12} paddingY={5} animationDelay={500}>
                    $19
                  </Roughly.Circle>,
                  "$19"
                )}
              </ins>
              <span className="text-sm font-normal text-neutral-400">/mo</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Launch price, ends Dec 1.</p>
            <div className="mt-5">
              {t(
                <Roughly.Arrow
                  color={INK}
                  strokeWidth={2}
                  size={0.85}
                  placement={narrow ? "bottom-right" : "right"}
                  label="ends dec 1"
                  labelFontSize={20}
                  animationDelay={950}
                  className="w-full"
                >
                  {button}
                </Roughly.Arrow>,
                button
              )}
            </div>
          </div>
        </div>
      );
    }

    case "signup": {
      const email = <div className={FIELD}>ada@company.com</div>;
      const perks = ["14 days of Pro", "No card required"];
      return (
        <div className="max-w-md">
          <h4 className="text-[22px] font-semibold tracking-tight text-neutral-900">Start your free trial</h4>
          <p className="mt-1 text-sm text-neutral-500">We never share your email.</p>
          <div className="mt-4 grid gap-2.5">
            <div className={`${FIELD} ${narrow ? "" : "mr-[150px]"}`}>Ada Lovelace</div>
            {/* right, size 0.85, 20px "never shared" → ~150px right; bottom on mobile → ~92px below */}
            <span className={`block ${narrow ? "pb-[92px]" : "pr-[150px]"}`}>
              {t(
                <Roughly.Arrow
                  color={INK}
                  strokeWidth={2}
                  size={0.85}
                  // full-width field on mobile: bottom-right would push the label off-screen, bottom keeps it centred
                  placement={narrow ? "bottom" : "right"}
                  label="never shared"
                  labelFontSize={20}
                  animationDelay={250}
                  className="w-full"
                >
                  {email}
                </Roughly.Arrow>,
                email
              )}
            </span>
          </div>
          <ul className="mt-4 grid gap-2 text-[13px] text-neutral-700">
            {perks.map((s, i) =>
              on ? (
                <Roughly.Check key={s} as="li" color={GOOD} animationDelay={800 + i * 150}>
                  {s}
                </Roughly.Check>
              ) : (
                <li key={s} className="pl-[29px]">
                  {s}
                </li>
              )
            )}
          </ul>
        </div>
      );
    }

    case "chart": {
      const bars = [24, 30, 27, 34, 29, 36, 33, 94, 61, 48];
      return (
        <div className="max-w-lg">
          <h4 className="text-[20px] font-semibold tracking-tight text-neutral-900">
            Signups{" "}
            {t(
              <Roughly.Underline color={INK} strokeWidth={2} animationDelay={200}>
                doubled
              </Roughly.Underline>,
              "doubled"
            )}{" "}
            in March
          </h4>
          <figure className="relative mt-4 h-[200px] rounded-xl border border-black/10 bg-white" aria-label="Bar chart of daily signups, peaking on launch day">
            <div className="absolute inset-x-5 bottom-5 flex h-[150px] items-end gap-2">
              {bars.map((v, i) => (
                <div key={i} className={`relative flex-1 rounded-t ${i === 7 ? "bg-neutral-800" : "bg-neutral-200"}`} style={{ height: `${v}%` }}>
                  {i === 7 && on && (
                    // zero-size target on the bar's top; "left" puts the tail over the empty sky above the short bars
                    <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
                      <Roughly.Arrow color={INK} strokeWidth={2} size={0.85} placement="left" label="launch day" labelFontSize={20} animationDelay={600}>
                        <span className="block size-1" />
                      </Roughly.Arrow>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </figure>
        </div>
      );
    }

    case "blog":
      return (
        <article className="max-w-lg text-[14px] leading-relaxed text-neutral-700">
          <div className="text-[11px] text-neutral-400">Engineering · 4 min read</div>
          <h4 className="mt-1.5 text-[22px] font-semibold leading-snug tracking-tight text-neutral-900">We deleted our cache and got faster</h4>
          <p className="mt-3">
            For three years every request went through Redis. Last month we measured it: 92% of reads were misses, each one a
            wasted round trip.
          </p>
          <p className="isolate mt-3">
            {t(
              <mark className="bg-transparent text-inherit">
                <Roughly.Highlight color={MARKER} padding={[1, 3]} animationDelay={250}>
                  Measure before you optimise, and again before you keep it.
                </Roughly.Highlight>
              </mark>,
              <span>Measure before you optimise, and again before you keep it.</span>
            )}{" "}
            A cache is a bet that data is asked for twice.
          </p>
          <p className="mt-4 text-neutral-400">Thanks for reading,</p>
          <span className="sr-only">Sam</span>
          <span aria-hidden="true" className="block h-[46px]">
            {t(
              <Roughly.Handwriting color={INK} font="caveat" fontSize={36} strokeWidth={1.1} animationDelay={900} animationDuration={900}>
                Sam
              </Roughly.Handwriting>,
              <span className="font-[family-name:var(--font-caveat,'Caveat'),cursive] text-[30px] text-neutral-700">Sam</span>
            )}
          </span>
        </article>
      );

    case "docs":
      return (
        <div className="max-w-lg text-[14px] leading-relaxed text-neutral-700">
          <h4 className="text-[20px] font-semibold tracking-tight text-neutral-900">Migrating to v4</h4>
          <p className="mt-2">
            The data helper was renamed:{" "}
            <code className="rounded bg-black/[0.05] px-1 font-mono text-[13px]">
              <del className="no-underline">
                {t(
                  <Roughly.Strike color={BAD} strokeWidth={1.5} animationDelay={250}>
                    getCached()
                  </Roughly.Strike>,
                  "getCached()"
                )}
              </del>
            </code>{" "}
            → <ins className="no-underline"><code className="rounded bg-black/[0.05] px-1 font-mono text-[13px]">get()</code></ins>
          </p>
          <div className="mt-5">
            {t(
              <Roughly.Bracket color={BAD} strokeWidth={2} side="left" bracketPadding={12} animationDelay={650}>
                <p className="font-medium text-neutral-900">Before you upgrade</p>
                <p>Back up the database.</p>
                <p>Pause scheduled jobs.</p>
                <p>Expect ~2 minutes of downtime.</p>
              </Roughly.Bracket>,
              <div className="pl-[26px]">
                <p className="font-medium text-neutral-900">Before you upgrade</p>
                <p>Back up the database.</p>
                <p>Pause scheduled jobs.</p>
                <p>Expect ~2 minutes of downtime.</p>
              </div>
            )}
          </div>
        </div>
      );

    case "changelog": {
      const shipped = ["Full-text search across versions", "Dark mode follows the system", "Faster cold starts (−38%)"];
      return (
        <div className="max-w-lg text-[14px] text-neutral-700">
          <div className="flex items-baseline gap-3">
            <h4 className="text-[20px] font-semibold tracking-tight text-neutral-900">What&apos;s new in 2.0</h4>
            <span className="text-[11px] text-neutral-400">November</span>
          </div>
          <ul className="mt-4 grid gap-2.5">
            {shipped.map((s, i) =>
              on ? (
                <Roughly.Check key={s} as="li" color={GOOD} animationDelay={200 + i * 150}>
                  {s}
                </Roughly.Check>
              ) : (
                <li key={s} className="pl-[29px]">
                  {s}
                </li>
              )
            )}
          </ul>
          <p className="mt-5 text-[13px] text-neutral-500">
            Removed:{" "}
            <span className="inline-block whitespace-nowrap">
              <del className="font-mono text-neutral-700 no-underline">
                {t(
                  <Roughly.Cross color={BAD} strokeWidth={1.5} padding={3} animationDelay={850}>
                    legacyMode
                  </Roughly.Cross>,
                  "legacyMode"
                )}
              </del>
            </span>{" "}
            (deprecated since 1.4)
          </p>
        </div>
      );
    }

    case "compare": {
      const oldWay = ["Hand-written CSS", "Weeks of QA"];
      const newWay = ["Drop-in sections", "Ships the same day"];
      return (
        <div className="grid max-w-lg grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <div className="mb-3 text-[12px] text-neutral-400">The old way</div>
            <div className="grid gap-2.5">
              {oldWay.map((x, i) => (
                <span key={x} className="inline-block whitespace-nowrap">
                  <del className="text-neutral-700 no-underline">
                    {t(
                      <Roughly.Cross color={BAD} strokeWidth={1.5} padding={3} animationDelay={200 + i * 200}>
                        {x}
                      </Roughly.Cross>,
                      x
                    )}
                  </del>
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-3 text-[12px] text-neutral-400">With components</div>
            <ul className="grid gap-2.5 text-neutral-800">
              {newWay.map((x, i) =>
                on ? (
                  <Roughly.Check key={x} as="li" color={GOOD} animationDelay={650 + i * 150}>
                    {x}
                  </Roughly.Check>
                ) : (
                  <li key={x} className="pl-[29px]">
                    {x}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      );
    }

    case "stats": {
      const stats: Array<[string, string, boolean]> = [
        ["12k", "teams onboard", false],
        ["3.1×", "faster builds", true],
        ["99.98%", "uptime", false],
      ];
      return (
        <div className="max-w-lg">
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Q3 results</div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {stats.map(([n, label, key]) => (
              <div key={n}>
                {/* 34px → padding 12/5 + stroke 2.5: mx 15 keeps the loop off its neighbours */}
                <div className={`text-[26px] font-semibold tracking-tight text-neutral-900 sm:text-[34px] ${key ? "mx-[15px]" : ""}`}>
                  {key
                    ? t(
                        <Roughly.Circle color={INK} strokeWidth={2.5} paddingX={12} paddingY={5} animationDelay={200}>
                          {n}
                        </Roughly.Circle>,
                        n
                      )
                    : n}
                </div>
                <div className={`mt-2 text-[12px] text-neutral-500 ${key ? "mx-[15px]" : ""}`}>{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-md text-[14px] leading-relaxed text-neutral-600">
            Builds went from 9 minutes to under 3,{" "}
            {t(
              <Roughly.Underline color={INK} strokeWidth={1.5} animationDelay={700} className="whitespace-nowrap">
                with the same hardware
              </Roughly.Underline>,
              <span className="whitespace-nowrap">with the same hardware</span>
            )}
            .
          </p>
        </div>
      );
    }

    case "about":
      return (
        <div className="flex max-w-lg flex-col gap-6 sm:flex-row sm:items-start">
          {/* sticky tucked under the photo (offset −26, ~70px tall) → reserve ~52px below it */}
          <div className="relative mb-[52px] shrink-0">
            {t(
              <Roughly.Sticky note="open to work!" placement="bottom" offset={-26} width={118} fontSize={17} pin="tape" animationDelay={900}>
                <div className="h-[104px] w-[104px] rounded-2xl bg-gradient-to-br from-neutral-300 to-neutral-200" aria-label="Portrait placeholder" />
              </Roughly.Sticky>,
              <div className="h-[104px] w-[104px] rounded-2xl bg-gradient-to-br from-neutral-300 to-neutral-200" aria-label="Portrait placeholder" />
            )}
          </div>
          <div className="text-[14px] leading-relaxed text-neutral-600">
            <h4 className="text-[22px] font-semibold leading-snug tracking-tight text-neutral-900">
              Hi, I&apos;m Maya. I design{" "}
              <span className="mx-[11px] inline-block">
                {t(
                  <Roughly.Circle color={INK} strokeWidth={2} paddingX={8} paddingY={3} animationDelay={250}>
                    calm
                  </Roughly.Circle>,
                  "calm"
                )}
              </span>
              interfaces.
            </h4>
            <p className="mt-2">Ten years of product design for tools people use all day: editors, dashboards, design systems.</p>
          </div>
        </div>
      );
  }
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Thumb({ page, active }: { page: PageSpec; active: boolean }) {
  return (
    <svg viewBox="0 0 64 48" className="h-[33px] w-[44px] shrink-0" aria-hidden="true">
      <rect x={0.5} y={0.5} width={63} height={47} rx={6} fill="#FBF8F1" stroke={active ? "rgba(129,140,248,0.7)" : "rgba(0,0,0,0.25)"} />
      <rect x={9} y={9} width={30} height={4} rx={2} fill="#1f1f1f" opacity={0.75} />
      <rect x={9} y={41} width={36} height={2.5} rx={1.25} fill="#9ca3af" opacity={0.45} />
      <g>{page.doodle}</g>
    </svg>
  );
}

function useTyped(text: string, run: number, enabled: boolean) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (!enabled) {
      setN(text.length);
      return undefined;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [text, run, enabled]);
  return text.slice(0, n);
}

/* ─────────────────────────── installer ─────────────────────────── */

/** Same anatomy as the CLI block in the /present sidebar: icon + underlined tabs + icon copy, `$` body. */
function SkillInstaller() {
  const [pm, setPm] = useState<InstallId>("pnpm");
  const [copied, setCopied] = useState(false);
  const install = INSTALL.find((i) => i.id === pm)!;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(install.cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the command is selectable
    }
  };

  return (
    <div className={CHASSIS} style={CHASSIS_STYLE}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center">
            {pm === "curl" ? <Terminal className="h-4 w-4 shrink-0 text-neutral-400" /> : renderPackageManagerIcon(pm)}
          </div>
          <div className="flex items-center gap-4 overflow-x-auto" role="tablist" aria-label="Install with">
            {INSTALL.map((i) => {
              const active = pm === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPm(i.id)}
                  className={`relative shrink-0 cursor-pointer py-1 font-mono text-xs transition-colors ${
                    active ? "font-medium text-white" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span>{i.id}</span>
                  {active && <div className="absolute inset-x-0 -bottom-[11px] h-[2px] rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white active:scale-95"
          title="Copy command"
          aria-label="Copy install command"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Command body */}
      <div className="present-scroll overflow-x-auto p-4">
        <div className="flex items-center gap-2 font-mono text-xs text-white/90">
          <span className="select-none font-normal text-white/30">$</span>
          <span className="select-all whitespace-nowrap">{install.cmd}</span>
        </div>
      </div>

      {/* Footer: where it lands + the zip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.015] px-4 py-2">
        <span className="font-mono text-[11px] text-white/40">{install.note}</span>
        <a
          href={SKILL_ZIP}
          download="roughly.zip"
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Download className="h-3 w-3" />
          roughly.zip
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────── arrow guide ─────────────────────────── */

const PLACEMENT_GRID: ArrowPlacement[] = ["top-left", "top", "top-right", "left", "right", "bottom-left", "bottom", "bottom-right"];
const OLD_FIXED_BEND = 0.38;
const CHIP_W = 84;
const CHIP_H = 28;
const GUIDE_SIZE = 0.8;

/**
 * How far the arrowhead lands from "straight into the target", in degrees. Mirrors RoughArrow's geometry:
 * the head arrives along tip − c2, i.e. the chord rotated by atan(3·bend).
 */
function headOffsetDeg(placement: ArrowPlacement, bend: number, w = CHIP_W, h = CHIP_H, size = GUIDE_SIZE) {
  const D = 65 * size;
  const gap = 8 * size;
  let tip: [number, number];
  let tail: [number, number];
  let normal: [number, number];
  if (placement.startsWith("top")) {
    const fx = placement === "top-right" ? 0.85 : placement === "top-left" ? 0.15 : 0.5;
    const tx = placement === "top-right" ? w + D * 0.75 : placement === "top-left" ? -D * 0.75 : w * 0.5 + D * 0.35;
    tip = [w * fx, -gap];
    tail = [tx, -gap - D];
    normal = [0, 1];
  } else if (placement.startsWith("bottom")) {
    const fx = placement === "bottom-right" ? 0.85 : placement === "bottom-left" ? 0.15 : 0.5;
    const tx = placement === "bottom-right" ? w + D * 0.75 : placement === "bottom-left" ? -D * 0.75 : w * 0.5 + D * 0.35;
    tip = [w * fx, h + gap];
    tail = [tx, h + gap + D];
    normal = [0, -1];
  } else if (placement === "left") {
    tip = [-gap, h / 2];
    tail = [-gap - D, h / 2 - D * 0.3];
    normal = [1, 0];
  } else {
    tip = [w + gap, h / 2];
    tail = [w + gap + D, h / 2 - D * 0.3];
    normal = [-1, 0];
  }
  const dx = tip[0] - tail[0];
  const dy = tip[1] - tail[1];
  const ax = dx + 3 * bend * dy;
  const ay = dy - 3 * bend * dx;
  const cos = (ax * normal[0] + ay * normal[1]) / Math.hypot(ax, ay);
  return Math.round((Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI);
}

/** Nudge the chip away from the side the tail comes from, so the whole arrow fits its cell. */
function chipShift(p: ArrowPlacement, k = 1) {
  const x = (p.includes("right") ? -26 : p.includes("left") ? 26 : 0) * k;
  const y = (p.startsWith("top") ? 30 : p.startsWith("bottom") ? -30 : 0) * k;
  return `translate(${x}px, ${y}px)`;
}

function GuideChip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md border border-black/15 bg-white font-mono text-[10.5px] text-neutral-600"
      style={{ width: CHIP_W, height: CHIP_H }}
    >
      {children}
    </span>
  );
}

const STYLES: Array<{ name: string; note: string; props: Partial<RoughArrowProps> }> = [
  { name: "open head", note: "default", props: { placement: "top-right" } },
  { name: "filled head", note: 'arrowhead="filled"', props: { placement: "top-right", arrowhead: "filled" } },
  { name: "two passes", note: "iterations={2}", props: { placement: "top-right", iterations: 2 } },
  { name: "subtle", note: "bend={0.2}", props: { placement: "top-right", bend: 0.2 } },
  { name: "swoop", note: "bend={0.45}", props: { placement: "top-right", bend: 0.45 } },
  { name: "s-curve", note: 'variant="s-curve"', props: { placement: "top-right", variant: "s-curve" } },
  { name: "with a label", note: 'label="start here"', props: { placement: "top-right", label: "start here", labelFontSize: 18 } },
  { name: "thin, small", note: "size={0.6} · 1.5", props: { placement: "top-right", size: 0.6, strokeWidth: 1.5, arrowhead: "filled" } },
];

const KNOBS: Array<[string, string]> = [
  ["placement", "where the tail comes from"],
  ["size · distance · offset", "length and gap to the target"],
  ["bend · variant", "the arc (leave bend unset)"],
  ["arrowhead", "open or filled"],
  ["strokeWidth · iterations · roughness · seed", "the pen"],
  ["label · labelFont · labelFontSize", "the handwritten note"],
  ["labelPlacement · labelDistance · labelRotate", "where the note sits"],
  ["animationDelay · animationDuration", "when it draws"],
];

function ArrowGuide() {
  const [mode, setMode] = useState<"auto" | "fixed">("auto");
  const [tab, setTab] = useState<"placements" | "styles">("placements");
  // 2 columns at 390px: smaller arrows so every tail stays inside its own cell
  const narrow = useIsNarrow();
  const size = narrow ? 0.55 : GUIDE_SIZE;
  const k = narrow ? 0.6 : 1;
  const cellH = narrow ? "h-[150px]" : "h-[190px]";

  return (
    <div className={`rounded-2xl p-5 sm:p-6 ${PANEL}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <span className="font-mono text-[11px] text-neutral-500">arrows.md · new in the skill</span>
          <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-white">
            Arrows that{" "}
            <Roughly.Underline color="#818CF8" strokeWidth={2} animationDelay={300} className="whitespace-nowrap">
              land
            </Roughly.Underline>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            An arc reaches its tip turned <span className="font-mono text-neutral-300">atan(3 × bend)</span> off the
            straight line. Turned one way, the head points into the target. Turned the other, it lies flat along the
            edge. The sign that works depends on the placement, so the skill leaves{" "}
            <span className="font-mono text-neutral-300">bend</span> unset and the component picks it.
          </p>

          <div className={`mt-5 inline-flex rounded-full p-0.5 ${WELL}`} role="group" aria-label="Bend">
            {(
              [
                ["auto", "Auto bend"],
                ["fixed", `Fixed ${OLD_FIXED_BEND}`],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={mode === v}
                onClick={() => {
                  setMode(v);
                  setTab("placements");
                }}
                className={`cursor-pointer rounded-full px-3.5 py-1 text-xs transition-colors ${
                  mode === v ? "bg-white/15 font-medium text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-4 px-1" role="tablist" aria-label="Arrow examples">
            {(["placements", "styles"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={tab === v}
                onClick={() => setTab(v)}
                className={`relative cursor-pointer py-1 font-mono text-xs capitalize transition-colors ${
                  tab === v ? "font-medium text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {v}
                {tab === v && <div className="absolute inset-x-0 -bottom-[3px] h-[2px] rounded-full bg-white" />}
              </button>
            ))}
          </div>

          <div className="isolate rounded-xl bg-[#FBF8F1] p-3 text-neutral-900">
            {tab === "placements" ? (
              <div key={`p-${mode}`} className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                {PLACEMENT_GRID.map((p, i) => {
                  const bend = mode === "auto" ? arrowAutoBend(p) : OLD_FIXED_BEND;
                  const off = headOffsetDeg(p, bend, CHIP_W, CHIP_H, size);
                  const status = off <= 20 ? "ok" : off <= 45 ? "over" : "bad";
                  return (
                    <div key={p} className={`flex ${cellH} flex-col rounded-lg`}>
                      <div className="grid flex-1 place-items-center">
                        <span style={{ transform: chipShift(p, k) }}>
                          <Roughly.Arrow
                            color={status === "bad" ? BAD : INK}
                            strokeWidth={2}
                            size={size}
                            placement={p}
                            bend={bend}
                            animationDelay={i * 70}
                            animationDuration={650}
                          >
                            <GuideChip>{p}</GuideChip>
                          </Roughly.Arrow>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 px-1.5 pb-1 font-mono text-[10px]">
                        <span className="text-neutral-500">
                          {mode === "auto" ? "auto " : ""}
                          {bend > 0 ? "+" : ""}
                          {bend}
                        </span>
                        <span
                          className={
                            status === "ok" ? "text-emerald-700" : status === "over" ? "text-amber-700" : "text-red-600"
                          }
                        >
                          {status === "ok" ? "✓" : "✕"} {off}° off
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div key="styles" className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                {STYLES.map((s, i) => (
                  <div key={s.name} className={`flex ${cellH} flex-col rounded-lg`}>
                    <div className="grid flex-1 place-items-center">
                      <span style={{ transform: chipShift("top-right", k) }}>
                        <Roughly.Arrow
                          color={INK}
                          strokeWidth={2}
                          animationDelay={i * 70}
                          animationDuration={650}
                          {...s.props}
                          size={s.props.size ? s.props.size * (narrow ? 0.75 : 1) : size}
                        >
                          <GuideChip>{s.name}</GuideChip>
                        </Roughly.Arrow>
                      </span>
                    </div>
                    <div className="truncate px-1.5 pb-1 font-mono text-[10px] text-neutral-500">{s.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 px-1 text-xs text-neutral-500">
            {tab === "styles"
              ? "Same placement, different pen. Everything here keeps the auto sign; only the depth, head and passes change."
              : mode === "auto"
                ? "Corners bend ±0.32, sides ±0.2, with the sign mirrored per placement: every head lands within ~15° of dead-on."
                : "One bend for every placement: half the heads skim along the edge or point past the target. The skill's check.mjs flags this as arrow/bend-sign."}
          </p>

          <div className="mt-5 border-t border-white/[0.06] px-1 pt-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">What the agent can set</div>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {KNOBS.map(([k, v]) => (
                <div key={k} className="grid grid-cols-1 gap-0.5">
                  <dt className="font-mono text-[11px] text-neutral-200">{k}</dt>
                  <dd className="text-[11px] text-neutral-500">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── section ─────────────────────────── */

export function SkillShowcase() {
  const reduce = useReducedMotion();
  const narrow = useIsNarrow();
  const [kind, setKind] = useState<Kind>("landing");
  const [on, setOn] = useState(false);
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const interacted = useRef(false);
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the chosen card visible in the horizontal rail (mobile) without scrolling the page.
  useEffect(() => {
    const rail = railRef.current;
    const card = document.getElementById(`skill-card-${kind}`);
    if (!rail || !card || rail.scrollWidth <= rail.clientWidth) return;
    const left = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [kind, reduce]);

  const page = PAGES.find((p) => p.id === kind)!;
  const typed = useTyped(page.prompt, run, !reduce && started);

  // "Agent" flow: show the plain page while the prompt types, then annotate it.
  const play = useCallback(
    (next: Kind) => {
      window.clearTimeout(timer.current);
      interacted.current = true;
      setStarted(true);
      setKind(next);
      setOn(false);
      setRun((r) => r + 1);
      const p = PAGES.find((x) => x.id === next)!;
      timer.current = window.setTimeout(() => setOn(true), reduce ? 0 : p.prompt.length * 22 + 450);
    },
    [reduce]
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Start the first run when the stage scrolls into view.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        // Only auto-play if the visitor hasn't already picked a page or toggled the demo.
        if (!interacted.current) play("landing");
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [play]);

  const onCardKey = (e: React.KeyboardEvent, index: number) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = PAGES[(index + dir + PAGES.length) % PAGES.length];
    play(next.id);
    document.getElementById(`skill-card-${next.id}`)?.focus();
  };

  return (
    <section className="roughly-playground space-y-6 font-inter" aria-labelledby="roughly-skill-title">
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <Bot className="h-4 w-4 text-indigo-400" />
        <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400">Agent Skill</h2>
      </div>

      {/* ── Intro + install ─────────────────────────────────── */}
      <div className={`grid grid-cols-1 gap-8 rounded-2xl p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ${PANEL}`}>
        <div className="min-w-0">
          <span className="font-mono text-[11px] text-neutral-500">roughly · a skill for Claude Code and other coding agents</span>
          <h3 id="roughly-skill-title" className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
            Let your agent do the{" "}
            <Roughly.Underline color="#818CF8" strokeWidth={2.5} animationDelay={300} className="whitespace-nowrap">
              annotating
            </Roughly.Underline>
            .
          </h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
            Install the skill, then ask your agent to annotate any page. It decides what&apos;s worth marking, picks the right mark,
            sizes it to the type, lands every arrow on its target, and checks the result on real screenshots before it&apos;s done.
          </p>
        </div>

        <div className="min-w-0 self-end">
          <SkillInstaller />
        </div>
      </div>

      {/* ── Pick a page → watch it get annotated ─────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <LayoutGroup id="skill-pages">
          <div
            ref={railRef}
            role="tablist"
            aria-label="Kind of page"
            className="relative -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {PAGES.map((p, index) => {
              const active = p.id === kind;
              return (
                <motion.button
                  key={p.id}
                  id={`skill-card-${p.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="skill-stage"
                  tabIndex={active ? 0 : -1}
                  onClick={() => play(p.id)}
                  onKeyDown={(e) => onCardKey(e, index)}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  className={`relative flex min-w-[200px] shrink-0 cursor-pointer snap-start items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 lg:min-w-0 ${
                    active ? "" : "hover:bg-white/[0.03]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="page-card"
                      className={`absolute inset-0 rounded-xl ${PANEL}`}
                      transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                    />
                  )}
                  <span className="relative">
                    <Thumb page={p} active={active} />
                  </span>
                  <span className="relative min-w-0">
                    <span className={`block text-[13px] font-medium ${active ? "text-white" : "text-neutral-300"}`}>{p.title}</span>
                    <span className="block truncate font-mono text-[10.5px] text-neutral-500">{p.marks}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>

        <div
          id="skill-stage"
          ref={stageRef}
          role="tabpanel"
          aria-label={`${page.title} demo`}
          className={`flex min-w-0 flex-col rounded-2xl p-4 sm:p-5 ${PANEL}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
            <div className={`flex min-w-0 items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs ${WELL}`}>
              <span className="text-indigo-400">›</span>
              <span className="truncate text-neutral-200">
                {started ? typed : page.prompt}
                {!on && started && !reduce && (
                  <span className="ml-0.5 inline-block h-3 w-[6px] translate-y-[1px] animate-pulse bg-neutral-400" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex rounded-full p-0.5 ${WELL}`} role="group" aria-label="Before or after the agent">
                {([false, true] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={on === v}
                    onClick={() => {
                      window.clearTimeout(timer.current);
                      interacted.current = true;
                      setStarted(true);
                      setOn(v);
                    }}
                    className={`cursor-pointer rounded-full px-3.5 py-1 text-xs transition-colors ${
                      on === v ? "bg-white/15 font-medium text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {v ? "After" : "Before"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => play(kind)}
                aria-label="Replay"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative isolate min-h-[330px] rounded-xl bg-[#FBF8F1] text-neutral-900">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={kind}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="px-5 py-7 sm:px-8 sm:py-8"
              >
                <div key={`${on}-${run}`}>
                  <DemoPage kind={kind} on={on} narrow={narrow} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={`mt-4 min-h-[124px] rounded-xl px-4 py-3.5 font-mono text-[11px] leading-6 ${WELL}`} aria-live="polite">
            {!on ? (
              <div className="text-neutral-500">{started ? "reading the page…" : "pick a page to start"}</div>
            ) : (
              page.log.map(([tag, text], i) => (
                <motion.div
                  key={`${run}-${kind}-${tag}`}
                  initial={reduce ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.28, duration: 0.25 }}
                  className="flex gap-3"
                >
                  <span className="text-emerald-400">✓</span>
                  <span className="w-9 shrink-0 text-neutral-500">{tag}</span>
                  <span className="text-neutral-300">{text}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Arrows: placements + styles, auto vs fixed bend ─────── */}
      <ArrowGuide />
    </section>
  );
}
