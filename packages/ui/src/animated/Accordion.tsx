"use client";

import React, { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Sections that open in place. Each header is a raised surface with a chevron in a small socket;
// the open section's content sits in a recessed tray inside it.
//
// Motion, all subtle:
// - Switching sections is one movement: the open one folds while the new one opens, so the stack
//   never waits on itself.
// - The opening section lifts a touch (its shadow deepens, its edge catches the light) and its
//   chevron socket sinks a little deeper as the chevron turns.
// - Content settles in a beat behind the height: it rises 6px into place as it fades in, and on
//   close it fades first so nothing is seen being squeezed.
// Under reduced motion, sections open instantly and content only fades.
//
// Two layouts: "separated" (default), a stack of cards; "joined", one card whose rows are split by
// a machined cut line.

export interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  /** Let several sections be open at once. */
  allowMultiple?: boolean;
  /** Open sections on first render (uncontrolled). */
  defaultExpanded?: string[];
  /** Open sections (controlled). */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** "separated" (default): a stack of cards. "joined": one card, rows split by a cut line. */
  variant?: "separated" | "joined";
}

export type BevelAccordionProps = AccordionProps;

const EASE = [0.32, 0.72, 0, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

const RAISED = "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 14px 30px -10px rgba(0,0,0,0.5), 0 1px 4px -1px rgba(0,0,0,0.35)";
const RAISED_OPEN = "inset 0 1.5px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.6), 0 22px 44px -14px rgba(0,0,0,0.75), 0 2px 8px -2px rgba(0,0,0,0.5)";

export function Accordion({
  items,
  className,
  allowMultiple = false,
  defaultExpanded = [],
  value,
  onValueChange,
  variant = "separated",
}: AccordionProps) {
  const [own, setOwn] = useState<string[]>(defaultExpanded);
  const expanded = value ?? own;
  const reduceMotion = useReducedMotion() ?? false;
  const baseId = useId();
  const headers = useRef<(HTMLButtonElement | null)[]>([]);
  const joined = variant === "joined";

  const toggle = useCallback(
    (id: string) => {
      const isOpen = expanded.includes(id);
      const next = isOpen
        ? expanded.filter((open) => open !== id)
        : allowMultiple
          ? [...expanded, id]
          : [id];
      if (value === undefined) setOwn(next);
      onValueChange?.(next);
    },
    [expanded, allowMultiple, value, onValueChange]
  );

  // Arrow keys move between headers (skipping disabled ones); Home/End jump to the ends.
  const onHeaderKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    const at = enabled.indexOf(index);
    const go = (i: number) => headers.current[enabled[(i + enabled.length) % enabled.length]]?.focus();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        go(at + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        go(at - 1);
        break;
      case "Home":
        event.preventDefault();
        go(0);
        break;
      case "End":
        event.preventDefault();
        go(enabled.length - 1);
        break;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        joined
          ? "overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]"
          : "gap-3",
        className
      )}
      style={joined ? { boxShadow: RAISED } : undefined}
    >
      {items.map((item, index) => {
        const isOpen = expanded.includes(item.id);
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={item.id}
            data-state={isOpen ? "open" : "closed"}
            data-disabled={item.disabled ? "" : undefined}
            className={cn(
              "group/item relative flex flex-col text-left",
              joined
                ? cn(
                    index > 0 && "border-t border-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                    "transition-colors duration-200",
                    isOpen && "bg-white/[0.015]"
                  )
                : cn(
                    "rounded-2xl border bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
                    "transition-[border-color,box-shadow,translate] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isOpen ? "-translate-y-px border-white/[0.11] border-t-white/[0.16]" : "border-white/[0.08]",
                    !isOpen && !item.disabled && "hover:border-white/[0.13]",
                    "motion-reduce:translate-y-0"
                  )
            )}
            style={joined ? undefined : { boxShadow: isOpen ? RAISED_OPEN : RAISED }}
          >
            <h3 className="m-0">
              <button
                ref={(node) => {
                  headers.current[index] = node;
                }}
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => onHeaderKeyDown(event, index)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left select-none",
                  "outline-white/40 -outline-offset-2 focus-visible:outline focus-visible:outline-1",
                  joined ? "rounded-none" : "rounded-2xl",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {item.icon && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-[#070707] [&_svg]:size-4",
                      "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
                      "transition-colors duration-200",
                      isOpen ? "text-neutral-100" : "text-neutral-500 group-hover/item:text-neutral-300"
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "truncate text-[14.5px] font-medium tracking-tight transition-colors duration-200",
                      isOpen ? "text-neutral-50" : "text-neutral-200 group-hover/item:text-neutral-50"
                    )}
                  >
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="truncate text-[12.5px] text-neutral-500 transition-colors duration-200 group-hover/item:text-neutral-400">
                      {item.description}
                    </span>
                  )}
                </span>

                {/* Chevron socket: sinks a little deeper while its section is open. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border bg-[#0d0d0e] transition-[border-color,color,box-shadow] duration-300",
                    isOpen
                      ? "border-white/[0.16] text-neutral-100 shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.07)]"
                      : "border-white/[0.08] text-neutral-500 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)] group-hover/item:border-white/[0.14] group-hover/item:text-neutral-300"
                  )}
                >
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </motion.svg>
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.34, ease: EASE }
                  }
                  className="overflow-hidden"
                >
                  {/* Content settles a beat behind the height; on close it fades before folding. */}
                  <motion.div
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.15 : 0.3, delay: reduceMotion ? 0 : 0.06, ease: EASE } }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : 3, transition: { duration: 0.12, ease: EASE_IN } }}
                    className="px-3 pb-3"
                  >
                    <div
                      className="rounded-xl border border-white/[0.05] bg-[#0c0c0d] p-4 text-[13.5px] leading-relaxed text-neutral-400"
                      style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03)" }}
                    >
                      {item.content}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export const BevelAccordion = Accordion;
