"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Globe, Instagram, Mail, Youtube, Code2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { SocialPlatform } from "./types";

// The portfolio's own look, a fusion of three developer portfolios:
// - a three-column page with dashed rails: section titles on the left, content in the middle,
//   a sticky index on the right; Cabinet Grotesk display headings;
// - corner-bracket section titles, dashed boxes, a dotted timeline and status pills;
// - hatched strips between sections, Geist + Geist Mono, icon-boxed info rows, superscript counts.
// Light and dark themes are CSS variables on the root, so everything reads `var(--pf-*)`.

export const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&family=Reenie+Beanie&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800&display=swap');
.pf-root{font-family:'Geist',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;color-scheme:dark;
  --pf-bg:#0a0a0a;--pf-fg:#fafafa;--pf-muted:#a1a1aa;--pf-subtle:#71717a;--pf-line:rgba(255,255,255,0.1);--pf-dash:rgba(255,255,255,0.16);
  --pf-panel:#131315;--pf-hatch:rgba(255,255,255,0.07);--pf-dot:rgba(255,255,255,0.12);
  --pf-l0:#18181b;--pf-l1:#3f3f46;--pf-l2:#71717a;--pf-l3:#a1a1aa;--pf-l4:#f4f4f5;}
.pf-root[data-theme="light"]{color-scheme:light;
  --pf-bg:#ffffff;--pf-fg:#09090b;--pf-muted:#52525b;--pf-subtle:#a1a1aa;--pf-line:#e4e4e7;--pf-dash:#d4d4d8;
  --pf-panel:#f7f7f8;--pf-hatch:rgba(0,0,0,0.07);--pf-dot:rgba(0,0,0,0.12);
  --pf-l0:#f0f0f2;--pf-l1:#d4d4d8;--pf-l2:#a1a1aa;--pf-l3:#52525b;--pf-l4:#18181b;}
.pf-mono{font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
.pf-display{font-family:'Cabinet Grotesk','Geist',ui-sans-serif,system-ui,sans-serif}
.pf-root ::selection{background:var(--pf-fg);color:var(--pf-bg)}
@keyframes pf-marquee{to{transform:translateX(-50%)}}
.pf-marquee{animation:pf-marquee var(--pf-marquee-duration,40s) linear infinite}
.pf-marquee-wrap:hover .pf-marquee{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.pf-marquee{animation:none}}
`;

/**
 * Ink for the hand-drawn annotations: one pen per page, amber on dark and ballpoint blue on light.
 * A real colour, not a CSS variable, because the marks write it into SVG attributes.
 */
export const INK = { dark: "#FCD34D", light: "#2563EB" } as const;
export const InkContext = createContext<string>(INK.dark);
export const useInk = () => useContext(InkContext);
/** The page theme, for marks whose colour pairs depend on it (the highlighter). */
export const PageThemeContext = createContext<"dark" | "light">("dark");
/** Highlighter behind text: deep indigo under light text on dark, classic yellow under dark text on light. */
export const MARKER = { dark: { color: "#4338CA", opacity: 0.85 }, light: { color: "#FDE68A", opacity: 0.8 } } as const;
export const useMarker = () => MARKER[useContext(PageThemeContext)];
/** Handwriting font for every annotation (arrow labels, sticky note, signature). */
export const HAND = "reenie-beanie" as const;

export const FG = "text-[var(--pf-fg)]";
export const MUTED = "text-[var(--pf-muted)]";
export const SUBTLE = "text-[var(--pf-subtle)]";
export const LINE = "border-[var(--pf-line)]";
export const DASH = "border-dashed border-[var(--pf-dash)]";
export const FOCUS =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pf-fg)]";
export const HATCH = "bg-[repeating-linear-gradient(-45deg,var(--pf-hatch)_0_1px,transparent_1px_7px)]";
export const DOTS = "bg-[radial-gradient(var(--pf-dot)_1px,transparent_1px)] bg-[length:14px_14px]";

/** Hatched strip between sections. */
export function Gap() {
  return <div aria-hidden="true" className={cn("h-8 border-b", DASH, HATCH)} />;
}

/** A section title framed by four corner brackets. */
export function BracketTitle({ id, children, count }: { id: string; children: ReactNode; count?: number }) {
  const corner = "pointer-events-none absolute size-2 border-[var(--pf-fg)]";
  return (
    <h2 id={id} className={cn("pf-display relative inline-block max-w-full px-2.5 py-1 text-[26px] font-bold leading-tight tracking-[-0.02em]", FG)}>
      <span aria-hidden="true" className={cn(corner, "left-0 top-0 border-l-2 border-t-2")} />
      <span aria-hidden="true" className={cn(corner, "right-0 top-0 border-r-2 border-t-2")} />
      <span aria-hidden="true" className={cn(corner, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span aria-hidden="true" className={cn(corner, "bottom-0 right-0 border-b-2 border-r-2")} />
      {children}
      {count !== undefined && <sup className={cn("pf-mono ml-1 text-xs font-normal tracking-normal", SUBTLE)}>({count})</sup>}
    </h2>
  );
}

/**
 * A page section: on wide screens the bracketed title and an optional note sit in a left column,
 * the content to its right; on phones the title sits on top.
 */
export function Section({
  id,
  title,
  count,
  note,
  aside,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  /** One line under the title. */
  note?: ReactNode;
  /** Extra content under the title, e.g. a "see all" link. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("grid scroll-mt-16 border-b md:grid-cols-[230px_minmax(0,1fr)]", DASH)}>
      <div className={cn("px-5 pb-2 pt-8 md:border-r md:pb-8", DASH)}>
        <div className="md:sticky md:top-20">
          <BracketTitle id={`${id}-title`} count={count}>
            {title}
          </BracketTitle>
          {note && <p className={cn("mt-3 max-w-[30ch] text-sm leading-relaxed", MUTED)}>{note}</p>}
          {aside && <div className="mt-3">{aside}</div>}
        </div>
      </div>
      <div className="min-w-0 px-5 pb-8 pt-4 md:pt-8">{children}</div>
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className={cn("pf-mono inline-flex h-6 items-center rounded-md border px-1.5 text-xs", LINE, MUTED, "bg-[var(--pf-panel)]")}>
      {children}
    </span>
  );
}

export function Tags({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Technologies">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}

/** Small bordered square holding an icon. */
export function IconBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border [&_svg]:size-3.5", LINE, MUTED, "bg-[var(--pf-panel)]", className)}>
      {children}
    </span>
  );
}

/** "Active" / "Done" style pill with a dot. */
export function StatusPill({ tone, children }: { tone: "green" | "red" | "neutral"; children: ReactNode }) {
  const tones = {
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-500",
    neutral: "border-[var(--pf-line)] bg-[var(--pf-panel)] text-[var(--pf-muted)]",
  };
  const dots = { green: "bg-emerald-500", red: "bg-rose-500", neutral: "bg-[var(--pf-subtle)]" };
  return (
    <span className={cn("inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium", tones[tone])}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[tone])} />
      {children}
    </span>
  );
}

const BUTTON = {
  base: "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors duration-150 [&_svg]:size-3.5",
  solid: "bg-[var(--pf-fg)] text-[var(--pf-bg)] hover:opacity-90",
  outline: "border border-[var(--pf-line)] text-[var(--pf-fg)] hover:bg-[var(--pf-panel)]",
};

export function LinkButton({
  href,
  variant = "outline",
  children,
  className,
  ...rest
}: { href: string; variant?: "solid" | "outline"; children: ReactNode; className?: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children" | "className"
>) {
  return (
    <a href={href} className={cn(BUTTON.base, BUTTON[variant], FOCUS, className)} {...externalProps(href)} {...rest}>
      {children}
    </a>
  );
}

/** Renders `**bold**` spans inside a sentence. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={cn("font-semibold", FG)}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Dates ──────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseMonth(value: string) {
  const [y, m] = value.split("-").map(Number);
  return { y, m: (m || 1) - 1 };
}

/** "01.2026" */
export function formatMonthNum(value: string) {
  const { y, m } = parseMonth(value);
  return `${String(m + 1).padStart(2, "0")}.${y}`;
}

/** "Jan 2026" */
export function formatMonth(value: string) {
  const { y, m } = parseMonth(value);
  return `${MONTHS[m]} ${y}`;
}

/** "Jan 2026 – Now" */
export function formatRange(start: string, end?: string) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Now"}`;
}

/** "01.2026 — ∞" */
export function formatPeriod(start: string, end?: string) {
  return `${formatMonthNum(start)} — ${end ? formatMonthNum(end) : "∞"}`;
}

/** "2y 4m", counting both the first and last month. */
export function formatDuration(start: string, end?: string) {
  const a = parseMonth(start);
  const now = new Date();
  const b = end ? parseMonth(end) : { y: now.getFullYear(), m: now.getMonth() };
  const months = Math.max(1, (b.y - a.y) * 12 + (b.m - a.m) + 1);
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(" ");
}

/** "Oct 14, 2026" */
export function formatDay(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return `${MONTHS[(m || 1) - 1]} ${d}, ${y}`;
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function GithubGlyph(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XGlyph(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinGlyph(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case "github":
      return <GithubGlyph className={className} />;
    case "x":
      return <XGlyph className={className} />;
    case "linkedin":
      return <LinkedinGlyph className={className} />;
    case "email":
      return <Mail className={className} aria-hidden="true" />;
    case "youtube":
      return <Youtube className={className} aria-hidden="true" />;
    case "instagram":
      return <Instagram className={className} aria-hidden="true" />;
    case "leetcode":
      return <Code2 className={className} aria-hidden="true" />;
    default:
      return <Globe className={className} aria-hidden="true" />;
  }
}

export const isExternal = (url: string) => /^https?:\/\//.test(url);
export const externalProps = (url: string) => (isExternal(url) ? { target: "_blank", rel: "noreferrer" } : {});

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
