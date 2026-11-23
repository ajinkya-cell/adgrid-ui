"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { ago, buildTime, firstLine } from "./format";
import { Ticket } from "./Ticket";
import { MAX_HISTORY, type Deploy, type DeploySource } from "./types";

// Your last deploy, on a ticket hanging out of a printer. Hover (or focus, or tap) and the printer
// feeds out the tickets before it, the strip curling a little more under its own weight with each
// one. A new deploy prints live: the paper comes out a line at a time in the jerky steps of a
// thermal head, gets stamped, and the ticket below it tears off along the perforation and drops.
// A failed build prints in red.
//
// Deploys come in as data, newest first; TicketPrinterLive polls an endpoint for them. The printer
// arrives empty and prints your latest, so the first thing anyone sees is it doing what it does.
//
// The strip is one nested chain of tickets, each hinged on the one above at the perforation. Its
// position and the bend at every hinge are written straight to the DOM from one motion value,
// `feed`: how much paper is out of the slot, in px.

/** Everything is laid out in cqw of the printer's width. */
const TICKET_H = 46;
const SLOT_Y = 35.6;
/** Degrees each hinge bends once a full ticket hangs below it, at full weight. */
const CURL = 3;
/** Feed steps per ticket while printing. */
const STEPS = 12;

const MINUTE = 60_000;
const DEFAULT_LABELS = { latest: "Last deploy", recent: "Deploy history", empty: "No deploys yet" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Kept in a .tsx file on purpose: the docs Tailwind pass only scans .tsx for class names.
const EYEBROW = "text-[clamp(10px,3cqw,13px)] font-medium uppercase leading-none tracking-[0.08em] text-[#888]";
const READOUT = "font-mono text-[clamp(9px,2.6cqw,11.5px)] font-semibold uppercase leading-none tracking-[0.12em]";

const VERCEL_PATH = "M12 2.5 23 21.5H1z";
const GITHUB_PATH =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

const LED = {
  ready: "#3ddc84",
  error: "#ff4b3e",
  canceled: "#8a8a8a",
  building: "#f5a524",
  printing: "#f5a524",
  idle: "#3a3a3a",
} as const;

export interface TicketPrinterProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Deploys, newest first. Building ones light the printer; finished ones print. */
  deploys: Deploy[];
  /** Project name in the header. Defaults to the latest deploy's. */
  project?: string;
  /** Where the deploys come from; picks the header icon. */
  source?: DeploySource;
  /** How many earlier tickets the hover feeds out, 0–4. */
  history?: number;
  /** Override any of the card's words, for localisation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  /** Force the hover state open or closed. Leave undefined for normal hover/focus/tap behaviour. */
  open?: boolean;
  /** Still waiting for data: the slot stays empty instead of saying there's nothing. */
  pending?: boolean;
}

export const TicketPrinter = forwardRef<HTMLElement, TicketPrinterProps>(function TicketPrinter(
  {
    deploys,
    project,
    source = "vercel",
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
  const depth = Math.max(0, Math.min(MAX_HISTORY, Math.floor(history)));
  const finished = useMemo(() => deploys.filter((d) => d.status !== "building"), [deploys]);
  const building = deploys[0]?.status === "building";

  // ── Size: the strip's px geometry follows the printer's width. ──
  const root = useRef<HTMLElement | null>(null);
  const setRoot = useCallback(
    (node: HTMLElement | null) => {
      root.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  const H = (width * TICKET_H) / 100;

  // ── What's on the roll. `shown` is what has been printed; `job` is the ticket printing now. ──
  const [shown, setShown] = useState<Deploy[]>([]);
  const [job, setJob] = useState<Deploy | null>(null);
  const [stamped, setStamped] = useState(true);
  const [announce, setAnnounce] = useState("");

  const feed = useMotionValue(0);
  const shake = useMotionValue(0);
  const heat = useMotionValue(0);
  const tearX = useMotionValue(0);
  const tearY = useMotionValue(0);
  const tearRotate = useMotionValue(0);
  const tearOpacity = useMotionValue(1);

  // ── Open state: mouse hover, keyboard focus, or a tap on touch screens. Escape dismisses. ──
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hasHistory = depth > 0 && shown.length > 1;
  const wantsOpen = (forced ?? (!dismissed && (hover || focus || tapped))) && hasHistory;
  // The printer finishes a ticket before it feeds out history.
  const isOpen = wantsOpen && !job;
  const lastPointer = useRef<string>("mouse");
  const inHistory = (node: EventTarget | null) => node instanceof Element && !!node.closest("[data-tp-history]");

  useEffect(() => {
    if (!tapped) return;
    const close = (e: globalThis.PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setTapped(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [tapped]);

  // Top to bottom. Earlier tickets sit above the latest, inside the printer until it feeds them out.
  const stack: Deploy[] = job
    ? [job, ...shown.slice(0, 1)]
    : shown.length
      ? [...shown.slice(1, 1 + depth).reverse(), shown[0]]
      : [];

  // ── Painting the strip ──
  const strip = useRef<HTMLDivElement | null>(null);
  const hinges = useRef<(HTMLDivElement | null)[]>([]);
  const geometry = useRef({ n: 0, h: 0 });
  geometry.current = { n: stack.length, h: H };

  const paint = useCallback(() => {
    const el = strip.current;
    const { n, h } = geometry.current;
    if (!el || !h) return;
    const f = feed.get();
    el.style.transform = `translate3d(${shake.get()}px, ${f - n * h}px, 0)`;
    // More paper out, more weight: every hinge bends further as the strip gets longer.
    const weight = 0.35 + 0.65 * clamp01((f / h - 1) / 3);
    for (let i = 1; i < n; i++) {
      const hinge = hinges.current[i];
      if (!hinge) continue;
      const below = f - (n - i) * h;
      hinge.style.transform = `rotateX(${below > 0 ? (CURL * clamp01(below / h) * weight).toFixed(3) : 0}deg)`;
    }
  }, [feed, shake]);
  useMotionValueEvent(feed, "change", paint);
  useMotionValueEvent(shake, "change", paint);
  useLayoutEffect(paint);

  // ── Feeding history in and out (not while printing) ──
  const settle = useRef(false);
  const lastH = useRef(H);
  useLayoutEffect(() => {
    if (job || !H) return;
    const target = isOpen ? stack.length * H : shown.length ? H : 0;
    const resized = lastH.current !== H;
    lastH.current = H;
    if (settle.current || resized || still) {
      // A print just committed (or the printer resized): same picture, new geometry, this frame.
      settle.current = false;
      feed.jump(target);
      paint();
      return;
    }
    const controls = animate(feed, target, { duration: 0.42 + 0.08 * Math.abs(target - feed.get()) / H, ease: [0.45, 0, 0.15, 1] });
    return () => controls.stop();
  }, [job, isOpen, H, stack.length, shown.length, still, feed, paint]);

  // ── Printing ──
  const latest = useRef(finished);
  latest.current = finished;
  const shownNow = useRef(shown);
  shownNow.current = shown;
  const Hnow = useRef(H);
  Hnow.current = H;
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const print = useCallback(
    async (next: Deploy) => {
      busy.current = true;
      const before = shownNow.current[0];
      const commit = () => {
        const list = latest.current;
        const at = list.findIndex((d) => d.id === next.id);
        settle.current = true;
        setShown(at >= 0 ? list.slice(at) : [next, ...shownNow.current]);
        setJob(null);
        setAnnounce(`${next.status === "error" ? "Deploy failed" : next.status === "canceled" ? "Deploy canceled" : "Deployed"}: ${firstLine(next.message) ?? next.project ?? ""}`);
        tearX.jump(0);
        tearY.jump(0);
        tearRotate.jump(0);
        tearOpacity.jump(1);
        busy.current = false;
      };

      if (still) {
        commit();
        return;
      }

      // History still on its way back into the printer: let it finish first.
      const base = before ? Hnow.current : 0;
      if (Math.abs(feed.get() - base) > 1) await animate(feed, base, { duration: 0.35, ease: [0.45, 0, 0.15, 1] });
      if (!alive.current) return;

      setStamped(false);
      setJob(next);
      await wait(220);

      // The head prints a line, the rollers jerk the paper on, and it waits for the next line.
      for (let s = 1; s <= STEPS; s++) {
        if (!alive.current) return;
        const h = Hnow.current;
        heat.set(1);
        animate(heat, 0, { duration: 0.18, ease: "easeOut" });
        await animate(feed, base + (h * s) / STEPS, { duration: 0.045, ease: [0.2, 0, 0, 1] });
        // The rollers grab: a small sideways shudder that dies out.
        const jolt = (Math.random() - 0.5) * 0.008 * width;
        animate(shake, [jolt, -jolt * 0.5, jolt * 0.2, 0], { duration: 0.14, ease: "easeOut" });
        // Dense lines (the message, the barcode) take the head longer.
        const dense = s === 5 || s === 6 || s === STEPS - 1;
        await wait(55 + Math.random() * 70 + (dense ? 110 : 0));
      }
      if (!alive.current) return;

      await wait(260);
      setStamped(true);
      // The stamp lands hard enough to bounce the strip.
      const out = feed.get();
      animate(feed, [out, out + Hnow.current * 0.012, out], { duration: 0.22, ease: "easeOut" });
      await wait(520);
      if (!alive.current) return;

      if (before) {
        // A tug, then the perforation gives from one side to the other and the ticket drops.
        const pulled = feed.get();
        await animate(feed, pulled + Hnow.current * 0.025, { duration: 0.09, ease: "easeOut" });
        animate(feed, [pulled + Hnow.current * 0.025, pulled - Hnow.current * 0.006, pulled], { duration: 0.22, ease: "easeOut" });
        await animate(tearRotate, 2.6, { duration: 0.16, ease: [0.5, 0, 1, 0.6] });
        if (!alive.current) return;
        const h = Hnow.current;
        const fall = { duration: 0.75, ease: [0.45, 0, 0.9, 0.55] as [number, number, number, number] };
        animate(tearX, h * 0.06, fall);
        animate(tearRotate, 16, fall);
        animate(tearOpacity, 0, { duration: 0.3, delay: 0.45 });
        await animate(tearY, h * 1.25, fall);
      }
      if (!alive.current) return;
      commit();
    },
    [still, feed, heat, shake, tearX, tearY, tearRotate, tearOpacity, width]
  );

  useEffect(() => {
    // A new deploy waits while someone is reading the history.
    if (pending || !width || busy.current || wantsOpen) return;
    const next = finished[0];
    if (!next) {
      if (shown.length) setShown([]);
      return;
    }
    if (shown[0]?.id !== next.id) {
      void print(next);
      return;
    }
    // Same latest ticket; the history behind it may have changed.
    if (finished.length !== shown.length || finished.some((d, i) => d !== shown[i])) setShown(finished);
  }, [finished, shown, pending, width, wantsOpen, print]);

  // ── Words ──
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), MINUTE);
    return () => clearInterval(id);
  }, []);

  const open = useMotionValue(isOpen ? 1 : 0);
  useEffect(() => {
    const controls = animate(open, isOpen ? 1 : 0, { duration: still ? 0.15 : 0.3, ease: "easeOut" });
    return () => controls.stop();
  }, [isOpen, still, open]);
  const latestOpacity = useTransform(open, [0, 0.5], [1, 0]);
  const recentOpacity = useTransform(open, [0.5, 1], [0, 1]);
  const glow = useTransform(heat, [0, 1], [0, 0.9]);

  const top = shown[0];
  const state: keyof typeof LED = job ? "printing" : building ? "building" : pending ? "idle" : top?.status ?? "idle";
  const readout = pending
    ? "Connecting"
    : job
      ? "Printing"
      : building
        ? "Building"
        : top
          ? [top.status === "error" ? "Failed" : top.status === "canceled" ? "Canceled" : "Ready", ago(top.date, now)].filter(Boolean).join(" · ")
          : finished.length
            ? " "
            : words.empty;
  const took = !job && !building && top ? buildTime(top.duration) : null;
  const name = project ?? deploys[0]?.project ?? top?.project;
  const label = top ? `${words.latest}: ${firstLine(top.message) ?? top.project ?? ""} (${top.status})` : words.latest;

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
      // On touch, the first tap feeds the history out instead of following a link.
      if (lastPointer.current === "mouse" || e.detail === 0 || forced !== undefined || isOpen || !hasHistory) return;
      e.preventDefault();
      setTapped(true);
      setDismissed(false);
    },
    onFocus(e: FocusEvent<HTMLElement>) {
      onFocus?.(e);
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
        const first = root.current?.querySelector<HTMLElement>("a[aria-label]:not([data-tp-history])");
        (first ?? root.current)?.focus();
      }
      setDismissed(true);
      setTapped(false);
    },
  };

  // Each ticket hangs from the one above it, so a bend at one hinge carries everything below.
  const chain = (i: number): ReactNode => {
    if (i >= stack.length || !H) return null;
    const d = stack[i];
    const printing = !!job && i === 0;
    const tearing = !!job && i === 1;
    return (
      <div
        key={d.id}
        ref={(node) => {
          hinges.current[i] = node;
        }}
        className={cn("absolute inset-x-0", i === 0 ? "top-0" : "top-full")}
        style={{ height: H, transformOrigin: "50% 0", transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative h-full"
          style={tearing ? { x: tearX, y: tearY, rotate: tearRotate, opacity: tearOpacity, transformOrigin: "100% 0" } : { transformStyle: "preserve-3d" }}
        >
          <Ticket deploy={d} stamped={printing ? stamped : true} history={!job && i < stack.length - 1} interactive={isOpen} still={still} />
          {chain(i + 1)}
        </motion.div>
      </div>
    );
  };

  return (
    <article
      ref={setRoot}
      tabIndex={-1}
      aria-label={label}
      className={cn("relative isolate w-full max-w-[380px] select-none text-left outline-none [container-type:inline-size]", className)}
      style={{ aspectRatio: "100 / 86", ...style }}
      {...rest}
      {...handlers}
    >
      {/* The printer. */}
      <div
        className="absolute inset-x-0 top-0 h-[40cqw] rounded-[6cqw]"
        style={{
          background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.013) 0 1px, transparent 1px 4px), linear-gradient(180deg, #1c1c1c, #121212)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 40px -22px rgba(0,0,0,0.9)",
        }}
      >
        <header className="absolute inset-x-[5.5cqw] top-[5.5cqw] flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-[2cqw]">
            <svg viewBox="0 0 24 24" aria-hidden className="size-[clamp(11px,3.4cqw,14px)] shrink-0 text-[#d6d6d6]">
              <path fill="currentColor" d={source === "github" ? GITHUB_PATH : VERCEL_PATH} />
            </svg>
            <span className="relative">
              <motion.span style={{ opacity: latestOpacity }} className={cn(EYEBROW, "block whitespace-nowrap")}>
                {words.latest}
              </motion.span>
              <motion.span aria-hidden style={{ opacity: recentOpacity }} className={cn(EYEBROW, "absolute left-0 top-0 whitespace-nowrap")}>
                {words.recent}
              </motion.span>
            </span>
          </div>
          {name && <span className="min-w-0 truncate text-[clamp(10px,3cqw,13px)] font-medium leading-none text-[#aaa]">{name}</span>}
        </header>

        {/* Readout well. */}
        <div className="absolute inset-x-[5.5cqw] top-[14cqw] flex h-[9.5cqw] items-center justify-between gap-3 rounded-[2.6cqw] bg-[#0a0a0a] px-[3.4cqw] shadow-[inset_0_0.5cqw_1cqw_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex min-w-0 items-center gap-[2.2cqw]">
            <span
              aria-hidden
              className={cn("size-[clamp(6px,1.9cqw,8px)] shrink-0 rounded-full transition-[background-color,box-shadow] duration-300", (state === "building" || state === "printing") && "animate-pulse")}
              style={{ backgroundColor: LED[state], boxShadow: state === "idle" ? "none" : `0 0 6px ${LED[state]}, 0 0 1px ${LED[state]}` }}
            />
            <span className={cn(READOUT, "truncate")} style={{ color: state === "error" ? "#ff8a80" : "#d8d4ca" }}>
              {readout}
            </span>
          </div>
          {took && <span className={cn(READOUT, "shrink-0 text-[#6a6a6a]")}>{took}</span>}
        </div>

        {/* The slot: a dark mouth with the print head glowing in it while it works. */}
        <div className="absolute inset-x-[5cqw] top-[33.4cqw] h-[3.4cqw] rounded-full bg-[#030303] shadow-[inset_0_0.5cqw_0.7cqw_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.07)]">
          <motion.div className="absolute inset-x-[10%] top-[38%] h-[0.5cqw] rounded-full bg-[#ff9a3d] blur-[0.6cqw]" style={{ opacity: glow }} />
        </div>
      </div>

      {/* Paper. Clipped at the slot so what's still inside the printer doesn't show. */}
      <div
        className="pointer-events-none absolute inset-x-[8cqw] h-0"
        style={{ top: `${SLOT_Y}cqw`, clipPath: "polygon(-200% 0, 300% 0, 300% 6000px, -200% 6000px)", perspective: "180cqw", perspectiveOrigin: "50% 0" }}
      >
        <div className="pointer-events-auto absolute inset-x-0 top-0 h-0" style={{ transformStyle: "preserve-3d" }}>
          <div ref={strip} className="absolute inset-x-0 top-0" style={{ height: stack.length * H, transformStyle: "preserve-3d" }}>
            {chain(0)}
          </div>
        </div>
      </div>
      {/* The slot's lower lip, over the paper, and the shadow it throws on it. */}
      <div className="pointer-events-none absolute inset-x-[5cqw] top-[35.2cqw] h-[1.6cqw] rounded-b-full bg-[#030303]" />
      <div
        className="pointer-events-none absolute inset-x-[8cqw] top-[36.6cqw] h-[3cqw] bg-[linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0))] transition-opacity duration-300"
        style={{ opacity: shown.length || job ? 1 : 0 }}
      />

      <span aria-live="polite" className="sr-only">
        {announce}
      </span>
    </article>
  );
});

export default TicketPrinter;
