"use client";

import { forwardRef, useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { SEGMENT_CLASS, TRACK_CLASS } from "./Tabs";

// A small inline choice of 2–5 options, in the Tabs material. Underneath it's a radio group of
// real <input type="radio">, so arrow keys, forms and screen readers work natively; the raised
// segment just follows whichever input is checked.

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedOption {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Required when the option is icon-only. */
  "aria-label"?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shared input name, for forms. Generated when omitted. */
  name?: string;
  size?: SegmentedControlSize;
  /** Options share the full width equally. */
  fullWidth?: boolean;
  disabled?: boolean;
}

const SIZES = {
  sm: { item: "h-6 px-2.5 text-xs", icon: "min-w-6 px-1.5" },
  md: { item: "h-8 px-3 text-sm", icon: "min-w-8 px-2" },
  lg: { item: "h-10 px-4 text-sm", icon: "min-w-10 px-2.5" },
} as const;

const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  {
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    name,
    size = "md",
    fullWidth = false,
    disabled = false,
    className,
    ...rest
  },
  ref
) {
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value ?? "");
  const value = valueProp ?? own;
  const autoName = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const s = SIZES[size];

  const select = (next: string) => {
    if (valueProp === undefined) setOwn(next);
    onValueChange?.(next);
  };

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative flex items-center gap-0.5",
        TRACK_CLASS,
        fullWidth ? "w-full" : "w-fit max-w-full",
        disabled && "opacity-40",
        className
      )}
    >
      <LayoutGroup id={autoName}>
        {options.map((option) => {
          const checked = option.value === value;
          const off = disabled || option.disabled;
          const iconOnly = option.icon && !option.label;
          return (
            <label
              key={option.value}
              data-state={checked ? "checked" : "unchecked"}
              data-disabled={off ? "" : undefined}
              className={cn(
                "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium tracking-tight whitespace-nowrap select-none",
                "transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0",
                "outline-white/40 outline-offset-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-1",
                s.item,
                iconOnly && s.icon,
                fullWidth && "flex-1",
                checked ? "text-neutral-100" : "text-neutral-500",
                off ? "cursor-not-allowed" : "cursor-pointer",
                !checked && !off && "hover:text-neutral-400",
                option.disabled && !disabled && "opacity-40"
              )}
            >
              <input
                type="radio"
                name={name ?? autoName}
                value={option.value}
                checked={checked}
                disabled={off}
                onChange={() => select(option.value)}
                aria-label={option["aria-label"]}
                className="peer sr-only"
              />
              {checked && (
                <motion.span
                  aria-hidden="true"
                  layoutId="segment"
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  className={SEGMENT_CLASS}
                />
              )}
              {option.icon && <span className="relative inline-flex">{option.icon}</span>}
              {option.label && <span className="relative">{option.label}</span>}
            </label>
          );
        })}
      </LayoutGroup>
    </div>
  );
});
