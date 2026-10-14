"use client";

import {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../lib/utils";

// Input, Textarea and Field in one. The control is a well cut into the surface; above it sits
// the label, below it a hint or, when something's wrong, the error. Every id and aria link is
// wired for you (label → control, control → hint/error, aria-invalid).
//
// `multiline` swaps the <input> for a <textarea> in the same well, optionally growing with its
// content. Single-line fields take a leading slot (an icon) and a trailing slot (text such as a
// unit, or an action); password fields get a show/hide toggle. With `maxLength`, a quiet counter
// keeps count. Focus brightens the edge and deepens the well one step. No glow.

export type TextFieldSize = "sm" | "md" | "lg";

interface TextFieldOwnProps {
  label?: ReactNode;
  /** Hint under the field. Replaced by `error` while there is one. */
  description?: ReactNode;
  /** An error message. Tints the edge, sets aria-invalid and shows in place of the hint. */
  error?: ReactNode;
  /** Height of a single-line field: 32, 40 or 48px. Default "md". */
  size?: TextFieldSize;
  /** A <textarea> instead of an <input>. */
  multiline?: boolean;
  /** Multiline only: grow with the content, up to `maxRows`. */
  autoResize?: boolean;
  /** Multiline only. Default 3. */
  rows?: number;
  /** Multiline + autoResize only. Default 10. */
  maxRows?: number;
  /** Single-line only: an icon or text inside the well, before the value. */
  leading?: ReactNode;
  /** Single-line only: text or an action inside the well, after the value. */
  trailing?: ReactNode;
  /** Show "12 / 200" under the field. Defaults to on when maxLength is set. */
  showCount?: boolean;
  /** Classes for the outer wrapper (label + well + message). */
  className?: string;
  /** Classes for the well itself. */
  fieldClassName?: string;
}

type Shared = "size" | "rows" | "prefix" | keyof TextFieldOwnProps;
export type TextFieldProps = TextFieldOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, Shared> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, Shared | keyof InputHTMLAttributes<HTMLInputElement>>;

// Class names are written out in full so Tailwind can see them.
const SIZES: Record<TextFieldSize, { field: string; text: string; pad: string; pl: string; pr: string; slot: string }> = {
  sm: { field: "h-8 rounded-lg", text: "text-[13px]", pad: "px-2.5", pl: "pl-2.5", pr: "pr-2.5", slot: "[&_svg]:size-3.5" },
  md: { field: "h-10 rounded-xl", text: "text-sm", pad: "px-3", pl: "pl-3", pr: "pr-3", slot: "[&_svg]:size-4" },
  lg: { field: "h-12 rounded-xl", text: "text-[15px]", pad: "px-3.5", pl: "pl-3.5", pr: "pr-3.5", slot: "[&_svg]:size-[18px]" },
};

const WELL = cn(
  "relative flex w-full border bg-[#070707]",
  "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
  "transition-[border-color,background-color] duration-150",
  "has-[:focus]:bg-[#050505]"
);

export const TextField = forwardRef<HTMLInputElement & HTMLTextAreaElement, TextFieldProps>(function TextField(
  {
    label,
    description,
    error,
    size = "md",
    multiline = false,
    autoResize = false,
    rows = 3,
    maxRows = 10,
    leading,
    trailing,
    showCount,
    className,
    fieldClassName,
    id: idProp,
    type = "text",
    disabled,
    readOnly,
    required,
    maxLength,
    value,
    defaultValue,
    onChange,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const messageId = `${id}-message`;
  const countId = `${id}-count`;
  const invalid = Boolean(error);
  const message = error ?? description;
  const s = SIZES[size];

  const controlRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => controlRef.current as HTMLInputElement & HTMLTextAreaElement);

  // Track length for the counter (and for auto-resize), controlled or not.
  const [ownLength, setOwnLength] = useState(String(defaultValue ?? "").length);
  const length = value !== undefined ? String(value).length : ownLength;
  const counting = showCount ?? maxLength !== undefined;

  const [revealed, setRevealed] = useState(false);
  const isPassword = !multiline && type === "password";

  const handleChange = (event: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
    if (value === undefined) setOwnLength(event.target.value.length);
    onChange?.(event);
  };

  // Auto-grow: measure the content height, clamp it between `rows` and `maxRows`.
  useLayoutEffect(() => {
    const el = controlRef.current;
    if (!multiline || !autoResize || !el) return;
    const style = window.getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 20;
    const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, line * rows + chrome), line * maxRows + chrome);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden";
  }, [multiline, autoResize, rows, maxRows, length, value]);

  const describedBy = [message ? messageId : null, counting ? countId : null, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  const shared = {
    id,
    disabled,
    readOnly,
    required,
    maxLength,
    value,
    defaultValue,
    onChange: handleChange,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  };

  const control = multiline ? (
    <textarea
      {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      {...shared}
      ref={controlRef}
      rows={rows}
      className={cn(
        "block w-full resize-none bg-transparent py-2.5 leading-relaxed tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500",
        "[scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin] disabled:cursor-not-allowed",
        s.text,
        s.pad,
        !autoResize && "min-h-[inherit]"
      )}
    />
  ) : (
    <input
      {...(rest as InputHTMLAttributes<HTMLInputElement>)}
      {...shared}
      ref={controlRef}
      type={isPassword && revealed ? "text" : type}
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500",
        "disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden",
        s.text,
        leading ? "pl-2" : s.pl,
        trailing || isPassword ? "pr-2" : s.pr
      )}
    />
  );

  return (
    <div
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn("flex w-full flex-col gap-1.5", disabled && "opacity-40", className)}
    >
      {label && (
        <label htmlFor={id} className="flex items-baseline gap-1 text-sm font-medium tracking-tight text-neutral-100">
          {label}
          {required && (
            <span aria-hidden="true" className="text-neutral-500">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={cn(
          WELL,
          multiline ? "rounded-xl" : cn(s.field, "items-center"),
          invalid
            ? "border-[rgb(229_115_115/0.45)]"
            : "border-white/[0.08] has-[:focus-visible]:border-white/[0.18] has-[:focus]:border-white/[0.18]",
          !disabled && !invalid && "hover:border-white/[0.13]",
          disabled && "cursor-not-allowed",
          readOnly && "bg-[#0a0a0b]",
          fieldClassName
        )}
      >
        {!multiline && leading && (
          <span className={cn("inline-flex shrink-0 items-center text-neutral-500", s.pl, s.text, s.slot)}>
            {leading}
          </span>
        )}
        {control}
        {!multiline && trailing && (
          <span className={cn("inline-flex shrink-0 items-center text-neutral-500", isPassword ? "pr-1" : s.pr, s.text, s.slot)}>
            {trailing}
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            disabled={disabled}
            className={cn(
              "mr-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-neutral-500",
              "transition-colors duration-150 hover:text-neutral-100",
              "outline-white/40 focus-visible:outline focus-visible:outline-1 disabled:cursor-not-allowed"
            )}
          >
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
              <path
                d="M1.5 8S3.8 3.5 8 3.5 14.5 8 14.5 8 12.2 12.5 8 12.5 1.5 8 1.5 8Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
              {revealed && <path d="m2.5 13.5 11-11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
            </svg>
          </button>
        )}
      </div>

      {(message || counting) && (
        <div className="flex items-start justify-between gap-3">
          {message ? (
            <p
              id={messageId}
              className={cn("flex items-start gap-1.5 text-[13px] leading-snug", invalid ? "text-[rgb(229_115_115)]" : "text-neutral-500")}
            >
              {invalid && (
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true" className="mt-[2px] shrink-0">
                  <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.9" fill="currentColor" />
                </svg>
              )}
              <span>{message}</span>
            </p>
          ) : (
            <span />
          )}
          {counting && (
            <span
              id={countId}
              className={cn(
                "shrink-0 text-xs tabular-nums",
                maxLength !== undefined && length >= maxLength ? "text-neutral-300" : "text-neutral-600"
              )}
            >
              {maxLength !== undefined ? `${length} / ${maxLength}` : length}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
