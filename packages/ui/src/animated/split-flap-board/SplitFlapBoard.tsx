"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { fit, shortAgo } from "./charset";
import { FlapBoard, type FlapRowLink } from "./FlapBoard";
import { MAX_HISTORY, type Commit } from "./types";

// Your latest commit on a split-flap board. Hover (or focus, or tap) and the rows below it turn
// over to the commits before; leave and they turn back to blank. The flaps only ever turn forward,
// like the real thing, so a hover that changes its mind mid-turn just carries on to the new word.
//
// Commits come in as data; SplitFlapBoardLive polls an endpoint for them. The board arrives blank
// and flips your latest in, so the first thing anyone sees is the board doing what it does.

const AGE = 3;
const MESSAGE = 20;
const COLUMNS = AGE + MESSAGE;
const BLANK = " ".repeat(COLUMNS);
const MINUTE = 60_000;

const isoDay = (date: Commit["date"]) => {
  const t = date == null ? NaN : new Date(date).getTime();
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : null;
};

const DEFAULT_LABELS = { latest: "Latest commit", recent: "Recent commits", empty: "Nothing pushed yet" };

// Kept in a .tsx file on purpose: the docs Tailwind pass only scans .tsx for class names.
const EYEBROW = "text-[clamp(11px,2.3cqw,13px)] font-medium uppercase leading-none tracking-[0.08em] text-[#888]";
const META = "text-[clamp(9.5px,1.95cqw,11px)] font-semibold uppercase leading-none tracking-[0.12em]";

const GITHUB_PATH =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

export interface SplitFlapBoardProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Commits, newest first. The first sits on the top row; the next `history` turn in on hover. */
  commits: Commit[];
  /** GitHub username in the footer. Shown uppercase. */
  user?: string;
  /** How many earlier commits the hover reveals, 0–4. */
  history?: number;
  /** Override any of the card's words, for localisation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  /** Force the hover state open or closed. Leave undefined for normal hover/focus/tap behaviour. */
  open?: boolean;
  /** Still waiting for data: the board stays blank instead of saying there's nothing. */
  pending?: boolean;
}

export const SplitFlapBoard = forwardRef<HTMLElement, SplitFlapBoardProps>(function SplitFlapBoard(
  {
    commits,
    user,
    history = 3,
    labels,
    open: forced,
    pending = false,
    className,
    style,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onFocus,
    onBlur,
    onKeyDown,
    onClickCapture,
    ...rest
  },
  ref
) {
  const still = useReducedMotion() ?? false;
  const words = { ...DEFAULT_LABELS, ...labels };
  const rows = 1 + Math.max(0, Math.min(MAX_HISTORY, Math.floor(history)));
  const [current, ...older] = commits;
  const earlier = older.slice(0, rows - 1);
  const hasHistory = earlier.length > 0;

  // Ages tick over on their own, so a card left open still reads true. The clock starts after
  // mount, so server and client render the same blank board and the flaps turn in from there.
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), MINUTE);
    return () => clearInterval(id);
  }, []);
  const fresh = now > 0 && !!current?.date && now - new Date(current.date).getTime() < 60 * MINUTE;

  // ── Open state: mouse hover, keyboard focus, or a tap on touch screens. Escape dismisses. ──
  const root = useRef<HTMLElement | null>(null);
  const setRoot = useCallback(
    (node: HTMLElement | null) => {
      root.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isOpen = (forced ?? (!dismissed && (hover || focus || tapped))) && hasHistory;
  const lastPointer = useRef<string>("mouse");
  const inHistory = (node: EventTarget | null) => node instanceof Element && !!node.closest("[data-sf-history]");

  useEffect(() => {
    if (!tapped) return;
    const close = (e: globalThis.PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setTapped(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [tapped]);

  // The flaps are their own physics; this only crossfades the words around them.
  const open = useMotionValue(isOpen ? 1 : 0);
  useEffect(() => {
    const controls = animate(open, isOpen ? 1 : 0, still ? { duration: 0.15, ease: "linear" } : { type: "spring", stiffness: 170, damping: 26 });
    return () => controls.stop();
  }, [isOpen, still, open]);
  const [interactive, setInteractive] = useState(isOpen);
  useMotionValueEvent(open, "change", (v) => setInteractive(v > 0.5));
  const latestOpacity = useTransform(open, [0, 0.5], [1, 0]);
  const recentOpacity = useTransform(open, [0.5, 1], [0, 1]);

  const handlers = {
    onPointerEnter(e: PointerEvent<HTMLElement>) {
      onPointerEnter?.(e);
      if (e.pointerType !== "mouse") return;
      setHover(true);
      setDismissed(false);
    },
    onPointerLeave(e: PointerEvent<HTMLElement>) {
      onPointerLeave?.(e);
      if (e.pointerType === "mouse") setHover(false);
    },
    onPointerDown(e: PointerEvent<HTMLElement>) {
      onPointerDown?.(e);
      lastPointer.current = e.pointerType;
    },
    onClickCapture(e: MouseEvent<HTMLElement>) {
      onClickCapture?.(e);
      // On touch, the first tap opens the board instead of following a link. Keyboard clicks
      // (detail 0) always go through.
      if (lastPointer.current === "mouse" || e.detail === 0 || forced !== undefined || isOpen || !hasHistory) return;
      e.preventDefault();
      setTapped(true);
      setDismissed(false);
    },
    onFocus(e: FocusEvent<HTMLElement>) {
      onFocus?.(e);
      // Keyboard focus on an earlier commit's row opens the board; back on the top row, it closes.
      if (!(e.target as HTMLElement).matches?.(":focus-visible")) return;
      const toHistory = inHistory(e.target);
      setFocus(toHistory);
      if (toHistory) setDismissed(false);
    },
    onBlur(e: FocusEvent<HTMLElement>) {
      onBlur?.(e);
      if (!inHistory(e.relatedTarget)) setFocus(false);
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      onKeyDown?.(e);
      if (e.key !== "Escape" || !isOpen) return;
      e.stopPropagation();
      if (inHistory(document.activeElement)) {
        const first = root.current?.querySelector<HTMLElement>("a[aria-label]:not([data-sf-history])");
        (first ?? root.current)?.focus();
      }
      setDismissed(true);
      setTapped(false);
    },
  };

  const line = (c: Commit) => shortAgo(c.date, now) + fit(c.message.split("\n")[0], MESSAGE);
  const lines = Array.from({ length: rows }, (_, r) => {
    if (r === 0) return pending || !now ? BLANK : current ? line(current) : " ".repeat(AGE) + fit(words.empty, MESSAGE);
    const c = earlier[r - 1];
    return isOpen && c ? line(c) : BLANK;
  });
  const link = (c: Commit | undefined): FlapRowLink | null =>
    c?.url ? { href: c.url, label: [c.message.split("\n")[0], c.repo, isoDay(c.date)].filter(Boolean).join(" · ") } : null;
  const links = [link(current), ...Array.from({ length: rows - 1 }, (_, i) => link(earlier[i]))];

  const repoUrl = current?.url?.split("/commit/")[0];
  const sha = current?.sha?.slice(0, 7);
  const label = pending ? words.latest : current ? `${words.latest}: ${current.message.split("\n")[0]}${current.repo ? ` in ${current.repo}` : ""}` : words.empty;

  return (
    <article
      ref={setRoot}
      tabIndex={-1}
      aria-label={label}
      className={cn(
        "relative isolate w-full max-w-[560px] select-none overflow-hidden rounded-[28px] text-left outline-none [container-type:inline-size]",
        className
      )}
      style={{
        aspectRatio: "560 / 292",
        background:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.013) 0 1px, transparent 1px 4px), linear-gradient(180deg, #181818, #121212)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px -24px rgba(0,0,0,0.85)",
        ...style,
      }}
      {...rest}
      {...handlers}
    >
      <div className="absolute inset-[clamp(18px,5cqw,28px)] flex flex-col justify-between">
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-[clamp(6px,1.45cqw,8px)]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="size-[clamp(13px,2.7cqw,15px)] shrink-0 transition-[color,filter] duration-700 ease-out"
              style={{ color: fresh ? "#e5e5e5" : "#5f5f5f", filter: fresh ? "drop-shadow(0 0 5px rgba(255,255,255,0.35))" : "none" }}
            >
              <path fill="currentColor" d={GITHUB_PATH} />
            </svg>
            <span className="relative">
              <motion.span style={{ opacity: latestOpacity }} className={cn(EYEBROW, "block")}>
                {words.latest}
              </motion.span>
              <motion.span aria-hidden style={{ opacity: recentOpacity }} className={cn(EYEBROW, "absolute left-0 top-0 whitespace-nowrap")}>
                {words.recent}
              </motion.span>
            </span>
          </div>
          {current?.repo &&
            (repoUrl ? (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate rounded-[4px] text-[clamp(11px,2.3cqw,13px)] font-medium leading-none text-[#aaa] outline-none transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white/35"
              >
                {current.repo}
              </a>
            ) : (
              <span className="min-w-0 truncate text-[clamp(11px,2.3cqw,13px)] font-medium leading-none text-[#aaa]">{current.repo}</span>
            ))}
        </header>

        <FlapBoard key={rows} lines={lines} columns={COLUMNS} accent={AGE} links={links} interactive={interactive} still={still} />

        <footer className="flex items-center justify-between gap-4">
          <span className={cn(META, "min-w-0 truncate text-[#aaa]")}>{user ?? ""}</span>
          {sha && <span className={cn(META, "shrink-0 font-mono tracking-[0.06em] text-[#5f5f5f]")}>{sha}</span>}
        </footer>
      </div>
    </article>
  );
});

export default SplitFlapBoard;
