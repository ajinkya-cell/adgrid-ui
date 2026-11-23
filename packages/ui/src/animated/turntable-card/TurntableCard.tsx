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
import { animate, motion, transform, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { Deck } from "./Deck";
import { EYEBROW, EYEBROW_INDENT, HistoryList, SpotifyMark } from "./HistoryList";
import { DECK_OPEN_BRIGHTNESS, DECK_OPEN_SCALE, DECK_OPEN_X, DECK_OPEN_Y, LIVE_SPRING, OPEN_SPRING, PLAY_ANGLE, REST_ANGLE } from "./motion";
import { useReveal } from "./reveal";
import { formatAgo } from "./time";
import { splitTracks, type Track } from "./types";

// The last-played track over a machined turntable. Hover (or focus, or tap) and the header gives
// way to the plays before it, the deck slides aside and dims, the tonearm swings in and the record
// spins up.
//
// The whole hover is ONE motion value, `open`, sprung between 0 and 1. Every layer is a function of
// it (see useReveal), so there are no competing transitions: leaving halfway retraces the same path
// from wherever it is. The record's spin is separate physics (useRecordSpin) — it eases up to speed
// and coasts down, and its angle is never reset.

const DEFAULT_LABELS = { last: "Last played", now: "Now playing", before: "Before that", empty: "Nothing played yet" };

export interface TurntableCardProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Plays, newest first. The first is on the deck; the next `history` show under "Before that". */
  tracks: Track[];
  /** Username in the footer, e.g. "sjk__music". Shown uppercase. */
  user?: string;
  /** How many earlier plays the hover reveals, 0–5. */
  history?: number;
  /** Override any of the card's words, for localisation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  /** Force the hover state open or closed. Leave undefined for normal hover/focus/tap behaviour. */
  open?: boolean;
}

export const TurntableCard = forwardRef<HTMLElement, TurntableCardProps>(function TurntableCard(
  {
    tracks,
    user,
    history = 3,
    labels,
    open: forced,
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
  const { current, earlier } = splitTracks(tracks, history);
  const hasHistory = earlier.length > 0;
  const live = !!current?.nowPlaying;

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
  const isOpen = forced ?? (!dismissed && (hover || focus || tapped));
  const lastPointer = useRef<string>("mouse");
  const title = useRef<HTMLAnchorElement | null>(null);
  const inHistory = (node: EventTarget | null) => node instanceof Element && !!node.closest("[data-tt-history]");

  useEffect(() => {
    if (!tapped) return;
    const close = (e: globalThis.PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setTapped(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [tapped]);

  // ── The one value everything follows. ──
  const open = useMotionValue(isOpen ? 1 : 0);
  useEffect(() => {
    const controls = animate(open, isOpen ? 1 : 0, still ? { duration: 0.15, ease: "linear" } : { type: "spring", ...OPEN_SPRING });
    return () => controls.stop();
  }, [isOpen, still, open]);

  const [interactive, setInteractive] = useState(isOpen);
  useMotionValueEvent(open, "change", (v) => setInteractive(v > 0.5));

  // With nothing earlier to show, the words stay put and only the deck responds.
  const closed = useMotionValue(0);
  const textOpen = hasHistory ? open : closed;

  const header = useReveal(textOpen, { range: [0, 0.45], out: true, y: -8, blur: 4, still });
  const footer = useReveal(textOpen, { range: [0, 0.35], out: true, y: 6, still });

  const deckX = useTransform(open, [0, 1], ["0%", still ? "0%" : DECK_OPEN_X]);
  const deckY = useTransform(open, [0, 1], ["0%", still ? "0%" : DECK_OPEN_Y]);
  const deckScale = useTransform(open, [0, 1], [1, still ? 1 : DECK_OPEN_SCALE]);
  const deckFilter = useTransform(open, (v) => {
    const b = still ? 1 : 1 - (1 - DECK_OPEN_BRIGHTNESS) * v;
    return b > 0.999 ? "none" : `brightness(${b.toFixed(3)})`;
  });
  // A song starting or stopping moves the arm on its own, slower spring, like lowering it by hand.
  // The arm follows whichever of hover and playback wants it further in.
  const playing = useMotionValue(live ? 1 : 0);
  useEffect(() => {
    const controls = animate(playing, live ? 1 : 0, still ? { duration: 0 } : { type: "spring", ...LIVE_SPRING });
    return () => controls.stop();
  }, [live, still, playing]);
  const armAngle = useTransform([open, playing], ([o, p]: number[]) => {
    const v = Math.max(transform(o, [0.05, 0.75], [0, 1]), p);
    return still ? (v > 0.5 ? PLAY_ANGLE : REST_ANGLE) : REST_ANGLE + (PLAY_ANGLE - REST_ANGLE) * v;
  });

  // ── Events, composed with any the caller passed. ──
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
      // On touch, the first tap opens the card instead of following a link. Decided on click, not
      // pointerdown, so a swipe that starts on the card scrolls the page without opening it.
      // Keyboard-made clicks (detail 0) always go through.
      if (lastPointer.current === "mouse" || e.detail === 0 || forced !== undefined || isOpen) return;
      e.preventDefault();
      setTapped(true);
      setDismissed(false);
    },
    onFocus(e: FocusEvent<HTMLElement>) {
      onFocus?.(e);
      // The card opens when keyboard focus reaches the earlier plays, and closes again when it goes
      // back to the title, so focus never sits on something faded out. Mouse focus is ignored, so a
      // clicked link doesn't pin the card open after the pointer leaves.
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
      // The card is the layer Escape closes, so it stops here rather than also closing whatever hosts it.
      e.stopPropagation();
      // Keep the keyboard user's place: hand focus back to something that stays visible.
      if (inHistory(document.activeElement)) (title.current ?? root.current)?.focus();
      setDismissed(true);
      setTapped(false);
    },
  };

  const ago = formatAgo(current?.playedAt);
  const eyebrow = !current ? words.empty : live ? words.now : words.last;

  return (
    <article
      ref={setRoot}
      tabIndex={-1}
      aria-label={current ? `${eyebrow}: ${current.title} by ${current.artist}` : words.empty}
      className={cn(
        "relative isolate w-full max-w-[560px] select-none overflow-hidden rounded-[28px] text-left outline-none [container-type:inline-size]",
        className
      )}
      style={{
        aspectRatio: "560 / 360",
        background:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.013) 0 1px, transparent 1px 4px), linear-gradient(180deg, #181818, #121212)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px -24px rgba(0,0,0,0.85)",
        ...style,
      }}
      {...rest}
      {...handlers}
    >
      {/* Deck: at rest it bleeds off the right and bottom edges; open, it shrinks into the corner. */}
      <motion.div
        className="absolute bottom-[-5cqw] right-[-9.29cqw] w-[67.86cqw] will-change-transform"
        style={{ x: deckX, y: deckY, scale: deckScale, filter: deckFilter, transformOrigin: "100% 100%" }}
      >
        <Deck image={current?.image} alt="" spinning={isOpen || live} armAngle={armAngle} reducedMotion={still} />
      </motion.div>

      {/* Scrim: keeps the list legible over the dimmed deck. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: textOpen,
          background: "linear-gradient(90deg, #151515 0%, rgba(21,21,21,0.82) 45%, rgba(21,21,21,0) 75%)",
        }}
      />

      <div className="absolute inset-[clamp(18px,5cqw,28px)] z-10">
        {/* Stays put through the hover; both eyebrows leave room for it. Green while a song plays. */}
        <SpotifyMark live={live} />

        <motion.div style={{ ...header, pointerEvents: interactive && hasHistory ? "none" : "auto" }} className="pr-[2px]">
          <p className={cn(EYEBROW, EYEBROW_INDENT)}>{eyebrow}</p>
          {current &&
            (current.url ? (
              <a
                ref={title}
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[clamp(8px,2.2cqw,12px)] block truncate rounded-[4px] text-[clamp(17px,4.3cqw,24px)] font-semibold leading-[1.2] tracking-[-0.01em] text-[#e5e5e5] outline-none transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white/35"
              >
                {current.title}
              </a>
            ) : (
              <p className="mt-[clamp(8px,2.2cqw,12px)] truncate text-[clamp(17px,4.3cqw,24px)] font-semibold leading-[1.2] tracking-[-0.01em] text-[#e5e5e5]">
                {current.title}
              </p>
            ))}
        </motion.div>

        {(user || ago) && (
          // The name gives way to the time when space runs out; the time never truncates.
          <motion.p
            style={footer}
            className="absolute bottom-0 left-0 flex max-w-[32cqw] whitespace-nowrap text-[clamp(9.5px,1.95cqw,11px)] font-semibold uppercase leading-none tracking-[0.12em] text-[#aaa]"
          >
            {user && <span className="min-w-0 truncate">{user}</span>}
            {user && ago && <span className="shrink-0 px-[0.45em]">·</span>}
            {ago && (
              <span className="shrink-0" suppressHydrationWarning>
                {ago}
              </span>
            )}
          </motion.p>
        )}

        {hasHistory && <HistoryList open={open} tracks={earlier} heading={words.before} interactive={interactive} still={still} />}
      </div>
    </article>
  );
});

export default TurntableCard;
