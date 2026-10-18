"use client";

import React, { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// An FAQ that reads like a conversation. Questions are light popout pills; the asked one gains a thin
// ring set just off its edge, and the answer arrives as a flat reply bubble on the right: a few beats
// of typing dots, then the words stream in one after another while the bubble grows to hold them.
//
// Motion, all subtle:
// - Switching questions is one movement: the old answer folds as the new one opens.
// - The bubble opens from its tail corner at dot size, widens to its final width, then grows line by
//   line as the words land. Each word settles 2px and un-blurs as it fades in.
// - The text is laid out at its final width from the first word, so lines never reflow mid-stream.
// Under reduced motion (or animateText={false}, or a non-string answer) the whole answer fades in.
// Screen readers get the full answer at once; the stream is visual only.

export interface ChatFaqItem {
  id: string;
  question: string;
  /** A string streams word by word (blank lines become paragraphs); any other node fades in whole. */
  answer: React.ReactNode;
  disabled?: boolean;
}

export interface ChatFaqProps {
  items: ChatFaqItem[];
  className?: string;
  /** Let several answers be open at once. */
  allowMultiple?: boolean;
  /** Open answers on first render (uncontrolled). */
  defaultValue?: string[];
  /** Open answers (controlled). */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** How long the typing dots show before the answer streams, in ms. */
  typingDelay?: number;
  /** Time between words while streaming, in ms. */
  wordInterval?: number;
  /** Stream the answer. When false, it fades in whole. */
  animateText?: boolean;
  size?: "sm" | "md" | "lg";
}

const EASE = [0.32, 0.72, 0, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;
const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;

// The bubble has the system's raised finish (top-lit bevel, bottom occlusion, long soft drop) on a
// flat fill, without the prismatic line, so it stays quiet next to the light pills.
const BUBBLE = "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)";
const POPOUT = "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.6), 0 4px 10px -2px rgba(0,0,0,0.5)";

const SIZES = {
  sm: { pill: "min-h-9 px-4 py-2 text-[13px]", text: "text-[13px] leading-relaxed", pad: "px-4 py-3", dots: { w: 60, h: 38 } },
  md: { pill: "min-h-11 px-5 py-2.5 text-sm", text: "text-[14.5px] leading-relaxed", pad: "px-5 py-4", dots: { w: 68, h: 44 } },
  lg: { pill: "min-h-13 px-6 py-3 text-[15px]", text: "text-base leading-relaxed", pad: "px-6 py-5", dots: { w: 76, h: 52 } },
} as const;

type Phase = "typing" | "streaming" | "done";

export function ChatFaq({
  items,
  className,
  allowMultiple = false,
  defaultValue = [],
  value,
  onValueChange,
  typingDelay = 500,
  wordInterval = 28,
  animateText = true,
  size = "md",
}: ChatFaqProps) {
  const [own, setOwn] = useState<string[]>(defaultValue);
  const open = value ?? own;
  const reduceMotion = useReducedMotion() ?? false;
  const baseId = useId();
  const pills = useRef<(HTMLButtonElement | null)[]>([]);
  const s = SIZES[size];

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    const next = isOpen ? open.filter((o) => o !== id) : allowMultiple ? [...open, id] : [id];
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  // Arrow keys move between questions (skipping disabled ones); Home/End jump to the ends.
  const onPillKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    const at = enabled.indexOf(index);
    const go = (i: number) => pills.current[enabled[(i + enabled.length) % enabled.length]]?.focus();
    const keys: Record<string, () => void> = {
      ArrowDown: () => go(at + 1),
      ArrowUp: () => go(at - 1),
      Home: () => go(0),
      End: () => go(enabled.length - 1),
    };
    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    }
  };

  return (
    <div className={cn("flex w-full flex-col items-start gap-3", className)}>
      {items.map((item, index) => {
        const isOpen = open.includes(item.id);
        const pillId = `${baseId}-q-${index}`;
        const answerId = `${baseId}-a-${index}`;

        return (
          <React.Fragment key={item.id}>
            <motion.button
              ref={(node) => {
                pills.current[index] = node;
              }}
              id={pillId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              disabled={item.disabled}
              data-state={isOpen ? "open" : "closed"}
              data-disabled={item.disabled ? "" : undefined}
              onClick={() => toggle(item.id)}
              onKeyDown={(event) => onPillKeyDown(event, index)}
              whileTap={item.disabled || reduceMotion ? undefined : { y: 1, scale: 0.98 }}
              transition={SPRING}
              className={cn(
                "group/pill relative max-w-full cursor-pointer rounded-full border border-white/40 text-left font-medium leading-snug tracking-tight text-neutral-950 select-none",
                "bg-[linear-gradient(180deg,#fafafa_0%,#e8e8e8_100%)] enabled:hover:bg-[linear-gradient(180deg,#ffffff_0%,#efefef_100%)]",
                // The open pill's ring sits 4px out, so its focus ring steps further out to clear it.
                "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1 data-[state=open]:outline-offset-[7px]",
                "disabled:cursor-not-allowed disabled:opacity-40",
                s.pill
              )}
              style={{ boxShadow: POPOUT }}
            >
              {/* Selection ring: a hairline set just off the pill, drawn in as the question is asked. */}
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0, scale: isOpen || reduceMotion ? 1 : 0.97 }}
                transition={reduceMotion ? { duration: 0.15 } : { duration: 0.2, ease: EASE }}
                className="pointer-events-none absolute -inset-[5px] rounded-full border border-white/30"
              />
              {item.question}
            </motion.button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  id={answerId}
                  role="region"
                  aria-labelledby={pillId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1, transition: { duration: reduceMotion ? 0.15 : 0.26, ease: EASE } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: EASE_IN } }}
                  className="w-full"
                >
                  <AnswerBubble
                    answer={item.answer}
                    size={size}
                    typingDelay={typingDelay}
                    wordInterval={wordInterval}
                    stream={animateText && !reduceMotion && typeof item.answer === "string"}
                    reduceMotion={reduceMotion}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AnswerBubble({
  answer,
  size,
  typingDelay,
  wordInterval,
  stream,
  reduceMotion,
}: {
  answer: React.ReactNode;
  size: NonNullable<ChatFaqProps["size"]>;
  typingDelay: number;
  wordInterval: number;
  stream: boolean;
  reduceMotion: boolean;
}) {
  const s = SIZES[size];
  const [phase, setPhase] = useState<Phase>(stream && typingDelay > 0 ? "typing" : stream ? "streaming" : "done");
  const [shown, setShown] = useState(0);
  const [final, setFinal] = useState({ w: 0, h: 0 });
  const [contentH, setContentH] = useState(0);
  const measurer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  const paragraphs = typeof answer === "string" ? answer.trim().split(/\n\s*\n/).map((p) => p.split(/\s+/).filter(Boolean)) : null;
  const total = paragraphs ? paragraphs.reduce((n, p) => n + p.length, 0) : 0;

  // The bubble's final size comes from an invisible copy of the full answer, laid out at the same
  // max width; the visible text is pinned to that width so nothing reflows while it streams.
  useLayoutEffect(() => {
    const m = measurer.current;
    const c = content.current;
    if (!m || !c) return;
    const read = () => {
      setFinal({ w: m.offsetWidth, h: m.offsetHeight });
      setContentH(c.offsetHeight);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(m);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    const t = setTimeout(() => setPhase("streaming"), typingDelay);
    return () => clearTimeout(t);
  }, [phase, typingDelay]);

  useEffect(() => {
    if (phase !== "streaming") return;
    // A short beat first, so the bubble has widened before the first word lands.
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= total) {
          clearInterval(interval);
          setPhase("done");
        }
      }, Math.max(8, wordInterval));
    }, 120);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [phase, total, wordInterval]);

  const typing = phase === "typing";
  const width = typing ? s.dots.w : final.w;
  const height = typing ? s.dots.h : stream ? contentH : final.h;

  let wordIndex = 0;
  const body = paragraphs
    ? paragraphs.map((words, p) => (
        <p key={p} className={p > 0 ? "mt-3" : undefined}>
          {words.map((word, w) => {
            const at = wordIndex++;
            if (stream && at >= shown) return null;
            return (
              <React.Fragment key={w}>
                {stream ? (
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, y: 2, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.24, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                ) : (
                  word
                )}
                {w < words.length - 1 && " "}
              </React.Fragment>
            );
          })}
        </p>
      ))
    : answer;

  return (
    <div className="relative flex w-full justify-end pt-1 pb-2 pl-6 sm:pl-[18%]">
      {/* Measures the finished bubble. Same padding and type as the real one. */}
      <div aria-hidden="true" className="pointer-events-none invisible absolute top-0 right-0 left-6 h-0 overflow-hidden sm:left-[18%]">
        <div ref={measurer} className={cn("ml-auto w-max max-w-full", s.pad, s.text)}>
          {paragraphs ? paragraphs.map((words, p) => <p key={p} className={p > 0 ? "mt-3" : undefined}>{words.join(" ")}</p>) : answer}
        </div>
      </div>

      {/* Full answer for screen readers; the streamed copy below is visual only. */}
      {paragraphs && <div className="sr-only">{paragraphs.map((words, p) => <p key={p}>{words.join(" ")}</p>)}</div>}

      <motion.div
        data-state={phase}
        initial={stream ? { width: s.dots.w, height: s.dots.h, opacity: 0, scale: 0.94 } : { opacity: 0, y: reduceMotion ? 0 : 6 }}
        animate={{ width, height, opacity: 1, scale: 1, y: 0 }}
        transition={{
          width: { duration: 0.26, ease: EASE },
          height: { duration: final.w ? 0.22 : 0, ease: EASE },
          opacity: { duration: reduceMotion ? 0.15 : 0.2 },
          default: SPRING,
        }}
        style={{ transformOrigin: "100% 100%" }}
        className="relative"
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-3xl rounded-br-none border border-white/[0.08] border-t-white/[0.13] bg-[#151516]"
          style={{ boxShadow: BUBBLE }}
        >
          <AnimatePresence>
            {typing && (
              <motion.span
                key="dots"
                aria-hidden="true"
                exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_IN } }}
                className="absolute inset-0 flex items-center justify-center gap-1.5"
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="size-[5px] rounded-full bg-neutral-400"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.16, ease: "easeInOut" }}
                  />
                ))}
              </motion.span>
            )}
          </AnimatePresence>

          <div
            ref={content}
            aria-hidden={paragraphs ? true : undefined}
            className={cn("absolute top-0 right-0 text-neutral-300", s.pad, s.text, typing && "invisible")}
            style={{ width: final.w || undefined }}
          >
            {body}
          </div>
        </div>

        {/* Tail: a small curl off the bottom-right corner, pointing back at the question. */}
        <svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" className="absolute -right-[11px] bottom-0 overflow-visible">
          <path d="M0 0 L1 0 C1 8 4.5 13 11.5 15.5 L11.5 16 L0 16 Z" fill="#151516" />
          <path d="M0.5 0 C0.5 8 4.5 13 11.5 15.5 L0 15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
}
