"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// A one-time code field: a row of wells, one per character. Underneath is a single real <input>,
// so SMS autofill (`autocomplete="one-time-code"`), paste ("123-456" works), form submission and
// screen readers all behave like an ordinary text field. The wells are drawn from its value.
//
// The active well takes the focus border; typed characters rise into place. With `mask`, each
// character is shown as a popout pearl instead. Error and success tint the well edges and put a
// message under the row (never colour alone). Checking the code is the app's job: set `error`
// or `success` from your own result.

export type OTPInputSize = "sm" | "md" | "lg";

interface OTPInputOwnProps {
  /** Number of characters. Default 6. */
  length?: number;
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the cleaned value whenever it changes. */
  onValueChange?: (value: string) => void;
  /** Called once all characters are entered. */
  onComplete?: (value: string) => void;
  /** Which characters are accepted. Default "numeric". */
  pattern?: "numeric" | "alphanumeric";
  /** Split the wells into groups of this many, with a short cut line between (e.g. 3 → 123–456). */
  groupSize?: number;
  /** Show each character as a pearl instead (PINs). */
  mask?: boolean;
  label?: ReactNode;
  /** Hint under the row. Replaced by `error` or `success` while one is set. */
  description?: ReactNode;
  /** An error message. Tints the edges, sets aria-invalid and nudges the row once. */
  error?: ReactNode;
  /** A success message (or `true` for the tint alone). */
  success?: ReactNode;
  /** Well size: 36×40, 44×48 or 52×56. Default "md". */
  size?: OTPInputSize;
  /** Classes for the outer wrapper (label + row + message). */
  className?: string;
}

type Shared = "size" | "pattern" | "value" | "defaultValue" | "type" | "maxLength" | keyof OTPInputOwnProps;
export type OTPInputProps = OTPInputOwnProps & Omit<InputHTMLAttributes<HTMLInputElement>, Shared>;

// Class names are written out in full so Tailwind can see them.
const SIZES: Record<OTPInputSize, { well: string; text: string; gap: string; pearl: string; caret: string }> = {
  sm: { well: "h-10 w-9 rounded-lg", text: "text-base", gap: "gap-1.5", pearl: "size-2", caret: "h-4" },
  md: { well: "h-12 w-11 rounded-xl", text: "text-lg", gap: "gap-2", pearl: "size-2.5", caret: "h-5" },
  lg: { well: "h-14 w-[52px] rounded-xl", text: "text-xl", gap: "gap-2.5", pearl: "size-3", caret: "h-6" },
};

const WELL = cn(
  "relative grid place-items-center border bg-[#070707]",
  "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
  "transition-[border-color,background-color] duration-150"
);
const POPOUT =
  "rounded-full bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6),0_4px_10px_-2px_rgba(0,0,0,0.5)]";
const DANGER = "rgb(229 115 115)";
const SUCCESS = "rgb(126 190 152)";
const EASE_OUT = [0.32, 0.72, 0, 1] as const;
const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;

const clean = (raw: string, pattern: "numeric" | "alphanumeric", length: number) =>
  (pattern === "numeric" ? raw.replace(/\D/g, "") : raw.replace(/[^a-z0-9]/gi, "").toUpperCase()).slice(0, length);

export const OTPInput = forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(
  {
    length = 6,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onComplete,
    pattern = "numeric",
    groupSize,
    mask = false,
    label,
    description,
    error,
    success,
    size = "md",
    className,
    id: idProp,
    disabled,
    autoComplete = "one-time-code",
    onFocus,
    onBlur,
    onSelect,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const messageId = `${id}-message`;
  const reduceMotion = useReducedMotion();
  const s = SIZES[size];

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const [ownValue, setOwnValue] = useState(() => clean(defaultValue, pattern, length));
  const value = valueProp !== undefined ? clean(valueProp, pattern, length) : ownValue;
  const [focused, setFocused] = useState(false);

  const invalid = Boolean(error);
  const succeeded = !invalid && Boolean(success);
  const message = invalid ? error : succeeded && success !== true ? success : description;
  const complete = value.length === length;
  // The well the next character lands in; on a full code, the last one.
  const activeIndex = Math.min(value.length, length - 1);

  const setValue = (next: string) => {
    if (next === value) return;
    if (valueProp === undefined) setOwnValue(next);
    onValueChange?.(next);
    if (next.length === length) onComplete?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(clean(event.target.value, pattern, length));
  };

  // Keep the caret at the end: characters are entered and removed in order, like the wells show.
  const pinCaret = () => {
    const el = inputRef.current;
    if (el && (el.selectionStart !== el.value.length || el.selectionEnd !== el.value.length)) {
      el.setSelectionRange(el.value.length, el.value.length);
    }
  };

  // Nudge the row once when an error arrives. Motion confirms; it doesn't repeat.
  const [scope, animate] = useAnimate();
  useEffect(() => {
    if (!invalid || reduceMotion || !scope.current) return;
    animate(scope.current, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.3, ease: "easeOut" });
  }, [invalid, error, reduceMotion, animate, scope]);

  const describedBy = [message ? messageId : null, ariaDescribedBy].filter(Boolean).join(" ") || undefined;
  const edge = invalid
    ? "border-[rgb(229_115_115/0.45)]"
    : succeeded
      ? "border-[rgb(126_190_152/0.45)]"
      : null;

  const wells: ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    if (groupSize && i > 0 && i % groupSize === 0) {
      // A short machined cut line between groups.
      wells.push(
        <span
          key={`sep-${i}`}
          aria-hidden="true"
          className="mx-0.5 h-px w-2.5 shrink-0 bg-white/[0.12] shadow-[0_1px_0_rgba(0,0,0,0.6)]"
        />
      );
    }
    const char = value[i];
    const active = focused && !disabled && i === activeIndex;
    wells.push(
      <div
        key={i}
        data-active={active ? "" : undefined}
        data-filled={char ? "" : undefined}
        className={cn(
          WELL,
          s.well,
          edge ??
            (active
              ? "border-white/[0.18] bg-[#050505]"
              : cn("border-white/[0.08]", !disabled && "group-hover/otp:border-white/[0.13]"))
        )}
      >
        <AnimatePresence initial={false}>
          {char &&
            (mask ? (
              <motion.span
                key="pearl"
                className={cn(POPOUT, s.pearl)}
                initial={reduceMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
                transition={reduceMotion ? { duration: 0.15 } : SPRING}
              />
            ) : (
              <motion.span
                key={char}
                className={cn("absolute font-medium tabular-nums tracking-tight text-neutral-100", s.text)}
                initial={reduceMotion ? { opacity: 0 } : { y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { y: -4, opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.15, ease: EASE_OUT }}
              >
                {char}
              </motion.span>
            ))}
        </AnimatePresence>
        {active && !char && (
          // The caret is the one live thing here, so it blinks like a native one does.
          <motion.span
            aria-hidden="true"
            className={cn("w-[1.5px] rounded-full bg-neutral-100", s.caret)}
            animate={reduceMotion ? undefined : { opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.1, times: [0, 0.5, 0.5, 1], ease: "linear", repeat: Infinity }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      data-state={complete ? "complete" : "incomplete"}
      data-invalid={invalid ? "" : undefined}
      data-success={succeeded ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn("inline-flex flex-col gap-1.5", disabled && "opacity-40", className)}
    >
      {label && (
        <label htmlFor={id} className="text-sm font-medium tracking-tight text-neutral-100">
          {label}
        </label>
      )}

      <div ref={scope} className={cn("group/otp relative flex items-center", s.gap, disabled && "cursor-not-allowed")}>
        {wells}
        {/* The real field, laid over the wells so a click anywhere focuses it. */}
        <input
          {...rest}
          ref={inputRef}
          id={id}
          type="text"
          inputMode={pattern === "numeric" ? "numeric" : "text"}
          autoComplete={autoComplete}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          onFocus={(event) => {
            setFocused(true);
            requestAnimationFrame(pinCaret);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onSelect={(event) => {
            pinCaret();
            onSelect?.(event);
          }}
          className={cn(
            "absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent outline-none",
            "selection:bg-transparent disabled:cursor-not-allowed"
          )}
        />
      </div>

      {message && (
        // w-0 + min-w-full: the message wraps to the row's width instead of widening the field,
        // so the row doesn't shift when an error longer than it appears.
        <p
          id={messageId}
          className="flex w-0 min-w-full items-start gap-1.5 text-[13px] leading-snug"
          style={{ color: invalid ? DANGER : succeeded ? SUCCESS : undefined }}
        >
          {invalid && (
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true" className="mt-[2px] shrink-0">
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.9" fill="currentColor" />
            </svg>
          )}
          {succeeded && (
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true" className="mt-[2px] shrink-0">
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
              <path d="m5.4 8.2 1.8 1.8 3.4-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span className={invalid || succeeded ? undefined : "text-neutral-500"}>{message}</span>
        </p>
      )}
    </div>
  );
});

/** @deprecated Use `OTPInput`. */
export const OTP = OTPInput;
