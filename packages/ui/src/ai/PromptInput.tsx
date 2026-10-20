"use client";

import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../lib/utils";

// The composer at the foot of a chat. A deep well with the message on top and a tray of tools
// underneath; it grows a line at a time as you write, up to `maxRows`, then scrolls.
//
// The send key lives in a socket in the corner. Empty, it sits dark in the socket; once there's
// something to send it rises out as the lightest object on screen. While a reply is on its way
// (`status` "submitted" or "streaming") the same key shows a stop square instead, and Enter is
// held back so a second message can't jump the queue.
//
// Enter sends, Shift+Enter starts a new line, and nothing sends mid-composition (IME). There's a
// real <form> and <textarea> underneath, so autofill, spellcheck and screen readers just work.
// `status` takes the same values as the AI SDK's useChat, so it can be passed straight through.

export type PromptInputStatus = "ready" | "submitted" | "streaming" | "error";
export type PromptInputSize = "sm" | "md" | "lg";

type Native = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onSubmit" | "rows">;

export interface PromptInputProps extends Native {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text. Uncontrolled inputs clear themselves afterwards. */
  onSubmit?: (value: string) => void;
  /** Default "ready". "submitted" and "streaming" turn the send key into a stop key. */
  status?: PromptInputStatus;
  /** Called by the stop key. Without it the key is disabled while busy. */
  onStop?: () => void;
  /** Grow up to this many lines before scrolling. Default 8. */
  maxRows?: number;
  /** Tools in the tray beside the send key: attach, model picker, toggles. */
  toolbar?: ReactNode;
  /** Default "md". */
  size?: PromptInputSize;
  /** Classes for the outer form. */
  className?: string;
  /** Default "Send message". */
  submitLabel?: string;
  /** Default "Stop generating". */
  stopLabel?: string;
}

const SIZES = {
  sm: { text: "text-[13px]", pad: "px-3.5 pt-3", tray: "px-2 pb-2", key: "size-7 [&_svg]:size-3.5", radius: "rounded-2xl" },
  md: { text: "text-[14.5px]", pad: "px-4 pt-3.5", tray: "px-2.5 pb-2.5", key: "size-8 [&_svg]:size-4", radius: "rounded-3xl" },
  lg: { text: "text-base", pad: "px-5 pt-4", tray: "px-3 pb-3", key: "size-10 [&_svg]:size-[18px]", radius: "rounded-3xl" },
} as const;

const POPOUT =
  "border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6),0_4px_10px_-2px_rgba(0,0,0,0.5)]";

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(function PromptInput(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSubmit,
    status = "ready",
    onStop,
    maxRows = 8,
    toolbar,
    size = "md",
    className,
    submitLabel = "Send message",
    stopLabel = "Stop generating",
    placeholder = "Ask anything",
    disabled,
    onChange,
    onKeyDown,
    "aria-label": ariaLabel = "Message",
    ...rest
  },
  ref
) {
  const s = SIZES[size];
  const [own, setOwn] = useState(defaultValue);
  const text = value ?? own;
  const busy = status === "submitted" || status === "streaming";
  const canSend = !disabled && !busy && text.trim().length > 0;
  const canStop = !disabled && busy && Boolean(onStop);

  const field = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => field.current as HTMLTextAreaElement);

  // Grow with the content: one line minimum, `maxRows` maximum, then scroll.
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 22;
    const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, line + chrome), line * maxRows + chrome);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden";
  }, [text, maxRows, size]);

  const setText = (next: string) => {
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    onChange?.(event);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    onSubmit?.(text.trim());
    if (value === undefined) setOwn("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) event.currentTarget.form?.requestSubmit();
    }
  };

  const raised = busy ? canStop : canSend;

  return (
    <form
      onSubmit={handleSubmit}
      data-state={busy ? "busy" : "ready"}
      data-disabled={disabled ? "" : undefined}
      onClick={(event) => {
        // A click anywhere on the well's empty space puts the caret in the field.
        if (event.target === event.currentTarget) field.current?.focus();
      }}
      className={cn(
        "relative flex w-full cursor-text flex-col border bg-[#070707]",
        "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
        "transition-[border-color,background-color] duration-150",
        "border-white/[0.08] has-[textarea:focus]:border-white/[0.18] has-[textarea:focus]:bg-[#050505]",
        !disabled && "hover:border-white/[0.13]",
        disabled && "cursor-not-allowed opacity-40",
        s.radius,
        className
      )}
    >
      <textarea
        {...rest}
        ref={field}
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "block w-full resize-none bg-transparent pb-1.5 leading-relaxed tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500",
          "[scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin] disabled:cursor-not-allowed",
          s.text,
          s.pad
        )}
      />

      <div
        className={cn("flex items-center justify-between gap-2", s.tray)}
        onClick={(event) => {
          if (event.target === event.currentTarget) field.current?.focus();
        }}
      >
        <div className="flex min-w-0 items-center gap-1">{toolbar}</div>

        <button
          type={busy ? "button" : "submit"}
          onClick={busy ? onStop : undefined}
          disabled={busy ? !canStop : !canSend}
          aria-label={busy ? stopLabel : submitLabel}
          data-state={busy ? "stop" : canSend ? "ready" : "empty"}
          className={cn(
            "relative grid shrink-0 cursor-pointer place-items-center rounded-full",
            "bg-[#050505] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.05)]",
            "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
            "transition-transform duration-150 active:enabled:translate-y-px active:enabled:scale-[0.96] motion-reduce:active:enabled:translate-y-0 motion-reduce:active:enabled:scale-100",
            "disabled:cursor-default",
            s.key
          )}
        >
          {/* The key itself: rises out of the socket when there's something to do. */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 rounded-full transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity",
              POPOUT,
              raised ? "scale-100 opacity-100" : "scale-[0.82] opacity-0 motion-reduce:scale-100"
            )}
          />
          <span
            aria-hidden="true"
            className={cn("relative grid place-items-center transition-colors duration-200", raised ? "text-neutral-950" : "text-neutral-600")}
          >
            {busy ? (
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="4.25" y="4.25" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M8 13V3.5M3.75 7.5 8 3.25l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </form>
  );
});
