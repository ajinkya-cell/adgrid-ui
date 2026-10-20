"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { StreamingText } from "./StreamingText";
import { TypingIndicator, type TypingIndicatorVariant } from "./TypingIndicator";

// One turn in a chat. The two sides are different objects, the way the best chat apps do it:
// - user: a raised bubble on the right with a small curl off its corner (the Chat FAQ bubble).
// - assistant: no surface at all, just text on the page, full width, with an optional avatar in a
//   socket beside it. Long answers read like a document instead of a stack of balloons.
//
// `status` walks an assistant turn through its life: typing (dots, before the first token) →
// streaming (words land as `content` grows) → done, or error (a danger line and a Retry). Pass
// `children` instead of `content` for rich content (markdown, code); it renders as is.
//
// Messages come and go with one movement: they rise 8px and fade in (a user bubble also grows from
// its tail corner) and fade up and away on exit. Wrap a list in <AnimatePresence initial={false}>
// so history doesn't animate on load but new turns do. Under reduced motion they only fade.

export type MessageFrom = "user" | "assistant";
export type MessageStatus = "typing" | "streaming" | "done" | "error";
export type MessageSize = "sm" | "md" | "lg";

type MotionConflicts = "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd";

export interface MessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "content" | "children" | MotionConflicts> {
  from: MessageFrom;
  /** The text. On an assistant turn it streams in while `status` is "streaming". */
  content?: string;
  /** Rich content in place of `content`, rendered as is. */
  children?: ReactNode;
  /** Default "done". */
  status?: MessageStatus;
  /** Assistant only: an icon or image, set in a round socket beside the text. */
  avatar?: ReactNode;
  /** Read by screen readers before the message. Defaults to "You" or "Assistant". */
  name?: string;
  /** A row under the message (copy, regenerate…), shown once it's done. */
  actions?: ReactNode;
  /** Assistant only: what shows while waiting for the first token. Default "dots". */
  typingIndicator?: TypingIndicatorVariant;
  /** Error message for status "error". Default "Something went wrong." */
  error?: ReactNode;
  /** Shows a Retry button next to the error. */
  onRetry?: () => void;
  /** Blink a caret after the last word while streaming. Default true. */
  caret?: boolean;
  /** Default "md". */
  size?: MessageSize;
}

const EASE = [0.32, 0.72, 0, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

const BUBBLE =
  "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)";

const SIZES = {
  sm: { text: "text-[13px] leading-relaxed", pad: "px-3.5 py-2", avatar: "size-7 [&_svg]:size-3.5", gap: "gap-2.5" },
  md: { text: "text-[14.5px] leading-relaxed", pad: "px-4 py-2.5", avatar: "size-8 [&_svg]:size-4", gap: "gap-3" },
  lg: { text: "text-base leading-relaxed", pad: "px-5 py-3", avatar: "size-9 [&_svg]:size-[18px]", gap: "gap-3.5" },
} as const;

export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(
  {
    from,
    content,
    children,
    status = "done",
    avatar,
    name,
    actions,
    typingIndicator = "dots",
    error,
    onRetry,
    caret = true,
    size = "md",
    className,
    ...rest
  },
  ref
) {
  const reduce = useReducedMotion() ?? false;
  const s = SIZES[size];
  const isUser = from === "user";
  const label = name ?? (isUser ? "You" : "Assistant");

  const body =
    children ??
    (content === undefined ? null : isUser ? (
      <p className="whitespace-pre-wrap break-words">{content}</p>
    ) : (
      <StreamingText text={content} streaming={status === "streaming"} caret={caret} />
    ));

  return (
    <motion.div
      {...rest}
      ref={ref}
      role="article"
      aria-label={label}
      aria-busy={status === "typing" || status === "streaming" || undefined}
      data-from={from}
      data-state={status}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: isUser ? 0.97 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? 0.15 : 0.26, ease: EASE } }}
      exit={{ opacity: 0, y: reduce ? 0 : -4, transition: { duration: 0.18, ease: EASE_IN } }}
      style={{ transformOrigin: isUser ? "100% 100%" : "0% 0%" }}
      className={cn("flex w-full", isUser ? "flex-col items-end pl-[12%]" : cn("items-start", s.gap), className)}
    >
      {isUser ? (
        <>
          <div className="relative mr-[11px] max-w-full">
            <div
              className={cn(
                "rounded-3xl rounded-br-none border border-white/[0.08] border-t-white/[0.13] bg-[#151516] text-neutral-200",
                s.pad,
                s.text
              )}
              style={{ boxShadow: BUBBLE }}
            >
              {body}
            </div>
            {/* Tail: a small curl off the bottom-right corner. */}
            <svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" className="absolute -right-[11px] bottom-0 overflow-visible">
              <path d="M0 0 L1 0 C1 8 4.5 13 11.5 15.5 L11.5 16 L0 16 Z" fill="#151516" />
              <path d="M0.5 0 C0.5 8 4.5 13 11.5 15.5 L0 15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>
          </div>
          {actions && <div className="mt-1.5 mr-[11px] flex items-center gap-1">{actions}</div>}
        </>
      ) : (
        <>
          {avatar && (
            <span
              aria-hidden="true"
              className={cn(
                "grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.06] bg-[#070707] text-neutral-300",
                "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
                s.avatar
              )}
            >
              {avatar}
            </span>
          )}
          <div className={cn("min-w-0 flex-1 text-neutral-300", s.text, avatar && "pt-[0.2em]")}>
            {status === "typing" ? (
              <TypingIndicator variant={typingIndicator} size={size} />
            ) : (
              body
            )}
            {status === "error" && (
              <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", (children != null || content) && "mt-2")}>
                <p role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug text-[rgb(229_115_115)]">
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true" className="mt-[2px] shrink-0">
                    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="11" r="0.9" fill="currentColor" />
                  </svg>
                  <span>{error ?? "Something went wrong."}</span>
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className={cn(
                      "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium tracking-tight text-neutral-200",
                      "border border-white/[0.08] border-t-white/[0.14] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)]",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
                      "transition-[background,box-shadow,translate] duration-150 hover:bg-[linear-gradient(180deg,#252527_0%,#1c1c1e_100%)] hover:text-white",
                      "active:translate-y-px active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)] motion-reduce:active:translate-y-0",
                      "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
                    )}
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                      <path d="M13 8a5 5 0 1 1-1.46-3.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M13 2.5V5h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retry
                  </button>
                )}
              </div>
            )}
            {actions && status === "done" && <div className="mt-2 -ml-1.5 flex items-center gap-1">{actions}</div>}
          </div>
        </>
      )}
    </motion.div>
  );
});
