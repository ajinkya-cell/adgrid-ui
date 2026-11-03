"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Bot, Check, Copy, Download, RotateCcw } from "lucide-react";
import { Roughly } from "@ui/animated/Roughly";
import { VoidButton } from "@ui/animated/VoidButton";

/**
 * Roughly page section: showcases the `roughly` agent skill. Pick a kind of page from the cards and
 * watch it get annotated the way the skill directs, with the agent's log alongside. Install options:
 * shadcn CLI via pnpm / npm / yarn / bun (into the project's .claude/skills), curl (global), or the zip.
 */

const SKILL_ITEM = "https://www.voidui.in/r/roughly-skill.json";
const SKILL_ZIP = "/skills/roughly.zip";

const INSTALL: Array<{ id: string; label: string; cmd: string; note: string }> = [
  { id: "pnpm", label: "pnpm", cmd: `pnpm dlx shadcn@latest add ${SKILL_ITEM}`, note: "Adds the skill to this project's .claude/skills/roughly/" },
  { id: "npm", label: "npm", cmd: `npx shadcn@latest add ${SKILL_ITEM}`, note: "Adds the skill to this project's .claude/skills/roughly/" },
  { id: "yarn", label: "yarn", cmd: `yarn dlx shadcn@latest add ${SKILL_ITEM}`, note: "Adds the skill to this project's .claude/skills/roughly/" },
  { id: "bun", label: "bun", cmd: `bunx --bun shadcn@latest add ${SKILL_ITEM}`, note: "Adds the skill to this project's .claude/skills/roughly/" },
  {
    id: "curl",
    label: "curl",
    cmd: "curl -L https://www.voidui.in/skills/roughly.zip -o roughly.zip && unzip -o roughly.zip -d ~/.claude/skills/",
    note: "Installs it once for every project, in ~/.claude/skills/",
  },
];

const PANEL =
  "bg-[#151515] border-t border-t-white/15 border-x border-x-white/[0.03] border-b border-b-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_-1px_0_rgba(0,0,0,0.3),0_14px_32px_rgba(0,0,0,0.24)]";
const WELL =
  "bg-[#090909] border border-white/[0.05] shadow-[inset_0_2px_4px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.035)]";

// Demo pages are light paper → the skill's light-surface colours (color.md)
const INK = "#2563EB";
const BAD = "#DC2626";
const GOOD = "#15803D";
const MARKER = "#FDE68A";

type Kind = "landing" | "blog" | "docs" | "changelog" | "compare" | "about";

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
      ["size", "26px headline → stroke 2 · arrow size 0.9"],
      ["shot", "1440 + 390: arrow clear of the button"],
    ],
    doodle: <path d="M10 33 C 22 30, 38 31, 52 30" stroke={INK} strokeWidth={2} {...doodleProps} />,
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

/* ─────────────────────────── demo pages ─────────────────────────── */

function DemoPage({ kind, on }: { kind: Kind; on: boolean }) {
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
          {/* arrow size 0.9 + 20px label at bottom-right → ~96px below, ~90px right */}
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
    <svg viewBox="0 0 64 48" className="h-[42px] w-[56px] shrink-0" aria-hidden="true">
      <rect x={0.5} y={0.5} width={63} height={47} rx={6} fill="#FBF8F1" stroke={active ? "rgba(129,140,248,0.7)" : "rgba(0,0,0,0.25)"} />
      <rect x={9} y={9} width={30} height={4} rx={2} fill="#1f1f1f" opacity={0.75} />
      <rect x={9} y={16} width={44} height={2.5} rx={1.25} fill="#9ca3af" opacity={0.6} />
      <rect x={9} y={39} width={36} height={2.5} rx={1.25} fill="#9ca3af" opacity={0.45} />
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

/* ─────────────────────────── section ─────────────────────────── */

export function SkillShowcase() {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<Kind>("landing");
  const [on, setOn] = useState(false);
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const [pm, setPm] = useState("pnpm");
  const [copied, setCopied] = useState(false);
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
  const install = INSTALL.find((i) => i.id === pm)!;
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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(install.cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the command is selectable
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = SKILL_ZIP;
    a.download = "roughly.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            sizes it to the type, and checks the result on real screenshots before it&apos;s done.
          </p>
        </div>

        <div className="min-w-0 self-end">
          <div className={`overflow-hidden rounded-xl ${WELL}`}>
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
              <LayoutGroup id="skill-pm">
                <div className="flex items-center gap-0.5 overflow-x-auto" role="tablist" aria-label="Install with">
                  {INSTALL.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      role="tab"
                      aria-selected={pm === i.id}
                      onClick={() => setPm(i.id)}
                      className={`relative shrink-0 cursor-pointer rounded px-2 py-1 font-mono text-xs sm:px-2.5 transition-colors ${
                        pm === i.id ? "text-white" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {pm === i.id && (
                        <motion.span
                          layoutId="pm-pill"
                          className="absolute inset-0 rounded bg-white/15"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                        />
                      )}
                      <span className="relative">{i.label}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
              <button
                type="button"
                onClick={copy}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-neutral-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="roughly-code select-all overflow-x-auto whitespace-pre p-4 font-mono text-xs text-neutral-200">
              <span className="mr-2 text-neutral-500">$</span>
              {install.cmd}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">{install.note}</p>
            <VoidButton
              variant="default"
              onClick={download}
              style={{ height: "36px" }}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              roughly.zip
            </VoidButton>
          </div>
        </div>
      </div>

      {/* ── Pick a page → watch it get annotated ─────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <LayoutGroup id="skill-pages">
          <div
            ref={railRef}
            role="tablist"
            aria-label="Kind of page"
            className="relative -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
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
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  className={`relative flex min-w-[220px] shrink-0 cursor-pointer snap-start items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 lg:min-w-0 ${
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
                    <span className={`block text-sm font-medium ${active ? "text-white" : "text-neutral-300"}`}>{p.title}</span>
                    <span className="block truncate font-mono text-[11px] text-neutral-500">{p.marks}</span>
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

          <div className="relative isolate min-h-[300px] rounded-xl bg-[#FBF8F1] text-neutral-900">
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
                  <DemoPage kind={kind} on={on} />
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
    </section>
  );
}
