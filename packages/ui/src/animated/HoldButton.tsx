"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { playClickVoice, VOID_BUTTON_CLICK, DETENT_CLICK } from "../lib/click-voices";

export interface HoldButtonProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Label at rest. */
  label?: string;
  /** Label while the button is held and filling. */
  holdingLabel?: string;
  /** Label once the fill covers the button. */
  doneLabel?: string;
  /** How long the button must be held, in ms. */
  holdDuration?: number;
  /** Time spent on the done state before draining back, in ms. 0 keeps it done. */
  resetAfter?: number;
  /** How far the edge leans with speed and sloshes when it stops, 0–2. 0 is a straight edge. */
  slosh?: number;
  size?: "sm" | "md" | "lg";
  /** Play the tactile click on press and a detent when it completes. */
  sound?: boolean;
  /** Called once when the hold completes. */
  onComplete?: () => void;
}

type Phase = "idle" | "holding" | "done";

let holdAudioCtx: AudioContext | null = null;

// Same five-layer shadows as PixelButton, so the two sit together as one family.
const SHADOW_REST =
  "inset 0 1px 0 0 rgba(255,255,255,0.14), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.035), 0 1px 2px 0 rgba(0,0,0,0.6), 0 6px 16px -4px rgba(0,0,0,0.7)";
const SHADOW_HOVER =
  "inset 0 1px 0 0 rgba(255,255,255,0.2), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 2px 4px 0 rgba(0,0,0,0.6), 0 10px 24px -6px rgba(0,0,0,0.8)";
const SHADOW_PRESS =
  "inset 0 3px 8px 0 rgba(0,0,0,0.85), inset 0 -1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.025), 0 1px 1px 0 rgba(0,0,0,0.6), 0 2px 6px -2px rgba(0,0,0,0.6)";

const SPRING = { type: "spring", stiffness: 750, damping: 24, mass: 0.4 } as const;
const EASE_OUT = [0.32, 0.72, 0, 1] as const;

// Text under the silver is on-popout ink. Done mixes ~45% of the success token into that ink, so the
// word reads "ok" on the metal without a new colour entering the palette.
const INK = "rgb(10 10 10)";
const INK_DONE = "rgb(62 91 74)";
const SUCCESS = "rgb(126 190 152)";

const SIZES = {
  sm: { h: "h-9", w: 148, text: "text-[12px]" },
  md: { h: "h-11", w: 176, text: "text-[13px]" },
  lg: { h: "h-12", w: 200, text: "text-sm" },
};

// Off-face margin: the edge's lean plus its bow never reach past this, so 0 is empty and 1 is full.
const MARGIN = 10;
const MAX_LEAN = 6;

interface Edge {
  top: number; // x of the edge at the top
  mid: number; // x of the Bézier control point, pushing the middle ahead (a convex meniscus)
  bottom: number;
}

function edgeAt(w: number, p: number, lean: number, bow: number): Edge {
  const base = p * (w + MARGIN * 2) - MARGIN;
  return { top: base + lean, mid: base + lean / 2 + bow * 2, bottom: base };
}

// The filled side: left of the edge.
function fillD(e: Edge, h: number) {
  return `M-4 -4 L${e.top.toFixed(2)} -4 L${e.top.toFixed(2)} 0 Q${e.mid.toFixed(2)} ${h / 2} ${e.bottom.toFixed(2)} ${h} L${e.bottom.toFixed(2)} ${h + 4} L-4 ${h + 4} Z`;
}

// The empty side: right of the edge, for the resting label.
function emptyD(e: Edge, w: number, h: number) {
  return `M${w + 4} -4 L${e.top.toFixed(2)} -4 L${e.top.toFixed(2)} 0 Q${e.mid.toFixed(2)} ${h / 2} ${e.bottom.toFixed(2)} ${h} L${e.bottom.toFixed(2)} ${h + 4} L${w + 4} ${h + 4} Z`;
}

const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

function Word({ text, keyPrefix, done, reduce, ink }: { text: string; keyPrefix: string; done: boolean; reduce: boolean; ink: boolean }) {
  return (
    <span className="relative inline-flex whitespace-pre">
      <AnimatePresence mode="popLayout" initial={false}>
        {Array.from(text).map((ch, i) => (
          <motion.span
            key={`${keyPrefix}-${i}-${ch}`}
            layout={reduce ? false : "position"}
            className="inline-block"
            initial={{
              opacity: 0,
              ...(reduce ? {} : { y: done ? "55%" : "-45%", filter: "blur(3px)" }),
              ...(ink ? { color: INK } : {}),
            }}
            animate={{ opacity: 1, y: "0%", filter: "blur(0px)", ...(ink ? { color: done ? INK_DONE : INK } : {}) }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: "45%", filter: "blur(3px)", transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
            transition={{
              duration: 0.34,
              ease: EASE_OUT,
              delay: reduce ? 0 : done ? 0.1 + i * 0.03 : 0.018 * i,
              layout: { duration: 0.3, ease: EASE_OUT },
              color: { duration: 0.5, delay: done ? 0.3 + i * 0.045 : 0 },
            }}
          >
            {ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

function Check({ show, reduce, color }: { show: boolean; reduce: boolean; color: string }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.svg
          key="check"
          viewBox="0 0 16 16"
          className="size-[14px] shrink-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, width: 0, marginRight: 0 }}
          animate={{ opacity: 1, width: 14, marginRight: 6 }}
          exit={{ opacity: 0, width: 0, marginRight: 0, transition: { duration: 0.14 } }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          aria-hidden
        >
          <motion.path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.32, delay: reduce ? 0 : 0.12, ease: EASE_OUT }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

export function HoldButton({
  className,
  label = "Update",
  holdingLabel = "Updating",
  doneLabel = "Updated",
  holdDuration = 1600,
  resetAfter = 2400,
  slosh = 1,
  size = "md",
  sound = true,
  onComplete,
  disabled,
  style,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: HoldButtonProps) {
  const reduce = !!useReducedMotion();
  const s = SIZES[size] ?? SIZES.md;
  const uid = useId().replace(/:/g, "");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const restLabelRef = useRef<HTMLSpanElement>(null);
  const inkLabelRef = useRef<HTMLSpanElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Physics state, all in refs: the loop writes straight to the DOM, so React renders only on phase changes.
  const sim = useRef({ held: 0, x: 0, v: 0, lean: 0, leanV: 0 });
  const holdingRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const rafRef = useRef(0);
  const wakeRef = useRef<() => void>(() => {});
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const optsRef = useRef({ holdDuration, slosh, reduce, onComplete, resetAfter, sound });
  optsRef.current = { holdDuration, slosh, reduce, onComplete, resetAfter, sound };

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const play = (voice: typeof VOID_BUTTON_CLICK) => {
    if (!optsRef.current.sound || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!holdAudioCtx) holdAudioCtx = new AudioContextClass();
      if (holdAudioCtx.state === "suspended") holdAudioCtx.resume();
      playClickVoice(holdAudioCtx, voice);
    } catch (e) {}
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    let last = 0;

    const paint = () => {
      const w = button.offsetWidth;
      const h = button.offsetHeight;
      const { x, lean } = sim.current;
      const { slosh: k, reduce: r } = optsRef.current;
      const p = Math.max(0, Math.min(1, x));
      // A slight forward bow only while there's liquid on the face; flat when empty or full.
      const bow = r ? 0 : Math.min(1, k) * 1.2 * Math.min(1, p * 8, (1 - p) * 8);
      const e = edgeAt(w, p, r ? 0 : lean, bow);
      svgRef.current?.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const d = fillD(e, h);
      svgRef.current?.querySelectorAll("path[data-fill]").forEach((el) => el.setAttribute("d", d));
      if (inkLabelRef.current) inkLabelRef.current.style.clipPath = `path("${fillD(e, h)}")`;
      if (restLabelRef.current) restLabelRef.current.style.clipPath = `path("${emptyD(e, w, h)}")`;
    };

    const tick = (t: number) => {
      const dt = Math.min(0.032, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      const st = sim.current;
      const o = optsRef.current;
      const current = phaseRef.current;

      // Where the fill wants to be: an eased curve of hold time while held, empty otherwise.
      if (current === "holding" && holdingRef.current) st.held = Math.min(1, st.held + dt / (Math.max(300, o.holdDuration) / 1000));
      else if (current !== "done") st.held = 0;
      const target = current === "done" ? 1 : easeInOut(st.held);

      // Level follows the target on a spring: tight while held so it tracks the hold, softer on the
      // way back so letting go reads as a release rather than a snap.
      const draining = target < st.x;
      const stiffness = draining ? 140 : 260;
      const damping = draining ? 20 : 30;
      st.v += (stiffness * (target - st.x) - damping * st.v) * dt;
      st.x += st.v * dt;

      // The top of the edge leans toward the direction of travel, on its own underdamped spring,
      // so it sloshes a beat after the level stops.
      const pxSpeed = st.v * button.offsetWidth;
      const leanTarget = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, pxSpeed * 0.02 * o.slosh));
      st.leanV += (320 * (leanTarget - st.lean) - 11 * st.leanV) * dt;
      st.lean += st.leanV * dt;

      if (current === "holding" && st.held >= 1 && st.x > 0.985) {
        go("done");
        play(DETENT_CLICK);
        if (typeof navigator !== "undefined") navigator.vibrate?.(10);
        o.onComplete?.();
        if (o.resetAfter > 0) {
          resetTimer.current = setTimeout(() => {
            go("idle");
            wakeRef.current();
          }, o.resetAfter);
        }
      }

      paint();

      const settled =
        !holdingRef.current &&
        Math.abs(target - st.x) < 0.001 &&
        Math.abs(st.v) < 0.002 &&
        Math.abs(st.lean) < 0.05 &&
        Math.abs(st.leanV) < 0.05;
      if (settled) {
        st.x = target;
        st.v = st.lean = st.leanV = 0;
        paint();
        rafRef.current = 0;
        last = 0;
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    wakeRef.current = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(button);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      wakeRef.current = () => {};
    };
  }, []);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const startHold = () => {
    if (disabled || phaseRef.current === "done") return;
    holdingRef.current = true;
    setPressed(true);
    play(VOID_BUTTON_CLICK);
    go("holding");
    wakeRef.current();
  };

  const endHold = () => {
    holdingRef.current = false;
    setPressed(false);
    if (phaseRef.current === "holding") {
      go("idle");
      wakeRef.current();
    }
  };

  const done = phase === "done";
  const text = done ? doneLabel : phase === "holding" ? holdingLabel : label;
  const keyPrefix = done ? "done" : "live";

  const content = (ink: boolean) => (
    <>
      <Check show={done} reduce={reduce} color={ink ? INK_DONE : SUCCESS} />
      <Word text={text} keyPrefix={keyPrefix} done={done} reduce={reduce} ink={ink} />
    </>
  );

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      data-state={phase}
      data-disabled={disabled ? "" : undefined}
      aria-label={props["aria-label"] ?? `${label}, press and hold`}
      onPointerEnter={(e) => {
        setHovered(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHovered(false);
        onPointerLeave?.(e);
      }}
      onPointerDown={(e) => {
        if (e.button === 0) {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          startHold();
        }
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        endHold();
        onPointerUp?.(e);
      }}
      onPointerCancel={(e) => {
        endHold();
        onPointerCancel?.(e);
      }}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          startHold();
        }
        onKeyDown?.(e);
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          endHold();
        }
        onKeyUp?.(e);
      }}
      onBlur={(e) => {
        endHold();
        onBlur?.(e);
      }}
      onContextMenu={(e) => e.preventDefault()}
      animate={{
        scale: pressed ? 0.98 : 1,
        y: pressed ? 1 : 0,
        boxShadow: pressed ? SHADOW_PRESS : hovered && !disabled ? SHADOW_HOVER : SHADOW_REST,
      }}
      initial={false}
      transition={SPRING}
      style={{ width: s.w, WebkitTouchCallout: "none", ...style }}
      className={cn(
        "relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden rounded-full outline-none touch-none",
        "bg-[linear-gradient(to_bottom,#1f1f1f,#121212)]",
        "font-sans font-semibold tracking-[-0.005em]",
        "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        "disabled:cursor-not-allowed disabled:opacity-40",
        s.h,
        className
      )}
      {...(props as any)}
    >
      {/* Glassy top half, under everything */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_45%)]"
      />

      {/* The fill: brushed silver (the popout material), feathered a hair so the edge reads as liquid, not a cut. */}
      <svg ref={svgRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5f5f5" />
            <stop offset="1" stopColor="#d9d9d9" />
          </linearGradient>
          {/* Soft highlight band across the upper third, like light on a polished bar */}
          <linearGradient id={`${uid}-hi`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.08" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.38" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.94" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.14" />
          </linearGradient>
          {/* Brushed grain: hairlines a couple of px apart, barely there */}
          <pattern id={`${uid}-brush`} width="6" height="2" patternUnits="userSpaceOnUse">
            <rect width="6" height="1" fill="#000" fillOpacity="0.025" />
          </pattern>
          <filter id={`${uid}-feather`} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
        </defs>
        <g filter={reduce ? undefined : `url(#${uid}-feather)`}>
          <path data-fill d="" fill={`url(#${uid}-fill)`} />
          <path data-fill d="" fill={`url(#${uid}-brush)`} />
          <path data-fill d="" fill={`url(#${uid}-hi)`} />
        </g>
      </svg>

      {/* Success wash and a single sheen when it fills */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgb(126_190_152)]"
        initial={false}
        animate={{ opacity: done ? 0.1 : 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      />
      <AnimatePresence>
        {done && !reduce && (
          <motion.span
            key="sheen"
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-2/5 bg-[linear-gradient(100deg,transparent_0%,rgba(255,255,255,0.7)_50%,transparent_100%)]"
            initial={{ left: "-45%" }}
            animate={{ left: "110%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.05 }}
          />
        )}
      </AnimatePresence>

      {/* Resting label, clipped to the empty side */}
      <span
        ref={restLabelRef}
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 flex items-center justify-center text-white/60", s.text)}
      >
        {content(false)}
      </span>

      {/* Lit label, clipped to the filled side */}
      <span
        ref={inkLabelRef}
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 flex items-center justify-center text-neutral-950 [text-shadow:0_1px_0_rgba(255,255,255,0.45)]", s.text)}
        style={{ clipPath: "inset(0 100% 0 0)" }}
      >
        {content(true)}
      </span>

      <span className="sr-only" aria-live="polite">
        {done ? doneLabel : ""}
      </span>
    </motion.button>
  );
}
