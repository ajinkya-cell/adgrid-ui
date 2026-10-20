"use client";

import React, { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Text that arrives a word at a time. Each word fades up out of a soft blur, and because the words
// overlap as they land, the line reads as one smooth wave rather than a series of pops.
//
// Model streams arrive in bursts: three words, a pause, five words. Showing them as they come is
// what makes streaming look jerky. So nothing is shown as it arrives. Incoming words wait in a
// buffer and are let out on a steady beat (`wordInterval`); when the buffer runs long the beat
// quickens so the text never falls far behind the stream. A word is only let out once it's whole
// (followed by a space, or the stream has ended), so half-words never appear and then change.
//
// Two ways to feed it:
// - Live (default): pass the text as it grows. Whatever is there when it mounts is history and
//   shows at once; only words that arrive afterwards land.
// - Reveal: pass the finished text with `reveal` and it plays itself in from the first word.
//
// Blank lines become paragraphs, single newlines become line breaks. While words are still coming,
// an optional caret blinks after the last one: the one thing here allowed to pulse, because it is
// live. Under reduced motion there's no pacing and no blur; words just fade in. In reveal mode
// screen readers get the full text immediately; the stream is visual only.

export interface StreamingTextProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text so far (live) or the whole text (reveal). */
  text: string;
  /** Play `text` in word by word on its own. Off: follow `text` as it grows. */
  reveal?: boolean;
  /** The beat words are let out on, in ms. Live streams quicken it when they fall behind. Default 32. */
  wordInterval?: number;
  /** Live only: more text is still coming. Until it's false, a trailing word without a space is held back. */
  streaming?: boolean;
  /** Blink a caret after the last word while words are still coming. Default true. */
  caret?: boolean;
  /** Reveal only: called once the last word has been let out. */
  onComplete?: () => void;
}

// A word fades in and its blur clears over 600ms. At a ~32ms beat that's about twenty words
// mid-landing at once, which is what makes it read as a wave.
const LAND_MS = 600;
const LAND_EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
// Every this many words waiting in the buffer, the beat runs one step faster.
const CATCH_UP = 12;

interface Token {
  word: string;
  paragraph: number;
  /** First word of a new line inside its paragraph. */
  lineStart: boolean;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  text
    .trim()
    .split(/\n\s*\n/)
    .forEach((paragraph, p) =>
      paragraph.split("\n").forEach((line, l) =>
        line
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word, w) => tokens.push({ word, paragraph: p, lineStart: l > 0 && w === 0 }))
      )
    );
  return tokens;
}

/** Words in `text` that are safe to show: mid-stream, a last word with no space after it may still be growing. */
export function countWords(text: string, streaming: boolean) {
  const total = text.match(/\S+/g)?.length ?? 0;
  return streaming && total > 0 && !/\s$/.test(text) ? total - 1 : total;
}

/**
 * The pacer: lets words out one per beat until it has caught up with `available`, quickening the
 * beat when it falls behind. Returns how many are out. Live mode starts with everything out;
 * reveal starts from zero, and again whenever `restartKey` changes.
 */
export function usePacedWords(
  available: number,
  { reveal = false, wordInterval = 32, restartKey }: { reveal?: boolean; wordInterval?: number; restartKey?: unknown }
) {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(() => (reveal && !reduce ? 0 : available));
  const shown = useRef(visible);

  const [played, setPlayed] = useState(restartKey);
  if (reveal && restartKey !== played) {
    setPlayed(restartKey);
    setVisible(0);
    shown.current = 0;
  }

  useEffect(() => {
    if (shown.current > available) {
      shown.current = available;
      setVisible(available);
    }
    if (reduce) {
      shown.current = available;
      setVisible(available);
      return;
    }
    if (shown.current >= available) return;

    let frame = 0;
    let last = performance.now();
    let owed = 0;
    const step = (now: number) => {
      owed += now - last;
      last = now;
      let next = shown.current;
      while (next < available) {
        const beat = Math.max(4, wordInterval / Math.max(1, (available - next) / CATCH_UP));
        if (owed < beat) break;
        owed -= beat;
        next += 1;
      }
      if (next !== shown.current) {
        shown.current = next;
        setVisible(next);
      }
      if (next < available) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [available, reduce, wordInterval, played]);

  return { visible: Math.min(visible, available), reduce, played };
}

// Runs once per element: the dataset flag survives the ref being re-attached on later renders.
export function land(el: HTMLElement | null, reduce: boolean) {
  if (!el || el.dataset.landed !== undefined) return;
  el.dataset.landed = "";
  if (reduce) {
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "linear" });
    return;
  }
  el.style.willChange = "opacity, filter, transform";
  const animation = el.animate(
    [
      { opacity: 0, filter: "blur(8px)", transform: "translateY(3px)" },
      { opacity: 0.7, filter: "blur(2px)", transform: "translateY(1px)", offset: 0.45 },
      { opacity: 1, filter: "blur(0px)", transform: "none" },
    ],
    { duration: LAND_MS, easing: LAND_EASE }
  );
  animation.onfinish = () => {
    el.style.willChange = "";
  };
}

function blink(el: HTMLElement | null) {
  if (!el || el.dataset.blinking !== undefined) return;
  el.dataset.blinking = "";
  el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.55 }, { opacity: 0 }], {
    duration: 1000,
    iterations: Infinity,
  });
}

export const StreamingText = forwardRef<HTMLDivElement, StreamingTextProps>(function StreamingText(
  { text, reveal = false, wordInterval = 32, streaming = false, caret = true, onComplete, className, ...rest },
  ref
) {
  const tokens = tokenize(text);
  const total = tokens.length;
  const available = countWords(text, !reveal && streaming);

  // Words let out so far; a new text in reveal mode plays again from the start.
  const { visible, reduce, played } = usePacedWords(available, { reveal, wordInterval, restartKey: text });
  // Live mode: words already out on mount render still, without landing.
  const settled = useRef(reveal ? 0 : visible);

  const completed = useRef(onComplete);
  completed.current = onComplete;
  const finished = visible >= total;
  useEffect(() => {
    if (reveal && finished) completed.current?.();
  }, [reveal, finished, played]);

  const out = Math.min(visible, total);
  const live = reveal ? out < total : streaming || out < total;
  const lastParagraph = out > 0 ? tokens[out - 1].paragraph : 0;

  const paragraphs: React.ReactNode[][] = [];
  tokens.slice(0, out).forEach((token, i) => {
    const words = (paragraphs[token.paragraph] ??= []);
    if (token.lineStart) words.push(<br key={`br-${i}`} />);
    else if (words.length > 0) words.push(" ");
    words.push(
      i < settled.current ? (
        <React.Fragment key={i}>{token.word}</React.Fragment>
      ) : (
        <span
          key={i}
          ref={(el) => {
            land(el, reduce);
          }}
          className="inline-block"
        >
          {token.word}
        </span>
      )
    );
  });

  const caretMark = (
    <span
      key="caret"
      aria-hidden="true"
      ref={(el) => {
        blink(el);
      }}
      className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] rounded-full bg-neutral-300"
    />
  );

  return (
    <div {...rest} ref={ref} data-state={live ? "streaming" : "done"} className={cn("break-words", className)}>
      {reveal && (
        <div className="sr-only">
          {text
            .trim()
            .split(/\n\s*\n/)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      )}
      <div aria-hidden={reveal || undefined}>
        {paragraphs.map((words, p) =>
          words ? (
            <p key={p} className={p > 0 ? "mt-3" : undefined}>
              {words}
              {caret && live && p === lastParagraph && caretMark}
            </p>
          ) : null
        )}
        {caret && live && out === 0 && <p>{caretMark}</p>}
      </div>
    </div>
  );
});
