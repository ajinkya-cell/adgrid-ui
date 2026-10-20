"use client";

import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

// The quiet row of keys under a reply: copy, regenerate, good, bad. Keys have no surface until
// hovered. A pressed rating sinks into a socket and stays there, so you can see what you said;
// good and bad exclude each other, and pressing the pressed one takes it back. Copy turns into a
// tick for a moment; regenerate gives its arrows one turn.
//
// Each key is a `MessageAction`, exported too, so you can add your own (share, read aloud…) as
// children and they'll match.

export type MessageFeedback = "up" | "down" | null;
export type MessageActionsSize = "sm" | "md";

export interface MessageActionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onCopy"> {
  /** Text the copy key puts on the clipboard. Without it (and without onCopy) there's no copy key. */
  copyText?: string;
  /** Called after copying, or instead of it when there's no copyText. */
  onCopy?: () => void;
  /** Shows the regenerate key. */
  onRegenerate?: () => void;
  /** The rating (controlled). */
  feedback?: MessageFeedback;
  /** The rating on first render (uncontrolled). */
  defaultFeedback?: MessageFeedback;
  /** Shows the rating keys. Called with the new rating, or null when it's taken back. */
  onFeedbackChange?: (feedback: MessageFeedback) => void;
  /** Default "sm" (28px keys). */
  size?: MessageActionsSize;
  /** Extra MessageActions after the built-in ones. */
  children?: ReactNode;
}

export interface MessageActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: the keys are icon-only. Also shown as a tooltip. */
  label: string;
  /** Sunk into its socket. Sets aria-pressed. */
  pressed?: boolean;
  size?: MessageActionsSize;
}

const KEY = {
  sm: "size-7 rounded-lg [&_svg]:size-[15px]",
  md: "size-8 rounded-lg [&_svg]:size-4",
} as const;

export const MessageAction = forwardRef<HTMLButtonElement, MessageActionProps>(function MessageAction(
  { label, pressed, size = "sm", className, children, type = "button", title, ...rest },
  ref
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      data-state={pressed ? "on" : undefined}
      className={cn(
        "grid shrink-0 cursor-pointer place-items-center border border-transparent text-neutral-500",
        "transition-[background-color,border-color,color,box-shadow] duration-150",
        "hover:border-white/[0.06] hover:bg-[#151516] hover:text-neutral-100",
        "data-[state=on]:border-white/[0.06] data-[state=on]:bg-[#070707] data-[state=on]:text-neutral-100",
        "data-[state=on]:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
        "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
        "disabled:pointer-events-none disabled:opacity-40",
        KEY[size],
        className
      )}
    >
      {children}
    </button>
  );
});

const icon = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(function MessageActions(
  {
    copyText,
    onCopy,
    onRegenerate,
    feedback,
    defaultFeedback = null,
    onFeedbackChange,
    size = "sm",
    className,
    children,
    ...rest
  },
  ref
) {
  const [ownFeedback, setOwnFeedback] = useState<MessageFeedback>(defaultFeedback);
  const rating = feedback !== undefined ? feedback : ownFeedback;
  const [copied, setCopied] = useState(false);
  const [turns, setTurns] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const rate = (next: "up" | "down") => {
    const value = rating === next ? null : next;
    if (feedback === undefined) setOwnFeedback(value);
    onFeedbackChange?.(value);
  };

  const copy = async () => {
    if (copyText !== undefined) {
      try {
        await navigator.clipboard.writeText(copyText);
      } catch {
        return;
      }
    }
    onCopy?.();
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div {...rest} ref={ref} role="toolbar" aria-label={rest["aria-label"] ?? "Message actions"} className={cn("flex items-center gap-0.5", className)}>
      {(copyText !== undefined || onCopy) && (
        <MessageAction label={copied ? "Copied" : "Copy"} size={size} onClick={copy}>
          <span className="relative grid place-items-center">
            <svg {...icon} className={cn("transition-[opacity,scale] duration-200", copied ? "scale-50 opacity-0" : "opacity-100")}>
              <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
              <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
            </svg>
            <svg {...icon} strokeWidth={2} className={cn("absolute transition-[opacity,scale] duration-200", copied ? "opacity-100" : "scale-50 opacity-0")}>
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </span>
        </MessageAction>
      )}

      {onRegenerate && (
        <MessageAction
          label="Regenerate"
          size={size}
          onClick={() => {
            setTurns((t) => t + 1);
            onRegenerate();
          }}
        >
          <svg
            {...icon}
            className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
            style={{ transform: `rotate(${turns * 360}deg)` }}
          >
            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
          </svg>
        </MessageAction>
      )}

      {onFeedbackChange && (
        <>
          <MessageAction label="Good response" size={size} pressed={rating === "up"} onClick={() => rate("up")}>
            <svg {...icon}>
              <path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
            </svg>
          </MessageAction>
          <MessageAction label="Bad response" size={size} pressed={rating === "down"} onClick={() => rate("down")}>
            <svg {...icon}>
              <path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" />
            </svg>
          </MessageAction>
        </>
      )}

      {children}

      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
});
