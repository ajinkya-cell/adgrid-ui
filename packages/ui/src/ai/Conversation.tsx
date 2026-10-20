"use client";

import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// The scrolling thread a chat lives in. It holds on to the bottom while a reply streams in, so the
// newest words stay in view; scroll up and it lets go, so you can read back without being dragged
// down. Once you're away from the bottom a small raised key with a down arrow rises at the foot of
// the thread; press it and the thread glides back down and holds on again.
//
// It's a native log region. Set `busy` while a reply is streaming and screen readers wait for the
// finished message instead of reading out every token. While nothing renders in the message column
// it shows `empty`; that's judged by the DOM (CSS :empty), so a list wrapped in AnimatePresence
// counts as empty once its last message has finished leaving.

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Shown when there are no messages: a greeting, suggestions. */
  empty?: ReactNode;
  /** A reply is streaming. Sets aria-busy so screen readers announce it once it's finished. */
  busy?: boolean;
  /** Classes for the inner column the messages sit in (width, padding, gap). */
  contentClassName?: string;
  /** Label for the scroll-to-latest button. Default "Scroll to latest message". */
  scrollButtonLabel?: string;
}

// How close to the bottom still counts as "at the bottom", in px.
const THRESHOLD = 48;
const EASE = [0.32, 0.72, 0, 1] as const;
const RAISED =
  "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)";

export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(function Conversation(
  {
    children,
    empty,
    busy = false,
    className,
    contentClassName,
    scrollButtonLabel = "Scroll to latest message",
    "aria-label": ariaLabel = "Conversation",
    ...rest
  },
  ref
) {
  const reduce = useReducedMotion() ?? false;
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => scroller.current as HTMLDivElement);

  // `pinned` is read inside observers, so it lives in a ref; `atBottom` only drives the button.
  const pinned = useRef(true);
  // True while we're gliding down after the button; our own scroll events mustn't let go.
  const gliding = useRef(false);
  const [atBottom, setAtBottom] = useState(true);

  const distance = () => {
    const el = scroller.current;
    return el ? el.scrollHeight - el.scrollTop - el.clientHeight : 0;
  };

  const onScroll = () => {
    const near = distance() <= THRESHOLD;
    if (gliding.current) {
      if (!near) return;
      gliding.current = false;
    }
    pinned.current = near;
    setAtBottom(near);
  };

  // Any hand on the thread cancels a glide, so the reader always wins.
  const release = () => {
    gliding.current = false;
  };

  useLayoutEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    el.scrollTop = el.scrollHeight;
    const ro = new ResizeObserver(() => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
      else setAtBottom(distance() <= THRESHOLD);
    });
    ro.observe(inner);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollToBottom = () => {
    const el = scroller.current;
    if (!el) return;
    pinned.current = true;
    gliding.current = !reduce;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      {...rest}
      data-state={atBottom ? "pinned" : "free"}
      className={cn("relative flex min-h-0 flex-col", className)}
    >
      <div
        ref={scroller}
        role="log"
        aria-label={ariaLabel}
        aria-busy={busy || undefined}
        tabIndex={0}
        onScroll={onScroll}
        onWheel={release}
        onTouchStart={release}
        onKeyDown={release}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none",
          "[scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]",
          "focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-white/40"
        )}
      >
        <div ref={content} className={cn("flex min-h-full flex-col gap-6 px-4 py-6", contentClassName)}>
          <div className="peer flex flex-col gap-[inherit] empty:hidden">{children}</div>
          {empty && <div className="hidden flex-1 flex-col peer-empty:flex">{empty}</div>}
        </div>
      </div>

      <AnimatePresence>
        {!atBottom && (
          <motion.button
            key="to-bottom"
            type="button"
            aria-label={scrollButtonLabel}
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: reduce ? 0 : 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%", transition: { duration: reduce ? 0.15 : 0.2, ease: EASE } }}
            exit={{ opacity: 0, y: reduce ? 0 : 6, x: "-50%", transition: { duration: 0.15 } }}
            className={cn(
              "absolute bottom-3 left-1/2 grid size-9 cursor-pointer place-items-center rounded-full text-neutral-300",
              "border border-white/[0.08] border-t-white/[0.14] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
              "transition-colors duration-150 hover:bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)] hover:text-white",
              "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
            )}
            style={{ boxShadow: RAISED }}
          >
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
              <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
