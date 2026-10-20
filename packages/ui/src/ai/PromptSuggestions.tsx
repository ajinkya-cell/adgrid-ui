"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Starter prompts: what to ask when the page is empty, or what to ask next under a reply.
// - pill: a row of small raised keys that wraps. For follow-ups and short prompts.
// - card: a grid of raised tiles, each with an optional icon in a socket, a title and a line of
//   description. For the empty state of a chat.
// They arrive one after another, each rising 6px and fading in, 40ms apart. Under reduced motion
// they fade in together. Each is a real button; `onSelect` gets the suggestion's value.

export type PromptSuggestionsVariant = "pill" | "card";
export type PromptSuggestionsSize = "sm" | "md";

export interface PromptSuggestion {
  /** What's shown. */
  label: string;
  /** What `onSelect` receives. Defaults to the label. */
  value?: string;
  /** Card only: a line under the label. */
  description?: string;
  /** An icon. In a card it sits in a round socket. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface PromptSuggestionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Strings, or objects with a label, value, description and icon. */
  suggestions: (string | PromptSuggestion)[];
  onSelect?: (value: string) => void;
  /** Default "pill". */
  variant?: PromptSuggestionsVariant;
  /** Default "md". */
  size?: PromptSuggestionsSize;
  /** Stagger them in on mount. Default true. */
  animate?: boolean;
}

const EASE = [0.32, 0.72, 0, 1] as const;

const RAISED = cn(
  "border border-white/[0.08] border-t-white/[0.13] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
  "enabled:hover:border-white/[0.13] enabled:hover:bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)]",
  "enabled:active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)]",
  "transition-[background,border-color,box-shadow,translate] duration-150 enabled:active:translate-y-px motion-reduce:enabled:active:translate-y-0",
  "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
);

const SIZES = {
  sm: { pill: "h-8 gap-1.5 px-3 text-[13px] [&_svg]:size-3.5", card: "gap-3 p-3", title: "text-[13px]", desc: "text-xs", socket: "size-7 [&_svg]:size-3.5" },
  md: { pill: "h-9 gap-2 px-3.5 text-sm [&_svg]:size-4", card: "gap-3.5 p-3.5", title: "text-sm", desc: "text-[13px]", socket: "size-8 [&_svg]:size-4" },
} as const;

export const PromptSuggestions = forwardRef<HTMLDivElement, PromptSuggestionsProps>(function PromptSuggestions(
  { suggestions, onSelect, variant = "pill", size = "md", animate = true, className, ...rest },
  ref
) {
  const reduce = useReducedMotion() ?? false;
  const s = SIZES[size];
  const items = suggestions.map((item) => (typeof item === "string" ? { label: item } : item));

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={rest["aria-label"] ?? "Suggestions"}
      data-variant={variant}
      className={cn(variant === "pill" ? "flex flex-wrap gap-2" : "grid gap-2.5 sm:grid-cols-2", className)}
    >
      {items.map((item, i) => (
        <motion.button
          key={`${item.label}-${i}`}
          type="button"
          disabled={item.disabled}
          onClick={() => onSelect?.(item.value ?? item.label)}
          initial={animate ? { opacity: 0, y: reduce ? 0 : 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.26, ease: EASE, delay: animate && !reduce ? i * 0.04 : 0 }}
          className={cn(
            RAISED,
            variant === "pill"
              ? cn("inline-flex max-w-full items-center rounded-full font-medium tracking-tight text-neutral-300 enabled:hover:text-neutral-100", s.pill)
              : cn("flex items-start rounded-2xl text-left", s.card)
          )}
        >
          {variant === "pill" ? (
            <>
              {item.icon && (
                <span aria-hidden="true" className="inline-flex shrink-0 text-neutral-500">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </>
          ) : (
            <>
              {item.icon && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full border border-white/[0.06] bg-[#070707] text-neutral-400",
                    "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
                    s.socket
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={cn("font-medium tracking-tight text-neutral-100", s.title)}>{item.label}</span>
                {item.description && <span className={cn("leading-snug text-neutral-500", s.desc)}>{item.description}</span>}
              </span>
            </>
          )}
        </motion.button>
      ))}
    </div>
  );
});
